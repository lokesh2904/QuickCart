
import mongoose from "mongoose";

const addressSchema=new mongoose.Schema({
      userId:{type:String,requires:true},
      fullName:{type:String,requires:true},
      PhoneNumber:{type:String,requires:true},

      pincode:{type:Number,requires:true},
      area:{type:String,requires:true},
      city:{type:String,requires:true},
      state:{type:String,requires:true},
})

const Address=mongoose.models.address || mongoose.model('address',addressSchema)
  

export default Address