import fs from 'fs';
import path from 'path';
import https from 'https';

// Список URL изображений животных (бесплатные изображения)
const animalImages = [
  // Коровы
  {
    url: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800&h=600&fit=crop',
    filename: 'cow-holstein-1.jpg',
    animalType: 'cow'
  },
  {
    url: 'https://images.unsplash.com/photo-1560114928-40f1f1eb26a0?w=800&h=600&fit=crop',
    filename: 'cow-jersey-2.jpg',
    animalType: 'cow'
  },
  {
    url: 'https://images.unsplash.com/photo-1605440962783-d9b8e4c1c7b5?w=800&h=600&fit=crop',
    filename: 'bull-breeding-3.jpg',
    animalType: 'cow'
  },

  // Овцы
  {
    url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&h=600&fit=crop',
    filename: 'sheep-flock-4.jpg',
    animalType: 'sheep'
  },
  {
    url: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=800&h=600&fit=crop',
    filename: 'sheep-romanov-5.jpg',
    animalType: 'sheep'
  },

  // Козы
  {
    url: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=600&fit=crop',
    filename: 'goat-saanen-6.jpg',
    animalType: 'goat'
  },
  {
    url: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800&h=600&fit=crop',
    filename: 'goat-nubian-7.jpg',
    animalType: 'goat'
  },

  // Лошади
  {
    url: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800&h=600&fit=crop',
    filename: 'horse-akhal-8.jpg',
    animalType: 'horse'
  },
  {
    url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop',
    filename: 'horse-kyrgyz-9.jpg',
    animalType: 'horse'
  },

  // Куры
  {
    url: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=800&h=600&fit=crop',
    filename: 'chicken-leghorn-10.jpg',
    animalType: 'chicken'
  },
  {
    url: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800&h=600&fit=crop',
    filename: 'chicken-broiler-11.jpg',
    animalType: 'chicken'
  },

  // Свиньи
  {
    url: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800&h=600&fit=crop',
    filename: 'pig-piglets-12.jpg',
    animalType: 'pig'
  },

  // Собаки
  {
    url: 'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=800&h=600&fit=crop',
    filename: 'dog-german-shepherd-13.jpg',
    animalType: 'dog'
  },
  {
    url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&h=600&fit=crop',
    filename: 'dog-labrador-14.jpg',
    animalType: 'dog'
  },
  {
    url: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=800&h=600&fit=crop',
    filename: 'dog-husky-15.jpg',
    animalType: 'dog'
  },

  // Кошки
  {
    url: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&h=600&fit=crop',
    filename: 'cat-british-16.jpg',
    animalType: 'cat'
  },
  {
    url: 'https://images.unsplash.com/photo-1513245543132-31f507417b26?w=800&h=600&fit=crop',
    filename: 'cat-persian-17.jpg',
    animalType: 'cat'
  },
  {
    url: 'https://images.unsplash.com/photo-1571566882372-1598d88abd90?w=800&h=600&fit=crop',
    filename: 'cat-maine-coon-18.jpg',
    animalType: 'cat'
  },

  // Кролики
  {
    url: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=800&h=600&fit=crop',
    filename: 'rabbit-dwarf-19.jpg',
    animalType: 'rabbit'
  },
  {
    url: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800&h=600&fit=crop',
    filename: 'rabbit-angora-20.jpg',
    animalType: 'rabbit'
  },

  // Птицы
  {
    url: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800&h=600&fit=crop',
    filename: 'bird-budgie-21.jpg',
    animalType: 'bird'
  },
  {
    url: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800&h=600&fit=crop',
    filename: 'bird-canary-22.jpg',
    animalType: 'bird'
  }
];

// Функция для загрузки изображения
function downloadImage(url: string, filepath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
      
      file.on('error', (err) => {
        fs.unlink(filepath, () => {}); // Удаляем файл при ошибке
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function downloadAllImages() {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  
  // Создаем папку uploads если её нет
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  console.log('🖼️ Начинаем загрузку изображений животных...');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const image of animalImages) {
    const filepath = path.join(uploadsDir, image.filename);
    
    try {
      console.log(`📥 Загружаем: ${image.filename} (${image.animalType})`);
      await downloadImage(image.url, filepath);
      console.log(`✅ Загружено: ${image.filename}`);
      successCount++;
      
      // Небольшая задержка между загрузками
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`❌ Ошибка загрузки ${image.filename}:`, error);
      errorCount++;
    }
  }
  
  console.log(`\n📊 Результат загрузки:`);
  console.log(`✅ Успешно: ${successCount}`);
  console.log(`❌ Ошибок: ${errorCount}`);
  console.log(`📁 Папка: ${uploadsDir}`);
}

// Альтернативные изображения-заглушки
const placeholderImages = [
  'https://via.placeholder.com/800x600/8B4513/FFFFFF?text=Корова',
  'https://via.placeholder.com/800x600/228B22/FFFFFF?text=Овца', 
  'https://via.placeholder.com/800x600/DAA520/FFFFFF?text=Коза',
  'https://via.placeholder.com/800x600/8B4513/FFFFFF?text=Лошадь',
  'https://via.placeholder.com/800x600/FF6347/FFFFFF?text=Курица',
  'https://via.placeholder.com/800x600/FFB6C1/FFFFFF?text=Свинья',
  'https://via.placeholder.com/800x600/4169E1/FFFFFF?text=Собака',
  'https://via.placeholder.com/800x600/9370DB/FFFFFF?text=Кошка',
  'https://via.placeholder.com/800x600/32CD32/FFFFFF?text=Кролик',
  'https://via.placeholder.com/800x600/FF4500/FFFFFF?text=Птица'
];

async function createPlaceholderImages() {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  console.log('🎨 Создаем изображения-заглушки...');
  
  for (let i = 0; i < placeholderImages.length; i++) {
    const filename = `placeholder-${i + 1}.jpg`;
    const filepath = path.join(uploadsDir, filename);
    
    try {
      await downloadImage(placeholderImages[i], filepath);
      console.log(`✅ Создано: ${filename}`);
    } catch (error) {
      console.error(`❌ Ошибка создания ${filename}:`, error);
    }
  }
}

// Запуск
async function main() {
  try {
    // Сначала пробуем загрузить реальные изображения
    await downloadAllImages();
    
    // Если нужно, создаем заглушки
    console.log('\n🎨 Создаем дополнительные изображения-заглушки...');
    await createPlaceholderImages();
    
    console.log('\n🎯 Загрузка изображений завершена!');
  } catch (error) {
    console.error('❌ Общая ошибка:', error);
  }
}

if (require.main === module) {
  main();
}

export { downloadAllImages, createPlaceholderImages }; 