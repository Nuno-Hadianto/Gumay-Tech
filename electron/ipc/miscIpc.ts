import db from '../../database/db';
export {};
import type { IpcMainInvokeEvent } from 'electron';
import type { Settings, Payment } from '../../shared/types';
import {  app, ipcMain, dialog, shell, BrowserWindow, Notification  } from 'electron';
import fs from 'fs';
import path from 'path';
import os from 'os';

import url from 'url';

import * as dashboardController from '../../controllers/dashboardController';
import * as paymentController from '../../controllers/paymentController';
import * as settingsController from '../../controllers/settingsController';
import * as reportController from '../../controllers/reportController';
import log from 'electron-log';

function registerMiscIpc(mainWindow: BrowserWindow) {
  // Dashboard
  ipcMain.handle('get-dashboard-stats', () => dashboardController.getDashboardStats());
  ipcMain.handle('get-alerts', () => dashboardController.getAlerts());

  // Native Notifications
  ipcMain.handle('show-notification', (_event: IpcMainInvokeEvent, { title, body }: { title: string, body: string }) => {
    new Notification({ title, body }).show();
    return true;
  });

  // Payments
  ipcMain.handle('get-payments', (_event: IpcMainInvokeEvent, serviceId: number) => paymentController.getPaymentsByServiceId(serviceId));
  ipcMain.handle('add-payment', (_event: IpcMainInvokeEvent, data: Omit<Payment, 'id'>) => paymentController.addPayment(data));
  ipcMain.handle('delete-payment', (_event: IpcMainInvokeEvent, id: number) => paymentController.deletePayment(id));

  // Settings
  ipcMain.handle('get-settings', () => settingsController.getSettings());
  ipcMain.handle('update-settings', (_event: IpcMainInvokeEvent, data: Settings) => settingsController.updateSettings(data));

  // Reports
  ipcMain.handle('get-income-report', (_event: IpcMainInvokeEvent, start: string, end: string) => reportController.getIncomeReport(start, end));
  ipcMain.handle('get-completed-services', (_event: IpcMainInvokeEvent, start: string, end: string) => reportController.getCompletedServices(start, end));
  ipcMain.handle('get-top-spareparts', (_event: IpcMainInvokeEvent, start: string, end: string) => reportController.getTopSpareparts(start, end));
  ipcMain.handle('get-report-breakdown', (_event: IpcMainInvokeEvent, start: string, end: string) => reportController.getReportBreakdown(start, end));

  // Backup & Restore
  ipcMain.handle('get-db-size', async () => {
    try {
      const dbPath = path.join(app.getPath('userData'), 'database', 'nunox_servis.db');
      if (fs.existsSync(dbPath)) {
        const stats = fs.statSync(dbPath);
        return stats.size;
      }
      return 0;
    } catch (error) {
      log.error('Error getting DB size:', error);
      return 0;
    }
  });

  ipcMain.handle('backup-database', async () => {
    // const dbPath = path.join(app.getPath('userData'), 'database', 'nunox_servis.db');
    const defaultPath = `nuNox_servis_Backup_${new Date().toISOString().split('T')[0]}.db`;
    const { filePath } = await dialog.showSaveDialog({
      title: 'Backup Database',
      defaultPath: defaultPath,
      filters: [{ name: 'Database', extensions: ['db'] }]
    });
    
    if (filePath) {
      await db.backup(filePath);
      return true;
    }
    return false;
  });

  ipcMain.handle('select-directory', async () => {
    const { filePaths } = await dialog.showOpenDialog({
      title: 'Pilih Folder',
      properties: ['openDirectory']
    });
    if (filePaths && filePaths.length > 0) {
      return filePaths[0];
    }
    return null;
  });

  ipcMain.handle('restore-database', async () => {
    const { filePaths } = await dialog.showOpenDialog({
      title: 'Restore Database',
      properties: ['openFile'],
      filters: [{ name: 'Database', extensions: ['db'] }]
    });
    
    if (filePaths && filePaths.length > 0) {
      const dbPath = path.join(app.getPath('userData'), 'database', 'nunox_servis.db');
      db.close();
      fs.copyFileSync(filePaths[0], dbPath);
      setTimeout(() => {
        app.relaunch();
        app.exit(0);
      }, 2500);
      return true;
    }
    return false;
  });



  // Export & Print


  ipcMain.handle('export-pdf', async (_event: IpcMainInvokeEvent, { html, filename }: { html: string, filename: string }) => {
    try {
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Simpan PDF',
        defaultPath: filename || 'Invoice.pdf',
        filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
      });

      if (canceled || !filePath) return { success: false, canceled: true };

      const pdfWindow = new BrowserWindow({ show: false, webPreferences: { nodeIntegration: false } });
      const tmpHtmlPath = path.join(os.tmpdir(), `print_${Date.now()}.html`);
      fs.writeFileSync(tmpHtmlPath, html, 'utf-8');
      
      await pdfWindow.loadURL(url.pathToFileURL(tmpHtmlPath).href);
      await new Promise(resolve => setTimeout(resolve, 500));

      const pdfData = await pdfWindow.webContents.printToPDF({ printBackground: true, pageSize: 'A4' });
      fs.writeFileSync(filePath, pdfData);
      pdfWindow.close();
      try {
        fs.unlinkSync(tmpHtmlPath);
      } catch {
        // ignore
      }
      
      return { success: true, filePath };
    } catch (error: unknown) {
      log.error('Error generating PDF:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('print-preview', async (_event: IpcMainInvokeEvent, options: Record<string, unknown> = {}) => {
    try {
      const pdfPath = path.join(os.tmpdir(), `nunox_print_${Date.now()}.pdf`);
      const pdfOptions: Record<string, unknown> = {
        printBackground: true,
        landscape: options.landscape || false,
        preferCSSPageSize: true,
        marginsType: 1
      };
      if (options.pageSize) {
        pdfOptions.pageSize = options.pageSize;
      }
      const pdfData = await mainWindow.webContents.printToPDF(pdfOptions);
      fs.writeFileSync(pdfPath, pdfData);
      await shell.openPath(pdfPath);
      return true;
    } catch (error: unknown) {
      log.error('Error generating print preview:', error);
      throw error;
    }
  });

  ipcMain.handle('open-external-url', async (_event: IpcMainInvokeEvent, url: string) => {
    try {
      await shell.openExternal(url);
      return true;
    } catch (error: unknown) {
      log.error('Failed to open external url:', error);
      return false;
    }
  });

  ipcMain.handle('get-logo-base64', async () => {
    try {
      let logoPath = path.join(__dirname, '..', '..', '..', 'public', 'img', 'logo.png');
      if (!fs.existsSync(logoPath) && app) {
        logoPath = path.join(app.getAppPath(), 'public', 'img', 'logo.png');
      }
      if (fs.existsSync(logoPath)) {
        const ext = path.extname(logoPath).toLowerCase();
        const mimeType = ext === '.png' ? 'image/png' : (ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/png');
        const bitmap = fs.readFileSync(logoPath);
        return `data:${mimeType};base64,${bitmap.toString('base64')}`;
      }
      return null;
    } catch (error: unknown) {
      log.error('Failed to read logo:', error);
      return null;
    }
  });

  ipcMain.handle('get-signature-base64', async () => {
    try {
      let sigPath = path.join(__dirname, '..', '..', '..', 'public', 'img', 'tanda-tangan.png');
      if (!fs.existsSync(sigPath) && app) {
        sigPath = path.join(app.getAppPath(), 'public', 'img', 'tanda-tangan.png');
      }
      if (fs.existsSync(sigPath)) {
        const ext = path.extname(sigPath).toLowerCase();
        const mimeType = ext === '.png' ? 'image/png' : (ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/png');
        const bitmap = fs.readFileSync(sigPath);
        return `data:${mimeType};base64,${bitmap.toString('base64')}`;
      }
      return null;
    } catch (error: unknown) {
      log.error('Failed to read signature:', error);
      return null;
    }
  });
}

export {  registerMiscIpc  };

