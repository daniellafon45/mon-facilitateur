import type { SupabaseClient } from "@supabase/supabase-js";

const BUCKET = "avatars";
const EXTS = ["jpg", "png", "webp"] as const;

export function contactAvatarPath(ownerId: string, contactId: string, ext = "jpg") {
  return `${ownerId}/${contactId}.${ext}`;
}

function extFromFile(file: Blob & { name?: string }): (typeof EXTS)[number] {
  if (file.name) {
    const raw = file.name.split(".").pop()?.toLowerCase();
    if (raw === "jpeg" || raw === "jpg") return "jpg";
    if (raw === "png") return "png";
    if (raw === "webp") return "webp";
  }
  if (file.type.includes("png")) return "png";
  if (file.type.includes("webp")) return "webp";
  return "jpg";
}

export async function deleteContactAvatar(
  supabase: SupabaseClient,
  ownerId: string,
  contactId: string,
) {
  const paths = EXTS.map((ext) => contactAvatarPath(ownerId, contactId, ext));
  await supabase.storage.from(BUCKET).remove(paths);
}

export async function uploadContactAvatar(
  supabase: SupabaseClient,
  ownerId: string,
  contactId: string,
  file: Blob & { name?: string },
) {
  const ext = extFromFile(file);
  await deleteContactAvatar(supabase, ownerId, contactId);
  const path = contactAvatarPath(ownerId, contactId, ext);
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type || `image/${ext === "jpg" ? "jpeg" : ext}`,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return `${data.publicUrl}?t=${Date.now()}`;
}

export async function uploadContactAvatarBytes(
  supabase: SupabaseClient,
  ownerId: string,
  contactId: string,
  bytes: ArrayBuffer,
  contentType = "image/jpeg",
) {
  const blob = new Blob([bytes], { type: contentType });
  return uploadContactAvatar(supabase, ownerId, contactId, blob);
}
