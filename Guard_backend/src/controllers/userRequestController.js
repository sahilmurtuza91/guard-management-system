const GuardRequest = require('../models/GuardRequest');
const Agency = require('../models/Agency');
const Shift = require('../models/Shift');
const Attendance = require('../models/Attendance');
const Incident = require('../models/Incident');
const User = require("../models/User");

const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/apiResponse');
const { requestLabel } = require('../utils/requestLabel');
const { notifyUser } = require('../services/notificationService');
const { emitToAgency } = require('../socket');


const notifyAgencyStaff = async (agencyId, { title, message, requestId }) => {
  if (!agencyId) return;
  const agencyStaff = await User.find({ agency: agencyId, role: { $in: ['agency_admin', 'operations_manager', 'supervisor'] } });
  for (const staff of agencyStaff) {
    await notifyUser(staff._id, {
      title,
      message,
      category: 'Requests',
      targetScreen: 'RequestDetails',
      targetParams: { requestId },
    });
  }
};

const createRequest = asyncHandler(async (req, res) => {
  const {
    serviceType,
    purpose,
    shiftType,
    bookingType,
    date,
    startTime,
    endTime,
    durationHours,
    guardsCount,
    genderPreference,
    experienceLevel,
    specialRequirements,
    location,
    contactPerson,
    contactNumber,
    landmark,
    additionalInstructions,
  } = req.body;

  if (!serviceType || !date || !startTime || !endTime || !location?.address) {
    throw new ApiError(400, 'serviceType, date, startTime, endTime, location.address are required.');
  }

  if (new Date(date) < new Date(new Date().toDateString())) {
    throw new ApiError(400, "can't select the past date please select the future date to process.");
  }

  const agency = await Agency.findOne();

  const request = await GuardRequest.create({
    client: req.user._id,
    agency: agency?._id,
    serviceType,
    purpose,
    shiftType,
    bookingType,
    date,
    startTime,
    endTime,
    durationHours,
    guardsCount,
    genderPreference,
    experienceLevel,
    specialRequirements,
    location,
    contactPerson,
    contactNumber,
    landmark,
    additionalInstructions,
    status: 'Submitted',
    timeline: [{ status: 'Submitted', changedBy: req.user._id }],
  });
  if (agency) {
    emitToAgency(agency._id.toString(), 'request:new', request);
    await notifyAgencyStaff(agency._id, {
      title: 'New Guard Request',
      message: `${req.user.name} submitted a new ${serviceType} request for ${date}.`,
      requestId: request._id,
    });
  }

  return sendSuccess(res, 201, 'Request submitted successfully', { request });
});


const getMyRequests = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = { client: req.user._id };
  if (status) filter.status = status;

  const requests = await GuardRequest.find(filter).sort({ createdAt: -1 });
  return sendSuccess(res, 200, 'Requests fetched', { requests });
});


const getRequestDetails = asyncHandler(async (req, res) => {
  const request = await GuardRequest.findOne({ _id: req.params.id, client: req.user._id }).populate({
    path: 'assignedGuards.guard',
    populate: { path: 'user', select: 'name phone avatarUrl' },
  }).populate('assignedGuards.shift');

  if (!request) throw new ApiError(404, 'Request not found');

  const shiftIds = await Shift.find({ guardRequest: request._id }).distinct('_id');
  const incidentsCount = shiftIds.length
    ? await Incident.countDocuments({ shift: { $in: shiftIds } })
    : 0;

  return sendSuccess(res, 200, 'Request details fetched', {
    request: { ...request.toObject(), incidentsReported: incidentsCount },
  });
});


const modifyRequest = asyncHandler(async (req, res) => {
  const request = await GuardRequest.findOne({ _id: req.params.id, client: req.user._id });
  if (!request) throw new ApiError(404, 'Request not found');

  const alreadyAssigned = ['Guard Assigned', 'Confirmed', 'Active', 'Completed'].includes(request.status);
  const editableFields = ['date', 'startTime', 'endTime', 'guardsCount', 'specialRequirements', 'additionalInstructions'];

  editableFields.forEach((field) => {
    if (req.body[field] !== undefined) request[field] = req.body[field];
  });

  if (alreadyAssigned) {
    request.status = 'Under Review';
    request.statusReason = 'Client requested modification after assignment - needs agency approval';
    request.timeline.push({ status: 'Under Review', note: 'Modification requested by client', changedBy: req.user._id });
  }

  await request.save();

  if (request.agency) {
    emitToAgency(request.agency.toString(), 'request:modified', request);
    await notifyAgencyStaff(request.agency, {
      title: 'Request Modified',
      message: `${req.user.name} modified the ${requestLabel(request)} request.${alreadyAssigned ? ' Needs your approval.' : ''}`,
      requestId: request._id,
    });
  }

  return sendSuccess(res, 200, 'Request modified', { request });
});


const cancelRequest = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const request = await GuardRequest.findOne({ _id: req.params.id, client: req.user._id });
  if (!request) throw new ApiError(404, 'Request not found');

  if (['Completed', 'Cancelled by User', 'Cancelled by Agency'].includes(request.status)) {
    throw new ApiError(400, 'This request is already completed/ cancle you can not cancle this request.');
  }

  request.status = 'Cancelled by User';
  request.statusReason = reason || '';
  request.timeline.push({ status: 'Cancelled by User', note: reason, changedBy: req.user._id });
  await request.save();

  if (request.agency) {
    emitToAgency(request.agency.toString(), 'request:cancelled', request);
    await notifyAgencyStaff(request.agency, {
      title: 'Request Cancelled',
      message: `${req.user.name} cancelled the ${requestLabel(request)} request.${reason ? ` Reason: ${reason}` : ''}`,
      requestId: request._id,
    });
  }

  return sendSuccess(res, 200, 'Request cancelled', { request });
});


const requestReplacement = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const request = await GuardRequest.findOne({ _id: req.params.id, client: req.user._id });
  if (!request) throw new ApiError(404, 'Request not found');

  request.status = 'Replacement Requested';
  request.replacementReason = reason || '';
  request.timeline.push({ status: 'Replacement Requested', note: reason, changedBy: req.user._id });
  await request.save();

  if (request.agency) {
    emitToAgency(request.agency.toString(), 'request:replacementUrgent', request);
    await notifyAgencyStaff(request.agency, {
      title: 'URGENT: Guard Replacement Requested',
      message: `${req.user.name} requested a guard replacement on the ${requestLabel(request)} request.${reason ? ` Reason: ${reason}` : ''}`,
      requestId: request._id,
    });
  }

  return sendSuccess(res, 200, 'Replacement request. agency has notified', { request });
});


const rateRequest = asyncHandler(async (req, res) => {
  const { rating, review } = req.body;
  const request = await GuardRequest.findOne({ _id: req.params.id, client: req.user._id });
  if (!request) throw new ApiError(404, 'Request not found');
  if (request.status !== 'Completed') {
    throw new ApiError(400, 'you can rate only completed service.');
  }

  request.rating = rating;
  request.review = review;
  await request.save();

  return sendSuccess(res, 200, 'Thanks for your feedback!', { request });
});

const getRequestTracking = asyncHandler(async (req, res) => {
  const request = await GuardRequest.findOne({ _id: req.params.id, client: req.user._id })
    .populate({
      path: 'assignedGuards.guard',
      populate: { path: 'user', select: 'name phone avatarUrl' },
    })
    .populate('agency', 'name contactPhone');
  if (!request) throw new ApiError(404, 'Request not found');

  const assigned = request.assignedGuards?.[0];
  let shift = null;
  let attendance = null;

  shift = await Shift.findOne({ guardRequest: request._id }).populate('site').sort({ date: -1 });
  if (shift) {
    attendance = await Attendance.findOne({ guard: shift.guard, shift: shift._id });
  }

  return sendSuccess(res, 200, 'Tracking info fetched', {
    request: { id: request._id, status: request.status },
    agency: request.agency
      ? { name: request.agency.name, contactPhone: request.agency.contactPhone || '' }
      : null,
    guard: assigned?.guard
      ? {
        id: assigned.guard._id,
        name: assigned.guard.user?.name || '',
        phone: assigned.guard.user?.phone || '',
        avatarUrl: assigned.guard.user?.avatarUrl || '',
        experienceYears: assigned.guard.experienceYears || 0,
        isVerified: assigned.guard.isVerified || false,
        lastKnownLocation: assigned.guard.lastKnownLocation || null,
      }
      : null,
    shift: shift
      ? {
        id: shift._id,
        date: shift.date,
        startTime: shift.startTime,
        endTime: shift.endTime,
        status: shift.status,
      }
      : null,
    site: shift?.site
      ? {
        name: shift.site.name,
        address: shift.site.address,
        latitude: shift.site.latitude,
        longitude: shift.site.longitude,
      }
      : null,
    attendance: attendance
      ? {
        checkIn: attendance.checkIn || null,
        checkOut: attendance.checkOut || null,
        status: attendance.status,
      }
      : null,
  });
});

module.exports = {
  createRequest,
  getMyRequests,
  getRequestDetails,
  modifyRequest,
  cancelRequest,
  requestReplacement,
  rateRequest,
  getRequestTracking,
};
