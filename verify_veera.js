const { chromium } = require('playwright');
const path = require('path');

async function testVeeraAssistant() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  console.log('1. Loading landing page...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  console.log('2. Opening Veera AI assistant orb...');
  await page.click('button[title*="Veera AI"]');
  await page.waitForTimeout(1000);

  // Take screenshot with orb open
  await page.screenshot({ path: path.join(__dirname, 'screenshots', 'veera_assistant_open.png') });

  console.log('3. Sending test command: "weather here"...');
  await page.fill('input[placeholder*="Ask:"]', 'weather here');
  await page.click('button[title="Send query"]');
  await page.waitForTimeout(2500);

  await page.screenshot({ path: path.join(__dirname, 'screenshots', 'veera_assistant_weather_here.png') });

  console.log('4. Sending test command: "weather in Mumbai"...');
  await page.fill('input[placeholder*="Ask:"]', 'weather in Mumbai');
  await page.click('button[title="Send query"]');
  await page.waitForTimeout(2500);

  await page.screenshot({ path: path.join(__dirname, 'screenshots', 'veera_assistant_mumbai_weather.png') });

  console.log('5. Testing operational command: "plan trip from Bengaluru to Mysuru"...');
  await page.fill('input[placeholder*="Ask:"]', 'plan trip from Bengaluru to Mysuru');
  await page.click('button[title="Send query"]');
  await page.waitForTimeout(2500);

  await page.screenshot({ path: path.join(__dirname, 'screenshots', 'veera_assistant_plan_trip_navigated.png') });

  await browser.close();
  console.log('Veera Assistant test completed successfully!');
}

testVeeraAssistant().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
