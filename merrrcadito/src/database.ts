import * as dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

export const prisma = new PrismaClient();

async function connectToDatabase() {
    //const URI = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@aws-1-us-east-2.pooler.supabase.com:5432/postgres`;
    try{
        await prisma.$connect();
        console.info('Connection Successful.');
        return prisma;
    }catch(err){
        console.error('Connection Errror to the Database:', err);
        process.exit(1);
    }
}

export default connectToDatabase;