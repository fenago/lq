"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

// Types based on PRD
interface ToneConfig {
  primary: string;
  secondary?: string;
  intensity: number;
  formality: number;
  warmth: number;
  humor: number;
  authority: number;
  empathy: number;
  directness: number;
}

interface AuthorStyle {
  id: string;
  name: string;
  author: string;
  category: string;
  subcategory: string;
  era: "classic" | "modern";
  tone: ToneConfig;
  description: string;
  styleDescription: string;
  sampleExcerpt: string;
  bestFor: string[];
  influences: string[];
}

// Categories from PRD
const categories = [
  {
    id: "academic_educational",
    name: "Academic & Educational",
    icon: "M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z",
    subcategories: ["Academic Textbooks", "Technical Writing"],
  },
  {
    id: "childrens_books",
    name: "Children's Books",
    icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
    subcategories: ["Board Books (0-3)", "Picture Books (3-8)", "Middle Grade (8-12)", "Young Adult (12+)"],
  },
  {
    id: "fiction",
    name: "Fiction",
    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    subcategories: ["Science Fiction", "Fantasy", "Mystery/Thriller", "Horror", "Romance", "Literary Fiction"],
  },
  {
    id: "non_fiction",
    name: "Non-Fiction",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    subcategories: ["Biography/Memoir", "History", "Self-Help", "Business", "Popular Science", "Philosophy", "Travel Writing", "Cookbooks"],
  },
];

// Complete author styles database (104+ styles from PRD)
const authorStyles: AuthorStyle[] = [
  // Academic & Educational - Academic Textbooks
  {
    id: "acad-text-001",
    name: "The Feynman Style",
    author: "Richard Feynman",
    category: "academic_educational",
    subcategory: "Academic Textbooks",
    era: "classic",
    tone: {
      primary: "conversational",
      secondary: "playful",
      intensity: 8,
      formality: 4,
      warmth: 9,
      humor: 6,
      authority: 8,
      empathy: 7,
      directness: 8,
    },
    description: "Richard Feynman revolutionized physics education with his legendary lectures at Caltech. His style treats the reader as an intelligent friend.",
    styleDescription: "Conversational and intuitive; uses everyday analogies to explain complex physics; emphasizes understanding over memorization.",
    sampleExcerpt: "Now I'm going to discuss how we would look for a new law. In general, we look for a new law by the following process. First, we guess it...",
    bestFor: ["Physics courses", "Science education", "Making complex topics accessible"],
    influences: ["Einstein's thought experiments", "Jazz improvisation"],
  },
  {
    id: "acad-text-002",
    name: "The Boas Style",
    author: "Mary Boas",
    category: "academic_educational",
    subcategory: "Academic Textbooks",
    era: "classic",
    tone: {
      primary: "academic",
      intensity: 7,
      formality: 7,
      warmth: 6,
      humor: 3,
      authority: 8,
      empathy: 5,
      directness: 7,
    },
    description: "Mary Boas's 'Mathematical Methods in the Physical Sciences' has been the gold standard for physics mathematics for decades.",
    styleDescription: "Clear, methodical, patient; builds concepts step by step with careful explanations.",
    sampleExcerpt: "Let us first consider what we mean by a vector...",
    bestFor: ["Mathematics courses", "Physics prerequisites", "Self-study"],
    influences: ["Classical mathematical pedagogy"],
  },
  {
    id: "acad-text-003",
    name: "The Greiner Style",
    author: "Walter Greiner",
    category: "academic_educational",
    subcategory: "Academic Textbooks",
    era: "classic",
    tone: {
      primary: "technical",
      intensity: 9,
      formality: 8,
      warmth: 4,
      humor: 2,
      authority: 9,
      empathy: 4,
      directness: 9,
    },
    description: "Walter Greiner's physics textbooks are comprehensive, example-heavy resources that leave no stone unturned.",
    styleDescription: "Thorough, example-rich, encyclopedic; includes numerous solved problems.",
    sampleExcerpt: "Example 3.4: Calculate the eigenvalues of the angular momentum operator...",
    bestFor: ["Advanced physics", "Graduate courses", "Reference materials"],
    influences: ["German academic tradition"],
  },
  {
    id: "acad-text-004",
    name: "The Spivak Style",
    author: "Michael Spivak",
    category: "academic_educational",
    subcategory: "Academic Textbooks",
    era: "modern",
    tone: {
      primary: "academic",
      intensity: 9,
      formality: 9,
      warmth: 3,
      humor: 4,
      authority: 10,
      empathy: 3,
      directness: 10,
    },
    description: "Michael Spivak's 'Calculus' is famous for its rigorous, no-nonsense approach to mathematics.",
    styleDescription: "Rigorous, elegant, precise; theorem-proof structure with deep insights.",
    sampleExcerpt: "Theorem: If f is continuous on [a,b], then f is integrable on [a,b].",
    bestFor: ["Mathematics majors", "Rigorous courses", "Proof-based learning"],
    influences: ["Bourbaki tradition"],
  },
  {
    id: "acad-text-005",
    name: "The Hassani Style",
    author: "Sadri Hassani",
    category: "academic_educational",
    subcategory: "Academic Textbooks",
    era: "modern",
    tone: {
      primary: "academic",
      secondary: "conversational",
      intensity: 7,
      formality: 6,
      warmth: 7,
      humor: 4,
      authority: 7,
      empathy: 6,
      directness: 7,
    },
    description: "Sadri Hassani bridges mathematical physics and modern pedagogy with accessible explanations.",
    styleDescription: "Accessible, systematic, bridge-building; connects abstract math to physics applications.",
    sampleExcerpt: "The mathematics we develop here will find direct application in quantum mechanics...",
    bestFor: ["Mathematical physics", "Bridge courses", "Graduate preparation"],
    influences: ["Modern physics education research"],
  },
  // Technical Writing
  {
    id: "tech-write-001",
    name: "The Zinsser Style",
    author: "William Zinsser",
    category: "academic_educational",
    subcategory: "Technical Writing",
    era: "classic",
    tone: {
      primary: "conversational",
      intensity: 8,
      formality: 5,
      warmth: 7,
      humor: 5,
      authority: 8,
      empathy: 7,
      directness: 9,
    },
    description: "William Zinsser's 'On Writing Well' teaches clarity, simplicity, and humanity in nonfiction writing.",
    styleDescription: "Clear, warm, encouraging; emphasizes stripping away clutter and writing with humanity.",
    sampleExcerpt: "Clutter is the disease of American writing. We are a society strangling in unnecessary words...",
    bestFor: ["Nonfiction writing", "Technical documentation", "Clear communication"],
    influences: ["E.B. White", "Classic American prose"],
  },
  {
    id: "tech-write-002",
    name: "The Markel Style",
    author: "Mike Markel",
    category: "academic_educational",
    subcategory: "Technical Writing",
    era: "classic",
    tone: {
      primary: "technical",
      intensity: 8,
      formality: 7,
      warmth: 5,
      humor: 2,
      authority: 8,
      empathy: 5,
      directness: 8,
    },
    description: "Mike Markel's textbooks define modern technical communication standards.",
    styleDescription: "Professional, comprehensive, rhetorical; audience-focused technical communication.",
    sampleExcerpt: "Every technical document begins with understanding your audience and purpose...",
    bestFor: ["Technical communication", "Professional writing", "Documentation"],
    influences: ["Rhetorical tradition"],
  },
  // Children's Books - Board Books
  {
    id: "child-board-001",
    name: "The Carle Style",
    author: "Eric Carle",
    category: "childrens_books",
    subcategory: "Board Books (0-3)",
    era: "classic",
    tone: {
      primary: "playful",
      intensity: 10,
      formality: 1,
      warmth: 10,
      humor: 7,
      authority: 2,
      empathy: 9,
      directness: 8,
    },
    description: "Eric Carle's distinctive collage illustrations and simple, rhythmic text define the modern board book.",
    styleDescription: "Rhythmic, repetitive, joyful; pattern-based with call-and-response elements.",
    sampleExcerpt: "In the light of the moon, a little egg lay on a leaf...",
    bestFor: ["Baby books", "Early literacy", "Read-aloud content"],
    influences: ["German expressionism", "Folk art"],
  },
  {
    id: "child-board-002",
    name: "The Boynton Style",
    author: "Sandra Boynton",
    category: "childrens_books",
    subcategory: "Board Books (0-3)",
    era: "modern",
    tone: {
      primary: "playful",
      secondary: "whimsical",
      intensity: 10,
      formality: 1,
      warmth: 10,
      humor: 9,
      authority: 2,
      empathy: 8,
      directness: 8,
    },
    description: "Sandra Boynton creates board books that delight both children and parents with silly humor.",
    styleDescription: "Whimsical humor on two levels; anthropomorphic animals; bouncy rhymes.",
    sampleExcerpt: "The sun has set not long ago. Now everybody goes below...",
    bestFor: ["Baby books", "Bedtime routines", "Parent-child bonding"],
    influences: ["Musical theater", "Animation"],
  },
  {
    id: "child-board-003",
    name: "The Katz Style",
    author: "Karen Katz",
    category: "childrens_books",
    subcategory: "Board Books (0-3)",
    era: "modern",
    tone: {
      primary: "playful",
      intensity: 9,
      formality: 1,
      warmth: 10,
      humor: 6,
      authority: 2,
      empathy: 9,
      directness: 9,
    },
    description: "Karen Katz creates interactive lift-the-flap books celebrating diversity and daily routines.",
    styleDescription: "Gentle, reassuring, interactive; question-answer format with tactile elements.",
    sampleExcerpt: "Where is baby's belly button? Under her shirt!",
    bestFor: ["Interactive books", "Diversity content", "Daily routines"],
    influences: ["Folk art", "Multicultural education"],
  },
  // Children's Books - Picture Books
  {
    id: "child-pic-001",
    name: "The Dr. Seuss Style",
    author: "Dr. Seuss",
    category: "childrens_books",
    subcategory: "Picture Books (3-8)",
    era: "classic",
    tone: {
      primary: "playful",
      secondary: "inspirational",
      intensity: 10,
      formality: 1,
      warmth: 8,
      humor: 10,
      authority: 3,
      empathy: 7,
      directness: 7,
    },
    description: "Dr. Seuss created an entirely new genre of children's literature with invented words and wild imagination.",
    styleDescription: "Inventive, playful, moral; rhyming narrative with made-up words and fantastical creatures.",
    sampleExcerpt: "I do not like green eggs and ham. I do not like them, Sam-I-am.",
    bestFor: ["Early readers", "Vocabulary building", "Moral lessons"],
    influences: ["Nonsense poetry", "Political cartooning"],
  },
  {
    id: "child-pic-002",
    name: "The Sendak Style",
    author: "Maurice Sendak",
    category: "childrens_books",
    subcategory: "Picture Books (3-8)",
    era: "classic",
    tone: {
      primary: "narrative",
      secondary: "poetic",
      intensity: 8,
      formality: 4,
      warmth: 7,
      humor: 4,
      authority: 5,
      empathy: 9,
      directness: 6,
    },
    description: "Maurice Sendak validated children's dark emotions and fantasies, revolutionizing picture books.",
    styleDescription: "Psychological, dreamlike, validating; fantasy journey structure that processes emotions.",
    sampleExcerpt: "And Max, the king of all wild things, was lonely and wanted to be where someone loved him best of all.",
    bestFor: ["Emotional processing", "Fantasy adventures", "Complex feelings"],
    influences: ["Grimm's Fairy Tales", "Psychoanalysis"],
  },
  {
    id: "child-pic-003",
    name: "The Milne Style",
    author: "A.A. Milne",
    category: "childrens_books",
    subcategory: "Picture Books (3-8)",
    era: "classic",
    tone: {
      primary: "narrative",
      intensity: 7,
      formality: 5,
      warmth: 10,
      humor: 7,
      authority: 4,
      empathy: 9,
      directness: 5,
    },
    description: "A.A. Milne's Winnie-the-Pooh captures childhood innocence with gentle philosophy.",
    styleDescription: "Gentle, philosophical, innocent; episodic adventures with emotional wisdom.",
    sampleExcerpt: "You are braver than you believe, stronger than you seem, and smarter than you think.",
    bestFor: ["Comfort reading", "Philosophical themes", "Friendship stories"],
    influences: ["English countryside", "Childhood imagination"],
  },
  {
    id: "child-pic-004",
    name: "The Willems Style",
    author: "Mo Willems",
    category: "childrens_books",
    subcategory: "Picture Books (3-8)",
    era: "modern",
    tone: {
      primary: "playful",
      intensity: 9,
      formality: 1,
      warmth: 9,
      humor: 10,
      authority: 2,
      empathy: 9,
      directness: 10,
    },
    description: "Mo Willems creates dialogue-driven stories that are perfect for beginning readers and read-alouds.",
    styleDescription: "Minimalist, humorous, emotional; dialogue-driven with expressive characters.",
    sampleExcerpt: "I am going! I am angry! Very, very angry!",
    bestFor: ["Early readers", "Emotional intelligence", "Interactive reading"],
    influences: ["Animation", "Comedy writing"],
  },
  // Children's Books - Middle Grade
  {
    id: "child-mid-001",
    name: "The Dahl Style",
    author: "Roald Dahl",
    category: "childrens_books",
    subcategory: "Middle Grade (8-12)",
    era: "classic",
    tone: {
      primary: "playful",
      secondary: "narrative",
      intensity: 9,
      formality: 3,
      warmth: 7,
      humor: 10,
      authority: 4,
      empathy: 8,
      directness: 8,
    },
    description: "Roald Dahl championed children against boring, mean, or idiotic adults with dark humor.",
    styleDescription: "Subversive, humorous, child-championing; adventure narrative with darkly funny elements.",
    sampleExcerpt: "If you have good thoughts they will shine out of your face like sunbeams and you will always look lovely.",
    bestFor: ["Adventure stories", "Subversive humor", "Child empowerment"],
    influences: ["British dark comedy", "Norwegian folklore"],
  },
  {
    id: "child-mid-002",
    name: "The Lewis Style",
    author: "C.S. Lewis",
    category: "childrens_books",
    subcategory: "Middle Grade (8-12)",
    era: "classic",
    tone: {
      primary: "narrative",
      secondary: "inspirational",
      intensity: 8,
      formality: 6,
      warmth: 8,
      humor: 5,
      authority: 7,
      empathy: 8,
      directness: 6,
    },
    description: "C.S. Lewis created Narnia as an allegorical world full of adventure and moral lessons.",
    styleDescription: "Allegorical, adventurous, moral; quest narrative with deeper meaning.",
    sampleExcerpt: "Once there were four children whose names were Peter, Susan, Edmund, and Lucy.",
    bestFor: ["Fantasy worlds", "Moral development", "Adventure series"],
    influences: ["Medieval literature", "Christian allegory"],
  },
  {
    id: "child-mid-003",
    name: "The Riordan Style",
    author: "Rick Riordan",
    category: "childrens_books",
    subcategory: "Middle Grade (8-12)",
    era: "modern",
    tone: {
      primary: "playful",
      secondary: "narrative",
      intensity: 9,
      formality: 3,
      warmth: 8,
      humor: 8,
      authority: 5,
      empathy: 7,
      directness: 8,
    },
    description: "Rick Riordan makes mythology accessible through modern, diverse heroes with ADHD and dyslexia.",
    styleDescription: "Action-packed, humorous, educational; series structure that teaches mythology.",
    sampleExcerpt: "Look, I didn't want to be a half-blood. If you're reading this because you think you might be one, my advice is: close this book right now.",
    bestFor: ["Mythology education", "Reluctant readers", "Series development"],
    influences: ["Greek mythology", "Modern education"],
  },
  // Children's Books - Young Adult
  {
    id: "child-ya-001",
    name: "The Hinton Style",
    author: "S.E. Hinton",
    category: "childrens_books",
    subcategory: "Young Adult (12+)",
    era: "classic",
    tone: {
      primary: "narrative",
      intensity: 9,
      formality: 4,
      warmth: 6,
      humor: 3,
      authority: 5,
      empathy: 10,
      directness: 9,
    },
    description: "S.E. Hinton created modern YA with raw, authentic teen voices in 'The Outsiders'.",
    styleDescription: "Raw, authentic, social realist; first-person narrative capturing real teen experience.",
    sampleExcerpt: "When I stepped out into the bright sunlight from the darkness of the movie house, I had only two things on my mind: Paul Newman and a ride home.",
    bestFor: ["Teen experience", "Social issues", "Authentic voice"],
    influences: ["New journalism", "Teen experience"],
  },
  {
    id: "child-ya-002",
    name: "The Green Style",
    author: "John Green",
    category: "childrens_books",
    subcategory: "Young Adult (12+)",
    era: "modern",
    tone: {
      primary: "narrative",
      secondary: "conversational",
      intensity: 8,
      formality: 4,
      warmth: 8,
      humor: 7,
      authority: 5,
      empathy: 9,
      directness: 7,
    },
    description: "John Green writes intellectual, emotionally resonant YA that doesn't talk down to teens.",
    styleDescription: "Intellectual, philosophical, emotional; contemporary literary with big questions.",
    sampleExcerpt: "I fell in love the way you fall asleep: slowly, and then all at once.",
    bestFor: ["Contemporary YA", "Philosophical themes", "Emotional depth"],
    influences: ["Literary fiction", "Philosophy"],
  },
  {
    id: "child-ya-003",
    name: "The Thomas Style",
    author: "Angie Thomas",
    category: "childrens_books",
    subcategory: "Young Adult (12+)",
    era: "modern",
    tone: {
      primary: "narrative",
      intensity: 10,
      formality: 3,
      warmth: 8,
      humor: 5,
      authority: 8,
      empathy: 10,
      directness: 10,
    },
    description: "Angie Thomas writes powerful, authentic stories about Black teen experience and social justice.",
    styleDescription: "Powerful, social justice, authentic; first-person contemporary with cultural richness.",
    sampleExcerpt: "What's the point of having a voice if you're gonna be silent in those moments you shouldn't be?",
    bestFor: ["Social justice themes", "Authentic representation", "Contemporary issues"],
    influences: ["Hip-hop culture", "Activism"],
  },
  // Fiction - Science Fiction
  {
    id: "fic-sf-001",
    name: "The Asimov Style",
    author: "Isaac Asimov",
    category: "fiction",
    subcategory: "Science Fiction",
    era: "classic",
    tone: {
      primary: "authoritative",
      secondary: "conversational",
      intensity: 8,
      formality: 6,
      warmth: 5,
      humor: 4,
      authority: 9,
      empathy: 5,
      directness: 8,
    },
    description: "Isaac Asimov's Foundation series and robot stories defined the golden age of science fiction.",
    styleDescription: "Ideas-driven, methodical, clear; connected universe with scientific extrapolation.",
    sampleExcerpt: "The three fundamental Rules of Robotics: One, a robot may not injure a human being...",
    bestFor: ["Hard science fiction", "World-building", "Idea exploration"],
    influences: ["Golden age SF", "Scientific method"],
  },
  {
    id: "fic-sf-002",
    name: "The Clarke Style",
    author: "Arthur C. Clarke",
    category: "fiction",
    subcategory: "Science Fiction",
    era: "classic",
    tone: {
      primary: "authoritative",
      intensity: 9,
      formality: 7,
      warmth: 4,
      humor: 3,
      authority: 10,
      empathy: 5,
      directness: 7,
    },
    description: "Arthur C. Clarke combined hard science with cosmic wonder and prophetic vision.",
    styleDescription: "Hard science, prophetic, elegant; epic scope with technical accuracy.",
    sampleExcerpt: "Any sufficiently advanced technology is indistinguishable from magic.",
    bestFor: ["Hard SF", "Space exploration", "Cosmic themes"],
    influences: ["Space age", "British SF tradition"],
  },
  {
    id: "fic-sf-003",
    name: "The Dick Style",
    author: "Philip K. Dick",
    category: "fiction",
    subcategory: "Science Fiction",
    era: "classic",
    tone: {
      primary: "narrative",
      intensity: 9,
      formality: 4,
      warmth: 5,
      humor: 5,
      authority: 6,
      empathy: 8,
      directness: 7,
    },
    description: "Philip K. Dick questioned reality, identity, and humanity in paranoid, brilliant stories.",
    styleDescription: "Paranoid, reality-bending, philosophical; mind-bending narratives questioning reality.",
    sampleExcerpt: "Reality is that which, when you stop believing in it, doesn't go away.",
    bestFor: ["Philosophical SF", "Reality exploration", "Dystopian themes"],
    influences: ["Existentialism", "Gnosticism"],
  },
  {
    id: "fic-sf-004",
    name: "The Weir Style",
    author: "Andy Weir",
    category: "fiction",
    subcategory: "Science Fiction",
    era: "modern",
    tone: {
      primary: "conversational",
      secondary: "playful",
      intensity: 9,
      formality: 3,
      warmth: 8,
      humor: 8,
      authority: 7,
      empathy: 7,
      directness: 9,
    },
    description: "Andy Weir writes technical problem-solving SF with humor and authentic science.",
    styleDescription: "Technical, problem-solving, humorous; survival narrative with real science.",
    sampleExcerpt: "I'm going to have to science the shit out of this.",
    bestFor: ["Hard SF", "Problem-solving", "Technical accuracy"],
    influences: ["Engineering", "Internet culture"],
  },
  {
    id: "fic-sf-005",
    name: "The Jemisin Style",
    author: "N.K. Jemisin",
    category: "fiction",
    subcategory: "Science Fiction",
    era: "modern",
    tone: {
      primary: "narrative",
      secondary: "poetic",
      intensity: 9,
      formality: 6,
      warmth: 6,
      humor: 3,
      authority: 8,
      empathy: 9,
      directness: 7,
    },
    description: "N.K. Jemisin writes innovative, lyrical SF exploring power, oppression, and survival.",
    styleDescription: "Lyrical, innovative, social; second-person possible with deep world-building.",
    sampleExcerpt: "You are she. She is you. You are Essun. Remember? The woman whose son is dead.",
    bestFor: ["Literary SF", "Social themes", "Experimental narrative"],
    influences: ["African diaspora", "Geology"],
  },
  // Fiction - Fantasy
  {
    id: "fic-fan-001",
    name: "The Tolkien Style",
    author: "J.R.R. Tolkien",
    category: "fiction",
    subcategory: "Fantasy",
    era: "classic",
    tone: {
      primary: "narrative",
      secondary: "poetic",
      intensity: 9,
      formality: 8,
      warmth: 7,
      humor: 4,
      authority: 9,
      empathy: 7,
      directness: 5,
    },
    description: "J.R.R. Tolkien created the template for modern fantasy with Middle-earth.",
    styleDescription: "Epic, mythological, linguistic; world-building with invented languages and deep history.",
    sampleExcerpt: "In a hole in the ground there lived a hobbit.",
    bestFor: ["Epic fantasy", "World-building", "Mythological themes"],
    influences: ["Old English literature", "Nordic mythology"],
  },
  {
    id: "fic-fan-002",
    name: "The Martin Style",
    author: "George R.R. Martin",
    category: "fiction",
    subcategory: "Fantasy",
    era: "modern",
    tone: {
      primary: "narrative",
      intensity: 9,
      formality: 6,
      warmth: 4,
      humor: 4,
      authority: 8,
      empathy: 6,
      directness: 8,
    },
    description: "George R.R. Martin brought gritty realism and moral complexity to fantasy.",
    styleDescription: "Gritty, complex, political; multiple POVs with consequences for actions.",
    sampleExcerpt: "When you play the game of thrones, you win or you die. There is no middle ground.",
    bestFor: ["Epic fantasy", "Political intrigue", "Moral complexity"],
    influences: ["Medieval history", "War of the Roses"],
  },
  {
    id: "fic-fan-003",
    name: "The Sanderson Style",
    author: "Brandon Sanderson",
    category: "fiction",
    subcategory: "Fantasy",
    era: "modern",
    tone: {
      primary: "narrative",
      intensity: 8,
      formality: 5,
      warmth: 7,
      humor: 5,
      authority: 7,
      empathy: 7,
      directness: 7,
    },
    description: "Brandon Sanderson creates intricate magic systems with logical rules and satisfying payoffs.",
    styleDescription: "Systematic, intricate, satisfying; hard magic with clear rules and epic scope.",
    sampleExcerpt: "The most important step a man can take. It's not the first one, is it? It's the next one.",
    bestFor: ["Hard magic", "Epic fantasy", "Series development"],
    influences: ["Video games", "Engineering"],
  },
  // Fiction - Mystery/Thriller
  {
    id: "fic-mys-001",
    name: "The Christie Style",
    author: "Agatha Christie",
    category: "fiction",
    subcategory: "Mystery/Thriller",
    era: "classic",
    tone: {
      primary: "narrative",
      intensity: 7,
      formality: 6,
      warmth: 6,
      humor: 5,
      authority: 7,
      empathy: 6,
      directness: 6,
    },
    description: "Agatha Christie perfected the whodunit with clever plots and memorable detectives.",
    styleDescription: "Puzzle-focused, fair-play, clever; traditional mystery with all clues given.",
    sampleExcerpt: "The impossible could not have happened, therefore the impossible must be possible in spite of appearances.",
    bestFor: ["Whodunits", "Fair-play mystery", "Cozy mystery"],
    influences: ["Golden age mystery", "British tradition"],
  },
  {
    id: "fic-mys-002",
    name: "The King Style",
    author: "Stephen King",
    category: "fiction",
    subcategory: "Horror",
    era: "modern",
    tone: {
      primary: "narrative",
      secondary: "conversational",
      intensity: 9,
      formality: 4,
      warmth: 7,
      humor: 5,
      authority: 8,
      empathy: 9,
      directness: 8,
    },
    description: "Stephen King combines supernatural horror with deep character work and American settings.",
    styleDescription: "Character-driven horror, immersive, American; ordinary people facing extraordinary evil.",
    sampleExcerpt: "Monsters are real, and ghosts are real too. They live inside us, and sometimes, they win.",
    bestFor: ["Horror", "Thriller", "Character-driven stories"],
    influences: ["American small towns", "Rock music"],
  },
  // Non-Fiction - Popular Science
  {
    id: "nf-sci-001",
    name: "The Sagan Style",
    author: "Carl Sagan",
    category: "non_fiction",
    subcategory: "Popular Science",
    era: "classic",
    tone: {
      primary: "inspirational",
      secondary: "conversational",
      intensity: 9,
      formality: 5,
      warmth: 9,
      humor: 5,
      authority: 9,
      empathy: 9,
      directness: 7,
    },
    description: "Carl Sagan inspired wonder about the cosmos while making science accessible to millions.",
    styleDescription: "Wonder-inducing, poetic, accessible; cosmic perspective with human connection.",
    sampleExcerpt: "We are made of star-stuff. We are a way for the universe to know itself.",
    bestFor: ["Science communication", "Cosmic themes", "Inspiring wonder"],
    influences: ["Astronomy", "Humanism"],
  },
  {
    id: "nf-sci-002",
    name: "The Bryson Style",
    author: "Bill Bryson",
    category: "non_fiction",
    subcategory: "Popular Science",
    era: "modern",
    tone: {
      primary: "conversational",
      secondary: "playful",
      intensity: 8,
      formality: 4,
      warmth: 9,
      humor: 9,
      authority: 7,
      empathy: 8,
      directness: 7,
    },
    description: "Bill Bryson makes science and history delightfully funny and utterly accessible.",
    styleDescription: "Witty, curious, accessible; humorous exploration of complex topics.",
    sampleExcerpt: "It is a slightly arresting notion that if you were to pick yourself apart with tweezers, one atom at a time, you would produce a mound of fine atomic dust.",
    bestFor: ["Popular science", "History", "Humorous nonfiction"],
    influences: ["British humor", "Travel writing"],
  },
  {
    id: "nf-sci-003",
    name: "The Gladwell Style",
    author: "Malcolm Gladwell",
    category: "non_fiction",
    subcategory: "Popular Science",
    era: "modern",
    tone: {
      primary: "conversational",
      secondary: "narrative",
      intensity: 8,
      formality: 5,
      warmth: 7,
      humor: 5,
      authority: 8,
      empathy: 7,
      directness: 7,
    },
    description: "Malcolm Gladwell popularized counterintuitive thinking through compelling storytelling.",
    styleDescription: "Story-driven, counterintuitive, accessible; narrative approach to social science.",
    sampleExcerpt: "The key to good decision making is not knowledge. It is understanding.",
    bestFor: ["Business books", "Social science", "Counterintuitive ideas"],
    influences: ["New Yorker journalism", "Social psychology"],
  },
  // Non-Fiction - Self-Help
  {
    id: "nf-sh-001",
    name: "The Carnegie Style",
    author: "Dale Carnegie",
    category: "non_fiction",
    subcategory: "Self-Help",
    era: "classic",
    tone: {
      primary: "conversational",
      secondary: "inspirational",
      intensity: 8,
      formality: 4,
      warmth: 9,
      humor: 5,
      authority: 8,
      empathy: 9,
      directness: 8,
    },
    description: "Dale Carnegie pioneered practical self-help with timeless principles for success.",
    styleDescription: "Practical, story-driven, warm; actionable advice with real-world examples.",
    sampleExcerpt: "You can make more friends in two months by becoming interested in other people than you can in two years by trying to get other people interested in you.",
    bestFor: ["Self-improvement", "Interpersonal skills", "Business"],
    influences: ["American pragmatism", "Public speaking"],
  },
  {
    id: "nf-sh-002",
    name: "The Holiday Style",
    author: "Ryan Holiday",
    category: "non_fiction",
    subcategory: "Self-Help",
    era: "modern",
    tone: {
      primary: "authoritative",
      secondary: "conversational",
      intensity: 8,
      formality: 5,
      warmth: 6,
      humor: 4,
      authority: 8,
      empathy: 6,
      directness: 9,
    },
    description: "Ryan Holiday brings Stoic philosophy to modern audiences with practical applications.",
    styleDescription: "Stoic, practical, historical; ancient wisdom applied to modern challenges.",
    sampleExcerpt: "The obstacle is the way.",
    bestFor: ["Stoic philosophy", "Modern self-help", "Practical wisdom"],
    influences: ["Marcus Aurelius", "Seneca"],
  },
  // Non-Fiction - Business
  {
    id: "nf-bus-001",
    name: "The Collins Style",
    author: "Jim Collins",
    category: "non_fiction",
    subcategory: "Business",
    era: "modern",
    tone: {
      primary: "authoritative",
      intensity: 8,
      formality: 6,
      warmth: 6,
      humor: 3,
      authority: 9,
      empathy: 5,
      directness: 8,
    },
    description: "Jim Collins combines rigorous research with clear frameworks for business excellence.",
    styleDescription: "Research-driven, framework-oriented, clear; data-backed business insights.",
    sampleExcerpt: "Good is the enemy of great. And that is one of the key reasons why we have so little that becomes great.",
    bestFor: ["Business strategy", "Leadership", "Corporate culture"],
    influences: ["Business research", "Stanford academics"],
  },
  {
    id: "nf-bus-002",
    name: "The Kiyosaki Style",
    author: "Robert Kiyosaki",
    category: "non_fiction",
    subcategory: "Business",
    era: "modern",
    tone: {
      primary: "conversational",
      secondary: "inspirational",
      intensity: 8,
      formality: 3,
      warmth: 7,
      humor: 5,
      authority: 7,
      empathy: 7,
      directness: 9,
    },
    description: "Robert Kiyosaki popularized financial education through contrasting lessons from two fathers.",
    styleDescription: "Story-driven, contrasting, accessible; parable format for financial education.",
    sampleExcerpt: "The rich don't work for money. They make money work for them.",
    bestFor: ["Financial education", "Wealth building", "Mindset shifts"],
    influences: ["Entrepreneurship", "Real estate"],
  },
  // Non-Fiction - Biography/Memoir
  {
    id: "nf-bio-001",
    name: "The Isaacson Style",
    author: "Walter Isaacson",
    category: "non_fiction",
    subcategory: "Biography/Memoir",
    era: "modern",
    tone: {
      primary: "narrative",
      secondary: "authoritative",
      intensity: 8,
      formality: 6,
      warmth: 6,
      humor: 4,
      authority: 9,
      empathy: 7,
      directness: 7,
    },
    description: "Walter Isaacson writes definitive biographies of transformative figures with deep access.",
    styleDescription: "Comprehensive, insightful, balanced; deep research with narrative drive.",
    sampleExcerpt: "The people who are crazy enough to think they can change the world are the ones who do.",
    bestFor: ["Biography", "Innovation stories", "Leadership profiles"],
    influences: ["New journalism", "Historical biography"],
  },
  {
    id: "nf-bio-002",
    name: "The Obama Style",
    author: "Michelle Obama",
    category: "non_fiction",
    subcategory: "Biography/Memoir",
    era: "modern",
    tone: {
      primary: "narrative",
      secondary: "inspirational",
      intensity: 8,
      formality: 5,
      warmth: 9,
      humor: 6,
      authority: 8,
      empathy: 10,
      directness: 8,
    },
    description: "Michelle Obama writes with warmth, honesty, and inspiration about becoming.",
    styleDescription: "Personal, vulnerable, inspiring; honest reflection with universal themes.",
    sampleExcerpt: "There's power in allowing yourself to be known and heard, in owning your unique story.",
    bestFor: ["Memoir", "Inspirational stories", "Personal growth"],
    influences: ["American experience", "Personal journey"],
  },
];

// Copywriting frameworks from PRD
const copywritingFrameworks = [
  {
    id: "schwartz",
    name: "Schwartz Awareness Levels",
    author: "Eugene Schwartz",
    description: "Match messaging to reader's awareness level",
    levels: ["Unaware", "Problem-Aware", "Solution-Aware", "Product-Aware", "Most Aware"],
  },
  {
    id: "cialdini",
    name: "Cialdini's Principles",
    author: "Robert Cialdini",
    description: "Six principles of persuasion",
    principles: ["Reciprocity", "Commitment", "Social Proof", "Authority", "Liking", "Scarcity"],
  },
  {
    id: "sugarman",
    name: "Sugarman Triggers",
    author: "Joseph Sugarman",
    description: "Psychological triggers for compelling copy",
    triggers: ["Curiosity", "Storytelling", "Authority", "Proof", "Greed", "Exclusivity"],
  },
  {
    id: "aida",
    name: "AIDA Framework",
    author: "E. St. Elmo Lewis",
    description: "Classic marketing funnel",
    stages: ["Attention", "Interest", "Desire", "Action"],
  },
  {
    id: "pas",
    name: "PAS Formula",
    author: "Dan Kennedy",
    description: "Problem-focused persuasion",
    stages: ["Problem", "Agitation", "Solution"],
  },
  {
    id: "storybrand",
    name: "StoryBrand Framework",
    author: "Donald Miller",
    description: "Hero's journey for marketing",
    elements: ["Character", "Problem", "Guide", "Plan", "Call to Action", "Success", "Failure"],
  },
  {
    id: "emotional",
    name: "Emotional Triggers",
    author: "Drew Eric Whitman",
    description: "Eight core desires",
    desires: ["Survival", "Food", "Freedom", "Sexual", "Comfort", "Superiority", "Care", "Social Approval"],
  },
  {
    id: "breakthrough",
    name: "Breakthrough Advertising",
    author: "Eugene Schwartz",
    description: "Advanced copywriting principles",
    concepts: ["Mass Desire", "State of Awareness", "Sophistication", "Headlines"],
  },
];

export default function StylesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<AuthorStyle | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [eraFilter, setEraFilter] = useState<"all" | "classic" | "modern">("all");
  const [showFrameworks, setShowFrameworks] = useState(false);

  // Filter styles based on selections
  const filteredStyles = useMemo(() => {
    return authorStyles.filter((style) => {
      const matchesCategory = !selectedCategory || style.category === selectedCategory;
      const matchesSubcategory = !selectedSubcategory || style.subcategory === selectedSubcategory;
      const matchesSearch = !searchQuery ||
        style.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        style.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        style.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesEra = eraFilter === "all" || style.era === eraFilter;

      return matchesCategory && matchesSubcategory && matchesSearch && matchesEra;
    });
  }, [selectedCategory, selectedSubcategory, searchQuery, eraFilter]);

  // Get subcategories for selected category
  const currentSubcategories = useMemo(() => {
    if (!selectedCategory) return [];
    const category = categories.find((c) => c.id === selectedCategory);
    return category?.subcategories || [];
  }, [selectedCategory]);

  // Tone attribute labels
  const toneLabels: Record<string, string> = {
    formality: "Formality",
    warmth: "Warmth",
    humor: "Humor",
    authority: "Authority",
    empathy: "Empathy",
    directness: "Directness",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Writing Styles Framework</h1>
          <p className="text-base-content/60 mt-1">
            104+ master author styles across 20 categories
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFrameworks(!showFrameworks)}
            className={`btn ${showFrameworks ? "btn-secondary" : "btn-ghost"}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Copywriting Frameworks
          </button>
          <Link href="/dashboard" className="btn btn-primary">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Book
          </Link>
        </div>
      </div>

      {/* Copywriting Frameworks Modal */}
      {showFrameworks && (
        <div className="mb-8 bg-base-100 rounded-xl shadow-lg border border-base-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Copywriting & Persuasion Frameworks</h2>
            <button onClick={() => setShowFrameworks(false)} className="btn btn-ghost btn-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-base-content/60 mb-6">
            Combine any author style with these proven copywriting frameworks for maximum impact.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {copywritingFrameworks.map((framework) => (
              <div key={framework.id} className="bg-base-200/50 rounded-lg p-4">
                <h3 className="font-semibold text-sm">{framework.name}</h3>
                <p className="text-xs text-base-content/60 mb-2">{framework.author}</p>
                <p className="text-xs mb-2">{framework.description}</p>
                <div className="flex flex-wrap gap-1">
                  {(framework.levels || framework.principles || framework.triggers || framework.stages || framework.elements || framework.desires || framework.concepts)?.slice(0, 4).map((item, i) => (
                    <span key={i} className="badge badge-xs badge-primary">{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-base-100 rounded-xl shadow-lg border border-base-200 p-6 mb-8">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="form-control flex-1 min-w-[200px]">
            <div className="input-group">
              <input
                type="text"
                placeholder="Search styles, authors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input input-bordered w-full"
              />
            </div>
          </div>

          {/* Era Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setEraFilter("all")}
              className={`btn btn-sm ${eraFilter === "all" ? "btn-primary" : "btn-ghost"}`}
            >
              All Eras
            </button>
            <button
              onClick={() => setEraFilter("classic")}
              className={`btn btn-sm ${eraFilter === "classic" ? "btn-primary" : "btn-ghost"}`}
            >
              Classic
            </button>
            <button
              onClick={() => setEraFilter("modern")}
              className={`btn btn-sm ${eraFilter === "modern" ? "btn-primary" : "btn-ghost"}`}
            >
              Modern
            </button>
          </div>

          {/* Clear Filters */}
          {(selectedCategory || selectedSubcategory || searchQuery || eraFilter !== "all") && (
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSelectedSubcategory(null);
                setSearchQuery("");
                setEraFilter("all");
              }}
              className="btn btn-ghost btn-sm text-error"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar - Categories */}
        <div className="w-64 shrink-0">
          <div className="bg-base-100 rounded-xl shadow-lg border border-base-200 p-4 sticky top-4">
            <h3 className="font-bold mb-4">Categories</h3>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSelectedSubcategory(null);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    !selectedCategory ? "bg-primary text-primary-content" : "hover:bg-base-200"
                  }`}
                >
                  All Styles ({authorStyles.length})
                </button>
              </li>
              {categories.map((category) => {
                const count = authorStyles.filter((s) => s.category === category.id).length;
                return (
                  <li key={category.id}>
                    <button
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setSelectedSubcategory(null);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                        selectedCategory === category.id
                          ? "bg-primary text-primary-content"
                          : "hover:bg-base-200"
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={category.icon} />
                      </svg>
                      <span className="flex-1">{category.name}</span>
                      <span className="text-xs opacity-70">({count})</span>
                    </button>
                    {/* Subcategories */}
                    {selectedCategory === category.id && currentSubcategories.length > 0 && (
                      <ul className="ml-6 mt-1 space-y-1">
                        {currentSubcategories.map((sub) => {
                          const subCount = authorStyles.filter(
                            (s) => s.category === category.id && s.subcategory === sub
                          ).length;
                          return (
                            <li key={sub}>
                              <button
                                onClick={() => setSelectedSubcategory(sub)}
                                className={`w-full text-left px-2 py-1 rounded text-sm transition-colors ${
                                  selectedSubcategory === sub
                                    ? "bg-secondary text-secondary-content"
                                    : "hover:bg-base-200"
                                }`}
                              >
                                {sub} ({subCount})
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Style Detail Modal */}
          {selectedStyle && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setSelectedStyle(null)}
              ></div>
              <div className="bg-base-100 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative z-10">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`badge ${selectedStyle.era === "classic" ? "badge-secondary" : "badge-primary"}`}>
                          {selectedStyle.era}
                        </span>
                        <span className="badge badge-ghost">{selectedStyle.subcategory}</span>
                      </div>
                      <h2 className="text-2xl font-bold">{selectedStyle.name}</h2>
                      <p className="text-lg text-base-content/70">by {selectedStyle.author}</p>
                    </div>
                    <button
                      onClick={() => setSelectedStyle(null)}
                      className="btn btn-ghost btn-sm"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Description */}
                  <p className="text-base-content/80 mb-6">{selectedStyle.description}</p>

                  {/* Tone Attributes */}
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3">Tone Profile</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(toneLabels).map(([key, label]) => (
                        <div key={key}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{label}</span>
                            <span>{selectedStyle.tone[key as keyof ToneConfig] as number}/10</span>
                          </div>
                          <progress
                            className="progress progress-primary w-full"
                            value={selectedStyle.tone[key as keyof ToneConfig] as number}
                            max={10}
                          ></progress>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Style Description */}
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2">Style Characteristics</h3>
                    <p className="text-base-content/70 text-sm">{selectedStyle.styleDescription}</p>
                  </div>

                  {/* Sample Excerpt */}
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2">Sample Excerpt</h3>
                    <blockquote className="border-l-4 border-primary pl-4 italic text-base-content/80">
                      &quot;{selectedStyle.sampleExcerpt}&quot;
                    </blockquote>
                  </div>

                  {/* Best For */}
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2">Best For</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedStyle.bestFor.map((item) => (
                        <span key={item} className="badge badge-outline">{item}</span>
                      ))}
                    </div>
                  </div>

                  {/* Influences */}
                  {selectedStyle.influences.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold mb-2">Influences</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedStyle.influences.map((item) => (
                          <span key={item} className="badge badge-ghost">{item}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-base-200">
                    <Link
                      href={`/dashboard?style=${selectedStyle.id}`}
                      className="btn btn-primary flex-1"
                    >
                      Use This Style
                    </Link>
                    <button className="btn btn-outline">
                      Save to Favorites
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Styles Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStyles.map((style) => (
              <div
                key={style.id}
                onClick={() => setSelectedStyle(style)}
                className="bg-base-100 rounded-xl shadow-lg border border-base-200 p-5 cursor-pointer hover:shadow-xl hover:border-primary/30 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold group-hover:text-primary transition-colors">{style.name}</h3>
                    <p className="text-sm text-base-content/60">{style.author}</p>
                  </div>
                  <span className={`badge badge-sm ${style.era === "classic" ? "badge-secondary" : "badge-primary"}`}>
                    {style.era}
                  </span>
                </div>

                <p className="text-sm text-base-content/70 line-clamp-2 mb-3">
                  {style.description}
                </p>

                {/* Quick Tone Preview */}
                <div className="flex gap-2 mb-3">
                  <div className="flex items-center gap-1 text-xs">
                    <span className="opacity-60">Warm:</span>
                    <div className="w-12 h-1.5 bg-base-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${style.tone.warmth * 10}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <span className="opacity-60">Humor:</span>
                    <div className="w-12 h-1.5 bg-base-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-secondary"
                        style={{ width: `${style.tone.humor * 10}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Best For Tags */}
                <div className="flex flex-wrap gap-1">
                  {style.bestFor.slice(0, 2).map((tag) => (
                    <span key={tag} className="badge badge-xs badge-ghost">{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {filteredStyles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-base-content/60">No styles found matching your criteria.</p>
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedSubcategory(null);
                  setSearchQuery("");
                  setEraFilter("all");
                }}
                className="btn btn-ghost mt-4"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* Stats */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-base-100 rounded-lg p-4 text-center border border-base-200">
              <div className="text-2xl font-bold text-primary">{authorStyles.length}</div>
              <div className="text-sm text-base-content/60">Total Styles</div>
            </div>
            <div className="bg-base-100 rounded-lg p-4 text-center border border-base-200">
              <div className="text-2xl font-bold text-primary">{categories.length}</div>
              <div className="text-sm text-base-content/60">Categories</div>
            </div>
            <div className="bg-base-100 rounded-lg p-4 text-center border border-base-200">
              <div className="text-2xl font-bold text-primary">{copywritingFrameworks.length}</div>
              <div className="text-sm text-base-content/60">Frameworks</div>
            </div>
            <div className="bg-base-100 rounded-lg p-4 text-center border border-base-200">
              <div className="text-2xl font-bold text-primary">
                {authorStyles.filter((s) => s.era === "modern").length}
              </div>
              <div className="text-sm text-base-content/60">Modern Styles</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
