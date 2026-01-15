import mongoose, { Document, Schema } from 'mongoose';
import bcryptjs from 'bcryptjs';


/**
 * interface eines user-objects in TS
 * beim erstellen eines users --> typesicherheit
 */
export interface IUser {
    userID: string,
    password: string,
    firstName?: string,
    lastName?: string,
    isAdministrator?: boolean;
}

// interface, welches IUser und mongoose document kombiniert
export interface IUserDocument extends IUser, Document {};

const userSchema = new Schema<IUserDocument>({
    userID: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }, 
    firstName: {
        type: String,
        required: false
    },
    lastName: {
        type: String,
        required: false
    },
    isAdministrator: {
        type: Boolean,
        required: true,
        default: false
    }
});

/*
 * mongoose pre-save hook
 * wird vor speichern eines userdokuments (create, update) ausgeführt 
 * "<IUserDocument>" hinzufügen, damit "this" korrekt typisiert wird
 * hashed passwort, gefunden in:
 * https://medium.com/@finnkumar6/mastering-user-authentication-building-a-secure-user-schema-with-mongoose-and-bcrypt-539b9394e5d9
*/
userSchema.pre<IUserDocument>("save", async function(next) {
    try {
        // nur hasen wenn password geändert
        if(!this.isModified('password')) {
            return next();
        }

        // salt generieren und password mit salt zusammen hashen
        const salt: string = await bcryptjs.genSalt(10);
        this.password = await bcryptjs.hash(this.password, salt);
        return next();

    } catch (error) {
        console.error("[UserModel]: Error hasing password: " + error);
        // fehler an mongoose weitergeben, damit es den speichervorgang abbricht
        return next(error as Error);
    }
});

/**
 * json ausgabe anpassen (bei res.json())
 * - mappt _id zu id
 * - entfernt __v
 * - entfernt password
 * ursprung gefunden in:
 * https://stackoverflow.com/questions/7034848/mongodb-output-id-instead-of-id
 */
userSchema.set('toJSON', {
     transform: function (doc, ret: any, options) {
         ret.id = ret._id.toString();
         delete ret._id;
         delete ret.__v;
         delete ret.password; 
     }
}); 

/**
 * object ausgabe anpassen (bei .toObject())
 * public users braucht den pw-hash noch
 * - mappt _id zu id
 * - entfernt __v
 */
userSchema.set('toObject', {
     transform: function (doc, ret: any, options) {
         ret.id = ret._id.toString();
         delete ret._id;
         delete ret.__v;
     }
}); 

const userModel = mongoose.model<IUserDocument>('User', userSchema);
export default userModel;