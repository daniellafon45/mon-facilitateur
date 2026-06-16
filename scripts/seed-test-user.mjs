/**
 * Crée test@test.com / test123 et charge les données démo.
 * Charge automatiquement .env.local si présent.
 *
 * Utilise la clé service_role JWT (eyJ...) si disponible, sinon signup + RPC authentifié.
 */
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq > 0) {
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://fazvhhuewkuhcqrcyqkf.supabase.co";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const hasServiceJwt = Boolean(serviceKey?.startsWith("eyJ"));

const EMAIL = "test@test.com";
const PASSWORD = "test123";

async function ensureUserViaAdmin() {
  const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: list, error: listErr } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (listErr) throw listErr;

  let user = list?.users?.find((u) => u.email === EMAIL);
  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({
      email: EMAIL,
      password: PASSWORD,
      email_confirm: true,
    });
    if (error) throw error;
    user = data.user;
    console.log("Utilisateur créé (admin):", EMAIL);
  } else {
    console.log("Utilisateur existant (admin):", EMAIL);
  }

  const { error: seedErr } = await admin.rpc("seed_demo_data_for_user", { p_user_id: user.id });
  if (seedErr) throw seedErr;
  console.log("Données démo chargées pour", user.id);
}

async function ensureUserViaSignup() {
  if (!anonKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY requis pour le mode signup");
  }

  const client = createClient(url, anonKey, { auth: { autoRefreshToken: false, persistSession: false } });

  const { data: signInData, error: signInErr } = await client.auth.signInWithPassword({
    email: EMAIL,
    password: PASSWORD,
  });

  let user = signInData?.user;
  if (signInErr || !user) {
    const { data: signUpData, error: signUpErr } = await client.auth.signUp({
      email: EMAIL,
      password: PASSWORD,
    });
    if (signUpErr) throw signUpErr;
    user = signUpData.user;
    if (!user) throw new Error("Signup sans utilisateur — confirmez l'email ou activez les inscriptions");
    console.log("Utilisateur créé (signup):", EMAIL);
  } else {
    console.log("Utilisateur existant (signin):", EMAIL);
  }

  const { error: seedErr } = await client.rpc("seed_demo_data_for_user", { p_user_id: user.id });
  if (seedErr) throw seedErr;
  console.log("Données démo chargées pour", user.id);
}

async function main() {
  if (hasServiceJwt) {
    await ensureUserViaAdmin();
    return;
  }

  if (serviceKey && !hasServiceJwt) {
    console.warn("SUPABASE_SERVICE_ROLE_KEY invalide (attendu: JWT eyJ...). Mode signup utilisé.");
  }

  await ensureUserViaSignup();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
