-- =============================================
-- Recipi: Schema & Tables
-- =============================================

CREATE SCHEMA IF NOT EXISTS recipi;

-- =============================================
-- ingredients: 食材マスター
-- =============================================
CREATE TABLE recipi.ingredients (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,               -- 日本語名
  name_reading TEXT,                        -- ひらがな読み
  name_en     TEXT,                         -- 英語名
  description TEXT,
  category    TEXT,                         -- スパイス, きのこ, 野菜, etc.
  origin      TEXT,                         -- 産地
  season      TEXT,                         -- 旬の時期
  storage_tips TEXT,                        -- 保存方法
  image_url   TEXT,
  meta_title  TEXT,
  meta_description TEXT,
  is_niche    BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- categories: レシピカテゴリ
-- =============================================
CREATE TABLE recipi.categories (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  description TEXT,
  image_url   TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- tags: タグ
-- =============================================
CREATE TABLE recipi.tags (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- recipes: レシピ本体
-- =============================================
CREATE TABLE recipi.recipes (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug            TEXT NOT NULL UNIQUE,
  title           TEXT NOT NULL,
  description     TEXT,                    -- 短い説明 (meta description用)
  introduction    TEXT,                    -- 記事冒頭の導入文
  prep_time_minutes  INT,
  cook_time_minutes  INT,
  total_time_minutes INT,
  servings        INT NOT NULL DEFAULT 2,
  servings_unit   TEXT NOT NULL DEFAULT '人前', -- 人前/個/枚
  difficulty      TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  -- 栄養情報 (per serving)
  calories        INT,
  protein_g       NUMERIC(6,1),
  fat_g           NUMERIC(6,1),
  carbs_g         NUMERIC(6,1),
  fiber_g         NUMERIC(6,1),
  sodium_mg       NUMERIC(7,1),
  -- 手順 (JSONB配列)
  instructions    JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- SEO
  meta_title      TEXT,
  meta_description TEXT,
  keywords        TEXT[] DEFAULT '{}',
  -- 分類
  cuisine         TEXT,                    -- 和食, イタリアン, etc.
  course          TEXT,                    -- 前菜, メイン, デザート, etc.
  tips            TEXT,                    -- シェフのコツ
  -- ステータス
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at    TIMESTAMPTZ,
  featured        BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- instructions JSONB format:
-- [
--   { "step": 1, "text": "...", "image_url": "...", "tip": "..." },
--   { "step": 2, "text": "...", "image_url": null, "tip": null }
-- ]

-- =============================================
-- recipe_ingredients: レシピ×食材 (junction)
-- =============================================
CREATE TABLE recipi.recipe_ingredients (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  recipe_id     BIGINT NOT NULL REFERENCES recipi.recipes(id) ON DELETE CASCADE,
  ingredient_id BIGINT NOT NULL REFERENCES recipi.ingredients(id) ON DELETE CASCADE,
  quantity      TEXT,                      -- "2", "1/2", "適量"
  unit          TEXT,                      -- "g", "ml", "大さじ", "本"
  preparation   TEXT,                      -- "みじん切り", "薄切り"
  is_optional   BOOLEAN NOT NULL DEFAULT false,
  display_order INT NOT NULL DEFAULT 0,
  group_name    TEXT,                      -- "ソース用", "トッピング", null=メイン
  UNIQUE (recipe_id, ingredient_id, group_name)
);

-- =============================================
-- recipe_categories: レシピ×カテゴリ (junction)
-- =============================================
CREATE TABLE recipi.recipe_categories (
  recipe_id   BIGINT NOT NULL REFERENCES recipi.recipes(id) ON DELETE CASCADE,
  category_id BIGINT NOT NULL REFERENCES recipi.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (recipe_id, category_id)
);

-- =============================================
-- recipe_tags: レシピ×タグ (junction)
-- =============================================
CREATE TABLE recipi.recipe_tags (
  recipe_id BIGINT NOT NULL REFERENCES recipi.recipes(id) ON DELETE CASCADE,
  tag_id    BIGINT NOT NULL REFERENCES recipi.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (recipe_id, tag_id)
);

-- =============================================
-- recipe_images: レシピ画像
-- =============================================
CREATE TABLE recipi.recipe_images (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  recipe_id   BIGINT NOT NULL REFERENCES recipi.recipes(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  alt_text    TEXT,
  is_hero     BOOLEAN NOT NULL DEFAULT false,
  display_order INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- updated_at trigger
-- =============================================
CREATE OR REPLACE FUNCTION recipi.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ingredients_updated_at
  BEFORE UPDATE ON recipi.ingredients
  FOR EACH ROW EXECUTE FUNCTION recipi.update_updated_at();

CREATE TRIGGER trg_recipes_updated_at
  BEFORE UPDATE ON recipi.recipes
  FOR EACH ROW EXECUTE FUNCTION recipi.update_updated_at();
