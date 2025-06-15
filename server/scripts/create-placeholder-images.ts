import fs from 'fs';
import path from 'path';

// Простые SVG изображения для каждого типа животного
const svgTemplates = {
  cow: `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
    <rect width="800" height="600" fill="#8B4513"/>
    <text x="400" y="300" font-family="Arial" font-size="48" fill="white" text-anchor="middle">🐄 Корова</text>
    <text x="400" y="360" font-family="Arial" font-size="24" fill="white" text-anchor="middle">Holstein Dairy Cow</text>
  </svg>`,
  
  bull: `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
    <rect width="800" height="600" fill="#654321"/>
    <text x="400" y="300" font-family="Arial" font-size="48" fill="white" text-anchor="middle">🐂 Бык</text>
    <text x="400" y="360" font-family="Arial" font-size="24" fill="white" text-anchor="middle">Breeding Bull</text>
  </svg>`,
  
  sheep: `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
    <rect width="800" height="600" fill="#228B22"/>
    <text x="400" y="300" font-family="Arial" font-size="48" fill="white" text-anchor="middle">🐑 Овца</text>
    <text x="400" y="360" font-family="Arial" font-size="24" fill="white" text-anchor="middle">Sheep Flock</text>
  </svg>`,
  
  goat: `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
    <rect width="800" height="600" fill="#DAA520"/>
    <text x="400" y="300" font-family="Arial" font-size="48" fill="white" text-anchor="middle">🐐 Коза</text>
    <text x="400" y="360" font-family="Arial" font-size="24" fill="white" text-anchor="middle">Dairy Goat</text>
  </svg>`,
  
  horse: `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
    <rect width="800" height="600" fill="#8B4513"/>
    <text x="400" y="300" font-family="Arial" font-size="48" fill="white" text-anchor="middle">🐎 Лошадь</text>
    <text x="400" y="360" font-family="Arial" font-size="24" fill="white" text-anchor="middle">Beautiful Horse</text>
  </svg>`,
  
  chicken: `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
    <rect width="800" height="600" fill="#FF6347"/>
    <text x="400" y="300" font-family="Arial" font-size="48" fill="white" text-anchor="middle">🐔 Курица</text>
    <text x="400" y="360" font-family="Arial" font-size="24" fill="white" text-anchor="middle">Laying Hens</text>
  </svg>`,
  
  pig: `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
    <rect width="800" height="600" fill="#FFB6C1"/>
    <text x="400" y="300" font-family="Arial" font-size="48" fill="black" text-anchor="middle">🐷 Свинья</text>
    <text x="400" y="360" font-family="Arial" font-size="24" fill="black" text-anchor="middle">Young Piglets</text>
  </svg>`,
  
  dog: `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
    <rect width="800" height="600" fill="#4169E1"/>
    <text x="400" y="300" font-family="Arial" font-size="48" fill="white" text-anchor="middle">🐕 Собака</text>
    <text x="400" y="360" font-family="Arial" font-size="24" fill="white" text-anchor="middle">Friendly Dog</text>
  </svg>`,
  
  cat: `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
    <rect width="800" height="600" fill="#9370DB"/>
    <text x="400" y="300" font-family="Arial" font-size="48" fill="white" text-anchor="middle">🐱 Кошка</text>
    <text x="400" y="360" font-family="Arial" font-size="24" fill="white" text-anchor="middle">Beautiful Cat</text>
  </svg>`,
  
  rabbit: `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
    <rect width="800" height="600" fill="#32CD32"/>
    <text x="400" y="300" font-family="Arial" font-size="48" fill="white" text-anchor="middle">🐰 Кролик</text>
    <text x="400" y="360" font-family="Arial" font-size="24" fill="white" text-anchor="middle">Cute Rabbit</text>
  </svg>`,
  
  bird: `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
    <rect width="800" height="600" fill="#FF4500"/>
    <text x="400" y="300" font-family="Arial" font-size="48" fill="white" text-anchor="middle">🐦 Птица</text>
    <text x="400" y="360" font-family="Arial" font-size="24" fill="white" text-anchor="middle">Singing Bird</text>
  </svg>`
};

// Список файлов для создания
const imagesToCreate = [
  // Коровы
  { filename: 'cow-holstein-1.jpg', type: 'cow', title: 'Голштинская корова' },
  { filename: 'bull-breeding-3.jpg', type: 'bull', title: 'Племенной бык' },
  { filename: 'cow-jersey-2.jpg', type: 'cow', title: 'Джерсейская корова' },
  
  // Овцы
  { filename: 'sheep-flock-4.jpg', type: 'sheep', title: 'Стадо овец' },
  { filename: 'sheep-romanov-5.jpg', type: 'sheep', title: 'Романовские овцы' },
  
  // Козы
  { filename: 'goat-saanen-6.jpg', type: 'goat', title: 'Зааненские козы' },
  { filename: 'goat-nubian-7.jpg', type: 'goat', title: 'Нубийские козы' },
  
  // Лошади
  { filename: 'horse-akhal-8.jpg', type: 'horse', title: 'Ахалтекинская лошадь' },
  { filename: 'horse-kyrgyz-9.jpg', type: 'horse', title: 'Киргизская лошадь' },
  
  // Куры
  { filename: 'chicken-leghorn-10.jpg', type: 'chicken', title: 'Куры Леггорн' },
  { filename: 'chicken-broiler-11.jpg', type: 'chicken', title: 'Бройлеры' },
  
  // Свиньи
  { filename: 'pig-piglets-12.jpg', type: 'pig', title: 'Поросята' },
  
  // Собаки
  { filename: 'dog-german-shepherd-13.jpg', type: 'dog', title: 'Немецкая овчарка' },
  { filename: 'dog-labrador-14.jpg', type: 'dog', title: 'Лабрадор' },
  { filename: 'dog-husky-15.jpg', type: 'dog', title: 'Хаски' },
  
  // Кошки
  { filename: 'cat-british-16.jpg', type: 'cat', title: 'Британская кошка' },
  { filename: 'cat-persian-17.jpg', type: 'cat', title: 'Персидская кошка' },
  { filename: 'cat-maine-coon-18.jpg', type: 'cat', title: 'Мейн-кун' },
  
  // Кролики
  { filename: 'rabbit-dwarf-19.jpg', type: 'rabbit', title: 'Карликовый кролик' },
  { filename: 'rabbit-angora-20.jpg', type: 'rabbit', title: 'Ангорский кролик' },
  
  // Птицы
  { filename: 'bird-budgie-21.jpg', type: 'bird', title: 'Волнистый попугай' },
  { filename: 'bird-canary-22.jpg', type: 'bird', title: 'Канарейка' },
  
  // Заглушки
  { filename: 'placeholder-1.jpg', type: 'cow', title: 'Корова' },
  { filename: 'placeholder-2.jpg', type: 'sheep', title: 'Овца' },
  { filename: 'placeholder-3.jpg', type: 'goat', title: 'Коза' },
  { filename: 'placeholder-4.jpg', type: 'horse', title: 'Лошадь' },
  { filename: 'placeholder-5.jpg', type: 'chicken', title: 'Курица' },
  { filename: 'placeholder-6.jpg', type: 'pig', title: 'Свинья' },
  { filename: 'placeholder-7.jpg', type: 'dog', title: 'Собака' },
  { filename: 'placeholder-8.jpg', type: 'cat', title: 'Кошка' },
  { filename: 'placeholder-9.jpg', type: 'rabbit', title: 'Кролик' },
  { filename: 'placeholder-10.jpg', type: 'bird', title: 'Птица' }
];

function createCustomSvg(type: string, title: string): string {
  const baseTemplate = svgTemplates[type as keyof typeof svgTemplates] || svgTemplates.cow;
  return baseTemplate.replace(/🐄 Корова/, `${getEmoji(type)} ${title}`);
}

function getEmoji(type: string): string {
  const emojis: { [key: string]: string } = {
    cow: '🐄',
    bull: '🐂', 
    sheep: '🐑',
    goat: '🐐',
    horse: '🐎',
    chicken: '🐔',
    pig: '🐷',
    dog: '🐕',
    cat: '🐱',
    rabbit: '🐰',
    bird: '🐦'
  };
  return emojis[type] || '🐄';
}

async function createPlaceholderImages() {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  
  // Создаем папку uploads если её нет
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  console.log('🎨 Создание изображений-заглушек для тестовых объявлений...');
  
  let createdCount = 0;
  
  for (const image of imagesToCreate) {
    const svgContent = createCustomSvg(image.type, image.title);
    const svgPath = path.join(uploadsDir, image.filename.replace('.jpg', '.svg'));
    
    try {
      // Создаем SVG файл
      fs.writeFileSync(svgPath, svgContent);
      console.log(`✅ Создано: ${image.filename} (${image.title})`);
      createdCount++;
    } catch (error) {
      console.error(`❌ Ошибка создания ${image.filename}:`, error);
    }
  }
  
  console.log(`\n📊 Результат:`);
  console.log(`✅ Создано файлов: ${createdCount}`);
  console.log(`📁 Папка: ${uploadsDir}`);
  console.log(`\n💡 Совет: SVG файлы можно использовать напрямую или конвертировать в JPG`);
}

// Запуск
createPlaceholderImages();

export { createPlaceholderImages }; 