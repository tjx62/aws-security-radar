#!/usr/bin/env node
import https from 'https'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { parseRSS } from './parse-rss.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUTPUT_PATH = path.join(__dirname, '..', 'public', 'data', 'whats-new.json')
const MAX_ITEMS = 500
const MAX_RETRIES = 3

// Multiple feeds — What's New (all announcements) + security-specific sources
const FEEDS = [
  {
    url: 'https://aws.amazon.com/about-aws/whats-new/recent/feed/',
    source: 'whats-new',
  },
  {
    url: 'https://aws.amazon.com/blogs/security/feed/',
    source: 'security-blog',
  },
  {
    url: 'https://aws.amazon.com/security/security-bulletins/rss/feed/',
    source: 'security-bulletin',
  },
]

function fetchURL(url, retries = MAX_RETRIES) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: 15000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchURL(res.headers.location, retries).then(resolve).catch(reject)
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`))
      }
      const chunks = []
      res.on('data', (chunk) => chunks.push(chunk))
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')))
      res.on('error', reject)
    })
    req.on('timeout', () => {
      req.destroy()
      reject(new Error('Request timed out'))
    })
    req.on('error', reject)
  }).catch((err) => {
    if (retries > 0) {
      const delay = (MAX_RETRIES - retries + 1) * 2000
      console.warn(`  Retry in ${delay}ms (${retries} left): ${err.message}`)
      return new Promise((r) => setTimeout(r, delay)).then(() => fetchURL(url, retries - 1))
    }
    throw err
  })
}

async function main() {
  console.log('→ Fetching AWS feeds...')

  let allNewItems = []

  for (const feed of FEEDS) {
    try {
      console.log(`  Fetching: ${feed.url}`)
      const xml = await fetchURL(feed.url)
      const items = parseRSS(xml)
      // Tag each item with its source feed
      for (const item of items) {
        item.source = feed.source
        // Security blog and bulletin items get a baseline boost
        if (feed.source === 'security-blog' || feed.source === 'security-bulletin') {
          item.securityScore = Math.min((item.securityScore || 0) + 30, 100)
          if (item.securityLevel === 'low') item.securityLevel = 'high'
        }
      }
      console.log(`    Parsed ${items.length} items from ${feed.source}`)
      allNewItems = allNewItems.concat(items)
    } catch (err) {
      console.warn(`    ⚠ Failed to fetch ${feed.source}: ${err.message}`)
    }
  }

  console.log(`  Total new items parsed: ${allNewItems.length}`)

  // Read existing data and merge
  let existingItems = []
  if (fs.existsSync(OUTPUT_PATH)) {
    try {
      const existing = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf-8'))
      existingItems = existing.items ?? []
    } catch {
      console.warn('  Could not read existing data, starting fresh')
    }
  }

  // Deduplicate by id, new items win on conflict
  const byId = new Map(existingItems.map((i) => [i.id, i]))
  for (const item of allNewItems) {
    byId.set(item.id, item)
  }

  const items = [...byId.values()]
    .sort((a, b) => {
      // Sort by security score first (desc), then by date (desc)
      if (b.securityScore !== a.securityScore) {
        return b.securityScore - a.securityScore
      }
      return new Date(b.publishedAt) - new Date(a.publishedAt)
    })
    .slice(0, MAX_ITEMS)

  const feed = {
    lastUpdated: new Date().toISOString(),
    itemCount: items.length,
    items,
  }

  // Atomic write
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true })
  const tmp = OUTPUT_PATH + '.tmp'
  fs.writeFileSync(tmp, JSON.stringify(feed, null, 2), 'utf-8')
  fs.renameSync(tmp, OUTPUT_PATH)
  console.log(`✓ Wrote ${items.length} items to public/data/whats-new.json`)
  console.log(`  New this week: ${items.filter((i) => i.isNew).length}`)
  console.log(`  Security-critical: ${items.filter((i) => i.securityLevel === 'critical').length}`)
  console.log(`  Security-high: ${items.filter((i) => i.securityLevel === 'high').length}`)
  console.log(`  Security-medium: ${items.filter((i) => i.securityLevel === 'medium').length}`)
}

main().catch((err) => {
  console.error('✗ Fetch failed:', err.message)
  process.exit(1)
})