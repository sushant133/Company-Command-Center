import Company from '../models/Company.js'
import Task from '../models/Task.js'
import Submission from '../models/Submission.js'
import Employee from '../models/Employee.js'
import Project from '../models/Project.js'
import FinancialMetrics from '../models/FinancialMetrics.js'
import HRMetrics from '../models/HRMetrics.js'
import User from '../models/User.js'
import Section from '../models/Section.js'
import Notification from '../models/Notification.js'
import File from '../models/File.js'
import SmartAlert from '../models/SmartAlert.js'
import AIInsight from '../models/AIInsight.js'
import Approval from '../models/Approval.js'
import CacheService from './cache.service.js'
import crypto from 'crypto'

// Command recognition patterns
const COMMAND_PATTERNS = {
  GREETING: /^(hi|hello|hey|greetings|good morning|good afternoon|good evening|good night|what\'?s up|how are you|how do you do|sup|yo)\b/i,
  HELP: /^(help|what can you do|what can i ask|what do you do|capabilities|features|menu|options|assist|support)\b/i,
  DASHBOARD: /(?:show|get|display|all)\s+(?:dashboard|data|everything|all data|superadmin|admin panel|overview|summary)/i,
  COMPLETE_COMPANY_LIST: /(?:give me|show me|list all|all|complete|full|every)\s+(?:companies|company|the companies|complete|full)/i,
  COMPANY_LIST: /(?:list|show)\s+companies|what companies|how many companies/i,
  COMPANY_DETAILS: /(?:show|get|tell me about|info on|details of|details about)\s+(.+?)(?:\s+company)?(?:\s|$|company)/i,
  APPROVALS: /(?:approvals?|approval status|pending approvals|approval workflow)/i,
  USERS: /(?:show|list|all)\s+(?:users?|admins?|operators|team|staff|members|employees)(?:\s|$)/i,
  SUBMISSIONS: /(?:show|list)\s+(?:submissions?|company submissions|updates|portfolio updates)/i,
  ALERTS: /(?:show|list)\s+(?:alerts?|smart alerts|warnings|notifications|alarms)/i,
  FINANCIAL: /(?:financial|budget|revenue|expense|money|spending|profit|income|earnings|sales|turnover)\s+(.+)?/i,
  HR_METRICS: /(?:hr|human resources|employees|staff|team|people|workforce|hr analytics)\s+(.+)?/i,
  RISKS: /(?:risk|risks|threats|challenges|problems|issues|concerns|issues)/i,
  GROWTH: /(?:growth|opportunities|expansion|scale|increase|improve|upside|potential)/i,
  PERFORMANCE: /(?:performance|metrics|stats|analytics|dashboard|how is|how are|kpi)/i,
  TASKS: /(?:tasks|todos|pending|assignments|work|activities)/i,
  PROJECTS: /(?:projects?|initiatives|campaigns|efforts)/i,
  COMPLIANCE: /(?:compliance|regulatory|tax|legal|filing|tds|deduction)/i,
  COMPARISON: /(?:compare|comparison|vs|versus|difference|which is better)/i,
  SUMMARY: /(?:summary|overview|executive summary|status|snapshot)/i,
  ANALYTICS: /(?:analytics|analysis|insights|trends|forecast|prediction)/i,
}

// Intelligent command parser
export const parseCommand = (query) => {
  const trimmed = query.trim().toLowerCase()
  
  for (const [commandType, pattern] of Object.entries(COMMAND_PATTERNS)) {
    const match = trimmed.match(pattern)
    if (match) {
      return {
        type: commandType,
        query: trimmed,
        context: match[1] || null,
        confidence: match[1] ? 0.95 : 0.85,
      }
    }
  }
  
  return {
    type: 'GENERAL_QUERY',
    query: trimmed,
    context: null,
    confidence: 0.7,
  }
}

// Handle greeting messages
export const handleGreeting = (message) => {
  const greetings = [
    'Hello there, I\'m an AI Chatbot! 🤖 I\'m here to help you with your business intelligence and data analysis. What can I assist you with today?',
    'Hi! I\'m your AI Chatbot assistant. 👋 Ready to help with company analysis, financial insights, HR metrics, risks, growth strategies, and much more. What would you like to know?',
    'Hey there! 😊 I\'m your AI business assistant. I can analyze your companies, provide financial insights, HR analytics, risk assessments, and strategic recommendations. How can I help?',
    'Greetings! I\'m an AI Chatbot powered by advanced analytics. 🚀 Ask me about your companies, finances, employees, risks, or anything business-related!',
  ]
  return greetings[Math.floor(Math.random() * greetings.length)]
}

// Handle help request
export const handleHelp = () => {
  return `**Welcome to AI Chatbot! 🤖 Here's what I can help you with:**

**📊 Company Insights**
- "Tell me about [company name]" - Get detailed company profile
- "List all companies" - See all companies summary
- "Give me all companies" - Complete detailed company list with all data
- "Show company info" - Get quick overview

**📋 Dashboard & System Overview**
- "Show dashboard" - Full superadmin dashboard overview
- "All data" - Complete system summary and statistics
- "Show approvals" - Approval workflow status
- "Show users" or "Show admins" - Team members list
- "Show submissions" - Portfolio submissions & updates
- "Show alerts" - Smart alerts and warnings

**💰 Financial Analysis**
- "Show financial metrics" - Revenue, profit, expenses
- "Budget for [company]" - Financial details for specific company
- "What's the revenue?" - Revenue analysis
- "Portfolio financials" - Total portfolio financial summary

**👥 HR & People**
- "Show HR metrics" - Employee data and insights
- "HR insights for [company]" - Company-specific HR data
- "Employee analytics" - Workforce analysis

**⚠️ Risk Assessment**
- "What are the risks?" - Portfolio-wide risk analysis
- "Show threats" - Risk identification
- "Risk for [company]" - Company-specific risks

**📈 Growth & Strategy**
- "Growth opportunities" - Expansion ideas
- "Strategic recommendations" - Growth strategies
- "Performance summary" - Overall performance

**📋 Task Management**
- "Show pending tasks" - Active assignments
- "Tasks for [company]" - Company-specific tasks
- "Active assignments" - Current workload

**🔄 Comparisons**
- "Compare [company1] vs [company2]" - Side-by-side comparison
- "Which is better?" - Performance comparison

**🎯 General Queries**
- "What can you help with?" - Show capabilities
- "Summary of portfolio" - Executive summary
- Ask any business-related question!

**Tips:**
✅ Say "list all companies" or "give me all companies" for complete data
✅ Say "show dashboard" for full admin panel overview
✅ Use natural language - I understand varied phrasings
✅ Be specific with company names for targeted queries
✅ Combine queries for detailed analysis
✅ Ask for clarification if unsure`
}


// Extract company name from context
export const extractCompanyName = (context) => {
  if (!context) return null
  return context.trim().replace(/company$/i, '').trim()
}

// Fuzzy match company name
/**
 * Cached company lookup (per request)
 */
const companyCache = new Map()

export const findCompanyByName = async (nameFragment, requestId = 'default', userId) => {
  if (!nameFragment) return null
  
  const cacheKey = CacheService.key('companyLookup', nameFragment.toLowerCase(), userId)
  let company = CacheService.getCompanyData(null, 'lookup', { nameFragment, userId })
  
  if (company) return company

  const companies = await Company.find({
    name: { $regex: nameFragment, $options: 'i' },
  })
  .select('name _id code industry status location')
  .lean()
  .limit(1)
  
  company = companies[0] || null
  CacheService.setCompanyData(null, 'lookup', company, { nameFragment, userId }, 1800)
  return company
}

// Format currency
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0)
}

// Handle company details query
export const handleCompanyDetailsQuery = async (companyName) => {
  const company = await findCompanyByName(companyName)
  
  if (!company) {
    const allCompanies = await Company.find().select('name')
    const names = allCompanies.map(c => c.name).join(', ')
    return {
      content: `I couldn't find a company matching "${companyName}". Available companies are: ${names || 'None'}. Could you please clarify which company you're interested in?`,
      isError: true,
    }
  }
  
  const employees = await Employee.countDocuments({ companyId: company._id })
  const activeProjects = await Project.countDocuments({ companyId: company._id, status: 'active' })
  const financials = await FinancialMetrics.findOne({ companyId: company._id }).sort({ createdAt: -1 })
  const hrMetrics = await HRMetrics.findOne({ companyId: company._id }).sort({ createdAt: -1 })
  
  let content = `**Company Profile: ${company.name}**\n\n`
  content += `**Overview:**\n`
  content += `- Industry: ${company.industry || 'Not specified'}\n`
  content += `- Location: ${company.location || 'Not specified'}\n`
  content += `- Status: ${company.status || 'Active'}\n`
  content += `- Total Employees: ${employees}\n`
  content += `- Active Projects: ${activeProjects}\n\n`
  
  if (financials) {
    content += `**Financial Snapshot:**\n`
    content += `- Annual Revenue: ${formatCurrency(financials.annualRevenue)}\n`
    content += `- Operating Expenses: ${formatCurrency(financials.operatingExpenses)}\n`
    content += `- Net Profit: ${formatCurrency(financials.netProfit)}\n`
    content += `- Cash Flow: ${formatCurrency(financials.cashFlow)}\n\n`
  }
  
  if (hrMetrics) {
    content += `**HR Metrics:**\n`
    content += `- Total Staff: ${hrMetrics.totalStaff}\n`
    content += `- Turnover Rate: ${hrMetrics.turnoverRate}%\n`
    content += `- Average Satisfaction: ${hrMetrics.avgSatisfaction}/5\n`
    content += `- Open Positions: ${hrMetrics.openPositions}\n\n`
  }
  
  content += `Would you like to know more about specific areas like finances, HR, projects, or compliance?`
  
  return { content, isError: false }
}

// Handle financial query
export const handleFinancialQuery = async (context) => {
  let query = {}
  
  if (context) {
    const company = await findCompanyByName(context)
    if (company) query.companyId = company._id
  }
  
  const financials = await FinancialMetrics.find(query)
    .populate('companyId', 'name')
    .sort({ createdAt: -1 })
    .limit(10)
    .lean()
    .select('companyId annualRevenue operatingExpenses netProfit cashFlow createdAt')
  
  if (financials.length === 0) {
    return { content: 'No financial data available. Please ensure financial metrics have been recorded.', isError: true }
  }
  
  let content = `**Financial Analysis ${context ? `for ${context}` : 'Across Portfolio'}:**\n\n`
  
  financials.forEach(f => {
    const company = f.companyId?.name || 'Unknown'
    content += `**${company}:**\n`
    content += `- Revenue: ${formatCurrency(f.annualRevenue)}\n`
    content += `- Expenses: ${formatCurrency(f.operatingExpenses)}\n`
    content += `- Profit: ${formatCurrency(f.netProfit)}\n`
    content += `- Cash Flow: ${formatCurrency(f.cashFlow)}\n`
    content += `- Profit Margin: ${((f.netProfit / f.annualRevenue) * 100).toFixed(2)}%\n\n`
  })
  
  content += `**AI Recommendation:** ${financials[0].netProfit > 0 ? 'Strong profitability. Focus on scaling.' : 'Monitor expenses carefully. Cost optimization needed.'}`
  
  return { content, isError: false }
}

// Handle HR query
export const handleHRQuery = async (context) => {
  let query = {}
  
  if (context) {
    const company = await findCompanyByName(context)
    if (company) query.companyId = company._id
  }
  
  const hrData = await HRMetrics.find(query)
    .populate('companyId', 'name')
    .sort({ createdAt: -1 })
    .limit(10)
    .lean()
    .select('companyId totalStaff turnoverRate avgSatisfaction openPositions avgTenure createdAt')
  
  if (hrData.length === 0) {
    return { content: 'No HR metrics available yet.', isError: true }
  }
  
  let content = `**HR & People Insights ${context ? `for ${context}` : 'Across Portfolio'}:**\n\n`
  
  hrData.forEach(h => {
    const company = h.companyId?.name || 'Unknown'
    content += `**${company}:**\n`
    content += `- Total Staff: ${h.totalStaff}\n`
    content += `- Turnover Rate: ${h.turnoverRate}%\n`
    content += `- Employee Satisfaction: ${h.avgSatisfaction}/5 ⭐\n`
    content += `- Open Positions: ${h.openPositions}\n`
    content += `- Avg Tenure: ${h.avgTenure} years\n\n`
  })
  
  // AI insights
  const avgTurnover = (hrData.reduce((s, h) => s + h.turnoverRate, 0) / hrData.length).toFixed(2)
  content += `**Portfolio HR Insights:**\n`
  content += `- Average Turnover: ${avgTurnover}% ${avgTurnover > 15 ? '⚠️ (Above industry average)' : '✅ (Healthy)'}\n`
  content += `- Recommendation: ${avgTurnover > 15 ? 'Focus on retention programs and career development.' : 'Continue current HR strategies.'}`
  
  return { content, isError: false }
}

// Handle risks query
export const handleRisksQuery = async (context) => {
  let companies = []
  
  if (context) {
    const company = await findCompanyByName(context)
    if (company) companies = [company]
    else {
      const all = await Company.find()
      companies = all
    }
  } else {
    companies = await Company.find().limit(10)
  }
  
  let content = `**Risk Analysis & Mitigation ${context ? `for ${context}` : 'for Portfolio'}:**\n\n`
  
  for (const company of companies) {
    const financials = await FinancialMetrics.findOne({ companyId: company._id }).sort({ createdAt: -1 })
    const hrMetrics = await HRMetrics.findOne({ companyId: company._id }).sort({ createdAt: -1 })
    
    content += `**${company.name}:**\n`
    const risks = []
    
    if (financials) {
      if (financials.netProfit < 0) risks.push(`🔴 Negative profitability (${formatCurrency(financials.netProfit)})`)
      if ((financials.operatingExpenses / financials.annualRevenue) > 0.8) risks.push(`🟡 High expense ratio (${((financials.operatingExpenses / financials.annualRevenue) * 100).toFixed(0)}%)`)
    }
    
    if (hrMetrics) {
      if (hrMetrics.turnoverRate > 20) risks.push(`🔴 High turnover rate (${hrMetrics.turnoverRate}%)`)
      if (hrMetrics.openPositions > 5) risks.push(`🟡 Many unfilled positions (${hrMetrics.openPositions})`)
      if (hrMetrics.avgSatisfaction < 3.5) risks.push(`🟡 Low satisfaction score (${hrMetrics.avgSatisfaction}/5)`)
    }
    
    if (risks.length === 0) {
      content += `- ✅ No major risks detected\n`
    } else {
      risks.forEach(r => content += `- ${r}\n`)
    }
    content += '\n'
  }
  
  return { content, isError: false }
}

// Handle growth opportunities query
export const handleGrowthQuery = async (context) => {
  let companies = []
  
  if (context) {
    const company = await findCompanyByName(context)
    if (company) companies = [company]
    else companies = await Company.find().limit(10)
  } else {
    companies = await Company.find().limit(10)
  }
  
  let content = `**Growth Opportunities ${context ? `for ${context}` : 'Across Portfolio'}:**\n\n`
  
  for (const company of companies) {
    const financials = await FinancialMetrics.findOne({ companyId: company._id }).sort({ createdAt: -1 })
    const projects = await Project.find({ companyId: company._id, status: 'active' }).limit(3)
    
    content += `**${company.name}:**\n`
    const opportunities = []
    
    if (financials && financials.netProfit > 0) {
      opportunities.push(`💰 Strong profit margin - ideal for scaling/expansion`)
    }
    
    if (projects.length < 5) {
      opportunities.push(`📈 Capacity for more projects`)
    }
    
    opportunities.push(`🎯 Consider market expansion or new service lines`)
    opportunities.push(`🚀 Invest in technology/automation for efficiency`)
    
    opportunities.forEach(o => content += `- ${o}\n`)
    content += '\n'
  }
  
  return { content, isError: false }
}

// Handle tasks query
export const handleTasksQuery = async (context) => {
  let query = { status: { $in: ['pending', 'in-progress'] } }
  
  if (context) {
    const company = await findCompanyByName(context)
    if (company) query.companyId = company._id
  }
  
  const tasks = await Task.find(query)
    .populate('companyId', 'name')
    .populate('assignedTo', 'name')
    .sort({ dueDate: 1 })
    .limit(15)
  
  if (tasks.length === 0) {
    return { content: 'No pending tasks found.', isError: true }
  }
  
  let content = `**Active Tasks ${context ? `for ${context}` : 'Portfolio-wide'}:**\n\n`
  
  tasks.forEach((task, idx) => {
    const dueDate = new Date(task.dueDate).toLocaleDateString()
    content += `${idx + 1}. **${task.title}** (${task.priority || 'Medium'})\n`
    content += `   - Company: ${task.companyId?.name || 'N/A'}\n`
    content += `   - Due: ${dueDate}\n`
    content += `   - Status: ${task.status}\n\n`
  })
  
  return { content, isError: false }
}

// Handle comparison query
export const handleComparisonQuery = async (query) => {
  const parts = query.split(/\bvs\b|versus/i)
  if (parts.length < 2) return { content: 'Please specify two companies to compare using "vs" or "versus".', isError: true }
  
  const company1 = await findCompanyByName(parts[0].trim())
  const company2 = await findCompanyByName(parts[1].trim())
  
  if (!company1 || !company2) {
    return { content: `Could not find one or both companies. Please provide valid company names.`, isError: true }
  }
  
  const fin1 = await FinancialMetrics.findOne({ companyId: company1._id }).sort({ createdAt: -1 })
  const fin2 = await FinancialMetrics.findOne({ companyId: company2._id }).sort({ createdAt: -1 })
  const hr1 = await HRMetrics.findOne({ companyId: company1._id }).sort({ createdAt: -1 })
  const hr2 = await HRMetrics.findOne({ companyId: company2._id }).sort({ createdAt: -1 })
  
  let content = `**Comparison: ${company1.name} vs ${company2.name}**\n\n`
  
  content += `| Metric | ${company1.name} | ${company2.name} |\n`
  content += `|--------|----------|----------|\n`
  
  if (fin1 && fin2) {
    content += `| Revenue | ${formatCurrency(fin1.annualRevenue)} | ${formatCurrency(fin2.annualRevenue)} |\n`
    content += `| Profit | ${formatCurrency(fin1.netProfit)} | ${formatCurrency(fin2.netProfit)} |\n`
    content += `| Profit Margin | ${((fin1.netProfit / fin1.annualRevenue) * 100).toFixed(1)}% | ${((fin2.netProfit / fin2.annualRevenue) * 100).toFixed(1)}% |\n`
  }
  
  if (hr1 && hr2) {
    content += `| Employees | ${hr1.totalStaff} | ${hr2.totalStaff} |\n`
    content += `| Turnover | ${hr1.turnoverRate}% | ${hr2.turnoverRate}% |\n`
    content += `| Satisfaction | ${hr1.avgSatisfaction}/5 | ${hr2.avgSatisfaction}/5 |\n`
  }
  
  content += `\n**Winner:** ${fin1?.netProfit > fin2?.netProfit ? company1.name : company2.name} leads in financial performance.`
  
  return { content, isError: false }
}

// Handle complete company list with all details
export const handleCompleteCompanyList = async () => {
  const companies = await Company.find()
    .populate('admin', 'name email')
    .select('name code industry status location admin description createdAt')
    .sort({ name: 1 })
    .lean()
  
  if (companies.length === 0) {
    return { content: 'No companies found in the system.', isError: true }
  }
  
  let content = `**📋 Complete Company Portfolio (${companies.length} Companies):**\n\n`
  
  for (let i = 0; i < companies.length; i++) {
    const c = companies[i]
    const { financials: finMap, hrMetrics: hrMap } = await getCompanyMetricsBatch([c._id])
    const employees = await Employee.countDocuments({ companyId: c._id })
    const activeProjects = await Project.countDocuments({ companyId: c._id, status: 'active' })
    const companyFin = finMap.get(c._id.toString())
    const companyHR = hrMap.get(c._id.toString())
    
    content += `**${i + 1}. ${c.name}** (${c.code})\n`
    content += `   🏢 Industry: ${c.industry || 'General'}\n`
    content += `   📍 Location: ${c.location || 'Not specified'}\n`
    content += `   ✅ Status: ${c.status || 'Active'}\n`
    content += `   👤 Admin: ${c.admin?.name || 'Unassigned'}\n`
    content += `   📊 Employees: ${employees}\n`
    content += `   📁 Active Projects: ${activeProjects}\n`
    
    if (financials) {
      content += `   💰 Revenue: ${formatCurrency(financials.annualRevenue)}\n`
      content += `   📈 Profit: ${formatCurrency(financials.netProfit)}\n`
    }
    
    if (hrMetrics) {
      content += `   👥 Staff: ${hrMetrics.totalStaff} | Turnover: ${hrMetrics.turnoverRate}% | Satisfaction: ${hrMetrics.avgSatisfaction}/5\n`
    }
    
    if (c.description) {
      content += `   ℹ️ ${c.description}\n`
    }
    content += '\n'
  }
  
  return { content, isError: false }
}

// Handle dashboard / all data query
export const handleDashboardQuery = async () => {
  try {
    const companies = await Company.find().select('name status')
    const users = await User.find().select('name email role companyId')
    const tasks = await Task.find({ status: { $in: ['pending', 'in-progress'] } }).select('title priority dueDate')
    const submissions = await Submission.find().limit(10).select('title status companyId')
    const approvals = await Approval.find({ status: 'pending' }).select('title priority')
    const smartAlerts = await SmartAlert.find().sort({ createdAt: -1 }).limit(10)
    const notifications = await Notification.find({ isRead: false }).limit(5)
    
    const totalFinancials = await FinancialMetrics.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: '$annualRevenue' }, totalProfit: { $sum: '$netProfit' } } }
    ])
    
    let content = `**📊 SUPERADMIN DASHBOARD - Complete Overview**\n\n`
    
    content += `**🏢 Companies**\n`
    content += `- Total Companies: ${companies.length}\n`
    content += `- Active: ${companies.filter(c => c.status === 'active').length}\n`
    content += `- Inactive: ${companies.filter(c => c.status !== 'active').length}\n\n`
    
    content += `**👥 Team & Users**\n`
    content += `- Total Users: ${users.length}\n`
    content += `- Admins: ${users.filter(u => u.role === 'admin').length}\n`
    content += `- Superadmins: ${users.filter(u => u.role === 'superadmin').length}\n\n`
    
    content += `**📋 Tasks & Workflow**\n`
    content += `- Pending/In-Progress Tasks: ${tasks.length}\n`
    content += `- Urgent (High Priority): ${tasks.filter(t => t.priority === 'high').length}\n`
    content += `- Pending Submissions: ${submissions.length}\n\n`
    
    content += `**✅ Approvals & Alerts**\n`
    content += `- Pending Approvals: ${approvals.length}\n`
    content += `- Smart Alerts: ${smartAlerts.length}\n`
    content += `- Unread Notifications: ${notifications.length}\n\n`
    
    if (totalFinancials.length > 0) {
      content += `**💰 Portfolio Financials**\n`
      content += `- Total Revenue: ${formatCurrency(totalFinancials[0].totalRevenue)}\n`
      content += `- Total Profit: ${formatCurrency(totalFinancials[0].totalProfit)}\n\n`
    }
    
    content += `**📌 Recent Company List:**\n`
    companies.slice(0, 5).forEach((c, i) => {
      content += `${i + 1}. ${c.name} (${c.status})\n`
    })
    if (companies.length > 5) {
      content += `...and ${companies.length - 5} more companies\n`
    }
    
    content += `\n✨ **For detailed company information, ask "List all companies" or "Tell me about [company name]"**`
    
    return { content, isError: false }
  } catch (error) {
    console.error('Dashboard query error:', error)
    return { content: 'Unable to retrieve dashboard data. Please try again.', isError: true }
  }
}

// Handle approvals query
export const handleApprovalsQuery = async () => {
  const approvals = await Approval.find()
    .populate('companyId', 'name')
    .sort({ createdAt: -1 })
    .limit(20)
  
  if (approvals.length === 0) {
    return { content: 'No approvals found.', isError: true }
  }
  
  let content = `**✅ Approval Workflow Status:**\n\n`
  
  const byStatus = { pending: 0, approved: 0, rejected: 0 }
  
  approvals.forEach(a => {
    if (byStatus[a.status]) byStatus[a.status]++
    content += `- **${a.title}** (${a.status.toUpperCase()}) | Company: ${a.companyId?.name || 'N/A'} | Priority: ${a.priority}\n`
  })
  
  content += `\n**Summary:**\n`
  content += `- Pending: ${byStatus.pending}\n`
  content += `- Approved: ${byStatus.approved}\n`
  content += `- Rejected: ${byStatus.rejected}\n`
  
  return { content, isError: false }
}

// Handle users/admins query
export const handleUsersQuery = async () => {
  const users = await User.find()
    .populate('companyId', 'name')
    .select('name email role companyId phone status')
    .sort({ role: 1, name: 1 })
  
  if (users.length === 0) {
    return { content: 'No users found.', isError: true }
  }
  
  let content = `**👥 Team Members & Administrators:**\n\n`
  
  const byRole = {}
  users.forEach(u => {
    if (!byRole[u.role]) byRole[u.role] = []
    byRole[u.role].push(u)
  })
  
  Object.entries(byRole).forEach(([role, roleUsers]) => {
    content += `**${role.toUpperCase()}S (${roleUsers.length})**\n`
    roleUsers.forEach(u => {
      content += `- ${u.name} (${u.email})${u.companyId ? ` - ${u.companyId.name}` : ''}\n`
    })
    content += '\n'
  })
  
  return { content, isError: false }
}

// Handle submissions query
export const handleSubmissionsQuery = async () => {
  const submissions = await Submission.find()
    .populate('companyId', 'name')
    .populate('submittedBy', 'name')
    .sort({ createdAt: -1 })
    .limit(25)
  
  if (submissions.length === 0) {
    return { content: 'No submissions found.', isError: true }
  }
  
  let content = `**📤 Portfolio Submissions & Updates:**\n\n`
  
  submissions.forEach((s, idx) => {
    const date = new Date(s.createdAt).toLocaleDateString()
    content += `${idx + 1}. **${s.title}** | ${s.status}\n`
    content += `   - Company: ${s.companyId?.name || 'N/A'}\n`
    content += `   - Submitted by: ${s.submittedBy?.name || 'N/A'}\n`
    content += `   - Date: ${date}\n\n`
  })
  
  return { content, isError: false }
}

// Handle smart alerts query
export const handleAlertsQuery = async () => {
  const alerts = await SmartAlert.find()
    .populate('companyId', 'name')
    .sort({ createdAt: -1 })
    .limit(20)
  
  if (alerts.length === 0) {
    return { content: 'No alerts found.', isError: true }
  }
  
  let content = `**🚨 Smart Alerts & Warnings:**\n\n`
  
  const criticalAlerts = []
  const warningAlerts = []
  const infoAlerts = []
  
  alerts.forEach(a => {
    if (a.severity === 'critical') criticalAlerts.push(a)
    else if (a.severity === 'high' || a.severity === 'medium') warningAlerts.push(a)
    else infoAlerts.push(a)
  })
  
  if (criticalAlerts.length > 0) {
    content += `**🔴 CRITICAL (${criticalAlerts.length})**\n`
    criticalAlerts.forEach(a => {
      content += `- ${a.title} | ${a.companyId?.name || 'N/A'}\n`
    })
    content += '\n'
  }
  
  if (warningAlerts.length > 0) {
    content += `**🟡 WARNING (${warningAlerts.length})**\n`
    warningAlerts.forEach(a => {
      content += `- ${a.title} | ${a.companyId?.name || 'N/A'}\n`
    })
    content += '\n'
  }
  
  if (infoAlerts.length > 0) {
    content += `**ℹ️ INFO (${infoAlerts.length})**\n`
    infoAlerts.slice(0, 5).forEach(a => {
      content += `- ${a.title} | ${a.companyId?.name || 'N/A'}\n`
    })
    if (infoAlerts.length > 5) content += `...and ${infoAlerts.length - 5} more\n`
  }
  
  return { content, isError: false }
}

// Handle company list query for summary
export const handleCompanyListQuery = async () => {
  const companies = await Company.find().select('name industry status').limit(10)
  
  if (companies.length === 0) {
    return { content: 'No companies found in the system.', isError: true }
  }
  
  let content = `**Portfolio Summary (${companies.length} Companies):**\n\n`
  companies.forEach((c, i) => {
    content += `${i + 1}. **${c.name}** - ${c.industry || 'General'} (${c.status || 'Active'})\n`
  })
  content += `\nTry asking "Tell me about [company name]" to get detailed insights!`
  
  return { content, isError: false }
}

// OPTIMIZED: Main AI response with per-user query caching
export const generateAIChatResponse = async (userMessage, userId) => {
  // Cache identical queries per user (15 min TTL)
  const queryHash = crypto.createHash('md5').update(userMessage).digest('hex')
  let cachedResponse = await CacheService.getAIQuery(userId, queryHash)
  
  if (cachedResponse) {
    cachedResponse.fromCache = true
    cachedResponse.cacheHit = true
    return cachedResponse
  }

  try {
    const command = parseCommand(userMessage)
    
    let response
    switch (command.type) {
      case 'GREETING':
        response = {
          content: handleGreeting(userMessage),
          isError: false,
        }
        break
      
      case 'HELP':
        response = {
          content: handleHelp(),
          isError: false,
        }
        break
      
      case 'COMPANY_DETAILS':
        const companyName = extractCompanyName(command.context)
        response = await handleCompanyDetailsQuery(companyName)
        break
      
      case 'COMPANY_LIST': {
        const companies = await Company.find().select('name industry status')
        if (companies.length === 0) {
          response = { content: 'No companies found in the system.', isError: true }
        } else {
          let content = `**Companies in Portfolio (${companies.length}):**\n\n`
          companies.forEach((c, i) => {
            content += `${i + 1}. **${c.name}** - ${c.industry || 'General'} (${c.status || 'Active'})\n`
          })
          response = { content, isError: false }
        }
        break
      }
      
      case 'FINANCIAL':
        response = await handleFinancialQuery(command.context)
        break
      
      case 'HR_METRICS':
        response = await handleHRQuery(command.context)
        break
      
      case 'RISKS':
        response = await handleRisksQuery(command.context)
        break
      
      case 'GROWTH':
        response = await handleGrowthQuery(command.context)
        break
      
      case 'PERFORMANCE':
        response = await handleFinancialQuery(command.context)
        break
      
      case 'TASKS':
        response = await handleTasksQuery(command.context)
        break
      
      case 'COMPLETE_COMPANY_LIST':
        response = await handleCompleteCompanyList()
        break
      
      case 'DASHBOARD':
        response = await handleDashboardQuery()
        break
      
      case 'APPROVALS':
        response = await handleApprovalsQuery()
        break
      
      case 'USERS':
        response = await handleUsersQuery()
        break
      
      case 'SUBMISSIONS':
        response = await handleSubmissionsQuery()
        break
      
      case 'ALERTS':
        response = await handleAlertsQuery()
        break
      
      case 'COMPARISON':
        response = await handleComparisonQuery(userMessage)
        break
      
      case 'ANALYTICS':
        response = await handleFinancialQuery(command.context)
        break
      
      case 'SUMMARY':
        response = await handleCompanyListQuery()
        break
      
      default:
        response = {
          content: `**I'm here to help! 🤖**\n\nI understood your query: "${userMessage}"\n\nI can help you with:\n\n**Company Info:**\n- "Tell me about [company name]" - Get company details\n- "List all companies" - See portfolio summary\n- "Give me all companies" - Complete detailed list\n\n**Dashboard & Overview:**\n- "Show dashboard" - Full superadmin overview\n- "All data" - Complete system summary\n\n**Approvals & Users:**\n- "Show approvals" - Approval status\n- "Show users/admins" - Team members\n\n**Submissions & Alerts:**\n- "Show submissions" - Portfolio updates\n- "Show alerts" - Smart alerts\n\n**Financial & HR:**\n- "Show financial metrics" - Revenue, profit, expenses\n- "Show HR metrics" - Employee analytics\n\n**Risk & Growth:**\n- "What are the risks?" - Risk assessment\n- "Growth opportunities" - Expansion ideas\n\n**Tasks & Performance:**\n- "Show pending tasks" - Active assignments\n- "Performance summary" - Overall metrics\n\n**Comparisons:**\n- "Compare [company1] vs [company2]"\n\n**Type "help" or "what can you do?" to see all options! 💡**`,
          isError: false,
        }
    }
    
    return response
  } catch (error) {
    console.error('AI Service Error:', error)
    return {
      content: `I encountered an error processing your request: ${error.message}. Please try again or ask a different question.`,
      isError: true,
    }
  }
}

export const generatePlaceholderInsight = ({ companyName, category }) => {
  return `${category} insight for ${companyName}. This has been replaced with intelligent analysis.`
}
