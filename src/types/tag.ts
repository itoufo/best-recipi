export interface TagCategory {
  id: number
  slug: string
  name: string
  description: string | null
  display_order: number
}

export interface TagWithCategory {
  id: number
  slug: string
  name: string
  description: string | null
  display_order: number
  color: string | null
  category_slug: string | null
  category_name: string | null
}

export interface TagCategoryWithTags extends TagCategory {
  tags: TagWithCategory[]
}
