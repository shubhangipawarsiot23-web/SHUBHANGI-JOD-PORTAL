export const sampleRoles = [
  {
    title: 'Senior Frontend Engineer',
    skills: ['React', 'TypeScript', 'Next.js', 'TailwindCSS', 'Redux'],
    salary: 2200000,
    type: 'Full-time',
    description: 'Lead the frontend architecture of our next-gen web applications. Collaborate with designers and backend engineers to craft responsive, accessible, high-performance user interfaces.'
  },
  {
    title: 'Full Stack MERN Developer',
    skills: ['MongoDB', 'Express', 'React', 'Node.js', 'REST APIs'],
    salary: 1600000,
    type: 'Full-time',
    description: 'Build robust end-to-end features across frontend and backend services. Maintain scalable data pipelines, design database schemas, and ensure seamless client-server integration.'
  },
  {
    title: 'Backend Systems Engineer',
    skills: ['Node.js', 'Express', 'PostgreSQL', 'Microservices', 'Redis'],
    salary: 1900000,
    type: 'Full-time',
    description: 'Design and deploy scalable microservices handling millions of API requests daily. Optimize query performance, message queuing with RabbitMQ/Kafka, and ensure 99.99% uptime.'
  },
  {
    title: 'Cloud & DevOps Architect',
    skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform'],
    salary: 2600000,
    type: 'Full-time',
    description: 'Oversee multi-region cloud infrastructure, container orchestration, and continuous deployment workflows. Implement robust monitoring, autoscaling, and disaster recovery.'
  },
  {
    title: 'UI/UX Product Designer',
    skills: ['Figma', 'Design Systems', 'User Research', 'Wireframing', 'Prototyping'],
    salary: 1500000,
    type: 'Full-time',
    description: 'Shape intuitive and delightfully modern digital experiences. Translate complex user workflows into clean interactive wireframes, prototypes, and reusable design components.'
  },
  {
    title: 'Data Scientist & AI Specialist',
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'NLP'],
    salary: 2400000,
    type: 'Full-time',
    description: 'Develop predictive models, recommendation engines, and NLP pipelines. Analyze large-scale behavioural datasets to extract actionable product insights and power smart automations.'
  },
  {
    title: 'Mobile App Developer (React Native)',
    skills: ['React Native', 'TypeScript', 'iOS', 'Android', 'Redux'],
    salary: 1800000,
    type: 'Full-time',
    description: 'Craft smooth cross-platform mobile apps for millions of daily active users. Handle native device integrations, state management, push notifications, and offline-first capabilities.'
  },
  {
    title: 'QA & Test Automation Lead',
    skills: ['Playwright', 'Selenium', 'Jest', 'API Testing', 'CI/CD'],
    salary: 1300000,
    type: 'Full-time',
    description: 'Champion quality assurance across test pyramids. Create automated regression suites, end-to-end load tests, and integrate automated quality gates into release pipelines.'
  },
  {
    title: 'Product Manager - Growth',
    skills: ['Product Strategy', 'Analytics', 'A/B Testing', 'Agile', 'User Retention'],
    salary: 2500000,
    type: 'Full-time',
    description: 'Own user acquisition and retention funnels. Define product roadmaps, prioritize feature backlogs, collaborate with cross-functional pods, and drive measurable metric growth.'
  },
  {
    title: 'Cybersecurity Analyst',
    skills: ['Network Security', 'SOC', 'Penetration Testing', 'SIEM', 'Compliance'],
    salary: 1700000,
    type: 'Full-time',
    description: 'Safeguard our cloud environments against vulnerabilities and emerging security threats. Conduct vulnerability scans, manage IAM policies, and maintain SOC-2 compliance.'
  },
  {
    title: 'Database Administrator & Architect',
    skills: ['MongoDB', 'PostgreSQL', 'Performance Tuning', 'Sharding', 'Replication'],
    salary: 2000000,
    type: 'Full-time',
    description: 'Manage database reliability, replication clusters, and disaster backups. Optimize slow indexes, structure collection schemas, and scale read/write operations seamlessly.'
  },
  {
    title: 'Junior Web Developer',
    skills: ['HTML5', 'CSS3', 'JavaScript', 'Git', 'Bootstrap'],
    salary: 650000,
    type: 'Full-time',
    description: 'Kickstart your career with our engineering team! Build landing pages, assist senior engineers with component development, fix UI bugs, and learn modern full-stack workflows.'
  },
  {
    title: 'Software Development Intern',
    skills: ['JavaScript', 'React', 'Problem Solving', 'Data Structures'],
    salary: 360000,
    type: 'Internship',
    description: 'Paid 6-month hands-on internship. Work alongside top mentors, contribute to real production codebases, and transition to a full-time software engineer position upon completion.'
  },
  {
    title: 'Technical Writer & Documentation Lead',
    skills: ['API Documentation', 'Markdown', 'Developer Advocacy', 'Technical Writing'],
    salary: 1100000,
    type: 'Contract',
    description: 'Author crystal-clear developer documentation, interactive API guides, release notes, and tutorials to empower developers and partners integrating with our platforms.'
  }
];

export const sampleCompanies = [
  'Razorpay',
  'Swiggy',
  'Zomato',
  'CRED',
  'Flipkart',
  'Google India',
  'Microsoft IDC',
  'Zepto',
  'PhonePe',
  'Tata Consultancy Services'
];

export const sampleLocations = [
  'Bengaluru, Karnataka',
  'Mumbai, Maharashtra',
  'Pune, Maharashtra',
  'Hyderabad, Telangana',
  'Gurugram, Haryana',
  'Noida, Uttar Pradesh',
  'Chennai, Tamil Nadu',
  'Delhi, NCR',
  'Kolkata, West Bengal',
  'Remote, India'
];

// Generate 140 total sample jobs (14 roles x 10 companies)
export function generateSampleJobs(employerId = '65d123456789012345678901') {
  const jobs = [];
  sampleRoles.forEach((role, rIndex) => {
    sampleCompanies.forEach((company, cIndex) => {
      const location = sampleLocations[(rIndex + cIndex) % sampleLocations.length];
      const salaryAdjustment = (cIndex % 3) * 100000 - (rIndex % 2) * 50000;
      const salary = Math.max(300000, role.salary + salaryAdjustment);
      const uniqueId = `job-${rIndex + 1}-${cIndex + 1}`;

      jobs.push({
        _id: uniqueId,
        title: role.title,
        company,
        description: `${role.description} ${company} is expanding its core engineering teams across India to build world-class, fault-tolerant platforms. We offer competitive salaries, flexible remote options, wellness perks, and strong career progression.`,
        location,
        type: role.type,
        skills: role.skills,
        salary,
        status: 'open',
        employer: { _id: employerId, name: `${company} Careers` },
        createdAt: new Date(Date.now() - (rIndex * 10 + cIndex) * 3600 * 1000 * 8).toISOString()
      });
    });
  });
  return jobs;
}
