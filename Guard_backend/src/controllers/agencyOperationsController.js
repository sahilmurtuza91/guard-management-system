const Shift = require('../models/Shift');
const Attendance = require('../models/Attendance');
const GuardProfile = require('../models/GuardProfile');
const Incident = require('../models/Incident');
const Site = require('../models/Site');

const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/apiResponse');
const { notifyUser } = require('../services/notificationService');

const { buildWindow } = require('../utils/shiftTime');
const { getBusyShiftsMap, getLeaveReason } = require('../services/guardAvailabilityService');


const getShifts = asyncHandler(async (req, res) => {
  const { from, to, status } = req.query;
  const filter = { agency: req.user.agency };
  if (status) filter.status = status;
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }

  const shifts = await Shift.find(filter)
    .populate({ path: 'guard', populate: { path: 'user', select: 'name phone avatarUrl' } })
    .populate('site')
    .sort({ date: 1 });

  return sendSuccess(res, 200, 'Shifts fetched', { shifts });
});


const getShiftDetails = asyncHandler(async (req, res) => {
  const shift = await Shift.findOne({ _id: req.params.id, agency: req.user.agency })
    .populate({ path: 'guard', populate: { path: 'user', select: 'name phone avatarUrl' } })
    .populate('site');
  if (!shift) throw new ApiError(404, 'Shift not found');
  return sendSuccess(res, 200, 'Shift details fetched', { shift });
});


const createShift = asyncHandler(async (req, res) => {
  const {
    guardIds,
    siteId,
    date,
    startTime,
    endTime,
    shiftType,
    reportingTime,
    breakTime,
    supervisorName,
    supervisorPhone,
  } = req.body;

  
  if (!Array.isArray(guardIds) || guardIds.length === 0) {
    throw new ApiError(400, 'Please select at least one guard');
  }

  const guards = await GuardProfile.find({
    _id: { $in: guardIds },
    agency: req.user.agency,
  });

  if (guards.length !== guardIds.length) {
    throw new ApiError(404, 'One or more selected guards not found');
  }

  const site = await Site.findOne({
    _id: siteId,
    agency: req.user.agency,
  });

  if (!site) {
    throw new ApiError(404, 'Site not found');
  }

  const window = buildWindow({
    date,
    startTime,
    endTime,
  });

  const busyMap = await getBusyShiftsMap(
    req.user.agency,
    window
  );

  for (const guard of guards) {
    if (getLeaveReason(guard, window)) {
      throw new ApiError(
        409,
        `${guard.user?.name || 'Selected guard'} is on leave for the selected date`
      );
    }

    if ((busyMap.get(guard._id.toString()) || []).length) {
      throw new ApiError(
        409,
        `${guard.user?.name || 'Selected guard'} already has another shift in the selected time slot`
      );
    }
  }

  const createdShifts = [];

  for (const guard of guards) {
    const shift = await Shift.create({
      guard: guard._id,
      agency: req.user.agency,
      site: siteId,
      date,
      startTime,
      endTime,
      shiftType,
      reportingTime,
      breakTime,
      supervisorName,
      supervisorPhone,
    });

    createdShifts.push(shift);

    await notifyUser(guard.user, {
      title: 'New Shift Scheduled',
      message: `Your new shift is scheduled at ${site.name}.`,
      category: 'Duty',
      targetScreen: 'ShiftDetails',
      targetParams: {
        shiftId: shift._id,
      },
    });
  }

  return sendSuccess(res, 201, 'Shift created', {
    shifts: createdShifts,
  });
});


const updateShift = asyncHandler(async (req, res) => {
  const shift = await Shift.findOneAndUpdate({ _id: req.params.id, agency: req.user.agency }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!shift) throw new ApiError(404, 'Shift not found');
  return sendSuccess(res, 200, 'Shift updated', { shift });
});


const cancelShift = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const shift = await Shift.findOne({ _id: req.params.id, agency: req.user.agency }).populate('guard');
  if (!shift) throw new ApiError(404, 'Shift not found');

  shift.status = 'Cancelled';
  shift.cancelReason = reason || '';
  await shift.save();

  await notifyUser(shift.guard.user, {
    title: 'Shift Cancelled',
    message: reason || 'your shift is cancled.',
    category: 'Duty',
  });
  if (shift.client) {
    await notifyUser(shift.client, {
      title: 'Shift Cancelled',
      message: 'your assigned gaurd shift is candled so agency will provide you a replacement very soon.',
      category: 'Requests',
    });
  }

  return sendSuccess(res, 200, 'Shift cancelled', { shift });
});

const getAttendanceMonitor = asyncHandler(async (req, res) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const { date } = req.query;

  const attendance = await Attendance.find({ agency: req.user.agency, date: date || todayStr })
    .populate({ path: 'guard', populate: { path: 'user', select: 'name phone avatarUrl' } })
    .populate('shift');

  return sendSuccess(res, 200, 'Attendance monitor data fetched', { attendance });
});

const getLiveGuardsMap = asyncHandler(async (req, res) => {
  const activeShifts = await Shift.find({ agency: req.user.agency, status: 'Active' })
    .populate({ path: 'guard', populate: { path: 'user', select: 'name phone avatarUrl' } })
    .populate('site');

  const liveGuards = activeShifts.map((shift) => ({
    shiftId: shift._id,
    guard: shift.guard,
    site: shift.site,
    lastKnownLocation: shift.guard?.lastKnownLocation || null,
  }));

  return sendSuccess(res, 200, 'Live guards fetched', { liveGuards });
});

const getIncidents = asyncHandler(async (req, res) => {
  const { status, priority } = req.query;
  const filter = { agency: req.user.agency };
  if (status) filter.status = status;
  if (priority) filter.priority = priority;

  const incidents = await Incident.find(filter)
    .populate({ path: 'reportedBy', populate: { path: 'user', select: 'name phone' } })
    .populate('site')
    .sort({ createdAt: -1 });

  return sendSuccess(res, 200, 'Incidents fetched', { incidents });
});

const getIncidentDetails = asyncHandler(async (req, res) => {
  const incident = await Incident.findOne({ _id: req.params.id, agency: req.user.agency })
    .populate({ path: 'reportedBy', populate: { path: 'user', select: 'name phone' } })
    .populate('site')
    .populate('comments.author', 'name role');
  if (!incident) throw new ApiError(404, 'Incident not found');
  return sendSuccess(res, 200, 'Incident details fetched', { incident });
});

const updateIncidentStatus = asyncHandler(async (req, res) => {
  const { status, comment } = req.body;
  const incident = await Incident.findOne({ _id: req.params.id, agency: req.user.agency }).populate('reportedBy');
  if (!incident) throw new ApiError(404, 'Incident not found');

  if (status) incident.status = status;
  if (comment) incident.comments.push({ author: req.user._id, text: comment });
  await incident.save();

  await notifyUser(incident.reportedBy.user, {
    title: 'Incident Status Updated',
    message: `your incident "${incident.title}" status is "${incident.status}".`,
    category: 'Incidents',
    targetScreen: 'IncidentDetails',
    targetParams: { incidentId: incident._id },
  });

  return sendSuccess(res, 200, 'Incident updated', { incident });
});

module.exports = {
  getShifts,
  getShiftDetails,
  createShift,
  updateShift,
  cancelShift,
  getAttendanceMonitor,
  getLiveGuardsMap,
  getIncidents,
  getIncidentDetails,
  updateIncidentStatus,
};
