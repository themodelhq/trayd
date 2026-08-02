/**
 * Tray'd Market Data API - Order Book Depth Endpoint
 * @description Returns order book depth data (bids/asks)
 */

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// TYPES
// ============================================================

interface DepthData {
  bids: [number, number][]; // [price, quantity]
  asks: [number, number][]; // [price, quantity]
  timestamp: number;
}

// ============================================================
// HELPERS
// ============================================================

/** Generate realistic order book data */
function generateDepthData(
  basePrice: number,
  depth: number = 25
): DepthData {
  const bids: [number, number][] = [];
  const asks: [number, number][] = [];
  
  let bidPrice = basePrice * 0.999; // Start slightly below
  let askPrice = basePrice * 1.001; // Start slightly above
  
  for (let i = 0; i < depth; i++) {
    // Bids - increasing quantity as price decreases
    const bidQuantity = (Math.random() * 10 + 0.5) * (1 + i * 0.15);
    bids.push([parseFloat(bidPrice.toFixed(8)), parseFloat(bidQuantity.toFixed(4))]);
    bidPrice *= (1 - Math.random() * 0.003); // Decrease price
    
    // Asks - increasing quantity as price increases
    const askQuantity = (Math.random() * 10 + 0.5) * (1 + i * 0.15);
    asks.push([parseFloat(askPrice.toFixed(8)), parseFloat(askQuantity.toFixed(4))]);
    askPrice *= (1 + Math.random() * 0.003); // Increase price
  }

  return {
    bids: bids.sort((a, b) => b[0] - a[0]), // Highest bid first
    asks: asks.sort((a, b) => a[0] - b[0]), // Lowest ask first
    timestamp: Date.now(),
  };
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
  return 100; // Default fallback
}

// ============================================================
// GET DEPTH HANDLER
// ============================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const limit = parseInt(searchParams.get('limit') || '25');

    // Validate limit
    if (limit < 5 || limit > 200) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_LIMIT', message: 'Limit must be between 5 and 200' } },
        { status: 400 }
      );
    }

    // Generate depth data
    const basePrice = getBasePrice(symbol);
    const depthData = generateDepthData(basePrice, limit);

    // Calculate additional stats
    const bestBid = depthData.bids[0];
    const bestAsk = depthData.asks[0];
    const spread = bestAsk && bestBid ? bestAsk[0] - bestBid[0] : 0;
    const spreadPercent = bestBid ? (spread / bestBid[0]) * 100 : 0;

    const totalBidDepth = depthData.bids.reduce((sum, [, qty]) => sum + qty, 0);
    const totalAskDepth = depthData.asks.reduce((sum, [, qty]) => sum + qty, 0);

    // Generate weighted prices for implied market price
    const weightedBidPrice = depthData.bids.reduce(
      (sum, [price, qty], idx) => sum + price * qty * (depthData.bids.length - idx), 0
    ) / (totalBidDepth * depthData.bids.length);
    
    const weightedAskPrice = depthData.asks.reduce(
      (sum, [price, qty], idx) => sum + price * qty * (idx + 1), 0
    ) / (totalAskDepth * depthData.asks.length);

    return NextResponse.json({
      success: true,
      data: depthData,
      meta: {
        symbol,
        limit: depthData.bids.length,
        statistics: {
          bestBid: bestBid?.[0],
          bestAsk: bestAsk?.[0],
          spread: parseFloat(spread.toFixed(8)),
          spreadPercent: parseFloat(spreadPercent.toFixed(4)),
          totalBidDepth: parseFloat(totalBidDepth.toFixed(4)),
          totalAskDepth: parseFloat(totalAskDepth.toFixed(4)),
          bidAskRatio: totalAskDepth > 0 ? parseFloat((totalBidDepth / totalAskDepth).toFixed(2)) : 0,
          weightedMidPrice: parseFloat(((weightedBidPrice + weightedAskPrice) / 2).toFixed(8)),
        },
      },
    });
  } catch (error) {
    console.error('[Market] Get depth error:', error);
    
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch order book data' } },
      { status: 500 }
    );
  }
}
