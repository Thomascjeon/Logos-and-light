/**
 * AdminGate.tsx
 * Route-level guard that requires a query key (?key=...) to match the configured admin key.
 * If the key is missing/incorrect, renders an access-restricted screen with a small unlock form.
 */

import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Lock, ArrowLeft, Unlock } from 'lucide-react'
import { adminEditKey } from '../config/remote'

/**
 * AdminGateProps
 * Wrap a protected page with this component to require a key for access.
 */
interface AdminGateProps {
  /** The protected page content. */
  children: React.ReactNode
}

/**
 * useQuery
 * Lightweight helper to parse the current location.search.
 */
function useQuery() {
  const location = useLocation()
  return useMemo(() => new URLSearchParams(location.search.replace(/^\?/, '')), [location.search])
}

/**
 * AdminGate
 * Verifies ?key matches adminEditKey. If not, shows an inline unlock UI.
 */
export default function AdminGate({ children }: AdminGateProps) {
  const query = useQuery()
  const navigate = useNavigate()
  const [entered, setEntered] = useState<string>('')

  // If adminEditKey is empty, do not gate (but we make it non-empty in config to enforce).
  const requiredKey = (adminEditKey || '').trim()
  const providedKey = (query.get('key') || '').trim()
  const granted = !!requiredKey && providedKey === requiredKey

  if (!requiredKey) {
    // No key configured => allow (fallback behavior)
    return <>{children}</>
  }

  if (granted) {
    return <>{children}</>
  }

  // Access denied UI (no Layout wrapper to avoid nesting inside page Layouts)
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Lock className="size-5 text-foreground/80" />
          <h1 className="text-lg font-semibold">Access restricted</h1>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          This page requires an admin key. Enter the key to continue, or go back to the Home page.
        </p>

        <div className="mt-4 grid gap-2">
          <label className="text-xs text-muted-foreground">Admin key</label>
          <Input
            value={entered}
            onChange={(e) => setEntered(e.target.value)}
            placeholder="Enter key and press Unlock"
          />
          <div className="flex gap-2">
            <Button
              className="gap-2"
              onClick={() => {
                const p = new URLSearchParams(window.location.search)
                p.set('key', entered.trim())
                navigate({ search: `?${p.toString()}` }, { replace: true })
              }}
            >
              <Unlock className="size-4" />
              Unlock
            </Button>
            <a href="#/">
              <Button variant="outline" className="bg-transparent gap-2">
                <ArrowLeft className="size-4" />
                Back to Home
              </Button>
            </a>
          </div>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Tip: you can also open this page as <code>?key=YOUR_KEY</code> in the URL.
        </p>
      </div>
    </div>
  )
}
