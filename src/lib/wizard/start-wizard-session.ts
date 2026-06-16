import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useFacilitationStore } from "@/lib/store/facilitation-store";
import { useWizardStore } from "@/lib/store/wizard-store";
import type { SessionMode } from "@/types/facilitation";

export async function startWizardSession(
  router: AppRouterInstance,
  mode?: SessionMode,
) {
  sessionStorage.setItem("mf-wizard-skip-draft", "1");
  useFacilitationStore.getState().setWizardSeed("", null);
  await useWizardStore.getState().deleteDraft();
  if (mode) {
    useWizardStore.getState().setMode(mode);
  }
  router.push("/dashboard/wizard/project-type");
}
