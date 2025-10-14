import { connectDB } from './db';
import { createUser } from './auth';
import { User } from './models/User';

async function createDefaultUsers() {
  try {
    await connectDB();
    console.log('🔐 Creating default user accounts...\n');

    const defaultUsers = [
      { email: 'admin@autoshop.com', password: 'admin123', name: 'Admin User', role: 'Admin' },
      { email: 'inventory@autoshop.com', password: 'inventory123', name: 'Inventory Manager', role: 'Inventory Manager' },
      { email: 'sales@autoshop.com', password: 'sales123', name: 'Sales Executive', role: 'Sales Executive' },
      { email: 'hr@autoshop.com', password: 'hr123', name: 'HR Manager', role: 'HR Manager' },
      { email: 'service@autoshop.com', password: 'service123', name: 'Service Staff', role: 'Service Staff' },
    ];

    for (const userData of defaultUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        console.log(`✓ ${userData.role} - ${userData.email} (already exists)`);
      } else {
        await createUser(userData.email, userData.password, userData.name, userData.role);
        console.log(`✓ ${userData.role} - ${userData.email} (created)`);
      }
    }

    console.log('\n✅ Default user accounts ready!');
    console.log('\nLogin Credentials:');
    console.log('==================');
    defaultUsers.forEach(user => {
      console.log(`${user.role}:`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Password: ${user.password}\n`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createDefaultUsers();
