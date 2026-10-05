const GuardRequest = require('../models/GuardRequest');
const GuardProfile = require('../models/GuardProfile');
const Shift = require('../models/Shift');
const Site = require('../models/Site');

const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/apiResponse');
const { notifyUser } = require('../services/notificationService');
const { emitToUser } = require('../socket');

const { buildWindow } = require('../utils/shiftTime');
const { getBusyShiftsMap, getLeaveReason, shiftSummary } = require('../services/guardAvailabilityService');

// get agency request 
const getRequest = asyncHandler(async (req, res) => {
  const { status } = req.query;

  const filter = { agency: req.user.agency };
  if (status) {
    filter.status = status;
  }

  const request = await GuardRequest.find(filter)
    .populate('client', 'name phone email avatarUrl')
    .sort({ createdAt: -1 });

  return sendSuccess(res, 200, "Request fetched", { request });
});

// get request by Id
const getRequestDetails = asyncHandler(async (req, res) => {
  const request = await GuardRequest.findOne({
    _id: req.params.id,
    agency: req.user.agency
  })
    .populate("client", "name phone email avatarUrl")
    .populate({ path: "assignedGuards.guard", populate: { path: "user", select: 'name phone avatarUrl' } })
    .populate('assignedGuards.shift');

  if (!request) {
    throw new ApiError(404, "Request not found");
  }

  return sendSuccess(res, 200, "Request detail fetched", { request });
});

const requestClarification = asyncHandler(async (req, res) => {
  const { note } = req.body;
  const request = await GuardRequest.findOne({
    _id: req.params.id,
    agency: req.user.agency
  });
  if (!request) throw new ApiError(404, "Request not found");

  request.status = 'Clarification Required';
  request.statusReason = note || '';
  request.timeline.push({ status: 'Clarification Required', note, changedBy: req.user._id });
  await request.save();

  await notifyUser(request.client, {
    title: 'Clarification Needed',
    message: note || 'for your request some ckarification needed to update please check it.',
    category: 'Requests',
    targetScreen: 'RequestDetails',
    targetParams: { requestId: request._id },
  });

  return sendSuccess(res, 200, 'Clarification requested from client', { request });
});

// request reject that is made by user
const rejectRequest = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const request = await GuardRequest.findOne({ _id: req.params.id, agency: req.user.agency });

  if (!request) {
    throw new ApiError(
      404,
      "Request not found"
    )
  };
  request.status = "Rejected";
  request.statusReason = reason || "";
  request.timeline.push({ status: "Reject", note: reason, changedBy: req.user._id });
  await request.save();

  await notifyUser(request.client, {
    title: "Request rejected",
    message: reason || "your guard request has been rejected from agency side",
    category: "Requests",
    targetScreen: 'RequestDetails',
    targetParams: { requestId: request._id },
  });

  return sendSuccess(res, 200, "Request rejected", { request });
});


const getEligibleGuards = asyncHandler(async (req, res) => {
  const request = await GuardRequest.findOne({
    _id: req.params.id,
    agency: req.user.agency
  });
  if (!request) throw new ApiError(404, "Request not found");

  const window = buildWindow({ date: request.date, startTime: request.startTime, endTime: request.endTime });

  const allGuards = await GuardProfile.find({ agency: req.user.agency })
    .populate("user", "name phone avatarUrl");

  const ownShiftIds = (request.assignedGuards || []).map((a) => a.shift).filter(Boolean);
  const busyMap = await getBusyShiftsMap(req.user.agency, window, { excludeShiftIds: ownShiftIds });

  const eligibleGuards = allGuards
    .filter((g) => !getLeaveReason(g, window)) 
    .map((g) => {
      const busy = busyMap.get(g._id.toString()) || [];
      return {
        ...g.toObject(),
        hasConflict: busy.length > 0,
        conflictShift: busy.length ? shiftSummary(busy[0]) : null,
      };
    });

  return sendSuccess(res, 200, 'Eligible guards fetched', { guards: eligibleGuards });
});

// assigned guard for diffrent service
const assignGuards = asyncHandler(async (req, res) => {
  const { guardIds, supervisorName = '', supervisorPhone = '' } = req.body;

  if (!Array.isArray(guardIds) || guardIds.length === 0) {
    throw new ApiError(400, "At least one guard is selected");
  }

  const request = await GuardRequest.findOne({
    _id: req.params.id,
    agency: req.user.agency
  });
  if (!request) {
    throw new ApiError(404, "Request not found");
  }

  let site = request.location.site ? await Site.findById(request.location.site) : null;

  if (!site) {
    site = await Site.create({
      agency: req.user.agency,
      name: request.purpose || "client Location",
      address: request.location.address,
      latitude: request.location.latitude,
      longitude: request.location.longitude,
    });
    request.location.site = site._id;
  }
  const createdAssignments = [];
  const skipped = [];


  const window = buildWindow({ date: request.date, startTime: request.startTime, endTime: request.endTime });
  const ownShiftIds = (request.assignedGuards || []).map((a) => a.shift).filter(Boolean);
  const busyMap = await getBusyShiftsMap(req.user.agency, window, { excludeShiftIds: ownShiftIds });

  for (const guardId of guardIds) {
    const guard = await GuardProfile.findOne({ _id: guardId, agency: req.user.agency, status: "Active" });
    if (!guard) {
      skipped.push({ guard: guardId, reason: 'Guard not found or not active' });
      continue; 
    }
    if (getLeaveReason(guard, window)) {
      skipped.push({ guard: guard._id, reason: 'Guard is on leave for this date' });
      continue;
    }
    if ((busyMap.get(guard._id.toString()) || []).length) {
      skipped.push({ guard: guard._id, reason: 'Guard already has another shift in this time slot' });
      continue;
    }

    const shift = await Shift.create({
      guard: guard._id,
      agency: req.user.agency,
      site: site._id,
      guardRequest: request._id,
      client: request.client,
      date: request.date,
      startTime: request.startTime,
      endTime: request.endTime,
      shiftType: request.serviceType,
      status: 'Upcoming',
      supervisorName,
      supervisorPhone,
    });

    guard.assignedSite = site._id;
    await guard.save();

    createdAssignments.push({ guard: guard._id, shift: shift._id });

    await notifyUser(guard.user, {
      title: "New Shift Assigned",
      message: `you have been assigned to ${site.name} for the duration of ${request.startTime} - ${request.endTime}`,
      category: "Duty",
      targetScreen: 'ShiftDetails',
      targetParams: { shiftId: shift._id },
    });
  }

  if (createdAssignments.length === 0) {
    throw new ApiError(409, skipped[0]?.reason || 'No guard could be assigned for this time slot');
  }

  request.assignedGuards.push(...createdAssignments);
  request.status = "Guard Assigned";
  request.timeline.push({ status: 'Guard Assigned', changedBy: req.user._id });
  await request.save();

  await notifyUser(request.client, {
    title: 'Guard Assigned!',
    message: `for your request ${createdAssignments.length} guard has been assigned.`,
    category: 'Requests',
    targetScreen: 'AssignedGuardDetails',
    targetParams: { requestId: request._id },
  });

  return sendSuccess(res, 200, 'Guards assigned successfully', {
    request,
    assignedCount: createdAssignments.length,
    skipped,
  });
});

module.exports = {
  getRequest,
  getRequestDetails,
  requestClarification,
  rejectRequest,
  getEligibleGuards,
  assignGuards,
};
