-- Seed regions of Kyrgyzstan
INSERT INTO "Region" ("name", "nameRu", "nameKg") VALUES
    ('Bishkek', 'Бишкек', 'Бишкек'),
    ('Osh', 'Ош', 'Ош'),
    ('Chuy', 'Чуйская область', 'Чүй облусу'),
    ('Osh Region', 'Ошская область', 'Ош облусу'),
    ('Jalal-Abad', 'Джалал-Абадская область', 'Жалал-Абад облусу'),
    ('Issyk-Kul', 'Иссык-Кульская область', 'Ысык-Көл облусу'),
    ('Naryn', 'Нарынская область', 'Нарын облусу'),
    ('Talas', 'Таласская область', 'Талас облусу'),
    ('Batken', 'Баткенская область', 'Баткен облусу');

-- Seed cities for each region
-- Bishkek
INSERT INTO "City" ("name", "nameRu", "nameKg", "regionId") VALUES
    ('Bishkek', 'Бишкек', 'Бишкек', (SELECT id FROM "Region" WHERE name = 'Bishkek'));

-- Osh
INSERT INTO "City" ("name", "nameRu", "nameKg", "regionId") VALUES
    ('Osh', 'Ош', 'Ош', (SELECT id FROM "Region" WHERE name = 'Osh'));

-- Chuy Region
INSERT INTO "City" ("name", "nameRu", "nameKg", "regionId") VALUES
    ('Tokmok', 'Токмок', 'Токмок'),
    ('Kant', 'Кант', 'Кант'),
    ('Kara-Balta', 'Кара-Балта', 'Кара-Балта'),
    ('Taraz', 'Тараз', 'Тараз')
    ON CONFLICT DO NOTHING;

-- Osh Region
INSERT INTO "City" ("name", "nameRu", "nameKg", "regionId") VALUES
    ('Uzgen', 'Узген', 'Үзөң'),
    ('Kara-Suu', 'Кара-Суу', 'Кара-Суу'),
    ('Nookat', 'Ноокат', 'Ноокат')
    ON CONFLICT DO NOTHING;

-- Jalal-Abad Region
INSERT INTO "City" ("name", "nameRu", "nameKg", "regionId") VALUES
    ('Jalal-Abad', 'Джалал-Абад', 'Жалал-Абад'),
    ('Tash-Komur', 'Таш-Кумыр', 'Таш-Көмүр'),
    ('Kerben', 'Кербен', 'Кербен')
    ON CONFLICT DO NOTHING;

-- Issyk-Kul Region
INSERT INTO "City" ("name", "nameRu", "nameKg", "regionId") VALUES
    ('Karakol', 'Каракол', 'Каракол'),
    ('Balykchy', 'Балыкчы', 'Балыкчы'),
    ('Cholpon-Ata', 'Чолпон-Ата', 'Чолпон-Ата')
    ON CONFLICT DO NOTHING;

-- Naryn Region
INSERT INTO "City" ("name", "nameRu", "nameKg", "regionId") VALUES
    ('Naryn', 'Нарын', 'Нарын'),
    ('At-Bashi', 'Ат-Баши', 'Ат-Баши'),
    ('Ak-Talaa', 'Ак-Талаа', 'Ак-Талаа')
    ON CONFLICT DO NOTHING;

-- Talas Region
INSERT INTO "City" ("name", "nameRu", "nameKg", "regionId") VALUES
    ('Talas', 'Талас', 'Талас'),
    ('Manas', 'Манас', 'Манас'),
    ('Pokrovka', 'Покровка', 'Покровка')
    ON CONFLICT DO NOTHING;

-- Batken Region
INSERT INTO "City" ("name", "nameRu", "nameKg", "regionId") VALUES
    ('Batken', 'Баткен', 'Баткен'),
    ('Kyzyl-Kiya', 'Кызыл-Кия', 'Кызыл-Кыя'),
    ('Sulukta', 'Сулюкта', 'Сулюкта')
    ON CONFLICT DO NOTHING;

-- Update regionId for cities
UPDATE "City" SET "regionId" = (SELECT id FROM "Region" WHERE name = 'Chuy') 
WHERE name IN ('Tokmok', 'Kant', 'Kara-Balta', 'Taraz');

UPDATE "City" SET "regionId" = (SELECT id FROM "Region" WHERE name = 'Osh Region') 
WHERE name IN ('Uzgen', 'Kara-Suu', 'Nookat');

UPDATE "City" SET "regionId" = (SELECT id FROM "Region" WHERE name = 'Jalal-Abad') 
WHERE name IN ('Jalal-Abad', 'Tash-Komur', 'Kerben');

UPDATE "City" SET "regionId" = (SELECT id FROM "Region" WHERE name = 'Issyk-Kul') 
WHERE name IN ('Karakol', 'Balykchy', 'Cholpon-Ata');

UPDATE "City" SET "regionId" = (SELECT id FROM "Region" WHERE name = 'Naryn') 
WHERE name IN ('Naryn', 'At-Bashi', 'Ak-Talaa');

UPDATE "City" SET "regionId" = (SELECT id FROM "Region" WHERE name = 'Talas') 
WHERE name IN ('Talas', 'Manas', 'Pokrovka');

UPDATE "City" SET "regionId" = (SELECT id FROM "Region" WHERE name = 'Batken') 
WHERE name IN ('Batken', 'Kyzyl-Kiya', 'Sulukta'); 