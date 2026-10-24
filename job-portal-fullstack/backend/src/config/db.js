import mongoose from 'mongoose';
import Job from '../models/Job.js';
import User from '../models/User.js';
import { generateSampleJobs } from '../data/seedData.js';

let isConnected = false;

export async function autoSeedDatabase() {
  try {
    const jobCount = await Job.countDocuments();
    if (jobCount < 100) {
      console.log(`ℹ️ Current database has ${jobCount} jobs. Auto-seeding 140 vacancies into MongoDB...`);

      let employer = await User.findOne({ email: 'employer@shubhjobportal.in' });
      if (!employer) {
        employer = await User.create({
          name: 'शुभ Talent Partners',
          email: 'employer@shubhjobportal.in',
          password: 'Password@123',
          role: 'employer'
        });
      }

      const sampleJobs = generateSampleJobs(employer._id);
      const docs = sampleJobs.map(j => ({
        title: j.title,
        company: j.company,
        description: j.description,
        location: j.location,
        type: j.type,
        skills: j.skills,
        salary: j.salary,
        status: 'open',
        employer: employer._id
      }));

      for (const item of docs) {
        await Job.updateOne(
          { title: item.title, company: item.company, employer: item.employer },
          { $set: item },
          { upsert: true }
        );
      }

      const newCount = await Job.countDocuments();
      console.log(`✅ Successfully seeded MongoDB! Total vacancies in शुभ JOB PORTAL: ${newCount}`);
    } else {
      console.log(`✅ MongoDB already has ${jobCount} jobs populated.`);
    }
  } catch (err) {
    console.error('⚠️ Auto-seeding notice:', err.message);
  }
}

export default async function connectDB() {
  const urisToTry = [
    process.env.MONGO_URI,
    'mongodb://SHUBHANGI:SHUBHUPAWAR@127.0.0.1:27017/job_portal?authSource=admin',
    'mongodb://SHUBHANGI:SHUBHUPAWAR@127.0.0.1:27017/job_portal?authSource=job_portal',
    'mongodb://SHUBHANGI:SHUBHUPAWAR@127.0.0.1:27017/job_portal',
    'mongodb://127.0.0.1:27017/job_portal'
  ].filter(Boolean);

  let currentUriIndex = 0;

  const connect = async () => {
    const uri = urisToTry[currentUriIndex];
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 3000,
      });
      isConnected = true;
      console.log(`✅ Connected to MongoDB successfully! (Active: ${uri.replace(/:[^:@]+@/, ':****@')})`);
      await autoSeedDatabase();
    } catch (err) {
      isConnected = false;
      currentUriIndex = (currentUriIndex + 1) % urisToTry.length;
      console.warn(`⚠️ MongoDB connection attempt failed (${err.message}). API server is live. Retrying with next URI option in 5s...`);
      setTimeout(connect, 5000);
    }
  };

  connect();
}

export function isDbConnected() {
  return mongoose.connection.readyState === 1;
}
