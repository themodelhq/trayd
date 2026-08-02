/**
 * Tray'd Trading Platform - Global State Store
 * @description Zustand store for managing application-wide state
 */

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

// ============================================================
// TYPES
// ============================================================

/** Theme options */
export type Theme = 'light' | 'dark' | 'system';

/** Sidebar state */
export interface SidebarState {
  isOpen: boolean;
  isCollapsed: boolean;
  isMobile: boolean;
}

/** UI preferences */
export interface UIPreferences {
  theme: Theme;
  sidebar: SidebarState;
  showGridLines: boolean;
  showVolume: boolean;
  compactMode: boolean;
  animationsEnabled: boolean;
}

/** Toast notification */
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/** Modal state */
export interface ModalState {
  id: string | null;
  isOpen: boolean;
  data?: unknown;
}

/** Auth state (simplified - full auth in separate store) */
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId?: string;
}

// ============================================================
// UI STORE
// ============================================================

interface UIStoreState extends UIPreferences {
  // Theme actions
  setTheme: (theme: Theme) => void;
  
  // Sidebar actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSidebarMobile: (mobile: boolean) => void;
  
  // Display preferences
  toggleGridLines: () => void;
  toggleVolume: () => void;
  toggleCompactMode: () => void;
  toggleAnimations: () => void;
  
  // Toast notifications
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  
  // Modal management
  modal: ModalState;
  openModal: (id: string, data?: unknown) => void;
  closeModal: () => void;
  
  // Global loading
  globalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;
  
  // Active page/route tracking
  activePage: string;
  setActivePage: (page: string) => void;
}

/**
 * Main UI Store - Manages all UI-related state
 * Uses persist middleware to save preferences to localStorage
 */
export const useUIStore = create<UIStoreState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial theme state
        theme: 'system',
        
        // Initial sidebar state
        sidebar: {
          isOpen: true,
          isCollapsed: false,
          isMobile: false,
        },
        
        // Display preferences
        showGridLines: true,
        showVolume: true,
        compactMode: false,
        animationsEnabled: true,
        
        // Toast notifications
        toasts: [],
        
        // Modal state
        modal: {
          id: null,
          isOpen: false,
        },
        
        // Global loading
        globalLoading: false,
        
        // Active page
        activePage: 'dashboard',
        
        // Theme actions
        setTheme: (theme) => set({ theme }),
        
        // Sidebar actions
        toggleSidebar: () =>
          set((state) => ({
            sidebar: { ...state.sidebar, isOpen: !state.sidebar.isOpen },
          })),
          
        setSidebarOpen: (open) =>
          set((state) => ({
            sidebar: { ...state.sidebar, isOpen: open },
          })),
          
        setSidebarCollapsed: (collapsed) =>
          set((state) => ({
            sidebar: { ...state.sidebar, isCollapsed: collapsed },
          })),
          
        setSidebarMobile: (mobile) =>
          set((state) => ({
            sidebar: { ...state.sidebar, isMobile: mobile },
          })),
        
        // Display preference toggles
        toggleGridLines: () =>
          set((state) => ({ showGridLines: !state.showGridLines })),
          
        toggleVolume: () =>
          set((state) => ({ showVolume: !state.showVolume })),
          
        toggleCompactMode: () =>
          set((state) => ({ compactMode: !state.compactMode })),
          
        toggleAnimations: () =>
          set((state) => ({ animationsEnabled: !state.animationsEnabled })),
        
        // Toast notification actions
        addToast: (toast) => {
          const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
          const newToast = { ...toast, id };
          
          set((state) => ({
            toasts: [...state.toasts, newToast],
          }));
          
          // Auto-remove after duration (default 5 seconds)
          const duration = toast.duration || 5000;
          if (duration > 0) {
            setTimeout(() => {
              get().removeToast(id);
            }, duration);
          }
        },
        
        removeToast: (id) =>
          set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
          })),
          
        clearToasts: () => set({ toasts: [] }),
        
        // Modal actions
        openModal: (id, data) =>
          set({
            modal: { id, isOpen: true, data },
          }),
          
        closeModal: () =>
          set({
            modal: { id: null, isOpen: false, data: undefined },
          }),
        
        // Global loading
        setGlobalLoading: (loading) => set({ globalLoading: loading }),
        
        // Active page
        setActivePage: (page) => set({ activePage: page }),
      }),
      {
        name: 'trayd-ui-preferences',
        partialize: (state) => ({
          theme: state.theme,
          sidebar: {
            isCollapsed: state.sidebar.isCollapsed,
          },
          showGridLines: state.showGridLines,
          showVolume: state.showVolume,
          compactMode: state.compactMode,
          animationsEnabled: state.animationsEnabled,
        }),
      }
    ),
    { name: 'TraydUI' }
  )
);

// ============================================================
// AUTH STORE
// ============================================================

interface AuthStoreState extends AuthState {
  user: import('@/types').User | null;
  token: string | null;
  refreshToken: string | null;
  
  // Actions
  login: (user: import('@/types').User, token: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<import('@/types').User>) => void;
  setToken: (token: string) => void;
  setLoading: (loading: boolean) => void;
}

/**
 * Authentication Store - Manages user authentication state
 */
export const useAuthStore = create<AuthStoreState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        isAuthenticated: false,
        isLoading: true,
        user: null,
        token: null,
        refreshToken: null,
        userId: undefined,
        
        // Login action
        login: (user, token, refreshToken) =>
          set({
            user,
            token,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
            userId: user.id,
          }),
        
        // Logout action
        logout: () =>
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            userId: undefined,
          }),
        
        // Update user profile
        updateUser: (updates) =>
          set((state) => ({
            user: state.user ? { ...state.user, ...updates } : null,
          })),
        
        // Set token (for refresh)
        setToken: (token) => set({ token }),
        
        // Set loading state
        setLoading: (loading) => set({ isLoading: loading }),
      }),
      {
        name: 'trayd-auth',
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          refreshToken: state.refreshToken,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: 'TraydAuth' }
  )
);

// ============================================================
// MARKET DATA STORE
// ============================================================

interface MarketDataStoreState {
  /** Selected trading pair symbol */
  selectedSymbol: string;
  
  /** Current prices map */
  prices: Record<string, import('@/types').PriceData>;
  
  /** Selected timeframe */
  selectedTimeframe: import('@/types').Timeframe;
  
  /** Watchlist symbols */
  watchlist: string[];
  
  /** Market category filter */
  activeCategory: import('@/types').MarketCategory | 'all';
  
  /** Search query */
  searchQuery: string;
  
  /** Loading states */
  isLoadingPrices: boolean;
  isLoadingCandles: boolean;
  
  // Actions
  setSelectedSymbol: (symbol: string) => void;
  setSelectedTimeframe: (timeframe: import('@/types').Timeframe) => void;
  updatePrice: (symbol: string, price: import('@/types').PriceData) => void;
  addToWatchlist: (symbol: string) => void;
  removeFromWatchlist: (symbol: string) => void;
  setActiveCategory: (category: import('@/types').MarketCategory | 'all') => void;
  setSearchQuery: (query: string) => void;
  setLoadingPrices: (loading: boolean) => void;
  setLoadingCandles: (loading: boolean) => void;
}

/**
 * Market Data Store - Manages real-time market data state
 */
export const useMarketStore = create<MarketDataStoreState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        selectedSymbol: 'BTC/USDT',
        prices: {},
        selectedTimeframe: '1h',
        watchlist: ['BTC/USDT', 'ETH/USDT', 'SOL/USDT'],
        activeCategory: 'all',
        searchQuery: '',
        isLoadingPrices: false,
        isLoadingCandles: false,
        
        // Actions
        setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),
        
        setSelectedTimeframe: (timeframe) => set({ selectedTimeframe: timeframe }),
        
        updatePrice: (symbol, price) =>
          set((state) => ({
            prices: { ...state.prices, [symbol]: price },
          })),
        
        addToWatchlist: (symbol) =>
          set((state) => ({
            watchlist: state.watchlist.includes(symbol)
              ? state.watchlist
              : [...state.watchlist, symbol],
          })),
        
        removeFromWatchlist: (symbol) =>
          set((state) => ({
            watchlist: state.watchlist.filter((s) => s !== symbol),
          })),
        
        setActiveCategory: (category) => set({ activeCategory: category }),
        
        setSearchQuery: (query) => set({ searchQuery: query }),
        
        setLoadingPrices: (loading) => set({ isLoadingPrices: loading }),
        
        setLoadingCandles: (loading) => set({ isLoadingCandles: loading }),
      }),
      {
        name: 'trayd-market',
        partialize: (state) => ({
          selectedSymbol: state.selectedSymbol,
          selectedTimeframe: state.selectedTimeframe,
          watchlist: state.watchlist,
          activeCategory: state.activeCategory,
        }),
      }
    ),
    { name: 'TraydMarket' }
  )
);

// ============================================================
// TRADING STORE
// ============================================================

interface TradingStoreState {
  /** Open positions */
  positions: import('@/types').Position[];
  
  /** Active orders */
  orders: import('@/types').Order[];
  
  /** Order form state */
  orderForm: OrderFormState;
  
  /** Trade history */
  tradeHistory: import('@/types').TradeHistoryEntry[];
  
  /** Loading states */
  isLoadingPositions: boolean;
  isLoadingOrders: boolean;
  isSubmittingOrder: boolean;
  
  // Actions
  setPositions: (positions: import('@/types').Position[]) => void;
  setOrders: (orders: import('@/types').Order[]) => void;
  updateOrderForm: (updates: Partial<OrderFormState>) => void;
  resetOrderForm: () => void;
  setTradeHistory: (history: import('@/types').TradeHistoryEntry[]) => void;
  setLoadingPositions: (loading: boolean) => void;
  setLoadingOrders: (loading: boolean) => void;
  setSubmittingOrder: (submitting: boolean) => void;
  submitOrder: (params: { symbol: string; currentPrice: number }) => Promise<import('@/types').Order>;
}

/** Order form state */
export interface OrderFormState {
  side: 'buy' | 'sell';
  type: import('@/types').OrderType;
  price: string;
  quantity: string;
  stopPrice: string;
  leverage: number;
  timeInForce: import('@/types').TimeInForce;
  reduceOnly: boolean;
  postOnly: boolean;
  takeProfit: string;
  stopLoss: string;
}

const initialOrderForm: OrderFormState = {
  side: 'buy',
  type: 'market',
  price: '',
  quantity: '',
  stopPrice: '',
  leverage: 10,
  timeInForce: 'GTC',
  reduceOnly: false,
  postOnly: false,
  takeProfit: '',
  stopLoss: '',
};

/**
 * Trading Store - Manages trading operations state
 */
export const useTradingStore = create<TradingStoreState>()(
  devtools(
    (set, get) => ({
      // Initial state
      positions: [],
      orders: [],
      orderForm: initialOrderForm,
      tradeHistory: [],
      isLoadingPositions: false,
      isLoadingOrders: false,
      isSubmittingOrder: false,
      
      // Actions
      setPositions: (positions) => set({ positions }),
      
      setOrders: (orders) => set({ orders }),
      
      updateOrderForm: (updates) =>
        set((state) => ({
          orderForm: { ...state.orderForm, ...updates },
        })),
      
      resetOrderForm: () => set({ orderForm: initialOrderForm }),
      
      setTradeHistory: (tradeHistory) => set({ tradeHistory }),
      
      setLoadingPositions: (loading) => set({ isLoadingPositions: loading }),
      
      setLoadingOrders: (loading) => set({ isLoadingOrders: loading }),
      
      setSubmittingOrder: (submitting) => set({ isSubmittingOrder: submitting }),

      submitOrder: async ({ symbol, currentPrice }) => {
        set({ isSubmittingOrder: true });
        try {
          const { orderForm } = get();
          const quantity = parseFloat(orderForm.quantity) || 0;
          const limitPrice = orderForm.type === 'market' ? currentPrice : (parseFloat(orderForm.price) || 0);

          // Simulate network latency for order placement
          await new Promise((resolve) => setTimeout(resolve, 600));

          const newOrder: import('@/types').Order = {
            id: `order-${Date.now()}`,
            userId: 'demo-user',
            symbol,
            type: orderForm.type,
            side: orderForm.side,
            status: orderForm.type === 'market' ? 'filled' : 'open',
            price: orderForm.type === 'market' ? undefined : limitPrice,
            stopPrice: orderForm.stopPrice ? parseFloat(orderForm.stopPrice) : undefined,
            averagePrice: orderForm.type === 'market' ? currentPrice : undefined,
            quantity,
            filledQuantity: orderForm.type === 'market' ? quantity : 0,
            remainingQuantity: orderForm.type === 'market' ? 0 : quantity,
            timeInForce: orderForm.timeInForce,
            leverage: orderForm.leverage,
            marginMode: 'cross',
            reduceOnly: orderForm.reduceOnly,
            postOnly: orderForm.postOnly,
            fee: quantity * currentPrice * 0.0004,
            feeCurrency: 'USDT',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          set((state) => ({ orders: [newOrder, ...state.orders] }));
          return newOrder;
        } finally {
          set({ isSubmittingOrder: false });
        }
      },
    }),
    { name: 'TraydTrading' }
  )
);

// ============================================================
// WALLET STORE
// ============================================================

interface WalletStoreState {
  /** User wallets */
  wallets: import('@/types').Wallet[];
  
  /** Transaction history */
  transactions: import('@/types').Transaction[];
  
  /** Selected wallet ID */
  selectedWalletId: string | null;
  
  /** Loading states */
  isLoadingWallets: boolean;
  isLoadingTransactions: boolean;
  
  // Actions
  setWallets: (wallets: import('@/types').Wallet[]) => void;
  setTransactions: (transactions: import('@/types').Transaction[]) => void;
  setSelectedWallet: (walletId: string | null) => void;
  setLoadingWallets: (loading: boolean) => void;
  setLoadingTransactions: (loading: boolean) => void;
  updateWalletBalance: (walletId: string, balance: number, available: number) => void;
}

/**
 * Wallet Store - Manages wallet and transaction state
 */
export const useWalletStore = create<WalletStoreState>()(
  devtools(
    (set) => ({
      // Initial state
      wallets: [],
      transactions: [],
      selectedWalletId: null,
      isLoadingWallets: false,
      isLoadingTransactions: false,
      
      // Actions
      setWallets: (wallets) => set({ wallets }),
      
      setTransactions: (transactions) => set({ transactions }),
      
      setSelectedWallet: (walletId) => set({ selectedWalletId: walletId }),
      
      setLoadingWallets: (loading) => set({ isLoadingWallets: loading }),
      
      setLoadingTransactions: (loading) => set({ isLoadingTransactions: loading }),
      
      updateWalletBalance: (walletId, balance, available) =>
        set((state) => ({
          wallets: state.wallets.map((w) =>
            w.id === walletId ? { ...w, balance, availableBalance: available } : w
          ),
        })),
    }),
    { name: 'TraydWallet' }
  )
);

// ============================================================
// NOTIFICATION STORE
// ============================================================

interface NotificationStoreState {
  /** Unread count */
  unreadCount: number;
  
  /** Notifications list */
  notifications: import('@/types').Notification[];
  
  /** Loading state */
  isLoading: boolean;
  
  // Actions
  setNotifications: (notifications: import('@/types').Notification[]) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: import('@/types').Notification) => void;
  removeNotification: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

/**
 * Notification Store - Manages notification state
 */
export const useNotificationStore = create<NotificationStoreState>()(
  devtools(
    (set, get) => ({
      // Initial state
      unreadCount: 0,
      notifications: [],
      isLoading: false,
      
      // Actions
      setNotifications: (notifications) =>
        set({
          notifications,
          unreadCount: notifications.filter((n) => !n.read).length,
        }),
      
      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        })),
      
      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({
            ...n,
            read: true,
            readAt: new Date().toISOString(),
          })),
          unreadCount: 0,
        })),
      
      addNotification: (notification) =>
        set((state) => ({
          notifications: [notification, ...state.notifications],
          unreadCount: state.unreadCount + (notification.read ? 0 : 1),
        })),
      
      removeNotification: (id) => {
        const notification = get().notifications.find((n) => n.id === id);
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
          unreadCount: notification && !notification.read
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount,
        }));
      },
      
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    { name: 'TraydNotifications' }
  )
);
