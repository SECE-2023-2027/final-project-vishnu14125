'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import styles from './Header.module.css';

export default function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const isActive = (path) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/calendar', label: 'Calendar' },
    { href: '/favorites', label: 'Favorites', requireAuth: true },
    { href: '/customize', label: 'Customize', requireAuth: true },
  ];

  const adminNavItems = [
    { href: '/admin', label: 'Admin' },
  ];

  return (
    <header className={styles.header}>
      <div className="container">
        <nav className={styles.nav}>
          <Link href="/" className={styles.logo} onClick={closeMobileMenu}>
            📅 Quote Calendar
          </Link>

          {/* Desktop Navigation */}
          <ul className={styles.navLinks}>
            {navItems.map((item) => {
              if (item.requireAuth && !session) return null;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`${styles.navLink} ${isActive(item.href) ? styles.active : ''}`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
            {session?.user?.isAdmin && adminNavItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`${styles.navLink} ${isActive(item.href) ? styles.active : ''}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop User Menu */}
          <div className={styles.userMenu}>
            {status === 'loading' ? (
              <div className="spinner" />
            ) : session ? (
              <div className={styles.userInfo}>
                {session.user.image && (
                  <img
                    src={session.user.image}
                    alt={session.user.name}
                    className={styles.userAvatar}
                  />
                )}
                <span className={styles.userName}>{session.user.name}</span>
                {session.user.isAdmin && (
                  <span className={styles.adminBadge}>Admin</span>
                )}
                <button onClick={handleSignOut} className="btn btn-sm btn-secondary">
                  Sign Out
                </button>
              </div>
            ) : (
              <Link href="/login" className="btn btn-primary">
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className={styles.mobileToggle}
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </nav>

        {/* Mobile Menu */}
        <div className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.open : ''}`}>
          <ul className={styles.mobileNavLinks}>
            {navItems.map((item) => {
              if (item.requireAuth && !session) return null;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`${styles.navLink} ${isActive(item.href) ? styles.active : ''}`}
                    onClick={closeMobileMenu}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
            {session?.user?.isAdmin && adminNavItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`${styles.navLink} ${isActive(item.href) ? styles.active : ''}`}
                  onClick={closeMobileMenu}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className={styles.mobileUserMenu}>
            {status === 'loading' ? (
              <div className="spinner" />
            ) : session ? (
              <>
                <div className={styles.userInfo}>
                  {session.user.image && (
                    <img
                      src={session.user.image}
                      alt={session.user.name}
                      className={styles.userAvatar}
                    />
                  )}
                  <span className={styles.userName}>{session.user.name}</span>
                  {session.user.isAdmin && (
                    <span className={styles.adminBadge}>Admin</span>
                  )}
                </div>
                <button 
                  onClick={handleSignOut} 
                  className="btn btn-sm btn-secondary"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link href="/login" className="btn btn-primary" onClick={closeMobileMenu}>
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
