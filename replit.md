# Mauli Car World - Car Parts & Service Management System

## Overview
Mauli Car World is a comprehensive full-stack web application for auto repair shops. It efficiently manages car parts inventory, customer relationships, service workflows, employee management, and sales tracking. The system supports multiple user roles (administrators, inventory managers, sales executives, HR managers, and service staff) with tailored views and permissions, providing a professional dashboard for all automotive service business operations. The business vision is to streamline operations for auto repair shops, enhancing efficiency and customer satisfaction, with market potential in small to medium-sized repair businesses.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes (October 14, 2025)
### Complete Activity Tracking System (Latest)
- **ActivityLog Model**: Comprehensive activity logging system to track all user actions with fields for user info, action type, resource, description, and timestamps
- **Admin Dashboard Integration**: ActivityFeed component in admin dashboard shows real-time activity from all roles (Inventory Manager, Sales Executive, HR Manager, Service Staff)
- **Complete Activity Logging Implementation**: ALL CRUD operations now logged automatically:
  - User login/logout
  - **Employees**: create, update, delete
  - **Products**: create, update, delete
  - **Orders**: create
  - **Service Visits**: create, update, delete
  - **Suppliers**: create, update, delete
  - **Purchase Orders**: create, update
- **Visual Design**: Activity feed includes role-based badge colors (Admin=purple, HR Manager=orange, Inventory Manager=blue, etc.), action-based indicators (create=green, update=blue, delete=red, login=purple), resource icons, and "time ago" formatting
- **Error Message Fix**: Login errors now show actual error messages (e.g., "Invalid credentials") instead of misleading "session expired" message
- **API Endpoints**: 
  - GET /api/activity-logs - Fetch activities with filtering by role, resource, and date range
  - POST /api/activity-logs - Create new activity logs
- **User Experience**: ActivityFeed component includes proper loading, error, and empty states

### Image Upload Enhancement
- **Increased Payload Limit**: Increased Express body parser limit from 100KB to 50MB to support larger image uploads
- **Applies to**: Vehicle photos, service visit before/after images, product images, and all other image uploads throughout the application
- **Fixed**: "PayloadTooLargeError" that was preventing larger images from being uploaded

### Customer Referral Tracking Feature
- **Referral Source Field**: Added a new `referralSource` field to the customer registration form to track where customers heard about the business (Facebook, Instagram, WhatsApp, Google Search, Friend/Family Referral, Billboard/Hoarding, Newspaper/Magazine, Radio/TV, Direct Visit, Other)
- **Database Schema Update**: Updated `RegistrationCustomer` MongoDB model to include optional `referralSource` field
- **Form Enhancement**: Added dropdown selection in customer registration form with predefined referral sources

### Employee Management System Updates
- **Database Cleanup**: All employees, customers, and service visits were cleared from MongoDB for fresh testing
- **Employee Schema Enhancement**: Added `department` and `salary` fields to the Employee model to match UI requirements
- **TypeScript Improvements**: Added proper Employee interface with type safety throughout the Employees.tsx component
- **Bug Fixes**: 
  - Fixed critical null-reference errors in edit functionality for employees with missing salary/department data
  - Fixed React warning about missing keys in Dashboard customer list by using correct field names (`id` instead of `_id`, `fullName` instead of `name`, `mobileNumber` instead of `phone`)
- **Test Data**: Added sample employee (John Doe - Service Staff), customer (Rajesh Kumar), and service visit for verification

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