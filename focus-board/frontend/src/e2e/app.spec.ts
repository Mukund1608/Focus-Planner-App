import { test, expect } from '@playwright/test'

test.describe('Main App Functionality', () => {
  test('should display dashboard after login', async ({ page }) => {
    // Mock authentication - in real test you'd actually log in
    await page.goto('/dashboard')
    
    // Check for main app elements
    await expect(page.getByText('FocusBoard')).toBeVisible()
    await expect(page.getByText('Daily')).toBeVisible()
    await expect(page.getByText('Weekly')).toBeVisible()
  })

  test('should navigate between views', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Click on Weekly view
    await page.getByText('Weekly').click()
    await expect(page.getByText('Weekly View')).toBeVisible()
    
    // Click on Daily view
    await page.getByText('Daily').click()
    await expect(page.getByText('Daily View')).toBeVisible()
  })

  test('should display priority board', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Check for priority columns
    await expect(page.getByText('Urgent')).toBeVisible()
    await expect(page.getByText('High')).toBeVisible()
    await expect(page.getByText('Medium')).toBeVisible()
    await expect(page.getByText('Low')).toBeVisible()
  })

  test('should have responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/dashboard')
    
    // Check that mobile navigation is accessible
    await expect(page.getByRole('button', { name: /menu/i })).toBeVisible()
  })
})
