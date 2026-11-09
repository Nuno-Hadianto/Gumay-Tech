"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("./db"));
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const electron_log_1 = __importDefault(require("electron-log"));
const migrator_1 = require("drizzle-orm/better-sqlite3/migrator");
function seedDefaultSettings() {
    try {
        const settingsCount = db_1.default.prepare('SELECT COUNT(*) as count FROM settings').get();
        if (settingsCount.count === 0) {
            electron_log_1.default.info('Seeding default settings...');
            const insertDefaultSettings = `
        INSERT OR IGNORE INTO settings (key, value) VALUES 
        ('business_name', 'GUMAY TECH'),
        ('app_name', 'Gumay Tech'),
        ('business_type', 'Laptop & Computer Service'),
        ('owner_name', ''),
        ('phone', ''),
        ('whatsapp', ''),
        ('address', ''),
        ('email', ''),
        ('receipt_footer', 'Terima kasih telah menggunakan jasa Gumay Tech.'),
        ('wa_template_status', 'Halo Kak {nama}, perangkat Anda dengan No Tiket *{tiket}* saat ini berstatus: *{status}*. Mohon konfirmasinya. Terima kasih.');
      `;
            db_1.default.exec(insertDefaultSettings);
        }
    }
    catch (err) {
        electron_log_1.default.error('Error seeding default settings:', err);
    }
}
function runMigrations() {
    try {
        let migrationsFolder;
        if (electron_1.app && electron_1.app.isPackaged) {
            migrationsFolder = path_1.default.join(process.resourcesPath, 'app.asar', 'database', 'migrations');
        }
        else {
            if (__dirname.includes('dist-electron')) {
                migrationsFolder = path_1.default.join(__dirname, '..', '..', 'database', 'migrations');
            }
            else {
                migrationsFolder = path_1.default.join(__dirname, 'migrations');
            }
        }
        electron_log_1.default.info(`Running migrations from ${migrationsFolder}...`);
        db_1.default.pragma('foreign_keys = OFF');
        (0, migrator_1.migrate)(db_1.default.drizzle, { migrationsFolder });
        db_1.default.pragma('foreign_keys = ON');
        electron_log_1.default.info('Database migration completed successfully.');
        seedDefaultSettings();
    }
    catch (error) {
        electron_log_1.default.error('Database migration failed:', error);
        throw error;
    }
}
exports.default = runMigrations;
