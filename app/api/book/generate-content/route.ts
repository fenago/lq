import { NextRequest, NextResponse } from "next/server";

type AIProvider = "claude" | "gemini" | "openai";

interface Chapter {
  id: string;
  title: string;
  description: string;
  targetWordCount?: number;
  content?: string;
  generatedContent?: string;
}

interface MystFeatures {
  admonitions: boolean;
  codeBlocks: boolean;
  mathEquations: boolean;
  mermaidDiagrams: boolean;
  figures: boolean;
  tables: boolean;
  blockquotes: boolean;
  cards: boolean;
  grids: boolean;
  asides: boolean;
  footnotes: boolean;
  abbreviations: boolean;
  smallcaps: boolean;
  subscriptSuperscript: boolean;
  underlineStrikethrough: boolean;
  keyboard: boolean;
  videos: boolean;
  images: boolean;
  exercises: boolean;
  dropdowns: boolean;
  tabs: boolean;
  glossary: boolean;
  buttons: boolean;
  proofs: boolean;
  siUnits: boolean;
  chemicalFormulas: boolean;
  wikipediaLinks: boolean;
  githubLinks: boolean;
  doiLinks: boolean;
  rridLinks: boolean;
  rorLinks: boolean;
  intersphinx: boolean;
  embedDirective: boolean;
  includeFiles: boolean;
  evalExpressions: boolean;
  executableCode: boolean;
  jupyterLite: boolean;
  binderIntegration: boolean;
  thebe: boolean;
  colabLinks: boolean;
  pdfExport: boolean;
  wordExport: boolean;
  texExport: boolean;
  jatsExport: boolean;
  typstExport: boolean;
  markdownExport: boolean;
  tableOfContents: boolean;
  crossReferences: boolean;
  citations: boolean;
  indexEntries: boolean;
  numberedReferences: boolean;
}

interface BookConfig {
  title: string;
  description: string;
  author: string;
  chapters: Chapter[];
  targetWordCount?: number;
}

interface AIConfig {
  provider: AIProvider;
  model: string;
  apiKey?: string;
}

interface GenerateContentRequest {
  mode: "full" | "chapter";
  bookConfig: BookConfig;
  features: MystFeatures;
  aiConfig: AIConfig;
  targetWordCount?: number;
  chapterIndex?: number;
  chapterInstructions?: string;
}

// Get enabled features list for prompt
function getEnabledFeatures(features: MystFeatures): string[] {
  const featureLabels: Record<keyof MystFeatures, string> = {
    admonitions: "Admonitions (note, tip, warning, danger boxes)",
    codeBlocks: "Syntax-highlighted code blocks",
    mathEquations: "LaTeX math equations",
    mermaidDiagrams: "Mermaid diagrams",
    figures: "Figures with captions",
    tables: "Tables",
    blockquotes: "Blockquotes and epigraphs",
    cards: "Content cards",
    grids: "Grid layouts",
    asides: "Sidenotes and margin notes",
    footnotes: "Footnotes",
    abbreviations: "Abbreviations with tooltips",
    smallcaps: "Small caps",
    subscriptSuperscript: "Subscript and superscript",
    underlineStrikethrough: "Underline and strikethrough",
    keyboard: "Keyboard key styling",
    videos: "Embedded videos",
    images: "Images",
    exercises: "Exercises with solutions",
    dropdowns: "Collapsible dropdown sections",
    tabs: "Tabbed content panels",
    glossary: "Glossary terms",
    buttons: "Button links",
    proofs: "Proofs and theorems",
    siUnits: "SI units",
    chemicalFormulas: "Chemical formulas",
    wikipediaLinks: "Wikipedia links",
    githubLinks: "GitHub links",
    doiLinks: "DOI links",
    rridLinks: "RRID links",
    rorLinks: "ROR links",
    intersphinx: "Intersphinx cross-references",
    embedDirective: "Embed directive",
    includeFiles: "Include files",
    evalExpressions: "Eval expressions",
    executableCode: "Executable code cells",
    jupyterLite: "JupyterLite (browser-based Python)",
    binderIntegration: "Binder integration",
    thebe: "Thebe live code",
    colabLinks: "Google Colab links",
    pdfExport: "PDF export",
    wordExport: "Word export",
    texExport: "LaTeX export",
    jatsExport: "JATS XML export",
    typstExport: "Typst export",
    markdownExport: "Markdown export",
    tableOfContents: "Table of contents",
    crossReferences: "Cross-references",
    citations: "Citations and bibliography",
    indexEntries: "Index entries",
    numberedReferences: "Numbered references",
  };

  return Object.entries(features)
    .filter(([, enabled]) => enabled)
    .map(([key]) => featureLabels[key as keyof MystFeatures]);
}

// Build MyST syntax examples for the prompt
function getMystSyntaxExamples(features: MystFeatures): string {
  const examples: string[] = [];

  if (features.admonitions) {
    examples.push(`
Admonitions:
:::{note}
This is a note.
:::

:::{tip}
This is a tip.
:::

:::{warning}
This is a warning.
:::`);
  }

  if (features.codeBlocks) {
    examples.push(`
Code blocks:
\`\`\`python
def example():
    return "Hello, World!"
\`\`\``);
  }

  if (features.mathEquations) {
    examples.push(`
Math equations:
Inline: $E = mc^2$
Block:
$$
\\frac{d}{dx}e^x = e^x
$$`);
  }

  if (features.mermaidDiagrams) {
    examples.push(`
Mermaid diagrams:
\`\`\`{mermaid}
flowchart LR
    A[Start] --> B[Process]
    B --> C[End]
\`\`\``);
  }

  if (features.figures) {
    examples.push(`
Figures:
:::{figure} image.png
:name: fig-example
:align: center

Caption for the figure.
:::`);
  }

  if (features.exercises) {
    examples.push(`
Exercises:
:::{exercise}
:label: ex-1

Write a function that...
:::

:::{solution} ex-1
:class: dropdown

Here is the solution...
:::`);
  }

  if (features.dropdowns) {
    examples.push(`
Dropdowns:
:::{dropdown} Click to expand
Hidden content here.
:::`);
  }

  if (features.tabs) {
    examples.push(`
Tabs:
::::{tab-set}
:::{tab-item} Python
Python code here.
:::
:::{tab-item} JavaScript
JavaScript code here.
:::
::::`);
  }

  return examples.join("\n\n");
}

// Claude API call
async function generateWithClaude(
  prompt: string,
  apiKey: string,
  model: string
): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: model || "claude-sonnet-4-20250514",
      max_tokens: 8192,
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
  return data.content[0].text;
}

// Gemini API call
async function generateWithGemini(
  prompt: string,
  apiKey: string,
  model: string
): Promise<string> {
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
        generationConfig: {
          maxOutputTokens: 8192,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

// OpenAI API call
async function generateWithOpenAI(
  prompt: string,
  apiKey: string,
  model: string
): Promise<string> {
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
      max_tokens: 8192,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Generate content for a single chapter
async function generateChapterContent(
  bookConfig: BookConfig,
  chapter: Chapter,
  chapterIndex: number,
  features: MystFeatures,
  aiConfig: AIConfig,
  instructions?: string
): Promise<string> {
  const enabledFeatures = getEnabledFeatures(features);
  const syntaxExamples = getMystSyntaxExamples(features);
  const wordTarget = chapter.targetWordCount || 3000;

  const prompt = `You are an expert technical writer creating content for an interactive eBook using MyST Markdown syntax.

BOOK CONTEXT:
- Title: ${bookConfig.title}
- Description: ${bookConfig.description}
- Author: ${bookConfig.author}

CHAPTER TO WRITE:
- Chapter ${chapterIndex + 1}: ${chapter.title}
- Chapter Description: ${chapter.description}
${instructions ? `- Additional Instructions: ${instructions}` : ""}
- Target Word Count: ${wordTarget} words

ENABLED FEATURES TO USE:
${enabledFeatures.map((f) => `- ${f}`).join("\n")}

MYST MARKDOWN SYNTAX EXAMPLES:
${syntaxExamples}

REQUIREMENTS:
1. Write the COMPLETE chapter content in valid MyST Markdown
2. Start with a level-1 heading: # ${chapter.title}
3. Use the enabled MyST features appropriately throughout the content
4. Include code examples where relevant (use Python unless otherwise specified)
5. Add exercises or practice problems if exercises feature is enabled
6. Use admonitions to highlight important information
7. Target approximately ${wordTarget} words
8. Make the content educational, engaging, and practical
9. Include cross-references to figures and sections using MyST syntax
10. Structure the chapter with clear sections (##) and subsections (###)

Write ONLY the MyST Markdown content, no explanations or meta-commentary.`;

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
    throw new Error(`No API key found for ${aiConfig.provider}`);
  }

  // Generate content
  switch (aiConfig.provider) {
    case "claude":
      return generateWithClaude(prompt, apiKey, aiConfig.model);
    case "gemini":
      return generateWithGemini(prompt, apiKey, aiConfig.model);
    case "openai":
      return generateWithOpenAI(prompt, apiKey, aiConfig.model);
    default:
      throw new Error(`Unknown provider: ${aiConfig.provider}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateContentRequest = await request.json();
    const {
      mode,
      bookConfig,
      features,
      aiConfig,
      chapterIndex,
      chapterInstructions,
    } = body;

    if (mode === "chapter") {
      // Generate single chapter
      if (chapterIndex === undefined) {
        return NextResponse.json(
          { error: "Chapter index is required for chapter mode" },
          { status: 400 }
        );
      }

      const chapter = bookConfig.chapters[chapterIndex];
      if (!chapter) {
        return NextResponse.json(
          { error: "Chapter not found" },
          { status: 400 }
        );
      }

      const content = await generateChapterContent(
        bookConfig,
        chapter,
        chapterIndex,
        features,
        aiConfig,
        chapterInstructions
      );

      return NextResponse.json({ content });
    } else if (mode === "full") {
      // Generate all chapters
      const chapters: { content: string }[] = [];

      for (let i = 0; i < bookConfig.chapters.length; i++) {
        const chapter = bookConfig.chapters[i];
        const content = await generateChapterContent(
          bookConfig,
          chapter,
          i,
          features,
          aiConfig
        );
        chapters.push({ content });
      }

      return NextResponse.json({ chapters });
    }

    return NextResponse.json(
      { error: "Invalid mode. Use 'full' or 'chapter'" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error generating content:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate content" },
      { status: 500 }
    );
  }
}
