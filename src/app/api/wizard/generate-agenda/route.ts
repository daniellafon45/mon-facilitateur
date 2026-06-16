import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateAgendaFromContext } from "@/lib/assistant/generate-agenda-heuristic";
import { normalizeAgendaBlocks } from "@/lib/assistant/normalize-agenda-blocks";
import {
  WIZARD_AGENDA_SYSTEM_PROMPT,
  parseWizardAgendaResponse,
} from "@/lib/assistant/wizard-agenda-prompt";
import { METHOD_BY_ID } from "@/lib/methods/catalog";
import type { SessionMode } from "@/types/facilitation";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await request.json();
  const objective = String(body.objective ?? "");
  const methodIds = (body.methodIds ?? []) as string[];
  const mode = (body.mode ?? "equipe") as SessionMode;
  const targetMin = Number(body.targetMin ?? 90);
  const pomodoro = Boolean(body.pomodoro);
  const condensed = Boolean(body.condensed);
  const context = body.context as {
    genreTitle?: string;
    genreCat?: string;
  };

  const methodTitles = methodIds.map((id) => METHOD_BY_ID[id]?.title ?? id).join(", ");
  const input = {
    mode,
    methodIds,
    objective,
    targetMin,
    pomodoro,
    condensed,
    genreTitle: context?.genreTitle,
  };

  const apiKey = process.env.ANTHROPIC_API_KEY;
  let result = generateAgendaFromContext(input);

  if (apiKey) {
    try {
      const userText = [
        `Mode : ${mode}`,
        `Objectif : ${objective.trim() || "(non précisé)"}`,
        `Genre : ${context?.genreTitle ?? "Séance"}`,
        `Durée cible : ${targetMin} min`,
        `Méthodes : ${methodTitles || "—"}`,
        `Pomodoro : ${pomodoro ? "oui" : "non"}`,
        `Condensé : ${condensed ? "oui" : "non"}`,
      ].join("\n");

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 2048,
          system: WIZARD_AGENDA_SYSTEM_PROMPT,
          messages: [{ role: "user", content: userText }],
        }),
      });

      const data = await res.json();
      const text = data.content?.[0]?.text ?? "";
      const parsed = parseWizardAgendaResponse(text);
      if (parsed) result = parsed;
    } catch {
      // garde le fallback heuristique
    }
  }

  const normalized = normalizeAgendaBlocks(result, targetMin);
  return NextResponse.json(normalized);
}
