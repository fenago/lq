// Author Styles database and utilities
// Extracted for shared use across the application

// Types based on PRD
export interface ToneConfig {
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

export interface AuthorStyle {
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

export interface StyleCategory {
  id: string;
  name: string;
  icon: string;
  subcategories: string[];
}

// Categories from PRD
export const styleCategories: StyleCategory[] = [
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

// Generate system prompt from author style
export function generateAuthorStylePrompt(style: AuthorStyle): string {
  const toneDescriptions: string[] = [];

  if (style.tone.formality >= 7) {
    toneDescriptions.push("formal and academic");
  } else if (style.tone.formality <= 3) {
    toneDescriptions.push("casual and conversational");
  } else {
    toneDescriptions.push("balanced in formality");
  }

  if (style.tone.warmth >= 7) {
    toneDescriptions.push("warm and inviting");
  } else if (style.tone.warmth <= 3) {
    toneDescriptions.push("objective and detached");
  }

  if (style.tone.humor >= 7) {
    toneDescriptions.push("incorporating humor and wit");
  } else if (style.tone.humor <= 3) {
    toneDescriptions.push("serious in tone");
  }

  if (style.tone.authority >= 7) {
    toneDescriptions.push("authoritative and confident");
  }

  if (style.tone.empathy >= 7) {
    toneDescriptions.push("empathetic and understanding");
  }

  if (style.tone.directness >= 7) {
    toneDescriptions.push("direct and clear");
  } else if (style.tone.directness <= 3) {
    toneDescriptions.push("nuanced and exploratory");
  }

  return `You are writing in the style of ${style.author} (${style.name}).

AUTHOR BACKGROUND:
${style.description}

STYLE CHARACTERISTICS:
${style.styleDescription}

TONE PROFILE:
- Primary tone: ${style.tone.primary}${style.tone.secondary ? `, with ${style.tone.secondary} undertones` : ""}
- Your writing should be: ${toneDescriptions.join(", ")}
- Intensity level: ${style.tone.intensity}/10

SAMPLE OF THE STYLE:
"${style.sampleExcerpt}"

BEST SUITED FOR:
${style.bestFor.map(b => `- ${b}`).join("\n")}

WRITING INSTRUCTIONS:
1. Emulate ${style.author}'s distinctive voice and approach
2. Match the formality level (${style.tone.formality}/10 - where 1 is very casual, 10 is very formal)
3. Incorporate warmth level of ${style.tone.warmth}/10 in your tone
4. Use humor appropriately for this style (${style.tone.humor}/10)
5. Maintain authority level of ${style.tone.authority}/10
6. Show empathy at level ${style.tone.empathy}/10
7. Be ${style.tone.directness >= 7 ? "direct and to the point" : style.tone.directness <= 3 ? "exploratory and nuanced" : "balanced between direct and exploratory"}

Remember: You are channeling ${style.author}'s approach to writing. Think about how they would explain concepts, engage readers, and structure their prose.`;
}

// Find author style by ID
export function findAuthorStyleById(styles: AuthorStyle[], id: string): AuthorStyle | undefined {
  return styles.find(s => s.id === id);
}

// Get styles by category
export function getStylesByCategory(styles: AuthorStyle[], categoryId: string): AuthorStyle[] {
  return styles.filter(s => s.category === categoryId);
}

// Get styles by subcategory
export function getStylesBySubcategory(styles: AuthorStyle[], subcategory: string): AuthorStyle[] {
  return styles.filter(s => s.subcategory === subcategory);
}
