import express, { type Express, type Request, type Response, type NextFunction } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import { insertUserSchema, insertAnimalSchema, insertMessageSchema } from "@shared/schema";
import { z } from "zod";
import { db } from './db.js';
import { animals, animalTypes, breeds, regions, cities, users, messages } from '@shared/schema';
import { sql, eq } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage_multer = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage_multer,
  limits: { 
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and videos are allowed'));
    }
  }
});

// Middleware to verify JWT token
const authenticateToken = (req: Request & { user?: { userId: number } }, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files
  app.use('/uploads', (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  });
  app.use('/uploads', express.static(uploadDir));

  // Auth routes
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const { email, password, ...rest } = req.body as { email: string; password: string; [key: string]: any };
      
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      const userData = insertUserSchema.parse({ email, password, ...rest });
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Generate verification token
      const verificationToken = jwt.sign({ email: userData.email }, JWT_SECRET, { expiresIn: '1d' });

      const user = await storage.createUser({
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        regionId: userData.regionId,
        cityId: userData.cityId,
        verificationToken,
        isVerified: false,
        isAdmin: false,
        balance: "0.00"
      });

      // Generate JWT token
      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

      res.status(201).json({ 
        message: 'User registered successfully',
        token,
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, isVerified: user.isVerified }
      });
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      console.error('Registration error:', error);
      // Log full error details
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
          message: 'Internal server error', 
          errorName: error.name, 
          errorMessage: error.message 
        });
      } else {
        res.status(500).json({ 
          message: 'Unknown internal server error',
          error: String(error)
        });
      }
    }
  });

  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body as { email: string; password: string };

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

      res.json({ 
        token,
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, isVerified: user.isVerified }
      });
    } catch (error: unknown) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        res.status(500).json({ 
          message: 'Internal server error', 
          errorName: error.name, 
          errorMessage: error.message 
        });
      } else {
        res.status(500).json({ 
          message: 'Unknown internal server error',
          error: String(error)
        });
      }
    }
  });

  app.get('/api/auth/me', authenticateToken, async (req: Request & { user?: { userId: number } }, res: Response) => {
    try {
      if (!req.user || !req.user.userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ 
        id: user.id, 
        email: user.email, 
        firstName: user.firstName, 
        lastName: user.lastName, 
        phone: user.phone,
        isVerified: user.isVerified,
        balance: user.balance,
        regionId: user.regionId,
        cityId: user.cityId
      });
    } catch (error: unknown) {
      console.error('Get user error:', error);
      if (error instanceof Error) {
        res.status(500).json({ 
          message: 'Internal server error', 
          errorName: error.name, 
          errorMessage: error.message 
        });
      } else {
        res.status(500).json({ 
          message: 'Unknown internal server error',
          error: String(error)
        });
      }
    }
  });

  // Reference data routes
  app.get('/api/regions', async (req: Request, res: Response) => {
    try {
      const regions = await storage.getRegions();
      res.json(regions);
    } catch (error: unknown) {
      console.error('Get regions error:', error);
      if (error instanceof Error) {
        res.status(500).json({ 
          message: 'Internal server error', 
          errorName: error.name, 
          errorMessage: error.message 
        });
      } else {
        res.status(500).json({ 
          message: 'Unknown internal server error',
          error: String(error)
        });
      }
    }
  });

  app.get('/api/cities', async (req: Request, res: Response) => {
    try {
      const regionId = req.query.regionId ? parseInt(req.query.regionId as string) : undefined;
      const cities = await storage.getCities(regionId);
      res.json(cities);
    } catch (error: unknown) {
      console.error('Get cities error:', error);
      if (error instanceof Error) {
        res.status(500).json({ 
          message: 'Internal server error', 
          errorName: error.name, 
          errorMessage: error.message 
        });
      } else {
        res.status(500).json({ 
          message: 'Unknown internal server error',
          error: String(error)
        });
      }
    }
  });

  app.get('/api/animal-types', async (req: Request, res: Response) => {
    try {
      const category = req.query.category as string;
      const animalTypes = await storage.getAnimalTypes(category);
      res.json(animalTypes);
    } catch (error: unknown) {
      console.error('Get animal types error:', error);
      if (error instanceof Error) {
        res.status(500).json({ 
          message: 'Internal server error', 
          errorName: error.name, 
          errorMessage: error.message 
        });
      } else {
        res.status(500).json({ 
          message: 'Unknown internal server error',
          error: String(error)
        });
      }
    }
  });

  app.get('/api/breeds', async (req: Request, res: Response) => {
    try {
      const animalTypeId = req.query.animalTypeId ? parseInt(req.query.animalTypeId as string) : undefined;
      const breeds = await storage.getBreeds(animalTypeId);
      res.json(breeds);
    } catch (error: unknown) {
      console.error('Get breeds error:', error);
      if (error instanceof Error) {
        res.status(500).json({ 
          message: 'Internal server error', 
          errorName: error.name, 
          errorMessage: error.message 
        });
      } else {
        res.status(500).json({ 
          message: 'Unknown internal server error',
          error: String(error)
        });
      }
    }
  });

  // Animal routes
  app.get('/api/animals', async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 12;
      const offset = parseInt(req.query.offset as string) || 0;
      
      // Обработка массива типов животных
      let animalTypeIds: number[] = [];
      if (req.query.animalTypeIds) {
        const typeIdsParam = req.query.animalTypeIds as string;
        if (Array.isArray(typeIdsParam)) {
          animalTypeIds = typeIdsParam.map(id => parseInt(id)).filter(id => !isNaN(id));
        } else {
          // Если это строка, разделяем по запятой
          animalTypeIds = typeIdsParam.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
        }
      }

      // Обработка массива пород
      let breedIds: number[] = [];
      if (req.query.breedIds) {
        const breedIdsParam = req.query.breedIds as string;
        if (Array.isArray(breedIdsParam)) {
          breedIds = breedIdsParam.map(id => parseInt(id)).filter(id => !isNaN(id));
        } else {
          // Если это строка, разделяем по запятой
          breedIds = breedIdsParam.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
        }
      }
      
      const filters = {
        animalTypeId: req.query.animalTypeId ? parseInt(req.query.animalTypeId as string) : undefined,
        animalTypeIds: animalTypeIds.length > 0 ? animalTypeIds : undefined,
        breedId: req.query.breedId ? parseInt(req.query.breedId as string) : undefined,
        breedIds: breedIds.length > 0 ? breedIds : undefined,
        regionId: req.query.regionId ? parseInt(req.query.regionId as string) : undefined,
        cityId: req.query.cityId ? parseInt(req.query.cityId as string) : undefined,
        gender: req.query.gender as string,
        minPrice: req.query.minPrice as string,
        maxPrice: req.query.maxPrice as string,
        purpose: req.query.purpose as string,
        search: req.query.search as string,
        sortBy: req.query.sortBy as string,
        category: req.query.category as string,
        // Дополнительные услуги
        homeDelivery: req.query.homeDelivery === 'true',
        pickup: req.query.pickup === 'true',
        butchered: req.query.butchered === 'true',
        vaccinated: req.query.vaccinated === 'true',
        certified: req.query.certified === 'true',
        organicFeed: req.query.organicFeed === 'true',
      };

      const result = await storage.searchAnimals(filters, limit, offset);
      res.json(result);
    } catch (error: unknown) {
      console.error('Search animals error:', error);
      if (error instanceof Error) {
        res.status(500).json({ 
          message: 'Internal server error', 
          errorName: error.name, 
          errorMessage: error.message 
        });
      } else {
        res.status(500).json({ 
          message: 'Unknown internal server error',
          error: String(error)
        });
      }
    }
  });

  app.get('/api/animals/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const animal = await storage.getAnimalWithDetails(id);
      
      if (!animal) {
        return res.status(404).json({ message: 'Animal not found' });
      }

      // Increment view count
      await storage.incrementViewCount(id);

      res.json(animal);
    } catch (error: unknown) {
      console.error('Get animal details error:', error);
      if (error instanceof Error) {
        res.status(500).json({ 
          message: 'Internal server error', 
          errorName: error.name, 
          errorMessage: error.message 
        });
      } else {
        res.status(500).json({ 
          message: 'Unknown internal server error',
          error: String(error)
        });
      }
    }
  });

  app.post('/api/animals', authenticateToken, upload.array('photos', 10), async (req: any, res) => {
    try {
      const animalData = insertAnimalSchema.parse({
        ...req.body,
        category: req.body.category || 'livestock',
        animalTypeId: parseInt(req.body.animalTypeId),
        breedId: req.body.breedId ? parseInt(req.body.breedId) : null,
        birthYear: req.body.birthYear ? parseInt(req.body.birthYear) : null,
        regionId: parseInt(req.body.regionId),
        cityId: parseInt(req.body.cityId),
        address: req.body.address,
        price: req.body.price,
        weight: req.body.weight || null,
        isNegotiable: req.body.isNegotiable === 'true',
        // Дополнительные услуги
        homeDelivery: req.body.homeDelivery === 'true',
        pickup: req.body.pickup === 'true',
        butchered: req.body.butchered === 'true',
        vaccinated: req.body.vaccinated === 'true',
        certified: req.body.certified === 'true',
        organicFeed: req.body.organicFeed === 'true',
      });

      const animal = await storage.createAnimal({
        ...animalData,
        userId: req.user.userId,
      });

      // Handle photo uploads
      if (req.files && req.files.length > 0) {
        for (let i = 0; i < req.files.length; i++) {
          const file = req.files[i];
          await storage.addAnimalPhoto(
            animal.id,
            file.filename,
            `/uploads/${file.filename}`,
            i === 0 // First photo is main
          );
        }
      }

      res.status(201).json(animal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      console.error('Create animal error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.put('/api/animals/:id', authenticateToken, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const animal = await storage.getAnimal(id);

      if (!animal) {
        return res.status(404).json({ message: 'Animal not found' });
      }

      if (animal.userId !== req.user.userId) {
        return res.status(403).json({ message: 'Not authorized to update this animal' });
      }

      const updates = insertAnimalSchema.partial().parse(req.body);
      const updatedAnimal = await storage.updateAnimal(id, updates);

      res.json(updatedAnimal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      console.error('Update animal error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.delete('/api/animals/:id', authenticateToken, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const animal = await storage.getAnimal(id);

      if (!animal) {
        return res.status(404).json({ message: 'Animal not found' });
      }

      if (animal.userId !== req.user.userId) {
        return res.status(403).json({ message: 'Not authorized to delete this animal' });
      }

      await storage.deleteAnimal(id);
      res.json({ message: 'Animal deleted successfully' });
    } catch (error) {
      console.error('Delete animal error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/my-animals', authenticateToken, async (req: any, res) => {
    try {
      const animals = await storage.getUserAnimals(req.user.userId);
      res.json(animals);
    } catch (error) {
      console.error('Get user animals error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Favorite routes
  app.post('/api/favorites', authenticateToken, async (req: any, res) => {
    try {
      const { animalId } = req.body;
      
      if (!animalId) {
        return res.status(400).json({ message: 'Animal ID is required' });
      }

      const favorite = await storage.addFavorite({
        userId: req.user.userId,
        animalId: parseInt(animalId),
      });

      res.status(201).json(favorite);
    } catch (error) {
      console.error('Add favorite error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.delete('/api/favorites/:animalId', authenticateToken, async (req: any, res) => {
    try {
      const animalId = parseInt(req.params.animalId);
      const success = await storage.removeFavorite(req.user.userId, animalId);
      
      if (!success) {
        return res.status(404).json({ message: 'Favorite not found' });
      }

      res.json({ message: 'Favorite removed successfully' });
    } catch (error) {
      console.error('Remove favorite error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/favorites', authenticateToken, async (req: any, res) => {
    try {
      const favorites = await storage.getUserFavorites(req.user.userId);
      res.json(favorites);
    } catch (error) {
      console.error('Get favorites error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/favorites/:animalId/check', authenticateToken, async (req: any, res) => {
    try {
      const animalId = parseInt(req.params.animalId);
      const isFavorite = await storage.isFavorite(req.user.userId, animalId);
      res.json({ isFavorite });
    } catch (error) {
      console.error('Check favorite error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Message routes
  app.post('/api/messages', authenticateToken, async (req: any, res) => {
    try {
      const { content, toUserId, animalId } = req.body;
      const fromUserId = req.user.userId;

      const messageData = {
        content,
        fromUserId,
        toUserId: parseInt(toUserId),
        animalId: animalId ? parseInt(animalId) : undefined,
        isRead: false
      };

      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      console.error('Create message error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get user by ID
  app.get('/api/users/:userId', authenticateToken, async (req: any, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      const user = await db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          hasActiveListings: sql`EXISTS (
            SELECT 1 FROM ${animals}
            WHERE ${animals.userId} = ${users.id}
            AND ${animals.status} = 'active'
          )`.as('has_active_listings'),
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (user.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user[0]);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // User search endpoint
  app.get('/api/users/search', authenticateToken, async (req: any, res) => {
    try {
      const query = req.query.q as string;
      
      if (query) {
        // If search query provided, filter by name/email
        const filteredUsers = await db
          .select({
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
            hasActiveListings: sql`EXISTS (
              SELECT 1 FROM ${animals}
              WHERE ${animals.userId} = ${users.id}
              AND ${animals.status} = 'active'
            )`.as('has_active_listings'),
          })
          .from(users)
          .where(sql`${users.id} != ${req.user.userId} AND (${users.firstName} ILIKE ${`%${query}%`} OR ${users.lastName} ILIKE ${`%${query}%`} OR ${users.email} ILIKE ${`%${query}%`})`)
          .limit(10);
        res.json(filteredUsers);
      } else {
        // If no query, return users with active listings
        const activeUsers = await db
          .select({
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
            hasActiveListings: sql`EXISTS (
              SELECT 1 FROM ${animals}
              WHERE ${animals.userId} = ${users.id}
              AND ${animals.status} = 'active'
            )`.as('has_active_listings'),
          })
          .from(users)
          .where(sql`${users.id} != ${req.user.userId} AND EXISTS (
            SELECT 1 FROM ${animals}
            WHERE ${animals.userId} = ${users.id}
            AND ${animals.status} = 'active'
          )`)
          .orderBy(sql`RANDOM()`)
          .limit(20);
        res.json(activeUsers);
      }
    } catch (error) {
      console.error('Search users error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get active conversations (users with whom current user has messages)
  app.get('/api/conversations', authenticateToken, async (req: any, res) => {
    try {
      const currentUserId = req.user.userId;
      
      // Get unique users with whom current user has exchanged messages
      const conversations = await db
        .selectDistinct({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          hasActiveListings: sql`EXISTS (
            SELECT 1 FROM ${animals}
            WHERE ${animals.userId} = ${users.id}
            AND ${animals.status} = 'active'
          )`.as('has_active_listings'),
          lastMessageTime: sql`(
            SELECT MAX(created_at) FROM ${messages} 
            WHERE (${messages.fromUserId} = ${currentUserId} AND ${messages.toUserId} = ${users.id})
               OR (${messages.fromUserId} = ${users.id} AND ${messages.toUserId} = ${currentUserId})
          )`.as('last_message_time'),
        })
        .from(users)
        .innerJoin(
          messages,
          sql`(${messages.fromUserId} = ${currentUserId} AND ${messages.toUserId} = ${users.id}) 
              OR (${messages.fromUserId} = ${users.id} AND ${messages.toUserId} = ${currentUserId})`
        )
        .where(sql`${users.id} != ${currentUserId}`)
        .orderBy(sql`last_message_time DESC`);

      res.json(conversations);
    } catch (error) {
      console.error('Get conversations error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get messages between two users with pagination
  app.get('/api/messages/:userId', authenticateToken, async (req: any, res) => {
    try {
      const currentUserId = req.user.userId;
      const otherUserId = parseInt(req.params.userId);
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      // Get total count for pagination
      const totalMessages = await db
        .select({ count: sql<number>`count(*)` })
        .from(messages)
        .where(
          sql`(${messages.fromUserId} = ${currentUserId} AND ${messages.toUserId} = ${otherUserId}) OR 
              (${messages.fromUserId} = ${otherUserId} AND ${messages.toUserId} = ${currentUserId})`
        );

      // Get paginated messages (newest first, then reverse for display)
      const conversationMessages = await db
        .select()
        .from(messages)
        .where(
          sql`(${messages.fromUserId} = ${currentUserId} AND ${messages.toUserId} = ${otherUserId}) OR 
              (${messages.fromUserId} = ${otherUserId} AND ${messages.toUserId} = ${currentUserId})`
        )
        .orderBy(sql`${messages.createdAt} DESC`)
        .limit(limit)
        .offset(offset);

      // Reverse to show oldest first
      const orderedMessages = conversationMessages.reverse();
      
      // Mark messages from other user as read
      await db
        .update(messages)
        .set({ isRead: true })
        .where(sql`${messages.fromUserId} = ${otherUserId} AND ${messages.toUserId} = ${currentUserId} AND ${messages.isRead} = false`);

      res.json({
        messages: orderedMessages,
        pagination: {
          page,
          limit,
          total: totalMessages[0].count,
          hasMore: offset + limit < totalMessages[0].count
        }
      });
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Mark messages as read
  app.put('/api/messages/:userId/read', authenticateToken, async (req: any, res) => {
    try {
      const currentUserId = req.user.userId;
      const otherUserId = parseInt(req.params.userId);

      // Mark all messages from otherUser to currentUser as read
      const result = await db
        .update(messages)
        .set({ isRead: true })
        .where(sql`${messages.fromUserId} = ${otherUserId} AND ${messages.toUserId} = ${currentUserId} AND ${messages.isRead} = false`)
        .returning({ id: messages.id });

      res.json({ markedAsRead: result.length });
    } catch (error) {
      console.error('Mark messages as read error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Send a new message
  app.post('/api/messages', authenticateToken, async (req: any, res) => {
    try {
      const { content, toUserId, animalId } = req.body;
      const fromUserId = req.user.userId;

      const messageData = {
        content,
        fromUserId,
        toUserId: parseInt(toUserId),
        animalId: animalId ? parseInt(animalId) : undefined,
        isRead: false
      };

      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/admin/seed-reference-data', async (req, res) => {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    try {
      // Regions
      const regionData = [
        { name: 'Бишкек', nameRu: 'Бишкек', nameKy: 'Бишкек' },
        { name: 'Ош', nameRu: 'Ош', nameKy: 'Ош' },
        { name: 'Чуйская область', nameRu: 'Чуйская область', nameKy: 'Чүй облусу' },
        { name: 'Таласская область', nameRu: 'Таласская область', nameKy: 'Талас облусу' },
        { name: 'Нарынская область', nameRu: 'Нарынская область', nameKy: 'Нарын облусу' },
        { name: 'Иссык-Кульская область', nameRu: 'Иссык-Кульская область', nameKy: 'Ысык-Көл облусу' },
        { name: 'Джалал-Абадская область', nameRu: 'Джалал-Абадская область', nameKy: 'Жалал-Абад облусу' },
        { name: 'Баткенская область', nameRu: 'Баткенская область', nameKy: 'Баткен облусу' },
      ];
      await db.insert(regions).values(regionData).onConflictDoNothing();

      // Cities (примерные)
      const cityData = [
        { name: 'Бишкек', nameRu: 'Бишкек', nameKy: 'Бишкек', regionId: 1 },
        { name: 'Кара-Балта', nameRu: 'Кара-Балта', nameKy: 'Кара-Балта', regionId: 3 },
        { name: 'Талас', nameRu: 'Талас', nameKy: 'Талас', regionId: 4 },
        { name: 'Нарын', nameRu: 'Нарын', nameKy: 'Нарын', regionId: 5 },
        { name: 'Каракол', nameRu: 'Каракол', nameKy: 'Каракол', regionId: 6 },
        { name: 'Ош', nameRu: 'Ош', nameKy: 'Ош', regionId: 2 },
        { name: 'Джалал-Абад', nameRu: 'Джалал-Абад', nameKy: 'Жалал-Абад', regionId: 7 },
        { name: 'Баткен', nameRu: 'Баткен', nameKy: 'Баткен', regionId: 8 },
      ];
      await db.insert(cities).values(cityData).onConflictDoNothing();

      // Animal Types
      const animalTypeData = [
        { name: 'КРС', nameRu: 'Крупный рогатый скот', nameKy: 'Ири мүйүздүү мал', icon: '🐄' },
        { name: 'Овцы', nameRu: 'Овцы', nameKy: 'Кой', icon: '🐑' },
        { name: 'Козы', nameRu: 'Козы', nameKy: 'Эчки', icon: '🐐' },
        { name: 'Лошади', nameRu: 'Лошади', nameKy: 'Ат', icon: '🐎' },
        { name: 'Верблюды', nameRu: 'Верблюды', nameKy: 'Төө', icon: '🐫' },
      ];
      await db.insert(animalTypes).values(animalTypeData).onConflictDoNothing();

      // Breeds (примерные)
      const breedData = [
        { name: 'Голштинская', nameRu: 'Голштинская', nameKy: 'Голштин', animalTypeId: 1 },
        { name: 'Джерсейская', nameRu: 'Джерсейская', nameKy: 'Джерси', animalTypeId: 1 },
        { name: 'Ала-Тоо', nameRu: 'Ала-Тоо', nameKy: 'Ала-Тоо', animalTypeId: 2 },
        { name: 'Гиссарская', nameRu: 'Гиссарская', nameKy: 'Гиссар', animalTypeId: 2 },
        { name: 'Англо-нубийская', nameRu: 'Англо-нубийская', nameKy: 'Англо-нубий', animalTypeId: 3 },
        { name: 'Кыргызская', nameRu: 'Кыргызская', nameKy: 'Кыргыз', animalTypeId: 4 },
        { name: 'Дромедар', nameRu: 'Дромедар', nameKy: 'Дромедар', animalTypeId: 5 },
      ];
      await db.insert(breeds).values(breedData).onConflictDoNothing();

      res.json({ message: 'Reference data seeded successfully!' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ message: 'Error seeding reference data', error: errorMessage });
    }
  });

  // Admin routes
  app.get('/api/admin/pending-listings', authenticateToken, async (req: any, res) => {
    try {
      // Check if user is admin
      if (!req.user.isAdmin) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      const pendingListings = await storage.searchAnimals({ status: 'pending' });
      res.json(pendingListings.animals);
    } catch (error) {
      console.error('Get pending listings error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.put('/api/admin/listings/:id/status', authenticateToken, async (req: any, res) => {
    try {
      // Check if user is admin
      if (!req.user.isAdmin) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      const id = parseInt(req.params.id);
      const { status } = req.body;

      if (!['active', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      const animal = await storage.getAnimal(id);
      if (!animal) {
        return res.status(404).json({ message: 'Animal not found' });
      }

      const updatedAnimal = await storage.updateAnimal(id, { 
        status: status as 'active' | 'rejected'
      });
      res.json(updatedAnimal);
    } catch (error) {
      console.error('Update listing status error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);
  
  // WebSocket server for real-time chat
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/ws/chat' // Separate path to avoid Vite conflicts
  });
  
  // Store active connections with user IDs
  const activeConnections = new Map<number, WebSocket>();
  
  wss.on('connection', (ws: WebSocket, req) => {
    console.log('WebSocket connection established');
    
    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        switch (message.type) {
          case 'authenticate':
            // Authenticate user and store connection
            try {
              const decoded = jwt.verify(message.token, JWT_SECRET) as any;
              activeConnections.set(decoded.userId, ws);
              (ws as any).userId = decoded.userId;
              ws.send(JSON.stringify({ type: 'authenticated', userId: decoded.userId }));
            } catch (error) {
              ws.send(JSON.stringify({ type: 'error', message: 'Invalid token' }));
            }
            break;
            
          case 'sendMessage':
            // Send message and broadcast to recipient
            try {
              const { content, toUserId, animalId } = message;
              const fromUserId = (ws as any).userId;
              
              if (!fromUserId) {
                ws.send(JSON.stringify({ type: 'error', message: 'Not authenticated' }));
                return;
              }
              
              // Save message to database
              const newMessage = await storage.createMessage({
                content,
                fromUserId,
                toUserId,
                animalId: animalId || undefined,
                isRead: false
              });
              
              // Send to sender
              ws.send(JSON.stringify({
                type: 'messageReceived',
                message: newMessage
              }));
              
              // Send to recipient if online
              const recipientWs = activeConnections.get(toUserId);
              if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
                recipientWs.send(JSON.stringify({
                  type: 'newMessage',
                  message: newMessage
                }));
              }
              
            } catch (error) {
              console.error('Send message error:', error);
              ws.send(JSON.stringify({ type: 'error', message: 'Failed to send message' }));
            }
            break;
            
          case 'markAsRead':
            // Mark messages as read and notify sender
            try {
              const { fromUserId } = message;
              const currentUserId = (ws as any).userId;
              
              if (!currentUserId) {
                ws.send(JSON.stringify({ type: 'error', message: 'Not authenticated' }));
                return;
              }
              
              // Mark messages as read in database
              await db
                .update(messages)
                .set({ isRead: true })
                .where(sql`${messages.fromUserId} = ${fromUserId} AND ${messages.toUserId} = ${currentUserId} AND ${messages.isRead} = false`);
              
              // Notify the sender that messages were read
              const senderWs = activeConnections.get(fromUserId);
              if (senderWs && senderWs.readyState === WebSocket.OPEN) {
                senderWs.send(JSON.stringify({
                  type: 'messagesRead',
                  readBy: currentUserId
                }));
              }
              
            } catch (error) {
              console.error('Mark as read error:', error);
            }
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      // Remove connection when client disconnects
      const userId = (ws as any).userId;
      if (userId) {
        activeConnections.delete(userId);
      }
    });
  });
  
  return httpServer;
}
