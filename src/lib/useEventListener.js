import { useEffect } from 'react'

export const documentRef = typeof document !== 'undefined' ? document : null

export default function useEventListener({ type, listener, target, targetRef }) {
  useEffect(() => {
    const el = targetRef?.current ?? target ?? documentRef
    if (!el || !listener) return

    el.addEventListener(type, listener)
    return () => el.removeEventListener(type, listener)
  }, [type, listener, target, targetRef])
}
