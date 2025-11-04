export interface BlogPost {
  id: string
  title: string
  slug: string
  description: string
  tags: string[]
  published: boolean
  publishedDate: string
  content: string
  coverImage?: string
}

export interface NotionPage {
  id: string
  created_time?: string
  last_edited_time?: string
  properties: Record<string, NotionPropertyValue>
}

export interface NotionPropertyValue {
  id?: string
  type: string
  title?: Array<{ plain_text?: string | null }>
  rich_text?: Array<{ plain_text?: string | null }>
  multi_select?: Array<{ name: string }>
  checkbox?: boolean
  date?: {
    start: string | null
    end?: string | null
  } | null
  [key: string]: unknown
}
