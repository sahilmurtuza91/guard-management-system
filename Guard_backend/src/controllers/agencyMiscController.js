const Agency = require('../models/Agency');
const User = require('../models/User');
const GuardProfile = require('../models/GuardProfile');
const GuardRequest = require('../models/GuardRequest');
const Shift = require('../models/Shift');
const Incident = require('../models/Incident');
const Notification = require('../models/Notification');

const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/apiResponse');

const { buildWindow } = require('../utils/shiftTime');
const { getBusyShiftsMap } = require('../services/guardAvailabilityService');

const getDashboard = asyncHandler(async (req, res) => {
  const agencyId = req.user.agency;

  const nowBusyMap = await getBusyShiftsMap(agencyId, buildWindow());
  const activeGuards = nowBusyMap.size;

  const [totalGuards, pendingRequests, activeShifts, openIncidents, agency] = await Promise.all([
    GuardProfile.countDocuments({ agency: agencyId }),
    GuardRequest.countDocuments({ agency: agencyId, status: { $in: ['Submitted', 'Under Review'] } }),
    Shift.countDocuments({ agency: agencyId, status: 'Active' }),
    Incident.countDocuments({ agency: agencyId, status: { $in: ['Reported', 'Under Review'] } }),
    Agency.findById(agencyId).select('name logoUrl address contactEmail contactPhone'),
  ]);

  const recentRequests = await GuardRequest.find({ agency: agencyId }).sort({ createdAt: -1 }).limit(5);
  const recentIncidents = await Incident.find({ agency: agencyId }).sort({ createdAt: -1 }).limit(5);

  return sendSuccess(res, 200, 'Agency dashboard fetched', {
    agency,
    stats: { totalGuards, activeGuards, pendingRequests, activeShifts, openIncidents },
    recentRequests,
    recentIncidents,
  });
});

const getAgencyProfile = asyncHandler(async (req, res) => {
  const agency = await Agency.findById(req.user.agency);
  if (!agency) throw new ApiError(404, 'Agency not found');
  return sendSuccess(res, 200, 'Agency profile fetched', { agency, user: req.user.toSafeObject() });
});

const updateAgencyProfile = asyncHandler(async (req, res) => {
  const { name, address, contactEmail, contactPhone } = req.body;

  const logoUrl = req.file
    ? `/${process.env.UPLOAD_DIR || 'uploads'}/${req.file.filename}`
    : req.body.logoUrl;

  const updates = {};
  if (name !== undefined) updates.name = name.trim();
  if (address !== undefined) updates.address = address;
  if (contactEmail !== undefined) updates.contactEmail = contactEmail;
  if (contactPhone !== undefined) updates.contactPhone = contactPhone;
  if (logoUrl !== undefined) updates.logoUrl = logoUrl;

  const agency = await Agency.findByIdAndUpdate(
    req.user.agency,
    { $set: updates },
    { new: true, runValidators: true }
  );
  if (!agency) throw new ApiError(404, 'Agency not found');
  return sendSuccess(res, 200, 'Agency profile updated', { agency });
});

const getTeamMembers = asyncHandler(async (req, res) => {
  const team = await User.find({
    agency: req.user.agency,
    role: { $in: ['agency_admin', 'operations_manager', 'supervisor'] },
  }).select('-password');
  return sendSuccess(res, 200, 'Team members fetched', { team });
});

const addTeamMember = asyncHandler(async (req, res) => {
  const { name, password, role } = req.body;
  const email = req.body.email && req.body.email.trim() ? req.body.email.trim().toLowerCase() : undefined;
  const phone = req.body.phone && req.body.phone.trim() ? req.body.phone.trim() : undefined;

  if (!['operations_manager', 'supervisor', 'agency_admin'].includes(role)) {
    throw new ApiError(400, 'Invalid role for team member');
  }
  if (!name || !name.trim() || !password) {
    throw new ApiError(400, 'name and password are required');
  }
  if (password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters');
  }
  if (!email && !phone) {
    throw new ApiError(400, 'Email or phone is required so the member can log in');
  }

  const exists = await User.findOne({ $or: [...(email ? [{ email }] : []), ...(phone ? [{ phone }] : [])] });
  if (exists) {
    throw new ApiError(400, 'A user with this email or phone already exists');
  }

  const member = await User.create({
    name: name.trim(),
    email,
    phone,
    password,
    role,
    agency: req.user.agency,
    isPhoneVerified: true,
  });
  return sendSuccess(res, 201, 'Team member added', { member: member.toSafeObject() });
});

const getReports = asyncHandler(async (req, res) => {
  const agencyId = req.user.agency;
  const { from, to } = req.query;

  const dateFilter = {};
  if (from) dateFilter.$gte = new Date(from);
  if (to) dateFilter.$lte = new Date(to);

  const shiftFilter = { agency: agencyId };
  if (from || to) shiftFilter.date = dateFilter;

  const [totalShifts, completedShifts, cancelledShifts, totalIncidents, resolvedIncidents] = await Promise.all([
    Shift.countDocuments(shiftFilter),
    Shift.countDocuments({ ...shiftFilter, status: 'Completed' }),
    Shift.countDocuments({ ...shiftFilter, status: 'Cancelled' }),
    Incident.countDocuments({ agency: agencyId }),
    Incident.countDocuments({ agency: agencyId, status: 'Resolved' }),
  ]);

  return sendSuccess(res, 200, 'Reports fetched', {
    shifts: { total: totalShifts, completed: completedShifts, cancelled: cancelledShifts },
    incidents: { total: totalIncidents, resolved: resolvedIncidents },
  });
});

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 });
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
  getAgencyProfile,
  updateAgencyProfile,
  getTeamMembers,
  addTeamMember,
  getReports,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
