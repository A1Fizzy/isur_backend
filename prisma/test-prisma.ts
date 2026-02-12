import prisma from '../src/config/database';

async function test() {
  try {
    const userCount = await prisma.user.count();
    console.log('✅ Prisma работает. Пользователей:', userCount);
  } catch (e) {
    console.error('❌ Ошибка при подключении к БД:');
    console.error('Stack:', e);
  } finally {
    await prisma.$disconnect();
  }
}

test();