import {
  users,
  animals,
  animalPhotos,
  animalVideos,
  animalDocuments,
  messages,
  favorites,
  regions,
  cities,
  animalTypes,
  breeds,
  transactions,
  type User,
  type InsertUser,
  type Animal,
  type InsertAnimal,
  type AnimalPhoto,
  type Message,
  type InsertMessage,
  type Favorite,
  type InsertFavorite,
  type Region,
  type City,
  type AnimalType,
  type Breed,
  type Transaction,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, like, gte, lte, inArray, sql, count } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;
  verifyUser(email: string): Promise<boolean>;

  // Animal operations
  getAnimal(id: number): Promise<Animal | undefined>;
  getAnimalWithDetails(id: number): Promise<any>;
  createAnimal(animal: InsertAnimal & { userId: number }): Promise<Animal>;
  updateAnimal(id: number, updates: Partial<InsertAnimal>): Promise<Animal | undefined>;
  deleteAnimal(id: number): Promise<boolean>;
  getUserAnimals(userId: number): Promise<Animal[]>;
  searchAnimals(filters: any, limit?: number, offset?: number): Promise<{ animals: any[]; total: number }>;
  incrementViewCount(id: number): Promise<void>;

  // Photo operations
  addAnimalPhoto(animalId: number, fileName: string, filePath: string, isMain?: boolean): Promise<AnimalPhoto>;
  getAnimalPhotos(animalId: number): Promise<AnimalPhoto[]>;
  deleteAnimalPhoto(id: number): Promise<boolean>;

  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getConversation(user1Id: number, user2Id: number, animalId?: number): Promise<Message[]>;
  getUserMessages(userId: number): Promise<Message[]>;
  markMessageRead(id: number): Promise<boolean>;

  // Favorite operations
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(userId: number, animalId: number): Promise<boolean>;
  getUserFavorites(userId: number): Promise<any[]>;
  isFavorite(userId: number, animalId: number): Promise<boolean>;

  // Reference data operations
  getRegions(): Promise<Region[]>;
  getCities(regionId?: number): Promise<City[]>;
  getAnimalTypes(category?: string): Promise<AnimalType[]>;
  getBreeds(animalTypeId?: number): Promise<Breed[]>;

  // Transaction operations
  createTransaction(userId: number, amount: string, type: 'credit' | 'debit', description: string): Promise<Transaction>;
  getUserTransactions(userId: number): Promise<Transaction[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async verifyUser(email: string): Promise<boolean> {
    const [user] = await db
      .update(users)
      .set({ isVerified: true, verificationToken: null, updatedAt: new Date() })
      .where(eq(users.email, email))
      .returning();
    return !!user;
  }

  // Animal operations
  async getAnimal(id: number): Promise<Animal | undefined> {
    const [animal] = await db.select().from(animals).where(eq(animals.id, id));
    return animal;
  }

  async getAnimalWithDetails(id: number): Promise<any> {
    const result = await db
      .select({
        animal: animals,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          phone: users.phone,
          email: users.email,
        },
        animalType: animalTypes,
        breed: breeds,
        region: regions,
        city: cities,
      })
      .from(animals)
      .leftJoin(users, eq(animals.userId, users.id))
      .leftJoin(animalTypes, eq(animals.animalTypeId, animalTypes.id))
      .leftJoin(breeds, eq(animals.breedId, breeds.id))
      .leftJoin(regions, eq(animals.regionId, regions.id))
      .leftJoin(cities, eq(animals.cityId, cities.id))
      .where(eq(animals.id, id));

    if (!result[0]) return undefined;

    const photos = await this.getAnimalPhotos(id);
    
    return {
      ...result[0],
      photos,
    };
  }

  async createAnimal(animalData: InsertAnimal & { userId: number }): Promise<Animal> {
    const [animal] = await db
      .insert(animals)
      .values({
        ...animalData,
        status: 'active' // Set status as active by default
      })
      .returning();
    return animal;
  }

  async updateAnimal(id: number, updates: Partial<InsertAnimal>): Promise<Animal | undefined> {
    const [animal] = await db
      .update(animals)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(animals.id, id))
      .returning();
    return animal;
  }

  async deleteAnimal(id: number): Promise<boolean> {
    // First delete associated favorites
    await db.delete(favorites).where(eq(favorites.animalId, id));
    
    // Then delete the animal
    const [animal] = await db.delete(animals).where(eq(animals.id, id)).returning();
    return !!animal;
  }

  async getUserAnimals(userId: number): Promise<Animal[]> {
    return await db
      .select()
      .from(animals)
      .where(eq(animals.userId, userId))
      .orderBy(desc(animals.createdAt));
  }

  async searchAnimals(filters: any = {}, limit = 12, offset = 0): Promise<{ animals: any[]; total: number }> {
    // Apply filters
    const conditions = [];

    // Only show active listings by default, unless a specific status is requested
    if (filters.status) {
      conditions.push(eq(animals.status, filters.status));
    } else {
      conditions.push(eq(animals.status, 'active'));
    }

    if (filters.animalTypeId) {
      conditions.push(eq(animals.animalTypeId, filters.animalTypeId));
    }
    
    // Поддержка массива типов животных
    if (filters.animalTypeIds && Array.isArray(filters.animalTypeIds) && filters.animalTypeIds.length > 0) {
      conditions.push(inArray(animals.animalTypeId, filters.animalTypeIds));
    }
    
    if (filters.breedId) {
      conditions.push(eq(animals.breedId, filters.breedId));
    }

    // Поддержка массива пород
    if (filters.breedIds && Array.isArray(filters.breedIds) && filters.breedIds.length > 0) {
      conditions.push(inArray(animals.breedId, filters.breedIds));
    }
    if (filters.regionId) {
      conditions.push(eq(animals.regionId, filters.regionId));
    }
    if (filters.cityId) {
      conditions.push(eq(animals.cityId, filters.cityId));
    }
    if (filters.gender) {
      conditions.push(eq(animals.gender, filters.gender));
    }
    if (filters.minPrice) {
      conditions.push(gte(animals.price, filters.minPrice));
    }
    if (filters.maxPrice) {
      conditions.push(lte(animals.price, filters.maxPrice));
    }
    if (filters.purpose) {
      conditions.push(eq(animals.purpose, filters.purpose));
    }
    if (filters.search) {
      conditions.push(
        sql`(${animals.title} ILIKE ${`%${filters.search}%`} OR ${animals.description} ILIKE ${`%${filters.search}%`})`
      );
    }

    // Service filters
    if (filters.homeDelivery === true) {
      conditions.push(eq(animals.homeDelivery, true));
    }
    if (filters.pickup === true) {
      conditions.push(eq(animals.pickup, true));
    }
    if (filters.butchered === true) {
      conditions.push(eq(animals.butchered, true));
    }
    if (filters.vaccinated === true) {
      conditions.push(eq(animals.vaccinated, true));
    }
    if (filters.certified === true) {
      conditions.push(eq(animals.certified, true));
    }
    if (filters.organicFeed === true) {
      conditions.push(eq(animals.organicFeed, true));
    }

    // Category filter
    if (filters.category) {
      conditions.push(eq(animalTypes.category, filters.category));
    }

    // Get total count
    const totalQuery = db
      .select({ count: count() })
      .from(animals)
      .leftJoin(animalTypes, eq(animals.animalTypeId, animalTypes.id))
      .where(and(...conditions));
    
    const [{ count: total }] = await totalQuery;

    // Apply ordering
    let orderBy = desc(animals.createdAt);
    if (filters.sortBy === 'price_asc') {
      orderBy = asc(animals.price);
    } else if (filters.sortBy === 'price_desc') {
      orderBy = desc(animals.price);
    } else if (filters.sortBy === 'popular') {
      orderBy = desc(animals.viewCount);
    }

    const results = await db
      .select({
        animal: animals,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
        },
        animalType: animalTypes,
        breed: breeds,
        region: regions,
        city: cities,
        mainPhoto: sql`(
          SELECT file_path FROM ${animalPhotos} 
          WHERE ${animalPhotos.animalId} = ${animals.id} 
          AND ${animalPhotos.isMain} = true 
          LIMIT 1
        )`.as('mainPhoto'),
      })
      .from(animals)
      .leftJoin(users, eq(animals.userId, users.id))
      .leftJoin(animalTypes, eq(animals.animalTypeId, animalTypes.id))
      .leftJoin(breeds, eq(animals.breedId, breeds.id))
      .leftJoin(regions, eq(animals.regionId, regions.id))
      .leftJoin(cities, eq(animals.cityId, cities.id))
      .where(and(...conditions))
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    return {
      animals: results,
      total,
    };
  }

  async incrementViewCount(id: number): Promise<void> {
    await db
      .update(animals)
      .set({ viewCount: sql`${animals.viewCount} + 1` })
      .where(eq(animals.id, id));
  }

  // Photo operations
  async addAnimalPhoto(animalId: number, fileName: string, filePath: string, isMain = false): Promise<AnimalPhoto> {
    if (isMain) {
      // Remove main flag from other photos
      await db
        .update(animalPhotos)
        .set({ isMain: false })
        .where(eq(animalPhotos.animalId, animalId));
    }

    const [photo] = await db
      .insert(animalPhotos)
      .values({ animalId, fileName, filePath, isMain })
      .returning();
    return photo;
  }

  async getAnimalPhotos(animalId: number): Promise<AnimalPhoto[]> {
    return await db
      .select()
      .from(animalPhotos)
      .where(eq(animalPhotos.animalId, animalId))
      .orderBy(desc(animalPhotos.isMain), asc(animalPhotos.order));
  }

  async deleteAnimalPhoto(id: number): Promise<boolean> {
    const [photo] = await db.delete(animalPhotos).where(eq(animalPhotos.id, id)).returning();
    return !!photo;
  }

  // Message operations
  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    return newMessage;
  }

  async getConversation(user1Id: number, user2Id: number, animalId?: number): Promise<Message[]> {
    const conditions = [
      sql`((${messages.fromUserId} = ${user1Id} AND ${messages.toUserId} = ${user2Id}) OR 
           (${messages.fromUserId} = ${user2Id} AND ${messages.toUserId} = ${user1Id}))`
    ];

    if (animalId) {
      conditions.push(eq(messages.animalId, animalId));
    }

    return await db
      .select()
      .from(messages)
      .where(and(...conditions))
      .orderBy(asc(messages.createdAt));
  }

  async getUserMessages(userId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(sql`${messages.fromUserId} = ${userId} OR ${messages.toUserId} = ${userId}`)
      .orderBy(desc(messages.createdAt));
  }

  async markMessageRead(id: number): Promise<boolean> {
    const [message] = await db
      .update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, id))
      .returning();
    return !!message;
  }

  // Favorite operations
  async addFavorite(favorite: InsertFavorite): Promise<Favorite> {
    const [newFavorite] = await db
      .insert(favorites)
      .values(favorite)
      .returning();
    return newFavorite;
  }

  async removeFavorite(userId: number, animalId: number): Promise<boolean> {
    const [favorite] = await db
      .delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.animalId, animalId)))
      .returning();
    return !!favorite;
  }

  async getUserFavorites(userId: number): Promise<any[]> {
    return await db
      .select({
        favorite: favorites,
        animal: animals,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
        },
        animalType: animalTypes,
        region: regions,
        city: cities,
        mainPhoto: sql`(
          SELECT file_path FROM ${animalPhotos} 
          WHERE ${animalPhotos.animalId} = ${animals.id} 
          AND ${animalPhotos.isMain} = true 
          LIMIT 1
        )`.as('mainPhoto'),
      })
      .from(favorites)
      .innerJoin(animals, eq(favorites.animalId, animals.id))
      .leftJoin(users, eq(animals.userId, users.id))
      .leftJoin(animalTypes, eq(animals.animalTypeId, animalTypes.id))
      .leftJoin(regions, eq(animals.regionId, regions.id))
      .leftJoin(cities, eq(animals.cityId, cities.id))
      .where(eq(favorites.userId, userId))
      .orderBy(desc(favorites.createdAt));
  }

  async isFavorite(userId: number, animalId: number): Promise<boolean> {
    const [favorite] = await db
      .select()
      .from(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.animalId, animalId)));
    return !!favorite;
  }

  // Reference data operations
  async getRegions(): Promise<Region[]> {
    // Получаем только уникальные регионы, исключая дублирующиеся записи
    const allRegions = await db.select().from(regions).orderBy(asc(regions.name));
    
    // Список ID записей, которые нужно оставить (только полные названия областей и города республиканского значения)
    const validRegionIds = [
      1,  // Bishkek - Бишкек
      2,  // Osh - Ош  
      3,  // Chuy - Чүй облусу
      4,  // Osh Region - Ош облусу
      5,  // Jalal-Abad - Жалал-Абад облусу
      6,  // Issyk-Kul - Ысык-Көл облусу
      7,  // Naryn - Нарын облусу
      8,  // Talas - Талас облусу
      9,  // Batken - Баткен облусу
    ];
    
    const uniqueRegions = allRegions.filter((region: Region) => {
      return validRegionIds.includes(region.id);
    });
    
    return uniqueRegions;
  }

  async getCities(regionId?: number): Promise<City[]> {
    const baseQuery = db.select().from(cities);
    
    if (regionId) {
      return await baseQuery.where(eq(cities.regionId, regionId)).orderBy(asc(cities.name));
    }
    
    return await baseQuery.orderBy(asc(cities.name));
  }

  async getAnimalTypes(category?: string): Promise<AnimalType[]> {
    let results;
    if (category) {
      results = await db.select().from(animalTypes).where(eq(animalTypes.category, category)).orderBy(asc(animalTypes.name));
    } else {
      results = await db.select().from(animalTypes).orderBy(asc(animalTypes.name));
    }
    
    // Удаляем дубликаты по имени (name)
    const uniqueTypes = results.filter((type: AnimalType, index: number, self: AnimalType[]) => 
      index === self.findIndex((t: AnimalType) => t.name === type.name && t.category === type.category)
    );
    
    return uniqueTypes;
  }

  async getBreeds(animalTypeId?: number): Promise<Breed[]> {
    const baseQuery = db.select().from(breeds);
    
    let results;
    if (animalTypeId) {
      results = await baseQuery.where(eq(breeds.animalTypeId, animalTypeId)).orderBy(asc(breeds.name));
    } else {
      results = await baseQuery.orderBy(asc(breeds.name));
    }
    
    // Удаляем дубликаты по имени и типу животного
    const uniqueBreeds = results.filter((breed: Breed, index: number, self: Breed[]) => 
      index === self.findIndex((b: Breed) => b.name === breed.name && b.animalTypeId === breed.animalTypeId)
    );
    
    return uniqueBreeds;
  }

  // Transaction operations
  async createTransaction(userId: number, amount: string, type: 'credit' | 'debit', description: string): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values({ userId, amount, type, description })
      .returning();
    return transaction;
  }

  async getUserTransactions(userId: number): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
  }
}

export const storage = new DatabaseStorage();
