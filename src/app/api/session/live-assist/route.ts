import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sessionAssistHeuristic } from "@/lib/assistant/session-assist-heuristic";
import {
  SESSION_ASSIST_SYSTEM_PROMPT,
  parseSessionAssistResponse,
  type SessionAssistResult,
} from "@/lib/assistant/session-assist-prompt";
import type { SessionAssistContext } from "@/lib/session/build-session-assist-context";

function formatContextForPrompt(ctx: SessionAssistContext): string {
  const lines = [
    `Objectif : ${ctx.objective || "(non précisé)"}`,
    `Mode : ${ctx.mode}`,
    `Temps : ${ctx.elapsedMin} min écoulées / ${ctx.durationMin} min prévues`,
    `Étape : ${ctx.activeMethodIndex + 1}/${ctx.methodIds.length}`,
    "",
    "Méthodes :",
    ...ctx.methods.map((m) => {
      const flag = m.isActive ? " [ACTIVE]" : m.isPast ? " [passée]" : "";
      const snip = m.snippets.length ? ` — extraits : ${m.snippets.join(" | ")}` : "";
      return `- ${m.title}${flag} : ${m.statsLabel}, ~${m.progress}%${snip}`;
    }),
    "",
    `Notes : ${ctx.capture.notesCount} · Votes : ${ctx.capture.votesCount} · Journal outils : ${ctx.capture.quickLogCount} · Discussion : ${ctx.capture.discussionCount}`,
  ];
  if (ctx.capture.recentNotes.length) {
    lines.push(`Dernières notes : ${ctx.capture.recentNotes.join(" / ")}`);
  }
  if (ctx.capture.recentDiscussion.length) {
    lines.push(`Derniers messages : ${ctx.capture.recentDiscussion.join(" / ")}`);
  }
  return lines.join("\n");
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const ctx = (await request.json()) as SessionAssistContext;
  const fallback = sessionAssistHeuristic(ctx);
  const apiKey = process.env.ANTHROPIC_API_KEY;

  let result: SessionAssistResult = fallback;

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
          max_tokens: 512,
          system: SESSION_ASSIST_SYSTEM_PROMPT,
          messages: [
            {
              role: "user",
              content: `Analyse cette séance en cours et propose une assistance contextualisée :\n\n${formatContextForPrompt(ctx)}`,
            },
          ],
        }),
      });
      const data = await res.json();
      const text = data.content?.[0]?.text ?? "";
      const parsed = parseSessionAssistResponse(text);
      if (parsed) result = parsed;
    } catch {
      result = fallback;
    }
  }

  return NextResponse.json(result);
}
