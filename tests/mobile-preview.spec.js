import { test, devices } from '@playwright/test'

test.use({ ...devices['iPhone 13'] })
test('mobile preview – iPhone 13', async ({ page }) => {
  await page.goto('https://terminal143.com/info')
  await page.waitForTimeout(3000)
  await page.pause()
})

test.use({ ...devices['Pixel 5'] })
test('mobile preview – Pixel 5', async ({ page }) => {
  await page.goto('https://terminal143.com/info')
  await page.waitForTimeout(3000)
  await page.pause()
})

test.use({ ...devices['iPad Mini'] })
test('mobile preview – iPad Mini', async ({ page }) => {
  await page.goto('https://terminal143.com/info')
  await page.waitForTimeout(3000)
  await page.pause()
})
