"use client";

import { Clock, Play, Sparkles, Users } from "lucide-react";
import type { ElementType } from "react";
import type { LibMethodItem } from "@/lib/methods/library-data";
import { getMethodIllustration } from "@/lib/methods/method-images";
import { getMethodMarketingCopy } from "@/lib/methods/method-marketing-copy";
import { MethodIcon } from "@/components/modeles/method-icon";
import { WorkflowBuilderCard } from "@/components/ui/workflow-builder-card";

const ACTION_BG: Record<string, string> = {
  blue: "bg-blue-500",
  green: "bg-emerald-500",
  violet: "bg-violet-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  red: "bg-red-500",
  slate: "bg-slate-600",
};

const FACILITATOR_AVATARS = [
  { src: "https://ui-avatars.com/api/?name=Facilitateur&background=0f172a&color=fff&size=64", fallback: "F" },
  { src: "https://ui-avatars.com/api/?name=Equipe&background=2563eb&color=fff&size=64", fallback: "E" },
  { src: "https://ui-avatars.com/api/?name=Groupe&background=059669&color=fff&size=64", fallback: "G" },
];

function makeMethodIcon(iconName: string): ElementType<{ className?: string }> {
  const Wrapped = ({ className }: { className?: string }) => (
    <MethodIcon name={iconName} className={className} />
  );
  Wrapped.displayName = `MethodIcon_${iconName}`;
  return Wrapped;
}

interface MethodWorkflowCardProps {
  item: LibMethodItem;
  familyLabel?: string;
  familyId?: string;
  onOpen: () => void;
}

export function MethodWorkflowCard({ item, familyLabel, familyId, onOpen }: MethodWorkflowCardProps) {
  const MethodIconAction = makeMethodIcon(item.icon);
  const bg = ACTION_BG[item.color] ?? ACTION_BG.blue;

  return (
    <WorkflowBuilderCard
      imageUrl={getMethodIllustration(item.id, familyId)}
      status="Active"
      lastUpdated={familyLabel ?? "Méthode"}
      title={item.title}
      description={getMethodMarketingCopy(item.id, item.desc)}
      tags={[
        familyLabel ?? "Facilitation",
        item.qt ? "Essai libre" : item.full ? "Canevas complet" : "Modèle guidé",
      ]}
      users={FACILITATOR_AVATARS}
      actions={[
        { Icon: MethodIconAction, bgColor: bg },
        { Icon: Play, bgColor: "bg-foreground" },
        { Icon: item.qt ? Sparkles : Users, bgColor: "bg-sky-500" },
      ]}
      onClick={onOpen}
    />
  );
}

export function SeanceToolCard({ item, onOpen }: { item: LibMethodItem; onOpen: () => void }) {
  return (
    <MethodWorkflowCard
      item={item}
      familyLabel="Outil de séance"
      familyId="seance"
      onOpen={onOpen}
    />
  );
}

export function PersoWorkflowCard({
  name,
  methodCount,
  dateStr,
  imageUrl,
  onRemove,
}: {
  name: string;
  methodCount: number;
  dateStr: string;
  imageUrl: string;
  onRemove: () => void;
}) {
  return (
    <WorkflowBuilderCard
      imageUrl={imageUrl}
      status="Active"
      lastUpdated={`Créé le ${dateStr}`}
      title={name}
      description={`Votre séquence personnalisée : ${methodCount} méthode${methodCount > 1 ? "s" : ""} prêtes à réutiliser pour vos prochaines rencontres — sans tout reconfigurer.`}
      tags={["Modèle perso", "Réutilisable"]}
      users={FACILITATOR_AVATARS.slice(0, 2)}
      actions={[
        { Icon: Clock, bgColor: "bg-amber-500" },
        { Icon: Sparkles, bgColor: "bg-violet-500" },
        { Icon: Play, bgColor: "bg-foreground" },
      ]}
      onMenuClick={() => onRemove()}
    />
  );
}
