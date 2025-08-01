/**
 * Date utility functions for the Quote Calendar app
 */

/**
 * Format date to YYYY-MM-DD string
 */
export function formatDate(date) {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Get today's date as YYYY-MM-DD string
 */
export function getTodayString() {
  return formatDate(new Date());
}

/**
 * Check if a date string is today
 */
export function isToday(dateString) {
  return dateString === getTodayString();
}

/**
 * Check if a date string is in the future
 */
export function isFuture(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today
  return date > today;
}

/**
 * Check if a date string is in the past
 */
export function isPast(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today
  return date < today;
}

/**
 * Check if a date string is valid
 */
export function isValidDate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date) && formatDate(date) === dateString;
}

/**
 * Parse date string to Date object
 */
export function parseDate(dateString) {
  return new Date(dateString + 'T00:00:00');
}

/**
 * Format date for display (e.g., "January 15, 2024")
 */
export function formatDisplayDate(dateString) {
  const date = parseDate(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format date for display with day name (e.g., "Monday, January 15, 2024")
 */
export function formatLongDisplayDate(dateString) {
  const date = parseDate(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Get day name from date string (e.g., "Monday")
 */
export function getDayName(dateString) {
  const date = parseDate(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

/**
 * Get month name from date string (e.g., "January")
 */
export function getMonthName(dateString) {
  const date = parseDate(dateString);
  return date.toLocaleDateString('en-US', { month: 'long' });
}

/**
 * Get dates for a calendar month
 */
export function getCalendarDates(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  
  // Start from the Sunday before the first day of the month
  startDate.setDate(startDate.getDate() - startDate.getDay());
  
  const dates = [];
  const currentDate = new Date(startDate);
  
  // Generate 42 days (6 weeks) for the calendar grid
  for (let i = 0; i < 42; i++) {
    dates.push({
      date: formatDate(currentDate),
      isCurrentMonth: currentDate.getMonth() === month,
      day: currentDate.getDate(),
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
}

/**
 * Get navigation dates for calendar
 */
export function getNavigationDates(year, month) {
  const prev = month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 };
  const next = month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 };
  
  return { prev, next };
}

/**
 * Get days difference between two dates
 */
export function getDaysDifference(date1, date2) {
  const d1 = parseDate(date1);
  const d2 = parseDate(date2);
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Add days to a date string
 */
export function addDays(dateString, days) {
  const date = parseDate(dateString);
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

/**
 * Subtract days from a date string
 */
export function subtractDays(dateString, days) {
  return addDays(dateString, -days);
}
