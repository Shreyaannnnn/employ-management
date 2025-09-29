import { db } from './client';
import bcrypt from 'bcryptjs';

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  position TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`);

// Seed default user if none exists
const countRow = db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number };
if (countRow.c === 0) {
  const passwordHash = bcrypt.hashSync(process.env.DEFAULT_ADMIN_PASSWORD || 'admin123', 10);
  db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)')
    .run(process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com', passwordHash);
}

console.log('Migration complete');


