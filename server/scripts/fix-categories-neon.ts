import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { eq, inArray } from 'drizzle-orm';
import ws from "ws";
import * as schema from '@shared/schema';
import { config } from 'dotenv';

// Загружаем переменные окружения из .env файла
config({ override: true }); // override: true заставляет перезаписать существующие переменные

async function fixCategoriesNeon() {
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

    console.log('🔧 Исправляем категории животных в Neon...');
    
    // Определяем типы домашних животных
    const petTypes = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Hamster', 'Fish'];
    
    console.log('📝 Обновляем типы домашних животных...');
    const petsResult = await db
      .update(schema.animalTypes)
      .set({ category: 'pets' })
      .where(inArray(schema.animalTypes.name, petTypes));
    
    console.log(`   ✅ Обновлено типов домашних животных: ${petsResult.rowCount || 0}`);
    
    // Определяем типы скота
    const livestockTypes = ['Cattle', 'Sheep', 'Goats', 'Horses', 'Pigs', 'Poultry'];
    
    console.log('🐄 Обновляем типы скота...');
    const livestockResult = await db
      .update(schema.animalTypes)
      .set({ category: 'livestock' })
      .where(inArray(schema.animalTypes.name, livestockTypes));
    
    console.log(`   ✅ Обновлено типов скота: ${livestockResult.rowCount || 0}`);
    
    // Проверяем результат
    console.log('📊 Проверяем результат...');
    const allTypes = await db.select().from(schema.animalTypes);
    
    const pets = allTypes.filter(type => type.category === 'pets');
    const livestock = allTypes.filter(type => type.category === 'livestock');
    const uncategorized = allTypes.filter(type => !type.category || (type.category !== 'pets' && type.category !== 'livestock'));
    
    console.log('\n🎉 Категории животных успешно исправлены в Neon базе данных!');
    console.log('📊 Итого:');
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
    console.error('❌ Ошибка при исправлении категорий в Neon:', error);
    
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
fixCategoriesNeon(); 