/**
 * NewsletterForm.tsx
 * Disabled placeholder: newsletter feature fully removed.
 * This no-op component ensures any remaining imports won't render UI or cause build errors.
 */

import React from 'react'

/**
 * NewsletterFormProps
 * Retained for compatibility with any existing imports.
 */
export interface NewsletterFormProps {
  placeholder?: string
  cta?: string
}

/**
 * NewsletterForm
 * Returns null to render nothing; newsletter functionality is removed.
 */
export default function NewsletterForm(_: NewsletterFormProps) {
  return null
}
