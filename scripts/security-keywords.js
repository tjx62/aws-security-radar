// Security relevance keywords for scoring AWS announcements.
// Each keyword has a weight. The parser sums matched weights into a securityScore (0-100 capped).

export const SECURITY_KEYWORDS = [
  // --- Critical (weight 20) — security services & core features ---
  { keyword: 'GuardDuty', weight: 20 },
  { keyword: 'Security Hub', weight: 20 },
  { keyword: 'Inspector', weight: 20 },
  { keyword: 'Macie', weight: 20 },
  { keyword: 'Detective', weight: 20 },
  { keyword: 'Shield', weight: 20 },
  { keyword: 'WAF', weight: 20 },
  { keyword: 'Network Firewall', weight: 20 },
  { keyword: 'CloudHSM', weight: 20 },
  { keyword: 'KMS', weight: 20 },
  { keyword: 'Secrets Manager', weight: 20 },
  { keyword: 'IAM', weight: 20 },
  { keyword: 'Cognito', weight: 20 },
  { keyword: 'Verified Access', weight: 20 },
  { keyword: 'IAM Identity Center', weight: 20 },
  { keyword: 'Certificate Manager', weight: 20 },
  { keyword: 'ACM', weight: 20 },
  { keyword: 'Audit Manager', weight: 20 },
  { keyword: 'Artifact', weight: 20 },
  { keyword: 'Firewall Manager', weight: 20 },
  { keyword: 'Route 53 Resolver DNS Firewall', weight: 20 },

  // --- High (weight 15) — security-adjacent concepts ---
  { keyword: 'encryption', weight: 15 },
  { keyword: 'encrypt', weight: 15 },
  { keyword: 'TLS', weight: 15 },
  { keyword: 'mTLS', weight: 15 },
  { keyword: 'authentication', weight: 15 },
  { keyword: 'authorization', weight: 15 },
  { keyword: 'zero trust', weight: 15 },
  { keyword: 'VPC', weight: 15 },
  { keyword: 'PrivateLink', weight: 15 },
  { keyword: 'PrivateLink', weight: 15 },
  { keyword: 'security', weight: 15 },
  { keyword: 'vulnerability', weight: 15 },
  { keyword: 'compliance', weight: 15 },
  { keyword: 'SOC 2', weight: 15 },
  { keyword: 'HIPAA', weight: 15 },
  { keyword: 'PCI', weight: 15 },
  { keyword: 'FedRAMP', weight: 15 },
  { keyword: 'ISO 27001', weight: 15 },
  { keyword: 'FIPS', weight: 15 },
  { keyword: 'HMAC', weight: 15 },

  // --- Medium (weight 10) — governance, audit, access control ---
  { keyword: 'CloudTrail', weight: 10 },
  { keyword: 'Config', weight: 10 },
  { keyword: 'Control Tower', weight: 10 },
  { keyword: 'Organizations', weight: 10 },
  { keyword: 'Service Control Policy', weight: 10 },
  { keyword: 'SCP', weight: 10 },
  { keyword: 'Resource Access Manager', weight: 10 },
  { keyword: 'Access Analyzer', weight: 10 },
  { keyword: 'Trusted Advisor', weight: 10 },
  { keyword: 'Systems Manager', weight: 10 },
  { keyword: 'patch', weight: 10 },
  { keyword: 'audit', weight: 10 },
  { keyword: 'logging', weight: 10 },
  { keyword: 'monitoring', weight: 10 },
  { keyword: 'permission', weight: 10 },
  { keyword: 'policy', weight: 10 },
  { keyword: 'role', weight: 10 },
  { keyword: 'access', weight: 10 },
  { keyword: 'identity', weight: 10 },
  // --- Deprecation & lifecycle (weight 20) — critical for security consultants ---
  { keyword: 'deprecation', weight: 20 },
  { keyword: 'deprecate', weight: 20 },
  { keyword: 'deprecated', weight: 20 },
  { keyword: 'end of support', weight: 20 },
  { keyword: 'end of life', weight: 20 },
  { keyword: 'end-of-life', weight: 20 },
  { keyword: 'sunset', weight: 20 },
  { keyword: 'retire', weight: 20 },
  { keyword: 'retired', weight: 20 },
  { keyword: 'retirement', weight: 20 },
  { keyword: 'discontinu', weight: 20 },
  { keyword: 'no longer supported', weight: 20 },
  { keyword: 'no longer available', weight: 20 },
  { keyword: 'no longer maintained', weight: 20 },
  { keyword: 'last supported', weight: 20 },
  { keyword: 'reaching end', weight: 20 },
  { keyword: 'plan to deprecate', weight: 20 },
  { keyword: 'planned deprecation', weight: 20 },
  { keyword: 'removed', weight: 15 },
  { keyword: 'removal', weight: 15 },
  { keyword: 'withdrawn', weight: 15 },
  { keyword: 'withdraw', weight: 15 },
  { keyword: 'replacement', weight: 10 },
  { keyword: 'migrate', weight: 10 },
  { keyword: 'migration required', weight: 15 },

  // --- Lower (weight 5) — indirect security relevance ---
  { keyword: 'S3', weight: 5 },
  { keyword: 'Bucket', weight: 5 },
  { keyword: 'Block Public Access', weight: 5 },
  { keyword: 'data protection', weight: 5 },
  { keyword: 'privacy', weight: 5 },
  { keyword: 'GDPR', weight: 5 },
  { keyword: 'key rotation', weight: 5 },
  { keyword: 'token', weight: 5 },
  { keyword: 'credential', weight: 5 },
  { keyword: 'Secret', weight: 5 },
  { keyword: 'incident', weight: 5 },
  { keyword: 'threat', weight: 5 },
  { keyword: 'attack', weight: 5 },
  { keyword: 'breach', weight: 5 },
  { keyword: 'forensic', weight: 5 },
  { keyword: 'DDoS', weight: 5 },
  { keyword: 'firewall', weight: 5 },
  { keyword: 'Network ACL', weight: 5 },
  { keyword: 'Security Group', weight: 5 },
]

// Services that are inherently security-related — used for tag-level scoring
export const SECURITY_SERVICES = new Set([
  'GuardDuty', 'Security Hub', 'Inspector', 'Macie', 'Detective',
  'Shield', 'WAF', 'AWS Network Firewall', 'CloudHSM', 'KMS',
  'Secrets Manager', 'IAM', 'Cognito', 'Verified Access',
  'IAM Identity Center', 'Certificate Manager', 'ACM',
  'Audit Manager', 'Artifact', 'Firewall Manager',
])

/**
 * Calculate a security relevance score (0-100) for an announcement.
 * @param title - announcement title
 * @param description - plain text description
 * @param categories - parsed categories
 * @param services - parsed services
 * @returns { score, matchedKeywords, securityLevel }
 */
export function calculateSecurityScore(title, description, categories, services) {
  const text = `${title} ${description}`.toLowerCase()
  const allServices = services.join(' ')
  const allCats = categories.join(' ')

  let score = 0
  const matched = new Set()

  // 1. Keyword matching on title + description
  for (const { keyword, weight } of SECURITY_KEYWORDS) {
    const kw = keyword.toLowerCase()
    // Use word-boundary regex for short keywords, substring for longer ones
    if (keyword.length <= 4) {
      const re = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
      if (re.test(text)) {
        score += weight
        matched.add(keyword)
      }
    } else {
      if (text.includes(kw)) {
        score += weight
        matched.add(keyword)
      }
    }
  }

  // 2. Service tag boost — if any tagged service is a security service
  for (const svc of services) {
    if (SECURITY_SERVICES.has(svc)) {
      score += 15
      matched.add(svc)
    }
  }

  // 3. Category boost — "Security, Identity, & Compliance" category
  if (allCats.toLowerCase().includes('security')) {
    score += 15
  }

  // Cap at 100
  score = Math.min(score, 100)

  // Determine level
  let securityLevel = 'low'
  if (score >= 50) securityLevel = 'critical'
  else if (score >= 30) securityLevel = 'high'
  else if (score >= 15) securityLevel = 'medium'

  return {
    score,
    matchedKeywords: [...matched],
    securityLevel,
  }
}