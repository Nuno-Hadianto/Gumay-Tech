const { _electron: electron } = require('@playwright/test');
const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Gumay Tech UI Black-box testing', () => {
  let electronApp;
  let window;

  test.beforeAll(async () => {
    // Launch Electron app
    electronApp = await electron.launch({
      args: [path.join(__dirname, '..', 'electron', 'main.js')],
      // Ensure we use the test database
      env: { ...process.env, NODE_ENV: 'test' }
    });
    // Wait for the first BrowserWindow
    window = await electronApp.firstWindow();
    await window.waitForLoadState('domcontentloaded');
    
    // Perform login since the app now requires it
    await window.fill('#login-username', 'admin');
    await window.fill('#login-password', 'admin123');
    await window.click('#btn-login');
    
    // Wait for authentication and view switch
    const dashboardView = window.locator('#view-dashboard');
    await expect(dashboardView).toBeVisible({ timeout: 5000 });
  });

  test.afterAll(async () => {
    // Close app
    await electronApp.close();
  });

  test('App should launch with correct title', async () => {
    const title = await window.title();
    expect(title).toBe('Gumay Tech - Dashboard');
  });

  test('Sidebar should contain navigation links', async () => {
    // Verify sidebar exists
    const sidebar = window.locator('.sidebar');
    await expect(sidebar).toBeVisible();

    // Verify Dashboard link exists
    const dashboardLink = window.locator('#nav-dashboard');
    await expect(dashboardLink).toBeVisible();
    await expect(dashboardLink).toContainText('Dashboard');
  });

  test('Clicking Pelanggan menu should switch to Customer View', async () => {
    const customerLink = window.locator('#nav-customers');
    await customerLink.click();

    const customerView = window.locator('#view-customers');
    // It should become visible (display: block)
    await expect(customerView).toBeVisible();

    // The header #page-title should change to "Data Pelanggan" (or something similar depending on your app.js)
    const pageTitle = window.locator('#page-title');
    await expect(pageTitle).toContainText('Pelanggan');
  });

  test('Clicking Tambah Pelanggan button should open modal', async () => {
    // Click Tambah Pelanggan
    const addCustomerBtn = window.locator('#btn-add-customer');
    await addCustomerBtn.click();

    // Modal should appear
    const modal = window.locator('#customer-modal');
    await expect(modal).toBeVisible();

    // There should be an input for Customer Name
    const nameInput = window.locator('#customer-name');
    await expect(nameInput).toBeVisible();

    // Close the modal to clean up
    const closeBtn = modal.locator('.close-modal').first();
    await closeBtn.click();
  });

  test('Should be able to complete a full core business flow (Customer -> Device -> Service)', async () => {
    // === 1. Buat Pelanggan ===
    await window.locator('#nav-customers').click();
    await expect(window.locator('#view-customers')).toBeVisible();

    await window.locator('#btn-add-customer').click();
    await expect(window.locator('#customer-modal')).toBeVisible();

    await window.fill('#customer-name', 'Budi Santoso');
    await window.fill('#customer-phone', '08123456789');
    
    await window.locator('#customer-form button[type="submit"]').click();
    await expect(window.locator('#customer-modal')).toBeHidden();

    // === 2. Buat Perangkat ===
    await window.locator('#nav-devices').click();
    await expect(window.locator('#view-devices')).toBeVisible();
    await window.locator('#btn-add-device').click();
    await expect(window.locator('#device-modal')).toBeVisible();

    // Tunggu opsi pelanggan terisi lalu pilih
    await window.waitForTimeout(500); 
    await window.locator('#device-customer-id').selectOption({ index: 1 });
    await window.locator('#device-type').selectOption({ label: 'Laptop' });
    await window.fill('#device-brand', 'Asus');
    await window.fill('#device-model', 'ROG');
    await window.fill('#device-condition', 'Layar retak');
    
    await window.locator('#device-form button[type="submit"]').click();
    await expect(window.locator('#device-modal')).toBeHidden();

    // === 3. Buat Tiket Servis ===
    await window.locator('#nav-services').click();
    await expect(window.locator('#view-services')).toBeVisible();
    await window.locator('#btn-add-service').click();
    await expect(window.locator('#service-modal')).toBeVisible();

    await window.waitForTimeout(500);
    await window.locator('#service-customer-id').selectOption({ index: 1 }); // Pilih pelanggan

    
    await window.waitForTimeout(500);
    await window.locator('#service-device-id').selectOption({ index: 1 }); // Index 1 karena index 0 = "-- Pilih --"
    
    await window.fill('#service-complaint', 'Layar pecah');
    
    await window.locator('#service-form button[type="submit"]').click();
    await expect(window.locator('#service-modal')).toBeHidden();
    
    // Pastikan tiket servis ada di tabel
    const serviceList = window.locator('#service-list');
    await expect(serviceList).toContainText('Budi Santoso');
  });
});
