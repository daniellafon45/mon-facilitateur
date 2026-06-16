"use client";

import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SessionMode } from "@/types/facilitation";

interface SessionReportProps {
  report: {
    objective?: string;
    mode: SessionMode;
    methods: { id: string; title: string }[];
  };
  onClose: () => void;
}

export function SessionReport({ report, onClose }: SessionReportProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <Card className="max-w-lg w-full rounded-3xl shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-green-100 flex items-center justify-center mb-2">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle>Séance terminée</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          {report.objective && <p className="text-sm text-muted-foreground">{report.objective}</p>}
          <p className="text-sm">
            <strong>{report.methods.length}</strong> méthode(s) complétée(s) en mode <strong>{report.mode}</strong>
          </p>
          <ul className="text-left text-sm space-y-1 bg-muted/30 rounded-2xl p-4">
            {report.methods.map((m) => (
              <li key={m.id}>· {m.title}</li>
            ))}
          </ul>
          <Button className="w-full rounded-2xl" onClick={onClose}>
            Retour au tableau de bord
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
