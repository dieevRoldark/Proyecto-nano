# [Tu Nombre] — Portfolio

## Sobre mí

Breve descripción profesional, quién eres y a qué te dedicas.

## NanoArte

Emprendimiento de arte y reciclaje.

## Tecnologías / Herramientas

Stack técnico o herramientas que utilizas.

## Proyectos destacados

- Proyecto 1
- Proyecto 2
- Proyecto 3

## Experiencia

Trayectoria profesional o de emprendimientos.

## Educación / Formación

Estudios, cursos y certificaciones.

## Contacto

- Email
- LinkedIn
- GitHub
- Sitio web

## Licencia

---

## Setup del Backend (Node.js + XAMPP MySQL)

### 1. Iniciar XAMPP y MySQL

1. Abrir el **Panel de control de XAMPP**.
2. Click en **Start** junto a **MySQL** (debe quedar con fondo verde).
3. Verificar en el log: `Starting MySQL... SUCCESS` y el puerto `3306`.

> ⚠️ **Si MySQL no está corriendo, el backend no puede arrancar.** Verifica con: `& "C:\xampp\mysql\bin\mysql.exe" -u root -e "SHOW DATABASES;"` — debe listar bases de datos sin error.

### 2. Configurar el backend

`backend/.env` viene con los valores por defecto de XAMPP:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=portfolio_contact
```

Si tu XAMPP tiene contraseña en `root`, edita `DB_PASSWORD`. Si MySQL corre en otro puerto, ajusta `DB_PORT`.

### 3. Instalar dependencias y arrancar

```bash
cd backend
pnpm install
pnpm start
```

**El servidor crea automáticamente la base de datos y la tabla al arrancar** (gracias a `ensureDatabase()` en `src/config/db.js`). No necesitas correr `schema.sql` manualmente.

Salida esperada:

```
[INFO] Database ensured {"name":"portfolio_contact"}
[INFO] Schema ensured {"table":"contacts"}
[INFO] MySQL connection OK {"host":"localhost","database":"portfolio_contact"}
[INFO] Server listening on port 3000
```

> Si la BD y la tabla ya existen, las líneas de "ensured" también aparecen pero no hacen nada (son idempotentes). Es seguro correr el servidor múltiples veces.

### 4. Abrir el portafolio en el navegador

**El backend ahora también sirve el portafolio.** Abre en el navegador:

```
http://localhost:3000/
```

Verás el portafolio cargado. Scroll hasta la sección "Contacto" o "Hablemos", llena el formulario y haz click en "Enviar mensaje". Si todo va bien, verás un toast verde confirmando el envío.

> **No necesitas Live Server ni ningún otro servidor estático.** El backend sirve `index.html`, `script.js`, `style.css`, las imágenes y todo lo demás desde el mismo puerto 3000.

### 5. Endpoints disponibles

| URL | Método | Descripción |
|---|---|---|
| `http://localhost:3000/` | GET | El portafolio (HTML) |
| `http://localhost:3000/api/health` | GET | Health check del servidor |
| `http://localhost:3000/api/info` | GET | Info de la API + configuración de seguridad |
| `http://localhost:3000/api/contact` | POST | Enviar mensaje (rate-limited) |

### 6. Verificar el mensaje guardado

Abre `http://localhost/phpmyadmin` → BD `portfolio_contact` → tabla `contacts` → pestaña "Examinar". Tu mensaje debe estar ahí con un ID autogenerado.

### Solución de problemas

| Error | Causa | Solución |
|---|---|---|
| `ECONNREFUSED 127.0.0.1:3306` | MySQL de XAMPP no está corriendo | Iniciar MySQL desde el panel de XAMPP |
| `Access denied for user 'root'@'localhost'` | XAMPP tiene contraseña en root | Setear `DB_PASSWORD` en `backend/.env` |
| `EADDRINUSE :::3000` | Puerto 3000 ocupado (VS Code, etc.) | Cambiar `PORT` en `backend/.env` |
| CORS error en el navegador | El frontend debe cargarse desde el mismo origen que el backend | Abre `http://localhost:3000/` (no `file://` ni otro puerto) |
| `Cannot find module 'mysql2/promise'` | No se ejecutó `pnpm install` | Ejecutar `pnpm install` dentro de `backend/` |
| `pnpm: no se reconoce como cmdlet` | pnpm no está instalado | `npm install -g pnpm` |
| El toast dice "Sin conexión con el servidor" | El backend no está corriendo | Verifica la ventana de PowerShell donde corriste `pnpm start` |
