"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Profile } from "@/types/facilitation";

export default function ParametresPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    createClient()
      .from("profiles")
      .select("*")
      .single()
      .then(({ data }) => {
        if (data) setProfile(data as Profile);
      });
  }, []);

  async function save() {
    if (!profile) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: profile.first_name,
        last_name: profile.last_name,
        role: profile.role,
        org: profile.org,
        display_name: `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim(),
      })
      .eq("id", profile.id);
    setSaving(false);
    setMsg(error ? "Erreur de sauvegarde" : "Profil mis à jour");
  }

  if (!profile) {
    return <p className="text-muted-foreground">Chargement…</p>;
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Paramètres</h1>
      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Profil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Prénom</Label>
              <Input
                className="rounded-2xl mt-1"
                value={profile.first_name ?? ""}
                onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
              />
            </div>
            <div>
              <Label>Nom</Label>
              <Input
                className="rounded-2xl mt-1"
                value={profile.last_name ?? ""}
                onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label>Rôle</Label>
            <Input
              className="rounded-2xl mt-1"
              value={profile.role ?? ""}
              onChange={(e) => setProfile({ ...profile, role: e.target.value })}
            />
          </div>
          <div>
            <Label>Organisation</Label>
            <Input
              className="rounded-2xl mt-1"
              value={profile.org ?? ""}
              onChange={(e) => setProfile({ ...profile, org: e.target.value })}
            />
          </div>
          <Button className="rounded-2xl w-full" onClick={save} disabled={saving}>
            {saving ? "Enregistrement…" : "Enregistrer"}
          </Button>
          {msg && <p className="text-sm text-center text-muted-foreground">{msg}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
