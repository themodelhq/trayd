/**
 * Tray'd Trading Platform - Main Dashboard
 * @description Professional trading dashboard with portfolio overview, market data, and quick actions
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Eye,
  Target,
  Clock,
  DollarSign,
  Percent,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  Star,
  Flame,
  Award,
  Users,
  Gift,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn, formatCurrency, formatPercent, formatCompactNumber, formatRelativeTime } from '@/lib/utils';
import { useAuthStore, useMarketStore } from '@/store';
import { SAMPLE_CRYPTO_ASSETS, SAMPLE_FOREX_PAIRS } from '@/constants';

// ============================================================
// MOCK DATA GENERATORS
// ============================================================

/** Generate mock portfolio data */
function generatePortfolioData() {
  return {
    totalValue: 52847.83,
    totalValueChange: 1247.56,
    totalValueChangePercent: 2.42,
    todayPnl: 342.18,
    todayPnlPercent: 0.65,
    availableBalance: 12500.00,
    usedMargin: 8234.56,
    marginRatio: 15.6,
    marginLevel: 642,
    openPositionsValue: 32114.27,
    pendingOrdersValue: 5000.00,
    winRate: 64.5,
    totalTrades: 156,
    profitableTrades: 101,
    losingTrades: 55,
    largestWin: 2450.00,
    largestLoss: -890.00,
    avgWin: 425.50,
    avgLoss: -215.30,
    profitFactor: 1.98,
    sharpeRatio: 1.45,
    maxDrawdown: -12.4,
    expectancy: 0.68,
  };
}

/** Generate mock positions data */
function generatePositions() {
  return [
    {
      id: 'pos-1',
      symbol: 'BTC/USDT',
      side: 'buy' as const,
      size: 0.45,
      entryPrice: 65234.50,
      markPrice: 67543.21,
      liquidationPrice: 48426.88,
      leverage: 10,
      unrealizedPnl: 994.02,
      pnlPercent: 3.39,
      openTime: new Date(Date.now() - 86400000 * 0.5).toISOString(),
    },
    {
      id: 'pos-2',
      symbol: 'ETH/USDT',
      side: 'buy' as const,
      size: 5.2,
      entryPrice: 3389.45,
      markPrice: 3456.78,
      liquidationPrice: 2441.04,
      leverage: 7,
      unrealizedPnl: 350.31,
      pnlPercent: 1.98,
      openTime: new Date(Date.now() - 86400000 * 0.3).toISOString(),
    },
    {
      id: 'pos-3',
      symbol: 'SOL/USDT',
      side: 'sell' as const,
      size: 25,
      entryPrice: 185.40,
      markPrice: 178.45,
      liquidationPrice: 245.32,
      leverage: 5,
      unrealizedPnl: 173.75,
      pnlPercent: 3.75,
      openTime: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
    {
      id: 'pos-4',
      symbol: 'EUR/USD',
      side: 'buy' as const,
      size: 15000,
      entryPrice: 1.0845,
      markPrice: 1.0876,
      liquidationPrice: 1.0523,
      leverage: 20,
      unrealizedPnl: 46.50,
      pnlPercent: 0.29,
      openTime: new Date(Date.now() - 3600000 * 6).toISOString(),
    },
  ];
}

/** Generate recent activity */
function generateRecentActivity() {
  return [
    {
      id: 'act-1',
      type: 'trade' as const,
      title: 'BTC/USDT Buy Executed',
      description: 'Bought 0.15 BTC at $67,234.50',
      amount: +10085.17,
      timestamp: new Date(Date.now() - 1800000),
    },
    {
      id: 'act-2',
      type: 'deposit' as const,
      title: 'Deposit Received',
      description: 'Bank transfer completed',
      amount: +5000.00,
      timestamp: new Date(Date.now() - 7200000),
    },
    {
      id: 'act-3',
      type: 'trade' as const,
      title: 'SOL/USDT Sell Closed',
      description: 'Sold 50 SOL at $180.20',
      amount: +892.50,
      timestamp: new Date(Date.now() - 14400000),
    },
    {
      id: 'act-4',
      type: 'withdrawal' as const,
      title: 'Withdrawal Processing',
      description: 'USDT withdrawal to external wallet',
      amount: -2000.00,
      timestamp: new Date(Date.now() - 28800000),
    },
    {
      id: 'act-5',
      type: 'bonus' as const,
      title: 'Trading Reward Earned',
      description: 'Daily trading volume bonus',
      amount: +45.80,
      timestamp: new Date(Date.now() - 43200000),
    },
  ];
}

/** Generate top gainers/losers for watchlist */
function generateTopMovers() {
  const allAssets = [...SAMPLE_CRYPTO_ASSETS];
  
  // Add random price changes
  return allAssets.slice(0, 6).map(asset => ({
    ...asset,
    changePercent: asset.priceData.changePercent24h + (Math.random() - 0.5) * 5,
  })).sort((a, b) => b.changePercent - a.changePercent);
}

// ============================================================
// ANIMATION VARIANTS
// ============================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

// ============================================================
// DASHBOARD COMPONENTS
// ============================================================

/** Portfolio Value Card */
function PortfolioValueCard({ data }: { data: ReturnType<typeof generatePortfolioData> }) {
  const isPositive = data.totalValueChange >= 0;
  
  return (
    <motion.div variants={itemVariants}>
      <Card className="gradient-border overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Portfolio Value</p>
              <motion.p 
                className="text-3xl font-bold tracking-tight mt-1 tabular-nums"
                key={data.totalValue}
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 1 }}
              >
                {formatCurrency(data.totalValue)}
              </motion.p>
            </div>
            <div className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl",
              isPositive ? "bg-emerald-500/10" : "bg-red-500/10"
            )}>
              {isPositive ? (
                <TrendingUp className="h-6 w-6 text-emerald-500" />
              ) : (
                <TrendingDown className="h-6 w-6 text-red-500" />
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <span className={cn(
              "font-medium flex items-center gap-1",
              isPositive ? "text-emerald-500" : "text-red-500"
            )}>
              {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
              {formatCurrency(Math.abs(data.totalValueChange))} ({isPositive ? '+' : ''}{data.totalValueChangePercent.toFixed(2)}%)
            </span>
            <span className="text-muted-foreground">All Time</span>
          </div>

          {/* Mini chart placeholder */}
          <div className="mt-4 h-12 flex items-end gap-0.5">
            {Array.from({ length: 24 }).map((_, i) => {
              const height = 30 + Math.random() * 70;
              const isLast = i === 23;
              return (
                <motion.div
                  key={i}
                  className={cn(
                    "flex-1 rounded-sm",
                    isLast ? (isPositive ? "bg-emerald-500" : "bg-red-500") : "bg-muted"
                  )}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/** Quick Stats Cards */
function QuickStatsCards({ data }: { data: ReturnType<typeof generatePortfolioData> }) {
  const stats = [
    {
      label: "Today's P&L",
      value: formatCurrency(data.todayPnl),
      change: data.todayPnlPercent,
      icon: Activity,
      color: data.todayPnl >= 0 ? 'emerald' : 'red',
    },
    {
      label: 'Available Balance',
      value: formatCurrency(data.availableBalance),
      icon: Wallet,
      color: 'violet',
    },
    {
      label: 'Open Positions',
      value: formatCurrency(data.openPositionsValue),
      subValue: `${generatePositions().length} positions`,
      icon: BarChart3,
      color: 'blue',
    },
    {
      label: 'Win Rate',
      value: `${data.winRate}%`,
      subValue: `${data.profitableTrades}/${data.totalTrades}`,
      icon: Target,
      color: data.winRate >= 50 ? 'emerald' : 'orange',
    },
  ];

  return (
    <>
      {stats.map((stat) => (
        <motion.div key={stat.label} variants={itemVariants}>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 lg:p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-lg lg:text-xl font-bold mt-1 tabular-nums">{stat.value}</p>
                  {stat.subValue && (
                    <p className="text-xs text-muted-foreground mt-0.5">{stat.subValue}</p>
                  )}
                  {'change' in stat && (
                    <p className={cn(
                      "text-xs font-medium mt-1 flex items-center",
                      (stat as any).change >= 0 ? "text-emerald-500" : "text-red-500"
                    )}>
                      {(stat as any).change >= 0 ? '+' : ''}{(stat as any).change.toFixed(2)}%
                    </p>
                  )}
                </div>
                <div className={cn(
                  "flex h-9 w-9 lg:h-10 lg:w-10 items-center justify-center rounded-lg",
                  `bg-${stat.color}-500/10`
                )}>
                  <stat.icon className={cn("h-4 w-4 lg:h-5 lg:w-5", `text-${stat.color}-500`)} 
                    style={{ color: `var(--color-${stat.color})` }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </>
  );
}

/** Open Positions Table */
function OpenPositionsTable() {
  const positions = generatePositions();
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Open Positions</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/trading">View All <ChevronRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Pair</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Side</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Size</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-hidden">Entry</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Mark</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">PnL</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">PnL %</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((position) => (
                <tr key={position.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/trading?symbol=${position.symbol}`} className="font-medium hover:text-primary transition-colors">
                      {position.symbol}
                    </Link>
                    <p className="text-xs text-muted-foreground">{position.leverage}x</p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Badge variant={position.side === 'buy' ? 'default' : 'destructive'} className="text-[10px] px-1.5 py-0">
                      {position.side.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm tabular-nums">{position.size}</td>
                  <td className="px-4 py-3 text-right font-mono text-sm tabular-nums">${position.entryPrice.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-mono text-sm tabular-nums">${position.markPrice.toLocaleString()}</td>
                  <td className={cn(
                    "px-4 py-3 text-right font-mono text-sm tabular-nums font-medium",
                    position.unrealizedPnl >= 0 ? "text-emerald-500" : "text-red-500"
                  )}>
                    {position.unrealizedPnl >= 0 ? '+' : ''}{formatCurrency(position.unrealizedPnl)}
                  </td>
                  <td className={cn(
                    "px-4 py-3 text-right font-mono text-sm tabular-nums font-medium",
                    position.pnlPercent >= 0 ? "text-emerald-500" : "text-red-500"
                  )}>
                    {position.pnlPercent >= 0 ? '+' : ''}{position.pnlPercent.toFixed(2)}%
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

/** Market Overview Widget */
function MarketOverviewWidget() {
  const movers = generateTopMovers();
  const { setSelectedSymbol } = useMarketStore();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Market Overview</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/markets">All Markets <ChevronRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {movers.map((asset) => {
          const isPositive = asset.priceData.changePercent24h >= 0;
          
          return (
            <button
              key={asset.id}
              onClick={() => setSelectedSymbol(asset.symbol)}
              className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-muted transition-colors text-left"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gradient-to-br from-violet-500/20 to-purple-500/20 text-[10px] font-bold">
                  {asset.baseAsset.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{asset.symbol}</p>
                <p className="text-xs text-muted-foreground">{asset.name}</p>
              </div>
              
              <div className="text-right">
                <p className="font-mono text-sm tabular-nums">
                  ${asset.priceData.currentPrice.toLocaleString()}
                </p>
                <p className={cn(
                  "text-xs font-medium tabular-nums",
                  isPositive ? "text-emerald-500" : "text-red-500"
                )}>
                  {isPositive ? '+' : ''}{asset.priceData.changePercent24h.toFixed(2)}%
                </p>
              </div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}

/** Recent Activity Feed */
function RecentActivityFeed() {
  const activities = generateRecentActivity();
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'trade': return BarChart3;
      case 'deposit': return ArrowDownLeft;
      case 'withdrawal': return ArrowUpRight;
      case 'bonus': return Gift;
      default: return Activity;
    }
  };

  const getColor = (type: string, amount: number) => {
    if (amount > 0) return 'text-emerald-500 bg-emerald-500/10';
    if (amount < 0 && type === 'withdrawal') return 'text-red-500 bg-red-500/10';
    return 'text-blue-500 bg-blue-500/10';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/wallet">View All <ChevronRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => {
          const Icon = getIcon(activity.type);
          
          return (
            <div key={activity.id} className="flex items-start gap-3">
              <div className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                getColor(activity.type, activity.amount)
              )}>
                <Icon className="h-4 w-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{activity.title}</p>
                <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
              </div>
              
              <div className="text-right shrink-0">
                <p className={cn(
                  "text-sm font-mono font-medium tabular-nums",
                  activity.amount > 0 ? "text-emerald-500" : "text-red-500"
                )}>
                  {activity.amount > 0 ? '+' : ''}{formatCurrency(activity.amount)}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {formatRelativeTime(activity.timestamp.toISOString())}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

/** Quick Actions Panel */
function QuickActionsPanel() {
  const actions = [
    { label: 'Trade', icon: TrendingUp, href: '/trading', color: 'from-violet-500 to-purple-600' },
    { label: 'Deposit', icon: ArrowDownLeft, href: '/wallet?tab=deposit', color: 'from-emerald-500 to-green-600' },
    { label: 'Withdraw', icon: ArrowUpRight, href: '/wallet?tab=withdraw', color: 'from-blue-500 to-cyan-600' },
    { label: 'Transfer', icon: RefreshCw, href: '/wallet?tab=transfer', color: 'from-orange-500 to-amber-600' },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            className="h-auto py-4 flex-col gap-2 hover:shadow-md transition-all"
            asChild
          >
            <Link href={action.href}>
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white",
                action.color
              )}>
                <action.icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium">{action.label}</span>
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}

/** Performance Metrics Panel */
function PerformanceMetricsPanel({ data }: { data: ReturnType<typeof generatePortfolioData> }) {
  const metrics = [
    { label: 'Profit Factor', value: data.profitFactor, format: 'x', good: data.profitFactor > 1.5 },
    { label: 'Sharpe Ratio', value: data.sharpeRatio, format: '', good: data.sharpeRatio > 1 },
    { label: 'Max Drawdown', value: Math.abs(data.maxDrawdown), format: '%', prefix: '-', good: false },
    { label: 'Expectancy', value: data.expectancy, format: ':1', good: data.expectancy > 0.5 },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{metric.label}</span>
              <span className={cn(
                "font-mono font-medium tabular-nums",
                metric.good ? "text-emerald-500" : "text-orange-500"
              )}>
                {metric.prefix || ''}{metric.value.toFixed(2)}{metric.format}
              </span>
            </div>
            <Progress 
              value={metric.label === 'Max Drawdown' ? Math.min(metric.value * 5, 100) : Math.min(metric.value * 50, 100)} 
              className="h-1.5"
            />
          </div>
        ))}
        
        {/* Risk Score */}
        <div className="pt-3 border-t mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Risk Score</span>
            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-0">
              Moderate
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full bg-gradient-to-r from-emerald-500 via-yellow-500 to-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500 border-2 border-background -ml-4" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Your current risk level is moderate. Consider diversifying your portfolio.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// MAIN DASHBOARD PAGE
// ============================================================

export default function DashboardPage() {
  const { isAuthenticated, user } = useAuthStore();
  const [portfolioData] = useState(generatePortfolioData());
  const [isRefreshing, setIsRefreshing] = useState(false);

  /** Simulate data refresh */
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
            {isAuthenticated ? `Welcome back, ${user?.firstName || user?.displayName || 'Trader'} 👋` : 'Dashboard'}
          </h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s your portfolio overview and market summary
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
          <Button size="sm" asChild>
            <Link href="/trading">
              <Zap className="mr-2 h-4 w-4" />
              Start Trading
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-6"
      >
        {/* Top Row - Portfolio Value */}
        <div className="col-span-full lg:col-span-3">
          <PortfolioValueCard data={portfolioData} />
        </div>

        {/* Quick Stats Grid */}
        <QuickStatsCards data={portfolioData} />

        {/* Middle Row - Positions & Market */}
        <div className="col-span-full lg:col-span-8 xl:col-span-8">
          <OpenPositionsTable />
        </div>

        <div className="col-span-full lg:col-span-4 xl:col-span-4 space-y-6">
          <MarketOverviewWidget />
        </div>

        {/* Bottom Row - Activity, Actions, Performance */}
        <div className="col-span-full lg:col-span-4 xl:col-span-4">
          <RecentActivityFeed />
        </div>

        <div className="col-span-full lg:col-span-4 xl:col-span-4">
          <QuickActionsPanel />
        </div>

        <div className="col-span-full lg:col-span-4 xl:col-span-4">
          <PerformanceMetricsPanel data={portfolioData} />
        </div>
      </motion.div>

      {/* Footer spacer for sticky footer */}
      <div className="h-4" />
    </div>
  );
}
