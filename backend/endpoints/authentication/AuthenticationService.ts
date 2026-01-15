import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findUser } from '../user/UserService.js';
import { IUserDocument } from '../user/UserModel.js';


/**
 * inhalt der jwt payload definieren
 */
export interface IJwtPayload {
    userID: string;
    isAdministrator: boolean;
}

/**
 * überprüft user credentials
 * wirft fehler bei falschen daten
 */
export async function loginUser(userID: string, password: string): Promise<string> {

    const user: IUserDocument | null = await findUser(userID);

    if(!user) {
        throw new Error("Authentication failed: Invalid user credentials");
    }
    
    const correctPassword: boolean = await bcrypt.compare(password, user.password);

    if(!correctPassword) {
        throw new Error("Authentication failed: Invalid user credentials");
    }

    const payloadUserId: string = user.userID;
    // da hier mit bestehenden usern gearbeitet wird, ist der "isAdministrator" garantiert
    const payloadIsAdministrator: boolean = user.isAdministrator!;

    const payload: IJwtPayload = {
        userID: payloadUserId,
        isAdministrator: payloadIsAdministrator
    };

    const jwtKey: string | undefined = process.env.JWT_SECRET;
    const jwtExpiresIn: number = 3600;

    if(!jwtKey) {
        throw new Error("SERVER ERROR: JWT_SECRET not defined");
    }

    const token: string = jwt.sign(payload, jwtKey, { expiresIn: jwtExpiresIn });

    return token;
}

export function parseBasicAuthHeader(authHeader?: string): [string, string] | null {
    if(!authHeader || !authHeader.startsWith('Basic ')) {
        return null;
    }

    const base64Credentials: string | undefined = authHeader.split(' ')[1];
    if(!base64Credentials) {
        return null;
    }

    try {
        const credentials: string = Buffer.from(base64Credentials, 'base64').toString('ascii');
        const credentialParts: string[] = credentials.split(':');
        const username: string | undefined = credentialParts[0];
        const password: string | undefined = credentialParts[1];

        if(!username || !password) {
            return null;
        }

        return [username, password];

    } catch (error) {
        return null;
    }
}