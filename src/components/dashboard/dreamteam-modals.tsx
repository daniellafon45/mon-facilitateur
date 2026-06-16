"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Check, Loader2, Mail, Sparkles, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DreamTeamAvatar } from "@/components/dashboard/dreamteam-avatar";
import { DT_ROLES } from "@/lib/dreamteam/constants";
import { cn } from "@/lib/utils";
import type { DreamTeamContact } from "@/components/dashboard/dreamteam-kanban";

interface ContactModalProps {
  open: boolean;
  contact?: DreamTeamContact | null;
  onClose: () => void;
  onSave: (data: {
    name: string;
    role: string;
    email: string;
    photoFile: File | null;
    removePhoto: boolean;
  }) => Promise<void>;
  onGenerateAvatar?: (contactId: string) => Promise<string | null>;
}

export function DreamTeamContactModal({
  open,
  contact,
  onClose,
  onSave,
  onGenerateAvatar,
}: ContactModalProps) {
  const [name, setName] = useState(contact?.name ?? "");
  const [role, setRole] = useState(contact?.role ?? "Collaborateur");
  const [email, setEmail] = useState(contact?.email ?? "");
  const [busy, setBusy] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(contact?.avatarUrl ?? null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setName(contact?.name ?? "");
    setRole(contact?.role ?? "Collaborateur");
    setEmail(contact?.email ?? "");
    setPreviewUrl(contact?.avatarUrl ?? null);
    setPhotoFile(null);
    setRemovePhoto(false);
    setPhotoError("");
  }, [open, contact]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const valid = name.trim().length > 0;

  function onPickFile(file: File | null) {
    if (!file) return;
    setPhotoError("");
    if (!file.type.startsWith("image/")) {
      setPhotoError("Format non supporté. Utilisez JPG, PNG ou WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("La photo ne doit pas dépasser 5 Mo.");
      return;
    }
    setPhotoFile(file);
    setRemovePhoto(false);
    if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function clearPhoto() {
    setPhotoFile(null);
    setRemovePhoto(true);
    if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleGenerate() {
    if (!contact?.id || !onGenerateAvatar) return;
    setGenerating(true);
    try {
      const url = await onGenerateAvatar(contact.id);
      if (url) {
        setPreviewUrl(url);
        setPhotoFile(null);
        setRemovePhoto(false);
      }
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    if (!valid) return;
    setBusy(true);
    try {
      await onSave({
        name: name.trim(),
        role,
        email: email.trim(),
        photoFile,
        removePhoto,
      });
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{contact ? "Modifier le contact" : "Nouveau contact"}</DialogTitle>
          <DialogDescription>
            Seul le nom est requis. Cliquez sur la photo pour importer un portrait (JPG, PNG ou WebP).
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="group relative rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              title="Ajouter ou modifier la photo"
            >
              {previewUrl ? (
                <DreamTeamAvatar name={name || "?"} size={56} avatarUrl={previewUrl} />
              ) : (
                <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/40 bg-muted transition-colors group-hover:border-primary group-hover:bg-primary/5">
                  <Camera className="h-6 w-6 text-muted-foreground transition-colors group-hover:text-primary" />
                </span>
              )}
              {previewUrl && (
                <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <Camera className="h-5 w-5 text-white" />
                </span>
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold">{name.trim() || "Nouveau contact"}</p>
            <p className="text-xs text-muted-foreground">{email.trim() || "Aucune coordonnée"}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 rounded-lg text-xs"
                onClick={() => fileRef.current?.click()}
              >
                <Camera className="h-3 w-3" /> {previewUrl ? "Changer la photo" : "Ajouter une photo"}
              </Button>
              {contact?.id && onGenerateAvatar && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 rounded-lg text-xs"
                  disabled={generating || !name.trim()}
                  onClick={() => void handleGenerate()}
                >
                  {generating ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3" />
                  )}
                  Portrait IA
                </Button>
              )}
              {(previewUrl || contact?.avatarUrl) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 rounded-lg text-xs text-destructive"
                  onClick={clearPhoto}
                >
                  <X className="h-3 w-3" /> Retirer
                </Button>
              )}
            </div>
            {photoError && <p className="mt-1.5 text-xs font-semibold text-destructive">{photoError}</p>}
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dt-name">Nom</Label>
            <Input
              id="dt-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex. Alex Tremblay"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dt-role">Rôle · facultatif</Label>
            <select
              id="dt-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
            >
              {DT_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dt-email">E-mail · facultatif</Label>
            <div className="flex items-center gap-2 rounded-lg border border-input px-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Input
                id="dt-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ex. alex@mail.com"
                className="border-0 px-0 shadow-none focus-visible:ring-0"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={() => void handleSave()} disabled={!valid || busy || generating}>
            <Check className="h-4 w-4" />
            {contact ? "Enregistrer" : "Créer le contact"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface TeamModalProps {
  open: boolean;
  team?: { id: string; name: string; memberIds: string[] } | null;
  contacts: DreamTeamContact[];
  onClose: () => void;
  onSave: (data: { name: string; memberIds: string[] }) => Promise<void>;
}

export function DreamTeamTeamModal({ open, team, contacts, onClose, onSave }: TeamModalProps) {
  const [name, setName] = useState(team?.name ?? "");
  const [picked, setPicked] = useState<string[]>(team?.memberIds ?? []);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(team?.name ?? "");
    setPicked(team?.memberIds ?? []);
  }, [open, team]);

  const valid = name.trim().length > 0;

  function toggle(id: string) {
    setPicked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function handleSave() {
    if (!valid) return;
    setBusy(true);
    try {
      await onSave({ name: name.trim(), memberIds: picked });
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{team ? "Modifier l'équipe" : "Nouvelle équipe"}</DialogTitle>
          <DialogDescription>
            Donnez un nom à l&apos;équipe et sélectionnez ses membres parmi vos contacts.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="dt-team-name">Nom de l&apos;équipe</Label>
          <Input
            id="dt-team-name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ex. Cohorte automne 2026"
          />
        </div>

        <div className="flex items-center justify-between text-sm font-semibold">
          <span>Membres</span>
          <span className="text-primary">
            {picked.length} sélectionné{picked.length > 1 ? "s" : ""}
          </span>
        </div>

        <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
          {contacts.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">Créez d&apos;abord des contacts.</p>
          ) : (
            contacts.map((c) => {
              const on = picked.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggle(c.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition-colors",
                    on ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-muted/40",
                  )}
                >
                  <DreamTeamAvatar name={c.name} size={32} avatarUrl={c.avatarUrl} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{c.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{c.email || "Aucune coordonnée"}</p>
                  </div>
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
                      on ? "border-primary bg-primary text-primary-foreground" : "border-border",
                    )}
                  >
                    {on ? <Check className="h-3 w-3" /> : null}
                  </span>
                </button>
              );
            })
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={() => void handleSave()} disabled={!valid || busy}>
            <Check className="h-4 w-4" />
            {team ? "Enregistrer" : "Créer l'équipe"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
