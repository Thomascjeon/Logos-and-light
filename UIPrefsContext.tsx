/**
 * UIPrefsContext.tsx
 * App-wide UI preferences with localStorage persistence.
 * Exposes toggles for hover micro-interactions and image visibility.
 */

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

/**
 * UIPrefs
 * Preferences that affect subtle UI behaviors and imagery.
 */
export interface UIPrefs {
  /** Enable/disable hover micro-interactions on decorative elements */
  hoverEffects: 'on' | 'off'
  /** Show or hide article images across the app */
  images: 'on' | 'off'
}

/**
 * Default preferences
 */
const DEFAULT_PREFS: UIPrefs = {
  hoverEffects: 'on',
  images: 'on',
}

/** Storage key for preferences */
const UI_PREFS_KEY = 'ui-prefs:v1'

/**
 * readPrefs
 * Safely read prefs from localStorage or return defaults.
 */
function readPrefs(): UIPrefs {
  try {
    const raw = localStorage.getItem(UI_PREFS_KEY)
    if (!raw) return DEFAULT_PREFS
    const parsed = JSON.parse(raw)
    return {
      hoverEffects: parsed.hoverEffects === 'off' ? 'off' : 'on',
      images: parsed.images === 'off' ? 'off' : 'on',
    }
  } catch {
    return DEFAULT_PREFS
  }
}

/**
 * writePrefs
 * Persist prefs to localStorage (best-effort).
 */
function writePrefs(prefs: UIPrefs) {
  try {
    localStorage.setItem(UI_PREFS_KEY, JSON.stringify(prefs))
  } catch {
    // ignore quota
  }
}

/**
 * UIPrefsContext shape
 */
interface UIPrefsContextValue {
  prefs: UIPrefs
  setPrefs: React.Dispatch<React.SetStateAction<UIPrefs>>
}

const UIPrefsContext = createContext<UIPrefsContextValue | null>(null)

/**
 * UIPrefsProvider
 * Wrap the app to provide UI preferences.
 */
export function UIPrefsProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<UIPrefs>(DEFAULT_PREFS)

  // Initialize from storage once
  useEffect(() => {
    setPrefs(readPrefs())
  }, [])

  // Persist on change
  useEffect(() => {
    writePrefs(prefs)
  }, [prefs])

  const value = useMemo(() => ({ prefs, setPrefs }), [prefs])

  return <UIPrefsContext.Provider value={value}>{children}</UIPrefsContext.Provider>
}

/**
 * useUIPrefs
 * Access preferences and setter.
 */
export function useUIPrefs(): UIPrefsContextValue {
  const ctx = useContext(UIPrefsContext)
  if (!ctx) {
    // In practice, App wraps in the provider; fallback to defaults if not.
    const noop = (() => undefined) as unknown as React.Dispatch<React.SetStateAction<UIPrefs>>
    return { prefs: DEFAULT_PREFS, setPrefs: noop }
  }
  return ctx
}
