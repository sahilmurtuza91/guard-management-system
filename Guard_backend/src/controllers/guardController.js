const GuardProfile = require('../models/GuardProfile');
const Shift = require('../models/Shift');
const Attendance = require('../models/Attendance');
const Incident = require('../models/Incident');
const Notification = require('../models/Notification');
const GuardRequest = require('../models/GuardRequest');
const User = require('../models/User');

const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/apiResponse');
const { isWithinGeofence, getDistanceInMeters } = require('../utils/geofence');
const { getShiftStartDateTime, getShiftEndDateTime } = require('../utils/shiftTime');
const { notifyUser } = require('../services/notificationService');
const { notifyAgencyAndClient, performCheckout } = require('../services/attendanceService');
const { emitToAgency } = require('../socket');

// function to find the guardProfile of the login user
const getGuardProfileOrFail = async (userId) => {
  const guard = await GuardProfile.findOne({ user: userId }).populate("assignedSite");

  if (!guard) {
    throw new ApiError(404, "Guard Profile not found")
  }
  return guard;
};

const isPastShiftEndTime = (shift, now) => {
  const parseTime = (str) => {
    const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(String(str || '').trim());
    if (!match) return null;
    let [, hh, mm, ampm] = match;
    hh = parseInt(hh, 10);
    mm = parseInt(mm, 10);
    if (ampm.toUpperCase() === 'PM' && hh !== 12) hh += 12;
    if (ampm.toUpperCase() === 'AM' && hh === 12) hh = 0;
    return { hh, mm };
  };

  if (!shift?.date) return true; 

  const end = parseTime(shift.endTime);
  if (!end) return true;

  const shiftEnd = new Date(shift.date);
  shiftEnd.setHours(end.hh, end.mm, 0, 0);

  const start = parseTime(shift.startTime);
  if (start && end.hh < start.hh) {
    shiftEnd.setDate(shiftEnd.getDate() + 1);
  }

  return now >= shiftEnd;
};

// get dashboard
const getDashboard = asyncHandler(async (req, res) => {
  const guard = await getGuardProfileOrFail(req.user._id);

  const todayStr = new Date().toISOString().slice(0, 10);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  let todayShift = await Shift.findOne({ guard: guard._id, status: 'Active' })
    .populate('site')
    .sort({ date: 1 });
  if (!todayShift) {
    todayShift = await Shift.findOne({ guard: guard._id, status: 'Upcoming', date: { $gte: startOfToday } })
      .populate('site')
      .sort({ date: 1 });
  }

  const todayAttendence = todayShift ? await Attendance.findOne({ guard: guard._id, shift: todayShift._id }) : null;
  const assignedShiftCount = await Shift.countDocuments({
    guard: guard._id,
    status: { $in: ['Active', 'Upcoming'] },
    date: { $gte: startOfToday },
  });

  const attendanceCount = await Attendance.countDocuments({ guard: guard._id });
  const pendingTasks = todayShift && !todayAttendence?.checkIn?.time ? 1 : 0;

  const recentIncidents = await Incident.find({ reportedBy: guard._id })
    .sort({ createdAt: -1 })
    .limit(3);

  return sendSuccess(
    res,
    200,
    "Dashboard fetched", {
    guard: {
      name: req.user.name,
      avatarUrl: req.user.avatarUrl,
      employeeId: guard.employeeId,
      status: guard.status,
    },
    todayShift,
    checkInStatus: todayAttendence?.checkIn ? (todayAttendence?.checkOut ? "Checked out" : "Checked In") : "Not checked In",
    todayStatus: todayAttendence?.status || null,
    todayWorkingSeconds: todayAttendence?.workingSeconds || 0,
    todayCheckInTime: todayAttendence?.checkIn?.time && !todayAttendence?.checkOut?.time ? todayAttendence.checkIn.time : null,
    assignedShiftCount,
    attendanceCount,
    pendingTasks,
    recentIncidents,
  });
});

// guard shift
const getShifts = asyncHandler(async (req, res) => {
  const guard = await getGuardProfileOrFail(req.user._id);
  const { status } = req.query;

  const filter = { guard: guard._id };
  if (status) {
    filter.status = status;
  }

  const shifts = await Shift.find(filter).populate("site").sort({ date: -1 });
  return sendSuccess(res, 200, "shifts fetched", { shifts });
});

// shift by id
const getShiftDetails = asyncHandler(async (req, res) => {
  const guard = await getGuardProfileOrFail(req.user._id);
  const shift = await Shift.findOne({
    _id: req.params.id, guard: guard._id
  }).populate("site");

  if (!shift) {
    throw new ApiError(404, "shift not found");
  }

  return sendSuccess(
    res,
    200,
    "Shift details fetched", {
    shift
  });
});

// attendence check in
const checkIn = asyncHandler(async (req, res) => {
  const guard = await getGuardProfileOrFail(req.user._id);
  const { shiftId, latitude, longitude, address } = req.body;

  if (latitude === undefined || longitude === undefined) {
    throw new ApiError(400,
      "GPS location required latitude and longitude"
    )
  }
  const shift = await Shift.findOne({ _id: shiftId, guard: guard._id }).populate("site");
  if (!shift) {
    throw new ApiError(404, "Shift not found");
  }

  if (['Cancelled', 'Completed'].includes(shift.status)) {
    throw new ApiError(400, `This shift is ${shift.status.toLowerCase()}, you can not check in.`);
  }
  const shiftEndTime = getShiftEndDateTime(shift);
  if (shiftEndTime && Date.now() >= shiftEndTime.getTime()) {
    throw new ApiError(400, 'This shift time is over, you can not check in.');
  }

  const existing = await Attendance.findOne({
    guard: guard._id, shift: shift._id
  });

  if (existing?.checkIn?.time && !existing?.checkOut?.time) {
    throw new ApiError(400, "Already checkedIn");
  }

  const site = shift.site;
  const radius = site?.geofenceRadiusMeters || Number(process.env.DEFAULT_GEOFENCE_RADIUS_METERS) || 200;

  const { withinFence, distance } = isWithinGeofence(latitude, longitude, site?.latitude, site?.longitude, radius);

  if (!withinFence) {
    throw new ApiError(
      400,
      `You are outside the site location. Please move within ${radius} meters of the site to check in.`
    );
  }

  const now = new Date();
  const graceMinutes = Number(process.env.LATE_GRACE_MINUTES ?? 15);
  const shiftStart = getShiftStartDateTime(shift);
  const isLate = shiftStart ? now.getTime() > shiftStart.getTime() + graceMinutes * 60000 : false;

  const isResuming = !!(existing?.checkIn?.time && existing?.checkOut?.time);

  const attendance = existing ? existing : new Attendance({ guard: guard._id, shift: shift._id, agency: shift.agency, date: new Date(shift.date).toISOString().slice(0, 10) });

  attendance.checkIn = {
    time: now,
    latitude,
    longitude,
    address,
    withinGeofence: withinFence,
    distanceFromSite: distance,
  };
  attendance.checkOut = undefined;

  if (!isResuming) {
    attendance.status = isLate ? 'Late' : 'Present';
  }
  attendance.outiseSince = null;
  attendance.locationStatus = 'Inside';
  await attendance.save();

  shift.status = "Active";
  await shift.save();

  guard.lastKnownLocation = { latitude, longitude, updatedAt: now };
  await guard.save();

  emitToAgency(shift.agency.toString(), 'attendance: checkIn', {
    guardId: guard._id,
    shiftId: shift._id,
    withinGeofence: withinFence,
    time: now,
  });

  await notifyAgencyAndClient(shift, {
    title: 'Guard Checked In',
    message: `${req.user.name} checked in at ${site?.name || 'the site'} — ${isLate ? 'Late' : 'On time'}.`,
  });

  return sendSuccess(res, 200, withinFence ? 'Check-in successful' : 'Check-in recorded', {
    attendance,
    withinGeofence: withinFence,
    distanceFromSite: distance,
  });
});


// check out
const checkOut = asyncHandler(async (req, res) => {
  const guard = await getGuardProfileOrFail(req.user._id);

  const { shiftId, latitude, longitude, address } = req.body;

  if (latitude === undefined || longitude === undefined) {
    throw new ApiError(400,
      "GPS location required latitude and longitude"
    )
  }

  const shift = await Shift.findOne({
    _id: shiftId,
    guard: guard._id
  }).populate("site");

  if (!shift) {
    throw new ApiError(404, "Shift not found");
  }

  const attendance = await Attendance.findOne({
    guard: guard._id,
    shift: shift._id
  })

  if (!attendance?.checkIn?.time) {
    throw new ApiError(404, "first check In then perform check out");
  }

  if (attendance.checkOut?.time) {
    throw new ApiError(404, "Already Checkout");
  }

  const site = shift.site;

  const radius = site?.geofenceRadiusMeters || Number(process.env.DEFAULT_GEOFENCE_RADIUS_METERS) || 200;

  const { withinFence, distance } = isWithinGeofence(
    latitude,
    longitude,
    site?.latitude,
    site?.longitude,
    radius
  );

  if (!withinFence) {
    throw new ApiError(
      400,
      `You are outside the site location please move within ${radius} meters of the site to checkOut.`
    );
  }

  const now = new Date();
  await performCheckout(attendance, shift, { time: now, latitude, longitude, address, checkoutType: 'MANUAL' });

  emitToAgency(shift.agency.toString(), "attendance: checkOut", {
    guardId: guard._id, shiftId: shift._id, time: now
  });

  await notifyAgencyAndClient(shift, {
    title: 'Guard Checked Out',
    message: `${req.user.name} checked out from ${site?.name || 'the site'} at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
  });

  return sendSuccess(res, 200, "Check out successful", { attendance })
});

const locationPing = asyncHandler(async (req, res) => {
  const guard = await getGuardProfileOrFail(req.user._id);
  const { shiftId, latitude, longitude, address } = req.body;

  if (latitude === undefined || longitude === undefined) {
    throw new ApiError(400, "GPS location required latitude and longitude");
  }

  const shift = await Shift.findOne({ _id: shiftId, guard: guard._id }).populate('site');
  if (!shift) {
    throw new ApiError(404, "Shift not found");
  }

  const attendance = await Attendance.findOne({ guard: guard._id, shift: shift._id });
  if (!attendance?.checkIn?.time || attendance.checkOut?.time) {
    throw new ApiError(400, "No active check-in session for this shift");
  }

  const site = shift.site;
  const radius = site?.geofenceRadiusMeters || Number(process.env.DEFAULT_GEOFENCE_RADIUS_METERS) || 200;
  const { withinFence } = isWithinGeofence(latitude, longitude, site?.latitude, site?.longitude, radius);

  if (withinFence) {
    attendance.locationStatus = 'Inside';
    attendance.outiseSince = null;
    await attendance.save();
    return sendSuccess(res, 200, 'Inside site location', { withinGeofence: true, autoCheckedOut: false });
  }

  const now = new Date();
  if (!attendance.outiseSince) {
    attendance.locationStatus = 'Outside';
    attendance.outiseSince = now;
    await attendance.save();
    return sendSuccess(res, 200, 'Outside site location', { withinGeofence: false, autoCheckedOut: false });
  }

  const AUTO_CHECKOUT_AFTER_MS = 2 * 60 * 1000;
  if (now - attendance.outiseSince < AUTO_CHECKOUT_AFTER_MS) {
    return sendSuccess(res, 200, 'Outside site location', { withinGeofence: false, autoCheckedOut: false });
  }

  await performCheckout(attendance, shift, {
    time: attendance.outiseSince,
    latitude,
    longitude,
    address,
    checkoutType: 'AUTO_GEOFENCE',
  });

  emitToAgency(shift.agency.toString(), 'attendance: checkOut', {
    guardId: guard._id, shiftId: shift._id, time: attendance.outiseSince, auto: true,
  });

  const message = `${req.user.name} was automatically checked out from ${site?.name || 'the site'} — outside site location for more than 2 minutes.`;
  await notifyAgencyAndClient(shift, { title: 'Auto Checkout — Guard Left Site', message });
  await notifyUser(req.user._id, {
    title: 'Auto Checkout',
    message: `You were automatically checked out you were outside ${site?.name || 'the site'} location for more than 2 minutes.`,
    category: 'Attendance',
    targetScreen: 'Dashboard',
  });

  return sendSuccess(res, 200, 'Automatically checked out - outside site location too long', {
    attendance,
    withinGeofence: false,
    autoCheckedOut: true,
  });
});

// guard attendance
const getAttendanceHistory = asyncHandler(async (req, res) => {
  const guard = await getGuardProfileOrFail(req.user._id);

  const { month } = req.query;
  const filter = { guard: guard._id };
  if (month) filter.date = { $regex: `^${month}` };

  const history = await Attendance.find(filter).populate('shift').sort({ date: -1 });
  return sendSuccess(res, 200, 'Attendance history fetched', { history });
})

// get guard Incidents
const getIncidents = asyncHandler(async (req, res) => {

  const guard = await getGuardProfileOrFail(req.user._id);
  const incidents = await Incident.find({
    reportedBy: guard._id
  }).sort({ createdAt: -1 });

  return sendSuccess(res, 200, "Incidents fetched", { incidents });
});

// Create incidents
const createIncident = asyncHandler(async (req, res) => {
  const guard = await getGuardProfileOrFail(req.user._id);

  const { title, incidentType, description, location, priority, dateTime } = req.body;

  if (!title || !incidentType || !description || !location || !dateTime) {
    throw new ApiError(400, "title, incidentsTypes, description, date & time is required! ");
  }

  const images = req.file
    ? [`/${process.env.UPLOAD_DIR || 'uploads'}/${req.file.filename}`]
    : [];

  const incident = await Incident.create({
    reportedBy: guard._id,
    agency: guard.agency,
    site: guard.assignedSite || undefined,
    title,
    incidentType,
    priority: priority || "Medium",
    description,
    location: location || '',
    dateTime: dateTime || Date.now(),
    images,
    isEscalated: priority === 'Critical',
  });

  emitToAgency(guard.agency.toString(), 'incident:new', incident);
  const agencyStaff = await User.find({ agency: guard.agency, role: { $in: ['agency_admin', 'operations_manager', 'supervisor'] } });
  for (const staff of agencyStaff) {
    await notifyUser(staff._id, {
      title: 'New Incident Reported',
      message: `${incidentType} reported at ${location || 'a site'}.`,
      category: 'Incidents',
      targetScreen: 'IncidentDetails',
      targetParams: { incidentId: incident._id },
    });
  }
  return sendSuccess(res, 201, 'Incident reported successfully', { incident });
});

// get indicdent by Id
const getIncidentDetails = asyncHandler(async (req, res) => {
  const guard = await getGuardProfileOrFail(req.user._id);
  const incident = await Incident.findOne({ _id: req.params.id, reportedBy: guard._id });

  if (!incident) {
    throw new ApiError(404, "Incident not found");
  }

  return sendSuccess(res, 200, 'Incident details fetched', { incident });
});

const getProfile = asyncHandler(async (req, res) => {
  const guard = await getGuardProfileOrFail(req.user._id);
  return sendSuccess(res, 200, "Profile fetched", {
    user: req.user.toSafeObject(),
    guard,
  });
})

// update profile
const updateProfile = asyncHandler(async (req, res) => {
  const guard = await getGuardProfileOrFail(req.user._id);

  const { name, email, phone, address, emergencyContact } = req.body;

  if (phone && phone !== req.user.phone) {
    const phoneTaken = await User.findOne({ phone, _id: { $ne: req.user._id } });
    if (phoneTaken) {
      throw new ApiError(400, 'This phone number is already registered with another account');
    }
    req.user.phone = phone;
  }

  const avatarUrl = req.file
    ? `/${process.env.UPLOAD_DIR || 'uploads'}/${req.file.filename}`
    : req.body.avatarUrl;

  if (name) req.user.name = name;
  if (email) req.user.email = email;
  if (avatarUrl) req.user.avatarUrl = avatarUrl;
  await req.user.save();

  if (address !== undefined) guard.address = address;
  if (emergencyContact !== undefined) guard.emergencyContact = emergencyContact;
  await guard.save();

  return sendSuccess(res, 200, 'Profile updated', { user: req.user.toSafeObject(), guard });
});


// get notification
const getNotifications = asyncHandler(async (req, res) => {
  const filter = { recipient: req.user._id };
  if (req.query.unread === 'true') filter.isRead = false;
  const notifications = await Notification.find(filter).sort({ createdAt: -1 });

  return sendSuccess(res, 200, "Notification detched", { notifications });
});


// mark notificationas read
const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  return sendSuccess(res, 200, "Notification marked as read", { notification })
});

// mark all notifications as read
const markAllNotificationRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
  return sendSuccess(res, 200, "All Notifictaion read successfully");
});

module.exports = {
  getDashboard,
  getShifts,
  getShiftDetails,
  checkIn,
  checkOut,
  locationPing,
  getAttendanceHistory,
  getIncidents,
  createIncident,
  getIncidentDetails,
  getProfile,
  updateProfile,
  getNotifications,
  markNotificationRead,
  markAllNotificationRead
}