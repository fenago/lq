import { NextRequest, NextResponse } from "next/server";

interface Chapter {
  id: string;
  title: string;
  description: string;
  targetWordCount?: number;
  content?: string;
  generatedContent?: string;
  isGenerated?: boolean;
}

interface BookConfig {
  title: string;
  description: string;
  author: string;
  chapters: Chapter[];
  targetWordCount?: number;
}

interface MystFeatures {
  admonitions: boolean;
  codeBlocks: boolean;
  mathEquations: boolean;
  [key: string]: boolean;
}

interface PreviewRequest {
  bookConfig: BookConfig;
  features: MystFeatures;
}

// Convert MyST-like markdown to basic HTML for preview
function mystToHtml(content: string): string {
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
    '<div class="bg-blue-50 border-l-4 border-blue-500 p-4 my-4"><strong class="text-blue-700">Note:</strong><div class="text-blue-900">$1</div></div>'
  );
  html = html.replace(
    /:::\{tip\}\n([\s\S]*?):::/g,
    '<div class="bg-green-50 border-l-4 border-green-500 p-4 my-4"><strong class="text-green-700">Tip:</strong><div class="text-green-900">$1</div></div>'
  );
  html = html.replace(
    /:::\{warning\}\n([\s\S]*?):::/g,
    '<div class="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-4"><strong class="text-yellow-700">Warning:</strong><div class="text-yellow-900">$1</div></div>'
  );
  html = html.replace(
    /:::\{danger\}\n([\s\S]*?):::/g,
    '<div class="bg-red-50 border-l-4 border-red-500 p-4 my-4"><strong class="text-red-700">Danger:</strong><div class="text-red-900">$1</div></div>'
  );

  // Dropdowns
  html = html.replace(
    /:::\{dropdown\}\s*(.+)\n([\s\S]*?):::/g,
    '<details class="my-4 border rounded-lg"><summary class="p-3 bg-gray-100 cursor-pointer font-medium">$1</summary><div class="p-4">$2</div></details>'
  );

  // Code blocks
  html = html.replace(
    /```(\w+)?\n([\s\S]*?)```/g,
    '<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg my-4 overflow-x-auto"><code class="language-$1">$2</code></pre>'
  );

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 rounded text-sm">$1</code>');

  // Bold and italic
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Links
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" class="text-blue-600 hover:underline" target="_blank">$1</a>'
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
    '<div class="bg-gray-50 p-4 my-4 text-center font-mono">$1</div>'
  );
  html = html.replace(/\$([^$]+)\$/g, '<span class="font-mono bg-gray-50 px-1">$1</span>');

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
}

// Generate preview HTML
function generatePreviewHtml(bookConfig: BookConfig): string {
  const chapters = bookConfig.chapters
    .map((chapter, index) => {
      const content = chapter.generatedContent || chapter.content || "";
      const wordCount = content.split(/\s+/).filter(Boolean).length;

      if (!content) {
        return `
          <div class="border-l-4 border-gray-300 pl-4 py-2 my-6">
            <h2 class="text-xl font-bold text-gray-400">Chapter ${index + 1}: ${chapter.title}</h2>
            <p class="text-gray-400 italic">Content not yet generated</p>
          </div>
        `;
      }

      return `
        <article class="chapter my-8 pb-8 border-b border-gray-200">
          <div class="flex justify-between items-center mb-4">
            <span class="text-sm text-gray-500">Chapter ${index + 1}</span>
            <span class="text-sm text-gray-500">${wordCount.toLocaleString()} words</span>
          </div>
          <div class="prose max-w-none">
            ${mystToHtml(content)}
          </div>
        </article>
      `;
    })
    .join("");

  const totalWords = bookConfig.chapters.reduce((sum, ch) => {
    const content = ch.generatedContent || ch.content || "";
    return sum + content.split(/\s+/).filter(Boolean).length;
  }, 0);

  return `
    <div class="book-preview font-sans">
      <!-- Book Header -->
      <header class="text-center py-8 border-b border-gray-200 mb-8">
        <h1 class="text-3xl font-bold text-gray-900">${bookConfig.title}</h1>
        <p class="text-lg text-gray-600 mt-2">by ${bookConfig.author}</p>
        <p class="text-gray-500 mt-4 max-w-2xl mx-auto">${bookConfig.description}</p>
        <div class="mt-4 text-sm text-gray-400">
          ${bookConfig.chapters.length} chapters · ${totalWords.toLocaleString()} words
        </div>
      </header>

      <!-- Table of Contents -->
      <nav class="mb-8 p-4 bg-gray-50 rounded-lg">
        <h2 class="text-lg font-bold mb-3">Table of Contents</h2>
        <ol class="list-decimal list-inside space-y-1">
          ${bookConfig.chapters
            .map(
              (ch, i) =>
                `<li class="text-gray-700 hover:text-blue-600 cursor-pointer">${ch.title}</li>`
            )
            .join("")}
        </ol>
      </nav>

      <!-- Chapters -->
      <main>
        ${chapters}
      </main>

      <!-- Footer -->
      <footer class="text-center py-8 text-gray-400 text-sm">
        <p>Built with <a href="https://liquidbooks.tech" class="text-blue-400 hover:text-blue-300">LiquidBooks</a></p>
      </footer>
    </div>
  `;
}

export async function POST(request: NextRequest) {
  try {
    const body: PreviewRequest = await request.json();
    const { bookConfig } = body;

    if (!bookConfig) {
      return NextResponse.json(
        { error: "Book configuration is required" },
        { status: 400 }
      );
    }

    const html = generatePreviewHtml(bookConfig);

    return NextResponse.json({ html });
  } catch (error) {
    console.error("Error generating preview:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate preview" },
      { status: 500 }
    );
  }
}
