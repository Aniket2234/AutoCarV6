import { connectDB } from './db';
import { Employee } from './models/Employee';
import { RegistrationCustomer } from './models/RegistrationCustomer';
import { ServiceVisit } from './models/ServiceVisit';
import mongoose from 'mongoose';

async function addTestData() {
  try {
    await connectDB();
    
    console.log('Adding test data to database...\n');
    
    // Add one test employee
    const employee = await Employee.create({
      name: 'John Doe',
      role: 'Service Staff',
      contact: '9876543210',
      email: 'john.doe@maulicarworld.com',
      department: 'Service Department',
      salary: 35000,
      joiningDate: new Date('2024-01-15'),
      isActive: true,
    });
    console.log('✅ Created Employee:', {
      id: employee._id,
      name: employee.name,
      role: employee.role,
      department: employee.department,
      salary: employee.salary
    });
    
    // Add one test customer
    const customer = await RegistrationCustomer.create({
      referenceCode: 'CUST001',
      fullName: 'Rajesh Kumar',
      mobileNumber: '9123456789',
      alternativeNumber: '9876543211',
      email: 'rajesh.kumar@example.com',
      address: '123 Main Street',
      city: 'Mumbai',
      taluka: 'Mumbai',
      district: 'Mumbai',
      state: 'Maharashtra',
      pinCode: '400001',
      isVerified: true,
    });
    console.log('\n✅ Created Customer:', {
      id: customer._id,
      referenceCode: customer.referenceCode,
      fullName: customer.fullName,
      mobileNumber: customer.mobileNumber
    });
    
    // Add one test service visit
    const serviceVisit = await ServiceVisit.create({
      customerId: customer._id,
      vehicleReg: 'MH-01-AB-1234',
      status: 'inquired',
      handlerId: employee._id,
      notes: 'Customer inquired about general service',
      totalAmount: 5000,
    });
    console.log('\n✅ Created Service Visit:', {
      id: serviceVisit._id,
      customerId: serviceVisit.customerId,
      vehicleReg: serviceVisit.vehicleReg,
      status: serviceVisit.status,
      handlerId: serviceVisit.handlerId
    });
    
    console.log('\n🎉 Test data added successfully!');
    console.log('\nSummary:');
    console.log('- 1 Employee added');
    console.log('- 1 Customer added');
    console.log('- 1 Service Visit added');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding test data:', error);
    process.exit(1);
  }
}

addTestData();
