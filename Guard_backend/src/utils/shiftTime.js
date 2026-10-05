const parseShiftTime = (date, timeStr) => {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i.exec((timeStr || '').trim());
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = match[3] ? match[3].toUpperCase() : null;
  if (meridiem === 'PM' && hours !== 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
};

const getShiftStartDateTime = (shift) => parseShiftTime(shift.date, shift.startTime);
const getShiftEndDateTime = (shift) => {
  const start = parseShiftTime(shift.date, shift.startTime);
  const end = parseShiftTime(shift.date, shift.endTime);
  if (start && end && end.getTime() <= start.getTime()) {
    return new Date(end.getTime() + 24 * 60 * 60 * 1000);
  }
  return end;
};

const toDayKey = (date) => new Date(date).toISOString().slice(0, 10);


const localDayKey = (d) => {
  const dt = new Date(d);
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${dt.getFullYear()}-${mm}-${dd}`;
};

const addDaysToKey = (key, days) => {
  const d = new Date(`${key}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

const getShiftInterval = (date, startTime, endTime) => {
  const start = parseShiftTime(date, startTime);
  let end = parseShiftTime(date, endTime);
  if (!start || !end) return null;
  if (end.getTime() <= start.getTime()) {
    end = new Date(end.getTime() + 24 * 60 * 60 * 1000);
  }
  return { start, end };
};

const intervalsOverlap = (a, b) =>
  a.start.getTime() < b.end.getTime() && b.start.getTime() < a.end.getTime();

const buildWindow = ({ date, startTime, endTime } = {}) => {
  if (date && startTime && endTime) {
    const iv = getShiftInterval(date, startTime, endTime);
    if (iv) {
      const startKey = toDayKey(date);
      const crossesMidnight = iv.end.getTime() - iv.start.getTime() > 0 &&
        (parseShiftTime(date, endTime).getTime() <= iv.start.getTime());
      return {
        ...iv,
        dayKeys: crossesMidnight ? [startKey, addDaysToKey(startKey, 1)] : [startKey],
      };
    }
  }

  if (date) {
    const start = parseShiftTime(date, '12:00 AM');
    if (start) {
      return {
        start,
        end: new Date(start.getTime() + 24 * 60 * 60 * 1000),
        dayKeys: [toDayKey(date)],
      };
    }
  }

  const now = new Date();
  return {
    start: now,
    end: new Date(now.getTime() + 60 * 1000),
    dayKeys: [localDayKey(now)],
  };
};

module.exports = {
  getShiftStartDateTime,
  getShiftEndDateTime,
  getShiftInterval,
  intervalsOverlap,
  buildWindow,
  toDayKey,
  localDayKey,
};
