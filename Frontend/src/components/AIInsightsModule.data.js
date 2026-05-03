// AI Insights Mock Data Engine
// Structured for easy swap with real API calls later

export const CATEGORIES = [
  { id: 'business_strategy', label: 'Business Strategy', color: 'bg-violet-100 text-violet-800 border-violet-300' },
  { id: 'hr', label: 'HR & People', color: 'bg-sky-100 text-sky-800 border-sky-300' },
  { id: 'finance', label: 'Finance', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { id: 'risk', label: 'Risk & Compliance', color: 'bg-rose-100 text-rose-800 border-rose-300' },
  { id: 'growth', label: 'Growth & Sales', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  { id: 'operations', label: 'Operations', color: 'bg-slate-100 text-slate-800 border-slate-300' },
]

export const PRIORITIES = {
  high: { label: 'High', color: 'bg-red-100 text-red-800 border-red-300' },
  medium: { label: 'Medium', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  low: { label: 'Low', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
}

export const TREND_COLORS = {
  risk: '#ef4444', hr: '#0284c7', finance: '#10b981',
  growth: '#f59e0b', business_strategy: '#8b5cf6', operations: '#64748b',
}

export const generateMockInsights = (companies) => {
  const list = companies.length ? companies : [
    { _id: 'c1', name: 'Embark College' },
    { _id: 'c2', name: 'TechNova Solutions' },
    { _id: 'c3', name: 'GreenLeaf Organics' },
    { _id: 'c4', name: 'Summit Financial' },
  ]
  const c = (idx) => list[idx] || { _id: `c${idx}`, name: `Company ${idx}` }

  return [
    {
      id: 'ins-1', title: 'Revenue Concentration Risk Detected',
      companyId: c(0)._id, companyName: c(0).name, category: 'risk',
      summary: 'AI analysis reveals that 68% of Q3 revenue is derived from a single tuition stream. Diversification into corporate training and executive education could reduce vulnerability to enrollment fluctuations and strengthen long-term financial resilience.',
      keyFindings: ['68% revenue from single stream (undergraduate tuition)', 'Corporate training segment currently untapped', 'Competitors have 3-4 diversified revenue channels', 'Enrollment volatility increased 14% YoY'],
      recommendations: ['Launch corporate upskilling programs within 90 days', 'Partner with 2-3 enterprise clients for pilot programs', 'Develop hybrid online certification courses', 'Allocate 15% of marketing budget to B2B outreach'],
      confidence: 94, priority: 'high', pinned: true,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      trendData: [{ label: 'Jun', value: 62 }, { label: 'Jul', value: 64 }, { label: 'Aug', value: 66 }, { label: 'Sep', value: 68 }, { label: 'Oct', value: 67 }, { label: 'Nov', value: 68 }],
    },
    {
      id: 'ins-2', title: 'Engineering Team Velocity Accelerating',
      companyId: c(1)._id, companyName: c(1).name, category: 'hr',
      summary: 'Sprint velocity has improved 23% over the last 4 sprints, driven by refined backlog grooming and reduced meeting overhead. However, the team is approaching capacity limits, and hiring 2 senior engineers is recommended to sustain momentum without burnout.',
      keyFindings: ['Sprint velocity up 23% over 4 sprints', 'Backlog grooming time reduced by 35%', 'Meeting overhead cut from 18h to 11h per week per dev', 'Overtime hours increased 12% — early burnout signal'],
      recommendations: ['Hire 2 senior full-stack engineers in Q4', 'Implement async standups to preserve flow state', 'Introduce wellness Friday policy (no meetings)', 'Cap sprint capacity at 85% to leave buffer for innovation'],
      confidence: 91, priority: 'medium', pinned: true,
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      trendData: [{ label: 'Jun', value: 45 }, { label: 'Jul', value: 48 }, { label: 'Aug', value: 52 }, { label: 'Sep', value: 55 }, { label: 'Oct', value: 58 }, { label: 'Nov', value: 62 }],
    },
    {
      id: 'ins-3', title: 'Supply Chain Margin Compression Alert',
      companyId: c(2)._id, companyName: c(2).name, category: 'finance',
      summary: 'Raw material costs for organic produce have risen 18% due to climate-related yield variability. AI modeling indicates that passing 60% of the increase to customers via premium SKUs will maintain margins while preserving brand equity among health-conscious buyers.',
      keyFindings: ['Raw material costs up 18% in last quarter', 'Climate volatility affecting 3 key supplier regions', 'Price elasticity model shows tolerance for 8-12% increase', 'Premium SKU segment growing 27% YoY'],
      recommendations: ['Introduce 2 premium product lines by January', 'Negotiate long-term contracts with 2 alternate suppliers', 'Implement dynamic pricing for seasonal items', 'Launch subscription model to improve predictability'],
      confidence: 88, priority: 'high', pinned: false,
      createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
      trendData: [{ label: 'Jun', value: 12 }, { label: 'Jul', value: 13 }, { label: 'Aug', value: 14 }, { label: 'Sep', value: 15 }, { label: 'Oct', value: 17 }, { label: 'Nov', value: 18 }],
    },
    {
      id: 'ins-4', title: 'Client Acquisition Cost Below Industry Benchmark',
      companyId: c(3)._id, companyName: c(3).name, category: 'growth',
      summary: 'CAC has decreased to $142 per client, 31% below the fintech industry average of $206. The driver is organic content marketing and referral loops. AI recommends doubling down on top-of-funnel educational content to sustain this advantage.',
      keyFindings: ['CAC at $142 (industry avg $206)', 'Organic content drives 44% of new leads', 'Referral conversion rate is 3.2x higher than paid ads', 'Customer LTV of $2,840 yields 20:1 LTV/CAC ratio'],
      recommendations: ['Increase content marketing budget by 40%', 'Launch referral incentive program for existing clients', 'A/B test educational webinar series', 'Expand SEO keyword targeting for long-tail finance terms'],
      confidence: 96, priority: 'low', pinned: false,
      createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
      trendData: [{ label: 'Jun', value: 210 }, { label: 'Jul', value: 195 }, { label: 'Aug', value: 178 }, { label: 'Sep', value: 165 }, { label: 'Oct', value: 152 }, { label: 'Nov', value: 142 }],
    },
    {
      id: 'ins-5', title: 'Regulatory Compliance Gap in Data Privacy',
      companyId: c(1)._id, companyName: c(1).name, category: 'risk',
      summary: 'Gap analysis against upcoming GDPR amendments and emerging AI Act requirements shows 3 critical control deficiencies in data retention and algorithmic transparency. Remediation within 60 days is advised to avoid regulatory penalties.',
      keyFindings: ['3 critical gaps in data retention policies', 'Algorithmic decision logs incomplete for 22% of models', 'Consent management does not cover new AI use cases', 'Regulatory fine exposure estimated at $2.4M – $4.8M'],
      recommendations: ['Engage external DPO audit within 2 weeks', 'Update consent flows to cover AI training data', 'Implement automated model lineage tracking', 'Schedule quarterly compliance review cadence'],
      confidence: 93, priority: 'high', pinned: true,
      createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
      trendData: [{ label: 'Jun', value: 2 }, { label: 'Jul', value: 2 }, { label: 'Aug', value: 3 }, { label: 'Sep', value: 4 }, { label: 'Oct', value: 5 }, { label: 'Nov', value: 3 }],
    },
    {
      id: 'ins-6', title: 'Cross-Sell Opportunity in Wealth Management',
      companyId: c(3)._id, companyName: c(3).name, category: 'business_strategy',
      summary: 'Portfolio analysis of 4,200 active clients reveals that 34% have investable assets exceeding $250K but are not enrolled in wealth management services. A targeted outreach campaign could unlock $12M in new AUM within 12 months.',
      keyFindings: ['34% of clients have >$250K uninvested assets', 'Current wealth management penetration is only 11%', 'Top 10% of clients represent 62% of revenue potential', 'Competitor wealth products have 28% penetration'],
      recommendations: ['Create VIP wealth onboarding concierge program', 'Deploy predictive model to identify next-best-product', 'Host quarterly exclusive investment roundtables', 'Offer fee-waived first year to early adopters'],
      confidence: 89, priority: 'medium', pinned: false,
      createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
      trendData: [{ label: 'Jun', value: 28 }, { label: 'Jul', value: 30 }, { label: 'Aug', value: 31 }, { label: 'Sep', value: 32 }, { label: 'Oct', value: 33 }, { label: 'Nov', value: 34 }],
    },
    {
      id: 'ins-7', title: 'Inventory Turnover Optimized Post-Automation',
      companyId: c(2)._id, companyName: c(2).name, category: 'operations',
      summary: 'Implementation of AI-driven demand forecasting has improved inventory turnover from 6.2x to 8.1x annually. Spoilage decreased 19%, and stockout incidents dropped 43%. Expansion to regional distribution hubs is now viable.',
      keyFindings: ['Inventory turnover improved from 6.2x to 8.1x', 'Spoilage down 19% with predictive shelf-life alerts', 'Stockouts reduced 43% via dynamic safety stock', 'Forecast accuracy now at 87% (up from 71%)'],
      recommendations: ['Roll out system to 2 regional hubs by Q2 next year', 'Integrate supplier EDI for real-time inventory sync', 'Launch auto-replenishment for top 50 SKUs', 'Investigate IoT temperature sensors for cold chain'],
      confidence: 92, priority: 'low', pinned: false,
      createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
      trendData: [{ label: 'Jun', value: 6.2 }, { label: 'Jul', value: 6.8 }, { label: 'Aug', value: 7.2 }, { label: 'Sep', value: 7.5 }, { label: 'Oct', value: 7.8 }, { label: 'Nov', value: 8.1 }],
    },
  ]
}

export const generateChatResponse = (question, companies, insights) => {
  const q = question.toLowerCase()
  if (q.includes('risk') && (q.includes('embark') || q.includes('college'))) {
    return { type: 'ai', content: `**Risk Assessment for Embark College:**\n\nThe primary risk is **revenue concentration** — 68% from undergraduate tuition. Secondary risks include:\n- Enrollment volatility (+14% YoY fluctuation)\n- Rising operational costs outpacing tuition growth\n- Limited digital course offerings vs. competitors\n\n**Mitigation priority:** Launch B2B corporate training and diversify into certification programs within 90 days. This could reduce concentration to <45% within 18 months.`, timestamp: new Date().toISOString() }
  }
  if (q.includes('hr') && q.includes('compare')) {
    return { type: 'ai', content: `**Cross-Company HR Performance Comparison:**\n\n| Metric | TechNova | GreenLeaf | Summit | Embark |\n|---|---|---|---|---|\n| Avg. Tenure | 3.2 yrs | 2.8 yrs | 4.1 yrs | 5.6 yrs |\n| Open Roles | 8 | 4 | 2 | 6 |\n| Satisfaction | 4.3/5 | 4.1/5 | 4.5/5 | 4.0/5 |\n| Turnover (30d) | 5.2% | 3.8% | 2.1% | 4.5% |\n\n**Insight:** TechNova shows highest turnover despite strong satisfaction — investigate workload distribution. Summit leads in retention due to structured career ladders.`, timestamp: new Date().toISOString() }
  }
  if (q.includes('growth') && (q.includes('quarter') || q.includes('q1') || q.includes('next'))) {
    return { type: 'ai', content: `**Growth Opportunities for Q1 2025:**\n\n1. **Summit Financial** — Cross-sell wealth management to 34% of clients with uninvested assets. Potential: $12M AUM.\n2. **TechNova** — Enterprise SaaS pivot. Current product-market fit score is 78%; enterprise features could push it to 88%+.\n3. **GreenLeaf** — Subscription box model for urban markets. TAM analysis suggests $4.2M addressable market.\n4. **Embark** — International student recruitment in Southeast Asia. 3 universities already expressing interest.\n\n**Recommended focus:** Summit wealth management has highest probability of near-term revenue impact with lowest execution risk.`, timestamp: new Date().toISOString() }
  }
  if (q.includes('finance') || q.includes('budget')) {
    return { type: 'ai', content: `**Portfolio Financial Health Summary:**\n\n- **Total portfolio budget utilization:** 67% (healthy range)\n- **Highest spend:** TechNova at $1.2M (R&D investment cycle)\n- **Lowest utilization:** Embark at 34% (underspending on digital infrastructure)\n- **Overdue invoices:** 3 (all from GreenLeaf supplier contracts — recommend renegotiation)\n\n**AI Recommendation:** Reallocate 15% of Embark's idle budget to digital transformation and online course platform development.`, timestamp: new Date().toISOString() }
  }
  return { type: 'ai', content: `**AI Analysis Result:**\n\nI've analyzed your portfolio data in response to: *"${question}"*\n\n**Key Observations:**\n- Total portfolio companies: **${companies.length || 4}**\n- Active AI insights: **${insights.length || 7}**\n- Average confidence level: **91%**\n- High-priority items: **${insights.filter((i) => i.priority === 'high').length || 2}**\n\nYour portfolio demonstrates strong operational fundamentals with some concentration risks. I recommend reviewing the pinned insights for immediate action items, and using the filter panel to drill into specific categories or companies.\n\nWould you like me to generate a detailed report on any specific company or risk area?`, timestamp: new Date().toISOString() }
}

export const buildExportHTML = (insight) => {
  const catLabel = CATEGORIES.find((c) => c.id === insight.category)?.label || insight.category
  return `<!DOCTYPE html><html><head><title>AI Insight — ${insight.title}</title><style>
    body{font-family:system-ui,sans-serif;max-width:800px;margin:40px auto;padding:0 24px;color:#1e293b;line-height:1.6}
    h1{font-size:28px;margin-bottom:8px}.meta{color:#64748b;font-size:14px;margin-bottom:24px}
    .section{margin-bottom:24px}.section h3{font-size:16px;color:#0f172a;margin-bottom:10px;border-bottom:1px solid #e2e8f0;padding-bottom:6px}
    ul,ol{padding-left:20px}li{margin-bottom:8px}
    .badge{display:inline-block;padding:4px 14px;border-radius:9999px;font-size:12px;font-weight:600;margin-right:8px;margin-bottom:8px}
    .confidence{background:#ecfdf5;color:#065f46}.priority-high{background:#fef2f2;color:#991b1b}
    .priority-medium{background:#fffbeb;color:#92400e}.priority-low{background:#f0fdf4;color:#166534}
    .summary{background:#f8fafc;padding:16px;border-radius:12px;border-left:4px solid #6366f1;margin-bottom:20px}
  </style></head><body>
    <h1>${insight.title}</h1>
    <div class="meta">${insight.companyName} • ${catLabel} • ${new Date(insight.createdAt).toLocaleDateString()}</div>
    <div class="badge confidence">Confidence: ${insight.confidence}%</div>
    <div class="badge priority-${insight.priority}">Priority: ${insight.priority.toUpperCase()}</div>
    <div class="section"><h3>AI Summary</h3><div class="summary"><p>${insight.summary}</p></div></div>
    <div class="section"><h3>Key Findings</h3><ul>${insight.keyFindings.map((f) => `<li>${f}</li>`).join('')}</ul></div>
    <div class="section"><h3>Actionable Recommendations</h3><ol>${insight.recommendations.map((r) => `<li>${r}</li>`).join('')}</ol></div>
    <div class="section"><h3>About This Insight</h3><p style="color:#64748b;font-size:13px">Generated by AI Command Center • Confidence score: ${insight.confidence}% • Based on aggregated portfolio data.</p></div>
  </body></html>`
}
