const { chromium } = require('playwright');
const path = require('path');

const VIEWPORTS = [
  { name: 'mobile_360', width: 360, height: 740 },
  { name: 'mobile_390', width: 390, height: 844 },
  { name: 'mobile_430', width: 430, height: 932 },
  { name: 'tablet_768', width: 768, height: 1024 },
  { name: 'laptop_1024', width: 1024, height: 768 },
  { name: 'desktop_1440', width: 1440, height: 900 },
  { name: 'ultrawide_1920', width: 1920, height: 1080 }
];

async function run() {
  console.log('Launching installed system Chrome for verification & screenshots...');
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  // Listen to any page console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(err.message);
  });

  for (const vp of VIEWPORTS) {
    console.log(`Testing viewport ${vp.name} (${vp.width}x${vp.height})...`);
    await page.setViewportSize({ width: vp.width, height: vp.height });
    
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000); // Allow Framer Motion entries
    
    const screenshotPath = path.join(__dirname, 'screenshots', `${vp.name}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`Saved screenshot: ${screenshotPath}`);
  }

  // Also verify Plan Trip page
  console.log('Verifying Plan Trip page rendering...');
  await page.goto('http://localhost:5173/plan-trip', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(__dirname, 'screenshots', 'plan_trip_desktop.png') });

  // Verify Features page
  console.log('Verifying Features page rendering...');
  await page.goto('http://localhost:5173/features', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(__dirname, 'screenshots', 'features_desktop.png') });

  // Verify Explore page
  console.log('Verifying Explore page rendering...');
  await page.goto('http://localhost:5173/explore', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(__dirname, 'screenshots', 'explore_desktop.png') });

  await browser.close();

  console.log('Console Errors caught during run:', consoleErrors.length);
  if (consoleErrors.length > 0) {
    consoleErrors.forEach(e => console.log('  [Error]', e));
  } else {
    console.log('PERFECT! Zero console errors detected across all tested pages and viewports.');
  }
}

run().catch(err => {
  console.error('Test run failed:', err);
  process.exit(1);
});
