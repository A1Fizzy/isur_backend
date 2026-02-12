import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Начинаем добавление тестовых данных...');

  const models = [
    'Mercedes Sprinter',
    'Iveco Daily',
    'Peugeot Boxer',
    'Fiat Ducato',
    'Renault Master',
    'Volkswagen Crafter',
    'Ford Transit',
    'GAZelle Next',
    'KAMAZ City',
    'PAZ-3205'
  ];

  const statuses = ['in_service', 'in_repair', 'out_of_order'];

  const vehiclesData = [];

  for (let i = 1; i <= 20; i++) {
    vehiclesData.push({
      plateNumber: generatePlateNumber(i),
      model: models[Math.floor(Math.random() * models.length)],
      year: 2018 + Math.floor(Math.random() * 7), // от 2018 до 2024
      status: statuses[Math.floor(Math.random() * statuses.length)],
    });
  }

//   // Удаляем все существующие записи (опционально)
//   await prisma.vehicle.deleteMany({});
//   console.log('Старые данные удалены');

  // Добавляем новые
  await prisma.vehicle.createMany({
    data: vehiclesData,
  });

  console.log(`✅ Успешно добавлено ${vehiclesData.length} автомобилей`);
}

// Генерация реалистичного госномера (для РФ)
function generatePlateNumber(id: number): string {
  const regions = ['77', '99', '177', '199', '78', '98', '178', '198'];
  const letters = ['А', 'В', 'Е', 'К', 'М', 'Н', 'О', 'Р', 'С', 'Т', 'У', 'Х'];
  const region = regions[Math.floor(Math.random() * regions.length)];
  const letter1 = letters[Math.floor(Math.random() * letters.length)];
  const letter2 = letters[Math.floor(Math.random() * letters.length)];
  const letter3 = letters[Math.floor(Math.random() * letters.length)];
  const number = String(id).padStart(3, '0');
  return `${letter1}${number}${letter2}${letter3}${region}`;
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });