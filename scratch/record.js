const { chromium } = require('playwright');
const path = require('path');

async function run() {
  console.log("Launching browser with video recording...");
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: path.join(__dirname, '..', 'linkedin'),
      size: { width: 1280, height: 720 }
    }
  });

  const page = await context.newPage();
  
  console.log("Navigating to login page...");
  await page.goto('http://localhost:3000/login');
  await page.waitForTimeout(3000);

  console.log("Logging in...");
  await page.locator("input[type='email']").fill('nileshbm7757@gmail.com');
  await page.locator("input[type='password']").fill('Nilesh7757');
  await page.locator("button[type='submit']").click({ force: true });

  console.log("Waiting for problems page...");
  await page.waitForURL('**/problems', { timeout: 30000 });
  await page.waitForTimeout(3000);

  console.log("Navigating to Task Scheduler...");
  await page.goto('http://localhost:3000/problems/task-scheduler');
  
  console.log("Waiting for Monaco editor...");
  const editorContainer = page.locator('.monaco-editor').first();
  await editorContainer.waitFor({ state: 'visible', timeout: 45000 });
  await page.waitForTimeout(3000);

  console.log("Clicking editor...");
  await editorContainer.click({ force: true });
  await page.waitForTimeout(1000);
  
  console.log("Typing code comment...");
  await page.keyboard.press('Control+KeyA');
  await page.keyboard.press('Backspace');
  await page.keyboard.type('// Implementing optimal Task Scheduler solution\n');
  await page.keyboard.type('function solve() {\n  // Code running...\n}');
  await page.waitForTimeout(3000);

  console.log("Clicking RUN button...");
  await page.locator("button:has-text('RUN')").click({ force: true });
  await page.waitForTimeout(5000);

  console.log("Clicking SUBMIT button...");
  await page.locator("button:has-text('SUBMIT')").click({ force: true });
  await page.waitForTimeout(10000);

  console.log("Closing browser and saving video...");
  await context.close();
  await browser.close();
  console.log("Video saved successfully!");
}

run().catch(err => {
  console.error("Error running script:", err);
  process.exit(1);
});
