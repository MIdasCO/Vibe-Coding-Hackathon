# Janybar - Livestock Marketplace Platform 🐄

A comprehensive digital ecosystem for the livestock market in Kyrgyzstan, built with modern web technologies.

## 🚀 Features

- **Animal Listings**: Browse and post livestock and pet listings with categories
- **Advanced Search**: Filter by animal type, breed, location, price, and more
- **Category Filtering**: Separate views for livestock (скот) and pets (домашние животные)
- **User Profiles**: Manage listings, favorites, and account settings
- **Messaging System**: Direct communication between buyers and sellers
- **Multi-language Support**: Russian, Kyrgyz, and English
- **Admin Panel**: Content moderation and user management
- **Mobile Responsive**: Works seamlessly on all devices
- **Support Integration**: Direct Instagram contact for support

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **React Query** for data fetching
- **Zustand** for state management
- **React Hook Form** for form handling
- **i18next** for internationalization

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Drizzle ORM** for database operations
- **Neon PostgreSQL** for data storage
- **Multer** for file uploads
- **JWT** for authentication
- **WebSocket** for real-time messaging

### Infrastructure
- **Neon Database** for PostgreSQL hosting
- **Vercel** ready for deployment
- **File uploads** with local storage

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/E1dar821/Janybar.git
   cd Janybar
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory with the following content:
   ```env
   # База данных Neon PostgreSQL
   DATABASE_URL="postgresql://neondb_owner:npg_SLY3h9DnxREw@ep-plain-night-a8ck81wi-pooler.eastus2.azure.neon.tech/neondb?sslmode=require"
   
   # Настройки сервера
   NODE_ENV=development
   PORT=5000
   
   # Секретный ключ для сессий (замените на свой безопасный ключ)
   SESSION_SECRET="your-super-secret-session-key-here-change-this-in-production"
   
   # URL API для фронтенда
   VITE_API_URL=http://localhost:5000
   
   # Настройки для разработки
   DEBUG=true
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   npm run seed:regions
   npm run seed-test-animals-neon
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

## 🗄 Database Setup

The project uses Neon PostgreSQL with pre-configured categories:

### Livestock Categories (Скот):
- Cattle (Крупный рогатый скот)
- Sheep (Овцы)
- Goats (Козы)
- Horses (Лошади)
- Pigs (Свиньи)
- Poultry (Птица)
- Rabbits (Кролики - для разведения)

### Pet Categories (Домашние животные):
- Dogs (Собаки)
- Cats (Кошки)
- Birds (Птицы)
- Rabbits (Кролики - декоративные)
- Hamsters (Хомяки)
- Fish (Рыбки)

### Database Commands:
```bash
# Apply migrations
npm run db:push

# Seed reference data
npm run seed:regions

# Add test animal listings
npm run seed-test-animals-neon

# Fix categories
npm run fix-categories-neon

# Clean duplicates
npm run clean-duplicates-neon

# Check animal types
npm run check-animal-types-neon
```

## 📱 Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server

### Database Management
- `npm run db:push` - Push schema changes to database
- `npm run seed:regions` - Seed regions and cities
- `npm run seed-test-animals-neon` - Add test animal listings
- `npm run fix-categories-neon` - Fix animal categories
- `npm run clean-duplicates-neon` - Remove duplicate entries
- `npm run add-category-field-neon` - Add category field to animals table

### Utilities
- `npm run check` - Type check
- `npm run clear-uploads` - Clear uploaded files
- `npm run prepare-vercel` - Prepare for Vercel deployment

## 🌐 Deployment

### Vercel Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Set environment variables in Vercel dashboard:**
   - `DATABASE_URL` - Your Neon PostgreSQL connection string
   - `SESSION_SECRET` - Secure session key
   - `NODE_ENV=production`
   - `VERCEL=1`

## 🏗 Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Utilities and configurations
│   │   └── locales/       # Translation files
├── server/                # Express backend
│   ├── routes.ts          # API routes
│   ├── db.ts             # Database connection
│   ├── storage.ts        # File handling
│   └── scripts/          # Database scripts
├── shared/               # Shared types and schemas
├── migrations/           # Database migrations
├── uploads/             # Uploaded files
└── env-template.txt      # Environment variables template
```

## 🌍 Internationalization

The platform supports three languages:
- **Russian** (ru) - Primary language
- **Kyrgyz** (ky) - Local language  
- **English** (en) - International

Translation files are located in `client/src/locales/`

## 🎨 Features Highlights

### Category-Based Filtering
- **SearchHero Component**: Interactive animal type selection with visual feedback
- **Category Switcher**: Toggle between livestock and pets
- **Smart Filtering**: Multiple animal type selection support

### User Interface
- **Modern Design**: Clean, responsive interface with Tailwind CSS
- **Color Coding**: Green for livestock, blue for pets
- **Interactive Elements**: Hover effects and smooth transitions
- **Mobile First**: Optimized for all screen sizes

### Support System
- **Instagram Integration**: Direct contact via @janybar_com
- **Gradient Design**: Beautiful purple-pink gradient for support page
- **Easy Access**: Support button available throughout the app

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | Neon PostgreSQL connection string | Required |
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `SESSION_SECRET` | Session encryption key | Required |
| `VITE_API_URL` | API URL for frontend | `http://localhost:5000` |
| `DEBUG` | Enable debug mode | `true` |

### Database Schema

Main tables:
- `users` - User accounts and profiles
- `animals` - Animal listings with category field
- `animal_types` - Animal categories (livestock/pets)
- `regions` & `cities` - Geographic data for Kyrgyzstan
- `messages` - Chat messages
- `favorites` - User favorites

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, contact us at:
- **Instagram**: [@janybar_com](https://www.instagram.com/janybar_com?igsh=MTVhZ3Rzc254aGwycg==)
- **Website**: [janybar.com](https://janybar.com)

## 🙏 Acknowledgments

- Built for the livestock community in Kyrgyzstan
- Inspired by modern marketplace platforms
- Thanks to all contributors and testers
- Special thanks to the Kyrgyz farming community 