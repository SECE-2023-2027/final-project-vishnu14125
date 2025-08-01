import { getServerSession } from 'next-auth';
import { authOptions } from './authConfig.js';
import { redirect } from 'next/navigation';

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  if (!session.user.isAdmin) {
    redirect('/');
  }
  return session;
}

export async function getUserId() {
  const session = await getSession();
  return session?.user?.id || null;
}
