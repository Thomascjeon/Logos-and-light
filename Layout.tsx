/**
 * Layout.tsx
 * Shared layout wrapper with Navbar and Footer.
 */

import React from 'react'
import Navbar from './Navbar'
import Footer from './Footer'

/**
 * LayoutProps
 * Props for the Layout component, receiving page children.
 */
export interface LayoutProps {
  children: React.ReactNode
}

/**
 * Layout
 * Provides page chrome: navbar, content container, and footer.
 */
export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
