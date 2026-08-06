const { chromium } = require('playwright');

(async () => {
  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    colorScheme: 'dark' // Assuming the site looks best in dark mode
  });
  const page = await context.newPage();

  console.log("Navigating to login page...");
  await page.goto('https://logiquest.nileshmori.me/login', { waitUntil: 'networkidle' });

  // Try to fill in credentials
  try {
    await page.fill('input[type="email"]', 'nileshbm7757@gmail.com');
    await page.fill('input[type="password"]', 'Nilesh7757');
    
    // Press Enter to submit
    await page.press('input[type="password"]', 'Enter');
    console.log("Submitted login form. Waiting for navigation...");
    
    // Wait for URL to change away from login
    await page.waitForURL('**/', { timeout: 15000 }).catch(() => console.log("Timeout waiting for url change"));
    // Wait for the app to settle
    await page.waitForTimeout(3000);
  } catch (e) {
    console.log("Error during login (maybe different selectors?): ", e.message);
  }

  // 1. Dashboard / Home
  console.log("Capturing Dashboard...");
  await page.goto('https://logiquest.nileshmori.me/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'docs/assets/dashboard.png' });

  // 2. Problems List
  console.log("Capturing Problems Page...");
  await page.goto('https://logiquest.nileshmori.me/problems', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'docs/assets/problems.png' });

  // 3. Problem Workspace
  console.log("Capturing Workspace...");
  await page.goto('https://logiquest.nileshmori.me/problems/nearest-meeting-cell', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000); // Wait longer for monaco editor
  await page.screenshot({ path: 'docs/assets/workspace.png' });

  // 4. Study Plans or Arena
  console.log("Capturing Study Plans...");
  await page.goto('https://logiquest.nileshmori.me/study-plans', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'docs/assets/study_plans.png' });

  console.log("Screenshots saved to docs/assets/");
  await browser.close();
})();
