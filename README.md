# To-Do List Fullstack

Aplicación fullstack para gestión de tareas con autenticación JWT. El repositorio está dividido en dos aplicaciones desacopladas:

- `backend/`: API REST con NestJS, Prisma y MySQL.
- `frontend/`: SPA con React 18, TypeScript, Tailwind CSS, React Router y Axios.

## Arquitectura

La aplicación usa una arquitectura desacoplada: el frontend es una SPA que consume una API REST expuesta por el backend. La comunicación ocurre por HTTP usando JSON, y el token JWT se envía en cada request protegida mediante el header `Authorization: Bearer <token>`.

La base de datos modela una relación `User 1 -> N Tasks`. Cada tarea pertenece a un único usuario mediante la FK `userId` en `tasks`. Esta estructura evita duplicación de datos y mantiene una normalización compatible con 3FN: los datos del usuario viven en `users`, los datos de tareas viven en `tasks`, y la relación se expresa por clave foránea.

La autenticación es stateless con JWT. Al iniciar sesión, el backend firma un token con `{ sub: userId, email }`; el frontend lo guarda en `localStorage` y lo adjunta automáticamente a las peticiones con Axios. Las contraseñas se almacenan como SHA-256 con salt único por usuario, usando el módulo nativo `crypto` de Node.js.

## Decisiones técnicas

**NestJS** se eligió por su arquitectura modular, inyección de dependencias, decorators y separación clara entre controllers, services, modules y guards.

**Prisma** aporta type-safety, migraciones declarativas y una experiencia de desarrollo superior a escribir SQL manual para operaciones CRUD comunes.

**SHA-256 con salt** se usa por requerimiento del proyecto. El salt único por usuario evita que dos usuarios con la misma contraseña tengan el mismo hash y reduce la efectividad de ataques con rainbow tables.

**Context API** es suficiente para manejar sesión en esta app porque el estado global es pequeño: usuario autenticado, token, login y logout. Evita sumar Redux u otra dependencia innecesaria.

## Requisitos

- Node.js 18 o superior
- npm
- MySQL 8 local o Docker

## Configuración

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd toDoListDolivo
```

### 2. Levantar MySQL con Docker Compose

Este paso es opcional si ya tenés MySQL corriendo localmente.

Primero creá el archivo `.env` de la raíz a partir del ejemplo:

```bash
copy .env.example .env
```

El `docker-compose.yml` toma desde ese `.env` las credenciales de MySQL, por eso no quedan hardcodeadas en el archivo versionado.

```bash
docker compose up -d
```

El contenedor crea la base usando estos valores del `.env` raíz:

```env
MYSQL_ROOT_PASSWORD=root_password_de_desarrollo
MYSQL_USER=todouser
MYSQL_PASSWORD=todopassword_de_desarrollo
MYSQL_DATABASE=tododb
```

### 3. Configurar variables de entorno del backend

```bash
cd backend
copy .env.example .env
```

Si usás el `docker-compose.yml` incluido, dejá el `DATABASE_URL` así:

```env
DATABASE_URL="mysql://todouser:todopassword_de_desarrollo@localhost:3306/tododb"
JWT_SECRET="cambiar_este_secreto_en_desarrollo"
JWT_EXPIRES_IN="7d"
```

### 4. Instalar dependencias del backend

```bash
npm install
```

### 5. Ejecutar migraciones de Prisma

```bash
npx prisma migrate dev --name init
```

También podés regenerar el cliente Prisma manualmente:

```bash
npm run prisma:generate
```

### 6. Correr el backend

```bash
npm run start:dev
```

La API queda disponible en:

```text
http://localhost:3000
```

Endpoints principales:

- `POST /auth/register`
- `POST /auth/login`
- `GET /tasks`
- `POST /tasks`
- `GET /tasks/:id`
- `PATCH /tasks/:id`
- `DELETE /tasks/:id`

### 7. Instalar dependencias del frontend

En otra terminal, desde la raíz del repositorio:

```bash
cd frontend
npm install
```

### 8. Correr el frontend

```bash
npm run dev
```

La aplicación queda disponible en:

```text
http://localhost:5173
```

## Flujo de uso

1. Entrar a `http://localhost:5173/register`.
2. Crear una cuenta con email y contraseña.
3. Iniciar sesión en `/login`.
4. Gestionar tareas desde `/tasks`.

## Estructura del repositorio

```text
.
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── auth/
│   │   ├── prisma/
│   │   ├── tasks/
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── tailwind.config.js
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Notas de seguridad

El proyecto implementa SHA-256 con salt porque fue solicitado como requisito. Para una aplicación productiva se recomienda usar algoritmos diseñados para contraseñas como Argon2, bcrypt o scrypt.

El valor de `JWT_SECRET` debe ser largo, privado y distinto por entorno. No subas archivos `.env` reales al repositorio.
