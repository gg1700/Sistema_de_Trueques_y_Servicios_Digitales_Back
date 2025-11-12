import * as dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || 
    new PrismaClient({ 
        log: ['error', 'warn'],
    });

if(process.env.NODE_ENV !== 'production'){
    globalForPrisma.prisma = prisma;
}

async function connectToDatabase() {
    //const URI = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@aws-1-us-east-2.pooler.supabase.com:5432/postgres`;
    try{
        await prisma.$connect();
        console.info('Connection Successful.');
        return prisma;
    }catch(err){
        console.error('Connection Errror to the Database:', err);
        throw err;
    }
}

export default connectToDatabase;