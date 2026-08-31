import { motion, AnimatePresence } from 'framer-motion'
import { SlidersHorizontal, X, Shield, ShieldAlert } from 'lucide-react'
import { tagColor } from '../utils/colorUtils'

interface FilterBarProps {
  categories: string[]
  activeFilters: Set<string>
  onToggle: (cat: string) => void
  onClear: () => void
  totalCount: number
  filteredCount: number
  securityOnly: boolean
  onToggleSecurityOnly: () => void
}

export function FilterBar({
  categories,
  activeFilters,
  onToggle,
  onClear,
  totalCount,
  filteredCount,
  securityOnly,
  onToggleSecurityOnly,
}: FilterBarProps) {
  return (
    <div className="border-b border-white/5" style={{ background: 'rgba(10,14,25,0.7)', backdropFilter: 'blur(12px)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-start gap-4">

          {/* Security-only toggle */}
          <button
            onClick={onToggleSecurityOnly}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 select-none shrink-0"
            style={securityOnly ? {
              background: 'rgba(248,113,113,0.15)',
              color: '#fca5a5',
              borderColor: 'rgba(248,113,113,0.4)',
              boxShadow: '0 0 12px rgba(248,113,113,0.15)',
            } : {
              background: 'rgba(255,255,255,0.03)',
              color: '#4a5878',
              borderColor: 'rgba(255,255,255,0.06)',
            }}
          >
            {securityOnly ? <ShieldAlert className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
            Security Only
          </button>

          {/* Label */}
          <div className="flex items-center gap-1.5 text-xs text-muted shrink-0 pt-1.5 font-medium">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filter
          </div>

          {/* Chips */}
          <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
            {categories.map((cat) => {
              const active = activeFilters.has(cat)
              const color = tagColor(cat)
              return (
                <button
                  key={cat}
                  onClick={() => onToggle(cat)}
                  style={active ? {
                    background: color.bg,
                    color: color.text,
                    borderColor: color.border,
                    boxShadow: `0 0 12px ${color.bg}`,
                  } : {
                    background: 'rgba(255,255,255,0.03)',
                    color: '#4a5878',
                    borderColor: 'rgba(255,255,255,0.06)',
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 select-none hover:scale-105 active:scale-95"
                >
                  {active && (
                    <span className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse-slow" style={{ background: color.text }} />
                  )}
                  {cat}
                </button>
              )
            })}
          </div>

          {/* Right */}
          <div className="flex items-center gap-3 shrink-0 pt-1">
            <AnimatePresence>
              {activeFilters.size > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  onClick={onClear}
                  className="flex items-center gap-1 text-xs font-semibold transition-colors"
                  style={{ color: '#a78bfa' }}
                >
                  <X className="w-3 h-3" />
                  Clear ({activeFilters.size})
                </motion.button>
              )}
            </AnimatePresence>
            <span className="text-xs text-muted tabular-nums">
              {filteredCount === totalCount
                ? <><span className="text-body font-medium">{totalCount.toLocaleString()}</span> items</>
                : <><span className="text-violet-400 font-medium">{filteredCount.toLocaleString()}</span> <span>of {totalCount.toLocaleString()}</span></>
              }
            </span>
          </div>
        </div>

        {/* Active filter pills */}
        <AnimatePresence>
          {activeFilters.size > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                <span className="text-xs text-muted">Active:</span>
                {[...activeFilters].map(f => {
                  const color = tagColor(f)
                  return (
                    <motion.span
                      key={f}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      style={{ background: color.bg, color: color.text, borderColor: color.border }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border font-medium"
                    >
                      {f}
                      <button onClick={() => onToggle(f)} className="opacity-60 hover:opacity-100 transition-opacity">
                        <X className="w-3 h-3" />
                      </button>
                    </motion.span>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}