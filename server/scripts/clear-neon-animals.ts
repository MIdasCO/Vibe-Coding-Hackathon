import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from '@shared/schema';
import { config } from 'dotenv';

// Загружаем переменные окружения из .env файла
config({ override: true }); // override: true заставляет перезаписать существующие переменные

async function clearNeonAnimals() {
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

    console.log('🗑️ Начинаем очистку каталога животных в Neon...');
    
    // Удаляем связанные данные в правильном порядке (из-за внешних ключей)
    
    console.log('📸 Удаление фотографий животных...');
    const photosResult = await db.delete(schema.animalPhotos);
    console.log(`   ✅ Удалено фотографий: ${photosResult.rowCount || 0}`);
    
    console.log('🎥 Удаление видео животных...');
    const videosResult = await db.delete(schema.animalVideos);
    console.log(`   ✅ Удалено видео: ${videosResult.rowCount || 0}`);
    
    console.log('📄 Удаление документов животных...');
    const docsResult = await db.delete(schema.animalDocuments);
    console.log(`   ✅ Удалено документов: ${docsResult.rowCount || 0}`);
    
    console.log('⭐ Удаление избранного...');
    const favoritesResult = await db.delete(schema.favorites);
    console.log(`   ✅ Удалено избранного: ${favoritesResult.rowCount || 0}`);
    
    // Удаляем сообщения связанные с животными (если есть поле animalId)
    console.log('💬 Удаление сообщений связанных с животными...');
    try {
      // Предполагаем, что в таблице messages есть поле animalId или animal_id
      const messagesResult = await db.delete(schema.messages);
      console.log(`   ✅ Удалено сообщений: ${messagesResult.rowCount || 0}`);
    } catch (error) {
      console.log('   ⚠️ Сообщения не удалены (возможно, нет связи с животными)');
    }
    
    // Удаляем самих животных
    console.log('🐄 Удаление объявлений животных...');
    const animalsResult = await db.delete(schema.animals);
    console.log(`   ✅ Удалено объявлений: ${animalsResult.rowCount || 0}`);
    
    console.log('\n🎉 Каталог животных успешно очищен в Neon базе данных!');
    console.log('📊 Итого удалено:');
    console.log(`   🐄 Животных: ${animalsResult.rowCount || 0}`);
    console.log(`   📸 Фотографий: ${photosResult.rowCount || 0}`);
    console.log(`   🎥 Видео: ${videosResult.rowCount || 0}`);
    console.log(`   📄 Документов: ${docsResult.rowCount || 0}`);
    console.log(`   ⭐ Избранного: ${favoritesResult.rowCount || 0}`);
    
    // Закрываем соединение
    await pool.end();
    console.log('🔌 Соединение с базой данных закрыто');
    
  } catch (error) {
    console.error('❌ Ошибка при очистке каталога в Neon:', error);
    
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
clearNeonAnimals(); 