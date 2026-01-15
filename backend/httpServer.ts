// imports von modulen
import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import https, {ServerOptions} from 'https';
import fs from 'fs';
import { dbConnect } from './database/Database.js';

// Routen
import publicUserRoute from './endpoints/user/PublicUsersRoute.js';
import authRoute from './endpoints/authentication/AuthenticationRoute.js';
import userRoute from './endpoints/user/UserRoute.js';
import degreeCourseRoute from './endpoints/degreeCourse/DegreeCourseRoute.js';
import degreeCourseApplicationRoute from './endpoints/degreeCourseApplication/degreeCourseApplicationRoute.js';



/**
 * server starten und mit datenbank verbinden 
 */ 
async function startServer(): Promise<void> {

    // umgebungsvariablen laden
    dotenv.config();

    // mit der datenbank verbinden
    try {
        await dbConnect();
    } catch (error) {
        console.error("[httpServer]: Could not connect to database, stopping server...");
        process.exit(1);
    }

    // express app mit entsprechendem port starten (fallback 80)
    const app: Express = express();
    const PORT: string | number = process.env.PORT || 443;

    // json middleware, json bodies parsen
    app.use(express.json());

    // -- Routen --
    
    // home route
    app.get('/', (req: Request, res: Response) => {
        res.send("hello from https :3")
    });

    // api routen
    app.use("/api/publicUsers", publicUserRoute);
    app.use("/api/authenticate", authRoute);
    app.use("/api/users", userRoute);
    app.use("/api/degreeCourses", degreeCourseRoute);
    app.use("/api/degreeCourseApplications", degreeCourseApplicationRoute);

    
    // alle nicht existierenden endpoints abfangen
    app.use((req: Request, res: Response) => {
        res.status(404).json({ "Error": "Endpoint not existing" }); 
    });


    try {
        // zertifikate einlesen
        const httpsOptions: ServerOptions = {
            key: fs.readFileSync('./certificates/server.key'),
            cert: fs.readFileSync('./certificates/server.cert')
        };

        const server: https.Server = https.createServer(httpsOptions, app);

        server.listen(PORT, ()=> {
            console.log(`[httpServer]: HTTPS-Server is running at https://127.0.0.1:${PORT}`);
        });

    } catch (error) {
        console.error("[httpServer]: Failed starting HTTPS-Server");
        process.exit(1);
    }
    
} 

startServer();