import { NextRequest, NextResponse } from "next/server";

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  homepage: string | null;
  has_pages: boolean;
}

// GET: List repositories for a user
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const username = searchParams.get("username") || "fenago";
  const token = searchParams.get("token") || process.env.Github_PAT || process.env.GITHUB_PAT;

  if (!token) {
    return NextResponse.json(
      { error: "GitHub token is required" },
      { status: 400 }
    );
  }

  try {
    // Fetch repos for the authenticated user
    const response = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.message || "Failed to fetch repositories" },
        { status: response.status }
      );
    }

    const repos: GitHubRepo[] = await response.json();

    // Return simplified repo data
    const simplifiedRepos = repos.map((repo) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      url: repo.html_url,
      description: repo.description,
      createdAt: repo.created_at,
      updatedAt: repo.updated_at,
      pagesUrl: repo.has_pages ? `https://${username}.github.io/${repo.name}` : null,
      hasPages: repo.has_pages,
    }));

    return NextResponse.json({ repos: simplifiedRepos });
  } catch (error) {
    console.error("Error fetching repos:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch repositories" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a repository
export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const repoName = searchParams.get("repo");
  const username = searchParams.get("username") || "fenago";
  const token = searchParams.get("token") || process.env.Github_PAT || process.env.GITHUB_PAT;

  if (!token) {
    return NextResponse.json(
      { error: "GitHub token is required" },
      { status: 400 }
    );
  }

  if (!repoName) {
    return NextResponse.json(
      { error: "Repository name is required" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${username}/${repoName}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    if (!response.ok) {
      // 404 means repo doesn't exist, which is fine
      if (response.status === 404) {
        return NextResponse.json({ success: true, message: "Repository not found or already deleted" });
      }
      const error = await response.json();
      return NextResponse.json(
        { error: error.message || "Failed to delete repository" },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, message: `Repository ${repoName} deleted successfully` });
  } catch (error) {
    console.error("Error deleting repo:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete repository" },
      { status: 500 }
    );
  }
}
