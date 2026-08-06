const { chromium } = require('playwright');

(async () => {
  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    colorScheme: 'dark'
  });
  const page = await context.newPage();

  console.log("Navigating to login page...");
  await page.goto('https://logiquest.nileshmori.me/login', { waitUntil: 'domcontentloaded' });

  // Try to fill in credentials
  try {
    await page.waitForTimeout(2000);
    await page.fill('input[type="email"]', 'nileshbm7757@gmail.com');
    await page.fill('input[type="password"]', 'Nilesh7757');
    await page.press('input[type="password"]', 'Enter');
    console.log("Submitted login form. Waiting for navigation...");
    await page.waitForTimeout(4000);
  } catch (e) {
    console.log("Error during login: ", e.message);
  }

  const pagesToCapture = [
    { name: 'contest', url: 'https://logiquest.nileshmori.me/contest', delay: 4000 },
    { name: 'architect', url: 'https://logiquest.nileshmori.me/architect', delay: 4000 },
    { name: 'leaderboard', url: 'https://logiquest.nileshmori.me/leaderboard', delay: 4000 },
    { name: 'interview', url: 'https://logiquest.nileshmori.me/interview', delay: 4000 }
  ];

  for (const p of pagesToCapture) {
    console.log(`Capturing ${p.name}...`);
    await page.goto(p.url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(p.delay);
    await page.screenshot({ path: `docs/assets/${p.name}.png` });
  }

  console.log("Additional screenshots saved to docs/assets/");
  await browser.close();
})();
