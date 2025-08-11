/**
 * Date utilities for handling timezone-safe date operations
 * Prevents common timezone issues when working with date strings
 */

/**
 * Parse a date string as a local date to avoid timezone conversion issues
 * @param {string} dateString - Date string in format YYYY-MM-DD or ISO format
 * @returns {Date|null} - Date object in local timezone or null if invalid
 */
export const parseLocalDate = (dateString) => {
  if (!dateString) return null;

  try {
    // Extract just the date part if it's a full ISO string
    const datePart = dateString.split('T')[0];

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
      console.warn('Invalid date format:', dateString);
      return null;
    }

    // Create date in local timezone to avoid timezone shifts
    const [year, month, day] = datePart.split('-').map(Number);
    return new Date(year, month - 1, day); // month is 0-indexed
  } catch (error) {
    console.error('Error parsing date:', dateString, error);
    return null;
  }
};

/**
 * Format a date for API submission (always returns YYYY-MM-DD format)
 * @param {Date|string} date - Date object or date string
 * @returns {string} - Date string in YYYY-MM-DD format
 */
export const formatDateForAPI = (date) => {
  if (!date) return '';

  try {
    const dateObj = date instanceof Date ? date : parseLocalDate(date);
    if (!dateObj) return '';

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error formatting date for API:', date, error);
    return '';
  }
};

/**
 * Format a date for display in Thai locale
 * @param {Date|string} date - Date object or date string
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date string in Thai
 */
export const formatDateThai = (date, options = {}) => {
  if (!date) return '';

  try {
    const dateObj = date instanceof Date ? date : parseLocalDate(date);
    if (!dateObj) return '';

    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    };

    return dateObj.toLocaleDateString('th-TH', {...defaultOptions, ...options});
  } catch (error) {
    console.error('Error formatting date in Thai:', date, error);
    return '';
  }
};

/**
 * Get Thai day name from date
 * @param {Date|string} date - Date object or date string
 * @returns {string} - Thai day name
 */
export const getThaiDayName = (date) => {
  if (!date) return '';

  try {
    const dateObj = date instanceof Date ? date : parseLocalDate(date);
    if (!dateObj) return '';

    const thaiDayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    return thaiDayNames[dateObj.getDay()];
  } catch (error) {
    console.error('Error getting Thai day name:', date, error);
    return '';
  }
};

/**
 * Check if a date is weekend (Saturday or Sunday)
 * @param {Date|string} date - Date object or date string
 * @returns {boolean} - True if weekend, false otherwise
 */
export const isWeekend = (date) => {
  if (!date) return false;

  try {
    const dateObj = date instanceof Date ? date : parseLocalDate(date);
    if (!dateObj) return false;

    const dayOfWeek = dateObj.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6
  } catch (error) {
    console.error('Error checking weekend:', date, error);
    return false;
  }
};

/**
 * Add days to a date safely
 * @param {Date|string} date - Date object or date string
 * @param {number} days - Number of days to add (can be negative)
 * @returns {Date|null} - New date object or null if error
 */
export const addDays = (date, days) => {
  if (!date || typeof days !== 'number') return null;

  try {
    const dateObj = date instanceof Date ? new Date(date) : parseLocalDate(date);
    if (!dateObj) return null;

    dateObj.setDate(dateObj.getDate() + days);
    return dateObj;
  } catch (error) {
    console.error('Error adding days to date:', date, days, error);
    return null;
  }
};

/**
 * Create a date range array between two dates
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {Date[]} - Array of date objects
 */
export const createDateRange = (startDate, endDate) => {
  const dates = [];

  try {
    const start = startDate instanceof Date ? startDate : parseLocalDate(startDate);
    const end = endDate instanceof Date ? endDate : parseLocalDate(endDate);

    if (!start || !end) return dates;
    if (start > end) return dates;

    const currentDate = new Date(start);
    while (currentDate <= end) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  } catch (error) {
    console.error('Error creating date range:', startDate, endDate, error);
    return dates;
  }
};

/**
 * Validate date string format
 * @param {string} dateString - Date string to validate
 * @returns {boolean} - True if valid format
 */
export const isValidDateString = (dateString) => {
  if (!dateString || typeof dateString !== 'string') return false;

  // Check format YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString.split('T')[0])) return false;

  // Check if date is actually valid
  const date = parseLocalDate(dateString);
  return date !== null && !isNaN(date.getTime());
};

const dateUtils = {
  parseLocalDate,
  formatDateForAPI,
  formatDateThai,
  getThaiDayName,
  isWeekend,
  addDays,
  createDateRange,
  isValidDateString,
};

export default dateUtils;
