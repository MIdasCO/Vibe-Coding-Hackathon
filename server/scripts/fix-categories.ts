import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { animalTypes, animals } from '../../shared/schema';
import { eq, inArray } from 'drizzle-orm';

// Database setup
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

async function fixCategories() {
  try {
    console.log('🔧 Исправляем категории животных...');

    // Обновляем типы домашних животных
    console.log('📝 Обновляем типы домашних животных...');
    const petTypes = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Hamster', 'Fish'];
    const petsResult = await db
      .update(animalTypes)
      .set({ category: 'pets' as const })
      .where(inArray(animalTypes.name, petTypes));
    
    console.log(`✅ Обновлено ${petsResult.rowCount || 0} типов домашних животных`);

    // Получаем ID типов домашних животных
    const petTypeIds = await db
      .select({ id: animalTypes.id })
      .from(animalTypes)
      .where(eq(animalTypes.category, 'pets'));

    // Обновляем категории животных на основе их типов
    if (petTypeIds.length > 0) {
      console.log('📝 Обновляем категории животных (домашние)...');
      const updatedPets = await db
        .update(animals)
        .set({ category: 'pets' })
        .where(inArray(animals.animalTypeId, petTypeIds.map(t => t.id)))
        .returning({ id: animals.id });
      
      console.log(`✅ Обновлено ${updatedPets.length} домашних животных`);
    }

    // Определяем типы скота
    const livestockTypes = ['Cattle', 'Sheep', 'Goats', 'Horses', 'Pigs', 'Poultry'];
    
    console.log('🐄 Обновляем типы скота...');
    const livestockResult = await db
      .update(animalTypes)
      .set({ category: 'livestock' as const })
      .where(inArray(animalTypes.name, livestockTypes));

    // Получаем ID типов сельскохозяйственных животных
    const livestockTypeIds = await db
      .select({ id: animalTypes.id })
      .from(animalTypes)
      .where(eq(animalTypes.category, 'livestock'));

    if (livestockTypeIds.length > 0) {
      console.log('📝 Обновляем категории животных (скот)...');
      const updatedLivestock = await db
        .update(animals)
        .set({ category: 'livestock' })
        .where(inArray(animals.animalTypeId, livestockTypeIds.map(t => t.id)))
        .returning({ id: animals.id });
      
      console.log(`✅ Обновлено ${updatedLivestock.length} сельскохозяйственных животных`);
    }

    // Проверяем результат
    console.log('📊 Проверяем результат...');
    const result = await db
      .select({
        name: animalTypes.name,
        category: animalTypes.category,
      })
      .from(animalTypes)
      .orderBy(animalTypes.category, animalTypes.name);

    console.log('\n📋 Типы животных по категориям:');
    let currentCategory = '';
    for (const type of result) {
      if (type.category !== currentCategory) {
        currentCategory = type.category || 'undefined';
        console.log(`\n🏷️ ${currentCategory.toUpperCase()}:`);
      }
      console.log(`  - ${type.name}`);
    }

    console.log('\n✅ Категории животных успешно исправлены!');
  } catch (error) {
    console.error('❌ Ошибка при исправлении категорий:', error);
    process.exit(1);
  }
}

fixCategories(); 
