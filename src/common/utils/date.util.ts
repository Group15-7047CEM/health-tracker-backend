/**
 * Days adder util
 * @param {Date} date
 * @param {number} days
 *
 * @return {Date} addedDate
 */
export function daysAdderUtil(date, days) {
  const c = new Date(date);
  c.setDate(c.getDate() + days);
  return c.toJSON();
}

/**
 * Truncates upto seconds
 * @param {Date} date
 * @returns {Date} datetime
 */
export function truncateUptoSeconds(date) {
  const c = new Date(date);
  c.setSeconds(0, 0);
  return c.toJSON();
}

/**
 * Gets seconds difference from midnight
 * @param date
 * @returns {number} secondsDiff
 */
export function getSecondsDiffFromMidnight(date) {
  const o: any = new Date(date);
  const c: any = new Date(date);
  c.setHours(0, 0, 0);
  return (o - c) / 1000;
}

export function getDBTruncValue(range) {
  const ranges = {
    week: 'day',
    month: 'week',
  };

  return ranges[range];
}
