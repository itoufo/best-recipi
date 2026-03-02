-- =============================================
-- Recipi: Add base_dish column for recipe variants
-- =============================================

-- Add base_dish column to recipes table
ALTER TABLE recipi.recipes ADD COLUMN IF NOT EXISTS base_dish TEXT;

-- Index for efficient variant lookups
CREATE INDEX IF NOT EXISTS idx_recipes_base_dish
  ON recipi.recipes (base_dish)
  WHERE base_dish IS NOT NULL;

-- =============================================
-- get_recipe_variants: 同じbase_dishのレシピをtasteタグ付きで返す
-- =============================================
CREATE OR REPLACE FUNCTION recipi.get_recipe_variants(
  base_dish_val TEXT,
  exclude_id BIGINT DEFAULT NULL,
  result_limit INT DEFAULT 4
)
RETURNS TABLE (
  id BIGINT,
  slug TEXT,
  title TEXT,
  description TEXT,
  total_time_minutes INT,
  servings INT,
  servings_unit TEXT,
  difficulty TEXT,
  cuisine TEXT,
  course TEXT,
  hero_image_url TEXT,
  hero_image_alt TEXT,
  published_at TIMESTAMPTZ,
  taste_tags JSON
)
LANGUAGE plpgsql STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.slug,
    r.title,
    r.description,
    r.total_time_minutes,
    r.servings,
    r.servings_unit,
    r.difficulty,
    r.cuisine,
    r.course,
    ri.url AS hero_image_url,
    ri.alt_text AS hero_image_alt,
    r.published_at,
    (
      SELECT json_agg(
        json_build_object(
          'name', t.name,
          'slug', t.slug,
          'color', t.color
        )
      )
      FROM recipi.recipe_tags rt2
      JOIN recipi.tags t ON t.id = rt2.tag_id
      JOIN recipi.tag_categories tc ON tc.id = t.tag_category_id
      WHERE rt2.recipe_id = r.id
        AND tc.slug = 'taste'
    ) AS taste_tags
  FROM recipi.recipes r
  LEFT JOIN recipi.recipe_images ri ON ri.recipe_id = r.id AND ri.is_hero = true
  WHERE r.status = 'published'
    AND r.base_dish = base_dish_val
    AND (exclude_id IS NULL OR r.id != exclude_id)
  ORDER BY r.published_at DESC
  LIMIT result_limit;
END;
$$;

-- =============================================
-- Update get_recipe_detail to include base_dish
-- =============================================
CREATE OR REPLACE FUNCTION recipi.get_recipe_detail(recipe_slug TEXT)
RETURNS JSON
LANGUAGE plpgsql STABLE
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'recipe', json_build_object(
      'id', r.id,
      'slug', r.slug,
      'title', r.title,
      'description', r.description,
      'introduction', r.introduction,
      'prep_time_minutes', r.prep_time_minutes,
      'cook_time_minutes', r.cook_time_minutes,
      'total_time_minutes', r.total_time_minutes,
      'servings', r.servings,
      'servings_unit', r.servings_unit,
      'difficulty', r.difficulty,
      'calories', r.calories,
      'protein_g', r.protein_g,
      'fat_g', r.fat_g,
      'carbs_g', r.carbs_g,
      'fiber_g', r.fiber_g,
      'sodium_mg', r.sodium_mg,
      'instructions', r.instructions,
      'meta_title', r.meta_title,
      'meta_description', r.meta_description,
      'keywords', r.keywords,
      'cuisine', r.cuisine,
      'course', r.course,
      'tips', r.tips,
      'status', r.status,
      'published_at', r.published_at,
      'featured', r.featured,
      'base_dish', r.base_dish,
      'created_at', r.created_at,
      'updated_at', r.updated_at
    ),
    'ingredients', (
      SELECT json_agg(
        json_build_object(
          'id', ri.id,
          'quantity', ri.quantity,
          'unit', ri.unit,
          'preparation', ri.preparation,
          'is_optional', ri.is_optional,
          'display_order', ri.display_order,
          'group_name', ri.group_name,
          'ingredient', json_build_object(
            'id', ing.id,
            'slug', ing.slug,
            'name', ing.name,
            'name_en', ing.name_en
          )
        ) ORDER BY ri.group_name NULLS FIRST, ri.display_order
      )
      FROM recipi.recipe_ingredients ri
      JOIN recipi.ingredients ing ON ing.id = ri.ingredient_id
      WHERE ri.recipe_id = r.id
    ),
    'images', (
      SELECT json_agg(
        json_build_object(
          'id', img.id,
          'url', img.url,
          'alt_text', img.alt_text,
          'is_hero', img.is_hero
        ) ORDER BY img.is_hero DESC, img.display_order
      )
      FROM recipi.recipe_images img
      WHERE img.recipe_id = r.id
    ),
    'categories', (
      SELECT json_agg(
        json_build_object(
          'id', c.id,
          'slug', c.slug,
          'name', c.name
        )
      )
      FROM recipi.recipe_categories rc
      JOIN recipi.categories c ON c.id = rc.category_id
      WHERE rc.recipe_id = r.id
    ),
    'tags', (
      SELECT json_agg(
        json_build_object(
          'id', t.id,
          'slug', t.slug,
          'name', t.name,
          'category_slug', tc.slug,
          'category_name', tc.name,
          'color', t.color
        ) ORDER BY tc.display_order, t.display_order
      )
      FROM recipi.recipe_tags rt
      JOIN recipi.tags t ON t.id = rt.tag_id
      LEFT JOIN recipi.tag_categories tc ON tc.id = t.tag_category_id
      WHERE rt.recipe_id = r.id
    )
  ) INTO result
  FROM recipi.recipes r
  WHERE r.slug = recipe_slug
    AND r.status = 'published';

  RETURN result;
END;
$$;
