import { PrismaClient, TaskStatus } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

function hashPassword(salt: string, password: string): string {
  return crypto.createHash('sha256').update(salt + password).digest('hex');
}

async function main() {
  console.log('Ejecutando seed...');

  // Evita duplicar datos si el seed se corre más de una vez
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();

  const salt = crypto.randomBytes(16).toString('hex');
  const password = hashPassword(salt, 'password123');

  const user = await prisma.user.create({
    data: {
      email: 'demo@example.com',
      password,
      salt,
    },
  });

  console.log(`Usuario creado → id: ${user.id}  email: ${user.email}`);

  const now = new Date();

  const tasks = await prisma.task.createMany({
    data: [
      {
        title: 'Configurar entorno de desarrollo',
        description: 'Instalar Node.js, Docker y las dependencias del proyecto.',
        dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
        status: TaskStatus.COMPLETED,
        userId: user.id,
      },
      {
        title: 'Ejecutar migraciones de Prisma',
        description: 'Correr npx prisma migrate dev para crear las tablas en la base de datos.',
        dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2),
        status: TaskStatus.COMPLETED,
        userId: user.id,
      },
      {
        title: 'Revisar endpoints de la API',
        description: 'Probar los endpoints de autenticación y tareas con una herramienta como Insomnia.',
        dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3),
        status: TaskStatus.PENDING,
        userId: user.id,
      },
      {
        title: 'Conectar el frontend con el backend',
        description: 'Verificar que el cliente Axios apunta a http://localhost:3000 y que el JWT se adjunta correctamente.',
        dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5),
        status: TaskStatus.PENDING,
        userId: user.id,
      },
      {
        title: 'Escribir documentación del proyecto',
        status: TaskStatus.PENDING,
        userId: user.id,
      },
    ],
  });

  console.log(`${tasks.count} tareas creadas para ${user.email}`);
  console.log('\nCredenciales del usuario de prueba:');
  console.log('  Email:      demo@example.com');
  console.log('  Contraseña: password123');
}

main()
  .catch((error) => {
    console.error('Error en seed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
