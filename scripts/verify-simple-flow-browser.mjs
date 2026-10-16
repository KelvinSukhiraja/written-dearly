import { createRequire } from "node:module";
import fs from "node:fs/promises";
const require = createRequire(import.meta.url);
const { chromium } = require(process.argv[2]);
const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error" && /hydrat|react/i.test(message.text()))
    errors.push(message.text());
});
await fs.mkdir("design-review/simple-flow/screenshots", { recursive: true });
try {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const view of [
      "home",
      "guests",
      "reception",
      "editor",
      "designs",
      "empty",
    ]) {
      await page.goto("http://localhost:3000/dev/review?view=" + view, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });
      await page
        .getByText("Local design fixture", { exact: false })
        .waitFor({ timeout: 30000 });
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      );
      if (overflow)
        throw new Error("Horizontal overflow " + view + " " + width);
      await page.screenshot({
        path: `design-review/simple-flow/screenshots/${view}-${width}.png`,
        fullPage: true, caret: "initial",
      });
      console.log("Rendered", view, width);
    }
  }
  await page.goto("http://localhost:3000/dev/review?view=guests");
  await page
    .getByRole("button", { name: "Prepare invitation for Charlotte Green", exact: true })
    .filter({ visible: true })
    .first()
    .click();
  await page.getByRole("dialog").waitFor();
  if (
    !(await page
      .getByRole("button", { name: "Open WhatsApp", exact: true })
      .isDisabled())
  )
    throw new Error("Local sharing must be blocked");
  await page
    .getByRole("button", { name: "Wedding-day QR", exact: true })
    .click();
  await page.getByAltText("Reception QR code for Charlotte Green").waitFor();
  await page.screenshot({
    path: "design-review/simple-flow/screenshots/whatsapp-390.png",
    fullPage: true, caret: "initial",
  });
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.getByRole("button", { name: "+ Add guest", exact: true }).click();
  await page.getByLabel("Extra guests allowed").fill("2");
  await page.getByText("Invitee + 2 companions = 3 people maximum.", { exact: true }).waitFor();
  console.log(
    "WhatsApp local guard, QR generation and companion allocation passed",
  );
  if (errors.length) throw new Error(errors.join("\n"));
} finally {
  await browser.close();
}

