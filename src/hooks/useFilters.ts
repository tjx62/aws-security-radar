import { useState, useCallback, useMemo } from 'react'
import type { WhatsNewItem } from '../types/news'

export type FilterMode = 'category' | 'service' | 'security'

export function useFilters(items: WhatsNewItem[]) {
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set())
  const [securityOnly, setSecurityOnly] = useState(false)

  // Build available categories from current items
  const allCategories = useMemo(() => {
    const counts = new Map<string, number>()
    for (const item of items) {
      for (const cat of item.categories) {
        counts.set(cat, (counts.get(cat) ?? 0) + 1)
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([cat]) => cat)
  }, [items])

  const toggleFilter = useCallback((tag: string) => {
    setActiveFilters((prev) => {
      const next = new Set(prev)
      if (next.has(tag)) {
        next.delete(tag)
      } else {
        next.add(tag)
      }
      return next
    })
  }, [])

  const clearFilters = useCallback(() => {
    setActiveFilters(new Set())
    setSecurityOnly(false)
  }, [])

  const filtered = useMemo(() => {
    let result = items

    // Security-only filter: show only medium+ security relevance
    if (securityOnly) {
      result = result.filter(
        (item) => item.securityLevel !== 'low' && item.securityScore >= 15
      )
    }

    // Category/service/tag filters
    if (activeFilters.size > 0) {
      result = result.filter((item) =>
        [...activeFilters].every(
          (f) =>
            item.categories.includes(f) ||
            item.services.includes(f) ||
            item.tags.includes(f.toLowerCase())
        )
      )
    }

    return result
  }, [items, activeFilters, securityOnly])

  return { activeFilters, allCategories, toggleFilter, clearFilters, filtered, securityOnly, setSecurityOnly }
}