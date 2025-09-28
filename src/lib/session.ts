import { cookies } from 'next/headers';
import { User } from './simpleAuth';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface SessionData {
  user: User;
  expires: number;
}

/**
 * Create a session for the user
 */
export function createSession(user: User): string {
  const expires = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  const sessionData: SessionData = {
    user,
    expires
  };

  const token = jwt.sign(sessionData, JWT_SECRET, { expiresIn: '7d' });
  return token;
}

/**
 * Get session from token
 */
export function getSessionFromToken(token: string): SessionData | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as SessionData;
    
    // Check if session is expired
    if (decoded.expires < Date.now()) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}

/**
 * Get current session from cookies
 */
export async function getCurrentSession(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;
    
    if (!sessionToken) {
      return null;
    }

    const session = getSessionFromToken(sessionToken);
    
    if (session) {
      console.log('✅ Valid session found for user:', session.user.email);
    }
    
    return session;
  } catch (error) {
    console.error('❌ Error in getCurrentSession:', error);
    return null;
  }
}

/**
 * Set session cookie
 */
export function setSessionCookie(_token: string): void {
  // This will be handled in the API routes
}

/**
 * Clear session cookie
 */
export function clearSessionCookie(): void {
  // This will be handled in the API routes
}
