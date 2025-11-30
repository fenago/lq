import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/libs/supabase-server";

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

interface MystFeatures {
  // Content
  admonitions: boolean;
  codeBlocks: boolean;
  mathEquations: boolean;
  mermaidDiagrams: boolean;
  figures: boolean;
  tables: boolean;
  blockquotes: boolean;
  // Layout
  cards: boolean;
  grids: boolean;
  // Typography
  asides: boolean;
  footnotes: boolean;
  abbreviations: boolean;
  smallcaps: boolean;
  subscriptSuperscript: boolean;
  underlineStrikethrough: boolean;
  keyboard: boolean;
  // Media
  videos: boolean;
  images: boolean;
  // Interactive
  exercises: boolean;
  dropdowns: boolean;
  tabs: boolean;
  glossary: boolean;
  buttons: boolean;
  // Academic
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
  // Execution
  executableCode: boolean;
  jupyterLite: boolean;
  binderIntegration: boolean;
  thebe: boolean;
  colabLinks: boolean;
  // Export
  pdfExport: boolean;
  wordExport: boolean;
  texExport: boolean;
  jatsExport: boolean;
  typstExport: boolean;
  markdownExport: boolean;
  // Navigation
  tableOfContents: boolean;
  crossReferences: boolean;
  citations: boolean;
  indexEntries: boolean;
  numberedReferences: boolean;
}

interface DeployRequest {
  bookConfig: {
    title: string;
    description: string;
    author: string;
    chapters: Chapter[];
  };
  features: MystFeatures;
  githubConfig: {
    username: string;
    repoName: string;
    token: string;
  };
  chapterContent?: Record<string, string>;
}

// Generate myst.yml configuration
function generateMystConfig(
  bookConfig: DeployRequest["bookConfig"],
  features: MystFeatures
): string {
  const config: Record<string, unknown> = {
    version: 1,
    project: {
      title: bookConfig.title,
      authors: [{ name: bookConfig.author }],
      description: bookConfig.description,
    },
    site: {
      template: "book-theme",
      title: bookConfig.title,
      options: {
        favicon: "favicon.ico",
        logo: "logo.png",
      },
    },
  };

  // Add feature-specific settings
  if (features.jupyterLite) {
    (config.project as Record<string, unknown>).jupyter = { lite: true };
  }

  if (features.thebe) {
    (config.project as Record<string, unknown>).thebe = { enable: true };
  }

  if (features.binderIntegration) {
    (config.project as Record<string, unknown>).binder = {
      url: "https://mybinder.org",
      repo: `${bookConfig.author}/${bookConfig.title.toLowerCase().replace(/\s+/g, "-")}`,
    };
  }

  // Convert to YAML-like format (simplified)
  // BASE_URL is set as environment variable in GitHub Actions workflow
  return `# MyST configuration for ${bookConfig.title}
version: 1

project:
  title: "${bookConfig.title}"
  description: "${bookConfig.description}"
  authors:
    - name: "${bookConfig.author}"
${features.jupyterLite ? "  jupyter:\n    lite: true" : ""}
${features.thebe ? "  thebe:\n    enable: true" : ""}
${features.binderIntegration ? `  binder:\n    url: https://mybinder.org` : ""}

site:
  template: book-theme
  title: "${bookConfig.title}"
  nav:
${bookConfig.chapters.map((ch, i) => `    - file: chapters/chapter-${i + 1}`).join("\n")}
`;
}

// Generate chapter markdown file
function generateChapterMarkdown(
  chapter: Chapter,
  index: number,
  features: MystFeatures,
  content?: string
): string {
  const chapterNum = index + 1;

  let md = `---
title: "${chapter.title}"
---

# ${chapter.title}

${chapter.description}

`;

  // Add placeholder content based on features
  if (content) {
    md += `${content}\n\n`;
  } else {
    md += `## Introduction

This chapter covers ${chapter.title.toLowerCase()}. Content will be added here.

`;
  }

  // Add feature examples based on selected features
  if (features.admonitions) {
    md += `
:::{note}
This is an important note for readers.
:::

`;
  }

  if (features.codeBlocks) {
    md += `
## Code Example

\`\`\`python
# Example code for ${chapter.title}
print("Hello from Chapter ${chapterNum}!")
\`\`\`

`;
  }

  if (features.mathEquations) {
    md += `
## Mathematical Concepts

Here's an example equation:

$$
f(x) = \\int_{-\\infty}^{\\infty} \\hat{f}(\\xi) e^{2\\pi i \\xi x} d\\xi
$$

`;
  }

  if (features.mermaidDiagrams) {
    md += `
## Diagram

\`\`\`{mermaid}
flowchart LR
    A[Start] --> B[Process]
    B --> C[End]
\`\`\`

`;
  }

  if (features.exercises) {
    md += `
## Exercises

:::{exercise}
:label: exercise-${chapterNum}-1

Practice exercise for this chapter. Try implementing what you learned!
:::

:::{solution} exercise-${chapterNum}-1
:class: dropdown

Here's the solution to the exercise.
:::

`;
  }

  if (features.dropdowns) {
    md += `
:::{dropdown} Additional Resources
:class: tip

Click to expand and see additional resources for this chapter.
:::

`;
  }

  // Layout Features
  if (features.cards && features.grids) {
    md += `
## Key Concepts

::::{grid} 2
:gutter: 3

:::{card} Concept 1
:header: First Key Point
Learn about the foundational concepts in this section.
:::

:::{card} Concept 2
:header: Second Key Point
Build on your knowledge with advanced topics.
:::

::::

`;
  } else if (features.cards) {
    md += `
:::{card} Key Takeaway
:header: Summary

This is a summary card highlighting the main points of Chapter ${chapterNum}.
:::

`;
  }

  // Typography Features
  if (features.asides) {
    md += `
:::{aside}
This is a sidenote that appears in the margin, perfect for supplementary information or definitions.
:::

`;
  }

  if (features.footnotes) {
    md += `
This sentence has a footnote[^fn${chapterNum}].

[^fn${chapterNum}]: This is footnote content for Chapter ${chapterNum}.

`;
  }

  if (features.abbreviations) {
    md += `
The {abbr}\`API (Application Programming Interface)\` provides methods for interacting with the system.

`;
  }

  // Media Features
  if (features.videos) {
    md += `
## Video Resources

:::{iframe} https://www.youtube.com/embed/dQw4w9WgXcQ
:width: 100%
Example embedded video placeholder - replace with your content.
:::

`;
  }

  // Academic Features
  if (features.proofs) {
    md += `
## Theoretical Foundation

:::{prf:theorem} Main Theorem
:label: thm-${chapterNum}

Every well-formed statement in this chapter can be proven using the axioms established in the introduction.
:::

:::{prf:proof}
The proof follows directly from the definitions. ∎
:::

:::{prf:definition} Key Term
:label: def-${chapterNum}

A **key term** is defined as a fundamental concept essential to understanding this chapter.
:::

`;
  }

  // Tabs feature
  if (features.tabs) {
    md += `
## Multi-Language Examples

::::{tab-set}

:::{tab-item} Python
\`\`\`python
def example():
    print("Python example")
\`\`\`
:::

:::{tab-item} JavaScript
\`\`\`javascript
function example() {
    console.log("JavaScript example");
}
\`\`\`
:::

::::

`;
  }

  // Glossary
  if (features.glossary) {
    md += `
## Glossary Terms

{term}\`algorithm\`
: A step-by-step procedure for solving a problem

{term}\`data structure\`
: A way of organizing and storing data

`;
  }

  // Citations
  if (features.citations) {
    md += `
## References

This content is based on established research {cite}\`smith2023\`.

`;
  }

  // Tables
  if (features.tables) {
    md += `
## Summary Table

| Concept | Description | Importance |
|---------|-------------|------------|
| Basics | Foundational knowledge | High |
| Advanced | Extended concepts | Medium |
| Practice | Hands-on exercises | High |

`;
  }

  // Figures
  if (features.figures) {
    md += `
:::{figure} https://via.placeholder.com/600x300
:name: fig-${chapterNum}
:align: center

Figure ${chapterNum}.1: Placeholder diagram for ${chapter.title}
:::

`;
  }

  // Blockquotes
  if (features.blockquotes) {
    md += `
:::{epigraph}
"The only way to do great work is to love what you do."

-- Steve Jobs
:::

`;
  }

  // Typography: Small Caps
  if (features.smallcaps) {
    md += `
The {sc}\`United Nations\` was founded in 1945.

`;
  }

  // Typography: Subscript & Superscript
  if (features.subscriptSuperscript) {
    md += `
Water is H{sub}\`2\`O. Einstein's famous equation is E=mc{sup}\`2\`.

`;
  }

  // Typography: Underline & Strikethrough
  if (features.underlineStrikethrough) {
    md += `
This text is {u}\`underlined\` and this is {del}\`strikethrough\`.

`;
  }

  // Typography: Keyboard
  if (features.keyboard) {
    md += `
Press {kbd}\`Ctrl+C\` to copy and {kbd}\`Ctrl+V\` to paste.

`;
  }

  // Images (standalone)
  if (features.images) {
    md += `
:::{image} https://via.placeholder.com/400x200
:alt: Placeholder image
:align: center
:::

`;
  }

  // Buttons
  if (features.buttons) {
    md += `
{button-link}\`https://liquidbooks.io [Learn More About LiquidBooks]\`

`;
  }

  // SI Units
  if (features.siUnits) {
    md += `
The speed of light is approximately {si}\`3e8 m/s\`. Water boils at {si}\`100 degC\`.

`;
  }

  // Chemical Formulas
  if (features.chemicalFormulas) {
    md += `
Sulfuric acid has the formula {chem}\`H2SO4\`. The combustion of methane:

{chem}\`CH4 + 2O2 -> CO2 + 2H2O\`

`;
  }

  // External References: Wikipedia
  if (features.wikipediaLinks) {
    md += `
Learn more about [Machine Learning](wiki:Machine_learning) on Wikipedia.

`;
  }

  // External References: GitHub
  if (features.githubLinks) {
    md += `
Check out the [LiquidBooks](https://liquidbooks.io) platform for more information.

`;
  }

  // External References: DOI
  if (features.doiLinks) {
    md += `
This research is published at <doi:10.1000/xyz123>.

`;
  }

  // External References: RRID
  if (features.rridLinks) {
    md += `
The antibody used was RRID:AB_123456.

`;
  }

  // External References: ROR
  if (features.rorLinks) {
    md += `
This research was conducted at [MIT](ror:042nb2s44).

`;
  }

  // External References: Intersphinx
  if (features.intersphinx) {
    md += `
See the Python documentation for {py:func}\`print\` and {py:class}\`list\`.

`;
  }

  // Advanced: Include Files
  if (features.includeFiles) {
    md += `
\`\`\`{literalinclude} /path/to/example.py
:language: python
:linenos:
:caption: Example code from external file
\`\`\`

`;
  }

  // Advanced: Eval Expressions
  if (features.evalExpressions) {
    md += `
The current chapter number is {eval}\`${chapterNum}\`.

`;
  }

  // Colab Links
  if (features.colabLinks) {
    md += `
[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/username/repo/blob/main/notebooks/chapter${chapterNum}.ipynb)

`;
  }

  // Index Entries
  if (features.indexEntries) {
    md += `
{index}\`single: ${chapter.title}\`
{index}\`pair: programming; ${chapter.title}\`

`;
  }

  // Numbered References
  if (features.numberedReferences) {
    md += `
As shown in {numref}\`fig-${chapterNum}\` and discussed in {ref}\`thm-${chapterNum}\`.

`;
  }

  return md;
}

// Generate GitHub Actions workflow for MyST build
function generateGitHubWorkflow(): string {
  return `# This workflow builds and deploys a MyST book to GitHub Pages
name: Deploy MyST Book to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  # BASE_URL determines the website path, required for GitHub Pages subdirectory hosting
  BASE_URL: /\${{ github.event.repository.name }}

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Pages
        uses: actions/configure-pages@v3

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18.x'

      - name: Install MyST Markdown
        run: npm install -g mystmd

      - name: Build HTML Assets
        run: myst build --html

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: '_build/html'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
`;
}

// Generate README
function generateReadme(bookConfig: DeployRequest["bookConfig"]): string {
  return `# ${bookConfig.title}

${bookConfig.description}

**Author:** ${bookConfig.author}

## Chapters

${bookConfig.chapters.map((ch, i) => `${i + 1}. ${ch.title}`).join("\n")}

## Building Locally

\`\`\`bash
# Install MyST
npm install -g mystmd

# Start development server
myst start

# Build for production
myst build --html
\`\`\`

---

Built with [LiquidBooks](https://liquidbooks.tech) - Create beautiful, interactive eBooks with AI.
`;
}

// Sanitize description for GitHub API (remove control characters)
function sanitizeDescription(description: string): string {
  // Remove control characters and limit length
  return description
    .replace(/[\x00-\x1F\x7F]/g, ' ')  // Replace control chars with space
    .replace(/\s+/g, ' ')              // Collapse multiple spaces
    .trim()
    .slice(0, 350);                     // GitHub limit is ~350 chars
}

// GitHub API helper functions
async function createRepo(
  username: string,
  repoName: string,
  token: string,
  description: string
): Promise<{ success: boolean; error?: string }> {
  const sanitizedDescription = sanitizeDescription(description || "");
  console.log("Creating repo with sanitized description:", JSON.stringify(sanitizedDescription));

  const response = await fetch("https://api.github.com/user/repos", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({
      name: repoName,
      description: sanitizedDescription,
      private: false,
      auto_init: false,
      has_issues: true,
      has_projects: false,
      has_wiki: false,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("GitHub repo creation failed:", {
      status: response.status,
      error: JSON.stringify(error, null, 2),
    });
    if (response.status === 422 && error.errors?.[0]?.message?.includes("already exists")) {
      // Repo already exists, that's okay
      return { success: true };
    }
    // Provide more detailed error message
    const errorMsg = error.message || error.errors?.[0]?.message || `Failed to create repository (HTTP ${response.status})`;
    return { success: false, error: errorMsg };
  }

  return { success: true };
}

async function createOrUpdateFile(
  username: string,
  repoName: string,
  token: string,
  path: string,
  content: string,
  message: string,
  sha?: string
): Promise<{ success: boolean; sha?: string; error?: string }> {
  const url = `https://api.github.com/repos/${username}/${repoName}/contents/${path}`;

  // First, try to get the existing file to get its SHA
  let existingSha = sha;
  if (!existingSha) {
    const getResponse = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    });
    if (getResponse.ok) {
      const data = await getResponse.json();
      existingSha = data.sha;
    }
  }

  const body: Record<string, string> = {
    message,
    content: Buffer.from(content).toString("base64"),
  };

  if (existingSha) {
    body.sha = existingSha;
  }

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    return { success: false, error: error.message || `Failed to create ${path}` };
  }

  const data = await response.json();
  return { success: true, sha: data.content?.sha };
}

async function enableGitHubPages(
  username: string,
  repoName: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  const response = await fetch(
    `https://api.github.com/repos/${username}/${repoName}/pages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({
        build_type: "workflow",
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    // Pages might already be enabled
    if (response.status === 409) {
      return { success: true };
    }
    return { success: false, error: error.message || "Failed to enable GitHub Pages" };
  }

  return { success: true };
}

// Get GitHub username from token
async function getGitHubUsername(token: string): Promise<string | null> {
  try {
    const response = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    });
    if (response.ok) {
      const data = await response.json();
      return data.login;
    }
    console.error("Failed to get GitHub user:", await response.text());
    return null;
  } catch (error) {
    console.error("Error getting GitHub user:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: DeployRequest = await request.json();
    const { bookConfig, features, githubConfig, chapterContent } = body;

    // Use token from request or fall back to env variable
    const token = githubConfig.token || process.env.Github_PAT || process.env.GITHUB_PAT;
    const repoName = githubConfig.repoName;

    if (!token) {
      return NextResponse.json(
        { error: "GitHub token is required. Provide one or set GITHUB_PAT in .env" },
        { status: 400 }
      );
    }

    if (!repoName) {
      return NextResponse.json(
        { error: "Repository name is required" },
        { status: 400 }
      );
    }

    // Get username from request or auto-detect from token
    let username = githubConfig.username;
    if (!username) {
      username = await getGitHubUsername(token) || "";
      if (!username) {
        return NextResponse.json(
          { error: "Could not determine GitHub username from token. Please provide it manually." },
          { status: 400 }
        );
      }
      console.log("Auto-detected GitHub username:", username);
    }

    if (!bookConfig.title || bookConfig.chapters.length === 0) {
      return NextResponse.json(
        { error: "Book must have a title and at least one chapter" },
        { status: 400 }
      );
    }

    const steps: { step: string; status: "pending" | "success" | "error"; error?: string }[] = [];

    // Step 1: Create repository
    const repoResult = await createRepo(username, repoName, token, bookConfig.description);
    steps.push({
      step: "Creating repository",
      status: repoResult.success ? "success" : "error",
      error: repoResult.error,
    });

    if (!repoResult.success) {
      return NextResponse.json({ steps, error: repoResult.error }, { status: 500 });
    }

    // Small delay to ensure repo is ready
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Step 2: Create myst.yml
    const mystConfig = generateMystConfig(bookConfig, features);
    const mystResult = await createOrUpdateFile(
      username,
      repoName,
      token,
      "myst.yml",
      mystConfig,
      "Add MyST configuration"
    );
    steps.push({
      step: "Creating myst.yml",
      status: mystResult.success ? "success" : "error",
      error: mystResult.error,
    });

    // Step 3: Create README
    const readme = generateReadme(bookConfig);
    const readmeResult = await createOrUpdateFile(
      username,
      repoName,
      token,
      "README.md",
      readme,
      "Add README"
    );
    steps.push({
      step: "Creating README.md",
      status: readmeResult.success ? "success" : "error",
      error: readmeResult.error,
    });

    // Step 4: Create chapter files
    for (let i = 0; i < bookConfig.chapters.length; i++) {
      const chapter = bookConfig.chapters[i];
      const chapterMd = generateChapterMarkdown(
        chapter,
        i,
        features,
        chapterContent?.[chapter.id]
      );
      const chapterResult = await createOrUpdateFile(
        username,
        repoName,
        token,
        `chapters/chapter-${i + 1}.md`,
        chapterMd,
        `Add chapter ${i + 1}: ${chapter.title}`
      );
      steps.push({
        step: `Creating chapter ${i + 1}`,
        status: chapterResult.success ? "success" : "error",
        error: chapterResult.error,
      });
    }

    // Step 5: Create GitHub Actions workflow
    const workflow = generateGitHubWorkflow();
    const workflowResult = await createOrUpdateFile(
      username,
      repoName,
      token,
      ".github/workflows/deploy.yml",
      workflow,
      "Add GitHub Actions workflow for MyST deployment"
    );
    steps.push({
      step: "Creating GitHub Actions workflow",
      status: workflowResult.success ? "success" : "error",
      error: workflowResult.error,
    });

    // Step 6: Enable GitHub Pages
    const pagesResult = await enableGitHubPages(username, repoName, token);
    steps.push({
      step: "Enabling GitHub Pages",
      status: pagesResult.success ? "success" : "error",
      error: pagesResult.error,
    });

    const allSuccessful = steps.every((s) => s.status === "success");
    const deployUrl = `https://${username}.github.io/${repoName}`;
    const repoUrl = `https://github.com/${username}/${repoName}`;

    // Save book to database if deployment was successful
    if (allSuccessful) {
      try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // Check if book already exists (update) or create new
          const { data: existingBook } = await supabase
            .from("user_books")
            .select("id")
            .eq("user_id", user.id)
            .eq("github_repo_name", repoName)
            .eq("github_username", username)
            .single();

          if (existingBook) {
            // Update existing book
            await supabase
              .from("user_books")
              .update({
                title: bookConfig.title,
                description: bookConfig.description || null,
                chapters: bookConfig.chapters,
                features: features,
                status: "deployed",
                github_pages_url: deployUrl,
                github_repo_url: repoUrl,
                last_deployed_at: new Date().toISOString(),
              })
              .eq("id", existingBook.id);
          } else {
            // Create new book
            await supabase.from("user_books").insert({
              user_id: user.id,
              title: bookConfig.title,
              description: bookConfig.description || null,
              github_repo_name: repoName,
              github_repo_url: repoUrl,
              github_pages_url: deployUrl,
              github_username: username,
              chapters: bookConfig.chapters,
              features: features,
              status: "deployed",
              last_deployed_at: new Date().toISOString(),
            });
          }
        }
      } catch (dbError) {
        console.error("Failed to save book to database:", dbError);
        // Don't fail the deployment if database save fails
      }
    }

    return NextResponse.json({
      success: allSuccessful,
      steps,
      deployUrl,
      repoUrl,
      message: allSuccessful
        ? "Book deployed successfully! It may take a few minutes for GitHub Pages to build."
        : "Deployment completed with some errors.",
    });
  } catch (error) {
    console.error("Deployment error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Deployment failed" },
      { status: 500 }
    );
  }
}
