import wizardImages from "./wizard-images.generated.json";

export type WizardImageId = keyof typeof wizardImages;

export function wizardImageSrc(id: string): string | undefined {
  return id in wizardImages ? wizardImages[id as WizardImageId] : undefined;
}
