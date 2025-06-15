import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { sql } from 'drizzle-orm';
import ws from "ws";
import * as schema from '@shared/schema';
import { config } from 'dotenv';

// Загружаем переменные окружения из .env файла
config({ override: true });

async function addCategoryFieldNeon() {
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

    console.log('📝 Добавляем поле category в таблицу animals...');
    
    try {
      // Проверяем, есть ли уже поле category
      const checkColumn = await db.execute(sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'animals' AND column_name = 'category'
      `);
      
      if (checkColumn.rows.length > 0) {
        console.log('✅ Поле category уже существует!');
      } else {
        console.log('🔧 Добавляем поле category...');
        await db.execute(sql`ALTER TABLE animals ADD COLUMN category TEXT DEFAULT 'livestock'`);
        console.log('✅ Поле category добавлено!');
      }
      
      // Обновляем категории на основе типов животных
      console.log('🔄 Обновляем категории на основе типов животных...');
      const updateResult = await db.execute(sql`
        UPDATE animals 
        SET category = animal_types.category 
        FROM animal_types 
        WHERE animals.animal_type_id = animal_types.id
      `);
      
      console.log(`✅ Обновлено записей: ${updateResult.rowCount || 0}`);
      
    } catch (error) {
      console.error('❌ Ошибка при добавлении поля:', error);
    }
    
    // Проверяем результат
    console.log('📊 Проверяем структуру таблицы animals...');
    const tableInfo = await db.execute(sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'animals' AND column_name = 'category'
    `);
    
    if (tableInfo.rows.length > 0) {
      const column = tableInfo.rows[0];
      console.log(`📋 Поле category: ${column.data_type} ${column.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${column.column_default ? `DEFAULT ${column.column_default}` : ''}`);
    } else {
      console.log('❌ Поле category не найдено!');
    }
    
    await pool.end();
    console.log('🔌 Соединение с базой данных закрыто');

  } catch (error) {
    console.error('❌ Ошибка при добавлении поля category:', error);
    throw error;
  }
}

// Запуск
addCategoryFieldNeon(); 