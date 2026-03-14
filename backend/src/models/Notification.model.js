import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  type: {
    type: String,
    default:"info"
  },

  message: {
    type: String
  },

  read: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });



notificationSchema.index({user:1})
 
notificationSchema.index({createdAt:-1})

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;