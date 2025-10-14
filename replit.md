# Mauli Car World - Car Parts & Service Management System

## Overview
Mauli Car World is a comprehensive full-stack web application for auto repair shops. It efficiently manages car parts inventory, customer relationships, service workflows, employee management, and sales tracking. The system supports multiple user roles (administrators, inventory managers, sales executives, HR managers, and service staff) with tailored views and permissions, providing a professional dashboard for all automotive service business operations. The business vision is to streamline operations for auto repair shops, enhancing efficiency and customer satisfaction, with market potential in small to medium-sized repair businesses.

## Recent Changes
**October 14, 2025** - Advanced Vehicle Registration Features:
- **Optional Vehicle Number for New Vehicles**: Vehicle number field is now optional for new vehicles and only required for used vehicles. Backend validation updated to skip uniqueness check when vehicle number is not provided.
- **Comprehensive Vehicle Data System**: Created extensive vehicle database with 15+ popular Indian brands (Mahindra, Maruti Suzuki, Hyundai, Tata, Kia, Honda, Toyota, etc.), their popular models (100+ models total), and 30+ common vehicle parts/accessories organized by category (Exterior, Lights, Body Parts, Interior, Maintenance).
- **Smart Brand & Model Selection**: Vehicle brand dropdown with dynamic model selection based on chosen brand. Model dropdown includes "Other" option that reveals a custom model text input field when selected.
- **Parts Selection for Service Planning**: After selecting vehicle model, users can select multiple parts/accessories that need service or replacement using an organized checkbox grid. Parts are categorized (Exterior, Lights, Body Parts, etc.) for easy selection. Includes parts like Front Bumper Guard, Head Light, DRL Light, Roof Rail, Side Step, Floor Mat, Seat Cover, etc.
- **Enhanced Data Model**: Added `customModel` field for custom vehicle model names, `selectedParts` array to store selected part IDs for service planning. All data persists to MongoDB and is available for service planning and inventory management.
- **Improved UX Flow**: Reordered form fields to show vehicle condition first, followed by conditional fields. Vehicle number only shows for used vehicles, chassis number only shows for new vehicles, custom model only shows when "Other" is selected, and parts selection only shows after model selection.

**October 13, 2025** - New Features Implementation:
- **Service Visit Before/After Images**: Added beforeImages and afterImages arrays to ServiceVisit MongoDB model for documenting vehicle condition. Service visit dialog now includes image upload with live preview, delete functionality, and strict validation (PNG/JPEG/GIF/WebP formats, 5MB limit per image, proper base64 encoding). Images persist via PATCH route with comprehensive validation.
- **Vehicle Registration Enhancement**: Added isNew boolean and chassisNumber fields to RegistrationVehicle model. Registration form now includes "Vehicle Condition" dropdown (New/Used) with conditional chassis number field (required for new vehicles only). Zod schema validation with refinement ensures data integrity, boolean coercion before MongoDB persistence.
- **OTP Login Verification**: Implemented two-step authentication: credentials entry followed by OTP verification. Currently uses dummy OTP (123456) for development, displayed in toast notification and form. Proper state management, error handling, and loading states throughout the flow. Production-ready structure awaiting real OTP delivery integration.

**October 11, 2025** - Universal Card Border Styling:
- **Global Card Borders**: Updated Card component to apply thick orange borders (`border-2 border-orange-300 dark:border-orange-700`) to ALL cards throughout the application
- **Consistent Thickness**: All cards now have 2px border thickness for better visibility and visual hierarchy
- **Orange Theme**: Cards across all modules (Dashboard, Products, Inventory, Customers, Service Visits, Orders, Employees, etc.) now use orange borders matching the customer registration cards
- **Light & Dark Mode**: Border styling works perfectly in both themes with appropriate color variants
- **Component-Level Change**: Modified the base Card component (`client/src/components/ui/card.tsx`) so all cards automatically inherit the thick orange border without individual page modifications

**October 11, 2025** - Consistent Vehicle Image Border Styling:
- **Uniform Orange Borders**: All vehicle images now display consistent orange-themed borders (border-orange-300 dark:border-orange-700) throughout the entire application
- **Border Thickness**: Standardized border-2 for all vehicle image containers for visual consistency
- **Full Image Display**: All vehicle images use object-contain to display the complete vehicle without cropping
- **Gradient Backgrounds**: Consistent orange-yellow gradient backgrounds (from-orange-50 to-yellow-50 with dark mode variants) applied to all vehicle image containers
- **Enhanced Visibility**: Orange borders provide excellent visibility against both light and dark backgrounds
- **Complete Coverage**: Borders applied to customer card hero images, vehicle thumbnails in details dialog, edit dialog previews, and digital customer cards
- **Customer Card Styling**: Customer cards with vehicle images now also use orange borders for complete visual consistency

**October 11, 2025** - Vehicle Image Upload Feature:
- **Image Upload in Edit Dialog**: Added file upload functionality to vehicle photo field in customer edit dialog
- **Dual Input Support**: Edit dialog now supports both URL input and direct file upload for vehicle photos
- **Image Preview**: Real-time preview of uploaded images with same styling as vehicle cards (object-contain with gradient background)
- **Base64 Encoding**: Uploaded images are automatically converted to base64 data URLs for storage in database

**October 11, 2025** - Registration Dashboard UI Enhancements:
- **Complete Edit Dialog**: All vehicle fields (number, brand, model, year, photo) now available in admin edit dialog
- **Image Display Fix**: Changed vehicle images from object-cover to object-contain to display full image without cropping
- **Card Visibility**: Added dark borders (border-2) to customer cards for better visibility against white background
- **Verification Toggle**: Added isVerified field to admin edit dialog with Switch component allowing admins to verify/unverify customers during editing
- **Card Layout**: Replaced table view with responsive card layout (1/2/3 columns for mobile/tablet/desktop) displaying vehicle images prominently at top of each card
- **CustomerCard Component**: Created separate CustomerCard component using proper React hooks architecture (useQuery within component, not in map loop) to fetch and display vehicle data
- **Enhanced UX**: Cards now show verification badges, customer contact details, vehicle info, and action buttons (view, edit, delete) in an organized, visual format

**October 11, 2025** - Customer Registration Bug Fixes:
- **Vehicle Photo Display**: Fixed DigitalCustomerCard component to display actual uploaded vehicle photos instead of static placeholder images
- **Customer Details Dialog**: Added vehicle photo display in customer details dialog showing uploaded vehicle images with proper sizing and styling
- **Admin Edit Functionality**: Implemented complete edit dialog for admin users to update customer information with form validation, proper error handling, and automatic data refresh after updates

**October 11, 2025** - Branding Update:
- **Logo & Name Change**: Replaced "AutoParts Pro" branding with "Mauli Car World" across all pages
- **Sidebar/Dashboard Update**: Updated main dashboard sidebar to show "Mauli Car World" with custom MD wings logo
- **Visual Enhancement**: Updated logo to custom MD wings design with car illustration
- **Customer Card Enhancement**: Added car logo image to DigitalCustomerCard component with gradient background (orange-yellow theme) and enhanced visibility with border styling
- **SEO Update**: Updated page title in index.html to "Mauli Car World - Car Parts & Service Management"
- **Email Placeholder**: Updated login page email placeholder to match new domain (admin@maulicarworld.com)
- **Theme Default**: Changed default theme from dark to light for first-time visitors (existing users retain their saved preference)

**October 11, 2025** - Migrated customer registration system to MongoDB:
- **Migration to MongoDB**: Replaced in-memory storage with MongoDB for permanent data persistence
- Created RegistrationCustomer and RegistrationVehicle MongoDB models using Mongoose
- All registration API routes now use MongoDB for CRUD operations (create, read, update, delete)
- Fixed Select component errors in CustomerRegistrationDashboard (changed empty values to "all")
- Reference code generation with proper Indian state RTO codes (CUST-MH-000001 format)
- Security features: duplicate vehicle/mobile prevention, input validation, secure OTP verification
- Multi-step registration form with OTP verification workflow
- Admin dashboard with advanced filtering (city, district, state, verification status)
- Stubbed notification system (SMS/WhatsApp/Email) for future integration
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

**Customer Registration System** (MongoDB/Mongoose):
- **RegistrationCustomer Collection**: Comprehensive customer data with fields for personal information (fullName, mobileNumber, alternativeNumber, email), complete address details (address, city, taluka, district, state, pinCode), verification status (isVerified), OTP management (otp, otpExpiresAt), and auto-generated reference codes following format CUST-{StateCode}-{Counter} (e.g., CUST-MH-000001 for Maharashtra)
- **RegistrationVehicle Collection**: Vehicle registration with customerId reference, vehicleNumber (unique constraint via route validation), vehicleBrand, vehicleModel, yearOfPurchase, and vehiclePhoto. Linked to customers via customerId field
- **Reference Code System**: Uses proper Indian state RTO codes (MH for Maharashtra, GJ for Gujarat, etc.) for location-based customer identification
- **OTP Verification**: Secure OTP generation (6-digit), storage with expiry timestamps, and verification workflow
- **MongoDB Storage**: All customer and vehicle data persists to MongoDB collections for permanent storage and retrieval

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