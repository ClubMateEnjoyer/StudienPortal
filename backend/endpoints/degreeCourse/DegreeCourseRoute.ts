import express, { Request, Response} from 'express';
import { AuthRequest, checkToken, isAdmin } from '../utils/authMiddleware.js';
import { getAllCourses, findCourse, getAllCoursesBySchool, createCourse, updateCourse, deleteCourse } from './DegreeCourseService.js';
import { IDegreeCourse, IDegreeCourseDocument } from './DegreeCourseModel.js';
import { findApplication } from '../degreeCourseApplication/degreeCourseApplicationService.js';
import { IDegreeCourseApplicationDocument } from '../degreeCourseApplication/degreeCourseApplicationModel.js';

const router = express.Router();

/**
 * Route: GET /api/degreeCourses
 * ruft alle studiengänge ab
 * wenn "?univerityShortName=...", dann filtern
 * sonst alle studiengänge
 * Zugriff: public
 */
router.get('/', async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const uniShortName: string | undefined = req.query.universityShortName as string | undefined;

        if(uniShortName) {
            // gefiltert
            const courses: IDegreeCourseDocument[] = await getAllCoursesBySchool(uniShortName);
            return res.status(200).json(courses);
        } else {
            // alle, ungefiltert
            const courses: IDegreeCourseDocument[] = await getAllCourses();
            return res.status(200).json(courses);
        }
        
    } catch (error) {
        console.error("[DegreeCourseRoute]: Error on getting all courses" + error);
        return res.status(500).json({ Error: "Internal server error" });
    }
});


/**
 * Route: GET /api/degreeCourses/:id
 * ruft einzelnen studiengang anahnd mongoose _id ab
 * Zugriff: public
 */
router.get('/:id', async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const id: string | undefined = req.params.id;
        if (!id) {
            return res.status(400).json({ Error: "Bad request" });
        }

        const course: IDegreeCourseDocument | null = await findCourse(id);

        if(course === null) {
            return res.status(404).json({ Error: "Course could not be found" });
        }

        return res.status(200).json(course);
        
    } catch (error: any) {
        if(error.name === "CastError") {
            return res.status(400).json({ Error: "Invalid ID format" });
        }
        console.error("[DegreeCourseRoute]: Error on getting single course by id" + error);
        return res.status(500).json({ Error: "Internal server error" });
    }   
});


/**
 * GET /:id/degreeCourseApplications
 * alle bewerbungen zu einen studiengang
 * Zugriff: Admin
 */
router.get('/:id/degreeCourseApplications', checkToken, isAdmin, async (req: AuthRequest, res: Response): Promise<Response | void> => {
    try {
        const degreeCourseID: string | undefined = req.params.id;
        if (!degreeCourseID) {
            return res.status(400).json({ Error: "Bad request" });
        }
        const applications: IDegreeCourseApplicationDocument[] = await findApplication({ degreeCourseID: degreeCourseID });

        res.status(200).json(applications);

    } catch (error) {
        console.error("[DegreeCourseRoute]: Error fetching applications: " + error);
        res.status(500).json({ Error: "Internal server error" });
    }
});

/**
 * Route: POST /api/degreeCourses/
 * erstellt einen neuen studiengang
 * Zugriff: nur admin
 */
router.post('/', checkToken, isAdmin, async (req: AuthRequest, res: Response): Promise<Response | void> => {
    try {
        // valdieren, ob alle felder vorhanden
       const body: IDegreeCourse = req.body as IDegreeCourse;
        if(!body.name || 
           !body.shortName || 
           !body.universityName || 
           !body.universityShortName || 
           !body.departmentName || 
           !body.departmentShortName) {
            return res.status(400).json({ Error: "Missing fields"});
        }


        const course: IDegreeCourseDocument = await createCourse(body);

        res.status(201).json(course);

    } catch (error: any) {
        // doppelter key error in mongoose
        if (error.code === 11000) { 
            res.status(409).json({ Error: "CourseID already exists" });
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
 * Route: PUT /api/degreeCourses/:id
 * aktualisiert bestehenden course
 * Zugriff: Admin
 */
router.put('/:id', checkToken, isAdmin, async (req: AuthRequest, res: Response): Promise<Response | void> => {
    try {
        const id: string | undefined = req.params.id;
        const newData: Partial<IDegreeCourse> = req.body;

        if (!id) {
            return res.status(400).json({ Error: "Bad request" });
        }

        const updatedCourse = await updateCourse(id, newData);

        if (!updatedCourse) {
            return res.status(404).json({ Error: "Course not found" });
        }

        res.status(200).json(updatedCourse);

    } catch (error: any) {
        // doppelter key error in mongoose
        if (error.code === 11000) { 
            return res.status(409).json({ Error: "CourseID already exists" });
        } 
        console.error("[DegreeCourseRoute]: Error on updating course" + error);
        return res.status(500).json({ Error: "Internal server error" });
    }
});


/**
 * Route: DELETE /api/degreeCourses/:id
 * löscht einen studiengang
 * Zugriff: Admin
 */
router.delete('/:id', checkToken, isAdmin, async (req: AuthRequest, res: Response): Promise<Response | void> => {
    try {
        const id: string | undefined = req.params.id;
        if(!id) {
            return res.status(400).json({ Error: "Bad request, missing id" });
        }

        const deletedCourse: IDegreeCourseDocument | null = await deleteCourse(id);

        if (!deletedCourse) {
            return res.status(404).json({ Error: "Course not found" });
        }

        res.status(204).send();

    } catch (error: any) {
        if(error.name === "CastError") {
            return res.status(400).json({ Error: "Invalid ID format" });
        }
        console.error("[DegreeCourseRoute]: Error on deleting course" + error);
        return res.status(500).json({ Error: "Internal server error" });
    }
});

export default router;