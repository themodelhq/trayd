/**
 * Tray'd Trading Platform - Utility Functions
 * @description Shared utility functions used across the application
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ============================================================
// CLASS NAME UTILITIES
// ============================================================

/**
 * Merge Tailwind CSS classes with proper deduplication
 * @param inputs - Class values to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ============================================================
// NUMBER FORMATTING
// ============================================================

/**
 * Format number with specified decimal places
 * @param value - Number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string
 */
export function formatNumber(value: number, decimals: number = 2): string {
  if (value === undefined || value === null || isNaN(value)) return '0.00';
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format currency value with symbol
 * @param value - Currency amount
 * @param currency - Currency code (default: USD)
 * @param displaySign - Whether to show + for positive values
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number,
  currency: string = 'USD',
  displaySign: boolean = false
): string {
  if (value === undefined || value === null || isNaN(value)) {
    return `${getCurrencySymbol(currency)}0.00`;
  }

  const prefix = displaySign && value > 0 ? '+' : '';
  
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: displaySign ? 'always' : 'auto',
  }).format(Math.abs(value));

  return `${prefix}${formatted}`;
}

/**
 * Get currency symbol from code
 * @param code - Currency code
 * @returns Currency symbol
 */
export function getCurrencySymbol(code: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    NGN: '₦',
    GHS: '₵',
    KES: 'KSh',
    ZAR: 'R',
    BTC: '₿',
    ETH: 'Ξ',
    USDT: '$',
    USDC: '$',
    SOL: '◎',
    BNB: 'BNB',
  };
  return symbols[code] || code;
}

/**
 * Format large numbers with abbreviations
 * @param value - Number to format
 * @returns Abbreviated string (e.g., 1.5M, 2.3B)
 */
export function formatCompactNumber(value: number): string {
  if (value === undefined || value === null || isNaN(value)) return '0';
  
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format cryptocurrency amount with appropriate precision
 * @param value - Crypto amount
 * @param symbol - Token symbol for precision lookup
 * @returns Formatted crypto string
 */
export function formatCryptoAmount(value: number, symbol?: string): string {
  if (value === undefined || value === null || isNaN(value)) return '0';
  
  // Determine precision based on symbol
  let decimals = 8;
  if (symbol) {
    const precisionMap: Record<string, number> = {
      BTC: 8,
      ETH: 6,
      SOL: 4,
      BNB: 4,
      XRP: 4,
      ADA: 4,
      DOGE: 2,
      DOT: 4,
      AVAX: 4,
      LINK: 4,
      USDT: 2,
      USDC: 2,
    };
    decimals = precisionMap[symbol] || 4;
  }
  
  return formatNumber(value, decimals);
}

/**
 * Format percentage value
 * @param value - Percentage value (e.g., 5.5 for 5.5%)
 * @param decimals - Decimal places
 * @param showSign - Show + for positive values
 * @returns Formatted percentage string
 */
export function formatPercent(
  value: number,
  decimals: number = 2,
  showSign: boolean = false
): string {
  if (value === undefined || value === null || isNaN(value)) return '0.00%';
  
  const prefix = showSign && value > 0 ? '+' : '';
  return `${prefix}${formatNumber(value, decimals)}%`;
}

/**
 * Format price change with color indicator
 * @param change - Price change value
 * @param isPercent - If true, appends % sign
 * @returns Formatted string
 */
export function formatPriceChange(change: number, isPercent: boolean = false): string {
  const prefix = change >= 0 ? '+' : '';
  const suffix = isPercent ? '%' : '';
  return `${prefix}${formatNumber(Math.abs(change), 2)}${suffix}`;
}

// ============================================================
// DATE & TIME FORMATTING
// ============================================================

/**
 * Format date to relative time (e.g., "2 hours ago")
 * @param date - Date to format
 * @returns Relative time string
 */
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSeconds < 60) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;

  return formatDate(date, 'MMM d, yyyy');
}

/**
 * Format date to specified format
 * @param date - Date to format
 * @param format - Format pattern
 * @returns Formatted date string
 */
export function formatDate(date: string | Date, format: string = 'MMM d, yyyy'): string {
  const target = new Date(date);
  
  // Simple format implementation
  const options: Intl.DateTimeFormatOptions = {};
  
  switch (format) {
    case 'MMM d, yyyy':
      options.month = 'short';
      options.day = 'numeric';
      options.year = 'numeric';
      break;
    case 'MMMM d, yyyy':
      options.month = 'long';
      options.day = 'numeric';
      options.year = 'numeric';
      break;
    case 'MM/dd/yyyy':
      break; // Use default
    case 'yyyy-MM-dd':
      break; // Use default
    case 'HH:mm:ss':
      return target.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      });
    case 'HH:mm':
      return target.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    case 'MMM d, HH:mm':
      return `${target.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${target.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    default:
      options.month = 'short';
      options.day = 'numeric';
      options.year = 'numeric';
  }

  return target.toLocaleDateString('en-US', options);
}

/**
 * Format duration in human-readable form
 * @param seconds - Duration in seconds
 * @returns Formatted duration string
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  return `${days}d ${hours}h`;
}

// ============================================================
// STRING UTILITIES
// ============================================================

/**
 * Truncate string with ellipsis
 * @param str - String to truncate
 * @param maxLength - Maximum length
 * @returns Truncated string
 */
export function truncate(str: string, maxLength: number): string {
  if (!str || str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
}

/**
 * Capitalize first letter of string
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convert string to kebab-case
 * @param str - String to convert
 * @returns Kebab-case string
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Generate initials from name
 * @param name - Full name
 * @returns Initials (max 2 characters)
 */
export function getInitials(name: string): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Mask email address for privacy
 * @param email - Email address
 * @returns Masked email
 */
export function maskEmail(email: string): string {
  if (!email) return '';
  const [localPart, domain] = email.split('@');
  if (!domain) return email;
  const maskedLocal = localPart.length > 2
    ? `${localPart.charAt(0)}${'*'.repeat(localPart.length - 2)}${localPart.charAt(localPart.length - 1)}`
    : localPart;
  return `${maskedLocal}@${domain}`;
}

/**
 * Mask wallet address or hash
 * @param address - Address string
 * @param startChars - Characters to show at start
 * @param endChars - Characters to show at end
 * @returns Masked address
 */
export function maskAddress(address: string, startChars: number = 6, endChars: number = 4): string {
  if (!address || address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

// ============================================================
// VALIDATION UTILITIES
// ============================================================

/**
 * Validate email format
 * @param email - Email to validate
 * @returns True if valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Object with isValid and errors
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
} {
  const errors: string[] = [];
  
  if (password.length < 8) errors.push('Password must be at least 8 characters');
  if (password.length > 128) errors.push('Password must be less than 128 characters');
  if (!/[A-Z]/.test(password)) errors.push('Password must contain an uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Password must contain a lowercase letter');
  if (!/\d/.test(password)) errors.push('Password must contain a number');
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain a special character');
  }

  let strength: 'weak' | 'medium' | 'strong' | 'very-strong' = 'weak';
  if (errors.length <= 1 && password.length >= 12) strength = 'very-strong';
  else if (errors.length <= 2 && password.length >= 10) strength = 'strong';
  else if (errors.length <= 3 && password.length >= 8) strength = 'medium';

  return {
    isValid: errors.length === 0,
    errors,
    strength,
  };
}

/**
 * Validate username format
 * @param username - Username to validate
 * @returns True if valid
 */
export function isValidUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  return usernameRegex.test(username);
}

// ============================================================
// CALCULATION UTILITIES
// ============================================================

/**
 * Calculate percentage change between two values
 * @param current - Current value
 * @param previous - Previous value
 * @returns Percentage change
 */
export function calculatePercentChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Calculate position PnL
 * @param entryPrice - Entry price
 * @param markPrice - Current market price
 * @param side - Position side (buy/sell)
 * @param size - Position size
 * @returns PnL object with absolute and percentage values
 */
export function calculatePositionPnl(
  entryPrice: number,
  markPrice: number,
  side: 'buy' | 'sell',
  size: number
): { pnl: number; pnlPercent: number } {
  if (entryPrice === 0) return { pnl: 0, pnlPercent: 0 };
  
  const multiplier = side === 'buy' ? 1 : -1;
  const pnl = ((markPrice - entryPrice) / entryPrice) * size * multiplier;
  const pnlPercent = ((markPrice - entryPrice) / entryPrice) * 100 * multiplier;
  
  return { pnl, pnlPercent };
}

/**
 * Calculate liquidation price
 * @param entryPrice - Entry price
 * @param leverage - Leverage used
 * @param side - Position side
 * @param maintenanceMarginRate - Maintenance margin rate (default: 0.005)
 * @returns Liquidation price
 */
export function calculateLiquidationPrice(
  entryPrice: number,
  leverage: number,
  side: 'buy' | 'sell',
  maintenanceMarginRate: number = 0.005
): number {
  if (leverage <= 0 || entryPrice <= 0) return 0;
  
  const marginRatio = 1 / leverage;
  const liquidationPrice = side === 'buy'
    ? entryPrice * (1 - marginRatio + maintenanceMarginRate)
    : entryPrice * (1 + marginRatio - maintenanceMarginRate);
  
  return liquidationPrice;
}

/**
 * Calculate position size based on risk parameters
 * @param accountBalance - Total account balance
 * @param riskPercent - Risk percentage per trade
 * @param entryPrice - Entry price
 * @param stopLossPrice - Stop loss price
 * @returns Recommended position size
 */
export function calculatePositionSize(
  accountBalance: number,
  riskPercent: number,
  entryPrice: number,
  stopLossPrice: number
): number {
  if (entryPrice === stopLossPrice || stopLossPrice === 0) return 0;
  
  const riskAmount = accountBalance * (riskPercent / 100);
  const riskPerUnit = Math.abs(entryPrice - stopLossPrice);
  const positionSize = riskAmount / riskPerUnit;
  
  return positionSize;
}

/**
 * Calculate risk/reward ratio
 * @param entryPrice - Entry price
 * @param takeProfitPrice - Take profit price
 * @param stopLossPrice - Stop loss price
 * @returns Risk/reward ratio
 */
export function calculateRiskReward(
  entryPrice: number,
  takeProfitPrice: number,
  stopLossPrice: number
): number {
  const potentialProfit = Math.abs(takeProfitPrice - entryPrice);
  const potentialRisk = Math.abs(entryPrice - stopLossPrice);
  
  if (potentialRisk === 0) return 0;
  return potentialProfit / potentialRisk;
}

// ============================================================
// COLOR UTILITIES
// ============================================================

/**
 * Interpolate between two colors
 * @param startColor - Start color hex
 * @param endColor - End color hex
 * @param factor - Interpolation factor (0-1)
 * @returns Interpolated color hex
 */
export function interpolateColor(startColor: string, endColor: string, factor: number): string {
  const start = hexToRgb(startColor);
  const end = hexToRgb(endColor);
  
  if (!start || !end) return startColor;
  
  const r = Math.round(start.r + (end.r - start.r) * factor);
  const g = Math.round(start.g + (end.g - start.g) * factor);
  const b = Math.round(start.b + (end.b - start.b) * factor);
  
  return rgbToHex(r, g, b);
}

/** Convert hex color to RGB */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/** Convert RGB to hex color */
function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * Get contrasting text color (black or white)
 * @param bgColor - Background color hex
 * @returns Black or white hex
 */
export function getContrastColor(bgColor: string): string {
  const rgb = hexToRgb(bgColor);
  if (!rgb) return '#000000';
  
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

// ============================================================
// STORAGE UTILITIES
// ============================================================

/**
 * Safely get item from localStorage
 * @param key - Storage key
 * @param defaultValue - Default value if not found
 * @returns Parsed value or default
 */
export function getStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Safely set item in localStorage
 * @param key - Storage key
 * @param value - Value to store
 */
export function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

/**
 * Remove item from localStorage
 * @param key - Storage key
 */
export function removeStorageItem(key: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
}

// ============================================================
// DEBOUNCE & THROTTLE
// ============================================================

/**
 * Debounce function execution
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return function (this: unknown, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Throttle function execution
 * @param fn - Function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function (this: unknown, ...args: Parameters<T>) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// ============================================================
// ID GENERATION
// ============================================================

/**
 * Generate unique ID
 * @param prefix - Optional prefix
 * @returns Unique ID string
 */
export function generateId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return prefix ? `${prefix}_${timestamp}${random}` : `${timestamp}${random}`;
}

/**
 * Generate order reference number
 * @returns Order reference string
 */
export function generateOrderRef(): string {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

/**
 * Generate transaction reference
 * @returns Transaction reference string
 */
export function generateTxRef(): string {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TXN-${timestamp}-${random}`;
}
