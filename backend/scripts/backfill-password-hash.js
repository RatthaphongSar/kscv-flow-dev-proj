// backend/scripts/backfill-password-hash.js
import bcrypt from 'bcryptjs'
import { prisma } from '../src/db.js' // ปรับ path ให้ตรงโปรเจ็กต์คุณ

async function main() {
  const users = await prisma.user.findMany({
    where: { passwordHash: null },
    select: { id: true, username: true }
  })

  if (users.length === 0) {
    console.log('No users to backfill.')
    return
  }

  for (const u of users) {
    // ตั้งรหัสผ่านชั่วคราวสำหรับผู้ใช้เก่า (แก้ตามจริงได้)
    const tempPassword = 'kvc2025!'
    const hash = await bcrypt.hash(tempPassword, 12)
    await prisma.user.update({
      where: { id: u.id },
      data: { passwordHash: hash }
    })
    console.log(`Backfilled passwordHash for ${u.username}`)
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => prisma.$disconnect())
