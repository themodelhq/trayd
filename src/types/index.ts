/**
 * Tray'd Enterprise Trading Platform
 * Core Type Definitions
 * @description Comprehensive TypeScript types for the entire trading platform
 */

// ============================================================
// USER & AUTHENTICATION TYPES
// ============================================================

/** User role enumeration for RBAC */
export type UserRole = 'user' | 'trader' | 'verified' | 'premium' | 'admin' | 'super_admin';

/** Authentication provider types */
export type AuthProvider = 'email' | 'google' | 'apple' | 'github' | 'facebook' | 'phone';

/** KYC verification status */
export type KycStatus = 'pending' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'not_started';

/** Two-factor authentication status */
export type TwoFAStatus = 'disabled' | 'enabled' | 'required';

/** User account status */
export type AccountStatus = 'active' | 'suspended' | 'banned' | 'frozen' | 'pending_verification';

/** Complete user profile interface */
export interface User {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatarUrl?: string;
  phone?: string;
  phoneVerified: boolean;
  emailVerified: boolean;
  role: UserRole;
  kycStatus: KycStatus;
  twoFAStatus: TwoFAStatus;
  accountStatus: AccountStatus;
  authProvider: AuthProvider;
  locale: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  preferences: UserPreferences;
}

/** User customizable preferences */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  currency: string;
  timezone: string;
  tradingView: TradingPreferences;
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
  display: DisplayPreferences;
}

/** Trading-specific preferences */
export interface TradingPreferences {
  defaultOrderType: OrderType;
  defaultMarginMode: 'cross' | 'isolated';
  showPositionPnl: boolean;
  confirmOrders: boolean;
  soundAlerts: boolean;
  slippageTolerance: number;
  leverageDefault: number;
}

/** Notification preferences */
export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
  tradeAlerts: boolean;
  priceAlerts: boolean;
  marketing: boolean;
  security: boolean;
}

/** Privacy preferences */
export interface PrivacyPreferences {
  profileVisibility: 'public' | 'private' | 'friends';
  showTradingActivity: boolean;
  allowCopyTrading: boolean;
  showOnLeaderboard: boolean;
}

/** Display/UI preferences */
export interface DisplayPreferences {
  layout: 'compact' | 'standard' | 'spacious';
  chartType: 'candles' | 'line' | 'area' | 'renko';
  fontSize: 'small' | 'medium' | 'large';
  animationsEnabled: boolean;
  glassmorphism: boolean;
}

/** Login credentials input */
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  twoFACode?: string;
}

/** Registration data */
export interface RegisterData {
  email: string;
  username?: string;
  password: string;
  firstName?: string;
  lastName?: string;
  referralCode?: string;
  acceptTerms: boolean;
  acceptMarketing?: boolean;
}

/** Session information */
export interface Session {
  token: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

/** Device/session record */
export interface DeviceSession {
  id: string;
  deviceId: string;
  deviceName: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  os: string;
  browser: string;
  ip: string;
  location?: string;
  lastActive: string;
  isCurrent: boolean;
}

// ============================================================
// MARKET DATA TYPES
// ============================================================

/** Asset/market category */
export type MarketCategory = 'crypto' | 'forex' | 'indices' | 'commodities' | 'stocks' | 'etf' | 'futures' | 'options';

/** Trading pair or instrument */
export interface MarketAsset {
  id: string;
  symbol: string;
  name: string;
  baseAsset: string;
  quoteAsset: string;
  category: MarketCategory;
  iconUrl?: string;
  isActive: boolean;
  priceData: PriceData;
  marketStats: MarketStats;
  tradingInfo: TradingInfo;
  metadata: AssetMetadata;
}

/** Current price information */
export interface PriceData {
  currentPrice: number;
  open24h: number;
  high24h: number;
  low24h: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  quoteVolume24h: number;
  lastTradeTime: string;
  bid?: number;
  ask?: number;
  spread?: number;
}

/** Market statistics */
export interface MarketStats {
  marketCap?: number;
  circulatingSupply?: number;
  totalSupply?: number;
  maxSupply?: number;
  ath: number;
  athDate: string;
  atl: number;
  atlDate: string;
  rank?: number;
  volatility30d?: number;
  dominance?: number;
}

/** Trading specifications */
export interface TradingInfo {
  minOrderSize: number;
  maxOrderSize: number;
  orderStep: number;
  priceStep: number;
  minPrice: number;
  maxPrice: number;
  leverageMin: number;
  leverageMax: number;
  marginRequirements: MarginRequirement[];
  feeMaker: number;
  feeTaker: number;
  supportedOrderTypes: OrderType[];
}

/** Margin requirement tiers */
export interface MarginRequirement {
  minNotional: number;
  maxNotional: number;
  initialMargin: number;
  maintenanceMargin: number;
}

/** Additional asset metadata */
export interface AssetMetadata {
  description?: string;
  website?: string;
  whitepaper?: string;
  explorer?: string;
  socialLinks?: Record<string, string>;
  tags?: string[];
  isStablecoin: boolean;
  launchDate?: string;
}

/** OHLCV candlestick data */
export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/** Supported timeframes */
export type Timeframe = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w' | '1M';

/** Depth/liquidity data */
export interface DepthData {
  bids: [number, number][]; // [price, quantity]
  asks: [number, number][]; // [price, quantity]
  timestamp: number;
}

/** Recent trade/tick */
export interface RecentTrade {
  id: string;
  price: number;
  quantity: number;
  side: 'buy' | 'sell';
  time: string;
  isMakerBuy: boolean;
}

/** Market sentiment indicator */
export interface MarketSentiment {
  longShortRatio: number;
  longPercentage: number;
  shortPercentage: number;
  topTradersLong: number;
  topTradersShort: number;
  overall: 'bullish' | 'bearish' | 'neutral';
  timestamp: string;
}

// ============================================================
// TRADING TYPES
// ============================================================

/** Order type enumeration */
export type OrderType = 'market' | 'limit' | 'stop' | 'stop_limit' | 'oco' | 'iceberg' | 'trailing_stop' | 'basket' | 'recurring';

/** Order side */
export type OrderSide = 'buy' | 'sell';

/** Order status lifecycle */
export type OrderStatus = 'pending' | 'open' | 'partially_filled' | 'filled' | 'cancelled' | 'rejected' | 'expired';

/** Time in force options */
export type TimeInForce = 'GTC' | 'IOC' | 'FOK' | 'GTX' | 'DAY';

/** Order interface */
export interface Order {
  id: string;
  userId: string;
  symbol: string;
  type: OrderType;
  side: OrderSide;
  status: OrderStatus;
  price?: number;
  stopPrice?: number;
  averagePrice?: number;
  quantity: number;
  filledQuantity: number;
  remainingQuantity: number;
  timeInForce: TimeInForce;
  leverage: number;
  marginMode: 'cross' | 'isolated';
  reduceOnly: boolean;
  postOnly: boolean;
  fee: number;
  feeCurrency: string;
  profitLoss?: number;
  profitLossPercent?: number;
  createdAt: string;
  updatedAt: string;
  filledAt?: string;
  cancelledAt?: string;
  expiresAt?: string;
  clientOrderId?: string;
  metadata?: OrderMetadata;
}

/** Extended order metadata */
export interface OrderMetadata {
  icebergTotalQty?: number;
  icebergDisplayQty?: number;
  ocoStopPrice?: number;
  ocoStopLimitPrice?: string;
  trailingStopPercent?: number;
  trailingStopActivationPrice?: number;
  basketOrders?: string[];
  recurringInterval?: string;
  source: 'manual' | 'api' | 'bot' | 'copy' | 'ai_signal';
  stopLossId?: string;
  takeProfitId?: string;
}

/** Open position */
export interface Position {
  id: string;
  userId: string;
  symbol: string;
  side: OrderSide;
  size: number;
  entryPrice: number;
  markPrice: number;
  liquidationPrice: number;
  leverage: number;
  marginMode: 'cross' | 'isolated';
  marginUsed: number;
  unrealizedPnl: number;
  realizedPnl: number;
  pnlPercent: number;
  fundingFee?: number;
  fundingRate?: number;
  nextFundingTime?: string;
  openTime: string;
  updatedAt: string;
  takeProfitId?: string;
  stopLossId?: string;
  tradesCount: number;
}

/** Trade execution record */
export interface Trade {
  id: string;
  orderId: string;
  positionId?: string;
  symbol: string;
  side: OrderSide;
  price: number;
  quantity: number;
  fee: number;
  feeCurrency: string;
  commission: number;
  isMaker: boolean;
  liquidation: boolean;
  time: string;
}

/** Trade history entry with additional context */
export interface TradeHistoryEntry extends Trade {
  pnl?: number;
  pnlPercent?: number;
  holdingPeriod?: string;
  strategy?: string;
  tags?: string[];
  notes?: string;
}

/** Stop Loss / Take Profit configuration */
export interface SlopTakeConfig {
  type: 'stop_loss' | 'take_profit';
  triggerPrice: number;
  quantity?: number; // undefined = full position
  trailing?: boolean;
  trailingPercent?: number;
}

/** OCO (One Cancels Other) order configuration */
export interface OCOConfig {
  stopLoss: SlopTakeConfig;
  takeProfit: SlopTakeConfig;
}

/** Grid trading configuration */
export interface GridConfig {
  upperPrice: number;
  lowerPrice: number;
  gridCount: number;
  quantityPerGrid: number;
  investAmount: number;
  mode: 'arithmetic' | 'geometric';
  stopLoss?: number;
  takeProfit?: number;
}

/** DCA (Dollar Cost Averaging) configuration */
export interface DCAConfig {
  totalAmount: number;
  orderCount: number;
  frequency: 'hourly' | 'daily' | 'weekly';
  maxPrice?: number;
  minPrice?: number;
  deviationPercent?: number;
}

/** TWAP (Time Weighted Average Price) configuration */
export interface TWAPConfig {
  totalAmount: number;
  durationMinutes: number;
  sliceInterval: number; // seconds between slices
  maxParticipationRate?: number;
  allowOverflow: boolean;
}

// ============================================================
// WALLET & PAYMENT TYPES
// ============================================================

/** Wallet type */
export type WalletType = 'fiat' | 'crypto' | 'margin' | 'earnings' | 'bonus';

/** Wallet currency codes */
export type CurrencyCode = 
  | 'USD' | 'EUR' | 'GBP' | 'NGN' | 'GHS' | 'KES' | 'ZAR'
  | 'BTC' | 'ETH' | 'USDT' | 'USDC' | 'BUSD' | 'SOL' | 'BNB'
  | 'XRP' | 'ADA' | 'DOGE' | 'DOT' | 'MATIC' | 'AVAX' | 'LINK';

/** Transaction type */
export type TransactionType = 
  | 'deposit' | 'withdrawal' | 'transfer' | 'trade' | 'fee'
  | 'refund' | 'airdrop' | 'staking_reward' | 'interest' | 'bonus'
  | 'conversion' | 'internal_transfer' | 'copy_trading_fee' | 'subscription';

/** Transaction status */
export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'reversed' | 'refunded';

/** Wallet interface */
export interface Wallet {
  id: string;
  userId: string;
  type: WalletType;
  currency: CurrencyCode;
  balance: number;
  availableBalance: number;
  frozenBalance: number;
  address?: string;
  network?: string;
  createdAt: string;
  updatedAt: string;
}

/** Transaction record */
export interface Transaction {
  id: string;
  walletId: string;
  userId: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  fee: number;
  currency: CurrencyCode;
  description: string;
  referenceId?: string;
  externalTxHash?: string;
  metadata?: TransactionMetadata;
  createdAt: string;
  completedAt?: string;
}

/** Transaction extended metadata */
export interface TransactionMetadata {
  paymentMethod?: string;
  paymentProvider?: string;
  bankName?: string;
  accountNumberLast4?: string;
  cardLast4?: string;
  fromWallet?: string;
  toWallet?: string;
  orderId?: string;
  tradeId?: string;
  reason?: string;
  attachmentUrls?: string[];
}

/** Deposit request */
export interface DepositRequest {
  walletId: string;
  amount: number;
  currency: CurrencyCode;
  paymentMethod: 'bank_transfer' | 'card' | 'crypto' | 'paystack';
  redirectUrl?: string;
  metadata?: Record<string, unknown>;
}

/** Withdrawal request */
export interface WithdrawalRequest {
  walletId: string;
  amount: number;
  currency: CurrencyCode;
  destination: WithdrawalDestination;
  twoFACode?: string;
}

/** Withdrawal destination */
export interface WithdrawalDestination {
  type: 'bank_account' | 'crypto_address' | 'internal_transfer';
  bankDetails?: BankAccountDetails;
  cryptoAddress?: CryptoAddressDetails;
  internalUserId?: string;
  internalWalletId?: string;
}

/** Bank account details */
export interface BankAccountDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  routingNumber?: string;
  swiftCode?: string;
  sortCode?: string;
}

/** Crypto address details */
export interface CryptoAddressDetails {
  address: string;
  network: string;
  memo?: string;
  tag?: string;
}

/** Payment method configuration */
export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'paystack' | 'flutterwave';
  isDefault: boolean;
  details: CardDetails | BankAccountDetails;
  verified: boolean;
  addedAt: string;
}

/** Card details (masked) */
export interface CardDetails {
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  billingCountry?: string;
}

// ============================================================
// PORTFOLIO & ANALYTICS TYPES
// ============================================================

/** Portfolio summary */
export interface PortfolioSummary {
  totalValue: number;
  totalValueChange: number;
  totalValueChangePercent: number;
  todayPnl: number;
  todayPnlPercent: number;
  availableBalance: number;
  usedMargin: number;
  marginRatio: number;
  marginLevel: number;
  openPositionsValue: number;
  pendingOrdersValue: number;
  winRate: number;
  totalTrades: number;
  profitableTrades: number;
  losingTrades: number;
  largestWin: number;
  largestLoss: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  sharpeRatio?: number;
  maxDrawdown: number;
  expectancy: number;
}

/** Asset allocation item */
export interface AssetAllocation {
  symbol: string;
  name: string;
  value: number;
  percentage: number;
  change24h: number;
  iconUrl?: string;
}

/** Performance metrics over time */
export interface PerformanceMetrics {
  period: 'day' | 'week' | 'month' | 'year' | 'all';
  startValue: number;
  endValue: number;
  pnl: number;
  pnlPercent: number;
  peakValue: number;
  troughValue: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  volatility: number;
  sharpeRatio: number;
  sortinoRatio: number;
  calmarRatio: number;
  dataPoints: PerformanceDataPoint[];
}

/** Single performance data point */
export interface PerformanceDataPoint {
  date: string;
  value: number;
  pnl: number;
  benchmark?: number;
}

/** Risk assessment result */
export interface RiskAssessment {
  overallScore: number; // 0-100
  level: 'low' | 'moderate' | 'high' | 'extreme';
  factors: RiskFactor[];
  recommendations: string[];
  lastUpdated: string;
}

/** Individual risk factor */
export interface RiskFactor {
  name: string;
  score: number;
  weight: number;
  description: string;
  status: 'good' | 'warning' | 'critical';
}

/** Trading journal entry */
export interface JournalEntry {
  id: string;
  userId: string;
  tradeId?: string;
  title: string;
  content: string;
  mood: 'positive' | 'neutral' | 'negative';
  tags: string[];
  screenshots?: string[];
  lessonLearned?: string;
  mistakesMade?: string;
  whatWentWell?: string;
  strategy: string;
  setupQuality: number; // 1-5
  executionQuality: number; // 1-5
  riskRewardRatio: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// COPY TRADING & SOCIAL TYPES
// ============================================================

/** Trader profile for copy trading */
export interface TraderProfile {
  userId: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  isPublic: boolean;
  stats: TraderStats;
  performance: TraderPerformance;
  preferences: CopyTradingPreferences;
  followers: number;
  following: boolean;
  subscribed: boolean;
}

/** Trader statistics */
export interface TraderStats {
  totalTrades: number;
  winRate: number;
  totalPnl: number;
  totalReturnPercent: number;
  bestStreak: number;
  worstStreak: number;
  avgTradeDuration: string;
  activeFollowers: number;
  copiedTimes: number;
  since: string;
  lastActive: string;
}

/** Trader performance breakdown */
export interface TraderPerformance {
  daily: PeriodPerformance;
  weekly: PeriodPerformance;
  monthly: PeriodPerformance;
  yearly: PeriodPerformance;
  allTime: PeriodPerformance;
}

/** Performance for a specific period */
export interface PeriodPerformance {
  pnl: number;
  percent: number;
  drawdown: number;
  trades: number;
}

/** Copy trading preferences set by trader */
export interface CopyTradingPreferences {
  allowCopying: boolean;
  maxCopiers: number;
  maxCopyAmount: number;
  feePercent: number;
  minCopyAmount: number;
  showPositions: boolean;
  showHistory: boolean;
}

/** Active copy subscription */
export interface CopySubscription {
  id: string;
  followerId: string;
  traderId: string;
  traderUserId: string;
  allocationAmount: number;
  allocationPercent: number;
  copyOpenTrades: boolean;
  maxRiskPercent: number;
  stopLoss: number;
  takeProfit: number;
  status: 'active' | 'paused' | 'cancelled';
  totalCopied: number;
  totalPnl: number;
  startedAt: string;
  updatedAt: string;
}

// ============================================================
// NOTIFICATION TYPES
// ============================================================

/** Notification category */
export type NotificationCategory = 
  | 'trade' | 'order' | 'price_alert' | 'volume_alert' | 'news'
  | 'system' | 'security' | 'social' | 'payment' | 'marketing';

/** Notification priority */
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

/** Notification record */
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  icon?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  readAt?: string;
}

/** Price alert configuration */
export interface PriceAlert {
  id: string;
  userId: string;
  symbol: string;
  condition: 'above' | 'below';
  targetPrice: number;
  triggered: boolean;
  triggeredAt?: string;
  oneTime: boolean;
  createdAt: string;
}

/** Push notification subscription */
export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  device: string;
  userAgent: string;
  createdAt: string;
}

// ============================================================
// ADMIN TYPES
// ============================================================

/** Admin dashboard analytics */
export interface AdminAnalytics {
  overview: PlatformOverview;
  users: UserAnalytics;
  trading: TradingAnalytics;
  revenue: RevenueAnalytics;
  system: SystemHealth;
}

/** Platform overview stats */
export interface PlatformOverview {
  totalUsers: number;
  activeUsers24h: number;
  activeUsers7d: number;
  activeUsers30d: number;
  newUsersToday: number;
  newUsersWeek: number;
  newUsersMonth: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalVolume24h: number;
  totalVolumeMonth: number;
  openPositions: number;
  openOrders: number;
}

/** User analytics */
export interface UserAnalytics {
  growth: GrowthData[];
  kycStats: Record<KycStatus, number>;
  countryDistribution: CountryData[];
  deviceDistribution: DeviceData[];
}

/** Simple growth data point */
export interface GrowthData {
  date: string;
  count: number;
}

/** Country distribution */
export interface CountryData {
  country: string;
  count: number;
  percentage: number;
}

/** Device distribution */
export interface DeviceData {
  device: string;
  count: number;
  percentage: number;
}

/** Trading analytics */
export interface TradingAnalytics {
  volumeByAsset: AssetVolumeData[];
  volumeByUserTier: TierVolumeData[];
  orderStats: OrderStats;
  popularPairs: PopularPairData[];
}

/** Volume by asset */
export interface AssetVolumeData {
  symbol: string;
  volume: number;
  trades: number;
  change: number;
}

/** Volume by user tier */
export interface TierVolumeData {
  tier: string;
  volume: number;
  percentage: number;
}

/** Order statistics */
export interface OrderStats {
  total: number;
  filled: number;
  cancelled: number;
  rejected: number;
  avgFillTime: number;
}

/** Popular trading pairs */
export interface PopularPairData {
  symbol: string;
  name: string;
  volume: number;
  traders: number;
  change: number;
}

/** Revenue analytics */
export interface RevenueAnalytics {
  total: number;
  monthly: MonthlyRevenue[];
  bySource: RevenueSourceData[];
  byCurrency: RevenueCurrencyData[];
}

/** Monthly revenue */
export interface MonthlyRevenue {
  month: string;
  tradingFees: number;
  withdrawalFees: number;
  premiumSubscriptions: number;
  other: number;
  total: number;
}

/** Revenue by source */
export interface RevenueSourceData {
  source: string;
  amount: number;
  percentage: number;
}

/** Revenue by currency */
export interface RevenueCurrencyData {
  currency: string;
  amount: number;
}

/** System health metrics */
export interface SystemHealth {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  uptime: number;
  apiLatency: number;
  errorRate: number;
  activeConnections: number;
  queueLength: number;
  services: ServiceStatus[];
}

/** Individual service status */
export interface ServiceStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  latency: number;
  lastCheck: string;
}

/** Audit log entry */
export interface AuditLog {
  id: string;
  userId?: string;
  adminId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

/** Support ticket */
export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
  assignedTo?: string;
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

/** Ticket message */
export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderRole: 'user' | 'support' | 'admin';
  content: string;
  attachments?: string[];
  createdAt: string;
}

// ============================================================
// AI FEATURES TYPES
// ============================================================

/** AI analysis response */
export interface AIAnalysis {
  id: string;
  type: 'portfolio' | 'market' | 'trade' | 'risk' | 'sentiment';
  title: string;
  summary: string;
  insights: AIInsight[];
  confidence: number; // 0-1
  timestamp: string;
  dataVersion: string;
}

/** Individual AI insight */
export interface AIInsight {
  type: 'opportunity' | 'warning' | 'info' | 'recommendation' | 'prediction';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  actionText?: string;
  data?: Record<string, unknown>;
}

/** AI chat message */
export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  sources?: AISource[];
}

/** AI citation/source */
export interface AISource {
  title: string;
  url: string;
  relevance: number;
}

/** Natural language query response */
export interface NLQueryResponse {
  query: string;
  intent: string;
  answer: string;
  visualizations?: VisualizationConfig[];
  followUpQuestions: string[];
  relatedAssets?: string[];
}

/** Visualization configuration */
export interface VisualizationConfig {
  type: 'chart' | 'table' | 'metric' | 'heatmap';
  title: string;
  config: Record<string, unknown>;
}

// ============================================================
// COMPLIANCE TYPES
// ============================================================

/** KYC submission */
export interface KycSubmission {
  id: string;
  userId: string;
  status: KycStatus;
  documentType: 'passport' | 'id_card' | 'drivers_license' | 'residence_permit';
  documentFrontUrl: string;
  documentBackUrl?: string;
  selfieUrl: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewerId?: string;
  rejectionReason?: string;
}

/** AML alert */
export interface AMLAlert {
  id: string;
  userId: string;
  riskScore: number;
  type: string;
  description: string;
  transactionIds: string[];
  status: 'pending' | 'investigating' | 'cleared' | 'reported' | 'dismissed';
  createdAt: string;
  resolvedAt?: string;
}

/** Consent record */
export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  version: string;
  granted: boolean;
  grantedAt: string;
  revokedAt?: string;
  ipAddress: string;
}

// ============================================================
// REFERRAL & REWARDS TYPES
// ============================================================

/** Referral program info */
export interface ReferralProgram {
  code: string;
  referralCount: number;
  successfulReferrals: number;
  totalEarned: number;
  availableBalance: number;
  pendingRewards: number;
  tier: ReferralTier;
  rewards: ReferralReward[];
}

/** Referral tier */
export interface ReferralTier {
  level: number;
  name: string;
  bonusPercentage: number;
  requiredReferrals: number;
  benefits: string[];
}

/** Individual referral reward */
export interface ReferralReward {
  id: string;
  referredUserId: string;
  referredUsername: string;
  amount: number;
  type: 'signup' | 'deposit' | 'trade' | 'tier_bonus';
  status: 'pending' | 'available' | 'claimed' | 'expired';
  earnedAt: string;
  availableAt: string;
  expiresAt?: string;
}

/** Achievement/badge */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  progress: number;
  maxProgress: number;
  unlockedAt?: string;
}

/** Leaderboard entry */
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatarUrl?: string;
  value: number;
  change: number;
  badge?: string;
}

// ============================================================
// WEBSOCKET MESSAGE TYPES
// ============================================================

/** WebSocket message types */
export type WSMessageType =
  | 'price_update'
  | 'depth_update'
  | 'trade_update'
  | 'order_update'
  | 'position_update'
  | 'balance_update'
  | 'notification'
  | 'system'
  | 'error'
  | 'subscribed'
  | 'unsubscribed'
  | 'pong';

/** Base WebSocket message */
export interface WSMessage<T = unknown> {
  type: WSMessageType;
  channel?: string;
  data: T;
  timestamp: number;
  sequence?: number;
}

/** Price update message */
export interface WSPriceUpdate {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  bid: number;
  ask: number;
}

/** Depth update message */
export interface WSDepthUpdate {
  symbol: string;
  bids: [number, number][];
  asks: [number, number][];
}

/** Order update message */
export interface WSOrderUpdate {
  orderId: string;
  symbol: string;
  status: OrderStatus;
  filledQuantity: number;
  remainingQuantity: number;
  averagePrice?: number;
  price?: number;
}

/** Balance update message */
export interface WSBalanceUpdate {
  currency: CurrencyCode;
  available: number;
  frozen: number;
  total: number;
}

// ============================================================
// API RESPONSE TYPES
// ============================================================

/** Standard API response wrapper */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

/** Error details */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

/** Pagination metadata */
export interface ResponseMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

/** Paginated response */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: ResponseMeta;
}
