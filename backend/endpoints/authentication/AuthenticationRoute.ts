import express, { Request, Response } from 'express';
import { parseBasicAuthHeader, loginUser } from './AuthenticationService.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

/**
 * GET /api/authenticate
 * authentifiziere den user und gib ein jwt zurück
 */
router.get('/', async (req: Request, res: Response): Promise<Response | void> => {
    try {

        const authHeader: string | undefined = req.headers.authorization;
        const credentials: [string, string] | null  = parseBasicAuthHeader(authHeader);
        
        if(!credentials) {
            res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
            return res.status(401).json({ Error: "Authentication failed: Missing or invalid header" });       
        }

        const username: string = credentials[0];
        const password: string = credentials[1];

        // den user verifizieren
        const token: string = await loginUser(username, password);

        res.setHeader('Authorization', 'Bearer ' + token);
        res.status(200).json({ Success : "Token created successfully" });
    } catch (error) {
        console.error("[AuthRoute]: Error authorizing user: " + error);
        res.status(401).json({ Error : "Failed to create token: Authentication failed" });
    }
    
    
});

export default router;