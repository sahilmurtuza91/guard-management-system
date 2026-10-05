const Shift = require('../models/Shift');
const Attendance = require('../models/Attendance');
const { getShiftInterval, intervalsOverlap, toDayKey } = require('../utils/shiftTime');

const LIVE_SHIFT_STATUSES = ['Upcoming', 'Active'];
const DAY_MS = 24 * 60 * 60 * 1000;

const getBusyShiftsMap = async (agencyId, window, { excludeShiftIds = [] } = {}) => {

  const from = new Date(window.start.getTime() - 2 * DAY_MS);
  const to = new Date(window.end.getTime() + 2 * DAY_MS);

  const shifts = await Shift.find({
    agency: agencyId,
    status: { $in: LIVE_SHIFT_STATUSES },
    date: { $gte: from, $lte: to },
    ...(excludeShiftIds.length && { _id: { $nin: excludeShiftIds } }),
  }).populate('site', 'name address');

  const map = new Map();
  for (const shift of shifts) {
    const iv = getShiftInterval(shift.date, shift.startTime, shift.endTime);
    if (!iv || !intervalsOverlap(iv, window)) continue;
    const key = shift.guard.toString();
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(shift);
  }
  return map;
};


const getLeaveReason = (guard, window) => {
  if (guard.status && guard.status !== 'Active') return guard.status; 
  const leaveKeys = new Set((guard.unavailableDates || []).map(toDayKey));
  if (window.dayKeys.some((k) => leaveKeys.has(k))) return 'On Leave';
  return null;
};

const getAbsentShiftIds = async (busyMap) => {
  const ids = [];
  busyMap.forEach((shifts) => shifts.forEach((s) => ids.push(s._id)));
  if (!ids.length) return new Set();
  const absent = await Attendance.find({ shift: { $in: ids }, status: 'Absent' }).select('shift');
  return new Set(absent.map((a) => a.shift.toString()));
};

const shiftSummary = (shift) => ({
  shiftId: shift._id,
  startTime: shift.startTime,
  endTime: shift.endTime,
  date: shift.date,
  siteName: shift.site?.name || '',
  siteAddress: shift.site?.address || '',
});


const resolveGuardStatus = (guard, window, busyMap, absentShiftIds = new Set()) => {
  const leave = getLeaveReason(guard, window);
  if (leave) return { dutyStatus: 'Off Duty', reason: leave };

  const shifts = busyMap.get(guard._id.toString()) || [];
  if (shifts.length) {
    const present = shifts.filter((s) => !absentShiftIds.has(s._id.toString()));
    if (!present.length) return { dutyStatus: 'Off Duty', reason: 'Absent' };
    return { dutyStatus: 'On Duty', shift: shiftSummary(present[0]) };
  }
  return { dutyStatus: 'Available' };
};

module.exports = {
  getBusyShiftsMap,
  getLeaveReason,
  getAbsentShiftIds,
  resolveGuardStatus,
  shiftSummary,
};
