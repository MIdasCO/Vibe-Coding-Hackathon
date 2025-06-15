import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { eq } from 'drizzle-orm';
import ws from "ws";
import * as schema from '@shared/schema';
import { config } from 'dotenv';

// Загружаем переменные окружения из .env файла
config({ override: true });

async function seedTestAnimalsNeon() {
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

    console.log('🌱 Добавляем тестовые объявления животных в Neon...');

    // Получаем типы животных и регионы
    const animalTypes = await db.select().from(schema.animalTypes);
    const regions = await db.select().from(schema.regions);
    const cities = await db.select().from(schema.cities);

    console.log(`📊 Найдено типов животных: ${animalTypes.length}`);
    console.log(`📊 Найдено регионов: ${regions.length}`);
    console.log(`📊 Найдено городов: ${cities.length}`);

    // Создаем тестового пользователя если его нет
    let testUser;
    try {
      const existingUsers = await db.select().from(schema.users).limit(1);
      if (existingUsers.length > 0) {
        testUser = existingUsers[0];
        console.log(`👤 Используем существующего пользователя: ${testUser.email}`);
      } else {
        const newUsers = await db.insert(schema.users).values({
          email: 'test@example.com',
          firstName: 'Тестовый',
          lastName: 'Пользователь',
          phone: '+996700123456',
          password: 'test_hash',
          isVerified: true,
        }).returning();
        testUser = newUsers[0];
        console.log(`👤 Создан тестовый пользователь: ${testUser.email}`);
      }
    } catch (error) {
      console.error('❌ Ошибка при создании пользователя:', error);
      return;
    }

    // Тестовые объявления для скота
    const livestockAnimals = [
      {
        title: 'Продается молодая корова Джерси',
        description: 'Отличная молочная корова, возраст 2 года. Здоровая, привитая. Дает до 15 литров молока в день.',
        animalType: 'Cattle',
        breed: 'Jersey',
        gender: 'female' as const,
        birthYear: 2022,
        color: 'Коричневая',
        weight: 350,
        purpose: 'dairy' as const,
        price: 45000,
        isNegotiable: false,
      },
      {
        title: 'Племенной бык Голштин',
        description: 'Элитный племенной бык голштинской породы. Отличная родословная, подходит для улучшения стада.',
        animalType: 'Cattle',
        breed: 'Holstein',
        gender: 'male' as const,
        birthYear: 2021,
        color: 'Черно-белый',
        weight: 650,
        purpose: 'breeding' as const,
        price: 120000,
        isNegotiable: true,
      },
      {
        title: 'Овцы романовской породы',
        description: 'Продается стадо овец романовской породы - 15 голов. Все здоровые, привитые.',
        animalType: 'Sheep',
        breed: 'Romanov',
        gender: 'mixed' as const,
        birthYear: 2023,
        color: 'Серая',
        weight: 45,
        purpose: 'meat' as const,
        price: 25000,
        isNegotiable: true,
      },
      {
        title: 'Козы нубийской породы',
        description: 'Молочные козы нубийской породы. 3 козы и 1 козел. Отличные удои.',
        animalType: 'Goats',
        breed: 'Nubian',
        gender: 'mixed' as const,
        birthYear: 2022,
        color: 'Коричневая',
        weight: 55,
        purpose: 'dairy' as const,
        price: 35000,
        isNegotiable: false,
      },
      {
        title: 'Лошадь кыргызской породы',
        description: 'Красивая лошадь кыргызской породы, возраст 5 лет. Спокойная, подходит для верховой езды.',
        animalType: 'Horses',
        breed: 'Kyrgyz',
        gender: 'female' as const,
        birthYear: 2019,
        color: 'Гнедая',
        weight: 420,
        purpose: 'riding' as const,
        price: 80000,
        isNegotiable: true,
      },
    ];

    // Тестовые объявления для домашних животных
    const petAnimals = [
      {
        title: 'Щенки хаски ищут дом',
        description: 'Красивые щенки сибирского хаски, возраст 2 месяца. Привиты, с документами.',
        animalType: 'Dog',
        breed: 'Husky',
        gender: 'mixed' as const,
        birthYear: 2024,
        color: 'Серо-белый',
        weight: 8,
        purpose: 'companion' as const,
        price: 15000,
        isNegotiable: false,
      },
      {
        title: 'Персидская кошка',
        description: 'Красивая персидская кошка, возраст 1 год. Очень ласковая, приучена к лотку.',
        animalType: 'Cat',
        breed: 'Persian',
        gender: 'female' as const,
        birthYear: 2023,
        color: 'Белая',
        weight: 4,
        purpose: 'companion' as const,
        price: 8000,
        isNegotiable: true,
      },
      {
        title: 'Попугай волнистый',
        description: 'Молодой волнистый попугайчик, очень активный и общительный. Возраст 6 месяцев.',
        animalType: 'Bird',
        breed: 'Budgie',
        gender: 'male' as const,
        birthYear: 2024,
        color: 'Зеленый',
        weight: 0.5,
        purpose: 'companion' as const,
        price: 2000,
        isNegotiable: false,
      },
      {
        title: 'Декоративные кролики',
        description: 'Милые декоративные кролики ангорской породы. Очень пушистые и дружелюбные.',
        animalType: 'Rabbit',
        breed: 'Angora',
        gender: 'mixed' as const,
        birthYear: 2024,
        color: 'Белый',
        weight: 2,
        purpose: 'companion' as const,
        price: 3500,
        isNegotiable: true,
      },
    ];

    const allTestAnimals = [...livestockAnimals, ...petAnimals];

    // Добавляем объявления
    let addedCount = 0;
    for (const animalData of allTestAnimals) {
      try {
        // Находим тип животного
        const animalType = animalTypes.find(type => type.name === animalData.animalType);
        if (!animalType) {
          console.log(`⚠️ Тип животного не найден: ${animalData.animalType}`);
          continue;
        }

        // Выбираем случайный город
        const randomCity = cities[Math.floor(Math.random() * cities.length)];

        const newAnimal = await db.insert(schema.animals).values({
          title: animalData.title,
          description: animalData.description,
          animalTypeId: animalType.id,
          gender: animalData.gender,
          birthYear: animalData.birthYear,
          color: animalData.color,
          weight: animalData.weight.toString(),
          purpose: animalData.purpose,
          price: animalData.price.toString(),
          isNegotiable: animalData.isNegotiable,
          cityId: randomCity.id,
          regionId: randomCity.regionId,
          userId: testUser.id,
          address: 'Тестовый адрес',
          status: 'active',
          viewCount: Math.floor(Math.random() * 50),
        }).returning();

        console.log(`✅ Добавлено: ${animalData.title}`);
        addedCount++;
      } catch (error) {
        console.error(`❌ Ошибка при добавлении ${animalData.title}:`, error);
      }
    }

    console.log(`\n🎉 Успешно добавлено тестовых объявлений: ${addedCount}`);
    
    // Статистика по категориям
    const allAnimals = await db.select({
      id: schema.animals.id,
      title: schema.animals.title,
      category: schema.animalTypes.category,
      typeName: schema.animalTypes.name,
    }).from(schema.animals)
      .leftJoin(schema.animalTypes, eq(schema.animals.animalTypeId, schema.animalTypes.id));

    const livestock = allAnimals.filter(a => a.category === 'livestock');
    const pets = allAnimals.filter(a => a.category === 'pets');

    console.log(`\n📊 Статистика объявлений:`);
    console.log(`   🐄 Скот: ${livestock.length} объявлений`);
    console.log(`   🐾 Домашние животные: ${pets.length} объявлений`);
    console.log(`   📝 Всего: ${allAnimals.length} объявлений`);

    await pool.end();
    console.log('🔌 Соединение с базой данных закрыто');

  } catch (error) {
    console.error('❌ Ошибка при добавлении тестовых данных:', error);
    throw error;
  }
}

// Запуск
seedTestAnimalsNeon(); 