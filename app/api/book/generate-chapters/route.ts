import { NextRequest, NextResponse } from "next/server";

// AI Provider types
type AIProvider = "claude" | "gemini" | "openai";

interface GenerateChaptersRequest {
  bookTitle: string;
  bookDescription: string;
  targetAudience?: string;
  numberOfChapters?: number;
  provider?: AIProvider;
  apiKey?: string; // User-provided key (optional, falls back to env)
}

interface Chapter {
  id: string;
  title: string;
  description: string;
}

// Claude API call
async function generateWithClaude(
  prompt: string,
  apiKey: string
): Promise<Chapter[]> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${error}`);
  }

  const data = await response.json();
  const content = data.content[0].text;
  return parseChaptersFromResponse(content);
}

// Gemini API call
async function generateWithGemini(
  prompt: string,
  apiKey: string
): Promise<Chapter[]> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  const data = await response.json();
  const content = data.candidates[0].content.parts[0].text;
  return parseChaptersFromResponse(content);
}

// OpenAI API call
async function generateWithOpenAI(
  prompt: string,
  apiKey: string
): Promise<Chapter[]> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  return parseChaptersFromResponse(content);
}

// Parse the AI response into chapters
function parseChaptersFromResponse(content: string): Chapter[] {
  const chapters: Chapter[] = [];

  // Try to parse JSON first
  try {
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed)) {
        return parsed.map((ch: { title: string; description: string }, index: number) => ({
          id: `chapter-${Date.now()}-${index}`,
          title: ch.title || `Chapter ${index + 1}`,
          description: ch.description || "",
        }));
      }
    }
  } catch {
    // Fall through to regex parsing
  }

  // Fallback: parse numbered list format
  const lines = content.split("\n");
  let currentChapter: { title: string; description: string } | null = null;

  for (const line of lines) {
    const chapterMatch = line.match(
      /^(?:Chapter\s+)?(\d+)[\.\:\)]\s*(.+)/i
    );
    if (chapterMatch) {
      if (currentChapter) {
        chapters.push({
          id: `chapter-${Date.now()}-${chapters.length}`,
          title: currentChapter.title,
          description: currentChapter.description.trim(),
        });
      }
      currentChapter = {
        title: chapterMatch[2].trim(),
        description: "",
      };
    } else if (currentChapter && line.trim()) {
      // Add to description if we're in a chapter
      if (!line.match(/^(?:Chapter|---)/i)) {
        currentChapter.description += line.trim() + " ";
      }
    }
  }

  // Don't forget the last chapter
  if (currentChapter) {
    chapters.push({
      id: `chapter-${Date.now()}-${chapters.length}`,
      title: currentChapter.title,
      description: currentChapter.description.trim(),
    });
  }

  return chapters;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateChaptersRequest = await request.json();
    const {
      bookTitle,
      bookDescription,
      targetAudience,
      numberOfChapters = 8,
      provider = "claude",
      apiKey: userApiKey,
    } = body;

    if (!bookTitle || !bookDescription) {
      return NextResponse.json(
        { error: "Book title and description are required" },
        { status: 400 }
      );
    }

    // Determine which API key to use
    let apiKey: string | undefined;

    if (userApiKey) {
      apiKey = userApiKey;
    } else {
      // Fall back to environment variables
      switch (provider) {
        case "claude":
          apiKey = process.env.ANTHROPIC_API_KEY;
          break;
        case "gemini":
          apiKey = process.env.GEMINI_API_KEY;
          break;
        case "openai":
          apiKey = process.env.OPENAI_API_KEY;
          break;
      }
    }

    if (!apiKey) {
      return NextResponse.json(
        {
          error: `No API key found for ${provider}. Please provide your own key or configure the server.`,
        },
        { status: 400 }
      );
    }

    // Build the prompt
    const prompt = `You are an expert book author and curriculum designer. Generate a chapter outline for an interactive eBook.

Book Title: ${bookTitle}
Book Description: ${bookDescription}
${targetAudience ? `Target Audience: ${targetAudience}` : ""}
Number of Chapters: ${numberOfChapters}

Generate exactly ${numberOfChapters} chapters with clear, descriptive titles and brief descriptions (1-2 sentences each) explaining what each chapter will cover.

Return the chapters as a JSON array in this exact format:
[
  {"title": "Chapter Title", "description": "Brief description of what this chapter covers"},
  ...
]

Make sure the chapters:
1. Flow logically from beginner concepts to more advanced topics
2. Have clear, engaging titles
3. Include practical, hands-on content descriptions
4. Build upon each other progressively

Return ONLY the JSON array, no other text.`;

    // Call the appropriate AI provider
    let chapters: Chapter[];

    switch (provider) {
      case "claude":
        chapters = await generateWithClaude(prompt, apiKey);
        break;
      case "gemini":
        chapters = await generateWithGemini(prompt, apiKey);
        break;
      case "openai":
        chapters = await generateWithOpenAI(prompt, apiKey);
        break;
      default:
        return NextResponse.json(
          { error: `Unknown provider: ${provider}` },
          { status: 400 }
        );
    }

    return NextResponse.json({ chapters });
  } catch (error) {
    console.error("Error generating chapters:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate chapters" },
      { status: 500 }
    );
  }
}
