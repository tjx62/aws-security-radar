import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Header } from './components/Header'
import { FilterBar } from './components/FilterBar'
import { NewsGrid } from './components/NewsGrid'
import { LoadingSkeleton } from './components/LoadingSkeleton'
import { useNewsData } from './hooks/useNewsData'
import { useSearch } from './hooks/useSearch'
import { useFilters } from './hooks/useFilters'

export default function App() {
  const { feed, loading, error } = useNewsData()
  const items = useMemo(() => feed?.items ?? [], [feed])
  const newCount = useMemo(() => items.filter(i => i.isNew).length, [items])
  const criticalCount = useMemo(
    () => items.filter(i => i.securityLevel === 'critical' || i.securityLevel === 'high').length,
    [items]
  )

  const { query, setQuery, results: searchResults } = useSearch(items)
  const { activeFilters, allCategories, toggleFilter, clearFilters, filtered, securityOnly, setSecurityOnly } = useFilters(searchResults)

  return (
    <div className="min-h-screen relative" style={{ background: '#060a14' }}>

      {/* Animated aurora blobs — security-themed red/amber tones */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-[0.07] blur-[100px] animate-pulse-slow"
          style={{ background: 'radial-gradient(circle, #ef4444, transparent)' }} />
        <div className="absolute -top-20 right-0 w-[500px] h-[500px] rounded-full opacity-[0.06] blur-[100px] animate-pulse-slow"
          style={{ background: 'radial-gradient(circle, #f59e0b, transparent)', animationDelay: '1s' }} />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full opacity-[0.04] blur-[120px]"
          style={{ background: 'radial-gradient(ellipse, #10b981, transparent)' }} />
      </div>

      {/* Dot grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(239,68,68,0.15) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <Header
        query={query}
        onSearch={setQuery}
        resultCount={filtered.length}
        lastUpdated={feed?.lastUpdated ?? null}
        totalCount={items.length}
        newCount={newCount}
        criticalCount={criticalCount}
      />

      {!loading && !error && (
        <FilterBar
          categories={allCategories}
          activeFilters={activeFilters}
          onToggle={toggleFilter}
          onClear={clearFilters}
          totalCount={items.length}
          filteredCount={filtered.length}
          securityOnly={securityOnly}
          onToggleSecurityOnly={() => setSecurityOnly(!securityOnly)}
        />
      )}

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {loading && <LoadingSkeleton />}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-surface-2 border border-red-900/30 flex items-center justify-center mb-4 text-3xl">
              ⚠️
            </div>
            <h3 className="text-base font-semibold text-heading mb-2">Failed to load data</h3>
            <p className="text-sm text-muted max-w-sm">
              Run <code className="font-mono text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded">npm run fetch</code> to generate data.
            </p>
          </motion.div>
        )}

        {!loading && !error && (
          <NewsGrid
            items={filtered}
            hasFilters={activeFilters.size > 0 || query.length > 0 || securityOnly}
            onClearFilters={() => { clearFilters(); setQuery('') }}
          />
        )}
      </main>

      <footer className="relative border-t border-white/5 mt-16 py-8 text-center">
        <p className="text-xs text-muted">
          AWS Security Radar · Ranked by security relevance · Data from{' '}
          <a href="https://aws.amazon.com/new/" target="_blank" rel="noopener noreferrer"
            className="text-red-400 hover:text-red-300 transition-colors">
            AWS What's New
          </a>
          {' '}+{' '}
          <a href="https://aws.amazon.com/blogs/security/" target="_blank" rel="noopener noreferrer"
            className="text-red-400 hover:text-red-300 transition-colors">
            AWS Security Blog
          </a>
          {' '}+{' '}
          <a href="https://aws.amazon.com/security/security-bulletins/" target="_blank" rel="noopener noreferrer"
            className="text-red-400 hover:text-red-300 transition-colors">
            Security Bulletins
          </a>
          {' '}· Updated daily
        </p>
      </footer>
    </div>
  )
}