import { NextRequest, NextResponse } from "next/server";

type AIProvider = "claude" | "gemini" | "openai";

interface Model {
  id: string;
  name: string;
  description?: string;
}

interface ModelsResponse {
  provider: AIProvider;
  models: Model[];
  error?: string;
}

// Fetch Claude models from Anthropic API
async function fetchClaudeModels(apiKey: string): Promise<Model[]> {
  try {
    const response = await fetch("https://api.anthropic.com/v1/models", {
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
    });

    if (!response.ok) {
      console.error("Claude models API error:", await response.text());
      return getDefaultClaudeModels();
    }

    const data = await response.json();

    // Filter and format models - focus on chat models
    const models: Model[] = data.data
      ?.filter((model: { id: string }) =>
        model.id.includes("claude") &&
        !model.id.includes("instant") // Exclude older instant models
      )
      .map((model: { id: string; display_name?: string }) => ({
        id: model.id,
        name: model.display_name || formatModelName(model.id),
      }))
      .sort((a: Model, b: Model) => {
        // Sort by version (newer first)
        return b.id.localeCompare(a.id);
      })
      .slice(0, 10); // Limit to top 10 models

    return models.length > 0 ? models : getDefaultClaudeModels();
  } catch (error) {
    console.error("Error fetching Claude models:", error);
    return getDefaultClaudeModels();
  }
}

// Fetch Gemini models from Google API
async function fetchGeminiModels(apiKey: string): Promise<Model[]> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );

    if (!response.ok) {
      console.error("Gemini models API error:", await response.text());
      return getDefaultGeminiModels();
    }

    const data = await response.json();

    // Filter for generative models that support generateContent
    const models: Model[] = data.models
      ?.filter((model: { name: string; supportedGenerationMethods?: string[] }) =>
        model.supportedGenerationMethods?.includes("generateContent") &&
        model.name.includes("gemini")
      )
      .map((model: { name: string; displayName?: string; description?: string }) => ({
        id: model.name.replace("models/", ""),
        name: model.displayName || formatModelName(model.name),
        description: model.description,
      }))
      .sort((a: Model, b: Model) => {
        // Prioritize newer/pro models
        if (a.id.includes("2.0") && !b.id.includes("2.0")) return -1;
        if (!a.id.includes("2.0") && b.id.includes("2.0")) return 1;
        if (a.id.includes("pro") && !b.id.includes("pro")) return -1;
        if (!a.id.includes("pro") && b.id.includes("pro")) return 1;
        return a.id.localeCompare(b.id);
      })
      .slice(0, 10);

    return models.length > 0 ? models : getDefaultGeminiModels();
  } catch (error) {
    console.error("Error fetching Gemini models:", error);
    return getDefaultGeminiModels();
  }
}

// Fetch OpenAI models
async function fetchOpenAIModels(apiKey: string): Promise<Model[]> {
  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      console.error("OpenAI models API error:", await response.text());
      return getDefaultOpenAIModels();
    }

    const data = await response.json();

    // Filter for GPT models suitable for chat
    const models: Model[] = data.data
      ?.filter((model: { id: string }) =>
        (model.id.includes("gpt-4") || model.id.includes("gpt-3.5")) &&
        !model.id.includes("instruct") &&
        !model.id.includes("vision") &&
        !model.id.includes("realtime") &&
        !model.id.includes("audio")
      )
      .map((model: { id: string }) => ({
        id: model.id,
        name: formatModelName(model.id),
      }))
      .sort((a: Model, b: Model) => {
        // Sort: gpt-4o first, then gpt-4, then gpt-3.5
        if (a.id.includes("gpt-4o") && !b.id.includes("gpt-4o")) return -1;
        if (!a.id.includes("gpt-4o") && b.id.includes("gpt-4o")) return 1;
        if (a.id.includes("gpt-4") && !b.id.includes("gpt-4")) return -1;
        if (!a.id.includes("gpt-4") && b.id.includes("gpt-4")) return 1;
        return b.id.localeCompare(a.id); // Newer versions first
      })
      .slice(0, 10);

    return models.length > 0 ? models : getDefaultOpenAIModels();
  } catch (error) {
    console.error("Error fetching OpenAI models:", error);
    return getDefaultOpenAIModels();
  }
}

// Format model ID into readable name
function formatModelName(modelId: string): string {
  return modelId
    .replace("models/", "")
    .replace(/-/g, " ")
    .replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3") // Format dates
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Fallback models if API calls fail
function getDefaultClaudeModels(): Model[] {
  return [
    { id: "claude-sonnet-4-20250514", name: "Claude Sonnet 4" },
    { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet" },
    { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku" },
    { id: "claude-3-opus-20240229", name: "Claude 3 Opus" },
  ];
}

function getDefaultGeminiModels(): Model[] {
  return [
    { id: "gemini-2.0-flash-exp", name: "Gemini 2.0 Flash" },
    { id: "gemini-1.5-pro-latest", name: "Gemini 1.5 Pro" },
    { id: "gemini-1.5-flash-latest", name: "Gemini 1.5 Flash" },
    { id: "gemini-pro", name: "Gemini Pro" },
  ];
}

function getDefaultOpenAIModels(): Model[] {
  return [
    { id: "gpt-4o", name: "GPT-4o" },
    { id: "gpt-4o-mini", name: "GPT-4o Mini" },
    { id: "gpt-4-turbo", name: "GPT-4 Turbo" },
    { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" },
  ];
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const provider = searchParams.get("provider") as AIProvider | null;
  const userApiKey = searchParams.get("apiKey");

  if (!provider) {
    // Return all providers' models
    const results: ModelsResponse[] = [];

    // Claude
    const claudeKey = userApiKey || process.env.ANTHROPIC_API_KEY;
    if (claudeKey) {
      const claudeModels = await fetchClaudeModels(claudeKey);
      results.push({ provider: "claude", models: claudeModels });
    } else {
      results.push({ provider: "claude", models: getDefaultClaudeModels() });
    }

    // Gemini
    const geminiKey = userApiKey || process.env.GEMINI_API_KEY;
    if (geminiKey) {
      const geminiModels = await fetchGeminiModels(geminiKey);
      results.push({ provider: "gemini", models: geminiModels });
    } else {
      results.push({ provider: "gemini", models: getDefaultGeminiModels() });
    }

    // OpenAI
    const openaiKey = userApiKey || process.env.OPENAI_API_KEY;
    if (openaiKey) {
      const openaiModels = await fetchOpenAIModels(openaiKey);
      results.push({ provider: "openai", models: openaiModels });
    } else {
      results.push({ provider: "openai", models: getDefaultOpenAIModels() });
    }

    return NextResponse.json(results);
  }

  // Return specific provider's models
  let apiKey: string | undefined;
  let models: Model[];

  switch (provider) {
    case "claude":
      apiKey = userApiKey || process.env.ANTHROPIC_API_KEY;
      models = apiKey ? await fetchClaudeModels(apiKey) : getDefaultClaudeModels();
      break;
    case "gemini":
      apiKey = userApiKey || process.env.GEMINI_API_KEY;
      models = apiKey ? await fetchGeminiModels(apiKey) : getDefaultGeminiModels();
      break;
    case "openai":
      apiKey = userApiKey || process.env.OPENAI_API_KEY;
      models = apiKey ? await fetchOpenAIModels(apiKey) : getDefaultOpenAIModels();
      break;
    default:
      return NextResponse.json(
        { error: `Unknown provider: ${provider}` },
        { status: 400 }
      );
  }

  return NextResponse.json({ provider, models });
}
