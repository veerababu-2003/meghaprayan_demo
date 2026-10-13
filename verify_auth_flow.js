const { chromium } = require('playwright');
const path = require('path');

async function runAuthenticatedVerification() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  console.log('1. Registering user via UI...');
  await page.goto('http://localhost:5173/register', { waitUntil: 'networkidle' });
  await page.fill('input[placeholder="Veera Sharma"]', 'Veera UI Tester');
  const testEmail = `veera_ui_${Date.now()}@example.com`;
  await page.fill('input[placeholder="name@example.com"]', testEmail);
  await page.fill('input[placeholder="At least 8 characters"]', 'SecurePassword123!');
  await page.screenshot({ path: path.join(__dirname, 'screenshots', 'register_page.png') });
  await page.click('button[type="submit"]');

  // Wait navigation to dashboard
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  await page.waitForTimeout(1500);
  console.log('2. Landed on Dashboard. Taking screenshot...');
  await page.screenshot({ path: path.join(__dirname, 'screenshots', 'dashboard_desktop.png') });

  // Plan Trip
  console.log('3. Navigating to Plan Trip...');
  await page.goto('http://localhost:5173/plan-trip', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000); // Allow route calculation & weather timeline
  await page.screenshot({ path: path.join(__dirname, 'screenshots', 'plan_trip_calculated.png') });

  // Save Trip and navigate to Trip Details
  console.log('4. Saving trip...');
  const saveBtn = await page.waitForSelector('text=Save & View Trip Details', { timeout: 8000 });
  await saveBtn.click();
  await page.waitForURL('**/trip/**', { timeout: 10000 });
  await page.waitForTimeout(1500);
  console.log('5. Landed on Trip Details. Taking screenshot...');
  await page.screenshot({ path: path.join(__dirname, 'screenshots', 'trip_details_desktop.png') });

  // Start live trip
  console.log('6. Starting Live Trip...');
  const startBtn = await page.waitForSelector('text=Start Live Trip', { timeout: 8000 });
  await startBtn.click();
  await page.waitForURL('**/live-trip/**', { timeout: 10000 });
  await page.waitForTimeout(1500);
  console.log('7. Landed on Live Trip. Taking screenshot...');
  await page.screenshot({ path: path.join(__dirname, 'screenshots', 'live_trip_desktop.png') });

  // History & Profile
  console.log('8. Checking History...');
  await page.goto('http://localhost:5173/history', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(__dirname, 'screenshots', 'history_desktop.png') });

  console.log('9. Checking Profile...');
  await page.goto('http://localhost:5173/profile', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(__dirname, 'screenshots', 'profile_desktop.png') });

  console.log('10. Checking Settings...');
  await page.goto('http://localhost:5173/settings', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(__dirname, 'screenshots', 'settings_desktop.png') });

  await browser.close();
  console.log('Authenticated end-to-end user journey verified successfully with all screenshots saved!');
}

runAuthenticatedVerification().catch(err => {
  console.error('Authenticated run failed:', err);
  process.exit(1);
});
