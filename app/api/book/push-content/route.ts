import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/libs/supabase-server";

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
  [key: string]: boolean;
}

interface GitHubConfig {
  username: string;
  repoName: string;
  token?: string;
}

interface PushContentRequest {
  bookConfig: BookConfig;
  features: MystFeatures;
  githubConfig: GitHubConfig;
}

// Generate chapter filename
function getChapterFilename(index: number, title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
  return `chapter-${String(index + 1).padStart(2, "0")}-${slug}.md`;
}

// Create chapter content with frontmatter
function createChapterContent(chapter: Chapter, index: number): string {
  const content = chapter.generatedContent || chapter.content || "";

  // If content already has a title, use it as-is
  if (content.trim().startsWith("# ")) {
    return content;
  }

  // Otherwise, add the title
  return `# ${chapter.title}

${content}
`;
}

// Update _toc.yml with chapter files
function generateTocYaml(bookConfig: BookConfig): string {
  const chapters = bookConfig.chapters.map((chapter, index) => {
    const filename = getChapterFilename(index, chapter.title).replace(".md", "");
    return `  - file: ${filename}`;
  });

  return `format: jb-book
root: intro
chapters:
${chapters.join("\n")}
`;
}

// Push file to GitHub
async function pushFileToGitHub(
  owner: string,
  repo: string,
  path: string,
  content: string,
  message: string,
  token: string,
  existingSha?: string
): Promise<{ success: boolean; sha?: string; error?: string }> {
  try {
    const base64Content = Buffer.from(content).toString("base64");

    const body: {
      message: string;
      content: string;
      sha?: string;
    } = {
      message,
      content: base64Content,
    };

    if (existingSha) {
      body.sha = existingSha;
    }

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.message };
    }

    const data = await response.json();
    return { success: true, sha: data.content.sha };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Get file SHA if it exists
async function getFileSha(
  owner: string,
  repo: string,
  path: string,
  token: string
): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data.sha;
    }

    return null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: PushContentRequest = await request.json();
    const { bookConfig, githubConfig } = body;

    // Get token
    const token =
      githubConfig.token ||
      process.env.Github_PAT ||
      process.env.GITHUB_PAT;

    if (!token) {
      return NextResponse.json(
        { error: "GitHub token is required" },
        { status: 400 }
      );
    }

    const owner = githubConfig.username || "fenago";
    const repo = githubConfig.repoName;

    if (!repo) {
      return NextResponse.json(
        { error: "Repository name is required" },
        { status: 400 }
      );
    }

    const results: { file: string; status: string; error?: string }[] = [];

    // Push each chapter
    for (let i = 0; i < bookConfig.chapters.length; i++) {
      const chapter = bookConfig.chapters[i];
      const filename = getChapterFilename(i, chapter.title);
      const content = createChapterContent(chapter, i);

      // Get existing SHA if file exists
      const existingSha = await getFileSha(owner, repo, filename, token);

      const result = await pushFileToGitHub(
        owner,
        repo,
        filename,
        content,
        `Update ${chapter.title}`,
        token,
        existingSha || undefined
      );

      results.push({
        file: filename,
        status: result.success ? "success" : "error",
        error: result.error,
      });
    }

    // Update _toc.yml
    const tocContent = generateTocYaml(bookConfig);
    const tocSha = await getFileSha(owner, repo, "_toc.yml", token);
    const tocResult = await pushFileToGitHub(
      owner,
      repo,
      "_toc.yml",
      tocContent,
      "Update table of contents",
      token,
      tocSha || undefined
    );

    results.push({
      file: "_toc.yml",
      status: tocResult.success ? "success" : "error",
      error: tocResult.error,
    });

    // Update intro.md with book description
    const introContent = `# ${bookConfig.title}

${bookConfig.description}

## About This Book

**Author:** ${bookConfig.author}

This book contains ${bookConfig.chapters.length} chapters covering the following topics:

${bookConfig.chapters.map((ch, i) => `${i + 1}. **${ch.title}** - ${ch.description}`).join("\n")}

---

*Built with [LiquidBooks](https://liquidbooks.tech) - Create beautiful, interactive eBooks with AI.*
`;

    const introSha = await getFileSha(owner, repo, "intro.md", token);
    const introResult = await pushFileToGitHub(
      owner,
      repo,
      "intro.md",
      introContent,
      "Update introduction",
      token,
      introSha || undefined
    );

    results.push({
      file: "intro.md",
      status: introResult.success ? "success" : "error",
      error: introResult.error,
    });

    // Check if all succeeded
    const allSuccess = results.every((r) => r.status === "success");

    // Update chapters in database if push was successful
    if (allSuccess) {
      try {
        const supabase = await createServerSupabaseClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // Find the book by repo name and update chapters
          const { data: existingBook } = await supabase
            .from("user_books")
            .select("id")
            .eq("github_repo_name", repo)
            .eq("github_username", owner)
            .single();

          if (existingBook) {
            await supabase
              .from("user_books")
              .update({
                title: bookConfig.title,
                description: bookConfig.description || null,
                chapters: bookConfig.chapters,
                updated_at: new Date().toISOString(),
                last_deployed_at: new Date().toISOString(),
              })
              .eq("id", existingBook.id);
          }
        }
      } catch (dbError) {
        console.error("Failed to update book in database:", dbError);
        // Don't fail the push if database update fails
      }
    }

    return NextResponse.json({
      success: allSuccess,
      message: allSuccess
        ? "Content pushed successfully! GitHub Actions will rebuild your book."
        : "Some files failed to push",
      results,
      deployUrl: `https://${owner}.github.io/${repo}`,
      repoUrl: `https://github.com/${owner}/${repo}`,
    });
  } catch (error) {
    console.error("Error pushing content:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to push content" },
      { status: 500 }
    );
  }
}
