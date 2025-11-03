import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clear existing data (optional - be careful in production)
  await prisma.bookingItem.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.labTest.deleteMany()
  await prisma.test.deleteMany()
  await prisma.lab.deleteMany()

  // Create Tests
  const tests = await Promise.all([
    prisma.test.create({
      data: {
        name: 'Complete Blood Count (CBC)',
        description: 'A comprehensive blood test that evaluates your overall health and detects a variety of disorders.',
        category: 'Blood Test',
        price: 299,
        duration: 1,
        isActive: true,
      },
    }),
    prisma.test.create({
      data: {
        name: 'Lipid Profile',
        description: 'Measures cholesterol levels including HDL, LDL, and triglycerides.',
        category: 'Blood Test',
        price: 399,
        duration: 1,
        isActive: true,
      },
    }),
    prisma.test.create({
      data: {
        name: 'Blood Sugar (Fasting)',
        description: 'Measures glucose levels after fasting for 8 hours.',
        category: 'Diabetes Test',
        price: 149,
        duration: 1,
        isActive: true,
      },
    }),
    prisma.test.create({
      data: {
        name: 'HbA1c (Glycated Hemoglobin)',
        description: 'Measures average blood sugar levels over the past 2-3 months.',
        category: 'Diabetes Test',
        price: 499,
        duration: 2,
        isActive: true,
      },
    }),
    prisma.test.create({
      data: {
        name: 'Thyroid Profile (T3, T4, TSH)',
        description: 'Comprehensive thyroid function test to check hormone levels.',
        category: 'Hormone Test',
        price: 599,
        duration: 2,
        isActive: true,
      },
    }),
    prisma.test.create({
      data: {
        name: 'Vitamin D (25-Hydroxy)',
        description: 'Measures the amount of vitamin D in your blood.',
        category: 'Vitamin Test',
        price: 899,
        duration: 2,
        isActive: true,
      },
    }),
    prisma.test.create({
      data: {
        name: 'Liver Function Test (LFT)',
        description: 'Panel of tests to assess liver health and function.',
        category: 'Liver Test',
        price: 449,
        duration: 1,
        isActive: true,
      },
    }),
    prisma.test.create({
      data: {
        name: 'Kidney Function Test (KFT)',
        description: 'Evaluates kidney health by measuring various substances in the blood.',
        category: 'Kidney Test',
        price: 399,
        duration: 1,
        isActive: true,
      },
    }),
  ])

  console.log(`Created ${tests.length} tests`)

  // Create Labs
  const labs = await Promise.all([
    prisma.lab.create({
      data: {
        name: 'City Diagnostics Center',
        address: '123 Main Street, Sector 15',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400070',
        phone: '+91-22-1234-5678',
        email: 'mumbai@citydiagnostics.com',
        latitude: 19.0760,
        longitude: 72.8777,
        isActive: true,
      },
    }),
    prisma.lab.create({
      data: {
        name: 'Metro Health Labs',
        address: '456 Park Avenue, Koramangala',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560095',
        phone: '+91-80-2345-6789',
        email: 'bangalore@metrohealth.com',
        latitude: 12.9352,
        longitude: 77.6245,
        isActive: true,
      },
    }),
    prisma.lab.create({
      data: {
        name: 'Prime Medical Laboratory',
        address: '789 MG Road, Connaught Place',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
        phone: '+91-11-3456-7890',
        email: 'delhi@primemedical.com',
        latitude: 28.6139,
        longitude: 77.2090,
        isActive: true,
      },
    }),
    prisma.lab.create({
      data: {
        name: 'Wellness Diagnostic Hub',
        address: '321 Whitefield Main Road',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560066',
        phone: '+91-80-4567-8901',
        email: 'whitefield@wellnesshub.com',
        latitude: 12.9698,
        longitude: 77.7499,
        isActive: true,
      },
    }),
    prisma.lab.create({
      data: {
        name: 'Alpha Health Diagnostics',
        address: '654 Andheri West, Link Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400053',
        phone: '+91-22-5678-9012',
        email: 'andheri@alphahealth.com',
        latitude: 19.1334,
        longitude: 72.8267,
        isActive: true,
      },
    }),
  ])

  console.log(`Created ${labs.length} labs`)

  // Create Lab-Test associations
  const labTests = []
  for (const lab of labs) {
    for (const test of tests) {
      labTests.push(
        prisma.labTest.create({
          data: {
            labId: lab.id,
            testId: test.id,
            isAvailable: true,
          },
        })
      )
    }
  }

  await Promise.all(labTests)
  console.log(`Created ${labTests.length} lab-test associations`)

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
