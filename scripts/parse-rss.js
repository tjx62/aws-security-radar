import crypto from 'crypto'
import { AWS_SERVICES } from './aws-services.js'
import { calculateSecurityScore } from './security-keywords.js'

function extractTag(xml, tag) {
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i')
  const m = xml.match(re)
  if (!m) return ''
  return m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim()
}

function extractAllTags(xml, tag) {
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'gi')
  const results = []
  let m
  while ((m = re.exec(xml)) !== null) {
    const val = m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim()
    if (val) results.push(val)
  }
  return results
}

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
}

function stripHtml(html) {
  // Decode entities first (RSS may use entity-encoded HTML), then strip tags
  const decoded = decodeEntities(html)
  return decoded
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function sanitizeHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
    .trim()
}

// Convert raw AWS RSS category paths to clean human-readable names.
// Input examples:
//   "marketing:marchitecture/databases,general:products/amazon-timestream"
//   "general:products/aws-lambda"
//   "Launch"
function parseCategories(rawCategories) {
  const clean = new Set()

  for (const raw of rawCategories) {
    // Each <category> tag may contain comma-separated paths
    const parts = raw.split(',').map(p => p.trim()).filter(Boolean)

    for (const part of parts) {
      // Extract the last path segment after the final '/'
      const segment = part.includes('/') ? part.split('/').pop() : part
      if (!segment) continue

      // Skip generic marketing paths
      if (segment.startsWith('marchitecture') || segment === 'marketing') continue

      // Convert kebab-case to Title Case, preserve known prefixes
      const label = segment
        .replace(/^amazon-/, 'Amazon ')
        .replace(/^aws-/, 'AWS ')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase())
        .trim()

      if (label.length > 1) clean.add(label)
    }
  }

  return [...clean]
}

function extractServices(text) {
  const found = new Set()
  const upper = text.toUpperCase()
  for (const svc of AWS_SERVICES) {
    const pattern = new RegExp(`\\b${svc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').toUpperCase()}\\b`)
    if (pattern.test(upper)) {
      found.add(svc)
    }
  }
  return [...found]
}

export function parseRSS(xml) {
  const items = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi
  let m

  while ((m = itemRegex.exec(xml)) !== null) {
    const raw = m[1]

    const title = extractTag(raw, 'title')
    const link = extractTag(raw, 'link') || extractTag(raw, 'guid')
    const description = extractTag(raw, 'description')
    const pubDate = extractTag(raw, 'pubDate')
    const rawCategories = extractAllTags(raw, 'category')

    if (!title || !link) continue

    const id = crypto.createHash('sha256').update(link).digest('hex').slice(0, 16)
    const publishedAt = pubDate ? new Date(pubDate).toISOString() : new Date().toISOString()
    const descPlain = stripHtml(description).slice(0, 600)
    const descHtml = sanitizeHtml(description)
    const categories = parseCategories(rawCategories)
    const services = extractServices(title + ' ' + rawCategories.join(' '))
    const now = new Date()
    const pub = new Date(publishedAt)
    const isNew = now - pub < 7 * 24 * 60 * 60 * 1000

    const tags = [...new Set([...categories, ...services].map(t => t.toLowerCase()))]

    // Security relevance scoring
    const { score: securityScore, matchedKeywords: securityMatches, securityLevel } =
      calculateSecurityScore(title, descPlain, categories, services)

    items.push({
      id,
      title,
      description: descPlain,
      descriptionHtml: descHtml,
      url: link,
      publishedAt,
      updatedAt: publishedAt,
      categories,
      services,
      tags,
      isNew,
      securityScore,
      securityLevel,
      securityMatches,
      source: 'whats-new',
    })
  }

  return items
}
