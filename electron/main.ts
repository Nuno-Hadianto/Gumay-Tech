
import runMigrations from '../database/migrate';
import fs from 'fs';
import * as settingsRepo from '../repositories/settingsRepository';
import AdmZip from 'adm-zip';
export {};
import {  app, BrowserWindow, ipcMain, dialog  } from 'electron';
import path from 'path';
import db from '../database/db';
import log from 'electron-log';
import { EventBus } from './services/EventBus';


// Setup logging
(log.transports.file as { level: string }).level = 'info';

log.info('App starting...');

process.on('uncaughtException', (error) => {
  log.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  log.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Import IPC modules
import {  registerCustomerIpc  } from './ipc/customerIpc';
import {  registerDeviceIpc  } from './ipc/deviceIpc';
import {  registerServiceIpc  } from './ipc/serviceIpc';
import {  registerPartIpc  } from './ipc/partIpc';
import {  registerMiscIpc  } from './ipc/miscIpc';
import {  registerRecycleBinIpc  } from './ipc/recycleBinIpc';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Gumay Tech',
    icon: path.join(__dirname, '..', '..', 'public', 'img', 'icon.png'),
    autoHideMenuBar: true,
    show: false,
    backgroundColor: '#0f172a',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  ipcMain.once('app-ready', () => {
    mainWindow?.maximize();
    mainWindow?.show();
  });
  
  const isDev = !app.isPackaged && process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test';
  if (isDev) {
    // Memuat Vite Dev Server
    mainWindow.loadURL('http://localhost:5173');
    // mainWindow.webContents.openDevTools(); // Optional: buka devtools otomatis
  } else {
    // Memuat file hasil build Vite
    mainWindow.loadFile(path.join(__dirname, '..', '..', 'dist_frontend', 'index.html'));
  }

  // Register IPC handlers safely to prevent one failure from halting all others
  const registerSafe = (name: string, fn: () => void) => {
    try {
      fn();
    } catch (error) {
      console.error(`Failed to register ${name}:`, error);
      log.error(`Failed to register ${name}:`, error);
    }
  };

  registerSafe('Customer IPC', registerCustomerIpc);
  registerSafe('Device IPC', registerDeviceIpc);
  registerSafe('Service IPC', registerServiceIpc);
  registerSafe('Part IPC', registerPartIpc);
  registerSafe('Misc IPC', () => registerMiscIpc(mainWindow!));
  registerSafe('Recycle Bin IPC', registerRecycleBinIpc);


  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Menonaktifkan GPU Cache
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');
app.commandLine.appendSwitch('disable-http-cache');

app.whenReady().then(() => {
  console.log('App is ready');
  // Database Migration
  try {
    console.log('Running migrations...');
    runMigrations();
    console.log('Migrations done');
  } catch (error) {
    console.error('Database migration error:', error);
    log.error('Database migration error:', error);
    dialog.showErrorBox("Database Error", "Gagal memperbarui database. Aplikasi tidak dapat dilanjutkan.");
    app.quit();
    return;
  }
  
  // Create photos directory

  const photosDir = path.join(app.getPath('userData'), 'photos');
  if (!fs.existsSync(photosDir)) {
    fs.mkdirSync(photosDir, { recursive: true });
  }

  console.log('Creating window...');
  createWindow();
  console.log('Window created');

  // Check for updates (Disabled auto-update per user request - manual only)


  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // Schedule auto backup every 2 hours (2 * 60 * 60 * 1000 = 7200000 ms)
  setInterval(() => {
    performAutoBackup('cron');
  }, 7200000);
});



async function performAutoBackup(type: 'cron' | 'daily' = 'daily') {
  try {

    
    const dbPath = path.join(app.getPath('userData'), 'database', 'gumay_tech.db');

    const settings = settingsRepo.getSettings();
    
    let backupDir = settings.auto_backup_path;
    
    // Fallback to default if no auto_backup_path is set
    if (!backupDir) {
      backupDir = path.join(app.getPath('documents'), 'Gumay_Tech_Backups');
    }
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    
    let fileNameSuffix = 'Daily';
    if (type === 'cron') {
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      fileNameSuffix = `${hours}-${minutes}`;
    }
    
    const backupPathDb = path.join(backupDir, `AutoBackup_GumayTech_${dateStr}_${fileNameSuffix}.db`);
    const backupPathZip = path.join(backupDir, `AutoBackup_GumayTech_${dateStr}_${fileNameSuffix}.zip`);
    
    if (fs.existsSync(dbPath)) {
      // Create raw backup
      await db.backup(backupPathDb);
      
      try {

        const zip = new AdmZip();
        
        // Add DB to zip
        zip.addLocalFile(backupPathDb);
        
        // Add photos to zip if exists
        const photosDir = path.join(app.getPath('userData'), 'photos');
        if (fs.existsSync(photosDir)) {
            zip.addLocalFolder(photosDir, 'photos');
        }
        
        // Save zip and delete raw db backup
        zip.writeZip(backupPathZip);
        fs.unlinkSync(backupPathDb);
        log.info(`Auto backup (${type}) saved to:`, backupPathZip);
        
        EventBus.sendToast('success', `Backup otomatis (${type}) berhasil disimpan!`);


      } catch (zipError) {
        log.error('Error zipping backup:', zipError);
        log.info('Fallback: Unzipped DB saved to:', backupPathDb);
        EventBus.sendToast('warning', `Gagal kompresi ZIP, namun backup DB mentah berhasil disimpan.`);
      }
    }
  } catch (error) {
    log.error(`Failed to perform auto backup (${type}):`, error);
    EventBus.sendToast('error', `Gagal melakukan backup otomatis: ${error}`);
  }
}

app.on('window-all-closed', async () => {
  // Auto Backup before quitting
  await performAutoBackup('daily');

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

