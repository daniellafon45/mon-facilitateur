"use client";

import { CheckCircle2, Shield } from "lucide-react";
import {
  PAL,
  PAL_BG,
  PROJECT_UNIVERSES,
  WORK_MODES,
  getProjectUniverse,
  getWorkMode,
  type ProjectTypeId,
} from "@/lib/wizard/project-types";
import type { SessionMode } from "@/types/facilitation";
import { getWizardIllustration, getWizardIllustrationFallback } from "@/lib/wizard/wizard-images";
import { WizardImageSelectCard } from "@/components/wizard/wizard-image-select-card";

function StepNum({ n }: { n: number }) {
  return (
    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-[13px] font-extrabold text-primary-foreground">
      {n}
    </span>
  );
}

interface WizardProjectTypeStepProps {
  ptype: string | null;
  mode: SessionMode | null;
  onPtypeChange: (id: ProjectTypeId) => void;
  onModeChange: (mode: SessionMode) => void;
}

export function WizardProjectTypeStep({
  ptype,
  mode,
  onPtypeChange,
  onModeChange,
}: WizardProjectTypeStepProps) {
  return (
    <div className="mx-auto max-w-[980px] space-y-8">
      <div>
        <h1 className="max-w-lg text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
          Que souhaitez-vous construire aujourd&apos;hui&nbsp;?
        </h1>
        <div className="mt-3 h-[3px] w-14 rounded-full bg-primary" />
      </div>

      <section>
        <div className="mb-4 flex items-center gap-2.5">
          <StepNum n={1} />
          <span className="text-base font-extrabold">Votre univers</span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PROJECT_UNIVERSES.map((u) => (
            <WizardImageSelectCard
              key={u.id}
              testId={`universe-${u.id}`}
              imageSrc={getWizardIllustration(u.id)}
              imageFallbackSrc={getWizardIllustrationFallback(u.id)}
              title={u.label}
              tag={u.tag}
              metaLabel="Univers"
              description={u.desc}
              selected={ptype === u.id}
              onClick={() => onPtypeChange(u.id)}
            />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2.5">
          <StepNum n={2} />
          <span className="text-base font-extrabold">Mode de travail</span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {WORK_MODES.map((m) => (
            <WizardImageSelectCard
              key={m.id}
              testId={`mode-${m.id}`}
              imageSrc={getWizardIllustration(m.id)}
              imageFallbackSrc={getWizardIllustrationFallback(m.id)}
              title={m.label}
              tag={m.title}
              metaLabel="Format"
              description={m.desc}
              selected={mode === m.id}
              onClick={() => onModeChange(m.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export function ProjectTypePreviewPanel({
  ptype,
  mode,
}: {
  ptype: string | null;
  mode: SessionMode | null;
}) {
  const selType = getProjectUniverse(ptype);
  const selFormat = getWorkMode(mode);

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex justify-center py-2">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <CheckCircle2 className="h-10 w-10" />
        </div>
      </div>
      <div>
        <div className="mb-3 text-[15px] font-extrabold">Votre sélection</div>
        <div className="flex flex-col gap-2">
          <div className="text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">
            Type de projet
          </div>
          {selType ? (
            <SelectionCard
              label={selType.title}
              color={selType.color}
              imageSrc={getWizardIllustrationFallback(selType.id) ?? getWizardIllustration(selType.id)}
            />
          ) : (
            <EmptySelection placeholder="Aucun type sélectionné" />
          )}
          <div className="mt-1 text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">
            Format
          </div>
          {selFormat ? (
            <SelectionCard
              label={selFormat.title}
              color={selFormat.color}
              imageSrc={getWizardIllustrationFallback(selFormat.id) ?? getWizardIllustration(selFormat.id)}
            />
          ) : (
            <EmptySelection placeholder="Aucun format sélectionné" />
          )}
        </div>
      </div>
      <p className="mt-auto flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
        <Shield className="size-3 shrink-0" />
        Vous pourrez changer plus tard
      </p>
    </div>
  );
}

function SelectionCard({
  label,
  color,
  imageSrc,
}: {
  label: string;
  color: keyof typeof PAL;
  imageSrc: string;
}) {
  const fg = PAL[color];
  const bg = PAL_BG[color];
  return (
    <div className="flex items-center gap-2.5 overflow-hidden rounded-xl border p-2" style={{ borderColor: fg, background: bg }}>
      <div className="relative size-12 shrink-0 overflow-hidden rounded-lg">
        <img src={imageSrc} alt="" className="size-full object-cover" />
      </div>
      <div className="min-w-0 flex-1 text-[13px] font-extrabold leading-tight">{label}</div>
      <CheckCircle2 className="size-4 shrink-0" style={{ color: fg }} />
    </div>
  );
}

function EmptySelection({ placeholder }: { placeholder: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
      {placeholder}
    </div>
  );
}
