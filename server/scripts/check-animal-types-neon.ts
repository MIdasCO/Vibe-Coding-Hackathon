import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function checkAnimalTypes() {
  try {
    console.log('🔍 Проверяем типы животных в базе данных...\n');
    
    const animalTypes = await sql`
      SELECT id, name, "nameRu", "nameKy", category 
      FROM "AnimalType" 
      ORDER BY category, name
    `;
    
    console.log('📊 Найдено типов животных:', animalTypes.length);
    console.log('\n=== СКОТ (LIVESTOCK) ===');
    const livestock = animalTypes.filter(type => type.category === 'livestock');
    livestock.forEach(type => {
      console.log(`${type.id}: ${type.name} (${type.nameRu}) - ${type.nameKy}`);
    });
    
    console.log('\n=== ДОМАШНИЕ ЖИВОТНЫЕ (PETS) ===');
    const pets = animalTypes.filter(type => type.category === 'pets');
    pets.forEach(type => {
      console.log(`${type.id}: ${type.name} (${type.nameRu}) - ${type.nameKy}`);
    });
    
    console.log('\n📈 Статистика:');
    console.log(`- Скот: ${livestock.length}`);
    console.log(`- Домашние животные: ${pets.length}`);
    console.log(`- Всего: ${animalTypes.length}`);
    
  } catch (error) {
    console.error('❌ Ошибка при проверке типов животных:', error);
  }
}

checkAnimalTypes(); 