/**
 * Tray'd Portfolio Page
 * @description View portfolio performance, asset allocation, and trading history
 */

'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  PieChart as PieChartIcon,
  BarChart3,
  Activity,
  Calendar,
  Download,
  Eye,
  Target,
  Award,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { cn, formatCurrency, formatPercent, formatCompactNumber } from '@/lib/utils';

// ============================================================
// MOCK DATA
// ============================================================

function generatePortfolioData() {
  return {
    totalValue: 52847.83,
    totalDeposited: 45000.00,
    totalWithdrawn: 12000.00,
    todayPnl: 342.18,
    weeklyPnl: 1247.56,
    monthlyPnl: 3456.78,
    allTimePnl: 7847.83,
    winRate: 64.5,
    totalTrades: 156,
    profitableTrades: 101,
    losingTrades: 55,
    bestTrade: 2450.00,
    worstTrade: -890.00,
    avgWin: 425.50,
    avgLoss: -215.30,
    profitFactor: 1.98,
    sharpeRatio: 1.45,
    maxDrawdown: -12.4,
  };
}

function generateAssetAllocation() {
  return [
    { symbol: 'BTC', name: 'Bitcoin', value: 26500, percentage: 50.1, change: 2.4, icon: '₿' },
    { symbol: 'ETH', name: 'Ethereum', value: 12500, percentage: 23.7, change: -1.2, icon: 'Ξ' },
    { symbol: 'USDT', name: 'Tether', value: 8432, percentage: 16.0, change: 0.0, icon: '$' },
    { symbol: 'SOL', name: 'Solana', value: 3569, percentage: 6.8, change: 5.8, icon: '◎' },
    { symbol: 'Other', name: 'Other Assets', value: 1847, percentage: 3.5, change: 0.5, icon: '📊' },
  ];
}

function generatePerformanceHistory() {
  const now = Date.now();
  const data = [];
  
  for (let i = 89; i >= 0; i--) {
    const date = new Date(now - i * 86400000);
    const baseValue = 20000;
    const variation = Math.sin(i * 0.1) * 5000 + (i * 100) + (Math.random() - 0.4) * 2000;
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: baseValue + variation,
      pnl: variation,
      deposit: 20000 + (i * 500),
    });
  }
  
  return data;
}

function generateTradeHistory() {
  return [
    { id: '1', pair: 'BTC/USDT', side: 'buy', size: 0.15, entryPrice: 65234, exitPrice: 68901, pnl: 545.07, pnlPercent: 5.54, fee: 8.17, time: new Date(Date.now() - 86400000), status: 'closed' },
    { id: '2', pair: 'ETH/USDT', side: 'sell', size: 10, entryPrice: 3600, exitPrice: 3456, pnl: 1440, pnlPercent: 4.0, fee: 14.40, time: new Date(Date.now() - 172800000), status: 'closed' },
    { id: '3', pair: 'SOL/USDT', side: 'buy', size: 25, entryPrice: 172, exitPrice: 195, pnl: 575, pnlPercent: 13.37, fee: 4.88, time: new Date(Date.now() - 259200000), status: 'closed' },
    { id: '4', pair: 'BTC/USDT', side: 'sell', size: 0.08, entryPrice: 71000, exitPrice: 68500, pnl: 200, pnlPercent: 3.52, fee: 5.44, time: new Date(Date.now() - 345600000), status: 'closed' },
    { id: '5', pair: 'EUR/USD', side: 'buy', size: 10000, entryPrice: 1.0845, exitPrice: 1.0920, pnl: 75, pnlPercent: 0.69, fee: 5.00, time: new Date(Date.now() - 43200000), status: 'closed' },
    { id: '6', pair: 'ETH/USDT', side: 'buy', size: 5, entryPrice: 3389, exitPrice: null, pnl: 338.50, pnlPercent: 2.0, fee: 2.53, time: new Date(Date.now() - 3600000), status: 'open' },
    { id: '7', pair: 'SOL/USDT', side: 'sell', size: 15, entryPrice: 185.40, exitPrice: null, pnl: -102.00, pnlPercent: -3.67, fee: 1.11, time: new Date(Date.now() - 7200000), status: 'open' },
  ];
}

// ============================================================
// SUB COMPONENTS
// ============================================================

function PerformanceChart({ data }: { data: typeof generatePerformanceHistory }) {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Portfolio Performance</CardTitle>
          <Select defaultValue="3m">
            <SelectTrigger className="w-[100px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1w">1 Week</SelectItem>
              <SelectItem value="1m">1 Month</SelectItem>
              <SelectItem value="3m">3 Months</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {/* Chart */}
        <div className="h-48 relative">
          <svg viewBox="0 0 400 180" className="w-full h-full" preserveAspectRatio="none">
            {/* Grid lines */}
            {[0, 1, 2, 3].map((i) => (
              <line key={i} x1="0" y1={i * 45 + 20} x2="400" y2={i * 45 + 20} stroke="currentColor" strokeWidth="0.5" className="text-border/30" />
            ))}
            
            {/* Area fill */}
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            
            <path
              d={`M 0 ${160} ${data.map((d, i) => {
                const x = (i / (data.length - 1)) * 400;
                const y = 160 - ((d.value - minValue) / range) * 140;
                return `${x} ${y}`;
              }).join(' L ')}`}
              fill="url(#areaGradient)"
            />
            
            {/* Line */}
            <path
              d={`M 0 ${160} ${data.map((d, i) => {
                const x = (i / (data.length - 1)) * 400;
                const y = 160 - ((d.value - minValue) / range) * 140;
                return `${x} ${y}`;
              }).join(' L ')}`}
              fill="none"
              stroke="#7c3aed"
              strokeWidth="2"
            />
            
            {/* Data points */}
            {data.filter((_, i) => i % 10 === 0).map((d, i) => {
              const x = (i / (data.length - 1)) * 400;
              const y = 160 - ((d.value - minValue) / range) * 140;
              return <circle key={i} cx={x} cy={y} r="3" fill="#7c3aed" />;
            })}
          </svg>
          
          {/* Current value indicator */}
          <div className="absolute top-2 right-2 text-xs text-muted-foreground">
            ${(data[data.length - 1]?.value || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex justify-between mt-3 text-xs text-muted-foreground">
          <span>Start: ${data[0]?.date ? new Date(data[0].date).toLocaleDateString() : ''}</span>
          <span>Now</span>
        </div>
      </CardContent>
    </Card>
  );
}

function AssetAllocationPie({ assets }: { assets: ReturnType<typeof generateAssetAllocation> }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center">
          <PieChartIcon className="mr-2 h-4 w-4" />
          Asset Allocation
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {assets.map((asset) => (
            <div key={asset.symbol} className="flex items-center gap-3">
              <div className="flex items-center gap-2 w-16">
                <span className="text-lg">{asset.icon}</span>
                <span className="text-xs font-medium w-6">{asset.symbol}</span>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">{asset.name}</span>
                  <span className={cn(
                    "text-xs font-mono tabular-nums",
                    asset.change >= 0 ? "text-emerald-500" : "text-red-500"
                  )}>
                    {asset.change >= 0 ? '+' : ''}{asset.change}%
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "h-2 rounded-full bg-muted overflow-hidden",
                    asset.change >= 0 ? "bg-emerald-500/20" : "bg-red-500/20"
                  )}>
                    <div 
                      className={cn(
                        "h-full rounded-full bg-primary",
                        asset.change >= 0 ? "bg-emerald-500" : "bg-red-500"
                      )}
                      style={{ width: `${Math.min(asset.percentage, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono tabular-nums w-10 text-right">
                    {asset.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <p className="text-xs text-right font-mono tabular-nums">
                ${formatCurrency(asset.value)}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TradeHistoryTable({ trades }: { trades: ReturnType<typeof generateTradeHistory> }) {
  const closedTrades = trades.filter(t => t.status === 'closed');
  const openTrades = trades.filter(t => t.status === 'open');
  const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center">
            <BarChart3 className="mr-2 h-4 w-4" />
            Trade History
          </CardTitle>
          <Badge variant={totalPnl >= 0 ? 'default' : 'destructive'} className="bg-emerald-500/10 text-emerald-500 border-0">
            P&L: {totalPnl >= 0 ? '+' : ''}{formatCurrency(totalPnl)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-3 px-4 py-3 border-b bg-muted/30">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Total Trades</p>
            <p className="font-bold text-sm">{trades.length}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Win Rate</p>
            <p className="font-bold text-sm text-emerald-500">
              {((closedTrades.filter(t => t.pnl > 0).length / Math.max(closedTrades.length, 1)) * 100).toFixed(1)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Best Trade</p>
            <p className="font-bold text-sm text-emerald-500">+${Math.max(...trades.map(t => t.pnl)).toFixed(0)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Open Positions</p>
            <p className="font-bold text-sm">{openTrades.length}</p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto max-h-[300px]">
          <table className="w-full">
            <thead>
              <tr className="border-b text-xs text-muted-foreground">
                <th className="px-4 py-2 text-left">Pair</th>
                <th className="px-4 py-2 text-left">Side</th>
                <th className="px-4 py-2 text-right">Size</th>
                <th className="px-4 py-2 text-right">Entry</th>
                <th className="px-4 py-2 text-right">Exit</th>
                <th className="px-4 py-2 text-right">P&L</th>
                <th className="px-4 py-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {trades.slice(0, 10).map((trade) => (
                <tr key={trade.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2 font-medium text-sm">{trade.pair}</td>
                  <td className="px-4 py-2">
                    <Badge variant={trade.side === 'buy' ? 'default' : 'destructive'} className="text-[10px] px-1.5 py-0">
                      {trade.side.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-4 py-2 font-mono text-sm text-right tabular-nums">{trade.size}</td>
                  <td className="px-4 py-2 font-mono text-sm text-right tabular-nums">${trade.entryPrice.toLocaleString()}</td>
                  <td className="px-4 py-2 font-mono text-sm text-right tabular-nums">
                    {trade.exitPrice?.toLocaleString() || '-'}
                  </td>
                  <td className={cn(
                    "px-4 py-2 font-mono text-sm text-right tabular-nums font-medium",
                    trade.pnl >= 0 ? "text-emerald-500" : "text-red-500"
                  )}>
                    {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <Badge 
                      variant={trade.status === 'closed' ? 'secondary' : 'outline'} 
                      className="text-[10px]"
                    >
                      {trade.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// MAIN PORTFOLIO PAGE
// ============================================================

export default function PortfolioPage() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('3m');
  const portfolioData = generatePortfolioData();
  const allocationData = generateAssetAllocation();
  const performanceData = generatePerformanceHistory();
  const tradeHistory = generateTradeHistory();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Portfolio</h1>
          <p className="text-muted-foreground mt-1">
            Track your performance and analyze your positions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </motion.div>

      {/* Main Value Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card>
          <CardContent className="p-4 lg:p-5">
            <p className="text-xs text-muted-foreground">Total Value</p>
            <p className="text-xl lg:text-2xl font-bold mt-1 tabular-nums">
              ${portfolioData.totalValue.toLocaleString()}
            </p>
            <div className="flex items-center gap-1 mt-1 text-xs text-emerald-500">
              <TrendingUp className="h-3 w-3" />
              <span>+{formatPercent(portfolioData.allTimePnl)} All Time</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 lg:p-5">
            <p className="text-xs text-muted-foreground">Today's P&L</p>
            <p className={cn(
              "text-xl lg:text-2xl font-bold mt-1 tabular-nums",
              portfolioData.todayPnl >= 0 ? "text-emerald-500" : "text-red-500"
            )}>
              {portfolioData.todayPnl >= 0 ? '+' : ''}{formatCurrency(portfolioData.todayPnl)}
            </p>
          <p className="text-xs text-muted-foreground mt-1">Today</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 lg:p-5">
            <p className="text-xs text-muted-foreground">This Week</p>
            <p className={cn(
              "text-xl lg:text-2xl font-bold mt-1 tabular-nums",
              portfolioData.weeklyPnl >= 0 ? "text-emerald-500" : "text-red-500"
            )}>
              {portfolioData.weeklyPnl >= 0 ? '+' : ''}{formatCurrency(portfolioData.weeklyPnl)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 lg:p-5">
            <p className="text-xs text-muted-foreground">Total Deposited</p>
            <p className="text-xl lg:text-2xl font-bold mt-1 tabular-nums">
              {formatCurrency(portfolioData.totalDeposited)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <PerformanceChart data={performanceData} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
        >
          <AssetAllocationPie assets={allocationData} />
        </motion.div>
      </div>

      {/* Trade History */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <TradeHistoryTable trades={tradeHistory} />
      </motion.div>

      {/* Risk Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center">
              <Target className="mr-2 h-4 w-4" />
              Risk Metrics & Statistics
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Win Rate', value: portfolioData.winRate, suffix: '%', good: portfolioData.winRate > 50 },
                { label: 'Profit Factor', value: portfolioData.profitFactor, suffix: ':1', good: portfolioData.profitFactor > 1.5 },
                { label: 'Sharpe Ratio', value: portfolioData.sharpeRatio, suffix: '', good: portfolioData.sharpeRatio > 1 },
                { label: 'Max Drawdown', value: Math.abs(portfolioData.maxDrawdown), suffix: '%', good: portfolioData.maxDrawdown > -20 },
              ].map((metric) => (
                <div key={metric.label} className="space-y-1 p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{metric.label}</span>
                    <span className={cn(
                      "text-sm font-bold tabular-nums",
                      metric.good ? "text-emerald-500" : "text-orange-500"
                    )}>
                      {typeof metric.value === 'number' ? metric.value.toFixed(2) : metric.value}
                      {metric.suffix}
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(Math.abs(typeof metric.value === 'number' ? metric.value : 0) * (metric.label === 'Max Drawdown' ? 5 : 100), 100)} 
                    className="h-1.5 mt-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
