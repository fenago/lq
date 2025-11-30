"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/libs/supabase";
import {
  generateToneProfile,
  generatePersonalityDossier,
  dbProfileToPsychometric,
  type ToneProfile,
  type PersonalityDossier,
} from "@/libs/digital-twin";

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

interface QuestionMetadata {
  theory: string;
  theoryDescription: string;
  dataPoint: string;
  facet?: string;
  scale?: string;
  reference?: string;
}

interface AssessmentQuestion {
  id: string;
  text: string;
  type: "scale" | "choice" | "text";
  options?: string[];
  metadata?: QuestionMetadata;
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
      { id: "ocean_1", text: "I have a vivid imagination", type: "scale", metadata: {
        theory: "Big Five / OCEAN Model",
        theoryDescription: "The Big Five model is the most widely validated personality framework in psychology. Openness reflects creativity, intellectual curiosity, and preference for novelty.",
        dataPoint: "Openness to Experience",
        facet: "Fantasy/Imagination",
        scale: "1-7 Likert",
        reference: "Costa & McCrae (1992) NEO-PI-R"
      }},
      { id: "ocean_2", text: "I am deeply moved by art and beauty", type: "scale", metadata: {
        theory: "Big Five / OCEAN Model",
        theoryDescription: "Aesthetic appreciation reflects sensitivity to beauty and emotional responses to art, nature, and creative expression.",
        dataPoint: "Openness to Experience",
        facet: "Aesthetics",
        scale: "1-7 Likert",
        reference: "Costa & McCrae (1992) NEO-PI-R"
      }},
      { id: "ocean_3", text: "I enjoy thinking about abstract concepts", type: "scale", metadata: {
        theory: "Big Five / OCEAN Model",
        theoryDescription: "Intellectual curiosity measures enjoyment of philosophical discussions and complex theoretical ideas.",
        dataPoint: "Openness to Experience",
        facet: "Ideas/Intellect",
        scale: "1-7 Likert",
        reference: "Costa & McCrae (1992) NEO-PI-R"
      }},
      { id: "ocean_4", text: "I prefer variety over routine", type: "scale", metadata: {
        theory: "Big Five / OCEAN Model",
        theoryDescription: "Action orientation measures preference for novelty and willingness to try new activities vs. familiar routines.",
        dataPoint: "Openness to Experience",
        facet: "Actions",
        scale: "1-7 Likert",
        reference: "Costa & McCrae (1992) NEO-PI-R"
      }},
      { id: "ocean_5", text: "I am curious about many different things", type: "scale", metadata: {
        theory: "Big Five / OCEAN Model",
        theoryDescription: "Intellectual curiosity is a core facet of Openness, predicting learning motivation and creative problem-solving.",
        dataPoint: "Openness to Experience",
        facet: "Curiosity",
        scale: "1-7 Likert",
        reference: "DeYoung et al. (2007)"
      }},
      { id: "ocean_6", text: "I enjoy trying new and unfamiliar experiences", type: "scale", metadata: {
        theory: "Big Five / OCEAN Model",
        theoryDescription: "Experience-seeking reflects willingness to engage with unfamiliar situations and environments.",
        dataPoint: "Openness to Experience",
        facet: "Experience-Seeking",
        scale: "1-7 Likert",
        reference: "Costa & McCrae (1992) NEO-PI-R"
      }},
      { id: "ocean_7", text: "I appreciate unconventional ideas", type: "scale", metadata: {
        theory: "Big Five / OCEAN Model",
        theoryDescription: "Values facet measures receptiveness to non-traditional perspectives and willingness to question authority.",
        dataPoint: "Openness to Experience",
        facet: "Values/Liberalism",
        scale: "1-7 Likert",
        reference: "Costa & McCrae (1992) NEO-PI-R"
      }},
      // Conscientiousness (7 questions)
      { id: "ocean_8", text: "I keep things organized", type: "scale", metadata: {
        theory: "Big Five / OCEAN Model",
        theoryDescription: "Conscientiousness reflects self-discipline, organization, and goal-directed behavior. High C predicts academic and career success.",
        dataPoint: "Conscientiousness",
        facet: "Order/Organization",
        scale: "1-7 Likert",
        reference: "Costa & McCrae (1992) NEO-PI-R"
      }},
      { id: "ocean_9", text: "I am always prepared", type: "scale", metadata: {
        theory: "Big Five / OCEAN Model",
        theoryDescription: "Preparedness reflects proactive planning and readiness for future challenges.",
        dataPoint: "Conscientiousness",
        facet: "Competence",
        scale: "1-7 Likert",
        reference: "Costa & McCrae (1992) NEO-PI-R"
      }},
      { id: "ocean_10", text: "I pay attention to details", type: "scale", metadata: {
        theory: "Big Five / OCEAN Model",
        theoryDescription: "Detail orientation is crucial for accuracy in writing and correlates with thoroughness in research.",
        dataPoint: "Conscientiousness",
        facet: "Dutifulness",
        scale: "1-7 Likert",
        reference: "Costa & McCrae (1992) NEO-PI-R"
      }},
      { id: "ocean_11", text: "I follow through on my commitments", type: "scale", metadata: {
        theory: "Big Five / OCEAN Model",
        theoryDescription: "Reliability and follow-through predict consistency in long-term projects like book writing.",
        dataPoint: "Conscientiousness",
        facet: "Dutifulness",
        scale: "1-7 Likert",
        reference: "Costa & McCrae (1992) NEO-PI-R"
      }},
      { id: "ocean_12", text: "I work hard to achieve my goals", type: "scale", metadata: {
        theory: "Big Five / OCEAN Model",
        theoryDescription: "Achievement striving measures motivation to accomplish difficult goals and persist through obstacles.",
        dataPoint: "Conscientiousness",
        facet: "Achievement Striving",
        scale: "1-7 Likert",
        reference: "Costa & McCrae (1992) NEO-PI-R"
      }},
      { id: "ocean_13", text: "I think before I act", type: "scale", metadata: {
        theory: "Big Five / OCEAN Model",
        theoryDescription: "Deliberation reflects tendency to think carefully before making decisions, related to impulse control.",
        dataPoint: "Conscientiousness",
        facet: "Deliberation",
        scale: "1-7 Likert",
        reference: "Costa & McCrae (1992) NEO-PI-R"
      }},
      { id: "ocean_14", text: "I like to plan ahead", type: "scale", metadata: {
        theory: "Big Five / OCEAN Model",
        theoryDescription: "Future orientation and planning ability predict structured approach to complex projects.",
        dataPoint: "Conscientiousness",
        facet: "Self-Discipline",
        scale: "1-7 Likert",
        reference: "Costa & McCrae (1992) NEO-PI-R"
      }},
      // Extraversion (7 questions)
      { id: "ocean_15", text: "I feel comfortable around people", type: "scale", metadata: {
        theory: "Big Five / OCEAN Model",
        theoryDescription: "Extraversion reflects social energy, assertiveness, and positive emotionality. Affects communication style in writing.",
        dataPoint: "Extraversion",
        facet: "Gregariousness",
        scale: "1-7 Likert",
        reference: "Costa & McCrae (1992) NEO-PI-R"
      }},
      { id: "ocean_16", text: "I start conversations with strangers", type: "scale", metadata: {
        theory: "Big Five / OCEAN Model",
        theoryDescription: "Social initiative reflects comfort in approaching others and initiating interaction.",
        dataPoint: "Extraversion",
        facet: "Assertiveness",
        scale: "1-7 Likert",
        reference: "Costa & McCrae (1992) NEO-PI-R"
      }},
      { id: "ocean_17", text: "I enjoy being the center of attention", type: "scale", metadata: {
        theory: "Big Five / OCEAN Model",
        theoryDescription: "Attention-seeking relates to comfort with visibility and self-presentation.",
        dataPoint: "Extraversion",
        facet: "Excitement-Seeking",
        scale: "1-7 Likert",
        reference: "Costa & McCrae (1992) NEO-PI-R"
      }},
      { id: "ocean_18", text: "I feel energized after social gatherings", type: "scale", metadata: {
        theory: "Big Five / OCEAN Model",
        theoryDescription: "Social energy gain vs. drain is a core distinguisher between extraversion and introversion.",
        dataPoint: "Extraversion",
        facet: "Activity Level",
        scale: "1-7 Likert",
        reference: "Costa & McCrae (1992) NEO-PI-R"
      }},
      { id: "ocean_19", text: "I have a wide circle of friends", type: "scale", metadata: {
        theory: "Big Five / OCEAN Model",
        theoryDescription: "Social network size correlates with gregariousness and social investment.",
        dataPoint: "Extraversion",
        facet: "Gregariousness",
        scale: "1-7 Likert",
        reference: "Costa & McCrae (1992) NEO-PI-R"
      }},
      { id: "ocean_20", text: "I am talkative", type: "scale", metadata: {
        theory: "Big Five / OCEAN Model",
        theoryDescription: "Verbal fluency in social settings reflects extraversion and predicts more expansive writing style.",
        dataPoint: "Extraversion",
        facet: "Warmth",
        scale: "1-7 Likert",
        reference: "Costa & McCrae (1992) NEO-PI-R"
      }},
      { id: "ocean_21", text: "I prefer group activities over solitary ones", type: "scale", metadata: {
        theory: "Big Five / OCEAN Model",
        theoryDescription: "Social preference indicates where you gain energy - through others or through solitude.",
        dataPoint: "Extraversion",
        facet: "Gregariousness",
        scale: "1-7 Likert",
        reference: "Costa & McCrae (1992) NEO-PI-R"
      }},
      // Agreeableness (7 questions)
      { id: "ocean_22", text: "I am helpful to others", type: "scale", metadata: {
        theory: "Big Five / OCEAN Model",
        theoryDescription: "Agreeableness reflects interpersonal tendencies toward cooperation, trust, and concern for others.",
        dataPoint: "Agreeableness",
        facet: "Altruism",
        scale: "1-7 Likert",
        reference: "Costa & McCrae (1992) NEO-PI-R"
      }},
      { id: "ocean_23", text: "I trust others easily", type: "scale", metadata: {
        theory: "Big Five / OCEAN Model",
        theoryDescription: "Trust orientation affects how you portray characters and relationships in writing.",
        dataPoint: "Agreeableness",
        facet: "Trust",
        scale: "1-7 Likert",
        reference: "Costa & McCrae (1992) NEO-PI-R"
      }},
      { id: "ocean_24", text: "I sympathize with others' feelings", type: "scale", metadata: {
        theory: "Big Five / OCEAN Model",
        theoryDescription: "Sympathy and compassion are core components of agreeableness and predict empathetic writing.",
        dataPoint: "Agreeableness",
        facet: "Tender-Mindedness",
        scale: "1-7 Likert",
        reference: "Costa & McCrae (1992) NEO-PI-R"
      }},
      { id: "ocean_25", text: "I try to avoid conflict", type: "scale", metadata: {
        theory: "Big Five / OCEAN Model",
        theoryDescription: "Conflict avoidance relates to compliance and preference for harmony over confrontation.",
        dataPoint: "Agreeableness",
        facet: "Compliance",
        scale: "1-7 Likert",
        reference: "Costa & McCrae (1992) NEO-PI-R"
      }},
      { id: "ocean_26", text: "I am willing to compromise", type: "scale", metadata: {
        theory: "Big Five / OCEAN Model",
        theoryDescription: "Compromise willingness indicates flexibility in interpersonal negotiations.",
        dataPoint: "Agreeableness",
        facet: "Compliance",
        scale: "1-7 Likert",
        reference: "Costa & McCrae (1992) NEO-PI-R"
      }},
      { id: "ocean_27", text: "I consider others' needs before my own", type: "scale", metadata: {
        theory: "Big Five / OCEAN Model",
        theoryDescription: "Other-orientation predicts reader-focused writing that anticipates audience needs.",
        dataPoint: "Agreeableness",
        facet: "Altruism",
        scale: "1-7 Likert",
        reference: "Costa & McCrae (1992) NEO-PI-R"
      }},
      { id: "ocean_28", text: "I believe the best in people", type: "scale", metadata: {
        theory: "Big Five / OCEAN Model",
        theoryDescription: "Positive view of human nature influences tone and character portrayal in writing.",
        dataPoint: "Agreeableness",
        facet: "Trust",
        scale: "1-7 Likert",
        reference: "Costa & McCrae (1992) NEO-PI-R"
      }},
      // Neuroticism (7 questions)
      { id: "ocean_29", text: "I get stressed easily", type: "scale", metadata: {
        theory: "Big Five / OCEAN Model",
        theoryDescription: "Neuroticism reflects emotional instability and tendency to experience negative emotions. Low N indicates emotional stability.",
        dataPoint: "Neuroticism",
        facet: "Anxiety",
        scale: "1-7 Likert",
        reference: "Costa & McCrae (1992) NEO-PI-R"
      }},
      { id: "ocean_30", text: "I worry about things", type: "scale", metadata: {
        theory: "Big Five / OCEAN Model",
        theoryDescription: "Worry tendency affects risk assessment in writing and attention to potential problems.",
        dataPoint: "Neuroticism",
        facet: "Anxiety",
        scale: "1-7 Likert",
        reference: "Costa & McCrae (1992) NEO-PI-R"
      }},
      { id: "ocean_31", text: "My mood changes frequently", type: "scale", metadata: {
        theory: "Big Five / OCEAN Model",
        theoryDescription: "Mood volatility indicates emotional range that can bring depth to writing.",
        dataPoint: "Neuroticism",
        facet: "Depression",
        scale: "1-7 Likert",
        reference: "Costa & McCrae (1992) NEO-PI-R"
      }},
      { id: "ocean_32", text: "I get upset easily", type: "scale", metadata: {
        theory: "Big Five / OCEAN Model",
        theoryDescription: "Emotional reactivity measures sensitivity to negative stimuli and frustration tolerance.",
        dataPoint: "Neuroticism",
        facet: "Angry Hostility",
        scale: "1-7 Likert",
        reference: "Costa & McCrae (1992) NEO-PI-R"
      }},
      { id: "ocean_33", text: "I often feel anxious", type: "scale", metadata: {
        theory: "Big Five / OCEAN Model",
        theoryDescription: "Trait anxiety indicates chronic tendency toward worry and apprehension.",
        dataPoint: "Neuroticism",
        facet: "Anxiety",
        scale: "1-7 Likert",
        reference: "Costa & McCrae (1992) NEO-PI-R"
      }},
      { id: "ocean_34", text: "I dwell on past mistakes", type: "scale", metadata: {
        theory: "Big Five / OCEAN Model",
        theoryDescription: "Rumination tendency affects self-reflection depth and introspective writing quality.",
        dataPoint: "Neuroticism",
        facet: "Self-Consciousness",
        scale: "1-7 Likert",
        reference: "Costa & McCrae (1992) NEO-PI-R"
      }},
      { id: "ocean_35", text: "I feel overwhelmed by emotions", type: "scale", metadata: {
        theory: "Big Five / OCEAN Model",
        theoryDescription: "Emotional overwhelm reflects vulnerability to stress and intense feeling states.",
        dataPoint: "Neuroticism",
        facet: "Vulnerability",
        scale: "1-7 Likert",
        reference: "Costa & McCrae (1992) NEO-PI-R"
      }},
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
      { id: "cog_1", text: "When learning something new, I prefer diagrams over written explanations", type: "scale", metadata: {
        theory: "Dual Coding Theory / VARK Learning Styles",
        theoryDescription: "Paivio's dual coding theory suggests we process visual and verbal information through separate channels. Some learners have stronger visual-spatial processing.",
        dataPoint: "Visual vs. Verbal Processing",
        facet: "Learning Modality Preference",
        reference: "Paivio (1986); Fleming & Mills (1992)"
      }},
      { id: "cog_2", text: "I trust my gut feelings more than logical analysis", type: "scale", metadata: {
        theory: "Cognitive-Experiential Self-Theory (CEST)",
        theoryDescription: "Epstein's theory distinguishes between rational (analytical) and experiential (intuitive) processing systems. Both are valid but suit different situations.",
        dataPoint: "Analytical vs. Intuitive Processing",
        facet: "Decision-Making Style",
        reference: "Epstein (1994); Kahneman (2011) System 1/2"
      }},
      { id: "cog_3", text: "I like to understand the big picture before details", type: "scale", metadata: {
        theory: "Global vs. Local Processing",
        theoryDescription: "Some thinkers prefer top-down processing (holistic, gestalt) while others prefer bottom-up (detail-oriented, sequential).",
        dataPoint: "Global vs. Local Processing",
        facet: "Information Processing Style",
        reference: "Navon (1977); Riding & Rayner (1998)"
      }},
      { id: "cog_4", text: "I prefer to learn by doing rather than reading instructions", type: "scale", metadata: {
        theory: "Experiential Learning Theory",
        theoryDescription: "Kolb's model identifies active experimentation as a learning preference where knowledge is created through hands-on experience.",
        dataPoint: "Active vs. Reflective Learning",
        facet: "Learning Approach",
        reference: "Kolb (1984) Experiential Learning"
      }},
      { id: "cog_5", text: "I remember things better when I see them written down", type: "scale", metadata: {
        theory: "Working Memory / Visual Processing",
        theoryDescription: "Visual memory encoding strength varies between individuals, affecting learning and recall strategies.",
        dataPoint: "Visual Memory Encoding",
        facet: "Memory Processing",
        reference: "Baddeley (2000) Working Memory Model"
      }},
      { id: "cog_6", text: "I need to understand why something works before I can use it", type: "scale", metadata: {
        theory: "Need for Cognition",
        theoryDescription: "The tendency to engage in and enjoy effortful cognitive activity. High need for cognition correlates with deeper processing.",
        dataPoint: "Need for Cognition",
        facet: "Understanding Orientation",
        reference: "Cacioppo & Petty (1982)"
      }},
      { id: "cog_7", text: "I prefer structured information over free-form content", type: "scale", metadata: {
        theory: "Tolerance for Ambiguity",
        theoryDescription: "Some individuals thrive with clear structure while others work well with ambiguity and open-ended information.",
        dataPoint: "Structure Preference",
        facet: "Ambiguity Tolerance",
        reference: "Budner (1962); Furnham & Ribchester (1995)"
      }},
      { id: "cog_8", text: "I often see connections that others miss", type: "scale", metadata: {
        theory: "Associative Thinking / Remote Associations",
        theoryDescription: "The ability to make non-obvious connections between disparate concepts is central to creative thinking and insight.",
        dataPoint: "Associative Fluency",
        facet: "Creative Cognition",
        reference: "Mednick (1962) Remote Associates Test"
      }},
      { id: "cog_9", text: "I prefer to focus on one thing at a time rather than multitask", type: "scale", metadata: {
        theory: "Attention & Executive Function",
        theoryDescription: "Task-switching has cognitive costs. Some individuals are more efficient with sustained focus vs. divided attention.",
        dataPoint: "Attention Style",
        facet: "Task Management",
        reference: "Monsell (2003); Ophir et al. (2009)"
      }},
      { id: "cog_10", text: "I need quiet to concentrate effectively", type: "scale", metadata: {
        theory: "Optimal Stimulation Theory",
        theoryDescription: "Individuals differ in their optimal level of environmental stimulation for cognitive performance.",
        dataPoint: "Environmental Sensitivity",
        facet: "Concentration Requirements",
        reference: "Yerkes-Dodson Law; Mehrabian (1977)"
      }},
      { id: "cog_11", text: "I learn best from concrete examples rather than abstract theories", type: "scale", metadata: {
        theory: "Concrete vs. Abstract Reasoning",
        theoryDescription: "Learning style preference between concrete examples (grounded) and abstract principles (theoretical).",
        dataPoint: "Abstraction Preference",
        facet: "Learning Style",
        reference: "Kolb (1984); Gregorc (1979)"
      }},
      { id: "cog_12", text: "I often think in metaphors and analogies", type: "scale", metadata: {
        theory: "Analogical Reasoning",
        theoryDescription: "Metaphorical thinking enables transfer of knowledge between domains and is crucial for explanation and creativity.",
        dataPoint: "Metaphorical Thinking",
        facet: "Reasoning Style",
        reference: "Lakoff & Johnson (1980); Gentner (1983)"
      }},
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
      { id: "eq_1", text: "I can usually tell how others are feeling by their expression", type: "scale", metadata: {
        theory: "Emotional Intelligence (Goleman/Mayer-Salovey)",
        theoryDescription: "EI is the ability to perceive, use, understand, and manage emotions. Social perception is fundamental to empathetic writing.",
        dataPoint: "Social Perception",
        facet: "Perceiving Emotions",
        reference: "Mayer & Salovey (1997); Goleman (1995)"
      }},
      { id: "eq_2", text: "I am good at managing my emotions under stress", type: "scale", metadata: {
        theory: "Emotional Regulation",
        theoryDescription: "The ability to modulate emotional responses is crucial for sustained creative work and handling criticism.",
        dataPoint: "Emotional Regulation",
        facet: "Managing Emotions",
        reference: "Gross (2002) Process Model of Emotion Regulation"
      }},
      { id: "eq_3", text: "I find it easy to put my feelings into words", type: "scale", metadata: {
        theory: "Emotional Granularity",
        theoryDescription: "The ability to make fine-grained distinctions between emotions. High granularity enables richer emotional writing.",
        dataPoint: "Emotional Vocabulary",
        facet: "Emotional Expression",
        reference: "Barrett (2004); Kashdan et al. (2015)"
      }},
      { id: "eq_4", text: "I am aware of my emotional reactions as they happen", type: "scale", metadata: {
        theory: "Interoceptive Awareness",
        theoryDescription: "Real-time awareness of one's emotional states enables authentic expression and self-regulation.",
        dataPoint: "Emotional Self-Awareness",
        facet: "Self-Awareness",
        reference: "Damasio (1999); Craig (2009)"
      }},
      { id: "eq_5", text: "I can calm myself down when I feel angry or frustrated", type: "scale", metadata: {
        theory: "Emotional Self-Regulation",
        theoryDescription: "Down-regulation of negative emotions is essential for maintaining focus during creative work.",
        dataPoint: "Down-Regulation Ability",
        facet: "Self-Management",
        reference: "Gross (1998); Ochsner & Gross (2005)"
      }},
      { id: "eq_6", text: "I pick up on the emotional undercurrents in a group", type: "scale", metadata: {
        theory: "Social Intelligence",
        theoryDescription: "Reading group dynamics enables authentic portrayal of social situations in writing.",
        dataPoint: "Group Emotional Perception",
        facet: "Social Awareness",
        reference: "Goleman (2006) Social Intelligence"
      }},
      { id: "eq_7", text: "I can motivate myself even when I don't feel like it", type: "scale", metadata: {
        theory: "Self-Motivation / Emotional Self-Efficacy",
        theoryDescription: "Using emotions to facilitate goal pursuit is crucial for completing long-term writing projects.",
        dataPoint: "Self-Motivation",
        facet: "Using Emotions",
        reference: "Mayer & Salovey (1997); Bandura (1997)"
      }},
      { id: "eq_8", text: "I understand why I react emotionally to certain situations", type: "scale", metadata: {
        theory: "Emotional Understanding",
        theoryDescription: "Understanding emotion triggers enables more nuanced character development and self-reflection.",
        dataPoint: "Emotional Insight",
        facet: "Understanding Emotions",
        reference: "Mayer & Salovey (1997)"
      }},
      { id: "eq_9", text: "I can sense when someone is upset even if they don't say anything", type: "scale", metadata: {
        theory: "Empathic Accuracy",
        theoryDescription: "The ability to accurately infer others' emotional states from non-verbal cues.",
        dataPoint: "Non-Verbal Perception",
        facet: "Empathy",
        reference: "Ickes (1993); Zaki et al. (2009)"
      }},
      { id: "eq_10", text: "I can express my emotions appropriately in different situations", type: "scale", metadata: {
        theory: "Emotional Display Rules",
        theoryDescription: "Adapting emotional expression to context is key for appropriate tone in different writing genres.",
        dataPoint: "Contextual Emotional Expression",
        facet: "Social Skills",
        reference: "Ekman & Friesen (1969); Matsumoto (1990)"
      }},
      { id: "eq_11", text: "I use my emotions to guide my decision-making", type: "scale", metadata: {
        theory: "Somatic Marker Hypothesis",
        theoryDescription: "Emotions provide valuable information for decision-making. Writers who trust emotional signals often produce more authentic work.",
        dataPoint: "Emotional-Rational Integration",
        facet: "Using Emotions",
        reference: "Damasio (1994) Descartes' Error"
      }},
      { id: "eq_12", text: "I can help others feel better when they're upset", type: "scale", metadata: {
        theory: "Interpersonal Emotion Regulation",
        theoryDescription: "The ability to influence others' emotions is central to persuasive and emotionally resonant writing.",
        dataPoint: "Emotional Influence",
        facet: "Relationship Management",
        reference: "Zaki & Williams (2013)"
      }},
      { id: "eq_13", text: "I recognize how my feelings affect my performance", type: "scale", metadata: {
        theory: "Meta-Emotion",
        theoryDescription: "Awareness of how emotions impact cognition enables better creative process management.",
        dataPoint: "Emotion-Performance Awareness",
        facet: "Self-Awareness",
        reference: "Gottman et al. (1996)"
      }},
      { id: "eq_14", text: "I can read between the lines in conversations", type: "scale", metadata: {
        theory: "Social Cognition / Theory of Mind",
        theoryDescription: "Inferring unstated meaning is essential for subtext in dialogue and complex character interactions.",
        dataPoint: "Implicit Communication Reading",
        facet: "Social Perception",
        reference: "Premack & Woodruff (1978); Baron-Cohen (1995)"
      }},
      { id: "eq_15", text: "I adapt my communication style based on others' emotional states", type: "scale", metadata: {
        theory: "Communication Accommodation",
        theoryDescription: "Adjusting communication to audience emotional state is fundamental to effective writing across contexts.",
        dataPoint: "Adaptive Communication",
        facet: "Relationship Management",
        reference: "Giles (2008) Communication Accommodation Theory"
      }},
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
      { id: "disc_1", text: "I prefer to get straight to the point in conversations", type: "scale", metadata: {
        theory: "DISC Behavioral Model",
        theoryDescription: "DISC measures behavioral styles in four dimensions. Dominance reflects results-orientation, directness, and decisiveness.",
        dataPoint: "Dominance",
        facet: "Directness",
        reference: "Marston (1928); DiSC Assessment"
      }},
      { id: "disc_2", text: "I am comfortable taking charge in group situations", type: "scale", metadata: {
        theory: "DISC Behavioral Model",
        theoryDescription: "High D individuals naturally take leadership roles and focus on achieving results.",
        dataPoint: "Dominance",
        facet: "Leadership",
        reference: "Marston (1928); DiSC Assessment"
      }},
      // Influence
      { id: "disc_3", text: "I enjoy inspiring and motivating others", type: "scale", metadata: {
        theory: "DISC Behavioral Model",
        theoryDescription: "Influence reflects enthusiasm, optimism, and focus on relationships and persuasion.",
        dataPoint: "Influence",
        facet: "Inspiration",
        reference: "Marston (1928); DiSC Assessment"
      }},
      { id: "disc_4", text: "I am enthusiastic and optimistic in my communication", type: "scale", metadata: {
        theory: "DISC Behavioral Model",
        theoryDescription: "High I individuals communicate with energy and positive emotion, creating engaging prose.",
        dataPoint: "Influence",
        facet: "Enthusiasm",
        reference: "Marston (1928); DiSC Assessment"
      }},
      // Steadiness
      { id: "disc_5", text: "I value stability and consistency", type: "scale", metadata: {
        theory: "DISC Behavioral Model",
        theoryDescription: "Steadiness reflects patience, reliability, and focus on cooperation and support.",
        dataPoint: "Steadiness",
        facet: "Stability",
        reference: "Marston (1928); DiSC Assessment"
      }},
      { id: "disc_6", text: "I prefer to support others rather than lead", type: "scale", metadata: {
        theory: "DISC Behavioral Model",
        theoryDescription: "High S individuals create supportive, approachable writing that builds trust.",
        dataPoint: "Steadiness",
        facet: "Support",
        reference: "Marston (1928); DiSC Assessment"
      }},
      // Conscientiousness
      { id: "disc_7", text: "I focus on accuracy and quality in my work", type: "scale", metadata: {
        theory: "DISC Behavioral Model",
        theoryDescription: "Conscientiousness (in DISC) reflects precision, analysis, and quality focus.",
        dataPoint: "Conscientiousness (DISC)",
        facet: "Accuracy",
        reference: "Marston (1928); DiSC Assessment"
      }},
      { id: "disc_8", text: "I prefer to have all the facts before making decisions", type: "scale", metadata: {
        theory: "DISC Behavioral Model",
        theoryDescription: "High C individuals produce thoroughly researched, fact-based writing.",
        dataPoint: "Conscientiousness (DISC)",
        facet: "Analysis",
        reference: "Marston (1928); DiSC Assessment"
      }},
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
      { id: "val_1", text: "Achievement and success are very important to me", type: "scale", metadata: {
        theory: "Schwartz's Theory of Basic Human Values",
        theoryDescription: "Schwartz identified 10 universal value types organized in a circular structure. Achievement emphasizes personal success through demonstrating competence according to social standards.",
        dataPoint: "Achievement Value",
        facet: "Personal Success",
        reference: "Schwartz (1992, 2012) - Theory of Basic Human Values"
      }},
      { id: "val_2", text: "I value being of service to others", type: "scale", metadata: {
        theory: "Schwartz's Theory of Basic Human Values",
        theoryDescription: "Benevolence focuses on preserving and enhancing the welfare of people with whom one is in frequent personal contact.",
        dataPoint: "Benevolence Value",
        facet: "Caring/Helpfulness",
        reference: "Schwartz (1992, 2012) - Theory of Basic Human Values"
      }},
      { id: "val_3", text: "Personal freedom and independence matter greatly to me", type: "scale", metadata: {
        theory: "Schwartz's Theory of Basic Human Values",
        theoryDescription: "Self-Direction emphasizes independent thought and action—choosing, creating, exploring.",
        dataPoint: "Self-Direction Value",
        facet: "Autonomy/Independence",
        reference: "Schwartz (1992, 2012) - Theory of Basic Human Values"
      }},
      { id: "val_4", text: "Security and stability are priorities in my life", type: "scale", metadata: {
        theory: "Schwartz's Theory of Basic Human Values",
        theoryDescription: "Security emphasizes safety, harmony, and stability of society, relationships, and self.",
        dataPoint: "Security Value",
        facet: "Stability/Safety",
        reference: "Schwartz (1992, 2012) - Theory of Basic Human Values"
      }},
      { id: "val_5", text: "I seek novelty and excitement", type: "scale", metadata: {
        theory: "Schwartz's Theory of Basic Human Values",
        theoryDescription: "Stimulation emphasizes excitement, novelty, and challenge in life. Related to organismic need for variety.",
        dataPoint: "Stimulation Value",
        facet: "Excitement/Novelty",
        reference: "Schwartz (1992, 2012) - Theory of Basic Human Values"
      }},
      { id: "val_6", text: "Following traditions and customs is important to me", type: "scale", metadata: {
        theory: "Schwartz's Theory of Basic Human Values",
        theoryDescription: "Tradition emphasizes respect, commitment, and acceptance of customs and ideas from culture or religion.",
        dataPoint: "Tradition Value",
        facet: "Cultural Continuity",
        reference: "Schwartz (1992, 2012) - Theory of Basic Human Values"
      }},
      { id: "val_7", text: "I value having power and influence over others", type: "scale", metadata: {
        theory: "Schwartz's Theory of Basic Human Values",
        theoryDescription: "Power emphasizes social status and prestige, control or dominance over people and resources.",
        dataPoint: "Power Value",
        facet: "Social Status/Dominance",
        reference: "Schwartz (1992, 2012) - Theory of Basic Human Values"
      }},
      { id: "val_8", text: "Protecting nature and the environment matters to me", type: "scale", metadata: {
        theory: "Schwartz's Theory of Basic Human Values",
        theoryDescription: "Universalism emphasizes understanding, appreciation, tolerance, and protection for welfare of all people and nature.",
        dataPoint: "Universalism Value",
        facet: "Environmental Protection",
        reference: "Schwartz (1992, 2012) - Theory of Basic Human Values"
      }},
      { id: "val_9", text: "I believe in equality and justice for all", type: "scale", metadata: {
        theory: "Schwartz's Theory of Basic Human Values",
        theoryDescription: "Universalism encompasses social justice, equality, and broad-mindedness extending beyond one's in-group.",
        dataPoint: "Universalism Value",
        facet: "Social Justice/Equality",
        reference: "Schwartz (1992, 2012) - Theory of Basic Human Values"
      }},
      { id: "val_10", text: "Pleasure and enjoyment are important life goals", type: "scale", metadata: {
        theory: "Schwartz's Theory of Basic Human Values",
        theoryDescription: "Hedonism emphasizes pleasure and sensuous gratification for oneself, derived from organismic needs.",
        dataPoint: "Hedonism Value",
        facet: "Pleasure/Gratification",
        reference: "Schwartz (1992, 2012) - Theory of Basic Human Values"
      }},
      { id: "val_11", text: "I value conforming to social norms and expectations", type: "scale", metadata: {
        theory: "Schwartz's Theory of Basic Human Values",
        theoryDescription: "Conformity emphasizes restraint of actions, inclinations, and impulses likely to upset or harm others and violate social expectations.",
        dataPoint: "Conformity Value",
        facet: "Social Compliance",
        reference: "Schwartz (1992, 2012) - Theory of Basic Human Values"
      }},
      { id: "val_12", text: "Creativity and self-expression are core to who I am", type: "scale", metadata: {
        theory: "Schwartz's Theory of Basic Human Values",
        theoryDescription: "Self-Direction includes creativity as expressing one's uniqueness and independent thought.",
        dataPoint: "Self-Direction Value",
        facet: "Creativity/Self-Expression",
        reference: "Schwartz (1992, 2012) - Theory of Basic Human Values"
      }},
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
      { id: "via_1", text: "I regularly come up with new ideas and ways of doing things", type: "scale", metadata: {
        theory: "VIA Classification of Character Strengths",
        theoryDescription: "The VIA identifies 24 character strengths organized into 6 virtues. Creativity falls under Wisdom and involves producing novel ideas or behaviors.",
        dataPoint: "Creativity",
        facet: "Wisdom & Knowledge Virtue",
        reference: "Peterson & Seligman (2004) - Character Strengths and Virtues"
      }},
      { id: "via_2", text: "I am always curious and eager to explore new topics", type: "scale", metadata: {
        theory: "VIA Classification of Character Strengths",
        theoryDescription: "Curiosity reflects an openness to experience and intrinsic interest in ongoing experience for its own sake.",
        dataPoint: "Curiosity",
        facet: "Wisdom & Knowledge Virtue",
        reference: "Peterson & Seligman (2004) - Character Strengths and Virtues"
      }},
      { id: "via_3", text: "I love learning new skills and knowledge", type: "scale", metadata: {
        theory: "VIA Classification of Character Strengths",
        theoryDescription: "Love of Learning is mastering new skills, topics, and bodies of knowledge, whether on one's own or formally.",
        dataPoint: "Love of Learning",
        facet: "Wisdom & Knowledge Virtue",
        reference: "Peterson & Seligman (2004) - Character Strengths and Virtues"
      }},
      { id: "via_4", text: "I can see situations from multiple perspectives", type: "scale", metadata: {
        theory: "VIA Classification of Character Strengths",
        theoryDescription: "Perspective/Wisdom is the ability to provide wise counsel to others and see the big picture.",
        dataPoint: "Perspective (Wisdom)",
        facet: "Wisdom & Knowledge Virtue",
        reference: "Peterson & Seligman (2004) - Character Strengths and Virtues"
      }},
      { id: "via_5", text: "I stand up for what I believe even when it's difficult", type: "scale", metadata: {
        theory: "VIA Classification of Character Strengths",
        theoryDescription: "Bravery is not shrinking from threat, challenge, difficulty, or pain; speaking up for what is right.",
        dataPoint: "Bravery",
        facet: "Courage Virtue",
        reference: "Peterson & Seligman (2004) - Character Strengths and Virtues"
      }},
      { id: "via_6", text: "I always tell the truth, even when it's uncomfortable", type: "scale", metadata: {
        theory: "VIA Classification of Character Strengths",
        theoryDescription: "Honesty involves speaking the truth and presenting oneself in a genuine way; being authentic.",
        dataPoint: "Honesty/Authenticity",
        facet: "Courage Virtue",
        reference: "Peterson & Seligman (2004) - Character Strengths and Virtues"
      }},
      { id: "via_7", text: "I enjoy doing kind things for others", type: "scale", metadata: {
        theory: "VIA Classification of Character Strengths",
        theoryDescription: "Kindness is doing favors and good deeds for others; helping them; taking care of them.",
        dataPoint: "Kindness",
        facet: "Humanity Virtue",
        reference: "Peterson & Seligman (2004) - Character Strengths and Virtues"
      }},
      { id: "via_8", text: "I work well as part of a team", type: "scale", metadata: {
        theory: "VIA Classification of Character Strengths",
        theoryDescription: "Teamwork is working well as a member of a group or team; being loyal to the group; doing one's share.",
        dataPoint: "Teamwork",
        facet: "Justice Virtue",
        reference: "Peterson & Seligman (2004) - Character Strengths and Virtues"
      }},
      { id: "via_9", text: "I treat everyone fairly regardless of who they are", type: "scale", metadata: {
        theory: "VIA Classification of Character Strengths",
        theoryDescription: "Fairness is treating all people the same according to notions of fairness and justice; not letting biases influence decisions.",
        dataPoint: "Fairness",
        facet: "Justice Virtue",
        reference: "Peterson & Seligman (2004) - Character Strengths and Virtues"
      }},
      { id: "via_10", text: "I can forgive people who have wronged me", type: "scale", metadata: {
        theory: "VIA Classification of Character Strengths",
        theoryDescription: "Forgiveness is forgiving those who have done wrong; accepting others' shortcomings; giving people a second chance.",
        dataPoint: "Forgiveness",
        facet: "Temperance Virtue",
        reference: "Peterson & Seligman (2004) - Character Strengths and Virtues"
      }},
      { id: "via_11", text: "I am modest about my achievements", type: "scale", metadata: {
        theory: "VIA Classification of Character Strengths",
        theoryDescription: "Humility/Modesty is letting one's accomplishments speak for themselves; not seeking the spotlight.",
        dataPoint: "Humility/Modesty",
        facet: "Temperance Virtue",
        reference: "Peterson & Seligman (2004) - Character Strengths and Virtues"
      }},
      { id: "via_12", text: "I think carefully before making decisions", type: "scale", metadata: {
        theory: "VIA Classification of Character Strengths",
        theoryDescription: "Prudence is being careful about one's choices; not saying or doing things that might later be regretted.",
        dataPoint: "Prudence",
        facet: "Temperance Virtue",
        reference: "Peterson & Seligman (2004) - Character Strengths and Virtues"
      }},
      { id: "via_13", text: "I can control my impulses and emotions", type: "scale", metadata: {
        theory: "VIA Classification of Character Strengths",
        theoryDescription: "Self-Regulation is regulating what one feels and does; being disciplined; controlling appetites and emotions.",
        dataPoint: "Self-Regulation",
        facet: "Temperance Virtue",
        reference: "Peterson & Seligman (2004) - Character Strengths and Virtues"
      }},
      { id: "via_14", text: "I notice and appreciate beauty in the world", type: "scale", metadata: {
        theory: "VIA Classification of Character Strengths",
        theoryDescription: "Appreciation of Beauty & Excellence involves noticing and appreciating beauty, excellence, and skilled performance in all domains.",
        dataPoint: "Appreciation of Beauty",
        facet: "Transcendence Virtue",
        reference: "Peterson & Seligman (2004) - Character Strengths and Virtues"
      }},
      { id: "via_15", text: "I feel grateful for what I have", type: "scale", metadata: {
        theory: "VIA Classification of Character Strengths",
        theoryDescription: "Gratitude is being aware of and thankful for good things that happen; taking time to express thanks.",
        dataPoint: "Gratitude",
        facet: "Transcendence Virtue",
        reference: "Peterson & Seligman (2004) - Character Strengths and Virtues"
      }},
      { id: "via_16", text: "I remain hopeful even in difficult times", type: "scale", metadata: {
        theory: "VIA Classification of Character Strengths",
        theoryDescription: "Hope involves expecting the best in the future and working to achieve it; believing a good future is obtainable.",
        dataPoint: "Hope/Optimism",
        facet: "Transcendence Virtue",
        reference: "Peterson & Seligman (2004) - Character Strengths and Virtues"
      }},
      { id: "via_17", text: "I use humor to lighten the mood", type: "scale", metadata: {
        theory: "VIA Classification of Character Strengths",
        theoryDescription: "Humor is liking to laugh and tease; bringing smiles to other people; seeing the light side.",
        dataPoint: "Humor/Playfulness",
        facet: "Transcendence Virtue",
        reference: "Peterson & Seligman (2004) - Character Strengths and Virtues"
      }},
      { id: "via_18", text: "I have a sense of meaning and purpose in life", type: "scale", metadata: {
        theory: "VIA Classification of Character Strengths",
        theoryDescription: "Spirituality involves having coherent beliefs about the higher purpose and meaning of the universe.",
        dataPoint: "Spirituality/Purpose",
        facet: "Transcendence Virtue",
        reference: "Peterson & Seligman (2004) - Character Strengths and Virtues"
      }},
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
      { id: "enn_1", text: "I strive for perfection and have high standards", type: "scale", metadata: {
        theory: "Enneagram of Personality",
        theoryDescription: "The Enneagram describes 9 personality types based on core motivations and fears. Type 1 (Reformer) is driven by improvement and correctness.",
        dataPoint: "Type 1 - The Reformer",
        facet: "Core: Integrity & Improvement",
        reference: "Riso & Hudson (1999) - The Wisdom of the Enneagram"
      }},
      { id: "enn_2", text: "I naturally focus on helping and supporting others", type: "scale", metadata: {
        theory: "Enneagram of Personality",
        theoryDescription: "Type 2 (Helper) is motivated by a need to be loved and appreciated through giving support to others.",
        dataPoint: "Type 2 - The Helper",
        facet: "Core: Relationships & Nurturing",
        reference: "Riso & Hudson (1999) - The Wisdom of the Enneagram"
      }},
      { id: "enn_3", text: "Achievement and success are central to my identity", type: "scale", metadata: {
        theory: "Enneagram of Personality",
        theoryDescription: "Type 3 (Achiever) is driven by success, recognition, and the desire to be valued for accomplishments.",
        dataPoint: "Type 3 - The Achiever",
        facet: "Core: Success & Image",
        reference: "Riso & Hudson (1999) - The Wisdom of the Enneagram"
      }},
      { id: "enn_4", text: "I often feel different from others and value authenticity deeply", type: "scale", metadata: {
        theory: "Enneagram of Personality",
        theoryDescription: "Type 4 (Individualist) seeks identity and significance through uniqueness and authentic self-expression.",
        dataPoint: "Type 4 - The Individualist",
        facet: "Core: Identity & Authenticity",
        reference: "Riso & Hudson (1999) - The Wisdom of the Enneagram"
      }},
      { id: "enn_5", text: "I need time alone to think and recharge", type: "scale", metadata: {
        theory: "Enneagram of Personality",
        theoryDescription: "Type 5 (Investigator) is driven by the need to understand the world through observation and knowledge gathering.",
        dataPoint: "Type 5 - The Investigator",
        facet: "Core: Knowledge & Independence",
        reference: "Riso & Hudson (1999) - The Wisdom of the Enneagram"
      }},
      { id: "enn_6", text: "I tend to anticipate problems and prepare for worst-case scenarios", type: "scale", metadata: {
        theory: "Enneagram of Personality",
        theoryDescription: "Type 6 (Loyalist) seeks security and support, often anticipating potential problems and preparing for them.",
        dataPoint: "Type 6 - The Loyalist",
        facet: "Core: Security & Trust",
        reference: "Riso & Hudson (1999) - The Wisdom of the Enneagram"
      }},
      { id: "enn_7", text: "I seek new experiences and avoid pain or boredom", type: "scale", metadata: {
        theory: "Enneagram of Personality",
        theoryDescription: "Type 7 (Enthusiast) is motivated by the desire for varied experiences, freedom, and avoiding limitation or pain.",
        dataPoint: "Type 7 - The Enthusiast",
        facet: "Core: Joy & Freedom",
        reference: "Riso & Hudson (1999) - The Wisdom of the Enneagram"
      }},
      { id: "enn_8", text: "I am direct and assertive in pursuing what I want", type: "scale", metadata: {
        theory: "Enneagram of Personality",
        theoryDescription: "Type 8 (Challenger) is driven by strength, control, and protecting oneself and others through direct action.",
        dataPoint: "Type 8 - The Challenger",
        facet: "Core: Power & Protection",
        reference: "Riso & Hudson (1999) - The Wisdom of the Enneagram"
      }},
      { id: "enn_9", text: "I prefer harmony and avoiding conflict", type: "scale", metadata: {
        theory: "Enneagram of Personality",
        theoryDescription: "Type 9 (Peacemaker) seeks inner and outer peace, harmony, and unity, often merging with others' perspectives.",
        dataPoint: "Type 9 - The Peacemaker",
        facet: "Core: Peace & Harmony",
        reference: "Riso & Hudson (1999) - The Wisdom of the Enneagram"
      }},
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
      { id: "cre_1", text: "I enjoy generating many different ideas before settling on one", type: "scale", metadata: {
        theory: "Divergent Thinking / Creativity Research",
        theoryDescription: "Divergent thinking is the ability to generate many different ideas or solutions. Guilford's model distinguishes it from convergent thinking.",
        dataPoint: "Divergent Thinking",
        facet: "Fluency - Quantity of Ideas",
        reference: "Guilford (1967); Torrance Tests of Creative Thinking"
      }},
      { id: "cre_2", text: "I am comfortable taking creative risks", type: "scale", metadata: {
        theory: "Creative Self-Efficacy & Risk-Taking",
        theoryDescription: "Creative risk-taking reflects willingness to pursue novel ideas despite uncertainty. Essential for creative achievement.",
        dataPoint: "Creative Risk Tolerance",
        facet: "Risk-Taking Propensity",
        reference: "Sternberg & Lubart (1996) - Investment Theory of Creativity"
      }},
      { id: "cre_3", text: "I prefer novel approaches over tried-and-true methods", type: "scale", metadata: {
        theory: "Openness to Experience / Creativity",
        theoryDescription: "Preference for novelty over familiarity is a key component of creative personality, linked to Openness in Big Five.",
        dataPoint: "Novelty Preference",
        facet: "Novelty Seeking",
        reference: "McCrae (1987) - Creativity, Divergent Thinking, and Openness to Experience"
      }},
      { id: "cre_4", text: "I can easily make connections between unrelated concepts", type: "scale", metadata: {
        theory: "Remote Associations & Creativity",
        theoryDescription: "Remote associative thinking - connecting distant concepts - is central to creative insight and originality.",
        dataPoint: "Associative Thinking",
        facet: "Remote Associations",
        reference: "Mednick (1962) - Remote Associates Test (RAT)"
      }},
      { id: "cre_5", text: "I enjoy ambiguity and open-ended problems", type: "scale", metadata: {
        theory: "Tolerance for Ambiguity",
        theoryDescription: "Tolerance for ambiguity predicts creative achievement. Creative people embrace uncertainty rather than seeking closure.",
        dataPoint: "Ambiguity Tolerance",
        facet: "Comfort with Uncertainty",
        reference: "Zenasni et al. (2008) - Creativity and Tolerance for Ambiguity"
      }},
      { id: "cre_6", text: "I often challenge conventional thinking", type: "scale", metadata: {
        theory: "Nonconformity & Creative Personality",
        theoryDescription: "Creative individuals often question norms and resist conformity, enabling original thinking.",
        dataPoint: "Nonconformity",
        facet: "Independent Judgment",
        reference: "Barron (1968) - Creativity and Personal Freedom"
      }},
      { id: "cre_7", text: "I get excited by unusual or unexpected ideas", type: "scale", metadata: {
        theory: "Openness to Ideas",
        theoryDescription: "Enthusiasm for novel and unusual ideas reflects intellectual curiosity and creative potential.",
        dataPoint: "Idea Excitement",
        facet: "Curiosity for Novelty",
        reference: "Silvia et al. (2009) - Openness to Experience and Creativity"
      }},
      { id: "cre_8", text: "I prefer creating original work to following templates", type: "scale", metadata: {
        theory: "Creative vs. Adaptive Style",
        theoryDescription: "Kirton's Adaption-Innovation theory distinguishes those who create within systems (adaptors) from those who challenge systems (innovators).",
        dataPoint: "Innovation Style",
        facet: "Original vs. Adaptive",
        reference: "Kirton (1976) - Adaption-Innovation Theory"
      }},
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
      { id: "think_1", text: "I naturally look for cause-and-effect relationships", type: "scale", metadata: {
        theory: "Causal Reasoning",
        theoryDescription: "Causal reasoning is fundamental to understanding how events relate. It underlies scientific thinking and effective decision-making.",
        dataPoint: "Causal Thinking",
        facet: "Cause-Effect Analysis",
        reference: "Pearl (2009) - Causality: Models, Reasoning, and Inference"
      }},
      { id: "think_2", text: "I think about how different parts of a system interact", type: "scale", metadata: {
        theory: "Systems Thinking",
        theoryDescription: "Systems thinking considers interconnections and feedback loops rather than isolated components. Essential for understanding complex phenomena.",
        dataPoint: "Systems Thinking",
        facet: "Holistic Analysis",
        reference: "Senge (1990) - The Fifth Discipline; Meadows (2008)"
      }},
      { id: "think_3", text: "I question assumptions before accepting information", type: "scale", metadata: {
        theory: "Critical Thinking",
        theoryDescription: "Critical thinking involves questioning assumptions, evaluating arguments, and avoiding cognitive biases.",
        dataPoint: "Critical Thinking",
        facet: "Assumption Questioning",
        reference: "Facione (1990) - Critical Thinking Assessment; Paul & Elder (2006)"
      }},
      { id: "think_4", text: "I consider long-term consequences when making decisions", type: "scale", metadata: {
        theory: "Future-Oriented Thinking",
        theoryDescription: "Consideration of future consequences reflects temporal depth in reasoning and planning.",
        dataPoint: "Temporal Perspective",
        facet: "Long-term Orientation",
        reference: "Zimbardo & Boyd (1999) - Time Perspective Theory"
      }},
      { id: "think_5", text: "I enjoy finding patterns in complex information", type: "scale", metadata: {
        theory: "Pattern Recognition / Analytical Thinking",
        theoryDescription: "Pattern recognition is the ability to identify regularities in data, central to both analytical and creative problem-solving.",
        dataPoint: "Pattern Recognition",
        facet: "Complexity Analysis",
        reference: "Sternberg (1985) - Triarchic Theory of Intelligence"
      }},
      { id: "think_6", text: "I prefer to analyze all options before deciding", type: "scale", metadata: {
        theory: "Decision-Making Styles",
        theoryDescription: "Analytical decision-making involves thorough evaluation of alternatives before committing. Contrasts with intuitive styles.",
        dataPoint: "Analytical Decision-Making",
        facet: "Deliberative Style",
        reference: "Scott & Bruce (1995) - Decision-Making Style Inventory"
      }},
      { id: "think_7", text: "I naturally consider multiple viewpoints on issues", type: "scale", metadata: {
        theory: "Perspective-Taking / Dialectical Thinking",
        theoryDescription: "Considering multiple perspectives enables balanced analysis and synthesis of opposing views.",
        dataPoint: "Perspective Diversity",
        facet: "Multi-Perspective Analysis",
        reference: "Basseches (1984) - Dialectical Thinking"
      }},
      { id: "think_8", text: "I enjoy solving puzzles and logical problems", type: "scale", metadata: {
        theory: "Logical-Mathematical Intelligence",
        theoryDescription: "Enjoyment of logical puzzles reflects analytical intelligence and systematic reasoning preferences.",
        dataPoint: "Logical Reasoning",
        facet: "Problem-Solving Enjoyment",
        reference: "Gardner (1983) - Multiple Intelligences; Stanovich (2009)"
      }},
      { id: "think_9", text: "I think about underlying principles behind surface events", type: "scale", metadata: {
        theory: "Abstract Thinking / Deep Processing",
        theoryDescription: "Abstract thinking moves beyond surface features to underlying principles, enabling transfer and generalization.",
        dataPoint: "Abstract Reasoning",
        facet: "Principle Extraction",
        reference: "Piaget (1970) - Formal Operations; Chi et al. (1981)"
      }},
      { id: "think_10", text: "I evaluate evidence quality before drawing conclusions", type: "scale", metadata: {
        theory: "Evidence-Based Reasoning",
        theoryDescription: "Evidence evaluation is core to scientific thinking and avoiding confirmation bias.",
        dataPoint: "Evidence Evaluation",
        facet: "Epistemic Vigilance",
        reference: "Kuhn (1991) - Skills of Argument; Stanovich & West (2000)"
      }},
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
      { id: "wp_1", text: "I prefer short, punchy sentences over long, complex ones", type: "scale", metadata: {
        theory: "Readability & Sentence Structure",
        theoryDescription: "Sentence length affects readability and pace. Short sentences create urgency; longer ones allow complexity.",
        dataPoint: "Sentence Length Preference",
        facet: "Syntactic Style",
        reference: "Flesch (1949) - The Art of Readable Writing"
      }},
      { id: "wp_2", text: "I like to use sophisticated vocabulary", type: "scale", metadata: {
        theory: "Lexical Complexity",
        theoryDescription: "Vocabulary sophistication affects register, accessibility, and perceived expertise in writing.",
        dataPoint: "Vocabulary Complexity",
        facet: "Lexical Sophistication",
        reference: "Biber (1995) - Dimensions of Register Variation"
      }},
      { id: "wp_3", text: "I prefer formal writing to casual writing", type: "scale", metadata: {
        theory: "Register & Formality",
        theoryDescription: "Formality level shapes reader perception and appropriateness for different contexts.",
        dataPoint: "Formality Level",
        facet: "Register Selection",
        reference: "Biber & Conrad (2009) - Register, Genre, and Style"
      }},
      { id: "wp_4", text: "I often use metaphors and analogies", type: "scale", metadata: {
        theory: "Figurative Language & Cognition",
        theoryDescription: "Metaphors shape understanding by mapping abstract concepts to familiar experiences.",
        dataPoint: "Figurative Language Use",
        facet: "Metaphoric Expression",
        reference: "Lakoff & Johnson (1980) - Metaphors We Live By"
      }},
      { id: "wp_5", text: "I like to address the reader directly", type: "scale", metadata: {
        theory: "Reader Engagement / Stance",
        theoryDescription: "Direct address creates intimacy and engagement with readers, affecting authorial presence.",
        dataPoint: "Reader Address",
        facet: "Audience Engagement",
        reference: "Hyland (2005) - Metadiscourse"
      }},
      { id: "wp_6", text: "I enjoy using humor in my writing", type: "scale", metadata: {
        theory: "Humor in Writing",
        theoryDescription: "Humor affects reader engagement, memorability, and authorial voice perception.",
        dataPoint: "Humor Integration",
        facet: "Tonal Lightness",
        reference: "Martin (2007) - The Psychology of Humor"
      }},
      { id: "wp_7", text: "I prefer active voice over passive voice", type: "scale", metadata: {
        theory: "Voice & Agency",
        theoryDescription: "Active voice emphasizes agency and directness; passive voice can emphasize objectivity or de-emphasize actors.",
        dataPoint: "Voice Preference",
        facet: "Active vs. Passive",
        reference: "Strunk & White (1979) - Elements of Style; Williams (1990)"
      }},
      { id: "wp_8", text: "I like to include personal anecdotes and stories", type: "scale", metadata: {
        theory: "Narrative in Exposition",
        theoryDescription: "Personal stories increase engagement and make abstract concepts concrete through experience.",
        dataPoint: "Narrative Integration",
        facet: "Personal Storytelling",
        reference: "Bruner (1986) - Actual Minds, Possible Worlds"
      }},
      { id: "wp_9", text: "I prefer concrete examples over abstract concepts", type: "scale", metadata: {
        theory: "Concreteness in Communication",
        theoryDescription: "Concrete examples improve comprehension and retention compared to abstract discussion alone.",
        dataPoint: "Concreteness Preference",
        facet: "Example-Driven",
        reference: "Paivio (1971) - Dual Coding Theory"
      }},
      { id: "wp_10", text: "I use bullet points and lists frequently", type: "scale", metadata: {
        theory: "Information Design",
        theoryDescription: "Lists and bullets aid scanning and comprehension of discrete points.",
        dataPoint: "List Usage",
        facet: "Visual Organization",
        reference: "Tufte (2001) - The Visual Display of Quantitative Information"
      }},
      { id: "wp_11", text: "I like to ask rhetorical questions", type: "scale", metadata: {
        theory: "Rhetorical Devices",
        theoryDescription: "Rhetorical questions engage readers by prompting mental participation in the argument.",
        dataPoint: "Rhetorical Question Use",
        facet: "Interactive Rhetoric",
        reference: "Fahnestock (2011) - Rhetorical Style"
      }},
      { id: "wp_12", text: "I prefer comprehensive coverage over brevity", type: "scale", metadata: {
        theory: "Depth vs. Breadth",
        theoryDescription: "Balance between thoroughness and conciseness affects reader experience and information density.",
        dataPoint: "Coverage Preference",
        facet: "Comprehensiveness",
        reference: "Grice (1975) - Maxims of Quantity"
      }},
      { id: "wp_13", text: "I use transitional phrases between ideas", type: "scale", metadata: {
        theory: "Cohesion & Coherence",
        theoryDescription: "Transitional markers guide readers through logical connections between ideas.",
        dataPoint: "Transition Usage",
        facet: "Textual Cohesion",
        reference: "Halliday & Hasan (1976) - Cohesion in English"
      }},
      { id: "wp_14", text: "I like to define technical terms when I use them", type: "scale", metadata: {
        theory: "Reader Accommodation",
        theoryDescription: "Defining terms balances precision with accessibility for varied reader expertise.",
        dataPoint: "Term Definition",
        facet: "Audience Accommodation",
        reference: "Pinker (2014) - The Sense of Style"
      }},
      { id: "wp_15", text: "I prefer to build arguments gradually", type: "scale", metadata: {
        theory: "Argument Structure",
        theoryDescription: "Gradual vs. direct argument structures affect persuasion and reader journey through content.",
        dataPoint: "Argument Pacing",
        facet: "Inductive vs. Deductive",
        reference: "Toulmin (1958) - The Uses of Argument"
      }},
      { id: "wp_16", text: "I enjoy using vivid, descriptive language", type: "scale", metadata: {
        theory: "Descriptive Writing",
        theoryDescription: "Vivid language engages sensory imagination and increases memorability.",
        dataPoint: "Descriptive Richness",
        facet: "Sensory Language",
        reference: "Elbow (1981) - Writing with Power"
      }},
      { id: "wp_17", text: "I like to challenge readers with provocative statements", type: "scale", metadata: {
        theory: "Provocative Rhetoric",
        theoryDescription: "Provocative openings and challenges increase engagement but require careful calibration.",
        dataPoint: "Provocativeness",
        facet: "Reader Challenge",
        reference: "Burke (1969) - A Rhetoric of Motives"
      }},
      { id: "wp_18", text: "I prefer writing in first person", type: "scale", metadata: {
        theory: "Narrative Point of View",
        theoryDescription: "First-person creates intimacy and personal connection; third-person suggests objectivity.",
        dataPoint: "Person Preference",
        facet: "First vs. Third Person",
        reference: "Booth (1961) - The Rhetoric of Fiction"
      }},
      { id: "wp_19", text: "I use headings and subheadings to organize content", type: "scale", metadata: {
        theory: "Document Structure",
        theoryDescription: "Hierarchical organization aids navigation, comprehension, and selective reading.",
        dataPoint: "Structural Organization",
        facet: "Heading Usage",
        reference: "Kintsch (1998) - Comprehension: A Paradigm for Cognition"
      }},
      { id: "wp_20", text: "I like to end sections with summaries or key takeaways", type: "scale", metadata: {
        theory: "Information Reinforcement",
        theoryDescription: "Summaries and takeaways reinforce learning and aid retention of key points.",
        dataPoint: "Summary Integration",
        facet: "Reinforcement Strategy",
        reference: "Mayer (2009) - Multimedia Learning"
      }},
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
      { id: "reas_1", text: "I prefer to start with general principles and apply them to specific cases", type: "scale", metadata: {
        theory: "Deductive Reasoning",
        theoryDescription: "Deductive reasoning moves from general principles to specific conclusions. It provides certainty when premises are true.",
        dataPoint: "Deductive Preference",
        facet: "Top-Down Reasoning",
        reference: "Johnson-Laird (1999) - Deductive Reasoning"
      }},
      { id: "reas_2", text: "I build arguments by accumulating specific evidence first", type: "scale", metadata: {
        theory: "Inductive Reasoning",
        theoryDescription: "Inductive reasoning builds from specific observations to general conclusions. It generates new knowledge but with probabilistic confidence.",
        dataPoint: "Inductive Preference",
        facet: "Bottom-Up Reasoning",
        reference: "Holland et al. (1986) - Induction"
      }},
      { id: "reas_3", text: "I value statistical data over individual case studies", type: "scale", metadata: {
        theory: "Statistical vs. Narrative Evidence",
        theoryDescription: "Preference for statistical vs. narrative evidence affects persuasion style and argument construction.",
        dataPoint: "Evidence Type Preference",
        facet: "Quantitative vs. Qualitative",
        reference: "Kahneman (2011) - Thinking, Fast and Slow"
      }},
      { id: "reas_4", text: "I consider counterarguments when forming my position", type: "scale", metadata: {
        theory: "Two-Sided Argumentation",
        theoryDescription: "Considering counterarguments strengthens reasoning and increases persuasiveness by addressing objections.",
        dataPoint: "Counterargument Integration",
        facet: "Dialectical Thinking",
        reference: "O'Keefe (1999) - Two-Sided Messages"
      }},
      { id: "reas_5", text: "I prefer logical step-by-step reasoning over intuitive leaps", type: "scale", metadata: {
        theory: "Analytical vs. Intuitive Reasoning",
        theoryDescription: "Analytical reasoning is deliberate and sequential; intuitive reasoning is fast and holistic. Both have roles in problem-solving.",
        dataPoint: "Reasoning Style",
        facet: "Analytical vs. Intuitive",
        reference: "Epstein (1994) - CEST; Evans (2008) - Dual Process Theory"
      }},
      { id: "reas_6", text: "I acknowledge uncertainty and limitations in my conclusions", type: "scale", metadata: {
        theory: "Epistemic Humility",
        theoryDescription: "Acknowledging uncertainty reflects intellectual humility and calibrated confidence in conclusions.",
        dataPoint: "Epistemic Humility",
        facet: "Uncertainty Acknowledgment",
        reference: "Fischhoff et al. (1977) - Calibration of Probabilities"
      }},
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
  const [showTheoryInfo, setShowTheoryInfo] = useState(false);
  const [showLiveProfile, setShowLiveProfile] = useState(true);

  // Generate live profile from current answers + saved profile
  const liveProfile = useMemo(() => {
    // Build a combined profile from saved categories + current session answers
    const profileData: Record<string, Record<string, number>> = {};

    // Add saved category data
    for (const [categoryId, catData] of Object.entries(userProfile.categories)) {
      if (catData.completed && catData.answers) {
        const dbField = categoryToDbField[categoryId];
        if (dbField) {
          profileData[dbField] = catData.answers as Record<string, number>;
        }
      }
    }

    // Add current session answers for the active category
    if (selectedCategory && Object.keys(answers).length > 0) {
      const dbField = categoryToDbField[selectedCategory.id];
      if (dbField) {
        profileData[dbField] = answers;
      }
    }

    // Generate profile if we have any data
    if (Object.keys(profileData).length === 0) {
      return null;
    }

    const psychProfile = dbProfileToPsychometric(profileData);
    const toneProfile = generateToneProfile(psychProfile);
    const dossier = generatePersonalityDossier(psychProfile);

    return { toneProfile, dossier };
  }, [userProfile.categories, selectedCategory, answers]);

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
        <div className="flex gap-6">
          {/* Main Question Area */}
          <div className="flex-1 bg-base-100 rounded-2xl shadow-xl border border-base-200 p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-sm text-primary font-medium mb-1">{selectedCategory.name}</div>
                <h2 className="text-2xl font-bold">{selectedCategory.description}</h2>
              </div>
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setActivePhase("overview");
                  setAnswers({});
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
                <h3 className="text-xl font-medium mb-4">
                  {selectedCategory.questions[currentQuestionIndex].text}
                </h3>

                {/* Theory Info Dropdown */}
                {selectedCategory.questions[currentQuestionIndex].metadata && (
                  <div className="mb-6">
                    <button
                      onClick={() => setShowTheoryInfo(!showTheoryInfo)}
                      className="btn btn-sm btn-ghost gap-2 text-base-content/60"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {showTheoryInfo ? "Hide" : "Show"} Theory & Data Point Info
                      <svg className={`w-4 h-4 transition-transform ${showTheoryInfo ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {showTheoryInfo && (
                      <div className="mt-3 bg-base-200/50 rounded-xl p-4 border border-base-300">
                        <div className="grid gap-3 text-sm">
                          <div className="flex gap-3">
                            <span className="badge badge-primary badge-sm">Theory</span>
                            <span className="font-medium">{selectedCategory.questions[currentQuestionIndex].metadata?.theory}</span>
                          </div>
                          <p className="text-base-content/70 pl-1">
                            {selectedCategory.questions[currentQuestionIndex].metadata?.theoryDescription}
                          </p>
                          <div className="grid grid-cols-2 gap-3 mt-2">
                            <div className="flex gap-2 items-center">
                              <span className="badge badge-secondary badge-sm">Data Point</span>
                              <span>{selectedCategory.questions[currentQuestionIndex].metadata?.dataPoint}</span>
                            </div>
                            {selectedCategory.questions[currentQuestionIndex].metadata?.facet && (
                              <div className="flex gap-2 items-center">
                                <span className="badge badge-accent badge-sm">Facet</span>
                                <span>{selectedCategory.questions[currentQuestionIndex].metadata?.facet}</span>
                              </div>
                            )}
                          </div>
                          {selectedCategory.questions[currentQuestionIndex].metadata?.reference && (
                            <div className="mt-2 text-xs text-base-content/50 italic">
                              Reference: {selectedCategory.questions[currentQuestionIndex].metadata?.reference}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

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

          {/* Live Profile Preview Panel */}
          <div className="w-80 shrink-0">
            <div className="bg-base-100 rounded-2xl shadow-xl border border-base-200 p-5 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Live Profile Preview</h3>
                <button
                  onClick={() => setShowLiveProfile(!showLiveProfile)}
                  className="btn btn-ghost btn-xs"
                >
                  {showLiveProfile ? "Hide" : "Show"}
                </button>
              </div>

              {showLiveProfile && (
                <>
                  {liveProfile ? (
                    <div className="space-y-4">
                      {/* Quick Summary */}
                      {liveProfile.dossier.coreTraits.length > 0 && (
                        <div>
                          <div className="text-xs font-medium text-base-content/60 mb-2">EMERGING TRAITS</div>
                          <div className="flex flex-wrap gap-1">
                            {liveProfile.dossier.coreTraits.slice(0, 4).map((trait, i) => (
                              <span key={i} className="badge badge-sm badge-primary/20">{trait.split(" ").slice(0, 2).join(" ")}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tone Profile Bars */}
                      <div>
                        <div className="text-xs font-medium text-base-content/60 mb-2">TONE PROFILE</div>
                        <div className="space-y-2">
                          {[
                            { key: "formality", label: "Formality", low: "Casual", high: "Formal" },
                            { key: "warmth", label: "Warmth", low: "Distant", high: "Warm" },
                            { key: "directness", label: "Directness", low: "Indirect", high: "Direct" },
                            { key: "authority", label: "Authority", low: "Peer", high: "Expert" },
                            { key: "creativity", label: "Creativity", low: "Conv.", high: "Creative" },
                          ].map(({ key, label, low, high }) => (
                            <div key={key}>
                              <div className="flex justify-between text-xs mb-1">
                                <span>{label}</span>
                                <span className="text-base-content/50">{liveProfile.toneProfile[key as keyof ToneProfile]}%</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-base-content/40 w-12">{low}</span>
                                <progress
                                  className="progress progress-primary h-2 flex-1"
                                  value={liveProfile.toneProfile[key as keyof ToneProfile]}
                                  max={100}
                                ></progress>
                                <span className="text-[10px] text-base-content/40 w-12 text-right">{high}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Writing Voice Preview */}
                      {liveProfile.dossier.writingVoice && (
                        <div>
                          <div className="text-xs font-medium text-base-content/60 mb-2">WRITING VOICE</div>
                          <p className="text-xs text-base-content/70 line-clamp-3">
                            {liveProfile.dossier.writingVoice}
                          </p>
                        </div>
                      )}

                      {/* Strengths */}
                      {liveProfile.dossier.strengthsAsWriter.length > 0 && (
                        <div>
                          <div className="text-xs font-medium text-base-content/60 mb-2">EMERGING STRENGTHS</div>
                          <ul className="text-xs text-base-content/70 space-y-1">
                            {liveProfile.dossier.strengthsAsWriter.slice(0, 3).map((s, i) => (
                              <li key={i} className="flex items-start gap-1">
                                <svg className="w-3 h-3 text-success mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="pt-2 border-t border-base-200">
                        <div className="text-[10px] text-base-content/40 text-center">
                          Profile updates as you answer questions
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 bg-base-200 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <p className="text-sm text-base-content/60">
                        Answer questions to see your profile build in real-time
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
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
