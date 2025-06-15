-- Скрипт для очистки всех объявлений и связанных данных
-- ВНИМАНИЕ: Этот скрипт удалит ВСЕ объявления!

-- Удаляем связанные данные сначала
DELETE FROM animal_photos;
DELETE FROM animal_videos;
DELETE FROM animal_documents;
DELETE FROM favorites;
DELETE FROM messages WHERE animal_id IS NOT NULL;

-- Удаляем сами объявления
DELETE FROM animals;

-- Сбрасываем счетчики ID (опционально)
ALTER SEQUENCE animals_id_seq RESTART WITH 1;
ALTER SEQUENCE animal_photos_id_seq RESTART WITH 1;
ALTER SEQUENCE animal_videos_id_seq RESTART WITH 1;
ALTER SEQUENCE animal_documents_id_seq RESTART WITH 1;
ALTER SEQUENCE favorites_id_seq RESTART WITH 1;

-- Показываем результат
SELECT 'Все объявления удалены!' as result; 