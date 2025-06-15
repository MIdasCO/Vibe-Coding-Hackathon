import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { sql } from 'drizzle-orm';
import ws from "ws";
import * as schema from '@shared/schema';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

// Загружаем переменные окружения из .env файла
config({ override: true });

async function applyMigrationNeon() {
  try {
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL не установлен!');
      return;
    }

    console.log('🔗 Подключение к Neon базе данных...');
    console.log('🌐 URL:', process.env.DATABASE_URL.replace(/:[^:@]*@/, ':***@'));
    
    neonConfig.webSocketConstructor = ws;
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle({ client: pool, schema });

    console.log('📝 Применяем миграцию для добавления поля category...');
    
    // Читаем файл миграции
    const migrationPath = join(process.cwd(), 'migrations', '0006_add_category_to_animals_table.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');
    
    console.log('🔧 Выполняем SQL миграцию...');
    
    // Разбиваем на отдельные команды
    const commands = migrationSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    for (const command of commands) {
      if (command.trim()) {
        console.log(`   🔄 Выполняем: ${command.substring(0, 50)}...`);
        await db.execute(sql.raw(command));
      }
    }
    
    console.log('✅ Миграция успешно применена!');
    
    // Проверяем результат
    console.log('📊 Проверяем структуру таблицы animals...');
    const tableInfo = await db.execute(sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'animals' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Структура таблицы animals:');
    for (const column of tableInfo.rows) {
      console.log(`   - ${column.column_name}: ${column.data_type} ${column.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${column.column_default ? `DEFAULT ${column.column_default}` : ''}`);
    }
    
    await pool.end();
    console.log('🔌 Соединение с базой данных закрыто');

  } catch (error) {
    console.error('❌ Ошибка при применении миграции:', error);
    throw error;
  }
}

// Запуск
applyMigrationNeon(); 