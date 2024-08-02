import mongoose, { Schema } from "mongoose";

const PostSchema = new mongoose.Schema(
{
    user:{
        type:mongoose.Schema.Types.ObjectId
    },
    text:{
        type:String,
        required:true
    },
    name:{
        type:String
    },
    likes:[
        {
            user:{
                type:mongoose.Schema.Types.ObjectId
            }
        }
    ],
    comments:[
        {
            user:{
                type:mongoose.Schema.Types.ObjectId
            },
            text:{
                type:String,
                required:true
            },
            name:{
                type:String, 
            },
            date:{
                    type:Date,
                    default:Date.now
            }
        }
    ],
    date:{
        type:Date,
        default:Date.now
}
})

export default mongoose.model('post',PostSchema);


