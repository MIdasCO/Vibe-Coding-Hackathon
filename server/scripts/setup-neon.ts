console.log('🔧 Настройка подключения к Neon Database');
console.log('');
console.log('📋 Для подключения к Neon вам нужно:');
console.log('');
console.log('1️⃣ Зайти на https://neon.tech');
console.log('2️⃣ Создать аккаунт или войти');
console.log('3️⃣ Создать новый проект');
console.log('4️⃣ Скопировать Connection String');
console.log('');
console.log('🔗 Connection String выглядит примерно так:');
console.log('postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require');
console.log('');
console.log('⚙️ Способы установки DATABASE_URL:');
console.log('');
console.log('🖥️ В PowerShell (временно):');
console.log('$env:DATABASE_URL="ваш_connection_string"');
console.log('');
console.log('📁 В файле .env (постоянно):');
console.log('DATABASE_URL="ваш_connection_string"');
console.log('');
console.log('🚀 После установки запустите:');
console.log('npm run clear-neon');
console.log('');
console.log('💡 Текущий DATABASE_URL:', process.env.DATABASE_URL || 'НЕ УСТАНОВЛЕН');

if (process.env.DATABASE_URL) {
  // Проверяем, является ли это Neon URL
  if (process.env.DATABASE_URL.includes('neon.tech')) {
    console.log('✅ Обнаружен Neon URL!');
  } else if (process.env.DATABASE_URL.includes('localhost')) {
    console.log('⚠️ Обнаружен локальный URL - это не Neon!');
  } else {
    console.log('🤔 URL установлен, но не похож на Neon');
  }
} 