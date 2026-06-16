export interface ChatAttachment {
  id: string;
  name: string;
  content: string;
  size: number;
}

const MAX_ATTACHMENTS = 4;
const MAX_FILE_BYTES = 80_000;
const MAX_TOTAL_BYTES = 200_000;
const TEXT_EXTENSIONS = /\.(txt|md|csv|json|xml|html|htm|log|yml|yaml)$/i;

export function createAttachmentId() {
  return `att-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function canAddAttachments(current: ChatAttachment[], nextSize: number) {
  if (current.length >= MAX_ATTACHMENTS) {
    return { ok: false, reason: `Maximum ${MAX_ATTACHMENTS} documents.` };
  }
  if (nextSize > MAX_FILE_BYTES) {
    return { ok: false, reason: "Document trop volumineux (80 Ko max)." };
  }
  const total = current.reduce((sum, item) => sum + item.size, 0) + nextSize;
  if (total > MAX_TOTAL_BYTES) {
    return { ok: false, reason: "Limite totale des documents atteinte." };
  }
  return { ok: true as const };
}

export function isTextFile(file: File) {
  return (
    file.type.startsWith("text/") ||
    file.type === "application/json" ||
    TEXT_EXTENSIONS.test(file.name)
  );
}

export async function fileToAttachment(file: File): Promise<ChatAttachment | null> {
  if (!isTextFile(file)) return null;
  const content = await file.text();
  if (!content.trim()) return null;
  return {
    id: createAttachmentId(),
    name: file.name,
    content: content.slice(0, MAX_FILE_BYTES),
    size: Math.min(content.length, MAX_FILE_BYTES),
  };
}

export function formatMessageWithAttachments(
  text: string,
  attachments: ChatAttachment[],
): string {
  if (!attachments.length) return text;
  const docs = attachments
    .map((doc) => `--- Document : ${doc.name} ---\n${doc.content}`)
    .join("\n\n");
  const body = text.trim() || "(voir documents joints)";
  return `${body}\n\n[Documents joints]\n${docs}`;
}
