"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { Layout, Tag } from "lucide-react";
import { wbpNote } from "@/lib/whiteboard/elements";
import { useWizardStore } from "@/lib/store/wizard-store";
import { getProjectUniverse, getWorkMode } from "@/lib/wizard/project-types";
import { GENRE_BY_ID } from "@/lib/methods/session-genres";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const WhiteboardBoard = dynamic(
  () => import("@/components/whiteboard/whiteboard-board").then((m) => m.WhiteboardBoard),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[min(480px,55vh)] items-center justify-center text-sm text-muted-foreground">
        Chargement du tableau blanc…
      </div>
    ),
  },
);

export function WizardWhiteboardStep() {
  const ptype = useWizardStore((s) => s.ptype);
  const mode = useWizardStore((s) => s.mode);
  const genre = useWizardStore((s) => s.genre);
  const genreDur = useWizardStore((s) => s.genreDur);
  const objective = useWizardStore((s) => s.objective);
  const elements = useWizardStore((s) => s.whiteboardElements);
  const view = useWizardStore((s) => s.whiteboardView);
  const textMode = useWizardStore((s) => s.whiteboardTextMode);
  const setObjective = useWizardStore((s) => s.setObjective);
  const setWhiteboard = useWizardStore((s) => s.setWhiteboard);
  const setTextMode = useWizardStore((s) => s.setWhiteboardTextMode);
  const seededObjective = useRef(false);
  const [ready, setReady] = useState(false);

  const universe = getProjectUniverse(ptype);
  const modeMeta = getWorkMode(mode);
  const genreEntry = genre ? GENRE_BY_ID[genre] : null;

  useEffect(() => {
    if (seededObjective.current) {
      setReady(true);
      return;
    }
    seededObjective.current = true;
    if (elements.length === 0 && objective.trim()) {
      setWhiteboard([wbpNote(120, 100, objective.trim(), 1)]);
    }
    setReady(true);
  }, [elements.length, objective, setWhiteboard]);

  const banner = [
    universe?.title,
    modeMeta?.label,
    genreEntry?.title,
    genreDur ?? genreEntry?.dur,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex min-h-[min(560px,65vh)] flex-col">
      {banner && (
        <div className="border-b bg-muted/30 px-4 py-2 text-center text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
          Votre séance · {banner}
        </div>
      )}

      <div className="border-b px-4 py-4">
        <h1 className="text-xl font-extrabold">Que voulez-vous accomplir ?</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Décrivez votre objectif en quelques mots. Amaris s&apos;en servira pour recommander la bonne méthode.
        </p>
        <div className="mt-3 inline-flex rounded-full border p-0.5">
          <button
            type="button"
            onClick={() => setTextMode(true)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold",
              textMode ? "bg-primary text-primary-foreground" : "text-muted-foreground",
            )}
          >
            <Tag className="h-3.5 w-3.5" /> Texte
          </button>
          <button
            type="button"
            onClick={() => setTextMode(false)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold",
              !textMode ? "bg-primary text-primary-foreground" : "text-muted-foreground",
            )}
          >
            <Layout className="h-3.5 w-3.5" /> Tableau blanc
          </button>
        </div>
      </div>

      {textMode ? (
        <div className="flex flex-1 flex-col p-4">
          <Textarea
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            placeholder="Décrivez ce que vous voulez accomplir…"
            className="min-h-[200px] flex-1 resize-none text-base"
          />
        </div>
      ) : ready ? (
        <WhiteboardBoard
          className="min-h-[min(480px,55vh)] flex-1 rounded-none border-0 shadow-none"
          height="100%"
          initialElements={elements}
          initialView={view}
          onElementsChange={(els, v) => setWhiteboard(els, v)}
        />
      ) : (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          Chargement…
        </div>
      )}
    </div>
  );
}
