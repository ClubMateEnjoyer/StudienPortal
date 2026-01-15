import mongoose from 'mongoose';
import userModel, { IUserDocument } from '../endpoints/user/UserModel.js';
import { createUser } from '../endpoints/user/UserService.js';
import { IUser } from '../endpoints/user/UserModel.js';


/**
 * initiale verbindung mit der datenbank herstellen
 * fehler werfen, wenn verbindung failed
 */
export async function dbConnect(): Promise<void> {
    try {
        const dbUrl: string | undefined = process.env.DATABASE_URL;

        if(!dbUrl) {
            throw new Error("DATABASE_URL not defined in enviornment variables");
        }

        // mongoose connect
        await mongoose.connect(dbUrl);
        console.log(`[Database]: Connected successfully to ${dbUrl}`);

        // standart-admin überprüfung
        await createAdmin();

    } catch (error) {
        console.error("[Database]: Failed connecting to database");
        throw error;        
    }
}

/**
 * sicherstellen, dass der standard-admin (admin/123) existiert
 */
async function createAdmin(): Promise<void> {
    try {
        const adminID: string = 'admin';
        const admin: IUserDocument | null = await userModel.findOne({userID: adminID});

        if(!admin) {
            console.log("[Database]: No default admin found, creating one...");

            const newAdminData: IUser = {
                userID: 'admin',
                password: '123',
                isAdministrator: true,
                firstName: 'default',
                lastName: 'admin'
            };

            await createUser(newAdminData);
            console.log("[Database]: Default admin created");

        } else {
            console.log("[Database]: Default admin already exists");
        }
        
    } catch (error) {
        console.error("[Database]: Failed creating default admin: " + error);
        throw error;
    }
}