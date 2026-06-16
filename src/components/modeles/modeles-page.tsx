"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  CheckCircle,
  Search,
  Star,
  X,
  Zap,
} from "lucide-react";
import {
  LIB_FAMILIES,
  LIB_SEANCE,
  type LibFamily,
  type LibMethodItem,
} from "@/lib/methods/library-data";
import { useMethodTemplatesStore } from "@/lib/store/method-templates-store";
import { MethodLiveOverlay } from "@/components/modeles/method-live-overlay";
import { MethodWorkflowCard, PersoWorkflowCard, SeanceToolCard } from "@/components/modeles/method-workflow-card";
import { MethodIcon } from "@/components/modeles/method-icon";
import { getMethodIllustration } from "@/lib/methods/method-images";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function buildMethodLookup(): Record<string, LibMethodItem> {
  const map: Record<string, LibMethodItem> = {};
  for (const f of LIB_FAMILIES) {
    for (const it of f.items) map[it.id] = it;
  }
  for (const it of LIB_SEANCE) map[it.id] = it;
  return map;
}

const METHOD_LOOKUP = buildMethodLookup();

interface QtJournalEntry {
  id: string;
  toolId: string;
  title: string;
  at: number;
}

function CatSection({
  label,
  count,
  icon,
  sub,
  children,
  className,
}: {
  label: string;
  count: number;
  icon: string;
  sub?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("mb-8", className)}>
      <div className={cn("mb-1 flex items-center gap-2.5", !sub && "mb-3.5")}>
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <MethodIcon name={icon} className="h-4 w-4" />
        </span>
        <h2 className="text-lg font-extrabold tracking-tight">{label}</h2>
        <span className="text-xs font-extrabold text-muted-foreground">{count}</span>
      </div>
      {sub && <p className="mb-3.5 ml-10 text-[13px] text-muted-foreground">{sub}</p>}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5">{children}</div>
    </section>
  );
}

function CatCard({
  item,
  familyLabel,
  familyId,
  onOpen,
}: {
  item: LibMethodItem;
  familyLabel?: string;
  familyId?: string;
  onOpen: () => void;
}) {
  return (
    <MethodWorkflowCard
      item={item}
      familyLabel={familyLabel}
      familyId={familyId}
      onOpen={onOpen}
    />
  );
}

function PersoTemplateCard({
  tpl,
  onRemove,
}: {
  tpl: { id: string; name: string; methods: string[]; createdAt: number };
  onRemove: () => void;
}) {
  const mlist = (tpl.methods || [])
    .map((id) => METHOD_LOOKUP[id])
    .filter(Boolean) as LibMethodItem[];
  const dateStr = new Date(tpl.createdAt || Date.now()).toLocaleDateString("fr-CA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const coverId = mlist[0]?.id ?? "brainstorming";

  return (
    <PersoWorkflowCard
      name={tpl.name}
      methodCount={mlist.length}
      dateStr={dateStr}
      imageUrl={getMethodIllustration(coverId, "generer")}
      onRemove={onRemove}
    />
  );
}

export function ModelesPage() {
  const [live, setLive] = useState<{ item: LibMethodItem } | null>(null);
  const [q, setQ] = useState("");
  const [fam, setFam] = useState("all");
  const [toast, setToast] = useState("");
  const [qtJournal, setQtJournal] = useState<QtJournalEntry[]>([]);
  const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const templates = useMethodTemplatesStore((s) => s.templates);
  const removeTemplate = useMethodTemplatesStore((s) => s.remove);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastRef.current) clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(""), 2200);
  }, []);

  const totalMethods = useMemo(
    () => LIB_FAMILIES.reduce((s, f) => s + f.items.length, 0),
    [],
  );

  const match = useCallback(
    (it: LibMethodItem) =>
      !q.trim() ||
      `${it.title} ${it.desc}`.toLowerCase().includes(q.trim().toLowerCase()),
    [q],
  );

  const families = useMemo(
    () =>
      LIB_FAMILIES.filter((f) => fam === "all" || fam === f.id)
        .map((f) => ({ ...f, items: f.items.filter(match) }))
        .filter((f) => f.items.length > 0),
    [fam, match],
  );

  const seance = useMemo(
    () => (fam === "all" || fam === "seance" ? LIB_SEANCE.filter(match) : []),
    [fam, match],
  );

  const persoList = useMemo(
    () =>
      templates.filter(
        (t) => !q.trim() || t.name.toLowerCase().includes(q.trim().toLowerCase()),
      ),
    [templates, q],
  );

  const chips = useMemo(
    () =>
      [
        { id: "all", label: "Tout" },
        { id: "perso", label: "Mes modèles perso" },
        ...LIB_FAMILIES.map((f: LibFamily) => ({ id: f.id, label: f.label })),
        { id: "seance", label: "Outils de séance" },
      ],
    [],
  );

  const open = (it: LibMethodItem) => setLive({ item: it });

  const closeLive = () => {
    if (live?.item.qt) {
      setQtJournal((j) => [
        {
          id: `qt${Date.now()}`,
          toolId: live.item.id,
          title: live.item.title,
          at: Date.now(),
        },
        ...j,
      ]);
    }
    setLive(null);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-[1060px] px-6 py-8 pb-14 sm:px-9">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Modèles de méthodes</h1>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Choisissez une méthode, survolez pour voir ce qu&apos;elle produit — puis testez-la en un clic, sans préparer de séance.
            </p>
          </div>
          <div className="flex min-w-[240px] items-center gap-2 rounded-xl border bg-card px-3.5 py-2.5">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={`Rechercher parmi ${totalMethods + LIB_SEANCE.length} méthodes et outils…`}
              className="h-auto border-0 bg-transparent p-0 text-[13.5px] shadow-none focus-visible:ring-0"
            />
            {q && (
              <button type="button" onClick={() => setQ("")} className="text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {chips.map((c) => (
            <Button
              key={c.id}
              type="button"
              variant={fam === c.id ? "default" : "secondary"}
              size="sm"
              className="rounded-full font-bold"
              onClick={() => setFam(c.id)}
            >
              {c.label}
            </Button>
          ))}
        </div>

        {(fam === "perso" || (fam === "all" && persoList.length > 0)) && (
          <section className="mb-8">
            <div className="mb-1 flex items-center gap-2.5">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <Star className="h-4 w-4" />
              </span>
              <h2 className="text-lg font-extrabold tracking-tight">Mes modèles perso</h2>
              <span className="text-xs font-extrabold text-muted-foreground">{persoList.length}</span>
            </div>
            <p className="mb-3.5 ml-10 text-[13px] text-muted-foreground">
              Vos séquences de méthodes enregistrées depuis l&apos;étape « Méthode » d&apos;une rencontre.
            </p>
            {persoList.length === 0 ? (
              <div className="rounded-2xl border border-dashed px-6 py-8 text-center text-muted-foreground">
                <Star className="mx-auto mb-2.5 h-7 w-7 opacity-40" />
                <div className="text-sm font-bold text-foreground/60">Aucun modèle perso pour l&apos;instant</div>
                <p className="mx-auto mt-1.5 max-w-md text-[13px] leading-relaxed">
                  Pendant la préparation d&apos;une rencontre, à l&apos;étape « Méthode », choisissez vos méthodes puis
                  cliquez sur « Sauvegarder comme modèle ».
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5">
                {persoList.map((tpl) => (
                  <PersoTemplateCard key={tpl.id} tpl={tpl} onRemove={() => removeTemplate(tpl.id)} />
                ))}
              </div>
            )}
          </section>
        )}

        {families.map((f) => (
          <CatSection key={f.id} label={f.label} count={f.items.length} icon={f.icon} sub={f.desc}>
            {f.items.map((it) => (
              <CatCard
                key={it.id}
                item={it}
                familyLabel={f.label}
                familyId={f.id}
                onOpen={() => open(it)}
              />
            ))}
          </CatSection>
        ))}

        {seance.length > 0 && (
          <CatSection
            label="Outils de séance"
            count={seance.length}
            icon="Clock"
            sub="Les mêmes outils rapides qu'en séance — essayez-les librement, sans rencontre en cours."
            className="mb-2.5"
          >
            {seance.map((it) => (
              <SeanceToolCard key={it.id} item={it} onOpen={() => open(it)} />
            ))}
          </CatSection>
        )}

        {qtJournal.length > 0 && (
          <div className="mt-8 rounded-2xl border bg-card p-5">
            <div className="mb-3 flex items-center gap-2.5">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Zap className="h-4 w-4" />
              </span>
              <h2 className="text-base font-extrabold tracking-tight">Journal de vos essais</h2>
              <span className="text-xs font-extrabold text-muted-foreground">{qtJournal.length}</span>
            </div>
            <ul className="space-y-2">
              {qtJournal.map((e) => {
                const item = METHOD_LOOKUP[e.toolId];
                return (
                  <li key={e.id}>
                    <button
                      type="button"
                      onClick={() => item && open(item)}
                      className="flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-left text-sm transition-colors hover:bg-muted/50"
                    >
                      <span className="font-bold">{e.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(e.at).toLocaleString("fr-CA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {families.length === 0 && seance.length === 0 && fam !== "perso" && (
          <div className="py-16 text-center text-muted-foreground">
            <Search className="mx-auto mb-3 h-8 w-8 opacity-40" />
            <div className="text-[15px] font-bold text-foreground/60">Aucun résultat pour « {q} »</div>
          </div>
        )}
      </div>

      {live && (
        <MethodLiveOverlay item={live.item} onClose={closeLive} onToast={showToast} />
      )}

      {toast && (
        <div className="fixed bottom-7 left-1/2 z-[1200] flex -translate-x-1/2 items-center gap-2.5 rounded-xl bg-foreground px-4 py-3 text-[13.5px] font-semibold text-background shadow-2xl">
          <CheckCircle className="h-4.5 w-4.5 text-emerald-400" />
          {toast}
        </div>
      )}
    </div>
  );
}
