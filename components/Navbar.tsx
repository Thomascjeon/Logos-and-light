/**
 * Navbar.tsx
 * Top navigation bar with branding, primary links, and theme toggle.
 */

import { useState } from 'react'
import { Link, NavLink } from 'react-router'
import { BookText, Menu, Moon, Sun } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Separator } from '../components/ui/separator'
import { useTheme } from 'next-themes'
import { siteConfig } from '../config/site'

/**
 * NavItem
 * Represents a single navigation item with label and path.
 */
interface NavItem {
  label: string
  to: string
}

/**
 * Navbar
 * Responsive navigation with active link styling and theme toggle.
 * Settings link removed as requested.
 */
export default function Navbar() {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)

  // Settings link removed; no top-level nav items for now.
  const nav: NavItem[] = []

  /** Toggles the current theme between light and dark. */
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/70 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4">
        <div className="h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="size-9 rounded-md bg-gradient-to-tr from-indigo-500 via-sky-500 to-emerald-400 flex items-center justify-center text-white shadow">
              <BookText className="size-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight">{siteConfig.name}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {nav.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    'text-sm transition-colors hover:text-foreground/80',
                    isActive ? 'text-foreground font-medium' : 'text-foreground/60',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
            {nav.length > 0 && <Separator orientation="vertical" className="h-6" />}
            <Button
              variant="outline"
              className="bg-transparent"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
          </nav>

          <div className="md:hidden flex items-center gap-2">
            <Button
              variant="outline"
              className="bg-transparent"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
            {nav.length > 0 && (
              <Button
                variant="outline"
                className="bg-transparent"
                onClick={() => setOpen(v => !v)}
                aria-label="Open menu"
              >
                <Menu className="size-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {open && nav.length > 0 && (
          <div className="md:hidden pb-4 animate-in fade-in-50 slide-in-from-top-1">
            <div className="rounded-md border p-2 bg-card">
              {nav.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      'block rounded px-3 py-2 text-sm transition-colors',
                      isActive ? 'bg-muted text-foreground' : 'text-foreground/70 hover:bg-accent hover:text-foreground',
                    ].join(' ')
                  }
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
