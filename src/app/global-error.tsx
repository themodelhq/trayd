'use client'

/**
 * Tray'd - Global Error Boundary
 * @description Client component for handling errors across the entire app
 */

import { useEffect, useState } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [showError, setShowError] = useState(false)

  useEffect(() => {
    console.error('Global error:', error)
    setShowError(true)
  }, [error])

  const handleReset = () => {
    reset()
  }

  const handleGoHome = () => {
    window.location.href = '/'
  }

  if (!showError) {
    return null
  }

  return (
    <html lang="en">
      <body style={{ 
        margin: 0, 
        padding: 0,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'hsl(var(--background))',
        fontFamily: 'var(--font-geist-sans), sans-serif'
      }}>
        <div style={{ 
          maxWidth: '28rem', 
          width: '100%', 
          textAlign: 'center', 
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem'
        }}>
          {/* Error Icon */}
          <div style={{
            width: '4rem',
            height: '4rem',
            borderRadius: '50%',
            backgroundColor: 'hsl(var(--destructive) / 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="hsl(var(--destructive))"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          {/* Error Message */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 700,
              color: 'hsl(var(--foreground))',
              margin: 0
            }}>
              Something went wrong!
            </h2>
            <p style={{ 
              color: 'hsl(var(--muted-foreground))',
              margin: 0,
              fontSize: '0.875rem'
            }}>
              We apologize for the inconvenience. An unexpected error occurred.
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '0.75rem', 
            justifyContent: 'center',
            width: '100%'
          }}>
            <button
              type="button"
              onClick={handleReset}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.75rem 1.5rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'hsl(var(--primary-foreground))',
                backgroundColor: 'hsl(var(--primary))',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                transition: 'background-color 0.15s'
              }}
            >
              Try again
            </button>
            <button
              type="button"
              onClick={handleGoHome}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.75rem 1.5rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'hsl(var(--foreground))',
                backgroundColor: 'transparent',
                border: '1px solid hsl(var(--input))',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                transition: 'background-color 0.15s'
              }}
            >
              Go to Home
            </button>
          </div>

          {/* Support Link */}
          <p style={{ 
            fontSize: '0.75rem', 
            color: 'hsl(var(--muted-foreground))',
            margin: 0
          }}>
            Need help?{' '}
            <a
              href="/support"
              style={{ color: 'hsl(var(--primary))', textDecoration: 'underline' }}
            >
              Contact Support
            </a>
          </p>
        </div>
      </body>
    </html>
  )
}
