// Seed script - creates initial admin and student accounts with proper bcrypt hashes
// Run with: node src/seed.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./utils/db');

async function seed() {
  await db.initialize();

  const password = await bcrypt.hash('password123', 10);
  console.log('Bcrypt hash for "password123":', password);
  console.log('\nUse this hash to update the sample_data.sql file if needed.');
  console.log('Or run the sample_data.sql as-is (the pre-set hash will work with bcrypt.compare).');

  // You can also insert directly:
  // await db.execute(
  //   `UPDATE admins SET password = :pwd`,
  //   { pwd: password }
  // );
  // await db.execute(
  //   `UPDATE students SET password = :pwd`,
  //   { pwd: password }
  // );

  await db.close();
  console.log('\nSeed complete.');
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
