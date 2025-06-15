-- Обновляем существующие типы животных чтобы добавить категорию livestock
UPDATE animal_types SET category = 'livestock' WHERE category IS NULL;

-- Добавляем новые типы домашних животных
INSERT INTO animal_types (name, name_ru, name_ky, icon, category) VALUES 
('Dog', 'Собака', 'Ит', '🐕', 'pets'),
('Cat', 'Кошка', 'Мышык', '🐱', 'pets'),
('Bird', 'Птица', 'Канат', '🐦', 'pets'),
('Rabbit', 'Кролик', 'Коён', '🐰', 'pets'),
('Hamster', 'Хомяк', 'Хомяк', '🐹', 'pets'),
('Fish', 'Рыба', 'Балык', '🐠', 'pets')
ON CONFLICT (name) DO NOTHING;

-- Добавляем породы для собак
INSERT INTO breeds (name, name_ru, name_ky, animal_type_id) VALUES 
('Labrador', 'Лабрадор', 'Лабрадор', (SELECT id FROM animal_types WHERE name = 'Dog')),
('German Shepherd', 'Немецкая овчарка', 'Немец көчмөнү', (SELECT id FROM animal_types WHERE name = 'Dog')),
('Golden Retriever', 'Золотистый ретривер', 'Алтын ретривер', (SELECT id FROM animal_types WHERE name = 'Dog')),
('Bulldog', 'Бульдог', 'Бульдог', (SELECT id FROM animal_types WHERE name = 'Dog')),
('Poodle', 'Пудель', 'Пудель', (SELECT id FROM animal_types WHERE name = 'Dog')),
('Mixed Breed', 'Метис', 'Аралаш тукум', (SELECT id FROM animal_types WHERE name = 'Dog'))
ON CONFLICT (name, animal_type_id) DO NOTHING;

-- Добавляем породы для кошек
INSERT INTO breeds (name, name_ru, name_ky, animal_type_id) VALUES 
('Persian', 'Персидская', 'Перс мышыгы', (SELECT id FROM animal_types WHERE name = 'Cat')),
('Siamese', 'Сиамская', 'Сиам мышыгы', (SELECT id FROM animal_types WHERE name = 'Cat')),
('Maine Coon', 'Мейн-кун', 'Мейн-кун', (SELECT id FROM animal_types WHERE name = 'Cat')),
('British Shorthair', 'Британская короткошерстная', 'Британ кыска жүндүү', (SELECT id FROM animal_types WHERE name = 'Cat')),
('Russian Blue', 'Русская голубая', 'Орус көк', (SELECT id FROM animal_types WHERE name = 'Cat')),
('Mixed Breed', 'Метис', 'Аралаш тукум', (SELECT id FROM animal_types WHERE name = 'Cat'))
ON CONFLICT (name, animal_type_id) DO NOTHING;

-- Добавляем породы для птиц
INSERT INTO breeds (name, name_ru, name_ky, animal_type_id) VALUES 
('Parrot', 'Попугай', 'Тоту', (SELECT id FROM animal_types WHERE name = 'Bird')),
('Canary', 'Канарейка', 'Канарейка', (SELECT id FROM animal_types WHERE name = 'Bird')),
('Budgie', 'Волнистый попугайчик', 'Толкундуу тоту', (SELECT id FROM animal_types WHERE name = 'Bird')),
('Cockatiel', 'Корелла', 'Корелла', (SELECT id FROM animal_types WHERE name = 'Bird'))
ON CONFLICT (name, animal_type_id) DO NOTHING; 