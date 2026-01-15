import express, { Response } from 'express';
import { AuthRequest, checkToken, isAdmin } from '../utils/authMiddleware.js';
import { createUser, deleteUser, findUser, getAllUsers, updateUser } from './UserService.js';
import { IUser, IUserDocument } from './UserModel.js';

const router = express.Router();

/**
 * middleware, welche auf den gesamten users-endpoint angewendet wird
 * stellt sicher, dass nur authenfizierte anfragen angenommen werden
 */
router.use(checkToken);

/**
 * Route: GET /api/users
 * ruft alle user ab
 * Zugriff: nur Admins
 */
router.get('/', isAdmin, async (req: AuthRequest, res: Response): Promise<Response | void> => {
    try {
        const users: IUserDocument[] = await getAllUsers();
        res.status(200).json(users);

    } catch (error) {
        console.error("[UserRoute]: Error on returning all users: " + error);
        res.status(500).json({ Error: "Internal server error" });
    }
});

/**
 * Route: GET /api/users/:userID
 * ruft spezifischen user ab
 * Zugriff: Admin -> jeden, user -> sich selbst
 */
router.get('/:userID', async (req: AuthRequest, res: Response): Promise<Response | void> => {
    try {
        const userIDtoFind: string | undefined = req.params.userID;

        if(!userIDtoFind) {
            return res.status(400).json({ Error: "Missing userID to find" });
        }

        if(!req.user) {
            return res.status(401).json({ Error: "Authentication data missing" });
        }

        // ist der user KEIN admin aber sucht einen anderen user? -> nicht okay
        if(req.user.userID != userIDtoFind && !req.user.isAdministrator) {
            return res.status(403).json({ Error: "Not Authorized" });
        }

        const user: IUserDocument | null = await findUser(userIDtoFind);
        if(user === null) {
            return res.status(404).json({ Error: "User could not be found" });
        }

        return res.status(200).json(user);

    } catch (error) {
        console.error("[UserRoute]: Error on returning single user: " + error);
        res.status(500).json({ Error: "Internal server error" });
    }   
});


/**
 * Route: POST /api/users
 * erstellt neuen user
 * Zugriff: Admin 
 */
router.post('/', isAdmin, async (req: AuthRequest, res: Response): Promise<Response | void> => {
    try {

        const body: IUser = req.body as IUser;

        if(!body.userID || !body.password) {
            return res.status(400).json({ Error: "userID and password are required" });
        }

        const user: IUserDocument = await createUser(body);

        res.status(201).json(user);

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
            console.error("[UserRoute]: Error on returning single user: " + error);
            res.status(500).json({ Error: "Internal server error" });
        }
    } 
});


/**
 * Route: GET /api/users/:userID
 * aktualisiert einen user
 * Zugriff: Admin -> jeden, user -> sich selbst (eingeschränkt)
 */
router.put('/:userID', async (req: AuthRequest, res: Response): Promise<Response | void> => {
    try {
        const userIDtoUpdate: string | undefined = req.params.userID;
        const newData: Partial<IUser> = req.body;

        if(!userIDtoUpdate) {
            return res.status(400).json({ Error: "Missing userID to update" });
        }

        if(!req.user) {
            return res.status(401).json({ Error: "Authentication data missing" });
        }
        
        // ist der user KEIN admin aber versucht einen anderen user zu aktualisieren? -> nicht okay
        if(req.user.userID != userIDtoUpdate && !req.user.isAdministrator) {
            return res.status(403).json({ Error : "Not Authorized" });
        }

        // normale user können ihren admin status nicht ändern
        if(!req.user.isAdministrator && newData.isAdministrator !== undefined) {
            return res.status(403).json({ Error: "Not Authorized" });  
        }
        
        // userID darf nicht geändert werden
        if (newData.userID !== undefined) {
            return res.status(400).json({ Error: "Bad request, cannot update userID" });
        }

        // password muss min. 1 lang sein
        if (newData.password !== undefined && newData.password.length < 1) {
            return res.status(400).json({ Error: "Bad request, password too short" });
        }

        const updatedUser: IUserDocument | null = await updateUser(userIDtoUpdate, newData);

        if (!updatedUser) {
            return res.status(404).json({ Error: "User not found" });
        }

        return res.status(200).json(updatedUser);

    } catch (error) {
        console.error("[UserRoute]: Error on updating user: " + error);
        res.status(500).json({ Error: "Internal server error" });
    }  
});


/**
 * Route: DELETE /api/users
 * löscht user anhand der userID
 * Zugriff: Admin
 */
router.delete('/:userID', isAdmin, async (req: AuthRequest, res: Response): Promise<Response | void> => {
    try {
        const userIDtoDelete: string | undefined = req.params.userID;

        if(!userIDtoDelete) {
            return res.status(400).json({ Error: "Bad request, missing UserID" });
        }

        const deletedUser: IUserDocument | null = await deleteUser(userIDtoDelete);

        if (!deletedUser) {
            return res.status(404).json({ Error: "User not found" });
        }

        return res.status(204).send();

    } catch (error) {
        console.error("[UserRoute]: Error on deleting user: " + error);
        res.status(500).json({ Error: "Internal server error" });
    } 
});

export default router;