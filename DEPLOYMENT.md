# Развертывание на Vercel

## Подготовка к развертыванию

### 1. Установка зависимостей
```bash
npm install
```

### 2. Переменные окружения
В панели Vercel добавьте следующие переменные окружения:

```
DATABASE_URL=postgresql://neondb_owner:npg_SLY3h9DnxREw@ep-plain-night-a8ck81wi-pooler.eastus2.azure.neon.tech/neondb?sslmode=require
NODE_ENV=production
SESSION_SECRET=your-secure-session-secret-here
VERCEL=1
```

### 3. Настройка домена
После развертывания обновите `vite.config.ts`:
```typescript
'import.meta.env.VITE_API_URL': JSON.stringify(
  process.env.NODE_ENV === 'production' 
    ? 'https://your-actual-vercel-domain.vercel.app' 
    : 'http://localhost:5000'
)
```

## Команды для развертывания

### Локальная сборка (тестирование)
```bash
npm run build
```

### Развертывание на Vercel
1. Установите Vercel CLI:
```bash
npm i -g vercel
```

2. Войдите в аккаунт:
```bash
vercel login
```

3. Разверните проект:
```bash
vercel --prod
```

## Структура проекта для Vercel

- `server/index.ts` - Серверная часть (API)
- `client/` - Клиентская часть (React)
- `vercel.json` - Конфигурация Vercel
- `dist/` - Собранные файлы

## Особенности конфигурации

1. **Serverless Functions**: API работает как serverless функции
2. **Static Files**: Клиентская часть подается как статические файлы
3. **Database**: Используется Neon PostgreSQL
4. **File Uploads**: Файлы загружаются в папку `uploads/`

## Проблемы и решения

### Cross-env ошибка
Если возникает ошибка с `cross-env`, установите зависимость:
```bash
npm install cross-env --save-dev
```

### Проблемы с TypeScript
Убедитесь, что используется правильная конфигурация:
```bash
npm run build:server
npm run build:client
```

### Проблемы с базой данных
Проверьте подключение к Neon:
```bash
npm run check-animal-types-neon
``` 