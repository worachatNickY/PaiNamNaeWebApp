const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // ตั้งค่า Admin ที่นี่
    const adminData = {
      email: 'admin@painamnae.com',
      username: 'adminpn',  // เปลี่ยนเป็น 6 ตัวอักษร
      password: 'Admin123!',
      firstName: 'Admin',
      lastName: 'PaiNamNae',
      phoneNumber: '0800000000',
    };

    // Hash password
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    // สร้างหรืออัพเดท Admin
    const admin = await prisma.user.upsert({
      where: { email: adminData.email },
      update: {
        role: 'ADMIN',
        username: adminData.username,
        password: hashedPassword,
      },
      create: {
        email: adminData.email,
        username: adminData.username,
        password: hashedPassword,
        firstName: adminData.firstName,
        lastName: adminData.lastName,
        phoneNumber: adminData.phoneNumber,
        role: 'ADMIN',
        isActive: true,
        isVerified: true,
      },
    });

    console.log('✅ Admin created successfully!');
    console.log('----------------------------');
    console.log('Email:', adminData.email);
    console.log('Username:', adminData.username);
    console.log('Password:', adminData.password);
    console.log('----------------------------');
    
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
