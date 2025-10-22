# Mauli Car World - Car Parts & Service Management System

## Overview
Mauli Car World is a comprehensive full-stack web application for auto repair shops, designed to streamline operations and enhance customer satisfaction. It efficiently manages car parts inventory, customer relationships, service workflows, employee management, and sales tracking. The system supports multiple user roles with tailored views and permissions, providing a professional dashboard for all automotive service business operations. The project aims to empower small to medium-sized repair businesses by optimizing their efficiency.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
The frontend is built with React (18+) and Vite, using TypeScript and Wouter for routing. TanStack Query manages server state. The UI leverages Shadcn/ui components (based on Radix UI primitives) and Tailwind CSS, adopting a dark-mode-first, information-dense design with a consistent aesthetic (thick orange borders, gradient backgrounds).

### Backend
The backend is an Express.js RESTful API server, written in TypeScript. It features a middleware-based system for logging, error handling, and JSON parsing. API endpoints follow resource-based patterns for CRUD operations, with an inactivity timeout for non-admin users.

### Database
The application exclusively uses MongoDB with Mongoose ODM, employing a singleton pattern for connection management. Schemas include validation, hooks, virtual fields, and reference-based relationships.

### Data Models & Schemas
Core entities include:
- **Product**: Multi-image support, variants, barcode, compatibility, warranty, detailed inventory tracking.
- **RegistrationCustomer**: Referral source tracking, auto-generated IDs.
- **RegistrationVehicle**: Linked to customers, auto-generated unique Vehicle IDs (VEH001, etc.), variant (Top/Base), color, dynamic fields (selected parts, chassis numbers). `Zod` is used for validation.
- **Employee**: Auto-generated IDs, photo upload, status, performance logs.
- **ServiceVisit**: Before/after image support.
- **Order, InventoryTransaction, ProductReturn, Supplier, PurchaseOrder, Attendance, Leave, Task, CommunicationLog, Feedback.**
- **Invoice**: Auto-numbered (INV/2025/0001), discount/coupon support, tax calculation, approval workflow, multi-payment tracking, automatic professional PDF generation on approval, auto-linked warranty.
- **Coupon**: Discount codes, usage limits, expiry dates.
- **Warranty**: Auto-linked to invoices for applicable products.

### Authentication & Authorization
The system uses session-based authentication with Express sessions and secure HTTP-only cookies. Passwords are hashed with bcryptjs. Role-Based Access Control (RBAC) defines five roles: Admin, Inventory Manager, Sales Executive, HR Manager, and Service Staff, each with granular permissions. All logins require mandatory two-step OTP verification via WhatsApp to the user's registered mobile number using the `roleotp` template.

### UI/UX Decisions
Global card styling includes `border-2 border-orange-300 dark:border-orange-700`. Vehicle images use `object-contain` and gradient backgrounds. Responsive layouts, forms with conditional fields, dynamic dropdowns, live image previews (base64 encoded), and a dedicated document viewer are implemented. The customer registration flow supports multiple vehicles per customer with a visual progress bar and phase indicators for service status.

### Invoicing & Billing Module
A comprehensive invoicing system automates invoice numbering, supports multi-payment types (UPI, Cash, Card, Net Banking, Cheque), and features an approval workflow. It includes discount/coupon application, tax calculation, payment recording, and automatic warranty creation upon approval. Professional PDF invoices are automatically generated and stored. Admin users have full control, while Sales Executives can create invoices and record payments. A stub for Razorpay integration is included.

### Activity Tracking
A comprehensive activity logging system tracks all user actions (CRUD operations, login/logout) across key modules (Employees, Products, Orders, Service Visits, Suppliers, Purchase Orders). The admin dashboard features an `ActivityFeed` component displaying real-time activities with role-based badges, action-based indicators, resource icons, and "time ago" formatting.

## External Dependencies

-   **Database**: MongoDB (via Mongoose)
-   **UI Components**: Radix UI, Shadcn/ui, Tailwind CSS, Lucide React
-   **State & Data Management**: TanStack Query, React Hook Form, Zod
-   **Date & Time**: date-fns
-   **PDF Generation**: PDFKit
-   **WhatsApp Integration**: CloudAPI (https://cloudapi.akst.in/) for OTP and customer notifications (using `otptest`, `crmtestingcustomer`, and `roleotp` templates)
-   **Development Tools**: Vite, esbuild, TypeScript
-   **Deployment**: Vercel
-   **Security**: bcryptjs