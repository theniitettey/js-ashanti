import OpenAI from "openai";
import { UserEvent, AIAnalysis } from "@/interface/analytics";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Analyze batch of user events with AI
 */
export async function analyzeEventBatch(
  events: UserEvent[]
): Promise<AIAnalysis> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not configured");
  }

  if (events.length === 0) {
    throw new Error("No events to analyze");
  }

  // Prepare event summary for AI
  const eventSummary = events.map((e) => ({
    type: e.eventType,
    page: e.page,
    timestamp: e.timestamp,
    metadata: e.metadata,
  }));

  const prompt = `
You are analyzing user behavior on an e-commerce website. 
Below is a batch of ${events.length} user events from the last time window.

Events:
${JSON.stringify(eventSummary, null, 2)}

Analyze these events and provide:
1. A concise summary (1-2 sentences) of user behavior patterns
2. Confidence score (0-1) in your analysis
3. List of detected patterns (e.g., "cart_abandonment", "product_browsing", "price_sensitivity")

Respond in JSON format:
{
  "summary": "string",
  "confidence": number,
  "patterns": ["string"]
}
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a behavioral analytics expert analyzing e-commerce user events.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const result = JSON.parse(content);

    return {
      summary: result.summary,
      confidence: result.confidence,
      patterns: result.patterns || [],
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("AI analysis failed:", error);
    throw error;
  }
}
