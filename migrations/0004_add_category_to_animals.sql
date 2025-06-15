-- Add category field to animals table
ALTER TABLE "animals" ADD COLUMN "category" text DEFAULT 'livestock';

-- Update existing animals based on their animal type
UPDATE animals SET category = 'pets' 
WHERE animal_type_id IN (
  SELECT id FROM animal_types WHERE category = 'pets'
);

UPDATE animals SET category = 'livestock' 
WHERE animal_type_id IN (
  SELECT id FROM animal_types WHERE category = 'livestock'
); 