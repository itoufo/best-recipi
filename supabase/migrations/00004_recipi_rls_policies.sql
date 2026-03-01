-- =============================================
-- Recipi: Row Level Security Policies
-- =============================================

-- Enable RLS on all tables
ALTER TABLE recipi.ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipi.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipi.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipi.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipi.recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipi.recipe_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipi.recipe_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipi.recipe_images ENABLE ROW LEVEL SECURITY;

-- Public read: ingredients, categories, tags (all rows)
CREATE POLICY "Public read ingredients"
  ON recipi.ingredients FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public read categories"
  ON recipi.categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public read tags"
  ON recipi.tags FOR SELECT
  TO anon, authenticated
  USING (true);

-- Public read: recipes (published only)
CREATE POLICY "Public read published recipes"
  ON recipi.recipes FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

-- Public read: junction tables (follow parent recipe visibility)
CREATE POLICY "Public read recipe_ingredients"
  ON recipi.recipe_ingredients FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recipi.recipes r
      WHERE r.id = recipe_id AND r.status = 'published'
    )
  );

CREATE POLICY "Public read recipe_categories"
  ON recipi.recipe_categories FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recipi.recipes r
      WHERE r.id = recipe_id AND r.status = 'published'
    )
  );

CREATE POLICY "Public read recipe_tags"
  ON recipi.recipe_tags FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recipi.recipes r
      WHERE r.id = recipe_id AND r.status = 'published'
    )
  );

CREATE POLICY "Public read recipe_images"
  ON recipi.recipe_images FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recipi.recipes r
      WHERE r.id = recipe_id AND r.status = 'published'
    )
  );

-- service_role bypasses RLS by default, no explicit policies needed
-- This allows the content generation scripts to write freely
