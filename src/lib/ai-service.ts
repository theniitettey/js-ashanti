import Groq from "groq-sdk";
import { UserEvent, AIAnalysis } from "@/interface/analytics";
import { aiCircuitBreaker } from "@/lib/circuit-breaker";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Analyze batch of user events with AI
 * Wrapped with circuit breaker to protect against cascading failures
 */
export async function analyzeEventBatch(
  events: UserEvent[]
): Promise<AIAnalysis> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY not configured");
  }

  if (events.length === 0) {
    throw new Error("No events to analyze");
  }

  // Wrap AI call with circuit breaker
  return aiCircuitBreaker.execute(async () => {
    return performAnalysis(events);
  });
}

/**
 * Internal: Perform the actual AI analysis
 */
async function performAnalysis(events: UserEvent[]): Promise<AIAnalysis> {
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

Analyze these events and provide a JSON response with the following structure:
{
  "summary": "concise 1-2 sentence summary of user behavior patterns",
  "confidence": 0.85,
  "patterns": ["pattern1", "pattern2"]
}

You MUST respond with ONLY valid JSON, no markdown, no backticks, no additional text.
`;

  try {
    const completion = await groq.chat.completions.create({
      // Groq production model (see https://console.groq.com/docs/deprecations)
      model: "llama-3.3-70b-versatile",
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
