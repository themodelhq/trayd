/**
 * Tray'd Market Data API - Candlestick Data Endpoint
 * @description Returns OHLCV candlestick data for charting
 */

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// TYPES
// ============================================================

interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// ============================================================
// HELPERS
// ============================================================

/** Generate realistic mock candlestick data */
function generateCandleData(
  basePrice: number,
  startTime: number,
  intervalSeconds: number,
  count: number,
  volatility: number = 0.02
): CandleData[] {
  const candles: CandleData[] = [];
  let currentPrice = basePrice;

  for (let i = 0; i < count; i++) {
    const time = startTime - (count - i) * intervalSeconds * 1000;
    
    // Generate OHLC with some correlation to previous price
    const change = (Math.random() - 0.48) * volatility * currentPrice; // Slight upward bias
    const open = currentPrice;
    const close = open + change;
    
    // High and low should encompass open and close
    const range = Math.abs(change) + (Math.random() * volatility * currentPrice * 0.5);
    const high = Math.max(open, close) + Math.random() * range * 0.5;
    const low = Math.min(open, close) - Math.random() * range * 0.5;
    
    // Volume correlates with price movement
    const baseVolume = 1000000 + Math.random() * 5000000;
    const volumeMultiplier = 1 + Math.abs(change) / currentPrice * 10;
    const volume = baseVolume * volumeMultiplier;

    candles.push({
      time,
      open: parseFloat(open.toFixed(8)),
      high: parseFloat(high.toFixed(8)),
      low: parseFloat(low.toFixed(8)),
      close: parseFloat(close.toFixed(8)),
      volume: parseFloat(volume.toFixed(2)),
    });

    currentPrice = close;
  }

  return candles;
}

/** Get interval in seconds from timeframe string */
function getIntervalSeconds(timeframe: string): number {
  const intervals: Record<string, number> = {
    '1m': 60,
    '5m': 300,
    '15m': 900,
    '30m': 1800,
    '1h': 3600,
    '4h': 14400,
    '1d': 86400,
    '1w': 604800,
    '1M': 2592000,
  };
  return intervals[timeframe] || 3600;
}

/** Get default candle count for timeframe */
function getDefaultCandleCount(timeframe: string): number {
  const counts: Record<string, number> = {
    '1m': 60,
    '5m': 200,
    '15m': 200,
    '30m': 200,
    '1h': 200,
    '4h': 200,
    '1d': 365,
    '1w': 104,
    '1M': 60,
  };
  return counts[timeframe] || 200;
}

/** Get volatility based on asset type */
function getVolatility(symbol: string): number {
  if (symbol.includes('BTC')) return 0.02;
  if (symbol.includes('ETH')) return 0.025;
  if (symbol.includes('SOL') || symbol.includes('DOGE')) return 0.04;
  if (symbol.includes('/')) { // Forex pairs
    return 0.003;
  }
  return 0.03;
}

// ============================================================
// GET CANDLES HANDLER
// ============================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const timeframe = searchParams.get('timeframe') || '1h';
    const limit = parseInt(searchParams.get('limit') || String(getDefaultCandleCount(timeframe)));
    const endTime = parseInt(searchParams.get('endTime') || String(Date.now()));

    // Validate timeframe
    const validTimeframes = ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w', '1M'];
    if (!validTimeframes.includes(timeframe)) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_TIMEFRAME', message: `Invalid timeframe. Valid options: ${validTimeframes.join(', ')}` } },
        { status: 400 }
      );
    }

    // Validate limit
    if (limit < 1 || limit > 2000) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_LIMIT', message: 'Limit must be between 1 and 2000' } },
        { status: 400 }
      );
    }

    // Determine base price for this symbol (mock data)
    let basePrice = 67543; // Default BTC price
    
    if (symbol.includes('ETH')) basePrice = 3456;
    else if (symbol.includes('SOL')) basePrice = 178;
    else if (symbol.includes('BNB')) basePrice = 598;
    else if (symbol.includes('XRP')) basePrice = 0.52;
    else if (symbol.includes('ADA')) basePrice = 0.45;
    else if (symbol.includes('DOGE')) basePrice = 0.12;
    else if (symbol.includes('DOT')) basePrice = 7.89;
    else if (symbol.includes('AVAX')) basePrice = 35.67;
    else if (symbol.includes('LINK')) basePrice = 14.56;
    else if (symbol.includes('EUR')) basePrice = 1.0876;
    else if (symbol.includes('GBP')) basePrice = 1.2734;
    else if (symbol.includes('JPY')) basePrice = 154.56;
    else if (symbol.includes('AUD')) basePrice = 0.6543;
    else if (symbol.includes('CAD')) basePrice = 1.3654;

    // Add some randomness based on symbol hash for variety
    const symbolHash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    basePrice *= (1 + ((symbolHash % 20) - 10) / 100); // ±10% variation

    // Generate candle data
    const intervalSeconds = getIntervalSeconds(timeframe);
    const actualEndTime = endTime || Date.now();
    
    const candles = generateCandleData(
      basePrice,
      actualEndTime,
      intervalSeconds,
      limit,
      getVolatility(symbol)
    );

    // Calculate additional stats from candles
    const firstCandle = candles[0];
    const lastCandle = candles[candles.length - 1];
    const highest = Math.max(...candles.map(c => c.high));
    const lowest = Math.min(...candles.map(c => c.low));
    const totalVolume = candles.reduce((sum, c) => sum + c.volume, 0);

    return NextResponse.json({
      success: true,
      data: candles,
      meta: {
        symbol,
        timeframe,
        total: candles.length,
        period: {
          start: firstCandle?.time,
          end: lastCandle?.time,
        },
        statistics: {
          open: firstCandle?.open,
          high: highest,
          low: lowest,
          close: lastCandle?.close,
          change: lastCandle ? lastCandle.close - firstCandle.open : 0,
          changePercent: firstCandle && lastCandle 
            ? ((lastCandle.close - firstCandle.open) / firstCandle.open) * 100 
            : 0,
          totalVolume,
          averageVolume: totalVolume / candles.length,
          trades: Math.floor(totalVolume / (basePrice * 0.01)), // Estimate trade count
        },
      },
    });
  } catch (error) {
    console.error('[Market] Get candles error:', error);
    
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch candle data' } },
      { status: 500 }
    );
  }
}
