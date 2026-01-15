import userModel, { IUser, IUserDocument } from './UserModel.js';


/**
 * holt alle user aus der datenbank
 * leeres array, falls keine user vorhanden
 */
export async function getAllUsers(): Promise<IUserDocument[]> {
    try {
        const users: IUserDocument[] = await userModel.find({});

        if(users.length === 0) {
            console.log("[UserService]: No users found in database");
        } else {
            console.log("[UserService]: Returning all users");
        }

        return users;

    } catch (error) {
        console.error("[UserService]: Error on getting all users: " + error);
        throw error;
    }
}

/*
 * einen einzelnen user anhand der userID finden
 * returns den user oder null, wenn user nicht gefunden
 */
export async function findUser(userID: string): Promise<IUserDocument | null> {
    try {
        const user: IUserDocument | null = await userModel.findOne({ userID: userID });

        if(!user) {
            console.log(`[UserService]: No user with this userID: ${userID}`);
            return null;
        }

        console.log(`[UserService]: Returning user: ${userID}`);
        return user;

    } catch (error) {
        console.error(`[UserService] Error on fetching user (${userID}): ` + error);
        throw error;
    }
}

/*
 * erstell neuen user in database
 * password wird duch pre-save hook gehashed
 * wenn userID bereits vergeben, wirf fehler
 */
export async function createUser(userData: IUser): Promise<IUserDocument> {
    try {
        const newUser: IUserDocument = new userModel(userData);
        
        await newUser.save();
        console.log(`[UserService]: Successfully created new user: ${newUser.userID}`);
            
        return newUser;

    } catch (error) {
        // fange fehler wie dublicate key error etc und gebe die an die route weiter
        console.error("Error: Failed creating user: " + error);
        throw error;
    }
}

/*
 * update attribute eines existierenden users
 * nimmt userID um user zu ermitteln
 * nimmt teile des IUser interfaces, um diese zu updaten
 * wenn user nicht in der db, return null
 */
export async function updateUser(userID: string, newData: Partial<IUser>): Promise<IUserDocument | null> {
    try {

        const user: IUserDocument | null = await userModel.findOne({ userID: userID });

        if(!user) {
            console.log(`[UserService]: No user with this userID: ${userID}`);
            return null;
        }

        // newData auf den gefundenen user anwenden
        Object.assign(user, newData);   

        await user.save();
        console.log(`[UserService]: Successfully updated user: ${user.userID}`);

        return user;

    } catch (error) {
        console.error(`[UserService]: Error on updating user: ${userID}`);
        throw error;
    }
}

/*
 * loesch einen user anhand der userID
 * returned userDokument oder null, wenn user nicht vorhanden
 */
export async function deleteUser(userID: string): Promise<IUserDocument | null> {
    try {
        const deletedUser: IUserDocument | null = await userModel.findOneAndDelete({ userID });

        if(!deletedUser) {
            console.log(`[UserService]: User to delete nott found: ${userID}`);
        } else {
            console.log(`[UserService]: Deleted user successfully: ${userID}`);
        }

        return deletedUser;

    } catch (error) {
        console.log(`[UserService]: Error on deleting user: ${userID}`);
        throw error;
    }
}