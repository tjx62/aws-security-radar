export interface WhatsNewItem {
  id: string
  title: string
  description: string
  descriptionHtml: string
  url: string
  publishedAt: string
  updatedAt: string
  categories: string[]
  services: string[]
  tags: string[]
  isNew: boolean
  securityScore: number
  securityLevel: 'critical' | 'high' | 'medium' | 'low'
  securityMatches: string[]
  source: string
}

export interface WhatsNewFeed {
  lastUpdated: string
  itemCount: number
  items: WhatsNewItem[]
}