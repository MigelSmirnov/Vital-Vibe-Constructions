import { chromium } from '../../.visual-tools/node_modules/playwright/index.mjs';
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { projectLocaleRoutes } from '../site-next/project-locales.mjs';
const base = process.env.VVC_TEST_ORIGIN || 'http://vvc.local';
const routes = projectLocaleRoutes(JSON.parse(await readFile('architecture/project-routes.yaml', 'utf8')));
const types = { '.html':'text/html', '.css':'text/css', '.js':'text/javascript', '.svg':'image/svg+xml', '.jpeg':'image/jpeg', '.jpg':'image/jpeg', '.png':'image/png', '.webp':'image/webp' };
const results = [];
await mkdir('artifacts/visual/project-locales', { recursive:true });
const browser = await chromium.launch({ headless:true, ...(process.env.VVC_CHROMIUM_PATH ? {executablePath:process.env.VVC_CHROMIUM_PATH} : {}) });
try {
  for (const width of [390, 768, 1440]) {
    const context = await browser.newContext({viewport:{width,height:900}});
    if (!process.env.VVC_TEST_ORIGIN) await context.route('http://vvc.local/**', async route => {
      let file = path.join(process.cwd(), '.deploy-dist', new URL(route.request().url()).pathname);
      try {
        if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
        await route.fulfill({status:200, body:await readFile(file),contentType:types[path.extname(file)] || 'application/octet-stream'});
      } catch { await route.fulfill({status:404,body:'Not found'}); }
    });
    const page = await context.newPage();
    const failures = [];
    page.on('pageerror', error => failures.push(error.message));
    page.on('response', response => { if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`); });
    for (const route of routes) {
      assert.equal((await page.goto(base + route.path)).status(),200);
      await page.locator('img').evaluateAll(async images => {
        for (const image of images) image.loading = 'eager';
        await Promise.all(images.map(image => image.decode().catch(() => undefined)));
      });
      const state = await page.evaluate(() => ({
        language:document.documentElement.lang,
        overflow:document.documentElement.scrollWidth > innerWidth + 1,
        overflowElements:[...document.querySelectorAll("main *")].filter(el => el.getBoundingClientRect().right > innerWidth + 1).map(el => ({tag:el.tagName, text:el.textContent.slice(0,100), width:el.getBoundingClientRect().width})),
        broken:[...document.images].filter(image => !image.naturalWidth).map(image => image.src),
        heading:document.querySelector('h1').textContent,
        webp:[...document.images].filter(image => image.currentSrc.includes('.webp')).length,
        switches:[...document.querySelectorAll('.language-switcher a')].map(a => ({lang:a.lang, path:new URL(a.href).pathname})),
      }));
      assert.equal(state.language,route.language);
      assert.equal(state.overflow,false,`${route.path} @ ${width}: overflow ${JSON.stringify(state.overflowElements)}`);
      assert.deepEqual(state.broken,[],route.path);
      assert.deepEqual(failures,[],route.path);
      if (route.path.includes('estandar') || route.path.endsWith('/projects/')) assert.ok(state.webp >= 1,route.path);
      if (route.path.includes('premium')) assert.equal(state.webp,10);
      for (const link of state.switches) assert.ok(routes.some(r => r.path === link.path && r.language === link.lang));
      results.push({path:route.path,width,...state});
      if (route.language === 'ru' && route.path.includes('estudio') && width !== 768) await page.screenshot({path:`artifacts/visual/project-locales/raval-${width}.png`,fullPage:true});
    }
    for (const language of ['en','ru']) {
      await page.goto(base + `/${language}/`);
      await page.locator('.project-card h3 a').first().click();
      assert.ok(new URL(page.url()).pathname.startsWith(`/${language}/projects/`));
      await page.locator('.language-switcher a[lang="es"]').click();
      assert.equal(await page.locator('html').getAttribute('lang'),'es');
      await page.locator(`.language-switcher a[lang="${language}"]`).click();
      await page.locator('.back-link').click();
      assert.equal(new URL(page.url()).pathname,`/${language}/projects/`);
    }
    await context.close();
    console.log(`Project language and navigation checks passed at ${width}px`);
  }
} finally {
  await browser.close();
  await writeFile('artifacts/visual/project-locales/report.json',JSON.stringify({base,results},null,2)+'\n');
}
console.log(`${results.length} project page/viewport checks passed.`);
