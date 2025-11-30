/**
 * Digital Twin Service
 *
 * This service generates:
 * 1. Personality Dossier - A comprehensive analysis of the user's psychometric profile
 * 2. System Prompt - A robust AI prompt capturing the user's voice, thinking patterns, and style
 * 3. Tone Profile - Numeric values for writing style configuration
 * 4. Style Recommendations - Suggested author styles based on psychometric alignment
 */

// Types for psychometric data
export interface PsychometricProfile {
  big_five?: Record<string, number>;
  cognitive_style?: Record<string, number>;
  emotional_intelligence?: Record<string, number>;
  disc_profile?: Record<string, number>;
  values_motivations?: Record<string, number>;
  character_strengths?: Record<string, number>;
  enneagram?: Record<string, number>;
  creativity_profile?: Record<string, number>;
  thinking_style?: Record<string, number>;
  writing_preferences?: Record<string, number>;
  reasoning_patterns?: Record<string, number>;
  life_experience?: Record<string, string | number>;
  intellectual_influences?: Record<string, string | number>;
  emotional_landscape?: Record<string, string | number>;
  relationship_patterns?: Record<string, string | number>;
  worldview_beliefs?: Record<string, string | number>;
  sensory_aesthetic?: Record<string, string | number>;
  humor_play?: Record<string, string | number>;
  communication_quirks?: Record<string, string | number>;
  creative_process?: Record<string, string | number>;
  writing_analysis?: Record<string, string | number>;
  liwc_metrics?: Record<string, number>;
}

export interface ToneProfile {
  formality: number;      // 0-100: casual to formal
  warmth: number;         // 0-100: distant to warm
  humor: number;          // 0-100: serious to playful
  authority: number;      // 0-100: peer-level to authoritative
  empathy: number;        // 0-100: objective to empathetic
  directness: number;     // 0-100: indirect to direct
  complexity: number;     // 0-100: simple to complex
  creativity: number;     // 0-100: conventional to creative
  emotionality: number;   // 0-100: reserved to expressive
  assertiveness: number;  // 0-100: passive to assertive
}

export interface PersonalityDossier {
  summary: string;
  coreTraits: string[];
  thinkingStyle: string;
  communicationStyle: string;
  emotionalProfile: string;
  valuesAndMotivations: string;
  creativeTendencies: string;
  writingVoice: string;
  strengthsAsWriter: string[];
  uniqueQuirks: string[];
  recommendedGenres: string[];
  toneProfile: ToneProfile;
}

export interface DigitalTwin {
  id: string;
  userId: string;
  name: string;
  dossier: PersonalityDossier;
  systemPrompt: string;
  toneProfile: ToneProfile;
  recommendedStyleIds: string[];
  createdAt: string;
  updatedAt: string;
  completionPercentage: number;
}

// Helper function to calculate average from answers
function calculateAverage(answers: Record<string, number>, prefix: string): number {
  const relevantAnswers = Object.entries(answers)
    .filter(([key]) => key.startsWith(prefix))
    .map(([, value]) => value);

  if (relevantAnswers.length === 0) return 0;
  return relevantAnswers.reduce((sum, val) => sum + val, 0) / relevantAnswers.length;
}

// Helper to normalize 1-7 scale to 0-100
function normalizeToPercent(value: number, min: number = 1, max: number = 7): number {
  return Math.round(((value - min) / (max - min)) * 100);
}

// Calculate Big Five traits from answers
function analyzeBigFive(answers: Record<string, number>): {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
} {
  return {
    openness: normalizeToPercent(calculateAverage(answers, "ocean_") || 4, 1, 7),
    conscientiousness: normalizeToPercent(
      (answers.ocean_8 + answers.ocean_9 + answers.ocean_10 + answers.ocean_11 + answers.ocean_12 + answers.ocean_13 + answers.ocean_14) / 7 || 4
    ),
    extraversion: normalizeToPercent(
      (answers.ocean_15 + answers.ocean_16 + answers.ocean_17 + answers.ocean_18 + answers.ocean_19 + answers.ocean_20 + answers.ocean_21) / 7 || 4
    ),
    agreeableness: normalizeToPercent(
      (answers.ocean_22 + answers.ocean_23 + answers.ocean_24 + answers.ocean_25 + answers.ocean_26 + answers.ocean_27 + answers.ocean_28) / 7 || 4
    ),
    neuroticism: normalizeToPercent(
      (answers.ocean_29 + answers.ocean_30 + answers.ocean_31 + answers.ocean_32 + answers.ocean_33 + answers.ocean_34 + answers.ocean_35) / 7 || 4
    ),
  };
}

// Calculate DISC profile
function analyzeDISC(answers: Record<string, number>): {
  dominance: number;
  influence: number;
  steadiness: number;
  conscientiousness: number;
  primary: string;
} {
  const dominance = normalizeToPercent(((answers.disc_1 || 4) + (answers.disc_2 || 4)) / 2);
  const influence = normalizeToPercent(((answers.disc_3 || 4) + (answers.disc_4 || 4)) / 2);
  const steadiness = normalizeToPercent(((answers.disc_5 || 4) + (answers.disc_6 || 4)) / 2);
  const conscientiousness = normalizeToPercent(((answers.disc_7 || 4) + (answers.disc_8 || 4)) / 2);

  const scores = { D: dominance, I: influence, S: steadiness, C: conscientiousness };
  const primary = Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b)[0];

  return { dominance, influence, steadiness, conscientiousness, primary };
}

// Calculate emotional intelligence components
function analyzeEQ(answers: Record<string, number>): {
  selfAwareness: number;
  selfRegulation: number;
  empathy: number;
  socialSkills: number;
  overall: number;
} {
  const selfAwareness = normalizeToPercent(
    ((answers.eq_4 || 4) + (answers.eq_8 || 4) + (answers.eq_13 || 4)) / 3
  );
  const selfRegulation = normalizeToPercent(
    ((answers.eq_2 || 4) + (answers.eq_5 || 4) + (answers.eq_7 || 4) + (answers.eq_10 || 4)) / 4
  );
  const empathy = normalizeToPercent(
    ((answers.eq_1 || 4) + (answers.eq_6 || 4) + (answers.eq_9 || 4) + (answers.eq_14 || 4)) / 4
  );
  const socialSkills = normalizeToPercent(
    ((answers.eq_3 || 4) + (answers.eq_12 || 4) + (answers.eq_15 || 4)) / 3
  );

  return {
    selfAwareness,
    selfRegulation,
    empathy,
    socialSkills,
    overall: Math.round((selfAwareness + selfRegulation + empathy + socialSkills) / 4),
  };
}

// Calculate writing preferences
function analyzeWritingPreferences(answers: Record<string, number>): {
  sentenceLength: string;
  vocabularyLevel: string;
  formality: number;
  usesMetaphors: boolean;
  directAddress: boolean;
  usesHumor: boolean;
  prefersList: boolean;
  descriptiveLevel: number;
} {
  const shortSentences = (answers.wp_1 || 4) > 4;
  const sophisticatedVocab = (answers.wp_2 || 4) > 4;
  const formal = normalizeToPercent(answers.wp_3 || 4);

  return {
    sentenceLength: shortSentences ? "short and punchy" : "flowing and complex",
    vocabularyLevel: sophisticatedVocab ? "sophisticated" : "accessible",
    formality: formal,
    usesMetaphors: (answers.wp_4 || 4) > 4,
    directAddress: (answers.wp_5 || 4) > 4,
    usesHumor: (answers.wp_6 || 4) > 4,
    prefersList: (answers.wp_10 || 4) > 4,
    descriptiveLevel: normalizeToPercent(answers.wp_16 || 4),
  };
}

// Generate tone profile from all psychometric data
export function generateToneProfile(profile: PsychometricProfile): ToneProfile {
  const bigFive = profile.big_five ? analyzeBigFive(profile.big_five) : null;
  const disc = profile.disc_profile ? analyzeDISC(profile.disc_profile) : null;
  const eq = profile.emotional_intelligence ? analyzeEQ(profile.emotional_intelligence) : null;
  const wp = profile.writing_preferences || {};

  // Calculate formality from writing preferences and conscientiousness
  const formality = Math.round(
    ((normalizeToPercent(wp.wp_3 || 4) * 0.6) +
    ((bigFive?.conscientiousness || 50) * 0.4))
  );

  // Calculate warmth from agreeableness, EQ empathy, and writing preferences
  const warmth = Math.round(
    ((bigFive?.agreeableness || 50) * 0.4) +
    ((eq?.empathy || 50) * 0.4) +
    (normalizeToPercent(wp.wp_8 || 4) * 0.2)
  );

  // Calculate humor from writing preferences and openness
  const humor = Math.round(
    (normalizeToPercent(wp.wp_6 || 4) * 0.6) +
    ((bigFive?.openness || 50) * 0.2) +
    ((bigFive?.extraversion || 50) * 0.2)
  );

  // Calculate authority from DISC dominance and conscientiousness
  const authority = Math.round(
    ((disc?.dominance || 50) * 0.5) +
    ((bigFive?.conscientiousness || 50) * 0.3) +
    (normalizeToPercent(wp.wp_17 || 4) * 0.2)
  );

  // Calculate empathy from EQ and agreeableness
  const empathy = Math.round(
    ((eq?.empathy || 50) * 0.5) +
    ((bigFive?.agreeableness || 50) * 0.3) +
    ((eq?.socialSkills || 50) * 0.2)
  );

  // Calculate directness from DISC and writing preferences
  const directness = Math.round(
    ((disc?.dominance || 50) * 0.4) +
    (normalizeToPercent(wp.wp_1 || 4) * 0.3) +
    ((100 - (bigFive?.agreeableness || 50)) * 0.3)
  );

  // Calculate complexity from vocabulary and cognitive style
  const cogStyle = profile.cognitive_style || {};
  const complexity = Math.round(
    (normalizeToPercent(wp.wp_2 || 4) * 0.4) +
    (normalizeToPercent(wp.wp_12 || 4) * 0.3) +
    ((bigFive?.openness || 50) * 0.3)
  );

  // Calculate creativity from creativity profile and openness
  const creativityAnswers = profile.creativity_profile || {};
  const creativityScore = Object.values(creativityAnswers).length > 0
    ? normalizeToPercent(
        Object.values(creativityAnswers).reduce((a, b) => (a as number) + (b as number), 0) as number /
        Object.values(creativityAnswers).length
      )
    : 50;
  const creativity = Math.round(
    (creativityScore * 0.5) +
    ((bigFive?.openness || 50) * 0.5)
  );

  // Calculate emotionality from neuroticism and EQ
  const emotionality = Math.round(
    ((bigFive?.neuroticism || 50) * 0.3) +
    ((eq?.selfAwareness || 50) * 0.3) +
    (normalizeToPercent(wp.wp_16 || 4) * 0.4)
  );

  // Calculate assertiveness from extraversion and DISC
  const assertiveness = Math.round(
    ((bigFive?.extraversion || 50) * 0.4) +
    ((disc?.dominance || 50) * 0.4) +
    ((disc?.influence || 50) * 0.2)
  );

  return {
    formality,
    warmth,
    humor,
    authority,
    empathy,
    directness,
    complexity,
    creativity,
    emotionality,
    assertiveness,
  };
}

// Generate personality dossier
export function generatePersonalityDossier(profile: PsychometricProfile): PersonalityDossier {
  const bigFive = profile.big_five ? analyzeBigFive(profile.big_five) : null;
  const disc = profile.disc_profile ? analyzeDISC(profile.disc_profile) : null;
  const eq = profile.emotional_intelligence ? analyzeEQ(profile.emotional_intelligence) : null;
  const wp = profile.writing_preferences ? analyzeWritingPreferences(profile.writing_preferences) : null;
  const toneProfile = generateToneProfile(profile);

  // Generate core traits based on Big Five
  const coreTraits: string[] = [];
  if (bigFive) {
    if (bigFive.openness > 70) coreTraits.push("Highly creative and imaginative");
    else if (bigFive.openness > 50) coreTraits.push("Open to new ideas");
    else coreTraits.push("Practical and grounded");

    if (bigFive.conscientiousness > 70) coreTraits.push("Meticulous and organized");
    else if (bigFive.conscientiousness > 50) coreTraits.push("Dependable and methodical");
    else coreTraits.push("Flexible and spontaneous");

    if (bigFive.extraversion > 70) coreTraits.push("Energetic and outgoing");
    else if (bigFive.extraversion > 50) coreTraits.push("Socially comfortable");
    else coreTraits.push("Thoughtful and introspective");

    if (bigFive.agreeableness > 70) coreTraits.push("Highly empathetic and cooperative");
    else if (bigFive.agreeableness > 50) coreTraits.push("Considerate of others");
    else coreTraits.push("Direct and independent-minded");

    if (bigFive.neuroticism > 70) coreTraits.push("Emotionally intense and sensitive");
    else if (bigFive.neuroticism > 50) coreTraits.push("Emotionally aware");
    else coreTraits.push("Emotionally stable and calm");
  }

  // Generate thinking style description
  let thinkingStyle = "This author ";
  if (profile.cognitive_style) {
    const cog = profile.cognitive_style;
    const visualLearner = (cog.cog_1 || 4) > 4;
    const intuitive = (cog.cog_2 || 4) > 4;
    const bigPicture = (cog.cog_3 || 4) > 4;
    const patternSeeker = (cog.cog_8 || 4) > 4;

    thinkingStyle += visualLearner ? "thinks in images and diagrams, " : "processes information verbally, ";
    thinkingStyle += intuitive ? "trusts intuition alongside logic, " : "relies primarily on analytical reasoning, ";
    thinkingStyle += bigPicture ? "grasps overarching themes before details, " : "builds understanding from specific details upward, ";
    thinkingStyle += patternSeeker ? "and excels at finding unexpected connections." : "and focuses on direct cause-and-effect relationships.";
  } else {
    thinkingStyle += "has a balanced cognitive approach.";
  }

  // Generate communication style description
  let communicationStyle = "";
  if (disc) {
    const styleDescriptions: Record<string, string> = {
      D: "Direct and results-oriented. Gets to the point quickly and values efficiency in communication. May come across as assertive or commanding.",
      I: "Enthusiastic and expressive. Enjoys connecting with readers through stories and emotional appeals. Naturally optimistic and persuasive.",
      S: "Patient and supportive. Creates a comfortable, approachable tone. Values harmony and builds trust through consistency.",
      C: "Precise and analytical. Focuses on accuracy and thoroughness. Provides detailed explanations and values quality over speed.",
    };
    communicationStyle = styleDescriptions[disc.primary] || "Balanced communication style adapting to context.";
  }

  // Generate emotional profile
  let emotionalProfile = "";
  if (eq) {
    emotionalProfile = `Emotional Intelligence Score: ${eq.overall}%. `;
    if (eq.selfAwareness > 70) emotionalProfile += "Highly self-aware with deep understanding of own emotional responses. ";
    if (eq.empathy > 70) emotionalProfile += "Exceptionally attuned to others' emotions, able to write characters and scenarios with genuine emotional depth. ";
    if (eq.selfRegulation > 70) emotionalProfile += "Maintains emotional balance, able to write about intense topics with controlled craft. ";
    if (eq.socialSkills > 70) emotionalProfile += "Natural ability to connect with readers through relatable emotional expression.";
  }

  // Generate values and motivations
  let valuesAndMotivations = "";
  if (profile.values_motivations) {
    const vals = profile.values_motivations;
    const topValues: string[] = [];
    if ((vals.val_1 || 0) > 5) topValues.push("achievement");
    if ((vals.val_2 || 0) > 5) topValues.push("service to others");
    if ((vals.val_3 || 0) > 5) topValues.push("personal freedom");
    if ((vals.val_4 || 0) > 5) topValues.push("security");
    if ((vals.val_5 || 0) > 5) topValues.push("novelty and excitement");
    if ((vals.val_8 || 0) > 5) topValues.push("environmental protection");
    if ((vals.val_9 || 0) > 5) topValues.push("equality and justice");
    if ((vals.val_12 || 0) > 5) topValues.push("creativity and self-expression");

    valuesAndMotivations = topValues.length > 0
      ? `Core values driving this author's work: ${topValues.join(", ")}. These themes are likely to appear in their writing, either explicitly or as underlying currents.`
      : "Values profile not yet determined.";
  }

  // Generate creative tendencies
  let creativeTendencies = "";
  if (profile.creativity_profile) {
    const cre = profile.creativity_profile;
    const riskTaker = (cre.cre_2 || 4) > 4;
    const divergentThinker = (cre.cre_1 || 4) > 4;
    const prefersNovel = (cre.cre_3 || 4) > 4;
    const challengesNorms = (cre.cre_6 || 4) > 4;

    creativeTendencies = `This author ${riskTaker ? "embraces creative risk-taking" : "prefers calculated creative choices"}, `;
    creativeTendencies += divergentThinker ? "generates many ideas before converging, " : "focuses quickly on promising directions, ";
    creativeTendencies += prefersNovel ? "gravitates toward unconventional approaches, " : "builds on established patterns, ";
    creativeTendencies += challengesNorms ? "and enjoys subverting reader expectations." : "and provides satisfying, familiar structures.";
  }

  // Generate writing voice description
  let writingVoice = "";
  if (wp) {
    writingVoice = `Writes with ${wp.sentenceLength} sentences using ${wp.vocabularyLevel} vocabulary. `;
    writingVoice += `Formality level: ${wp.formality > 70 ? "highly formal" : wp.formality > 40 ? "conversational" : "casual and intimate"}. `;
    if (wp.usesMetaphors) writingVoice += "Frequently employs metaphors and analogies to illustrate points. ";
    if (wp.directAddress) writingVoice += "Often addresses the reader directly, creating intimacy. ";
    if (wp.usesHumor) writingVoice += "Naturally weaves humor into the narrative. ";
    if (wp.prefersList) writingVoice += "Organizes information using lists and structured formats. ";
    writingVoice += `Descriptive richness: ${wp.descriptiveLevel > 70 ? "highly vivid and sensory" : wp.descriptiveLevel > 40 ? "balanced" : "lean and efficient"}.`;
  }

  // Generate strengths as writer
  const strengthsAsWriter: string[] = [];
  if (bigFive?.openness && bigFive.openness > 60) strengthsAsWriter.push("Creative storytelling and unique perspectives");
  if (bigFive?.conscientiousness && bigFive.conscientiousness > 60) strengthsAsWriter.push("Thorough research and attention to detail");
  if (eq?.empathy && eq.empathy > 60) strengthsAsWriter.push("Emotionally resonant character development");
  if (disc?.dominance && disc.dominance > 60) strengthsAsWriter.push("Clear, authoritative voice that commands attention");
  if (disc?.influence && disc.influence > 60) strengthsAsWriter.push("Engaging, persuasive prose that moves readers");
  if (toneProfile.humor > 60) strengthsAsWriter.push("Ability to use humor effectively");
  if (toneProfile.complexity > 70) strengthsAsWriter.push("Handling complex ideas with sophistication");
  if (toneProfile.warmth > 70) strengthsAsWriter.push("Creating connection and warmth with readers");

  // Generate unique quirks
  const uniqueQuirks: string[] = [];
  if (profile.writing_preferences) {
    const wp2 = profile.writing_preferences;
    if ((wp2.wp_4 || 4) > 5) uniqueQuirks.push("Heavy use of metaphors and analogies");
    if ((wp2.wp_11 || 4) > 5) uniqueQuirks.push("Frequent rhetorical questions");
    if ((wp2.wp_17 || 4) > 5) uniqueQuirks.push("Bold, provocative statements");
    if ((wp2.wp_18 || 4) > 5) uniqueQuirks.push("First-person perspective preference");
  }
  if (profile.cognitive_style) {
    const cog2 = profile.cognitive_style;
    if ((cog2.cog_12 || 4) > 5) uniqueQuirks.push("Thinks in metaphors and analogies");
    if ((cog2.cog_8 || 4) > 5) uniqueQuirks.push("Makes unexpected connections");
  }

  // Generate recommended genres
  const recommendedGenres: string[] = [];
  if (bigFive?.openness && bigFive.openness > 70) {
    recommendedGenres.push("Literary Fiction", "Science Fiction", "Fantasy");
  }
  if (eq?.empathy && eq.empathy > 70) {
    recommendedGenres.push("Romance", "Drama", "Character-Driven Fiction");
  }
  if (bigFive?.conscientiousness && bigFive.conscientiousness > 70) {
    recommendedGenres.push("Technical Writing", "Non-Fiction", "How-To Guides");
  }
  if (disc?.dominance && disc.dominance > 70) {
    recommendedGenres.push("Business", "Self-Help", "Leadership");
  }
  if (toneProfile.humor > 70) {
    recommendedGenres.push("Comedy", "Satire", "Humorous Essays");
  }

  // Generate summary
  const summaryParts: string[] = [];
  if (bigFive) {
    const dominantTrait = Object.entries(bigFive).reduce((a, b) => a[1] > b[1] ? a : b);
    summaryParts.push(`A ${dominantTrait[0] === "openness" ? "creative" : dominantTrait[0] === "conscientiousness" ? "meticulous" : dominantTrait[0] === "extraversion" ? "expressive" : dominantTrait[0] === "agreeableness" ? "empathetic" : "emotionally attuned"} writer`);
  }
  if (disc) {
    summaryParts.push(`with a ${disc.primary === "D" ? "direct, results-oriented" : disc.primary === "I" ? "enthusiastic, persuasive" : disc.primary === "S" ? "supportive, reliable" : "precise, analytical"} communication style`);
  }
  if (eq && eq.overall > 60) {
    summaryParts.push(`and strong emotional intelligence (${eq.overall}%)`);
  }

  const summary = summaryParts.length > 0
    ? summaryParts.join(" ") + ". This author brings a unique combination of traits that inform their distinctive voice."
    : "Author profile is being built. Complete more assessments to generate a comprehensive summary.";

  return {
    summary,
    coreTraits,
    thinkingStyle,
    communicationStyle,
    emotionalProfile,
    valuesAndMotivations,
    creativeTendencies,
    writingVoice,
    strengthsAsWriter,
    uniqueQuirks,
    recommendedGenres: Array.from(new Set(recommendedGenres)).slice(0, 6),
    toneProfile,
  };
}

// Generate system prompt for AI writing
export function generateSystemPrompt(profile: PsychometricProfile, dossier: PersonalityDossier): string {
  const toneProfile = dossier.toneProfile;

  // Build the comprehensive system prompt
  let prompt = `You are a writing assistant embodying the voice and thinking patterns of a specific author. Your task is to write content that authentically represents this author's unique perspective, style, and personality.

## AUTHOR PERSONALITY PROFILE

### Core Identity
${dossier.summary}

### Key Traits
${dossier.coreTraits.map(trait => `- ${trait}`).join("\n")}

### Cognitive & Thinking Style
${dossier.thinkingStyle}

### Communication Approach
${dossier.communicationStyle}

### Emotional Landscape
${dossier.emotionalProfile}

### Values & Motivations
${dossier.valuesAndMotivations}

### Creative Tendencies
${dossier.creativeTendencies}

## WRITING VOICE SPECIFICATIONS

### Voice Description
${dossier.writingVoice}

### Tone Calibration (0-100 scale)
- Formality: ${toneProfile.formality} (${toneProfile.formality > 70 ? "highly formal" : toneProfile.formality > 40 ? "conversational" : "casual"})
- Warmth: ${toneProfile.warmth} (${toneProfile.warmth > 70 ? "very warm and personal" : toneProfile.warmth > 40 ? "friendly" : "professional distance"})
- Humor: ${toneProfile.humor} (${toneProfile.humor > 70 ? "frequently humorous" : toneProfile.humor > 40 ? "occasional wit" : "serious tone"})
- Authority: ${toneProfile.authority} (${toneProfile.authority > 70 ? "commanding presence" : toneProfile.authority > 40 ? "confident" : "peer-level"})
- Empathy: ${toneProfile.empathy} (${toneProfile.empathy > 70 ? "highly empathetic" : toneProfile.empathy > 40 ? "considerate" : "objective"})
- Directness: ${toneProfile.directness} (${toneProfile.directness > 70 ? "very direct" : toneProfile.directness > 40 ? "balanced" : "diplomatic"})
- Complexity: ${toneProfile.complexity} (${toneProfile.complexity > 70 ? "sophisticated" : toneProfile.complexity > 40 ? "accessible" : "simple"})
- Creativity: ${toneProfile.creativity} (${toneProfile.creativity > 70 ? "highly creative" : toneProfile.creativity > 40 ? "moderately creative" : "conventional"})
- Emotionality: ${toneProfile.emotionality} (${toneProfile.emotionality > 70 ? "emotionally expressive" : toneProfile.emotionality > 40 ? "balanced" : "reserved"})
- Assertiveness: ${toneProfile.assertiveness} (${toneProfile.assertiveness > 70 ? "strongly assertive" : toneProfile.assertiveness > 40 ? "confident" : "gentle"})

### Writer Strengths to Leverage
${dossier.strengthsAsWriter.map(s => `- ${s}`).join("\n")}

### Distinctive Quirks to Include
${dossier.uniqueQuirks.length > 0 ? dossier.uniqueQuirks.map(q => `- ${q}`).join("\n") : "- Profile being developed"}

## WRITING INSTRUCTIONS

1. **Voice Consistency**: Maintain the author's unique voice throughout. Every sentence should feel like it could have been written by this specific person.

2. **Thinking Patterns**: When explaining concepts or building arguments, follow the author's cognitive style - ${profile.cognitive_style && (profile.cognitive_style.cog_3 || 4) > 4 ? "start with the big picture, then dive into details" : "build from specific examples to general principles"}.

3. **Emotional Expression**: ${toneProfile.emotionality > 60 ? "Don't shy away from emotional language and personal connection" : "Keep emotional expression measured and purposeful"}.

4. **Sentence Structure**: ${toneProfile.complexity > 60 ? "Use varied, sophisticated sentence structures with subordinate clauses" : "Favor clear, direct sentences that are easy to follow"}.

5. **Vocabulary**: ${toneProfile.complexity > 60 ? "Employ precise, nuanced vocabulary appropriate to the subject" : "Use accessible language that doesn't alienate readers"}.

6. **Reader Relationship**: ${toneProfile.warmth > 60 ? "Create warmth and connection with the reader through personal anecdotes and inclusive language" : "Maintain appropriate professional distance while still engaging"}.

7. **Argument Style**: ${toneProfile.directness > 60 ? "State positions clearly and confidently" : "Build consensus through questions and shared exploration"}.

8. **Humor Usage**: ${toneProfile.humor > 60 ? "Weave appropriate humor and wit naturally into the content" : "Keep the tone focused and serious, using humor sparingly if at all"}.

When writing, channel this author's complete personality - their way of seeing the world, their values, their communication quirks, and their unique perspective. The goal is not just to mimic their style but to think and express ideas as they would.`;

  return prompt;
}

// Generate style recommendations based on psychometric profile
export function generateStyleRecommendations(toneProfile: ToneProfile): string[] {
  const recommendations: string[] = [];

  // Map tone profiles to author styles
  // High formality + high authority = academic styles
  if (toneProfile.formality > 70 && toneProfile.authority > 60) {
    recommendations.push("malcolm_gladwell", "yuval_harari", "steven_pinker", "daniel_kahneman");
  }

  // High warmth + high empathy = warm, personal styles
  if (toneProfile.warmth > 70 && toneProfile.empathy > 60) {
    recommendations.push("brene_brown", "elizabeth_gilbert", "glennon_doyle", "rachel_hollis");
  }

  // High humor + moderate formality = witty styles
  if (toneProfile.humor > 60 && toneProfile.formality < 70) {
    recommendations.push("david_sedaris", "nora_ephron", "bill_bryson", "mary_roach");
  }

  // High directness + high authority = commanding styles
  if (toneProfile.directness > 70 && toneProfile.authority > 70) {
    recommendations.push("tim_ferriss", "jocko_willink", "ryan_holiday", "gary_vee");
  }

  // High creativity + high complexity = literary styles
  if (toneProfile.creativity > 70 && toneProfile.complexity > 60) {
    recommendations.push("zadie_smith", "neil_gaiman", "chimamanda_adichie", "kazuo_ishiguro");
  }

  // High empathy + moderate assertiveness = inspirational styles
  if (toneProfile.empathy > 60 && toneProfile.assertiveness > 40 && toneProfile.assertiveness < 70) {
    recommendations.push("simon_sinek", "adam_grant", "james_clear", "cal_newport");
  }

  // Low formality + high warmth = conversational styles
  if (toneProfile.formality < 40 && toneProfile.warmth > 60) {
    recommendations.push("mark_manson", "jen_sincero", "austin_kleon", "jenny_lawson");
  }

  // High emotionality = emotionally expressive styles
  if (toneProfile.emotionality > 70) {
    recommendations.push("mary_oliver", "anne_lamott", "cheryl_strayed", "roxane_gay");
  }

  // Default recommendations if none match strongly
  if (recommendations.length < 3) {
    recommendations.push("james_clear", "cal_newport", "ryan_holiday");
  }

  // Remove duplicates and limit to 8
  return Array.from(new Set(recommendations)).slice(0, 8);
}

// Create complete Digital Twin
export function createDigitalTwin(
  userId: string,
  profile: PsychometricProfile,
  completionPercentage: number
): DigitalTwin {
  const dossier = generatePersonalityDossier(profile);
  const systemPrompt = generateSystemPrompt(profile, dossier);
  const recommendedStyleIds = generateStyleRecommendations(dossier.toneProfile);

  return {
    id: `dt_${userId}_${Date.now()}`,
    userId,
    name: "My Digital Twin",
    dossier,
    systemPrompt,
    toneProfile: dossier.toneProfile,
    recommendedStyleIds,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completionPercentage,
  };
}

// Export utility to convert database profile to PsychometricProfile
export function dbProfileToPsychometric(dbProfile: Record<string, unknown>): PsychometricProfile {
  return {
    big_five: dbProfile.big_five as Record<string, number> | undefined,
    cognitive_style: dbProfile.cognitive_style as Record<string, number> | undefined,
    emotional_intelligence: dbProfile.emotional_intelligence as Record<string, number> | undefined,
    disc_profile: dbProfile.disc_profile as Record<string, number> | undefined,
    values_motivations: dbProfile.values_motivations as Record<string, number> | undefined,
    character_strengths: dbProfile.character_strengths as Record<string, number> | undefined,
    enneagram: dbProfile.enneagram as Record<string, number> | undefined,
    creativity_profile: dbProfile.creativity_profile as Record<string, number> | undefined,
    thinking_style: dbProfile.thinking_style as Record<string, number> | undefined,
    writing_preferences: dbProfile.writing_preferences as Record<string, number> | undefined,
    reasoning_patterns: dbProfile.reasoning_patterns as Record<string, number> | undefined,
    life_experience: dbProfile.life_experience as Record<string, string | number> | undefined,
    intellectual_influences: dbProfile.intellectual_influences as Record<string, string | number> | undefined,
    emotional_landscape: dbProfile.emotional_landscape as Record<string, string | number> | undefined,
    relationship_patterns: dbProfile.relationship_patterns as Record<string, string | number> | undefined,
    worldview_beliefs: dbProfile.worldview_beliefs as Record<string, string | number> | undefined,
    sensory_aesthetic: dbProfile.sensory_aesthetic as Record<string, string | number> | undefined,
    humor_play: dbProfile.humor_play as Record<string, string | number> | undefined,
    communication_quirks: dbProfile.communication_quirks as Record<string, string | number> | undefined,
    creative_process: dbProfile.creative_process as Record<string, string | number> | undefined,
    writing_analysis: dbProfile.writing_analysis as Record<string, string | number> | undefined,
    liwc_metrics: dbProfile.liwc_metrics as Record<string, number> | undefined,
  };
}
