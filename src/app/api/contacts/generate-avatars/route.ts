import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { uploadContactAvatarBytes } from "@/lib/dreamteam/avatar";
import {
  buildContactPortraitPrompt,
  generatePortraitWithNanoBanana2,
} from "@/lib/dreamteam/runcomfy-avatar";

async function generateForContact(
  contact: { id: string; name: string; role_label: string; owner_id: string },
  token: string,
) {
  const prompt = buildContactPortraitPrompt(contact.name, contact.role_label);
  const bytes = await generatePortraitWithNanoBanana2(prompt, token);
  const admin = createServiceClient();
  const avatarUrl = await uploadContactAvatarBytes(
    admin,
    contact.owner_id,
    contact.id,
    bytes,
    "image/jpeg",
  );
  const { error } = await admin
    .from("contacts")
    .update({ avatar_url: avatarUrl })
    .eq("id", contact.id);
  if (error) throw error;
  return { id: contact.id, name: contact.name, avatarUrl };
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const token = process.env.RUNCOMFY_TOKEN;
  if (!token) {
    return NextResponse.json(
      {
        error:
          "RUNCOMFY_TOKEN manquant. Ajoutez-le dans .env.local (runcomfy login ou token RunComfy).",
      },
      { status: 503 },
    );
  }

  const body = (await request.json()) as { contactId?: string; all?: boolean };
  const { contactId, all } = body;

  let query = supabase
    .from("contacts")
    .select("id, name, role_label, owner_id, avatar_url")
    .eq("owner_id", user.id);

  if (!all && contactId) {
    query = query.eq("id", contactId);
  } else if (all) {
    query = query.or("avatar_url.is.null,avatar_url.eq.");
  } else {
    return NextResponse.json({ error: "contactId ou all requis" }, { status: 400 });
  }

  const { data: contacts, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const targets = all
    ? (contacts ?? []).filter((c) => !c.avatar_url)
    : (contacts ?? []);

  if (!targets.length) {
    return NextResponse.json({
      generated: [],
      message: all ? "Tous les contacts ont déjà une photo." : "Contact introuvable.",
    });
  }

  const generated: { id: string; name: string; avatarUrl: string }[] = [];
  const errors: { id: string; name: string; error: string }[] = [];

  for (const contact of targets) {
    try {
      const result = await generateForContact(contact, token);
      generated.push(result);
    } catch (e) {
      errors.push({
        id: contact.id,
        name: contact.name,
        error: e instanceof Error ? e.message : "Erreur inconnue",
      });
    }
  }

  return NextResponse.json({ generated, errors, total: targets.length });
}
