import 'dotenv/config';
import { db, migrate } from './schema.js';
import { resetAndSeed } from './seed.js';

migrate();
resetAndSeed(db);
console.log('Database reset and seeded');
