import { test, devices } from '@playwright/test'

test.setTimeout(0) //  disable timeout

test.use({
  ...devices['iPhone 13'],
  storageState: 'playwright/.auth/user.json'
})

test('Mobile Safari preview (stay open)', async ({ page }) => {
  console.log('BEFORE GOTO')

  await page.goto('https://terminal143.com/profile', {
    waitUntil: 'domcontentloaded'
  })

  console.log('AFTER GOTO', page.url())

  // keep browser open forever
  await new Promise(() => {})
})
