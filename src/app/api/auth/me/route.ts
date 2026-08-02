/**
 * Tray'd Authentication API - Get Current User
 * @description Returns the authenticated user's profile information
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ============================================================
// TYPES
// ============================================================

interface UserResponse {
  id: string;
  email: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  phone: string | null;
  phoneVerified: boolean;
  emailVerified: boolean;
  role: string;
  kycStatus: string;
  twoFAEnabled: boolean;
  accountStatus: string;
  referralCode: string;
  createdAt: string;
  lastLoginAt: string | null;
  preferences: Record<string, unknown>;
}

// ============================================================
// HELPERS
// ============================================================

/** Extract and verify token from request */
async function getUserFromToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  // For demo purposes, decode token to get user ID
  // In production, verify JWT signature properly
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.sub;
    
    if (!userId || payload.exp < Date.now()) {
      return null;
    }

    // Verify session exists in database
    const session = await db.session.findFirst({
      where: {
        userId,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
    });

    if (!session) return null;

    // Fetch user
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    return user;
  } catch {
    return null;
  }
}

/** Format user for response */
function formatUser(user: any): UserResponse {
  let parsedPreferences = {};
  try {
    parsedPreferences = typeof user.preferences === 'string' 
      ? JSON.parse(user.preferences) 
      : user.preferences;
  } catch {
    parsedPreferences = {};
  }

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    displayName: user.displayName || user.firstName || user.username,
    avatarUrl: user.avatarUrl,
    phone: user.phone,
    phoneVerified: user.phoneVerified,
    emailVerified: user.emailVerified,
    role: user.role,
    kycStatus: user.kycStatus,
    twoFAEnabled: user.twoFAEnabled,
    accountStatus: user.accountStatus,
    referralCode: user.referralCode,
    createdAt: user.createdAt.toISOString(),
    lastLoginAt: user.lastLoginAt?.toISOString() || null,
    preferences: parsedPreferences,
  };
}

// ============================================================
// GET CURRENT USER HANDLER
// ============================================================

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getUserFromToken(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    // Return user data
    return NextResponse.json({
      success: true,
      data: formatUser(user),
    });
  } catch (error) {
    console.error('[Auth] Get user error:', error);
    
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch user data' } },
      { status: 500 }
    );
  }
}
