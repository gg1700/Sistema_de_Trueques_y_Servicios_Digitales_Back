import Server from './config/server.config';
import connectToDatabase, { prisma } from './database';

import { PORT } from './config/env.config';

async function startServer() {
    try {
        const server = Server.listen(PORT, () => {
            console.info(`Server running on port: ${PORT}`);
        });

        // Keep the process alive just in case
        setInterval(() => { }, 1000 * 60 * 60);
    } catch (err) {
        console.error('Error starting server:', err);
        process.exit(1);
    }
}

// Start the server
startServer().catch(err => {
    console.error('Fatal error during server startup:', err);
    process.exit(1);
});

process.on('SIGTERM', async () => {
    console.info('SIGTERM received, closing gracefully.');
    await prisma.$disconnect();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.info('SIGINT received, closing gracefully.');
    await prisma.$disconnect();
    process.exit(0);
});

process.on('exit', (code) => {
    console.info(`Process exiting with code: ${code}`);
});