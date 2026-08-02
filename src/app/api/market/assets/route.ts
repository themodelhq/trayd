/**
 * Tray'd Market Data API - Assets Endpoint
 * @description Returns available trading instruments with current prices
 */

import { NextRequest, NextResponse } from 'next/server';
import { SAMPLE_CRYPTO_ASSETS, SAMPLE_FOREX_PAIRS } from '@/constants';

// ============================================================
// TYPES
// ============================================================

interface MarketAssetResponse {
  id: string;
  symbol: string;
  name: string;
  baseAsset: string;
  quoteAsset: string;
  category: string;
  iconUrl?: string;
  isActive: boolean;
  priceData: {
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
  };
  marketStats: Record<string, unknown>;
  tradingInfo: {
    minOrderSize: number;
    maxOrderSize: number;
    leverageMin: number;
    leverageMax: number;
    feeMaker: number;
    feeTaker: number;
    supportedOrderTypes: string[];
  };
}

// ============================================================
// HELPERS
// ============================================================

/** All market data combined */
const allAssets = [...SAMPLE_CRYPTO_ASSETS, ...SAMPLE_FOREX_PAIRS];

/** Format asset for API response */
function formatAsset(asset: typeof SAMPLE_CRYPTO_ASSETS[0]): MarketAssetResponse {
  return {
    id: asset.id,
    symbol: asset.symbol,
    name: asset.name,
    baseAsset: asset.baseAsset,
    quoteAsset: asset.quoteAsset,
    category: asset.category,
    iconUrl: asset.metadata?.iconUrl || `/icons/${asset.baseAsset.toLowerCase()}.svg`,
    isActive: true,
    priceData: asset.priceData,
    marketStats: asset.marketStats as unknown as Record<string, unknown>,
    tradingInfo: {
      minOrderSize: asset.tradingInfo.minOrderSize,
      maxOrderSize: asset.tradingInfo.maxOrderSize,
      leverageMin: asset.tradingInfo.leverageMin,
      leverageMax: asset.tradingInfo.leverageMax,
      feeMaker: asset.tradingInfo.feeMaker,
      feeTaker: asset.tradingInfo.feeTaker,
      supportedOrderTypes: asset.tradingInfo.supportedOrderTypes,
    },
  };
}

/** Simulate price changes for demo */
function addPriceVariation(asset: typeof SAMPLE_CRYPTO_ASSETS[0]) {
  const variation = (Math.random() - 0.5) * 0.002; // ±0.1% variation
  const newPrice = asset.priceData.currentPrice * (1 + variation);
  
  return {
    ...asset,
    priceData: {
      ...asset.priceData,
      currentPrice: newPrice,
      change24h: newPrice - asset.priceData.open24h,
      changePercent24h: ((newPrice - asset.priceData.open24h) / asset.priceData.open24h) * 100,
      bid: newPrice * (1 - 0.0001),
      ask: newPrice * (1 + 0.0001),
    },
  };
}

// ============================================================
// GET ASSETS HANDLER
// ============================================================

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    
    const category = searchParams.get('category');
    const search = searchParams.get('search')?.toLowerCase();
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const sort = searchParams.get('sort') || 'volume'; // volume, change, name
    const order = searchParams.get('order') === 'asc' ? 'asc' : 'desc';

    // Filter by category if specified
    let filteredAssets = allAssets.map(addPriceVariation);
    
    if (category && category !== 'all') {
      filteredAssets = filteredAssets.filter(asset => asset.category === category);
    }

    // Search filter
    if (search) {
      filteredAssets = filteredAssets.filter(asset =>
        asset.symbol.toLowerCase().includes(search) ||
        asset.name.toLowerCase().includes(search) ||
        asset.baseAsset.toLowerCase().includes(search)
      );
    }

    // Sort results
    filteredAssets.sort((a, b) => {
      let comparison = 0;
      
      switch (sort) {
        case 'volume':
          comparison = a.priceData.volume24h - b.priceData.volume24h;
          break;
        case 'change':
          comparison = a.priceData.changePercent24h - b.priceData.changePercent24h;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
        default:
          comparison = a.priceData.currentPrice - b.priceData.currentPrice;
          break;
      }
      
      return order === 'asc' ? comparison : -comparison;
    });

    // Pagination
    const total = filteredAssets.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedAssets = filteredAssets.slice(startIndex, startIndex + limit);

    // Format response
    const formattedAssets = paginatedAssets.map(formatAsset);

    // Calculate market summary
    const cryptoAssets = allAssets.filter(a => a.category === 'crypto');
    const totalMarketCap = cryptoAssets.reduce((sum, a) => 
      sum + (a.marketStats.marketCap || 0), 0
    );
    const avgChange = filteredAssets.reduce((sum, a) => 
      sum + a.priceData.changePercent24h, 0
    ) / Math.max(filteredAssets.length, 1);

    return NextResponse.json({
      success: true,
      data: formattedAssets,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
      summary: {
        totalAssets: allAssets.length,
        filteredCount: filteredAssets.length,
        totalMarketCap,
        averageChange24h: avgChange,
        categories: {
          crypto: allAssets.filter(a => a.category === 'crypto').length,
          forex: allAssets.filter(a => a.category === 'forex').length,
          indices: allAssets.filter(a => a.category === 'indices').length,
          commodities: allAssets.filter(a => a.category === 'commodities').length,
        },
      },
    });
  } catch (error) {
    console.error('[Market] Get assets error:', error);
    
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch market data' } },
      { status: 500 }
    );
  }
}
