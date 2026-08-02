/**
 * Tray'd Trading Platform - Custom Hooks
 * @description Reusable React hooks for common operations
 */

'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore, useUIStore, useMarketStore, useTradingStore, useWalletStore } from '@/store';

// ============================================================
// AUTHENTICATION HOOKS
// ============================================================

/**
 * Hook for authentication state and actions
 * @returns Auth state and helper functions
 */
export function useAuth() {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    login: storeLogin,
    logout: storeLogout,
    updateUser,
  } = useAuthStore();
  
  const router = useRouter();

  /** Login with credentials */
  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        storeLogin(data.data.user, data.data.token, data.data.refreshToken);
        return { success: true };
      }
      
      return { success: false, error: data.error?.message || 'Login failed' };
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  }, [storeLogin]);

  /** Register new account */
  const register = useCallback(async (registerData: {
    email: string;
    username?: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        return { success: true, message: 'Registration successful. Please check your email.' };
      }
      
      return { success: false, error: data.error?.message || 'Registration failed' };
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  }, []);

  /** Logout current user */
  const logout = useCallback(async () => {
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } finally {
      storeLogout();
      router.push('/');
    }
  }, [token, storeLogout, router]);

  /** Check if user has specific role */
  const hasRole = useCallback((role: string): boolean => {
    return user?.role === role || user?.role === 'super_admin';
  }, [user?.role]);

  /** Check if user is verified */
  const isVerified = useMemo(() => {
    return user?.emailVerified && user?.kycStatus === 'approved';
  }, [user]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    hasRole,
    isVerified,
  };
}

// ============================================================
// MARKET DATA HOOKS
// ============================================================

/**
 * Hook for real-time market data
 * @param symbol - Trading pair symbol to watch
 * @returns Market data and controls
 */
export function useMarketData(symbol?: string) {
  const {
    selectedSymbol,
    prices,
    selectedTimeframe,
    watchlist,
    activeCategory,
    isLoadingPrices,
    setSelectedSymbol,
    setSelectedTimeframe,
    addToWatchlist,
    removeFromWatchlist,
    setActiveCategory,
  } = useMarketStore();
  
  const [candles, setCandles] = useState<Array<{
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>>([]);
  const [depth, setDepth] = useState<{ bids: [number, number][]; asks: [number, number][] }>({
    bids: [],
    asks: [],
  });
  const [recentTrades, setRecentTrades] = useState<Array<{
    id: string;
    price: number;
    quantity: number;
    side: 'buy' | 'sell';
    time: string;
  }>>([]);
  const [isLoadingCandles, setIsLoadingCandles] = useState(false);

  /** Current symbol being watched */
  const activeSymbol = symbol || selectedSymbol;

  /** Current price data for symbol */
  const priceData = prices[activeSymbol];

  /** Fetch candlestick data */
  const fetchCandles = useCallback(async (
    sym: string,
    timeframe: string,
    limit: number = 200
  ) => {
    setIsLoadingCandles(true);
    try {
      const response = await fetch(
        `/api/market/candles/${sym}?timeframe=${timeframe}&limit=${limit}`
      );
      const data = await response.json();
      
      if (data.success) {
        setCandles(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch candles:', error);
    } finally {
      setIsLoadingCandles(false);
    }
  }, []);

  /** Fetch order book depth */
  const fetchDepth = useCallback(async (sym: string) => {
    try {
      const response = await fetch(`/api/market/depth/${sym}`);
      const data = await response.json();
      
      if (data.success) {
        setDepth(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch depth:', error);
    }
  }, []);

  /** Fetch recent trades */
  const fetchRecentTrades = useCallback(async (sym: string, limit: number = 50) => {
    try {
      const response = await fetch(`/api/market/trades/${sym}?limit=${limit}`);
      const data = await response.json();
      
      if (data.success) {
        setRecentTrades(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch recent trades:', error);
    }
  }, []);

  /** Fetch all market data for symbol */
  const fetchData = useCallback(() => {
    fetchCandles(activeSymbol, selectedTimeframe);
    fetchDepth(activeSymbol);
    fetchRecentTrades(activeSymbol);
  }, [activeSymbol, selectedTimeframe, fetchCandles, fetchDepth, fetchRecentTrades]);

  // Auto-fetch when symbol or timeframe changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    // State
    selectedSymbol: activeSymbol,
    priceData,
    candles,
    depth,
    recentTrades,
    watchlist,
    selectedTimeframe,
    activeCategory,
    isLoadingPrices,
    isLoadingCandles,
    
    // Actions
    setSelectedSymbol,
    setSelectedTimeframe,
    addToWatchlist,
    removeFromWatchlist,
    setActiveCategory,
    refreshData: fetchData,
    
    // Computed
    isInWatchlist: watchlist.includes(activeSymbol),
    lastPrice: priceData?.currentPrice,
    change24h: priceData?.change24h,
    changePercent24h: priceData?.changePercent24h,
  };
}

// ============================================================
// TRADING HOOKS
// ============================================================

/**
 * Hook for trading operations
 * @returns Trading state and actions
 */
export function useTrading() {
  const {
    positions,
    orders,
    orderForm,
    tradeHistory,
    isLoadingPositions,
    isLoadingOrders,
    isSubmittingOrder,
    setPositions,
    setOrders,
    updateOrderForm,
    resetOrderForm,
    setLoadingPositions,
    setLoadingOrders,
    setSubmittingOrder,
  } = useTradingStore();
  
  const { token } = useAuthStore();

  /** Fetch open positions */
  const fetchPositions = useCallback(async () => {
    if (!token) return;
    
    setLoadingPositions(true);
    try {
      const response = await fetch('/api/trading/positions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      if (data.success) {
        setPositions(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch positions:', error);
    } finally {
      setLoadingPositions(false);
    }
  }, [token, setPositions, setLoadingPositions]);

  /** Fetch orders */
  const fetchOrders = useCallback(async () => {
    if (!token) return;
    
    setLoadingOrders(true);
    try {
      const response = await fetch('/api/trading/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  }, [token, setOrders, setLoadingOrders]);

  /** Submit order */
  const submitOrder = useCallback(async (): Promise<{ success: boolean; orderId?: string; error?: string }> => {
    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    setSubmittingOrder(true);
    try {
      const response = await fetch('/api/trading/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...orderForm,
          symbol: useMarketStore.getState().selectedSymbol,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        resetOrderForm();
        // Refresh positions and orders
        fetchPositions();
        fetchOrders();
        return { success: true, orderId: data.data.id };
      }
      
      return { success: false, error: data.error?.message || 'Order failed' };
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      setSubmittingOrder(false);
    }
  }, [token, orderForm, setSubmittingOrder, resetOrderForm, fetchPositions, fetchOrders]);

  /** Cancel order */
  const cancelOrder = useCallback(async (orderId: string): Promise<boolean> => {
    if (!token) return false;
    
    try {
      const response = await fetch(`/api/trading/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      if (data.success) {
        fetchOrders(); // Refresh orders list
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to cancel order:', error);
      return false;
    }
  }, [token, fetchOrders]);

  /** Close position */
  const closePosition = useCallback(async (positionId: string): Promise<boolean> => {
    if (!token) return false;
    
    try {
      const response = await fetch(`/api/trading/positions/${positionId}/close`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      if (data.success) {
        fetchPositions(); // Refresh positions list
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to close position:', error);
      return false;
    }
  }, [token, fetchPositions]);

  // Initial data fetch
  useEffect(() => {
    if (token) {
      fetchPositions();
      fetchOrders();
    }
  }, [token, fetchPositions, fetchOrders]);

  return {
    // State
    positions,
    orders,
    orderForm,
    tradeHistory,
    isLoadingPositions,
    isLoadingOrders,
    isSubmittingOrder,
    
    // Actions
    updateOrderForm,
    resetOrderForm,
    submitOrder,
    cancelOrder,
    closePosition,
    fetchPositions,
    fetchOrders,
    
    // Computed
    openPositionsCount: positions.length,
    pendingOrdersCount: orders.filter(o => 
      o.status === 'open' || o.status === 'pending'
    ).length,
    totalPnl: positions.reduce((sum, p) => sum + (p.unrealizedPnl || 0), 0),
  };
}

// ============================================================
// WALLET HOOKS
// ============================================================

/**
 * Hook for wallet operations
 * @returns Wallet state and actions
 */
export function useWallet() {
  const {
    wallets,
    transactions,
    selectedWalletId,
    isLoadingWallets,
    isLoadingTransactions,
    setWallets,
    setTransactions,
    setSelectedWallet,
    setLoadingWallets,
    setLoadingTransactions,
    updateWalletBalance,
  } = useWalletStore();
  
  const { token } = useAuthStore();

  /** Fetch wallets */
  const fetchWallets = useCallback(async () => {
    if (!token) return;
    
    setLoadingWallets(true);
    try {
      const response = await fetch('/api/wallet/wallets', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      if (data.success) {
        setWallets(data.data);
        
        // Set default wallet if none selected
        if (data.data.length > 0 && !selectedWalletId) {
          setSelectedWallet(data.data[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch wallets:', error);
    } finally {
      setLoadingWallets(false);
    }
  }, [token, setWallets, setLoadingWallets, selectedWalletId, setSelectedWallet]);

  /** Fetch transactions */
  const fetchTransactions = useCallback(async (walletId?: string) => {
    if (!token) return;
    
    setLoadingTransactions(true);
    try {
      const url = walletId
        ? `/api/wallet/transactions?walletId=${walletId}`
        : '/api/wallet/transactions';
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      if (data.success) {
        setTransactions(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoadingTransactions(false);
    }
  }, [token, setTransactions, setLoadingTransactions]);

  /** Get selected wallet object */
  const selectedWallet = useMemo(() => {
    return wallets.find(w => w.id === selectedWalletId) || null;
  }, [wallets, selectedWalletId]);

  /** Create deposit request */
  const createDeposit = useCallback(async (amount: number, currency: string, paymentMethod: string) => {
    if (!token) return { success: false, error: 'Not authenticated' };

    try {
      const response = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount, currency, paymentMethod }),
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }, [token]);

  /** Create withdrawal request */
  const createWithdrawal = useCallback(async (amount: number, currency: string, destination: Record<string, unknown>) => {
    if (!token) return { success: false, error: 'Not authenticated' };

    try {
      const response = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount, currency, destination }),
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }, [token]);

  // Initial data fetch
  useEffect(() => {
    if (token) {
      fetchWallets();
    }
  }, [token, fetchWallets]);

  return {
    // State
    wallets,
    transactions,
    selectedWallet,
    selectedWalletId,
    isLoadingWallets,
    isLoadingTransactions,
    
    // Actions
    fetchWallets,
    fetchTransactions,
    setSelectedWallet,
    createDeposit,
    createWithdrawal,
    
    // Computed
    totalBalance: wallets.reduce((sum, w) => sum + w.balance, 0),
    availableBalance: wallets.reduce((sum, w) => sum + w.availableBalance, 0),
  };
}

// ============================================================
// UI UTILITY HOOKS
// ============================================================

/**
 * Hook for media queries
 * @param query - CSS media query string
 * @returns Whether the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    // Initialize state from media query (standard pattern for media query hooks)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMatches(media.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
}

/** Breakpoint hooks */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 768px)');
}

export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1025px)');
}

/**
 * Hook for keyboard shortcuts
 * @param shortcuts - Map of key combinations to handlers
 */
export function useKeyboardShortcuts(shortcuts: Record<string, () => void>): void {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const key = event.key.toLowerCase();
      const ctrl = event.ctrlKey || event.metaKey;
      const shift = event.shiftKey;
      const alt = event.altKey;

      // Build shortcut string
      let shortcut = '';
      if (ctrl) shortcut += 'ctrl+';
      if (alt) shortcut += 'alt+';
      if (shift) shortcut += 'shift+';
      shortcut += key;

      if (shortcuts[shortcut]) {
        event.preventDefault();
        shortcuts[shortcut]();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shortcuts]);
}

/**
 * Hook for click outside detection
 * @param ref - Ref to element
 * @param handler - Handler to call on outside click
 */
export function useClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  handler: () => void
): void {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

/**
 * Hook for local storage state
 * @param key - Storage key
 * @param initialValue - Default value
 * @returns [value, setter]
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: React.SetStateAction<T>) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    }
  };

  return [storedValue, setValue];
}

/**
 * Hook for interval with cleanup
 * @param callback - Function to call
 * @param delay - Interval in ms (null to pause)
 */
export function useInterval(callback: () => void, delay: number | null): void {
  const savedCallback = useRef<() => void>(undefined);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    const id = setInterval(() => savedCallback.current?.(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

/**
 * Hook for debounce value
 * @param value - Value to debounce
 * @param delay - Delay in ms
 * @returns Debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for previous value tracking
 * @param value - Current value
 * @returns Previous value
 */
export function usePrevious<T>(value: T): T | undefined {
  const [previousValue, setPreviousValue] = useState<T | undefined>(undefined);
  const currentRef = useRef<T>(value);

  // Update previous value when current value changes (using effect to satisfy linter)
  useEffect(() => {
    if (currentRef.current !== value) {
      setPreviousValue(currentRef.current);
      currentRef.current = value;
    }
  }, [value]);

  return previousValue;
}

/**
 * Hook for detecting online/offline status
 * @returns Online status
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// ============================================================
// ROUTE HOOKS
// ============================================================

/**
 * Hook for current route info
 * @returns Route information
 */
export function useRouteInfo() {
  const pathname = usePathname();
  const router = useRouter();

  /** Current route segments */
  const segments = pathname.split('/').filter(Boolean);

  /** Check if current path matches pattern */
  const isActive = useCallback((path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  }, [pathname]);

  /** Navigate to path */
  const navigate = useCallback((path: string) => {
    router.push(path);
  }, [router]);

  return {
    pathname,
    segments,
    isActive,
    navigate,
    isHome: pathname === '/',
    isDashboard: pathname === '/' || pathname.startsWith('/dashboard'),
    isTrading: pathname.startsWith('/trading'),
    isMarkets: pathname.startsWith('/markets'),
    isWallet: pathname.startsWith('/wallet'),
    isAdmin: pathname.startsWith('/admin'),
  };
}
