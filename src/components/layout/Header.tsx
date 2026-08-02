/**
 * Tray'd Header Component
 * @description Top navigation header with search, notifications, user menu
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  Wallet,
  ChevronDown,
  Menu,
  X,
  TrendingUp,
  Shield,
  HelpCircle,
  ExternalLink,
  Moon,
  Sun,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore, useAuthStore, useNotificationStore, useMarketStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from './ThemeProvider';
import { getInitials, formatCurrency, maskAddress } from '@/lib/utils';
import { SAMPLE_CRYPTO_ASSETS } from '@/constants';

// ============================================================
// HEADER COMPONENT
// ============================================================

export function Header() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Compute search results (memoized)
  const searchResults = useMemo(() => {
    if (searchQuery.trim().length === 0) return [];
    
    const query = searchQuery.toLowerCase();
    return SAMPLE_CRYPTO_ASSETS.filter(
      (asset) =>
        asset.symbol.toLowerCase().includes(query) ||
        asset.name.toLowerCase().includes(query) ||
        asset.baseAsset.toLowerCase().includes(query)
    ).slice(0, 8);
  }, [searchQuery]);
  
  const {
    sidebar,
    toggleSidebar,
    setSidebarMobile,
    addToast,
  } = useUIStore();
  
  const { user, isAuthenticated, logout } = useAuthStore();
  const { unreadCount, notifications } = useNotificationStore();
  const { selectedSymbol, setSelectedSymbol } = useMarketStore();

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setSidebarMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [setSidebarMobile]);

  // Derive search open state from search results
  const isSearchOpenDerived = searchQuery.trim().length > 0 && searchResults.length > 0;

  /** Handle search result click */
  const handleSelectAsset = (symbol: string) => {
    setSelectedSymbol(symbol);
    setSearchQuery('');
    setIsSearchOpen(false);
    
    if (!router.pathname.includes('/trading')) {
      router.push('/trading');
    }
  };

  /** Handle notification click */
  const handleNotificationClick = () => {
    // Navigate to notifications or open panel
    addToast({
      type: 'info',
      title: 'Notifications',
      message: `${unreadCount} unread notifications`,
    });
  };

  /** Handle logout */
  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={toggleSidebar}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      {/* Search Bar */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search assets... (BTC, ETH, etc.)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery && setIsSearchOpen(true)}
          onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
          className="pl-10 pr-4 bg-muted/50 border-transparent focus:border-primary focus:bg-background transition-all"
        />
        
        {/* Search Results Dropdown */}
        <AnimatePresence>
          {isSearchOpen && searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 right-0 top-full mt-2 rounded-lg border bg-popover shadow-lg overflow-hidden z-50"
            >
              {searchResults.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => handleSelectAsset(asset.symbol)}
                  className="flex w-full items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <span className="text-xs font-bold">{asset.baseAsset.slice(0, 2)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{asset.symbol}</p>
                    <p className="text-xs text-muted-foreground">{asset.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">
                      ${asset.priceData.currentPrice.toLocaleString()}
                    </p>
                    <p
                      className={cn(
                        "text-xs font-medium",
                        asset.priceData.changePercent24h >= 0
                          ? "text-emerald-500"
                          : "text-red-500"
                      )}
                    >
                      {asset.priceData.changePercent24h >= 0 ? '+' : ''}
                      {asset.priceData.changePercent24h.toFixed(2)}%
                    </p>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Current Symbol Display */}
        {selectedSymbol && (
          <Link
            href="/trading"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted hover:bg-accent transition-colors"
          >
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-medium">{selectedSymbol}</span>
          </Link>
        )}

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-[10px]">
                  {unreadCount} new
                </Badge>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {notifications.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                <Bell className="mx-auto mb-2 h-8 w-8 opacity-30" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <>
                {notifications.slice(0, 5).map((notification) => (
                  <DropdownMenuItem key={notification.id} className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                    <div className="flex w-full items-center justify-between">
                      <span className="font-medium text-sm">{notification.title}</span>
                      {!notification.read && (
                        <span className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground line-clamp-1">
                      {notification.message}
                    </span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-center text-primary cursor-pointer">
                  View all notifications
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        {isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatarUrl} alt={user?.displayName || ''} />
                  <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-xs">
                    {getInitials(user?.displayName || user?.email || 'U')}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.displayName || 'User'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                  <Badge variant="secondary" className="w-fit mt-1 text-[10px] capitalize">
                    {user?.role || 'User'}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/profile" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/wallet" className="flex items-center">
                  <Wallet className="mr-2 h-4 w-4" />
                  Wallet
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/settings" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/support" className="flex items-center">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Support
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.push('/login')}>
              Sign In
            </Button>
            <Button size="sm" onClick={() => router.push('/register')}>
              Get Started
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
