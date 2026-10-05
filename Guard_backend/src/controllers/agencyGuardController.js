const User = require('../models/User');
const GuardProfile = require('../models/GuardProfile');
const Shift = require('../models/Shift');
const Attendance = require('../models/Attendance');

const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/apiResponse');

const { buildWindow } = require('../utils/shiftTime');
const { getBusyShiftsMap, getAbsentShiftIds, resolveGuardStatus } = require('../services/guardAvailabilityService');

const generateEmployeeId = async () => {
  for (let i = 0; i < 5; i++) {
    const candidate = `EMP-${Date.now().toString(36).toUpperCase()}${Math.floor(100 + Math.random() * 900)}`;
    const exists = await GuardProfile.findOne({ employeeId: candidate });
    if (!exists) {
      return candidate;
    }
  }
  return `EMP-${Date.now()}`;
}

const getGuard = asyncHandler(async (req, res) => {
  const { search, status, date, startTime, endTime, dutyStatus } = req.query;

  const filter = { agency: req.user.agency };
  if (status) {
    filter.status = status;
  }

  let guards = await GuardProfile.find(filter).populate("user", "name phone email avatarUrl").populate("assignedSite");

  if (search) {
    const term = search.toLowerCase();
    guards = guards.filter((g) => g.user?.name?.toLowerCase().includes(term) || g.employeeId?.toLowerCase().includes(term));
  }

  const window = buildWindow({ date, startTime, endTime });
  const busyMap = await getBusyShiftsMap(req.user.agency, window);
  const absentShiftIds = await getAbsentShiftIds(busyMap);

  let result = guards.map((g) => {
    const info = resolveGuardStatus(g, window, busyMap, absentShiftIds);
    return { ...g.toObject(), dutyStatus: info.dutyStatus, dutyReason: info.reason || '', currentShift: info.shift || null };
  });

  const counts = {
    all: result.length,
    available: result.filter((g) => g.dutyStatus === 'Available').length,
    onDuty: result.filter((g) => g.dutyStatus === 'On Duty').length,
    offDuty: result.filter((g) => g.dutyStatus === 'Off Duty').length,
  };

  if (dutyStatus) {
    result = result.filter((g) => g.dutyStatus === dutyStatus);
  }

  return sendSuccess(res, 200, "Guards fetched", { guards: result, counts });
});

// get guard profile
const getGuardProfile = asyncHandler(async (req, res) => {
  const guard = await GuardProfile.findOne({ _id: req.params.id, agency: req.user.agency })
    .populate("user", "name phone email avatarUrl")
    .populate('assignedSite');

  if (!guard) {
    throw new ApiError(404, "Guard not found");
  }

  return sendSuccess(res, 200, "Guard ProfileFetched", { guard });
});


// add new gaurd by the agency
const addGuard = asyncHandler(async (req, res) => {
  const { name, email, phone, password, gender, experienceYears, address, emergencyContact } = req.body;

  if (!name || !phone || !password) {
    throw new ApiError(400, 'name, phone, password, are required');
  }

  const cleanEmail = email && email.trim() ? email.trim().toLowerCase() : undefined;
  const user = await User.create({
    name,
    email: cleanEmail,
    phone: phone.trim(),
    password,
    role: 'guard',
    agency: req.user.agency,
  });

  const docNames = [].concat(req.body.docNames || []);
  const documents = (req.files || []).map((file, i) => ({
    name: docNames[i] || file.originalname,
    fileUrl: `/${process.env.UPLOAD_DIR || 'uploads'}/${file.filename}`,
  }));

  const employeeId = await generateEmployeeId();
  let guard;
  try {
    guard = await GuardProfile.create({
      user: user._id,
      agency: req.user.agency,
      employeeId:employeeId,
      gender,
      experienceYears,
      address,
      emergencyContact,
      documents,
    });
  } catch (err) {
    await User.findByIdAndDelete(user._id);
    throw err;
  }

  return sendSuccess(res, 201, "Guard Added successfully", { guard, user: user.toSafeObject() });
});

// update guard
const updateGuard = asyncHandler(async (req, res) => {
  const guard = await GuardProfile.findOne({ _id: req.params.id, agency: req.user.agency });
  if (!guard) {
    throw new ApiError(404, "Guard not found");
  }

  const { name, email, avatarUrl, gender, experienceYears, address, emergencyContact, status, isVerified, isAvailable } = req.body;

  if (name || email || avatarUrl) {
    await User.findByIdAndUpdate(guard.user, {
      ...(name && { name }),
      ...(email && { email: email.trim().toLowerCase() }),
      ...(avatarUrl && { avatarUrl }),
    });
  }

  Object.assign(guard, {
    ...(gender && { gender }),
    ...(experienceYears !== undefined && { experienceYears }),
    ...(address !== undefined && { address }),
    ...(emergencyContact !== undefined && { emergencyContact }),
    ...(status && { status }),
    ...(isVerified !== undefined && { isVerified }),
    ...(isAvailable !== undefined && { isAvailable }),
  })
  await guard.save();

  return sendSuccess(res, 200, "Guard updated", { guard });
});

// guard avability gaurd
const getGuardAvailability = asyncHandler(async (req, res) => {
  const guard = await GuardProfile.findOne({ _id: req.params.id, agency: req.user.agency });
  if (!guard) throw new ApiError(404, 'Guard not found');

  const shifts = await Shift.find({
    guard: guard._id,
    status: { $in: ['Upcoming', 'Active'] }
  }).select('date startTime endTime status');

  return sendSuccess(res, 200, 'Availability fetched', {
    isAvailable: guard.isAvailable,
    unavailableDates: guard.unavailableDates,
    upcomingShifts: shifts,
  });
});

// update guard availability
const updateGuardAvailability = asyncHandler(async (req, res) => {
  const guard = await GuardProfile.findOne({
    _id: req.params.id,
    agency: req.user.agency
  });
  if (!guard) throw new ApiError(404, 'Guard not found');

  const { unavailableDates, isAvailable } = req.body;
  if (unavailableDates) guard.unavailableDates = unavailableDates;
  if (isAvailable !== undefined) guard.isAvailable = isAvailable;
  await guard.save();

  return sendSuccess(res, 200, 'Availability updated', { guard });
});



const getGuardDocuments = asyncHandler(async (req, res) => {
  const guard = await GuardProfile.findOne({ _id: req.params.id, agency: req.user.agency });
  if (!guard) throw new ApiError(404, 'Guard not found');
  return sendSuccess(res, 200, 'Documents fetched', { documents: guard.documents, isVerified: guard.isVerified });
});

const syncGuardVerified = (guard) => {
  guard.isVerified = guard.documents.length > 0 && guard.documents.every((d) => d.verified);
};

// update guard Documnets
const uploadGuardDocument = asyncHandler(async (req, res) => {
  const guard = await GuardProfile.findOne({
    _id: req.params.id,
    agency: req.user.agency
  });
  if (!guard) throw new ApiError(404, 'Guard not found');
  if (!req.file) throw new ApiError(400, 'File required');

  guard.documents.push({
    name: req.body.name || req.file.originalname,
    fileUrl: `/${process.env.UPLOAD_DIR || 'uploads'}/${req.file.filename}`,
  });
  syncGuardVerified(guard); 
  await guard.save();

  return sendSuccess(res, 201, 'Document uploaded', { documents: guard.documents, isVerified: guard.isVerified });
});

const verifyGuardDocument = asyncHandler(async (req, res) => {
  const guard = await GuardProfile.findOne({ _id: req.params.id, agency: req.user.agency });
  if (!guard) throw new ApiError(404, 'Guard not found');

  const doc = guard.documents.id(req.params.docId);
  if (!doc) throw new ApiError(404, 'Document not found');

  doc.verified = req.body.verified !== undefined ? !!req.body.verified : true;
  syncGuardVerified(guard);
  await guard.save();

  return sendSuccess(res, 200, 'Document updated', { documents: guard.documents, isVerified: guard.isVerified });
});

const deleteGuardDocument = asyncHandler(async (req, res) => {
  const guard = await GuardProfile.findOne({ _id: req.params.id, agency: req.user.agency });
  if (!guard) throw new ApiError(404, 'Guard not found');

  const doc = guard.documents.id(req.params.docId);
  if (!doc) throw new ApiError(404, 'Document not found');

  guard.documents.pull(doc._id); 
  syncGuardVerified(guard);
  await guard.save();

  return sendSuccess(res, 200, 'Document deleted', { documents: guard.documents, isVerified: guard.isVerified });
});

// fetcg guard attenedence 
const getGuardAttendance = asyncHandler(async (req, res) => {
  const guard = await GuardProfile.findOne({ _id: req.params.id, agency: req.user.agency });
  if (!guard) throw new ApiError(404, 'Guard not found');

  const attendance = await Attendance.find({ guard: guard._id }).populate('shift').sort({ date: -1 });
  return sendSuccess(res, 200, 'Guard attendance fetched', { attendance });
});

// fetch guard shift history
const getGuardShiftHistory = asyncHandler(async (req, res) => {
  const guard = await GuardProfile.findOne({ _id: req.params.id, agency: req.user.agency });
  if (!guard) throw new ApiError(404, 'Guard not found');

  const shifts = await Shift.find({ guard: guard._id }).populate('site').sort({ date: -1 });
  return sendSuccess(res, 200, 'Shift history fetched', { shifts });
});

module.exports = {
  getGuard,
  getGuardProfile,
  addGuard,
  updateGuard,
  getGuardAvailability,
  updateGuardAvailability,
  getGuardDocuments,
  uploadGuardDocument,
  verifyGuardDocument,
  deleteGuardDocument,
  getGuardAttendance,
  getGuardShiftHistory,
};