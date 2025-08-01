import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/authConfig.js';
import CustomizeForm from '../../components/CustomizeForm.js';
import styles from './page.module.css';

export const metadata = {
  title: 'Customize - Quote Calendar',
  description: 'Personalize your Quote Calendar experience with custom themes, fonts, and preferences.',
};

export default async function CustomizePage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  return (
    <div className={styles.customizePage}>
      <div className="container">
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>🎨 Customize Your Experience</h1>
          <p className={styles.pageDescription}>
            Personalize Quote Calendar with your preferred theme, font, and display settings.
          </p>
        </div>

        <div className={styles.customizeContainer}>
          <CustomizeForm />
        </div>
      </div>
    </div>
  );
}
