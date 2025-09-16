/**
 * env.ts
 * Simple runtime environment helpers for client code.
 * Avoids using process.env (no Node types) and infers "public" vs "local" from hostname.
 */

/**
 * IS_PUBLIC
 * True when running on a non-local hostname (e.g., production, staging).
 * Local development typically runs on localhost or 127.0.0.1.
 */
export const IS_PUBLIC: boolean =
  typeof window !== 'undefined'
    ? !/^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname)
    : true

/**
 * IS_LOCAL
 * Convenience inverse of IS_PUBLIC.
 */
export const IS_LOCAL: boolean = !IS_PUBLIC
