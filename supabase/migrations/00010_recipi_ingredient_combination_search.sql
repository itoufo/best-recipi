-- =============================================
-- Recipi: 食材の組み合わせ検索
-- =============================================

-- インデックス: recipe_ingredients の ingredient_id → recipe_id 検索を高速化
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_ingredient_recipe
  ON recipi.recipe_ingredients (ingredient_id, recipe_id);

-- =============================================
-- search_recipes_by_ingredients: 食材IDリストからレシピを検索
-- =============================================
CREATE OR REPLACE FUNCTION recipi.search_recipes_by_ingredients(
  ingredient_ids BIGINT[],
  match_all BOOLEAN DEFAULT false,
  result_limit INT DEFAULT 30
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
  match_count INT,
  total_ingredients INT
)
LANGUAGE plpgsql STABLE
AS $$
BEGIN
  RETURN QUERY
  WITH matched AS (
    SELECT
      ri.recipe_id,
      COUNT(DISTINCT ri.ingredient_id)::INT AS match_count
    FROM recipi.recipe_ingredients ri
    WHERE ri.ingredient_id = ANY(ingredient_ids)
    GROUP BY ri.recipe_id
  ),
  recipe_totals AS (
    SELECT
      m.recipe_id,
      m.match_count,
      COUNT(ri2.id)::INT AS total_ingredients
    FROM matched m
    JOIN recipi.recipe_ingredients ri2 ON ri2.recipe_id = m.recipe_id
    GROUP BY m.recipe_id, m.match_count
  )
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
    img.url AS hero_image_url,
    img.alt_text AS hero_image_alt,
    r.published_at,
    rt.match_count,
    rt.total_ingredients
  FROM recipe_totals rt
  JOIN recipi.recipes r ON r.id = rt.recipe_id
  LEFT JOIN recipi.recipe_images img ON img.recipe_id = r.id AND img.is_hero = true
  WHERE r.status = 'published'
    AND (
      NOT match_all
      OR rt.match_count = array_length(ingredient_ids, 1)
    )
  ORDER BY rt.match_count DESC, r.published_at DESC
  LIMIT result_limit;
END;
$$;

-- =============================================
-- autocomplete_ingredients: 食材オートコンプリート
-- =============================================
CREATE OR REPLACE FUNCTION recipi.autocomplete_ingredients(
  query TEXT,
  result_limit INT DEFAULT 8
)
RETURNS TABLE (
  id BIGINT,
  slug TEXT,
  name TEXT,
  name_reading TEXT,
  category TEXT,
  image_url TEXT
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
    i.image_url
  FROM recipi.ingredients i
  WHERE
    i.name &@~ query
    OR i.name_reading &@~ query
  ORDER BY
    -- 前方一致を優先
    CASE
      WHEN i.name LIKE query || '%' THEN 0
      WHEN i.name_reading LIKE query || '%' THEN 1
      ELSE 2
    END,
    pgroonga_score(i.tableoid, i.ctid) DESC
  LIMIT result_limit;
END;
$$;
