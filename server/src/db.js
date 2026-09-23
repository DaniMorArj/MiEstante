import { createClient } from '@libsql/client';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const usingTurso = Boolean(process.env.TURSO_DATABASE_URL);

// En local, si no hay credenciales de Turso configuradas, seguimos usando un
// archivo SQLite normal para poder desarrollar sin depender de la nube.
// better-sqlite3 solo se importa en ese caso (import dinámico) para que
// nunca haga falta compilarlo cuando ya estás usando Turso (como en Render).
export const db = usingTurso
  ? createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
  : await wrapLocalSqlite();

async function wrapLocalSqlite() {
  const { default: Database } = await import('better-sqlite3');
  const local = new Database(path.join(__dirname, '..', 'coleccion.local.db'));
  local.pragma('journal_mode = WAL');
  // Adaptador mínimo para que el resto del código pueda usar siempre
  // `db.execute({ sql, args })` como si fuera el cliente de Turso.
  return {
    execute: async ({ sql, args = [] }) => {
      const stmt = local.prepare(sql);
      const isSelect = /^\s*(select|pragma)/i.test(sql);
      const bound = Array.isArray(args) ? args : [args];
      if (isSelect) {
        return { rows: stmt.all(...bound) };
      }
      const info = stmt.run(...bound);
      return { rows: [], lastInsertRowid: info.lastInsertRowid, rowsAffected: info.changes };
    },
  };
}

export async function initSchema() {
  await db.execute({
    sql: `
      CREATE TABLE IF NOT EXISTS hardware (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        consola TEXT NOT NULL,
        modelo TEXT,
        precio_coste REAL,
        marca TEXT NOT NULL DEFAULT 'Otros',
        condicion TEXT,
        imagen TEXT,
        notas TEXT
      )
    `,
  });

  await db.execute({
    sql: `
      CREATE TABLE IF NOT EXISTS games (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        consola TEXT,
        edicion TEXT,
        precio_coste REAL,
        precio_venta REAL,
        estado TEXT NOT NULL DEFAULT 'propiedad',
        condicion TEXT,
        imagen TEXT,
        notas TEXT
      )
    `,
  });

  // Migración ligera para bases de datos creadas antes de estas columnas.
  const gameCols = (await db.execute({ sql: 'PRAGMA table_info(games)' })).rows.map((c) => c.name);
  const hwCols = (await db.execute({ sql: 'PRAGMA table_info(hardware)' })).rows.map((c) => c.name);

  const addColumnIfMissing = async (table, cols, col, def = 'TEXT') => {
    if (!cols.includes(col)) await db.execute({ sql: `ALTER TABLE ${table} ADD COLUMN ${col} ${def}` });
  };

  await addColumnIfMissing('games', gameCols, 'condicion');
  await addColumnIfMissing('games', gameCols, 'imagen');
  await addColumnIfMissing('games', gameCols, 'notas');

  await addColumnIfMissing('hardware', hwCols, 'marca', "TEXT NOT NULL DEFAULT 'Otros'");
  await addColumnIfMissing('hardware', hwCols, 'condicion');
  await addColumnIfMissing('hardware', hwCols, 'imagen');
  await addColumnIfMissing('hardware', hwCols, 'notas');
}
