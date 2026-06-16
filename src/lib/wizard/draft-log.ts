export function logDraftError(operation: string, error: unknown) {
  if (process.env.NODE_ENV !== "development") return;
  const message = error instanceof Error ? error.message : String(error);
  console.warn(`[wizard-draft] ${operation} failed:`, message);
}
