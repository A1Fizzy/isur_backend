// hash-password.js
const bcrypt = require('bcryptjs');

async function run() {
  const plainPassword = 'admin'; // Ваш пароль
  const saltRounds = 10;
  const hashed = await bcrypt.hash(plainPassword, saltRounds);
  console.log('Хэш пароля:', hashed);
}

run();