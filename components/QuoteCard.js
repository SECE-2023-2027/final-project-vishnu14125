'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { formatDisplayDate, isToday } from '../lib/dateUtils.js';
import { truncateQuote, getQuotePermalink } from '../lib/quoteUtils.js';
import styles from './QuoteCard.module.css';

export default function QuoteCard({ 
  quote, 
  showDate = true, 
  showActions = true,
  compact = false,
  featured = false,
  noBorder = false,
  truncate = false,
  maxLength = 150,
  isInitialFavorite = false,
  onFavoriteToggle,
  loading = false 
}) {
  const { data: session } = useSession();
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(isInitialFavorite);

  if (loading) {
    return (
      <div className={`${styles.quoteCard} ${styles.skeleton} ${compact ? styles.compact : ''}`}>
        <div className={styles.quoteHeader}>
          <div className={styles.quoteDate}></div>
        </div>
        <div className={styles.quoteText}></div>
        <div className={styles.quoteAuthor}></div>
      </div>
    );
  }

  if (!quote) {
    return null;
  }

  const handleFavoriteToggle = async () => {
    if (!session || favoriteLoading) return;
    
    setFavoriteLoading(true);
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date: quote.date }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsFavorite(data.isFavorite);
        if (onFavoriteToggle) {
          onFavoriteToggle(quote.date, data.isFavorite);
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Quote of the Day',
      text: `"${quote.text}" - ${quote.author}`,
      url: `${window.location.origin}${getQuotePermalink(quote.date)}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
      }
    } else {
      navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
    }
  };

  const cardClasses = [
    styles.quoteCard,
    compact && styles.compact,
    featured && styles.featured,
    noBorder && styles.noBorder,
  ].filter(Boolean).join(' ');

  const displayText = truncate ? truncateQuote(quote.text, maxLength) : quote.text;
  const canEdit = session && (session.user.isAdmin || isToday(quote.date));

  return (
    <article className={cardClasses}>
      {showDate && (
        <div className={styles.quoteHeader}>
          <div className={styles.quoteDate}>
            {formatDisplayDate(quote.date)}
            {quote.isQuoteOfTheWeek && ' 🌟'}
          </div>
          {showActions && session && (
            <div className={styles.quoteActions}>
              <button
                onClick={handleFavoriteToggle}
                className={`${styles.actionBtn} ${isFavorite ? styles.active : ''} ${favoriteLoading ? styles.loading : ''}`}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                disabled={favoriteLoading}
              >
                {favoriteLoading ? '⏳' : isFavorite ? '❤️' : '🤍'}
              </button>
              <button
                onClick={handleShare}
                className={styles.actionBtn}
                title="Share quote"
              >
                📤
              </button>
              {canEdit && (
                <Link
                  href={`/admin/quotes/edit/${quote.date}`}
                  className={styles.actionBtn}
                  title="Edit quote"
                >
                  ✏️
                </Link>
              )}
            </div>
          )}
        </div>
      )}

      <blockquote className={styles.quoteText}>
        {displayText}
      </blockquote>

      <cite className={styles.quoteAuthor}>
        {quote.author}
      </cite>

      <div className={styles.quoteFooter}>
        {quote.category && (
          <span className={styles.quoteCategory}>
            {quote.category}
          </span>
        )}
        
        <div className={styles.quoteLinks}>
          <Link 
            href={getQuotePermalink(quote.date)}
            className={styles.quoteLink}
            title="View full quote"
          >
            🔗 Permalink
          </Link>
        </div>
      </div>
    </article>
  );
}
