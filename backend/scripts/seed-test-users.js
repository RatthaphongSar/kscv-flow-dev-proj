#!/usr/bin/env node

/**
 * Seed Test Users for KVC WebApp
 * Creates 15 student users and 5 teacher users for testing
 * Password: password123 (hashed with bcrypt)
 */

import bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const STUDENTS = [
  { id: 'STU001', username: 'somchai', fullname: 'Somchai Student', email: 'somchai@kvc.ac.th' },
  { id: 'STU002', username: 'somphet', fullname: 'Somphet Student', email: 'somphet@kvc.ac.th' },
  { id: 'STU003', username: 'sunee', fullname: 'Sunee Student', email: 'sunee@kvc.ac.th' },
  { id: 'STU004', username: 'saowanee', fullname: 'Saowanee Student', email: 'saowanee@kvc.ac.th' },
  { id: 'STU005', username: 'sanit', fullname: 'Sanit Student', email: 'sanit@kvc.ac.th' },
  { id: 'STU006', username: 'samran', fullname: 'Samran Student', email: 'samran@kvc.ac.th' },
  { id: 'STU007', username: 'siriporn', fullname: 'Siriporn Student', email: 'siriporn@kvc.ac.th' },
  { id: 'STU008', username: 'suwanna', fullname: 'Suwanna Student', email: 'suwanna@kvc.ac.th' },
  { id: 'STU009', username: 'somsak', fullname: 'Somsak Student', email: 'somsak@kvc.ac.th' },
  { id: 'STU010', username: 'suplee', fullname: 'Suplee Student', email: 'suplee@kvc.ac.th' },
  { id: 'STU011', username: 'supoj', fullname: 'Supoj Student', email: 'supoj@kvc.ac.th' },
  { id: 'STU012', username: 'sudarat', fullname: 'Sudarat Student', email: 'sudarat@kvc.ac.th' },
  { id: 'STU013', username: 'sukalpa', fullname: 'Sukalpa Student', email: 'sukalpa@kvc.ac.th' },
  { id: 'STU014', username: 'sukollawat', fullname: 'Sukollawat Student', email: 'sukollawat@kvc.ac.th' },
  { id: 'STU015', username: 'surapon', fullname: 'Surapon Student', email: 'surapon@kvc.ac.th' },
]

const TEACHERS = [
  { id: 'TCH001', username: 'ananda', fullname: 'Ajarn Ananda', email: 'ananda@kvc.ac.th', department: 'Information Technology' },
  { id: 'TCH002', username: 'boonlert', fullname: 'Ajarn Boonlert', email: 'boonlert@kvc.ac.th', department: 'Business Administration' },
  { id: 'TCH003', username: 'chalee', fullname: 'Ajarn Chalee', email: 'chalee@kvc.ac.th', department: 'Engineering' },
  { id: 'TCH004', username: 'damrongchai', fullname: 'Ajarn Damrongchai', email: 'damrongchai@kvc.ac.th', department: 'Science' },
  { id: 'TCH005', username: 'eakasit', fullname: 'Ajarn Eakasit', email: 'eakasit@kvc.ac.th', department: 'Liberal Arts' },
]

async function main() {
  try {
    console.log('🌱 Starting seed for test users...\n')

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10)
    console.log('✓ Password hashed: password123 → bcrypt(10)\n')

    // Seed Students
    console.log('👨‍🎓 Seeding 15 STUDENTS...')
    for (const student of STUDENTS) {
      try {
        await prisma.user.upsert({
          where: { id: student.id },
          update: {
            username: student.username,
            fullname: student.fullname,
            email: student.email,
            passwordHash: hashedPassword,
            role: 'STUDENT',
          },
          create: {
            id: student.id,
            username: student.username,
            fullname: student.fullname,
            email: student.email,
            passwordHash: hashedPassword,
            role: 'STUDENT',
          },
        })
        console.log(`  ✓ ${student.id}: ${student.fullname} (${student.username})`)
      } catch (err) {
        console.error(`  ✗ ${student.id}: ${err.message}`)
      }
    }

    console.log('\n')

    // Seed Teachers
    console.log('👨‍🏫 Seeding 5 TEACHERS...')
    for (const teacher of TEACHERS) {
      try {
        await prisma.user.upsert({
          where: { id: teacher.id },
          update: {
            username: teacher.username,
            fullname: teacher.fullname,
            email: teacher.email,
            passwordHash: hashedPassword,
            role: 'TEACHER',
          },
          create: {
            id: teacher.id,
            username: teacher.username,
            fullname: teacher.fullname,
            email: teacher.email,
            passwordHash: hashedPassword,
            role: 'TEACHER',
          },
        })
        console.log(`  ✓ ${teacher.id}: ${teacher.fullname} (${teacher.username})`)
      } catch (err) {
        console.error(`  ✗ ${teacher.id}: ${err.message}`)
      }
    }

    console.log('\n')

    // Get statistics
    const totalUsers = await prisma.user.count()
    const studentCount = await prisma.user.count({ where: { role: 'STUDENT' } })
    const teacherCount = await prisma.user.count({ where: { role: 'TEACHER' } })

    console.log('📊 SEED SUMMARY')
    console.log('═'.repeat(50))
    console.log(`✓ Total Users: ${totalUsers}`)
    console.log(`✓ Students: ${studentCount}`)
    console.log(`✓ Teachers: ${teacherCount}`)
    console.log('═'.repeat(50))

    console.log('\n🔑 LOGIN CREDENTIALS')
    console.log('═'.repeat(50))
    console.log('Password: password123')
    console.log('\nStudent Users:')
    STUDENTS.forEach(s => console.log(`  - ID: ${s.id} | Username: ${s.username}`))
    console.log('\nTeacher Users:')
    TEACHERS.forEach(t => console.log(`  - ID: ${t.id} | Username: ${t.username}`))
    console.log('═'.repeat(50))

    console.log('\n✅ Seed completed successfully!\n')
  } catch (error) {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
