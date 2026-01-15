import {Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';


/**
 * inhalt der jwt payload definieren
 */
export interface IJwtPayload {
    userID: string;
    isAdministrator: boolean;
}

/**
 * express interface "Request" erweitern
 * um auf req.user zuzugreifen
 */
export interface AuthRequest extends Request {
    user?: IJwtPayload;
}


/**
 * middleware um das jwt zu überprüfen
 * stellt sicher, dass ein vlaid token vorhanden ist
 */
export function checkToken(req: Request, res: Response, next: NextFunction): Response | void {
    try {
        const authHeader: string | undefined = req.headers.authorization;

        if(!authHeader){
            return res.status(401).json({ Error: "Missing or invalid Authorization header" });
        }

        // "Bearer <token>" format prüfen
        const tokenParts: string[] = authHeader.split(" ");
        if(tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
            return res.status(401).json({ Error: "Invalid AuthHeader format" });
        }

        const token: string | undefined = tokenParts[1];
        if(!token) {
            return res.status(401).json({ Error: "Missing token" });
        }

        const jwtKey: string | undefined = process.env.JWT_SECRET;
        if(!jwtKey) {
            console.error("[AuthMiddelware]: JWT_SECRET not in .env");
            return res.status(500).json({ Error: "Internal Server error" });
        }

        // prüfen token valid (gültig und nicht abgelaufen)
        jwt.verify(token, jwtKey, (err: jwt.VerifyErrors | null, payload: string | JwtPayload | undefined) => {
            if (err) {
                return res.status(401).json({ Error: "Expired or invalid token" });
            }

            // payload darf nicht leer sein und darf kein string sein
            if(!payload || typeof payload === 'string') {
                return res.status(401).json({ Error: "Invalid token payload" });
            }

            // token valid, hänge payload and request object ran
            (req as AuthRequest).user = payload as IJwtPayload;
            
            return next();
        });

    } catch (error) {
        console.error("[AuthMiddleware): Error in checkToken in authMiddleware: " + error);
        res.status(500).json({ Error: "Internal server error" });
    }
}


/**
 * auth middleware um adminrechte zu validieren
 * muss NACH valid token aufgerufen werden
 */
export function isAdmin(req: Request, res: Response, next: NextFunction): Response | void {
     
    // cast um auf user in requestt zuzugreifen
    const user: IJwtPayload | undefined = (req as AuthRequest).user;
    
    if(!user) {
        return res.status(401).json({ Error: "Missing user in payload" });
    }

    if(!user.isAdministrator) {
        return res.status(403).json({ Error: "Not Authorized" });
    }
    
    next();
}