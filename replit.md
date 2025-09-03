# Overview

This is a Vietnamese pharmacy management system built with React, Express, and Supabase PostgreSQL. The application provides comprehensive functionality for managing medicine inventory, prescriptions, and patient records. It features a modern UI with Shadcn/UI components, TanStack Query for data fetching, and real-time prescription processing capabilities.

## Recent Changes (Aug 30, 2025)
- ✅ **MAJOR Excel Export Feature**: Professional Excel reports for low-stock medicines
- ✅ Accurate filtering logic: tồn kho <= đặt hàng (matches UI "Sắp hết" badge)
- ✅ Column structure synchronized with UI table: STT, Tên thuốc, Đơn vị, Tồn kho, Giá nhập, Giá bán, Đặt hàng, Đường dùng, Hạn sử dụng
- ✅ API endpoint /api/medicines/low-stock returns 12 low-stock medicines
- ✅ Interactive statistics board - click number to export Excel
- ✅ Professional Excel formatting with merge cells, headers, footer signatures
- ✅ Real-time data from Supabase database (102 total medicines)
- ✅ Ready for Git push to new repository: PharmaCare3.git
- ✅ Git authentication setup guide for GitHub Personal Access Token

## Previous Changes (Aug 20-21, 2025)
- ✅ Successfully migrated to real Supabase database with table `thuoc`
- ✅ Fixed medicine creation logic - can now add new medicines via API and UI
- ✅ Updated schema to match SQL table structure (numeric fields for pricing)
- ✅ Improved table UI with soft gray colors and full-width layout
- ✅ Dual API support: Vietnamese `/api/thuoc` and legacy `/api/medicines` routes
- ✅ Fixed empty form inputs - number fields now start empty instead of default 0
- ✅ Solved Netlify deployment issues with production Vite config and proper dependencies
- ✅ Fixed Netlify deployment completely - simple solution using npm run build instead of hard-coded paths
- ✅ Final working solution: npm run build + npx esbuild (clean và maintainable)
- ✅ **MAJOR**: Converted Express app to Netlify Functions for full serverless deployment
- ✅ Created 5 Netlify Functions: medicines, thuoc, statistics, prescriptions, patients
- ✅ Implemented proper CORS support and error handling in all functions
- ✅ Updated netlify.toml with API routing to functions
- ✅ Added @netlify/functions dependency for serverless deployment
- ✅ Application now fully ready for Netlify deployment with backend support

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React SPA**: Uses Vite as the build tool with TypeScript support
- **UI Framework**: Shadcn/UI components built on Radix UI primitives with Tailwind CSS styling
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management and data fetching
- **Form Handling**: React Hook Form with Zod schema validation
- **Theme System**: Custom theme provider supporting light/dark modes

## Backend Architecture
- **Serverless Functions**: Netlify Functions with TypeScript for API endpoints
- **Express.js Server**: Available for local development (npm run dev)
- **Database Layer**: Supabase PostgreSQL with direct client connections
- **Schema Design**: Five main entities (users, medicines, patients, prescriptions, prescription_medicines)
- **API Structure**: Functions in `/netlify/functions/` mapped to `/api` routes
- **Error Handling**: Per-function error handling with proper HTTP status codes and CORS
- **Deployment Ready**: Full serverless architecture suitable for Netlify deployment

## Data Storage Solutions
- **Primary Database**: PostgreSQL with Neon serverless driver
- **ORM**: Drizzle ORM provides type-safe queries and schema management
- **Migration System**: Drizzle Kit handles database migrations
- **Schema**: Relational design with proper foreign key relationships between prescriptions, patients, and medicines

## Key Features
- **Medicine Inventory Management**: CRUD operations for medicines with stock tracking
- **Prescription Processing**: Complete prescription workflow from creation to fulfillment
- **Patient Records**: Patient management with prescription history
- **Real-time Statistics**: Dashboard with inventory alerts and prescription status tracking
- **Responsive Design**: Mobile-first approach with adaptive layouts

## External Dependencies

- **Database**: Neon PostgreSQL (serverless)
- **UI Components**: Radix UI primitives for accessible components
- **Styling**: Tailwind CSS with custom design tokens
- **Build Tools**: Vite for development and production builds
- **Development**: Replit integration with runtime error overlay
- **Font Loading**: Google Fonts (DM Sans, Geist Mono, Architects Daughter, Fira Code)