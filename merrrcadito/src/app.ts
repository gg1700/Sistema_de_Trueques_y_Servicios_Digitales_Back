import Server from './config/server.config';
import connectToDatabase, { prisma } from './database';

import { PORT } from './config/env.config';

// Fix para serializar BigInt en JSON
(BigInt.prototype as any).toJSON = function () {
    return Number(this);
};


async function startServer() {
    try {
        // Start the Express server and keep it running
        return new Promise<void>((resolve, reject) => {
            const serverInstance = Server.listen(PORT, async () => {
                console.info(`Server running on port: ${PORT}`);

                // Connect to database after server starts to match original log order
                try {
                    await connectToDatabase();
                } catch (error) {
                    console.error('Database connection failed:', error);
                    process.exit(1);
                }

                // Don't resolve - keep the promise pending to maintain the process
            });

            serverInstance.on('error', (error) => {
                console.error('Server error:', error);
                reject(error);
            });
        });
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
    console.info('SIGINT recived, clossing gracefully.');
    await prisma.$disconnect();
    process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // No exit here, just log
});