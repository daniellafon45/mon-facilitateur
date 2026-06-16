"use client";

import { useState, type ComponentType, type CSSProperties } from "react";
import { Check, CheckCircle2, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
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
import { WizardRecoModal } from "@/components/wizard/wizard-reco-modal";
import { WizardAmarisButton } from "@/components/wizard/wizard-amaris-button";
import { WizardVisual } from "@/components/wizard/wizard-visual";

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
  const [recoOpen, setRecoOpen] = useState(false);

  return (
    <div className="mx-auto max-w-[980px] space-y-8">
      <WizardRecoModal
        open={recoOpen}
        onClose={() => setRecoOpen(false)}
        onSelect={onPtypeChange}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="max-w-lg text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
            Que souhaitez-vous construire aujourd&apos;hui&nbsp;?
          </h1>
          <div className="mt-3 h-[3px] w-14 rounded-full bg-primary" />
        </div>
        <WizardAmarisButton className="self-start" onClick={() => setRecoOpen(true)} />
      </div>

      <section>
        <div className="mb-4 flex items-center gap-2.5">
          <StepNum n={1} />
          <span className="text-base font-extrabold">Votre univers</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PROJECT_UNIVERSES.map((u) => {
            const on = ptype === u.id;
            const fg = PAL[u.color];
            const bg = PAL_BG[u.color];
            const Icon = u.icon;
            return (
              <button
                key={u.id}
                type="button"
                onClick={() => onPtypeChange(u.id)}
                className={cn(
                  "relative flex flex-col items-center rounded-xl border bg-background p-3.5 text-left transition-all",
                  on ? "border-primary ring-2 ring-primary/20 shadow-sm" : "hover:border-primary/30",
                )}
                data-testid={`universe-${u.id}`}
              >
                <span
                  className="absolute right-3 top-3 z-10 flex size-[22px] items-center justify-center rounded-full"
                  style={{
                    border: on ? "none" : "2px solid var(--border)",
                    background: on ? fg : "var(--background)",
                  }}
                >
                  {on ? <Check className="size-3 text-white" /> : null}
                </span>
                <div className="relative mb-3.5 h-[118px] w-full overflow-hidden rounded-xl">
                  <WizardVisual
                    imageSrc={u.imageSrc}
                    icon={Icon}
                    alt={u.label}
                    fill
                    imageClassName="rounded-xl"
                    iconClassName="size-8"
                    iconStyle={{ color: fg }}
                  />
                  <div
                    className="pointer-events-none absolute inset-0 rounded-xl"
                    style={{ background: `linear-gradient(160deg, ${bg}66, transparent 70%)` }}
                  />
                </div>
                <div className="mb-2 text-center text-[15px] font-extrabold tracking-tight">{u.label}</div>
                <div
                  className="h-[3px] rounded-full transition-all"
                  style={{ width: on ? 34 : 24, background: on ? fg : "var(--border)" }}
                />
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2.5">
          <StepNum n={2} />
          <span className="text-base font-extrabold">Mode de travail</span>
        </div>
        <div className="flex flex-wrap gap-6">
          {WORK_MODES.map((m) => {
            const on = mode === m.id;
            const fg = PAL[m.color];
            const bg = PAL_BG[m.color];
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onModeChange(m.id)}
                className="bg-transparent p-0"
                data-testid={`mode-${m.id}`}
              >
                <div
                  className={cn(
                    "relative flex size-[168px] flex-col items-center justify-center gap-2 overflow-hidden rounded-full border-2 transition-all sm:size-[184px]",
                    on ? "border-primary ring-2 ring-primary/20 shadow-sm" : "border-border hover:border-primary/30",
                  )}
                  style={on && !m.imageSrc ? { background: bg } : undefined}
                >
                  <WizardVisual
                    imageSrc={m.imageSrc}
                    icon={Icon}
                    alt={m.label}
                    fill
                    imageClassName="rounded-full"
                    iconClassName="size-[34px]"
                    iconStyle={{ color: fg }}
                  />
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: m.imageSrc
                        ? on
                          ? `${bg}cc`
                          : "rgba(0,0,0,0.12)"
                        : on
                          ? bg
                          : "var(--background)",
                    }}
                  />
                  <div
                    className="absolute inset-[13px] rounded-full border"
                    style={{ borderColor: on ? `${fg}4d` : "var(--border)" }}
                  />
                  <div className="relative z-[1] text-[15px] font-extrabold whitespace-nowrap text-foreground">
                    {m.label}
                  </div>
                  <span
                    className="absolute bottom-[26px] z-[1] flex size-5 items-center justify-center rounded-full"
                    style={{
                      border: on ? "none" : "2px solid var(--border)",
                      background: on ? fg : "var(--background)",
                    }}
                  >
                    {on ? <Check className="size-[11px] text-white" /> : null}
                  </span>
                </div>
              </button>
            );
          })}
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
              icon={selType.icon}
              imageSrc={selType.imageSrc}
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
              icon={selFormat.icon}
              imageSrc={selFormat.imageSrc}
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
  icon: Icon,
  imageSrc,
}: {
  label: string;
  color: keyof typeof PAL;
  icon: ComponentType<{ className?: string; style?: CSSProperties }>;
  imageSrc?: string;
}) {
  const fg = PAL[color];
  const bg = PAL_BG[color];
  return (
    <div className="flex items-center gap-2.5 rounded-xl border p-3" style={{ borderColor: fg, background: bg }}>
      <div className="relative size-8 shrink-0 overflow-hidden rounded-full" style={{ background: bg, color: fg }}>
        <WizardVisual
          imageSrc={imageSrc}
          icon={Icon}
          alt={label}
          fill
          imageClassName="rounded-full"
          iconClassName="size-4"
        />
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
