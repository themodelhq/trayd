/**
 * Tray'd Trading Interface - Main Trading Page
 * @description Professional trading interface with order form, charts, order book, and recent trades
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  TrendingDown,
  Settings2,
  Maximize2,
  Minimize2,
  RefreshCw,
  Star,
  Info,
  ChevronDown,
  ChevronUp,
  Clock,
  BarChart3,
  BookOpen,
  Activity,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { cn, formatCurrency, formatPercent, formatCryptoAmount } from '@/lib/utils';
import { useMarketStore, useTradingStore, useAuthStore } from '@/store';
import { SAMPLE_CRYPTO_ASSETS, LEVERAGE_OPTIONS, TIMEFRAMES, ORDER_TYPES, TIME_IN_FORCE } from '@/constants';
import type { OrderType, OrderSide, TimeInForce, CandleData, RecentTrade, DepthData } from '@/types';

// ============================================================
// MOCK DATA GENERATORS
// ============================================================

/** Generate mock candle data for chart */
function generateCandleData(basePrice: number, count: number = 100): CandleData[] {
  const candles: CandleData[] = [];
  let price = basePrice;
  
  for (let i = count - 1; i >= 0; i--) {
    const volatility = basePrice * 0.02;
    const open = price;
    const change = (Math.random() - 0.48) * volatility;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * volatility * 0.3;
    const low = Math.min(open, close) - Math.random() * volatility * 0.3;
    const volume = 1000000 + Math.random() * 5000000;
    
    candles.push({
      time: Date.now() - i * 3600000,
      open: parseFloat(open.toFixed(8)),
      high: parseFloat(high.toFixed(8)),
      low: parseFloat(low.toFixed(8)),
      close: parseFloat(close.toFixed(8)),
      volume: parseFloat(volume.toFixed(2)),
    });
    
    price = close;
  }
  
  return candles;
}

/** Generate mock order book depth */
function generateOrderBook(basePrice: number): DepthData {
  const bids: [number, number][] = [];
  const asks: [number, number][] = [];
  
  let bidPrice = basePrice * 0.999;
  let askPrice = basePrice * 1.001;
  
  for (let i = 0; i < 15; i++) {
    bids.push([parseFloat(bidPrice.toFixed(2)), parseFloat((Math.random() * 5 + 0.5).toFixed(4))]);
    asks.push([parseFloat(askPrice.toFixed(2)), parseFloat((Math.random() * 5 + 0.5).toFixed(4))]);
    bidPrice *= 1 - Math.random() * 0.002;
    askPrice *= 1 + Math.random() * 0.002;
  }
  
  return { bids: bids.sort((a, b) => b[0] - a[0]), asks: asks.sort((a, b) => a[0] - b[0]), timestamp: Date.now() };
}

/** Generate mock recent trades */
function generateRecentTrades(basePrice: number): RecentTrade[] {
  const trades: RecentTrade[] = [];
  
  for (let i = 0; i < 30; i++) {
    const variation = (Math.random() - 0.5) * 0.004;
    trades.push({
      id: `trade-${i}`,
      price: parseFloat((basePrice * (1 + variation)).toFixed(2)),
      quantity: parseFloat((Math.random() * 2 + 0.01).toFixed(6)),
      side: Math.random() > 0.48 ? 'buy' : 'sell',
      time: new Date(Date.now() - i * (Math.random() * 3000 + 500)).toISOString(),
      isMakerBuy: Math.random() > 0.4,
    });
  }
  
  return trades;
}

// ============================================================
// PRICE DISPLAY COMPONENT
// ============================================================

interface PriceDisplayProps {
  currentPrice: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
}

function PriceDisplay({ currentPrice, change24h, changePercent24h, high24h, low24h, volume24h }: PriceDisplayProps) {
  const isPositive = changePercent24h >= 0;

  return (
    <div className="space-y-3">
      {/* Current Price */}
      <div className="flex items-baseline gap-3">
        <span className={cn(
          "text-3xl font-bold tabular-nums",
          isPositive ? "text-emerald-500" : "text-red-500"
        )}>
          ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <span className={cn(
          "flex items-center text-sm font-medium px-2 py-0.5 rounded",
          isPositive ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
        )}>
          {isPositive ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
          {isPositive ? '+' : ''}{changePercent24h.toFixed(2)}%
        </span>
      </div>

      {/* Price Stats Grid */}
      <div className="grid grid-cols-4 gap-2 text-xs">
        <div>
          <p className="text-muted-foreground">24h High</p>
          <p className="font-medium tabular-nums text-emerald-500">${high24h.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-muted-foreground">24h Low</p>
          <p className="font-medium tabular-nums text-red-500">${low24h.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-muted-foreground">24h Change</p>
          <p className={cn("font-medium tabular-nums", isPositive ? "text-emerald-500" : "text-red-500")}>
            {isPositive ? '+' : ''}${change24h.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">24h Volume</p>
          <p className="font-medium tabular-nums">${(volume24h / 1000000).toFixed(2)}M</p>
        </div>
      </div>
    </div>
 );
}

// ============================================================
// ORDER FORM COMPONENT
// ============================================================

interface OrderFormProps {
  symbol: string;
  currentPrice: number;
}

function OrderForm({ symbol, currentPrice }: OrderFormProps) {
  const { orderForm, updateOrderForm, resetOrderForm, submitOrder, isSubmittingOrder } = useTradingStore();
  const { isAuthenticated } = useAuthStore();

  const [side, setSide] = useState<OrderSide>(orderForm.side);
  const [orderType, setOrderType] = useState<OrderType>(orderForm.type);

  // Computed values
  const estimatedTotal = useMemo(() => {
    const qty = parseFloat(orderForm.quantity) || 0;
    const price = orderForm.type === 'market' ? currentPrice : (parseFloat(orderForm.price) || 0);
    return qty * price;
  }, [orderForm.quantity, orderForm.type, currentPrice]);

  /** Handle side change */
  const handleSideChange = (newSide: OrderSide) => {
    setSide(newSide);
    updateOrderForm({ side: newSide });
  };

  /** Handle order type change */
  const handleTypeChange = (newType: OrderType) => {
    setOrderType(newType);
    updateOrderForm({ type: newType });
  };

  /** Handle submit */
  const handleSubmit = async () => {
    if (!isAuthenticated) {
      alert('Please sign in to place orders');
      return;
    }
    
    await submitOrder();
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Place Order</CardTitle>
          <Badge variant="outline" className="text-[10px]">{symbol}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Side Selection */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={side === 'buy' ? 'default' : 'outline'}
            className={cn(
              "font-semibold",
              side === 'buy' && "bg-emerald-500 hover:bg-emerald-600 text-white"
            )}
            onClick={() => handleSideChange('buy')}
          >
            <ArrowDownLeft className="mr-1 h-4 w-4" />
            Buy / Long
          </Button>
          <Button
            variant={side === 'sell' ? 'default' : 'outline'}
            className={cn(
              "font-semibold",
              side === 'sell' && "bg-red-500 hover:bg-red-600 text-white"
            )}
            onClick={() => handleSideChange('sell')}
          >
            <ArrowUpRight className="mr-1 h-4 w-4" />
            Sell / Short
          </Button>
        </div>

        {/* Order Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Order Type</label>
          <Select value={orderType} onValueChange={(v) => handleTypeChange(v as OrderType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="market">Market</SelectItem>
              <SelectItem value="limit">Limit</SelectItem>
              <SelectItem value="stop">Stop Market</SelectItem>
              <SelectItem value="stop_limit">Stop Limit</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Price (for non-market orders) */}
        {orderType !== 'market' && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Price (USDT)</label>
            <Input
              type="number"
              placeholder="0.00"
              value={orderForm.price}
              onChange={(e) => updateOrderForm({ price: e.target.value })}
              className="font-mono"
            />
          </div>
        )}

        {/* Quantity */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Quantity ({symbol.split('/')[0]})</label>
            <span className="text-xs text-muted-foreground">Available: 0.00</span>
          </div>
          <Input
            type="number"
            placeholder="0.00"
            value={orderForm.quantity}
            onChange={(e) => updateOrderForm({ quantity: e.target.value })}
            className="font-mono"
          />
          
          {/* Quick percentage buttons */}
          <div className="grid grid-cols-4 gap-1">
            {[25, 50, 75, 100].map((percent) => (
              <Button
                key={percent}
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => updateOrderForm({ quantity: String(percent / 100) })}
              >
                {percent}%
              </Button>
            ))}
          </div>
        </div>

        {/* Leverage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Leverage</label>
            <span className="text-sm font-mono font-semibold text-primary">{orderForm.leverage}x</span>
          </div>
          <Slider
            value={[orderForm.leverage]}
            onValueChange={([v]) => updateOrderForm({ leverage: v })}
            min={1}
            max={125}
            step={1}
            className="py-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1x</span>
            <span>25x</span>
            <span>50x</span>
            <span>75x</span>
            <span>100x</span>
            <span>125x</span>
          </div>
        </div>

        {/* TP/SL */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center">
              Take Profit <Info className="ml-1 h-3 w-3 text-muted-foreground" />
            </label>
            <Input
              type="number"
              placeholder="Optional"
              value={orderForm.takeProfit}
              onChange={(e) => updateOrderForm({ takeProfit: e.target.value })}
              className="font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center">
              Stop Loss <Info className="ml-1 h-3 w-3 text-muted-foreground" />
            </label>
            <Input
              type="number"
              placeholder="Optional"
              value={orderForm.stopLoss}
              onChange={(e) => updateOrderForm({ stopLoss: e.target.value })}
              className="font-mono text-sm"
            />
          </div>
        </div>

        {/* Estimated Total */}
        <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50">
          <span className="text-sm text-muted-foreground">Estimated Total</span>
          <span className="font-mono font-semibold">
            ${estimatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Submit Button */}
        <Button
          className={cn(
            "w-full font-semibold text-base py-6",
            side === 'buy' 
              ? "bg-emerald-500 hover:bg-emerald-600" 
              : "bg-red-500 hover:bg-red-600"
          )}
          disabled={isSubmittingOrder || !orderForm.quantity || !isAuthenticated}
          onClick={handleSubmit}
        >
          {isSubmittingOrder ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          {!isAuthenticated ? 'Sign In to Trade' : `${side === 'buy' ? 'Buy' : 'Sell'} ${symbol.split('/')[0]}`}
        </Button>

        {/* Warning for high leverage */}
        {orderForm.leverage > 20 && (
          <div className="flex items-start gap-2 p-2 rounded bg-orange-500/10 text-orange-500 text-xs">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>High leverage increases risk of liquidation. Trade carefully.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================
// ORDER BOOK COMPONENT
// ============================================================

interface OrderBookProps {
  data: DepthData;
  currentPrice: number;
}

function OrderBook({ data, currentPrice }: OrderBookProps) {
  // Calculate max quantity for bar widths
  const maxBidQty = Math.max(...data.bids.map(([, q]) => q));
  const maxAskQty = Math.max(...data.asks.map(([, q]) => q));

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center">
            <BookOpen className="mr-2 h-4 w-4" />
            Order Book
          </CardTitle>
          <Badge variant="secondary" className="text-[10px]">Real-time</Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Header */}
        <div className="grid grid-cols-3 gap-2 px-4 py-2 text-xs font-medium text-muted-foreground border-b">
          <span>Price (USDT)</span>
          <span className="text-right">Amount</span>
          <span className="text-right">Total</span>
        </div>

        {/* Asks (sells) - reversed so highest ask at top */}
        <div className="max-h-[180px] overflow-hidden">
          {[...data.asks].reverse().map(([price, quantity], i) => {
            const total = price * quantity;
            const widthPercent = (quantity / maxAskQty) * 100;
            
            return (
              <div key={`ask-${i}`} className="relative grid grid-cols-3 gap-2 px-4 py-1 text-xs hover:bg-red-500/5 transition-colors">
                <div className="absolute inset-0 right-1/2 bg-red-500/20" style={{ width: `${widthPercent}%` }} />
                <span className="relative text-red-500 font-mono">{price.toFixed(2)}</span>
                <span className="relative text-right font-mono">{quantity.toFixed(4)}</span>
                <span className="relative text-right font-mono text-muted-foreground">{total.toFixed(2)}</span>
              </div>
            );
          })}
        </div>

        {/* Current Price Spread */}
        <div className="px-4 py-2 border-y bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="text-red-500 font-mono font-semibold text-sm">
              {data.asks[data.asks.length - 1]?.[0]?.toFixed(2) || '0.00'}
            </span>
            <span className="text-primary font-mono font-bold text-base tabular-nums">
              {currentPrice.toFixed(2)}
            </span>
            <span className="text-emerald-500 font-mono font-semibold text-sm">
              {data.bids[0]?.[0]?.toFixed(2) || '0.00'}
            </span>
          </div>
          <div className="text-center text-xs text-muted-foreground mt-1">
            Spread: {(data.asks[data.asks.length - 1]?.[0] - data.bids[0]?.[0]).toFixed(2)} USDT
          </div>
        </div>

        {/* Bids (buys) */}
        <div className="max-h-[180px] overflow-hidden">
          {data.bids.map(([price, quantity], i) => {
            const total = price * quantity;
            const widthPercent = (quantity / maxBidQty) * 100;
            
            return (
              <div key={`bid-${i}`} className="relative grid grid-cols-3 gap-2 px-4 py-1 text-xs hover:bg-emerald-500/5 transition-colors">
                <div className="absolute inset-0 left-1/2 bg-emerald-500/20" style={{ width: `${widthPercent}%` }} />
                <span className="relative text-emerald-500 font-mono">{price.toFixed(2)}</span>
                <span className="relative text-right font-mono">{quantity.toFixed(4)}</span>
                <span className="relative text-right font-mono text-muted-foreground">{total.toFixed(2)}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// RECENT TRADES COMPONENT
// ============================================================

interface RecentTradesProps {
  trades: RecentTrade[];
}

function RecentTrades({ trades }: RecentTradesProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center">
            <Activity className="mr-2 h-4 w-4" />
            Recent Trades
          </CardTitle>
          <Badge variant="secondary" className="text-[10px]">Live</Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Header */}
        <div className="grid grid-cols-3 gap-2 px-4 py-2 text-xs font-medium text-muted-foreground border-b">
          <span>Price (USDT)</span>
          <span className="text-right">Amount</span>
          <span className="text-right">Time</span>
        </div>

        {/* Trades List */}
        <div className="max-h-[380px] overflow-y-auto scrollbar-hide">
          {trades.map((trade) => (
            <div
              key={trade.id}
              className="grid grid-cols-3 gap-2 px-4 py-1.5 text-xs hover:bg-muted/30 transition-colors"
            >
              <span className={cn(
                "font-mono font-medium",
                trade.side === 'buy' ? "text-emerald-500" : "text-red-500"
              )}>
                {trade.price.toFixed(2)}
              </span>
              <span className="text-right font-mono">{trade.quantity.toFixed(6)}</span>
              <span className="text-right text-muted-foreground">
                {new Date(trade.time).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// CHART PLACEHOLDER COMPONENT
// ============================================================

function ChartPlaceholder({ candles, symbol }: { candles: CandleData[], symbol: string }) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h');

  if (!candles.length) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-[400px]">
          <div className="text-center">
            <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <p className="mt-2 text-muted-foreground">Loading chart data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const latestCandle = candles[candles.length - 1];
  const isPositive = latestCandle.close >= latestCandle.open;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-base font-semibold">{symbol}</CardTitle>
            <span className={cn(
              "text-lg font-bold tabular-nums",
              isPositive ? "text-emerald-500" : "text-red-500"
            )}>
              ${latestCandle.close.toFixed(2)}
            </span>
          </div>
          
          {/* Timeframe Selector */}
          <div className="flex gap-1">
            {['1m', '5m', '15m', '1h', '4h', '1d'].map((tf) => (
              <Button
                key={tf}
                variant={selectedTimeframe === tf ? 'default' : 'ghost'}
                size="sm"
                className="h-7 text-xs px-2"
                onClick={() => setSelectedTimeframe(tf)}
              >
                {tf}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Chart Area with SVG visualization */}
        <div className="h-[350px] relative bg-muted/20 rounded-lg overflow-hidden">
          <svg viewBox="0 0 800 350" className="w-full h-full" preserveAspectRatio="none">
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map((i) => (
              <line
                key={i}
                x1="0"
                y1={i * 70 + 35}
                x2="800"
                y2={i * 70 + 35}
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-border/50"
              />
            ))}
            
            {/* Candlesticks */}
            {candles.slice(-60).map((candle, i) => {
              const x = (i / 60) * 780 + 10;
              const maxPrice = Math.max(...candles.slice(-60).map(c => c.high));
              const minPrice = Math.min(...candles.slice(-60).map(c => c.low));
              const range = maxPrice - minPrice || 1;
              
              const yOpen = 320 - ((candle.open - minPrice) / range) * 280;
              const yClose = 320 - ((candle.close - minPrice) / range) * 280;
              const yHigh = 320 - ((candle.high - minPrice) / range) * 280;
              const yLow = 320 - ((candle.low - minPrice) / range) * 280;
              
              const candleIsPositive = candle.close >= candle.open;
              const color = candleIsPositive ? '#22c55e' : '#ef4444';
              
              return (
                <g key={i}>
                  {/* Wick */}
                  <line
                    x1={x + 4}
                    y1={yHigh}
                    x2={x + 4}
                    y2={yLow}
                    stroke={color}
                    strokeWidth="1"
                  />
                  {/* Body */}
                  <rect
                    x={x + 1}
                    y={Math.min(yOpen, yClose)}
                    width="6"
                    height={Math.abs(yOpen - yClose) || 1}
                    fill={color}
                  />
                </g>
              );
            })}
          </svg>
          
          {/* Overlay info */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <Badge variant={isPositive ? 'default' : 'destructive'} className="text-[10px]">
              {isPositive ? '▲' : '▼'} {((latestCandle.close - latestCandle.open) / latestCandle.open * 100).toFixed(2)}%
            </Badge>
          </div>
          
          {/* Volume bars at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-8 flex items-end gap-0.5 px-2">
            {candles.slice(-40).map((candle, i) => {
              const maxVol = Math.max(...candles.slice(-40).map(c => c.volume));
              const height = (candle.volume / maxVol) * 28;
              const isGreen = candle.close >= candle.open;
              
              return (
                <div
                  key={i}
                  className={cn("flex-1", isGreen ? "bg-emerald-500/40" : "bg-red-500/40")}
                  style={{ height: `${height}px` }}
                />
              );
            })}
          </div>
        </div>
        
        {/* Chart Legend */}
        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>O: <strong className="text-foreground">${latestCandle.open.toFixed(2)}</strong></span>
            <span>H: <strong className="text-emerald-500">${latestCandle.high.toFixed(2)}</strong></span>
            <span>L: <strong className="text-red-500">${latestCandle.low.toFixed(2)}</strong></span>
            <span>C: <strong className="text-foreground">${latestCandle.close.toFixed(2)}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-3 w-3 text-yellow-500" />
            <span>Live</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// MAIN TRADING PAGE
// ============================================================

export default function TradingPage() {
  const searchParams = useSearchParams();
  const { selectedSymbol, setSelectedSymbol } = useMarketStore();
  const { isAuthenticated } = useAuthStore();
  
  // Get symbol from URL or store
  const symbolFromUrl = searchParams.get('symbol');
  const activeSymbol = symbolFromUrl || selectedSymbol;
  
  // State
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [orderBook, setOrderBook] = useState<DepthData | null>(null);
  const [recentTrades, setRecentTrades] = useState<RecentTrade[]>([]);
  
  // Find asset data
  const asset = useMemo(() => {
    const allAssets = [...SAMPLE_CRYPTO_ASSETS];
    return allAssets.find(a => a.symbol === activeSymbol) || allAssets[0];
  }, [activeSymbol]);

  // Generate initial data using useMemo (avoids setState in effect)
  const initialData = useMemo(() => {
    if (!asset) return { candles: [], orderBook: null, trades: [] };
    
    return {
      candles: generateCandleData(asset.priceData.currentPrice),
      orderBook: generateOrderBook(asset.priceData.currentPrice),
      trades: generateRecentTrades(asset.priceData.currentPrice),
    };
  }, [asset]);

  // Initialize state from memoized data
  const [candles, setCandles] = useState<CandleData[]>(initialData.candles);
  const [orderBook, setOrderBook] = useState<DepthData | null>(initialData.orderBook);
  const [recentTrades, setRecentTrades] = useState<RecentTrade[]>(initialData.trades);

  // Update selected symbol in store when URL changes
  useEffect(() => {
    if (symbolFromUrl && symbolFromUrl !== selectedSymbol) {
      setSelectedSymbol(symbolFromUrl);
    }
  }, [symbolFromUrl, selectedSymbol, setSelectedSymbol]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (asset) {
        // Update last candle with small price changes
        setCandles(prev => {
          if (prev.length === 0) return prev;
          const lastCandle = prev[prev.length - 1];
          const change = (Math.random() - 0.48) * asset.priceData.currentPrice * 0.001;
          const newClose = lastCandle.close + change;
          
          return [
            ...prev.slice(0, -1),
            {
              ...lastCandle,
              close: newClose,
              high: Math.max(lastCandle.high, newClose),
              low: Math.min(lastCandle.low, newClose),
            },
          ];
        });
        
        // Occasionally update order book and trades
        if (Math.random() > 0.7) {
          setOrderBook(generateOrderBook(asset.priceData.currentPrice * (1 + (Math.random() - 0.5) * 0.001)));
        }
        if (Math.random() > 0.8) {
          setRecentTrades(generateRecentTrades(asset.priceData.currentPrice));
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [asset]);

  if (!asset) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-muted-foreground">Loading trading interface...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Trade</h1>
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-muted-foreground hover:text-yellow-500 cursor-pointer transition-colors" />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings2 className="mr-2 h-4 w-4" />
            Preferences
          </Button>
        </div>
      </motion.div>

      {/* Price Display Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <PriceDisplay
          currentPrice={asset.priceData.currentPrice}
          change24h={asset.priceData.change24h}
          changePercent24h={asset.priceData.changePercent24h}
          high24h={asset.priceData.high24h}
          low24h={asset.priceData.low24h}
          volume24h={asset.priceData.volume24h}
        />
      </motion.div>

      {/* Main Trading Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Chart - Takes up most space */}
        <motion.div
          className="xl:col-span-8"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
        >
          <ChartPlaceholder candles={candles} symbol={activeSymbol} />
        </motion.div>

        {/* Right Panel - Order Form & Order Book */}
        <div className="xl:col-span-4 space-y-4">
          {/* Order Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <OrderForm symbol={activeSymbol} currentPrice={asset.priceData.currentPrice} />
          </motion.div>

          {/* Order Book */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
          >
            {orderBook && <OrderBook data={orderBook} currentPrice={asset.priceData.currentPrice} />}
          </motion.div>
        </div>

        {/* Recent Trades - Full Width Below */}
        <motion.div
          className="xl:col-span-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <RecentTrades trades={recentTrades} />
        </motion.div>
      </div>
    </div>
  );
}
