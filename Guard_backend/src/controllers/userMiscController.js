const ClientProfile = require('../models/ClientProfile');
const GuardRequest = require('../models/GuardRequest');
const Notification = require('../models/Notification');
const User = require("../models/User")
const { notifyUser } = require('../services/notificationService');
const { emitToAgency } = require('../socket');

const Shift = require('../models/Shift');
const Attendance = require('../models/Attendance');

const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/apiResponse');
const { requestLabel } = require('../utils/requestLabel');

const SERVICE_CATEGORIES = [
  { id: 'CAT-1', name: 'Armed Guard', icon: 'shield' },
  { id: 'CAT-2', name: 'Unarmed Guard', icon: 'user-check' },
  { id: 'CAT-3', name: 'Event Security', icon: 'calendar' },
  { id: 'CAT-4', name: 'Personal Bodyguard', icon: 'user-shield' },
  { id: 'CAT-5', name: 'Residential Security', icon: 'home' },
  { id: 'CAT-6', name: 'Corporate Security', icon: 'briefcase' },
];

const getDashboard = asyncHandler(async (req, res) => {
  const profile = await ClientProfile.findOne({
    user: req.user._id
  });

  const defaultAddress =
    profile?.savedAddresses?.find((a) => a.isDefault) ||
    profile?.savedAddresses?.[0] ||
    null;

  const [
    activeCount,
    pendingCount,
    completedCount,
    guardsHiredIds
  ] = await Promise.all([
    GuardRequest.countDocuments({
      client: req.user._id,
      status: {
        $in: ['Guard Assigned', 'Confirmed', 'Active']
      },
    }),
    GuardRequest.countDocuments({
      client: req.user._id,
      status: {
        $in: [
          'Submitted',
          'Under Review',
          'Clarification Required',
          'Accepted'
        ]
      },
    }),
    GuardRequest.countDocuments({
      client: req.user._id,
      status: 'Completed'
    }),
    GuardRequest.distinct('assignedGuards.guard', {
      client: req.user._id,
      'assignedGuards.0': { $exists: true },
    }),

  ]);
  // const activeRequest = await GuardRequest.findOne({
  //   client: req.user._id,
  //   status: { $in: ['Guard Assigned', 'Confirmed', 'Active'] },
  // }).sort({ createdAt: -1 });
  const activeRequest = await GuardRequest.findOne({
    client: req.user._id,
    status: {
      $in: ['Guard Assigned', 'Confirmed', 'Active']
    },
  })
    .sort({ createdAt: -1 })
    .populate({
      path: 'assignedGuards.guard',
      populate: {
        path: 'user',
        select: 'name avatarUrl'
      }
    });

  let activeGuardDuty = null;

  if (activeRequest?.assignedGuards?.length) {

    const assignedGuard =
      activeRequest.assignedGuards[
        activeRequest.assignedGuards.length - 1
      ]?.guard;

    const todayStr = new Date().toISOString().slice(0, 10);

    // Find all shifts for this request
    const shifts = await Shift.find({
      guardRequest: activeRequest._id,
    }).sort({ date: -1 });

    // Prefer today's shift
    const todayShift = shifts.find(
      (s) =>
        new Date(s.date).toISOString().slice(0, 10) === todayStr
    );
    const shift = todayShift || shifts[0] || null;

    const attendance = shift
      ? await Attendance.findOne({
        guard: shift.guard,
        shift: shift._id,
      })
      : null;

    const shiftIsToday =
      !!shift?.date &&
      new Date(shift.date).toISOString().slice(0, 10) === todayStr;

    activeGuardDuty = {
      requestId: activeRequest._id,
      guardName:
        assignedGuard?.user?.name || 'Guard',
      guardAvatarUrl:
        assignedGuard?.user?.avatarUrl || '',
      shiftDate:
        shift?.date || null,
      shiftIsToday,
      isCheckedIn:
        !!attendance?.checkIn?.time &&
        !attendance?.checkOut?.time,
      isCheckedOut:
        !!attendance?.checkOut?.time,
      checkInTime:
        attendance?.checkIn?.time || null,
      checkOutTime:
        attendance?.checkOut?.time || null,
      workingSeconds:
        attendance?.workingSeconds || 0,
      isAbsent:
        shiftIsToday &&
        !attendance?.checkIn?.time &&
        shift?.status !== 'Upcoming',
    };
  }

  const recentRequests = await GuardRequest.find({ client: req.user._id }).sort({ createdAt: -1 }).limit(5);

  return sendSuccess(res, 200, 'Dashboard fetched', {
    user: {
      name: req.user.name,
      avatarUrl: req.user.avatarUrl
    },
    location: defaultAddress
      ? {
        label: defaultAddress.label,
        addressLine: defaultAddress.addressLine
      }
      : null,
    stats: {
      activeCount,
      pendingCount,
      completedCount,
      guardsHiredCount: guardsHiredIds.length,
    },
    activeGuardDuty,
    activeRequest,
    recentRequests,
    categories: SERVICE_CATEGORIES,
  });
});


const HIRE_OPTIONS = {
  purposes: ['Office Security', 'Residential Society', 'Construction Site', 'Private Event', 'Commercial Mall'],
  durations: [4, 8, 12, 24],
  timeSlots: ['06:00 AM - 02:00 PM', '02:00 PM - 10:00 PM', '10:00 PM - 06:00 AM', 'Custom Timing'],
  genderOptions: ['Any', 'Male', 'Female'],
  experienceOptions: ['Any', '1-3 Years', '3+ Years'],
  defaults: { guardsCount: 2, gender: 'Any', experience: '3+ Years', durationHours: 8, timeSlotIndex: 1 },
};

const getHireOptions = asyncHandler(async (req, res) => {
  return sendSuccess(res, 200, 'Hire options fetched', { options: HIRE_OPTIONS });
});

const getCategories = asyncHandler(async (req, res) => {
  return sendSuccess(res, 200, 'Categories fetched', { categories: SERVICE_CATEGORIES });
});

const getAddresses = asyncHandler(async (req, res) => {
  const profile = await ClientProfile.findOne({ user: req.user._id });
  return sendSuccess(res, 200, 'Addresses fetched', { addresses: profile?.savedAddresses || [] });
});


const addAddress = asyncHandler(async (req, res) => {
  const profile = await ClientProfile.findOne({ user: req.user._id });
  if (!profile) throw new ApiError(404, 'Client profile not found');

  profile.savedAddresses.push(req.body);
  await profile.save();

  return sendSuccess(res, 201, 'Address added', { addresses: profile.savedAddresses });
});


const deleteAddress = asyncHandler(async (req, res) => {
  const profile = await ClientProfile.findOne({ user: req.user._id });
  if (!profile) throw new ApiError(404, 'Client profile not found');

  profile.savedAddresses = profile.savedAddresses.filter((a) => a._id.toString() !== req.params.addressId);
  await profile.save();

  return sendSuccess(res, 200, 'Address removed', { addresses: profile.savedAddresses });
});


const getProfile = asyncHandler(async (req, res) => {
  const profile = await ClientProfile.findOne({ user: req.user._id });
  return sendSuccess(res, 200, 'Profile fetched', { user: req.user.toSafeObject(), profile });
});


const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, phone, notificationPrefs } = req.body;

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

  let profile = null;
  if (notificationPrefs) {
    profile = await ClientProfile.findOne({ user: req.user._id });
    if (profile) {
      profile.notificationPrefs = { ...profile.notificationPrefs?.toObject?.(), ...notificationPrefs };
      await profile.save();
    }
  }

  return sendSuccess(res, 200, 'Profile updated', { user: req.user.toSafeObject(), profile });
});


const raiseIssue = asyncHandler(async (req, res) => {
  const { requestId, issueType, description } = req.body;
  const request = await GuardRequest.findOne({ _id: requestId, client: req.user._id });
  if (!request) throw new ApiError(404, 'Request not found');

  const imageUrl = req.file ? `/${process.env.UPLOAD_DIR || 'uploads'}/${req.file.filename}` : null;

  request.timeline.push({
    status: request.status,
    note: `Issue raised by client: [${issueType}] ${description}${imageUrl ? ' (photo attached)' : ''}`,
    changedBy: req.user._id,
  });
  await request.save();

  if (request.agency) {
    const agencyStaff = await User.find({ agency: request.agency, role: { $in: ['agency_admin', 'operations_manager', 'supervisor'] } });

    for (const staff of agencyStaff) {
      await notifyUser(staff._id, {
        title: 'Client Issue Raised',
        message: `${req.user.name} raised an issue on the ${requestLabel(request)} request: [${issueType}] ${description}`,
        category: 'Support',
        targetScreen: 'RequestDetails',
        targetParams: { requestId: request._id },
      });
    }
  }

  return sendSuccess(res, 201, 'Issue raised. Agency will contact you soon.', { request, imageUrl });
});


const triggerSOS = asyncHandler(async (req, res) => {
  const { requestId, latitude, longitude } = req.body;
  const request = await GuardRequest.findOne({ _id: requestId, client: req.user._id });
  if (!request) throw new ApiError(404, 'Active request not found for SOS');


  if (request.agency) {
    emitToAgency(request.agency.toString(), 'sos:triggered', {
      requestId: request._id,
      client: req.user._id,
      latitude,
      longitude,
      time: new Date(),
    });
  }

  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  if (request.agency) {
    const agencyStaff = await User.find({ agency: request.agency, role: { $in: ['agency_admin', 'operations_manager', 'supervisor'] } });

    for (const staff of agencyStaff) {
      await notifyUser(staff._id, {
        title: 'EMERGENCY SOS',
        message: `${req.user.name} triggered an SOS alert on the ${requestLabel(request)} request. Location: ${mapsLink}`,
        category: 'Emergency',
        targetScreen: 'RequestDetails',
        targetParams: { requestId: request._id },
      });
    }
  }
  const assignedGuardUser = request.assignedGuards?.[0]?.guard?.user;
  if (assignedGuardUser) {
    await notifyUser(assignedGuardUser._id, {
      title: 'Client Emergency Alert',
      message: `${req.user.name} triggered an SOS at the duty site. Please check on them immediately.`,
      category: 'Emergency',
    });
  }

  return sendSuccess(res, 200, 'SOS alert sent to agency. Help is on the way.');
});


const getNotifications = asyncHandler(async (req, res) => {
  const filter = { recipient: req.user._id };
  if (req.query.unread === 'true') filter.isRead = false;
  const notifications = await Notification.find(filter).sort({ createdAt: -1 });
  return sendSuccess(res, 200, 'Notifications fetched', { notifications });
});

const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { isRead: true },
    { new: true }
  );
  if (!notification) throw new ApiError(404, 'Notification not found');
  return sendSuccess(res, 200, 'Marked as read', { notification });
});

const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
  return sendSuccess(res, 200, 'All notifications marked as read');
});

module.exports = {
  getDashboard,
  getCategories,
  getHireOptions,
  getAddresses,
  addAddress,
  deleteAddress,
  getProfile,
  updateProfile,
  raiseIssue,
  triggerSOS,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
