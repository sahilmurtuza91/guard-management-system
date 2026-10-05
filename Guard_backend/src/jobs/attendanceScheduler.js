const Shift = require('../models/Shift');
const Attendance = require('../models/Attendance');
const { getShiftStartDateTime, getShiftEndDateTime } = require('../utils/shiftTime');
const { notifyUser } = require('../services/notificationService');
const { notifyAgencyAndClient, performCheckout } = require('../services/attendanceService');

const REMINDER_WINDOW_MINUTES = 15;

const runAttendanceChecks = async () => {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  const shifts = await Shift.find({
    status: 'Upcoming',
    date: { $gte: todayStart, $lte: todayEnd },
    $or: [{ reminderSent: false }, { absentNotified: false }],
  })
    .populate('site')
    .populate({ path: 'guard', populate: { path: 'user' } });

  for (const shift of shifts) {
    const start = getShiftStartDateTime(shift);
    if (!start) continue;
    const minutesToStart = (start.getTime() - now.getTime()) / 60000;

    if (!shift.reminderSent && minutesToStart > 0 && minutesToStart <= REMINDER_WINDOW_MINUTES) {
      if (shift.guard?.user) {
        await notifyUser(shift.guard.user._id, {
          title: 'Upcoming Shift',
          message: `Your shift at ${shift.site?.name || 'your site'} starts at ${shift.startTime} (in ${Math.round(minutesToStart)} min).`,
          category: 'Shifts',
          targetScreen: 'ShiftDetails',
          targetParams: { shiftId: shift._id },
        });
      }
      shift.reminderSent = true;
      await shift.save();
      continue;
    }

    if (!shift.absentNotified && now.getTime() > start.getTime()) {
      const existingAttendance = await Attendance.findOne({ guard: shift.guard?._id, shift: shift._id });
      if (existingAttendance?.checkIn?.time) {
        shift.absentNotified = true;
        await shift.save();
        continue;
      }

      const dateKey = new Date(shift.date).toISOString().slice(0, 10);
      await Attendance.findOneAndUpdate(
        { guard: shift.guard?._id, shift: shift._id },
        {
          $set: { agency: shift.agency, date: dateKey, status: 'Absent' },
          $setOnInsert: { guard: shift.guard?._id, shift: shift._id },
        },
        { upsert: true }
      );

      if (shift.guard?.user) {
        await notifyUser(shift.guard.user._id, {
          title: 'Marked Absent',
          message: `You did not check in for your shift at ${shift.site?.name || 'your site'} (${shift.startTime}), so you have been marked Absent today.`,
          category: 'Attendance',
          targetScreen: 'Attendance',
        });
      }
      await notifyAgencyAndClient(shift, {
        title: 'Guard Absent',
        message: `${shift.guard?.user?.name || 'Guard'} did not check in for their shift at ${shift.site?.name || 'the site'} and has been marked Absent today.`,
      });

      shift.absentNotified = true;
      await shift.save();
    }
  }
};

const runShiftEndChecks = async () => {
  const now = new Date();
  const activeShifts = await Shift.find({ status: 'Active' })
    .populate('site')
    .populate({ path: 'guard', populate: { path: 'user' } });

  for (const shift of activeShifts) {
    const shiftEnd = getShiftEndDateTime(shift);
    if (!shiftEnd || now.getTime() < shiftEnd.getTime()) continue;

    const attendance = await Attendance.findOne({ guard: shift.guard?._id, shift: shift._id });
    if (attendance?.checkIn?.time && !attendance.checkOut?.time) {
      await performCheckout(attendance, shift, {
        time: shiftEnd,
        latitude: attendance.checkIn.latitude,
        longitude: attendance.checkIn.longitude,
        address: attendance.checkIn.address,
        checkoutType: 'AUTO_SHIFT_END',
      });
      if (shift.guard?.user) {
        await notifyUser(shift.guard.user._id, {
          title: 'Shift Ended',
          message: `Your shift at ${shift.site?.name || 'your site'} has ended, you have been checked out automatically.`,
          category: 'Attendance',
          targetScreen: 'Attendance',
        });
      }
    } else {
      shift.status = 'Completed';
      await shift.save();
    }
  }
};

const startAttendanceScheduler = () => {
  setInterval(() => {
    runAttendanceChecks().catch((err) => console.error('Attendance scheduler error:', err.message));
    runShiftEndChecks().catch((err) => console.error('Shift end scheduler error:', err.message));
  }, 60 * 1000);
};

module.exports = { startAttendanceScheduler };
