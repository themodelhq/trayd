/**
 * Tray'd Market Data API - Recent Trades Endpoint
 * @description Returns recent trade executions for a symbol
 */

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// TYPES
// ============================================================

interface RecentTrade {
  id: string;
  price: number;
  quantity: number;
  side: 'buy' | 'sell';
  time: string;
  isMakerBuy: boolean;
}

// ============================================================
// HELPERS
// ============================================================

/** Generate mock recent trades */
function generateRecentTrades(
  basePrice: number,
  count: number = 50
): RecentTrade[] {
  const trades: RecentTrade[] = [];
  
  for (let i = 0; i < count; i++) {
    // Price variation around base
    const priceVariation = (Math.random() - 0.5) * 0.004; // ±0.2%
    const price = basePrice * (1 + priceVariation);
    
    // Random quantity with realistic distribution
    const isLargeTrade = Math.random() < 0.15; // 15% chance of large trade
    const quantity = isLargeTrade
      ? Math.random() * 50 + 10 // Large trade: 10-60 units
      : Math.random() * 5 + 0.01; // Normal trade: 0.01-5 units
    
    // Determine side (slight buy bias for bullish markets)
    const isBuy = Math.random() < 0.52;
    
    // Generate time (recent to older)
    const timeOffset = i * (Math.random() * 2000 + 500); // 500ms - 2.5s between trades
    const time = new Date(Date.now() - timeOffset).toISOString();

    trades.push({
      id: `trade-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
      price: parseFloat(price.toFixed(8)),
      quantity: parseFloat(quantity.toFixed(8)),
      side: isBuy ? 'buy' : 'sell',
      time,
      isMakerBuy: isBuy && Math.random() > 0.3, // Most buys are maker orders
    });
  }

  return trades.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
}

/** Get base price for symbol */
function getBasePrice(symbol: string): number {
  if (symbol.includes('BTC')) return 67543;
  if (symbol.includes('ETH')) return 3456;
  if (symbol.includes('SOL')) return 178;
  if (symbol.includes('BNB')) return 598;
  if (symbol.includes('XRP')) return 0.52;
  if (symbol.includes('ADA')) return 0.45;
  if (symbol.includes('DOGE')) return 0.12;
  if (symbol.includes('DOT')) return 7.89;
  if (symbol.includes('AVAX')) return 35.67;
  if (symbol.includes('LINK')) return 14.56;
  if (symbol.includes('EUR')) return 1.0876;
  if (symbol.includes('GBP')) return 1.2734;
  if (symbol.includes('JPY')) return 154.56;
  if (symbol.includes('AUD')) return 0.6543;
  if (symbol.includes('CAD')) return 1.3654;
  return 100;
}

// ============================================================
// GET RECENT TRADES HANDLER
// ============================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const limit = parseInt(searchParams.get('limit') || '50');

    // Validate limit
    if (limit < 1 || limit > 500) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_LIMIT', message: 'Limit must be between 1 and 500' } },
        { status: 400 }
      );
    }

    // Generate recent trades
    const basePrice = getBasePrice(symbol);
    const trades = generateRecentTrades(basePrice, limit);

    // Calculate statistics
    const buyTrades = trades.filter(t => t.side === 'buy');
    const sellTrades = trades.filter(t => t.side === 'sell');
    
    const totalVolume = trades.reduce((sum, t) => sum + (t.price * t.quantity), 0);
    const avgPrice = trades.reduce((sum, t) => sum + t.price, 0) / trades.length;
    const highestPrice = Math.max(...trades.map(t => t.price));
    const lowestPrice = Math.min(...trades.map(t => t.price));
    
    const buyVolume = buyTrades.reduce((sum, t) => sum + (t.price * t.quantity), 0);
    const sellVolume = sellTrades.reduce((sum, t) => sum + (t.price * t.quantity), 0);

    return NextResponse.json({
      success: true,
      data: trades,
      meta: {
        symbol,
        total: trades.length,
        statistics: {
          totalVolume: parseFloat(totalVolume.toFixed(2)),
          averagePrice: parseFloat(avgPrice.toFixed(8)),
          highPrice: parseFloat(highestPrice.toFixed(8)),
          lowPrice: parseFloat(lowestPrice.toFixed(8)),
          buyCount: buyTrades.length,
          sellCount: sellTrades.length,
          buyVolume: parseFloat(buyVolume.toFixed(2)),
          sellVolume: parseFloat(sellVolume.toFixed(2)),
          buySellRatio: sellVolume > 0 ? parseFloat((buyVolume / sellVolume).toFixed(2)) : 0,
          makerTakerRatio: parseFloat(
            (trades.filter(t => t.isMakerBuy).length / trades.length).toFixed(2)
          ),
        },
      },
    });
  } catch (error) {
    console.error('[Market] Get recent trades error:', error);
    
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch recent trades' } },
      { status: 500 }
    );
  }
}
