import { test, expect } from '@playwright/test'

const testEmail = `test_${Date.now()}@example.com`
const testPassword = 'password123'

test('user can sign up and land on feed', async ({ page }) => {
  await page.goto('/register')
  await page.fill('input[type="email"]', testEmail)
  await page.fill('input[type="password"]', testPassword)
  await page.click('button[type="submit"]')
  await page.waitForTimeout(2000)
  expect(page.url()).toContain('/feed')
})

test('unauthenticated user is redirected to login', async ({ page }) => {
  await page.goto('/feed')
  await page.waitForTimeout(1000)
  expect(page.url()).toContain('/login')
})

test('user can sign in', async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'yewande.awonaike@gmail.com')
  await page.fill('input[type="password"]', 'your-password-here')
  await page.click('button[type="submit"]')
  await page.waitForTimeout(2000)
  expect(page.url()).toContain('/feed')
})

test('user can search for a post', async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'yewande.awonaike@gmail.com')
  await page.fill('input[type="password"]', 'your-password-here')
  await page.click('button[type="submit"]')
  await page.waitForTimeout(2000)
  await page.fill('input[placeholder="Search posts..."]', 'post')
  await page.click('button:has-text("Search")')
  await page.waitForTimeout(1000)
  expect(page.url()).toContain('/feed')
})

test('user can navigate to write page', async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'yewande.awonaike@gmail.com')
  await page.fill('input[type="password"]', 'Altschoolwonder')
  await page.click('button[type="submit"]')
  await page.waitForTimeout(2000)
  await page.click('a:has-text("Write")')
  await page.waitForTimeout(1000)
  expect(page.url()).toContain('/write')
})

test('user can navigate to dashboard', async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'yewande.awonaike@gmail.com')
  await page.fill('input[type="password"]', 'Altschoolwonder')
  await page.click('button[type="submit"]')
  await page.waitForTimeout(2000)
  await page.click('a:has-text("Dashboard")')
  await page.waitForTimeout(1000)
  expect(page.url()).toContain('/dashboard')
})