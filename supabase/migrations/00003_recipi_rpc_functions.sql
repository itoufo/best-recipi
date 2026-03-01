-- =============================================
-- Recipi: RPC Functions
-- =============================================

-- search_recipes: PGroonga全文検索
CREATE OR REPLACE FUNCTION recipi.search_recipes(
  query TEXT,
  result_limit INT DEFAULT 20,
  result_offset INT DEFAULT 0
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
  score DOUBLE PRECISION
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
    (pgroonga_score(r.tableoid, r.ctid))::DOUBLE PRECISION AS score
  FROM recipi.recipes r
  LEFT JOIN recipi.recipe_images ri ON ri.recipe_id = r.id AND ri.is_hero = true
  WHERE r.status = 'published'
    AND (
      r.title &@~ query
      OR r.description &@~ query
      OR r.tips &@~ query
    )
  ORDER BY score DESC, r.published_at DESC
  LIMIT result_limit
  OFFSET result_offset;
END;
$$;

-- search_ingredients: 食材検索
CREATE OR REPLACE FUNCTION recipi.search_ingredients(
  query TEXT,
  result_limit INT DEFAULT 20
)
RETURNS TABLE (
  id BIGINT,
  slug TEXT,
  name TEXT,
  name_reading TEXT,
  category TEXT,
  image_url TEXT,
  score DOUBLE PRECISION
)
LANGUAGE plpgsql STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    i.id,
    i.slug,
    i.name,
    i.name_reading,
    i.category,
    i.image_url,
    (pgroonga_score(i.tableoid, i.ctid))::DOUBLE PRECISION AS score
  FROM recipi.ingredients i
  WHERE
    i.name &@~ query
    OR i.name_reading &@~ query
    OR i.description &@~ query
  ORDER BY score DESC
  LIMIT result_limit;
END;
$$;

-- get_recipe_detail: レシピ詳細取得 (JOINs included)
CREATE OR REPLACE FUNCTION recipi.get_recipe_detail(recipe_slug TEXT)
RETURNS JSON
LANGUAGE plpgsql STABLE
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'recipe', row_to_json(r.*),
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
          'name', t.name
        )
      )
      FROM recipi.recipe_tags rt
      JOIN recipi.tags t ON t.id = rt.tag_id
      WHERE rt.recipe_id = r.id
    )
  ) INTO result
  FROM recipi.recipes r
  WHERE r.slug = recipe_slug
    AND r.status = 'published';

  RETURN result;
END;
$$;

-- get_all_recipe_slugs: サイトマップ用
CREATE OR REPLACE FUNCTION recipi.get_all_recipe_slugs()
RETURNS TABLE (slug TEXT, updated_at TIMESTAMPTZ)
LANGUAGE sql STABLE
AS $$
  SELECT r.slug, r.updated_at
  FROM recipi.recipes r
  WHERE r.status = 'published'
  ORDER BY r.published_at DESC;
$$;

-- get_all_ingredient_slugs: サイトマップ用
CREATE OR REPLACE FUNCTION recipi.get_all_ingredient_slugs()
RETURNS TABLE (slug TEXT, updated_at TIMESTAMPTZ)
LANGUAGE sql STABLE
AS $$
  SELECT i.slug, i.updated_at
  FROM recipi.ingredients i
  ORDER BY i.name;
$$;
