-- ============================================================
-- KVC WebApp - Student User & Login SQL Scripts
-- ============================================================

-- ============================================================
-- 1. CREATE SAMPLE STUDENT USER (without password)
-- ============================================================

INSERT INTO "User" (
  "id",
  "username",
  "email",
  "phone",
  "role",
  "year",
  "major",
  "fullname",
  "studentId",
  "address",
  "createdAt",
  "updatedAt"
) VALUES (
  'student-001',
  'alice_smith',
  'alice@kvc.ac.th',
  '081234567890',
  'STUDENT',
  1,
  'Information Technology',
  'Alice Smith',
  'STU001',
  '123/4 Moo 5, Kalasin province',
  NOW(),
  NOW()
);

-- ============================================================
-- 2. CREATE STUDENT WITH PASSWORD HASH
-- ============================================================
-- Note: ใช้ bcrypt hash จากการ login ครั้งแรก หรือ generate ดังนี้:
-- node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('password123', 10).then(console.log)"
-- Result: $2a$10$... (เปลี่ยน password123 เป็นรหัสผ่านที่ต้องการ)

INSERT INTO "User" (
  "id",
  "username",
  "passwordHash",
  "email",
  "phone",
  "role",
  "year",
  "major",
  "fullname",
  "studentId",
  "address",
  "avatar",
  "createdAt",
  "updatedAt"
) VALUES (
  'student-002',
  'bob_johnson',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36jbMeI.', -- hashed "password"
  'bob@kvc.ac.th',
  '089876543210',
  'STUDENT',
  2,
  'Business Administration',
  'Bob Johnson',
  'STU002',
  '456/7 Moo 2, Kalasin province',
  'https://api.example.com/avatars/bob.jpg',
  NOW(),
  NOW()
);

-- ============================================================
-- 3. CREATE MULTIPLE STUDENTS AT ONCE
-- ============================================================

INSERT INTO "User" (
  "id",
  "username",
  "passwordHash",
  "email",
  "phone",
  "role",
  "year",
  "major",
  "fullname",
  "studentId",
  "createdAt",
  "updatedAt"
) VALUES
  ('student-003', 'charlie_brown', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36jbMeI.', 'charlie@kvc.ac.th', '082111111111', 'STUDENT', 1, 'Nursing', 'Charlie Brown', 'STU003', NOW(), NOW()),
  ('student-004', 'diana_prince', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36jbMeI.', 'diana@kvc.ac.th', '082222222222', 'STUDENT', 3, 'Engineering', 'Diana Prince', 'STU004', NOW(), NOW()),
  ('student-005', 'evan_tech', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36jbMeI.', 'evan@kvc.ac.th', '082333333333', 'STUDENT', 2, 'Information Technology', 'Evan Tech', 'STU005', NOW(), NOW());

-- ============================================================
-- 4. CREATE TEACHER USER
-- ============================================================

INSERT INTO "User" (
  "id",
  "username",
  "passwordHash",
  "email",
  "phone",
  "role",
  "year",
  "major",
  "fullname",
  "address",
  "createdAt",
  "updatedAt"
) VALUES (
  'teacher-001',
  'prof_smith',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36jbMeI.', -- hashed "password"
  'prof.smith@kvc.ac.th',
  '087777777777',
  'TEACHER',
  0,
  'General',
  'Professor Smith',
  '789/1 Kalasin city',
  NOW(),
  NOW()
);

-- ============================================================
-- 5. CREATE ADMIN USER
-- ============================================================

INSERT INTO "User" (
  "id",
  "username",
  "passwordHash",
  "email",
  "phone",
  "role",
  "year",
  "major",
  "fullname",
  "address",
  "createdAt",
  "updatedAt"
) VALUES (
  'admin-001',
  'admin_system',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36jbMeI.', -- hashed "password"
  'admin@kvc.ac.th',
  '081000000000',
  'ADMIN',
  0,
  'General',
  'System Administrator',
  'Kalasin Admin Office',
  NOW(),
  NOW()
);

-- ============================================================
-- 6. UPDATE EXISTING USER PASSWORD
-- ============================================================
-- ⚠️  Generate new hash: node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('newpassword', 10).then(console.log)"

UPDATE "User"
SET "passwordHash" = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36jbMeI.',
    "updatedAt" = NOW()
WHERE "username" = 'alice_smith';

-- ============================================================
-- 7. UPDATE USER PROFILE
-- ============================================================

UPDATE "User"
SET 
  "fullname" = 'Alice Marie Smith',
  "phone" = '081234567891',
  "address" = '999/9 New Address, Kalasin',
  "updatedAt" = NOW()
WHERE "id" = 'student-001';

-- ============================================================
-- 8. RETRIEVE USER BY USERNAME (for login)
-- ============================================================

SELECT 
  "id",
  "username",
  "passwordHash",
  "email",
  "role",
  "year",
  "major",
  "fullname",
  "studentId",
  "avatar"
FROM "User"
WHERE "username" = 'alice_smith';

-- ============================================================
-- 9. RETRIEVE USER BY EMAIL (alternative login)
-- ============================================================

SELECT 
  "id",
  "username",
  "passwordHash",
  "email",
  "role",
  "year",
  "major",
  "fullname"
FROM "User"
WHERE "email" = 'alice@kvc.ac.th';

-- ============================================================
-- 10. LIST ALL STUDENTS
-- ============================================================

SELECT 
  "id",
  "username",
  "email",
  "fullname",
  "studentId",
  "year",
  "major",
  "createdAt"
FROM "User"
WHERE "role" = 'STUDENT'
ORDER BY "createdAt" DESC;

-- ============================================================
-- 11. LIST STUDENTS BY YEAR
-- ============================================================

SELECT 
  "id",
  "username",
  "fullname",
  "studentId",
  "major"
FROM "User"
WHERE "role" = 'STUDENT' AND "year" = 1
ORDER BY "major", "fullname";

-- ============================================================
-- 12. COUNT STUDENTS BY MAJOR
-- ============================================================

SELECT 
  "major",
  COUNT(*) as "count"
FROM "User"
WHERE "role" = 'STUDENT'
GROUP BY "major"
ORDER BY "count" DESC;

-- ============================================================
-- 13. DELETE USER (be careful!)
-- ============================================================

DELETE FROM "User"
WHERE "id" = 'student-999';

-- ============================================================
-- 14. UPDATE USER AVATAR
-- ============================================================

UPDATE "User"
SET "avatar" = 'https://api.example.com/avatars/alice-new.jpg',
    "updatedAt" = NOW()
WHERE "username" = 'alice_smith';

-- ============================================================
-- 15. DISABLE USER (if soft delete exists)
-- ============================================================
-- Note: ชั่วคราว (ต้องเพิ่ม column isActive ในตาราถ้าต้องการ)

-- ALTER TABLE "User" ADD COLUMN "isActive" BOOLEAN DEFAULT true;

-- UPDATE "User"
-- SET "isActive" = false
-- WHERE "id" = 'student-999';

-- ============================================================
-- HOW TO GENERATE PASSWORD HASH
-- ============================================================
-- 
-- ใช้ Node.js:
-- node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('mypassword123', 10).then(h => console.log(h))"
--
-- Result example:
-- $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36jbMeI.
--
-- Replace 'mypassword123' with your desired password
-- Replace the hash in SQL INSERT/UPDATE statements above

-- ============================================================
-- SAMPLE LOGIN CREDENTIALS (for testing)
-- ============================================================
--
-- Username: alice_smith
-- Password: password
-- Hash: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36jbMeI.
--
-- Username: bob_johnson
-- Password: password
-- Hash: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36jbMeI.
--
-- Username: prof_smith (Teacher)
-- Password: password
-- Hash: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36jbMeI.
--
-- Username: admin_system (Admin)
-- Password: password
-- Hash: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36jbMeI.

-- ============================================================
-- END OF SCRIPT
-- ============================================================
