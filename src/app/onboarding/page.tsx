"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

const GOALS = [
  { id: "ateliers", label: "Animer des ateliers" },
  { id: "projets", label: "Structurer des projets" },
  { id: "retro", label: "Faciliter des rétrospectives" },
  { id: "solo", label: "Préparer en solo" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [org, setOrg] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    await supabase.from("profiles").update({
      role,
      org,
      goals,
      onboarded: true,
    }).eq("id", user.id);
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <Image src="/logo.png" alt="" width={40} height={40} className="rounded-full mx-auto mb-4" />
          <CardTitle>Bienvenue !</CardTitle>
          <CardDescription>Personnalisez votre espace en 30 secondes</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="role">Votre rôle</Label>
              <Input id="role" placeholder="Facilitateur, chef de produit…" value={role} onChange={(e) => setRole(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org">Organisation</Label>
              <Input id="org" placeholder="Entreprise, équipe…" value={org} onChange={(e) => setOrg(e.target.value)} />
            </div>
            <div className="space-y-3">
              <Label>Vos objectifs</Label>
              {GOALS.map((g) => (
                <label key={g.id} className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    checked={goals.includes(g.id)}
                    onCheckedChange={(checked) =>
                      setGoals((prev) =>
                        checked ? [...prev, g.id] : prev.filter((x) => x !== g.id),
                      )
                    }
                  />
                  <span className="text-sm">{g.label}</span>
                </label>
              ))}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Enregistrement…" : "Accéder au tableau de bord"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
