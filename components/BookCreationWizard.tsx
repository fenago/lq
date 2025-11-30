"use client";

import { useState, useEffect } from "react";

// Types for the wizard
interface Chapter {
  id: string;
  title: string;
  description: string;
  targetWordCount?: number;
  content?: string; // Generated or manual content
  features?: Partial<MystFeatures>; // Per-chapter feature overrides
  generatedContent?: string; // AI-generated content
  isGenerated?: boolean;
}

interface BookConfig {
  title: string;
  description: string;
  author: string;
  chapters: Chapter[];
  targetWordCount?: number; // Total book word count target
  targetPageCount?: number; // Total book page count target
}

// Content generation mode
type ContentMode = "full-ai" | "chapter-by-chapter" | "manual";

// Book size presets with industry context
const BOOK_SIZE_PRESETS = {
  short: {
    label: "Short Book / Guide",
    totalWords: 15000,
    totalPages: 60,
    chaptersRange: "5-8",
    wordsPerChapter: 2000,
    description: "Quick guides, tutorials, short non-fiction",
  },
  medium: {
    label: "Standard Book",
    totalWords: 50000,
    totalPages: 200,
    chaptersRange: "10-15",
    wordsPerChapter: 4000,
    description: "Most non-fiction, textbooks, technical books",
  },
  long: {
    label: "Comprehensive Book",
    totalWords: 80000,
    totalPages: 320,
    chaptersRange: "15-25",
    wordsPerChapter: 5000,
    description: "In-depth textbooks, reference books",
  },
  custom: {
    label: "Custom",
    totalWords: 0,
    totalPages: 0,
    chaptersRange: "Any",
    wordsPerChapter: 0,
    description: "Set your own targets",
  },
};

// Industry context for word counts
const WORD_COUNT_CONTEXT = {
  wordsPerPage: 250, // Standard estimate
  avgReadingSpeed: 200, // Words per minute
  shortChapter: { min: 1000, max: 2500, label: "Short (4-10 pages)" },
  mediumChapter: { min: 2500, max: 5000, label: "Medium (10-20 pages)" },
  longChapter: { min: 5000, max: 10000, label: "Long (20-40 pages)" },
};

interface MystFeatures {
  // Content Features
  admonitions: boolean;
  codeBlocks: boolean;
  mathEquations: boolean;
  mermaidDiagrams: boolean;
  figures: boolean;
  tables: boolean;
  blockquotes: boolean;

  // Layout Features
  cards: boolean;
  grids: boolean;

  // Typography Features
  asides: boolean;
  footnotes: boolean;
  abbreviations: boolean;
  smallcaps: boolean;
  subscriptSuperscript: boolean;
  underlineStrikethrough: boolean;
  keyboard: boolean;

  // Media Features
  videos: boolean;
  images: boolean;

  // Interactive Features
  exercises: boolean;
  dropdowns: boolean;
  tabs: boolean;
  glossary: boolean;
  buttons: boolean;

  // Academic Features
  proofs: boolean;
  siUnits: boolean;
  chemicalFormulas: boolean;

  // External References
  wikipediaLinks: boolean;
  githubLinks: boolean;
  doiLinks: boolean;
  rridLinks: boolean;
  rorLinks: boolean;
  intersphinx: boolean;

  // Advanced Content
  embedDirective: boolean;
  includeFiles: boolean;
  evalExpressions: boolean;

  // Execution Features
  executableCode: boolean;
  jupyterLite: boolean;
  binderIntegration: boolean;
  thebe: boolean;
  colabLinks: boolean;

  // Export Features
  pdfExport: boolean;
  wordExport: boolean;
  texExport: boolean;
  jatsExport: boolean;
  typstExport: boolean;
  markdownExport: boolean;

  // Navigation Features
  tableOfContents: boolean;
  crossReferences: boolean;
  citations: boolean;
  indexEntries: boolean;
  numberedReferences: boolean;
}

interface GitHubConfig {
  username: string;
  repoName: string;
  token: string;
}

interface GitHubRepo {
  id: number;
  name: string;
  fullName: string;
  url: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  pagesUrl: string | null;
  hasPages: boolean;
}

type AIProvider = "claude" | "gemini" | "openai";

interface AIConfig {
  provider: AIProvider;
  model: string;
  apiKey: string; // User's own API key (optional)
}

interface AIModel {
  id: string;
  name: string;
  description?: string;
}

interface ProviderModels {
  provider: AIProvider;
  models: AIModel[];
}

type WizardStep = 1 | 2 | 3 | 4 | 5; // Step 4 is now Content Generation, Step 5 is Preview & Push
type BookSizePreset = "short" | "medium" | "long" | "custom";
type ChapterMode = "ai" | "manual";

// Deployment status tracking
interface DeploymentStatusInfo {
  pushStatus: "success" | "error" | "unknown";
  buildStatus: "queued" | "building" | "success" | "failed" | "not_started";
  buildProgress?: string;
  buildUrl?: string;
  pagesUrl?: string;
  lastUpdated: string;
  estimatedTimeRemaining?: string;
  message: string;
}

const defaultFeatures: MystFeatures = {
  // Content
  admonitions: true,
  codeBlocks: true,
  mathEquations: false,
  mermaidDiagrams: false,
  figures: true,
  tables: true,
  blockquotes: false,
  // Layout
  cards: false,
  grids: false,
  // Typography
  asides: false,
  footnotes: false,
  abbreviations: false,
  smallcaps: false,
  subscriptSuperscript: false,
  underlineStrikethrough: false,
  keyboard: false,
  // Media
  videos: false,
  images: true,
  // Interactive
  exercises: false,
  dropdowns: true,
  tabs: false,
  glossary: false,
  buttons: false,
  // Academic
  proofs: false,
  siUnits: false,
  chemicalFormulas: false,
  // External References
  wikipediaLinks: false,
  githubLinks: false,
  doiLinks: false,
  rridLinks: false,
  rorLinks: false,
  intersphinx: false,
  // Advanced Content
  embedDirective: false,
  includeFiles: false,
  evalExpressions: false,
  // Execution
  executableCode: false,
  jupyterLite: false,
  binderIntegration: false,
  thebe: false,
  colabLinks: false,
  // Export
  pdfExport: false,
  wordExport: false,
  texExport: false,
  jatsExport: false,
  typstExport: false,
  markdownExport: false,
  // Navigation
  tableOfContents: true,
  crossReferences: true,
  citations: false,
  indexEntries: false,
  numberedReferences: false,
};

const featureDescriptions: Record<keyof MystFeatures, { label: string; description: string; category: string }> = {
  // Content Features
  admonitions: {
    label: "Admonitions & Callouts",
    description: "Note, tip, warning, danger, caution, attention boxes to highlight content",
    category: "Content",
  },
  codeBlocks: {
    label: "Syntax-Highlighted Code",
    description: "Code blocks with syntax highlighting for 100+ languages",
    category: "Content",
  },
  mathEquations: {
    label: "Math Equations (LaTeX)",
    description: "Render mathematical equations using LaTeX syntax",
    category: "Content",
  },
  mermaidDiagrams: {
    label: "Mermaid Diagrams",
    description: "Create flowcharts, sequence diagrams, gantt charts, and more",
    category: "Content",
  },
  figures: {
    label: "Figures",
    description: "Figures with captions, sizing, alignment, and cross-references",
    category: "Content",
  },
  tables: {
    label: "Tables",
    description: "Standard markdown, list-based, and CSV-imported tables",
    category: "Content",
  },
  blockquotes: {
    label: "Blockquotes & Epigraphs",
    description: "Styled quotes, epigraphs, and pull-quotes for emphasis",
    category: "Content",
  },

  // Layout Features
  cards: {
    label: "Cards",
    description: "Content cards with headers, images, footers, and links",
    category: "Layout",
  },
  grids: {
    label: "Grids",
    description: "Responsive grid layouts for cards and multi-column content",
    category: "Layout",
  },

  // Typography Features
  asides: {
    label: "Asides & Margins",
    description: "Sidenotes, margin notes, and sidebar content",
    category: "Typography",
  },
  footnotes: {
    label: "Footnotes",
    description: "Standard footnotes with automatic numbering and back-links",
    category: "Typography",
  },
  abbreviations: {
    label: "Abbreviations",
    description: "Define abbreviations that show full text tooltips on hover",
    category: "Typography",
  },
  smallcaps: {
    label: "Small Caps",
    description: "Small capital letters for stylistic emphasis",
    category: "Typography",
  },
  subscriptSuperscript: {
    label: "Subscript & Superscript",
    description: "H₂O and E=mc² style text formatting",
    category: "Typography",
  },
  underlineStrikethrough: {
    label: "Underline & Strikethrough",
    description: "Additional text decoration options",
    category: "Typography",
  },
  keyboard: {
    label: "Keyboard Keys",
    description: "Styled keyboard shortcuts like Ctrl+C or ⌘+V",
    category: "Typography",
  },

  // Media Features
  videos: {
    label: "Videos & iFrames",
    description: "Embed YouTube, Vimeo, and custom iframe content",
    category: "Media",
  },
  images: {
    label: "Images",
    description: "Standalone images with alt text, sizing, and alignment",
    category: "Media",
  },

  // Interactive Features
  exercises: {
    label: "Exercises & Solutions",
    description: "Numbered exercises with collapsible solutions",
    category: "Interactive",
  },
  dropdowns: {
    label: "Dropdown Sections",
    description: "Collapsible content sections for optional reading",
    category: "Interactive",
  },
  tabs: {
    label: "Tabbed Content",
    description: "Organize content in switchable tab panels",
    category: "Interactive",
  },
  glossary: {
    label: "Glossary",
    description: "Define terms with automatic linking and hover definitions",
    category: "Interactive",
  },
  buttons: {
    label: "Buttons & Links",
    description: "Styled button links for navigation and actions",
    category: "Interactive",
  },

  // Academic Features
  proofs: {
    label: "Proofs & Theorems",
    description: "Theorem, lemma, proof, definition, axiom, corollary blocks",
    category: "Academic",
  },
  siUnits: {
    label: "SI Units",
    description: "Properly formatted scientific units (kg, m/s², etc.)",
    category: "Academic",
  },
  chemicalFormulas: {
    label: "Chemical Formulas",
    description: "Render chemical formulas like H₂SO₄ and reactions",
    category: "Academic",
  },

  // External References
  wikipediaLinks: {
    label: "Wikipedia Integration",
    description: "Link to Wikipedia with hover preview cards",
    category: "External References",
  },
  githubLinks: {
    label: "GitHub Integration",
    description: "Link to GitHub issues, PRs, and code with previews",
    category: "External References",
  },
  doiLinks: {
    label: "DOI Links",
    description: "Digital Object Identifier links for academic papers",
    category: "External References",
  },
  rridLinks: {
    label: "RRID Links",
    description: "Research Resource Identifiers for scientific tools",
    category: "External References",
  },
  rorLinks: {
    label: "ROR Links",
    description: "Research Organization Registry links for institutions",
    category: "External References",
  },
  intersphinx: {
    label: "Intersphinx",
    description: "Cross-reference Python docs and other Sphinx projects",
    category: "External References",
  },

  // Advanced Content
  embedDirective: {
    label: "Embed Directive",
    description: "Embed content from other documents and projects",
    category: "Advanced",
  },
  includeFiles: {
    label: "Include Files",
    description: "Include external files and code snippets inline",
    category: "Advanced",
  },
  evalExpressions: {
    label: "Eval Expressions",
    description: "Evaluate and display dynamic expressions in content",
    category: "Advanced",
  },

  // Execution Features
  executableCode: {
    label: "Executable Code Cells",
    description: "Run Python, R, Julia code during build with outputs",
    category: "Execution",
  },
  jupyterLite: {
    label: "JupyterLite (Browser)",
    description: "Run Python in browser via WebAssembly - no backend",
    category: "Execution",
  },
  binderIntegration: {
    label: "Binder Integration",
    description: "Launch full Jupyter notebooks in cloud Binder",
    category: "Execution",
  },
  thebe: {
    label: "Thebe Live Code",
    description: "Make static code blocks executable in-page",
    category: "Execution",
  },
  colabLinks: {
    label: "Google Colab Links",
    description: "Open notebooks in Google Colab for GPU access",
    category: "Execution",
  },

  // Export Features
  pdfExport: {
    label: "PDF Export (LaTeX)",
    description: "High-quality PDF via LaTeX typesetting",
    category: "Export",
  },
  wordExport: {
    label: "Word Export (DOCX)",
    description: "Microsoft Word documents via Pandoc",
    category: "Export",
  },
  texExport: {
    label: "LaTeX Source Export",
    description: "Export raw LaTeX source for journal submission",
    category: "Export",
  },
  jatsExport: {
    label: "JATS XML Export",
    description: "Journal Article Tag Suite for academic publishing",
    category: "Export",
  },
  typstExport: {
    label: "PDF Export (Typst)",
    description: "Modern, fast PDF generation via Typst",
    category: "Export",
  },
  markdownExport: {
    label: "Markdown Export",
    description: "Export to clean Markdown for other platforms",
    category: "Export",
  },

  // Navigation Features
  tableOfContents: {
    label: "Table of Contents",
    description: "Auto-generated navigation sidebar with sections",
    category: "Navigation",
  },
  crossReferences: {
    label: "Cross-References",
    description: "Link to sections, figures, equations by label",
    category: "Navigation",
  },
  citations: {
    label: "Citations & Bibliography",
    description: "Academic citations with BibTeX and auto bibliography",
    category: "Navigation",
  },
  indexEntries: {
    label: "Index Generation",
    description: "Create searchable index entries throughout the book",
    category: "Navigation",
  },
  numberedReferences: {
    label: "Numbered References",
    description: "Auto-number figures, tables, equations, and sections",
    category: "Navigation",
  },
};

export default function BookCreationWizard() {
  const [step, setStep] = useState<WizardStep>(1);
  const [chapterMode, setChapterMode] = useState<ChapterMode>("ai");
  const [bookConfig, setBookConfig] = useState<BookConfig>({
    title: "",
    description: "",
    author: "",
    chapters: [],
  });
  const [features, setFeatures] = useState<MystFeatures>(defaultFeatures);
  const [githubConfig, setGithubConfig] = useState<GitHubConfig>({
    username: "fenago",
    repoName: "",
    token: "",
  });
  const [aiConfig, setAiConfig] = useState<AIConfig>({
    provider: "claude",
    model: "",
    apiKey: "",
  });
  const [providerModels, setProviderModels] = useState<Record<AIProvider, AIModel[]>>({
    claude: [],
    gemini: [],
    openai: [],
  });
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [newChapter, setNewChapter] = useState({ title: "", description: "" });
  const [isGeneratingChapters, setIsGeneratingChapters] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<string | null>(null);
  const [deploymentResult, setDeploymentResult] = useState<{
    success: boolean;
    deployUrl?: string;
    repoUrl?: string;
    steps?: { step: string; status: string; error?: string }[];
  } | null>(null);
  const [editingChapter, setEditingChapter] = useState<string | null>(null);
  const [chapterContent, setChapterContent] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [isDeletingRepo, setIsDeletingRepo] = useState<string | null>(null);
  const [showRepoManager, setShowRepoManager] = useState(false);

  // Phase 2: Content Generation State
  const [contentMode, setContentMode] = useState<ContentMode | null>(null);
  const [bookSizePreset, setBookSizePreset] = useState<BookSizePreset>("medium");
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [generatingChapterId, setGeneratingChapterId] = useState<string | null>(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isPushingContent, setIsPushingContent] = useState(false);
  const [recommendedFeatures, setRecommendedFeatures] = useState<Record<string, string[]>>({});
  const [chapterPreviewTab, setChapterPreviewTab] = useState<"source" | "preview">("source");

  // Deployment status tracking
  const [deployStatusInfo, setDeployStatusInfo] = useState<DeploymentStatusInfo | null>(null);
  const [isPollingStatus, setIsPollingStatus] = useState(false);

  // README regeneration
  const [isUpdatingReadme, setIsUpdatingReadme] = useState(false);
  const [readmeUpdateResult, setReadmeUpdateResult] = useState<{ success: boolean; message: string } | null>(null);

  // Convert MyST-like markdown to basic HTML for preview
  const mystToHtml = (content: string): string => {
    let html = content;

    // Escape HTML first
    html = html
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Headers
    html = html.replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mb-4 text-primary">$1</h1>');

    // Admonitions (basic conversion)
    html = html.replace(
      /:::\{note\}\n([\s\S]*?):::/g,
      '<div class="alert alert-info my-4"><span>$1</span></div>'
    );
    html = html.replace(
      /:::\{tip\}\n([\s\S]*?):::/g,
      '<div class="alert alert-success my-4"><span>$1</span></div>'
    );
    html = html.replace(
      /:::\{warning\}\n([\s\S]*?):::/g,
      '<div class="alert alert-warning my-4"><span>$1</span></div>'
    );
    html = html.replace(
      /:::\{danger\}\n([\s\S]*?):::/g,
      '<div class="alert alert-error my-4"><span>$1</span></div>'
    );

    // Dropdowns
    html = html.replace(
      /:::\{dropdown\}\s*(.+)\n([\s\S]*?):::/g,
      '<details class="collapse collapse-arrow bg-base-200 my-4"><summary class="collapse-title font-medium">$1</summary><div class="collapse-content">$2</div></details>'
    );

    // Code blocks
    html = html.replace(
      /```(\w+)?\n([\s\S]*?)```/g,
      '<pre class="bg-neutral text-neutral-content p-4 rounded-lg my-4 overflow-x-auto"><code>$2</code></pre>'
    );

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-base-300 px-1 rounded text-sm">$1</code>');

    // Bold and italic
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Links
    html = html.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="link link-primary" target="_blank">$1</a>'
    );

    // Lists
    html = html.replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>');
    html = html.replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 list-decimal">$2</li>');

    // Wrap consecutive list items
    html = html.replace(
      /(<li class="ml-4">[\s\S]*?<\/li>\n?)+/g,
      '<ul class="list-disc my-4">$&</ul>'
    );

    // Math (basic display)
    html = html.replace(
      /\$\$\n?([\s\S]*?)\n?\$\$/g,
      '<div class="bg-base-200 p-4 my-4 text-center font-mono">$1</div>'
    );
    html = html.replace(/\$([^$]+)\$/g, '<span class="font-mono bg-base-200 px-1">$1</span>');

    // Paragraphs
    html = html
      .split(/\n\n+/)
      .map((para) => {
        if (
          para.trim().startsWith("<") ||
          para.trim().startsWith("```") ||
          para.trim().startsWith(":::")
        ) {
          return para;
        }
        return `<p class="my-3">${para.trim()}</p>`;
      })
      .join("\n");

    // Clean up empty paragraphs
    html = html.replace(/<p class="my-3"><\/p>/g, "");
    html = html.replace(/<p class="my-3">(\s*<(?:h[1-6]|div|pre|ul|ol|details))/g, "$1");

    return html;
  };

  // Calculate book statistics
  const calculateBookStats = () => {
    const totalWords = bookConfig.chapters.reduce((sum, ch) => {
      const content = ch.generatedContent || ch.content || "";
      return sum + content.split(/\s+/).filter(Boolean).length;
    }, 0);
    const totalPages = Math.ceil(totalWords / WORD_COUNT_CONTEXT.wordsPerPage);
    const readingTime = Math.ceil(totalWords / WORD_COUNT_CONTEXT.avgReadingSpeed);
    return { totalWords, totalPages, readingTime };
  };

  // Apply book size preset
  const applyBookSizePreset = (preset: BookSizePreset) => {
    setBookSizePreset(preset);
    if (preset !== "custom") {
      const presetConfig = BOOK_SIZE_PRESETS[preset];
      setBookConfig((prev) => ({
        ...prev,
        targetWordCount: presetConfig.totalWords,
        targetPageCount: presetConfig.totalPages,
        chapters: prev.chapters.map((ch) => ({
          ...ch,
          targetWordCount: presetConfig.wordsPerChapter,
        })),
      }));
    }
  };

  // Fetch models from API on component mount
  useEffect(() => {
    const fetchModels = async () => {
      setIsLoadingModels(true);
      try {
        const response = await fetch("/api/ai/models");
        if (response.ok) {
          const data: ProviderModels[] = await response.json();
          const modelsMap: Record<AIProvider, AIModel[]> = {
            claude: [],
            gemini: [],
            openai: [],
          };

          data.forEach((providerData) => {
            modelsMap[providerData.provider] = providerData.models;
          });

          setProviderModels(modelsMap);

          // Set default model to first Claude model
          if (modelsMap.claude.length > 0) {
            setAiConfig((prev) => ({ ...prev, model: modelsMap.claude[0].id }));
          }
        }
      } catch (err) {
        console.error("Error fetching models:", err);
      } finally {
        setIsLoadingModels(false);
      }
    };

    fetchModels();
  }, []);

  // Refetch models when user provides their own API key
  const refetchModelsForProvider = async (provider: AIProvider, apiKey: string) => {
    if (!apiKey) return;

    try {
      const response = await fetch(`/api/ai/models?provider=${provider}&apiKey=${encodeURIComponent(apiKey)}`);
      if (response.ok) {
        const data: ProviderModels = await response.json();
        setProviderModels((prev) => ({
          ...prev,
          [provider]: data.models,
        }));
        // Update selected model to first of new list
        if (data.models.length > 0) {
          setAiConfig((prev) => ({ ...prev, model: data.models[0].id }));
        }
      }
    } catch (err) {
      console.error("Error refetching models:", err);
    }
  };

  // Update model when provider changes
  const handleProviderChange = (provider: AIProvider) => {
    const models = providerModels[provider];
    setAiConfig({
      ...aiConfig,
      provider,
      model: models.length > 0 ? models[0].id : "",
    });
  };

  // Handle API key change - refetch models with user's key
  const handleApiKeyChange = (apiKey: string) => {
    setAiConfig((prev) => ({ ...prev, apiKey }));
    if (apiKey.length > 20) {
      // Only refetch when key looks complete
      refetchModelsForProvider(aiConfig.provider, apiKey);
    }
  };

  // Step 1: Generate chapters with AI
  const generateChapters = async () => {
    if (!bookConfig.title || !bookConfig.description) {
      setError("Please enter a book title and description first");
      return;
    }

    setIsGeneratingChapters(true);
    setError(null);

    try {
      const response = await fetch("/api/book/generate-chapters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookTitle: bookConfig.title,
          bookDescription: bookConfig.description,
          numberOfChapters: 8,
          provider: aiConfig.provider,
          model: aiConfig.model,
          apiKey: aiConfig.apiKey || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate chapters");
      }

      setBookConfig((prev) => ({
        ...prev,
        chapters: data.chapters,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate chapters");
    } finally {
      setIsGeneratingChapters(false);
    }
  };

  // Step 1: Manual chapter management
  const addChapter = () => {
    if (newChapter.title.trim()) {
      const chapter: Chapter = {
        id: `chapter-${Date.now()}`,
        title: newChapter.title,
        description: newChapter.description,
      };
      setBookConfig((prev) => ({
        ...prev,
        chapters: [...prev.chapters, chapter],
      }));
      setNewChapter({ title: "", description: "" });
    }
  };

  const removeChapter = (id: string) => {
    setBookConfig((prev) => ({
      ...prev,
      chapters: prev.chapters.filter((ch) => ch.id !== id),
    }));
  };

  const moveChapter = (index: number, direction: "up" | "down") => {
    const newChapters = [...bookConfig.chapters];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < newChapters.length) {
      [newChapters[index], newChapters[newIndex]] = [newChapters[newIndex], newChapters[index]];
      setBookConfig((prev) => ({ ...prev, chapters: newChapters }));
    }
  };

  // Step 2: Feature Selection
  const toggleFeature = (feature: keyof MystFeatures) => {
    setFeatures((prev) => ({ ...prev, [feature]: !prev[feature] }));
  };

  const featuresByCategory = Object.entries(featureDescriptions).reduce(
    (acc, [key, value]) => {
      if (!acc[value.category]) {
        acc[value.category] = [];
      }
      acc[value.category].push({ key: key as keyof MystFeatures, ...value });
      return acc;
    },
    {} as Record<string, Array<{ key: keyof MystFeatures; label: string; description: string; category: string }>>
  );

  // Step 3: Real GitHub Deployment
  const handleDeploy = async () => {
    setIsDeploying(true);
    setDeploymentStatus("Starting deployment...");
    setDeploymentResult(null);
    setDeployStatusInfo(null);
    setError(null);

    try {
      const response = await fetch("/api/book/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookConfig,
          features,
          githubConfig,
          chapterContent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Deployment failed");
      }

      setDeploymentResult(data);
      setDeploymentStatus("Content pushed to GitHub! Waiting for build...");

      // Set initial status - push succeeded, build starting
      setDeployStatusInfo({
        pushStatus: "success",
        buildStatus: "queued",
        message: "Content pushed successfully! GitHub Actions build is starting...",
        lastUpdated: new Date().toISOString(),
        pagesUrl: data.deployUrl,
        estimatedTimeRemaining: "2-3 minutes",
      });

      // Start polling for build status
      pollDeploymentStatus(githubConfig.repoName);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Deployment failed");
      setDeploymentStatus(null);
      setDeployStatusInfo({
        pushStatus: "error",
        buildStatus: "not_started",
        message: err instanceof Error ? err.message : "Failed to push to GitHub",
        lastUpdated: new Date().toISOString(),
      });
    } finally {
      setIsDeploying(false);
    }
  };

  // Step 4: Chapter Content Editing
  const saveChapterContent = (chapterId: string, content: string) => {
    setChapterContent((prev) => ({ ...prev, [chapterId]: content }));
    setEditingChapter(null);
  };

  // GitHub Repo Management
  const fetchRepos = async () => {
    setIsLoadingRepos(true);
    try {
      const params = new URLSearchParams({
        username: githubConfig.username || "fenago",
      });
      if (githubConfig.token) {
        params.append("token", githubConfig.token);
      }

      const response = await fetch(`/api/github/repos?${params}`);
      const data = await response.json();

      if (response.ok) {
        setRepos(data.repos);
      } else {
        setError(data.error || "Failed to fetch repositories");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch repositories");
    } finally {
      setIsLoadingRepos(false);
    }
  };

  const deleteRepo = async (repoName: string) => {
    if (!confirm(`Are you sure you want to delete "${repoName}"? This action cannot be undone.`)) {
      return;
    }

    setIsDeletingRepo(repoName);
    try {
      const params = new URLSearchParams({
        repo: repoName,
        username: githubConfig.username || "fenago",
      });
      if (githubConfig.token) {
        params.append("token", githubConfig.token);
      }

      const response = await fetch(`/api/github/repos?${params}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (response.ok) {
        setRepos((prev) => prev.filter((r) => r.name !== repoName));
      } else {
        setError(data.error || "Failed to delete repository");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete repository");
    } finally {
      setIsDeletingRepo(null);
    }
  };

  // Poll deployment status from GitHub Actions
  const pollDeploymentStatus = async (repoName: string) => {
    setIsPollingStatus(true);
    let attempts = 0;
    const maxAttempts = 60; // Poll for up to 5 minutes (every 5 seconds)
    let noWorkflowAttempts = 0;
    const maxNoWorkflowAttempts = 12; // Wait up to 1 minute for workflow to appear

    const poll = async () => {
      try {
        const params = new URLSearchParams({
          repo: repoName,
          username: githubConfig.username || "fenago",
        });
        if (githubConfig.token) {
          params.append("token", githubConfig.token);
        }

        const response = await fetch(`/api/github/deploy-status?${params}`);
        const status: DeploymentStatusInfo = await response.json();

        setDeployStatusInfo(status);

        // Continue polling if build is still in progress or waiting for workflow
        if (
          status.buildStatus === "queued" ||
          status.buildStatus === "building"
        ) {
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(poll, 5000); // Poll every 5 seconds
          } else {
            setIsPollingStatus(false);
            setDeployStatusInfo((prev) =>
              prev
                ? {
                    ...prev,
                    message:
                      "Build is taking longer than expected. Check GitHub Actions for details.",
                  }
                : null
            );
          }
        } else if (status.buildStatus === "not_started") {
          // Keep polling while waiting for workflow to appear
          noWorkflowAttempts++;
          if (noWorkflowAttempts < maxNoWorkflowAttempts) {
            setTimeout(poll, 5000); // Poll every 5 seconds
          } else {
            // After waiting, keep status but stop polling
            setIsPollingStatus(false);
            setDeployStatusInfo((prev) =>
              prev
                ? {
                    ...prev,
                    message:
                      "GitHub workflow hasn't started yet. You may need to enable GitHub Actions or check the repository settings. Your book is still available at the GitHub repo.",
                  }
                : null
            );
          }
        } else {
          // Success or failure - stop polling
          setIsPollingStatus(false);
        }
      } catch (err) {
        console.error("Error polling status:", err);
        setIsPollingStatus(false);
      }
    };

    poll();
  };

  // Render deployment status indicator
  const renderDeploymentStatus = () => {
    if (!deployStatusInfo) return null;

    const getBuildIcon = () => {
      switch (deployStatusInfo.buildStatus) {
        case "success":
          return "✅";
        case "failed":
          return "❌";
        case "building":
          return "🔨";
        case "queued":
          return "⏳";
        case "not_started":
          return "🔄";
        default:
          return "📋";
      }
    };

    const getBuildStatusColor = () => {
      switch (deployStatusInfo.buildStatus) {
        case "success":
          return "alert-success";
        case "failed":
          return "alert-error";
        case "building":
        case "queued":
        case "not_started":
          return "alert-info";
        default:
          return "alert-warning";
      }
    };

    // Get GitHub repo URL
    const repoUrl = githubConfig.username && githubConfig.repoName
      ? `https://github.com/${githubConfig.username}/${githubConfig.repoName}`
      : null;

    return (
      <div className={`alert ${getBuildStatusColor()} mt-4`}>
        <div className="flex flex-col gap-2 w-full">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getBuildIcon()}</span>
            <div className="flex-1">
              <h4 className="font-bold">Deployment Status</h4>
              <p>{deployStatusInfo.message}</p>
            </div>
            {isPollingStatus && (
              <div className="flex items-center gap-2">
                <span className="loading loading-spinner loading-sm"></span>
                <span className="text-xs opacity-70">Checking status...</span>
              </div>
            )}
          </div>

          {/* Status Timeline */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <div className="flex items-center gap-1">
              <span
                className={`badge ${
                  deployStatusInfo.pushStatus === "success"
                    ? "badge-success"
                    : "badge-ghost"
                }`}
              >
                1. Push to GitHub
              </span>
              {deployStatusInfo.pushStatus === "success" && <span>✓</span>}
            </div>
            <span className="text-base-content/50">→</span>
            <div className="flex items-center gap-1">
              <span
                className={`badge ${
                  deployStatusInfo.buildStatus === "success"
                    ? "badge-success"
                    : deployStatusInfo.buildStatus === "building" ||
                      deployStatusInfo.buildStatus === "queued"
                    ? "badge-info"
                    : deployStatusInfo.buildStatus === "failed"
                    ? "badge-error"
                    : deployStatusInfo.buildStatus === "not_started"
                    ? "badge-warning"
                    : "badge-ghost"
                }`}
              >
                2. Build Book
              </span>
              {(deployStatusInfo.buildStatus === "building" ||
                deployStatusInfo.buildStatus === "not_started" ||
                deployStatusInfo.buildStatus === "queued") && (
                <span className="loading loading-spinner loading-xs"></span>
              )}
              {deployStatusInfo.buildStatus === "success" && <span>✓</span>}
              {deployStatusInfo.buildStatus === "failed" && <span>✗</span>}
            </div>
            <span className="text-base-content/50">→</span>
            <div className="flex items-center gap-1">
              <span
                className={`badge ${
                  deployStatusInfo.buildStatus === "success"
                    ? "badge-success"
                    : "badge-ghost"
                }`}
              >
                3. Live on GitHub Pages
              </span>
              {deployStatusInfo.buildStatus === "success" && <span>✓</span>}
            </div>
          </div>

          {/* Progress info */}
          {deployStatusInfo.buildProgress && (
            <p className="text-sm opacity-70">
              Build time: {deployStatusInfo.buildProgress}
            </p>
          )}
          {deployStatusInfo.estimatedTimeRemaining && deployStatusInfo.buildStatus !== "not_started" && (
            <p className="text-sm opacity-70">
              Estimated time remaining: {deployStatusInfo.estimatedTimeRemaining}
            </p>
          )}

          {/* Links - always show GitHub repo link after push succeeds */}
          <div className="flex flex-wrap gap-2 mt-2">
            {/* Always show GitHub repo link after successful push */}
            {deployStatusInfo.pushStatus === "success" && repoUrl && (
              <a
                href={repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-xs btn-outline gap-1"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
                </svg>
                View GitHub Repo
              </a>
            )}
            {deployStatusInfo.buildUrl && (
              <a
                href={deployStatusInfo.buildUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-xs btn-outline"
              >
                View Build Logs
              </a>
            )}
            {/* Show pages URL after successful push (may still be building) */}
            {deployStatusInfo.pagesUrl && deployStatusInfo.pushStatus === "success" && (
              <a
                href={deployStatusInfo.pagesUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`btn btn-xs ${deployStatusInfo.buildStatus === "success" ? "btn-primary" : "btn-outline"} gap-1`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                {deployStatusInfo.buildStatus === "success"
                  ? "View Live Book"
                  : "Preview URL (building...)"}
              </a>
            )}
          </div>

          {/* Helpful tips based on status */}
          {deployStatusInfo.buildStatus === "not_started" && isPollingStatus && (
            <p className="text-xs opacity-60 mt-2">
              Waiting for GitHub Actions to start the build workflow. This usually takes 10-30 seconds...
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderStep1 = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Describe Your Book</h2>
        <p className="text-base-content/70">
          Start by providing basic information about your interactive book
        </p>
      </div>

      <div className="grid gap-6">
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Book Title</span>
          </label>
          <input
            type="text"
            placeholder="e.g., Introduction to Machine Learning"
            className="input input-bordered w-full"
            value={bookConfig.title}
            onChange={(e) => setBookConfig((prev) => ({ ...prev, title: e.target.value }))}
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Author Name</span>
          </label>
          <input
            type="text"
            placeholder="Your name"
            className="input input-bordered w-full"
            value={bookConfig.author}
            onChange={(e) => setBookConfig((prev) => ({ ...prev, author: e.target.value }))}
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Book Description</span>
          </label>
          <textarea
            placeholder="What is this book about? Who is it for? What will readers learn?"
            className="textarea textarea-bordered h-24"
            value={bookConfig.description}
            onChange={(e) => setBookConfig((prev) => ({ ...prev, description: e.target.value }))}
          />
        </div>
      </div>

      <div className="divider">Chapter Creation</div>

      {/* Toggle between AI and Manual */}
      <div className="flex justify-center">
        <div className="tabs tabs-boxed">
          <button
            className={`tab ${chapterMode === "ai" ? "tab-active" : ""}`}
            onClick={() => setChapterMode("ai")}
          >
            AI Generate Chapters
          </button>
          <button
            className={`tab ${chapterMode === "manual" ? "tab-active" : ""}`}
            onClick={() => setChapterMode("manual")}
          >
            Add Chapters Manually
          </button>
        </div>
      </div>

      {/* AI Mode */}
      {chapterMode === "ai" && (
        <div className="space-y-6 bg-base-200 rounded-lg p-6">
          <div className="text-center">
            <h4 className="font-semibold mb-2">AI Chapter Generation</h4>
            <p className="text-sm text-base-content/70">
              Describe your book above and let AI generate a chapter outline for you
            </p>
          </div>

          {/* AI Provider Selection */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">AI Provider</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={aiConfig.provider}
                onChange={(e) => handleProviderChange(e.target.value as AIProvider)}
              >
                <option value="claude">Claude (Anthropic)</option>
                <option value="gemini">Gemini (Google)</option>
                <option value="openai">OpenAI (GPT)</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Model</span>
              </label>
              {isLoadingModels ? (
                <div className="select select-bordered w-full flex items-center">
                  <span className="loading loading-spinner loading-sm mr-2"></span>
                  Loading models...
                </div>
              ) : (
                <select
                  className="select select-bordered w-full"
                  value={aiConfig.model}
                  onChange={(e) => setAiConfig((prev) => ({ ...prev, model: e.target.value }))}
                  disabled={providerModels[aiConfig.provider].length === 0}
                >
                  {providerModels[aiConfig.provider].length === 0 ? (
                    <option value="">No models available</option>
                  ) : (
                    providerModels[aiConfig.provider].map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name}
                      </option>
                    ))
                  )}
                </select>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Your API Key (Optional)</span>
              </label>
              <input
                type="password"
                placeholder="Leave blank to use default"
                className="input input-bordered w-full"
                value={aiConfig.apiKey}
                onChange={(e) => handleApiKeyChange(e.target.value)}
              />
              <label className="label">
                <span className="label-text-alt text-base-content/60">
                  Entering your key will fetch available models for that key
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              className="btn btn-primary btn-lg"
              onClick={generateChapters}
              disabled={isGeneratingChapters || !bookConfig.title || !bookConfig.description}
            >
              {isGeneratingChapters ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Generating Chapters...
                </>
              ) : (
                "Generate Chapter Outline"
              )}
            </button>
          </div>

          {error && (
            <div className="alert alert-error">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}
        </div>
      )}

      {/* Manual Mode */}
      {chapterMode === "manual" && (
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Chapter title"
                className="input input-bordered w-full"
                value={newChapter.title}
                onChange={(e) => setNewChapter((prev) => ({ ...prev, title: e.target.value }))}
                onKeyPress={(e) => e.key === "Enter" && addChapter()}
              />
            </div>
            <div className="flex-1">
              <input
                type="text"
                placeholder="Brief description (optional)"
                className="input input-bordered w-full"
                value={newChapter.description}
                onChange={(e) => setNewChapter((prev) => ({ ...prev, description: e.target.value }))}
                onKeyPress={(e) => e.key === "Enter" && addChapter()}
              />
            </div>
            <button className="btn btn-primary" onClick={addChapter}>
              Add Chapter
            </button>
          </div>
        </div>
      )}

      {/* Chapter List (shown in both modes) */}
      {bookConfig.chapters.length > 0 && (
        <div className="bg-base-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold">Chapter Outline ({bookConfig.chapters.length} chapters)</h4>
            <div className="flex gap-2">
              <button
                className="btn btn-sm btn-outline btn-primary"
                onClick={() => {
                  setChapterMode("manual");
                  setNewChapter({ title: "", description: "" });
                }}
              >
                + Add Chapter
              </button>
              {chapterMode === "ai" && (
                <button
                  className="btn btn-sm btn-outline btn-error"
                  onClick={() => setBookConfig((prev) => ({ ...prev, chapters: [] }))}
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
          <ul className="space-y-2">
            {bookConfig.chapters.map((chapter, index) => (
              <li
                key={chapter.id}
                className="flex items-center gap-3 bg-base-100 p-3 rounded-lg"
              >
                <span className="badge badge-primary">{index + 1}</span>
                <div className="flex-1">
                  <p className="font-medium">{chapter.title}</p>
                  {chapter.description && (
                    <p className="text-sm text-base-content/60">{chapter.description}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    className="btn btn-ghost btn-xs"
                    onClick={() => moveChapter(index, "up")}
                    disabled={index === 0}
                  >
                    ↑
                  </button>
                  <button
                    className="btn btn-ghost btn-xs"
                    onClick={() => moveChapter(index, "down")}
                    disabled={index === bookConfig.chapters.length - 1}
                  >
                    ↓
                  </button>
                  <button
                    className="btn btn-ghost btn-xs text-error"
                    onClick={() => removeChapter(chapter.id)}
                  >
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Select Features</h2>
        <p className="text-base-content/70">
          Choose the interactive features for your book
        </p>
      </div>

      <div className="space-y-8">
        {Object.entries(featuresByCategory).map(([category, categoryFeatures]) => (
          <div key={category} className="bg-base-200 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              {category === "Content" && "📝"}
              {category === "Layout" && "📐"}
              {category === "Typography" && "✏️"}
              {category === "Media" && "🎬"}
              {category === "Interactive" && "🎯"}
              {category === "Academic" && "🎓"}
              {category === "External References" && "🔗"}
              {category === "Advanced" && "🔧"}
              {category === "Execution" && "⚡"}
              {category === "Export" && "📤"}
              {category === "Navigation" && "🧭"}
              {category} Features
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {categoryFeatures.map(({ key, label, description }) => (
                <label
                  key={key}
                  className={`flex items-start gap-4 p-4 rounded-lg cursor-pointer transition-all ${
                    features[key] ? "bg-primary/10 border-2 border-primary" : "bg-base-100 border-2 border-transparent"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary mt-1"
                    checked={features[key]}
                    onChange={() => toggleFeature(key)}
                  />
                  <div>
                    <p className="font-semibold">{label}</p>
                    <p className="text-sm text-base-content/60">{description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="alert alert-info">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>
          <strong>Tip:</strong> Execution features (JupyterLite, Binder) make your book truly interactive but require additional setup.
        </span>
      </div>
    </div>
  );

  const renderStep3 = () => {
    const isCustomUsername = githubConfig.username.toLowerCase() !== "fenago";

    return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Deploy to GitHub Pages</h2>
        <p className="text-base-content/70">
          Connect your GitHub account to deploy your interactive book
        </p>
      </div>

      <div className="grid gap-6 max-w-xl mx-auto">
        {/* GitHub Username - First */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">GitHub Username</span>
            <span className="label-text-alt text-base-content/60">Default: fenago</span>
          </label>
          <input
            type="text"
            placeholder="fenago"
            className="input input-bordered w-full"
            value={githubConfig.username}
            onChange={(e) => setGithubConfig((prev) => ({ ...prev, username: e.target.value }))}
          />
          <label className="label">
            <span className="label-text-alt text-base-content/60">
              Change this only if deploying to a different GitHub account
            </span>
          </label>
        </div>

        {/* Repository Name */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Repository Name</span>
            <span className="label-text-alt text-error">Required</span>
          </label>
          <input
            type="text"
            placeholder="my-interactive-book"
            className="input input-bordered w-full"
            value={githubConfig.repoName}
            onChange={(e) => setGithubConfig((prev) => ({ ...prev, repoName: e.target.value }))}
          />
          <label className="label">
            <span className="label-text-alt text-base-content/60">
              Your book will be available at: https://{githubConfig.username || "fenago"}.github.io/{githubConfig.repoName || "repo-name"}
            </span>
          </label>
        </div>

        {/* PAT - Only shown if custom username */}
        {isCustomUsername && (
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">GitHub Personal Access Token</span>
              <span className="label-text-alt text-error">Required for custom username</span>
            </label>
            <input
              type="password"
              placeholder="ghp_xxxxxxxxxxxx"
              className="input input-bordered w-full"
              value={githubConfig.token}
              onChange={(e) => setGithubConfig((prev) => ({ ...prev, token: e.target.value }))}
            />
            <label className="label">
              <span className="label-text-alt text-base-content/60">
                Needs repo and workflow permissions. Create at GitHub → Settings → Developer settings → Personal access tokens
              </span>
            </label>
          </div>
        )}
      </div>

      {/* GitHub Repo Manager */}
      <div className="max-w-xl mx-auto">
        <div className="divider">Repository Management</div>
        <div className="flex justify-between items-center mb-4">
          <button
            className="btn btn-outline btn-sm"
            onClick={() => {
              setShowRepoManager(!showRepoManager);
              if (!showRepoManager && repos.length === 0) {
                fetchRepos();
              }
            }}
          >
            {showRepoManager ? "Hide" : "Manage"} Existing Repos
          </button>
          {showRepoManager && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={fetchRepos}
              disabled={isLoadingRepos}
            >
              {isLoadingRepos ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                "Refresh"
              )}
            </button>
          )}
        </div>

        {showRepoManager && (
          <div className="bg-base-200 rounded-lg p-4 max-h-64 overflow-y-auto">
            {isLoadingRepos ? (
              <div className="flex justify-center py-8">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : repos.length === 0 ? (
              <p className="text-center text-base-content/60 py-4">No repositories found</p>
            ) : (
              <div className="space-y-2">
                {repos.map((repo) => (
                  <div
                    key={repo.id}
                    className="flex items-center justify-between bg-base-100 p-3 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{repo.name}</p>
                      <div className="flex gap-2 text-xs text-base-content/60">
                        <a
                          href={repo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link link-hover"
                        >
                          Repo
                        </a>
                        {repo.hasPages && repo.pagesUrl && (
                          <a
                            href={repo.pagesUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link link-hover text-success"
                          >
                            Live Site
                          </a>
                        )}
                      </div>
                    </div>
                    <button
                      className="btn btn-ghost btn-xs text-error"
                      onClick={() => deleteRepo(repo.name)}
                      disabled={isDeletingRepo === repo.name}
                    >
                      {isDeletingRepo === repo.name ? (
                        <span className="loading loading-spinner loading-xs"></span>
                      ) : (
                        "Delete"
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-base-200 rounded-lg p-6 max-w-xl mx-auto">
        <h4 className="font-bold mb-4">Deployment Summary</h4>
        <div className="space-y-2 text-sm">
          <p><strong>Book:</strong> {bookConfig.title || "Untitled"}</p>
          <p><strong>Author:</strong> {bookConfig.author || "Unknown"}</p>
          <p><strong>Chapters:</strong> {bookConfig.chapters.length}</p>
          <p><strong>Features enabled:</strong> {Object.values(features).filter(Boolean).length}</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error max-w-xl mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {deploymentStatus && (
        <div className={`alert ${isDeploying ? "alert-info" : deploymentResult?.success ? "alert-success" : "alert-warning"} max-w-xl mx-auto`}>
          {isDeploying ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <span>{deploymentStatus}</span>
        </div>
      )}

      {/* Deployment Steps */}
      {deploymentResult?.steps && (
        <div className="max-w-xl mx-auto space-y-2">
          {deploymentResult.steps.map((s, i) => (
            <div key={i} className={`flex items-center gap-2 text-sm ${s.status === "error" ? "text-error" : "text-success"}`}>
              {s.status === "success" ? "✓" : "✗"} {s.step}
              {s.error && <span className="text-error text-xs">({s.error})</span>}
            </div>
          ))}
        </div>
      )}

      {/* Deployment Status Tracker */}
      {deployStatusInfo && (
        <div className="max-w-xl mx-auto">
          {renderDeploymentStatus()}
        </div>
      )}

      {/* Success Links (legacy fallback) */}
      {deploymentResult?.success && !deployStatusInfo && (
        <div className="max-w-xl mx-auto bg-success/10 rounded-lg p-6 space-y-4">
          <h4 className="font-bold text-success">Deployment Successful!</h4>
          <div className="space-y-2">
            <p>
              <strong>Repository:</strong>{" "}
              <a href={deploymentResult.repoUrl} target="_blank" rel="noopener noreferrer" className="link link-primary">
                {deploymentResult.repoUrl}
              </a>
            </p>
            <p>
              <strong>Live Site:</strong>{" "}
              <a href={deploymentResult.deployUrl} target="_blank" rel="noopener noreferrer" className="link link-primary">
                {deploymentResult.deployUrl}
              </a>
            </p>
            <p className="text-sm text-base-content/70">
              Note: It may take a few minutes for GitHub Pages to build and deploy your site.
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col items-center gap-4">
        {/* Deploy Button - show when not yet deployed */}
        {!deploymentResult?.success && (
          <button
            className="btn btn-primary btn-lg"
            onClick={handleDeploy}
            disabled={isDeploying || !githubConfig.repoName || bookConfig.chapters.length === 0}
          >
            {isDeploying ? (
              <>
                <span className="loading loading-spinner"></span>
                Deploying...
              </>
            ) : (
              "Deploy to GitHub Pages"
            )}
          </button>
        )}

        {/* Continue to Content Generation - show prominently after successful deployment */}
        {deploymentResult?.success && (
          <div className="text-center space-y-4">
            <div className="alert alert-success max-w-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="font-bold">Skeleton Deployed Successfully!</h4>
                <p className="text-sm">Your book structure is now live. Continue to generate your content.</p>
              </div>
            </div>
            <button
              className="btn btn-primary btn-lg gap-2"
              onClick={() => setStep(4)}
            >
              Continue to Generate Content
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <p className="text-sm text-base-content/60">
              Choose between Full AI, Guided AI, or Manual content creation
            </p>
          </div>
        )}
      </div>
    </div>
  );
  };

  // Content Generation Mode Selection
  const renderModeSelection = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2">Choose Content Creation Mode</h3>
        <p className="text-base-content/70">How would you like to create your book content?</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Mode 1: Full AI */}
        <div
          className={`card bg-base-200 cursor-pointer transition-all hover:shadow-lg ${
            contentMode === "full-ai" ? "ring-2 ring-primary" : ""
          }`}
          onClick={() => setContentMode("full-ai")}
        >
          <div className="card-body">
            <div className="text-4xl mb-2">🤖</div>
            <h4 className="card-title">Full AI Generation</h4>
            <p className="text-sm text-base-content/70">
              AI writes the entire book based on your description. Fastest option.
            </p>
            <div className="badge badge-primary badge-outline mt-2">100% AI</div>
          </div>
        </div>

        {/* Mode 2: Chapter by Chapter */}
        <div
          className={`card bg-base-200 cursor-pointer transition-all hover:shadow-lg ${
            contentMode === "chapter-by-chapter" ? "ring-2 ring-primary" : ""
          }`}
          onClick={() => setContentMode("chapter-by-chapter")}
        >
          <div className="card-body">
            <div className="text-4xl mb-2">📝</div>
            <h4 className="card-title">Guided AI</h4>
            <p className="text-sm text-base-content/70">
              Describe each chapter, AI writes it. Get feature recommendations per chapter.
            </p>
            <div className="badge badge-secondary badge-outline mt-2">Collaborative</div>
          </div>
        </div>

        {/* Mode 3: Manual */}
        <div
          className={`card bg-base-200 cursor-pointer transition-all hover:shadow-lg ${
            contentMode === "manual" ? "ring-2 ring-primary" : ""
          }`}
          onClick={() => setContentMode("manual")}
        >
          <div className="card-body">
            <div className="text-4xl mb-2">✍️</div>
            <h4 className="card-title">Manual Writing</h4>
            <p className="text-sm text-base-content/70">
              Write all content yourself. Full creative control.
            </p>
            <div className="badge badge-accent badge-outline mt-2">100% Manual</div>
          </div>
        </div>
      </div>
    </div>
  );

  // Book Size Configuration
  const renderBookSizeConfig = () => (
    <div className="space-y-6 bg-base-200 rounded-lg p-6">
      <h4 className="font-bold text-lg">Book Size & Word Count Targets</h4>

      {/* Preset Selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(Object.entries(BOOK_SIZE_PRESETS) as [BookSizePreset, typeof BOOK_SIZE_PRESETS.short][]).map(([key, preset]) => (
          <div
            key={key}
            className={`card bg-base-100 cursor-pointer transition-all ${
              bookSizePreset === key ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => applyBookSizePreset(key)}
          >
            <div className="card-body p-4">
              <h5 className="font-semibold text-sm">{preset.label}</h5>
              {key !== "custom" && (
                <>
                  <p className="text-xs text-base-content/60">{preset.totalWords.toLocaleString()} words</p>
                  <p className="text-xs text-base-content/60">~{preset.totalPages} pages</p>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Custom Word Count */}
      {bookSizePreset === "custom" && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Total Word Count Target</span>
            </label>
            <input
              type="number"
              className="input input-bordered"
              value={bookConfig.targetWordCount || ""}
              onChange={(e) => setBookConfig((prev) => ({ ...prev, targetWordCount: parseInt(e.target.value) || 0 }))}
              placeholder="e.g., 50000"
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Words Per Chapter</span>
            </label>
            <input
              type="number"
              className="input input-bordered"
              value={bookConfig.chapters[0]?.targetWordCount || ""}
              onChange={(e) => {
                const wpc = parseInt(e.target.value) || 0;
                setBookConfig((prev) => ({
                  ...prev,
                  chapters: prev.chapters.map((ch) => ({ ...ch, targetWordCount: wpc })),
                }));
              }}
              placeholder="e.g., 4000"
            />
          </div>
        </div>
      )}

      {/* Context Info */}
      <div className="bg-base-100 rounded-lg p-4">
        <h5 className="font-semibold mb-2">Industry Context</h5>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-base-content/60">Short Chapter</p>
            <p>{WORD_COUNT_CONTEXT.shortChapter.min.toLocaleString()}-{WORD_COUNT_CONTEXT.shortChapter.max.toLocaleString()} words</p>
            <p className="text-xs text-base-content/50">{WORD_COUNT_CONTEXT.shortChapter.label}</p>
          </div>
          <div>
            <p className="text-base-content/60">Medium Chapter</p>
            <p>{WORD_COUNT_CONTEXT.mediumChapter.min.toLocaleString()}-{WORD_COUNT_CONTEXT.mediumChapter.max.toLocaleString()} words</p>
            <p className="text-xs text-base-content/50">{WORD_COUNT_CONTEXT.mediumChapter.label}</p>
          </div>
          <div>
            <p className="text-base-content/60">Long Chapter</p>
            <p>{WORD_COUNT_CONTEXT.longChapter.min.toLocaleString()}-{WORD_COUNT_CONTEXT.longChapter.max.toLocaleString()} words</p>
            <p className="text-xs text-base-content/50">{WORD_COUNT_CONTEXT.longChapter.label}</p>
          </div>
        </div>
        <p className="text-xs text-base-content/50 mt-3">
          ~{WORD_COUNT_CONTEXT.wordsPerPage} words per page | Average reading speed: {WORD_COUNT_CONTEXT.avgReadingSpeed} words/minute
        </p>
      </div>

      {/* Per-Chapter Word Count */}
      <div>
        <h5 className="font-semibold mb-2">Per-Chapter Targets</h5>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {bookConfig.chapters.map((chapter, index) => (
            <div key={chapter.id} className="flex items-center gap-3 bg-base-100 p-2 rounded">
              <span className="badge badge-sm">{index + 1}</span>
              <span className="flex-1 text-sm truncate">{chapter.title}</span>
              <input
                type="number"
                className="input input-bordered input-sm w-24"
                value={chapter.targetWordCount || ""}
                onChange={(e) => {
                  const newChapters = [...bookConfig.chapters];
                  newChapters[index].targetWordCount = parseInt(e.target.value) || 0;
                  setBookConfig((prev) => ({ ...prev, chapters: newChapters }));
                }}
                placeholder="Words"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Full AI Generation Mode
  const renderFullAIMode = () => (
    <div className="space-y-6">
      <div className="alert alert-info">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div>
          <p className="font-semibold">Full AI Generation</p>
          <p className="text-sm">AI will generate content for all {bookConfig.chapters.length} chapters based on your book description and chapter outlines.</p>
        </div>
      </div>

      {renderBookSizeConfig()}

      <div className="bg-base-200 rounded-lg p-6">
        <h4 className="font-bold mb-4">Generation Summary</h4>
        <div className="grid md:grid-cols-3 gap-4 text-center">
          <div className="stat bg-base-100 rounded-lg">
            <div className="stat-title">Chapters</div>
            <div className="stat-value text-primary">{bookConfig.chapters.length}</div>
          </div>
          <div className="stat bg-base-100 rounded-lg">
            <div className="stat-title">Target Words</div>
            <div className="stat-value text-secondary">{(bookConfig.targetWordCount || 0).toLocaleString()}</div>
          </div>
          <div className="stat bg-base-100 rounded-lg">
            <div className="stat-title">Est. Pages</div>
            <div className="stat-value">{Math.ceil((bookConfig.targetWordCount || 0) / WORD_COUNT_CONTEXT.wordsPerPage)}</div>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          className="btn btn-primary btn-lg"
          onClick={handleGenerateFullBook}
          disabled={isGeneratingContent}
        >
          {isGeneratingContent ? (
            <>
              <span className="loading loading-spinner"></span>
              Generating All Chapters...
            </>
          ) : (
            "Generate Entire Book"
          )}
        </button>
      </div>
    </div>
  );

  // Chapter by Chapter Mode
  const renderChapterByChapterMode = () => {
    const currentChapter = bookConfig.chapters[activeChapterIndex];
    const stats = calculateBookStats();

    return (
      <div className="space-y-6">
        {/* Progress Overview */}
        <div className="bg-base-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold">Progress</span>
            <span className="text-sm">
              {bookConfig.chapters.filter((ch) => ch.isGenerated).length} / {bookConfig.chapters.length} chapters
            </span>
          </div>
          <progress
            className="progress progress-primary w-full"
            value={bookConfig.chapters.filter((ch) => ch.isGenerated).length}
            max={bookConfig.chapters.length}
          ></progress>
          <div className="flex justify-between text-xs text-base-content/60 mt-1">
            <span>{stats.totalWords.toLocaleString()} words</span>
            <span>~{stats.totalPages} pages</span>
            <span>~{stats.readingTime} min read</span>
          </div>
        </div>

        {/* Chapter Navigation */}
        <div className="flex gap-2 flex-wrap">
          {bookConfig.chapters.map((chapter, index) => (
            <button
              key={chapter.id}
              className={`btn btn-sm ${
                activeChapterIndex === index
                  ? "btn-primary"
                  : chapter.isGenerated
                  ? "btn-success btn-outline"
                  : "btn-ghost"
              }`}
              onClick={() => setActiveChapterIndex(index)}
            >
              {index + 1}. {chapter.title.slice(0, 15)}{chapter.title.length > 15 ? "..." : ""}
              {chapter.isGenerated && " ✓"}
            </button>
          ))}
        </div>

        {/* Current Chapter Editor */}
        {currentChapter && (
          <div className="bg-base-200 rounded-lg p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-xl font-bold">Chapter {activeChapterIndex + 1}: {currentChapter.title}</h4>
                <p className="text-base-content/60 text-sm">{currentChapter.description}</p>
              </div>
              <div className="text-right">
                <p className="text-sm">Target: {currentChapter.targetWordCount?.toLocaleString() || "Not set"} words</p>
                {currentChapter.generatedContent && (
                  <p className="text-xs text-success">
                    Current: {currentChapter.generatedContent.split(/\s+/).filter(Boolean).length.toLocaleString()} words
                  </p>
                )}
              </div>
            </div>

            {/* Chapter Description/Instructions */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Chapter Instructions for AI</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-32"
                placeholder={`Describe what you want in this chapter...\n\nExample:\n- Cover the fundamentals of...\n- Include code examples in Python\n- Add 2-3 exercises\n- Include a diagram showing...`}
                value={chapterContent[currentChapter.id] || currentChapter.description}
                onChange={(e) => setChapterContent((prev) => ({ ...prev, [currentChapter.id]: e.target.value }))}
              />
            </div>

            {/* Word Count Target */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Word Count Target for This Chapter</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  className="input input-bordered flex-1"
                  value={currentChapter.targetWordCount || ""}
                  onChange={(e) => {
                    const newChapters = [...bookConfig.chapters];
                    newChapters[activeChapterIndex].targetWordCount = parseInt(e.target.value) || 0;
                    setBookConfig((prev) => ({ ...prev, chapters: newChapters }));
                  }}
                  placeholder="e.g., 4000"
                />
                <select
                  className="select select-bordered"
                  onChange={(e) => {
                    const newChapters = [...bookConfig.chapters];
                    newChapters[activeChapterIndex].targetWordCount = parseInt(e.target.value);
                    setBookConfig((prev) => ({ ...prev, chapters: newChapters }));
                  }}
                >
                  <option value="">Quick Set</option>
                  <option value="1500">Short (1,500)</option>
                  <option value="3000">Medium (3,000)</option>
                  <option value="5000">Long (5,000)</option>
                  <option value="8000">Extended (8,000)</option>
                </select>
              </div>
            </div>

            {/* Feature Selection for AI Generation */}
            <div className="collapse collapse-arrow bg-base-100 rounded-lg">
              <input type="checkbox" />
              <div className="collapse-title font-semibold">
                Features for This Chapter
                <span className="text-xs font-normal text-base-content/60 ml-2">
                  ({Object.keys(currentChapter.features || {}).filter(k => (currentChapter.features as Record<string, boolean>)?.[k]).length || Object.keys(features).filter(k => features[k as keyof MystFeatures]).length} active)
                </span>
              </div>
              <div className="collapse-content">
                <p className="text-xs text-base-content/60 mb-3">
                  Select which features the AI should use when generating content for this chapter.
                  Leave unchecked to use global settings from Step 2.
                </p>

                {/* Recommended Features Quick Add */}
                <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-base-content/10">
                  <span className="text-xs font-semibold text-base-content/70 w-full mb-1">Recommended:</span>
                  {(recommendedFeatures[currentChapter.id] || ["codeBlocks", "admonitions", "figures"]).map((feature) => (
                    <button
                      key={feature}
                      className={`badge badge-sm cursor-pointer ${
                        (currentChapter.features as Record<string, boolean>)?.[feature] ?? features[feature as keyof MystFeatures]
                          ? "badge-primary"
                          : "badge-outline"
                      }`}
                      onClick={() => {
                        const newChapters = [...bookConfig.chapters];
                        newChapters[activeChapterIndex].features = {
                          ...(currentChapter.features || {}),
                          [feature]: !((currentChapter.features as Record<string, boolean>)?.[feature] ?? features[feature as keyof MystFeatures]),
                        };
                        setBookConfig((prev) => ({ ...prev, chapters: newChapters }));
                      }}
                    >
                      {featureDescriptions[feature as keyof MystFeatures]?.label || feature}
                    </button>
                  ))}
                  <button className="btn btn-xs btn-ghost" onClick={() => handleGetFeatureRecommendations(currentChapter.id)}>
                    Refresh
                  </button>
                </div>

                {/* All Features Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                  {Object.entries(featureDescriptions).map(([key, { label }]) => {
                    const isEnabled = (currentChapter.features as Record<string, boolean>)?.[key] ?? features[key as keyof MystFeatures];
                    return (
                      <label
                        key={key}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-sm transition-all ${
                          isEnabled ? "bg-primary/10" : "bg-base-200 hover:bg-base-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="checkbox checkbox-primary checkbox-xs"
                          checked={isEnabled}
                          onChange={() => {
                            const newChapters = [...bookConfig.chapters];
                            newChapters[activeChapterIndex].features = {
                              ...(currentChapter.features || {}),
                              [key]: !isEnabled,
                            };
                            setBookConfig((prev) => ({ ...prev, chapters: newChapters }));
                          }}
                        />
                        <span className={isEnabled ? "font-medium" : "text-base-content/70"}>{label}</span>
                      </label>
                    );
                  })}
                </div>

                {/* Reset to Global Button */}
                <div className="mt-3 pt-3 border-t border-base-content/10 flex justify-between items-center">
                  <span className="text-xs text-base-content/60">
                    Custom settings override global features from Step 2
                  </span>
                  <button
                    className="btn btn-xs btn-ghost"
                    onClick={() => {
                      const newChapters = [...bookConfig.chapters];
                      delete newChapters[activeChapterIndex].features;
                      setBookConfig((prev) => ({ ...prev, chapters: newChapters }));
                    }}
                  >
                    Reset to Global
                  </button>
                </div>
              </div>
            </div>

            {/* Generated Content Preview with Tabs */}
            {currentChapter.generatedContent && (
              <div className="form-control">
                <div className="flex items-center justify-between mb-2">
                  <label className="label py-0">
                    <span className="label-text font-semibold">Generated Content</span>
                    <span className="label-text-alt text-success ml-2">Generated</span>
                  </label>
                  {/* Tab Buttons */}
                  <div className="tabs tabs-boxed bg-base-200">
                    <button
                      className={`tab tab-sm ${chapterPreviewTab === "source" ? "tab-active" : ""}`}
                      onClick={() => setChapterPreviewTab("source")}
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                      Source
                    </button>
                    <button
                      className={`tab tab-sm ${chapterPreviewTab === "preview" ? "tab-active" : ""}`}
                      onClick={() => setChapterPreviewTab("preview")}
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Preview
                    </button>
                  </div>
                </div>

                {/* Source Tab - Editable Textarea */}
                {chapterPreviewTab === "source" && (
                  <textarea
                    className="textarea textarea-bordered h-80 font-mono text-sm"
                    value={currentChapter.generatedContent}
                    onChange={(e) => {
                      const newChapters = [...bookConfig.chapters];
                      newChapters[activeChapterIndex].generatedContent = e.target.value;
                      setBookConfig((prev) => ({ ...prev, chapters: newChapters }));
                    }}
                  />
                )}

                {/* Preview Tab - Rendered HTML */}
                {chapterPreviewTab === "preview" && (
                  <div
                    className="border border-base-300 rounded-lg p-4 h-80 overflow-y-auto bg-base-100 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: mystToHtml(currentChapter.generatedContent) }}
                  />
                )}

                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    {chapterPreviewTab === "source"
                      ? "Edit the MyST markdown source directly"
                      : "Preview of how the content will render"
                    }
                  </span>
                  <span className="label-text-alt">
                    {(currentChapter.generatedContent || "").split(/\s+/).filter(Boolean).length.toLocaleString()} words
                  </span>
                </label>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 justify-end">
              <button
                className="btn btn-primary"
                onClick={() => handleGenerateChapter(currentChapter.id)}
                disabled={generatingChapterId === currentChapter.id}
              >
                {generatingChapterId === currentChapter.id ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Generating...
                  </>
                ) : currentChapter.isGenerated ? (
                  "Regenerate Chapter"
                ) : (
                  "Generate This Chapter"
                )}
              </button>
              {activeChapterIndex < bookConfig.chapters.length - 1 && (
                <button
                  className="btn btn-outline"
                  onClick={() => setActiveChapterIndex(activeChapterIndex + 1)}
                >
                  Next Chapter →
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Manual Writing Mode
  const renderManualMode = () => {
    const currentChapter = bookConfig.chapters[activeChapterIndex];
    const stats = calculateBookStats();

    return (
      <div className="space-y-6">
        {/* Progress Overview */}
        <div className="bg-base-200 rounded-lg p-4">
          <div className="flex justify-between text-sm">
            <span>{stats.totalWords.toLocaleString()} words written</span>
            <span>~{stats.totalPages} pages</span>
            <span>~{stats.readingTime} min read</span>
          </div>
        </div>

        {/* Chapter Navigation */}
        <div className="flex gap-2 flex-wrap">
          {bookConfig.chapters.map((chapter, index) => {
            const wordCount = (chapter.content || "").split(/\s+/).filter(Boolean).length;
            return (
              <button
                key={chapter.id}
                className={`btn btn-sm ${activeChapterIndex === index ? "btn-primary" : wordCount > 0 ? "btn-success btn-outline" : "btn-ghost"}`}
                onClick={() => setActiveChapterIndex(index)}
              >
                {index + 1}. {chapter.title.slice(0, 15)}{chapter.title.length > 15 ? "..." : ""}
                {wordCount > 0 && ` (${wordCount})`}
              </button>
            );
          })}
        </div>

        {/* Current Chapter Editor */}
        {currentChapter && (
          <div className="bg-base-200 rounded-lg p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-xl font-bold">Chapter {activeChapterIndex + 1}: {currentChapter.title}</h4>
                <p className="text-base-content/60 text-sm">{currentChapter.description}</p>
              </div>
              <div className="text-right text-sm">
                <p>Words: {(currentChapter.content || "").split(/\s+/).filter(Boolean).length.toLocaleString()}</p>
                {currentChapter.targetWordCount && (
                  <p className="text-xs text-base-content/60">Target: {currentChapter.targetWordCount.toLocaleString()}</p>
                )}
              </div>
            </div>

            {/* Content Editor */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Chapter Content</span>
                <a href="/docs/syntax" className="label-text-alt link link-primary">
                  Syntax Guide ↗
                </a>
              </label>
              <textarea
                className="textarea textarea-bordered h-96 font-mono text-sm"
                placeholder={`# ${currentChapter.title}\n\nStart writing your chapter content here...\n\n## Section 1\n\nYour content...\n\n:::{note}\nThis is an admonition block\n:::\n\n\`\`\`python\n# Code example\nprint("Hello!")\n\`\`\``}
                value={currentChapter.content || ""}
                onChange={(e) => {
                  const newChapters = [...bookConfig.chapters];
                  newChapters[activeChapterIndex].content = e.target.value;
                  setBookConfig((prev) => ({ ...prev, chapters: newChapters }));
                }}
              />
            </div>

            {/* Quick Insert Buttons */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-base-content/60">Quick Insert:</span>
              <button className="btn btn-xs" onClick={() => insertMystSnippet("note")}>Note</button>
              <button className="btn btn-xs" onClick={() => insertMystSnippet("code")}>Code Block</button>
              <button className="btn btn-xs" onClick={() => insertMystSnippet("figure")}>Figure</button>
              <button className="btn btn-xs" onClick={() => insertMystSnippet("exercise")}>Exercise</button>
              <button className="btn btn-xs" onClick={() => insertMystSnippet("dropdown")}>Dropdown</button>
              <button className="btn btn-xs" onClick={() => insertMystSnippet("math")}>Math</button>
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                className="btn btn-outline"
                onClick={() => setActiveChapterIndex(Math.max(0, activeChapterIndex - 1))}
                disabled={activeChapterIndex === 0}
              >
                ← Previous
              </button>
              <button
                className="btn btn-outline"
                onClick={() => setActiveChapterIndex(Math.min(bookConfig.chapters.length - 1, activeChapterIndex + 1))}
                disabled={activeChapterIndex === bookConfig.chapters.length - 1}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Helper function to insert MyST snippets
  const insertMystSnippet = (type: string) => {
    const snippets: Record<string, string> = {
      note: "\n:::{note}\nYour note content here.\n:::\n",
      code: "\n```python\n# Your code here\nprint('Hello!')\n```\n",
      figure: "\n:::{figure} https://via.placeholder.com/600x300\n:name: fig-name\n:align: center\n\nFigure caption here.\n:::\n",
      exercise: "\n:::{exercise}\n:label: exercise-1\n\nYour exercise question here.\n:::\n\n:::{solution} exercise-1\n:class: dropdown\n\nSolution here.\n:::\n",
      dropdown: "\n:::{dropdown} Click to expand\nHidden content here.\n:::\n",
      math: "\n$$\nE = mc^2\n$$\n",
    };

    const currentChapter = bookConfig.chapters[activeChapterIndex];
    if (currentChapter) {
      const newContent = (currentChapter.content || "") + snippets[type];
      const newChapters = [...bookConfig.chapters];
      newChapters[activeChapterIndex].content = newContent;
      setBookConfig((prev) => ({ ...prev, chapters: newChapters }));
    }
  };

  // Handler functions for content generation
  const handleGenerateFullBook = async () => {
    setIsGeneratingContent(true);
    setError(null);
    try {
      const response = await fetch("/api/book/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "full",
          bookConfig,
          features,
          aiConfig,
          targetWordCount: bookConfig.targetWordCount,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Generation failed");

      // Update chapters with generated content
      setBookConfig((prev) => ({
        ...prev,
        chapters: prev.chapters.map((ch, index) => ({
          ...ch,
          generatedContent: data.chapters[index]?.content || "",
          isGenerated: true,
        })),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate content");
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const handleGenerateChapter = async (chapterId: string) => {
    setGeneratingChapterId(chapterId);
    setError(null);
    const chapterIndex = bookConfig.chapters.findIndex((ch) => ch.id === chapterId);
    const chapter = bookConfig.chapters[chapterIndex];

    try {
      const response = await fetch("/api/book/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "chapter",
          bookConfig,
          chapterIndex,
          chapterInstructions: chapterContent[chapterId] || chapter.description,
          features,
          aiConfig,
          targetWordCount: chapter.targetWordCount,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Generation failed");

      // Update the specific chapter
      const newChapters = [...bookConfig.chapters];
      newChapters[chapterIndex] = {
        ...newChapters[chapterIndex],
        generatedContent: data.content,
        isGenerated: true,
      };
      setBookConfig((prev) => ({ ...prev, chapters: newChapters }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate chapter");
    } finally {
      setGeneratingChapterId(null);
    }
  };

  const handleGetFeatureRecommendations = async (chapterId: string) => {
    const chapter = bookConfig.chapters.find((ch) => ch.id === chapterId);
    if (!chapter) return;

    try {
      const response = await fetch("/api/book/recommend-features", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterTitle: chapter.title,
          chapterDescription: chapterContent[chapterId] || chapter.description,
          aiConfig,
        }),
      });

      const data = await response.json();
      if (response.ok && data.features) {
        setRecommendedFeatures((prev) => ({ ...prev, [chapterId]: data.features }));
      }
    } catch (err) {
      console.error("Failed to get recommendations:", err);
    }
  };

  // Main Step 4 render
  const renderStep4 = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Generate Content</h2>
        <p className="text-base-content/70">
          Create the content for your {bookConfig.chapters.length}-chapter book
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Mode Selection (if not yet selected) */}
      {!contentMode && renderModeSelection()}

      {/* Mode-specific UI */}
      {contentMode === "full-ai" && renderFullAIMode()}
      {contentMode === "chapter-by-chapter" && renderChapterByChapterMode()}
      {contentMode === "manual" && renderManualMode()}

      {/* Change Mode Button */}
      {contentMode && (
        <div className="text-center">
          <button className="btn btn-ghost btn-sm" onClick={() => setContentMode(null)}>
            ← Change Content Mode
          </button>
        </div>
      )}
    </div>
  );

  // Step 5: Preview & Push
  const renderStep5 = () => {
    const stats = calculateBookStats();
    const hasContent = bookConfig.chapters.some((ch) => ch.generatedContent || ch.content);

    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Preview & Publish</h2>
          <p className="text-base-content/70">Review your book and push to GitHub</p>
        </div>

        {/* Book Stats */}
        <div className="stats stats-vertical lg:stats-horizontal shadow w-full">
          <div className="stat">
            <div className="stat-title">Total Words</div>
            <div className="stat-value text-primary">{stats.totalWords.toLocaleString()}</div>
            <div className="stat-desc">Target: {(bookConfig.targetWordCount || 0).toLocaleString()}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Pages</div>
            <div className="stat-value">{stats.totalPages}</div>
            <div className="stat-desc">~{WORD_COUNT_CONTEXT.wordsPerPage} words/page</div>
          </div>
          <div className="stat">
            <div className="stat-title">Reading Time</div>
            <div className="stat-value">{stats.readingTime}</div>
            <div className="stat-desc">minutes</div>
          </div>
          <div className="stat">
            <div className="stat-title">Chapters</div>
            <div className="stat-value">{bookConfig.chapters.length}</div>
            <div className="stat-desc">{bookConfig.chapters.filter((ch) => ch.isGenerated || ch.content).length} with content</div>
          </div>
        </div>

        {/* Chapter Content Overview */}
        <div className="bg-base-200 rounded-lg p-6">
          <h4 className="font-bold mb-4">Chapter Content Status</h4>
          <div className="space-y-2">
            {bookConfig.chapters.map((chapter, index) => {
              const content = chapter.generatedContent || chapter.content || "";
              const wordCount = content.split(/\s+/).filter(Boolean).length;
              const progress = chapter.targetWordCount ? Math.min(100, (wordCount / chapter.targetWordCount) * 100) : 0;

              return (
                <div key={chapter.id} className="flex items-center gap-3">
                  <span className="badge badge-sm w-8">{index + 1}</span>
                  <span className="flex-1 truncate">{chapter.title}</span>
                  <div className="w-32">
                    <progress className="progress progress-primary w-full" value={progress} max="100"></progress>
                  </div>
                  <span className="text-sm w-24 text-right">{wordCount.toLocaleString()} words</span>
                  {(chapter.isGenerated || content) && <span className="badge badge-success badge-sm">Ready</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Preview Section */}
        <div className="bg-base-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold">Preview</h4>
            <button
              className="btn btn-outline btn-sm"
              onClick={handleLoadPreview}
              disabled={isLoadingPreview || !hasContent}
            >
              {isLoadingPreview ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Loading...
                </>
              ) : (
                "Load Preview"
              )}
            </button>
          </div>

          {previewHtml ? (
            <div className="bg-white rounded-lg p-4 max-h-96 overflow-auto">
              <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>
          ) : (
            <div className="text-center py-8 text-base-content/50">
              <p>Click "Load Preview" to see how your book will look</p>
            </div>
          )}
        </div>

        {/* Push to GitHub */}
        <div className="bg-base-200 rounded-lg p-6">
          <h4 className="font-bold mb-4">Publish to GitHub Pages</h4>
          <p className="text-sm text-base-content/60 mb-4">
            Push your content to the existing repository: {githubConfig.username}/{githubConfig.repoName}
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              className="btn btn-primary btn-lg flex-1"
              onClick={handlePushContent}
              disabled={isPushingContent || !hasContent}
            >
              {isPushingContent ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Pushing Content...
                </>
              ) : (
                "Push Content to GitHub"
              )}
            </button>

            {deploymentResult?.deployUrl && !deployStatusInfo && (
              <a
                href={deploymentResult.deployUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-lg"
              >
                View Live Site ↗
              </a>
            )}
          </div>

          {/* Deployment Status - Real-time feedback */}
          {renderDeploymentStatus()}

          {/* README Regeneration */}
          <div className="mt-6 pt-4 border-t border-base-content/10">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-semibold text-sm">Update README</h5>
                <p className="text-xs text-base-content/60">
                  Regenerate README.md with latest book information
                </p>
              </div>
              <button
                className="btn btn-outline btn-sm"
                onClick={handleUpdateReadme}
                disabled={isUpdatingReadme || !githubConfig.repoName}
              >
                {isUpdatingReadme ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Updating...
                  </>
                ) : (
                  "Regenerate README"
                )}
              </button>
            </div>
            {readmeUpdateResult && (
              <div className={`alert ${readmeUpdateResult.success ? "alert-success" : "alert-error"} mt-3 py-2`}>
                <span className="text-sm">{readmeUpdateResult.message}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Handler for preview
  const handleLoadPreview = async () => {
    setIsLoadingPreview(true);
    try {
      const response = await fetch("/api/book/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookConfig, features }),
      });
      const data = await response.json();
      if (response.ok) {
        setPreviewHtml(data.html);
      }
    } catch (err) {
      console.error("Preview failed:", err);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  // Handler for updating README
  const handleUpdateReadme = async () => {
    setIsUpdatingReadme(true);
    setReadmeUpdateResult(null);

    try {
      const response = await fetch("/api/book/update-readme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookConfig,
          owner: githubConfig.username,
          repo: githubConfig.repoName,
          token: githubConfig.token || process.env.NEXT_PUBLIC_GITHUB_PAT,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update README");
      }

      setReadmeUpdateResult({
        success: true,
        message: "README updated successfully!",
      });
    } catch (err) {
      setReadmeUpdateResult({
        success: false,
        message: err instanceof Error ? err.message : "Failed to update README",
      });
    } finally {
      setIsUpdatingReadme(false);
    }
  };

  // Handler for pushing content
  const handlePushContent = async () => {
    setIsPushingContent(true);
    setError(null);
    setDeployStatusInfo(null);

    try {
      const response = await fetch("/api/book/push-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookConfig,
          features,
          githubConfig,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Push failed");

      setDeploymentResult(data);

      // Set initial status - push succeeded, build starting
      setDeployStatusInfo({
        pushStatus: "success",
        buildStatus: "queued",
        message: "Content pushed successfully! GitHub Actions build is starting...",
        lastUpdated: new Date().toISOString(),
        pagesUrl: data.deployUrl,
        estimatedTimeRemaining: "2-3 minutes",
      });

      // Start polling for build status
      pollDeploymentStatus(githubConfig.repoName);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to push content");
      setDeployStatusInfo({
        pushStatus: "error",
        buildStatus: "not_started",
        message: err instanceof Error ? err.message : "Failed to push content to GitHub",
        lastUpdated: new Date().toISOString(),
      });
    } finally {
      setIsPushingContent(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-100">
      {/* Progress Steps */}
      <div className="w-full bg-base-200 py-6">
        <div className="max-w-4xl mx-auto px-4">
          <ul className="steps steps-horizontal w-full">
            <li className={`step ${step >= 1 ? "step-primary" : ""}`}>
              <span className="hidden sm:inline">Describe Book</span>
              <span className="sm:hidden">1</span>
            </li>
            <li className={`step ${step >= 2 ? "step-primary" : ""}`}>
              <span className="hidden sm:inline">Select Features</span>
              <span className="sm:hidden">2</span>
            </li>
            <li className={`step ${step >= 3 ? "step-primary" : ""}`}>
              <span className="hidden sm:inline">Deploy Skeleton</span>
              <span className="sm:hidden">3</span>
            </li>
            <li className={`step ${step >= 4 ? "step-primary" : ""}`}>
              <span className="hidden sm:inline">Generate Content</span>
              <span className="sm:hidden">4</span>
            </li>
            <li className={`step ${step >= 5 ? "step-primary" : ""}`}>
              <span className="hidden sm:inline">Preview & Publish</span>
              <span className="sm:hidden">5</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-12 pt-6 border-t border-base-200">
          <button
            className="btn btn-outline"
            onClick={() => setStep((prev) => (prev > 1 ? (prev - 1) as WizardStep : prev))}
            disabled={step === 1}
          >
            ← Previous
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setStep((prev) => (prev < 5 ? (prev + 1) as WizardStep : prev))}
            disabled={step === 5}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
