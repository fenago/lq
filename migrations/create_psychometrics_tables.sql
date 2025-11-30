-- LiquidBooks: Author Psychometric Profiling System
-- Migration: Create psychometrics tables
-- Version: 1.0.0
-- Based on psychometrics.md specifications (299 data points across 22 categories)

-- =====================================================
-- 1. Psychometric Categories Table
-- =====================================================
CREATE TABLE IF NOT EXISTS psychometric_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  collection_method TEXT CHECK (collection_method IN ('questionnaire', 'conversation', 'automated')),
  data_points INTEGER NOT NULL,
  time_estimate TEXT,
  description TEXT,
  phase INTEGER DEFAULT 1, -- 1=Quick Start, 2=Deep Dive, 3=Conversation, 4=Enrichment
  sort_order INTEGER DEFAULT 0,
  is_required BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. Assessment Questions Table
-- =====================================================
CREATE TABLE IF NOT EXISTS assessment_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES psychometric_categories(id) ON DELETE CASCADE,

  question_text TEXT NOT NULL,
  question_type TEXT CHECK (question_type IN ('scale', 'choice', 'text', 'ranking')),
  field_name TEXT UNIQUE NOT NULL, -- e.g., 'openness_fantasy', 'consc_order'

  -- Scale options
  scale_min INTEGER DEFAULT 1,
  scale_max INTEGER DEFAULT 7,
  scale_labels JSONB, -- e.g., {"1": "Strongly Disagree", "7": "Strongly Agree"}

  -- Choice options
  options JSONB, -- e.g., ["Visual", "Auditory", "Kinesthetic"]

  -- Metadata
  help_text TEXT,
  what_it_captures TEXT,
  writing_correlation TEXT,
  sort_order INTEGER DEFAULT 0,
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. User Psychometric Profiles Table
-- =====================================================
CREATE TABLE IF NOT EXISTS user_psychometric_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- Profile Status
  completion_percentage INTEGER DEFAULT 0,
  phases_completed INTEGER[] DEFAULT '{}',
  last_updated_category UUID REFERENCES psychometric_categories(id),

  -- Big Five (OCEAN) - 30 data points
  big_five JSONB DEFAULT '{}',
  /*
    {
      "openness": {
        "fantasy": 75, "aesthetics": 80, "feelings": 65,
        "actions": 70, "ideas": 85, "values": 60
      },
      "conscientiousness": {...},
      "extraversion": {...},
      "agreeableness": {...},
      "neuroticism": {...}
    }
  */

  -- Cognitive Style - 12 data points
  cognitive_style JSONB DEFAULT '{}',
  /*
    {
      "visual_verbal": 65, "analytic_intuitive": 45,
      "big_picture_detail": 70, "sequential_global": 55,
      "learning_preference": "visual", ...
    }
  */

  -- Emotional Intelligence - 15 data points
  emotional_intelligence JSONB DEFAULT '{}',
  /*
    {
      "self_awareness": 75, "self_regulation": 70,
      "motivation": 80, "empathy": 85, "social_skills": 65
    }
  */

  -- DISC Profile - 8 data points
  disc_profile JSONB DEFAULT '{}',
  /*
    {
      "dominance": 45, "influence": 70,
      "steadiness": 60, "conscientiousness": 55,
      "primary_style": "I", "secondary_style": "S"
    }
  */

  -- Values & Motivations - 12 data points
  values_motivations JSONB DEFAULT '{}',
  /*
    {
      "achievement": 75, "benevolence": 80, "conformity": 45,
      "hedonism": 55, "power": 40, "security": 65,
      "self_direction": 85, "stimulation": 60, "tradition": 35,
      "universalism": 70, "primary_values": ["self_direction", "benevolence"]
    }
  */

  -- VIA Character Strengths - 24 data points
  character_strengths JSONB DEFAULT '{}',
  /*
    {
      "creativity": 85, "curiosity": 90, "judgment": 75,
      "love_of_learning": 80, "perspective": 70,
      "bravery": 65, "perseverance": 75, "honesty": 85,
      "zest": 60, "love": 70, "kindness": 80, "social_intelligence": 75,
      "teamwork": 65, "fairness": 80, "leadership": 60,
      "forgiveness": 70, "humility": 65, "prudence": 55,
      "self_regulation": 60, "appreciation_beauty": 75,
      "gratitude": 80, "hope": 70, "humor": 85, "spirituality": 50,
      "signature_strengths": ["curiosity", "creativity", "humor"]
    }
  */

  -- Enneagram - 6 data points
  enneagram JSONB DEFAULT '{}',
  /*
    {
      "type": 5, "wing": 4, "tritype": "549",
      "instinct": "sp", "growth_direction": 8, "stress_direction": 7
    }
  */

  -- Creativity Profile - 8 data points
  creativity_profile JSONB DEFAULT '{}',
  /*
    {
      "divergent_thinking": 80, "risk_tolerance": 65,
      "novelty_preference": 75, "elaboration": 70,
      "creative_style": "innovator", ...
    }
  */

  -- Thinking Style - 10 data points
  thinking_style JSONB DEFAULT '{}',
  /*
    {
      "critical_thinking": 75, "systems_thinking": 80,
      "creative_thinking": 85, "analytical": 70,
      "practical": 65, "metacognitive": 75, ...
    }
  */

  -- Writing Preferences - 25 data points
  writing_preferences JSONB DEFAULT '{}',
  /*
    {
      "sentence_length": "medium", "vocabulary_complexity": "advanced",
      "formality": 6, "metaphor_usage": 8, "direct_address": 7,
      "paragraph_length": "medium", "passive_voice": 3,
      "preferred_structures": ["narrative", "problem-solution"], ...
    }
  */

  -- LIWC Metrics - 8 data points (from sample analysis)
  liwc_metrics JSONB DEFAULT '{}',
  /*
    {
      "analytical_thinking": 75, "clout": 65,
      "authenticity": 80, "emotional_tone": 70,
      "i_words": 5.2, "we_words": 2.1,
      "cognitive_words": 12.5, "social_words": 8.3
    }
  */

  -- Reasoning Patterns - 6 data points
  reasoning_patterns JSONB DEFAULT '{}',
  /*
    {
      "deductive_inductive": 60, "evidence_preference": "empirical",
      "argument_style": "socratic", "logical_fallacy_awareness": 75,
      "complexity_preference": "moderate", "certainty_language": 40
    }
  */

  -- === CONVERSATION-BASED DATA (Categories 13-22) ===

  -- Life Experience & Background - 20 data points
  life_experience JSONB DEFAULT '{}',
  /*
    {
      "formative_events": ["event1", "event2"],
      "cultural_background": "...",
      "education_path": "...",
      "career_journey": "...",
      "life_philosophy_origin": "..."
    }
  */

  -- Intellectual Influences - 15 data points
  intellectual_influences JSONB DEFAULT '{}',
  /*
    {
      "key_thinkers": ["Feynman", "Sagan"],
      "influential_books": ["book1", "book2"],
      "philosophical_traditions": ["pragmatism"],
      "fields_of_interest": ["physics", "writing"]
    }
  */

  -- Emotional Landscape (Deep) - 18 data points
  emotional_landscape JSONB DEFAULT '{}',
  /*
    {
      "emotional_triggers": ["injustice", "beauty"],
      "processing_style": "reflective",
      "resonant_themes": ["connection", "discovery"],
      "vulnerability_areas": ["..."],
      "emotional_vocabulary": ["..."]
    }
  */

  -- Relationship Patterns - 12 data points
  relationship_patterns JSONB DEFAULT '{}',
  /*
    {
      "attachment_style": "secure",
      "interpersonal_dynamics": "...",
      "dialogue_style": "collaborative",
      "conflict_approach": "..."
    }
  */

  -- Worldview & Beliefs - 15 data points
  worldview_beliefs JSONB DEFAULT '{}',
  /*
    {
      "human_nature_view": "optimistic",
      "meaning_source": ["connection", "growth"],
      "ethical_framework": "virtue ethics",
      "metaphysical_beliefs": "...",
      "social_philosophy": "..."
    }
  */

  -- Sensory & Aesthetic Preferences - 12 data points
  sensory_aesthetic JSONB DEFAULT '{}',
  /*
    {
      "dominant_sense": "visual",
      "aesthetic_preferences": ["minimalist", "natural"],
      "sensory_details_usage": 7,
      "color_associations": "..."
    }
  */

  -- Humor & Play Profile - 8 data points
  humor_play JSONB DEFAULT '{}',
  /*
    {
      "humor_style": "wit",
      "playfulness": 7,
      "humor_timing": "strategic",
      "humor_topics": ["absurdity", "wordplay"]
    }
  */

  -- Communication Quirks - 10 data points
  communication_quirks JSONB DEFAULT '{}',
  /*
    {
      "verbal_tics": ["you know", "essentially"],
      "favorite_phrases": ["..."],
      "filler_words": ["..."],
      "unique_expressions": ["..."]
    }
  */

  -- Creative Process - 10 data points
  creative_process JSONB DEFAULT '{}',
  /*
    {
      "creative_rituals": ["morning writing"],
      "inspiration_sources": ["nature", "conversations"],
      "creative_blocks": "...",
      "flow_triggers": ["..."]
    }
  */

  -- Sample Writing Analysis - 15 data points (automated)
  writing_analysis JSONB DEFAULT '{}',
  /*
    {
      "voice_markers": ["..."],
      "sentence_patterns": {"avg_length": 18, "variation": 0.3},
      "vocabulary_fingerprint": {...},
      "stylistic_signatures": ["..."]
    }
  */

  -- Metadata
  profile_version TEXT DEFAULT '1.0',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. User Assessment Responses Table
-- =====================================================
CREATE TABLE IF NOT EXISTS user_assessment_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES psychometric_categories(id) ON DELETE CASCADE,
  question_id UUID REFERENCES assessment_questions(id) ON DELETE CASCADE,

  -- Response data
  response_value INTEGER, -- For scale questions
  response_text TEXT, -- For text questions
  response_choice TEXT, -- For choice questions
  response_ranking INTEGER[], -- For ranking questions

  -- Context
  response_time_seconds INTEGER,
  confidence_level INTEGER CHECK (confidence_level >= 1 AND confidence_level <= 5),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, question_id)
);

-- =====================================================
-- 5. Conversation Sessions Table
-- =====================================================
CREATE TABLE IF NOT EXISTS conversation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Session data
  session_type TEXT CHECK (session_type IN ('voice', 'text', 'hybrid')),
  duration_seconds INTEGER,

  -- Transcript and analysis
  transcript TEXT,
  audio_url TEXT,

  -- Extracted data points
  extracted_data JSONB,
  /*
    {
      "life_experience": {...},
      "intellectual_influences": {...},
      "emotional_landscape": {...},
      ...
    }
  */

  -- AI analysis
  ai_summary TEXT,
  confidence_scores JSONB,

  -- Status
  status TEXT CHECK (status IN ('in_progress', 'completed', 'analyzed', 'failed')),

  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  analyzed_at TIMESTAMPTZ
);

-- =====================================================
-- 6. Writing Samples Table
-- =====================================================
CREATE TABLE IF NOT EXISTS writing_samples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Sample data
  title TEXT,
  content TEXT NOT NULL,
  word_count INTEGER,
  sample_type TEXT CHECK (sample_type IN ('uploaded', 'generated', 'book_excerpt')),
  source_url TEXT,

  -- Analysis results
  analysis_results JSONB,
  /*
    {
      "readability_scores": {...},
      "vocabulary_analysis": {...},
      "sentence_patterns": {...},
      "voice_markers": [...],
      "stylistic_signatures": {...}
    }
  */

  -- Status
  is_analyzed BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  analyzed_at TIMESTAMPTZ
);

-- =====================================================
-- 7. Profile Generation Prompts Table
-- =====================================================
CREATE TABLE IF NOT EXISTS profile_generation_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES user_psychometric_profiles(id) ON DELETE CASCADE,

  -- Generated prompt
  system_prompt TEXT NOT NULL,
  user_prompt_template TEXT,

  -- Prompt metadata
  prompt_version TEXT DEFAULT '1.0',
  included_categories TEXT[],

  -- Usage tracking
  times_used INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 8. Indexes for Performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_psychometric_categories_phase ON psychometric_categories(phase);
CREATE INDEX IF NOT EXISTS idx_psychometric_categories_method ON psychometric_categories(collection_method);
CREATE INDEX IF NOT EXISTS idx_assessment_questions_category ON assessment_questions(category_id);
CREATE INDEX IF NOT EXISTS idx_assessment_questions_field ON assessment_questions(field_name);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user ON user_psychometric_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_responses_user ON user_assessment_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_responses_category ON user_assessment_responses(category_id);
CREATE INDEX IF NOT EXISTS idx_conversation_sessions_user ON conversation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_sessions_status ON conversation_sessions(status);
CREATE INDEX IF NOT EXISTS idx_writing_samples_user ON writing_samples(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_prompts_user ON profile_generation_prompts(user_id);

-- =====================================================
-- 9. Row Level Security Policies
-- =====================================================

-- Psychometric Categories: Read-only for all
ALTER TABLE psychometric_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories viewable by all" ON psychometric_categories
  FOR SELECT USING (true);

-- Assessment Questions: Read-only for all
ALTER TABLE assessment_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Questions viewable by all" ON assessment_questions
  FOR SELECT USING (true);

-- User Profiles: Users can only access their own
ALTER TABLE user_psychometric_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON user_psychometric_profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON user_psychometric_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON user_psychometric_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- User Responses: Users can only access their own
ALTER TABLE user_assessment_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own responses" ON user_assessment_responses
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own responses" ON user_assessment_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own responses" ON user_assessment_responses
  FOR UPDATE USING (auth.uid() = user_id);

-- Conversation Sessions: Users can only access their own
ALTER TABLE conversation_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own sessions" ON conversation_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON conversation_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON conversation_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Writing Samples: Users can only access their own
ALTER TABLE writing_samples ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own samples" ON writing_samples
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own samples" ON writing_samples
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own samples" ON writing_samples
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own samples" ON writing_samples
  FOR DELETE USING (auth.uid() = user_id);

-- Profile Prompts: Users can only access their own
ALTER TABLE profile_generation_prompts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own prompts" ON profile_generation_prompts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own prompts" ON profile_generation_prompts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own prompts" ON profile_generation_prompts
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- 10. Seed Data: Categories (22 categories, 299 data points)
-- =====================================================
INSERT INTO psychometric_categories (name, slug, collection_method, data_points, time_estimate, description, phase, sort_order, is_required) VALUES
  -- Questionnaire-based (164 data points)
  ('Big Five Personality (OCEAN)', 'big_five', 'questionnaire', 30, '5-7 min', 'The most scientifically validated personality model. Measures Openness, Conscientiousness, Extraversion, Agreeableness, and Neuroticism with 6 facets each.', 1, 1, true),
  ('Cognitive Style', 'cognitive_style', 'questionnaire', 12, '2-3 min', 'How you process information, learn new concepts, and approach problem-solving.', 2, 2, false),
  ('Emotional Intelligence (EQ)', 'emotional_intelligence', 'questionnaire', 15, '3-4 min', 'Your ability to recognize, understand, and manage emotions in yourself and others.', 2, 3, false),
  ('Communication Style (DISC)', 'disc', 'questionnaire', 8, '2 min', 'Your dominant communication style: Dominance, Influence, Steadiness, or Conscientiousness.', 1, 4, true),
  ('Values & Motivations', 'values', 'questionnaire', 12, '2-3 min', 'Your core values and what motivates you, based on Schwartz''s Theory.', 2, 5, false),
  ('Character Strengths (VIA)', 'via_strengths', 'questionnaire', 24, '4-5 min', 'Your signature character strengths from the VIA Classification.', 4, 6, false),
  ('Enneagram Profile', 'enneagram', 'questionnaire', 6, '2 min', 'Your Enneagram type and wing, revealing core motivations and fears.', 4, 7, false),
  ('Creativity Profile', 'creativity', 'questionnaire', 8, '2 min', 'Your creative style and preferences including divergent thinking and risk tolerance.', 4, 8, false),
  ('Thinking Style', 'thinking_style', 'questionnaire', 10, '2 min', 'How you approach reasoning and problem-solving.', 2, 9, false),
  ('Writing Preferences', 'writing_preferences', 'questionnaire', 25, '3-4 min', 'Your preferences for sentence length, vocabulary, formality, and stylistic choices.', 1, 10, true),
  ('LIWC Metrics', 'liwc', 'automated', 8, 'Automated', 'Linguistic analysis of your writing samples including word categories and emotional tone.', 1, 11, false),
  ('Reasoning Patterns', 'reasoning', 'questionnaire', 6, '1-2 min', 'How you build arguments and reach conclusions.', 2, 12, false),

  -- Conversation-based (135 data points)
  ('Life Experience & Background', 'life_experience', 'conversation', 20, '2 min', 'Your formative experiences, cultural background, and key life events.', 3, 13, false),
  ('Intellectual Influences', 'intellectual_influences', 'conversation', 15, '1.5 min', 'Thinkers, books, and ideas that shaped your worldview.', 3, 14, false),
  ('Emotional Landscape (Deep)', 'emotional_landscape', 'conversation', 18, '1.5 min', 'Your emotional triggers, processing style, and resonant themes.', 3, 15, false),
  ('Relationship Patterns', 'relationship_patterns', 'conversation', 12, '1 min', 'How you relate to others and your interpersonal dynamics.', 3, 16, false),
  ('Worldview & Beliefs', 'worldview', 'conversation', 15, '1.5 min', 'Your philosophical grounding and perspective on life''s big questions.', 3, 17, false),
  ('Sensory & Aesthetic Preferences', 'sensory_aesthetic', 'conversation', 12, '1 min', 'Your sensory preferences and aesthetic sensibilities.', 3, 18, false),
  ('Humor & Play Profile', 'humor_play', 'conversation', 8, '0.5 min', 'Your sense of humor and playful tendencies.', 3, 19, false),
  ('Communication Quirks', 'communication_quirks', 'conversation', 10, '0.5 min', 'Your unique verbal tics, favorite phrases, and communication idiosyncrasies.', 3, 20, false),
  ('Creative Process', 'creative_process', 'conversation', 10, '0.5 min', 'How you approach creative work, your rituals, and what inspires you.', 3, 21, false),
  ('Sample Writing Analysis', 'writing_analysis', 'automated', 15, 'Automated', 'AI analysis of your writing samples to extract voice markers and stylistic signatures.', 1, 22, false)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- 11. Updated_at Trigger
-- =====================================================
CREATE OR REPLACE FUNCTION update_psychometrics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_psychometric_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_psychometrics_updated_at();

CREATE TRIGGER update_user_responses_updated_at
  BEFORE UPDATE ON user_assessment_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_psychometrics_updated_at();

CREATE TRIGGER update_profile_prompts_updated_at
  BEFORE UPDATE ON profile_generation_prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_psychometrics_updated_at();
