"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { AssistantModal } from "@/components/dashboard/assistant-modal";
import {
  DreamTeamKanban,
  DreamTeamStats,
  DreamTeamTeamsGrid,
  DreamTeamHeaderActions,
  type ContactStatus,
  type DreamTeamContact,
  type DreamTeamTeam,
} from "@/components/dashboard/dreamteam-kanban";
import { DreamTeamContactModal, DreamTeamTeamModal } from "@/components/dashboard/dreamteam-modals";
import { useFacilitationStore } from "@/lib/store/facilitation-store";
import { useMessagesStore } from "@/lib/store/messages-store";
import { dtAvatarColor, dtTeamColor } from "@/lib/dreamteam/constants";
import { uploadContactAvatar, deleteContactAvatar } from "@/lib/dreamteam/avatar";
import { createClient } from "@/lib/supabase/client";

export default function DreamTeamPage() {
  const router = useRouter();
  const store = useFacilitationStore();
  const ensureDM = useMessagesStore((s) => s.ensureDM);
  const ensureTeam = useMessagesStore((s) => s.ensureTeam);
  const requestOpen = useMessagesStore((s) => s.requestOpen);
  const [aiOpen, setAiOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [contactModal, setContactModal] = useState<DreamTeamContact | null | "new">(null);
  const [teamModal, setTeamModal] = useState<DreamTeamTeam | null | "new">(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!store.hydrated) void store.hydrateFromSupabase();
  }, [store.hydrated, store.hydrateFromSupabase]);

  function flash(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  }

  async function refresh() {
    await store.hydrateFromSupabase();
  }

  async function saveContact(data: {
    name: string;
    role: string;
    email: string;
    photoFile: File | null;
    removePhoto: boolean;
  }) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      flash("Connectez-vous pour enregistrer un contact");
      return;
    }

    if (contactModal && contactModal !== "new") {
      const patch: Record<string, string | null> = {
        name: data.name,
        role_label: data.role,
        email: data.email || null,
      };
      if (data.removePhoto) patch.avatar_url = null;

      const { error } = await supabase
        .from("contacts")
        .update(patch)
        .eq("id", contactModal.id);
      if (error) {
        flash(`Erreur : ${error.message}`);
        return;
      }

      if (data.removePhoto) {
        await deleteContactAvatar(supabase, user.id, contactModal.id);
      }

      if (data.photoFile) {
        try {
          const avatarUrl = await uploadContactAvatar(
            supabase,
            user.id,
            contactModal.id,
            data.photoFile,
          );
          const { error: avatarErr } = await supabase
            .from("contacts")
            .update({ avatar_url: avatarUrl })
            .eq("id", contactModal.id);
          if (avatarErr) {
            flash(`Photo non enregistrée : ${avatarErr.message}`);
            return;
          }
        } catch (e) {
          flash(e instanceof Error ? e.message : "Échec de l'envoi de la photo");
          return;
        }
      }

      flash("Contact mis à jour");
      await refresh();
      return;
    }

    const { data: inserted, error } = await supabase
      .from("contacts")
      .insert({
        owner_id: user.id,
        name: data.name,
        email: data.email || null,
        role_label: data.role,
        status: "todo",
      })
      .select("id")
      .single();

    if (error || !inserted) {
      flash(error?.message ?? "Impossible de créer le contact");
      return;
    }

    if (data.photoFile) {
      try {
        const avatarUrl = await uploadContactAvatar(
          supabase,
          user.id,
          inserted.id,
          data.photoFile,
        );
        const { error: avatarErr } = await supabase
          .from("contacts")
          .update({ avatar_url: avatarUrl })
          .eq("id", inserted.id);
        if (avatarErr) {
          flash(`Contact créé, mais photo non enregistrée : ${avatarErr.message}`);
          await refresh();
          return;
        }
      } catch (e) {
        flash(
          e instanceof Error
            ? `Contact créé, mais photo échouée : ${e.message}`
            : "Contact créé sans photo",
        );
        await refresh();
        return;
      }
    }

    flash(`« ${data.name} » ajouté`);
    await refresh();
  }

  async function generateAvatarForContact(contactId: string): Promise<string | null> {
    const res = await fetch("/api/contacts/generate-avatars", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactId }),
    });
    const json = (await res.json()) as {
      error?: string;
      generated?: { id: string; avatarUrl: string }[];
    };
    if (!res.ok) {
      flash(json.error ?? "Génération échouée");
      return null;
    }
    await refresh();
    const url = json.generated?.[0]?.avatarUrl ?? null;
    if (url) flash("Portrait IA généré");
    return url;
  }

  async function saveTeam(data: { name: string; memberIds: string[] }) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (teamModal && teamModal !== "new") {
      const { error } = await supabase
        .from("teams")
        .update({ name: data.name, member_ids: data.memberIds })
        .eq("id", teamModal.id);
      if (!error) {
        flash("Équipe mise à jour");
        await refresh();
      }
      return;
    }

    const { error } = await supabase.from("teams").insert({
      owner_id: user.id,
      name: data.name,
      member_ids: data.memberIds,
    });
    if (!error) {
      flash(`« ${data.name} » créée`);
      await refresh();
    }
  }

  async function deleteTeam(team: DreamTeamTeam) {
    if (!window.confirm(`Supprimer l'équipe « ${team.name} » ?`)) return;
    const supabase = createClient();
    const { error } = await supabase.from("teams").delete().eq("id", team.id);
    if (!error) {
      flash(`« ${team.name} » supprimée`);
      await refresh();
    }
  }

  async function updateStatus(id: string, status: ContactStatus) {
    const supabase = createClient();
    const { error } = await supabase.from("contacts").update({ status }).eq("id", id);
    if (!error) await refresh();
  }

  const contacts = store.contacts;
  const teams = store.teams;
  const withEmail = contacts.filter((c) => c.email).length;

  function openContactMessage(contact: DreamTeamContact, index: number) {
    const id = ensureDM({
      id: contact.id,
      name: contact.name,
      color: dtAvatarColor(contact.name, index),
    });
    requestOpen(id);
    router.push("/dashboard/messages");
  }

  function openTeamMessage(team: DreamTeamTeam) {
    const memberNames = team.memberIds
      .map((mid) => contacts.find((c) => c.id === mid)?.name)
      .filter(Boolean) as string[];
    const id = ensureTeam(
      { id: team.id, name: team.name, color: dtTeamColor(team.name) },
      memberNames,
    );
    requestOpen(id);
    router.push("/dashboard/messages");
  }

  return (
    <DashboardShell onOpenAssistant={() => setAiOpen(true)}>
      <div className="mx-auto max-w-6xl space-y-8 pb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Dream Team</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Contacts, équipes et suivi des invitations pour vos sessions.
            </p>
          </div>
          <DreamTeamHeaderActions
            onNewTeam={() => setTeamModal("new")}
            onNewContact={() => setContactModal("new")}
          />
        </div>

        <DreamTeamStats
          contactsCount={contacts.length}
          teamsCount={teams.length}
          withEmailCount={withEmail}
        />

        <section>
          <h2 className="mb-4 text-lg font-extrabold tracking-tight">Équipes</h2>
          <DreamTeamTeamsGrid
            teams={teams}
            contacts={contacts}
            onCreateTeam={() => setTeamModal("new")}
            onEditTeam={(team) => setTeamModal(team)}
            onDeleteTeam={(team) => void deleteTeam(team)}
            onMessageTeam={openTeamMessage}
          />
        </section>

        <section className="rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
          <DreamTeamKanban
            contacts={contacts}
            search={search}
            onSearchChange={setSearch}
            onStatusChange={updateStatus}
            onEditContact={(contact) => setContactModal(contact)}
            onMessageContact={(contact) =>
              openContactMessage(contact, contacts.findIndex((c) => c.id === contact.id))
            }
          />
        </section>
      </div>

      <DreamTeamContactModal
        open={contactModal !== null}
        contact={contactModal === "new" ? null : contactModal}
        onClose={() => setContactModal(null)}
        onSave={saveContact}
        onGenerateAvatar={generateAvatarForContact}
      />

      <DreamTeamTeamModal
        open={teamModal !== null}
        team={teamModal === "new" ? null : teamModal}
        contacts={contacts}
        onClose={() => setTeamModal(null)}
        onSave={saveTeam}
      />

      {toast ? (
        <div className="fixed bottom-7 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-foreground px-4 py-3 text-sm font-semibold text-background shadow-xl">
          {toast}
        </div>
      ) : null}

      <AssistantModal open={aiOpen} onClose={() => setAiOpen(false)} />
    </DashboardShell>
  );
}
