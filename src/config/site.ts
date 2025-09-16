/**
 * site.ts
 * Central site configuration for branding, contact, base URL, and integrations.
 */

/**
 * SiteConfig
 * Main shape for site-wide settings.
 */
export interface SiteConfig {
  /** Public site name used in the UI */
  name: string
  /** Short tagline or description (optional usage) */
  tagline: string
  /** Public contact email used in footer, About, and any mailto links */
  contactEmail: string
  /** The canonical base URL of the site (used for SEO tags and canonical links) */
  baseUrl: string
  /** Newsletter integration configuration */
  newsletter: NewsletterConfig
}

/**
 * NewsletterConfig
 * Configuration for subscriber collection and (later) sending automation.
 */
export interface NewsletterConfig {
  /** Newsletter provider; 'buttondown' uses safe embed without API keys on client */
  provider: 'buttondown' | 'none'
  /** Provider-specific settings */
  buttondown?: {
    /** Your Buttondown username; required to enable the live subscribe form */
    username: string
    /** Optional: tag new subscribers with a label in Buttondown */
    tag?: string
  }
}

/**
 * siteConfig
 * Edit the fields to change branding, contact, and newsletter integration.
 * Newsletter is disabled by default.
 * baseUrl should be the canonical domain you control (no trailing slash).
 */
export const siteConfig: SiteConfig = {
  name: 'Logos & Light',
  tagline: 'Faith, reason, and daily wisdom',
  contactEmail: 'logosandlight7@gmail.com', // Site contact address used across the UI
  baseUrl: 'https://www.logos-and-light.com',
  newsletter: {
    provider: 'none',
  },
}

/**
 * getTitle
 * Helper to compose document/page titles consistently.
 */
export function getTitle(page?: string): string {
  return page ? `${page} • ${siteConfig.name}` : siteConfig.name
}

/**
 * getContactMailto
 * Builds a mailto href for the configured contact email with optional subject.
 */
export function getContactMailto(subject?: string): string {
  const base = `mailto:${siteConfig.contactEmail}`
  return subject ? `${base}?subject=${encodeURIComponent(subject)}` : base
}
