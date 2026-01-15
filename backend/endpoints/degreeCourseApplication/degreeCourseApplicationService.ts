import degreeCourseApplicationModel, { IDegreeCourseApplication, IDegreeCourseApplicationDocument } from "./degreeCourseApplicationModel.js";



/**
 * erstellen einer neuen berwerbung
 */
export async function createApplication(applicationData: IDegreeCourseApplication): Promise<IDegreeCourseApplicationDocument> {
    try {
        const application: IDegreeCourseApplicationDocument = new degreeCourseApplicationModel(applicationData);

        await application.save();
        console.log(`[ApplicationService]: Created application for user ${applicationData.applicantUserID}`);

        return application;
    } catch (error) {
        console.error("[ApplicationService]: Error on creating application: " + error);
        throw error;
    }
}

/**
 * findet bewerbungen anhand von filtern
 * Admin:
 *      -UserID
 *      -DegreeCourseID
 * User:
 *      -Eigene bewerbung
 */
export async function findApplication(filter: any = {}): Promise<IDegreeCourseApplicationDocument[]> {
    try {
        const applications: IDegreeCourseApplicationDocument[] = await degreeCourseApplicationModel.find(filter);

        if(applications.length === 0) {
            console.log("[ApplicationService]: No applications found in database");
        } else {
            console.log("[ApplicationsService]: Returning all applications");
        }

        return applications;

    } catch (error) {
        console.error("[ApplicationService]: Error on finding application: " + error);
        throw error;
    }
}

/**
 * findet eine bewerbung anhand der ID
 */
export async function findApplicationById(id: string): Promise<IDegreeCourseApplicationDocument | null> {
    try {
        const application: IDegreeCourseApplicationDocument | null = await degreeCourseApplicationModel.findById(id);
        return application;
    } catch (error) {
        console.error("[ApplicationService]: Error on creating application by ID: " + error);
        throw error;
    }
}

/**
 * aktualisiert eine bewerbung
 */
export async function updateApplication(id: string, newData: Partial<IDegreeCourseApplication>):  Promise<IDegreeCourseApplicationDocument | null> {
    try {
        const application: IDegreeCourseApplicationDocument | null = await findApplicationById(id);

        if(!application) {
            console.log(`[ApplicationService]: No application found for id ${id}`);
            return null;
        }

        Object.assign(application, newData);
        await application.save();

        return application;

    } catch (error) {
        console.error("[ApplicationService]: Error on updating application: " + error);
        throw error;
    }
}

/**
 * löschen einer bewerbung
 */
export async function deleteApplication(id: string): Promise<IDegreeCourseApplicationDocument | null> {
    try {
        const deletedApplication: IDegreeCourseApplicationDocument | null = await degreeCourseApplicationModel.findByIdAndDelete(id);

        if(!deletedApplication) {
            console.log("[ApplicationService]: No application found in database");
        } else {
            console.log("[ApplicationsService]: Deleted application");
        }

        return deletedApplication;

    } catch (error) {
        console.error("[ApplicationService]: Error on deleting application: " + error);
        throw error;
    }
}