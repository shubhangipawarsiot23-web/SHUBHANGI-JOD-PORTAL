import mongoose from 'mongoose';
const schema=new mongoose.Schema({job:{type:mongoose.Schema.Types.ObjectId,ref:'Job',required:true},candidate:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},resumeUrl:{type:String,default:''},coverLetter:{type:String,default:''},status:{type:String,enum:['applied','shortlisted','hired','rejected'],default:'applied'}},{timestamps:true});
schema.index({job:1,candidate:1},{unique:true});
export default mongoose.model('Application',schema);
