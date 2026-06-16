import { NextResponse } from "next/server";
import { processPendingSyncJobs, refreshExpiringTokens } from "@/lib/integrations/sync/engine";

export async function POST(request: Request) {
  const auth = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 32);
  if (cronSecret && auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const refreshed = await refreshExpiringTokens();
  const results = await processPendingSyncJobs(50);

  return NextResponse.json({ refreshed, processed: results.length, results });
}

export async function GET(request: Request) {
  return POST(request);
}
