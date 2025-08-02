'use client';

import { useState, useEffect } from 'react';
import { redirect } from 'next/navigation';
import { useSession } from 'next-auth/react';
import QuoteCard from '../../components/QuoteCard.js';
import styles from './page.module.css';

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const [favoriteQuotes, setFavoriteQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/login');
    }

    if (status === 'authenticated') {
      const fetchFavorites = async () => {
        try {
          const response = await fetch('/api/favorites');
          if (!response.ok) {
            throw new Error('Failed to fetch favorites');
          }
          const data = await response.json();
          setFavoriteQuotes(data.quotes);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchFavorites();
    }
  }, [status]);

  const handleFavoriteToggle = (date, isFavorite) => {
    if (!isFavorite) {
      setFavoriteQuotes(prev => prev.filter(q => q.date !== date));
    }
  };

  return (
    <div className={styles.favoritesPage}>
      <div className="container">
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>My Favorite Quotes</h1>
          <p className={styles.pageDescription}>
            {loading 
              ? 'Loading...' 
              : favoriteQuotes.length > 0 
              ? `You have ${favoriteQuotes.length} favorite quote${favoriteQuotes.length === 1 ? '' : 's'}`
              : "You haven't saved any favorite quotes yet"
            }
          </p>
        </div>

        {loading ? (
          <div className={styles.quotesGrid}>
            {[...Array(3)].map((_, i) => (
              <QuoteCard key={i} loading={true} />
            ))}
          </div>
        ) : error ? (
          <div className={styles.error}>
            <h2>Error Loading Favorites</h2>
            <p>{error}</p>
          </div>
        ) : favoriteQuotes.length > 0 ? (
          <div className={styles.quotesGrid}>
            {favoriteQuotes.map(quote => (
              <QuoteCard 
                key={quote._id}
                quote={quote} 
                isInitialFavorite={true}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>💭</div>
            <h2>No Favorites Yet</h2>
            <p>
              Start building your collection by adding quotes to your favorites. 
              Click the heart icon on any quote to save it here.
            </p>
            <div className={styles.emptyActions}>
              <a href="/calendar" className="btn btn-primary">
                📅 Browse Calendar
              </a>
              <a href="/" className="btn btn-secondary">
                🏠 Go Home
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
