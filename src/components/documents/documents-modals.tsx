"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  Download,
  Folder,
  Link2,
  Pencil,
  Plus,
  Star,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDocumentsStore } from "@/lib/store/documents-store";
import { DOC_OWNERS, docTypeFromName, fmtSize, sourceLabel } from "@/lib/documents/constants";
import { DocBadge } from "@/components/documents/doc-badge";
import { OwnerDot } from "@/components/documents/owner-dot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { DocItem } from "@/lib/documents/types";
import type { Meeting, Project } from "@/types/facilitation";
import { fmtDate, fmtTime, docTypeColor } from "@/lib/documents/constants";

interface ProjectRef {
  id: string;
  name: string;
}

interface MeetingRef {
  id: string;
  name: string;
  date: string;
  projectId?: string | null;
}

// ── Upload ────────────────────────────────────────────────────

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  flash: (msg: string) => void;
  projects: ProjectRef[];
  meetings: MeetingRef[];
}

export function UploadModal({ open, onClose, flash, projects, meetings }: UploadModalProps) {
  const add = useDocumentsStore((s) => s.add);
  const [stage, setStage] = useState<"form" | "uploading" | "done" | "error">("form");
  const [file, setFile] = useState<{ name: string; size: number } | null>(null);
  const [name, setName] = useState("");
  const [projectId, setProjectId] = useState("");
  const [meetingId, setMeetingId] = useState("");
  const [fav, setFav] = useState(false);
  const [drag, setDrag] = useState(false);
  const [pct, setPct] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setStage("form");
      setFile(null);
      setName("");
      setProjectId("");
      setMeetingId("");
      setFav(false);
      setPct(0);
    }
  }, [open]);

  const meetingsForProject = meetings.filter(
    (m) => !projectId || m.projectId === projectId,
  );

  function pickFile(f: File | undefined) {
    if (!f) return;
    setFile({ name: f.name, size: f.size });
    if (!name) setName(f.name);
  }

  function submit() {
    const fileName =
      file?.name ||
      (name && (/\.\w+$/.test(name) ? name : `${name}.docx`)) ||
      "Nouveau document.docx";
    setStage("uploading");
    setPct(0);
    const iv = window.setInterval(() => {
      setPct((p) => {
        const np = p + Math.round(8 + Math.random() * 22);
        if (np >= 100) {
          window.clearInterval(iv);
          if (Math.random() < 0.07) {
            setStage("error");
            return 100;
          }
          const meeting = meetings.find((m) => m.id === meetingId);
          add({
            name: name || fileName,
            type: docTypeFromName(fileName),
            projectId: projectId || meeting?.projectId || null,
            meetingId: meetingId || null,
            size: file?.size,
            fav,
            source: "manuel",
          });
          setStage("done");
          return 100;
        }
        return np;
      });
    }, 180);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle>Nouveau document</DialogTitle>
          <DialogDescription>
            Téléversez un fichier et rattachez-le à un projet ou une réunion.
          </DialogDescription>
        </DialogHeader>

        {stage === "form" && (
          <div className="space-y-4">
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={(e) => pickFile(e.target.files?.[0])}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDrag(false);
                pickFile(e.dataTransfer.files?.[0]);
              }}
              className={cn(
                "w-full rounded-2xl border-2 border-dashed p-6 text-center transition-colors",
                drag ? "border-foreground bg-muted/60" : "border-border bg-muted/30 hover:bg-muted/50",
              )}
            >
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <DocBadge type={docTypeFromName(file.name)} size={40} />
                  <div className="text-left">
                    <p className="text-sm font-bold">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{fmtSize(file.size)}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div>
                  <Download className="mx-auto mb-2 h-7 w-7 text-foreground/70" />
                  <p className="text-sm font-bold">Glissez un fichier ici ou cliquez pour parcourir</p>
                  <p className="mt-1 text-xs text-muted-foreground">PDF, DOCX, XLSX, PPTX, PNG… jusqu&apos;à 20 Mo</p>
                </div>
              )}
            </button>

            <div>
              <Label>Nom du document</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex. Compte rendu Atelier accueil"
                className="mt-1.5 rounded-xl"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Projet</Label>
                <Select value={projectId || "_none"} onValueChange={(v) => { setProjectId(v === "_none" ? "" : v); setMeetingId(""); }}>
                  <SelectTrigger className="mt-1.5 rounded-xl">
                    <SelectValue placeholder="Aucun projet" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Aucun projet</SelectItem>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Réunion (optionnel)</Label>
                <Select value={meetingId || "_none"} onValueChange={(v) => setMeetingId(v === "_none" ? "" : v)}>
                  <SelectTrigger className="mt-1.5 rounded-xl">
                    <SelectValue placeholder="Aucune réunion" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Aucune réunion</SelectItem>
                    {meetingsForProject.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
              <Checkbox checked={fav} onCheckedChange={(v) => setFav(!!v)} />
              Marquer comme favori
            </label>
          </div>
        )}

        {stage === "uploading" && (
          <div className="py-8 text-center">
            <p className="mb-4 font-bold">Téléversement en cours…</p>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-foreground transition-all" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{pct}%</p>
          </div>
        )}

        {stage === "done" && (
          <div className="py-8 text-center">
            <CheckCircle2 className="mx-auto mb-3 h-14 w-14 text-emerald-600" />
            <p className="text-base font-extrabold">Document ajouté</p>
            <p className="mt-1 text-sm text-muted-foreground">Il apparaît en haut de votre liste.</p>
          </div>
        )}

        {stage === "error" && (
          <div className="py-8 text-center">
            <X className="mx-auto mb-3 h-14 w-14 text-destructive" />
            <p className="text-base font-extrabold">Échec du téléversement</p>
            <p className="mt-1 text-sm text-muted-foreground">Vous pouvez réessayer.</p>
          </div>
        )}

        <DialogFooter className="gap-2 sm:justify-between">
          {stage === "form" && (
            <>
              <span className="text-xs text-muted-foreground">Vos documents restent confidentiels.</span>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={onClose}>Annuler</Button>
                <Button disabled={!file && !name} onClick={submit}>
                  <Plus className="mr-1 h-4 w-4" /> Ajouter
                </Button>
              </div>
            </>
          )}
          {stage === "done" && (
            <Button className="ml-auto" onClick={() => { flash("Document ajouté à votre bibliothèque"); onClose(); }}>
              Terminé
            </Button>
          )}
          {stage === "error" && (
            <>
              <Button variant="ghost" onClick={onClose}>Annuler</Button>
              <Button onClick={submit}>Réessayer</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Share ─────────────────────────────────────────────────────

interface ShareModalProps {
  doc: DocItem | null;
  open: boolean;
  onClose: () => void;
  flash: (msg: string) => void;
}

export function ShareModal({ doc, open, onClose, flash }: ShareModalProps) {
  const share = useDocumentsStore((s) => s.share);
  const get = useDocumentsStore((s) => s.get);
  const d = doc ? get(doc.id) || doc : null;
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [access, setAccess] = useState<"view" | "edit">("view");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (d) setSel(new Set(d.sharedWith || []));
  }, [d]);

  if (!d) return null;
  const others = Object.keys(DOC_OWNERS).filter((k) => k !== d.owner);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DocBadge type={d.type} size={36} />
            <div className="min-w-0">
              <DialogTitle>Partager le document</DialogTitle>
              <DialogDescription className="truncate">{d.name}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-xl border bg-muted/40 px-3 py-2">
            <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="flex-1 truncate text-xs text-muted-foreground">
              app.monfacilitateur.io/d/{d.id}
            </span>
            <Button
              size="sm"
              variant="secondary"
              className="shrink-0 rounded-lg"
              onClick={() => { setCopied(true); window.setTimeout(() => setCopied(false), 1600); }}
            >
              {copied ? "Copié ✓" : "Copier"}
            </Button>
          </div>

          <div className="flex gap-2">
            {[{ k: "view" as const, l: "Lecture seule" }, { k: "edit" as const, l: "Peut modifier" }].map((a) => (
              <button
                key={a.k}
                type="button"
                onClick={() => setAccess(a.k)}
                className={cn(
                  "flex-1 rounded-xl border px-3 py-2 text-sm font-bold transition-colors",
                  access === a.k
                    ? "border-foreground bg-foreground/5 text-foreground"
                    : "border-border text-muted-foreground hover:bg-muted/50",
                )}
              >
                {a.l}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <Label>Membres de l&apos;équipe</Label>
            {others.map((k) => {
              const o = DOC_OWNERS[k];
              const on = sel.has(k);
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => {
                    const n = new Set(sel);
                    if (n.has(k)) n.delete(k);
                    else n.add(k);
                    setSel(n);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors",
                    on ? "border-foreground/30 bg-foreground/5" : "border-border hover:bg-muted/50",
                  )}
                >
                  <OwnerDot owner={k} showName={false} size={30} />
                  <span className="flex-1 text-sm font-bold">{o.name}</span>
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-md border",
                      on ? "border-foreground bg-foreground text-background" : "border-border",
                    )}
                  >
                    {on && <Check className="h-3 w-3" />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button
            onClick={() => {
              share(d.id, [...sel]);
              flash(
                sel.size
                  ? `Partagé avec ${sel.size} personne${sel.size > 1 ? "s" : ""}`
                  : "Partage retiré",
              );
              onClose();
            }}
          >
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Rename / Move / Confirm ───────────────────────────────────

export function RenameDialog({
  doc,
  open,
  onClose,
  flash,
}: {
  doc: DocItem | null;
  open: boolean;
  onClose: () => void;
  flash: (msg: string) => void;
}) {
  const rename = useDocumentsStore((s) => s.rename);
  const [v, setV] = useState(doc?.name ?? "");
  useEffect(() => { if (doc) setV(doc.name); }, [doc]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>Renommer le document</DialogTitle>
        </DialogHeader>
        <Input
          autoFocus
          value={v}
          onChange={(e) => setV(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && doc) {
              rename(doc.id, v);
              flash("Document renommé");
              onClose();
            }
          }}
          className="rounded-xl"
        />
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button
            onClick={() => {
              if (doc) {
                rename(doc.id, v);
                flash("Document renommé");
                onClose();
              }
            }}
          >
            Renommer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function MoveDialog({
  docs,
  open,
  onClose,
  flash,
  projects,
  meetings,
}: {
  docs: DocItem[];
  open: boolean;
  onClose: () => void;
  flash: (msg: string) => void;
  projects: ProjectRef[];
  meetings: MeetingRef[];
}) {
  const move = useDocumentsStore((s) => s.move);
  const [projectId, setProjectId] = useState("");
  const [meetingId, setMeetingId] = useState("");
  const meetingsForProject = meetings.filter((m) => !projectId || m.projectId === projectId);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>
            Déplacer {docs.length > 1 ? `${docs.length} documents` : "le document"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Projet de destination</Label>
            <Select value={projectId || "_none"} onValueChange={(v) => { setProjectId(v === "_none" ? "" : v); setMeetingId(""); }}>
              <SelectTrigger className="mt-1.5 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">Aucun projet</SelectItem>
                {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Réunion (optionnel)</Label>
            <Select value={meetingId || "_none"} onValueChange={(v) => setMeetingId(v === "_none" ? "" : v)}>
              <SelectTrigger className="mt-1.5 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">Aucune</SelectItem>
                {meetingsForProject.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button
            onClick={() => {
              docs.forEach((d) => move(d.id, projectId || null, meetingId || undefined));
              flash(docs.length > 1 ? `${docs.length} documents déplacés` : "Document déplacé");
              onClose();
            }}
          >
            Déplacer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  danger,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-left leading-relaxed">{body}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button
            variant={danger ? "destructive" : "default"}
            onClick={() => { onConfirm(); onClose(); }}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Preview drawer ────────────────────────────────────────────

interface PreviewDrawerProps {
  doc: DocItem | null;
  open: boolean;
  onClose: () => void;
  onShare: (d: DocItem) => void;
  flash: (msg: string) => void;
  projects: ProjectRef[];
  meetings: MeetingRef[];
  onOpenProject?: (p: ProjectRef) => void;
  onOpenMeeting?: (m: MeetingRef) => void;
}

export function PreviewDrawer({
  doc,
  open,
  onClose,
  onShare,
  flash,
  projects,
  meetings,
  onOpenProject,
  onOpenMeeting,
}: PreviewDrawerProps) {
  const get = useDocumentsStore((s) => s.get);
  const toggleFav = useDocumentsStore((s) => s.toggleFav);
  const d = doc ? get(doc.id) : null;

  if (!d) return null;
  const proj = projects.find((p) => p.id === d.projectId);
  const meet = meetings.find((m) => m.id === d.meetingId);
  const c = docTypeColor(d.type);

  const meta = [
    { label: "Type", val: d.type || "Dossier" },
    { label: "Taille", val: fmtSize(d.size) },
    { label: "Propriétaire", val: DOC_OWNERS[d.owner]?.name || d.owner },
    { label: "Modifié le", val: `${fmtDate(d.ts)} · ${fmtTime(d.ts)}` },
    { label: "Origine", val: sourceLabel(d.source) },
  ];

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-md">
        <SheetHeader className="flex-row items-center justify-between border-b px-5 py-4 space-y-0">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => toggleFav(d.id)}
            >
              <Star className={cn("h-4 w-4", d.fav ? "fill-amber-400 text-amber-400" : "text-muted-foreground")} />
            </Button>
            <SheetTitle className="text-sm font-bold text-muted-foreground">Aperçu</SheetTitle>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div
            className="mb-5 flex h-48 flex-col items-center justify-center gap-2 rounded-xl border"
            style={{
              background: `repeating-linear-gradient(45deg, ${c}0f, ${c}0f 10px, ${c}05 10px, ${c}05 20px)`,
            }}
          >
            <DocBadge type={d.type} size={54} />
            <p className="font-mono text-[11px] text-muted-foreground">
              aperçu {d.type || "dossier"} non disponible
            </p>
          </div>

          <h2 className="text-lg font-extrabold tracking-tight">{d.name}</h2>
          {d.shared && (
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
              <Users className="h-3 w-3" /> Partagé · {(d.sharedWith || []).length} pers.
            </span>
          )}

          <div className="mt-5 grid grid-cols-2 gap-3">
            {meta.map((m) => (
              <div key={m.label}>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  {m.label}
                </p>
                <p className="text-sm font-semibold">{m.val}</p>
              </div>
            ))}
          </div>

          <p className="mt-5 text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
            Rattaché à
          </p>
          <div className="mt-2 space-y-2">
            {proj && (
              <button
                type="button"
                onClick={() => onOpenProject?.(proj)}
                className="flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left hover:bg-muted/50"
              >
                <Folder className="h-4 w-4 text-foreground/70" />
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-muted-foreground">PROJET</p>
                  <p className="text-sm font-bold">{proj.name}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
            {meet && (
              <button
                type="button"
                onClick={() => onOpenMeeting?.(meet)}
                className="flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left hover:bg-muted/50"
              >
                <Calendar className="h-4 w-4 text-violet-600" />
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-muted-foreground">RÉUNION</p>
                  <p className="text-sm font-bold">{meet.name} · {meet.date}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
            {!proj && !meet && (
              <p className="text-sm text-muted-foreground">Aucune source rattachée.</p>
            )}
          </div>
        </div>

        <div className="flex gap-2 border-t bg-muted/30 p-4">
          <Button variant="secondary" className="flex-1 rounded-xl" onClick={() => flash(`Téléchargement de « ${d.name} »`)}>
            <Download className="mr-1 h-4 w-4" /> Télécharger
          </Button>
          <Button variant="secondary" className="flex-1 rounded-xl" onClick={() => onShare(d)}>
            <Users className="mr-1 h-4 w-4" /> Partager
          </Button>
          <Button className="flex-1 rounded-xl" onClick={() => flash("Ouverture de l'éditeur…")}>
            <Pencil className="mr-1 h-4 w-4" /> Ouvrir
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function mapProjects(projects: Project[]): ProjectRef[] {
  return projects.filter((p) => !p.archived).map((p) => ({ id: p.id, name: p.name }));
}

export function mapMeetings(meetings: Meeting[], projects: Project[]): MeetingRef[] {
  return meetings
    .filter((m) => !m.archived)
    .map((m) => {
      const proj = projects.find((p) => p.name === m.project || p.id === m.project);
      const date = m.dateISO
        ? new Date(m.dateISO).toLocaleDateString("fr-CA", { day: "numeric", month: "short", year: "numeric" })
        : "";
      return {
        id: m.id,
        name: m.name,
        date,
        projectId: proj?.id ?? null,
      };
    });
}
