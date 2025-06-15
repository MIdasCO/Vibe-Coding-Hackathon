import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { sql } from 'drizzle-orm';
import ws from "ws";
import * as schema from '@shared/schema';
import { config } from 'dotenv';

// Загружаем переменные окружения из .env файла
config({ override: true }); // override: true заставляет перезаписать существующие переменные

async function cleanDuplicatesNeon() {
  try {
    // Проверяем наличие DATABASE_URL
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL не установлен!');
      console.log('💡 Установите переменную окружения DATABASE_URL для подключения к Neon');
      return;
    }

    console.log('🔗 Подключение к Neon базе данных...');
    console.log('🌐 URL:', process.env.DATABASE_URL.replace(/:[^:@]*@/, ':***@')); // Скрываем пароль
    
    // Настраиваем подключение к Neon
    neonConfig.webSocketConstructor = ws;
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle({ client: pool, schema });

    console.log('🧹 Очищаем дублирующиеся типы животных в Neon...');
    
    // Сначала посмотрим, какие дубликаты есть
    console.log('📊 Анализируем дубликаты...');
    const duplicatesQuery = sql`
      SELECT name, COUNT(*) as count
      FROM animal_types
      GROUP BY name
      HAVING COUNT(*) > 1
      ORDER BY name
    `;
    
    const duplicates = await db.execute(duplicatesQuery);
    console.log(`   🔍 Найдено дублирующихся типов: ${duplicates.rows.length}`);
    
    for (const duplicate of duplicates.rows) {
      console.log(`      - ${duplicate.name}: ${duplicate.count} записей`);
    }
    
    if (duplicates.rows.length === 0) {
      console.log('✅ Дубликатов не найдено!');
      await pool.end();
      return;
    }
    
    // Удаляем дубликаты, оставляя только одну запись с минимальным ID для каждого типа
    console.log('🗑️ Удаляем дубликаты...');
    const cleanupQuery = sql`
      DELETE FROM animal_types
      WHERE id NOT IN (
        SELECT MIN(id)
        FROM animal_types
        GROUP BY name
      )
    `;
    
    const result = await db.execute(cleanupQuery);
    console.log(`   ✅ Удалено дублирующихся записей: ${result.rowCount || 0}`);
    
    // Проверяем результат
    console.log('📊 Проверяем результат...');
    const allTypes = await db.select().from(schema.animalTypes);
    
    const pets = allTypes.filter(type => type.category === 'pets');
    const livestock = allTypes.filter(type => type.category === 'livestock');
    const uncategorized = allTypes.filter(type => !type.category || (type.category !== 'pets' && type.category !== 'livestock'));
    
    console.log('\n🎉 Дубликаты успешно удалены из Neon базы данных!');
    console.log('📊 Итого типов животных:');
    console.log(`   🐾 Домашние животные: ${pets.length}`);
    pets.forEach(pet => console.log(`      - ${pet.name} (${pet.nameRu})`));
    
    console.log(`   🐄 Скот: ${livestock.length}`);
    livestock.forEach(animal => console.log(`      - ${animal.name} (${animal.nameRu})`));
    
    if (uncategorized.length > 0) {
      console.log(`   ❓ Без категории: ${uncategorized.length}`);
      uncategorized.forEach(animal => console.log(`      - ${animal.name} (${animal.nameRu})`));
    }
    
    // Закрываем соединение
    await pool.end();
    console.log('🔌 Соединение с базой данных закрыто');
    
  } catch (error) {
    console.error('❌ Ошибка при очистке дубликатов в Neon:', error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('ECONNREFUSED')) {
      console.log('💡 Проверьте подключение к интернету и правильность DATABASE_URL');
    } else if (errorMessage.includes('authentication')) {
      console.log('💡 Проверьте правильность учетных данных в DATABASE_URL');
    } else if (errorMessage.includes('database') && errorMessage.includes('does not exist')) {
      console.log('💡 Проверьте существование базы данных');
    }
    
    throw error;
  }
}

// Запуск
cleanDuplicatesNeon(); 