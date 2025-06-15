#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Подготовка проекта для Vercel...');

// 1. Создаем .env.local для локальной разработки
const envLocal = `# Локальные переменные окружения
DATABASE_URL="postgresql://neondb_owner:npg_SLY3h9DnxREw@ep-plain-night-a8ck81wi-pooler.eastus2.azure.neon.tech/neondb?sslmode=require"
NODE_ENV=development
SESSION_SECRET="dev-secret-key"
PORT=5000
VITE_API_URL=http://localhost:5000
`;

fs.writeFileSync('.env.local', envLocal);
console.log('✅ Создан .env.local');

// 2. Обновляем package.json для Vercel
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Добавляем скрипт для Vercel
packageJson.scripts['vercel-build'] = 'npm run build:client';

// Убираем проблемные скрипты из production
const productionScripts = {
  ...packageJson.scripts,
  'dev': 'tsx server/index.ts',
  'build': 'npm run build:client',
  'build:client': 'vite build',
  'start': 'tsx server/index.ts',
  'vercel-build': 'vite build'
};

packageJson.scripts = productionScripts;

fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
console.log('✅ Обновлен package.json');

// 3. Создаем простую конфигурацию для статического сайта
const staticVercelConfig = {
  "version": 2,
  "name": "janybar",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist/public"
      }
    }
  ],
  "routes": [
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
};

fs.writeFileSync('vercel.json', JSON.stringify(staticVercelConfig, null, 2));
console.log('✅ Создана конфигурация vercel.json');

// 4. Создаем инструкции
const instructions = `
🎉 Проект подготовлен для развертывания на Vercel!

📋 Следующие шаги:

1. Установите Vercel CLI:
   npm i -g vercel

2. Войдите в аккаунт Vercel:
   vercel login

3. Разверните проект:
   vercel --prod

4. В панели Vercel добавьте переменные окружения:
   - DATABASE_URL: postgresql://neondb_owner:npg_SLY3h9DnxREw@ep-plain-night-a8ck81wi-pooler.eastus2.azure.neon.tech/neondb?sslmode=require
   - NODE_ENV: production
   - SESSION_SECRET: your-secure-secret-here

⚠️  Примечание: Этот проект будет развернут как статический сайт.
   Для полной функциональности с API потребуется дополнительная настройка.

🔗 После развертывания обновите VITE_API_URL в vite.config.ts на ваш домен Vercel.
`;

console.log(instructions);
fs.writeFileSync('VERCEL_INSTRUCTIONS.txt', instructions);
console.log('✅ Созданы инструкции в VERCEL_INSTRUCTIONS.txt'); 