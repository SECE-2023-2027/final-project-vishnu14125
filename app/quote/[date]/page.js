'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { isValidDate, isFuture, formatLongDisplayDate, addDays, subtractDays } from '../../../lib/dateUtils.js';
import QuoteCard from '../../../components/QuoteCard.js';
import styles from './page.module.css';
import { useSession } from 'next-auth/react';

export default function QuoteDetailPage({ params }) {
  const { date } = params;
  const { data: session } = useSession();
  const [quote, setQuote] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isValidDate(date)) {
      notFound();
    }
    if (isFuture(date)) {
      redirect('/calendar');
    }

    const fetchQuote = async () => {
      try {
        const response = await fetch(`/api/quotes?date=${date}`);
        if (!response.ok) {
          throw new Error('Failed to fetch quote');
        }
        const data = await response.json();
        if (data.quotes.length > 0) {
          setQuote(data.quotes[0]);
          if (session) {
            const favResponse = await fetch('/api/favorites');
            if (favResponse.ok) {
              const favData = await favResponse.json();
              setIsFavorite(favData.favorites.includes(date));
            }
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, [date, session]);

  const handleFavoriteToggle = (date, newIsFavorite) => {
    setIsFavorite(newIsFavorite);
  };

  const prevDate = subtractDays(date, 1);
  const nextDate = addDays(date, 1);
  const isNextFuture = isFuture(nextDate);

  return (
    <div className={styles.quotePage}>
      <div className="container">
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

        {loading ? (
          <QuoteCard loading={true} />
        ) : error ? (
          <div className={styles.error}>
            <h2>Error Loading Quote</h2>
            <p>{error}</p>
          </div>
        ) : quote ? (
          <div className={styles.quoteContainer}>
            <QuoteCard 
              quote={quote} 
              showDate={false}
              featured={quote.isQuoteOfTheWeek}
              showActions={true}
              isInitialFavorite={isFavorite}
              onFavoriteToggle={handleFavoriteToggle}
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
