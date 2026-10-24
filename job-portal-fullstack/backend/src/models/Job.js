import mongoose from 'mongoose';
const jobSchema=new mongoose.Schema({title:{type:String,required:true,trim:true},company:{type:String,required:true},description:{type:String,required:true},location:{type:String,required:true},type:{type:String,enum:['Full-time','Part-time','Contract','Internship'],default:'Full-time'},skills:[String],salary:{type:Number,min:0},status:{type:String,enum:['open','closed'],default:'open'},employer:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true}},{timestamps:true});
jobSchema.index({title:'text',company:'text',description:'text',skills:'text'});
export default mongoose.model('Job',jobSchema);
