"use client";

import { Check, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function TeamAtelierConfirmModal({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md text-center">
        <DialogHeader className="items-center text-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <Globe className="h-7 w-7" />
          </div>
          <DialogTitle>Passer en Grand atelier ?</DialogTitle>
          <DialogDescription className="text-center leading-relaxed">
            Votre rencontre passera en format <strong>Grand atelier</strong> : les sous-groupes
            deviennent le cœur de la séance (salles, facilitateurs et méthode par groupe). Vous
            pourrez revenir en arrière depuis l&apos;étape précédente.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
            Annuler
          </Button>
          <Button
            type="button"
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            onClick={onConfirm}
          >
            <Check className="mr-1 h-4 w-4" />
            Confirmer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
