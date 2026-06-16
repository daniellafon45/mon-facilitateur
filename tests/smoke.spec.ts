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
    await expect(continueBtn).toBeEnabled();
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
    await expect(page.getByTestId("mode-solo").locator(".border-primary")).toBeVisible();
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
});
