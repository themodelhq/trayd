/**
 * Tray'd Trading Platform Constants
 * @description Centralized constants for the entire application
 */

// ============================================================
// APPLICATION CONSTANTS
// ============================================================

export const APP_NAME = "Tray'd";
export const APP_TAGLINE = 'Professional Crypto & Forex Trading';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Enterprise-grade cryptocurrency and forex trading platform';

/** Supported locales */
export const SUPPORTED_LOCALES = [
  'en',
  'es',
  'fr',
  'de',
  'pt',
  'zh',
  'ja',
  'ko',
  'ar',
  'hi',
] as const;

/** Supported currencies for display */
export const SUPPORTED_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', flag: '🇳🇬' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵', flag: '🇬🇭' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', flag: '🇰🇪' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿🇦' },
] as const;

// ============================================================
// TRADING CONSTANTS
// ============================================================

/** Default leverage options */
export const LEVERAGE_OPTIONS = [1, 2, 3, 5, 10, 20, 25, 50, 75, 100, 125] as const;

/** Default margin modes */
export const MARGIN_MODES = ['cross', 'isolated'] as const;

/** Order types with descriptions */
export const ORDER_TYPES = {
  market: { label: 'Market', description: 'Execute immediately at market price' },
  limit: { label: 'Limit', description: 'Execute at specified price or better' },
  stop: { label: 'Stop Market', description: 'Trigger market order when price reached' },
  stop_limit: { label: 'Stop Limit', description: 'Trigger limit order when price reached' },
  oco: { label: 'OCO', description: 'One Cancels Other - SL + TP' },
  iceberg: { label: 'Iceberg', description: 'Hide large order size' },
  trailing_stop: { label: 'Trailing Stop', description: 'Follow price at set distance' },
  basket: { label: 'Basket', description: 'Multiple orders in one' },
  recurring: { label: 'Recurring', description: 'Scheduled repeating orders' },
} as const;

/** Time in force options */
export const TIME_IN_FORCE = {
  GTC: { label: 'Good Till Cancelled', description: 'Order until cancelled' },
  IOC: { label: 'Immediate or Cancel', description: 'Fill what you can now' },
  FOK: { label: 'Fill or Kill', description: 'All or nothing, immediate' },
  GTX: { label: 'Post Only', description: 'Maker only order' },
  DAY: { label: 'Day Order', description: 'Expires at end of day' },
} as const;

/** Chart timeframes */
export const TIMEFRAMES = [
  { value: '1m', label: '1m', seconds: 60 },
  { value: '5m', label: '5m', seconds: 300 },
  { value: '15m', label: '15m', seconds: 900 },
  { value: '30m', label: '30m', seconds: 1800 },
  { value: '1h', label: '1H', seconds: 3600 },
  { value: '4h', label: '4H', seconds: 14400 },
  { value: '1d', label: '1D', seconds: 86400 },
  { value: '1w', label: '1W', seconds: 604800 },
  { value: '1M', label: '1M', seconds: 2592000 },
] as const;

/** Chart types */
export const CHART_TYPES = [
  { value: 'candles', label: 'Candles' },
  { value: 'line', label: 'Line' },
  { value: 'area', label: 'Area' },
  { value: 'renko', label: 'Renko' },
] as const;

/** Default trading fees (in percentage) */
export const DEFAULT_FEES = {
  maker: 0.1,
  taker: 0.15,
  withdrawal: {
    crypto: 0.001,
    fiat: 0.5,
  },
  deposit: {
    crypto: 0,
    fiat: 2.5,
  },
} as const;

/** Risk management limits */
export const RISK_LIMITS = {
  maxLeverage: 125,
  maxPositionSize: 1000000, // $1M
  maxDailyLossPercent: 50, // 50% of account
  maxOpenOrders: 100,
  maxOrderSizePercent: 20, // 20% of balance per order
  minOrderSize: 10, // $10 minimum
} as const;

// ============================================================
// MARKET CATEGORIES
// ============================================================

/** Market category definitions */
export const MARKET_CATEGORIES = [
  { 
    id: 'crypto', 
    label: 'Cryptocurrency', 
    icon: 'Bitcoin',
    color: '#F7931A',
    description: 'Digital currencies and tokens'
  },
  { 
    id: 'forex', 
    label: 'Forex', 
    icon: 'DollarSign',
    color: '#26A17B',
    description: 'Foreign exchange pairs'
  },
  { 
    id: 'indices', 
    label: 'Indices', 
    icon: 'TrendingUp',
    color: '#627EEA',
    description: 'Stock market indices'
  },
  { 
    id: 'commodities', 
    label: 'Commodities', 
    icon: 'Gem',
    color: '#FFD700',
    description: 'Gold, oil, and other commodities'
  },
  { 
    id: 'stocks', 
    label: 'Stocks', 
    icon: 'BarChart3',
    color: '#00D4AA',
    description: 'Individual company stocks'
  },
  { 
    id: 'etf', 
    label: 'ETFs', 
    icon: 'Layers',
    color: '#5865F2',
    description: 'Exchange traded funds'
  },
  { 
    id: 'futures', 
    label: 'Futures', 
    icon: 'Clock',
    color: '#FF6B35',
    description: 'Derivative contracts'
  },
  { 
    id: 'options', 
    label: 'Options', 
    icon: 'GitBranch',
    color: '#E84142',
    description: 'Options contracts'
  },
] as const;

// ============================================================
// SAMPLE CRYPTO ASSETS
// ============================================================

/** Popular cryptocurrency assets with mock data */
export const SAMPLE_CRYPTO_ASSETS = [
  {
    id: 'bitcoin',
    symbol: 'BTC/USDT',
    name: 'Bitcoin',
    baseAsset: 'BTC',
    quoteAsset: 'USDT',
    category: 'crypto' as const,
    priceData: {
      currentPrice: 67543.21,
      open24h: 66234.56,
      high24h: 68901.23,
      low24h: 65432.10,
      change24h: 1308.65,
      changePercent24h: 1.98,
      volume24h: 28500000000,
      quoteVolume24h: 423000000,
      lastTradeTime: new Date().toISOString(),
      bid: 67540.12,
      ask: 67546.30,
      spread: 6.18,
    },
    marketStats: {
      marketCap: 1325000000000,
      circulatingSupply: 19600000,
      totalSupply: 21000000,
      maxSupply: 21000000,
      ath: 73750.00,
      athDate: '2024-03-14',
      atl: 67.81,
      atlDate: '2013-07-06',
      rank: 1,
      volatility30d: 45.2,
      dominance: 52.3,
    },
    tradingInfo: {
      minOrderSize: 0.0001,
      maxOrderSize: 100,
      orderStep: 0.0001,
      priceStep: 0.01,
      minPrice: 1,
      maxPrice: 1000000,
      leverageMin: 1,
      leverageMax: 125,
      marginRequirements: [],
      feeMaker: 0.1,
      feeTaker: 0.15,
      supportedOrderTypes: ['market', 'limit', 'stop', 'stop_limit'],
    },
    metadata: {
      description: 'The first and largest cryptocurrency by market cap',
      website: 'https://bitcoin.org',
      explorer: 'https://blockchain.info',
      isStablecoin: false,
      tags: ['defi', 'store-of-value', 'pow'],
    },
  },
  {
    id: 'ethereum',
    symbol: 'ETH/USDT',
    name: 'Ethereum',
    baseAsset: 'ETH',
    quoteAsset: 'USDT',
    category: 'crypto' as const,
    priceData: {
      currentPrice: 3456.78,
      open24h: 3389.45,
      high24h: 3512.34,
      low24h: 3345.67,
      change24h: 67.33,
      changePercent24h: 1.99,
      volume24h: 15200000000,
      quoteVolume44h: 4400000,
      lastTradeTime: new Date().toISOString(),
      bid: 3455.90,
      ask: 3457.66,
      spread: 1.76,
    },
    marketStats: {
      marketCap: 415000000000,
      circulatingSupply: 120200000,
      totalSupply: 120200000,
      maxSupply: null,
      ath: 4878.26,
      athDate: '2021-11-10',
      atl: 0.4329,
      atlDate: '2015-10-21',
      rank: 2,
      volatility30d: 52.1,
      dominance: 16.4,
    },
    tradingInfo: {
      minOrderSize: 0.001,
      maxOrderSize: 500,
      orderStep: 0.001,
      priceStep: 0.01,
      minPrice: 1,
      maxPrice: 100000,
      leverageMin: 1,
      leverageMax: 75,
      marginRequirements: [],
      feeMaker: 0.1,
      feeTaker: 0.15,
      supportedOrderTypes: ['market', 'limit', 'stop', 'stop_limit'],
    },
    metadata: {
      description: 'Leading smart contract platform for decentralized applications',
      website: 'https://ethereum.org',
      explorer: 'https://etherscan.io',
      isStablecoin: false,
      tags: ['defi', 'smart-contracts', 'pos'],
    },
  },
  {
    id: 'solana',
    symbol: 'SOL/USDT',
    name: 'Solana',
    baseAsset: 'SOL',
    quoteAsset: 'USDT',
    category: 'crypto' as const,
    priceData: {
      currentPrice: 178.45,
      open24h: 172.34,
      high24h: 182.56,
      low24h: 170.12,
      change24h: 6.11,
      changePercent24h: 3.55,
      volume24h: 3200000000,
      quoteVolume24h: 17900000,
      lastTradeTime: new Date().toISOString(),
      bid: 178.40,
      ask: 178.50,
      spread: 0.10,
    },
    marketStats: {
      marketCap: 82000000000,
      circulatingSupply: 459000000,
      totalSupply: 578000000,
      maxSupply: null,
      ath: 260.06,
      athDate: '2021-11-06',
      atl: 0.50,
      atlDate: '2020-05-11',
      rank: 5,
      volatility30d: 68.5,
      dominance: 3.2,
    },
    tradingInfo: {
      minOrderSize: 0.01,
      maxOrderSize: 10000,
      orderStep: 0.01,
      priceStep: 0.01,
      minPrice: 0.01,
      maxPrice: 10000,
      leverageMin: 1,
      leverageMax: 25,
      marginRequirements: [],
      feeMaker: 0.1,
      feeTaker: 0.15,
      supportedOrderTypes: ['market', 'limit', 'stop', 'stop_limit'],
    },
    metadata: {
      description: 'High-performance blockchain for decentralized apps',
      website: 'https://solana.com',
      explorer: 'https://explorer.solana.com',
      isStablecoin: false,
      tags: ['defi', 'nft', 'high-throughput'],
    },
  },
  {
    id: 'binance-coin',
    symbol: 'BNB/USDT',
    name: 'BNB',
    baseAsset: 'BNB',
    quoteAsset: 'USDT',
    category: 'crypto' as const,
    priceData: {
      currentPrice: 598.23,
      open24h: 585.67,
      high24h: 608.90,
      low24h: 580.34,
      change24h: 12.56,
      changePercent24h: 2.14,
      volume24h: 1800000000,
      quoteVolume24h: 3010000,
      lastTradeTime: new Date().toISOString(),
      bid: 598.15,
      ask: 598.31,
      spread: 0.16,
    },
    marketStats: {
      marketCap: 89500000000,
      circulatingSync: 149500000,
      totalSupply: 149500000,
      maxSupply: 200000000,
      ath: 720.67,
      athDate: '2024-06-04',
      atl: 0.0398,
      atlDate: '2017-10-19',
      rank: 4,
      volatility30d: 48.3,
      dominance: 3.5,
    },
    tradingInfo: {
      minOrderSize: 0.001,
      maxOrderSize: 5000,
      orderStep: 0.001,
      priceStep: 0.01,
      minPrice: 0.01,
      maxPrice: 10000,
      leverageMin: 1,
      leverageMax: 50,
      marginRequirements: [],
      feeMaker: 0.1,
      feeTaker: 0.15,
      supportedOrderTypes: ['market', 'limit', 'stop', 'stop_limit'],
    },
    metadata: {
      description: 'Native token of Binance ecosystem',
      website: 'https://www.binance.com',
      explorer: 'https://bscscan.com',
      isStablecoin: false,
      tags: ['exchange', 'cefi', 'bsc-chain'],
    },
  },
  {
    id: 'ripple',
    symbol: 'XRP/USDT',
    name: 'Ripple',
    baseAsset: 'XRP',
    quoteAsset: 'USDT',
    category: 'crypto' as const,
    priceData: {
      currentPrice: 0.5234,
      open24h: 0.5123,
      high24h: 0.5345,
      low24h: 0.5089,
      change24h: 0.0111,
      changePercent24h: 2.17,
      volume24h: 2100000000,
      quoteVolume24h: 4020000000,
      lastTradeTime: new Date().toISOString(),
      bid: 0.5232,
      ask: 0.5236,
      spread: 0.0004,
    },
    marketStats: {
      marketCap: 28500000000,
      circulatingSupply: 54500000000,
      totalSupply: 99900000000,
      maxSupply: 100000000000,
      ath: 3.40,
      athDate: '2018-01-07',
      atl: 0.0028,
      atlDate: '2014-07-02',
      rank: 7,
      volatility30d: 55.8,
      dominance: 1.1,
    },
    tradingInfo: {
      minOrderSize: 1,
      maxOrderSize: 1000000,
      orderStep: 1,
      priceStep: 0.0001,
      minPrice: 0.0001,
      maxPrice: 100,
      leverageMin: 1,
      leverageMax: 20,
      marginRequirements: [],
      feeMaker: 0.1,
      feeTaker: 0.15,
      supportedOrderTypes: ['market', 'limit', 'stop', 'stop_limit'],
    },
    metadata: {
      description: 'Digital payment protocol for banks',
      website: 'https://ripple.com',
      explorer: 'https://xrpscan.com',
      isStablecoin: false,
      tags: ['payments', 'banks', 'xrp-ledger'],
    },
  },
  {
    id: 'cardano',
    symbol: 'ADA/USDT',
    name: 'Cardano',
    baseAsset: 'ADA',
    quoteAsset: 'USDT',
    category: 'crypto' as const,
    priceData: {
      currentPrice: 0.4567,
      open24h: 0.4456,
      high24h: 0.4678,
      low24h: 0.4412,
      change24h: 0.0111,
      changePercent24h: 2.49,
      volume24h: 890000000,
      quoteVolume24h: 1950000000,
      lastTradeTime: new Date().toISOString(),
      bid: 0.4565,
      ask: 0.4569,
      spread: 0.0004,
    },
    marketStats: {
      marketCap: 16100000000,
      circulatingSupply: 35200000000,
      totalSupply: 45000000000,
      maxSupply: 45000000000,
      ath: 3.10,
      athDate: '2021-09-02',
      atl: 0.0173,
      atlDate: '2020-03-13',
      rank: 11,
      volatility30d: 62.4,
      dominance: 0.64,
    },
    tradingInfo: {
      minOrderSize: 1,
      maxOrderSize: 5000000,
      orderStep: 1,
      priceStep: 0.0001,
      minPrice: 0.0001,
      maxPrice: 100,
      leverageMin: 1,
      leverageMax: 20,
      marginRequirements: [],
      feeMaker: 0.1,
      feeTaker: 0.15,
      supportedOrderTypes: ['market', 'limit', 'stop', 'stop_limit'],
    },
    metadata: {
      description: 'Proof-of-stake blockchain platform',
      website: 'https://cardano.org',
      explorer: 'https://cardanoscan.io',
      isStablecoin: false,
      tags: ['pos', 'smart-contracts', 'research'],
    },
  },
  {
    id: 'dogecoin',
    symbol: 'DOGE/USDT',
    name: 'Dogecoin',
    baseAsset: 'DOGE',
    quoteAsset: 'USDT',
    category: 'crypto' as const,
    priceData: {
      currentPrice: 0.1234,
      open24h: 0.1198,
      high24h: 0.1278,
      low24h: 0.1180,
      change24h: 0.0036,
      changePercent24h: 3.00,
      volume24h: 1200000000,
      quoteVolume24h: 9730000000,
      lastTradeTime: new Date().toISOString(),
      bid: 0.1233,
      ask: 0.1235,
      spread: 0.0002,
    },
    marketStats: {
      marketCap: 18100000000,
      circulatingSupply: 146000000000,
      totalSupply: null,
      maxSupply: null,
      ath: 0.74,
      athDate: '2021-05-08',
      atl: 0.00008547,
      atlDate: '2015-05-07',
      rank: 9,
      volatility30d: 72.3,
      dominance: 0.72,
    },
    tradingInfo: {
      minOrderSize: 1,
      maxOrderSize: 10000000,
      orderStep: 1,
      priceStep: 0.0001,
      minPrice: 0.0001,
      maxPrice: 10,
      leverageMin: 1,
      leverageMax: 20,
      marginRequirements: [],
      feeMaker: 0.1,
      feeTaker: 0.15,
      supportedOrderTypes: ['market', 'limit', 'stop', 'stop_limit'],
    },
    metadata: {
      description: 'The original meme cryptocurrency',
      website: 'https://dogecoin.com',
      explorer: 'https://dogechain.info',
      isStablecoin: false,
      tags: ['meme', 'community', 'tips'],
    },
  },
  {
    id: 'polkadot',
    symbol: 'DOT/USDT',
    name: 'Polkadot',
    baseAsset: 'DOT',
    quoteAsset: 'USDT',
    category: 'crypto' as const,
    priceData: {
      currentPrice: 7.89,
      open24h: 7.67,
      high24h: 8.05,
      low24h: 7.56,
      change24h: 0.22,
      changePercent24h: 2.87,
      volume24h: 450000000,
      quoteVolume24h: 57100000,
      lastTradeTime: new Date().toISOString(),
      bid: 7.88,
      ask: 7.90,
      spread: 0.02,
    },
    marketStats: {
      marketCap: 10500000000,
      circulatingSupply: 1330000000,
      totalSupply: 1380000000,
      maxSupply: null,
      ath: 55.05,
      athDate: '2021-11-04',
      atl: 2.70,
      atlDate: '2020-08-19',
      rank: 16,
      volatility30d: 58.9,
      dominance: 0.42,
    },
    tradingInfo: {
      minOrderSize: 0.1,
      maxOrderSize: 100000,
      orderStep: 0.1,
      priceStep: 0.01,
      minPrice: 0.01,
      maxPrice: 1000,
      leverageMin: 1,
      leverageMax: 20,
      marginRequirements: [],
      feeMaker: 0.1,
      feeTaker: 0.15,
      supportedOrderTypes: ['market', 'limit', 'stop', 'stop_limit'],
    },
    metadata: {
      description: 'Multi-chain interoperability protocol',
      website: 'https://polkadot.network',
      explorer: 'https://polkascan.io',
      isStablecoin: false,
      tags: ['interoperability', 'parachains', 'substrate'],
    },
  },
  {
    id: 'avalanche',
    symbol: 'AVAX/USDT',
    name: 'Avalanche',
    baseAsset: 'AVAX',
    quoteAsset: 'USDT',
    category: 'crypto' as const,
    priceData: {
      currentPrice: 35.67,
      open24h: 34.78,
      high24h: 36.45,
      low24h: 34.23,
      change24h: 0.89,
      changePercent24h: 2.56,
      volume24h: 580000000,
      quoteVolume24h: 16300000,
      lastTradeTime: new Date().toISOString(),
      bid: 35.65,
      ask: 35.69,
      spread: 0.04,
    },
    marketStats: {
      marketCap: 14200000000,
      circulatingSupply: 398000000,
      totalSupply: 443000000,
      maxSupply: 720000000,
      ath: 146.22,
      athDate: '2021-11-21',
      atl: 2.80,
      atlDate: '2020-12-31',
      rank: 18,
      volatility30d: 65.2,
      dominance: 0.56,
    },
    tradingInfo: {
      minOrderSize: 0.1,
      maxOrderSize: 50000,
      orderStep: 0.1,
      priceStep: 0.01,
      minPrice: 0.01,
      maxPrice: 1000,
      leverageMin: 1,
      leverageMax: 25,
      marginRequirements: [],
      feeMaker: 0.1,
      feeTaker: 0.15,
      supportedOrderTypes: ['market', 'limit', 'stop', 'stop_limit'],
    },
    metadata: {
      description: 'High-speed, low-cost smart contract platform',
      website: 'https://avalabs.org',
      explorer: 'https://snowtrace.io',
      isStablecoin: false,
      tags: ['defi', 'smart-contracts', 'fast'],
    },
  },
  {
    id: 'chainlink',
    symbol: 'LINK/USDT',
    name: 'Chainlink',
    baseAsset: 'LINK',
    quoteAsset: 'USDT',
    category: 'crypto' as const,
    priceData: {
      currentPrice: 14.56,
      open24h: 14.23,
      high24h: 14.89,
      low24h: 14.01,
      change24h: 0.33,
      changePercent24h: 2.32,
      volume24h: 420000000,
      quoteVolume24h: 28900000,
      lastTradeTime: new Date().toISOString(),
      bid: 14.54,
      ask: 14.58,
      spread: 0.04,
    },
    marketStats: {
      marketCap: 8560000000,
      circulatingSupply: 588000000,
      totalSupply: 1000000000,
      maxSupply: 1000000000,
      ath: 53.00,
      athDate: '2021-05-09',
      atl: 0.1274,
      atlDate: '2017-11-29',
      rank: 19,
      volatility30d: 54.6,
      dominance: 0.34,
    },
    tradingInfo: {
      minOrderSize: 0.1,
      maxOrderSize: 50000,
      orderStep: 0.1,
      priceStep: 0.01,
      minPrice: 0.01,
      maxPrice: 1000,
      leverageMin: 1,
      leverageMax: 20,
      marginRequirements: [],
      feeMaker: 0.1,
      feeTaker: 0.15,
      supportedOrderTypes: ['market', 'limit', 'stop', 'stop_limit'],
    },
    metadata: {
      description: 'Decentralized oracle network',
      website: 'https://chain.link',
      explorer: 'https://etherscan.io/token/link',
      isStablecoin: false,
      tags: ['oracle', 'defi', 'data-feeds'],
    },
  },
];

// ============================================================
// SAMPLE FOREX PAIRS
// ============================================================

/** Major forex currency pairs */
export const SAMPLE_FOREX_PAIRS = [
  {
    id: 'eur-usd',
    symbol: 'EUR/USD',
    name: 'Euro / US Dollar',
    baseAsset: 'EUR',
    quoteAsset: 'USD',
    category: 'forex' as const,
    priceData: {
      currentPrice: 1.0876,
      open24h: 1.0854,
      high24h: 1.0898,
      low24h: 1.0834,
      change24h: 0.0022,
      changePercent24h: 0.20,
      volume24h: 85000000000,
      quoteVolume24h: 78200000000,
      lastTradeTime: new Date().toISOString(),
      bid: 1.08754,
      ask: 1.08766,
      spread: 0.00012,
    },
    marketStats: {
      rank: 1,
      volatility30d: 5.2,
    },
    tradingInfo: {
      minOrderSize: 100,
      maxOrderSize: 50000000,
      orderStep: 0.01,
      priceStep: 0.0001,
      minPrice: 0.5,
      maxPrice: 2.0,
      leverageMin: 1,
      leverageMax: 100,
      feeMaker: 0.0,
      feeTaker: 0.0,
      supportedOrderTypes: ['market', 'limit', 'stop', 'stop_limit'],
    },
    metadata: {
      description: 'Most traded currency pair in the world',
      isStablecoin: false,
      tags: ['major', 'liquid'],
    },
  },
  {
    id: 'gbp-usd',
    symbol: 'GBP/USD',
    name: 'British Pound / US Dollar',
    baseAsset: 'GBP',
    quoteAsset: 'USD',
    category: 'forex' as const,
    priceData: {
      currentPrice: 1.2734,
      open24h: 1.2698,
      high24h: 1.2789,
      low24h: 1.2678,
      change24h: 0.0036,
      changePercent24h: 0.28,
      volume24h: 42000000000,
      quoteVolume24h: 33000000000,
      lastTradeTime: new Date().toISOString(),
      bid: 1.27334,
      ask: 1.27346,
      spread: 0.00012,
    },
    marketStats: {
      rank: 3,
      volatility30d: 6.8,
    },
    tradingInfo: {
      minOrderSize: 100,
      maxOrderSize: 25000000,
      orderStep: 0.01,
      priceStep: 0.0001,
      minPrice: 0.8,
      maxPrice: 2.0,
      leverageMin: 1,
      leverageMax: 100,
      feeMaker: 0.0,
      feeTaker: 0.0,
      supportedOrderTypes: ['market', 'limit', 'stop', 'stop_limit'],
    },
    metadata: {
      description: 'Also known as "Cable"',
      isStablecoin: false,
      tags: ['major', 'gbp'],
    },
  },
  {
    id: 'usd-jpy',
    symbol: 'USD/JPY',
    name: 'US Dollar / Japanese Yen',
    baseAsset: 'USD',
    quoteAsset: 'JPY',
    category: 'forex' as const,
    priceData: {
      currentPrice: 154.56,
      open24h: 154.23,
      high24h: 154.89,
      low24h: 153.98,
      change24h: 0.33,
      changePercent24h: 0.21,
      volume24h: 55000000000,
      quoteVolume24h: 35600000000,
      lastTradeTime: new Date().toISOString(),
      bid: 154.54,
      ask: 154.58,
      spread: 0.04,
    },
    marketStats: {
      rank: 2,
      volatility30d: 7.2,
    },
    tradingInfo: {
      minOrderSize: 100,
      maxOrderSize: 50000000,
      orderStep: 0.01,
      priceStep: 0.01,
      minPrice: 80,
      maxPrice: 160,
      leverageMin: 1,
      leverageMax: 100,
      feeMaker: 0.0,
      feeTaker: 0.0,
      supportedOrderTypes: ['market', 'limit', 'stop', 'stop_limit'],
    },
    metadata: {
      description: 'Safe haven currency pair',
      isStablecoin: false,
      tags: ['major', 'jpy', 'safe-haven'],
    },
  },
  {
    id: 'aud-usd',
    symbol: 'AUD/USD',
    name: 'Australian Dollar / US Dollar',
    baseAsset: 'AUD',
    quoteAsset: 'USD',
    category: 'forex' as const,
    priceData: {
      currentPrice: 0.6543,
      open24h: 0.6512,
      high24h: 0.6578,
      low24h: 0.6498,
      change24h: 0.0031,
      changePercent24h: 0.48,
      volume24h: 28000000000,
      quoteVolume24h: 42800000000,
      lastTradeTime: new Date().toISOString(),
      bid: 0.65426,
      ask: 0.65434,
      spread: 0.00008,
    },
    marketStats: {
      rank: 5,
      volatility30d: 8.5,
    },
    tradingInfo: {
      minOrderSize: 100,
      maxOrderSize: 20000000,
      orderStep: 0.01,
      priceStep: 0.0001,
      minPrice: 0.4,
      maxPrice: 1.1,
      leverageMin: 1,
      leverageMax: 100,
      feeMaker: 0.0,
      feeTaker: 0.0,
      supportedOrderTypes: ['market', 'limit', 'stop', 'stop_limit'],
    },
    metadata: {
      description: 'Commodity-linked currency pair',
      isStablecoin: false,
      tags: ['major', 'commodity', 'aud'],
    },
  },
  {
    id: 'usdcad',
    symbol: 'USD/CAD',
    name: 'US Dollar / Canadian Dollar',
    baseAsset: 'USD',
    quoteAsset: 'CAD',
    category: 'forex' as const,
    priceData: {
      currentPrice: 1.3654,
      open24h: 1.3623,
      high24h: 1.3698,
      low24h: 1.3601,
      change24h: 0.0031,
      changePercent24h: 0.23,
      volume24h: 22000000000,
      quoteVolume24h: 16100000000,
      lastTradeTime: new Date().toISOString(),
      bid: 1.36536,
      ask: 1.36544,
      spread: 0.00008,
    },
    marketStats: {
      rank: 6,
      volatility30d: 6.1,
    },
    tradingInfo: {
      minOrderSize: 100,
      maxOrderSize: 20000000,
      orderStep: 0.01,
      priceStep: 0.0001,
      minPrice: 0.9,
      maxPrice: 1.8,
      leverageMin: 1,
      leverageMax: 100,
      feeMaker: 0.0,
      feeTaker: 0.0,
      supportedOrderTypes: ['market', 'limit', 'stop', 'stop_limit'],
    },
    metadata: {
      description: 'Oil-sensitive currency pair',
      isStablecoin: false,
      tags: ['major', 'commodity', 'cad'],
    },
  },
];

// ============================================================
// STABLECOINS
// ============================================================

export const STABLECOINS = ['USDT', 'USDC', 'BUSD', 'DAI', 'TUSD', 'FDUSD', 'PYUSD'];

// ============================================================
// NAVIGATION ITEMS
// ============================================================

/** Main navigation structure */
export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', href: '/', badge: null },
  { id: 'trading', label: 'Trading', icon: 'LineChart', href: '/trading', badge: null },
  { id: 'markets', label: 'Markets', icon: 'BarChart3', href: '/markets', badge: null },
  { id: 'wallet', label: 'Wallet', icon: 'Wallet', href: '/wallet', badge: null },
  { id: 'portfolio', label: 'Portfolio', icon: 'PieChart', href: '/portfolio', badge: null },
  { id: 'copy-trading', label: 'Copy Trading', icon: 'Users', href: '/copy-trading', badge: 'New' },
  { id: 'academy', label: 'Academy', icon: 'GraduationCap', href: '/academy', badge: null },
  { id: 'referral', label: 'Referral', icon: 'Gift', href: '/referral', badge: null },
] as const;

/** Secondary navigation items */
export const SECONDARY_NAV_ITEMS = [
  { id: 'settings', label: 'Settings', icon: 'Settings', href: '/settings' },
  { id: 'support', label: 'Support', icon: 'HelpCircle', href: '/support' },
  { id: 'notifications', label: 'Notifications', icon: 'Bell', href: '/notifications', hasUnread: true },
] as const;

// ============================================================
// THEME CONFIGURATION
// ============================================================

/** Color palette */
export const COLORS = {
  primary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
    950: '#3b0764',
  },
  success: {
    light: '#86efac',
    DEFAULT: '#22c55e',
    dark: '#16a34a',
  },
  danger: {
    light: '#fca5a5',
    DEFAULT: '#ef4444',
    dark: '#dc2626',
  },
  warning: {
    light: '#fcd34d',
    DEFAULT: '#f59e0b',
    dark: '#d97706',
  },
  info: {
    light: '#93c5fd',
    DEFAULT: '#3b82f6',
    dark: '#2563eb',
  },
} as const;

/** Price change colors */
export function getPriceChangeColor(change: number): string {
  if (change > 0) return COLORS.success.DEFAULT;
  if (change < 0) return COLORS.danger.DEFAULT;
  return '#6b7280'; // gray for no change
}

/** Price change class */
export function getPriceChangeClass(change: number): string {
  if (change > 0) return 'text-emerald-500';
  if (change < 0) return 'text-red-500';
  return 'text-gray-500';
}

// ============================================================
// API ENDPOINTS
// ============================================================

export const API_ENDPOINTS = {
  // Auth
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
    refresh: '/api/auth/refresh',
    me: '/api/auth/me',
    forgotPassword: '/api/auth/forgot-password',
    resetPassword: '/api/auth/reset-password',
    verifyEmail: '/api/auth/verify-email',
    enable2FA: '/api/auth/2fa/enable',
    disable2FA: '/api/auth/2fa/disable',
    verify2FA: '/api/auth/2fa/verify',
  },
  // Market data
  market: {
    assets: '/api/market/assets',
    asset: '/api/market/assets/:symbol',
    price: '/api/market/price/:symbol',
    candles: '/api/market/candles/:symbol',
    depth: '/api/market/depth/:symbol',
    trades: '/api/market/trades/:symbol',
    ticker: '/api/market/ticker/:symbol',
    search: '/api/market/search',
    categories: '/api/market/categories',
    watchlist: '/api/market/watchlist',
    heatmap: '/api/market/heatmap',
  },
  // Trading
  trading: {
    orders: '/api/trading/orders',
    order: '/api/trading/orders/:id',
    positions: '/api/trading/positions',
    position: '/api/trading/positions/:id',
    tradeHistory: '/api/trading/history',
    createOrder: '/api/trading/orders',
    cancelOrder: '/api/trading/orders/:id/cancel',
    closePosition: '/api/trading/positions/:id/close',
  },
  // Wallet
  wallet: {
    list: '/api/wallet/wallets',
    wallet: '/api/wallet/wallets/:id',
    transactions: '/api/wallet/transactions',
    deposit: '/api/wallet/deposit',
    withdraw: '/api/wallet/withdraw',
    transfer: '/api/wallet/transfer',
    addresses: '/api/wallet/addresses',
  },
  // User
  user: {
    profile: '/api/user/profile',
    updateProfile: '/api/user/profile',
    preferences: '/api/user/preferences',
    kyc: '/api/user/kyc',
    devices: '/api/user/devices',
    sessions: '/api/user/sessions',
    referral: '/api/user/referral',
  },
  // Admin
  admin: {
    dashboard: '/api/admin/dashboard',
    users: '/api/admin/users',
    analytics: '/api/admin/analytics',
    settings: '/api/admin/settings',
    auditLog: '/api/admin/audit-log',
    tickets: '/api/admin/tickets',
  },
  // AI
  ai: {
    chat: '/api/ai/chat',
    analyze: '/api/ai/analyze',
    insights: '/api/ai/insights',
    signals: '/api/ai/signals',
  },
} as const;

// ============================================================
// WEBSOCKET CHANNELS
// ============================================================

export const WS_CHANNELS = {
  PRICE: 'price:',
  DEPTH: 'depth:',
  TRADES: 'trades:',
  ORDER: 'order:',
  POSITION: 'position:',
  BALANCE: 'balance:',
  NOTIFICATION: 'notification:',
  TICKER: 'ticker:',
} as const;

// ============================================================
// VALIDATION RULES
// ============================================================

export const VALIDATION = {
  password: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecialChar: true,
  },
  username: {
    minLength: 3,
    maxLength: 30,
    pattern: /^[a-zA-Z0-9_]+$/,
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  otp: {
    length: 6,
    pattern: /^\d{6}$/,
  },
  amount: {
    min: 0.00000001,
    max: 1000000000,
    decimals: 8,
  },
} as const;

// ============================================================
// FEATURE FLAGS
// ============================================================

export const FEATURES = {
  copyTrading: true,
  demoTrading: true,
  marginTrading: true,
  futuresTrading: false,
  optionsTrading: false,
  staking: true,
  earn: true,
  nft: false,
  aiAssistant: true,
  socialFeatures: true,
  referralProgram: true,
  leaderboard: true,
  achievements: true,
  multiLanguage: true,
  darkMode: true,
  pwaInstall: true,
  pushNotifications: true,
  biometricAuth: true,
  googleLogin: true,
  appleLogin: true,
  githubLogin: true,
  facebookLogin: true,
  paystackPayment: true,
  cardPayment: true,
  bankTransfer: true,
} as const;
