-- =============================================
-- Recipi: New RPC Functions for tag-based queries
-- =============================================

-- get_recipes_by_tags: タグ一致数順にレシピを取得
CREATE OR REPLACE FUNCTION recipi.get_recipes_by_tags(
  tag_ids BIGINT[],
  exclude_recipe_id BIGINT DEFAULT NULL,
  result_limit INT DEFAULT 12
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
  match_count BIGINT
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
    COUNT(rt.tag_id) AS match_count
  FROM recipi.recipes r
  JOIN recipi.recipe_tags rt ON rt.recipe_id = r.id
  LEFT JOIN recipi.recipe_images ri ON ri.recipe_id = r.id AND ri.is_hero = true
  WHERE r.status = 'published'
    AND rt.tag_id = ANY(tag_ids)
    AND (exclude_recipe_id IS NULL OR r.id != exclude_recipe_id)
  GROUP BY r.id, r.slug, r.title, r.description,
    r.total_time_minutes, r.servings, r.servings_unit,
    r.difficulty, r.cuisine, r.course,
    ri.url, ri.alt_text, r.published_at
  ORDER BY match_count DESC, r.published_at DESC
  LIMIT result_limit;
END;
$$;

-- get_recommended_recipes: 好みタグからおすすめレシピを取得
CREATE OR REPLACE FUNCTION recipi.get_recommended_recipes(
  user_tag_ids BIGINT[],
  result_limit INT DEFAULT 12
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
  match_count BIGINT
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
    COUNT(rt.tag_id) AS match_count
  FROM recipi.recipes r
  JOIN recipi.recipe_tags rt ON rt.recipe_id = r.id
  LEFT JOIN recipi.recipe_images ri ON ri.recipe_id = r.id AND ri.is_hero = true
  WHERE r.status = 'published'
    AND rt.tag_id = ANY(user_tag_ids)
  GROUP BY r.id, r.slug, r.title, r.description,
    r.total_time_minutes, r.servings, r.servings_unit,
    r.difficulty, r.cuisine, r.course,
    ri.url, ri.alt_text, r.published_at
  ORDER BY match_count DESC, r.published_at DESC
  LIMIT result_limit;
END;
$$;

-- sync_guest_favorites: ゲスト→認証マージ
CREATE OR REPLACE FUNCTION recipi.sync_guest_favorites(
  p_user_id UUID,
  p_recipe_ids BIGINT[]
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO recipi.user_favorites (user_id, recipe_id)
  SELECT p_user_id, unnest(p_recipe_ids)
  ON CONFLICT (user_id, recipe_id) DO NOTHING;
END;
$$;

-- sync_guest_preferences: ゲスト→認証マージ
CREATE OR REPLACE FUNCTION recipi.sync_guest_preferences(
  p_user_id UUID,
  p_tag_ids BIGINT[]
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO recipi.user_preferences (user_id, tag_id)
  SELECT p_user_id, unnest(p_tag_ids)
  ON CONFLICT (user_id, tag_id) DO NOTHING;
END;
$$;

-- get_all_tag_slugs: サイトマップ用
CREATE OR REPLACE FUNCTION recipi.get_all_tag_slugs()
RETURNS TABLE (slug TEXT)
LANGUAGE sql STABLE
AS $$
  SELECT t.slug
  FROM recipi.tags t
  WHERE t.tag_category_id IS NOT NULL
  ORDER BY t.display_order;
$$;
