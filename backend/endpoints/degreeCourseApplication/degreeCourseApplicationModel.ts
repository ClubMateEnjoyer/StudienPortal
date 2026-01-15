import mongoose, { Document, Schema } from 'mongoose';

/**
 * interface eines courseAppl.-objects in TS
 * beim erstellen einer courseAppl. --> typesicherheit
 */
export interface IDegreeCourseApplication {
    applicantUserID: string,
    degreeCourseID: string,
    targetPeriodYear: number,
    targetPeriodShortName: string
}

// interface, welches IDegreeCourse und mongoose document kombiniert
export interface IDegreeCourseApplicationDocument extends IDegreeCourseApplication, Document {};

const degreeCourseApplicationSchema = new Schema<IDegreeCourseApplicationDocument>({
    applicantUserID: {
        type: String,
        required: true
    },
    degreeCourseID: {
        type: String,
        required: true
    }, 
    targetPeriodYear: {
        type: Number,
        required: true
    },
    targetPeriodShortName: {
        type: String,
        required: true,
        enum: ["WiSe", "SoSe"]
    }
});


degreeCourseApplicationSchema.set('toJSON', {
     transform: function (doc, ret: any, options) {
         ret.id = ret._id.toString();
         delete ret._id;
         delete ret.__v;
     }
});


/*
 * "Es dürfen aber nicht mehrere Bewerbungen [... des gleichen Studiereden ...] für den gleichen Studiengang 
 *  im gleichen Semester geben."
 */ 
degreeCourseApplicationSchema.index({ applicantUserID: 1, 
                                      degreeCourseID: 1,
                                      targetPeriodYear: 1,
                                      targetPeriodShortName: 1
                                    }, {unique: true});

                                    
const degreeCourseApplicationModel = mongoose.model<IDegreeCourseApplicationDocument>('DegreeCourseApplication', degreeCourseApplicationSchema);
export default degreeCourseApplicationModel;