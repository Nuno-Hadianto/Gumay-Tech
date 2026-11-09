"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const migrate_1 = __importDefault(require("../database/migrate"));
const fs_1 = __importDefault(require("fs"));
const settingsRepo = __importStar(require("../repositories/settingsRepository"));
const adm_zip_1 = __importDefault(require("adm-zip"));
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const db_1 = __importDefault(require("../database/db"));
const electron_log_1 = __importDefault(require("electron-log"));
const EventBus_1 = require("./services/EventBus");
// Setup logging
electron_log_1.default.transports.file.level = 'info';
electron_log_1.default.info('App starting...');
process.on('uncaughtException', (error) => {
    electron_log_1.default.error('Uncaught Exception:', error);
});
process.on('unhandledRejection', (reason, promise) => {
    electron_log_1.default.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
// Import IPC modules
const customerIpc_1 = require("./ipc/customerIpc");
const deviceIpc_1 = require("./ipc/deviceIpc");
const serviceIpc_1 = require("./ipc/serviceIpc");
const partIpc_1 = require("./ipc/partIpc");
const miscIpc_1 = require("./ipc/miscIpc");
const recycleBinIpc_1 = require("./ipc/recycleBinIpc");
let mainWindow = null;
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 900,
        minHeight: 600,
        title: 'Gumay Tech',
        icon: path_1.default.join(__dirname, '..', '..', 'public', 'img', 'icon.png'),
        autoHideMenuBar: true,
        show: false,
        backgroundColor: '#0f172a',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path_1.default.join(__dirname, 'preload.js')
        }
    });
    electron_1.ipcMain.once('app-ready', () => {
        mainWindow?.maximize();
        mainWindow?.show();
    });
    const isDev = !electron_1.app.isPackaged && process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test';
    if (isDev) {
        // Memuat Vite Dev Server
        mainWindow.loadURL('http://localhost:5173');
        // mainWindow.webContents.openDevTools(); // Optional: buka devtools otomatis
    }
    else {
        // Memuat file hasil build Vite
        mainWindow.loadFile(path_1.default.join(__dirname, '..', '..', 'dist_frontend', 'index.html'));
    }
    // Register IPC handlers safely to prevent one failure from halting all others
    const registerSafe = (name, fn) => {
        try {
            fn();
        }
        catch (error) {
            console.error(`Failed to register ${name}:`, error);
            electron_log_1.default.error(`Failed to register ${name}:`, error);
        }
    };
    registerSafe('Customer IPC', customerIpc_1.registerCustomerIpc);
    registerSafe('Device IPC', deviceIpc_1.registerDeviceIpc);
    registerSafe('Service IPC', serviceIpc_1.registerServiceIpc);
    registerSafe('Part IPC', partIpc_1.registerPartIpc);
    registerSafe('Misc IPC', () => (0, miscIpc_1.registerMiscIpc)(mainWindow));
    registerSafe('Recycle Bin IPC', recycleBinIpc_1.registerRecycleBinIpc);
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}
// Menonaktifkan GPU Cache
electron_1.app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');
electron_1.app.commandLine.appendSwitch('disable-http-cache');
electron_1.app.whenReady().then(() => {
    console.log('App is ready');
    // Database Migration
    try {
        console.log('Running migrations...');
        (0, migrate_1.default)();
        console.log('Migrations done');
    }
    catch (error) {
        console.error('Database migration error:', error);
        electron_log_1.default.error('Database migration error:', error);
        electron_1.dialog.showErrorBox("Database Error", "Gagal memperbarui database. Aplikasi tidak dapat dilanjutkan.");
        electron_1.app.quit();
        return;
    }
    // Create photos directory
    const photosDir = path_1.default.join(electron_1.app.getPath('userData'), 'photos');
    if (!fs_1.default.existsSync(photosDir)) {
        fs_1.default.mkdirSync(photosDir, { recursive: true });
    }
    console.log('Creating window...');
    createWindow();
    console.log('Window created');
    // Check for updates (Disabled auto-update per user request - manual only)
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
    // Schedule auto backup every 2 hours (2 * 60 * 60 * 1000 = 7200000 ms)
    setInterval(() => {
        performAutoBackup('cron');
    }, 7200000);
});
async function performAutoBackup(type = 'daily') {
    try {
        const dbPath = path_1.default.join(electron_1.app.getPath('userData'), 'database', 'gumay_tech.db');
        const settings = settingsRepo.getSettings();
        let backupDir = settings.auto_backup_path;
        // Fallback to default if no auto_backup_path is set
        if (!backupDir) {
            backupDir = path_1.default.join(electron_1.app.getPath('documents'), 'Gumay_Tech_Backups');
        }
        if (!fs_1.default.existsSync(backupDir)) {
            fs_1.default.mkdirSync(backupDir, { recursive: true });
        }
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        let fileNameSuffix = 'Daily';
        if (type === 'cron') {
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            fileNameSuffix = `${hours}-${minutes}`;
        }
        const backupPathDb = path_1.default.join(backupDir, `AutoBackup_GumayTech_${dateStr}_${fileNameSuffix}.db`);
        const backupPathZip = path_1.default.join(backupDir, `AutoBackup_GumayTech_${dateStr}_${fileNameSuffix}.zip`);
        if (fs_1.default.existsSync(dbPath)) {
            // Create raw backup
            await db_1.default.backup(backupPathDb);
            try {
                const zip = new adm_zip_1.default();
                // Add DB to zip
                zip.addLocalFile(backupPathDb);
                // Add photos to zip if exists
                const photosDir = path_1.default.join(electron_1.app.getPath('userData'), 'photos');
                if (fs_1.default.existsSync(photosDir)) {
                    zip.addLocalFolder(photosDir, 'photos');
                }
                // Save zip and delete raw db backup
                zip.writeZip(backupPathZip);
                fs_1.default.unlinkSync(backupPathDb);
                electron_log_1.default.info(`Auto backup (${type}) saved to:`, backupPathZip);
                EventBus_1.EventBus.sendToast('success', `Backup otomatis (${type}) berhasil disimpan!`);
            }
            catch (zipError) {
                electron_log_1.default.error('Error zipping backup:', zipError);
                electron_log_1.default.info('Fallback: Unzipped DB saved to:', backupPathDb);
                EventBus_1.EventBus.sendToast('warning', `Gagal kompresi ZIP, namun backup DB mentah berhasil disimpan.`);
            }
        }
    }
    catch (error) {
        electron_log_1.default.error(`Failed to perform auto backup (${type}):`, error);
        EventBus_1.EventBus.sendToast('error', `Gagal melakukan backup otomatis: ${error}`);
    }
}
electron_1.app.on('window-all-closed', async () => {
    // Auto Backup before quitting
    await performAutoBackup('daily');
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
