'use client'
import { useEffect } from 'react'

export default function PwaRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(() => {
        console.log('PWA Ready: Arihant Anchal')
      }).catch(console.error)
    }
  }, [])
  return null
}
