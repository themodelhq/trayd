/**
 * Tray'd Authentication API - Registration Endpoint
 * @description Handles new user account creation
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateId, isValidEmail } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

interface RegisterRequestBody {
  email: string;
  username?: string;
  password: string;
  firstName?: string;
  lastName?: string;
  referralCode?: string;
}

interface UserResponse {
  id: string;
  email: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  role: string;
  kycStatus: string;
  emailVerified: boolean;
  accountStatus: string;
  createdAt: string;
}

// ============================================================
// HELPERS
// ============================================================

/** Password hashing using SHA-256 */
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + (process.env.PASSWORD_SALT || 'trayd-salt-2024'));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Validate password strength */
function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) errors.push('Password must be at least 8 characters');
  if (password.length > 128) errors.push('Password must be less than 128 characters');
  if (!/[A-Z]/.test(password)) errors.push('Password must contain an uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Password must contain a lowercase letter');
  if (!/\d/.test(password)) errors.push('Password must contain a number');
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain a special character');
  }

  return { valid: errors.length === 0, errors };
}

/** Validate username format */
function validateUsername(username: string): { valid: boolean; error: string | null } {
  if (username.length < 3) return { valid: false, error: 'Username must be at least 3 characters' };
  if (username.length > 30) return { valid: false, error: 'Username must be at most 30 characters' };
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { valid: false, error: 'Username can only contain letters, numbers, and underscores' };
  }
  if (/^\d+$/.test(username)) return { valid: false, error: 'Username cannot be only numbers' };
  
  // Reserved usernames
  const reserved = ['admin', 'root', 'support', 'help', 'api', 'system', 'trayd', 'trading'];
  if (reserved.includes(username.toLowerCase())) {
    return { valid: false, error: 'This username is reserved' };
  }
  
  return { valid: true, error: null };
}

/** Format user for response */
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

/** Generate default user preferences */
function getDefaultPreferences(): string {
  return JSON.stringify({
    theme: 'dark',
    language: 'en',
    currency: 'USD',
    timezone: 'UTC',
    tradingView: {
      defaultOrderType: 'market',
      defaultMarginMode: 'cross',
      showPositionPnl: true,
      confirmOrders: true,
      soundAlerts: true,
      slippageTolerance: 0.5,
      leverageDefault: 10,
    },
    notifications: {
      email: true,
      push: true,
      sms: false,
      inApp: true,
      tradeAlerts: true,
      priceAlerts: true,
      marketing: false,
      security: true,
    },
    privacy: {
      profileVisibility: 'private',
      showTradingActivity: false,
      allowCopyTrading: false,
      showOnLeaderboard: false,
    },
    display: {
      layout: 'standard',
      chartType: 'candles',
      fontSize: 'medium',
      animationsEnabled: true,
      glassmorphism: true,
    },
  });
}

// ============================================================
// REGISTRATION HANDLER
// ============================================================

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body: RegisterRequestBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_JSON', message: 'Invalid JSON in request body' } },
        { status: 400 }
      );
    }

    const { email, username, password, firstName, lastName, referralCode } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Email and password are required' } },
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_EMAIL', message: 'Invalid email format' } },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'WEAK_PASSWORD', 
            message: 'Password does not meet requirements',
            details: { password: passwordValidation.errors }
          } 
        },
        { status: 400 }
      );
    }

    // Validate username if provided
    if (username) {
      const usernameValidation = validateUsername(username);
      if (!usernameValidation.valid) {
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_USERNAME', message: usernameValidation.error } },
          { status: 400 }
        );
      }
    }

    // Check if email already exists
    const existingEmail = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingEmail) {
      return NextResponse.json(
        { success: false, error: { code: 'EMAIL_EXISTS', message: 'An account with this email already exists' } },
        { status: 409 }
      );
    }

    // Check if username already exists (if provided)
    if (username) {
      const existingUsername = await db.user.findUnique({
        where: { username: username.toLowerCase() },
      });

      if (existingUsername) {
        return NextResponse.json(
          { success: false, error: { code: 'USERNAME_EXISTS', message: 'This username is already taken' } },
          { status: 409 }
        );
      }
    }

    // Validate referral code if provided
    let referrerId: string | undefined;
    if (referralCode) {
      const referrer = await db.user.findUnique({
        where: { referralCode },
      });

      if (!referrer) {
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_REFERRAL', message: 'Invalid referral code' } },
          { status: 400 }
        );
      }
      
      referrerId = referrer.id;
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Generate unique referral code for new user
    const newUserReferralCode = generateId('ref').toUpperCase();

    // Create user account
    const user = await db.user.create({
      data: {
        email: email.toLowerCase().trim(),
        username: username?.toLowerCase()?.trim(),
        passwordHash,
        firstName: firstName?.trim(),
        lastName: lastName?.trim(),
        displayName: `${firstName || ''} ${lastName || ''}`.trim() || null,
        referralCode: newUserReferralCode,
        referredBy: referrerId,
        preferences: getDefaultPreferences(),
        // Send welcome notification or email here in production
      },
    });

    // TODO: Send verification email
    // TODO: Create referral reward record if referred

    // Return successful registration response
    return NextResponse.json(
      {
        success: true,
        data: {
          user: formatUser(user),
          message: 'Account created successfully. Please verify your email.',
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Auth] Registration error:', error);
    
    // Handle unique constraint violations
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { success: false, error: { code: 'DUPLICATE_ENTRY', message: 'An account with these credentials already exists' } },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred during registration' } },
      { status: 500 }
    );
  }
}
