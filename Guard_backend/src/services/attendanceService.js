const Shift = require('../models/Shift');
const GuardRequest = require('../models/GuardRequest');
const User = require('../models/User');
const { notifyUser } = require('./notificationService');
const { emitToAgency } = require('../socket');
const { getShiftEndDateTime } = require('../utils/shiftTime');


const notifyAgencyAndClient = async (shift, { title, message, category = 'Duty' }) => {
  const agencyStaff = await User.find({
    agency: shift.agency,
    role: { $in: ['agency_admin', 'operations_manager', 'supervisor'] },
  });
  for (const staff of agencyStaff) {
    await notifyUser(staff._id, {
      title,
      message,
      category,
      targetScreen: 'ShiftDetails',
      targetParams: { shiftId: shift._id },
    });
  }
  if (shift.client) {
    await notifyUser(shift.client, {
      title,
      message,
      category,
      targetScreen: 'ShiftDetails',
      targetParams: { shiftId: shift._id },
    });
  }
};

const performCheckout = async (attendance, shift, { time, latitude, longitude, address, checkoutType }) => {
  attendance.checkOut = { time, latitude, longitude, address };
  const sessionSeconds = Math.max(0, Math.floor((time - attendance.checkIn.time) / 1000));
  attendance.workingSeconds = (attendance.workingSeconds || 0) + sessionSeconds;
  attendance.checkoutType = checkoutType;
  attendance.locationStatus = 'Inside';
  attendance.outiseSince = null;
  await attendance.save();

  const shiftEnd = getShiftEndDateTime(shift);
  if (!shiftEnd || time >= shiftEnd) {
    shift.status = 'Completed';
    await shift.save();
  }

  if (shift.guardRequest) {
    const request = await GuardRequest.findById(shift.guardRequest);
    if (request) {
      const activeShiftsLeft = await Shift.countDocuments({
        guardRequest: request._id,
        status: { $in: ['Upcoming', 'Active'] },
      });
      if (activeShiftsLeft === 0) {
        request.status = 'Completed';
        request.timeline.push({ status: 'Completed', note: 'Guard duty completed' });
        await request.save();
        if (request.client) {
          await notifyUser(request.client, {
            title: 'Service Completed',
            message: 'Your Security guard service is Completed. please rate the service.',
            category: 'Requests',
            targetScreen: 'ServiceSummary',
            targetParams: { requestId: request._id },
          });
        }
      }
    }
  }

  return attendance;
};

module.exports = { notifyAgencyAndClient, performCheckout };
