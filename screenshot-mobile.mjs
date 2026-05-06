import puppeteer from 'puppeteer';
import { existsSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dir = join(__dirname, 'temporary screenshots');
if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

const url = process.argv[2] || 'http://localhost:3000';
const clipY = parseInt(process.argv[3] || '0');
const label = process.argv[4] ? `-${process.argv[4]}` : '';
const existing = readdirSync(dir).filter(f => f.endsWith('.png'));
const n = existing.length + 1;
const outFile = join(dir, `screenshot-${n}${label}.png`);

const browser = await puppeteer.launch({
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
});
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
await page.evaluate(() => {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
});
await page.waitForTimeout(800);
if (clipY > 0) {
  await page.screenshot({ path: outFile, clip: { x: 0, y: clipY, width: 390, height: 844 } });
} else {
  await page.screenshot({ path: outFile, fullPage: true });
}
await browser.close();
console.log(`Saved: ${outFile}`);
