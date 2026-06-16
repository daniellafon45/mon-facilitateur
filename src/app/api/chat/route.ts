import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  ASSISTANT_SYSTEM_PROMPT,
  parseRecommendation,
} from "@/lib/assistant/system-prompt";
import { fastHeuristicRecommendation } from "@/lib/assistant/quick-cadrage";
import type { ChatRecommendation } from "@/types/facilitation";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { messages } = await request.json();
  const apiKey = process.env.ANTHROPIC_API_KEY;

  let recommendation: ChatRecommendation;

  if (apiKey) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1024,
          system: ASSISTANT_SYSTEM_PROMPT,
          messages: [
            {
              role: "assistant",
              content:
                "Compris. Je demande au plus le format (solo/équipe) et le type de projet, puis je recommande des méthodes.",
            },
            ...messages.map((m: { role: string; content: string }) => ({
              role: m.role,
              content: m.content,
            })),
          ],
        }),
      });
      const data = await res.json();
      const text = data.content?.[0]?.text ?? "";
      const parsed = parseRecommendation(text) ?? fastHeuristicRecommendation(messages);
      recommendation =
        parsed.ready && (!parsed.methodIds?.length || !parsed.mode)
          ? fastHeuristicRecommendation(messages, {
              mode: parsed.mode ?? null,
              genreId: parsed.genreId ?? null,
            })
          : parsed.ready
            ? parsed
            : fastHeuristicRecommendation(messages, {
                mode: parsed.mode ?? null,
                genreId: parsed.genreId ?? null,
              });
    } catch {
      recommendation = fastHeuristicRecommendation(messages);
    }
  } else {
    recommendation = fastHeuristicRecommendation(messages);
  }

  if (recommendation.ready) {
    await supabase.from("chat_sessions").insert({
      user_id: user.id,
      messages,
      recommendation,
    });
  }

  return NextResponse.json(recommendation);
}
