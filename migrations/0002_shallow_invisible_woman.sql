ALTER TABLE "animal_types" ADD COLUMN "category" text DEFAULT 'livestock';--> statement-breakpoint
ALTER TABLE "animals" ADD COLUMN "pickup" boolean DEFAULT false;