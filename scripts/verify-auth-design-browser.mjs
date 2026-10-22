import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const { chromium } = require(process.argv[2]);
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const origin = 'http://localhost:3000';
const output = 'design-review/auth-2026-10-21';
await fs.mkdir(output, { recursive: true });
try {
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: width < 800 ? 'reduce' : 'no-preference' });
    await page.goto(`${origin}/login?next=/dashboard/guests`, { waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: 'Welcome back' }).waitFor();
    assert.equal(await page.locator('.wd-wedding-mark').count(), 2);
    assert.equal(await page.locator('.wd-grid').count(), 0);
    assert.equal(await page.locator('input[name=next]').inputValue(), '/dashboard/guests');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.getByLabel('Email', { exact: true }).focus();
    assert.equal(await page.getByLabel('Email', { exact: true }).evaluate(el => getComputedStyle(el).outlineStyle), 'solid');
    await page.screenshot({ path: `${output}/login-${width}.png`, fullPage: true });
    await page.getByRole('link', { name: 'Create an account' }).click();
    await page.getByLabel('Your name').waitFor();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.screenshot({ path: `${output}/signup-${width}.png`, fullPage: true });
    console.log(`PASS login/signup ${width}px: original logos, responsive layout, focus, safe destination`);
  }

  await page.setViewportSize({ width: 390, height: 660 });
  await page.goto(`${origin}/login?next=//example.com`, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('input[name=next]').inputValue(), '/dashboard');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  assert.equal(await page.getByLabel('Email', { exact: true }).evaluate(el => el.validity.valueMissing), true);
  // Whitespace passes native length checks but is rejected by server validation,
  // before any Supabase call. No real credentials or live data are used.
  await page.getByLabel('Email', { exact: true }).fill('design-check@example.test');
  await page.getByLabel('Password', { exact: true }).fill('      ');
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  await page.route('**/*', async route => {
    if (route.request().method() === 'POST') await gate;
    await route.continue();
  });
  await page.getByRole('button', { name: 'Sign in', exact: true }).click({ noWaitAfter: true });
  await page.getByRole('button', { name: 'Please wait…' }).waitFor();
  assert.equal(await page.getByRole('button', { name: 'Please wait…' }).isDisabled(), true);
  assert.equal(await page.locator('form').getAttribute('aria-busy'), 'true');
  await page.screenshot({ path: `${output}/login-pending-390.png`, fullPage: true });
  release();
  await page.getByRole('alert').filter({ hasText: 'Email and password are required.' }).waitFor();
  assert.equal(await page.getByRole('button', { name: 'Sign in', exact: true }).isEnabled(), true);
  await page.screenshot({ path: `${output}/login-error-390.png`, fullPage: true });
  console.log('PASS native validation, pending disabled/busy state, server error/retry, external redirect rejection');

  for (const path of ['/favicon.ico', '/icon.png', '/apple-icon.png']) {
    const response = await page.request.get(`${origin}${path}`);
    assert.equal(response.status(), 200);
    assert.ok((await response.body()).length > 500);
  }
  assert.ok(await page.locator('link[rel=icon]').count());
  assert.ok(await page.locator('link[rel=apple-touch-icon]').count());
  const icon = await fs.readFile('src/app/favicon.ico');
  assert.equal(icon.readUInt16LE(2), 1);
  assert.equal(icon.readUInt16LE(4), 3);
  assert.deepEqual([icon[6], icon[22], icon[38]], [16, 32, 48]);
  const noJs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const staticPage = await noJs.newPage();
  await staticPage.goto(`${origin}/login`);
  assert.ok(await staticPage.getByRole('heading', { name: 'Welcome back' }).isVisible());
  assert.ok(await staticPage.getByRole('button', { name: 'Sign in', exact: true }).isVisible());
  await noJs.close();
  assert.deepEqual(errors, []);
  console.log('PASS favicon sizes, app/touch metadata and routes, JavaScript-disabled visibility, no page errors');
} finally { await browser.close(); }
