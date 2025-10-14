import { connectDB } from './db';
import { Employee } from './models/Employee';
import { RegistrationCustomer } from './models/RegistrationCustomer';
import { ServiceVisit } from './models/ServiceVisit';
import { RegistrationVehicle } from './models/RegistrationVehicle';
import mongoose from 'mongoose';

async function cleanupDatabase() {
  try {
    await connectDB();
    
    console.log('Starting database cleanup...');
    
    // Delete all employees
    const employeesDeleted = await Employee.deleteMany({});
    console.log(`✅ Deleted ${employeesDeleted.deletedCount} employees`);
    
    // Delete all customers
    const customersDeleted = await RegistrationCustomer.deleteMany({});
    console.log(`✅ Deleted ${customersDeleted.deletedCount} customers`);
    
    // Delete all service visits
    const serviceVisitsDeleted = await ServiceVisit.deleteMany({});
    console.log(`✅ Deleted ${serviceVisitsDeleted.deletedCount} service visits`);
    
    // Delete all vehicles
    const vehiclesDeleted = await RegistrationVehicle.deleteMany({});
    console.log(`✅ Deleted ${vehiclesDeleted.deletedCount} vehicles`);
    
    console.log('\n🎉 Database cleanup completed successfully!');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error cleaning database:', error);
    process.exit(1);
  }
}

cleanupDatabase();
