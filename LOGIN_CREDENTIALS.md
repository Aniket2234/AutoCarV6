# Login Credentials

## Default User Accounts

The system has been seeded with the following default user accounts:

### Admin
- **Email**: `admin@autoshop.com`
- **Password**: `admin123`

### Inventory Manager
- **Email**: `inventory@autoshop.com`
- **Password**: `inventory123`

### Sales Executive
- **Email**: `sales@autoshop.com`
- **Password**: `sales123`

### HR Manager
- **Email**: `hr@autoshop.com`
- **Password**: `hr123`

### Service Staff (Support Staff)
- **Email**: `service@autoshop.com`
- **Password**: `service123`

## Login Flow

1. **Select Role**: Choose your role from the role selection page
2. **Enter Credentials**: Enter your email and password
3. **Enter OTP**: The development OTP is always `123456` (displayed on screen)
4. **Access Dashboard**: You'll be logged in and redirected to the dashboard

## Development OTP

For development purposes, the OTP is always: **123456**

This will be displayed on the screen after you enter your credentials.

## Activity Tracking

All activities performed by users are now tracked and visible to admins in the Recent Activity feed, including:
- Login/Logout
- Creating, updating, or deleting employees
- Creating, updating, or deleting products
- Creating orders
- Creating service visits
- Creating suppliers and purchase orders
- And more...

Each activity shows:
- User name with role-colored badge (Admin = purple, HR Manager = orange, etc.)
- Action performed with color-coded badge (create = green, update = blue, delete = red, login = purple)
- Description of what was done
- Time elapsed since the activity
