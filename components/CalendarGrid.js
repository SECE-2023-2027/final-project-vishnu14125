'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  getCalendarDates, 
  getNavigationDates, 
  formatDate, 
  getTodayString,
  isToday,
  isFuture
} from '../lib/dateUtils.js';
import { truncateQuote } from '../lib/quoteUtils.js';
import styles from './CalendarGrid.module.css';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function CalendarGrid({ 
  initialYear = new Date().getFullYear(),
  initialMonth = new Date().getMonth(),
  onDateSelect,
  showQuotePreviews = true,
  allowFutureNavigation = false
}) {
  const router = useRouter();
  const [currentYear, setCurrentYear] = useState(initialYear);
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [quotes, setQuotes] = useState({});
  const [favorites, setFavorites] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const todayString = getTodayString();
  const currentDate = new Date();

   
  useEffect(() => {
    fetchQuotesForMonth(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  const fetchQuotesForMonth = async (year, month) => {
    setLoading(true);
    setError(null);
    
    try {
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);
      
      const response = await fetch(
        `/api/quotes?startDate=${formatDate(startDate)}&endDate=${formatDate(endDate)}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch quotes');
      }
      
      const data = await response.json();
      
       
      const quotesMap = {};
      data.quotes.forEach(quote => {
        quotesMap[quote.date] = quote;
      });
      
      setQuotes(quotesMap);
      
      
      try {
        const favResponse = await fetch('/api/favorites');
        if (favResponse.ok) {
          const favData = await favResponse.json();
          setFavorites(new Set(favData.favorites));
        }
      } catch (favError) {
         
        setFavorites(new Set());
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousMonth = () => {
    const { year, month } = getNavigationDates(currentYear, currentMonth).prev;
    setCurrentYear(year);
    setCurrentMonth(month);
  };

  const handleNextMonth = () => {
    const { year, month } = getNavigationDates(currentYear, currentMonth).next;
    
    
    if (!allowFutureNavigation) {
      const nextMonthDate = new Date(year, month, 1);
      const currentMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      
      if (nextMonthDate > currentMonthDate) {
        return;
      }
    }
    
    setCurrentYear(year);
    setCurrentMonth(month);
  };

  const handleToday = () => {
    setCurrentYear(currentDate.getFullYear());
    setCurrentMonth(currentDate.getMonth());
  };

  const handleDateClick = (dateString, isCurrentMonth, isDisabled) => {
    if (isDisabled || !isCurrentMonth) return;
    
    if (onDateSelect) {
      onDateSelect(dateString);
    } else {
      router.push(`/quote/${dateString}`);
    }
  };

  const renderCalendarHeader = () => {
    const canGoNext = allowFutureNavigation || 
      (currentYear < currentDate.getFullYear() || 
       (currentYear === currentDate.getFullYear() && currentMonth < currentDate.getMonth()));

    return (
      <div className={styles.calendarHeader}>
        <h2 className={styles.calendarTitle}>
          {MONTHS[currentMonth]} {currentYear}
        </h2>
        <div className={styles.calendarNav}>
          <button
            onClick={handlePreviousMonth}
            className={styles.navBtn}
            aria-label="Previous month"
          >
            ← Prev
          </button>
          <button
            onClick={handleToday}
            className={`${styles.navBtn} ${styles.todayBtn}`}
            aria-label="Go to today"
          >
            Today
          </button>
          <button
            onClick={handleNextMonth}
            className={styles.navBtn}
            disabled={!canGoNext}
            aria-label="Next month"
          >
            Next →
          </button>
        </div>
      </div>
    );
  };

  const renderDayHeaders = () => {
    return DAYS_OF_WEEK.map(day => (
      <div key={day} className={styles.dayHeader}>
        {day}
      </div>
    ));
  };

  const renderCalendarDays = () => {
    const calendarDates = getCalendarDates(currentYear, currentMonth);
    
    return calendarDates.map(({ date, isCurrentMonth, day }) => {
      const quote = quotes[date];
      const isToday_ = isToday(date);
      const isFuture_ = isFuture(date);
      const isDisabled = isFuture_ || !isCurrentMonth;
      const isFavorite = favorites.has(date);
      
      const cellClasses = [
        styles.dayCell,
        isToday_ && styles.today,
        !isCurrentMonth && styles.otherMonth,
        isDisabled && styles.disabled,
        quote && styles.hasQuote,
        quote?.isQuoteOfTheWeek && styles.quoteOfWeek,
      ].filter(Boolean).join(' ');

      return (
        <div
          key={date}
          className={cellClasses}
          onClick={() => handleDateClick(date, isCurrentMonth, isDisabled)}
          role="button"
          tabIndex={isDisabled ? -1 : 0}
          aria-label={`${date}${quote ? ` - ${quote.author}` : ''}`}
        >
          <span className={styles.dayNumber}>{day}</span>
          
          {quote && showQuotePreviews && (
            <>
              <div className={styles.dayQuote}>
                {truncateQuote(quote.text, 50)}
              </div>
              <div className={styles.dayAuthor}>
                {quote.author}
              </div>
            </>
          )}
          
          <div className={styles.dayIndicators}>
            {quote && (
              <div 
                className={`${styles.indicator} ${styles.quote}`}
                title="Has quote"
              />
            )}
            {isFavorite && (
              <div 
                className={`${styles.indicator} ${styles.favorite}`}
                title="Favorite"
              />
            )}
            {quote?.isQuoteOfTheWeek && (
              <div 
                className={`${styles.indicator} ${styles.weekQuote}`}
                title="Quote of the week"
              />
            )}
          </div>
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className={styles.calendar}>
        <div className={styles.loading}>
          <div className="spinner" />
          <span style={{ marginLeft: '0.5rem' }}>Loading calendar...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.calendar}>
        <div className={styles.error}>
          <p>Error loading calendar: {error}</p>
          <button 
            onClick={() => fetchQuotesForMonth(currentYear, currentMonth)}
            className="btn btn-primary btn-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.calendar}>
      {renderCalendarHeader()}
      
      <div className={styles.calendarGrid}>
        {renderDayHeaders()}
        {renderCalendarDays()}
      </div>
      
      <div className={styles.legend} style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        <p>
          <span style={{ color: 'var(--success-color)' }}>●</span> Has quote • 
          <span style={{ color: 'var(--danger-color)' }}> ●</span> Favorite • 
          <span style={{ color: 'var(--warning-color)' }}> ⭐</span> Quote of the week
        </p>
      </div>
    </div>
  );
}
