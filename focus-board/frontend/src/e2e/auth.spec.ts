import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/auth/')
    
    await expect(page.getByText('Sign In')).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'SIGN IN' })).toBeVisible()
  })

  test('should show sign up link', async ({ page }) => {
    await page.goto('/auth/')
    
    await expect(page.getByText('Not registered yet?')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Sign Up' })).toBeVisible()
  })

  test('should navigate to sign up page', async ({ page }) => {
    await page.goto('/auth/')
    
    await page.getByRole('link', { name: 'Sign Up' }).click()
    
    await expect(page.getByText('Sign Up')).toBeVisible()
    await expect(page.getByRole('button', { name: 'SIGN UP' })).toBeVisible()
  })
})
