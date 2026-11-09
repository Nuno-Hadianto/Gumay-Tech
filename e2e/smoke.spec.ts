import { _electron as electron } from 'playwright';
import { test, expect } from '@playwright/test';

test('App starts and shows Dashboard', async () => {
  const electronApp = await electron.launch({ args: ['.'] });
  
  electronApp.on('window', async (page) => {
    page.on('console', msg => console.log('Browser:', msg.text()));
    page.on('pageerror', err => console.log('Browser Error:', err));
  });

  const window = await electronApp.firstWindow();
  await window.waitForLoadState('domcontentloaded');
  
  // App should start and have correct title
  await expect(window).toHaveTitle(/Gumay Tech/i);
  
  // Check if Dashboard is visible instead of login form
  const dashboardText = window.getByText('Dashboard', { exact: true }).first();
  const brandName = window.getByText('Gumay Tech').first();
  
  await expect(dashboardText).toBeVisible();
  await expect(brandName).toBeVisible();
  
  await electronApp.close();
});
