# Mauli Car World - Car Parts & Service Management System

## Overview
Mauli Car World is a comprehensive full-stack web application for auto repair shops. It efficiently manages car parts inventory, customer relationships, service workflows, employee management, and sales tracking. The system supports multiple user roles (administrators, inventory managers, sales executives, HR managers, and service staff) with tailored views and permissions, providing a professional dashboard for all automotive service business operations. The business vision is to streamline operations for auto repair shops, enhancing efficiency and customer satisfaction, with market potential in small to medium-sized repair businesses.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built with **React (18+)** and **Vite** for a fast SPA experience, utilizing **TypeScript** for type safety and **Wouter** for client-side routing. **TanStack Query** manages server state with caching and optimistic updates. The UI uses **Shadcn/ui** components based on **Radix UI primitives** and styled with **Tailwind CSS**, following a dark-mode-first, information-dense design inspired by professional dashboards. It includes a custom theme provider for light/dark modes and uses custom hooks for shared functionalities. A consistent aesthetic is maintained with thick orange borders and gradient backgrounds for cards and vehicle images, enhancing visibility across both light and dark modes.

### Backend Architecture
The backend is an **Express.js** RESTful API server, written in **TypeScript**. It features a middleware-based request processing system for logging, error handling, and JSON parsing. API endpoints follow resource-based patterns for CRUD operations on all major entities.

### Database Layer
The application exclusively uses **MongoDB** as the sole database with **Mongoose ODM** for flexible NoSQL document storage. A singleton pattern is used for connection management. Schema designs incorporate validation, hooks, virtual fields, and reference-based relationships.

### Data Models & Schemas
Core entities include Product (with multi-image support, variants, barcode, compatibility, warranty, and detailed inventory tracking), RegistrationCustomer, RegistrationVehicle, Employee, ServiceVisit (with before/after image support), Order, enhanced InventoryTransaction, ProductReturn, Supplier, PurchaseOrder, Attendance, Leave, Task, CommunicationLog, and Feedback.
The **Customer Registration System** (MongoDB/Mongoose) includes:
- **RegistrationCustomer Collection**: Stores comprehensive customer data with personal info, address details, verification status, OTP management, and auto-generated reference codes (CUST-{StateCode}-{Counter}).
- **RegistrationVehicle Collection**: Stores vehicle details linked to customers, including vehicle number (optional for new vehicles), brand, model (with dynamic selection and "Other" for custom models), year, photo, chassis number (for new vehicles), and `selectedParts` for service planning.
**Zod** is used for validation schemas for `RegistrationCustomer` and `RegistrationVehicle` to ensure data integrity.

### Authentication & Authorization
The system uses **session-based authentication** with Express sessions and secure HTTP-only cookies. Password hashing is handled by **bcryptjs**. **Role-Based Access Control (RBAC)** defines five distinct roles: Admin, Inventory Manager, Sales Executive, HR Manager, and Service Staff, each with granular permissions enforced via middleware and frontend checks. Two-step OTP verification is implemented for login, currently using a dummy OTP for development.

### UI/UX Decisions
- **Global Card Styling**: All cards throughout the application feature a consistent `border-2 border-orange-300 dark:border-orange-700` for enhanced visibility and branding.
- **Vehicle Image Styling**: Vehicle images consistently use `border-2 border-orange-300 dark:border-orange-700`, `object-contain` for full image display, and gradient backgrounds (`from-orange-50 to-yellow-50`) for visual consistency.
- **Responsive Layouts**: Customer registration dashboard uses a responsive card layout (1/2/3 columns) instead of a table view.
- **Enhanced Forms**: Conditional form fields (e.g., vehicle number only for used vehicles, custom model field only when "Other" is selected) and dynamic dropdowns (e.g., model selection based on brand) improve user experience.
- **Image Uploads**: Service visit dialogs and vehicle photo fields support image uploads with live previews, base64 encoding, and strict validation.

## External Dependencies

- **Database**: MongoDB (via Mongoose)
- **UI Components**: Radix UI, Shadcn/ui, Tailwind CSS, Lucide React (icons)
- **State & Data Management**: TanStack Query, React Hook Form, Zod
- **Date & Time**: date-fns
- **Development Tools**: Vite, esbuild, TypeScript
- **Deployment**: Vercel
- **Security**: bcryptjs