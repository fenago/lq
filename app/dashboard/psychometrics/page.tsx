"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/libs/supabase";

// Types for psychometric categories based on PRD
interface AssessmentCategory {
  id: string;
  name: string;
  dataPoints: number;
  timeEstimate: string;
  method: "questionnaire" | "conversation" | "automated";
  description: string;
  icon: string;
  questions?: AssessmentQuestion[];
}

interface AssessmentQuestion {
  id: string;
  text: string;
  type: "scale" | "choice" | "text";
  options?: string[];
}

interface UserProfile {
  id: string;
  user_id: string;
  completionPercentage: number;
  categories: {
    [categoryId: string]: {
      completed: boolean;
      score?: number;
      answers?: Record<string, number | string>;
    };
  };
}

// Map category IDs to their database column names
const categoryToDbField: Record<string, string> = {
  big_five: "big_five",
  cognitive_style: "cognitive_style",
  emotional_intelligence: "emotional_intelligence",
  disc: "disc_profile",
  values: "values_motivations",
  via_strengths: "character_strengths",
  enneagram: "enneagram",
  creativity: "creativity_profile",
  thinking_style: "thinking_style",
  writing_preferences: "writing_preferences",
  liwc_metrics: "liwc_metrics",
  reasoning_patterns: "reasoning_patterns",
  life_experience: "life_experience",
  intellectual_influences: "intellectual_influences",
  emotional_landscape: "emotional_landscape",
  relationship_patterns: "relationship_patterns",
  worldview_beliefs: "worldview_beliefs",
  sensory_aesthetic: "sensory_aesthetic",
  humor_play: "humor_play",
  communication_quirks: "communication_quirks",
  creative_process: "creative_process",
  sample_writing: "writing_analysis",
};

// Assessment categories from PRD (299 data points across 22 categories)
// Questionnaire: 164 data points | Conversation: 112 data points | Automated: 23 data points = 299 Total
const assessmentCategories: AssessmentCategory[] = [
  // Questionnaire-based (164 data points: 35+12+15+8+12+27+6+8+10+25+6)
  {
    id: "big_five",
    name: "Big Five Personality (OCEAN)",
    dataPoints: 35,
    timeEstimate: "5-7 min",
    method: "questionnaire",
    description: "The most scientifically validated personality model. Measures Openness, Conscientiousness, Extraversion, Agreeableness, and Neuroticism with 6 facets each plus interaction styles.",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    questions: [
      // Openness (7 questions)
      { id: "ocean_1", text: "I have a vivid imagination", type: "scale" },
      { id: "ocean_2", text: "I am deeply moved by art and beauty", type: "scale" },
      { id: "ocean_3", text: "I enjoy thinking about abstract concepts", type: "scale" },
      { id: "ocean_4", text: "I prefer variety over routine", type: "scale" },
      { id: "ocean_5", text: "I am curious about many different things", type: "scale" },
      { id: "ocean_6", text: "I enjoy trying new and unfamiliar experiences", type: "scale" },
      { id: "ocean_7", text: "I appreciate unconventional ideas", type: "scale" },
      // Conscientiousness (7 questions)
      { id: "ocean_8", text: "I keep things organized", type: "scale" },
      { id: "ocean_9", text: "I am always prepared", type: "scale" },
      { id: "ocean_10", text: "I pay attention to details", type: "scale" },
      { id: "ocean_11", text: "I follow through on my commitments", type: "scale" },
      { id: "ocean_12", text: "I work hard to achieve my goals", type: "scale" },
      { id: "ocean_13", text: "I think before I act", type: "scale" },
      { id: "ocean_14", text: "I like to plan ahead", type: "scale" },
      // Extraversion (7 questions)
      { id: "ocean_15", text: "I feel comfortable around people", type: "scale" },
      { id: "ocean_16", text: "I start conversations with strangers", type: "scale" },
      { id: "ocean_17", text: "I enjoy being the center of attention", type: "scale" },
      { id: "ocean_18", text: "I feel energized after social gatherings", type: "scale" },
      { id: "ocean_19", text: "I have a wide circle of friends", type: "scale" },
      { id: "ocean_20", text: "I am talkative", type: "scale" },
      { id: "ocean_21", text: "I prefer group activities over solitary ones", type: "scale" },
      // Agreeableness (7 questions)
      { id: "ocean_22", text: "I am helpful to others", type: "scale" },
      { id: "ocean_23", text: "I trust others easily", type: "scale" },
      { id: "ocean_24", text: "I sympathize with others' feelings", type: "scale" },
      { id: "ocean_25", text: "I try to avoid conflict", type: "scale" },
      { id: "ocean_26", text: "I am willing to compromise", type: "scale" },
      { id: "ocean_27", text: "I consider others' needs before my own", type: "scale" },
      { id: "ocean_28", text: "I believe the best in people", type: "scale" },
      // Neuroticism (7 questions)
      { id: "ocean_29", text: "I get stressed easily", type: "scale" },
      { id: "ocean_30", text: "I worry about things", type: "scale" },
      { id: "ocean_31", text: "My mood changes frequently", type: "scale" },
      { id: "ocean_32", text: "I get upset easily", type: "scale" },
      { id: "ocean_33", text: "I often feel anxious", type: "scale" },
      { id: "ocean_34", text: "I dwell on past mistakes", type: "scale" },
      { id: "ocean_35", text: "I feel overwhelmed by emotions", type: "scale" },
    ],
  },
  {
    id: "cognitive_style",
    name: "Cognitive Style",
    dataPoints: 12,
    timeEstimate: "2-3 min",
    method: "questionnaire",
    description: "How you process information, learn new concepts, and approach problem-solving. Includes visual/verbal preference, analytical/intuitive thinking, and big-picture vs detail orientation.",
    icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
    questions: [
      { id: "cog_1", text: "When learning something new, I prefer diagrams over written explanations", type: "scale" },
      { id: "cog_2", text: "I trust my gut feelings more than logical analysis", type: "scale" },
      { id: "cog_3", text: "I like to understand the big picture before details", type: "scale" },
      { id: "cog_4", text: "I prefer to learn by doing rather than reading instructions", type: "scale" },
      { id: "cog_5", text: "I remember things better when I see them written down", type: "scale" },
      { id: "cog_6", text: "I need to understand why something works before I can use it", type: "scale" },
      { id: "cog_7", text: "I prefer structured information over free-form content", type: "scale" },
      { id: "cog_8", text: "I often see connections that others miss", type: "scale" },
      { id: "cog_9", text: "I prefer to focus on one thing at a time rather than multitask", type: "scale" },
      { id: "cog_10", text: "I need quiet to concentrate effectively", type: "scale" },
      { id: "cog_11", text: "I learn best from concrete examples rather than abstract theories", type: "scale" },
      { id: "cog_12", text: "I often think in metaphors and analogies", type: "scale" },
    ],
  },
  {
    id: "emotional_intelligence",
    name: "Emotional Intelligence (EQ)",
    dataPoints: 15,
    timeEstimate: "3-4 min",
    method: "questionnaire",
    description: "Your ability to recognize, understand, and manage emotions in yourself and others. Affects how emotionally resonant your writing will be.",
    icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
    questions: [
      { id: "eq_1", text: "I can usually tell how others are feeling by their expression", type: "scale" },
      { id: "eq_2", text: "I am good at managing my emotions under stress", type: "scale" },
      { id: "eq_3", text: "I find it easy to put my feelings into words", type: "scale" },
      { id: "eq_4", text: "I am aware of my emotional reactions as they happen", type: "scale" },
      { id: "eq_5", text: "I can calm myself down when I feel angry or frustrated", type: "scale" },
      { id: "eq_6", text: "I pick up on the emotional undercurrents in a group", type: "scale" },
      { id: "eq_7", text: "I can motivate myself even when I don't feel like it", type: "scale" },
      { id: "eq_8", text: "I understand why I react emotionally to certain situations", type: "scale" },
      { id: "eq_9", text: "I can sense when someone is upset even if they don't say anything", type: "scale" },
      { id: "eq_10", text: "I can express my emotions appropriately in different situations", type: "scale" },
      { id: "eq_11", text: "I use my emotions to guide my decision-making", type: "scale" },
      { id: "eq_12", text: "I can help others feel better when they're upset", type: "scale" },
      { id: "eq_13", text: "I recognize how my feelings affect my performance", type: "scale" },
      { id: "eq_14", text: "I can read between the lines in conversations", type: "scale" },
      { id: "eq_15", text: "I adapt my communication style based on others' emotional states", type: "scale" },
    ],
  },
  {
    id: "disc",
    name: "Communication Style (DISC)",
    dataPoints: 8,
    timeEstimate: "2 min",
    method: "questionnaire",
    description: "Your dominant communication style: Dominance, Influence, Steadiness, or Conscientiousness. Determines how directly and expressively you write.",
    icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
    questions: [
      // Dominance
      { id: "disc_1", text: "I prefer to get straight to the point in conversations", type: "scale" },
      { id: "disc_2", text: "I am comfortable taking charge in group situations", type: "scale" },
      // Influence
      { id: "disc_3", text: "I enjoy inspiring and motivating others", type: "scale" },
      { id: "disc_4", text: "I am enthusiastic and optimistic in my communication", type: "scale" },
      // Steadiness
      { id: "disc_5", text: "I value stability and consistency", type: "scale" },
      { id: "disc_6", text: "I prefer to support others rather than lead", type: "scale" },
      // Conscientiousness
      { id: "disc_7", text: "I focus on accuracy and quality in my work", type: "scale" },
      { id: "disc_8", text: "I prefer to have all the facts before making decisions", type: "scale" },
    ],
  },
  {
    id: "values",
    name: "Values & Motivations",
    dataPoints: 12,
    timeEstimate: "2-3 min",
    method: "questionnaire",
    description: "Your core values and what motivates you. Based on Schwartz's Theory of Basic Human Values. Shapes the themes and messages in your writing.",
    icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
    questions: [
      { id: "val_1", text: "Achievement and success are very important to me", type: "scale" },
      { id: "val_2", text: "I value being of service to others", type: "scale" },
      { id: "val_3", text: "Personal freedom and independence matter greatly to me", type: "scale" },
      { id: "val_4", text: "Security and stability are priorities in my life", type: "scale" },
      { id: "val_5", text: "I seek novelty and excitement", type: "scale" },
      { id: "val_6", text: "Following traditions and customs is important to me", type: "scale" },
      { id: "val_7", text: "I value having power and influence over others", type: "scale" },
      { id: "val_8", text: "Protecting nature and the environment matters to me", type: "scale" },
      { id: "val_9", text: "I believe in equality and justice for all", type: "scale" },
      { id: "val_10", text: "Pleasure and enjoyment are important life goals", type: "scale" },
      { id: "val_11", text: "I value conforming to social norms and expectations", type: "scale" },
      { id: "val_12", text: "Creativity and self-expression are core to who I am", type: "scale" },
    ],
  },
  {
    id: "via_strengths",
    name: "Character Strengths (VIA)",
    dataPoints: 27,
    timeEstimate: "4-5 min",
    method: "questionnaire",
    description: "Your signature character strengths from the VIA Classification. Includes creativity, curiosity, love of learning, perspective, bravery, honesty, kindness, and more.",
    icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
    questions: [
      { id: "via_1", text: "I regularly come up with new ideas and ways of doing things", type: "scale" },
      { id: "via_2", text: "I am always curious and eager to explore new topics", type: "scale" },
      { id: "via_3", text: "I love learning new skills and knowledge", type: "scale" },
      { id: "via_4", text: "I can see situations from multiple perspectives", type: "scale" },
      { id: "via_5", text: "I stand up for what I believe even when it's difficult", type: "scale" },
      { id: "via_6", text: "I always tell the truth, even when it's uncomfortable", type: "scale" },
      { id: "via_7", text: "I enjoy doing kind things for others", type: "scale" },
      { id: "via_8", text: "I work well as part of a team", type: "scale" },
      { id: "via_9", text: "I treat everyone fairly regardless of who they are", type: "scale" },
      { id: "via_10", text: "I can forgive people who have wronged me", type: "scale" },
      { id: "via_11", text: "I am modest about my achievements", type: "scale" },
      { id: "via_12", text: "I think carefully before making decisions", type: "scale" },
      { id: "via_13", text: "I can control my impulses and emotions", type: "scale" },
      { id: "via_14", text: "I notice and appreciate beauty in the world", type: "scale" },
      { id: "via_15", text: "I feel grateful for what I have", type: "scale" },
      { id: "via_16", text: "I remain hopeful even in difficult times", type: "scale" },
      { id: "via_17", text: "I use humor to lighten the mood", type: "scale" },
      { id: "via_18", text: "I have a sense of meaning and purpose in life", type: "scale" },
    ],
  },
  {
    id: "enneagram",
    name: "Enneagram Profile",
    dataPoints: 6,
    timeEstimate: "2 min",
    method: "questionnaire",
    description: "Your Enneagram type and wing. Reveals your core motivations, fears, and growth paths. Adds depth to character development and narrative themes.",
    icon: "M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z",
    questions: [
      { id: "enn_1", text: "I strive for perfection and have high standards", type: "scale" },
      { id: "enn_2", text: "I naturally focus on helping and supporting others", type: "scale" },
      { id: "enn_3", text: "Achievement and success are central to my identity", type: "scale" },
      { id: "enn_4", text: "I often feel different from others and value authenticity deeply", type: "scale" },
      { id: "enn_5", text: "I need time alone to think and recharge", type: "scale" },
      { id: "enn_6", text: "I tend to anticipate problems and prepare for worst-case scenarios", type: "scale" },
      { id: "enn_7", text: "I seek new experiences and avoid pain or boredom", type: "scale" },
      { id: "enn_8", text: "I am direct and assertive in pursuing what I want", type: "scale" },
      { id: "enn_9", text: "I prefer harmony and avoiding conflict", type: "scale" },
    ],
  },
  {
    id: "creativity",
    name: "Creativity Profile",
    dataPoints: 8,
    timeEstimate: "2 min",
    method: "questionnaire",
    description: "Your creative style and preferences. Measures divergent thinking, risk tolerance, and preference for novelty vs. convention.",
    icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
    questions: [
      { id: "cre_1", text: "I enjoy generating many different ideas before settling on one", type: "scale" },
      { id: "cre_2", text: "I am comfortable taking creative risks", type: "scale" },
      { id: "cre_3", text: "I prefer novel approaches over tried-and-true methods", type: "scale" },
      { id: "cre_4", text: "I can easily make connections between unrelated concepts", type: "scale" },
      { id: "cre_5", text: "I enjoy ambiguity and open-ended problems", type: "scale" },
      { id: "cre_6", text: "I often challenge conventional thinking", type: "scale" },
      { id: "cre_7", text: "I get excited by unusual or unexpected ideas", type: "scale" },
      { id: "cre_8", text: "I prefer creating original work to following templates", type: "scale" },
    ],
  },
  {
    id: "thinking_style",
    name: "Thinking Style",
    dataPoints: 10,
    timeEstimate: "2 min",
    method: "questionnaire",
    description: "How you approach reasoning and problem-solving. Includes critical thinking, systems thinking, and creative thinking preferences.",
    icon: "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    questions: [
      { id: "think_1", text: "I naturally look for cause-and-effect relationships", type: "scale" },
      { id: "think_2", text: "I think about how different parts of a system interact", type: "scale" },
      { id: "think_3", text: "I question assumptions before accepting information", type: "scale" },
      { id: "think_4", text: "I consider long-term consequences when making decisions", type: "scale" },
      { id: "think_5", text: "I enjoy finding patterns in complex information", type: "scale" },
      { id: "think_6", text: "I prefer to analyze all options before deciding", type: "scale" },
      { id: "think_7", text: "I naturally consider multiple viewpoints on issues", type: "scale" },
      { id: "think_8", text: "I enjoy solving puzzles and logical problems", type: "scale" },
      { id: "think_9", text: "I think about underlying principles behind surface events", type: "scale" },
      { id: "think_10", text: "I evaluate evidence quality before drawing conclusions", type: "scale" },
    ],
  },
  {
    id: "writing_preferences",
    name: "Writing Preferences",
    dataPoints: 25,
    timeEstimate: "3-4 min",
    method: "questionnaire",
    description: "Your preferences for sentence length, vocabulary complexity, formality, and stylistic choices. Directly shapes AI writing output.",
    icon: "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z",
    questions: [
      { id: "wp_1", text: "I prefer short, punchy sentences over long, complex ones", type: "scale" },
      { id: "wp_2", text: "I like to use sophisticated vocabulary", type: "scale" },
      { id: "wp_3", text: "I prefer formal writing to casual writing", type: "scale" },
      { id: "wp_4", text: "I often use metaphors and analogies", type: "scale" },
      { id: "wp_5", text: "I like to address the reader directly", type: "scale" },
      { id: "wp_6", text: "I enjoy using humor in my writing", type: "scale" },
      { id: "wp_7", text: "I prefer active voice over passive voice", type: "scale" },
      { id: "wp_8", text: "I like to include personal anecdotes and stories", type: "scale" },
      { id: "wp_9", text: "I prefer concrete examples over abstract concepts", type: "scale" },
      { id: "wp_10", text: "I use bullet points and lists frequently", type: "scale" },
      { id: "wp_11", text: "I like to ask rhetorical questions", type: "scale" },
      { id: "wp_12", text: "I prefer comprehensive coverage over brevity", type: "scale" },
      { id: "wp_13", text: "I use transitional phrases between ideas", type: "scale" },
      { id: "wp_14", text: "I like to define technical terms when I use them", type: "scale" },
      { id: "wp_15", text: "I prefer to build arguments gradually", type: "scale" },
      { id: "wp_16", text: "I enjoy using vivid, descriptive language", type: "scale" },
      { id: "wp_17", text: "I like to challenge readers with provocative statements", type: "scale" },
      { id: "wp_18", text: "I prefer writing in first person", type: "scale" },
      { id: "wp_19", text: "I use headings and subheadings to organize content", type: "scale" },
      { id: "wp_20", text: "I like to end sections with summaries or key takeaways", type: "scale" },
    ],
  },
  {
    id: "liwc_metrics",
    name: "LIWC Metrics",
    dataPoints: 8,
    timeEstimate: "Automated",
    method: "automated",
    description: "Linguistic analysis of your writing samples. Analyzes word categories, emotional tone, cognitive complexity, and social references.",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
  },
  {
    id: "reasoning_patterns",
    name: "Reasoning Patterns",
    dataPoints: 6,
    timeEstimate: "1-2 min",
    method: "questionnaire",
    description: "How you build arguments and reach conclusions. Includes deductive vs inductive reasoning, evidence preferences, and logical style.",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    questions: [
      { id: "reas_1", text: "I prefer to start with general principles and apply them to specific cases", type: "scale" },
      { id: "reas_2", text: "I build arguments by accumulating specific evidence first", type: "scale" },
      { id: "reas_3", text: "I value statistical data over individual case studies", type: "scale" },
      { id: "reas_4", text: "I consider counterarguments when forming my position", type: "scale" },
      { id: "reas_5", text: "I prefer logical step-by-step reasoning over intuitive leaps", type: "scale" },
      { id: "reas_6", text: "I acknowledge uncertainty and limitations in my conclusions", type: "scale" },
    ],
  },
  // Conversation-based (112 data points: 15+12+18+12+15+12+8+10+10)
  {
    id: "life_experience",
    name: "Life Experience & Background",
    dataPoints: 15,
    timeEstimate: "2 min",
    method: "conversation",
    description: "Your formative experiences, cultural background, and key life events. Provides authentic context for your writing voice.",
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    id: "intellectual_influences",
    name: "Intellectual Influences",
    dataPoints: 12,
    timeEstimate: "1.5 min",
    method: "conversation",
    description: "Thinkers, books, and ideas that shaped your worldview. AI will incorporate references and thinking styles from your influences.",
    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  },
  {
    id: "emotional_landscape",
    name: "Emotional Landscape (Deep)",
    dataPoints: 18,
    timeEstimate: "1.5 min",
    method: "conversation",
    description: "Your emotional triggers, how you process feelings, and emotional themes that resonate with you. Creates emotionally authentic writing.",
    icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
  },
  {
    id: "relationship_patterns",
    name: "Relationship Patterns",
    dataPoints: 12,
    timeEstimate: "1 min",
    method: "conversation",
    description: "How you relate to others, your attachment style, and interpersonal dynamics. Informs how you write about relationships and dialogue.",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
  },
  {
    id: "worldview_beliefs",
    name: "Worldview & Beliefs",
    dataPoints: 15,
    timeEstimate: "1.5 min",
    method: "conversation",
    description: "Your philosophical grounding, beliefs about human nature, and perspective on life's big questions. Shapes the underlying themes in your work.",
    icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    id: "sensory_aesthetic",
    name: "Sensory & Aesthetic Preferences",
    dataPoints: 12,
    timeEstimate: "1 min",
    method: "conversation",
    description: "Your sensory preferences and aesthetic sensibilities. Informs descriptive writing, imagery, and sensory details in your content.",
    icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
  },
  {
    id: "humor_play",
    name: "Humor & Play Profile",
    dataPoints: 8,
    timeEstimate: "0.5 min",
    method: "conversation",
    description: "Your sense of humor and playful tendencies. Determines when and how humor appears in your AI-generated writing.",
    icon: "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    id: "communication_quirks",
    name: "Communication Quirks",
    dataPoints: 10,
    timeEstimate: "0.5 min",
    method: "conversation",
    description: "Your unique verbal tics, favorite phrases, and communication idiosyncrasies. Makes AI writing distinctively yours.",
    icon: "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z",
  },
  {
    id: "creative_process",
    name: "Creative Process",
    dataPoints: 10,
    timeEstimate: "0.5 min",
    method: "conversation",
    description: "How you approach creative work, your rituals, and what inspires you. Helps AI match your creative rhythm.",
    icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
  },
  {
    id: "sample_writing",
    name: "Sample Writing Analysis",
    dataPoints: 15,
    timeEstimate: "Automated",
    method: "automated",
    description: "AI analysis of your writing samples to extract voice markers, sentence patterns, vocabulary preferences, and stylistic signatures.",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
];

// Initial empty user profile
const emptyUserProfile: UserProfile = {
  id: "",
  user_id: "",
  completionPercentage: 0,
  categories: {},
};

export default function PsychometricsPage() {
  const [activePhase, setActivePhase] = useState<"overview" | "questionnaire" | "conversation" | "results">("overview");
  const [selectedCategory, setSelectedCategory] = useState<AssessmentCategory | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [userProfile, setUserProfile] = useState<UserProfile>(emptyUserProfile);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Load user profile from Supabase
  const loadUserProfile = useCallback(async () => {
    const supabase = createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("Error getting user:", userError);
      setIsLoading(false);
      return;
    }

    setUserId(user.id);

    // Try to get existing profile
    const { data: profile, error: profileError } = await supabase
      .from("user_psychometric_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (profileError && profileError.code !== "PGRST116") {
      // PGRST116 is "no rows returned" - that's expected for new users
      console.error("Error loading profile:", profileError);
    }

    if (profile) {
      // Build categories object from profile data
      const categories: UserProfile["categories"] = {};

      // Check each category field for completion
      for (const [categoryId, dbField] of Object.entries(categoryToDbField)) {
        const fieldData = profile[dbField];
        if (fieldData && typeof fieldData === "object" && Object.keys(fieldData).length > 0) {
          categories[categoryId] = {
            completed: true,
            answers: fieldData,
          };
        }
      }

      setUserProfile({
        id: profile.id,
        user_id: profile.user_id,
        completionPercentage: profile.completion_percentage || 0,
        categories,
      });
    } else {
      // Create a new profile for this user
      const { data: newProfile, error: createError } = await supabase
        .from("user_psychometric_profiles")
        .insert({ user_id: user.id })
        .select()
        .single();

      if (createError) {
        console.error("Error creating profile:", createError);
      } else if (newProfile) {
        setUserProfile({
          id: newProfile.id,
          user_id: newProfile.user_id,
          completionPercentage: 0,
          categories: {},
        });
      }
    }

    setIsLoading(false);
  }, []);

  // Load profile on mount
  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  // Calculate total data points
  const totalDataPoints = assessmentCategories.reduce((sum, cat) => sum + cat.dataPoints, 0);
  const questionnaireDataPoints = assessmentCategories
    .filter((c) => c.method === "questionnaire")
    .reduce((sum, cat) => sum + cat.dataPoints, 0);
  const conversationDataPoints = assessmentCategories
    .filter((c) => c.method === "conversation")
    .reduce((sum, cat) => sum + cat.dataPoints, 0);
  const automatedDataPoints = assessmentCategories
    .filter((c) => c.method === "automated")
    .reduce((sum, cat) => sum + cat.dataPoints, 0);

  // Handle answer selection
  const handleAnswer = (questionId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  // Start assessment for a category
  const startAssessment = (category: AssessmentCategory) => {
    setSelectedCategory(category);
    setCurrentQuestionIndex(0);
    setActivePhase("questionnaire");
  };

  // Complete current category and save to Supabase
  const completeCategory = async () => {
    if (!selectedCategory || !userId) return;

    setIsSaving(true);

    const supabase = createClient();
    const dbField = categoryToDbField[selectedCategory.id];

    if (dbField) {
      // Update the specific category field in the database
      const updateData: Record<string, unknown> = {
        [dbField]: answers,
        updated_at: new Date().toISOString(),
      };

      // Calculate new completion percentage
      const newCategories = {
        ...userProfile.categories,
        [selectedCategory.id]: {
          completed: true,
          answers,
        },
      };
      const completedCount = Object.values(newCategories).filter((c) => c.completed).length;
      const completionPct = Math.round((completedCount / assessmentCategories.length) * 100);
      updateData.completion_percentage = completionPct;

      const { error } = await supabase
        .from("user_psychometric_profiles")
        .update(updateData)
        .eq("user_id", userId);

      if (error) {
        console.error("Error saving answers:", error);
        alert("Failed to save your answers. Please try again.");
        setIsSaving(false);
        return;
      }

      // Update local state
      setUserProfile((prev) => ({
        ...prev,
        completionPercentage: completionPct,
        categories: newCategories,
      }));
    }

    setIsSaving(false);
    setSelectedCategory(null);
    setActivePhase("overview");
    setAnswers({});
  };

  // Calculate completion percentage
  const completedCategories = Object.values(userProfile.categories).filter((c) => c.completed).length;
  const completionPercentage = Math.round((completedCategories / assessmentCategories.length) * 100);

  // Show loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <p className="mt-4 text-base-content/60">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Author Psychometrics</h1>
          <p className="text-base-content/60 mt-1">
            299 data points across 22 categories to capture your authentic voice
          </p>
        </div>
        <Link href="/dashboard" className="btn btn-primary">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Book
        </Link>
      </div>

      {/* Active Assessment View */}
      {activePhase === "questionnaire" && selectedCategory && (
        <div className="bg-base-100 rounded-2xl shadow-xl border border-base-200 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-sm text-primary font-medium mb-1">{selectedCategory.name}</div>
              <h2 className="text-2xl font-bold">{selectedCategory.description}</h2>
            </div>
            <button
              onClick={() => {
                setSelectedCategory(null);
                setActivePhase("overview");
              }}
              className="btn btn-ghost"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span>Question {currentQuestionIndex + 1} of {selectedCategory.questions?.length || 5}</span>
              <span>{Math.round(((currentQuestionIndex + 1) / (selectedCategory.questions?.length || 5)) * 100)}%</span>
            </div>
            <progress
              className="progress progress-primary w-full"
              value={currentQuestionIndex + 1}
              max={selectedCategory.questions?.length || 5}
            ></progress>
          </div>

          {/* Question */}
          {selectedCategory.questions && selectedCategory.questions[currentQuestionIndex] && (
            <div className="mb-8">
              <h3 className="text-xl font-medium mb-6">
                {selectedCategory.questions[currentQuestionIndex].text}
              </h3>

              {/* Scale Selector */}
              <div className="flex flex-col gap-4">
                <div className="flex justify-between text-sm text-base-content/60">
                  <span>Strongly Disagree</span>
                  <span>Strongly Agree</span>
                </div>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                    <button
                      key={value}
                      onClick={() => handleAnswer(selectedCategory.questions![currentQuestionIndex].id, value)}
                      className={`w-12 h-12 rounded-full font-medium transition-all ${
                        answers[selectedCategory.questions![currentQuestionIndex].id] === value
                          ? "bg-primary text-primary-content scale-110"
                          : "bg-base-200 hover:bg-primary/20"
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={() => setCurrentQuestionIndex((i) => Math.max(0, i - 1))}
              className="btn btn-ghost"
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </button>
            {currentQuestionIndex < (selectedCategory.questions?.length || 5) - 1 ? (
              <button
                onClick={() => setCurrentQuestionIndex((i) => i + 1)}
                className="btn btn-primary"
                disabled={!answers[selectedCategory.questions?.[currentQuestionIndex]?.id || ""]}
              >
                Next
              </button>
            ) : (
              <button
                onClick={completeCategory}
                className="btn btn-primary"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Saving...
                  </>
                ) : (
                  "Complete & Save"
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Overview View */}
      {activePhase === "overview" && (
        <>
          {/* Progress Overview Card */}
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8 mb-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">Your Author Profile</h2>
                <p className="text-base-content/70 mb-4">
                  Complete the assessment to unlock AI writing that thinks, reasons, and writes like you.
                </p>
                <div className="flex items-center gap-4">
                  <div className="radial-progress text-primary" style={{ "--value": completionPercentage, "--size": "5rem" } as React.CSSProperties}>
                    {completionPercentage}%
                  </div>
                  <div>
                    <div className="font-bold">{completedCategories}/{assessmentCategories.length} categories</div>
                    <div className="text-sm text-base-content/60">
                      {Object.values(userProfile.categories).reduce((sum, c) => sum + (c.completed ? 1 : 0), 0) * 10}+ data points captured
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="bg-base-100 rounded-xl p-3">
                  <div className="text-2xl font-bold text-primary">{totalDataPoints}</div>
                  <div className="text-xs text-base-content/60">Total Points</div>
                </div>
                <div className="bg-base-100 rounded-xl p-3">
                  <div className="text-2xl font-bold text-secondary">{questionnaireDataPoints}</div>
                  <div className="text-xs text-base-content/60">Questionnaire</div>
                </div>
                <div className="bg-base-100 rounded-xl p-3">
                  <div className="text-2xl font-bold text-accent">{conversationDataPoints}</div>
                  <div className="text-xs text-base-content/60">Conversation</div>
                </div>
                <div className="bg-base-100 rounded-xl p-3">
                  <div className="text-2xl font-bold text-info">{automatedDataPoints}</div>
                  <div className="text-xs text-base-content/60">Automated</div>
                </div>
              </div>
            </div>
          </div>

          {/* Phase Navigation */}
          <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
            <div className="flex-1 bg-base-100 rounded-xl p-4 border-2 border-primary">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">1</div>
                <span className="font-bold">Quick Start</span>
              </div>
              <p className="text-sm text-base-content/60">Big Five, Writing Preferences, DISC (10-15 min)</p>
            </div>
            <div className="flex-1 bg-base-100 rounded-xl p-4 border border-base-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-base-200 rounded-full flex items-center justify-center font-bold">2</div>
                <span className="font-bold">Deep Dive</span>
              </div>
              <p className="text-sm text-base-content/60">EQ, Values, Cognitive Style (10-15 min)</p>
            </div>
            <div className="flex-1 bg-base-100 rounded-xl p-4 border border-base-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-base-200 rounded-full flex items-center justify-center font-bold">3</div>
                <span className="font-bold">Conversation</span>
              </div>
              <p className="text-sm text-base-content/60">AI-guided voice interview (5-10 min)</p>
            </div>
            <div className="flex-1 bg-base-100 rounded-xl p-4 border border-base-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-base-200 rounded-full flex items-center justify-center font-bold">4</div>
                <span className="font-bold">Enrichment</span>
              </div>
              <p className="text-sm text-base-content/60">VIA, Enneagram, Creativity (ongoing)</p>
            </div>
          </div>

          {/* Category Sections */}
          <div className="space-y-8">
            {/* Questionnaire Categories */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h2 className="text-xl font-bold">Questionnaire Assessments</h2>
                <span className="badge badge-primary">{questionnaireDataPoints} data points</span>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assessmentCategories
                  .filter((c) => c.method === "questionnaire")
                  .map((category) => {
                    const isCompleted = userProfile.categories[category.id]?.completed;
                    return (
                      <div
                        key={category.id}
                        className={`bg-base-100 rounded-xl border p-5 transition-all ${
                          isCompleted
                            ? "border-success/50 bg-success/5"
                            : "border-base-200 hover:border-primary/30 hover:shadow-lg cursor-pointer"
                        }`}
                        onClick={() => !isCompleted && startAssessment(category)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={category.icon} />
                            </svg>
                          </div>
                          {isCompleted ? (
                            <span className="badge badge-success gap-1">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Done
                            </span>
                          ) : (
                            <span className="badge badge-ghost">{category.timeEstimate}</span>
                          )}
                        </div>
                        <h3 className="font-bold mb-1">{category.name}</h3>
                        <p className="text-sm text-base-content/60 line-clamp-2 mb-3">
                          {category.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-base-content/50">
                          <span>{category.dataPoints} data points</span>
                          {!isCompleted && (
                            <span className="text-primary font-medium">Start &rarr;</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Conversation Categories */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-6 h-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h2 className="text-xl font-bold">Conversation & Analysis</h2>
                <span className="badge badge-secondary">{conversationDataPoints} data points</span>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assessmentCategories
                  .filter((c) => c.method === "conversation" || c.method === "automated")
                  .map((category) => {
                    const isCompleted = userProfile.categories[category.id]?.completed;
                    return (
                      <div
                        key={category.id}
                        className={`bg-base-100 rounded-xl border p-5 ${
                          isCompleted
                            ? "border-success/50 bg-success/5"
                            : "border-base-200 opacity-70"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            category.method === "automated" ? "bg-accent/10" : "bg-secondary/10"
                          }`}>
                            <svg className={`w-5 h-5 ${
                              category.method === "automated" ? "text-accent" : "text-secondary"
                            }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={category.icon} />
                            </svg>
                          </div>
                          <span className="badge badge-ghost">
                            {category.method === "automated" ? "Automated" : category.timeEstimate}
                          </span>
                        </div>
                        <h3 className="font-bold mb-1">{category.name}</h3>
                        <p className="text-sm text-base-content/60 line-clamp-2 mb-3">
                          {category.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-base-content/50">
                          <span>{category.dataPoints} data points</span>
                          <span className={category.method === "automated" ? "text-accent" : "text-secondary"}>
                            {category.method === "automated" ? "Auto-analyze" : "AI Interview"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Writing Sample Upload */}
          <div className="mt-8 bg-base-100 rounded-2xl border border-base-200 p-8">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center shrink-0">
                <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Upload Writing Samples</h3>
                <p className="text-base-content/60 mb-4">
                  Upload 2-3 writing samples (500+ words each) for AI analysis. We&apos;ll extract your voice markers,
                  sentence patterns, vocabulary preferences, and stylistic signatures.
                </p>
                <div className="flex gap-3">
                  <button className="btn btn-accent">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Upload Samples
                  </button>
                  <button className="btn btn-ghost">
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* AI Conversation CTA */}
          <div className="mt-8 bg-gradient-to-r from-secondary/20 to-accent/20 rounded-2xl p-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-secondary/20 rounded-2xl flex items-center justify-center shrink-0">
                <svg className="w-10 h-10 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">AI-Guided Voice Interview</h3>
                <p className="text-base-content/70 mb-4">
                  Have a 5-10 minute conversation with our AI interviewer. It will explore your life experiences,
                  intellectual influences, emotional landscape, and communication quirks to capture what makes your voice unique.
                </p>
                <button className="btn btn-secondary">
                  Start Voice Interview
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="mt-12 text-center">
            <h2 className="text-2xl font-bold mb-8">Why 299 Data Points?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-base-100 rounded-xl p-6 border border-base-200">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="font-bold mb-2">Thinking Patterns</h3>
                <p className="text-sm text-base-content/60">
                  Capture how you process information, build arguments, and reach conclusions
                </p>
              </div>
              <div className="bg-base-100 rounded-xl p-6 border border-base-200">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="font-bold mb-2">Emotional Authenticity</h3>
                <p className="text-sm text-base-content/60">
                  AI writing that resonates with your emotional depth and expression
                </p>
              </div>
              <div className="bg-base-100 rounded-xl p-6 border border-base-200">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <h3 className="font-bold mb-2">Voice Distinctiveness</h3>
                <p className="text-sm text-base-content/60">
                  Your unique linguistic fingerprint in every AI-generated chapter
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
