"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/libs/supabase";
import Link from "next/link";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";

// Chapter interface matching the wizard
interface Chapter {
  id: string;
  title: string;
  description: string;
  content?: string;
  generatedContent?: string;
  isGenerated?: boolean;
  targetWordCount?: number;
  features?: Partial<MystFeatures>;
}

// Full MystFeatures interface - all 48 features
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

interface UserBook {
  id: string;
  title: string;
  description: string | null;
  github_repo_name: string;
  github_repo_url: string | null;
  github_pages_url: string | null;
  github_username: string;
  status: "draft" | "deployed" | "failed";
  chapters: Chapter[];
  features?: MystFeatures;
  created_at: string;
  updated_at: string;
  last_deployed_at: string | null;
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

// Feature descriptions organized by category
const featureDescriptions: Record<keyof MystFeatures, { label: string; description: string; category: string }> = {
  // Content Features
  admonitions: {
    label: "Admonitions & Callouts",
    description: "Note, tip, warning, danger boxes",
    category: "Content",
  },
  codeBlocks: {
    label: "Code Blocks",
    description: "Syntax-highlighted code",
    category: "Content",
  },
  mathEquations: {
    label: "Math Equations",
    description: "LaTeX math rendering",
    category: "Content",
  },
  mermaidDiagrams: {
    label: "Mermaid Diagrams",
    description: "Flowcharts and diagrams",
    category: "Content",
  },
  figures: {
    label: "Figures",
    description: "Images with captions",
    category: "Content",
  },
  tables: {
    label: "Tables",
    description: "Data tables",
    category: "Content",
  },
  blockquotes: {
    label: "Block Quotes",
    description: "Quoted text and epigraphs",
    category: "Content",
  },
  // Layout Features
  cards: {
    label: "Cards",
    description: "Content cards for highlights",
    category: "Layout",
  },
  grids: {
    label: "Grids",
    description: "Multi-column layouts",
    category: "Layout",
  },
  // Typography Features
  asides: {
    label: "Asides",
    description: "Sidenotes and margin notes",
    category: "Typography",
  },
  footnotes: {
    label: "Footnotes",
    description: "Bottom-of-page references",
    category: "Typography",
  },
  abbreviations: {
    label: "Abbreviations",
    description: "Terms with tooltips",
    category: "Typography",
  },
  smallcaps: {
    label: "Small Caps",
    description: "Stylized small capitals",
    category: "Typography",
  },
  subscriptSuperscript: {
    label: "Sub/Superscript",
    description: "H₂O or E=mc² formatting",
    category: "Typography",
  },
  underlineStrikethrough: {
    label: "Underline/Strike",
    description: "Text decoration",
    category: "Typography",
  },
  keyboard: {
    label: "Keyboard Keys",
    description: "Shortcut styling (Ctrl+C)",
    category: "Typography",
  },
  // Media Features
  videos: {
    label: "Videos",
    description: "Embedded video content",
    category: "Media",
  },
  images: {
    label: "Images",
    description: "Standalone images",
    category: "Media",
  },
  // Interactive Features
  exercises: {
    label: "Exercises",
    description: "Practice problems with solutions",
    category: "Interactive",
  },
  dropdowns: {
    label: "Dropdowns",
    description: "Collapsible sections",
    category: "Interactive",
  },
  tabs: {
    label: "Tabs",
    description: "Tabbed content panels",
    category: "Interactive",
  },
  glossary: {
    label: "Glossary",
    description: "Term definitions",
    category: "Interactive",
  },
  buttons: {
    label: "Buttons",
    description: "Call-to-action buttons",
    category: "Interactive",
  },
  // Academic Features
  proofs: {
    label: "Proofs",
    description: "Mathematical proofs",
    category: "Academic",
  },
  siUnits: {
    label: "SI Units",
    description: "Scientific units formatting",
    category: "Academic",
  },
  chemicalFormulas: {
    label: "Chemical Formulas",
    description: "Chemical notation",
    category: "Academic",
  },
  // External References
  wikipediaLinks: {
    label: "Wikipedia Links",
    description: "Wikipedia references",
    category: "External References",
  },
  githubLinks: {
    label: "GitHub Links",
    description: "Repository links",
    category: "External References",
  },
  doiLinks: {
    label: "DOI Links",
    description: "Academic paper links",
    category: "External References",
  },
  rridLinks: {
    label: "RRID Links",
    description: "Research resource IDs",
    category: "External References",
  },
  rorLinks: {
    label: "ROR Links",
    description: "Organization links",
    category: "External References",
  },
  intersphinx: {
    label: "Intersphinx",
    description: "Python doc cross-refs",
    category: "External References",
  },
  // Advanced Content
  embedDirective: {
    label: "Embed Directive",
    description: "Embed external content",
    category: "Advanced",
  },
  includeFiles: {
    label: "Include Files",
    description: "Include external files",
    category: "Advanced",
  },
  evalExpressions: {
    label: "Eval Expressions",
    description: "Dynamic computed values",
    category: "Advanced",
  },
  // Execution Features
  executableCode: {
    label: "Executable Code",
    description: "Run code during build",
    category: "Execution",
  },
  jupyterLite: {
    label: "JupyterLite",
    description: "Browser-based Python",
    category: "Execution",
  },
  binderIntegration: {
    label: "Binder",
    description: "Cloud Jupyter notebooks",
    category: "Execution",
  },
  thebe: {
    label: "Thebe",
    description: "In-page live code",
    category: "Execution",
  },
  colabLinks: {
    label: "Colab Links",
    description: "Google Colab links",
    category: "Execution",
  },
  // Export Features
  pdfExport: {
    label: "PDF Export",
    description: "PDF generation",
    category: "Export",
  },
  wordExport: {
    label: "Word Export",
    description: "Word document export",
    category: "Export",
  },
  texExport: {
    label: "LaTeX Export",
    description: "LaTeX source export",
    category: "Export",
  },
  jatsExport: {
    label: "JATS Export",
    description: "Academic XML export",
    category: "Export",
  },
  typstExport: {
    label: "Typst Export",
    description: "Typst PDF export",
    category: "Export",
  },
  markdownExport: {
    label: "Markdown Export",
    description: "Plain Markdown export",
    category: "Export",
  },
  // Navigation Features
  tableOfContents: {
    label: "Table of Contents",
    description: "Navigation sidebar",
    category: "Navigation",
  },
  crossReferences: {
    label: "Cross-References",
    description: "Section and figure links",
    category: "Navigation",
  },
  citations: {
    label: "Citations",
    description: "Bibliography and citations",
    category: "Navigation",
  },
  indexEntries: {
    label: "Index Entries",
    description: "Searchable index",
    category: "Navigation",
  },
  numberedReferences: {
    label: "Numbered References",
    description: "Auto-numbered elements",
    category: "Navigation",
  },
};

// Get unique categories
const featureCategories = Array.from(
  new Set(Object.values(featureDescriptions).map((f) => f.category))
);

export default function EditBookPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.id as string;

  const [book, setBook] = useState<UserBook | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "chapters" | "features">("details");
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [chapterPreviewTab, setChapterPreviewTab] = useState<"source" | "preview">("source");
  const [githubToken, setGithubToken] = useState("");
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(featureCategories);
  const [isGeneratingChapter, setIsGeneratingChapter] = useState<string | null>(null);
  const [showAISettings, setShowAISettings] = useState(false);
  const [aiConfig, setAiConfig] = useState({
    provider: "claude" as "claude" | "gemini" | "openai",
    model: "claude-sonnet-4-20250514",
    apiKey: "",
  });
  const [availableModels, setAvailableModels] = useState<{
    claude: { id: string; name: string }[];
    openai: { id: string; name: string }[];
    gemini: { id: string; name: string }[];
  }>({
    claude: [],
    openai: [],
    gemini: [],
  });
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [showAIFeatures, setShowAIFeatures] = useState(false);
  const [aiExpandedCategories, setAiExpandedCategories] = useState<string[]>([]);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [features, setFeatures] = useState<MystFeatures>(defaultFeatures);

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

    // Admonitions
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

  const fetchBook = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("user_books")
      .select("*")
      .eq("id", bookId)
      .single();

    if (error) {
      console.error("Error fetching book:", error);
      toast.error("Failed to load book");
      router.push("/dashboard/my-books");
      return;
    }

    setBook(data);
    setTitle(data.title);
    setDescription(data.description || "");
    setChapters(data.chapters || []);
    // Merge stored features with defaults to handle any missing keys
    setFeatures({ ...defaultFeatures, ...(data.features || {}) });
    setIsLoading(false);
  }, [bookId, router]);

  useEffect(() => {
    fetchBook();
  }, [fetchBook]);

  // Fetch available AI models from API
  const fetchModels = useCallback(async (provider?: "claude" | "gemini" | "openai") => {
    setIsLoadingModels(true);
    try {
      const url = provider
        ? `/api/ai/models?provider=${provider}${aiConfig.apiKey ? `&apiKey=${aiConfig.apiKey}` : ""}`
        : `/api/ai/models${aiConfig.apiKey ? `?apiKey=${aiConfig.apiKey}` : ""}`;

      const response = await fetch(url);
      const data = await response.json();

      if (provider) {
        // Single provider response: { provider, models }
        setAvailableModels((prev) => ({
          ...prev,
          [provider]: data.models || [],
        }));
        // Set first model as default if current model not in list
        if (data.models?.length > 0) {
          const modelIds = data.models.map((m: { id: string }) => m.id);
          if (!modelIds.includes(aiConfig.model)) {
            setAiConfig((prev) => ({ ...prev, model: data.models[0].id }));
          }
        }
      } else {
        // All providers response: [{ provider, models }, ...]
        const newModels: {
          claude: { id: string; name: string }[];
          openai: { id: string; name: string }[];
          gemini: { id: string; name: string }[];
        } = { claude: [], openai: [], gemini: [] };

        for (const item of data) {
          if (item.provider && item.models) {
            newModels[item.provider as "claude" | "openai" | "gemini"] = item.models;
          }
        }
        setAvailableModels(newModels);

        // Set default model for current provider if needed
        const currentProviderModels = newModels[aiConfig.provider];
        if (currentProviderModels.length > 0) {
          const modelIds = currentProviderModels.map((m) => m.id);
          if (!modelIds.includes(aiConfig.model)) {
            setAiConfig((prev) => ({ ...prev, model: currentProviderModels[0].id }));
          }
        }
      }
    } catch (error) {
      console.error("Error fetching models:", error);
      toast.error("Failed to fetch available models");
    } finally {
      setIsLoadingModels(false);
    }
  }, [aiConfig.apiKey, aiConfig.model, aiConfig.provider]);

  // Fetch models on mount and when AI settings panel opens
  useEffect(() => {
    if (showAISettings && availableModels.claude.length === 0) {
      fetchModels();
    }
  }, [showAISettings, availableModels.claude.length, fetchModels]);

  // Check if this is a fenago repo (uses server token)
  const isFenagoRepo = book?.github_username.toLowerCase() === "fenago";

  const handleSave = async () => {
    if (!book) return;

    setIsSaving(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("user_books")
      .update({
        title,
        description,
        chapters,
        features,
        updated_at: new Date().toISOString(),
      })
      .eq("id", book.id);

    if (error) {
      toast.error("Failed to save changes");
      console.error(error);
    } else {
      toast.success("Changes saved successfully");
      setBook({
        ...book,
        title,
        description,
        chapters,
        features,
      });
    }
    setIsSaving(false);
  };

  const handlePushToGitHub = async () => {
    if (!book) return;

    // For non-fenago repos, require token
    if (!isFenagoRepo && !githubToken) {
      setShowTokenInput(true);
      return;
    }

    setIsPushing(true);

    try {
      const response = await fetch("/api/book/push-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookConfig: {
            title,
            description,
            author: "",
            repoName: book.github_repo_name,
          },
          chapters,
          features,
          githubToken: isFenagoRepo ? undefined : githubToken,
          githubUsername: book.github_username,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to push to GitHub");
      }

      toast.success("Successfully pushed updates to GitHub!");
      setShowTokenInput(false);

      const supabase = createClient();
      await supabase
        .from("user_books")
        .update({
          last_deployed_at: new Date().toISOString(),
          status: "deployed",
        })
        .eq("id", book.id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to push");
      console.error(error);
    }

    setIsPushing(false);
  };

  // Chapter management functions
  const addChapter = () => {
    const newChapter: Chapter = {
      id: uuidv4(),
      title: `Chapter ${chapters.length + 1}`,
      description: "",
      targetWordCount: 3000,
    };
    setChapters([...chapters, newChapter]);
    setEditingChapterId(newChapter.id);
  };

  const updateChapter = (chapterId: string, updates: Partial<Chapter>) => {
    setChapters(chapters.map((ch) => (ch.id === chapterId ? { ...ch, ...updates } : ch)));
  };

  const deleteChapter = (chapterId: string) => {
    setChapters(chapters.filter((ch) => ch.id !== chapterId));
    if (editingChapterId === chapterId) {
      setEditingChapterId(null);
    }
  };

  const moveChapter = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= chapters.length) return;

    const newChapters = [...chapters];
    [newChapters[index], newChapters[newIndex]] = [newChapters[newIndex], newChapters[index]];
    setChapters(newChapters);
  };

  const toggleFeature = (feature: keyof MystFeatures) => {
    setFeatures({ ...features, [feature]: !features[feature] });
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const getFeaturesInCategory = (category: string) => {
    return (Object.keys(featureDescriptions) as Array<keyof MystFeatures>).filter(
      (key) => featureDescriptions[key].category === category
    );
  };

  const getChapterContent = (chapter: Chapter) => {
    return chapter.generatedContent || chapter.content || "";
  };

  // Get effective features for a chapter (chapter-specific overrides book-level)
  const getChapterFeatures = (chapter: Chapter): MystFeatures => {
    return { ...features, ...(chapter.features || {}) };
  };

  // Toggle a feature for a specific chapter
  const toggleChapterFeature = (chapterId: string, feature: keyof MystFeatures) => {
    setChapters(chapters.map((ch) => {
      if (ch.id === chapterId) {
        const currentFeatures = ch.features || {};
        const currentValue = currentFeatures[feature] ?? features[feature];
        return {
          ...ch,
          features: {
            ...currentFeatures,
            [feature]: !currentValue,
          },
        };
      }
      return ch;
    }));
  };

  // Toggle AI feature category expansion
  const toggleAiCategory = (category: string) => {
    setAiExpandedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  // Copy book-level features to chapter
  const copyBookFeaturesToChapter = (chapterId: string) => {
    setChapters(chapters.map((ch) => {
      if (ch.id === chapterId) {
        return { ...ch, features: { ...features } };
      }
      return ch;
    }));
  };

  // Count enabled features for a chapter
  const getChapterFeatureCount = (chapter: Chapter): number => {
    const chapterFeatures = getChapterFeatures(chapter);
    return Object.values(chapterFeatures).filter(Boolean).length;
  };

  // AI Chapter Generation
  const generateChapterWithAI = async (chapterId: string) => {
    const chapter = chapters.find((ch) => ch.id === chapterId);
    if (!chapter) return;

    setIsGeneratingChapter(chapterId);

    try {
      // Get the book context for AI
      const previousChapters = chapters
        .slice(0, chapters.findIndex((ch) => ch.id === chapterId))
        .map((ch) => ({
          title: ch.title,
          description: ch.description,
        }));

      // Use chapter-specific features (merged with book-level defaults)
      const chapterFeatures = getChapterFeatures(chapter);

      const response = await fetch("/api/book/generate-chapter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookTitle: title,
          bookDescription: description,
          chapterTitle: chapter.title,
          chapterDescription: chapter.description,
          targetWordCount: chapter.targetWordCount || 3000,
          features: chapterFeatures,
          previousChapters,
          aiConfig: {
            provider: aiConfig.provider,
            model: aiConfig.model,
            apiKey: aiConfig.apiKey || undefined,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate chapter");
      }

      // Update the chapter with generated content
      updateChapter(chapterId, {
        generatedContent: data.content,
        isGenerated: true,
      });

      toast.success(`Chapter "${chapter.title}" generated successfully!`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate chapter");
      console.error(error);
    } finally {
      setIsGeneratingChapter(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p>Book not found</p>
      </div>
    );
  }

  const editingChapter = chapters.find((ch) => ch.id === editingChapterId);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/my-books" className="btn btn-ghost btn-sm">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Edit Book</h1>
            <p className="text-sm text-base-content/60">
              {book.github_username}/{book.github_repo_name}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className={`btn btn-outline ${isSaving ? "loading" : ""}`}
            disabled={isSaving}
          >
            {!isSaving && (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                />
              </svg>
            )}
            Save Draft
          </button>
          <button
            onClick={() => (isFenagoRepo ? handlePushToGitHub() : setShowTokenInput(true))}
            className={`btn btn-primary ${isPushing ? "loading" : ""}`}
            disabled={isPushing}
          >
            {!isPushing && (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            )}
            Push to GitHub
          </button>
        </div>
      </div>

      {/* Quick Links */}
      <div className="flex gap-4 mb-6">
        {book.github_pages_url && (
          <a
            href={book.github_pages_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-ghost"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            View Live Book
          </a>
        )}
        {book.github_repo_url && (
          <a
            href={book.github_repo_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-ghost"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            GitHub Repo
          </a>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed mb-6 bg-base-200 p-1">
        <button
          className={`tab ${activeTab === "details" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("details")}
        >
          Book Details
        </button>
        <button
          className={`tab ${activeTab === "chapters" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("chapters")}
        >
          Chapters ({chapters.length})
        </button>
        <button
          className={`tab ${activeTab === "features" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("features")}
        >
          Features ({Object.values(features).filter(Boolean).length}/48)
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-base-100 rounded-lg shadow-lg p-6">
        {/* Book Details Tab */}
        {activeTab === "details" && (
          <div className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold text-lg">Book Title</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input input-bordered input-lg w-full"
                placeholder="Enter your book title"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold text-lg">Description</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="textarea textarea-bordered w-full h-32"
                placeholder="What is your book about?"
              />
            </div>

            <div className="divider"></div>

            <div className="grid grid-cols-2 gap-4">
              <div className="stat bg-base-200 rounded-lg">
                <div className="stat-title">Repository</div>
                <div className="stat-value text-lg font-mono">{book.github_repo_name}</div>
              </div>
              <div className="stat bg-base-200 rounded-lg">
                <div className="stat-title">Status</div>
                <div className="stat-value text-lg">
                  {book.status === "deployed" ? (
                    <span className="badge badge-success badge-lg">Deployed</span>
                  ) : book.status === "failed" ? (
                    <span className="badge badge-error badge-lg">Failed</span>
                  ) : (
                    <span className="badge badge-warning badge-lg">Draft</span>
                  )}
                </div>
              </div>
              <div className="stat bg-base-200 rounded-lg">
                <div className="stat-title">Created</div>
                <div className="stat-value text-lg">
                  {new Date(book.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="stat bg-base-200 rounded-lg">
                <div className="stat-title">Last Deployed</div>
                <div className="stat-value text-lg">
                  {book.last_deployed_at
                    ? new Date(book.last_deployed_at).toLocaleDateString()
                    : "Never"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chapters Tab */}
        {activeTab === "chapters" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Chapters</h2>
              <button onClick={addChapter} className="btn btn-primary btn-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Chapter
              </button>
            </div>

            {chapters.length === 0 ? (
              <div className="text-center py-12 bg-base-200 rounded-lg">
                <div className="text-4xl mb-4">📚</div>
                <h3 className="font-bold text-lg mb-2">No chapters yet</h3>
                <p className="text-base-content/60 mb-4">Add your first chapter to get started</p>
                <button onClick={addChapter} className="btn btn-primary">
                  Add First Chapter
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {chapters.map((chapter, index) => (
                  <div
                    key={chapter.id}
                    className={`border rounded-lg ${
                      editingChapterId === chapter.id
                        ? "border-primary bg-primary/5"
                        : "border-base-300 hover:border-base-400"
                    }`}
                  >
                    {editingChapterId === chapter.id ? (
                      /* Editing Mode */
                      <div className="p-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="font-bold text-lg">
                            Editing Chapter {index + 1}
                          </h3>
                          <button
                            onClick={() => setEditingChapterId(null)}
                            className="btn btn-ghost btn-sm"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Close
                          </button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="form-control">
                            <label className="label">
                              <span className="label-text font-medium">Chapter Title</span>
                            </label>
                            <input
                              type="text"
                              value={chapter.title}
                              onChange={(e) => updateChapter(chapter.id, { title: e.target.value })}
                              className="input input-bordered w-full"
                              placeholder="Enter chapter title"
                            />
                          </div>
                          <div className="form-control">
                            <label className="label">
                              <span className="label-text font-medium">Target Word Count</span>
                            </label>
                            <input
                              type="number"
                              value={chapter.targetWordCount || 3000}
                              onChange={(e) =>
                                updateChapter(chapter.id, {
                                  targetWordCount: parseInt(e.target.value) || 3000,
                                })
                              }
                              className="input input-bordered w-full"
                              min={500}
                              step={500}
                            />
                          </div>
                        </div>

                        <div className="form-control">
                          <label className="label">
                            <span className="label-text font-medium">Description</span>
                          </label>
                          <textarea
                            value={chapter.description}
                            onChange={(e) =>
                              updateChapter(chapter.id, { description: e.target.value })
                            }
                            className="textarea textarea-bordered w-full"
                            placeholder="What does this chapter cover?"
                            rows={2}
                          />
                        </div>

                        {/* Content Section with Tabs */}
                        <div className="form-control">
                          <div className="flex items-center justify-between mb-2">
                            <label className="label py-0">
                              <span className="label-text font-medium">Chapter Content</span>
                              {(chapter.isGenerated || chapter.generatedContent) && (
                                <span className="badge badge-success badge-sm ml-2">
                                  AI Generated
                                </span>
                              )}
                            </label>
                            {/* Tab Buttons */}
                            <div className="tabs tabs-boxed tabs-sm bg-base-200">
                              <button
                                className={`tab tab-sm ${chapterPreviewTab === "source" ? "tab-active" : ""}`}
                                onClick={() => setChapterPreviewTab("source")}
                              >
                                <svg
                                  className="w-4 h-4 mr-1"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                                  />
                                </svg>
                                Source
                              </button>
                              <button
                                className={`tab tab-sm ${chapterPreviewTab === "preview" ? "tab-active" : ""}`}
                                onClick={() => setChapterPreviewTab("preview")}
                              >
                                <svg
                                  className="w-4 h-4 mr-1"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                                Preview
                              </button>
                            </div>
                          </div>

                          {/* Source Tab - Editable Textarea */}
                          {chapterPreviewTab === "source" && (
                            <textarea
                              value={getChapterContent(chapter)}
                              onChange={(e) => {
                                // If it had generatedContent, update that; otherwise update content
                                if (chapter.generatedContent !== undefined) {
                                  updateChapter(chapter.id, { generatedContent: e.target.value });
                                } else {
                                  updateChapter(chapter.id, { content: e.target.value });
                                }
                              }}
                              className="textarea textarea-bordered w-full font-mono text-sm h-80"
                              placeholder="Write your chapter content in MyST Markdown..."
                            />
                          )}

                          {/* Preview Tab - Rendered HTML */}
                          {chapterPreviewTab === "preview" && (
                            <div
                              className="border border-base-300 rounded-lg p-4 h-80 overflow-y-auto bg-base-100 prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{
                                __html: getChapterContent(chapter)
                                  ? mystToHtml(getChapterContent(chapter))
                                  : '<p class="text-base-content/50 italic">No content yet. Switch to Source tab to add content.</p>',
                              }}
                            />
                          )}

                          <label className="label">
                            <span className="label-text-alt text-base-content/60">
                              {chapterPreviewTab === "source"
                                ? "Edit MyST markdown source"
                                : "Preview of rendered content"}
                            </span>
                            <span className="label-text-alt">
                              {getChapterContent(chapter)
                                .split(/\s+/)
                                .filter(Boolean)
                                .length.toLocaleString()}{" "}
                              words
                            </span>
                          </label>
                        </div>

                        {/* AI Generation Controls */}
                        <div className="flex items-center gap-3 pt-4 border-t border-base-300 mt-4">
                          <button
                            onClick={() => generateChapterWithAI(chapter.id)}
                            disabled={isGeneratingChapter === chapter.id || !chapter.title}
                            className={`btn btn-secondary ${
                              isGeneratingChapter === chapter.id ? "loading" : ""
                            }`}
                          >
                            {isGeneratingChapter !== chapter.id && (
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                              </svg>
                            )}
                            {isGeneratingChapter === chapter.id
                              ? "Generating..."
                              : getChapterContent(chapter)
                              ? "Regenerate with AI"
                              : "Generate with AI"}
                          </button>
                          <button
                            onClick={() => setShowAISettings(!showAISettings)}
                            className="btn btn-ghost btn-sm"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            AI Settings
                          </button>
                          <div className="text-sm text-base-content/60">
                            Target: {(chapter.targetWordCount || 3000).toLocaleString()} words
                          </div>
                        </div>

                        {/* AI Settings Dropdown */}
                        {showAISettings && (
                          <div className="mt-4 p-4 bg-base-200 rounded-lg space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-sm">AI Configuration</h4>
                              <button
                                onClick={() => fetchModels()}
                                disabled={isLoadingModels}
                                className="btn btn-ghost btn-xs"
                                title="Refresh available models"
                              >
                                <svg
                                  className={`w-4 h-4 ${isLoadingModels ? "animate-spin" : ""}`}
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                  />
                                </svg>
                              </button>
                            </div>
                            <div className="grid md:grid-cols-3 gap-3">
                              <div className="form-control">
                                <label className="label py-1">
                                  <span className="label-text text-xs">Provider</span>
                                </label>
                                <select
                                  value={aiConfig.provider}
                                  onChange={(e) => {
                                    const newProvider = e.target.value as "claude" | "gemini" | "openai";
                                    const providerModels = availableModels[newProvider];
                                    setAiConfig({
                                      ...aiConfig,
                                      provider: newProvider,
                                      model: providerModels.length > 0 ? providerModels[0].id : "",
                                    });
                                    // Fetch models for new provider if not already loaded
                                    if (providerModels.length === 0) {
                                      fetchModels(newProvider);
                                    }
                                  }}
                                  className="select select-bordered select-sm w-full"
                                >
                                  <option value="claude">Claude (Anthropic)</option>
                                  <option value="openai">GPT-4 (OpenAI)</option>
                                  <option value="gemini">Gemini (Google)</option>
                                </select>
                              </div>
                              <div className="form-control">
                                <label className="label py-1">
                                  <span className="label-text text-xs">Model</span>
                                  {isLoadingModels && (
                                    <span className="loading loading-spinner loading-xs ml-2"></span>
                                  )}
                                </label>
                                <select
                                  value={aiConfig.model}
                                  onChange={(e) =>
                                    setAiConfig({ ...aiConfig, model: e.target.value })
                                  }
                                  className="select select-bordered select-sm w-full"
                                  disabled={isLoadingModels || availableModels[aiConfig.provider].length === 0}
                                >
                                  {availableModels[aiConfig.provider].length === 0 ? (
                                    <option value="">
                                      {isLoadingModels ? "Loading models..." : "No models available"}
                                    </option>
                                  ) : (
                                    availableModels[aiConfig.provider].map((model) => (
                                      <option key={model.id} value={model.id}>
                                        {model.name}
                                      </option>
                                    ))
                                  )}
                                </select>
                              </div>
                              <div className="form-control">
                                <label className="label py-1">
                                  <span className="label-text text-xs">API Key (optional)</span>
                                </label>
                                <input
                                  type="password"
                                  value={aiConfig.apiKey}
                                  onChange={(e) =>
                                    setAiConfig({ ...aiConfig, apiKey: e.target.value })
                                  }
                                  className="input input-bordered input-sm w-full"
                                  placeholder="Uses server key if empty"
                                />
                              </div>
                            </div>
                            <p className="text-xs text-base-content/50">
                              Leave API key empty to use the server&apos;s default API key. Models are fetched live from each provider.
                            </p>

                            {/* Chapter Features Section */}
                            <div className="divider my-2"></div>
                            <div className="flex items-center justify-between">
                              <button
                                onClick={() => setShowAIFeatures(!showAIFeatures)}
                                className="flex items-center gap-2 text-sm font-medium"
                              >
                                <svg
                                  className={`w-4 h-4 transition-transform ${showAIFeatures ? "rotate-90" : ""}`}
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                                Chapter Features
                                <span className="badge badge-sm badge-primary">
                                  {getChapterFeatureCount(chapter)}/48
                                </span>
                              </button>
                              <button
                                onClick={() => copyBookFeaturesToChapter(chapter.id)}
                                className="btn btn-ghost btn-xs"
                                title="Copy book-level features to this chapter"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Use Book Defaults
                              </button>
                            </div>

                            {showAIFeatures && (
                              <div className="mt-3 space-y-2 max-h-64 overflow-y-auto border border-base-300 rounded-lg p-2">
                                {featureCategories.map((category) => {
                                  const categoryFeatures = getFeaturesInCategory(category);
                                  const chapterFeatures = getChapterFeatures(chapter);
                                  const enabledCount = categoryFeatures.filter((f) => chapterFeatures[f]).length;
                                  const isExpanded = aiExpandedCategories.includes(category);

                                  return (
                                    <div key={category} className="border border-base-300 rounded overflow-hidden">
                                      <button
                                        onClick={() => toggleAiCategory(category)}
                                        className="w-full flex items-center justify-between p-2 bg-base-100 hover:bg-base-200 transition-colors text-xs"
                                      >
                                        <div className="flex items-center gap-2">
                                          <svg
                                            className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                          >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                          </svg>
                                          <span className="font-medium">{category}</span>
                                        </div>
                                        <span className="badge badge-xs">
                                          {enabledCount}/{categoryFeatures.length}
                                        </span>
                                      </button>

                                      {isExpanded && (
                                        <div className="p-2 grid grid-cols-2 gap-1 bg-base-50">
                                          {categoryFeatures.map((feature) => (
                                            <label
                                              key={feature}
                                              className={`cursor-pointer flex items-center gap-2 p-1.5 rounded text-xs ${
                                                chapterFeatures[feature]
                                                  ? "bg-primary/10"
                                                  : "hover:bg-base-200"
                                              }`}
                                            >
                                              <input
                                                type="checkbox"
                                                checked={chapterFeatures[feature]}
                                                onChange={() => toggleChapterFeature(chapter.id, feature)}
                                                className="checkbox checkbox-primary checkbox-xs"
                                              />
                                              <span className="truncate" title={featureDescriptions[feature].description}>
                                                {featureDescriptions[feature].label}
                                              </span>
                                            </label>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                            <p className="text-xs text-base-content/50 mt-2">
                              Select which MyST features the AI should use when generating this chapter.
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Display Mode */
                      <div className="flex items-center gap-4 p-4">
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => moveChapter(index, "up")}
                            disabled={index === 0}
                            className="btn btn-ghost btn-xs"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 15l7-7 7 7"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => moveChapter(index, "down")}
                            disabled={index === chapters.length - 1}
                            className="btn btn-ghost btn-xs"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </button>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="badge badge-ghost">{index + 1}</span>
                            <h3 className="font-semibold">{chapter.title}</h3>
                            {getChapterContent(chapter) ? (
                              <span className="badge badge-success badge-sm">
                                {getChapterContent(chapter)
                                  .split(/\s+/)
                                  .filter(Boolean)
                                  .length.toLocaleString()}{" "}
                                words
                              </span>
                            ) : (
                              <span className="badge badge-warning badge-sm">No content</span>
                            )}
                          </div>
                          <p className="text-sm text-base-content/60 mt-1 line-clamp-1">
                            {chapter.description || "No description"}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingChapterId(chapter.id);
                              setChapterPreviewTab("source");
                            }}
                            className="btn btn-ghost btn-sm"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => deleteChapter(chapter.id)}
                            className="btn btn-ghost btn-sm text-error"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Features Tab - All 48 features organized by category */}
        {activeTab === "features" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">Book Features</h2>
                <p className="text-base-content/60 text-sm">
                  {Object.values(features).filter(Boolean).length} of 48 features enabled
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setExpandedCategories(featureCategories)}
                  className="btn btn-ghost btn-sm"
                >
                  Expand All
                </button>
                <button onClick={() => setExpandedCategories([])} className="btn btn-ghost btn-sm">
                  Collapse All
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {featureCategories.map((category) => {
                const categoryFeatures = getFeaturesInCategory(category);
                const enabledCount = categoryFeatures.filter((f) => features[f]).length;
                const isExpanded = expandedCategories.includes(category);

                return (
                  <div key={category} className="border border-base-300 rounded-lg overflow-hidden">
                    {/* Category Header */}
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full flex items-center justify-between p-4 bg-base-200 hover:bg-base-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <svg
                          className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                        <span className="font-semibold">{category}</span>
                        <span className="badge badge-sm">
                          {enabledCount}/{categoryFeatures.length}
                        </span>
                      </div>
                    </button>

                    {/* Category Features */}
                    {isExpanded && (
                      <div className="p-4 grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {categoryFeatures.map((feature) => (
                          <label
                            key={feature}
                            className={`cursor-pointer border rounded-lg p-3 transition-all ${
                              features[feature]
                                ? "border-primary bg-primary/5"
                                : "border-base-300 hover:border-base-400"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <input
                                type="checkbox"
                                checked={features[feature]}
                                onChange={() => toggleFeature(feature)}
                                className="checkbox checkbox-primary checkbox-sm mt-0.5"
                              />
                              <div>
                                <div className="font-medium text-sm">
                                  {featureDescriptions[feature].label}
                                </div>
                                <div className="text-xs text-base-content/60">
                                  {featureDescriptions[feature].description}
                                </div>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 p-4 bg-base-200 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <svg
                  className="w-5 h-5 text-info"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-base-content/70">
                  Features affect AI content generation and the capabilities of your published book.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* GitHub Token Modal */}
      {showTokenInput && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Push to GitHub</h3>
            <p className="py-4 text-base-content/70">
              Enter your GitHub Personal Access Token to push updates to your repository.
            </p>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">GitHub Token</span>
              </label>
              <input
                type="password"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                className="input input-bordered w-full"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxxx"
              />
              <label className="label">
                <span className="label-text-alt text-base-content/60">
                  Token needs repo scope for write access
                </span>
              </label>
            </div>
            <div className="modal-action">
              <button
                onClick={() => {
                  setShowTokenInput(false);
                  setGithubToken("");
                }}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handlePushToGitHub}
                className={`btn btn-primary ${isPushing ? "loading" : ""}`}
                disabled={isPushing || !githubToken}
              >
                Push Updates
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop bg-black/50"
            onClick={() => {
              setShowTokenInput(false);
              setGithubToken("");
            }}
          ></div>
        </div>
      )}
    </div>
  );
}
