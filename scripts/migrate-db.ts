import { sql } from '@vercel/postgres';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env.local
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');

envContent.split('\n').forEach((line) => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
    }
  }
});

async function migrate() {
  try {
    console.log('🔄 Starting database migration...');

    const schemaSQL = fs.readFileSync(
      path.join(__dirname, 'init-db.sql'),
      'utf-8'
    );

    await sql.query(schemaSQL);

    console.log('✅ Database migration successful!');
    console.log('✅ Tables created: conversations, messages, feedback');
    console.log('✅ Indexes created');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
