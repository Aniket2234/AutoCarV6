import { connectDB } from './db';
import { Employee } from './models/Employee';
import { User } from './models/User';
import { createUser } from './auth';

async function migrateEmployeesToUsers() {
  try {
    await connectDB();
    console.log('🔄 Starting employee to user migration...\n');

    const employees = await Employee.find();
    console.log(`Found ${employees.length} employees to migrate\n`);

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const employee of employees) {
      try {
        const existingUser = await User.findOne({ email: employee.email });

        if (existingUser) {
          console.log(`⏭️  Skipping ${employee.name} - user already exists (${employee.email})`);
          
          await User.findByIdAndUpdate(existingUser._id, {
            employeeId: employee.employeeId || existingUser.employeeId,
            department: employee.department,
            salary: employee.salary,
            joiningDate: employee.joiningDate,
            panNumber: employee.panNumber,
            aadharNumber: employee.aadharNumber,
            photo: employee.photo,
            documents: employee.documents,
            role: employee.role,
            isActive: employee.isActive,
          });
          console.log(`   ✅ Updated existing user with employee data`);
          skipped++;
          continue;
        }

        if (!employee.email) {
          console.log(`⚠️  Skipping ${employee.name} - no email address`);
          skipped++;
          continue;
        }

        const defaultPassword = `${employee.name.split(' ')[0].toLowerCase()}123`;
        
        const user = await createUser(
          employee.email,
          defaultPassword,
          employee.name,
          employee.role,
          employee.contact
        );

        await User.findByIdAndUpdate(user._id, {
          employeeId: employee.employeeId,
          department: employee.department,
          salary: employee.salary,
          joiningDate: employee.joiningDate,
          panNumber: employee.panNumber,
          aadharNumber: employee.aadharNumber,
          photo: employee.photo,
          documents: employee.documents,
          isActive: employee.isActive,
        });

        console.log(`✅ Migrated ${employee.name} (${employee.email}) - Password: ${defaultPassword}`);
        migrated++;

      } catch (error: any) {
        console.error(`❌ Error migrating ${employee.name}:`, error.message);
        errors++;
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   Migrated: ${migrated}`);
    console.log(`   Skipped (already exists): ${skipped}`);
    console.log(`   Errors: ${errors}`);
    console.log(`   Total: ${employees.length}`);

    console.log('\n🎉 Migration completed!');
    console.log('\nℹ️  NOTE: Default passwords follow the pattern: firstname123');
    console.log('   Example: "Amit Sharma" → password: "amit123"\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

migrateEmployeesToUsers();
