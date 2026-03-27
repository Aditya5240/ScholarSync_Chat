/**
 * Seed script to create all 10 subject experts
 * Run: node scripts/seedExperts.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Expert = require('../models/Expert');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/scholarsync_chat';

const experts = [
  {
    name: 'Dr. Ananya Sharma',
    subject: 'computer_networks',
    subjectLabel: 'Computer Networks',
    description: 'PhD in Computer Networks from IIT Delhi. 10+ years experience in networking protocols, TCP/IP, and distributed systems.',
    email: 'cn.expert@scholarsync.com',
    password: 'expert@123',
  },
  {
    name: 'Prof. Rajesh Kumar',
    subject: 'operating_systems',
    subjectLabel: 'Operating Systems',
    description: 'Former professor at NIT with expertise in process scheduling, memory management, and kernel design.',
    email: 'os.expert@scholarsync.com',
    password: 'expert@123',
  },
  {
    name: 'Ms. Priya Verma',
    subject: 'database_management_system',
    subjectLabel: 'Database Management System',
    description: 'Senior Database Architect with 8 years at top tech firms. Expert in SQL, NoSQL, indexing and query optimization.',
    email: 'dbms.expert@scholarsync.com',
    password: 'expert@123',
  },
  {
    name: 'Mr. Arjun Mehta',
    subject: 'software_engineering',
    subjectLabel: 'Software Engineering',
    description: 'Lead engineer at a product company, specializing in software design patterns, SDLC, agile, and system design.',
    email: 'se.expert@scholarsync.com',
    password: 'expert@123',
  },
  {
    name: 'Ms. Sneha Patel',
    subject: 'data_structures_and_algorithms',
    subjectLabel: 'Data Structures and Algorithms',
    description: 'Competitive programmer (Codeforces Expert) and DSA instructor. Helped 500+ students crack FAANG interviews.',
    email: 'dsa.expert@scholarsync.com',
    password: 'expert@123',
  },
  {
    name: 'Mr. Vikram Singh',
    subject: 'greedy',
    subjectLabel: 'Greedy Algorithms',
    description: 'Algorithm specialist with deep focus on greedy techniques, interval scheduling, and optimization problems.',
    email: 'greedy.expert@scholarsync.com',
    password: 'expert@123',
  },
  {
    name: 'Dr. Kavita Joshi',
    subject: 'math',
    subjectLabel: 'Mathematics',
    description: 'PhD in Applied Mathematics. Covers number theory, combinatorics, probability, and discrete math for CS.',
    email: 'math.expert@scholarsync.com',
    password: 'expert@123',
  },
  {
    name: 'Mr. Rohan Das',
    subject: 'binary_search',
    subjectLabel: 'Binary Search',
    description: 'Expert in search algorithms, binary search variations, and its applications in competitive programming.',
    email: 'bs.expert@scholarsync.com',
    password: 'expert@123',
  },
  {
    name: 'Ms. Divya Nair',
    subject: 'two_pointers',
    subjectLabel: 'Two Pointers',
    description: 'Specializes in sliding window and two-pointer techniques, array manipulation, and problem-solving patterns.',
    email: 'tp.expert@scholarsync.com',
    password: 'expert@123',
  },
  {
    name: 'Mr. Amit Tiwari',
    subject: 'graph',
    subjectLabel: 'Graph Algorithms',
    description: 'Graph theory enthusiast. Expert in BFS, DFS, shortest paths, MST, topological sort, and advanced graph problems.',
    email: 'graph.expert@scholarsync.com',
    password: 'expert@123',
  },
];

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');
    console.log("🔗 Connecting to:", process.env.MONGO_URI || process.env.MONGODB_URI);
    // Clear existing experts
    await Expert.deleteMany({});
    console.log('🗑️  Cleared existing experts');

    // Insert new experts
    for (const expertData of experts) {
      const expert = new Expert(expertData);
      await expert.save(); // triggers password hashing
      console.log(`✅ Created expert: ${expert.name} (${expert.subjectLabel})`);
    }

    console.log('\n🎉 All 10 experts seeded successfully!');
    console.log('\n📧 Login credentials (all same password):');
    experts.forEach(e => console.log(`   ${e.email} / expert@123`));

  } catch (error) {
    console.error('❌ Seed error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

seed();
