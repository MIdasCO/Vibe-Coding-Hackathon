import 'dotenv/config';
import { db } from '../db.js';
import { regions, cities, animalTypes, breeds } from '@shared/schema.js';

const regionsData = [
  { name: 'Bishkek', nameKy: 'Бишкек', nameRu: 'Бишкек' },
  { name: 'Osh', nameKy: 'Ош', nameRu: 'Ош' },
  { name: 'Chuy', nameKy: 'Чүй', nameRu: 'Чуй' },
  { name: 'Jalal-Abad', nameKy: 'Жалал-Абад', nameRu: 'Джалал-Абад' },
  { name: 'Osh Region', nameKy: 'Ош облусу', nameRu: 'Ошская область' },
  { name: 'Batken', nameKy: 'Баткен', nameRu: 'Баткен' },
  { name: 'Talas', nameKy: 'Талас', nameRu: 'Талас' },
  { name: 'Naryn', nameKy: 'Нарын', nameRu: 'Нарын' },
  { name: 'Issyk-Kul', nameKy: 'Ысык-Көл', nameRu: 'Иссык-Куль' }
];

const citiesData = [
  // Bishkek
  { name: 'Bishkek', nameKy: 'Бишкек', nameRu: 'Бишкек', regionName: 'Bishkek' },
  
  // Osh
  { name: 'Osh', nameKy: 'Ош', nameRu: 'Ош', regionName: 'Osh' },
  
  // Chuy
  { name: 'Tokmok', nameKy: 'Токмок', nameRu: 'Токмак', regionName: 'Chuy' },
  { name: 'Kant', nameKy: 'Кант', nameRu: 'Кант', regionName: 'Chuy' },
  { name: 'Kemin', nameKy: 'Кемин', nameRu: 'Кемин', regionName: 'Chuy' },
  { name: 'Shopokov', nameKy: 'Шопоков', nameRu: 'Шопоков', regionName: 'Chuy' },
  
  // Jalal-Abad
  { name: 'Jalal-Abad', nameKy: 'Жалал-Абад', nameRu: 'Джалал-Абад', regionName: 'Jalal-Abad' },
  { name: 'Kara-Kul', nameKy: 'Кара-Көл', nameRu: 'Кара-Куль', regionName: 'Jalal-Abad' },
  { name: 'Mailuu-Suu', nameKy: 'Майлуу-Суу', nameRu: 'Майлуу-Суу', regionName: 'Jalal-Abad' },
  { name: 'Tash-Kumyr', nameKy: 'Таш-Көмүр', nameRu: 'Таш-Кумыр', regionName: 'Jalal-Abad' },
  
  // Osh Region
  { name: 'Uzgen', nameKy: 'Өзгөн', nameRu: 'Узген', regionName: 'Osh Region' },
  { name: 'Kara-Suu', nameKy: 'Кара-Суу', nameRu: 'Кара-Суу', regionName: 'Osh Region' },
  { name: 'Nookat', nameKy: 'Ноокат', nameRu: 'Ноокат', regionName: 'Osh Region' },
  { name: 'Aravan', nameKy: 'Араван', nameRu: 'Араван', regionName: 'Osh Region' },
  
  // Batken
  { name: 'Batken', nameKy: 'Баткен', nameRu: 'Баткен', regionName: 'Batken' },
  { name: 'Sulukta', nameKy: 'Сулукта', nameRu: 'Сулюкта', regionName: 'Batken' },
  { name: 'Kyzyl-Kiya', nameKy: 'Кызыл-Кыя', nameRu: 'Кызыл-Кия', regionName: 'Batken' },
  
  // Talas
  { name: 'Talas', nameKy: 'Талас', nameRu: 'Талас', regionName: 'Talas' },
  { name: 'Kara-Buura', nameKy: 'Кара-Буура', nameRu: 'Кара-Буура', regionName: 'Talas' },
  
  // Naryn
  { name: 'Naryn', nameKy: 'Нарын', nameRu: 'Нарын', regionName: 'Naryn' },
  { name: 'At-Bashy', nameKy: 'Ат-Башы', nameRu: 'Ат-Баши', regionName: 'Naryn' },
  
  // Issyk-Kul
  { name: 'Karakol', nameKy: 'Каракол', nameRu: 'Каракол', regionName: 'Issyk-Kul' },
  { name: 'Balykchy', nameKy: 'Балыкчы', nameRu: 'Балыкчи', regionName: 'Issyk-Kul' },
  { name: 'Cholpon-Ata', nameKy: 'Чолпон-Ата', nameRu: 'Чолпон-Ата', regionName: 'Issyk-Kul' }
];

const animalTypesData = [
  { name: 'Cattle', nameKy: 'Уй', nameRu: 'Крупный рогатый скот', icon: '🐄' },
  { name: 'Sheep', nameKy: 'Кой', nameRu: 'Овцы', icon: '🐑' },
  { name: 'Goats', nameKy: 'Эчки', nameRu: 'Козы', icon: '🐐' },
  { name: 'Horses', nameKy: 'Жылкы', nameRu: 'Лошади', icon: '🐎' },
  { name: 'Pigs', nameKy: 'Чочко', nameRu: 'Свиньи', icon: '🐷' },
  { name: 'Poultry', nameKy: 'Канаттуулар', nameRu: 'Птица', icon: '🐔' },
  { name: 'Rabbits', nameKy: 'Коён', nameRu: 'Кролики', icon: '🐰' }
];

const breedsData = [
  // Cattle breeds
  { name: 'Holstein', nameKy: 'Голштин', nameRu: 'Голштинская', animalTypeName: 'Cattle' },
  { name: 'Jersey', nameKy: 'Жерси', nameRu: 'Джерсейская', animalTypeName: 'Cattle' },
  { name: 'Angus', nameKy: 'Ангус', nameRu: 'Ангусская', animalTypeName: 'Cattle' },
  { name: 'Simmental', nameKy: 'Симментал', nameRu: 'Симментальская', animalTypeName: 'Cattle' },
  
  // Sheep breeds
  { name: 'Merino', nameKy: 'Мерино', nameRu: 'Мериносовая', animalTypeName: 'Sheep' },
  { name: 'Karakul', nameKy: 'Каракөл', nameRu: 'Каракульская', animalTypeName: 'Sheep' },
  { name: 'Romanov', nameKy: 'Романов', nameRu: 'Романовская', animalTypeName: 'Sheep' },
  
  // Goat breeds
  { name: 'Saanen', nameKy: 'Заанен', nameRu: 'Зааненская', animalTypeName: 'Goats' },
  { name: 'Nubian', nameKy: 'Нубия', nameRu: 'Нубийская', animalTypeName: 'Goats' },
  { name: 'Boer', nameKy: 'Боер', nameRu: 'Бурская', animalTypeName: 'Goats' },
  
  // Horse breeds
  { name: 'Kyrgyz', nameKy: 'Кыргыз ат', nameRu: 'Киргизская', animalTypeName: 'Horses' },
  { name: 'Arabian', nameKy: 'Араб ат', nameRu: 'Арабская', animalTypeName: 'Horses' },
  { name: 'Thoroughbred', nameKy: 'Асыл тукум', nameRu: 'Чистокровная верховая', animalTypeName: 'Horses' }
];

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Insert regions
    console.log('Seeding regions...');
    const insertedRegions = await db.insert(regions).values(regionsData).returning();
    console.log(`✓ Inserted ${insertedRegions.length} regions`);

    // Create region name to ID mapping
    const regionMap = new Map<string, number>();
    insertedRegions.forEach((region: { name: string; id: number }) => {
      regionMap.set(region.name, region.id);
    });

    // Insert cities with region IDs
    console.log('Seeding cities...');
    const citiesWithRegionIds = citiesData.map(city => ({
      name: city.name,
      nameKy: city.nameKy,
      nameRu: city.nameRu,
      regionId: regionMap.get(city.regionName)!
    }));
    
    const insertedCities = await db.insert(cities).values(citiesWithRegionIds).returning();
    console.log(`✓ Inserted ${insertedCities.length} cities`);

    // Insert animal types
    console.log('Seeding animal types...');
    const insertedAnimalTypes = await db.insert(animalTypes).values(animalTypesData).returning();
    console.log(`✓ Inserted ${insertedAnimalTypes.length} animal types`);

    // Create animal type name to ID mapping
    const animalTypeMap = new Map<string, number>();
    insertedAnimalTypes.forEach((type: { name: string; id: number }) => {
      animalTypeMap.set(type.name, type.id);
    });

    // Insert breeds with animal type IDs
    console.log('Seeding breeds...');
    const breedsWithTypeIds = breedsData.map(breed => ({
      name: breed.name,
      nameKy: breed.nameKy,
      nameRu: breed.nameRu,
      animalTypeId: animalTypeMap.get(breed.animalTypeName)!
    }));
    
    const insertedBreeds = await db.insert(breeds).values(breedsWithTypeIds).returning();
    console.log(`✓ Inserted ${insertedBreeds.length} breeds`);

    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase(); 