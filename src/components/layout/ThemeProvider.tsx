/**
 * Tray'd Theme Provider Component
 * @description Manages dark/light/system theme switching with persistence
 */

'use client';

import React, { createContext, useContext, useCallback, useEffect, useSyncExternalStore } from 'react';
import { useUIStore } from '@/store';

// ============================================================
// TYPES
// ============================================================

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

// ============================================================
// CONTEXT
// ============================================================

const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  resolvedTheme: 'dark',
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

// ============================================================
// THEME SUBSCRIPTION FOR USE_SYNC_EXTERNAL_STORE
// ============================================================

let themeSnapshot = typeof window !== 'undefined' 
  ? (document.documentElement.classList.contains('dark') ? 'dark' : 'light')
  : 'dark';

const themeListeners = new Set<() => void>();

function getThemeSnapshot(): string {
  return themeSnapshot;
}

function getServerSnapshot(): string {
  return 'dark'; // Default to dark for SSR
}

function subscribeToTheme(callback: () => void): () => void {
  themeListeners.add(callback);
  return () => {
    themeListeners.delete(callback);
  };
}

function emitThemeChange(newTheme: string) {
  themeSnapshot = newTheme;
  themeListeners.forEach(listener => listener());
}

/** Apply theme to document and notify subscribers */
function applyThemeToDocument(newTheme: Theme): 'light' | 'dark' {
  let resolved: 'light' | 'dark';
  
  if (newTheme === 'system') {
    resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } else {
    resolved = newTheme;
  }

  // Update document classes
  const root = document.documentElement;
  
  if (resolved === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  }

  emitThemeChange(resolved);
  return resolved;
}

// ============================================================
// PROVIDER COMPONENT
// ============================================================

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

export function ThemeProvider({ children, defaultTheme = 'system' }: ThemeProviderProps) {
  const { theme: storedTheme, setTheme: setStoredTheme } = useUIStore();
  
  // Use sync external store for resolved theme
  const resolvedTheme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerSnapshot
  ) as 'light' | 'dark';

  // Current effective theme (from store or default)
  // We need to track if we're mounted to avoid hydration mismatch
  const [mounted, setMounted] = React.useState(false);

  /** Set theme and persist */
  const setTheme = useCallback((newTheme: Theme) => {
    setStoredTheme(newTheme);
    applyThemeToDocument(newTheme);
  }, [setStoredTheme]);

  // Initialize on mount - only runs once
  useEffect(() => {
    // Mark as mounted (necessary for SSR hydration mismatch prevention)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    
    // Apply initial theme from store
    applyThemeToDocument(storedTheme);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      // Re-apply system theme when system preference changes
      const currentStoreTheme = useUIStore.getState().theme;
      if (currentStoreTheme === 'system') {
        applyThemeToDocument('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Handle stored theme changes after initial mount
  useEffect(() => {
    if (mounted) {
      applyThemeToDocument(storedTheme);
    }
  }, [storedTheme, mounted]);

  // Prevent flash of wrong theme during SSR/hydration
  if (!mounted) {
    return (
      <div style={{ visibility: 'hidden' }} aria-hidden="true">
        {children}
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={{ 
      theme: mounted ? storedTheme : defaultTheme, 
      resolvedTheme, 
      setTheme 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ============================================================
// THEME TOGGLE BUTTON
// ============================================================

import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          {/* Sun icon for light mode */}
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          {/* Moon icon for dark mode */}
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => setTheme('light')}
          className={theme === 'light' ? 'bg-accent' : ''}
        >
          <Sun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('dark')}
          className={theme === 'dark' ? 'bg-accent' : ''}
        >
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('system')}
          className={theme === 'system' ? 'bg-accent' : ''}
        >
          <Monitor className="mr-2 h-4 w-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
