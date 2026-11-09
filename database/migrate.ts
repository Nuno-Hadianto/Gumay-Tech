export {};
import db from './db';
import {  app  } from 'electron';
import path from 'path';
import log from 'electron-log';
import {  migrate  } from 'drizzle-orm/better-sqlite3/migrator';

function seedDefaultSettings() {
  try {
    const settingsCount = db.prepare('SELECT COUNT(*) as count FROM settings').get();
    if (settingsCount.count === 0) {
      log.info('Seeding default settings...');
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
      db.exec(insertDefaultSettings);
    }
  } catch (err) {
    log.error('Error seeding default settings:', err);
  }
}

function runMigrations() {
  try {
    let migrationsFolder;
    if (app && app.isPackaged) {
      migrationsFolder = path.join(process.resourcesPath, 'app.asar', 'database', 'migrations');
    } else {
      if (__dirname.includes('dist-electron')) {
        migrationsFolder = path.join(__dirname, '..', '..', 'database', 'migrations');
      } else {
        migrationsFolder = path.join(__dirname, 'migrations');
      }
    }

    log.info(`Running migrations from ${migrationsFolder}...`);
    db.pragma('foreign_keys = OFF');
    migrate(db.drizzle, { migrationsFolder });
    db.pragma('foreign_keys = ON');
    log.info('Database migration completed successfully.');
    
    seedDefaultSettings();
  } catch (error) {
    log.error('Database migration failed:', error);
    throw error;
  }
}

export default runMigrations;

