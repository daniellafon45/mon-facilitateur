# Mon facilitateur

Plateforme de facilitation pour accélérer l'innovation collective.

## Démarrage

```bash
cd mon-facilitateur
npm install
cp .env.example .env.local
# Renseigner NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```

## Supabase

Appliquer les migrations `supabase/migrations/` dans votre projet Supabase (SQL Editor ou CLI), y compris `011_integrations.sql` et `012_integration_external_ids.sql`.

## Stack

- Next.js 16 + TypeScript
- Tailwind CSS v4 + shadcn/ui
- Supabase Auth
- Motion (animations)
- Zustand (store local)

## Routes

- `/` Homepage marketing (style UI Bakery)
- `/login`, `/signup`, `/onboarding` Auth
- `/dashboard` Application (protégée)
- `/dashboard/integrations` Connexion OAuth (12 providers)

## Assistant IA

Connexion obligatoire. Pendant le chargement, le composant `agent-plan` affiche le plan de facilitation.

Optionnel : `ANTHROPIC_API_KEY` ou `OPENAI_API_KEY` pour les réponses IA complètes.

## Intégrations OAuth

### Configuration locale (mode mock)

Avec `INTEGRATIONS_DEV_MOCK=true` et `INTEGRATIONS_ENCRYPTION_KEY` défini, vous pouvez connecter les 12 providers sans credentials réels.

### Configuration production

1. Définir `NEXT_PUBLIC_APP_URL` (ex. `https://app.example.com`)
2. Créer une app OAuth par provider (ou regrouper Google / Microsoft)
3. Redirect URI : `{NEXT_PUBLIC_APP_URL}/api/integrations/oauth/callback/{provider}`

| Provider | Portail | Variables |
|----------|---------|-----------|
| Google Drive / Calendar | Google Cloud Console | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| Teams / OneDrive | Azure Portal | `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET` |
| Slack | api.slack.com | `SLACK_CLIENT_ID`, `SLACK_CLIENT_SECRET`, `SLACK_SIGNING_SECRET` |
| Notion | notion.so/my-integrations | `NOTION_CLIENT_ID`, `NOTION_CLIENT_SECRET` |
| Trello | trello.com/power-ups/admin | `TRELLO_API_KEY`, `TRELLO_API_SECRET` |
| Dropbox | dropbox.com/developers | `DROPBOX_CLIENT_ID`, `DROPBOX_CLIENT_SECRET` |
| Miro | miro.com/app/settings | `MIRO_CLIENT_ID`, `MIRO_CLIENT_SECRET` |
| Asana | app.asana.com/0/developer-console | `ASANA_CLIENT_ID`, `ASANA_CLIENT_SECRET` |
| HubSpot | developers.hubspot.com | `HUBSPOT_CLIENT_ID`, `HUBSPOT_CLIENT_SECRET` |
| Zapier | Webhooks | `ZAPIER_WEBHOOK_SECRET` |

### Sync automatique

Planifier un appel POST vers `/api/integrations/cron` avec header `Authorization: Bearer {CRON_SECRET}` toutes les 10 minutes (Vercel Cron, pg_cron, etc.).

### Webhooks entrants

- Slack : `{APP_URL}/api/webhooks/slack`
- Microsoft Graph : `{APP_URL}/api/webhooks/microsoft`
- Google Calendar : `{APP_URL}/api/webhooks/google`
- Notion : `{APP_URL}/api/webhooks/notion`
- Zapier : `{APP_URL}/api/webhooks/zapier?token={inbound_url_token}`

## Tests

```bash
npm run test:unit
npm run test:e2e
```
