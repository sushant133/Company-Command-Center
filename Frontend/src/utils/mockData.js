const now = new Date()

const isoDaysFromNow = (days) => {
  const date = new Date(now)
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

export const mockCompanies = [
  {
    _id: 'company-glocal',
    name: 'Glocal Pvt Ltd',
    code: 'GLOCAL',
    status: 'Active',
    admins: ['user-company-admin-glocal'],
    analytics: {
      totalProjects: 2,
      activeProjects: 1,
      totalBudget: 620000,
      totalSpent: 370000,
      projectsAtRisk: 1,
    },
  },
  {
    _id: 'company-embark',
    name: 'Embark College',
    code: 'EMBARK',
    status: 'Active',
    admins: ['user-company-admin-embark'],
    analytics: {
      totalProjects: 1,
      activeProjects: 1,
      totalBudget: 250000,
      totalSpent: 110000,
      projectsAtRisk: 0,
    },
  },
  {
    _id: 'company-agrima',
    name: 'Agrima Education',
    code: 'AGRIMA',
    status: 'Active',
    admins: [],
    analytics: {
      totalProjects: 1,
      activeProjects: 0,
      totalBudget: 180000,
      totalSpent: 180000,
      projectsAtRisk: 0,
    },
  },
]

export const mockUsers = [
  {
    _id: 'user-super-admin',
    name: 'System Admin',
    email: 'admin@dashboard.com',
    role: 'super_admin',
    permissions: ['manage_companies', 'manage_projects', 'view_analytics'],
  },
  {
    _id: 'user-company-admin-glocal',
    name: 'Asha Shrestha',
    email: 'asha@glocal.com',
    role: 'company_admin',
    company: mockCompanies[0]._id,
    permissions: ['manage_company', 'manage_projects', 'view_analytics'],
  },
  {
    _id: 'user-company-admin-embark',
    name: 'Rabin Karki',
    email: 'rabin@embark.edu.np',
    role: 'company_admin',
    company: mockCompanies[1]._id,
    permissions: ['manage_company', 'manage_projects'],
  },
  {
    _id: 'user-manager-agrima',
    name: 'Sita Lama',
    email: 'sita@agrima.edu.np',
    role: 'manager',
    company: mockCompanies[2]._id,
    permissions: ['manage_projects'],
  },
]

export const mockEntries = [
  {
    _id: 'entry-1',
    project: 'project-1',
    company: mockCompanies[0]._id,
    title: 'Vendor contracts finalized',
    description: 'Negotiated implementation support and hardware procurement terms.',
    type: 'Project',
    createdAt: isoDaysFromNow(-7),
    approved: true,
    metadata: {
      priority: 'High',
      amount: 85000,
    },
  },
  {
    _id: 'entry-2',
    project: 'project-2',
    company: mockCompanies[0]._id,
    title: 'Budget variance review',
    description: 'Finance team flagged spend acceleration for follow-up this week.',
    type: 'Finance',
    createdAt: isoDaysFromNow(-3),
    approved: false,
    metadata: {
      priority: 'Medium',
      amount: 22000,
    },
  },
  {
    _id: 'entry-3',
    project: 'project-3',
    company: mockCompanies[1]._id,
    title: 'New intake dashboard published',
    description: 'Admissions reporting is now visible to the academic leadership team.',
    type: 'Task',
    createdAt: isoDaysFromNow(-1),
    approved: true,
    metadata: {
      priority: 'Low',
      amount: 0,
    },
  },
]

export const mockProjects = [
  {
    _id: 'project-1',
    name: 'ERP Modernization',
    description: 'Replace fragmented legacy tools with a shared ERP stack.',
    company: mockCompanies[0],
    owner: { _id: mockUsers[1]._id, name: mockUsers[1].name },
    priority: 'High',
    status: 'In Progress',
    health: 'Amber',
    progress: 68,
    blockers: 1,
    followUp: 'Confirm migration cutover plan with infrastructure partner.',
    nextActionBy: 'Today',
    budget: {
      total: 420000,
      spent: 295000,
    },
    timeline: {
      startDate: isoDaysFromNow(-45),
      endDate: isoDaysFromNow(35),
    },
    entries: [mockEntries[0]],
  },
  {
    _id: 'project-2',
    name: 'Sales Analytics Revamp',
    description: 'Deliver leadership dashboards and automated weekly forecast reports.',
    company: mockCompanies[0],
    owner: { _id: mockUsers[1]._id, name: mockUsers[1].name },
    priority: 'Medium',
    status: 'Planning',
    health: 'Red',
    progress: 22,
    blockers: 2,
    followUp: 'Finalize data warehouse scope before vendor onboarding.',
    nextActionBy: 'This Week',
    budget: {
      total: 200000,
      spent: 75000,
    },
    timeline: {
      startDate: isoDaysFromNow(-14),
      endDate: isoDaysFromNow(75),
    },
    entries: [mockEntries[1]],
  },
  {
    _id: 'project-3',
    name: 'Admissions Pipeline',
    description: 'Unify student acquisition reporting across marketing and admissions.',
    company: mockCompanies[1],
    owner: { _id: mockUsers[2]._id, name: mockUsers[2].name },
    priority: 'High',
    status: 'In Progress',
    health: 'Green',
    progress: 54,
    blockers: 0,
    followUp: '',
    nextActionBy: 'This Month',
    budget: {
      total: 250000,
      spent: 110000,
    },
    timeline: {
      startDate: isoDaysFromNow(-28),
      endDate: isoDaysFromNow(48),
    },
    entries: [mockEntries[2]],
  },
  {
    _id: 'project-4',
    name: 'Campus Ops Consolidation',
    description: 'Centralize procurement and support workflows for academic operations.',
    company: mockCompanies[2],
    owner: { _id: mockUsers[3]._id, name: mockUsers[3].name },
    priority: 'Low',
    status: 'Completed',
    health: 'Green',
    progress: 100,
    blockers: 0,
    followUp: '',
    nextActionBy: 'This Month',
    budget: {
      total: 180000,
      spent: 180000,
    },
    timeline: {
      startDate: isoDaysFromNow(-120),
      endDate: isoDaysFromNow(-5),
    },
    entries: [],
  },
]
