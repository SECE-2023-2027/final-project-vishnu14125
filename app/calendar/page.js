import CalendarGrid from '../../components/CalendarGrid.js';
import styles from './page.module.css';

export const metadata = {
  title: 'Calendar - Quote Calendar',
  description: 'Browse daily quotes in a beautiful calendar view. Click on any date to read the full quote.',
};

export default function CalendarPage() {
  return (
    <div className={styles.calendarPage}>
      <div className="container">
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>📅 Quote Calendar</h1>
          <p className={styles.pageDescription}>
            Explore daily quotes organized by date. Click on any day to read the full quote. 
            Future dates are locked until they arrive!
          </p>
        </div>

        <div className={styles.calendarContainer}>
          <CalendarGrid 
            showQuotePreviews={true}
            allowFutureNavigation={false}
          />
        </div>

        <div className={styles.pageFooter}>
          <div className={styles.legend}>
            <h3 className={styles.legendTitle}>Legend</h3>
            <div className={styles.legendItems}>
              <div className={styles.legendItem}>
                <span className={styles.legendDot} style={{ backgroundColor: 'var(--success-color)' }}></span>
                <span>Has Quote</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendDot} style={{ backgroundColor: 'var(--danger-color)' }}></span>
                <span>Your Favorite</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendStar}>⭐</span>
                <span>Quote of the Week</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendDot} style={{ backgroundColor: 'var(--primary-color)' }}></span>
                <span>Today</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
