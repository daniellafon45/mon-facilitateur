import { WizardPage } from "@/components/dashboard/wizard-page";

export default async function Page({
  params,
}: {
  params: Promise<{ step: string }>;
}) {
  const { step } = await params;
  return <WizardPage stepSlug={step} />;
}
