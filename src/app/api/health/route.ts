/**
 * Tray'd Health Check Endpoint
 * @description Health check for deployment platforms and monitoring
 */

import { NextResponse } from 'next/server';

export async function GET() {
  const startTime = Date.now();
  
  // Basic health info
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    responseTime: 0,
    services: {
      database: 'not_configured',
      redis: 'not_configured',
    },
  };

  // Check database connectivity (if configured)
  try {
    if (process.env.DATABASE_URL) {
      // Simple connectivity check - in production, use proper DB ping
      if (process.env.DATABASE_URL.includes('postgresql') || 
          process.env.DATABASE_URL.includes('mysql')) {
        health.services.database = 'configured';
      } else {
        health.services.database = 'sqlite_ok';
      }
    }
  } catch (error) {
    health.services.database = 'error';
    health.status = 'degraded';
  }

  // Calculate response time
  health.responseTime = Date.now() - startTime;

  // Return appropriate status code
  const statusCode = health.status === 'healthy' ? 200 : 503;
  
  return NextResponse.json(health, { 
    status: statusCode,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Health-Check': 'trayed-api',
    }
  });
}

export async function HEAD() {
  return new Response(null, { status: 200 });
}
