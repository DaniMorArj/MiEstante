import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db, initSchema } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // las carátulas van en base64 dentro del JSON

// Envuelve un handler async para que sus errores lleguen al middleware de error
// de Express en vez de tumbar el proceso (Express 4 no captura rechazos async).
const ah = (fn) => (req, res, next) => fn(req, res, next).catch(next);

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
});

// ---------- Juegos ----------

app.get('/api/games', ah(async (req, res) => {
  const { consola, estado, condicion, q } = req.query;
  let sql = 'SELECT * FROM games WHERE 1=1';
  const args = {};

  if (consola) {
    sql += ' AND consola = :consola';
    args.consola = consola;
  }
  if (estado) {
    sql += ' AND estado = :estado';
    args.estado = estado;
  }
  if (condicion) {
    sql += ' AND condicion = :condicion';
    args.condicion = condicion;
  }
  if (q) {
    sql += ' AND (titulo LIKE :q OR edicion LIKE :q)';
    args.q = `%${q}%`;
  }
  sql += ' ORDER BY consola IS NULL, consola, titulo';

  const { rows } = await db.execute({ sql, args });
  res.json(rows);
}));

function gamePayload(body) {
  const { titulo, consola, edicion, precio_coste, precio_venta, estado, condicion, imagen, notas } = body;
  return {
    titulo: titulo?.trim(),
    consola: consola || null,
    edicion: edicion || null,
    precio_coste: precio_coste === '' || precio_coste === undefined || precio_coste === null ? null : Number(precio_coste),
    precio_venta: precio_venta === '' || precio_venta === undefined || precio_venta === null ? null : Number(precio_venta),
    estado: estado || 'propiedad',
    condicion: condicion || null,
    imagen: imagen || null,
    notas: notas || null,
  };
}

app.post('/api/games', ah(async (req, res) => {
  const p = gamePayload(req.body);
  if (!p.titulo) return res.status(400).json({ error: 'El título es obligatorio' });

  const result = await db.execute({
    sql: `INSERT INTO games (titulo, consola, edicion, precio_coste, precio_venta, estado, condicion, imagen, notas)
          VALUES (:titulo, :consola, :edicion, :precio_coste, :precio_venta, :estado, :condicion, :imagen, :notas)`,
    args: p,
  });
  const { rows } = await db.execute({ sql: 'SELECT * FROM games WHERE id = :id', args: { id: Number(result.lastInsertRowid) } });
  res.status(201).json(rows[0]);
}));

app.put('/api/games/:id', ah(async (req, res) => {
  const id = Number(req.params.id);
  const existing = await db.execute({ sql: 'SELECT * FROM games WHERE id = :id', args: { id } });
  if (!existing.rows[0]) return res.status(404).json({ error: 'Juego no encontrado' });

  const p = gamePayload(req.body);
  if (!p.titulo) return res.status(400).json({ error: 'El título es obligatorio' });

  await db.execute({
    sql: `UPDATE games SET titulo=:titulo, consola=:consola, edicion=:edicion, precio_coste=:precio_coste,
          precio_venta=:precio_venta, estado=:estado, condicion=:condicion, imagen=:imagen, notas=:notas
          WHERE id=:id`,
    args: { ...p, id },
  });
  const { rows } = await db.execute({ sql: 'SELECT * FROM games WHERE id = :id', args: { id } });
  res.json(rows[0]);
}));

app.delete('/api/games/:id', ah(async (req, res) => {
  const id = Number(req.params.id);
  const result = await db.execute({ sql: 'DELETE FROM games WHERE id = :id', args: { id } });
  if (!result.rowsAffected) return res.status(404).json({ error: 'Juego no encontrado' });
  res.status(204).end();
}));

// ---------- Hardware (consolas) ----------

app.get('/api/hardware', ah(async (req, res) => {
  const { marca } = req.query;
  let sql = 'SELECT * FROM hardware WHERE 1=1';
  const args = {};
  if (marca) {
    sql += ' AND marca = :marca';
    args.marca = marca;
  }
  sql += ' ORDER BY id';
  const { rows } = await db.execute({ sql, args });
  res.json(rows);
}));

function hardwarePayload(body) {
  const { consola, modelo, precio_coste, marca, condicion, imagen, notas } = body;
  return {
    consola: consola?.trim(),
    modelo: modelo || null,
    precio_coste: precio_coste === '' || precio_coste === undefined || precio_coste === null ? null : Number(precio_coste),
    marca: marca || 'Otros',
    condicion: condicion || null,
    imagen: imagen || null,
    notas: notas || null,
  };
}

app.post('/api/hardware', ah(async (req, res) => {
  const p = hardwarePayload(req.body);
  if (!p.consola) return res.status(400).json({ error: 'El nombre de la consola es obligatorio' });

  const result = await db.execute({
    sql: `INSERT INTO hardware (consola, modelo, precio_coste, marca, condicion, imagen, notas)
          VALUES (:consola, :modelo, :precio_coste, :marca, :condicion, :imagen, :notas)`,
    args: p,
  });
  const { rows } = await db.execute({ sql: 'SELECT * FROM hardware WHERE id = :id', args: { id: Number(result.lastInsertRowid) } });
  res.status(201).json(rows[0]);
}));

app.put('/api/hardware/:id', ah(async (req, res) => {
  const id = Number(req.params.id);
  const existing = await db.execute({ sql: 'SELECT * FROM hardware WHERE id = :id', args: { id } });
  if (!existing.rows[0]) return res.status(404).json({ error: 'Consola no encontrada' });

  const p = hardwarePayload(req.body);
  await db.execute({
    sql: `UPDATE hardware SET consola=:consola, modelo=:modelo, precio_coste=:precio_coste,
          marca=:marca, condicion=:condicion, imagen=:imagen, notas=:notas
          WHERE id=:id`,
    args: { ...p, consola: p.consola || existing.rows[0].consola, marca: existing.rows[0].marca, id },
  });
  const { rows } = await db.execute({ sql: 'SELECT * FROM hardware WHERE id = :id', args: { id } });
  res.json(rows[0]);
}));

app.delete('/api/hardware/:id', ah(async (req, res) => {
  const id = Number(req.params.id);
  const result = await db.execute({ sql: 'DELETE FROM hardware WHERE id = :id', args: { id } });
  if (!result.rowsAffected) return res.status(404).json({ error: 'Consola no encontrada' });
  res.status(204).end();
}));

// ---------- Listas auxiliares ----------

app.get('/api/consolas', ah(async (req, res) => {
  const { rows } = await db.execute({
    sql: `SELECT DISTINCT consola FROM games WHERE consola IS NOT NULL
          UNION
          SELECT DISTINCT consola FROM hardware WHERE consola IS NOT NULL
          ORDER BY consola`,
  });
  res.json(rows.map((r) => r.consola));
}));

app.get('/api/marcas', ah(async (req, res) => {
  const { rows } = await db.execute({ sql: 'SELECT DISTINCT marca FROM hardware ORDER BY marca' });
  res.json(rows.map((r) => r.marca));
}));

// ---------- Estadísticas ----------

app.get('/api/stats', ah(async (req, res) => {
  const totalJuegos = (await db.execute({ sql: "SELECT COUNT(*) AS c FROM games WHERE estado = 'propiedad'" })).rows[0].c;
  const totalDeseados = (await db.execute({ sql: "SELECT COUNT(*) AS c FROM games WHERE estado != 'propiedad'" })).rows[0].c;
  const gastoJuegos = (await db.execute({ sql: "SELECT COALESCE(SUM(precio_coste),0) AS s FROM games WHERE estado='propiedad'" })).rows[0].s;
  const gastoHardware = (await db.execute({ sql: 'SELECT COALESCE(SUM(precio_coste),0) AS s FROM hardware' })).rows[0].s;
  const valorVenta = (await db.execute({ sql: "SELECT COALESCE(SUM(precio_venta),0) AS s FROM games WHERE estado='propiedad'" })).rows[0].s;

  const porConsola = (
    await db.execute({
      sql: `SELECT consola, COUNT(*) AS total, COALESCE(SUM(precio_coste),0) AS gasto
            FROM games WHERE estado = 'propiedad' AND consola IS NOT NULL
            GROUP BY consola ORDER BY total DESC`,
    })
  ).rows;

  res.json({
    totalJuegos: Number(totalJuegos),
    totalDeseados: Number(totalDeseados),
    gastoJuegos: Number(gastoJuegos),
    gastoHardware: Number(gastoHardware),
    gastoTotal: Number(gastoJuegos) + Number(gastoHardware),
    valorVenta: Number(valorVenta),
    porConsola: porConsola.map((r) => ({ ...r, total: Number(r.total), gasto: Number(r.gasto) })),
  });
}));

// ---------- Frontend construido (producción, un único servicio en Render) ----------

const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^(?!\/api\/).*/, (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

initSchema()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API escuchando en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('No se pudo preparar la base de datos:', err);
    process.exit(1);
  });

// Middleware de errores (debe ir después de todas las rutas)
app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: err.message || 'Error interno del servidor' });
});
