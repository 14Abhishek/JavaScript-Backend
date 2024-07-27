import mongoose, {Schema} from "mongoose";
import { User } from "./user.models";



const susbcriptionSchema = new Schema({
    subscriber:{     // one who is subscribing
        type: Schema.Types.ObjectId,
        ref: User
    },

    channel: {      // the one who we are subscribing to 
        type: Schema.Types.ObjectId,
        ref: User
    }

}, {timestamps: true});



export const Subscription = mongoose.model("subscription", susbcriptionSchema);
 