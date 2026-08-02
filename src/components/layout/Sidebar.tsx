/**
 * Tray'd Sidebar Navigation Component
 * @description Main sidebar with navigation items, collapsible, responsive
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  LineChart,
  BarChart3,
  Wallet,
  PieChart,
  Users,
  GraduationCap,
  Gift,
  Settings,
  HelpCircle,
  Bell,
  ChevronLeft,
  ChevronRight,
  X,
  TrendingUp,
  Zap,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore, useAuthStore, useNotificationStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';

// ============================================================
// NAVIGATION CONFIGURATION
// ============================================================

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
  badge?: string | null;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

const mainNavItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { id: 'trading', label: 'Trading', icon: LineChart, href: '/trading' },
  { id: 'markets', label: 'Markets', icon: BarChart3, href: '/markets' },
  { id: 'wallet', label: 'Wallet', icon: Wallet, href: '/wallet' },
  { id: 'portfolio', label: 'Portfolio', icon: PieChart, href: '/portfolio' },
  { 
    id: 'copy-trading', 
    label: 'Copy Trading', 
    icon: Users, 
    href: '/copy-trading',
    badge: 'New',
    badgeVariant: 'default',
  },
  { id: 'academy', label: 'Academy', icon: GraduationCap, href: '/academy' },
  { id: 'referral', label: 'Referral', icon: Gift, href: '/referral' },
];

const secondaryNavItems: NavItem[] = [
  { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
  { id: 'support', label: 'Support', icon: HelpCircle, href: '/support' },
];

// ============================================================
// SIDEBAR COMPONENT
// ============================================================

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const {
    sidebar,
    toggleSidebar,
    setSidebarOpen,
    setSidebarCollapsed,
    setSidebarMobile,
  } = useUIStore();
  
  const { user, isAuthenticated } = useAuthStore();
  const { unreadCount } = useNotificationStore();

  const isCollapsed = sidebar.isCollapsed;
  const isMobile = sidebar.isMobile;
  const isOpen = sidebar.isOpen;

  /** Check if nav item is active */
  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  /** Handle collapse toggle */
  const handleToggleCollapse = () => {
    setSidebarCollapsed(!isCollapsed);
  };

  /** Handle mobile close */
  const handleMobileClose = () => {
    setSidebarOpen(false);
  };

  // Mobile overlay
  if (isMobile && isOpen) {
    return (
      <>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={handleMobileClose}
        />
        
        {/* Mobile Sidebar */}
        <motion.aside
          initial={{ x: -280 }}
          animate={{ x: 0 }}
          exit={{ x: -280 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={cn(
            "fixed left-0 top-0 z-50 h-full w-[280px] bg-card border-r shadow-xl",
            className
          )}
        >
          <SidebarContent
            pathname={pathname}
            isActive={isActive}
            isAuthenticated={isAuthenticated}
            user={user}
            unreadCount={unreadCount}
            isCollapsed={false}
            isMobile={true}
            onClose={handleMobileClose}
          />
        </motion.aside>
      </>
    );
  }

  // Desktop Sidebar
  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 72 : 260 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className={cn(
        "relative flex h-full flex-col border-r bg-card overflow-hidden",
        className
      )}
    >
      <TooltipProvider delayDuration={0}>
        <SidebarContent
          pathname={pathname}
          isActive={isActive}
          isAuthenticated={isAuthenticated}
          user={user}
          unreadCount={unreadCount}
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />
      </TooltipProvider>
    </motion.aside>
  );
}

// ============================================================
// SIDEBAR CONTENT COMPONENT
// ============================================================

interface SidebarContentProps {
  pathname: string;
  isActive: (href: string) => boolean;
  isAuthenticated: boolean;
  user: any;
  unreadCount: number;
  isCollapsed: boolean;
  isMobile?: boolean;
  onClose?: () => void;
  onToggleCollapse?: () => void;
}

function SidebarContent({
  pathname,
  isActive,
  isAuthenticated,
  user,
  unreadCount,
  isCollapsed,
  isMobile = false,
  onClose,
  onToggleCollapse,
}: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b">
        {!isCollapsed && (
          <Link href="/" className="flex items-center gap-2" onClick={onClose}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-violet-500 to-purple-600 bg-clip-text text-transparent">
              Tray&apos;d
            </span>
          </Link>
        )}
        
        {isCollapsed && !isMobile && (
          <Link href="/" className="mx-auto">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
              <Zap className="h-5 w-5 text-white" />
            </div>
          </Link>
        )}

        {/* Close button for mobile */}
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        )}

        {/* Collapse button for desktop */}
        {!isMobile && !isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {/* Main Navigation */}
        <div className="space-y-1">
          {!isCollapsed && (
            <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Trading
            </p>
          )}
          
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            const linkContent = (
              <Link
                key={item.id}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  isCollapsed && !isMobile && "justify-center px-2"
                )}
              >
                {/* Active indicator */}
                {active && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary"
                    transition={{ type: 'spring', damping: 20 }}
                  />
                )}

                <Icon className={cn(
                  "h-5 w-5 shrink-0",
                  active ? "text-primary" : "text-muted-foreground group-hover:text-accent-foreground"
                )} />

                {!isCollapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <Badge variant={item.badgeVariant || 'secondary'} className="text-[10px] px-1.5 py-0">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}

                {/* Collapsed tooltip */}
                {isCollapsed && !isMobile && (
                  <div className="absolute left-full ml-2 hidden group-hover:block">
                    <TooltipContent side="right" className="font-normal">
                      {item.label}
                      {item.badge && (
                        <Badge variant={item.badgeVariant || 'secondary'} className="ml-2 text-[10px]">
                          {item.badge}
                        </Badge>
                      )}
                    </TooltipContent>
                  </div>
                )}
              </Link>
            );

            return isCollapsed && !isMobile ? (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
              </Tooltip>
            ) : (
              linkContent
            );
          })}
        </div>

        {/* Secondary Navigation */}
        <div className="mt-6 space-y-1">
          {!isCollapsed && (
            <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Account
            </p>
          )}

          {secondaryNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            // Special handling for notifications
            const showNotificationBadge = item.id === 'support' && unreadCount > 0;

            const linkContent = (
              <Link
                key={item.id}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  isCollapsed && !isMobile && "justify-center px-2"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="activeIndicatorSecondary"
                    className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary"
                    transition={{ type: 'spring', damping: 20 }}
                  />
                )}

                <div className="relative">
                  <Icon className={cn(
                    "h-5 w-5 shrink-0",
                    active ? "text-primary" : "text-muted-foreground group-hover:text-accent-foreground"
                  )} />
                  
                  {showNotificationBadge && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </div>

                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );

            return isCollapsed && !isMobile ? (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
              </Tooltip>
            ) : (
              linkContent
            );
          })}
        </div>
      </nav>

      {/* User Section */}
      <div className="border-t p-3">
        {isAuthenticated ? (
          <Link
            href="/settings"
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent",
              isCollapsed && !isMobile && "justify-center"
            )}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatarUrl} alt={user?.displayName || 'User'} />
              <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-xs">
                {getInitials(user?.displayName || user?.email || 'U')}
              </AvatarFallback>
            </Avatar>
            
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">{user?.displayName || 'User'}</p>
                <p className="truncate text-xs text-muted-foreground capitalize">{user?.role || 'Trader'}</p>
              </div>
            )}
          </Link>
        ) : (
          <Link href="/login" onClick={onClose}>
            <Button className={cn("w-full", isCollapsed && !isMobile && "w-auto p-2")}>
              {!isCollapsed && 'Sign In'}
              {isCollapsed && <Shield className="h-4 w-4" />}
            </Button>
          </Link>
        )}

        {/* Expand/Collapse Button (Desktop only) */}
        {!isMobile && isCollapsed && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleCollapse}
                className="mt-2 mx-auto w-full"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Expand</TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
