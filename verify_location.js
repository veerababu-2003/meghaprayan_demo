const { chromium } = require('playwright');
const path = require('path');

async function testAccurateLocation() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  console.log('Testing accurate location rendering on Landing...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(__dirname, 'screenshots', 'landing_accurate_location.png') });

  console.log('Opening Veera AI and triggering Weather Here...');
  await page.click('button[title*="Veera AI"]');
  await page.waitForTimeout(1000);
  await page.click('button:has-text("Weather Here")');
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(__dirname, 'screenshots', 'veera_accurate_location.png') });

  await browser.close();
  console.log('Accurate location test complete!');
}

testAccurateLocation().catch(err => {
  console.error(err);
  process.exit(1);
});
