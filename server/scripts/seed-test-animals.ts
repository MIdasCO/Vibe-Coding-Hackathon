import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../../shared/schema";
import { eq } from 'drizzle-orm';
import { config } from 'dotenv';
import bcrypt from 'bcrypt';

// Загружаем переменные окружения из .env файла
config({ override: true });

// Database setup
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema });

    const testAnimals = [
  // Коровы - разные цены
  {
    title: "Молодая голштинская корова",
    description: "Отличная молочная корова, 2 года, здоровая, с документами. Дает до 25 литров молока в день. Вакцинирована, готова к разведению.",
    animalTypeId: 1, // Корова
    breedId: 1, // Голштинская
    gender: "female",
    birthYear: 2022,
    color: "Черно-белая",
    weight: "450.00",
    purpose: "dairy",
    price: "85000.00",
    isNegotiable: true,
    regionId: 1, // Чуйская область
    cityId: 1, // Бишкек
    address: "ул. Ахунбаева 123",
    homeDelivery: true,
    vaccinated: true,
    certified: true,
    organicFeed: true,
    status: "active"
  },
  {
    title: "Племенной бык-производитель",
    description: "Элитный бык голштинской породы, 4 года. Отличная генетика, подходит для улучшения стада. Все документы в порядке.",
    animalTypeId: 1, // Корова
    breedId: 1, // Голштинская
    gender: "male",
    birthYear: 2020,
    color: "Черно-белый",
    weight: "800.00",
    purpose: "breeding",
    price: "150000.00",
    isNegotiable: false,
    regionId: 1,
    cityId: 2, // Токмок
    address: "с. Беловодское",
    pickup: true,
    vaccinated: true,
    certified: true,
    status: "active"
  },
  {
    title: "Джерсейская корова высокой продуктивности",
    description: "Корова джерсейской породы, 3 года. Высокая жирность молока, спокойный характер. Подходит для небольших хозяйств.",
    animalTypeId: 1,
    breedId: 2, // Джерсейская
    gender: "female",
        birthYear: 2021,
    color: "Палевая",
    weight: "380.00",
    purpose: "dairy",
    price: "75000.00",
    isNegotiable: true,
    regionId: 2, // Ошская область
    cityId: 3, // Ош
    address: "ул. Ленина 45",
    homeDelivery: false,
    pickup: true,
    vaccinated: true,
    organicFeed: true,
    status: "active"
  },

  // Овцы - средние цены
  {
    title: "Стадо курдючных овец",
    description: "Продается стадо из 15 курдючных овец. Все здоровые, упитанные. Подходят для мясного направления. Возможна продажа по частям.",
    animalTypeId: 2, // Овца
    breedId: 3, // Курдючная
    gender: "female",
    birthYear: 2022,
    color: "Белая",
    weight: "65.00",
    purpose: "meat",
    price: "25000.00",
        isNegotiable: true,
    regionId: 3, // Иссык-Кульская область
    cityId: 4, // Каракол
    address: "с. Тамга",
    pickup: true,
    vaccinated: true,
    status: "active"
  },
  {
    title: "Романовские овцы для разведения",
    description: "Молодые романовские овцы, отличная плодовитость. 8 овцематок и 1 баран. Подходят для создания племенного стада.",
    animalTypeId: 2,
    breedId: 4, // Романовская
    gender: "female",
    birthYear: 2023,
    color: "Серая",
    weight: "55.00",
    purpose: "breeding",
    price: "18000.00",
    isNegotiable: false,
    regionId: 1,
    cityId: 1,
    address: "ул. Московская 78",
    homeDelivery: true,
    vaccinated: true,
    certified: true,
    status: "active"
  },

  // Козы - низкие цены
  {
    title: "Зааненские козы молочные",
    description: "Продаются зааненские козы, отличные молочницы. 3 козы и 1 козел. Дают много молока, неприхотливы в уходе.",
    animalTypeId: 3, // Коза
    breedId: 5, // Зааненская
    gender: "female",
        birthYear: 2022,
    color: "Белая",
    weight: "60.00",
    purpose: "dairy",
    price: "12000.00",
    isNegotiable: true,
    regionId: 4, // Нарынская область
    cityId: 5, // Нарын
    address: "ул. Токтогула 12",
    pickup: true,
    vaccinated: true,
    organicFeed: true,
    status: "active"
  },
  {
    title: "Нубийские козы",
    description: "Красивые нубийские козы с длинными ушами. Хорошие молочницы, дружелюбные. 2 козы, молодые, здоровые.",
    animalTypeId: 3,
    breedId: 6, // Нубийская
    gender: "female",
    birthYear: 2023,
    color: "Коричневая",
    weight: "45.00",
    purpose: "dairy",
    price: "8000.00",
    isNegotiable: true,
    regionId: 2,
    cityId: 3,
    address: "мкр. Ак-Босого 34",
    homeDelivery: true,
    pickup: true,
    vaccinated: true,
    status: "active"
  },

  // Лошади - высокие цены
  {
    title: "Чистокровная ахалтекинская лошадь",
    description: "Элитная ахалтекинская лошадь, жеребец 5 лет. Отличная родословная, подходит для спорта и разведения. Золотистая масть.",
    animalTypeId: 4, // Лошадь
    breedId: 7, // Ахалтекинская
    gender: "male",
    birthYear: 2019,
    color: "Золотистая",
    weight: "480.00",
    purpose: "breeding",
    price: "300000.00",
    isNegotiable: true,
    regionId: 1,
    cityId: 1,
    address: "Ипподром, конюшня №5",
    pickup: true,
    certified: true,
    status: "active"
  },
  {
    title: "Рабочая лошадь киргизской породы",
    description: "Надежная рабочая лошадь, 8 лет. Спокойная, послушная, подходит для сельхозработ и верховой езды. Здоровая, выносливая.",
    animalTypeId: 4,
    breedId: 8, // Киргизская
    gender: "female",
    birthYear: 2016,
    color: "Гнедая",
    weight: "420.00",
    purpose: "reproduction",
    price: "120000.00",
    isNegotiable: true,
    regionId: 5, // Джалал-Абадская область
    cityId: 6, // Джалал-Абад
    address: "с. Сузак",
    pickup: true,
    vaccinated: true,
    status: "active"
  },

  // Куры - очень низкие цены
  {
    title: "Несушки породы Леггорн",
    description: "Молодые курочки-несушки, 6 месяцев. Отличная яйценоскость, здоровые. Продается поголовье 20 штук.",
    animalTypeId: 5, // Курица
    breedId: 9, // Леггорн
    gender: "female",
    birthYear: 2024,
    color: "Белая",
    weight: "2.00",
    purpose: "reproduction",
    price: "500.00",
        isNegotiable: false,
    regionId: 1,
    cityId: 2,
    address: "с. Сокулук",
    homeDelivery: true,
    pickup: true,
    vaccinated: true,
    status: "active"
  },
  {
    title: "Бройлеры на мясо",
    description: "Бройлеры 45 дней, готовы к забою. Выращены на натуральных кормах. Вес 2-2.5 кг. Партия 50 штук.",
    animalTypeId: 5,
    breedId: 10, // Бройлер
    gender: "male",
    birthYear: 2024,
    color: "Белая",
    weight: "2.20",
    purpose: "meat",
    price: "300.00",
    isNegotiable: true,
    regionId: 3,
    cityId: 4,
    address: "с. Тюп",
    pickup: true,
    butchered: true,
    organicFeed: true,
    status: "active"
  },

  // Свиньи - средние цены
  {
    title: "Поросята крупной белой породы",
    description: "Здоровые поросята 2 месяца, крупная белая порода. Быстро набирают вес, подходят для откорма. 8 поросят.",
    animalTypeId: 6, // Свинья
    breedId: 11, // Крупная белая
    gender: "male",
    birthYear: 2024,
    color: "Розовая",
    weight: "15.00",
    purpose: "meat",
    price: "4000.00",
    isNegotiable: true,
    regionId: 6, // Баткенская область
    cityId: 7, // Баткен
    address: "с. Кызыл-Кия",
    pickup: true,
    vaccinated: true,
    status: "active"
  },

  // ДОМАШНИЕ ЖИВОТНЫЕ - разные цены
  
  // Собаки - средние и высокие цены
  {
    title: "Щенки немецкой овчарки с родословной",
    description: "Чистокровные щенки немецкой овчарки, 2 месяца. Родители с отличной родословной, все документы. Щенки здоровые, активные, социализированы. Подходят для охраны и как семейные собаки.",
    animalTypeId: 7, // Собака
    breedId: 12, // Немецкая овчарка
    gender: "male",
    birthYear: 2024,
    color: "Черно-рыжая",
    weight: "8.00",
    purpose: "breeding",
    price: "25000.00",
    isNegotiable: true,
    regionId: 1,
    cityId: 1,
    address: "мкр. Джал 15-23",
    homeDelivery: true,
    vaccinated: true,
    certified: true,
    status: "active"
  },
  {
    title: "Лабрадор-ретривер, семейная собака",
    description: "Дружелюбный лабрадор, 1.5 года. Отлично ладит с детьми, обучен основным командам. Причина продажи - переезд. Все прививки сделаны, есть ветпаспорт.",
    animalTypeId: 7,
    breedId: 13, // Лабрадор
    gender: "female",
    birthYear: 2023,
    color: "Золотистая",
    weight: "28.00",
    purpose: "reproduction",
    price: "35000.00",
        isNegotiable: true,
    regionId: 2,
    cityId: 3,
    address: "ул. Курманжан Датка 67",
    pickup: true,
    vaccinated: true,
    certified: true,
    status: "active"
  },
  {
    title: "Хаски сибирский, голубые глаза",
    description: "Красивый сибирский хаски с голубыми глазами, 3 года. Очень активный, подходит для спорта. Нужен опытный владелец. Все документы в порядке.",
    animalTypeId: 7,
    breedId: 14, // Хаски
    gender: "male",
        birthYear: 2021,
    color: "Серо-белая",
    weight: "25.00",
    purpose: "reproduction",
    price: "45000.00",
    isNegotiable: false,
    regionId: 1,
    cityId: 1,
    address: "ул. Чуй 145",
    pickup: true,
    vaccinated: true,
    certified: true,
    status: "active"
  },

  // Кошки - низкие и средние цены
  {
    title: "Британские котята, плюшевые малыши",
    description: "Очаровательные британские короткошерстные котята, 2 месяца. Серого и голубого окраса. К лотку приучены, едят самостоятельно. Родители с родословной.",
    animalTypeId: 8, // Кошка
    breedId: 15, // Британская
    gender: "female",
    birthYear: 2024,
    color: "Серая",
    weight: "1.50",
    purpose: "reproduction",
    price: "15000.00",
        isNegotiable: true,
    regionId: 1,
    cityId: 2,
    address: "с. Кант, ул. Ленина 34",
    homeDelivery: true,
    vaccinated: true,
    status: "active"
  },
  {
    title: "Персидская кошка, длинношерстная красавица",
    description: "Взрослая персидская кошка, 2 года. Белоснежная, пушистая, очень ласковая. Стерилизована, привита. Подходит для квартирного содержания.",
    animalTypeId: 8,
    breedId: 16, // Персидская
    gender: "female",
    birthYear: 2022,
    color: "Белая",
    weight: "4.50",
    purpose: "reproduction",
    price: "20000.00",
        isNegotiable: true,
    regionId: 3,
    cityId: 4,
    address: "ул. Абдрахманова 89",
    pickup: true,
    vaccinated: true,
    certified: true,
    status: "active"
  },
  {
    title: "Мейн-кун котята, крупная порода",
    description: "Котята мейн-кун, 3 месяца. Будущие гиганты кошачьего мира. Здоровые, игривые, с отличным аппетитом. Родители крупные, красивые.",
    animalTypeId: 8,
    breedId: 17, // Мейн-кун
    gender: "male",
        birthYear: 2024,
    color: "Табби",
    weight: "2.00",
    purpose: "reproduction",
    price: "30000.00",
        isNegotiable: false,
    regionId: 1,
    cityId: 1,
    address: "мкр. Восток-5, дом 12",
    homeDelivery: true,
    pickup: true,
    vaccinated: true,
    certified: true,
    status: "active"
  },

  // Кролики - низкие цены
  {
    title: "Декоративные кролики, карликовые",
    description: "Милые карликовые кролики, 4 месяца. Разных окрасов: белые, серые, пятнистые. Ручные, приучены к лотку. Подходят для детей.",
    animalTypeId: 9, // Кролик
    breedId: 18, // Карликовый
    gender: "female",
    birthYear: 2024,
    color: "Разноцветная",
    weight: "1.20",
    purpose: "reproduction",
    price: "3000.00",
    isNegotiable: true,
    regionId: 4,
    cityId: 5,
    address: "ул. Ибраимова 23",
    homeDelivery: true,
    pickup: true,
    status: "active"
  },
  {
    title: "Ангорские кролики, пушистые",
    description: "Ангорские кролики с длинной шерстью, 6 месяцев. Очень красивые, пушистые. Можно стричь шерсть для рукоделия. Спокойные, ласковые.",
    animalTypeId: 9,
    breedId: 19, // Ангорский
    gender: "male",
    birthYear: 2024,
    color: "Белая",
    weight: "2.50",
    purpose: "reproduction",
    price: "5000.00",
    isNegotiable: true,
    regionId: 2,
    cityId: 3,
    address: "мкр. Ак-Орго 45",
    pickup: true,
    status: "active"
  },

  // Птицы - низкие цены
  {
    title: "Волнистые попугайчики, говорящие",
    description: "Молодые волнистые попугайчики, 6 месяцев. Некоторые уже начинают говорить. Яркие, здоровые, активные. Продаются парами и поодиночке.",
    animalTypeId: 10, // Птица
    breedId: 20, // Волнистый попугай
    gender: "male",
        birthYear: 2024,
    color: "Зеленая",
    weight: "0.05",
    purpose: "reproduction",
    price: "1500.00",
        isNegotiable: false,
    regionId: 1,
    cityId: 1,
    address: "ул. Киевская 78",
    homeDelivery: true,
    pickup: true,
    status: "active"
  },
  {
    title: "Канарейки певчие, желтые",
    description: "Канарейки-самцы с отличным пением. Ярко-желтого окраса, здоровые, активные. Поют утром и вечером. Подходят для любителей птичьего пения.",
    animalTypeId: 10,
    breedId: 21, // Канарейка
    gender: "male",
        birthYear: 2024,
    color: "Желтая",
    weight: "0.02",
    purpose: "reproduction",
    price: "2000.00",
        isNegotiable: true,
    regionId: 5,
    cityId: 6,
    address: "ул. Токтогула 156",
    pickup: true,
    status: "active"
  }
];

async function seedTestAnimals() {
  try {
    console.log('🗑️ Удаление существующих объявлений...');
    
    // Удаляем связанные данные сначала
    await db.delete(schema.animalPhotos);
    await db.delete(schema.animalVideos);
    await db.delete(schema.animalDocuments);
    await db.delete(schema.favorites);
    await db.delete(schema.messages);
    
    // Затем удаляем сами объявления
    await db.delete(schema.animals);
    
    console.log('✅ Существующие объявления удалены');
    
    console.log('🌱 Добавление тестовых объявлений...');
    
    // Получаем ID первого пользователя для привязки объявлений
    const users = await db.select().from(schema.users).limit(1);
    const userId = users[0]?.id || 1;
    
    // Добавляем тестовые объявления
    const insertedAnimals = [];
    for (const animal of testAnimals) {
      const [insertedAnimal] = await db.insert(schema.animals).values({
        ...animal,
        userId: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      insertedAnimals.push(insertedAnimal);
    }
    
    // Добавляем фотографии к объявлениям
    console.log('📸 Добавление фотографий к объявлениям...');
    
    const photoMappings = [
      // Коровы
      { animalIndex: 0, photos: ['cow-holstein-1.svg', 'placeholder-1.svg'] },
      { animalIndex: 1, photos: ['bull-breeding-3.svg', 'placeholder-1.svg'] },
      { animalIndex: 2, photos: ['cow-jersey-2.svg', 'placeholder-1.svg'] },
      
      // Овцы
      { animalIndex: 3, photos: ['sheep-flock-4.svg', 'placeholder-2.svg'] },
      { animalIndex: 4, photos: ['sheep-romanov-5.svg', 'placeholder-2.svg'] },
      
      // Козы
      { animalIndex: 5, photos: ['goat-saanen-6.svg', 'placeholder-3.svg'] },
      { animalIndex: 6, photos: ['goat-nubian-7.svg', 'placeholder-3.svg'] },
      
      // Лошади
      { animalIndex: 7, photos: ['horse-akhal-8.svg', 'placeholder-4.svg'] },
      { animalIndex: 8, photos: ['horse-kyrgyz-9.svg', 'placeholder-4.svg'] },
      
      // Куры
      { animalIndex: 9, photos: ['chicken-leghorn-10.svg', 'placeholder-5.svg'] },
      { animalIndex: 10, photos: ['chicken-broiler-11.svg', 'placeholder-5.svg'] },
      
      // Свиньи
      { animalIndex: 11, photos: ['pig-piglets-12.svg', 'placeholder-6.svg'] },
      
      // Собаки
      { animalIndex: 12, photos: ['dog-german-shepherd-13.svg', 'placeholder-7.svg'] },
      { animalIndex: 13, photos: ['dog-labrador-14.svg', 'placeholder-7.svg'] },
      { animalIndex: 14, photos: ['dog-husky-15.svg', 'placeholder-7.svg'] },
      
      // Кошки
      { animalIndex: 15, photos: ['cat-british-16.svg', 'placeholder-8.svg'] },
      { animalIndex: 16, photos: ['cat-persian-17.svg', 'placeholder-8.svg'] },
      { animalIndex: 17, photos: ['cat-maine-coon-18.svg', 'placeholder-8.svg'] },
      
      // Кролики
      { animalIndex: 18, photos: ['rabbit-dwarf-19.svg', 'placeholder-9.svg'] },
      { animalIndex: 19, photos: ['rabbit-angora-20.svg', 'placeholder-9.svg'] },
      
      // Птицы
      { animalIndex: 20, photos: ['bird-budgie-21.svg', 'placeholder-10.svg'] },
      { animalIndex: 21, photos: ['bird-canary-22.svg', 'placeholder-10.svg'] }
    ];
    
    for (const mapping of photoMappings) {
      if (insertedAnimals[mapping.animalIndex]) {
        const animalId = insertedAnimals[mapping.animalIndex].id;
        
        for (let i = 0; i < mapping.photos.length; i++) {
          const photo = mapping.photos[i];
          await db.insert(schema.animalPhotos).values({
            animalId: animalId,
            fileName: photo,
            filePath: `/uploads/${photo}`,
            isMain: i === 0, // Первая фотография - главная
            order: i,
            createdAt: new Date()
          });
        }
      }
    }
    
    console.log(`✅ Добавлено ${testAnimals.length} тестовых объявлений`);
    console.log('🎯 Тестовые данные успешно созданы!');
    
    // Показываем статистику по ценам
    console.log('\n📊 Статистика по ценам:');
    console.log('💰 Дорогие (100,000+ сом): Коровы, Лошади');
    console.log('💵 Средние (10,000-99,999 сом): Овцы, Козы, Свиньи, Собаки, Кошки');
    console.log('💸 Дешевые (до 9,999 сом): Куры, Поросята, Кролики, Птицы');
    console.log('\n🏠 Домашние животные: Собаки, Кошки, Кролики, Птицы');
    console.log('🚜 Сельхоз животные: Коровы, Овцы, Козы, Лошади, Куры, Свиньи');
    
  } catch (error) {
    console.error('❌ Ошибка при создании тестовых данных:', error);
  } finally {
    process.exit(0);
  }
}

seedTestAnimals(); 
