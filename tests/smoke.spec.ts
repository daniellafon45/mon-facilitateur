import { test, expect } from "@playwright/test";

test.describe("@smoke Auth", () => {
  test("page login accessible", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("Connexion")).toBeVisible();
  });

  test("login test@test.com accède au dashboard", async ({ page }) => {
    test.skip(!process.env.E2E_TEST_EMAIL, "Variables E2E non configurées");

    await page.goto("/login");
    await page.getByLabel(/courriel|email/i).fill(process.env.E2E_TEST_EMAIL!);
    await page.getByLabel(/mot de passe|password/i).fill(process.env.E2E_TEST_PASSWORD!);
    await page.getByRole("button", { name: /me connecter/i }).click();
    await expect(page.getByTestId("dashboard-shell")).toBeVisible({ timeout: 15000 });
  });
});

test.describe("@smoke Chat mock", () => {
  test("recommandation ready ouvre le wizard", async ({ page }) => {
    test.skip(!process.env.E2E_TEST_EMAIL, "Variables E2E non configurées");

    await page.route("**/api/chat", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ready: true,
          reply: "Parfait, lance le projet.",
          objective: "Rétrospective équipe",
          mode: "equipe",
          methodIds: ["start-stop-continue"],
          genreId: "e_retro",
        }),
      });
    });

    await page.goto("/login");
    await page.getByLabel("Email").fill(process.env.E2E_TEST_EMAIL!);
    await page.getByLabel("Mot de passe").fill(process.env.E2E_TEST_PASSWORD!);
    await page.getByRole("button", { name: /me connecter/i }).click();
    await expect(page.getByTestId("dashboard-shell")).toBeVisible({ timeout: 15000 });

    await page.getByRole("button", { name: /assistant/i }).click();
    await page.getByTestId("assistant-input").fill("Je veux une rétrospective avec 8 personnes");
    await page.getByTestId("assistant-input").press("Enter");
    await expect(page.getByTestId("launch-wizard-btn")).toBeVisible({ timeout: 10000 });
    await page.getByTestId("launch-wizard-btn").click();
    await expect(page).toHaveURL(/\/dashboard\/wizard\//);
  });
});

test.describe("@smoke Wizard", () => {
  test("wizard project-type step matches maquette layout", async ({ page }) => {
    test.skip(!process.env.E2E_TEST_EMAIL, "Variables E2E non configurées");
    await page.goto("/login");
    await page.getByLabel("Email").fill(process.env.E2E_TEST_EMAIL!);
    await page.getByLabel("Mot de passe").fill(process.env.E2E_TEST_PASSWORD!);
    await page.getByRole("button", { name: /me connecter/i }).click();
    await expect(page.getByTestId("dashboard-shell")).toBeVisible({ timeout: 15000 });

    await page.goto("/dashboard/wizard/project-type");
    await expect(page.getByTestId("wizard-page")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Que souhaitez-vous construire/i)).toBeVisible();

    const continueBtn = page.getByTestId("wizard-next");
    await expect(continueBtn).toBeDisabled();

    await page.getByTestId("universe-academique").click();
    await page.getByTestId("mode-solo").click();
    await expect(page).toHaveURL(/\/dashboard\/wizard\/project-type/);
    await expect(continueBtn).toBeEnabled();
  });

  test("Retour depuis genre ramène à project-type en un clic", async ({ page }) => {
    test.skip(!process.env.E2E_TEST_EMAIL, "Variables E2E non configurées");
    await page.goto("/login");
    await page.getByLabel("Email").fill(process.env.E2E_TEST_EMAIL!);
    await page.getByLabel("Mot de passe").fill(process.env.E2E_TEST_PASSWORD!);
    await page.getByRole("button", { name: /me connecter/i }).click();
    await expect(page.getByTestId("dashboard-shell")).toBeVisible({ timeout: 15000 });

    await page.goto("/dashboard/wizard/project-type");
    await expect(page.getByTestId("wizard-page")).toBeVisible({ timeout: 15000 });
    await page.getByTestId("universe-academique").click();
    await page.getByTestId("mode-equipe").click();
    await page.getByTestId("wizard-next").click();

    await expect(page).toHaveURL(/session-genre/, { timeout: 15000 });
    await expect(page.getByText(/Quel genre de séance préparez-vous/i)).toBeVisible();

    await page.getByRole("button", { name: /retour/i }).click();

    await expect(page).toHaveURL(/project-type/, { timeout: 15000 });
    await expect(page.getByText(/Que souhaitez-vous construire/i)).toBeVisible();
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/project-type/);
    await expect(page).not.toHaveURL(/session-genre/);
  });

  test("bouton rapide Solo ouvre le wizard avec le mode pré-coché", async ({ page }) => {
    test.skip(!process.env.E2E_TEST_EMAIL, "Variables E2E non configurées");
    await page.goto("/login");
    await page.getByLabel("Email").fill(process.env.E2E_TEST_EMAIL!);
    await page.getByLabel("Mot de passe").fill(process.env.E2E_TEST_PASSWORD!);
    await page.getByRole("button", { name: /me connecter/i }).click();
    await expect(page.getByTestId("dashboard-shell")).toBeVisible({ timeout: 15000 });

    await page.getByRole("button", { name: "Solo", exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard\/wizard\/project-type/);
    await expect(page.getByTestId("wizard-page")).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId("mode-solo")).toHaveAttribute("data-selected", "true");
    await expect(page.getByTestId("wizard-next")).toBeDisabled();
  });

  test("wizard method step visible", async ({ page }) => {
    test.skip(!process.env.E2E_TEST_EMAIL, "Variables E2E non configurées");
    await page.goto("/login");
    await page.getByLabel("Email").fill(process.env.E2E_TEST_EMAIL!);
    await page.getByLabel("Mot de passe").fill(process.env.E2E_TEST_PASSWORD!);
    await page.getByRole("button", { name: /me connecter/i }).click();
    await expect(page.getByTestId("dashboard-shell")).toBeVisible({ timeout: 15000 });
    await page.goto("/dashboard/wizard/method");
    await expect(page.getByTestId("wizard-page")).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId("method-brainstorm")).toBeVisible();
  });

  test("Continuer depuis objectif pré-sélectionne les méthodes via l'API", async ({ page }) => {
    test.skip(!process.env.E2E_TEST_EMAIL, "Variables E2E non configurées");

    await page.route("**/api/wizard/recommend-methods", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          objective: "Prioriser les idées du sprint",
          methodIds: ["bono", "brainstorm"],
          summary: "Priorisation puis génération d'idées complémentaires.",
        }),
      });
    });

    await page.goto("/login");
    await page.getByLabel("Email").fill(process.env.E2E_TEST_EMAIL!);
    await page.getByLabel("Mot de passe").fill(process.env.E2E_TEST_PASSWORD!);
    await page.getByRole("button", { name: /me connecter/i }).click();
    await expect(page.getByTestId("dashboard-shell")).toBeVisible({ timeout: 15000 });

    await page.goto("/dashboard/wizard/project-type");
    await page.getByTestId("universe-academique").click();
    await page.getByTestId("mode-solo").click();
    await page.getByTestId("wizard-next").click();

    await expect(page).toHaveURL(/session-genre/);
    await page.getByTestId("genre-s_brainstorm").click();
    await page.getByTestId("wizard-next").click();

    await expect(page).toHaveURL(/whiteboard/);
    await page.getByPlaceholder(/Décrivez ce que vous voulez accomplir/i).fill("Prioriser les idées du sprint");
    await page.getByTestId("wizard-next").click();

    await expect(page).toHaveURL(/\/dashboard\/wizard\/method/, { timeout: 15000 });
    await expect(page.getByTestId("wizard-ai-methods-banner")).toBeVisible();
    await expect(page.getByTestId("method-bono")).toBeVisible();
  });
});
