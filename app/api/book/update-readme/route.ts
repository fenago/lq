import { NextRequest, NextResponse } from "next/server";

interface Chapter {
  id: string;
  title: string;
  description: string;
  content?: string;
}

interface BookConfig {
  title: string;
  description: string;
  author: string;
  chapters: Chapter[];
}

interface UpdateReadmeRequest {
  bookConfig: BookConfig;
  owner: string;
  repo: string;
  token: string;
}

// Generate README content
function generateReadme(bookConfig: BookConfig): string {
  return `# ${bookConfig.title}

${bookConfig.description}

**Author:** ${bookConfig.author}

## Chapters

${bookConfig.chapters.map((ch, i) => `${i + 1}. **${ch.title}** - ${ch.description}`).join("\n")}

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

// Get file SHA (needed for updates)
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
          Accept: "application/vnd.github.v3+json",
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

// Push file to GitHub
async function pushFileToGitHub(
  owner: string,
  repo: string,
  path: string,
  content: string,
  message: string,
  token: string,
  sha?: string
): Promise<{ success: boolean; error?: string }> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        content: Buffer.from(content).toString("base64"),
        ...(sha && { sha }),
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    return {
      success: false,
      error: error.message || `HTTP ${response.status}`,
    };
  }

  return { success: true };
}

export async function POST(request: NextRequest) {
  try {
    const body: UpdateReadmeRequest = await request.json();
    const { bookConfig, owner, repo, token } = body;

    // Validation
    if (!bookConfig || !owner || !repo || !token) {
      return NextResponse.json(
        { error: "Missing required fields: bookConfig, owner, repo, token" },
        { status: 400 }
      );
    }

    // Generate new README content
    const readmeContent = generateReadme(bookConfig);

    // Get existing file SHA (needed for updates)
    const sha = await getFileSha(owner, repo, "README.md", token);

    // Push updated README
    const result = await pushFileToGitHub(
      owner,
      repo,
      "README.md",
      readmeContent,
      "Update README with latest book information",
      token,
      sha || undefined
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to update README" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "README updated successfully",
    });
  } catch (error) {
    console.error("Error updating README:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
