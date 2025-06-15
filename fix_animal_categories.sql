-- Исправляем категории типов животных
-- Домашние животные
UPDATE animal_types SET category = 'pets' WHERE name IN ('Dog', 'Cat', 'Bird', 'Rabbit', 'Hamster', 'Fish');

-- Скот (сельскохозяйственные животные)
UPDATE animal_types SET category = 'livestock' WHERE name IN ('Cattle', 'Sheep', 'Goats', 'Horses', 'Pigs', 'Poultry');

-- Обновляем категории животных на основе их типов
UPDATE animals SET category = 'pets' 
WHERE animal_type_id IN (
  SELECT id FROM animal_types WHERE category = 'pets'
);

UPDATE animals SET category = 'livestock' 
WHERE animal_type_id IN (
  SELECT id FROM animal_types WHERE category = 'livestock'
);

-- Проверяем результат
SELECT 
  at.name as animal_type,
  at.category,
  COUNT(a.id) as animals_count
FROM animal_types at
LEFT JOIN animals a ON at.id = a.animal_type_id
GROUP BY at.name, at.category
ORDER BY at.category, at.name; 