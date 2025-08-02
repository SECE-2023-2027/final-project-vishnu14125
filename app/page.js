import Link from 'next/link';
import { getTodayString, formatLongDisplayDate } from '../lib/dateUtils.js';
import connectDB from '../db/connection.js';
import Quote from '../db/Quote.js';
import QuoteCard from '../components/QuoteCard.js';
import styles from './page.module.css';

export default async function HomePage() {
  const today = getTodayString();
  
  let todayQuote = null;
  let quoteOfTheWeek = null;
  
  try {
    await connectDB();
    
    
    todayQuote = await Quote.findOne({ date: today }).lean();
    
     
    quoteOfTheWeek = await Quote.findOne({ isQuoteOfTheWeek: true }).lean();
    
     
    if (todayQuote) {
      todayQuote._id = todayQuote._id.toString();
    }
    if (quoteOfTheWeek) {
      quoteOfTheWeek._id = quoteOfTheWeek._id.toString();
    }
    
  } catch (error) {
    console.error('Error fetching quotes:', error);
  }

  return (
    <div className={styles.homePage}>
      <div className="container">
         
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Welcome to Quote Calendar
            </h1>
            <p className={styles.heroSubtitle}>
              Discover daily inspiration with carefully curated quotes. 
              Explore our calendar, save your favorites, and find wisdom for every day.
            </p>
            <div className={styles.heroActions}>
              <Link href="/calendar" className="btn btn-primary">
                View Calendar
              </Link>
              <Link href="/login" className="btn btn-secondary">
                Sign In
              </Link>
            </div>
          </div>
        </section>

         
        {todayQuote && (
          <section className={styles.todaySection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                Today's Quote
              </h2>
              <p className={styles.sectionSubtitle}>
                {formatLongDisplayDate(today)}
              </p>
            </div>
            <QuoteCard 
              quote={todayQuote} 
              featured={true}
              showDate={false}
            />
          </section>
        )}

         
        {quoteOfTheWeek && quoteOfTheWeek.date !== today && (
          <section className={styles.weekSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                 Quote of the Week
              </h2>
            </div>
            <QuoteCard 
              quote={quoteOfTheWeek} 
              featured={true}
              showActions={true}
            />
          </section>
        )}

        
        <section className={styles.features}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Features</h2>
            <p className={styles.sectionSubtitle}>
              Everything you need for daily inspiration
            </p>
          </div>
          
          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📅</div>
              <h3 className={styles.featureTitle}>Calendar View</h3>
              <p className={styles.featureDescription}>
                Browse quotes by date in an intuitive calendar interface. 
                See which days have quotes and navigate easily.
              </p>
              <Link href="/calendar" className={styles.featureLink}>
                View Calendar →
              </Link>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>❤️</div>
              <h3 className={styles.featureTitle}>Save Favorites</h3>
              <p className={styles.featureDescription}>
                Mark quotes as favorites and access them anytime. 
                Build your personal collection of inspiration.
              </p>
              <Link href="/favorites" className={styles.featureLink}>
                My Favorites →
              </Link>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🎨</div>
              <h3 className={styles.featureTitle}>Customize</h3>
              <p className={styles.featureDescription}>
                Personalize your experience with custom themes, 
                fonts, and display preferences.
              </p>
              <Link href="/customize" className={styles.featureLink}>
                Customize →
              </Link>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📱</div>
              <h3 className={styles.featureTitle}>Responsive</h3>
              <p className={styles.featureDescription}>
                Access your quotes anywhere, anytime. 
                Fully optimized for desktop, tablet, and mobile.
              </p>
            </div>
          </div>
        </section>

         
        <section className={styles.cta}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>Start Your Journey</h2>
            <p className={styles.ctaSubtitle}>
              Join thousands of users who find daily inspiration through Quote Calendar.
            </p>
            <div className={styles.ctaActions}>
              <Link href="/calendar" className="btn btn-primary">
                Explore Quotes
              </Link>
              <Link href="/login" className="btn btn-secondary">
                Create Account
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
