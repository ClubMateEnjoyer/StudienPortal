import mongoose, { Document, Schema } from 'mongoose';

/**
 * interface eines course-objects in TS
 * beim erstellen eines courses --> typesicherheit
 */
export interface IDegreeCourse {
    name: string,
    shortName: string,
    universityName: string,
    universityShortName: string,
    departmentName: string,
    departmentShortName: string
}

// interface, welches IDegreeCourse und mongoose document kombiniert
export interface IDegreeCourseDocument extends IDegreeCourse, Document {}

const degreeCourseSchema = new Schema<IDegreeCourseDocument>({
    name: {
        type: String,
        required: true
    },
    shortName: {
        type: String,
        required: true
    }, 
    universityName: {
        type: String,
        required: true
    },
    universityShortName: {
        type: String,
        required: true
    },
    departmentName: {
        type: String,
        required: true
    },
    departmentShortName: {
        type: String,
        required: true
    }
});

/**
 * https://stackoverflow.com/questions/7034848/mongodb-output-id-instead-of-id
 * siehe "UserModel.ts"
 */
degreeCourseSchema.set('toJSON', {
     transform: function (doc, ret: any, options) {
         ret.id = ret._id.toString();
         delete ret._id;
         delete ret.__v;
     }
}); 

// an der selben uni nur ein kurs mitt dem jeweiligen namen
degreeCourseSchema.index({ name: 1, universityName: 1 }, {unique: true});

const degreeCourseModel = mongoose.model<IDegreeCourseDocument>('DegreeCourse', degreeCourseSchema);
export default degreeCourseModel;