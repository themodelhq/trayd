/**
 * Tray'd App Shell Component
 * @description Main application shell with sidebar, header, and content area
 */

'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store';

// ============================================================
// APP SHELL COMPONENT
// ============================================================

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { sidebar } = useUIStore();
  const isCollapsed = sidebar.isCollapsed;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar - Hidden on mobile unless open */}
      <div className={cn(
        "hidden lg:flex lg:fixed lg:inset-y-0 lg:z-30",
        isCollapsed ? "lg:w-[72px]" : "lg:w-[260px]"
      )}>
        <Sidebar className="h-full" />
      </div>

      {/* Main Content Area */}
      <div
        className={cn(
          "flex flex-1 flex-col h-full transition-all duration-200",
          // Add left margin for desktop sidebar
          "lg:pl-[260px]",
          isCollapsed && "lg:pl-[72px]"
        )}
      >
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppShell;
