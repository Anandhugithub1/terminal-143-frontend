import { test } from '@playwright/test'

test('manual login and save session', async ({ page }) => {
  await page.goto('https://terminal143.com/login')

  // Pause so YOU can login manually
  await page.pause()

  // IMPORTANT: only continue AFTER you see the home page
  await page.waitForURL('**/home', { timeout: 60000 })

  // Save logged-in session
  await page.context().storageState({
    path: 'playwright/.auth/user.json'
  })
})
