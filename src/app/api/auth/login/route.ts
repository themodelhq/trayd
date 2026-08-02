/**
 * Tray'd Authentication API - Login Endpoint
 * @description Handles user login with email/password
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomBytes } from 'crypto';
import { generateId } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

interface LoginRequestBody {
  email: string;
  password: string;
  rememberMe?: boolean;
  twoFACode?: string;
}

interface UserResponse {
  id: string;
  email: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  role: string;
  kycStatus: string;
  emailVerified: boolean;
  accountStatus: string;
  createdAt: string;
}

// ============================================================
// HELPERS
// ============================================================

/** Simple password hashing using SHA-256 */
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + (process.env.PASSWORD_SALT || 'trayd-salt-2024'));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Verify password against hash */
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const inputHash = await hashPassword(password);
  return inputHash === hash;
}

/** Generate session token */
function generateToken(userId: string): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: userId,
    iat: Date.now(),
    exp: Date.now() + (24 * 60 * 60 * 1000),
  }));
  const signature = randomBytes(32).toString('base64url');
  return `${header}.${payload}.${signature}`;
}

/** Format user for API response */
function formatUser(user: any): UserResponse {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    displayName: user.displayName || user.firstName || user.username,
    avatarUrl: user.avatarUrl,
    role: user.role,
    kycStatus: user.kycStatus,
    emailVerified: user.emailVerified,
    accountStatus: user.accountStatus,
    createdAt: user.createdAt.toISOString(),
  };
}

/** Detect device type from user agent */
function detectDeviceType(userAgent: string): string {
  if (/mobile|android|iphone|ipad|ipod/i.test(userAgent)) return 'mobile';
  if (/tablet|ipad/i.test(userAgent)) return 'tablet';
  return 'desktop';
}

// ============================================================
// LOGIN HANDLER
// ============================================================

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body: LoginRequestBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_JSON', message: 'Invalid JSON in request body' } },
        { status: 400 }
      );
    }

    const { email, password, twoFACode } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Email and password are required' } },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_EMAIL', message: 'Invalid email format' } },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Security: Don't reveal whether user exists
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } },
        { status: 401 }
      );
    }

    // Check account status
    if (user.accountStatus === 'banned') {
      return NextResponse.json(
        { success: false, error: { code: 'ACCOUNT_BANNED', message: 'Account has been banned. Contact support.' } },
        { status: 403 }
      );
    }

    if (user.accountStatus === 'frozen') {
      return NextResponse.json(
        { success: false, error: { code: 'ACCOUNT_FROZEN', message: 'Account is temporarily frozen. Contact support.' } },
        { status: 403 }
      );
    }

    if (user.accountStatus === 'suspended') {
      return NextResponse.json(
        { success: false, error: { code: 'ACCOUNT_SUSPENDED', message: 'Account has been suspended. Check your email.' } },
        { status: 403 }
      );
    }

    // Check if user has password (OAuth-only accounts)
    if (!user.passwordHash) {
      return NextResponse.json(
        { success: false, error: { code: 'OAUTH_ONLY', message: 'Please sign in using your OAuth provider' } },
        { status: 400 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } },
        { status: 401 }
      );
    }

    // Handle 2FA requirement
    if (user.twoFAEnabled && !twoFACode) {
      return NextResponse.json(
        { 
          success: true, 
          data: { require2FA: true, userId: user.id },
          message: '2FA code required',
        },
        { status: 200 }
      );
    }

    // TODO: Verify 2FA code if provided and enabled

    // Generate authentication tokens
    const token = generateToken(user.id);
    const refreshToken = generateId('refresh');
    
    // Calculate session expiry based on "remember me"
    const sessionExpiryMs = body.rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;

    // Get client info for security logging
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
                   || request.headers.get('x-real-ip') 
                   || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Create session record in database
    await db.session.create({
      data: {
        userId: user.id,
        tokenHash: await hashPassword(token),
        refreshToken,
        ipAddress,
        userAgent,
        deviceType: detectDeviceType(userAgent),
        expiresAt: new Date(Date.now() + sessionExpiryMs),
      },
    });

    // Update user's last login timestamp
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Return successful authentication response
    return NextResponse.json({
      success: true,
      data: {
        user: formatUser(user),
        token,
        refreshToken,
        expiresIn: Math.floor(sessionExpiryMs / 1000), // Convert to seconds
      },
    });
  } catch (error) {
    console.error('[Auth] Login error:', error);
    
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred. Please try again.' } },
      { status: 500 }
    );
  }
}
