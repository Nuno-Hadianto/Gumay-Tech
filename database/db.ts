import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { app } from 'electron';

let dbPath;
if (process.env.NODE_ENV === 'test') {
    dbPath = ':memory:';
} else if (app) {
    const userDataPath = app.getPath('userData');
    const dbDir = path.join(userDataPath, 'database');
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }
    dbPath = path.join(dbDir, 'gumay_tech.db');
} else {
    // Fallback for development
    dbPath = path.join(__dirname, 'gumay_tech.db');
}

import * as drizzleSchema from './drizzleSchema';

export interface AppDatabase extends Database.Database {
  drizzle: BetterSQLite3Database<typeof drizzleSchema>;
}

const db = new Database(dbPath) as AppDatabase;
db.pragma('foreign_keys = ON');

const dbDrizzle = drizzle(db, { schema: drizzleSchema });
db.drizzle = dbDrizzle;

export default db as any;
