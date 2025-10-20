# Mauli Car World - Car Parts & Service Management System

## Overview
Mauli Car World is a comprehensive full-stack web application for auto repair shops. It efficiently manages car parts inventory, customer relationships, service workflows, employee management, and sales tracking. The system supports multiple user roles (administrators, inventory managers, sales executives, HR managers, and service staff) with tailored views and permissions, providing a professional dashboard for all automotive service business operations. The business vision is to streamline operations for auto repair shops, enhancing efficiency and customer satisfaction, with market potential in small to medium-sized repair businesses.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built with **React (18+)** and **Vite**, utilizing **TypeScript** for type safety and **Wouter** for client-side routing. **TanStack Query** manages server state. The UI uses **Shadcn/ui** components based on **Radix UI primitives** and styled with **Tailwind CSS**, following a dark-mode-first, information-dense design. It includes a custom theme provider, custom hooks, and maintains a consistent aesthetic with thick orange borders and gradient backgrounds for cards and vehicle images. Features include WhatsApp-style image cropping for employee photos and enhanced customer details displays.

### Backend Architecture
The backend is an **Express.js** RESTful API server, written in **TypeScript**. It features a middleware-based request processing system for logging, error handling, and JSON parsing. API endpoints follow resource-based patterns for CRUD operations. An inactivity timeout system automatically logs out non-admin users after 30 minutes.

### Database Layer
The application exclusively uses **MongoDB** with **Mongoose ODM**. A singleton pattern manages the connection. Schema designs incorporate validation, hooks, virtual fields, and reference-based relationships.

### Data Models & Schemas
Core entities include Product (with multi-image support, variants, barcode, compatibility, warranty, and detailed inventory tracking), RegistrationCustomer (with referral source tracking and auto-generated IDs), RegistrationVehicle (linked to customers, with **auto-generated unique Vehicle IDs** in format VEH001, VEH002, etc., plus variant (Top/Base), color, and dynamic fields like selected parts and chassis numbers), Employee (with auto-generated IDs, photo upload, status management, and performance logs), ServiceVisit (with before/after image support), Order, InventoryTransaction, ProductReturn, Supplier, PurchaseOrder, Attendance, Leave, Task, CommunicationLog, Feedback, **Invoice** (with auto-numbering INV/2025/0001, discount/coupon support, tax calculation, approval workflow, and multi-payment tracking), **Coupon** (with discount codes, usage limits, and expiry dates), and **Warranty** (auto-linked to invoices for products with warranty). **Zod** is used for validation schemas for `RegistrationCustomer` and `RegistrationVehicle`. The `isNew` field was renamed to `isNewVehicle` to resolve Mongoose warnings.

**Vehicle ID System**: Each vehicle receives a unique, auto-generated Vehicle ID (VEH001, VEH002, etc.) using a Counter-based sequence. This ID serves as the primary reference for all service records, invoices, and warranty tracking. Vehicle records also include variant (Top/Base) and color fields for comprehensive vehicle tracking.

### Authentication & Authorization
The system uses **session-based authentication** with Express sessions and secure HTTP-only cookies. Password hashing is handled by **bcryptjs**. **Role-Based Access Control (RBAC)** defines five distinct roles: Admin, Inventory Manager, Sales Executive, HR Manager, and Service Staff, each with granular permissions. Two-step OTP verification is implemented for login.

**Mobile Number OTP Authentication**: Each user role requires a unique mobile number upon creation. Users can log in using their mobile number to receive a WhatsApp OTP via the `roleotp` template. The OTP model tracks verification attempts (max 3) and expiration (10 minutes). The login flow supports both traditional email/password and mobile OTP methods, with mobile OTP providing seamless WhatsApp-based authentication for all roles.

### UI/UX Decisions
Global card styling features `border-2 border-orange-300 dark:border-orange-700`. Vehicle images use `border-2 border-orange-300 dark:border-orange-700`, `object-contain`, and gradient backgrounds. Responsive layouts are used for dashboards. Forms feature conditional fields and dynamic dropdowns. Image uploads have live previews, base64 encoding, and validation. Employee photo sizes are increased, and documents are viewed in a dedicated viewer.

### Multi-Vehicle Customer Registration
The customer registration flow supports adding multiple vehicles per customer. After entering customer information and OTP verification, users can add vehicles one at a time. The form displays the count of registered vehicles and provides options to either "Add Another Vehicle" or "Complete Registration" (shown after at least one vehicle is added). The customer dashboard displays a "+X more" badge on customer cards when they have multiple vehicles, showing additional vehicles beyond the primary one.

### Complete Activity Tracking System
A comprehensive activity logging system tracks all user actions (CRUD operations on Employees, Products, Orders, Service Visits, Suppliers, Purchase Orders, and user login/logout) with an `ActivityLog` model. An `ActivityFeed` component in the admin dashboard displays real-time activities with role-based badge colors, action-based indicators, resource icons, and "time ago" formatting. API endpoints for fetching and creating activity logs are provided.

### Invoicing & Billing Module
A comprehensive invoicing system with auto-generated invoice numbers (INV/2025/0001 format), multi-payment tracking (UPI, Cash, Card, Net Banking, Cheque), and approval workflows. **Features**: Invoice generation from service visits, discount/coupon application, tax calculation, admin approval/rejection, payment recording with transaction history, automatic warranty creation on approval, and notification stubs for WhatsApp/Email delivery. **PDF Generation**: Automatic professional PDF generation upon invoice approval, including customer details, vehicle information, itemized charges, tax breakdown, and payment details. PDFs are stored and accessible via download endpoint, with on-demand regeneration for legacy invoices. **Role-Based Access**: Admin has full control (create, approve, reject, manage coupons), Sales Executive can create invoices and record payments. **Razorpay Integration**: Stub implementation included for future payment gateway integration.

## Recent Changes (October 20, 2025)

### Customer Registration Progress Bar & Service Phase Indicators
1. **Progress Bar with Step Indicators**: Added a visual progress bar to the customer registration flow that shows:
   - Step labels (Step 1, Step 2, Step 3) with titles (Customer Info, OTP Verification, Vehicle Details)
   - Animated progress bar that fills/empties smoothly based on current step
   - Step circles with checkmarks for completed steps and dots for current step
   - Responsive design that works on all screen sizes
   - Full dark mode support with appropriate color schemes
   - Progress percentage calculation (33%, 66%, 100%)

2. **Service Status Phase Indicators**: Enhanced the StatusBadge component to display phase information:
   - Phase 1 label for "Inquired" and "Working" statuses
   - Phase 2 label for "Waiting for Parts" and "Completed" statuses
   - Clean flex layout that maintains compatibility with existing badge styling
   - Proper dark mode support for phase labels

### WhatsApp Integration for Customer Registration
1. **OTP Delivery via WhatsApp**: Implemented WhatsApp template message sending for OTP verification during customer registration using CloudAPI integration with template `otptest`
2. **Welcome Message with Customer ID**: After completing the entire registration process (including all vehicles), customers receive a WhatsApp message with their Customer ID using template `crmtestingcustomer`. The message is sent only once when the user clicks "Complete Registration" on the final success screen, not after each individual vehicle registration.
3. **Phone Number Formatting**: Automatic normalization of Indian phone numbers supporting 10-digit (9876543210), 11-digit with leading 0 (09876543210), and 12-digit with country code (919876543210) formats
4. **Comprehensive Logging**: Detailed console logging in both frontend (browser console) and backend (server logs) for complete debugging visibility of WhatsApp API calls
5. **Error Handling**: Graceful error handling with user-friendly messages if WhatsApp delivery fails, while still allowing registration to proceed
6. **Environment Configuration**: Uses `WHATSAPP_API_KEY`, `WHATSAPP_PHONE_NUMBER_ID`, and `WHATSAPP_TEMPLATE_NAME` environment variables for secure credential management
7. **Templates Used**: 
   - `otptest` - OTP verification template with button component
   - `crmtestingcustomer` - Welcome message template with customer ID (sent on registration completion)
8. **Registration Completion Endpoint**: New `/api/registration/complete` endpoint handles final registration completion and welcome message delivery, ensuring the message is sent only once after all vehicles are added

### Role-Based Mobile Number & WhatsApp OTP Login
1. **Mobile Number Assignment**: All user roles (Admin, Inventory Manager, Sales Executive, HR Manager, Service Staff) now require a unique mobile number during account creation. The mobile number field is mandatory and unique across all users.

2. **WhatsApp OTP Authentication**: Implemented secure OTP login via WhatsApp for all roles:
   - **OTP Model**: Tracks generated OTPs with 10-minute expiration, verification status, and attempt limits (max 3 attempts)
   - **WhatsApp Integration**: Uses `roleotp` template via CloudAPI to send OTPs with button component
   - **Dual Login Methods**: Login page offers both email/password and mobile OTP authentication
   - **Phone Number Normalization**: Supports 10-digit, 11-digit (with leading 0), and 12-digit (with country code) formats

3. **API Endpoints**:
   - `/api/auth/send-otp` - Sends OTP to registered mobile number
   - `/api/auth/verify-otp` - Verifies OTP and establishes session
   - Both endpoints include comprehensive logging and error handling

4. **User Management Updates**:
   - Create User form includes mobile number field with validation
   - Edit User form allows updating mobile numbers with uniqueness check
   - User list displays mobile numbers for all roles
   - Mobile numbers shown with 📱 icon in user cards

### Product Catalog & Inventory Improvements
1. **Added 10 Products to Database**: Extended the seed script to include 10 car parts products (Engine Oil Filter, Brake Pads, Air Filter, Spark Plugs, Cabin Air Filter, Engine Oil, LED Headlight Bulb, Wiper Blades, Battery, and Coolant/Antifreeze) with complete details including warehouse locations, barcodes, pricing, stock quantities, and warranty information.

2. **Enhanced Inventory UI**: Added a new "Products Catalog" tab to the Inventory Management page displaying all products in a responsive grid layout with product cards showing:
   - Product name, brand, and category
   - Stock status badges (In Stock/Low Stock/Out of Stock)
   - Current stock quantity with color-coded indicators
   - MRP and selling price with discount percentage
   - Warehouse location and barcode information
   - Warranty details

3. **Improved Invoice Generation**: Enhanced the InvoiceGenerationDialog component to allow selecting products directly from inventory when adding invoice items:
   - Product items now show a dropdown selector instead of plain text input
   - Dropdown displays only in-stock products with their prices and stock levels
   - Auto-populates productId and unit price when a product is selected
   - Service items continue to use plain text input
   - Automatically calculates item totals after product selection

## External Dependencies

-   **Database**: MongoDB (via Mongoose)
-   **UI Components**: Radix UI, Shadcn/ui, Tailwind CSS, Lucide React
-   **State & Data Management**: TanStack Query, React Hook Form, Zod
-   **Date & Time**: date-fns
-   **PDF Generation**: PDFKit
-   **WhatsApp Integration**: CloudAPI (https://cloudapi.akst.in/) for OTP and customer notifications
-   **Development Tools**: Vite, esbuild, TypeScript
-   **Deployment**: Vercel
-   **Security**: bcryptjs