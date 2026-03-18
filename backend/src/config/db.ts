import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('PostgreSQL (Supabase) Connected...');
  } catch (err: any) {
    console.error(err.message);
    process.exit(1);
  }
};

export default prisma;
