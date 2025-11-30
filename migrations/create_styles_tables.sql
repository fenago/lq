-- LiquidBooks: Writing Styles System
-- Migration: Create styles tables
-- Version: 1.0.0
-- Based on styles_prd.md specifications

-- =====================================================
-- 1. Style Categories Table
-- =====================================================
CREATE TABLE IF NOT EXISTS style_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  parent_id UUID REFERENCES style_categories(id),
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. Author Styles Table (104+ styles)
-- =====================================================
CREATE TABLE IF NOT EXISTS author_styles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES style_categories(id),

  -- Basic Info
  style_id TEXT UNIQUE NOT NULL, -- e.g., 'acad-text-001'
  name TEXT NOT NULL,           -- e.g., 'The Feynman Style'
  author TEXT NOT NULL,         -- e.g., 'Richard Feynman'
  era TEXT CHECK (era IN ('classic', 'modern')),

  -- Attributes (JSONB for flexibility)
  tone_config JSONB NOT NULL DEFAULT '{}',
  /*
    Example tone_config:
    {
      "primary": "conversational",
      "secondary": "playful",
      "intensity": 8,
      "formality": 4,
      "warmth": 9,
      "humor": 6,
      "authority": 8,
      "empathy": 7,
      "directness": 8
    }
  */

  structure_config JSONB NOT NULL DEFAULT '{}',
  /*
    Example structure_config:
    {
      "type": "spiral",
      "chapterLength": "medium",
      "sectionDensity": 5,
      "usesEpigraphs": false,
      "usesCallouts": true,
      "usesSummaries": true,
      "usesExercises": true,
      "usesCaseStudies": false,
      "usesStories": true
    }
  */

  interactivity_config JSONB NOT NULL DEFAULT '{}',
  /*
    Example interactivity_config:
    {
      "level": 8,
      "codeExecution": true,
      "quizzes": true,
      "exercises": true,
      "simulations": true,
      "interactionsPerChapter": 8
    }
  */

  visual_config JSONB NOT NULL DEFAULT '{}',
  /*
    Example visual_config:
    {
      "level": 6,
      "diagramsPerChapter": 4,
      "imagesPerChapter": 2,
      "mermaidDiagrams": true,
      "colorScheme": "moderate"
    }
  */

  reading_level_config JSONB NOT NULL DEFAULT '{}',
  /*
    Example reading_level_config:
    {
      "targetGrade": 13,
      "fleschKincaid": 45,
      "vocabularyLevel": "intermediate",
      "avgSentenceLength": 18
    }
  */

  -- Content
  description TEXT,
  style_description TEXT,
  sample_excerpt TEXT,
  influences TEXT[],
  best_for TEXT[],

  -- System Prompt
  system_prompt TEXT NOT NULL,
  prompt_variables JSONB,

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. Copywriting Frameworks Table
-- =====================================================
CREATE TABLE IF NOT EXISTS copywriting_frameworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT,
  key_principle TEXT,

  -- Implementation
  system_prompt_addition TEXT NOT NULL,
  implementation JSONB,
  /*
    Example implementation:
    {
      "stages": ["Attention", "Interest", "Desire", "Action"],
      "techniques": ["Headlines", "Storytelling", "Social proof"]
    }
  */
  application_areas TEXT[],

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. User Custom Styles Table
-- =====================================================
CREATE TABLE IF NOT EXISTS user_styles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Can be based on existing style or fully custom
  base_style_id UUID REFERENCES author_styles(id),

  -- Override configurations
  name TEXT NOT NULL,
  tone_overrides JSONB,
  structure_overrides JSONB,
  interactivity_overrides JSONB,
  visual_overrides JSONB,
  reading_level_overrides JSONB,

  -- Custom prompt additions
  custom_prompt_additions TEXT,

  -- Frameworks
  framework_ids UUID[],

  -- Style mixing (blend multiple authors)
  mixed_styles JSONB,
  /*
    Example mixed_styles:
    {
      "styles": [
        {"style_id": "uuid1", "weight": 0.6},
        {"style_id": "uuid2", "weight": 0.4}
      ]
    }
  */

  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. Book Analytics Table
-- =====================================================
CREATE TABLE IF NOT EXISTS book_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Metrics (JSONB for flexibility)
  content_metrics JSONB,
  /*
    Example content_metrics:
    {
      "totalWords": 45000,
      "chapters": 12,
      "avgWordsPerChapter": 3750,
      "readingTime": 150
    }
  */

  readability_metrics JSONB,
  /*
    Example readability_metrics:
    {
      "fleschKincaid": 8.2,
      "smog": 10.1,
      "avgSentenceLength": 16,
      "avgWordLength": 4.8
    }
  */

  engagement_metrics JSONB,
  structure_metrics JSONB,
  style_compliance JSONB,
  technical_metrics JSONB,
  interactive_metrics JSONB,

  -- Summary
  health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100),
  recommendations JSONB,

  analyzed_at TIMESTAMPTZ DEFAULT NOW(),
  book_version TEXT
);

-- =====================================================
-- 6. Analytics History Table
-- =====================================================
CREATE TABLE IF NOT EXISTS analytics_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL,
  analytics_id UUID REFERENCES book_analytics(id) ON DELETE CASCADE,

  -- Key metrics for trending
  word_count INTEGER,
  readability_score NUMERIC(5,2),
  style_compliance_score NUMERIC(5,2),
  health_score INTEGER,

  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. Indexes for Performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_style_categories_parent ON style_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_style_categories_slug ON style_categories(slug);
CREATE INDEX IF NOT EXISTS idx_author_styles_category ON author_styles(category_id);
CREATE INDEX IF NOT EXISTS idx_author_styles_era ON author_styles(era);
CREATE INDEX IF NOT EXISTS idx_author_styles_style_id ON author_styles(style_id);
CREATE INDEX IF NOT EXISTS idx_user_styles_user ON user_styles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_styles_base ON user_styles(base_style_id);
CREATE INDEX IF NOT EXISTS idx_book_analytics_book ON book_analytics(book_id);
CREATE INDEX IF NOT EXISTS idx_book_analytics_user ON book_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_history_book ON analytics_history(book_id);

-- =====================================================
-- 8. Row Level Security Policies
-- =====================================================

-- Style Categories: Read-only for all authenticated users
ALTER TABLE style_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Style categories viewable by all" ON style_categories
  FOR SELECT USING (true);

-- Author Styles: Read-only for all authenticated users
ALTER TABLE author_styles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Author styles viewable by all" ON author_styles
  FOR SELECT USING (is_active = true);

-- Copywriting Frameworks: Read-only for all authenticated users
ALTER TABLE copywriting_frameworks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Frameworks viewable by all" ON copywriting_frameworks
  FOR SELECT USING (is_active = true);

-- User Styles: Users can only access their own
ALTER TABLE user_styles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own styles" ON user_styles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own styles" ON user_styles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own styles" ON user_styles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own styles" ON user_styles
  FOR DELETE USING (auth.uid() = user_id);

-- Book Analytics: Users can only access their own
ALTER TABLE book_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own analytics" ON book_analytics
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analytics" ON book_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Analytics History: Users can only access their own (through book_analytics)
ALTER TABLE analytics_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own history" ON analytics_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM book_analytics ba
      WHERE ba.id = analytics_history.analytics_id
      AND ba.user_id = auth.uid()
    )
  );

-- =====================================================
-- 9. Seed Data: Categories
-- =====================================================
INSERT INTO style_categories (name, slug, description, icon, sort_order) VALUES
  ('Academic & Educational', 'academic_educational', 'Textbooks, technical writing, and educational content', 'academic', 1),
  ('Children''s Books', 'childrens_books', 'Books for young readers from board books to YA', 'child', 2),
  ('Fiction', 'fiction', 'Novels and storytelling across all genres', 'book', 3),
  ('Non-Fiction', 'non_fiction', 'Biographies, self-help, business, and more', 'document', 4)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- 10. Seed Data: Copywriting Frameworks
-- =====================================================
INSERT INTO copywriting_frameworks (name, author, description, key_principle, system_prompt_addition, implementation, application_areas) VALUES
  ('Schwartz Awareness Levels', 'Eugene Schwartz', 'Match messaging to reader''s awareness level', 'Meet the reader where they are',
   'Identify the reader''s current awareness level and adjust content accordingly: Unaware (educate about problem), Problem-Aware (validate pain), Solution-Aware (differentiate approach), Product-Aware (overcome objections), Most Aware (direct call to action).',
   '{"levels": ["Unaware", "Problem-Aware", "Solution-Aware", "Product-Aware", "Most Aware"]}',
   ARRAY['Marketing', 'Sales pages', 'Educational content']),

  ('Cialdini''s Principles', 'Robert Cialdini', 'Six principles of persuasion', 'Ethical influence through psychology',
   'Apply persuasion principles where appropriate: Reciprocity (give value first), Commitment (small yeses), Social Proof (others doing it), Authority (expert credibility), Liking (relatable voice), Scarcity (limited availability).',
   '{"principles": ["Reciprocity", "Commitment", "Social Proof", "Authority", "Liking", "Scarcity"]}',
   ARRAY['Marketing', 'Business writing', 'Persuasive content']),

  ('AIDA Framework', 'E. St. Elmo Lewis', 'Classic marketing funnel', 'Guide through buying journey',
   'Structure content using AIDA: Attention (compelling hook), Interest (engage with benefits), Desire (emotional connection), Action (clear next step).',
   '{"stages": ["Attention", "Interest", "Desire", "Action"]}',
   ARRAY['Marketing', 'Sales', 'Landing pages']),

  ('PAS Formula', 'Dan Kennedy', 'Problem-focused persuasion', 'Agitate before solving',
   'Apply PAS structure: Problem (identify specific pain), Agitation (make it vivid and urgent), Solution (present your answer as relief).',
   '{"stages": ["Problem", "Agitation", "Solution"]}',
   ARRAY['Sales copy', 'Email marketing', 'Problem-solution content']),

  ('StoryBrand Framework', 'Donald Miller', 'Hero''s journey for marketing', 'Customer is the hero',
   'Position content using StoryBrand: Character (reader as hero with a want), Problem (external, internal, philosophical), Guide (you as mentor with empathy and authority), Plan (clear steps), Call to Action (direct ask), Success (transformation), Failure (stakes).',
   '{"elements": ["Character", "Problem", "Guide", "Plan", "Call to Action", "Success", "Failure"]}',
   ARRAY['Brand messaging', 'Marketing', 'Business content']),

  ('Sugarman Triggers', 'Joseph Sugarman', 'Psychological triggers for compelling copy', 'Create curiosity and momentum',
   'Incorporate psychological triggers: Curiosity (open loops), Storytelling (narrative engagement), Authority (credibility signals), Proof (evidence and testimonials), Greed (value proposition), Exclusivity (special access).',
   '{"triggers": ["Curiosity", "Storytelling", "Authority", "Proof", "Greed", "Exclusivity"]}',
   ARRAY['Direct response', 'Sales copy', 'Advertising']),

  ('Emotional Triggers', 'Drew Eric Whitman', 'Eight core desires', 'Tap into fundamental drives',
   'Address fundamental desires: Survival (safety, security), Food (nourishment, comfort), Freedom (independence, control), Sexual (attraction, reproduction), Comfort (pleasure, ease), Superiority (status, winning), Care (protect loved ones), Social Approval (belonging, acceptance).',
   '{"desires": ["Survival", "Food", "Freedom", "Sexual", "Comfort", "Superiority", "Care", "Social Approval"]}',
   ARRAY['Advertising', 'Marketing', 'Persuasive content']),

  ('Breakthrough Advertising', 'Eugene Schwartz', 'Advanced copywriting principles', 'Channel existing desire',
   'Apply advanced principles: Mass Desire (tap existing want), State of Awareness (meet reader level), Market Sophistication (differentiation stage), Headline Mastery (first impression power).',
   '{"concepts": ["Mass Desire", "State of Awareness", "Sophistication", "Headlines"]}',
   ARRAY['Advanced copywriting', 'Marketing strategy', 'Campaign development'])
ON CONFLICT DO NOTHING;

-- =====================================================
-- 11. Updated_at Trigger Function
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_author_styles_updated_at
  BEFORE UPDATE ON author_styles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_styles_updated_at
  BEFORE UPDATE ON user_styles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
