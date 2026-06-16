import { test, expect } from "@playwright/test";

test.describe("Page Intégrations", () => {
  test("redirige vers login si non connecté", async ({ page }) => {
    await page.goto("/dashboard/integrations");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Page Intégrations (authentifié)", () => {
  test.skip(!process.env.E2E_TEST_EMAIL, "E2E_TEST_EMAIL non défini");

  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', process.env.E2E_TEST_EMAIL!);
    await page.fill('input[type="password"]', process.env.E2E_TEST_PASSWORD!);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);
  });

  test("affiche la grille des 12 intégrations", async ({ page }) => {
    await page.goto("/dashboard/integrations");
    await expect(page.getByRole("heading", { name: "Intégrations" })).toBeVisible();
    await expect(page.getByText("Google Drive")).toBeVisible();
    await expect(page.getByText("Slack")).toBeVisible();
    await expect(page.getByText("Zapier")).toBeVisible();
    await expect(page.getByText("HubSpot")).toBeVisible();
  });

  test("bouton Connecter visible pour provider déconnecté", async ({ page }) => {
    await page.goto("/dashboard/integrations");
    const connectButtons = page.getByRole("button", { name: "Connecter" });
    await expect(connectButtons.first()).toBeVisible();
  });
});
