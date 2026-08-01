# LADIVA - Women's Fashion E-commerce Platform

A modern, full-featured women's fashion e-commerce web application built with React, TypeScript, and Supabase. LADIVA offers a sophisticated shopping experience with comprehensive admin functionality and a beautiful, responsive design.

## 📱 Project Overview

LADIVA is a production-ready e-commerce platform designed specifically for women's fashion retail. The application provides a seamless shopping experience for customers while offering powerful management tools for administrators. With its modern tech stack and elegant design, LADIVA serves as an excellent foundation for scalable fashion e-commerce businesses.

## ✨ Features

### 👤 User Features
- **Product Browsing** - Explore products with advanced filtering and search capabilities
- **Category Filtering** - Navigate through 8 main product categories
- **Product Detail Pages** - View comprehensive product information with image galleries
- **Shopping Cart** - Real-time cart management with size and color variants
- **Favorites/Wishlist** - Save and manage preferred products
- **User Authentication** - Secure login and signup system
- **Order Placement** - Complete checkout process with Cash on Delivery payment
- **Order History** - Track and view past orders with status updates
- **Responsive Design** - Optimized experience for all device sizes

### 👨‍💼 Admin Features
- **Admin Dashboard** - Real-time statistics and business metrics
- **Product Management** - Add, edit, and delete products with images
- **Category Management** - Organize and manage product categories
- **Order Management** - Process orders and update shipping status
- **User Management** - View and manage customer accounts

## 🛠 Technology Stack

### Frontend
- **React 18** - Modern UI framework with hooks and concurrent features
- **TypeScript** - Type-safe JavaScript for enhanced development experience
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework with custom pink theme
- **React Router v7** - Client-side routing with nested routes
- **Redux Toolkit** - State management with Redux DevTools support
- **Lucide React** - Modern, consistent icon library

### Backend & Database
- **Supabase** - Backend-as-a-Service providing:
  - PostgreSQL database with real-time capabilities
  - Secure authentication system
  - Row Level Security (RLS) for data protection
  - Real-time subscriptions and webhooks
  - File storage for product images

## 🏗 Project Architecture

### Application Structure
```
LADIVA/
├── Frontend (React App)     # Client-side application
├── Backend (Supabase)       # Database and authentication
└── Database (PostgreSQL)    # Data persistence layer
```

### Key Architectural Patterns
- **Component-Based Architecture** - Modular, reusable React components
- **State Management** - Redux Toolkit for global state
- **Context API** - Authentication context for user sessions
- **Protected Routes** - Route guards for authenticated and admin users
- **Real-time Updates** - Supabase subscriptions for live data sync
- **Type Safety** - End-to-end TypeScript implementation

### Data Flow
1. **User Actions** → Redux Store → UI Updates
2. **API Calls** → Supabase → Database → Redux Store
3. **Authentication** → Supabase Auth → Context → Redux Store
4. **Real-time Events** → Supabase Subscriptions → Component Updates

## 📁 Folder Structure

```
src/
├── components/              # Reusable UI components
│   ├── AddToCartButton.tsx
│   ├── AdminSidebar.tsx
│   ├── Footer.tsx
│   ├── Loading.tsx
│   ├── Navbar.tsx
│   ├── NotificationSystem.tsx
│   ├── ProductCard.tsx
│   ├── ProtectedRoute.tsx
│   └── SizeColorModal.tsx
├── contexts/               # React contexts
│   └── AuthContext.tsx
├── data/                  # Static data and mock products
│   └── products.ts
├── lib/                   # Utility libraries
│   └── supabase.ts
├── pages/                 # Page components
│   ├── Home.tsx
│   ├── Category.tsx
│   ├── Clothing.tsx
│   ├── Accessories.tsx
│   ├── Footwear.tsx
│   ├── Beauty.tsx
│   ├── Bags.tsx
│   ├── Jewelry.tsx
│   ├── HomeLiving.tsx
│   ├── Electronics.tsx
│   ├── ProductDetail.tsx
│   ├── ProductListing.tsx
│   ├── Cart.tsx
│   ├── Checkout.tsx
│   ├── OrderConfirmation.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Profile.tsx
│   ├── Orders.tsx
│   └── admin/             # Admin-specific pages
│       ├── Dashboard.tsx
│       ├── Products.tsx
│       ├── Categories.tsx
│       ├── AdminOrders.tsx
│       └── Users.tsx
├── store/                 # Redux store configuration
│   ├── index.ts
│   ├── hooks.ts
│   ├── authSlice.ts
│   ├── cartSlice.ts
│   ├── productsSlice.ts
│   ├── ordersSlice.ts
│   └── favoritesSlice.ts
├── types/                 # TypeScript type definitions
│   └── index.ts
├── utils/                 # Utility functions
├── App.tsx               # Main application component
├── main.tsx              # Application entry point
└── index.css             # Global styles
```

## 🗄 Database Schema

### Core Tables

#### `profiles`
User profile information with role-based access control.
```sql
- id (uuid, primary key, references auth.users)
- email (text, unique)
- full_name (text)
- phone (text)
- address (text)
- is_admin (boolean, default: false)
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### `categories`
Product categories with images and descriptions.
```sql
- id (uuid, primary key)
- name (text, unique)
- slug (text, unique)
- description (text)
- image_url (text)
- created_at (timestamptz)
```

#### `products`
Complete product catalog with variants and pricing.
```sql
- id (uuid, primary key)
- name (text)
- slug (text, unique)
- description (text)
- price (numeric)
- discount_price (numeric, nullable)
- category_id (uuid, references categories)
- images (text array)
- stock (integer)
- sizes (text array)
- colors (text array)
- is_featured (boolean, default: false)
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### `cart_items`
Shopping cart items with variant selection.
```sql
- id (uuid, primary key)
- user_id (uuid, references auth.users)
- product_id (uuid, references products)
- quantity (integer)
- size (text, nullable)
- color (text, nullable)
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### `orders`
Customer orders with shipping information.
```sql
- id (uuid, primary key)
- user_id (uuid, references auth.users)
- order_number (text, unique)
- total_amount (numeric)
- status (enum: pending, processing, shipped, delivered, cancelled)
- shipping_address (jsonb)
- customer_name (text)
- customer_phone (text)
- customer_email (text)
- payment_method (text)
- notes (text)
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### `order_items`
Individual items within each order.
```sql
- id (uuid, primary key)
- order_id (uuid, references orders)
- product_id (uuid, references products, nullable)
- product_name (text)
- product_price (numeric)
- quantity (integer)
- size (text)
- color (text)
- created_at (timestamptz)
```

### Security Features
- **Row Level Security (RLS)** enabled on all tables
- **JWT-based authentication** through Supabase Auth
- **Role-based access control** for admin features
- **Data validation** and sanitization at database level

## 🚀 Installation Guide

### Prerequisites
- Node.js 18+ and npm
- Git
- Supabase account (for backend services)

### Step 1: Clone the Repository
```bash
git clone <your-repository-url>
cd ladiva-ecommerce
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Set Up Supabase
1. Create a new project at [supabase.com](https://supabase.com)
2. Run the provided SQL migration in your Supabase SQL editor
3. Enable Row Level Security (RLS) policies
4. Configure authentication settings

### Step 4: Environment Configuration
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## ⚙️ Environment Variables

### Required Variables
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Getting Your Supabase Credentials
1. Navigate to your Supabase project dashboard
2. Go to Settings → API
3. Copy the Project URL and `anon` public key
4. Add them to your `.env` file

## 🏃 Running the Project

### Development Mode
Start the development server with hot reload:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Production Build
Create an optimized production build:
```bash
npm run build
```

### Preview Production Build
Preview the production build locally:
```bash
npm run preview
```

### Type Checking
Run TypeScript type checking:
```bash
npm run typecheck
```

### Linting
Run ESLint for code quality:
```bash
npm run lint
```

## 🔐 Admin Panel Access

### Setting Up Admin Access
1. Create a regular user account through the registration page
2. Access your Supabase database dashboard
3. Navigate to the `profiles` table
4. Find your user record and set `is_admin = true`
5. Log out and log back in to see admin features

### Admin Features
- **Dashboard**: View business statistics and metrics
- **Products**: Add, edit, and delete products
- **Categories**: Manage product categories
- **Orders**: Process and update order statuses
- **Users**: View and manage customer accounts

### Admin Routes
- `/admin` - Main dashboard
- `/admin/products` - Product management
- `/admin/categories` - Category management
- `/admin/orders` - Order management
- `/admin/users` - User management

## 🚀 Future Improvements

### Planned Features
- **Payment Gateway Integration** - Stripe, PayPal, and other payment methods
- **Advanced Search** - Full-text search with filters and sorting
- **Product Reviews** - Customer review and rating system
- **Email Notifications** - Order confirmations and shipping updates
- **Wishlist Sharing** - Share wishlists with friends and family
- **Product Recommendations** - AI-powered product suggestions
- **Multi-language Support** - Internationalization (i18n)
- **Currency Support** - Multiple currency options
- **Social Login** - Google, Facebook, and Apple authentication
- **Mobile App** - React Native mobile application

### Technical Enhancements
- **Performance Optimization** - Code splitting and lazy loading
- **PWA Support** - Progressive Web App capabilities
- **Advanced Analytics** - Google Analytics integration
- **A/B Testing** - Feature flag and testing framework
- **API Rate Limiting** - Prevent abuse and ensure stability
- **Caching Strategy** - Redis implementation for better performance
- **Image Optimization** - CDN integration and WebP support

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

### MIT License Summary
- ✅ Commercial use allowed
- ✅ Modification allowed
- ✅ Distribution allowed
- ✅ Private use allowed
- ❌ Liability and warranty disclaimed

## 🤝 Contributing

We welcome contributions to improve LADIVA! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation and existing issues
- Contact the development team

---

**LADIVA** - Empowering women's fashion e-commerce with modern technology and elegant design. 💕
