'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from './LoginForm.module.css';

export default function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState('signin');  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
         
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Registration failed');
          setLoading(false);
          return;
        }

         
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.error) {
          setError('Registration successful, but sign-in failed. Please try signing in manually.');
        } else {
          router.push('/');
        }
      } else {
         
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.error) {
          setError('Invalid email or password');
        } else {
          router.push('/');
        }
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    setLoading(true);
    try {
      await signIn('github', { callbackUrl: '/' });
    } catch (error) {
      setError('GitHub sign-in failed. Please try again.');
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setError('');
    setFormData({
      email: '',
      password: '',
      name: '',
      confirmPassword: ''
    });
  };

  return (
    <div className={styles.loginForm}>
       
      <button
        onClick={handleGitHubSignIn}
        disabled={loading}
        className={`${styles.githubBtn} ${loading ? styles.loading : ''}`}
      >
        {loading ? (
          <div className="spinner" />
        ) : (
          <>
            <svg className={styles.githubIcon} viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Continue with GitHub
          </>
        )}
      </button>

      <div className={styles.divider}>
        <span className={styles.dividerText}>or</span>
      </div>

       
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      
      <form onSubmit={handleCredentialsSubmit} className={styles.credentialsForm}>
        {mode === 'signup' && (
          <div className="form-group">
            <label htmlFor="name" className="form-label">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="form-input"
              required
              disabled={loading}
              placeholder="Enter your full name"
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="form-input"
            required
            disabled={loading}
            placeholder="Enter your email"
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="form-input"
            required
            disabled={loading}
            placeholder="Enter your password"
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            minLength={6}
          />
        </div>

        {mode === 'signup' && (
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="form-input"
              required
              disabled={loading}
              placeholder="Confirm your password"
              autoComplete="new-password"
              minLength={6}
            />
          </div>
        )}

        <button
          type="submit"
          className={`btn btn-primary ${styles.submitBtn} ${loading ? styles.loading : ''}`}
          disabled={loading}
        >
          {loading ? (
            <div className="spinner" />
          ) : (
            mode === 'signup' ? 'Create Account' : 'Sign In'
          )}
        </button>
      </form>

       
      <div className={styles.toggleMode}>
        <p>
          {mode === 'signin' ? "Don't have an account?" : "Already have an account?"}
          <button
            type="button"
            onClick={toggleMode}
            className={styles.toggleBtn}
            disabled={loading}
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
