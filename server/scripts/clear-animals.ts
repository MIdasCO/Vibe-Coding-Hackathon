import { db } from '../db';
import * as schema from '@shared/schema';

async function clearAnimals() {
  try {
    console.log('🗑️ Очистка каталога животных...');
    
    // Удаляем фотографии животных
    console.log('📸 Удаление фотографий...');
    await db.delete(schema.animalPhotos);
    
    // Удаляем видео животных
    console.log('🎥 Удаление видео...');
    await db.delete(schema.animalVideos);
    
    // Удаляем документы животных
    console.log('📄 Удаление документов...');
    await db.delete(schema.animalDocuments);
    
    // Удаляем избранное
    console.log('⭐ Удаление избранного...');
    await db.delete(schema.favorites);
    
    // Удаляем сообщения связанные с животными
    console.log('💬 Удаление сообщений...');
    // Здесь нужно будет добавить условие для удаления только сообщений связанных с животными
    
    // Удаляем самих животных
    console.log('🐄 Удаление объявлений животных...');
    const result = await db.delete(schema.animals);
    
    console.log('✅ Каталог животных успешно очищен!');
    console.log(`📊 Удалено объявлений: ${result.rowsAffected || 'неизвестно'}`);
    
  } catch (error) {
    console.error('❌ Ошибка при очистке каталога:', error);
    throw error;
  }
}

// Запуск
clearAnimals(); 