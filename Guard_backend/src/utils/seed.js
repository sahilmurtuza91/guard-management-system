require('dotenv').config();

const connectDB = require('../config/db');

const User = require('../models/User');
const Agency = require('../models/Agency');
const GuardProfile = require('../models/GuardProfile');
const ClientProfile = require('../models/ClientProfile');
const Site = require('../models/Site');
const Shift = require('../models/Shift');

const run = async () => {
  try {
    await connectDB();
    console.log('🧹 Clearing all collections...');

    // Everything deleted 
    await Promise.all([
      User.deleteMany({}),
      Agency.deleteMany({}),
      GuardProfile.deleteMany({}),
      ClientProfile.deleteMany({}),
      Site.deleteMany({}),
      Shift.deleteMany({}),
    ]);

    console.log('✨ Creating exactly 3 entities...');

    // 1. Agency
    const agency = await Agency.create({
      name: 'Secure Shield Security Pvt Ltd',
      address: 'Sector 34, Chandigarh',
      contactEmail: 'contact@secureshield.com',
      contactPhone: '9999900000',
    });

    // 2. Agency Admin User
    const adminUser = await User.create({
      name: 'Rahul Sharma',
      phone: '9999900001',
      email: 'admin@secureshield.com',
      password: 'Admin@123',
      role: 'agency_admin',
      agency: agency._id,
    });

    agency.createdBy = adminUser._id;
    await agency.save();

    // 3. Guard User + Guard Profile
    const guardUser = await User.create({
      name: 'Amit Verma',
      phone: '9999900002',
      email: 'amit.guard@secureshield.com',
      password: 'Guard@123',
      role: 'guard',
      agency: agency._id,
    });

    await GuardProfile.create({
      user: guardUser._id,
      agency: agency._id,
      employeeId: 'GRD-9042',
      gender: 'Male',
      experienceYears: 5,
      address: 'Sector 22, Chandigarh',
      emergencyContact: '9999911111',
      status: 'Active',
      isVerified: true,
      isAvailable: true,
    });

    // 4. Client User + Client Profile
    const clientUser = await User.create({
      name: 'Priya Singh',
      phone: '9999900003',
      email: 'priya@gmail.com',
      password: 'Client@123',
      role: 'client',
    });

    await ClientProfile.create({
      user: clientUser._id,
      savedAddresses: [
        {
          label: 'Home',
          addressLine: 'Sector 71, Mohali, Punjab',
          latitude: 30.6954,
          longitude: 76.7247,
          isDefault: true,
        },
      ],
    });

    console.log('\n========================================');
    console.log('      SEED COMPLETE (ONLY 3 USERS)      ');
    console.log('========================================');
    console.log('Agency Admin -> Phone: 9999900001 | Pass: Admin@123');
    console.log('Guard        -> Phone: 9999900002 | Pass: Guard@123');
    console.log('Client       -> Phone: 9999900003 | Pass: Client@123');
    console.log('========================================\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

run();