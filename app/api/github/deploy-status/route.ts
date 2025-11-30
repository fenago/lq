import { NextRequest, NextResponse } from "next/server";

interface WorkflowRun {
  id: number;
  name: string;
  status: "queued" | "in_progress" | "completed" | "waiting";
  conclusion: "success" | "failure" | "cancelled" | "skipped" | null;
  created_at: string;
  updated_at: string;
  html_url: string;
  run_started_at: string | null;
}

interface DeploymentStatus {
  pushStatus: "success" | "error" | "unknown";
  buildStatus: "queued" | "building" | "success" | "failed" | "not_started";
  buildProgress?: string;
  buildUrl?: string;
  pagesUrl?: string;
  lastUpdated: string;
  estimatedTimeRemaining?: string;
  message: string;
}

export async function GET(request: NextRequest) {
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
    // Get the latest workflow runs
    const runsResponse = await fetch(
      `https://api.github.com/repos/${username}/${repoName}/actions/runs?per_page=5`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    if (!runsResponse.ok) {
      if (runsResponse.status === 404) {
        return NextResponse.json({
          pushStatus: "unknown",
          buildStatus: "not_started",
          message: "Repository not found or no workflows configured yet",
          lastUpdated: new Date().toISOString(),
        } as DeploymentStatus);
      }
      throw new Error(`GitHub API error: ${runsResponse.status}`);
    }

    const runsData = await runsResponse.json();
    const runs: WorkflowRun[] = runsData.workflow_runs || [];

    // Find the most recent MyST deploy workflow
    const mystRun = runs.find(
      (run) =>
        run.name.toLowerCase().includes("myst") ||
        run.name.toLowerCase().includes("deploy") ||
        run.name.toLowerCase().includes("pages")
    );

    if (!mystRun) {
      return NextResponse.json({
        pushStatus: "success",
        buildStatus: "not_started",
        message: "Content pushed successfully. No build workflow found yet - it may take a moment to trigger.",
        lastUpdated: new Date().toISOString(),
        pagesUrl: `https://${username}.github.io/${repoName}`,
      } as DeploymentStatus);
    }

    // Determine build status
    let buildStatus: DeploymentStatus["buildStatus"];
    let message: string;
    let estimatedTimeRemaining: string | undefined;

    switch (mystRun.status) {
      case "queued":
        buildStatus = "queued";
        message = "Build is queued and waiting to start...";
        estimatedTimeRemaining = "2-3 minutes";
        break;
      case "in_progress":
        buildStatus = "building";
        message = "Building your book...";
        estimatedTimeRemaining = "1-2 minutes";
        break;
      case "waiting":
        buildStatus = "queued";
        message = "Waiting for resources to become available...";
        estimatedTimeRemaining = "2-3 minutes";
        break;
      case "completed":
        if (mystRun.conclusion === "success") {
          buildStatus = "success";
          message = "Your book has been built and deployed successfully!";
        } else if (mystRun.conclusion === "failure") {
          buildStatus = "failed";
          message = "Build failed. Check the workflow logs for details.";
        } else {
          buildStatus = "failed";
          message = `Build ${mystRun.conclusion || "ended"}.`;
        }
        break;
      default:
        buildStatus = "queued";
        message = "Checking build status...";
    }

    // Calculate time since build started
    let buildProgress: string | undefined;
    if (mystRun.run_started_at) {
      const startTime = new Date(mystRun.run_started_at).getTime();
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - startTime) / 1000);

      if (elapsedSeconds < 60) {
        buildProgress = `${elapsedSeconds} seconds`;
      } else {
        buildProgress = `${Math.floor(elapsedSeconds / 60)} min ${elapsedSeconds % 60} sec`;
      }
    }

    const status: DeploymentStatus = {
      pushStatus: "success",
      buildStatus,
      buildProgress,
      buildUrl: mystRun.html_url,
      pagesUrl: `https://${username}.github.io/${repoName}`,
      lastUpdated: mystRun.updated_at,
      estimatedTimeRemaining,
      message,
    };

    return NextResponse.json(status);
  } catch (error) {
    console.error("Error checking deploy status:", error);
    return NextResponse.json(
      {
        pushStatus: "unknown",
        buildStatus: "not_started",
        message: error instanceof Error ? error.message : "Failed to check deployment status",
        lastUpdated: new Date().toISOString(),
      } as DeploymentStatus,
      { status: 500 }
    );
  }
}
