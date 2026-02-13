// @ts-check
import { test, expect } from '@playwright/test'

const BASE_URL = 'https://terminal143.com'

const routes = [
  '/',
  '/login',
  '/register',
]

for (const route of routes) {
  test(`route loads ${route}`, async ({ page }) => {
    await page.goto(BASE_URL + route)

    await page.waitForLoadState('networkidle')

    await expect(page.locator('body')).toBeVisible()
  })
}
