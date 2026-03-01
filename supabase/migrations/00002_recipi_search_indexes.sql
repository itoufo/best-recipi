-- =============================================
-- Recipi: Indexes (PGroonga + B-tree)
-- =============================================

-- PGroonga extension (日本語全文検索)
CREATE EXTENSION IF NOT EXISTS pgroonga;

-- PGroonga indexes on recipes
CREATE INDEX idx_recipes_pgroonga_title
  ON recipi.recipes USING pgroonga (title pgroonga_varchar_full_text_search_ops_v2);

CREATE INDEX idx_recipes_pgroonga_description
  ON recipi.recipes USING pgroonga (description pgroonga_varchar_full_text_search_ops_v2);

CREATE INDEX idx_recipes_pgroonga_tips
  ON recipi.recipes USING pgroonga (tips pgroonga_varchar_full_text_search_ops_v2);

-- PGroonga indexes on ingredients
CREATE INDEX idx_ingredients_pgroonga_name
  ON recipi.ingredients USING pgroonga (name pgroonga_varchar_full_text_search_ops_v2);

CREATE INDEX idx_ingredients_pgroonga_reading
  ON recipi.ingredients USING pgroonga (name_reading pgroonga_varchar_full_text_search_ops_v2);

CREATE INDEX idx_ingredients_pgroonga_description
  ON recipi.ingredients USING pgroonga (description pgroonga_varchar_full_text_search_ops_v2);

-- B-tree indexes
CREATE INDEX idx_recipes_slug ON recipi.recipes (slug);
CREATE INDEX idx_recipes_status ON recipi.recipes (status);
CREATE INDEX idx_recipes_published_at ON recipi.recipes (published_at DESC NULLS LAST);
CREATE INDEX idx_recipes_featured ON recipi.recipes (featured) WHERE featured = true;
CREATE INDEX idx_recipes_status_published ON recipi.recipes (status, published_at DESC) WHERE status = 'published';
CREATE INDEX idx_recipes_cuisine ON recipi.recipes (cuisine);
CREATE INDEX idx_recipes_course ON recipi.recipes (course);

CREATE INDEX idx_ingredients_slug ON recipi.ingredients (slug);
CREATE INDEX idx_ingredients_category ON recipi.ingredients (category);
CREATE INDEX idx_ingredients_is_niche ON recipi.ingredients (is_niche) WHERE is_niche = true;

CREATE INDEX idx_recipe_ingredients_recipe ON recipi.recipe_ingredients (recipe_id);
CREATE INDEX idx_recipe_ingredients_ingredient ON recipi.recipe_ingredients (ingredient_id);

CREATE INDEX idx_recipe_images_recipe ON recipi.recipe_images (recipe_id);
CREATE INDEX idx_recipe_images_hero ON recipi.recipe_images (recipe_id) WHERE is_hero = true;

CREATE INDEX idx_categories_slug ON recipi.categories (slug);
CREATE INDEX idx_tags_slug ON recipi.tags (slug);
