// db.js
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db;

export async function initDB() {
    db = await open({
       filename: './data/todos.db',
        driver: sqlite3.Database
    });

    await db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL
    );
  `);
}

export function getDB() {
    return db;
}


