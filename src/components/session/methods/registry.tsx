"use client";

import dynamic from "next/dynamic";
import { METHOD_CONFIGS } from "./configs";
import type { SessionState } from "./column-workspace";

const MethodWorkspace = dynamic(
  () => import("./method-workspace").then((m) => m.MethodWorkspace),
  {
    ssr: false,
    loading: () => (
      <div className="p-8 text-center text-muted-foreground">Chargement de la méthode…</div>
    ),
  },
);

export function MethodRenderer({
  methodId,
  state,
  onChange,
  embedded,
}: {
  methodId: string;
  state: SessionState;
  onChange: (s: SessionState) => void;
  embedded?: boolean;
}) {
  const config = METHOD_CONFIGS[methodId];
  if (!config) {
    return (
      <div className="rounded-2xl border p-8 text-center text-muted-foreground">
        Méthode « {methodId} » — configuration en cours.
      </div>
    );
  }

  return (
    <MethodWorkspace
      methodId={methodId}
      config={config}
      state={state}
      onChange={onChange}
      embedded={embedded}
    />
  );
}

export function isMethodImplemented(methodId: string) {
  return methodId in METHOD_CONFIGS;
}

export { METHOD_CONFIGS };
