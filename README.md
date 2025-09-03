# PharmaCare v3.0 - Vietnamese Pharmacy Management System

A comprehensive pharmacy management system built with modern web technologies, designed specifically for Vietnamese pharmaceutical practices.

## 🆕 Version 3.0 Features
- **Professional Excel Export**: Generate detailed low-stock medicine reports with proper formatting
- **Smart Filtering**: Automatically detect medicines where tồn kho ≤ đặt hàng  
- **Interactive Dashboard**: Click statistics numbers to export reports
- **Real-time Data**: 105+ medicines in production database
- **Complete CRUD**: Full medicine management with Supabase integration

## 🏥 Features

- **Medicine Inventory Management**: Complete CRUD operations for medicine tracking
- **Real-time Stock Monitoring**: Low stock alerts and inventory statistics
- **Prescription Processing**: Digital prescription management workflow
- **Patient Records**: Comprehensive patient information system
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Vietnamese Localization**: Full Vietnamese language support

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Shadcn/UI** components with Radix UI primitives
- **Tailwind CSS** for styling
- **TanStack Query** for server state management
- **React Hook Form** with Zod validation
- **Wouter** for lightweight routing

### Backend
- **Netlify Functions** for serverless API endpoints
- **Express.js** for local development
- **Supabase PostgreSQL** for database
- **TypeScript** for type safety

### Deployment
- **Netlify** for hosting and serverless functions
- **Supabase** for database hosting
- **GitHub** for version control

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/[username]/PharmaCare.git
cd PharmaCare
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create .env file with:
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start development server:
```bash
npm run dev
```

## 🌐 API Endpoints

### Medicine Management
- `GET /api/medicines` - Get all medicines
- `POST /api/medicines` - Create new medicine
- `PATCH /api/medicines/:id` - Update medicine
- `DELETE /api/medicines/:id` - Delete medicine

### Vietnamese API
- `GET /api/thuoc` - Get all medicines (Vietnamese format)
- `GET /api/thuoc/search?q=query` - Search medicines
- `PATCH /api/thuoc/:id/stock` - Update stock

### Statistics
- `GET /api/statistics` - Get inventory statistics

## 🚀 Deployment

### Netlify Deployment

1. Connect your GitHub repository to Netlify
2. Set build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`

3. Add environment variables in Netlify dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

4. Deploy!

## 📂 Project Structure

```
PharmaCare/
├── client/src/           # Frontend React application
├── netlify/functions/    # Serverless API functions
├── server/              # Express.js development server
├── shared/              # Shared TypeScript schemas
├── dist/                # Production build output
└── netlify.toml         # Netlify configuration
```

## 🏗️ Architecture

- **Frontend**: React SPA with TypeScript and modern UI components
- **Backend**: Serverless functions for API endpoints
- **Database**: Supabase PostgreSQL with real-time capabilities
- **State Management**: TanStack Query for server state
- **Validation**: Zod schemas for type-safe data validation

## 🔧 Development

### Local Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run check        # TypeScript type checking
```

### Database Operations
```bash
npm run db:push      # Push schema changes to database
```

## 📄 License

MIT License

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For support and questions, please open an issue on GitHub.

---

Built with ❤️ for Vietnamese healthcare professionals