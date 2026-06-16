import type { IntegrationProviderAdapter } from "../types";
import { buildOAuth2Provider } from "./oauth-helpers";
import { pullHubSpotContacts, pushContactsToHubSpot } from "../sync/mappers/contacts";

export const hubspotProvider = buildOAuth2Provider({
  id: "hubspot",
  authUrl: "https://app.hubspot.com/oauth/authorize",
  tokenUrl: "https://api.hubapi.com/oauth/v1/token",
  clientId: () => process.env.HUBSPOT_CLIENT_ID,
  clientSecret: () => process.env.HUBSPOT_CLIENT_SECRET,
  scopes: ["crm.objects.contacts.read", "crm.objects.contacts.write"],
  entityHandlers: {
    contacts: {
      pull: pullHubSpotContacts,
      push: pushContactsToHubSpot,
    },
  },
});
