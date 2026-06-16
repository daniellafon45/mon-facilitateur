export function resolveConflict(
  localUpdatedAt: string,
  externalUpdatedAt: string,
  policy: string = "last_write_wins",
): "local" | "external" {
  if (policy === "local_wins") return "local";
  if (policy === "external_wins") return "external";
  return new Date(localUpdatedAt) >= new Date(externalUpdatedAt) ? "local" : "external";
}
