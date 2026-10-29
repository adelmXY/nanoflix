import { readFileSync } from "node:fs";
import { test, expect } from "@playwright/test";
const slug = "carminuccio-alexiuccio-ultimo-attimo";
test("navigazione, filtri, link diretti, player vuoto e 404", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const mediaRequests: string[] = [];
  page.on("request", (r) => {
    if (/\.(mp4|webm|png|jpg|webp|svg)(\?|$)/.test(r.url()))
      mediaRequests.push(r.url());
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Carminuccio",
  );
  await page.getByRole("link", { name: "Esplora la serie" }).click();
  await expect(page.locator(".episodes li")).toHaveCount(14);
  await expect(page.getByRole("link", { name: /Guarda/ })).toHaveCount(0);
  await page.goto("/catalogo");
  await page.getByLabel("Cerca una produzione").fill("ÁLEXIUCCIO");
  await expect(page.locator(".catalog-grid .card")).toHaveCount(1);
  await page.getByLabel("Tipo", { exact: true }).selectOption("short");
  await expect(
    page.getByRole("heading", { name: "Nessun risultato" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Azzera filtri" }).click();
  await expect(page.locator(".catalog-grid .card")).toHaveCount(4);
  await page.goto(`/guarda/${slug}?episodio=ultimo-attimo-s01e02`);
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "NON SAI INTERPRETARE NEANCHE UN URL",
  );
  await expect(
    page.getByRole("heading", { name: "Video non ancora disponibile" }),
  ).toBeVisible();
  await expect(page.locator("video")).toHaveCount(0);
  await page.goto(`/guarda/${slug}?episodio=errato`);
  await expect(
    page.getByRole("heading", { name: "Episodio non trovato" }),
  ).toBeVisible();
  await page.goto("/titolo/manca");
  await expect(
    page.getByRole("heading", { name: "Fuori copione" }),
  ).toBeVisible();
  await page.goto("/non-esiste");
  await expect(
    page.getByRole("heading", { name: "Fuori copione" }),
  ).toBeVisible();
  expect(errors).toEqual([]);
  expect(mediaRequests).toEqual([]);
});
for (const width of [320, 390, 768, 1440])
  test(`layout ${width}px e titoli lunghi`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of [
      "/",
      `/titolo/${slug}`,
      "/catalogo",
      `/guarda/${slug}`,
    ]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
    await page.goto(`/titolo/${slug}`);
    for (const n of [2, 3, 5, 7, 9, 14]) {
      const row = page.locator(".episodes li").nth(n - 1);
      await row.scrollIntoViewIfNeeded();
      await expect(row.getByRole("heading")).toBeVisible();
    }
    await page.screenshot({
      path: `test-results/detail-${width}.png`,
      fullPage: true,
    });
    await page.goto("/");
    await page.screenshot({
      path: `test-results/home-${width}.png`,
      fullPage: true,
    });
  });
test("condivisione copia o fallback selezionabile", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", { value: undefined });
    Object.defineProperty(navigator, "clipboard", { value: undefined });
  });
  await page.goto(`/titolo/${slug}`);
  await page.getByRole("button", { name: "Condividi" }).click();
  await expect(page.getByLabel("Link da copiare")).toHaveValue(
    `http://127.0.0.1:4173/titolo/${slug}`,
  );
});
test("errore catalogo recuperabile", async ({ page }) => {
  await page.route("**/data/catalog.json", (route) =>
    route.fulfill({ status: 500, body: "errore" }),
  );
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Catalogo non disponibile" }),
  ).toBeVisible();
  await page.unroute("**/data/catalog.json");
  await page.getByRole("button", { name: "Riprova" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Carminuccio",
  );
});
test("galleria con tastiera, focus e ritorno al contesto", async ({ page }) => {
  const data = JSON.parse(readFileSync("public/data/catalog.json", "utf8"));
  const fixture = structuredClone(data);
  Object.assign(fixture.titles[0], {
    gallery: [
      {
        src: "/media/non-presente.jpg",
        alt: "Fotomontaggio originale",
        kind: "original",
      },
    ],
  });
  await page.route("**/data/catalog.json", (r) => r.fulfill({ json: fixture }));
  await page.goto(`/titolo/${slug}`);
  const trigger = page.getByRole("button", { name: /L’originale/ });
  await trigger.click();
  await expect(page.locator("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog")).not.toBeVisible();
  await expect(trigger).toBeFocused();
});
