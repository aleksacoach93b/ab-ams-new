import { PrismaClient, UserRole } from '@prisma/client'
import { hashPassword } from '../src/lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create default admin user
  const adminPassword = await hashPassword('admin123')
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@ab-athletes.com' },
    update: {},
    create: {
      email: 'admin@ab-athletes.com',
      password: adminPassword,
      role: UserRole.ADMIN,
      firstName: 'Admin',
      lastName: 'User',
      isActive: true,
      emailVerified: true,
    },
  })

  // Create coach user with provided credentials
  const coachPassword = await hashPassword('Teodor2025')
  
  const coachUser = await prisma.user.upsert({
    where: { email: 'aleksacoach@gmail.com' },
    update: {},
    create: {
      email: 'aleksacoach@gmail.com',
      password: coachPassword,
      role: UserRole.COACH,
      firstName: 'Aleksa',
      lastName: 'Coach',
      isActive: true,
      emailVerified: true,
    },
  })

  // Create default team
  let team = await prisma.team.findFirst({
    where: { name: 'Default Team' },
  })

  if (!team) {
    team = await prisma.team.create({
      data: {
        name: 'Default Team',
        color: '#dc2626', // Red color
        description: 'Default team for the AB Athlete Management System',
      },
    })
  }

  // Create coach profile
  await prisma.coach.upsert({
    where: { userId: coachUser.id },
    update: {},
    create: {
      userId: coachUser.id,
      firstName: 'Aleksa',
      lastName: 'Coach',
      email: 'aleksacoach@gmail.com',
      coachType: 'Head Coach',
      specialization: 'General Training',
      experience: 10,
    },
  })

  console.log('✅ Database seeded successfully!')
  console.log('\n📋 Default Login Credentials:')
  console.log('👑 Admin Account:')
  console.log('   Email: admin@ab-athletes.com')
  console.log('   Password: admin123')
  console.log('\n👨‍🏫 Coach Account:')
  console.log('   Email: aleksacoach@gmail.com')
  console.log('   Password: Teodor2025')
  console.log('\n🔗 Login URL: http://localhost:3000/login')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
