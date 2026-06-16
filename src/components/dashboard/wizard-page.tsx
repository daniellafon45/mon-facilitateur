"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useWizardStore } from "@/lib/store/wizard-store";
import { useFacilitationStore } from "@/lib/store/facilitation-store";
import { STEP_LABELS, STEP_KEYS, getStepPath, getStepRoute } from "@/lib/wizard/steps";
import {
  defaultRightCollapsed,
  getWizardContinueLabel,
  getWizardFooterHint,
  STEP_HAS_RIGHT_PANEL,
} from "@/lib/wizard/footer-config";
import { finishWizard } from "@/lib/wizard/finish-wizard";
import { PageTransition, type WizardDirection } from "@/components/ui/page-transition";
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
import { WizardTeamRail, buildPrepItems } from "@/components/wizard/wizard-team-rail";
import { RegistryToolModal, type RegistryToolId } from "@/components/wizard/registry-tool-modal";
import { WizardInviteStep, InvitePreviewPanel } from "@/components/wizard/wizard-invite-step";
import { WizardMethodFooterSummary } from "@/components/wizard/wizard-method-footer-summary";
import { GENRE_BY_ID } from "@/lib/methods/session-genres";
import { agendaTotalMinutes } from "@/lib/meetings/agenda-generator";
import { shouldExportBoardImage } from "@/lib/whiteboard/describe-board";
import { exportBoardImageBase64 } from "@/lib/whiteboard/export-board-image";
import type { WhiteboardBoardHandle } from "@/components/whiteboard/whiteboard-board";
import { getProjectUniverse, type ProjectTypeId } from "@/lib/wizard/project-types";
import type { SessionMode } from "@/types/facilitation";
import { WIZARD_DRAFT_PROJECT_ID, MEMBER_COLORS } from "@/lib/project/team-constants";
import { useProjectMembers } from "@/lib/hooks/use-project-members";
import { useWizardRegistry } from "@/lib/hooks/use-wizard-registry";
import { allMembersAssigned } from "@/lib/project/subgroups";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User } from "lucide-react";

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
  const [analyzing, setAnalyzing] = useState(false);
  const boardExportRef = useRef<WhiteboardBoardHandle | null>(null);
  const [genrePreviewId, setGenrePreviewId] = useState<string | null>(null);
  const [e4Tool, setE4Tool] = useState<RegistryToolId | null>(null);
  const [e4Conseils, setE4Conseils] = useState(false);
  const [soloWarnOpen, setSoloWarnOpen] = useState(false);
  const [teamsRailOpen, setTeamsRailOpen] = useState(false);
  const seedApplied = useRef(false);
  const explicitNavRef = useRef(false);
  const pendingStepKeyRef = useRef<string | null>(null);
  const [stepDirection, setStepDirection] = useState<WizardDirection>("forward");
  const finishingSnapshotRef = useRef<{ stepKey: string; stepIdx: number; path: string[] } | null>(null);

  const path = useMemo(() => getStepPath(wizard.mode), [wizard.mode]);
  const stepKey = path[wizard.stepIdx] ?? "0";
  const displayPath = finishing && finishingSnapshotRef.current ? finishingSnapshotRef.current.path : path;
  const displayStepKey =
    finishing && finishingSnapshotRef.current ? finishingSnapshotRef.current.stepKey : stepKey;
  const displayStepIdx =
    finishing && finishingSnapshotRef.current ? finishingSnapshotRef.current.stepIdx : wizard.stepIdx;
  const stepLabels = displayPath.map((k) => STEP_LABELS[k] ?? "Étape");

  useEffect(() => {
    const key = stepSlugToKey(stepSlug);
    if (!key) return;

    if (explicitNavRef.current) {
      const pending = pendingStepKeyRef.current;
      if (pending && key !== pending) return;
      explicitNavRef.current = false;
      pendingStepKeyRef.current = null;
      const idx = path.indexOf(key);
      if (idx >= 0) useWizardStore.getState().setStepIdx(idx);
      return;
    }

    const idx = path.indexOf(key);
    if (idx >= 0 && useWizardStore.getState().stepIdx !== idx) {
      useWizardStore.getState().setStepIdx(idx);
    }
  }, [stepSlug, path]);

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
  const teamProjectId = wizard.projectId ?? WIZARD_DRAFT_PROJECT_ID;
  const { members: teamMembers, addMember: addTeamMember } = useProjectMembers(teamProjectId);
  const { registry: teamRegistry } = useWizardRegistry(wizard.projectId, teamMembers.map((m) => m.displayName));
  const contacts = useFacilitationStore((s) => s.contacts);
  const savedTeams = useFacilitationStore((s) => s.teams);

  function navigateToStep(idx: number) {
    if (idx < 0 || idx >= path.length) return;
    setStepDirection(idx > wizard.stepIdx ? "forward" : "back");
    explicitNavRef.current = true;
    pendingStepKeyRef.current = path[idx];
    wizard.setStepIdx(idx);
    router.push(getStepRoute(path[idx]));
  }

  function goBack() {
    if (wizard.stepIdx === 0) {
      router.push("/dashboard");
      return;
    }
    setStepDirection("back");
    navigateToStep(wizard.stepIdx - 1);
  }

  function goToProjectType() {
    navigateToStep(0);
  }

  async function analyzeObjectiveAndRecommend() {
    const w = useWizardStore.getState();
    const genreEntry = w.genre ? GENRE_BY_ID[w.genre] : null;
    const universe = getProjectUniverse(w.ptype);

    let boardImage: string | null = null;
    if (
      !w.whiteboardTextMode &&
      shouldExportBoardImage(w.whiteboardElements, w.objective)
    ) {
      boardImage =
        (await boardExportRef.current?.exportImage()) ??
        (await exportBoardImageBase64(w.whiteboardElements));
    }

    const res = await fetch("/api/wizard/recommend-methods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        objective: w.objective,
        elements: w.whiteboardElements,
        boardImage,
        context: {
          mode: w.mode,
          ptype: w.ptype,
          ptypeTitle: universe?.title ?? "Non précisé",
          genreId: w.genre,
          genreTitle: genreEntry?.title ?? "Séance",
          genreCat: genreEntry?.cats[0] ?? "ideas",
          durationMin: w.genreMin || genreEntry?.idealMin || 75,
        },
      }),
    });

    if (!res.ok) throw new Error("Analyse impossible");

    const data = (await res.json()) as {
      objective: string;
      methodIds: string[];
      summary: string;
    };

    w.setObjective(data.objective);
    w.setMethods(data.methodIds, false);
    w.setMethodsAiSummary(data.summary);
  }

  function goNext() {
    if (finishing || analyzing) return;
    const nextIdx = wizard.stepIdx + 1;
    if (nextIdx >= path.length) return;
    navigateToStep(nextIdx);
  }

  async function handleWhiteboardContinue() {
    if (analyzing) return;
    setAnalyzing(true);
    try {
      await analyzeObjectiveAndRecommend();
      goNext();
    } catch {
      goNext();
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleFinish() {
    if (finishing) return;
    finishingSnapshotRef.current = {
      stepKey,
      stepIdx: wizard.stepIdx,
      path: [...path],
    };
    setFinishing(true);
    try {
      await finishWizard({ wizard: useWizardStore.getState(), facilitation, router });
    } catch {
      setFinishing(false);
      finishingSnapshotRef.current = null;
    }
  }

  function handleContinue() {
    if (stepKey === "e7") {
      void handleFinish();
      return;
    }
    if (stepKey === "1") {
      void handleWhiteboardContinue();
      return;
    }
    if (
      stepKey === "e4" &&
      wizard.mode === "equipe" &&
      teamMembers.length <= 1
    ) {
      setSoloWarnOpen(true);
      return;
    }
    goNext();
  }

  async function addSavedTeam(teamId: string) {
    const team = savedTeams.find((t) => t.id === teamId);
    if (!team) return;
    let added = 0;
    for (const contactId of team.memberIds) {
      const c = contacts.find((x) => x.id === contactId);
      if (!c || teamMembers.some((m) => m.contactId === c.id)) continue;
      await addTeamMember({
        contactId: c.id,
        displayName: c.name,
        email: c.email,
        color: MEMBER_COLORS[(teamMembers.length + added) % MEMBER_COLORS.length],
        accessRole: "Éditeur",
        meetingRole: c.role || "Participante",
      });
      added += 1;
    }
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
      case "e4": {
        if (wizard.mode === "atelier") {
          const groups = wizard.confirmedGroups ?? [];
          const memberIds = teamMembers.map((m) => m.id);
          return (
            groups.length > 0 &&
            allMembersAssigned(
              memberIds,
              groups,
              memberIds.filter((id) => !groups.some((g) => g.memberIds.includes(id))),
            )
          );
        }
        return true;
      }
      case "e7":
        return Boolean(wizard.meetingTitle.trim() && wizard.meetingDate && wizard.meetingStart);
      default:
        return true;
    }
  }

  const footerHint = getWizardFooterHint(displayStepKey, {
    genreTitle: selGenre?.title,
    genreDur: wizard.genreDur ?? selGenre?.dur,
    methodCount: wizard.methods.length,
    agendaBlocks: wizard.agendaPlan.length,
    agendaMin: agendaTotalMinutes(wizard.agendaPlan),
    objective: wizard.objective,
  });

  const continueLabel = getWizardContinueLabel(displayStepKey, wizard.mode, wizard.launchMode);

  const footerSlot =
    displayStepKey === "method" ? (
      <WizardMethodFooterSummary
        methods={wizard.methods}
        targetMin={wizard.genreMin || (wizard.genre ? GENRE_BY_ID[wizard.genre]?.idealMin : 0) || 75}
        onRemove={(id) => {
          const next = wizard.methods.filter((m) => m !== id);
          wizard.setMethods(next, true);
        }}
      />
    ) : undefined;

  const rightPanel = (() => {
    if (displayStepKey === "0") {
      return <ProjectTypePreviewPanel ptype={wizard.ptype} mode={wizard.mode} />;
    }
    if (displayStepKey === "genre" && previewGenre) {
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
    if (displayStepKey === "e4") {
      const prepItems = buildPrepItems({
        count: teamMembers.length,
        mode: wizard.mode,
        roleAssign: wizard.roleAssign,
        confirmedGroups: wizard.confirmedGroups,
        groupAssign: wizard.groupAssign,
        registry: teamRegistry,
        onOpenRaci: () => setE4Tool("raci"),
      });
      return (
        <WizardTeamRail
          count={teamMembers.length}
          mode={wizard.mode}
          prepItems={prepItems}
          showConseils={e4Conseils}
          onToggleConseils={() => setE4Conseils((v) => !v)}
          onAddTeam={(id) => void addSavedTeam(id)}
          savedTeamsOpen={teamsRailOpen}
        />
      );
    }
    if (displayStepKey === "e7") {
      return (
        <InvitePreviewPanel
          title={wizard.meetingTitle}
          date={wizard.meetingDate}
          start={wizard.meetingStart}
          end={wizard.meetingEnd}
          platform={wizard.meetingPlatform}
          agendaPlan={wizard.agendaPlan}
          members={wizard.members}
          confirmedGroups={wizard.confirmedGroups}
          launchMode={wizard.launchMode}
        />
      );
    }
    return null;
  })();

  const stepContent = (() => {
    switch (displayStepKey) {
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
        return <WizardWhiteboardStep boardExportRef={boardExportRef} />;
      case "method":
        return (
          <WizardMethodStep
            objective={wizard.objective}
            ptype={wizard.ptype}
            genreId={wizard.genre}
            genreMin={wizard.genreMin}
            methods={wizard.methods}
            methodsManual={wizard.methodsManual}
            methodsAiSummary={wizard.methodsAiSummary}
            onObjectiveChange={wizard.setObjective}
            onMethodsChange={wizard.setMethods}
          />
        );
      case "agenda":
        return (
          <WizardAgendaStep
            mode={wizard.mode}
            methodIds={wizard.methods}
            objective={wizard.objective}
            genreTitle={selGenre?.title}
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
            projectId={wizard.projectId}
            members={wizard.members}
            onMembersChange={wizard.setMembers}
            roleAssign={wizard.roleAssign}
            onRoleAssignChange={wizard.setRoleAssign}
            confirmedGroups={wizard.confirmedGroups}
            onGroupsChange={wizard.setConfirmedGroups}
            groupAssign={wizard.groupAssign}
            onGroupAssignChange={wizard.setGroupAssign}
            methodIds={wizard.methods}
            onModeChange={(m) => wizard.setMode(m)}
            showConseils={e4Conseils}
            onToggleConseils={() => setE4Conseils((v) => !v)}
            onScrollToTeams={() => {
              setE4Conseils(false);
              setTeamsRailOpen(true);
              wizard.setRightCollapsed(false);
            }}
            onOpenRegistryTool={setE4Tool}
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
            agendaPlan={wizard.agendaPlan}
            members={wizard.members}
            confirmedGroups={wizard.confirmedGroups}
            inviteMode={wizard.inviteMode}
            onInviteModeChange={wizard.setInviteMode}
            onMembersChange={wizard.setMembers}
            onChange={wizard.setMeetingDetails}
            onSaveDraft={() => void wizard.persistDraft()}
          />
        );
      default:
        return null;
    }
  })();

  const hasRightPanel =
    displayStepKey === "0" ||
    Boolean(STEP_HAS_RIGHT_PANEL[displayStepKey] && (displayStepKey !== "genre" || previewGenre) && rightPanel);

  return (
    <>
    <WizardShell
        steps={stepLabels}
        current={displayStepIdx}
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
        footerSlot={footerSlot}
        continueLabel={analyzing ? "Amaris analyse…" : continueLabel}
        onContinue={handleContinue}
        continueDisabled={!canContinue()}
        loading={finishing || analyzing}
        fullBleed={displayStepKey === "1"}
        busyOverlay={finishing}
      >
        <PageTransition
          transitionKey={stepSlug}
          variant="wizard"
          direction={stepDirection}
        >
          {stepContent}
        </PageTransition>
      </WizardShell>
      {displayStepKey === "e4" && (
        <RegistryToolModal
          tool={e4Tool}
          projectId={wizard.projectId}
          memberNames={teamMembers.map((m) => m.displayName)}
          onClose={() => setE4Tool(null)}
        />
      )}

      <Dialog open={soloWarnOpen} onOpenChange={setSoloWarnOpen}>
        <DialogContent className="max-w-md text-center">
          <DialogHeader className="items-center">
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <User className="h-7 w-7" />
            </div>
            <DialogTitle>Vous êtes seul dans cette rencontre</DialogTitle>
            <DialogDescription className="text-center">
              Aucun autre participant n&apos;est ajouté. Vous pouvez inviter des personnes, ou
              continuer en séance solo.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button type="button" variant="outline" className="w-full" onClick={() => setSoloWarnOpen(false)}>
              Ajouter des personnes
            </Button>
            <Button
              type="button"
              className="w-full"
              onClick={() => {
                wizard.setMode("solo");
                setSoloWarnOpen(false);
                goNext();
              }}
            >
              Continuer en solo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function WizardPageWrapper({ stepSlug }: { stepSlug: string }) {
  return (
    <Suspense>
      <WizardPage stepSlug={stepSlug} />
    </Suspense>
  );
}
