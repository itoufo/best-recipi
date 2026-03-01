-- =============================================
-- Recipi: Update get_recipe_detail to include tag category info
-- =============================================

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
