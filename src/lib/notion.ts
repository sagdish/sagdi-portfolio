import { Client } from "@notionhq/client"
import { NotionToMarkdown } from "notion-to-md"
import type { BlogPost, NotionPage, NotionPropertyValue } from "@/types/blog"

const NOTION_VERSION = "2025-09-03"
const NOTION_API_BASE = "https://api.notion.com/v1"

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
  notionVersion: NOTION_VERSION,
})

const n2m = new NotionToMarkdown({ notionClient: notion })

const databaseId = process.env.NOTION_DATABASE_ID
const envDataSourceId = process.env.NOTION_DATA_SOURCE_ID

let cachedDataSourceId: string | null = envDataSourceId ?? null
let cachedDataSourceSchema: NotionDataSourceSchema | null = null
let cachedPropertyConfig: PropertyConfig | null = null

const loggedWarnings = new Set<string>()

interface NotionDataSourceSchema {
  id: string
  properties: Record<string, { id: string; type: string }>
}

interface PropertyConfig {
  title: string
  slug: string | null
  description: string | null
  tags: string | null
  published: string | null
  publishedDate: string | null
}

function assertConfig() {
  if (!process.env.NOTION_API_KEY) {
    throw new Error("NOTION_API_KEY is not set")
  }

  if (!databaseId) {
    throw new Error("NOTION_DATABASE_ID is not set")
  }
}

function buildHeaders(includeContentType = false) {
  assertConfig()

  const headers: Record<string, string> = {
    Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
    "Notion-Version": NOTION_VERSION,
  }

  if (includeContentType) {
    headers["Content-Type"] = "application/json"
  }

  return headers
}

async function resolveDataSourceId(): Promise<string> {
  if (cachedDataSourceId) {
    return cachedDataSourceId
  }

  assertConfig()

  const database = await notion.databases.retrieve({
    database_id: databaseId!,
  })

  const dataSources = (database as { data_sources?: Array<{ id: string }> })
    .data_sources

  const dataSourceId = dataSources?.[0]?.id

  if (!dataSourceId) {
    throw new Error("Unable to resolve data source ID for Notion database")
  }

  cachedDataSourceId = dataSourceId
  cachedDataSourceSchema = null
  cachedPropertyConfig = null
  return dataSourceId
}

async function getDataSourceSchema(): Promise<NotionDataSourceSchema> {
  if (cachedDataSourceSchema) {
    return cachedDataSourceSchema
  }

  const dataSourceId = await resolveDataSourceId()

  const response = await fetch(
    `${NOTION_API_BASE}/data_sources/${dataSourceId}`,
    {
      method: "GET",
      headers: buildHeaders(),
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Notion API error (${response.status}) while retrieving data source: ${
        errorText || response.statusText
      }`
    )
  }

  const data = (await response.json()) as {
    id?: string
    properties?: NotionDataSourceSchema["properties"]
  }

  if (!data?.id || !data.properties) {
    throw new Error(
      "Unexpected Notion response shape: missing data source properties"
    )
  }

  cachedDataSourceSchema = {
    id: data.id,
    properties: data.properties,
  }

  return cachedDataSourceSchema
}

async function getPropertyConfig(): Promise<PropertyConfig> {
  if (cachedPropertyConfig) {
    return cachedPropertyConfig
  }

  const schema = await getDataSourceSchema()

  const title = findPropertyName(schema, ["Title", "Name"], { type: "title" })

  if (!title) {
    throw new Error(
      "Unable to determine the title property for the Notion data source"
    )
  }

  const slug = findPropertyName(schema, ["Slug"], { type: "rich_text" })
  const description = findPropertyName(schema, ["Description", "Summary"], {
    type: "rich_text",
    exclude: slug ? new Set([slug]) : undefined,
  })
  const tags = findPropertyName(schema, ["Tags", "Tag"], {
    type: "multi_select",
  })
  const published = findPropertyName(schema, ["Published", "Live"], {
    type: "checkbox",
  })
  const publishedDate = findPropertyName(schema, ["Published Date", "Date"], {
    type: "date",
  })

  cachedPropertyConfig = {
    title,
    slug,
    description,
    tags,
    published,
    publishedDate,
  }

  return cachedPropertyConfig
}

function findPropertyName(
  schema: NotionDataSourceSchema,
  hints: string[],
  options: { type?: string; exclude?: Set<string> } = {}
): string | null {
  const entries = Object.entries(schema.properties)
  const exclude = options.exclude ?? new Set<string>()

  for (const hint of hints) {
    const match = entries.find(([name, value]) => {
      if (exclude.has(name)) {
        return false
      }

      if (name.toLowerCase() !== hint.toLowerCase()) {
        return false
      }

      if (options.type && value.type !== options.type) {
        return false
      }

      return true
    })

    if (match) {
      return match[0]
    }
  }

  if (options.type) {
    const fallback = entries.find(
      ([name, value]) => !exclude.has(name) && value.type === options.type
    )

    if (fallback) {
      return fallback[0]
    }
  }

  return null
}

async function queryDataSource(body: Record<string, unknown>) {
  const dataSourceId = await resolveDataSourceId()

  const response = await fetch(
    `${NOTION_API_BASE}/data_sources/${dataSourceId}/query`,
    {
      method: "POST",
      headers: buildHeaders(true),
      body: JSON.stringify(body),
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Notion API error (${response.status}): ${errorText || response.statusText}`
    )
  }

  const data = (await response.json()) as { results?: NotionPage[] }

  if (!Array.isArray(data.results)) {
    throw new Error("Unexpected Notion response shape: missing results array")
  }

  return { results: data.results }
}

function warnOnce(key: string, message: string) {
  if (loggedWarnings.has(key)) {
    return
  }

  console.warn(message)
  loggedWarnings.add(key)
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
  try {
    const propertyConfig = await getPropertyConfig()

    const filters: Array<Record<string, unknown>> = []

    if (propertyConfig.published) {
      filters.push({
        property: propertyConfig.published,
        checkbox: { equals: true },
      })
    } else {
      warnOnce(
        "missing-published",
        "Notion data source is missing a checkbox property for Published; returning all entries."
      )
    }

    const body: Record<string, unknown> = {
      sorts: buildSorts(propertyConfig),
    }

    if (filters.length === 1) {
      body.filter = filters[0]
    } else if (filters.length > 1) {
      body.filter = { and: filters }
    }

    const data = await queryDataSource(body)

    const posts = await Promise.all(
      data.results.map(async (page) => convertNotionPageToBlogPost(page))
    )

    return posts.filter((post): post is BlogPost => post !== null)
  } catch (error) {
    console.error("Error fetching posts:", error)
    return []
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const propertyConfig = await getPropertyConfig()

    if (!propertyConfig.slug) {
      warnOnce(
        "missing-slug",
        "Notion data source is missing a rich text property for Slug; falling back to in-memory lookup."
      )
      const posts = await getPublishedPosts()
      return posts.find((post) => post.slug === slug) ?? null
    }

    const filters: Array<Record<string, unknown>> = [
      {
        property: propertyConfig.slug,
        rich_text: {
          equals: slug,
        },
      },
    ]

    if (propertyConfig.published) {
      filters.push({
        property: propertyConfig.published,
        checkbox: { equals: true },
      })
    }

    const body: Record<string, unknown> = { page_size: 1 }

    if (filters.length === 1) {
      body.filter = filters[0]
    } else {
      body.filter = { and: filters }
    }

    const data = await queryDataSource(body)

    if (data.results.length === 0) {
      return null
    }

    return await convertNotionPageToBlogPost(data.results[0])
  } catch (error) {
    console.error("Error fetching post by slug:", error)
    return null
  }
}

export async function getAllTags(): Promise<string[]> {
  const posts = await getPublishedPosts()
  const tagsSet = new Set<string>()

  posts.forEach((post) => {
    post.tags.forEach((tag) => tagsSet.add(tag))
  })

  return Array.from(tagsSet).sort()
}

function buildSorts(propertyConfig: PropertyConfig) {
  if (propertyConfig.publishedDate) {
    return [
      {
        property: propertyConfig.publishedDate,
        direction: "descending",
      },
    ]
  }

  return [
    {
      timestamp: "created_time",
      direction: "descending",
    },
  ]
}

async function convertNotionPageToBlogPost(
  page: NotionPage
): Promise<BlogPost | null> {
  try {
    const propertyConfig = await getPropertyConfig()
    const properties = page.properties ?? {}

    const title =
      getPlainText(properties[propertyConfig.title], "title") || "Untitled Post"

    const slugText = propertyConfig.slug
      ? getPlainText(properties[propertyConfig.slug], "rich_text")
      : null

    const slug = slugText || slugify(title)

    const description = propertyConfig.description
      ? getPlainText(properties[propertyConfig.description], "rich_text") || ""
      : ""

    const tags = propertyConfig.tags
      ? extractMultiSelect(properties[propertyConfig.tags])
      : []

    let published = true
    if (propertyConfig.published) {
      const publishedProperty = properties[propertyConfig.published]
      if (publishedProperty?.type === "checkbox") {
        published = Boolean(publishedProperty.checkbox)
      }
    }

    const dateProperty = propertyConfig.publishedDate
      ? properties[propertyConfig.publishedDate]
      : undefined

    const publishedDate =
      extractDateValue(dateProperty) ?? toISODate(page.created_time)

    const mdBlocks = await n2m.pageToMarkdown(page.id)
    const content = n2m.toMarkdownString(mdBlocks).parent

    return {
      id: page.id,
      title,
      slug,
      description,
      tags,
      published,
      publishedDate,
      content,
    }
  } catch (error) {
    console.error("Error converting Notion page:", error)
    return null
  }
}

function getPlainText(
  property: NotionPropertyValue | undefined,
  field: "title" | "rich_text"
): string | null {
  if (!property) {
    return null
  }

  const segments = property[field]

  if (!Array.isArray(segments)) {
    return null
  }

  const text = segments
    .map((segment) => segment?.plain_text ?? "")
    .join("")
    .trim()

  return text.length > 0 ? text : null
}

function extractMultiSelect(
  property: NotionPropertyValue | undefined
): string[] {
  if (!property || !Array.isArray(property.multi_select)) {
    return []
  }

  return property.multi_select
    .map((tag) => tag.name)
    .filter((name): name is string => Boolean(name))
}

function extractDateValue(
  property: NotionPropertyValue | undefined
): string | null {
  if (!property || property.type !== "date" || !property.date?.start) {
    return null
  }

  return property.date.start
}

function toISODate(timestamp?: string): string {
  if (!timestamp) {
    return new Date().toISOString().split("T")[0]
  }

  const parsed = new Date(timestamp)

  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString().split("T")[0]
  }

  return parsed.toISOString().split("T")[0]
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}
