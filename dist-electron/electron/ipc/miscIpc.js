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
exports.registerMiscIpc = registerMiscIpc;
const db_1 = __importDefault(require("../../database/db"));
const electron_1 = require("electron");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const url_1 = __importDefault(require("url"));
const dashboardController = __importStar(require("../../controllers/dashboardController"));
const paymentController = __importStar(require("../../controllers/paymentController"));
const settingsController = __importStar(require("../../controllers/settingsController"));
const reportController = __importStar(require("../../controllers/reportController"));
const electron_log_1 = __importDefault(require("electron-log"));
function registerMiscIpc(mainWindow) {
    // Dashboard
    electron_1.ipcMain.handle('get-dashboard-stats', () => dashboardController.getDashboardStats());
    electron_1.ipcMain.handle('get-alerts', () => dashboardController.getAlerts());
    // Native Notifications
    electron_1.ipcMain.handle('show-notification', (_event, { title, body }) => {
        new electron_1.Notification({ title, body }).show();
        return true;
    });
    // Payments
    electron_1.ipcMain.handle('get-payments', (_event, serviceId) => paymentController.getPaymentsByServiceId(serviceId));
    electron_1.ipcMain.handle('add-payment', (_event, data) => paymentController.addPayment(data));
    electron_1.ipcMain.handle('delete-payment', (_event, id) => paymentController.deletePayment(id));
    // Settings
    electron_1.ipcMain.handle('get-settings', () => settingsController.getSettings());
    electron_1.ipcMain.handle('update-settings', (_event, data) => settingsController.updateSettings(data));
    // Reports
    electron_1.ipcMain.handle('get-income-report', (_event, start, end) => reportController.getIncomeReport(start, end));
    electron_1.ipcMain.handle('get-completed-services', (_event, start, end) => reportController.getCompletedServices(start, end));
    electron_1.ipcMain.handle('get-top-spareparts', (_event, start, end) => reportController.getTopSpareparts(start, end));
    electron_1.ipcMain.handle('get-report-breakdown', (_event, start, end) => reportController.getReportBreakdown(start, end));
    // Backup & Restore
    electron_1.ipcMain.handle('get-db-size', async () => {
        try {
            const dbPath = path_1.default.join(electron_1.app.getPath('userData'), 'database', 'nunox_servis.db');
            if (fs_1.default.existsSync(dbPath)) {
                const stats = fs_1.default.statSync(dbPath);
                return stats.size;
            }
            return 0;
        }
        catch (error) {
            electron_log_1.default.error('Error getting DB size:', error);
            return 0;
        }
    });
    electron_1.ipcMain.handle('backup-database', async () => {
        // const dbPath = path.join(app.getPath('userData'), 'database', 'nunox_servis.db');
        const defaultPath = `nuNox_servis_Backup_${new Date().toISOString().split('T')[0]}.db`;
        const { filePath } = await electron_1.dialog.showSaveDialog({
            title: 'Backup Database',
            defaultPath: defaultPath,
            filters: [{ name: 'Database', extensions: ['db'] }]
        });
        if (filePath) {
            await db_1.default.backup(filePath);
            return true;
        }
        return false;
    });
    electron_1.ipcMain.handle('select-directory', async () => {
        const { filePaths } = await electron_1.dialog.showOpenDialog({
            title: 'Pilih Folder',
            properties: ['openDirectory']
        });
        if (filePaths && filePaths.length > 0) {
            return filePaths[0];
        }
        return null;
    });
    electron_1.ipcMain.handle('restore-database', async () => {
        const { filePaths } = await electron_1.dialog.showOpenDialog({
            title: 'Restore Database',
            properties: ['openFile'],
            filters: [{ name: 'Database', extensions: ['db'] }]
        });
        if (filePaths && filePaths.length > 0) {
            const dbPath = path_1.default.join(electron_1.app.getPath('userData'), 'database', 'nunox_servis.db');
            db_1.default.close();
            fs_1.default.copyFileSync(filePaths[0], dbPath);
            setTimeout(() => {
                electron_1.app.relaunch();
                electron_1.app.exit(0);
            }, 2500);
            return true;
        }
        return false;
    });
    // Export & Print
    electron_1.ipcMain.handle('export-pdf', async (_event, { html, filename }) => {
        try {
            const { canceled, filePath } = await electron_1.dialog.showSaveDialog({
                title: 'Simpan PDF',
                defaultPath: filename || 'Invoice.pdf',
                filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
            });
            if (canceled || !filePath)
                return { success: false, canceled: true };
            const pdfWindow = new electron_1.BrowserWindow({ show: false, webPreferences: { nodeIntegration: false } });
            const tmpHtmlPath = path_1.default.join(os_1.default.tmpdir(), `print_${Date.now()}.html`);
            fs_1.default.writeFileSync(tmpHtmlPath, html, 'utf-8');
            await pdfWindow.loadURL(url_1.default.pathToFileURL(tmpHtmlPath).href);
            await new Promise(resolve => setTimeout(resolve, 500));
            const pdfData = await pdfWindow.webContents.printToPDF({ printBackground: true, pageSize: 'A4' });
            fs_1.default.writeFileSync(filePath, pdfData);
            pdfWindow.close();
            try {
                fs_1.default.unlinkSync(tmpHtmlPath);
            }
            catch {
                // ignore
            }
            return { success: true, filePath };
        }
        catch (error) {
            electron_log_1.default.error('Error generating PDF:', error);
            return { success: false, error: error.message };
        }
    });
    electron_1.ipcMain.handle('print-preview', async (_event, options = {}) => {
        try {
            const pdfPath = path_1.default.join(os_1.default.tmpdir(), `nunox_print_${Date.now()}.pdf`);
            const pdfOptions = {
                printBackground: true,
                landscape: options.landscape || false,
                preferCSSPageSize: true,
                marginsType: 1
            };
            if (options.pageSize) {
                pdfOptions.pageSize = options.pageSize;
            }
            const pdfData = await mainWindow.webContents.printToPDF(pdfOptions);
            fs_1.default.writeFileSync(pdfPath, pdfData);
            await electron_1.shell.openPath(pdfPath);
            return true;
        }
        catch (error) {
            electron_log_1.default.error('Error generating print preview:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle('open-external-url', async (_event, url) => {
        try {
            await electron_1.shell.openExternal(url);
            return true;
        }
        catch (error) {
            electron_log_1.default.error('Failed to open external url:', error);
            return false;
        }
    });
    electron_1.ipcMain.handle('get-logo-base64', async () => {
        try {
            let logoPath = path_1.default.join(__dirname, '..', '..', '..', 'public', 'img', 'logo.png');
            if (!fs_1.default.existsSync(logoPath) && electron_1.app) {
                logoPath = path_1.default.join(electron_1.app.getAppPath(), 'public', 'img', 'logo.png');
            }
            if (fs_1.default.existsSync(logoPath)) {
                const ext = path_1.default.extname(logoPath).toLowerCase();
                const mimeType = ext === '.png' ? 'image/png' : (ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/png');
                const bitmap = fs_1.default.readFileSync(logoPath);
                return `data:${mimeType};base64,${bitmap.toString('base64')}`;
            }
            return null;
        }
        catch (error) {
            electron_log_1.default.error('Failed to read logo:', error);
            return null;
        }
    });
}
