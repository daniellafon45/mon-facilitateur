"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Calendar, Check, ChevronLeft, Info, Users } from "lucide-react";
import type { Meeting } from "@/types/facilitation";
import { formatFrDate } from "@/lib/projets/constants";
import { useFacilitationStore } from "@/lib/store/facilitation-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SendQueueScreen({
  onBack,
  onOpen,
}: {
  onBack: () => void;
  onOpen: (m: Meeting) => void;
}) {
  const meetings = useFacilitationStore((s) => s.meetings);
  const updateMeeting = useFacilitationStore((s) => s.updateMeeting);
  const [sent, setSent] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState("");

  const items = useMemo(
    () =>
      meetings.filter(
        (m) => m.status === "Terminée" && !m.archived && m.snapshot?.report?.state !== "envoye",
      ),
    [meetings],
  );

  const toggle = (id: string) => {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const sendOne = async (m: Meeting) => {
    const snap = m.snapshot;
    if (!snap?.report?.summary?.trim()) return;
    await updateMeeting(m.id, {
      snapshot: {
        ...snap,
        report: { ...snap.report!, state: "envoye" },
      },
    });
    setSent((s) => new Set(s).add(m.id));
    setSelected((s) => {
      const n = new Set(s);
      n.delete(m.id);
      return n;
    });
    setToast(`Compte rendu « ${m.name} » envoyé`);
    window.setTimeout(() => setToast(""), 2200);
  };

  const sendAll = async () => {
    for (const id of selected) {
      const m = items.find((x) => x.id === id);
      if (m && m.snapshot?.report?.summary?.trim()) await sendOne(m);
    }
  };

  return (
    <div className="h-full overflow-y-auto px-8 py-7">
      <div className="mx-auto max-w-[820px]">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button type="button" onClick={onBack} className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h1 className="text-[26px] font-extrabold tracking-tight">File d&apos;envoi</h1>
          </div>
          <Button className="rounded-xl" disabled={selected.size === 0} onClick={() => void sendAll()}>
            <ArrowRight className="mr-1.5 h-4 w-4" />
            Envoyer {selected.size > 0 ? `(${selected.size})` : ""}
          </Button>
        </div>

        <div className="overflow-hidden rounded-[14px] border">
          {items.length === 0 && (
            <div className="px-5 py-14 text-center">
              <div className="mx-auto mb-3 flex h-[52px] w-[52px] items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                <ArrowRight className="h-6 w-6" />
              </div>
              <div className="font-extrabold text-slate-700">Aucun compte rendu à envoyer</div>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                Terminez une rencontre pour générer un compte rendu, puis envoyez-le depuis cette file.
              </p>
            </div>
          )}
          {items.map((m, i) => {
            const done = sent.has(m.id);
            const draft = !m.snapshot?.report?.summary?.trim();
            const report = m.snapshot?.report;
            return (
              <div
                key={m.id}
                className={cn(
                  "flex items-center gap-3 px-4 py-4",
                  i < items.length - 1 && "border-b border-slate-100",
                  done && "opacity-60",
                )}
              >
                <button
                  type="button"
                  disabled={draft || done}
                  onClick={() => toggle(m.id)}
                  className={cn(
                    "flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md border-2",
                    selected.has(m.id) ? "border-primary bg-primary text-white" : "border-slate-300",
                    done && "border-emerald-500 bg-emerald-500 text-white",
                    (draft || done) && "cursor-default",
                  )}
                >
                  {(selected.has(m.id) || done) && <Check className="h-3 w-3" />}
                </button>
                <button
                  type="button"
                  onClick={() => onOpen(m)}
                  className="min-w-0 flex-1 border-0 bg-transparent p-0 text-left"
                >
                  <div className="font-bold">{m.name}</div>
                  <div className="mt-0.5 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatFrDate(m.dateISO)}</span>
                    <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {report?.recipients ?? `${m.participants} participants`}</span>
                    {!draft && report?.scribe && <span>Scribe : {report.scribe}</span>}
                  </div>
                </button>
                {done ? (
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">Envoyé</span>
                ) : draft ? (
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700">Non rédigé</span>
                ) : (
                  <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={() => void sendOne(m)}>
                    <ArrowRight className="mr-1 h-3 w-3" /> Envoyer
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3.5 py-3 text-sm text-muted-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          Les comptes rendus non rédigés ne peuvent pas être envoyés. Ouvrez-les pour compléter le texte du scribe.
        </div>
      </div>
      {toast && (
        <div className="fixed bottom-7 left-1/2 z-[1200] -translate-x-1/2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-2xl">
          {toast}
        </div>
      )}
    </div>
  );
}
