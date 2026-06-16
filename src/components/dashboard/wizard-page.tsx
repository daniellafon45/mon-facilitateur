"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { useWizardStore } from "@/lib/store/wizard-store";
import { useFacilitationStore } from "@/lib/store/facilitation-store";
import { STEP_KEYS, getStepPath, getStepRoute, getHeaderStepLabels } from "@/lib/wizard/steps";
import {
  defaultRightCollapsed,
  getWizardContinueLabel,
  getWizardFooterHint,
  STEP_HAS_RIGHT_PANEL,
} from "@/lib/wizard/footer-config";
import { finishWizard } from "@/lib/wizard/finish-wizard";
import { WizardShell } from "@/components/wizard/wizard-shell";
import {
  WizardProjectTypeStep,
  ProjectTypePreviewPanel,
} from "@/components/wizard/wizard-project-type-step";
import { WizardGenreStep, GenrePreviewPanel } from "@/components/wizard/wizard-genre-step";
import { WizardWhiteboardStep } from "@/components/wizard/wizard-whiteboard-step";
import { WizardMethodStep } from "@/components/wizard/wizard-method-step";
import { WizardAgendaStep } from "@/components/wizard/wizard-agenda-step";
import { WizardSoloConfigStep } from "@/components/wizard/wizard-solo-config-step";
import { WizardTeamStep } from "@/components/wizard/wizard-team-step";
import { WizardInviteStep, InvitePreviewPanel } from "@/components/wizard/wizard-invite-step";
import { GENRE_BY_ID } from "@/lib/methods/session-genres";
import { agendaTotalMinutes } from "@/lib/meetings/agenda-generator";
import { objectiveFromWhiteboard } from "@/lib/whiteboard/objective-from-board";
import type { ProjectTypeId } from "@/lib/wizard/project-types";
import type { SessionMode } from "@/types/facilitation";

function stepSlugToKey(stepSlug: string) {
  return Object.entries(STEP_KEYS).find(([, slug]) => slug === stepSlug)?.[0] ?? null;
}

export function WizardPage({ stepSlug }: { stepSlug: string }) {
  const router = useRouter();
  const facilitation = useFacilitationStore();
  const wizardObjective = useFacilitationStore((s) => s.wizardObjective);
  const wizardSeedMode = useFacilitationStore((s) => s.wizardMode);
  const wizardSeedMethodIds = useFacilitationStore((s) => s.wizardMethodIds);
  const setWizardSeed = useFacilitationStore((s) => s.setWizardSeed);
  const wizard = useWizardStore();
  const [finishing, setFinishing] = useState(false);
  const [genrePreviewId, setGenrePreviewId] = useState<string | null>(null);
  const seedApplied = useRef(false);
  const explicitNavRef = useRef(false);

  const path = getStepPath(wizard.mode);
  const stepKey = path[wizard.stepIdx] ?? "0";
  const headerStepLabels = getHeaderStepLabels(wizard.mode);
  const currentSlug = STEP_KEYS[stepKey] ?? stepSlug;

  useEffect(() => {
    if (stepSlug === "project-type" && wizard.mode && wizard.ptype) {
      if (!explicitNavRef.current) {
        const autoPath = getStepPath(wizard.mode);
        const idx = Math.max(1, wizard.stepIdx);
        const key = autoPath[idx] ?? "genre";
        if (wizard.stepIdx < idx) useWizardStore.getState().setStepIdx(idx);
        router.replace(getStepRoute(key));
        return;
      }
      if (useWizardStore.getState().stepIdx !== 0) {
        useWizardStore.getState().setStepIdx(0);
      }
      explicitNavRef.current = false;
      return;
    }

    explicitNavRef.current = false;

    const key = stepSlugToKey(stepSlug);
    if (!key) return;
    const idx = path.indexOf(key);
    if (idx < 0) return;
    if (useWizardStore.getState().stepIdx !== idx) {
      useWizardStore.getState().setStepIdx(idx);
    }
  }, [stepSlug, wizard.mode, wizard.genre, wizard.ptype, wizard.stepIdx, path, router]);

  useEffect(() => {
    if (STEP_HAS_RIGHT_PANEL[stepKey]) {
      useWizardStore.getState().setRightCollapsed(defaultRightCollapsed(stepKey));
    }
  }, [stepKey]);

  useEffect(() => {
    if (stepKey !== "genre") setGenrePreviewId(null);
  }, [stepKey]);

  useEffect(() => {
    if (seedApplied.current) return;
    const hasSeed = Boolean(wizardObjective) || wizardSeedMode != null || wizardSeedMethodIds.length > 0;
    if (!hasSeed) return;
    const w = useWizardStore.getState();
    if (wizardObjective) w.setObjective(wizardObjective);
    if (wizardSeedMode != null) w.setMode(wizardSeedMode);
    if (wizardSeedMethodIds.length) w.setMethods(wizardSeedMethodIds, true);
    setWizardSeed("", null, []);
    seedApplied.current = true;
  }, [wizardObjective, wizardSeedMode, wizardSeedMethodIds, setWizardSeed]);

  const selGenre = wizard.genre ? GENRE_BY_ID[wizard.genre] : null;
  const previewGenre = GENRE_BY_ID[genrePreviewId ?? wizard.genre ?? ""] ?? null;

  function navigateToStep(idx: number) {
    if (idx < 0 || idx >= path.length) return;
    explicitNavRef.current = true;
    wizard.setStepIdx(idx);
    router.push(getStepRoute(path[idx]));
  }

  function goBack() {
    if (wizard.stepIdx === 0) {
      router.push("/dashboard");
      return;
    }
    navigateToStep(wizard.stepIdx - 1);
  }

  function goToProjectType() {
    navigateToStep(0);
  }

  function goNext() {
    if (finishing) return;
    if (currentSlug === "whiteboard") {
      if (!wizard.objective.trim() && wizard.whiteboardElements.length > 0) {
        wizard.setObjective(objectiveFromWhiteboard(wizard.whiteboardElements));
      }
    }
    const nextIdx = wizard.stepIdx + 1;
    if (nextIdx >= path.length) return;
    wizard.setStepIdx(nextIdx);
    router.push(getStepRoute(path[nextIdx]));
  }

  async function handleFinish() {
    if (finishing) return;
    setFinishing(true);
    try {
      await finishWizard({ wizard: useWizardStore.getState(), facilitation, router });
    } finally {
      setFinishing(false);
    }
  }

  function handleContinue() {
    if (stepKey === "e7") {
      void handleFinish();
      return;
    }
    goNext();
  }

  function canContinue(): boolean {
    switch (stepKey) {
      case "0":
        return Boolean(wizard.ptype && wizard.mode);
      case "genre":
        return Boolean(wizard.genre);
      case "1":
        return Boolean(wizard.objective.trim() || wizard.whiteboardElements.length > 0);
      case "method":
        return wizard.methods.length > 0;
      case "agenda":
        return wizard.agendaPlan.length > 0;
      case "e4":
        return wizard.mode !== "atelier" || Boolean(wizard.confirmedGroups?.length);
      case "e7":
        return Boolean(wizard.meetingTitle.trim() && wizard.meetingDate && wizard.meetingStart);
      default:
        return true;
    }
  }

  const footerHint = getWizardFooterHint(stepKey, {
    genreTitle: selGenre?.title,
    genreDur: wizard.genreDur ?? selGenre?.dur,
    methodCount: wizard.methods.length,
    agendaBlocks: wizard.agendaPlan.length,
    agendaMin: agendaTotalMinutes(wizard.agendaPlan),
    objective: wizard.objective,
  });

  const continueLabel = getWizardContinueLabel(stepKey, wizard.mode);

  const rightPanel = (() => {
    if (stepKey === "0") {
      return <ProjectTypePreviewPanel ptype={wizard.ptype} mode={wizard.mode} />;
    }
    if (stepKey === "genre" && previewGenre) {
      const isSelected = wizard.genre === previewGenre.id;
      return (
        <GenrePreviewPanel
          genre={previewGenre}
          genreDur={isSelected ? (wizard.genreDur ?? previewGenre.dur) : previewGenre.dur}
          genreMin={isSelected ? wizard.genreMin || previewGenre.idealMin : previewGenre.idealMin}
          genreCondensed={isSelected ? wizard.genreCondensed : false}
          selected={isSelected}
          onSelect={() => wizard.setGenre(previewGenre.id, previewGenre.idealMin, previewGenre.dur)}
          onAdjustDuration={(min, dur, condensed) =>
            wizard.setGenreMeta({ genreMin: min, genreDur: dur, genreCondensed: condensed })
          }
        />
      );
    }
    if (stepKey === "e7") {
      return <InvitePreviewPanel title={wizard.meetingTitle} agendaPlan={wizard.agendaPlan} />;
    }
    return null;
  })();

  const stepContent = (() => {
    switch (stepKey) {
      case "0":
        return (
          <WizardProjectTypeStep
            ptype={wizard.ptype}
            mode={wizard.mode}
            onPtypeChange={(id: ProjectTypeId) => wizard.setPtype(id)}
            onModeChange={(m) => wizard.setMode(m)}
          />
        );
      case "genre":
        return (
          <WizardGenreStep
            mode={(wizard.mode ?? "equipe") as SessionMode}
            genre={wizard.genre}
            genreDur={wizard.genreDur}
            genreMin={wizard.genreMin}
            genreCondensed={wizard.genreCondensed}
            onSelect={(g) => wizard.setGenre(g.id, g.idealMin, g.dur)}
            onAdjustDuration={(min, dur, condensed) =>
              wizard.setGenreMeta({ genreMin: min, genreDur: dur, genreCondensed: condensed })
            }
            onChangeMode={goToProjectType}
            onPreviewChange={setGenrePreviewId}
          />
        );
      case "1":
        return <WizardWhiteboardStep />;
      case "method":
        return (
          <WizardMethodStep
            objective={wizard.objective}
            genreId={wizard.genre}
            genreMin={wizard.genreMin}
            methods={wizard.methods}
            methodsManual={wizard.methodsManual}
            onObjectiveChange={wizard.setObjective}
            onMethodsChange={wizard.setMethods}
          />
        );
      case "agenda":
        return (
          <WizardAgendaStep
            mode={wizard.mode}
            methodIds={wizard.methods}
            genreMin={wizard.genreMin || 90}
            genreCondensed={wizard.genreCondensed}
            blocks={wizard.agendaPlan}
            pomodoro={wizard.agendaPomodoro}
            layout={wizard.agendaLayout}
            onChange={wizard.setAgendaPlan}
            onPomodoroChange={wizard.setAgendaPomodoro}
            onLayoutChange={wizard.setAgendaLayout}
          />
        );
      case "s4":
        return (
          <WizardSoloConfigStep
            music={wizard.soloMusic}
            tools={wizard.soloTools}
            onMusicChange={wizard.setSoloMusic}
            onToolsChange={wizard.setSoloTools}
          />
        );
      case "e4":
        return (
          <WizardTeamStep
            mode={wizard.mode}
            projectId={wizard.projectId ?? undefined}
            confirmedGroups={wizard.confirmedGroups}
            onGroupsChange={wizard.setConfirmedGroups}
          />
        );
      case "e7":
        return (
          <WizardInviteStep
            mode={wizard.mode}
            title={wizard.meetingTitle}
            date={wizard.meetingDate}
            start={wizard.meetingStart}
            end={wizard.meetingEnd}
            platform={wizard.meetingPlatform}
            link={wizard.meetingLink}
            launchMode={wizard.launchMode}
            agendaPlan={wizard.agendaPlan}
            onChange={wizard.setMeetingDetails}
            onSaveDraft={() => void wizard.persistDraft()}
          />
        );
      default:
        return null;
    }
  })();

  const hasRightPanel =
    stepKey === "0" ||
    Boolean(STEP_HAS_RIGHT_PANEL[stepKey] && (stepKey !== "genre" || previewGenre) && rightPanel);

  return (
    <DashboardShell>
      <WizardShell
        steps={headerStepLabels}
        current={wizard.stepIdx}
        mode={wizard.mode}
        ptype={wizard.ptype}
        onBack={goBack}
        onStepClick={(idx) => {
          if (idx < path.length) navigateToStep(idx);
        }}
        rightCollapsed={wizard.rightCollapsed}
        onToggleRight={() => wizard.setRightCollapsed(!wizard.rightCollapsed)}
        hasRightPanel={hasRightPanel}
        rightPanel={rightPanel}
        footerHint={footerHint}
        continueLabel={stepKey === "e7" ? (wizard.mode === "solo" ? "Lancer ma session" : "Lancer la rencontre") : continueLabel}
        onContinue={handleContinue}
        continueDisabled={!canContinue()}
        loading={finishing}
        fullBleed={stepKey === "1"}
      >
        {stepContent}
      </WizardShell>
    </DashboardShell>
  );
}

export function WizardPageWrapper({ stepSlug }: { stepSlug: string }) {
  return (
    <Suspense>
      <WizardPage stepSlug={stepSlug} />
    </Suspense>
  );
}
