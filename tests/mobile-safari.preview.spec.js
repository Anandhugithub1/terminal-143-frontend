import { test, devices } from '@playwright/test'

test.use({
  ...devices['iPhone 13'],
  storageState: 'playwright/.auth/user.json'
})

test('Mobile Safari preview', async ({ page }) => {
  await page.goto('https://local.passormatch.com:5173/home', {
    waitUntil: 'domcontentloaded'
  })

  await page.pause() //  opens Playwright Inspector
})
