"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle, Clock, FileText } from "lucide-react";
import {
  LEARN_METHOD_BY_ID,
  LEARN_PARCOURS,
  MODULE_TYPE,
  PARCOURS_BY_ID,
  THEME_LABEL,
  type LearnMethod,
  type LearnParcours,
  type LearnResource,
} from "@/lib/learn/data";
import type { KitOrder } from "@/lib/learn/kits";
import { useLearnStore } from "@/lib/store/learn-store";
import { useFacilitationStore } from "@/lib/store/facilitation-store";
import { ApprendreHome } from "@/components/apprendre/apprendre-home";
import {
  ErrorState,
  LearnDrawer,
  LearnProgress,
  LevelBadge,
  MethodIconTile,
  VideoModal,
  palColor,
  type LearnVideo,
} from "@/components/apprendre/learn-shared";
import {
  MethodeFicheView,
  MethodLibraryView,
  ParcoursCatalogView,
  ParcoursDetailView,
  ProgressionView,
  ResourceLibraryView,
} from "@/components/apprendre/apprendre-views";
import {
  KitDetailView,
  KitOrderFlowView,
  KitsCatalogView,
} from "@/components/apprendre/kits-views";
import { KIT_BY_ID } from "@/lib/learn/kits";
import { Button } from "@/components/ui/button";

type ViewState = {
  name: string;
  id?: string | null;
  flag?: boolean;
};

export function ApprendrePage() {
  const router = useRouter();
  const scroller = useRef<HTMLDivElement>(null);

  const progress = useLearnStore((s) => s.progress);
  const saved = useLearnStore((s) => s.saved);
  const toggleModule = useLearnStore((s) => s.toggleModule);
  const toggleSave = useLearnStore((s) => s.toggleSave);
  const setWizardSeed = useFacilitationStore((s) => s.setWizardSeed);

  const [view, setView] = useState<ViewState>({ name: "home" });
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState<string | null>(null);
  const [drawer, setDrawer] = useState<{ kind: "parcours" | "resource"; data: LearnParcours | LearnResource } | null>(null);
  const [video, setVideo] = useState<LearnVideo | null>(null);
  const [kitOrder, setKitOrder] = useState<KitOrder | null>(null);

  const go = (name: string, id?: string | null, flag?: boolean) => {
    setView({ name, id, flag });
    setQuery("");
    scroller.current?.scrollTo({ top: 0 });
  };

  const startLearning = () => {
    const inProg = LEARN_PARCOURS.find((p) => {
      const d = progress[p.id] || [];
      return d.some(Boolean) && !d.every(Boolean);
    });
    go("parcours", (inProg || LEARN_PARCOURS[0]).id);
  };

  const useMethodInSession = (m: LearnMethod) => {
    const sessionId = m.sessionId ?? m.id;
    setWizardSeed("", null, [sessionId]);
    router.push("/dashboard/wizard/method");
  };

  const openParcoursQuick = (id: string) => {
    const p = PARCOURS_BY_ID[id];
    if (p) setDrawer({ kind: "parcours", data: p });
  };

  const openResource = (r: LearnResource) => setDrawer({ kind: "resource", data: r });

  let body: React.ReactNode = null;

  if (view.name === "home") {
    body = (
      <ApprendreHome
        progress={progress}
        saved={saved}
        query={query}
        setQuery={setQuery}
        theme={theme}
        setTheme={setTheme}
        go={go}
        openParcoursQuick={openParcoursQuick}
        openResource={openResource}
        playVideo={setVideo}
        toggleSave={toggleSave}
        onStartLearning={startLearning}
      />
    );
  } else if (view.name === "parcours-catalog") {
    body = (
      <ParcoursCatalogView
        progress={progress}
        onBack={() => go("home")}
        onOpen={(id) => go("parcours", id)}
        onQuick={openParcoursQuick}
      />
    );
  } else if (view.name === "parcours") {
    const p = PARCOURS_BY_ID[view.id ?? ""];
    body = p ? (
      <ParcoursDetailView
        parcours={p}
        done={progress[p.id] || []}
        onToggleModule={(idx) => toggleModule(p.id, idx)}
        onBack={() => go("parcours-catalog")}
        onOpenMethod={(mid) => go("method", mid)}
        onPlayVideo={setVideo}
      />
    ) : (
      <div className="p-10">
        <ErrorState onRetry={() => go("parcours-catalog")} />
      </div>
    );
  } else if (view.name === "method-library") {
    body = (
      <MethodLibraryView
        saved={saved}
        onBack={() => go("home")}
        onOpen={(id) => go("method", id)}
        onToggleSave={toggleSave}
      />
    );
  } else if (view.name === "method") {
    const m = LEARN_METHOD_BY_ID[view.id ?? ""];
    body = m ? (
      <MethodeFicheView
        method={m}
        saved={saved.includes(m.id)}
        onToggleSave={() => toggleSave(m.id)}
        onBack={() => go("method-library")}
        onUseInSession={useMethodInSession}
        onOpenTemplate={(mm) =>
          openResource({
            title: mm.template,
            type: "Template",
            meta: "PDF",
            icon: "Document",
            color: "violet",
            theme: mm.theme,
            cat: "outils",
            catTitle: "Outils & templates",
          })
        }
      />
    ) : (
      <div className="p-10">
        <ErrorState onRetry={() => go("method-library")} />
      </div>
    );
  } else if (view.name === "resource-library") {
    body = (
      <ResourceLibraryView
        initialCat={view.id}
        onlyNew={view.flag}
        onBack={() => go("home")}
        onOpenRes={openResource}
      />
    );
  } else if (view.name === "kits-catalog") {
    body = <KitsCatalogView onBack={() => go("home")} go={go} />;
  } else if (view.name === "kit") {
    const k = KIT_BY_ID[view.id ?? ""];
    body = k ? (
      <KitDetailView
        kit={k}
        onBack={() => go("kits-catalog")}
        onOrder={(order) => {
          setKitOrder(order);
          go("kit-order");
        }}
      />
    ) : (
      <div className="p-10">
        <ErrorState onRetry={() => go("kits-catalog")} />
      </div>
    );
  } else if (view.name === "kit-order") {
    body = kitOrder ? (
      <KitOrderFlowView order={kitOrder} onBack={() => go("kit", kitOrder.kitId)} onHome={() => go("home")} />
    ) : (
      <div className="p-10">
        <ErrorState onRetry={() => go("home")} />
      </div>
    );
  } else if (view.name === "progression") {
    body = (
      <ProgressionView
        progress={progress}
        savedCount={saved.length}
        onBack={() => go("home")}
        onOpenParcours={(id) => go("parcours", id)}
        onBrowse={() => go("parcours-catalog")}
      />
    );
  }

  let drawerInner: React.ReactNode = null;
  let drawerFooter: React.ReactNode = null;
  let drawerTitle = "";

  if (drawer?.kind === "parcours") {
    const p = drawer.data as LearnParcours;
    const d = progress[p.id] || [];
    const pct = Math.round((d.filter(Boolean).length / p.modules.length) * 100);
    drawerTitle = "Aperçu du parcours";
    drawerInner = (
      <div>
        <MethodIconTile icon={p.icon} color={p.color} size={56} />
        <div className="mt-3 flex flex-wrap gap-2">
          <LevelBadge level={p.level} />
          <span className="rounded-full px-2.5 py-0.5 text-[11.5px] font-bold" style={{ background: palColor(p.color).bg, color: palColor(p.color).fg }}>
            {THEME_LABEL[p.theme]}
          </span>
        </div>
        <div className="mt-2 text-lg font-extrabold">{p.title}</div>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
        <div className="my-4 flex gap-4 text-[13px] font-semibold text-muted-foreground">
          <span className="inline-flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> {p.modules.length} modules</span>
          <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {p.dur}</span>
        </div>
        <LearnProgress pct={pct} color={palColor(p.color).fg} />
        <p className="mt-1.5 text-xs text-muted-foreground">{pct}% complété</p>
        <div className="mt-4 font-bold text-[13px]">Au programme</div>
        <div className="mt-2 space-y-2">
          {p.modules.map((m, i) => (
            <div key={i} className="flex items-center gap-2 text-[13px] text-muted-foreground">
              {d[i] ? <CheckCircle className="h-4 w-4 text-emerald-600" /> : <Clock className="h-3.5 w-3.5" />}
              <span className="flex-1">{m.t}</span>
              <span className="text-[11.5px]">{MODULE_TYPE[m.type].label}</span>
            </div>
          ))}
        </div>
      </div>
    );
    drawerFooter = (
      <Button className="w-full rounded-xl" onClick={() => { go("parcours", p.id); setDrawer(null); }}>
        Ouvrir le parcours <ArrowRight className="ml-1 h-4 w-4" />
      </Button>
    );
  } else if (drawer?.kind === "resource") {
    const r = drawer.data as LearnResource;
    drawerTitle = "Ressource";
    drawerInner = (
      <div>
        <MethodIconTile icon={r.icon || "Document"} color={r.color || "blue"} size={56} />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11.5px] font-bold">{r.type}</span>
          {r.meta && <span className="text-xs font-semibold text-muted-foreground">{r.meta}</span>}
          {r.isNew && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10.5px] font-extrabold uppercase text-emerald-600">Nouveau</span>}
        </div>
        <div className="mt-2 text-lg font-extrabold">{r.title}</div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Cette ressource fait partie de la bibliothèque My Facilitator. Ouvrez-la pour la consulter, l&apos;imprimer ou l&apos;ajouter à une séance.
        </p>
      </div>
    );
    drawerFooter = (
      <div className="flex gap-2">
        <Button variant="secondary" className="flex-1 rounded-xl" onClick={() => setDrawer(null)}>Fermer</Button>
        <Button className="flex-1 rounded-xl" onClick={() => setDrawer(null)}>{r.type === "Template" ? "Utiliser" : "Lire"}</Button>
      </div>
    );
  }

  return (
    <div ref={scroller} className="h-full overflow-y-auto">
      {body}
      <LearnDrawer open={!!drawer} onClose={() => setDrawer(null)} title={drawerTitle} footer={drawerFooter}>
        {drawerInner}
      </LearnDrawer>
      <VideoModal video={video} onClose={() => setVideo(null)} />
    </div>
  );
}
