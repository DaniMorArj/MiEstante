import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db, initSchema } from './db.js';
import { brandOf } from './brands.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function run() {
  await initSchema();

  const gameCount = (await db.execute({ sql: 'SELECT COUNT(*) AS c FROM games' })).rows[0].c;
  const hwCount = (await db.execute({ sql: 'SELECT COUNT(*) AS c FROM hardware' })).rows[0].c;

  if (Number(gameCount) > 0 || Number(hwCount) > 0) {
    console.log('La base de datos ya contiene datos, no se vuelve a importar.');
    return;
  }

  const hardware = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'hardware.json'), 'utf-8'));
  const games = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'games.json'), 'utf-8'));

  for (const hw of hardware) {
    await db.execute({
      sql: 'INSERT INTO hardware (consola, modelo, precio_coste, marca) VALUES (:consola, :modelo, :precio_coste, :marca)',
      args: { consola: hw.consola, modelo: hw.modelo ?? null, precio_coste: hw.precio_coste ?? null, marca: brandOf(hw.consola) },
    });
  }

  for (const g of games) {
    await db.execute({
      sql: `INSERT INTO games (titulo, consola, edicion, precio_coste, precio_venta, estado)
            VALUES (:titulo, :consola, :edicion, :precio_coste, :precio_venta, :estado)`,
      args: {
        titulo: g.titulo,
        consola: g.consola ?? null,
        edicion: g.edicion ?? null,
        precio_coste: g.precio_coste ?? null,
        precio_venta: g.precio_venta ?? null,
        estado: g.estado || 'propiedad',
      },
    });
  }

  console.log(`Importados ${hardware.length} elementos de hardware y ${games.length} juegos.`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
