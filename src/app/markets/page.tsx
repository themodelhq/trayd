/**
 * Tray'd Markets Page
 * @description Browse all available trading assets with real-time prices and market data
 */

'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Search,
  Star,
  TrendingUp,
  TrendingDown,
  Filter,
  Grid3X3,
  List,
  ChevronDown,
  ExternalLink,
  BarChart3,
  Activity,
  Flame,
  Clock,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn, formatCurrency, formatCompactNumber, formatPercent } from '@/lib/utils';
import { useMarketStore, useAuthStore } from '@/store';
import { SAMPLE_CRYPTO_ASSETS, SAMPLE_FOREX_PAIRS, MARKET_CATEGORIES } from '@/constants';
import type { MarketCategory } from '@/types';

// ============================================================
// TYPES
// ============================================================

type ViewMode = 'grid' | 'list';
type SortOption = 'volume' | 'change' | 'name' | 'price';

// ============================================================
// ASSET CARD COMPONENT (Grid View)
// ============================================================

interface AssetCardProps {
  symbol: string;
  name: string;
  baseAsset: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  category: MarketCategory;
}

function AssetCard({ symbol, name, baseAsset, price, change24h, changePercent24h, volume24h, category }: AssetCardProps) {
  const isPositive = changePercent24h >= 0;
  const { setSelectedSymbol } = useMarketStore();

  return (
    <Link href={`/trading?symbol=${symbol}`} className="block">
      <Card className="hover:shadow-lg transition-all duration-200 hover:border-primary/30 group cursor-pointer h-full">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Avatar className="h-9 w-9">
                <AvatarFallback className={cn(
                  "text-[10px] font-bold text-white",
                  category === 'crypto' ? "bg-gradient-to-br from-violet-500 to-purple-600" :
                  category === 'forex' ? "bg-gradient-to-br from-emerald-500 to-green-600" :
                  "bg-gradient-to-br from-blue-500 to-cyan-600"
                )}>
                  {baseAsset.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm group-hover:text-primary transition-colors">{symbol}</p>
                <p className="text-xs text-muted-foreground">{name}</p>
              </div>
            </div>
            
            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
              <Star className="h-4 w-4" />
            </Button>
          </div>

          {/* Price */}
          <div className="mb-2">
            <p className="text-lg font-bold tabular-nums">${price.toLocaleString()}</p>
            <div className="flex items-center gap-1.5">
              {isPositive ? (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-red-500" />
              )}
              <span className={cn(
                "text-sm font-medium tabular-nums",
                isPositive ? "text-emerald-500" : "text-red-500"
              )}>
                {isPositive ? '+' : ''}{changePercent24h.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            <span>Vol: ${formatCompactNumber(volume24h)}</span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 capitalize">
              {category}
            </Badge>
          </div>

          {/* Mini chart placeholder */}
          <div className="mt-3 h-8 flex items-end gap-0.5">
            {Array.from({ length: 12 }).map((_, i) => {
              const height = 20 + Math.random() * 80;
              const isLast = i === 11;
              return (
                <div
                  key={i}
                  className={cn(
                    "flex-1 rounded-sm",
                    isLast 
                      ? (isPositive ? "bg-emerald-500" : "bg-red-500")
                      : (isPositive ? "bg-emerald-500/30" : "bg-red-500/30")
                  )}
                  style={{ height: `${height}%` }}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// ============================================================
// ASSET ROW COMPONENT (List View)
// ============================================================

interface AssetRowProps {
  symbol: string;
  name: string;
  baseAsset: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  marketCap?: number;
  category: MarketCategory;
  index: number;
}

function AssetRow({ symbol, name, baseAsset, price, change24h, changePercent24h, volume24h, marketCap, category, index }: AssetRowProps) {
  const isPositive = changePercent24h >= 0;
  const { setSelectedSymbol } = useMarketStore();

  return (
    <Link href={`/trading?symbol=${symbol}`}>
      <div className={cn(
        "flex items-center gap-4 px-4 py-3 hover:bg-muted/50 transition-colors border-b last:border-b-0",
        index % 2 === 0 && "bg-muted/20"
      )}>
        {/* Rank */}
        <span className="w-8 text-sm text-muted-foreground tabular-nums">{index + 1}</span>

        {/* Symbol & Name */}
        <div className="flex items-center gap-3 min-w-[180px]">
          <Avatar className="h-8 w-8">
            <AvatarFallback className={cn(
              "text-[10px] font-bold text-white",
              category === 'crypto' ? "bg-gradient-to-br from-violet-500 to-purple-600" :
              category === 'forex' ? "bg-gradient-to-br from-emerald-500 to-green-600" :
              "bg-gradient-to-br from-blue-500 to-cyan-600"
            )}>
              {baseAsset.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm hover:text-primary transition-colors">{symbol}</p>
            <p className="text-xs text-muted-foreground">{name}</p>
          </div>
        </div>

        {/* Price */}
        <div className="min-w-[120px]">
          <p className="font-mono font-medium text-sm tabular-nums">${price.toLocaleString()}</p>
        </div>

        {/* Change */}
        <div className="min-w-[90px]">
          <div className={cn(
            "flex items-center gap-1 text-sm font-medium",
            isPositive ? "text-emerald-500" : "text-red-500"
          )}>
            {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            <span className="tabular-nums">{isPositive ? '+' : ''}{changePercent24h.toFixed(2)}%</span>
          </div>
          <p className={cn(
            "text-xs font-mono tabular-nums",
            isPositive ? "text-emerald-500/70" : "text-red-500/70"
          )}>
            {isPositive ? '+' : ''}${change24h.toFixed(2)}
          </p>
        </div>

        {/* Volume */}
        <div className="min-w-[110px]">
          <p className="font-mono text-sm tabular-nums">${formatCompactNumber(volume24h)}</p>
        </div>

        {/* Market Cap (if crypto) */}
        {marketCap && (
          <div className="min-w-[110px] hidden lg:block">
            <p className="font-mono text-sm tabular-nums">${formatCompactNumber(marketCap)}</p>
          </div>
        )}

        {/* Category Badge */}
        <div className="min-w-[80px]">
          <Badge variant="secondary" className="text-[10px] capitalize">
            {category}
          </Badge>
        </div>

        {/* Trade Button */}
        <Button variant="outline" size="sm" className="ml-auto">
          Trade
        </Button>
      </div>
    </Link>
  );
}

// ============================================================
// MARKET STATS SUMMARY
// ============================================================

function MarketStatsSummary({ assets }: { assets: typeof SAMPLE_CRYPTO_ASSETS }) {
  const totalMarketCap = assets.reduce((sum, a) => sum + (a.marketStats.marketCap || 0), 0);
  const avgChange = assets.reduce((sum, a) => sum + a.priceData.changePercent24h, 0) / assets.length;
  const gainers = assets.filter(a => a.priceData.changePercent24h > 0).length;
  const losers = assets.filter(a => a.priceData.changePercent24h <= 0).length;
  const totalVolume = assets.reduce((sum, a) => sum + a.priceData.volume24h, 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Total Market Cap</p>
          <p className="text-lg font-bold mt-1">${formatCompactNumber(totalMarketCap)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">24h Volume</p>
          <p className="text-lg font-bold mt-1">${formatCompactNumber(totalVolume)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Avg Change</p>
          <p className={cn("text-lg font-bold mt-1", avgChange >= 0 ? "text-emerald-500" : "text-red-500")}>
            {avgChange >= 0 ? '+' : ''}{avgChange.toFixed(2)}%
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Gainers/Losers</p>
          <p className="text-lg font-bold mt-1">
            <span className="text-emerald-500">{gainers}</span>
            <span className="text-muted-foreground mx-1">/</span>
            <span className="text-red-500">{losers}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================
// MAIN MARKETS PAGE
// ============================================================

export default function MarketsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MarketCategory | 'all'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortBy, setSortBy] = useState<SortOption>('volume');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Combine all assets
  const allAssets = useMemo(() => [...SAMPLE_CRYPTO_ASSETS, ...SAMPLE_FOREX_PAIRS], []);

  // Filter and sort assets
  const filteredAssets = useMemo(() => {
    let filtered = allAssets;

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(a => a.category === selectedCategory);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a =>
        a.symbol.toLowerCase().includes(query) ||
        a.name.toLowerCase().includes(query) ||
        a.baseAsset.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
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
          comparison = a.priceData.currentPrice - b.priceData.currentPrice;
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [allAssets, selectedCategory, searchQuery, sortBy, sortOrder]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Markets</h1>
          <p className="text-muted-foreground mt-1">
            Explore and trade {allAssets.length}+ assets across multiple markets
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/trading">
              <Activity className="mr-2 h-4 w-4" />
              Quick Trade
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Market Stats Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <MarketStatsSummary assets={SAMPLE_CRYPTO_ASSETS} />
      </motion.div>

      {/* Filters & Controls */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search assets... (BTC, ETH, EUR/USD)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-muted/50"
                />
              </div>

              {/* Category Filter */}
              <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as MarketCategory | 'all')}>
                <TabsList className="flex-wrap h-auto">
                  <TabsTrigger value="all">All</TabsTrigger>
                  {MARKET_CATEGORIES.map(cat => (
                    <TabsTrigger key={cat.id} value={cat.id}>{cat.label}</TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              {/* Sort & View Options */}
              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="volume">Volume</SelectItem>
                    <SelectItem value="change">Change %</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                >
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform",
                    sortOrder === 'asc' && "rotate-180"
                  )} />
                </Button>

                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="icon"
                    className="rounded-r-none h-9 w-9"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="icon"
                    className="rounded-l-none h-9 w-9"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Results count */}
            <div className="mt-3 text-sm text-muted-foreground">
              Showing {filteredAssets.length} of {allAssets.length} assets
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Assets Display */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        {viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAssets.map(asset => (
              <AssetCard
                key={asset.id}
                symbol={asset.symbol}
                name={asset.name}
                baseAsset={asset.baseAsset}
                price={asset.priceData.currentPrice}
                change24h={asset.priceData.change24h}
                changePercent24h={asset.priceData.changePercent24h}
                volume24h={asset.priceData.volume24h}
                category={asset.category}
              />
            ))}
          </div>
        ) : (
          /* List View */
          <Card>
            <div className="overflow-x-auto">
              {/* Table Header */}
              <div className="flex items-center gap-4 px-4 py-3 border-b bg-muted/30 text-xs font-medium text-muted-foreground sticky top-0">
                <span className="w-8">#</span>
                <span className="min-w-[180px]">Asset</span>
                <span className="min-w-[120px] cursor-pointer hover:text-foreground" onClick={() => setSortBy('price')}>
                  Price {sortBy === 'price' && (sortOrder === 'desc' ? '↓' : '↑')}
                </span>
                <span className="min-w-[90px] cursor-pointer hover:text-foreground" onClick={() => setSortBy('change')}>
                  24h Change {sortBy === 'change' && (sortOrder === 'desc' ? '↓' : '↑')}
                </span>
                <span className="min-w-[110px] cursor-pointer hover:text-foreground" onClick={() => setSortBy('volume')}>
                  Volume {sortBy === 'volume' && (sortOrder === 'desc' ? '↓' : '↑')}
                </span>
                <span className="min-w-[110px] hidden lg:block">Market Cap</span>
                <span className="min-w-[80px]">Category</span>
                <span className="w-[60px]"></span>
              </div>

              {/* Table Body */}
              {filteredAssets.map((asset, index) => (
                <AssetRow
                  key={asset.id}
                  symbol={asset.symbol}
                  name={asset.name}
                  baseAsset={asset.baseAsset}
                  price={asset.priceData.currentPrice}
                  change24h={asset.priceData.change24h}
                  changePercent24h={asset.priceData.changePercent24h}
                  volume24h={asset.priceData.volume24h}
                  marketCap={asset.marketStats.marketCap}
                  category={asset.category}
                  index={index}
                />
              ))}
            </div>
          </Card>
        )}

        {/* Empty State */}
        {filteredAssets.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="mx-auto h-12 w-12 text-muted-foreground/30" />
              <p className="mt-4 text-lg font-medium">No assets found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your search or filters
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
