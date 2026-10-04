import { chromium } from '../../.visual-tools/node_modules/playwright/index.mjs';
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

const origin = process.env.VVC_TEST_ORIGIN || 'http://vvc.local';
const output = 'artifacts/visual/service-project-cards';
const types = { '.html':'text/html', '.css':'text/css', '.js':'text/javascript', '.svg':'image/svg+xml', '.jpeg':'image/jpeg', '.jpg':'image/jpeg', '.png':'image/png', '.webp':'image/webp' };
const browser = await chromium.launch({ headless:true, ...(process.env.VVC_CHROMIUM_PATH ? { executablePath:process.env.VVC_CHROMIUM_PATH } : {}) });
const results = [];
await mkdir(output, { recursive:true });
try {
  for (const width of [360,390,768,1024,1440]) for (const language of ['es','en','ru']) {
    const context = await browser.newContext({ viewport:{ width,height:1000 }, reducedMotion:'reduce' });
    if (!process.env.VVC_TEST_ORIGIN) await context.route(origin+'/**', async route => {
      try {
        let file = path.join(process.cwd(),'.deploy-dist',new URL(route.request().url()).pathname);
        if ((await stat(file)).isDirectory()) file = path.join(file,'index.html');
        await route.fulfill({ status:200,body:await readFile(file),contentType:types[path.extname(file)] || 'application/octet-stream' });
      } catch { await route.fulfill({ status:404,body:'Not found' }); }
    });
    const page = await context.newPage();
    const prefix = language === 'es' ? '' : `/${language}`;
    assert.equal((await page.goto(origin+prefix+'/')).status(),200);
    const cards = page.locator('.service-project-card');
    assert.ok(await cards.count() > 0);
    for (const card of await cards.all()) {
      const row = card.locator('xpath=ancestor::details');
      await row.locator('summary').click();
      const photo = card.locator('img');
      // Opening details exposes a lazy image; wait for its selected resource to load.
      // A failed image still times out here, and decode remains a strict check.
      await photo.scrollIntoViewIfNeeded();
      const imageHandle = await photo.elementHandle();
      try {
        await page.waitForFunction(image => image.complete && image.naturalWidth > 0,
          imageHandle, { timeout:10000 });
        await photo.evaluate(image => image.decode());
      } finally {
        await imageHandle.dispose();
      }
      const state = await card.evaluate(element => {
        const image = element.querySelector('img');
        const copy = element.querySelector('.service-project-copy');
        const title = copy.querySelector('strong');
        const rect = node => { const r = node.getBoundingClientRect(); return { x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom }; };
        return { card:rect(element),image:rect(image),copy:rect(copy),title:rect(title),naturalRatio:image.naturalWidth/image.naturalHeight,
          sourceBoxes:[...element.querySelectorAll('source')].map(rect),currentSrc:image.currentSrc,
          overflow:document.documentElement.scrollWidth>innerWidth+1 };
      });
      const label = `${language} @ ${width}`;
      assert.ok(state.sourceBoxes.every(r => r.width === 0 && r.height === 0),`${label}: source occupies a grid cell`);
      assert.ok(state.image.right < state.copy.x,`${label}: image must be left of copy`);
      assert.ok(state.copy.y < state.image.bottom && state.image.y < state.copy.bottom,`${label}: image and copy must share a row`);
      assert.ok(state.title.width >= 120,`${label}: title squeezed into narrow column`);
      assert.ok(Math.abs(state.image.width/state.image.height-state.naturalRatio)<0.015,`${label}: photograph aspect ratio changed`);
      assert.ok(state.copy.right <= state.card.right && state.image.right <= state.card.right,`${label}: card overflow`);
      assert.equal(state.overflow,false,label);
      assert.ok(state.currentSrc.endsWith('.webp'),label);
      assert.equal(await page.locator('#proyectos a[href*="joanic"]').count(),0);
      await row.screenshot({ path:`${output}/${language}-${width}.png` });
      results.push({ language,width,...state });
    }
    await context.close();
    console.log(`Service project layout: ${language} @ ${width} passed`);
  }
} finally {
  await browser.close();
  await writeFile(`${output}/report.json`,JSON.stringify({ origin,results },null,2)+'\n');
}
