// prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Хэшируем пароль
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

async function main() {
  console.log('Запуск seed-скрипта...');

  // Очистка существующих данных
  await prisma.order.deleteMany({});
  await prisma.employee.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Старые данные удалены.');

  const services = await prisma.service.findMany();
if (services.length === 0) {
  console.log('Создаём тестовые услуги...');

  const serviceData = [
    { name: 'Техническое обслуживание', duration: 60 },
    { name: 'Диагностика двигателя', duration: 45 },
    { name: 'Ремонт подвески', duration: 120 },
    { name: 'Замена масла', duration: 30 },
    { name: 'Ремонт электрики', duration: 90 },
  ];

  for (const data of serviceData) {
    await prisma.service.create({
       data: {
        name: data.name,
        duration: data.duration,
      },
    });
    console.log(`✅ Услуга создана: ${data.name}`);
  }
} else {
  console.log(`✅ Найдено ${services.length} услуг(и), пропускаем создание`);
}

  // Пароль для всех мастеров
  const password = '123456';
  const hashedPassword = await hashPassword(password);

  // Создание пользователей и мастеров
  const mastersData = [
    {
      name: 'Иван Петров',
      email: 'ivan@example.com',
      specialization: 'Двигатель',
    },
    {
      name: 'Анна Сидорова',
      email: 'anna@example.com',
      specialization: 'Электрика',
    },
    {
      name: 'Олег Кузнецов',
      email: 'oleg@example.com',
      specialization: 'Подвеска',
    },
  ];

  for (const master of mastersData) {
    // Создаём пользователя
    const user = await prisma.user.create({
       data: {
        name: master.name,
        email: master.email,
        password: hashedPassword,
        role: 'master',
      },
    });

    // Создаём сотрудника (мастера)
    await prisma.employee.create({
       data: {
        name: master.name,
        specialization: master.specialization,
        userId: user.id,
      },
    });

    console.log(`✅ Мастер создан: ${master.name}`);
  }

  // Получаем ID мастеров и услуг
  const employees = await prisma.employee.findMany();

//   if (services.length === 0) {
//     throw new Error('Не найдено ни одной услуги. Создайте хотя бы одну.');
//   }

  // Примерные времена начала (на ближайшие дни)
  const now = new Date();
  const times = [
    new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0), // Сегодня 9:00
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10, 0), // Завтра 10:00
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 14, 0), // Через 2 дня 14:00
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 8, 0), // Через 3 дня 8:00
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + 4, 16, 0), // Через 4 дня 16:00
  ];

  // Создание заказов
// Получаем или создаём тестовых клиентов
let customers = await prisma.customer.findMany();

if (customers.length === 0) {
  console.log('Создаём тестовых клиентов...');

  const customerData = [
    { name: 'ИП Автопарк', phone: '+79123456789', email: 'autopark@example.com' },
    { name: 'ТрансЛогистика', phone: '+79223456789', email: 'logistics@example.com' },
    { name: 'Горавтотранс', phone: '+79334567890', email: 'gat@example.com' },
  ];

  for (const data of customerData) {
    await prisma.customer.create({
       data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
      },
    });
    console.log(`✅ Клиент создан: ${data.name}`);
  }

  // Обновляем список клиентов
  customers = await prisma.customer.findMany();
} else {
  console.log(`✅ Найдено ${customers.length} клиент(ов), используем существующих`);
}

  const customerId = customers[0].id;

  const ordersData = [
    {
      customerId,
      serviceId: services[0].id,
      preferredTime: times[0],
      duration: 60,
      status: 'pending',
    },
    {
      customerId,
      serviceId: services[1].id,
      preferredTime: times[1],
      duration: 90,
      status: 'pending',
    },
    {
      customerId,
      serviceId: services[0].id,
      preferredTime: times[2],
      duration: 120,
      status: 'pending',
    },
    {
      customerId,
      serviceId: services[2]?.id || services[0].id,
      preferredTime: times[3],
      duration: 45,
      status: 'urgent', // Срочный
    },
    {
      customerId,
      serviceId: services[1].id,
      preferredTime: times[4],
      duration: 75,
      status: 'pending',
    },
  ];

  for (const order of ordersData) {
    await prisma.order.create({
       data: {
        customerId: order.customerId,
        serviceId: order.serviceId,
        preferredTime: order.preferredTime,
        duration: order.duration,
        status: order.status,
      },
    });
    console.log(`✅ Заказ создан: ${order.status} на ${order.preferredTime.toLocaleString()}`);
  }

  console.log('✅ Seed-скрипт выполнен успешно!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });