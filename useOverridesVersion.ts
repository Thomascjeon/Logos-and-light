/**
 * useOverridesVersion.ts
 * Small hook to re-render components when image overrides, remote mappings, or content overrides change.
 * Listens to local override events, remote mapping change events, and content override events.
 */

import { useEffect, useState } from 'react'
import { OV_EVENT } from './imageOverrides'
import { REMOTE_EVENT } from './remoteImages'
import { CONTENT_EVENT } from './contentOverrides'

/**
 * useOverridesVersion
 * Subscribes to override, content, and remote mapping change events and bumps a counter to trigger re-render.
 * Returns the current version number (not usually needed by callers).
 */
export default function useOverridesVersion(): number {
  const [ver, setVer] = useState(0)

  useEffect(() => {
    /** handle change events by bumping state */
    const onChange = () => setVer(v => v + 1)

    window.addEventListener(OV_EVENT, onChange as EventListener)
    window.addEventListener(REMOTE_EVENT, onChange as EventListener)
    window.addEventListener(CONTENT_EVENT, onChange as EventListener)

    return () => {
      window.removeEventListener(OV_EVENT, onChange as EventListener)
      window.removeEventListener(REMOTE_EVENT, onChange as EventListener)
      window.removeEventListener(CONTENT_EVENT, onChange as EventListener)
    }
  }, [])

  return ver
}
