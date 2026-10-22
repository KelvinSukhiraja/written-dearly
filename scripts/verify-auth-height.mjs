import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.argv[2]);
const origin = process.argv[3] || 'http://localhost:3000';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage();
await page.emulateMedia({ reducedMotion: 'reduce' });
const output = 'design-review/auth-2026-10-21';
await fs.mkdir(output, { recursive: true });
try {
  for (const [width, height] of [[1440, 900], [1366, 768], [1280, 600], [1024, 600], [768, 600], [390, 667], [375, 667], [390, 844], [320, 568]]) {
    await page.setViewportSize({ width, height });
    await page.goto(`${origin}/login`, { waitUntil: 'networkidle' });
    const dimensions = await page.evaluate(() => ({
      viewport: innerHeight,
      height: document.documentElement.scrollHeight,
      width: document.documentElement.scrollWidth,
    }));
    assert.ok(dimensions.height <= height + 1, `${width}x${height}: document is ${dimensions.height}px tall`);
    assert.ok(dimensions.width <= width, 'No horizontal overflow');
    assert.ok(await page.getByRole('button', { name: 'Sign in', exact: true }).evaluate(el => { const r = el.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight + 1; }));
    assert.ok(await page.getByRole('link', { name: 'Create an account' }).evaluate(el => { const r = el.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight + 1; }));
    await page.screenshot({ path: `${output}/height-${origin.includes('vercel') ? 'live' : 'local'}-${width}-${height}.png` });
    console.log(`PASS login fits ${width}x${height}`);
  }
  // Short landscape/keyboard viewports must scroll naturally to every control.
  await page.setViewportSize({ width: 667, height: 375 });
  await page.goto(`${origin}/login`, { waitUntil: 'networkidle' });
  const link = page.getByRole('link', { name: 'Create an account' });
  await link.scrollIntoViewIfNeeded();
  assert.ok(await link.evaluate(el => { const r = el.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight + 1; }));
  await link.click();
  await page.getByRole('button', { name: 'Create account', exact: true }).scrollIntoViewIfNeeded();
  assert.ok(await page.getByRole('button', { name: 'Create account', exact: true }).evaluate(el => { const r = el.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight + 1; }));
  console.log('PASS short landscape: login and signup controls remain reachable');
} finally { await browser.close(); }

