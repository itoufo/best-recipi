-- =============================================
-- Recipi: RLS Policies for new tables
-- =============================================

-- tag_categories: public read
ALTER TABLE recipi.tag_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read tag_categories"
  ON recipi.tag_categories FOR SELECT
  TO anon, authenticated
  USING (true);

-- user_profiles: own row CRUD
ALTER TABLE recipi.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON recipi.user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON recipi.user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON recipi.user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- user_favorites: own rows SELECT/INSERT/DELETE
ALTER TABLE recipi.user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites"
  ON recipi.user_favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
  ON recipi.user_favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove favorites"
  ON recipi.user_favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- user_preferences: own rows ALL
ALTER TABLE recipi.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON recipi.user_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add preferences"
  ON recipi.user_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove preferences"
  ON recipi.user_preferences FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
