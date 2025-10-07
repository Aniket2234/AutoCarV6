# AutoShop Manager - Car Parts & Service Management System

## Overview

AutoShop Manager is a comprehensive full-stack web application designed for auto repair shops to manage their operations efficiently. The system handles car parts inventory, customer relationships, service workflows, employee management, and sales tracking. Built with a modern tech stack, it provides a professional dashboard interface for managing all aspects of an automotive service business.

The application serves multiple user roles including administrators, inventory managers, sales executives, HR managers, and service staff, each with tailored views and permissions for their responsibilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- **React with Vite**: Modern SPA architecture using React 18+ with Vite as the build tool for fast development and optimized production builds
- **TypeScript**: Full type safety across the application with strict mode enabled
- **Client-side Routing**: Uses Wouter for lightweight, declarative routing without full page reloads
- **State Management**: TanStack Query (React Query) for server state management with automatic caching, refetching, and optimistic updates

**UI Component System**
- **Design System**: Shadcn/ui component library with Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with custom design tokens following a dark-mode-first professional dashboard aesthetic
- **Theme System**: Custom theme provider supporting light/dark modes with persistent user preferences
- **Design Philosophy**: Information-dense, utility-focused interface inspired by Linear, Stripe Dashboard, and Notion

**Key Architectural Patterns**
- Component composition with reusable UI primitives (Button, Card, Badge, etc.)
- Custom hooks for cross-cutting concerns (useIsMobile, useToast, useTheme)
- Data table abstraction with pagination and flexible column configuration
- Status-based visual indicators with semantic color coding

### Backend Architecture

**Server Framework**
- **Express.js**: RESTful API server with middleware-based request processing
- **TypeScript**: Type-safe server implementation
- **Development Setup**: Custom Vite integration for HMR during development, static file serving in production

**API Design**
- RESTful endpoints following resource-based URL patterns (`/api/products`, `/api/customers`, etc.)
- CRUD operations for all major entities (Products, Customers, Employees, Orders, Service Visits)
- Middleware for request logging, error handling, and JSON parsing
- Response standardization with consistent error formats

**Database Layer**
- **MongoDB with Mongoose ODM**: NoSQL database for flexible document storage
- **Connection Management**: Singleton pattern with connection caching for serverless compatibility
- **Schema Design**: Mongoose models with validation, hooks, and virtual fields
- **Data Relationships**: Reference-based relationships using ObjectIds with population support

### Data Models & Schemas

**Core Entities**
1. **Product**: Car parts inventory with variants, pricing, stock levels, warehouse location, supplier references
2. **Customer**: Customer profiles with multiple vehicle registrations, contact information
3. **Employee**: Staff management with roles, contact details, active status
4. **ServiceVisit**: Service workflow tracking with status progression (inquired → working → waiting → completed), parts usage, timestamps
5. **Order**: Sales orders with line items, payment tracking, delivery status, invoice generation
6. **InventoryTransaction**: Stock movement logging (IN/OUT) with reasons and user attribution
7. **Supplier**: Vendor management with product catalogs and payment terms
8. **PurchaseOrder**: Procurement tracking with auto-generated PO numbers
9. **Attendance**: Employee time tracking with check-in/out and status
10. **Leave**: Employee leave management with approval workflows
11. **Task**: Task assignment system with priority and status tracking
12. **CommunicationLog**: Customer interaction history across multiple channels
13. **Feedback**: Customer feedback/complaint management system
14. **Notification**: Real-time alerts for low stock, new orders, payment dues

**Schema Features**
- Auto-generated unique identifiers (PO numbers, invoice numbers)
- Pre-save hooks for status calculations (stock levels, service stage timestamps)
- Subdocuments for embedded relationships (order items, vehicle details)
- Enum validations for status fields
- Timestamp tracking on all entities

### Authentication & Authorization

**Current Implementation**
- Basic user schema defined in Drizzle (PostgreSQL) for authentication foundation
- User model in MongoDB with role-based access control (Admin, Inventory Manager, Sales Executive, HR Manager, Service Staff)
- Password hashing with bcryptjs
- Role enumeration across employee and user models

**Planned Features** (indicated by schema presence)
- JWT-based session management
- Role-based permissions for feature access
- User-employee relationship linking

### External Dependencies

**Database**
- **MongoDB**: Primary database via `@neondatabase/serverless` driver (Note: Despite the package name, this is used with MongoDB connection strings)
- **Mongoose**: ODM for schema definition, validation, and query building
- **PostgreSQL with Drizzle**: Secondary database layer defined in schema (currently minimal usage, prepared for future auth implementation)

**UI Component Libraries**
- **Radix UI**: Comprehensive set of unstyled, accessible component primitives (20+ components including Dialog, Dropdown, Popover, Select, etc.)
- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **Lucide React**: Icon library for consistent iconography

**State & Data Management**
- **TanStack Query**: Server state management with query invalidation and caching strategies
- **React Hook Form**: Form state management (planned integration via @hookform/resolvers)
- **Zod**: Schema validation for forms and API data (via drizzle-zod)

**Date & Time**
- **date-fns**: Date formatting and manipulation library used throughout the application

**Development Tools**
- **Vite**: Build tool with development server and HMR
- **esbuild**: Production bundling for server code
- **TypeScript**: Type checking across client and server
- **Replit-specific plugins**: Runtime error modal, cartographer, dev banner for Replit environment

**Deployment & Hosting**
- Designed for Vercel deployment with serverless compatibility
- Environment variable configuration for MongoDB connection
- Separate client and server build outputs

**Third-Party Integrations** (Planned)
- SMTP email service for notifications (environment variables configured)
- Biometric attendance devices (module placeholder present)
- Payment gateway integration (inferred from payment tracking features)