import express, {Request, Response} from 'express';
import { getAllUsers, findUser, createUser, updateUser, deleteUser} from './UserService.js';
import { IUser, IUserDocument } from './UserModel.js';

const router = express.Router();

/**
 * Route: GET /api/publicUsers
 * ruft alle user ab
 * gibt ebenfalls hashwert der Userobjecte zurück, aus testzwecken
 */
router.get('/', async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const users: IUserDocument[] = await getAllUsers();
        
        /**
         * .toObject anstatt normales json umwandeln, um das password feld zu behalten
         * siehe toObject transformation in UserModel.ts
         * keine typisierung, aufgrund des "toObject", sicherer typescript hier selber typisierun zu lassen
         */
        const publicUsers = users.map(user => user.toObject());

        res.status(200).json(publicUsers);

    } catch (error) {
        console.error("[PublicUserRoute]: Error on returning all users: " + error);
        res.status(500).json({ Error: "Internal server error" });
    }
});


/**
 * Route: GET /api/publicUsers/:userID
 * suchen eines users anhand der userID
 */
router.get('/:userID', async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const userID: string | undefined = req.params.userID;
        if (!userID) {
            return res.status(400).json({ Error: "Bad request" });
        }

        const user: IUserDocument | null = await findUser(userID);

        if(user === null) {
            return res.status(404).json({ Error: "User could not be found" });
        }

        // keine typisierung, aufgrund des "toObject", sicherer typescript hier selber typisierun zu lassen
        const publicUser = user.toObject();
        res.status(200).json(publicUser);

    } catch (error) {
        console.error("[PublicUserRoute]: Error on returning single user: " + error);
        res.status(500).json({ Error: "Internal server error" });
    }   
});


/**
 * Route: POST /api/publicUsers
 * anlegen eines neuen users
 * gibt neues user-objekt inkl. pw-hash zurück
 */
router.post('/', async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const body: IUser = req.body as IUser;
        const userID: string = body.userID;
        const password: string = body.password;

        if(!userID || !password) {
            return res.status(400).json({ Error: "userID and password are required" });
        }

        const user: IUserDocument = await createUser(req.body);

        // keine typisierung, aufgrund des "toObject", sicherer typescript hier selber typisierun zu lassen
        const publicUser = user.toObject();        
        return res.status(201).json(publicUser);

    } catch (error: any) {
        // doppelter key error in mongoose
        if (error.code === 11000) { 
            res.status(409).json({ Error: "UserID already exists" });
        } 
        // validation error in mongoose
        else if (error.name === 'ValidationError') {
            res.status(400).json({ Error: error.message });
        } 
        // alles andere
        else {
            console.error("[PublicUserRoute]: Error on returning single user: " + error);
            res.status(500).json({ Error: "Internal server error" });
        }
    } 
});


/**
 * Route: PUT /api/publicUsers
 * aktualisiert bestehenden user
 * gibt aktualisierten user inkl. pw-hash zurück
 */
router.put('/:userID', async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const userID: string | undefined = req.params.userID;
        const newData: Partial<IUser> = req.body as Partial<IUser>;

        if(!userID) {
            return res.status(400).json({ Error: "userID is required" });
        }

        if (newData.userID !== undefined) {
            return res.status(400).json({ Error: "Bad request, cannot update userID" });
        }

        if (newData.password !== undefined && newData.password.length < 1) {
            return res.status(400).json({ Error: "Bad request, password cannot be empty" });
        }

        const updatedUser: IUserDocument | null = await updateUser(userID, newData);

        if (!updatedUser) {
            return res.status(404).json({ Error: "User not found" });
        }

        // keine typisierung, aufgrund des "toObject", sicherer typescript hier selber typisierun zu lassen
        const publicUser = updatedUser.toObject();
        return res.status(200).json(publicUser);

    } catch (error) {
        console.error("[PublicUserRoute]: Error on updating user: " + error);
        res.status(500).json({ Error: "Internal server error" });
    }
});


/**
 * Route: DELETE /api/publicUsers
 * löscht user, gibt diesen aber nicht zurück
 */
router.delete('/:userID', async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const userID: string | undefined = req.params.userID;

        if(!userID) {
            return res.status(400).json({ Error: "userID is required" });
        }

        const deletedUser: IUserDocument | null = await deleteUser(userID);

        if (!deletedUser) {
            return res.status(404).json({ Error: "User not found" });
        }

        return res.status(204).send();

    } catch (error) {
        console.error("Error: Failed deleting user" + error);
        res.status(500).json({ Error: "Internal server error" });
    }
});

export default router;