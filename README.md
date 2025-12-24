# Inventory Management System - Frontend

A comprehensive inventory management system built with Next.js 16 for managing warehouses, SKUs, stock movements, and analytics.

## Features

- 🔐 **Authentication** - JWT-based login and registration
- 👥 **Role-Based Access Control** - Owner, Manager, and Staff roles with different permissions
- 📊 **Dashboard** - Real-time stats, alerts, warehouse summary, and recent transactions
- 📦 **Inventory Management** - Stock In/Out operations with full tracking
- 🏷️ **SKU Management** - Create, edit, and delete product SKUs
- 🏭 **Warehouse Management** - Multi-warehouse support (Owner only)
- 📜 **Transaction History** - Complete audit trail with filters and CSV export
- ⚠️ **Alerts** - Low stock and dead stock notifications
- 📈 **Analytics** - SKU performance, inventory value, and stock aging reports
- 👤 **User Management** - Manage users and assign roles (Owner only)
- ⚙️ **Profile Settings** - Update personal information

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **HTTP Client**: Fetch API
- **Authentication**: JWT Bearer Token

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running at `http://localhost:8080`

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### 3. Backend Configuration

Make sure the backend API is running at `http://localhost:8080`. The API base path is `/api`.

To change the backend URL, edit `lib/api.js`:

```javascript
const API_BASE_URL = 'http://localhost:8080/api';
```

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── dashboard/         # Main dashboard
│   ├── inventory/         # Inventory management
│   ├── sku/               # SKU management
│   ├── warehouses/        # Warehouse management
│   ├── transactions/      # Transaction history
│   ├── alerts/            # Stock alerts
│   ├── analytics/         # Analytics & reports
│   ├── users/             # User management
│   └── profile/           # User profile
├── components/
│   ├── ui/                # Reusable UI components
│   └── layout/            # Layout components
├── context/               # React Context providers
│   └── AuthContext.js     # Authentication context
├── lib/                   # Utility libraries
│   ├── api.js             # API client
│   └── constants.js       # App constants & helpers
└── public/                # Static assets
```

## Role Permissions

| Feature | Owner | Manager | Staff |
|---------|-------|---------|-------|
| Dashboard | ✅ | ✅ | ✅ |
| View Inventory | ✅ | ✅ | ✅ |
| Stock In/Out | ✅ | ✅ | ✅ |
| Create/Edit SKU | ✅ | ✅ | ❌ |
| Delete SKU | ✅ | ❌ | ❌ |
| Manage Warehouses | ✅ | ❌ | ❌ |
| View Transactions | ✅ | ✅ | ✅ |
| View Alerts | ✅ | ✅ | ✅ |
| View Analytics | ✅ | ✅ | ❌ |
| Manage Users | ✅ | ❌ | ❌ |

## Available Scripts

```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Environment Variables

Create a `.env.local` file for environment-specific configuration:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

## API Integration

The frontend connects to a REST API with the following endpoints:

- **Auth**: `/api/users/login`, `/api/users/register`, `/api/users/profile`
- **Warehouses**: `/api/warehouses`
- **SKUs**: `/api/sku`
- **Inventory**: `/api/inventory`, `/api/inventory/update`
- **Transactions**: `/api/transactions`
- **Alerts**: `/api/alerts`, `/api/alerts/low-stock`, `/api/alerts/dead-stock`
- **Analytics**: `/api/analytics/dashboard`, `/api/analytics/sku-performance`, `/api/analytics/inventory-value`

## Categories & Units

**Categories**: Tiles, Laminates, Lighting, Hardware, Other

**Units**: Pieces (pcs), Box, Square Feet (sqft), Kilograms (kg), Meters

## License

This project is private and proprietary.
