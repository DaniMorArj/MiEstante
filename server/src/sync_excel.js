import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ARCHIVO = process.argv[2] || path.join(__dirname, '..', 'data', 'games_actualizacion.json');

function norm(s) {
  return (s || '').toString().trim().toLowerCase();
}

async function run() {
  const nuevos = JSON.parse(fs.readFileSync(ARCHIVO, 'utf-8'));

  const { rows: actuales } = await db.execute({
    sql: 'SELECT id, titulo, consola, edicion, precio_coste, precio_venta, estado FROM games',
  });

  // Cola de candidatos por título normalizado (puede haber varias entradas con el mismo título)
  const porTitulo = new Map();
  for (const g of actuales) {
    const k = norm(g.titulo);
    if (!porTitulo.has(k)) porTitulo.set(k, []);
    porTitulo.get(k).push(g);
  }

  let insertados = 0;
  let actualizados = 0;
  let sinCambios = 0;
  const usados = new Set();

  for (const nuevo of nuevos) {
    const k = norm(nuevo.titulo);
    const candidatos = porTitulo.get(k) || [];

    // Prioriza un candidato con la misma consola; si no, coge cualquiera que quede sin usar.
    let idx = candidatos.findIndex((c) => !usados.has(c.id) && norm(c.consola) === norm(nuevo.consola));
    if (idx === -1) idx = candidatos.findIndex((c) => !usados.has(c.id));

    if (idx === -1) {
      // No hay ningún candidato libre con ese título -> es un juego nuevo de verdad.
      await db.execute({
        sql: `INSERT INTO games (titulo, consola, edicion, precio_coste, precio_venta, estado)
              VALUES (:titulo, :consola, :edicion, :precio_coste, :precio_venta, :estado)`,
        args: {
          titulo: nuevo.titulo,
          consola: nuevo.consola ?? null,
          edicion: nuevo.edicion ?? null,
          precio_coste: nuevo.precio_coste ?? null,
          precio_venta: nuevo.precio_venta ?? null,
          estado: nuevo.estado || 'propiedad',
        },
      });
      insertados++;
      continue;
    }

    const actual = candidatos[idx];
    usados.add(actual.id);

    const cambios = {};
    if (norm(actual.consola) !== norm(nuevo.consola)) cambios.consola = nuevo.consola ?? null;
    if (norm(actual.edicion) !== norm(nuevo.edicion)) cambios.edicion = nuevo.edicion ?? null;
    if ((actual.precio_coste ?? null) !== (nuevo.precio_coste ?? null)) cambios.precio_coste = nuevo.precio_coste ?? null;
    if ((actual.precio_venta ?? null) !== (nuevo.precio_venta ?? null)) cambios.precio_venta = nuevo.precio_venta ?? null;
    if (norm(actual.estado) !== norm(nuevo.estado)) cambios.estado = nuevo.estado || 'propiedad';

    if (Object.keys(cambios).length === 0) {
      sinCambios++;
      continue;
    }

    await db.execute({
      sql: `UPDATE games SET
              consola = :consola,
              edicion = :edicion,
              precio_coste = :precio_coste,
              precio_venta = :precio_venta,
              estado = :estado
            WHERE id = :id`,
      args: {
        id: actual.id,
        consola: cambios.consola !== undefined ? cambios.consola : actual.consola,
        edicion: cambios.edicion !== undefined ? cambios.edicion : actual.edicion,
        precio_coste: cambios.precio_coste !== undefined ? cambios.precio_coste : actual.precio_coste,
        precio_venta: cambios.precio_venta !== undefined ? cambios.precio_venta : actual.precio_venta,
        estado: cambios.estado !== undefined ? cambios.estado : actual.estado,
      },
    });
    actualizados++;
    console.log(`  actualizado: "${actual.titulo}" ->`, cambios);
  }

  // Lo que queda sin usar en cada cola son juegos que ya no aparecen en el Excel nuevo.
  const noEncontrados = [];
  for (const [, candidatos] of porTitulo) {
    for (const c of candidatos) {
      if (!usados.has(c.id)) noEncontrados.push(c);
    }
  }

  console.log('\n=== Resumen ===');
  console.log('Insertados (juegos nuevos):', insertados);
  console.log('Actualizados (cambio de precio/edición/consola/estado):', actualizados);
  console.log('Sin cambios:', sinCambios);
  console.log('En la base de datos pero YA NO en el Excel (revisa si los vendiste/quitaste):', noEncontrados.length);
  for (const g of noEncontrados) {
    console.log(`  - [id ${g.id}] "${g.titulo}" (${g.consola || 'sin consola'})`);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
