# Desplegar Mi Estante gratis (Render + Turso)

Esta guía te deja la app publicada en una URL tipo `https://mi-estante.onrender.com`,
con los datos guardados en Turso (así sobreviven a los redeploys, a diferencia
del disco de Render).

## 1. Crear la base de datos en Turso

1. Ve a [turso.tech](https://turso.tech) y crea una cuenta gratis.
2. Instala la CLI de Turso:
   - **Mac/Linux**: `curl -sSfL https://get.tur.so/install.sh | bash`
   - **Windows**: usa WSL y el comando de arriba, o gestiona la base de datos
     directamente desde el [dashboard web de Turso](https://app.turso.tech)
     sin instalar nada (el dashboard también te deja generar el token).
3. Inicia sesión y crea la base de datos:
   ```bash
   turso auth login
   turso db create mi-estante
   ```
4. Consigue la URL y el token (los necesitarás en los siguientes pasos):
   ```bash
   turso db show mi-estante --url
   turso db tokens create mi-estante
   ```

## 2. Importar tu colección a Turso

En tu máquina, dentro de `server/`:

```bash
cp .env.example .env
```

Abre `.env` y pega la URL y el token que has obtenido:

```
TURSO_DATABASE_URL=libsql://mi-estante-tuusuario.turso.io
TURSO_AUTH_TOKEN=ey...
```

Luego instala dependencias y ejecuta el seed una sola vez — esto escribe tus
487 juegos y 11 consolas directamente en la base de datos de Turso:

```bash
npm install
npm run seed
```

Puedes comprobar que ha funcionado arrancando el servidor en local
(`npm start`, en `http://localhost:3001/api/stats`) y viendo que los
totales coinciden con tu colección.

## 3. Subir el proyecto a GitHub

Si el proyecto no está aún en un repositorio:

```bash
cd videojuegos-tracker
git init
git add .
git commit -m "Primera versión de Mi Estante"
```

Crea un repositorio nuevo (privado si prefieres) en
[github.com/new](https://github.com/new), y luego:

```bash
git remote add origin https://github.com/TU-USUARIO/mi-estante.git
git branch -M main
git push -u origin main
```

## 4. Crear el servicio en Render

1. Ve a [render.com](https://render.com) y crea una cuenta gratis (no pide tarjeta para el plan Free).
2. **New +** → **Web Service** → conecta tu repositorio de GitHub.
3. Configúralo así:
   - **Name**: `mi-estante` (o lo que prefieras — define tu URL final)
   - **Region**: la más cercana (Frankfurt para España)
   - **Branch**: `main`
   - **Root Directory**: déjalo vacío
   - **Build Command**:
     ```
     cd client && npm install && npm run build && cd ../server && npm install
     ```
   - **Start Command**:
     ```
     node server/src/index.js
     ```
   - **Instance Type**: **Free**
4. En **Environment Variables**, añade las mismas dos que usaste en el paso 2:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
5. **Create Web Service**. El primer build tarda unos minutos (instala
   dependencias y compila el frontend). Cuando termine, tu app estará en
   `https://mi-estante.onrender.com` (o el nombre que hayas elegido).

## Cosas a tener en cuenta

- **Cold start**: en el plan gratuito, si nadie visita la app durante un
  rato, el servicio se duerme y la primera visita tarda ~30-60 segundos en
  responder mientras arranca. Las siguientes van normales.
- **No hace falta volver a hacer seed**: el script solo importa datos si la
  base de datos está vacía, así que los redeploys no duplican ni borran nada.
- **Backups**: aunque Turso es mucho más fiable que un disco efímero, no
  está de más exportar tu colección de vez en cuando (puedes hacerlo con
  `turso db shell mi-estante ".dump" > backup.sql`).
- **Dominio propio**: si más adelante compras un dominio, Render te deja
  conectarlo gratis desde la pestaña *Settings* del servicio.
