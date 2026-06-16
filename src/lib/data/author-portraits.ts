import portraits from "./author-portraits.generated.json";

export function getAuthorPortrait(id: string): string {
  return portraits[id as keyof typeof portraits] ?? "/authors/placeholder.jpg";
}
