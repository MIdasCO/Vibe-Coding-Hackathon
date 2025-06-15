import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  isVerified: boolean("is_verified").default(false),
  isAdmin: boolean("is_admin").default(false),
  verificationToken: text("verification_token"),
  regionId: integer("region_id"),
  cityId: integer("city_id"),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0.00"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Regions table
export const regions = pgTable("regions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameKy: text("name_ky"),
  nameRu: text("name_ru"),
});

// Cities table
export const cities = pgTable("cities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameKy: text("name_ky"),
  nameRu: text("name_ru"),
  regionId: integer("region_id").notNull(),
});

// Animal types table
export const animalTypes = pgTable("animal_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameKy: text("name_ky"),
  nameRu: text("name_ru"),
  icon: text("icon"),
  category: text("category").default("livestock"), // 'livestock' | 'pets'
});

// Breeds table
export const breeds = pgTable("breeds", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameKy: text("name_ky"),
  nameRu: text("name_ru"),
  animalTypeId: integer("animal_type_id").notNull(),
});

// Animals table (listings)
export const animals = pgTable("animals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").default("livestock"), // 'livestock' | 'pets'
  animalTypeId: integer("animal_type_id").notNull(),
  breedId: integer("breed_id"),
  gender: text("gender").notNull(), // 'male' | 'female'
  birthYear: integer("birth_year"),
  color: text("color"),
  weight: decimal("weight", { precision: 8, scale: 2 }),
  purpose: text("purpose"), // 'breeding' | 'dairy' | 'meat' | 'reproduction'
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  isNegotiable: boolean("is_negotiable").default(false),
  regionId: integer("region_id").notNull(),
  cityId: integer("city_id").notNull(),
  address: text("address").notNull(),
  homeDelivery: boolean("home_delivery").default(false),
  pickup: boolean("pickup").default(false),
  butchered: boolean("butchered").default(false),
  vaccinated: boolean("vaccinated").default(false),
  certified: boolean("certified").default(false),
  organicFeed: boolean("organic_feed").default(false),
  status: text("status").default("pending"), // 'pending' | 'active' | 'inactive' | 'sold' | 'rejected'
  viewCount: integer("view_count").default(0),
  isPromoted: boolean("is_promoted").default(false),
  promotedUntil: timestamp("promoted_until"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Animal photos table
export const animalPhotos = pgTable("animal_photos", {
  id: serial("id").primaryKey(),
  animalId: integer("animal_id").notNull(),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  isMain: boolean("is_main").default(false),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Animal videos table
export const animalVideos = pgTable("animal_videos", {
  id: serial("id").primaryKey(),
  animalId: integer("animal_id").notNull(),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Animal documents table
export const animalDocuments = pgTable("animal_documents", {
  id: serial("id").primaryKey(),  
  animalId: integer("animal_id").notNull(),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  documentType: text("document_type"), // 'passport' | 'veterinary' | 'pedigree'
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Messages table
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  fromUserId: integer("from_user_id").notNull(),
  toUserId: integer("to_user_id").notNull(),
  animalId: integer("animal_id"),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Favorites table
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  animalId: integer("animal_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Transactions table
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  type: text("type").notNull(), // 'credit' | 'debit'
  description: text("description"),
  status: text("status").default("completed"), // 'pending' | 'completed' | 'failed'
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const userRelations = relations(users, ({ one, many }) => ({
  region: one(regions, {
    fields: [users.regionId],
    references: [regions.id],
  }),
  city: one(cities, {
    fields: [users.cityId],
    references: [cities.id],
  }),
  animals: many(animals),
  sentMessages: many(messages, { relationName: "sentMessages" }),
  receivedMessages: many(messages, { relationName: "receivedMessages" }),
  favorites: many(favorites),
  transactions: many(transactions),
}));

export const regionRelations = relations(regions, ({ many }) => ({
  cities: many(cities),
  users: many(users),
  animals: many(animals),
}));

export const cityRelations = relations(cities, ({ one, many }) => ({
  region: one(regions, {
    fields: [cities.regionId],
    references: [regions.id],
  }),
  users: many(users),
  animals: many(animals),
}));

export const animalTypeRelations = relations(animalTypes, ({ many }) => ({
  breeds: many(breeds),
  animals: many(animals),
}));

export const breedRelations = relations(breeds, ({ one, many }) => ({
  animalType: one(animalTypes, {
    fields: [breeds.animalTypeId],
    references: [animalTypes.id],
  }),
  animals: many(animals),
}));

export const animalRelations = relations(animals, ({ one, many }) => ({
  user: one(users, {
    fields: [animals.userId],
    references: [users.id],
  }),
  animalType: one(animalTypes, {
    fields: [animals.animalTypeId],
    references: [animalTypes.id],
  }),
  breed: one(breeds, {
    fields: [animals.breedId],
    references: [breeds.id],
  }),
  region: one(regions, {
    fields: [animals.regionId],
    references: [regions.id],
  }),
  city: one(cities, {
    fields: [animals.cityId],
    references: [cities.id],
  }),
  photos: many(animalPhotos),
  videos: many(animalVideos),
  documents: many(animalDocuments),
  messages: many(messages),
  favorites: many(favorites),
}));

export const animalPhotoRelations = relations(animalPhotos, ({ one }) => ({
  animal: one(animals, {
    fields: [animalPhotos.animalId],
    references: [animals.id],
  }),
}));

export const animalVideoRelations = relations(animalVideos, ({ one }) => ({
  animal: one(animals, {
    fields: [animalVideos.animalId],
    references: [animals.id],
  }),
}));

export const animalDocumentRelations = relations(animalDocuments, ({ one }) => ({
  animal: one(animals, {
    fields: [animalDocuments.animalId],
    references: [animals.id],
  }),
}));

export const messageRelations = relations(messages, ({ one }) => ({
  fromUser: one(users, {
    fields: [messages.fromUserId],
    references: [users.id],
    relationName: "sentMessages",
  }),
  toUser: one(users, {
    fields: [messages.toUserId],
    references: [users.id],
    relationName: "receivedMessages",
  }),
  animal: one(animals, {
    fields: [messages.animalId],
    references: [animals.id],
  }),
}));

export const favoriteRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  animal: one(animals, {
    fields: [favorites.animalId],
    references: [animals.id],
  }),
}));

export const transactionRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  regionId: z.number().optional(),
  cityId: z.number().optional(),
  isVerified: z.boolean().default(false),
  isAdmin: z.boolean().default(false),
  verificationToken: z.string().optional(),
  balance: z.string().default("0.00"),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAnimalSchema = createInsertSchema(animals, {
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.enum(['livestock', 'pets']).default('livestock'),
  animalTypeId: z.number(),
  breedId: z.number().optional(),
  gender: z.enum(['male', 'female']),
  birthYear: z.number().optional(),
  color: z.string().optional(),
  weight: z.string().optional(),
  purpose: z.enum(['breeding', 'dairy', 'meat', 'reproduction']).optional(),
  price: z.string(),
  isNegotiable: z.boolean().default(false),
  regionId: z.number(),
  cityId: z.number(),
  address: z.string(),
  homeDelivery: z.boolean().default(false),
  pickup: z.boolean().default(false),
  butchered: z.boolean().default(false),
  vaccinated: z.boolean().default(false),
  certified: z.boolean().default(false),
  organicFeed: z.boolean().default(false),
  status: z.enum(['pending', 'active', 'inactive', 'sold', 'rejected']).default('pending'),
}).omit({
  id: true,
  userId: true,
  viewCount: true,
  isPromoted: true,
  promotedUntil: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAnimalPhotoSchema = createInsertSchema(animalPhotos, {
  animalId: z.number(),
  fileName: z.string(),
  filePath: z.string(),
  isMain: z.boolean().default(false),
  order: z.number().default(0),
}).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages, {
  fromUserId: z.number(),
  toUserId: z.number(),
  animalId: z.number().optional(),
  content: z.string().min(1),
  isRead: z.boolean().default(false),
}).omit({
  id: true,
  createdAt: true,
});

export const insertFavoriteSchema = createInsertSchema(favorites, {
  userId: z.number(),
  animalId: z.number(),
}).omit({
  id: true,
  createdAt: true,
});

// Select types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Animal = typeof animals.$inferSelect;
export type InsertAnimal = z.infer<typeof insertAnimalSchema>;
export type AnimalPhoto = typeof animalPhotos.$inferSelect;
export type AnimalVideo = typeof animalVideos.$inferSelect;
export type AnimalDocument = typeof animalDocuments.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Region = typeof regions.$inferSelect;
export type City = typeof cities.$inferSelect;
export type AnimalType = typeof animalTypes.$inferSelect;
export type Breed = typeof breeds.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
