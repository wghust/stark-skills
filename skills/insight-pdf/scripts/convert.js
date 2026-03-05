#!/usr/bin/env node
/**
 * insight-pdf convert: HTML → PDF
 * Usage: node convert.js <html-path> <pdf-path>
 * Reads HTML from html-path, outputs PDF to pdf-path.
 * Dependencies: npm install (in skill directory)
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const [htmlPath, pdfPath] = process.argv.slice(2);

if (!htmlPath || !pdfPath) {
  console.error('Usage: node convert.js <html-path> <pdf-path>');
  process.exit(1);
}

const htmlAbs = path.resolve(htmlPath);
const pdfAbs = path.resolve(pdfPath);

if (!fs.existsSync(htmlAbs)) {
  console.error('Error: HTML file not found:', htmlAbs);
  process.exit(1);
}

(async () => {
  let browser;
  try {
    browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(`file://${htmlAbs}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.pdf({
      path: pdfAbs,
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' }
    });
    console.log(pdfAbs);
  } catch (err) {
    if (err.message && (err.message.includes('Executable doesn\'t exist') || err.message.includes('chromium'))) {
      console.error('Error: Playwright Chromium not installed.');
      console.error('Run in skill directory: npm install && npx playwright install chromium');
      process.exit(1);
    }
    throw err;
  } finally {
    if (browser) await browser.close();
  }
})();
