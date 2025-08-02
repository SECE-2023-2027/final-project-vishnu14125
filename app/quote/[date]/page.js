import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { isValidDate, isFuture, formatLongDisplayDate, addDays, subtractDays } from '../../../lib/dateUtils.js';
import connectDB from '../../../db/connection.js';
import Quote from '../../../db/Quote.js';
import QuoteCard from '../../../components/QuoteCard.js';
import styles from './page.module.css';

export async function generateMetadata({ params }) {
  const { date } = params;
  
  if (!isValidDate(date)) {
    return {
      title: 'Invalid Date - Quote Calendar',
    };
  }

  try {
    await connectDB();
    const quote = await Quote.findOne({ date }).lean();
    
    if (!quote) {
      return {
        title: `No Quote for ${formatLongDisplayDate(date)} - Quote Calendar`,
      };
    }

    return {
      title: `Quote for ${formatLongDisplayDate(date)} - Quote Calendar`,
      description: `"${quote.text}" - ${quote.author}`,
      openGraph: {
        title: `Quote for ${formatLongDisplayDate(date)}`,
        description: `"${quote.text}" - ${quote.author}`,
        type: 'article',
      },
    };
  } catch (error) {
    return {
      title: 'Quote Calendar',
    };
  }
}

import { getSession } from '../../../auth/sessionUtils.js';
import User from '../../../db/User.js';

export default async function QuoteDetailPage({ params }) {
  const { date } = params;
  const session = await getSession();

  // Validate date format
  if (!isValidDate(date)) {
    notFound();
  }

  // Block future dates
  if (isFuture(date)) {
    redirect('/calendar');
  }

  let quote = null;
  let error = null;
  let isFavorite = false;

  try {
    await connectDB();
    quote = await Quote.findOne({ date }).lean();
    
    if (quote) {
      quote._id = quote._id.toString();
      if (session) {
        const user = await User.findById(session.user.id).lean();
        if (user) {
          isFavorite = user.favorites.includes(date);
        }
      }
    }
  } catch (err) {
    console.error('Error fetching quote:', err);
    error = 'Failed to load quote';
  }

  // Calculate navigation dates
  const prevDate = subtractDays(date, 1);
  const nextDate = addDays(date, 1);
  const isNextFuture = isFuture(nextDate);

  return (
    <div className={styles.quotePage}>
      <div className="container">
        {/* Navigation */}
        <nav className={styles.quoteNav}>
          <Link href={`/quote/${prevDate}`} className={styles.navBtn}>
            ← Previous Day
          </Link>
          <Link href="/calendar" className={styles.navBtn}>
            📅 Calendar
          </Link>
          {!isNextFuture && (
            <Link href={`/quote/${nextDate}`} className={styles.navBtn}>
              Next Day →
            </Link>
          )}
        </nav>

        {/* Page Header */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>
            Quote for {formatLongDisplayDate(date)}
          </h1>
          {quote?.isQuoteOfTheWeek && (
            <div className={styles.weekBadge}>
              ⭐ Quote of the Week
            </div>
          )}
        </div>

        {/* Quote Content */}
        {error ? (
          <div className={styles.error}>
            <h2>Error Loading Quote</h2>
            <p>{error}</p>
            <Link href="/calendar" className="btn btn-primary">
              Return to Calendar
            </Link>
          </div>
        ) : quote ? (
          <div className={styles.quoteContainer}>
            <QuoteCard 
              quote={quote} 
              showDate={false}
              featured={quote.isQuoteOfTheWeek}
              showActions={true}
              isInitialFavorite={isFavorite}
            />
          </div>
        ) : (
          <div className={styles.noQuote}>
            <div className={styles.noQuoteIcon}>📝</div>
            <h2>No Quote Found</h2>
            <p>
              There's no quote available for {formatLongDisplayDate(date)} yet.
            </p>
            <div className={styles.noQuoteActions}>
              <Link href="/calendar" className="btn btn-primary">
                Browse Calendar
              </Link>
              <Link href="/" className="btn btn-secondary">
                Go Home
              </Link>
            </div>
          </div>
        )}

        {/* Additional Navigation */}
        <div className={styles.bottomNav}>
          <div className={styles.navGroup}>
            <Link href={`/quote/${prevDate}`} className="btn btn-secondary">
              ← {formatLongDisplayDate(prevDate)}
            </Link>
          </div>
          <div className={styles.navGroup}>
            <Link href="/calendar" className="btn btn-primary">
              📅 View Calendar
            </Link>
          </div>
          {!isNextFuture && (
            <div className={styles.navGroup}>
              <Link href={`/quote/${nextDate}`} className="btn btn-secondary">
                {formatLongDisplayDate(nextDate)} →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
