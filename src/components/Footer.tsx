/**
 * Footer.tsx
 * Site footer with simple navigation and attribution. Uses siteConfig for contact email.
 */

import { Link } from 'react-router'
import { Separator } from '../components/ui/separator'
import { siteConfig, getContactMailto } from '../config/site'

/**
 * Footer
 * Minimal, centered footer with supporting links and contact email.
 */
export default function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{siteConfig.name}</p>
            <p className="mt-2">Where philosophy meets Christian thought.</p>
          </div>

          <div className="text-sm">
            <p className="font-medium">Explore</p>
            <div className="mt-2 flex flex-col gap-2">
              <Link to="/articles" className="text-muted-foreground hover:text-foreground">Articles</Link>
              <Link to="/topics" className="text-muted-foreground hover:text-foreground">Topics</Link>
              <Link to="/about" className="text-muted-foreground hover:text-foreground">About</Link>
            </div>
          </div>

          <div className="text-sm">
            <p className="font-medium">Connect</p>
            <div className="mt-2 flex flex-col gap-2">
              {/* Mailto uses centralized contact email */}
              <a
                href={getContactMailto(`Hello from ${siteConfig.name}`)}
                className="text-muted-foreground hover:text-foreground"
              >
                {siteConfig.contactEmail}
              </a>
              <a
                href="https://example.com"
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                External
              </a>
            </div>
          </div>
        </div>

        <Separator className="my-8" />
        <div className="text-xs text-muted-foreground">© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</div>
      </div>
    </footer>
  )
}
