# Mi Estante — Control de colección de videojuegos

Aplicación web personal para llevar el inventario de tu colección de
videojuegos y consolas: qué tienes, en qué plataforma, qué pagaste por ello,
en qué estado está, y qué juegos tienes en tu lista de deseos.

Los 519 registros de tu Excel original (`Coleccion_Playstation.xls`) ya están
convertidos e importados: 11 elementos de hardware (consolas) y 487 juegos.

## Estructura del proyecto

```
videojuegos-tracker/
├── server/     API en Node.js + Express + Turso (SQLite en la nube)
│   ├── data/   games.json y hardware.json — datos extraídos de tu Excel
│   └── src/    código de la API
├── client/     Interfaz en React (Vite)
│   └── public/logos/  logos reales de cada marca y consola
├── DEPLOY.md   guía paso a paso para publicarlo gratis (Render + Turso)
└── .env.example  plantilla de variables de entorno del servidor
```

## Qué incluye

- **Menú de dos secciones**: *Videojuegos* (por marca → familia de consola,
  más tu lista de deseos nuevo/2ª mano) y *Consolas* (por marca → familia,
  con ficha de cada modelo).
- **Logos reales** de Sony, Nintendo, PC y de cada consola (PS1 a PS5, PSP,
  PS Vita, Game Boy Pocket/Color).
- **Fichas con foto y notas**, tanto de juegos como de consolas.
- **Estado (Nuevo/Usado)** independiente de la Disponibilidad
  (En propiedad / Deseado nuevo / Deseado 2ª mano).
- **Filtros y buscador**: por texto, por estado, y orden por título o precio
  en Videojuegos; buscador por nombre/modelo en Consolas.
- **Estadísticas**: gasto total, valor de reventa, desglose por consola.
- Base de datos en **Turso** (SQLite en la nube, gratis) — o un archivo
  SQLite local automático si no configuras Turso, para desarrollar sin
  depender de la nube.

## Puesta en marcha (local)

### 1. Backend

```bash
cd server
npm install
npm run seed     # solo la primera vez: importa tus datos
npm start        # arranca la API en http://localhost:3001
```

Sin nada más, esto usa un archivo SQLite local (`coleccion.local.db`). Si
quieres desarrollar ya contra Turso, copia `.env.example` a `.env` y rellena
`TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` (ver `DEPLOY.md`).

### 2. Frontend

En otra terminal:

```bash
cd client
npm install
npm run dev       # arranca la web en http://localhost:5173
```

Abre `http://localhost:5173`. El frontend redirige automáticamente las
llamadas a `/api` hacia el backend (configurado en `vite.config.js`).

## Publicarlo online, gratis

Sigue **`DEPLOY.md`** paso a paso: crea una base de datos gratuita en Turso,
importa tu colección, sube el proyecto a GitHub y conéctalo a un Web Service
gratuito de Render. Al final tendrás una URL propia
(`https://mi-estante.onrender.com` o como la llames) sin pagar nada, y sin
riesgo de perder datos en cada redeploy.

## Modelo de datos

**`games`**: `titulo`, `consola`, `edicion`, `precio_coste`, `precio_venta`,
`estado` (`propiedad` / `deseado_nuevo` / `deseado_segunda_mano`),
`condicion` (`nuevo` / `usado`), `imagen` (base64), `notas`.

**`hardware`**: `consola`, `modelo`, `precio_coste`, `marca`, `condicion`,
`imagen` (base64), `notas`.

Las imágenes se guardan como base64 dentro del propio registro (no como
archivos en disco), precisamente para que sobrevivan a los redeploys en
hostings sin almacenamiento persistente.

## Próximos pasos sugeridos

- Edición/borrado en bloque del campo Estado (Nuevo/Usado) para no tener que
  rellenarlo juego a juego.
- Página de estadísticas más visual (gráficas de gasto por consola/año).
- Dominio propio una vez el proyecto conviva con tus otros trabajos de
  portfolio.
