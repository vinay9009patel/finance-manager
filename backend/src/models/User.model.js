import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
    },

    password: {
        type: String,
        required: true,
    },

    role: {
        type: String,
        enum: ["student", "adult", "child", "parent"],
        default: "adult",
    },

    isParent: {
        type: Boolean,
        default: false
    },

    gender: {
        type: String,
        enum: ["male", "female", "other"],
        default: "other"
    },

    profileImage: {
        type: String,
        default: ""
    },

    parentCode: {
        type: String,
        unique: true,
        sparse: true
    },

    studentCode: {
        type: String,
        unique: true,
        sparse: true
    },

    linkedParent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },

    streak: {
        type: Number,
        default: 0,
    },lastSavingDate:{
type:Date
    },

    badges: {
        type: Number,
        default: 0,
    }

},
{ timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User; 
