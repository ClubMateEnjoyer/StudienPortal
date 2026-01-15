import mongoose from 'mongoose';
import degreeCourseModel, { IDegreeCourse, IDegreeCourseDocument } from './DegreeCourseModel.js';

/*
* return array aller courses
* wenn kein course in der db, return leeres array
*/
export async function getAllCourses(): Promise<IDegreeCourseDocument[]> {
    try {
        const courses: IDegreeCourseDocument[] = await degreeCourseModel.find({});

        if(courses.length === 0) {
            console.log("[DegreeCourseService]: No courses found in database");
        } else {
            console.log("[DegreeCourseService]: Returning all courses");
        }

        return courses;

    } catch (error) {
        console.error("[DegreeCourseService]: Error on getting all courses: " + error);
        throw error;
    }
}

/*
* return einzelnen course anhand der mongoose _id
* wenn course nicht in der db, return null
*/
export async function findCourse(id: string): Promise<IDegreeCourseDocument | null> {
    try {
        const course: IDegreeCourseDocument | null = await degreeCourseModel.findById(id);

        if(!course) {
            console.log(`[DegreeCourseService]: No course with this id: ${id}`);
            return null;
        }

        console.log(`[DegreeCourseService]: Returning course: ${id}`);

        return course;

    } catch (error) {
        console.error("[DegreeCourseService]: Error on getting single course: " + error);
        throw error;
    }
}

/*
* return array aller courses einer hochschule
* wenn kein course in der db, return leeres array
*/
export async function getAllCoursesBySchool(schoolShortName: string): Promise<IDegreeCourseDocument[]> {
    try {
        const courses: IDegreeCourseDocument[] = await degreeCourseModel.find({ universityShortName: schoolShortName });

        if(courses.length === 0) {
            console.log(`[DegreeCourseService]: No Courses found for ${schoolShortName}`);
        } else {
            console.log(`[DegreeCourseService]: Returning all courses from ${schoolShortName}`);
        }

        return courses;

    } catch (error) {
        console.error("[DegreeCourseService]: Error on getting all courses by school: " + error);
        throw error;
    }
}

/*
* erstell neuen course
* gib erfolgreich erstellten course zurück
*/
export async function createCourse(courseData: IDegreeCourse): Promise<IDegreeCourseDocument> {
    try {

        const newCourse: IDegreeCourseDocument = new degreeCourseModel(courseData);  
        await newCourse.save();
        console.log("[DegreeCourseService]: Successfully created new course");

        return newCourse;
        
    } catch (error) {
        console.error("[DegreeCourseService]: Error on creating course: " + error);
        throw error;
    }
}

/*
* update attribute eines bestehenden courses
* wenn course nicht in der db, return null
*/
export async function updateCourse(id: string, newData: Partial<IDegreeCourse>): Promise<IDegreeCourseDocument | null> {
    try {
        const course: IDegreeCourseDocument | null = await degreeCourseModel.findById(id);

        if(!course) {
            console.log(`[DegreeCourseService]: No course with this id: ${id}`);
            return null;
        }

        Object.assign(course, newData);

        await course.save();
        console.log(`[DegreeCourseService]: Successfully updated course: ${course._id}`);

        return course;

    } catch (error) {
        console.error("[DegreeCourseService]: Error on updating course: " + error);
        throw error;
    }
}

/*
* loesch einen course anhand der mongoose _id
* wenn course nicht in db, fehler
*/
export async function deleteCourse(id: string): Promise<IDegreeCourseDocument | null> {
    try {
        const deletedCourse: IDegreeCourseDocument | null = await degreeCourseModel.findByIdAndDelete(id);

        if(!deletedCourse) {
            console.log(`[DegreeCourseService]: No course to delete with this id: ${id}`);
        } else {
            console.log(`[DegreeCourseService]: Succesfully deleted course with id: ${id}`);
        }

        return deletedCourse;
        
    } catch (error) {
        console.error("[DegreeCourseService]: Error on deleting course: " + error);
        throw error;
    }
}