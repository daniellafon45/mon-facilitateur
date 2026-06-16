"use client";

import { useEffect, useState } from "react";
import { Calendar, Check, Info, X } from "lucide-react";
import type { DisplayProject } from "@/types/facilitation";
import { PROJECT_ICONS } from "@/lib/projets/constants";
import { MfDrawer } from "@/components/projets/projets-shared";
import { ProjectIcon } from "@/components/projets/projets-icon";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const lab = "mb-1.5 block text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground";

export function FilterDrawer({
  onClose,
  onApply,
  onReset,
}: {
  onClose: () => void;
  onApply: (f: { status: string | null }) => void;
  onReset: () => void;
}) {
  const [status, setStatus] = useState<string | null>(null);
  const opts = [
    { id: "actif", l: "Actifs" },
    { id: "attente", l: "En attente" },
    { id: "termine", l: "Terminés" },
    { id: "avenir", l: "À venir" },
  ];
  return (
    <MfDrawer
      title="Filtres"
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" className="flex-1 rounded-xl" onClick={() => { onReset(); onClose(); }}>
            Réinitialiser
          </Button>
          <Button className="flex-1 rounded-xl" onClick={() => onApply({ status })}>
            Appliquer
          </Button>
        </>
      }
    >
      <div className={lab}>Statut</div>
      <div className="mb-6 flex flex-wrap gap-2">
        {opts.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => setStatus(status === o.id ? null : o.id)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-[13px] font-bold cursor-pointer border",
              status === o.id
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground",
            )}
          >
            {o.l}
          </button>
        ))}
      </div>
      <div className={lab}>Participants</div>
      <div className="flex flex-wrap gap-2">
        {["1–4", "5–8", "9+"].map((o) => (
          <span key={o} className="rounded-full border px-3.5 py-1.5 text-[13px] font-bold text-muted-foreground cursor-pointer">
            {o}
          </span>
        ))}
      </div>
    </MfDrawer>
  );
}

export function ScheduleDrawer({
  project,
  onClose,
  onConfirm,
}: {
  project: DisplayProject;
  onClose: () => void;
  onConfirm: (date: string, time: string) => void;
}) {
  const [date, setDate] = useState("2026-06-20");
  const [time, setTime] = useState("10:00");
  return (
    <MfDrawer
      title="Programmer une rencontre"
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose}>Annuler</Button>
          <Button className="flex-1 rounded-xl gap-1.5" onClick={() => onConfirm(date, time)}>
            <Calendar className="h-4 w-4" /> Programmer
          </Button>
        </>
      }
    >
      <div className="mb-4 flex items-center gap-2.5">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-[11px] shrink-0"
          style={{ background: project.iconBg, color: project.iconFg }}
        >
          <ProjectIcon name={project.icon} size={18} />
        </div>
        <div>
          <div className="font-extrabold text-[15px]">{project.name}</div>
          <div className="text-xs text-muted-foreground">{project.members} participants</div>
        </div>
      </div>
      <label className="mb-3.5 block">
        <span className={lab}>Date</span>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-lg" />
      </label>
      <label className="mb-3.5 block">
        <span className={lab}>Heure</span>
        <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="rounded-lg" />
      </label>
      <div className="flex items-start gap-2 rounded-[10px] border border-primary/20 bg-primary/5 p-3 text-xs leading-relaxed text-muted-foreground">
        <Info className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
        La rencontre sera ajoutée à votre liste, votre calendrier et l&apos;accueil. Les participants recevront une invitation automatique.
      </div>
    </MfDrawer>
  );
}

export function RenameModal({
  project,
  onClose,
  onConfirm,
}: {
  project: DisplayProject;
  onClose: () => void;
  onConfirm: (name: string) => void;
}) {
  const [name, setName] = useState(project.name);
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);
  const valid = name.trim().length > 0;
  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-900/45 p-6 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-[420px] rounded-2xl bg-background p-6 shadow-xl animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3.5 text-[17px] font-extrabold">Renommer le projet</div>
        <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && valid) onConfirm(name.trim()); }} className="mb-4 rounded-lg" />
        <div className="flex gap-2.5">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose}>Annuler</Button>
          <Button className="flex-1 rounded-xl gap-1.5" disabled={!valid} onClick={() => onConfirm(name.trim())}>
            <Check className="h-4 w-4" /> Renommer
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ConfirmModal({
  confirm,
  onCancel,
  onConfirm,
}: {
  confirm: { project: DisplayProject; action: "delete" | "archive" };
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onCancel]);
  const del = confirm.action === "delete";
  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-900/45 p-6 backdrop-blur-sm" onClick={onCancel}>
      <div className="w-full max-w-[400px] overflow-hidden rounded-2xl bg-background shadow-xl animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 pt-6 pb-4 text-center">
          <div className={cn("mx-auto mb-3.5 flex h-[52px] w-[52px] items-center justify-center rounded-full", del ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600")}>
            {del ? <X className="h-6 w-6" /> : <Calendar className="h-6 w-6" />}
          </div>
          <div className="mb-1.5 text-lg font-extrabold">{del ? "Supprimer ce projet ?" : "Archiver ce projet ?"}</div>
          <div className="text-sm text-muted-foreground leading-relaxed">
            « {confirm.project.name} »
            {del ? " sera définitivement supprimé. Cette action est irréversible." : " sera déplacé dans les archives. Vous pourrez le restaurer."}
          </div>
        </div>
        <div className="flex gap-2.5 px-6 pb-6">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={onCancel}>Annuler</Button>
          <Button className={cn("flex-1 rounded-xl text-white", del ? "bg-red-600 hover:bg-red-700" : "bg-amber-600 hover:bg-amber-700")} onClick={onConfirm}>
            {del ? "Supprimer" : "Archiver"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function NewProjectDrawer({
  onClose,
  onCreated,
  onWizard,
  onCreate,
}: {
  onClose: () => void;
  onCreated: (p: DisplayProject) => void;
  onWizard: () => void;
  onCreate: (data: { name: string; members: number; status: string; icon: string }) => Promise<DisplayProject>;
}) {
  const [name, setName] = useState("");
  const [members, setMembers] = useState(4);
  const [status, setStatus] = useState("actif");
  const [icon, setIcon] = useState("Folder");
  const valid = name.trim().length > 0;
  const create = async () => {
    if (!valid) return;
    const p = await onCreate({ name: name.trim(), members: Math.max(1, +members || 1), status, icon });
    onCreated(p);
  };
  return (
    <MfDrawer
      title="Nouveau projet"
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose}>Annuler</Button>
          <Button className="flex-[2] rounded-xl gap-1.5" disabled={!valid} onClick={() => void create()}>
            <Check className="h-4 w-4" /> Créer le projet
          </Button>
        </>
      }
    >
      <label className="mb-4 block">
        <span className={lab}>Nom du projet</span>
        <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") void create(); }} placeholder="Ex. : Refonte du parcours client" className="rounded-lg" />
      </label>
      <div className="mb-4">
        <span className={lab}>Icône</span>
        <div className="flex flex-wrap gap-1.5">
          {PROJECT_ICONS.map((ic) => (
            <button
              key={ic}
              type="button"
              onClick={() => setIcon(ic)}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-[10px] border cursor-pointer",
                icon === ic ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground",
              )}
            >
              <ProjectIcon name={ic} size={17} />
            </button>
          ))}
        </div>
      </div>
      <div className="mb-4 grid grid-cols-2 gap-3">
        <label>
          <span className={lab}>Participants</span>
          <Input type="number" min={1} max={99} value={members} onChange={(e) => setMembers(Number(e.target.value))} className="rounded-lg" />
        </label>
        <div>
          <span className={lab}>Statut</span>
          <div className="flex gap-1.5">
            {[["actif", "Actif"], ["attente", "En attente"]].map(([id, l]) => (
              <button
                key={id}
                type="button"
                onClick={() => setStatus(id)}
                className={cn(
                  "flex-1 rounded-lg border py-2 text-xs font-bold cursor-pointer",
                  status === id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground",
                )}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-start gap-2 rounded-[10px] border border-primary/20 bg-primary/5 p-3 text-xs leading-relaxed text-muted-foreground">
        <Info className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
        <span>
          Pour démarrer directement une séance guidée (méthode, équipe, agenda),{" "}
          <button type="button" onClick={onWizard} className="font-bold text-primary cursor-pointer">utilisez l&apos;assistant de création</button>.
        </span>
      </div>
    </MfDrawer>
  );
}

function RowMenu({
  actions,
  onAction,
  onClose,
}: {
  actions: readonly { id: string; icon: string; label: string; danger?: boolean }[];
  onAction: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-50" onClick={onClose} />
      <div className="absolute top-[calc(100%+4px)] right-0 z-[51] min-w-[178px] rounded-[11px] border bg-background p-1 shadow-lg">
        {actions.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => onAction(a.id)}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-semibold cursor-pointer hover:bg-muted",
              a.danger && "text-red-600 hover:bg-red-50",
            )}
          >
            {a.label}
          </button>
        ))}
      </div>
    </>
  );
}

export { RowMenu };
