import Server from './config/server.config';
import connectToDatabase, { prisma } from './database';

import { PORT } from './config/env.config';

async function startServer(){
    try{
        Server.listen(PORT, () => {
            console.info(`Server running on port: ${PORT}`);
        });
    }catch(err){
        console.error('Error starting server:', err);
        process.exit(1);
    }
}

connectToDatabase();
startServer();

process.on('SIGTERM', async () => {
    console.info('SIGTERM received, closing gracefully.');
    await prisma.$disconnect();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.info('SIGINT recived, clossing gracefully.');
    await prisma.$disconnect();
    process.exit(0);
});