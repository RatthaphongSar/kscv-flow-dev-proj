import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

(async () => {
  try {
    // Create database
    console.log('Creating database...');
    await execAsync('createdb -U postgres kvcdb');

    // Run migrations
    console.log('Running migrations...');
    await execAsync('npx prisma migrate deploy');

    // Seed test data
    console.log('Seeding data...');
    await execAsync('node scripts/seed-user.js');
    await execAsync('node scripts/backfill-password-hash.js');

    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();