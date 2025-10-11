# AutoShop Manager - Car Parts & Service Management System

## Overview
AutoShop Manager is a comprehensive full-stack web application for auto repair shops. It efficiently manages car parts inventory, customer relationships, service workflows, employee management, and sales tracking. The system supports multiple user roles (administrators, inventory managers, sales executives, HR managers, and service staff) with tailored views and permissions, providing a professional dashboard for all automotive service business operations. The business vision is to streamline operations for auto repair shops, enhancing efficiency and customer satisfaction, with market potential in small to medium-sized repair businesses.

## Recent Changes
**October 11, 2025** - Implemented comprehensive customer registration system:
- Created PostgreSQL schema for customers and vehicles using Drizzle ORM
- Built multi-step customer registration form with OTP verification
- Developed admin dashboard with advanced filtering (city, district, state, verification status) and customer detail views
- Implemented reference code generation with proper Indian state RTO codes (CUST-MH-000001 format)
- Added security features: duplicate vehicle/mobile prevention, input validation, secure OTP verification
- Stubbed notification system (SMS/WhatsApp/Email) for future integration with external gateways
- All interactive elements include data-testid attributes for automated testing

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built with **React (18+)** and **Vite** for a fast SPA experience, utilizing **TypeScript** for type safety and **Wouter** for client-side routing. **TanStack Query** manages server state with caching and optimistic updates. The UI uses **Shadcn/ui** components based on **Radix UI primitives** and styled with **Tailwind CSS**, following a dark-mode-first, information-dense design inspired by professional dashboards. It includes a custom theme provider for light/dark modes and uses custom hooks for shared functionalities.

### Backend Architecture
The backend is an **Express.js** RESTful API server, also written in **TypeScript**. It features a middleware-based request processing system for logging, error handling, and JSON parsing. API endpoints follow resource-based patterns for CRUD operations on all major entities.

### Database Layer
The primary database is **MongoDB** with **Mongoose ODM** for flexible NoSQL document storage, using a singleton pattern for connection management. Schema designs incorporate validation, hooks, virtual fields, and reference-based relationships. A **PostgreSQL with Drizzle** layer is present for future authentication implementation.

### Data Models & Schemas
Core entities include Product (with multi-image support, variants, barcode, compatibility, warranty, and detailed inventory tracking), Customer, Employee, ServiceVisit, Order, enhanced InventoryTransaction (tracking IN/OUT/RETURN/ADJUSTMENT, suppliers, batches, unit costs), ProductReturn (with status workflow, refund tracking), Supplier, PurchaseOrder, Attendance, Leave, Task, CommunicationLog, and Feedback. Schemas feature auto-generated IDs, pre-save hooks for status calculations, subdocuments, enum validations, and timestamps.

**New Customer Registration System** (PostgreSQL/Drizzle):
- **Customer Table**: Comprehensive customer data with fields for personal information (name, mobile, alternative number, email), complete address details (address, city, taluka, district, state, pincode), verification status, OTP management, and auto-generated reference codes following format CUST-{StateCode}-{Counter} (e.g., CUST-MH-000001 for Maharashtra)
- **Vehicle Table**: Vehicle registration with vehicle number (unique), brand, model, year, and photo upload capability. Linked to customers via foreign key relationship with cascade delete
- **Reference Code System**: Uses proper Indian state RTO codes (MH for Maharashtra, GJ for Gujarat, etc.) for location-based customer identification
- **OTP Verification**: Secure OTP generation (6-digit), storage with expiry timestamps, and verification workflow

### Authentication & Authorization
The system uses **session-based authentication** with Express sessions and secure HTTP-only cookies. Password hashing is handled by **bcryptjs**. **Role-Based Access Control (RBAC)** defines five distinct roles: Admin, Inventory Manager, Sales Executive, HR Manager, and Service Staff, each with granular permissions (read, create, update, delete) enforced via middleware and frontend checks. Dashboards are role-specific, displaying tailored KPIs and analytics.

## External Dependencies

- **Database**: MongoDB (via Mongoose), PostgreSQL (via Drizzle for future auth)
- **UI Components**: Radix UI, Shadcn/ui, Tailwind CSS, Lucide React (icons)
- **State & Data Management**: TanStack Query, React Hook Form (planned), Zod (schema validation)
- **Date & Time**: date-fns
- **Development Tools**: Vite, esbuild, TypeScript, Replit-specific plugins
- **Deployment**: Vercel (serverless compatibility)
- **Security**: bcryptjs
- **Planned Integrations**: SMTP email service, Biometric attendance devices, Payment gateways.