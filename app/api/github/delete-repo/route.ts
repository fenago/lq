import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const repoName = searchParams.get("repo");
    const username = searchParams.get("username") || "fenago";

    if (!repoName) {
      return NextResponse.json({ error: "Repository name is required" }, { status: 400 });
    }

    // Use provided token or fall back to server-side token for fenago repos
    const providedToken = searchParams.get("token");
    const serverToken = process.env.Github_PAT || process.env.GITHUB_PAT;

    // Use provided token if available, otherwise use server token for fenago repos
    const token = providedToken || (username.toLowerCase() === "fenago" ? serverToken : null);

    if (!token) {
      return NextResponse.json(
        { error: "GitHub token required for non-fenago repositories" },
        { status: 400 }
      );
    }

    // Delete the GitHub repository
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

    if (!response.ok && response.status !== 404) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.message || "Failed to delete GitHub repository" },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete repo error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete repository" },
      { status: 500 }
    );
  }
}
