'use client'

import { useEffect } from 'react'

export default function PwaRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    const RECOVERY_KEY = 'cadott-golf-sw-recovery-v1'
    const RELOAD_KEY = 'cadott-golf-sw-recovery-reload-v1'

    const registerWithRecovery = async () => {
      let recovered = false

      try {
        if (!sessionStorage.getItem(RECOVERY_KEY)) {
          const registrations = await navigator.serviceWorker.getRegistrations()
          const appRegistrations = registrations.filter((registration) =>
            [registration.active, registration.waiting, registration.installing]
              .filter(Boolean)
              .some((worker) => worker?.scriptURL.endsWith('/sw.js'))
          )

          if (appRegistrations.length > 0) {
            await Promise.all(appRegistrations.map((registration) => registration.unregister()))

            if ('caches' in window) {
              const keys = await caches.keys()
              await Promise.all(
                keys
                  .filter((key) => key.startsWith('cadott-golf-'))
                  .map((key) => caches.delete(key))
              )
            }

            recovered = true
          }

          sessionStorage.setItem(RECOVERY_KEY, '1')
        }
      } catch {
        // Ignore recovery failures and continue with a normal registration attempt.
      }

      try {
        await navigator.serviceWorker.register('/sw.js')

        // One reload ensures the fresh worker can take control of the current tab.
        if (recovered && !sessionStorage.getItem(RELOAD_KEY)) {
          sessionStorage.setItem(RELOAD_KEY, '1')
          window.location.reload()
        }
      } catch {
        // Ignore registration failures to keep the page usable without SW features.
      }
    }

    void registerWithRecovery()
  }, [])

  return null
}
