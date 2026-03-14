import Notification from "../models/Notification.model.js";

export const getNotifications =async (req,res)=>{
    try{

        const notificatons = await Notification.find({
            user:req.user._id
            
        }).sort({createdAt:-1})
        res.json(notificatons)
    }catch(err){
    res.status(500).json({
        message:"Server error"
    })
    }
    }

export const markAllNotificationsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.user._id, read: false },
            { $set: { read: true } }
        );

        res.json({
            message: "Notifications marked as read"
        });
    } catch (err) {
        res.status(500).json({
            message: "Server error"
        });
    }
}
