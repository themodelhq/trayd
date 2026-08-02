'use client';

/**
 * Tray'd - Custom Not Found Page
 * @description 404 error page for invalid routes
 */

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 px-4">
        {/* 404 Number */}
        <div className="space-y-2">
          <h1 className="text-8xl font-bold text-primary">404</h1>
          <p className="text-xl text-muted-foreground font-medium">
            Page Not Found
          </p>
        </div>

        {/* Description */}
        <p className="text-muted-foreground max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button variant="outline" size="lg" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>

        {/* Optional: Trading-related message */}
        <p className="text-sm text-muted-foreground pt-8 border-t">
          Looking to trade?{' '}
          <Link href="/trading" className="text-primary hover:underline">
            Visit our trading platform
          </Link>
        </p>
      </div>
    </div>
  );
}
