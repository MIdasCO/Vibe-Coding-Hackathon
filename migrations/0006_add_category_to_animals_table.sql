-- Добавляем поле category в таблицу animals
ALTER TABLE animals ADD COLUMN category TEXT DEFAULT 'livestock';

-- Обновляем категории на основе типов животных
UPDATE animals 
SET category = animal_types.category 
FROM animal_types 
WHERE animals.animal_type_id = animal_types.id; 