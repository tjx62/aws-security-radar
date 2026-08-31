import { motion } from 'framer-motion'
import { ExternalLink, Calendar, Zap, Shield, ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react'
import { TagBadge } from './TagBadge'
import { relativeTime, fullDate } from '../utils/dateUtils'
import { tagColor } from '../utils/colorUtils'
import type { WhatsNewItem } from '../types/news'

interface NewsCardProps {
  item: WhatsNewItem
  index: number
}

export const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: Math.min(i * 0.035, 0.5),
      duration: 0.45,
      ease: [0.25, 0.1, 0.25, 1],
    },
  }),
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.18 } },
}

// Each card gets a subtle gradient accent based on its primary service
const CARD_GRADIENTS = [
  'from-violet-500/10 to-transparent',
  'from-cyan-500/10 to-transparent',
  'from-emerald-500/10 to-transparent',
  'from-fuchsia-500/10 to-transparent',
  'from-amber-500/10 to-transparent',
  'from-sky-500/10 to-transparent',
  'from-rose-500/10 to-transparent',
  'from-indigo-500/10 to-transparent',
]

function djb2(str: string) {
  let h = 5381
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h) ^ str.charCodeAt(i)
  return Math.abs(h)
}

// Security level badge configuration
const SECURITY_BADGES = {
  critical: {
    icon: ShieldX,
    bg: 'rgba(248,113,113,0.15)',
    border: 'rgba(248,113,113,0.4)',
    text: '#fca5a5',
    label: 'CRITICAL',
  },
  high: {
    icon: ShieldAlert,
    bg: 'rgba(251,146,60,0.15)',
    border: 'rgba(251,146,60,0.4)',
    text: '#fdba74',
    label: 'HIGH',
  },
  medium: {
    icon: ShieldCheck,
    bg: 'rgba(251,191,36,0.12)',
    border: 'rgba(251,191,36,0.35)',
    text: '#fcd34d',
    label: 'MEDIUM',
  },
  low: null,
} as const

// Source badge labels
const SOURCE_LABELS: Record<string, string> = {
  'whats-new': "What's New",
  'security-blog': 'Security Blog',
  'security-bulletin': 'Security Bulletin',
}

export function NewsCard({ item, index }: NewsCardProps) {
  const primaryService = item.services[0] ?? item.categories[0] ?? item.id
  const color = tagColor(primaryService)
  const gradient = CARD_GRADIENTS[djb2(primaryService) % CARD_GRADIENTS.length]
  const secBadge = SECURITY_BADGES[item.securityLevel as keyof typeof SECURITY_BADGES]

  return (
    <motion.article
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      custom={index}
      layout
      className="group relative flex flex-col rounded-2xl overflow-hidden cursor-pointer"
      style={{
        background: 'rgba(15, 22, 36, 0.8)',
        border: secBadge
          ? `1px solid ${secBadge.border}`
          : '1px solid rgba(255,255,255,0.06)',
      }}
      onClick={() => window.open(item.url, '_blank', 'noopener,noreferrer')}
      whileHover={{
        y: -4,
        borderColor: color.border,
        boxShadow: secBadge
          ? `0 0 0 1px ${secBadge.border}, 0 8px 32px ${secBadge.bg}`
          : `0 0 0 1px ${color.border}, 0 8px 32px ${color.bg}`,
        transition: { duration: 0.2 },
      }}
    >
      {/* Top gradient strip */}
      <div className={`absolute top-0 left-0 right-0 h-24 bg-gradient-to-b ${gradient} pointer-events-none`} />

      {/* Security accent line — colored by security level */}
      <div
        className="h-[2px] w-full shrink-0"
        style={{
          background: secBadge
            ? `linear-gradient(90deg, transparent, ${secBadge.text}, transparent)`
            : `linear-gradient(90deg, transparent, ${color.text}, transparent)`,
          opacity: secBadge ? 0.8 : 0.6,
        }}
      />

      <div className="relative flex flex-col gap-4 p-6 flex-1">

        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {item.isNew && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-xs shrink-0"
                style={{
                  background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(6,182,212,0.15))',
                  border: '1px solid rgba(16,185,129,0.35)',
                  color: '#34d399',
                }}>
                <Zap className="w-3 h-3 fill-current" />
                NEW
              </span>
            )}
            {secBadge && (
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-xs shrink-0"
                style={{
                  background: secBadge.bg,
                  border: `1px solid ${secBadge.border}`,
                  color: secBadge.text,
                }}
                title={`Security relevance: ${item.securityScore}/100 — matched: ${item.securityMatches.join(', ')}`}
              >
                <secBadge.icon className="w-3 h-3" />
                {secBadge.label}
                <span className="opacity-60 ml-0.5">{item.securityScore}</span>
              </span>
            )}
            {item.source !== 'whats-new' && SOURCE_LABELS[item.source] && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide"
                style={{
                  background: 'rgba(99,102,241,0.1)',
                  border: '1px solid rgba(99,102,241,0.25)',
                  color: '#a5b4fc',
                }}>
                <Shield className="w-2.5 h-2.5" />
                {SOURCE_LABELS[item.source]}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted shrink-0 whitespace-nowrap mt-0.5">
            <Calendar className="w-3.5 h-3.5" />
            <span title={fullDate(item.publishedAt)}>{relativeTime(item.publishedAt)}</span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-base font-semibold leading-snug line-clamp-3 transition-colors duration-200"
          style={{ color: '#e8f0ff' }}
        >
          <span className="group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/80 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
            {item.title}
          </span>
        </h2>

        {/* Description */}
        <p className="text-sm leading-relaxed line-clamp-4 flex-1" style={{ color: '#7a8aa8' }}>
          {item.description}
        </p>

        {/* Security matches — show which keywords triggered the score */}
        {item.securityMatches.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {item.securityMatches.slice(0, 4).map((kw) => (
              <span key={kw} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-amber-400/70 border border-amber-500/10">
                {kw}
              </span>
            ))}
            {item.securityMatches.length > 4 && (
              <span className="text-[10px] text-muted">+{item.securityMatches.length - 4}</span>
            )}
          </div>
        )}

        {/* Service tags */}
        {item.services.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-white/5">
            {item.services.slice(0, 5).map((svc) => (
              <TagBadge key={svc} tag={svc} active size="sm" />
            ))}
            {item.services.length > 5 && (
              <span className="text-xs text-muted">+{item.services.length - 5}</span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="relative px-6 py-3 border-t border-white/5 flex items-center justify-between gap-2"
        style={{ background: 'rgba(0,0,0,0.2)' }}>
        <span className="text-xs text-muted">{fullDate(item.publishedAt)}</span>
        <span
          className="flex items-center gap-1.5 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0"
          style={{ color: color.text }}
        >
          Read more <ExternalLink className="w-3 h-3" />
        </span>
      </div>
    </motion.article>
  )
}