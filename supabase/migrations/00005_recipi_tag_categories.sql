-- =============================================
-- Recipi: Tag Categories + Tags Extension
-- =============================================

-- tag_categories テーブル新規作成
CREATE TABLE recipi.tag_categories (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug          TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  description   TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- tags テーブル拡張
ALTER TABLE recipi.tags
  ADD COLUMN tag_category_id BIGINT REFERENCES recipi.tag_categories(id),
  ADD COLUMN description TEXT,
  ADD COLUMN display_order INT NOT NULL DEFAULT 0,
  ADD COLUMN color TEXT;

CREATE INDEX idx_tags_category ON recipi.tags (tag_category_id);

-- =============================================
-- シードデータ: 4カテゴリ × 約6タグ = 24タグ
-- =============================================

INSERT INTO recipi.tag_categories (slug, name, description, display_order) VALUES
  ('taste',   '味の傾向', '甘い、辛い、さっぱりなど味の方向性',   1),
  ('texture', '食感',     'サクサク、もちもちなど食感の特徴',     2),
  ('method',  '調理法',   '炒める、煮る、蒸すなど調理の方法',     3),
  ('scene',   'シーン',   '時短、おもてなし、お弁当など利用シーン', 4);

-- 味の傾向
INSERT INTO recipi.tags (slug, name, tag_category_id, display_order, color) VALUES
  ('sweet',    '甘い',       (SELECT id FROM recipi.tag_categories WHERE slug = 'taste'), 1, '#F59E0B'),
  ('spicy',    '辛い',       (SELECT id FROM recipi.tag_categories WHERE slug = 'taste'), 2, '#EF4444'),
  ('light',    'さっぱり',   (SELECT id FROM recipi.tag_categories WHERE slug = 'taste'), 3, '#06B6D4'),
  ('rich',     'こってり',   (SELECT id FROM recipi.tag_categories WHERE slug = 'taste'), 4, '#D97706'),
  ('sour',     '酸っぱい',   (SELECT id FROM recipi.tag_categories WHERE slug = 'taste'), 5, '#84CC16'),
  ('umami',    'うまみ系',   (SELECT id FROM recipi.tag_categories WHERE slug = 'taste'), 6, '#8B5CF6');

-- 食感
INSERT INTO recipi.tags (slug, name, tag_category_id, display_order, color) VALUES
  ('crispy',   'サクサク',   (SELECT id FROM recipi.tag_categories WHERE slug = 'texture'), 1, '#F97316'),
  ('chewy',    'もちもち',   (SELECT id FROM recipi.tag_categories WHERE slug = 'texture'), 2, '#EC4899'),
  ('creamy',   'とろとろ',   (SELECT id FROM recipi.tag_categories WHERE slug = 'texture'), 3, '#FBBF24'),
  ('crunchy',  'カリカリ',   (SELECT id FROM recipi.tag_categories WHERE slug = 'texture'), 4, '#F59E0B'),
  ('fluffy',   'ふわふわ',   (SELECT id FROM recipi.tag_categories WHERE slug = 'texture'), 5, '#A78BFA');

-- 調理法
INSERT INTO recipi.tags (slug, name, tag_category_id, display_order, color) VALUES
  ('stir-fry', '炒める',     (SELECT id FROM recipi.tag_categories WHERE slug = 'method'), 1, '#EF4444'),
  ('simmer',   '煮る',       (SELECT id FROM recipi.tag_categories WHERE slug = 'method'), 2, '#3B82F6'),
  ('steam',    '蒸す',       (SELECT id FROM recipi.tag_categories WHERE slug = 'method'), 3, '#6EE7B7'),
  ('grill',    '焼く',       (SELECT id FROM recipi.tag_categories WHERE slug = 'method'), 4, '#F97316'),
  ('deep-fry', '揚げる',     (SELECT id FROM recipi.tag_categories WHERE slug = 'method'), 5, '#FBBF24'),
  ('raw',      '生/サラダ',  (SELECT id FROM recipi.tag_categories WHERE slug = 'method'), 6, '#34D399');

-- シーン
INSERT INTO recipi.tags (slug, name, tag_category_id, display_order, color) VALUES
  ('quick',       '時短',         (SELECT id FROM recipi.tag_categories WHERE slug = 'scene'), 1, '#10B981'),
  ('entertaining','おもてなし',   (SELECT id FROM recipi.tag_categories WHERE slug = 'scene'), 2, '#8B5CF6'),
  ('bento',       'お弁当',       (SELECT id FROM recipi.tag_categories WHERE slug = 'scene'), 3, '#F59E0B'),
  ('meal-prep',   '作り置き',     (SELECT id FROM recipi.tag_categories WHERE slug = 'scene'), 4, '#06B6D4'),
  ('diet',        'ダイエット',   (SELECT id FROM recipi.tag_categories WHERE slug = 'scene'), 5, '#84CC16'),
  ('party',       'パーティー',   (SELECT id FROM recipi.tag_categories WHERE slug = 'scene'), 6, '#EC4899');
