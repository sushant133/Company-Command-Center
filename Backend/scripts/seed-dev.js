#!/usr/bin/env node
import mongoose from 'mongoose'
import { env } from '../src/config/env.js'
import Company from '../src/models/Company.js'
import User from '../src/models/User.js'
import Task from '../src/models/Task.js'
import { hashPassword } from '../src/services/auth.service.js'

async function connectDB() {
  await mongoose.connect(env.mongodbUri)
  console.log('✅ Connected to MongoDB')
}

async function clearData() {
  await Promise.all([
    Task.deleteMany({}),
    User.deleteMany({}),
    Company.deleteMany({})
  ])
  console.log('🗑️ Cleared existing data')
}

async function seedCompanies() {
  const companies = [
    {
      name: 'TechNova Solutions',
      description: 'AI & Software Development',
      industry: 'Technology',
      employeeCount: 45,
      revenue: 2500000
    },
    {
      name: 'GreenLeaf Manufacturing',
      description: 'Sustainable Materials',
      industry: 'Manufacturing',
      employeeCount: 120,
      revenue: 8500000
    }
  ]
  
  await Company.insertMany(companies)
  console.log('🏢 Seeded 2 companies')
}

async function seedUsers() {
  const hashedPassword = await hashPassword('password123')
  
  const users = [
    {
      name: 'Super Admin',
      email: 'admin@dashboard.com',
      passwordHash: hashedPassword,
      role: 'superadmin',
      isVerified: true
    },
    {
      name: 'John Doe',
      email: 'john@technova.com',
      passwordHash: hashedPassword,
      role: 'manager',
      companyId: 'first-company-id-placeholder', // Will be updated
      isVerified: true
    }
  ]
  
  const savedUsers = await User.insertMany(users)
  
  // Update second user with actual company ID
  const technovaCompany = await Company.findOne({ name: 'TechNova Solutions' })
  if (technovaCompany) {
    await User.findByIdAndUpdate(savedUsers[1]._id, { companyId: technovaCompany._id })
  }
  
  console.log('👥 Seeded 2 users (password: password123)')
}

async function seedTasks() {
  const technovaCompany = await Company.findOne({ name: 'TechNova Solutions' })
  const adminUser = await User.findOne({ email: 'admin@dashboard.com' })
  
  const tasks = [
    {
      title: 'Review Q1 Financials - TechNova',
      description: 'Analyze revenue growth and expense ratios',
      status: 'pending',
      priority: 'high',
      companyId: technovaCompany?._id,
      assigneeId: adminUser?._id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    },
    {
      title: 'Update Employee Directory',
      description: 'Sync HR data with latest hires/terminations',
      status: 'in-progress',
      priority: 'medium',
      companyId: technovaCompany?._id,
      assigneeId: adminUser?._id
    }
  ]
  
  await Task.insertMany(tasks)
  console.log('📋 Seeded 2 sample tasks')
}

async function main() {
  try {
    await connectDB()
    await clearData()
    await seedCompanies()
    await seedUsers()
    await seedTasks()
    console.log('🎉 Dev seed complete!\\nAdmin: admin@dashboard.com / password123')
    process.exit(0)
  } catch (error) {
    console.error('❌ Seed failed:', error.message)
    process.exit(1)
  } finally {
    await mongoose.connection.close()
  }
}

main()
