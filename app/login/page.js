import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/authConfig.js';
import LoginForm from '../../components/LoginForm.js';
import styles from './page.module.css';

export const metadata = {
  title: 'Sign In - Quote Calendar',
  description: 'Sign in to your Quote Calendar account to save favorites and customize your experience.',
};

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  
  // Redirect if already logged in
  if (session) {
    redirect('/');
  }

  return (
    <div className={styles.loginPage}>
      <div className="container">
        <div className={styles.loginContainer}>
          <div className={styles.loginHeader}>
            <h1 className={styles.loginTitle}>Welcome Back</h1>
            <p className={styles.loginSubtitle}>
              Sign in to access your favorites and personalize your quote experience
            </p>
          </div>
          
          <LoginForm />
          
          <div className={styles.loginFooter}>
            <p className={styles.footerText}>
              By signing in, you agree to our terms of service and privacy policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
