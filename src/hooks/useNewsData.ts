import { useState, useEffect } from 'react'
import type { WhatsNewFeed } from '../types/news'

const DATA_URL = `${import.meta.env.BASE_URL}data/whats-new.json`

export function useNewsData() {
  const [feed, setFeed] = useState<WhatsNewFeed | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(DATA_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<WhatsNewFeed>
      })
      .then((data) => {
        setFeed(data)
        setLoading(false)
      })
      .catch((err: Error) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  return { feed, loading, error }
}
