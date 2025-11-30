import { NextRequest, NextResponse } from "next/server";

type AIProvider = "claude" | "gemini" | "openai";

interface AIConfig {
  provider: AIProvider;
  model: string;
  apiKey?: string;
}

interface RecommendFeaturesRequest {
  chapterTitle: string;
  chapterDescription: string;
  aiConfig: AIConfig;
}

// All available features
const ALL_FEATURES = [
  "admonitions",
  "codeBlocks",
  "mathEquations",
  "mermaidDiagrams",
  "figures",
  "tables",
  "blockquotes",
  "cards",
  "grids",
  "asides",
  "footnotes",
  "abbreviations",
  "smallcaps",
  "subscriptSuperscript",
  "underlineStrikethrough",
  "keyboard",
  "videos",
  "images",
  "exercises",
  "dropdowns",
  "tabs",
  "glossary",
  "buttons",
  "proofs",
  "siUnits",
  "chemicalFormulas",
  "wikipediaLinks",
  "githubLinks",
  "doiLinks",
  "rridLinks",
  "rorLinks",
  "intersphinx",
  "embedDirective",
  "includeFiles",
  "evalExpressions",
  "executableCode",
  "jupyterLite",
  "binderIntegration",
  "thebe",
  "colabLinks",
  "pdfExport",
  "wordExport",
  "texExport",
  "jatsExport",
  "typstExport",
  "markdownExport",
  "tableOfContents",
  "crossReferences",
  "citations",
  "indexEntries",
  "numberedReferences",
];

// Feature descriptions for AI context
const FEATURE_DESCRIPTIONS: Record<string, string> = {
  admonitions: "Note, tip, warning, danger callout boxes",
  codeBlocks: "Syntax-highlighted code examples",
  mathEquations: "LaTeX mathematical equations",
  mermaidDiagrams: "Flowcharts, sequence diagrams, graphs",
  figures: "Images with captions and references",
  tables: "Data tables",
  blockquotes: "Quoted text and epigraphs",
  cards: "Content cards for highlights",
  grids: "Multi-column layouts",
  asides: "Sidenotes and margin notes",
  footnotes: "Bottom-of-page references",
  abbreviations: "Terms with tooltip definitions",
  smallcaps: "Stylized small capital text",
  subscriptSuperscript: "H₂O or E=mc² formatting",
  underlineStrikethrough: "Text decoration",
  keyboard: "Keyboard shortcut styling (Ctrl+C)",
  videos: "Embedded video content",
  images: "Standalone images",
  exercises: "Practice problems with solutions",
  dropdowns: "Collapsible content sections",
  tabs: "Tabbed content panels",
  glossary: "Term definitions with links",
  buttons: "Call-to-action buttons",
  proofs: "Mathematical proofs and theorems",
  siUnits: "Scientific units formatting",
  chemicalFormulas: "Chemical notation",
  wikipediaLinks: "Wikipedia references",
  githubLinks: "GitHub repository links",
  doiLinks: "Academic paper DOI links",
  rridLinks: "Research resource identifiers",
  rorLinks: "Research organization links",
  intersphinx: "Python documentation cross-refs",
  embedDirective: "Embed external MyST content",
  includeFiles: "Include external files",
  evalExpressions: "Dynamic computed values",
  executableCode: "Run code during build",
  jupyterLite: "Browser-based Python execution",
  binderIntegration: "Cloud Jupyter notebooks",
  thebe: "In-page live code execution",
  colabLinks: "Google Colab notebook links",
  pdfExport: "PDF generation",
  wordExport: "Word document export",
  texExport: "LaTeX source export",
  jatsExport: "Academic XML export",
  typstExport: "Typst PDF export",
  markdownExport: "Plain Markdown export",
  tableOfContents: "Navigation sidebar",
  crossReferences: "Section and figure links",
  citations: "Bibliography and citations",
  indexEntries: "Searchable index",
  numberedReferences: "Auto-numbered elements",
};

// Claude API call
async function getRecommendationsWithClaude(
  prompt: string,
  apiKey: string,
  model: string
): Promise<string[]> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: model || "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${error}`);
  }

  const data = await response.json();
  return parseFeatures(data.content[0].text);
}

// Gemini API call
async function getRecommendationsWithGemini(
  prompt: string,
  apiKey: string,
  model: string
): Promise<string[]> {
  const modelName = model || "gemini-pro";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  const data = await response.json();
  return parseFeatures(data.candidates[0].content.parts[0].text);
}

// OpenAI API call
async function getRecommendationsWithOpenAI(
  prompt: string,
  apiKey: string,
  model: string
): Promise<string[]> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model || "gpt-4o",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  return parseFeatures(data.choices[0].message.content);
}

// Parse features from AI response
function parseFeatures(content: string): string[] {
  // Try JSON array first
  try {
    const jsonMatch = content.match(/\[[\s\S]*?\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed)) {
        return parsed.filter((f) => ALL_FEATURES.includes(f));
      }
    }
  } catch {
    // Fall through to regex
  }

  // Look for feature names in the text
  const found: string[] = [];
  for (const feature of ALL_FEATURES) {
    if (content.toLowerCase().includes(feature.toLowerCase())) {
      found.push(feature);
    }
  }

  return found.length > 0 ? found : ["admonitions", "codeBlocks", "figures"];
}

export async function POST(request: NextRequest) {
  try {
    const body: RecommendFeaturesRequest = await request.json();
    const { chapterTitle, chapterDescription, aiConfig } = body;

    if (!chapterTitle) {
      return NextResponse.json(
        { error: "Chapter title is required" },
        { status: 400 }
      );
    }

    // Build feature list for prompt
    const featureList = Object.entries(FEATURE_DESCRIPTIONS)
      .map(([key, desc]) => `- ${key}: ${desc}`)
      .join("\n");

    const prompt = `You are an expert eBook designer. Based on the chapter information below, recommend the most appropriate features to enhance the content.

CHAPTER TITLE: ${chapterTitle}
CHAPTER DESCRIPTION: ${chapterDescription || "No description provided"}

AVAILABLE FEATURES:
${featureList}

Analyze the chapter topic and recommend 5-10 features that would be most useful. Consider:
1. The subject matter (technical, academic, tutorial, etc.)
2. What types of content would enhance learning
3. Interactive elements that fit the topic
4. Visual elements that would help explain concepts

Return ONLY a JSON array of feature keys, like:
["codeBlocks", "admonitions", "exercises", "figures", "dropdowns"]

Return the JSON array only, no other text.`;

    // Get API key
    let apiKey: string | undefined = aiConfig.apiKey;
    if (!apiKey) {
      switch (aiConfig.provider) {
        case "claude":
          apiKey = process.env.ANTHROPIC_API_KEY;
          break;
        case "gemini":
          apiKey = process.env.GEMINI_API_KEY;
          break;
        case "openai":
          apiKey = process.env.OPENAI_API_KEY;
          break;
      }
    }

    if (!apiKey) {
      // Return sensible defaults if no API key
      return NextResponse.json({
        features: ["admonitions", "codeBlocks", "figures", "exercises", "dropdowns"],
      });
    }

    // Get recommendations
    let features: string[];
    switch (aiConfig.provider) {
      case "claude":
        features = await getRecommendationsWithClaude(prompt, apiKey, aiConfig.model);
        break;
      case "gemini":
        features = await getRecommendationsWithGemini(prompt, apiKey, aiConfig.model);
        break;
      case "openai":
        features = await getRecommendationsWithOpenAI(prompt, apiKey, aiConfig.model);
        break;
      default:
        features = ["admonitions", "codeBlocks", "figures", "exercises", "dropdowns"];
    }

    return NextResponse.json({ features });
  } catch (error) {
    console.error("Error getting feature recommendations:", error);
    // Return defaults on error
    return NextResponse.json({
      features: ["admonitions", "codeBlocks", "figures", "exercises", "dropdowns"],
    });
  }
}
