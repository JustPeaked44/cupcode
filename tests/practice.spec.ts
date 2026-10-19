import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Math.random = () => 0.7;
    const history: string[] = [];
    class Utterance {
      text: string;
      onstart?: () => void;
      constructor(text: string) {
        this.text = text;
      }
    }
    Object.defineProperty(window, "SpeechSynthesisUtterance", {
      configurable: true,
      value: Utterance,
    });
    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: {
        getVoices: () => [{ name: "Test English", lang: "en-US" }],
        cancel: () => history.push("cancel"),
        resume() {},
        speak: (u: Utterance) => {
          history.push(u.text);
          u.onstart?.();
        },
        addEventListener() {},
        removeEventListener() {},
      },
    });
    (window as unknown as { speechCalls: string[] }).speechCalls = history;
  });
});
test("complete three-cup flow, keyboard, audio lifecycle, privacy and fresh customers", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Hear the order.",
  );
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({
    path: testInfo.outputPath("home.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "Start Practice" }).click();
  await expect(page.locator(".cup-station")).toHaveCount(3);
  const dialogue = await page.locator(".dialogue").innerText();
  await expect(page.locator(".audio-status")).toContainText(
    "Speaking customer order",
  );
  await page
    .getByRole("textbox", { name: "Drink 1 Decaf", exact: true })
    .focus();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("textbox", { name: "Drink 1 Shots", exact: true }),
  ).toBeFocused();
  await page
    .getByRole("textbox", { name: "Drink 1 Milk", exact: true })
    .fill("A / 50%");
  await page
    .getByRole("textbox", { name: "Drink 1 Customer Name", exact: true })
    .fill("My attempt");
  await page
    .getByRole("textbox", { name: "Drink 1 Other", exact: true })
    .fill("My note");
  await expect(
    page.getByRole("textbox", { name: "Drink 2 Milk", exact: true }),
  ).toHaveValue("");
  await page.getByRole("button", { name: "Replay Order" }).click();
  await expect(page.locator(".dialogue")).toHaveText(dialogue);
  await page.getByRole("button", { name: "Stop Audio" }).click();
  await expect(page.locator(".audio-status")).toContainText("stopped");
  await page
    .getByRole("combobox", { name: "Voice", exact: true })
    .selectOption("female");
  await page.getByRole("button", { name: "Replay Order" }).click();
  await page.getByRole("button", { name: "Mental", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Mental", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Show Answer" }).click();
  expect(
    await page.evaluate(() =>
      (window as unknown as { speechCalls: string[] }).speechCalls.at(-1),
    ),
  ).toBe("cancel");
  await expect(page.locator(".answer-card")).toHaveCount(3);
  await expect(
    page.getByRole("textbox", { name: "Drink 1 Milk", exact: true }),
  ).toHaveValue("A / 50%");
  await expect(
    page.getByRole("textbox", { name: "Drink 1 Other", exact: true }),
  ).toHaveValue("My note");
  await page.screenshot({
    path: testInfo.outputPath("reveal.png"),
    fullPage: true,
  });
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  if (testInfo.project.name === "mobile") {
    const row = page.locator(".cup-workspace");
    expect(await row.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(
      true,
    );
    await page
      .getByRole("button", { name: "Go to Drink 3", exact: true })
      .click();
    await expect
      .poll(() => row.evaluate((el) => el.scrollLeft))
      .toBeGreaterThan(300);
    await page
      .getByRole("textbox", { name: "Drink 3 Drink", exact: true })
      .fill("PMCF");
    await expect(
      page.getByRole("textbox", { name: "Drink 1 Drink", exact: true }),
    ).toHaveValue("");
  }
  await page.getByRole("button", { name: "Try Again" }).click();
  await expect(page.locator(".dialogue")).toHaveText(dialogue);
  await expect(page.locator(".answers")).toHaveCount(0);
  await expect(
    page.getByRole("textbox", { name: "Drink 1 Milk", exact: true }),
  ).toHaveValue("");
  const spoken = await page.evaluate(() =>
    (window as unknown as { speechCalls: string[] }).speechCalls.filter(
      (text) => text !== "cancel",
    ),
  );
  expect(new Set(spoken).size).toBe(1);
  await page.getByRole("button", { name: "Generate Order" }).click();
  await expect(page.locator(".dialogue")).not.toHaveText(dialogue);
  for (let i = 0; i < 4; i++)
    await page.getByRole("button", { name: "Generate Order" }).click();
  await expect(page.locator(".cup-station")).toHaveCount(3);
  await expect(page.locator(".answers")).toHaveCount(0);
  await page.getByRole("button", { name: "Exit" }).click();
  expect(
    await page.evaluate(() =>
      (window as unknown as { speechCalls: string[] }).speechCalls.at(-1),
    ),
  ).toBe("cancel");
  await expect(
    page.getByRole("button", { name: "Start Practice" }),
  ).toBeVisible();
  await expect(page.getByRole("textbox")).toHaveCount(0);
  expect(
    await page.evaluate(() => ({
      local: localStorage.length,
      session: sessionStorage.length,
      cookies: document.cookie,
    })),
  ).toEqual({ local: 0, session: 0, cookies: "" });
  expect(errors).toEqual([]);
});
test("reference context, unavailable speech, reduced motion, help and route refresh", async ({
  page,
}, testInfo) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: undefined,
    });
    Math.random = () => 0.01;
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("link", { name: "Code library" }).click();
  await expect(page.locator(".catalog-entry")).toHaveCount(152);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page
    .getByRole("textbox", { name: "Search beverage codes" })
    .fill("no whipped");
  await expect(page.locator(".catalog-entry")).toHaveCount(1);
  await expect(page.locator(".catalog-entry")).toContainText(
    "Crossed out in source",
  );
  await page
    .getByRole("textbox", { name: "Search beverage codes" })
    .fill("not a code");
  await expect(page.getByText(/No matching codes/)).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Small codes.",
  );
  await page
    .getByRole("textbox", { name: "Search beverage codes" })
    .fill("Oatmilk");
  await page.screenshot({
    path: testInfo.outputPath("library.png"),
    fullPage: true,
  });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole("button", { name: "Practice", exact: true }).click();
  await expect(page.locator(".cup.hot")).toHaveCount(1);
  await expect(page.locator(".audio-status")).toContainText(
    "Speech unavailable",
  );
  await page.getByRole("button", { name: "The six fields" }).click();
  await expect(page.locator(".field-help")).toBeVisible();
  await page.getByRole("button", { name: "Got it" }).click();
  await expect(page.locator(".field-help")).toHaveCount(0);
  await page.getByRole("button", { name: "Show Answer" }).click();
  await expect(page.locator(".answer-card")).toHaveCount(1);
  await expect(page.locator(".info-reference").nth(1)).toHaveText("->");
  expect(
    await page
      .locator(".appear")
      .first()
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
  await page.reload();
  await expect(page.locator(".cup-station")).toHaveCount(1);
  await page.getByRole("link", { name: "Skip to content" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
  await expect(page.locator(".cup-station")).toHaveCount(1);
  await page.goBack();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Small codes.",
  );
});
