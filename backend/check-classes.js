import { prisma } from './src/db.js'

async function main() {
  try {
    const classes = await prisma.class.findMany()
    console.log('Classes:', JSON.stringify(classes, null, 2))
    
    const enrollments = await prisma.classEnrollment.findMany()
    console.log('Enrollments:', JSON.stringify(enrollments, null, 2))
  } catch (e) {
    console.error('Error:', e.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
