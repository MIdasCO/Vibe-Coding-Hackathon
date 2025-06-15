import fs from 'fs';
import path from 'path';

async function clearUploads() {
  try {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    
    console.log('🗑️ Очистка папки uploads...');
    console.log(`📁 Папка: ${uploadsDir}`);
    
    if (!fs.existsSync(uploadsDir)) {
      console.log('📂 Папка uploads не существует');
      return;
    }
    
    // Получаем список всех файлов
    const files = fs.readdirSync(uploadsDir);
    console.log(`📄 Найдено файлов: ${files.length}`);
    
    let deletedCount = 0;
    let keptCount = 0;
    
    for (const file of files) {
      const filePath = path.join(uploadsDir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isFile()) {
        // Удаляем только тестовые файлы (SVG и некоторые JPG)
        if (file.endsWith('.svg') || 
            file.startsWith('placeholder-') ||
            file.startsWith('cow-') ||
            file.startsWith('bull-') ||
            file.startsWith('sheep-') ||
            file.startsWith('goat-') ||
            file.startsWith('horse-') ||
            file.startsWith('chicken-') ||
            file.startsWith('pig-') ||
            file.startsWith('dog-') ||
            file.startsWith('cat-') ||
            file.startsWith('rabbit-') ||
            file.startsWith('bird-')) {
          
          try {
            fs.unlinkSync(filePath);
            console.log(`🗑️ Удален: ${file}`);
            deletedCount++;
          } catch (error) {
            console.error(`❌ Ошибка удаления ${file}:`, error);
          }
        } else {
          console.log(`⏭️ Пропущен: ${file} (не тестовый файл)`);
          keptCount++;
        }
      }
    }
    
    console.log('\n📊 Результат очистки:');
    console.log(`🗑️ Удалено файлов: ${deletedCount}`);
    console.log(`📄 Оставлено файлов: ${keptCount}`);
    console.log('✅ Очистка завершена!');
    
  } catch (error) {
    console.error('❌ Ошибка при очистке uploads:', error);
    throw error;
  }
}

// Запуск
clearUploads(); 