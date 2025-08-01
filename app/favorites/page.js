import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/authConfig.js';
import connectDB from '../../db/connection.js';
import User from '../../db/User.js';
import Quote from '../../db/Quote.js';
import QuoteCard from '../../components/QuoteCard.js';
import styles from './page.module.css';

export const metadata = {
  title: 'My Favorites - Quote Calendar',
  description: 'View and manage your favorite quotes from Quote Calendar.',
};

export default async function FavoritesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  let favoriteQuotes = [];
  let error = null;

  try {
    await connectDB();
    
    const user = await User.findById(session.user.id);
    if (user && user.favorites.length > 0) {
      favoriteQuotes = await Quote.find({
        date: { $in: user.favorites }
      }).sort({ date: -1 }).lean();
      
      // Convert MongoDB ObjectIds to strings
      favoriteQuotes = favoriteQuotes.map(quote => ({
        ...quote,
        _id: quote._id.toString(),
      }));
    }
  } catch (err) {
    console.error('Error fetching favorites:', err);
    error = 'Failed to load your favorite quotes';
  }

  return (
    <div className={styles.favoritesPage}>
      <div className="container">
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>❤️ My Favorite Quotes</h1>
          <p className={styles.pageDescription}>
            {favoriteQuotes.length > 0 
              ? `You have ${favoriteQuotes.length} favorite quote${favoriteQuotes.length === 1 ? '' : 's'}`
              : "You haven't saved any favorite quotes yet"
            }
          </p>
        </div>

        {error ? (
          <div className={styles.error}>
            <h2>Error Loading Favorites</h2>
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              Try Again
            </button>
          </div>
        ) : favoriteQuotes.length > 0 ? (
          <div className={styles.quotesGrid}>
            {favoriteQuotes.map(quote => (
              <QuoteCard
                key={quote.date}
                quote={quote}
                showDate={true}
                showActions={true}
                compact={true}
                featured={quote.isQuoteOfTheWeek}
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
