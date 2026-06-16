import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  WIZARD_METHOD_SYSTEM_PROMPT,
  parseWizardMethodRecommendation,
  type WizardMethodRecommendation,
} from "@/lib/assistant/wizard-method-prompt";
import { recommendMethodsFromContext } from "@/lib/assistant/recommend-methods-heuristic";
import { describeBoardElements } from "@/lib/whiteboard/describe-board";
import { getMethodCatalogIds, resolveMethodId } from "@/lib/methods/catalog";
import type { WbElement } from "@/lib/whiteboard/elements";
import type { SessionMode } from "@/types/facilitation";

const ALLOWED = new Set(getMethodCatalogIds());

function sanitizeResult(raw: WizardMethodRecommendation): WizardMethodRecommendation {
  const methodIds = raw.methodIds.map(resolveMethodId).filter((id) => ALLOWED.has(id));
  const unique = [...new Set(methodIds)].slice(0, 4);
  return {
    objective: raw.objective.trim().slice(0, 300) || "Objectif de séance",
    methodIds: unique.length ? unique : ["brainstorm"],
    summary: raw.summary.trim().slice(0, 280),
  };
}

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
  const elements = (body.elements ?? []) as WbElement[];
  const boardImage = typeof body.boardImage === "string" ? body.boardImage : null;
  const context = body.context as {
    mode?: SessionMode | null;
    ptype?: string | null;
    ptypeTitle?: string;
    genreId?: string | null;
    genreTitle?: string;
    genreCat?: string;
    durationMin?: number;
  };

  const ctx = {
    mode: context?.mode ?? null,
    ptype: context?.ptype ?? null,
    ptypeTitle: context?.ptypeTitle ?? "Non précisé",
    genreId: context?.genreId ?? null,
    genreTitle: context?.genreTitle ?? "Séance",
    genreCat: context?.genreCat ?? "ideas",
    durationMin: Number(context?.durationMin ?? 75),
  };

  const boardDescription = describeBoardElements(elements);
  const apiKey = process.env.ANTHROPIC_API_KEY;

  let result: WizardMethodRecommendation;

  if (apiKey) {
    try {
      const userText = [
        `Mode : ${ctx.mode ?? "non précisé"}`,
        `Univers : ${ctx.ptypeTitle} (${ctx.ptype ?? "non précisé"})`,
        `Genre : ${ctx.genreTitle} (${ctx.genreCat})`,
        `Durée cible : ${ctx.durationMin} min`,
        `Objectif saisi : ${objective.trim() || "(vide)"}`,
        boardDescription,
      ].join("\n");

      const userContent: Array<{ type: string; text?: string; source?: object }> = [];
      if (boardImage) {
        userContent.push({
          type: "image",
          source: {
            type: "base64",
            media_type: "image/png",
            data: boardImage.replace(/^data:image\/png;base64,/, ""),
          },
        });
      }
      userContent.push({ type: "text", text: userText });

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
          system: WIZARD_METHOD_SYSTEM_PROMPT,
          messages: [{ role: "user", content: userContent }],
        }),
      });

      const data = await res.json();
      const text = data.content?.[0]?.text ?? "";
      const parsed = parseWizardMethodRecommendation(text);
      result = parsed
        ? sanitizeResult(parsed)
        : recommendMethodsFromContext({ objective, elements, context: ctx });
    } catch {
      result = recommendMethodsFromContext({ objective, elements, context: ctx });
    }
  } else {
    result = recommendMethodsFromContext({ objective, elements, context: ctx });
  }

  return NextResponse.json(sanitizeResult(result));
}
