import { connectDB } from './db';
import { Product } from './models/Product';
import { Customer } from './models/Customer';
import { Employee } from './models/Employee';
import { ServiceVisit } from './models/ServiceVisit';
import { Order } from './models/Order';

async function seed() {
  try {
    await connectDB();
    console.log('🌱 Starting database seed...');

    await Product.deleteMany({});
    await Customer.deleteMany({});
    await Employee.deleteMany({});
    await ServiceVisit.deleteMany({});
    await Order.deleteMany({});

    const employees = await Employee.insertMany([
      {
        name: 'Amit Sharma',
        role: 'Service Staff',
        contact: '+91 98765-43210',
        email: 'amit.sharma@carshop.com',
        isActive: true,
      },
      {
        name: 'Priya Patel',
        role: 'Service Staff',
        contact: '+91 98765-43211',
        email: 'priya.patel@carshop.com',
        isActive: true,
      },
      {
        name: 'Vikram Singh',
        role: 'Inventory Manager',
        contact: '+91 98765-43212',
        email: 'vikram.singh@carshop.com',
        isActive: true,
      },
      {
        name: 'Sneha Reddy',
        role: 'Sales Executive',
        contact: '+91 98765-43213',
        email: 'sneha.reddy@carshop.com',
        isActive: true,
      },
      {
        name: 'Rahul Deshmukh',
        role: 'HR Manager',
        contact: '+91 98765-43214',
        email: 'rahul.deshmukh@carshop.com',
        isActive: false,
      },
    ]);
    console.log(`✅ Created ${employees.length} employees`);

    const products = await Product.insertMany([
      {
        name: 'Engine Oil Filter - Mann W 712/75',
        category: 'Engine Parts',
        brand: 'Mann-Filter',
        modelCompatibility: ['Maruti Swift', 'Hyundai i20', 'Honda City'],
        warranty: '6 months',
        mrp: 3500,
        sellingPrice: 2850,
        discount: 18.57,
        stockQty: 45,
        minStockLevel: 20,
        status: 'in_stock',
      },
      {
        name: 'Brake Pads Set - Front',
        category: 'Brake System',
        brand: 'Brembo',
        modelCompatibility: ['Maruti Swift', 'Maruti Baleno'],
        warranty: '1 year',
        mrp: 9500,
        sellingPrice: 7800,
        discount: 17.89,
        stockQty: 12,
        minStockLevel: 20,
        status: 'low_stock',
      },
      {
        name: 'Air Filter - K&N 33-2304',
        category: 'Engine Parts',
        brand: 'K&N',
        modelCompatibility: ['Hyundai i20', 'Hyundai Creta'],
        warranty: '1 year',
        mrp: 5200,
        sellingPrice: 4400,
        discount: 15.38,
        stockQty: 0,
        minStockLevel: 10,
        status: 'out_of_stock',
      },
      {
        name: 'Spark Plugs Set (4pc)',
        category: 'Ignition System',
        brand: 'NGK',
        modelCompatibility: ['Honda City', 'Maruti Swift', 'Hyundai i20'],
        warranty: '6 months',
        mrp: 2500,
        sellingPrice: 2280,
        discount: 8.8,
        stockQty: 28,
        minStockLevel: 15,
        status: 'in_stock',
      },
      {
        name: 'Cabin Air Filter',
        category: 'HVAC',
        brand: 'Bosch',
        modelCompatibility: ['All Models'],
        warranty: '6 months',
        mrp: 2000,
        sellingPrice: 1680,
        discount: 16,
        stockQty: 18,
        minStockLevel: 20,
        status: 'low_stock',
      },
      {
        name: 'Engine Oil 5W-30 - Mobil 1',
        category: 'Engine Parts',
        brand: 'Mobil',
        modelCompatibility: ['All Petrol Cars'],
        warranty: 'N/A',
        mrp: 4500,
        sellingPrice: 3850,
        discount: 14.44,
        stockQty: 8,
        minStockLevel: 15,
        status: 'low_stock',
      },
    ]);
    console.log(`✅ Created ${products.length} products`);

    const customers = await Customer.insertMany([
      {
        name: 'Rajesh Kumar',
        phone: '+91 98765-43210',
        email: 'rajesh.kumar@email.com',
        vehicles: [
          {
            regNo: 'MH-12-AB-1234',
            make: 'Maruti Suzuki',
            model: 'Swift',
            year: 2020,
          },
        ],
      },
      {
        name: 'Priya Patel',
        phone: '+91 98765-43211',
        email: 'priya.patel@email.com',
        vehicles: [
          {
            regNo: 'DL-8C-XY-5678',
            make: 'Hyundai',
            model: 'i20',
            year: 2019,
          },
        ],
      },
      {
        name: 'Ankit Verma',
        phone: '+91 98765-43212',
        email: 'ankit.verma@email.com',
        vehicles: [
          {
            regNo: 'KA-03-MN-9012',
            make: 'Honda',
            model: 'City',
            year: 2021,
          },
        ],
      },
      {
        name: 'Meera Iyer',
        phone: '+91 98765-43213',
        email: 'meera.iyer@email.com',
        vehicles: [
          {
            regNo: 'TN-09-GH-3456',
            make: 'Maruti Suzuki',
            model: 'Baleno',
            year: 2022,
          },
        ],
      },
      {
        name: 'Suresh Menon',
        phone: '+91 98765-43214',
        email: 'suresh.menon@email.com',
        vehicles: [
          {
            regNo: 'KL-07-JK-7890',
            make: 'Hyundai',
            model: 'Creta',
            year: 2021,
          },
        ],
      },
    ]);
    console.log(`✅ Created ${customers.length} customers`);

    const serviceVisits = await ServiceVisit.insertMany([
      {
        customerId: customers[0]._id,
        vehicleReg: 'MH-12-AB-1234',
        status: 'working',
        handlerId: employees[0]._id,
        notes: 'Oil change and filter replacement',
        partsUsed: [
          {
            productId: products[0]._id,
            quantity: 1,
            price: products[0].sellingPrice,
          },
        ],
        totalAmount: products[0].sellingPrice,
      },
      {
        customerId: customers[1]._id,
        vehicleReg: 'DL-8C-XY-5678',
        status: 'waiting',
        handlerId: employees[1]._id,
        notes: 'Waiting for brake pads delivery',
        partsUsed: [],
        totalAmount: 0,
      },
      {
        customerId: customers[2]._id,
        vehicleReg: 'KA-03-MN-9012',
        status: 'inquired',
        handlerId: employees[0]._id,
        notes: 'General service inquiry',
        partsUsed: [],
        totalAmount: 0,
      },
    ]);
    console.log(`✅ Created ${serviceVisits.length} service visits`);

    const order1 = await Order.create({
      customerId: customers[0]._id,
      customerName: customers[0].name,
      items: [
        {
          productId: products[0]._id,
          quantity: 2,
          price: products[0].sellingPrice,
        },
        {
          productId: products[3]._id,
          quantity: 1,
          price: products[3].sellingPrice,
        },
      ],
      total: products[0].sellingPrice * 2 + products[3].sellingPrice,
      paymentStatus: 'paid',
      paidAmount: products[0].sellingPrice * 2 + products[3].sellingPrice,
      salespersonId: employees[3]._id,
    });

    const order2 = await Order.create({
      customerId: customers[1]._id,
      customerName: customers[1].name,
      items: [
        {
          productId: products[1]._id,
          quantity: 1,
          price: products[1].sellingPrice,
        },
        {
          productId: products[4]._id,
          quantity: 1,
          price: products[4].sellingPrice,
        },
      ],
      total: products[1].sellingPrice + products[4].sellingPrice,
      paymentStatus: 'partial',
      paidAmount: 5000,
      salespersonId: employees[3]._id,
    });
    
    console.log(`✅ Created 2 orders`);

    console.log('🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seed();
