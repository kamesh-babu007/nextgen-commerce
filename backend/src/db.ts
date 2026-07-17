import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// 1. Initialize a native connection pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// 2. Wrap the pool with the Prisma adapter
const adapter = new PrismaPg(pool);

// 3. Pass the adapter into the Prisma Client
const prisma = new PrismaClient({ adapter });

export default prisma;