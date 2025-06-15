-- Обновляем категорию для типа животного "Dog" на "pets" если еще не обновлено
UPDATE animal_types SET category = 'pets' WHERE name = 'Dog' AND category != 'pets';

-- Обновляем категорию для всех животных типа "Dog" на "pets"
UPDATE animals SET category = 'pets' 
WHERE animal_type_id IN (
  SELECT id FROM animal_types WHERE name = 'Dog'
);

-- Также обновляем другие типы домашних животных если они еще не в правильной категории
UPDATE animal_types SET category = 'pets' WHERE name IN ('Cat', 'Bird', 'Rabbit', 'Hamster', 'Fish') AND category != 'pets';

-- Обновляем категорию для всех животных этих типов
UPDATE animals SET category = 'pets' 
WHERE animal_type_id IN (
  SELECT id FROM animal_types WHERE name IN ('Cat', 'Bird', 'Rabbit', 'Hamster', 'Fish')
); 