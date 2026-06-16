import { DT_AVATAR_COLORS, dtAvatarColor, dtInitials } from "@/lib/dreamteam/constants";

export const MSG_COLORS = DT_AVATAR_COLORS;

export function msgInitials(name: string) {
  return dtInitials(name);
}

export function msgTime() {
  return new Date().toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" });
}

export function contactColor(name: string, index = 0) {
  return dtAvatarColor(name, index);
}

export const CANNED_REPLIES = [
  "Bien reçu 👍",
  "Parfait, merci !",
  "Je m'en occupe.",
  "Ça me va.",
  "Bonne idée 💡",
  "On en reparle en séance.",
];
