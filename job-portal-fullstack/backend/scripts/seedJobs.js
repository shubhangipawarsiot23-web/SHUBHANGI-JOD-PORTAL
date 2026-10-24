import 'dotenv/config';
import mongoose from 'mongoose';
import Job from '../src/models/Job.js';
import User from '../src/models/User.js';
import { generateSampleJobs } from '../src/data/seedData.js';

async function runSeed() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/job_portal';
  console.log(`Connecting to ${uri}...`);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });

  let employer = await User.findOne({ email: 'employer@careerbridge.dev' });
  if (!employer) {
    employer = await User.create({
      name: 'CareerBridge Talent Partners',
      email: 'employer@careerbridge.dev',
      password: 'Password@123',
      role: 'employer'
    });
  }

  const sampleJobs = generateSampleJobs(employer._id);
  console.log(`Seeding ${sampleJobs.length} jobs into MongoDB...`);

  for (const item of sampleJobs) {
    await Job.updateOne(
      { title: item.title, company: item.company, employer: employer._id },
      {
        $set: {
          title: item.title,
          company: item.company,
          description: item.description,
          location: item.location,
          type: item.type,
          skills: item.skills,
          salary: item.salary,
          status: 'open',
          employer: employer._id
        }
      },
      { upsert: true }
    );
  }

  const count = await Job.countDocuments();
  console.log(`✅ Finished seeding! Total jobs in MongoDB: ${count}`);
  await mongoose.disconnect();
}

runSeed().catch(err => {
  console.error('❌ Seeding error:', err.message);
  process.exit(1);
});
