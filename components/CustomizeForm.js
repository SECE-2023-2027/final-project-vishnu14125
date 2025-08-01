'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import styles from './CustomizeForm.module.css';

export default function CustomizeForm() {
  const { data: session } = useSession();
  const [preferences, setPreferences] = useState({
    theme: 'light',
    fontSize: 'medium',
    fontFamily: 'serif'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Load preferences on component mount
  useEffect(() => {
    loadPreferences();
  }, []);

  // Apply preferences to document
  useEffect(() => {
    applyPreferences(preferences);
  }, [preferences]);

  const loadPreferences = () => {
    // Load from localStorage for immediate application
    const savedPrefs = localStorage.getItem('quoteCalendarPrefs');
    if (savedPrefs) {
      const parsed = JSON.parse(savedPrefs);
      setPreferences(parsed);
    }
    
    // TODO: Also load from server if user is logged in
  };

  const applyPreferences = (prefs) => {
    const root = document.documentElement;
    
    // Apply theme
    root.setAttribute('data-theme', prefs.theme);
    
    // Apply font size class
    document.body.className = document.body.className
      .replace(/font-(small|medium|large)/g, '')
      .trim();
    document.body.classList.add(`font-${prefs.fontSize}`);
    
    // Apply font family class
    document.body.className = document.body.className
      .replace(/font-(serif|sans|mono)/g, '')
      .trim();
    document.body.classList.add(`font-${prefs.fontFamily}`);
  };

  const handlePreferenceChange = (key, value) => {
    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);
    
    // Save to localStorage immediately
    localStorage.setItem('quoteCalendarPrefs', JSON.stringify(newPrefs));
  };

  const handleSave = async () => {
    if (!session) {
      setMessage('Sign in to save your preferences to your account');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        setMessage('Preferences saved successfully!');
      } else {
        setMessage('Failed to save preferences');
      }
    } catch (error) {
      setMessage('Error saving preferences');
    } finally {
      setLoading(false);
    }

    // Clear message after 3 seconds
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className={styles.customizeForm}>
      <div className={styles.preview}>
        <h3 className={styles.previewTitle}>Preview</h3>
        <div className={styles.previewCard}>
          <blockquote className={styles.previewQuote}>
            "The only way to do great work is to love what you do."
          </blockquote>
          <cite className={styles.previewAuthor}>Steve Jobs</cite>
        </div>
      </div>

      <div className={styles.controls}>
        {/* Theme Selection */}
        <div className={styles.controlGroup}>
          <label className={styles.controlLabel}>Theme</label>
          <div className={styles.radioGroup}>
            <label className={styles.radioOption}>
              <input
                type="radio"
                name="theme"
                value="light"
                checked={preferences.theme === 'light'}
                onChange={(e) => handlePreferenceChange('theme', e.target.value)}
              />
              <span className={styles.radioText}>
                ☀️ Light
              </span>
            </label>
            <label className={styles.radioOption}>
              <input
                type="radio"
                name="theme"
                value="dark"
                checked={preferences.theme === 'dark'}
                onChange={(e) => handlePreferenceChange('theme', e.target.value)}
              />
              <span className={styles.radioText}>
                🌙 Dark
              </span>
            </label>
            <label className={styles.radioOption}>
              <input
                type="radio"
                name="theme"
                value="auto"
                checked={preferences.theme === 'auto'}
                onChange={(e) => handlePreferenceChange('theme', e.target.value)}
              />
              <span className={styles.radioText}>
                🤖 Auto
              </span>
            </label>
          </div>
        </div>

        {/* Font Size Selection */}
        <div className={styles.controlGroup}>
          <label className={styles.controlLabel}>Font Size</label>
          <div className={styles.radioGroup}>
            <label className={styles.radioOption}>
              <input
                type="radio"
                name="fontSize"
                value="small"
                checked={preferences.fontSize === 'small'}
                onChange={(e) => handlePreferenceChange('fontSize', e.target.value)}
              />
              <span className={styles.radioText}>
                Small
              </span>
            </label>
            <label className={styles.radioOption}>
              <input
                type="radio"
                name="fontSize"
                value="medium"
                checked={preferences.fontSize === 'medium'}
                onChange={(e) => handlePreferenceChange('fontSize', e.target.value)}
              />
              <span className={styles.radioText}>
                Medium
              </span>
            </label>
            <label className={styles.radioOption}>
              <input
                type="radio"
                name="fontSize"
                value="large"
                checked={preferences.fontSize === 'large'}
                onChange={(e) => handlePreferenceChange('fontSize', e.target.value)}
              />
              <span className={styles.radioText}>
                Large
              </span>
            </label>
          </div>
        </div>

        {/* Font Family Selection */}
        <div className={styles.controlGroup}>
          <label className={styles.controlLabel}>Font Family</label>
          <div className={styles.radioGroup}>
            <label className={styles.radioOption}>
              <input
                type="radio"
                name="fontFamily"
                value="serif"
                checked={preferences.fontFamily === 'serif'}
                onChange={(e) => handlePreferenceChange('fontFamily', e.target.value)}
              />
              <span className={styles.radioText} style={{ fontFamily: 'var(--font-serif)' }}>
                Serif
              </span>
            </label>
            <label className={styles.radioOption}>
              <input
                type="radio"
                name="fontFamily"
                value="sans"
                checked={preferences.fontFamily === 'sans'}
                onChange={(e) => handlePreferenceChange('fontFamily', e.target.value)}
              />
              <span className={styles.radioText} style={{ fontFamily: 'var(--font-sans)' }}>
                Sans-serif
              </span>
            </label>
            <label className={styles.radioOption}>
              <input
                type="radio"
                name="fontFamily"
                value="mono"
                checked={preferences.fontFamily === 'mono'}
                onChange={(e) => handlePreferenceChange('fontFamily', e.target.value)}
              />
              <span className={styles.radioText} style={{ fontFamily: 'var(--font-mono)' }}>
                Monospace
              </span>
            </label>
          </div>
        </div>

        {/* Save Button */}
        {session && (
          <div className={styles.saveSection}>
            <button
              onClick={handleSave}
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Saving...' : 'Save to Account'}
            </button>
          </div>
        )}

        {/* Message */}
        {message && (
          <div className={`${styles.message} ${message.includes('Error') || message.includes('Failed') ? styles.error : styles.success}`}>
            {message}
          </div>
        )}

        {/* Info */}
        <div className={styles.info}>
          <p>
            Your preferences are automatically saved locally and will be applied immediately. 
            {session 
              ? ' Click "Save to Account" to sync across devices.' 
              : ' Sign in to save preferences to your account and sync across devices.'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
