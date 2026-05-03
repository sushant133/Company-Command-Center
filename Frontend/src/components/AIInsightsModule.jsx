import { useState, useMemo, useRef, useEffect } from 'react'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'
import {
  Bot, Sparkles, Search, Pin, PinOff, Download, Trash2, Send, Loader2,
  BrainCircuit, TrendingUp, AlertTriangle, CheckCircle2, Building2, Clock,
  ChevronDown, ChevronUp, MessageSquare, FileText, BarChart3, Filter,
  Lightbulb, Zap,
} from 'lucide-react'
import { Card, CardContent } from './ui/Card'
import Badge from './ui/Badge'
import Button from './ui/Button'
import Input from './ui/Input'
import Select from './ui/Select'
import { Surface, MetricCard, EmptyPanel } from './app/AppShell'
import {
  CATEGORIES, PRIORITIES, TREND_COLORS,
  generateMockInsights, generateChatResponse, buildExportHTML,
} from './AIInsightsModule.data'

function ConfidenceBar({ score }) {
  const color = score >= 90 ? 'bg-emerald-500' : score >= 85 ? 'bg-amber-500' : 'bg-orange-500'
  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium text-slate-600">Confidence</span>
        <span className="font-bold text-slate-900">{score}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}

function MiniTrendChart({ data, color = '#0284c7' }) {
  const gid = `mg-${color.replace('#', '')}`
  return (
    <div className="h-[80px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="value" stroke={color} fill={`url(#${gid})`} strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function ChatMessage({ msg }) {
  const isUser = msg.type === 'user'
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${isUser ? 'bg-slate-800 text-white' : 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white'}`}>
        {isUser ? <MessageSquare className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${isUser ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-700'}`}>
        {msg.content.split('\n').map((line, i) => (
          <p key={i} className={line.startsWith('**') ? 'font-semibold mt-2 first:mt-0' : ''}>{line}</p>
        ))}
      </div>
    </div>
  )
}

export default function AIInsightsModule({ companies = [] }) {
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCompany, setFilterCompany] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterConfidence, setFilterConfidence] = useState('all')
  const [regenerating, setRegenerating] = useState(false)
  const [expandedCards, setExpandedCards] = useState(new Set())
  const [chatMessages, setChatMessages] = useState([{ type: 'ai', content: 'Welcome to the AI Command Center. I can analyze your portfolio, compare company performance, identify risks, and suggest growth strategies. What would you like to explore?', timestamp: new Date().toISOString() }])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [insights, setInsights] = useState(() => generateMockInsights(companies))
  const [showFilters, setShowFilters] = useState(false)
  const chatEndRef = useRef(null)

  const filteredInsights = useMemo(() => {
    let result = [...insights]
    if (activeTab === 'pinned') result = result.filter((i) => i.pinned)
    else if (activeTab === 'history') result = result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter((i) => i.title.toLowerCase().includes(q) || i.summary.toLowerCase().includes(q) || i.companyName.toLowerCase().includes(q))
    }
    if (filterCompany !== 'all') result = result.filter((i) => i.companyId === filterCompany)
    if (filterCategory !== 'all') result = result.filter((i) => i.category === filterCategory)
    if (filterPriority !== 'all') result = result.filter((i) => i.priority === filterPriority)
    if (filterConfidence !== 'all') {
      if (filterConfidence === '95+') result = result.filter((i) => i.confidence >= 95)
      else if (filterConfidence === '90-94') result = result.filter((i) => i.confidence >= 90 && i.confidence < 95)
      else if (filterConfidence === '85-89') result = result.filter((i) => i.confidence >= 85 && i.confidence < 90)
    }
    return result
  }, [insights, activeTab, searchQuery, filterCompany, filterCategory, filterPriority, filterConfidence])

  const stats = useMemo(() => {
    const total = insights.length
    const companiesAnalyzed = new Set(insights.map((i) => i.companyId)).size
    const avgConfidence = total > 0 ? Math.round(insights.reduce((s, i) => s + i.confidence, 0) / total) : 0
    const lastUpdated = total > 0 ? new Date(Math.max(...insights.map((i) => new Date(i.createdAt).getTime()))).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'
    return { total, companiesAnalyzed, avgConfidence, lastUpdated }
  }, [insights])

  const toggleExpand = (id) => {
    setExpandedCards((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next })
  }
  const togglePin = (id) => { setInsights((prev) => prev.map((i) => (i.id === id ? { ...i, pinned: !i.pinned } : i))) }

  const handleDeleteInsight = (id) => {
    if (!window.confirm('Are you sure you want to delete this insight?')) return
    setInsights((prev) => prev.filter((i) => i.id !== id))
    setExpandedCards((prev) => { const next = new Set(prev); next.delete(id); return next })
  }

  const handleRegenerateAll = () => {
    setRegenerating(true)
    setTimeout(() => {
      const fresh = generateMockInsights(companies).map((ins, idx) => ({
        ...ins, id: `${ins.id}-regen-${Date.now()}-${idx}`, createdAt: new Date().toISOString(),
        confidence: Math.min(98, Math.max(85, ins.confidence + Math.floor(Math.random() * 5 - 2))),
      }))
      setInsights(fresh); setRegenerating(false)
    }, 2500)
  }

  const handleChatSubmit = (e) => {
    e.preventDefault()
    if (!chatInput.trim() || chatLoading) return
    const userMsg = { type: 'user', content: chatInput, timestamp: new Date().toISOString() }
    setChatMessages((prev) => [...prev, userMsg]); setChatInput(''); setChatLoading(true)
    setTimeout(() => {
      setChatMessages((prev) => [...prev, generateChatResponse(userMsg.content, companies, insights)])
      setChatLoading(false)
    }, 1800)
  }

  const handleExportPDF = (insight) => {
    const blob = new Blob([buildExportHTML(insight)], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const w = window.open(url, '_blank')
    if (w) w.onload = () => { w.print(); URL.revokeObjectURL(url) }
  }

  const handleApplyRecommendation = (insight) => {
    alert(`Recommendation from "${insight.title}" has been queued for implementation.\n\nA task will be created for ${insight.companyName} with priority ${insight.priority.toUpperCase()}.`)
  }

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chatMessages, chatLoading])

  const renderCategoryBadge = (catId) => {
    const cat = CATEGORIES.find((c) => c.id === catId)
    return cat ? <Badge variant="outline" className={cat.color}>{cat.label}</Badge> : <Badge variant="outline">{catId}</Badge>
  }

  const renderPriorityBadge = (p) => {
    const config = PRIORITIES[p]
    if (!config) return <Badge variant="outline">{p}</Badge>
    const IconMap = { high: AlertTriangle, medium: TrendingUp, low: CheckCircle2 }
    const Icon = IconMap[p] || CheckCircle2
    return <Badge variant="outline" className={`${config.color} gap-1`}><Icon className="h-3 w-3" />{config.label}</Badge>
  }

  const TABS = [
    { id: 'all', label: 'All Insights', icon: BarChart3 },
    { id: 'pinned', label: 'Pinned', icon: Pin },
    { id: 'history', label: 'Insight History', icon: Clock },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg">
            <BrainCircuit className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">AI Command Center</h2>
            <p className="text-sm text-slate-500">Real-time portfolio intelligence and predictive analytics</p>
          </div>
        </div>
        <Button size="lg" className="gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg hover:from-violet-700 hover:to-indigo-700" onClick={handleRegenerateAll} isLoading={regenerating}>
          {!regenerating && <Sparkles className="h-4 w-4" />}
          Generate Fresh Insights
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Insights" value={stats.total} subtitle="AI-generated intelligence cards" icon={FileText} tone="slate" />
        <MetricCard title="Companies Analyzed" value={stats.companiesAnalyzed} subtitle="Active portfolio coverage" icon={Building2} tone="sky" />
        <MetricCard title="AI Confidence Level" value={`${stats.avgConfidence}%`} subtitle="Average across all insights" icon={BrainCircuit} tone="emerald" />
        <MetricCard title="Last Updated" value={stats.lastUpdated} subtitle="Most recent insight generated" icon={Clock} tone="amber" />
      </div>

      {/* Main Grid */}
      {/* Responsive: full-width stacked on mobile/tablet, side-by-side on large screens */}
      {/* On smaller screens, the insights list takes priority */}
      {/* On LG+, insights (1fr) and AI Chat (320px on lg, 380px on xl+) */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_380px]">
        {/* LEFT: Insights */}
        <div className="space-y-5">
          {/* Tabs & Search */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {TABS.map((tab) => {
                const active = activeTab === tab.id
                const Icon = tab.icon
                const count = tab.id === 'all' ? insights.length : tab.id === 'pinned' ? insights.filter((i) => i.pinned).length : insights.length
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${active ? 'bg-slate-950 text-white shadow-md' : 'bg-white/80 text-slate-600 hover:bg-white hover:text-slate-900 border border-slate-200'}`}>
                    <Icon className="h-4 w-4" />
                    {tab.label}
                    <span className={`ml-1 rounded-full px-2 py-0.5 text-xs ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>{count}</span>
                  </button>
                )
              })}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input placeholder="Search insights..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="rounded-xl border-slate-200 bg-white/90 pl-9 w-full sm:w-[220px]" />
              </div>
              <Button variant="outline" size="sm" className={`gap-2 rounded-xl ${showFilters ? 'bg-slate-100 border-slate-300' : ''}`} onClick={() => setShowFilters(!showFilters)}>
                <Filter className="h-4 w-4" /> Filters
              </Button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <Card className="border-slate-200 bg-white/90">
              <CardContent className="p-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Select value={filterCompany} onChange={(e) => setFilterCompany(e.target.value)} className="rounded-xl border-slate-200 bg-white">
                    <option value="all">All Companies</option>
                    {companies.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </Select>
                  <Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="rounded-xl border-slate-200 bg-white">
                    <option value="all">All Categories</option>
                    {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </Select>
                  <Select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="rounded-xl border-slate-200 bg-white">
                    <option value="all">All Priorities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </Select>
                  <Select value={filterConfidence} onChange={(e) => setFilterConfidence(e.target.value)} className="rounded-xl border-slate-200 bg-white">
                    <option value="all">All Confidence</option>
                    <option value="95+">95%+</option>
                    <option value="90-94">90-94%</option>
                    <option value="85-89">85-89%</option>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Insight Cards */}
          <div className="space-y-4">
            {filteredInsights.length ? (
              filteredInsights.map((insight) => {
                const expanded = expandedCards.has(insight.id)
                const trendColor = TREND_COLORS[insight.category] || '#0284c7'
                return (
                  <Card key={insight.id} className={`overflow-hidden border-slate-200 bg-white/90 transition-shadow ${expanded ? 'shadow-lg' : 'shadow-sm'}`}>
                    <CardContent className="p-5">
                      {/* Card Header */}
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            {renderCategoryBadge(insight.category)}
                            {renderPriorityBadge(insight.priority)}
                            {insight.pinned && <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200 gap-1"><Pin className="h-3 w-3" />Pinned</Badge>}
                          </div>
                          <h3 className="text-lg font-semibold text-slate-950 leading-snug">{insight.title}</h3>
                          <p className="mt-1 text-sm text-slate-500 flex items-center gap-1">
                            <Building2 className="h-3.5 w-3.5" />
                            {insight.companyName}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => togglePin(insight.id)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors" title={insight.pinned ? 'Unpin' : 'Pin'}>
                            {insight.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                          </button>
                          <button onClick={() => handleExportPDF(insight)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors" title="Export as PDF">
                            <Download className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDeleteInsight(insight.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors" title="Delete insight">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Summary */}
                      <p className="mt-3 text-sm leading-relaxed text-slate-600">{insight.summary}</p>

                      {/* Expandable Content */}
                      {expanded && (
                        <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
                          <div>
                            <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                              <Lightbulb className="h-4 w-4 text-amber-500" /> Key Findings
                            </h4>
                            <ul className="space-y-1.5">
                              {insight.keyFindings.map((finding, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                                  {finding}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                              <Zap className="h-4 w-4 text-violet-500" /> Actionable Recommendations
                            </h4>
                            <ol className="space-y-1.5">
                              {insight.recommendations.map((rec, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-700">{idx + 1}</span>
                                  {rec}
                                </li>
                              ))}
                            </ol>
                          </div>
                          <div className="flex items-center justify-between">
                            <ConfidenceBar score={insight.confidence} />
                            <Button size="sm" className="rounded-xl gap-2" onClick={() => handleApplyRecommendation(insight)}>
                              <CheckCircle2 className="h-4 w-4" /> Apply Recommendation
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-[80px] sm:w-[100px] lg:w-[120px]">
                            <MiniTrendChart data={insight.trendData} color={trendColor} />
                          </div>
                          <span className="text-xs text-slate-400">6-mo trend</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-400">{new Date(insight.createdAt).toLocaleDateString()}</span>
                          <button onClick={() => toggleExpand(insight.id)} className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                            {expanded ? (
                              <><ChevronUp className="h-4 w-4" /> Show Less</>
                            ) : (
                              <><ChevronDown className="h-4 w-4" /> Show Details</>
                            )}
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            ) : (
              <EmptyPanel title="No insights match your filters" description="Try adjusting your search or filter criteria to see more results." />
            )}
          </div>
        </div>

        {/* RIGHT: AI Chat */}
        <div className="space-y-4">
          <Surface title="Ask AI" eyebrow="Natural language analysis">
            <div className="flex h-[60vh] lg:h-[480px] flex-col">
              <div className="flex-1 space-y-4 overflow-y-auto pr-1">
                {chatMessages.map((msg, idx) => <ChatMessage key={idx} msg={msg} />)}
                {chatLoading && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    AI is analyzing your portfolio...
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={handleChatSubmit} className="mt-4 flex gap-2">
                <Input
                  placeholder="Ask anything about your portfolio..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 rounded-xl border-slate-200 bg-white"
                />
                <Button type="submit" size="sm" className="rounded-xl gap-2" disabled={chatLoading || !chatInput.trim()}>
                  <Send className="h-4 w-4" /> Send
                </Button>
              </form>
              <div className="mt-3 flex flex-wrap gap-2">
                {['What are the biggest risks for Embark College?', 'Compare HR performance across all companies', 'Give me growth opportunities for next quarter'].map((q) => (
                  <button key={q} onClick={() => { setChatInput(q) }} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </Surface>

          <Surface title="AI Capabilities" eyebrow="What you can ask">
            <div className="space-y-3">
              {[
                { icon: AlertTriangle, title: 'Risk Analysis', desc: 'Identify financial, operational, and compliance risks across companies' },
                { icon: TrendingUp, title: 'Performance Comparison', desc: 'Compare HR, finance, and growth metrics across your portfolio' },
                { icon: Lightbulb, title: 'Strategic Recommendations', desc: 'Get AI-generated growth strategies and optimization ideas' },
                { icon: BrainCircuit, title: 'Predictive Forecasting', desc: 'View trend projections and scenario modeling for each company' },
              ].map((cap) => (
                <div key={cap.title} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                    <cap.icon className="h-4 w-4 text-slate-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{cap.title}</p>
                    <p className="text-xs text-slate-500">{cap.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Surface>
        </div>
      </div>
    </div>
  )
}
