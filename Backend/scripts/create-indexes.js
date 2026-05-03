import mongoose from 'mongoose';
import db from '../src/config/db.js';

const indexes = [
  // Company indexes
  { collection: 'companies', fields: { name: 1 } },
  { collection: 'companies', fields: { code: 1 } },
  { collection: 'companies', fields: { status: 1 } },
  { collection: 'companies', fields: { status: 1, createdAt: -1 } },
  
  // Task indexes
  { collection: 'tasks', fields: { status: 1 } },
  { collection: 'tasks', fields: { priority: 1 } },
  { collection: 'tasks', fields: { dueDate: 1 } },
  { collection: 'tasks', fields: { sectionId: 1 } },
  { collection: 'tasks', fields: { 'companyIds': 1, status: 1 } },
  { collection: 'tasks', fields: { status: 1, priority: 1 } },
  
  // Submission indexes
  { collection: 'submissions', fields: { companyId: 1, taskId: 1 } },
  { collection: 'submissions', fields: { companyId: 1, submittedAt: -1 } },
  { collection: 'submissions', fields: { status: 1 } },
  
  // User indexes
  { collection: 'users', fields: { companyId: 1, role: 1 } },
  { collection: 'users', fields: { role: 1, isActive: 1 } }
];

const createIndexes = async () => {
  try {
    await db;
    
    console.log('Creating database indexes...');
    
    for (const index of indexes) {
      try {
        await mongoose.connection.db.collection(index.collection).createIndex(index.fields);
        console.log(`✅ Created index on ${index.collection}:`, index.fields);
      } catch (err) {
        if (err.codeName === 'IndexOptionsConflict' || err.code === 85 || err.code === 86) {
          console.log(`ℹ️ Index already exists on ${index.collection}:`, index.fields);
        } else {
          console.error(`❌ Error creating index on ${index.collection}:`, err.message);
        }
      }
    }
    
    console.log('🎉 All indexes processed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Failed to connect to DB or create indexes:', error);
    process.exit(1);
  }
};

createIndexes();

