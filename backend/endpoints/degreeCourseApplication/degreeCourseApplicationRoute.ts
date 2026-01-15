import express, {Request, Response} from 'express';
import { AuthRequest, checkToken, isAdmin } from '../utils/authMiddleware.js';
import { createApplication, deleteApplication, findApplication, findApplicationById, updateApplication } from './degreeCourseApplicationService.js';
import { IDegreeCourseApplication, IDegreeCourseApplicationDocument } from './degreeCourseApplicationModel.js';

const router = express.Router();

router.use(checkToken);

/**
 * GET /myApplications
 * eigene bewerbungen des users
 */
router.get('/myApplications', async (req: AuthRequest, res: Response): Promise<Response | void> => {
    try {
        if (!req.user) {
            return res.status(401).json({ Error: "Unauthorized" });
        }

        if (!req.user.userID) {
            return res.status(400).json({ Error: "Bad request" });
        }

        const applications: IDegreeCourseApplicationDocument[] = await findApplication({ applicantUserID: req.user.userID });
        return res.status(200).json(applications);

    } catch (error) {
        res.status(500);
    }
});

/**
 * GET /
 * suche nach bewerbungen (admins)
 * admins können filtern nach: applicantUserId oder degreeCourseID
 */
router.get('/', isAdmin, async (req: AuthRequest, res: Response): Promise<Response | void> => {
    try {
        if (!req.user) {
            return res.status(401).json({ Error: "Unauthorized" });
        }

        const applicantUserID: string | undefined = req.query.applicantUserID as string | undefined;
        const degreeCourseID: string | undefined = req.query.degreeCourseID as string | undefined;
        const filter: any = {};

        if(applicantUserID) {
            filter.applicantUserID = applicantUserID;
        }
        if(degreeCourseID) {
            filter.degreeCourseID = degreeCourseID;
        }

        const applications: IDegreeCourseApplicationDocument[] = await findApplication(filter);
        return res.status(200).json(applications);

    } catch (error) {
        res.status(500).json({ Error: "Internal server error" });
    }
}); 

/**
 * GET /:id
 * abrufen einer bewerbunganhand der id
 */
router.get('/:id', async (req: AuthRequest, res: Response): Promise<Response | void> => {
    try {
        const id: string | undefined = req.params.id;

        if(!id) {
            return res.status(400).json({ Error: "Missing ID" });
        }
        
        if (!req.user) {
            return res.status(401).json({ Error: "Unauthorized" });
        }

        const application: IDegreeCourseApplicationDocument | null = await findApplicationById(id);

        if(!application) {
            return res.status(404).json({ Error: "Application not found" });
        }

        if(!req.user.isAdministrator && application.applicantUserID != req.user.userID) {
            return res.status(403).json({ Error: "Forbidden" });
        }

        return res.status(200).json(application);

    } catch (error: any) {
        if(error.name === "CastError") {
            return res.status(400).json({ Error: "Invalid ID format" });
        }
        console.error("[DegreeCourseApplicationRoute]: Error on updating application" + error);
        return res.status(500).json({ Error: "Internal server error" });
    }
});

/**
 * POST /
 * anlegen einer neuen bewerbung durch user
 */
router.post('/', async (req: AuthRequest, res: Response): Promise<Response | void> => {
    try {
        if (!req.user) {
            return res.status(401).json({ Error: "Unauthorized" });
        }

        let applicantID: string = req.user.userID;

        if(req.user.isAdministrator && req.body.applicantUserID) {
            applicantID = req.body.applicantUserID;
        }

        const newApplication: IDegreeCourseApplication = {
            applicantUserID: applicantID,
            degreeCourseID: req.body.degreeCourseID,
            targetPeriodYear: req.body.targetPeriodYear,
            targetPeriodShortName: req.body.targetPeriodShortName
        }

        if(!newApplication.applicantUserID || !newApplication.degreeCourseID || !newApplication.targetPeriodShortName || !newApplication.targetPeriodYear) {
            return res.status(400).json({ Error: "Missing required fields" });
        }

        const application: IDegreeCourseApplicationDocument = await createApplication(newApplication);
        return res.status(201).json(application);

    } catch (error: any) {
        // doppelter key error in mongoose
        if (error.code === 11000) { 
            res.status(409).json({ Error: "Application with this ID already exists" });
        } 
        // validation error in mongoose
        else if (error.name === 'ValidationError') {
            res.status(400).json({ Error: error.message });
        } 
        // alles andere
        else {
            console.error("[DegreeCourseRoute]: Error on creating course " + error);
            res.status(500).json({ Error: "Internal server error" });
        }
    }
});

/**
 * PUT /:id
 * bearbeiten
 * nicht-admin können nur jahr/semester ändern
 */
router.put('/:id', async (req: AuthRequest, res: Response): Promise<Response | void> => {
    try {
        if (!req.user) {
            return res.status(401).json({ Error: "Unauthorized" });
        }

        const id: string | undefined = req.params.id;
        const newData: Partial<IDegreeCourseApplication> = req.body as Partial<IDegreeCourseApplication>;

        if(!id || !newData) {
            return res.status(400).json({ Error: "Missing ID or data to update" });
        }

        const application: IDegreeCourseApplicationDocument | null = await findApplicationById(id);
        if(!application) {
            return res.status(404).json({ Error: "Application not found" });
        }

        if(!req.user.isAdministrator) {
            if(application.applicantUserID != req.user.userID) {
                return res.status(403).json({ Error: "Forbidden" });
            }

            if(newData.applicantUserID || newData.degreeCourseID) {
                return res.status(403).json({ Error: "Forbidden" });
            }
        }

        const updatedApplication: IDegreeCourseApplicationDocument | null = await updateApplication(id, newData);
        return res.status(200).json(updatedApplication);

    } catch (error: any) {
        // doppelter key error in mongoose
        if (error.code === 11000) { 
            return res.status(409).json({ Error: "CourseAppication already exists" });
        } 

        // validation error in mongoose
        else if (error.name === 'ValidationError') {
            res.status(400).json({ Error: error.message });
        } 
        
        if(error.name === "CastError") {
            return res.status(400).json({ Error: "Invalid ID format" });
        }
        console.error("[DegreeCourseApplicationRoute]: Error on updating application" + error);
        return res.status(500).json({ Error: "Internal server error" });
    }
});

/**
 * DELETE /:id
 * löschen einer bewerbung
 * nicht-admin kann eigene löschen
 */
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<Response | void> => {
    try {
        const id: string | undefined = req.params.id;
        if(!id) {
            return res.status(400).json({ Error: "Missing ID" });
        }

        if (!req.user) {
            return res.status(401).json({ Error: "Unauthorized" });
        }

        const application: IDegreeCourseApplicationDocument | null = await findApplicationById(id);
        if(!application) {
            return res.status(404).json({ Error: "Application not found" });
        }

        if(!req.user.isAdministrator && application.applicantUserID != req.user.userID) {
            return res.status(403).json({ Error: "forbidden" });
        }

        await deleteApplication(id);
        return res.status(204).send();

    } catch (error: any) {
        if(error.name === "CastError") {
            return res.status(400).json({ Error: "Invalid ID format" });
        }
        console.error("[DegreeCourseApplicationRoute]: Error on deleting course" + error);
        return res.status(500).json({ Error: "Internal server error" });
    }
});

export default router;