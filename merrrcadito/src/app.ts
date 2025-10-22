import Server from './config/server.config';
import connectToDatabase from './database';

import { SERVER_PORT } from './config/env.config';

async function startServer(){
    try{
        Server.listen(SERVER_PORT, () => {
            console.info(`Server running on http://localhost:${process.env.SERVER_PORT}`);
        });
    }catch(err){
        console.error('Error starting server:', err);
    }
}

connectToDatabase();
startServer();