'use client'

/**
 * Tray'd - Global Error Boundary
 * Minimal client component for handling errors across the entire app
 * Uses ONLY native HTML elements to avoid any SSR/prerender issues
 */

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body style={{ 
        margin: 0, 
        padding: '2rem',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#171717'
      }}>
        <div style={{ 
          maxWidth: '400px', 
          width: '100%', 
          textAlign: 'center' 
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 1.5rem',
            borderRadius: '50%',
            backgroundColor: '#fef2f2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem', marginTop: 0 }}>
            Something went wrong
          </h1>
          
          <p style={{ color: '#737373', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            An unexpected error occurred. Please try again.
          </p>
          
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={reset}
              style={{
                padding: '0.625rem 1.25rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#ffffff',
                backgroundColor: '#171717',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={() => { window.location.href = '/'; }}
              style={{
                padding: '0.625rem 1.25rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#171717',
                backgroundColor: 'transparent',
                border: '1px solid #e5e5e5',
                borderRadius: '0.375rem',
                cursor: 'pointer'
              }}
            >
              Go Home
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
