import { Inter } from 'next/font/google';
import SessionProvider from '../components/SessionProvider.js';
import Header from '../components/Header.js';
import '../styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Quote Calendar - Daily Inspirational Quotes',
  description: 'Discover daily inspirational quotes organized in a beautiful calendar format. Save your favorites and customize your experience.',
  keywords: 'quotes, calendar, inspiration, daily quotes, motivation',
  authors: [{ name: 'Quote Calendar App' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Quote Calendar - Daily Inspirational Quotes',
    description: 'Discover daily inspirational quotes organized in a beautiful calendar format.',
    type: 'website',
    locale: 'en_US',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <div id="app-root">
            <Header />
            <main>{children}</main>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
