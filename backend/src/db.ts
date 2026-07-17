import { PrismaClient } from '@prisma/client';

const options: any = {
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
};

const prisma = new PrismaClient(options);

export default prisma;
