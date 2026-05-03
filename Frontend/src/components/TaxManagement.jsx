import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BarChart, Bar, CartesianGrid, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts'
import { AlertTriangle, Building2, Calculator, Calendar, CheckCircle2, Clock, Download, FileText, Percent, Plus, Search, ShieldCheck, TrendingUp, Upload, Users, XCircle } from 'lucide-react'
import { taxAPI, companiesAPI, hrAPI } from '../api/platform'
import { useAuth } from '../hooks/useAuth'
import { Surface, MetricCard, EmptyPanel } from './app/AppShell'
import Button from './ui/Button'
import Input from './ui/Input'
import Select from './ui/Select'
import Badge from './ui/Badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/Tabs'
import { Modal } from './ui/Modal'

const STATUS_COLORS = { Pending: 'bg-amber-50 text-amber-700 border-amber-200', Filed: 'bg-emerald-50 text-emerald-700 border-emerald-200', Overdue: 'bg-rose-50 text-rose-700 border-rose-200' }
const CHART_COLORS = ['#0f172a', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']

function AddFilingModal({ open, onClose, companyId, isSuperAdmin, companyList, onSubmit }) {
  const [form, setForm] = useState({ filingType: 'GST', period: '', dueDate: '', amount: '', challanNumber: '', notes: '' })
  const [err, setErr] = useState('')
  useEffect(() => { if (open) { setForm({ filingType: 'GST', period: '', dueDate: '', amount: '', challanNumber: '', notes: '' }); setErr('') } }, [open])
  const handleSubmit = () => { if (!form.period || !form.dueDate) { setErr('Period and Due Date required'); return } onSubmit({ ...form, companyId: isSuperAdmin ? (form.companyId || companyId) : companyId, amount: Number(form.amount) || 0 }) }
  return (
    <Modal isOpen={open} onClose={onClose} title="Add Tax Filing" size="lg">
      <div className="space-y-3">
        {err && <p className="text-sm text-red-500">{err}</p>}
        {isSuperAdmin && <Select value={form.companyId || ''} onChange={e => setForm({ ...form, companyId: e.target.value })} className="rounded-xl"><option value="">Select Company</option>{companyList.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}</Select>}
        <Select value={form.filingType} onChange={e => setForm({ ...form, filingType: e.target.value })} className="rounded-xl">{['GST','IncomeTax','TDS','AdvanceTax','ProfessionalTax'].map(t => <option key={t} value={t}>{t}</option>)}</Select>
        <Input label="Period *" placeholder="Q1-2024" value={form.period} onChange={e => setForm({ ...form, period: e.target.value })} className="rounded-xl" />
        <Input label="Due Date *" type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="rounded-xl" />
        <Input label="Amount" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="rounded-xl" />
        <Input label="Challan" value={form.challanNumber} onChange={e => setForm({ ...form, challanNumber: e.target.value })} className="rounded-xl" />
        <Button onClick={handleSubmit} className="w-full rounded-xl">Create Filing</Button>
      </div>
    </Modal>
  )
}

function AddDeductionModal({ open, onClose, companyId, employees, onSubmit }) {
  const [form, setForm] = useState({ section: '80C', description: '', amount: '', employeeId: '', financialYear: '' })
  const [err, setErr] = useState('')
  useEffect(() => { if (open) { setForm({ section: '80C', description: '', amount: '', employeeId: '', financialYear: '' }); setErr('') } }, [open])
  const handleSubmit = () => { if (!form.financialYear || !form.amount) { setErr('FY and Amount required'); return } onSubmit({ ...form, companyId, amount: Number(form.amount) }) }
  return (
    <Modal isOpen={open} onClose={onClose} title="Add Deduction" size="lg">
      <div className="space-y-3">
        {err && <p className="text-sm text-red-500">{err}</p>}
        <Input label="FY *" placeholder="2024-25" value={form.financialYear} onChange={e => setForm({ ...form, financialYear: e.target.value })} className="rounded-xl" />
        <Select value={form.section} onChange={e => setForm({ ...form, section: e.target.value })} className="rounded-xl">{['80C','80D','80G','HRA','LTA','Other'].map(s => <option key={s} value={s}>{s}</option>)}</Select>
        <Select value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })} className="rounded-xl"><option value="">Company-level</option>{employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name} ({emp.employeeId})</option>)}</Select>
        <Input label="Desc" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="rounded-xl" />
        <Input label="Amount *" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="rounded-xl" />
        <Button onClick={handleSubmit} className="w-full rounded-xl">Add Deduction</Button>
      </div>
    </Modal>
  )
}

export default function TaxManagement({ isSuperAdmin }) {
  const qc = useQueryClient()
  const { user } = useAuth()
  const [tab, setTab] = useState('dashboard')
  const [companyFilter, setCompanyFilter] = useState('')
  const [fy, setFy] = useState('2024-25')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showFiling, setShowFiling] = useState(false)
  const [showDeduction, setShowDeduction] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 4000); return () => clearTimeout(t) }, [toast])

  const companyId = isSuperAdmin ? companyFilter || undefined : user?.companyId
  const cParams = { ...(companyId && { companyId }), financialYear: fy }

  const dashQ = useQuery({ queryKey: ['tax-dash', cParams], queryFn: () => taxAPI.getDashboard(cParams), enabled: tab === 'dashboard' })
  const filingQ = useQuery({ queryKey: ['tax-filings', { ...cParams, search, status: statusFilter }], queryFn: () => taxAPI.getFilings({ ...cParams, search, status: statusFilter }), enabled: tab === 'filings' })
  const tdsQ = useQuery({ queryKey: ['tax-tds', cParams], queryFn: () => taxAPI.getTDS(cParams), enabled: tab === 'tds' })
  const dedQ = useQuery({ queryKey: ['tax-ded', cParams], queryFn: () => taxAPI.getDeductions(cParams), enabled: tab === 'deductions' })
  const docQ = useQuery({ queryKey: ['tax-docs', cParams], queryFn: () => taxAPI.getDocuments(cParams), enabled: tab === 'compliance' })
  const repQ = useQuery({ queryKey: ['tax-rep', cParams], queryFn: () => taxAPI.getReports(cParams), enabled: tab === 'reports' })
  const compQ = useQuery({ queryKey: ['companies'], queryFn: companiesAPI.list, enabled: isSuperAdmin })
  const empQ = useQuery({ queryKey: ['hr-emp', { companyId }], queryFn: () => hrAPI.getEmployees({ companyId }), enabled: tab === 'tds' || tab === 'deductions' })

  const companies = compQ.data || []
  const companyList = isSuperAdmin && companies.length ? companies : [...new Map((empQ.data?.employees || []).filter(e => e.companyId?._id).map(e => [e.companyId._id, { _id: e.companyId._id, name: e.companyId.name }])).values()]
  const dash = dashQ.data?.data || {}
  const sum = dash.summary || {}
  const upcoming = dash.upcomingDue || []
  const filings = filingQ.data?.data?.filings || []
  const tdsRecords = tdsQ.data?.data?.records || []
  const deductions = dedQ.data?.data?.deductions || []
  const documents = docQ.data?.data || []
  const rep = repQ.data?.data || {}
  const employees = empQ.data?.employees || []

  const filingM = useMutation({ mutationFn: taxAPI.createFiling, onSuccess: () => { qc.invalidateQueries({ queryKey: ['tax-filings'] }); qc.invalidateQueries({ queryKey: ['tax-dash'] }); qc.invalidateQueries({ queryKey: ['tax-rep'] }); setShowFiling(false); setToast({ type: 'success', message: 'Filing created' }) }, onError: e => setToast({ type: 'error', message: e.message }) })
  const statusM = useMutation({ mutationFn: ({ id, payload }) => taxAPI.updateFilingStatus(id, payload), onSuccess: () => { qc.invalidateQueries({ queryKey: ['tax-filings'] }); qc.invalidateQueries({ queryKey: ['tax-dash'] }); qc.invalidateQueries({ queryKey: ['tax-rep'] }); setToast({ type: 'success', message: 'Status updated' }) }, onError: e => setToast({ type: 'error', message: e.message }) })
  const tdsAutoM = useMutation({ mutationFn: taxAPI.autoCalculateTDS, onSuccess: res => { qc.invalidateQueries({ queryKey: ['tax-tds'] }); qc.invalidateQueries({ queryKey: ['tax-rep'] }); qc.invalidateQueries({ queryKey: ['tax-dash'] }); setToast({ type: 'success', message: res.message }) }, onError: e => setToast({ type: 'error', message: e.message }) })
  const dedM = useMutation({ mutationFn: taxAPI.createDeduction, onSuccess: () => { qc.invalidateQueries({ queryKey: ['tax-ded'] }); qc.invalidateQueries({ queryKey: ['tax-rep'] }); qc.invalidateQueries({ queryKey: ['tax-dash'] }); setShowDeduction(false); setToast({ type: 'success', message: 'Deduction added' }) }, onError: e => setToast({ type: 'error', message: e.message }) })
  const docM = useMutation({ mutationFn: taxAPI.createDocument, onSuccess: () => { qc.invalidateQueries({ queryKey: ['tax-docs'] }); setToast({ type: 'success', message: 'Document recorded' }) }, onError: e => setToast({ type: 'error', message: e.message }) })

  const month = useMemo(() => { const n = new Date(); return n.getFullYear() + '-' + String(n.getMonth() + 1).padStart(2, '0') }, [])
  const autoTds = () => { if (!companyId) { setToast({ type: 'error', message: 'Select company' }); return } tdsAutoM.mutate({ companyId, month, financialYear: fy, regime: 'new' }) }
  const exportCSV = (data, name) => { if (!data?.length) return; const h = Object.keys(data[0]); const csv = [h.join(','), ...data.map(r => h.map(k => '"' + String(r[k] ?? '').replace(/"/g, '""') + '"').join(','))].join('\n'); const b = new Blob([csv], { type: 'text/csv' }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = name + '.csv'; a.click(); URL.revokeObjectURL(u) }
  const compSelect = (v, onC) => <Select value={v} onChange={onC} className="rounded-xl"><option value="">{isSuperAdmin ? 'Select Company' : 'Company'}</option>{companyList.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}</Select>
  const isOverdue = d => new Date(d) < new Date() && new Date(d).toDateString() !== new Date().toDateString()

  return (
    <div className="space-y-6">
      {toast && <div className={'rounded-xl border px-4 py-3 text-sm ' + (toast.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700')}>{toast.message}</div>}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Tax Management</h2>
          <p className="mt-1 text-sm text-slate-500">{isSuperAdmin ? 'Manage tax data across all companies' : 'Manage tax data for ' + (user?.company?.name || 'your company')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isSuperAdmin && compSelect(companyFilter, e => setCompanyFilter(e.target.value))}
          <Select value={fy} onChange={e => setFy(e.target.value)} className="rounded-xl w-32"><option value="2023-24">2023-24</option><option value="2024-25">2024-25</option><option value="2025-26">2025-26</option></Select>
          {isSuperAdmin && <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200"><Building2 className="mr-1 h-3.5 w-3.5" />Global</Badge>}
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="dashboard"><TrendingUp className="mr-1.5 h-4 w-4" />Dashboard</TabsTrigger>
          <TabsTrigger value="filings"><FileText className="mr-1.5 h-4 w-4" />Filings</TabsTrigger>
          <TabsTrigger value="tds"><Users className="mr-1.5 h-4 w-4" />TDS</TabsTrigger>
          <TabsTrigger value="deductions"><Percent className="mr-1.5 h-4 w-4" />Deductions</TabsTrigger>
          <TabsTrigger value="reports"><BarChart className="mr-1.5 h-4 w-4" />Reports</TabsTrigger>
          <TabsTrigger value="compliance"><ShieldCheck className="mr-1.5 h-4 w-4" />Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard title="Total Filings" value={sum.totalFilings || 0} subtitle="All returns" icon={FileText} tone="slate" />
              <MetricCard title="Pending" value={sum.pendingFilings || 0} subtitle="Awaiting" icon={Clock} tone="amber" />
              <MetricCard title="Overdue" value={sum.overdueFilings || 0} subtitle="Action needed" icon={AlertTriangle} tone="rose" />
              <MetricCard title="Filed This Month" value={sum.filedThisMonth || 0} subtitle="Completed" icon={CheckCircle2} tone="emerald" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <MetricCard title="Total TDS" value={'Rs.' + (sum.totalTDS || 0).toLocaleString()} subtitle="Deducted" icon={Users} tone="sky" />
              <MetricCard title="Deductions" value={'Rs.' + (sum.totalDeductions || 0).toLocaleString()} subtitle="Exemptions" icon={Percent} tone="sky" />
              <MetricCard title="Upcoming Due" value={upcoming.length} subtitle="Next 7 days" icon={Calendar} tone="amber" />
            </div>
            <Surface title="Upcoming Deadlines" eyebrow="Next 7 days">
              <div className="space-y-3">
                {upcoming.length ? upcoming.map(d => (
                  <div key={d._id} className={'flex items-center justify-between rounded-xl border p-4 ' + (isOverdue(d.dueDate) ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-white/80')}>
                    <div className="flex items-center gap-3">
                      <div className={'flex h-10 w-10 items-center justify-center rounded-xl ' + (isOverdue(d.dueDate) ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600')}>
                        {isOverdue(d.dueDate) ? <XCircle className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{d.filingType} - {d.period}</p>
                        <p className="text-sm text-slate-500">{d.companyId?.name || 'Company'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">Rs.{(d.amount || 0).toLocaleString()}</p>
                      <p className={'text-xs ' + (isOverdue(d.dueDate) ? 'text-rose-600' : 'text-slate-500')}>Due: {new Date(d.dueDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                )) : <EmptyPanel title="No upcoming deadlines" description="All filings on track." />}
              </div>
            </Surface>
          </div>
        </TabsContent>

        <TabsContent value="filings">
          <div className="space-y-5">
            <Surface title="Filters" eyebrow="Search">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 rounded-xl" /></div>
                <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="rounded-xl"><option value="">All Status</option><option value="Pending">Pending</option><option value="Filed">Filed</option><option value="Overdue">Overdue</option></Select>
                <Select value={fy} onChange={e => setFy(e.target.value)} className="rounded-xl"><option value="2023-24">2023-24</option><option value="2024-25">2024-25</option><option value="2025-26">2025-26</option></Select>
                <Button size="sm" onClick={() => setShowFiling(true)} className="rounded-xl gap-1"><Plus className="h-4 w-4" />Add Filing</Button>
              </div>
            </Surface>
            <Surface title={'Filings (' + (filingQ.data?.data?.total || filings.length) + ')'} eyebrow="Returns">
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white/80">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <th className="px-5 py-3">Type</th>{isSuperAdmin && <th className="px-5 py-3">Company</th>}<th className="px-5 py-3">Period</th><th className="px-5 py-3">Due</th><th className="px-5 py-3">Amount</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Challan</th><th className="px-5 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filingQ.isLoading ? <tr><td colSpan={isSuperAdmin ? 8 : 7} className="px-5 py-8 text-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent mx-auto" /></td></tr> :
                     filings.length === 0 ? <tr><td colSpan={isSuperAdmin ? 8 : 7} className="px-5 py-8 text-center"><EmptyPanel title="No filings" description="Add tax filings." /></td></tr> :
                     filings.map(f => (
                       <tr key={f._id} className="border-b border-slate-100 hover:bg-slate-50/60">
                         <td className="px-5 py-3"><span className="text-slate-700">{f.filingType}</span></td>
                         {isSuperAdmin && <td className="px-5 py-3 text-slate-600">{f.companyId?.name || '-'}</td>}
                         <td className="px-5 py-3 text-slate-600">{f.period}</td>
                         <td className="px-5 py-3 text-slate-600">{new Date(f.dueDate).toLocaleDateString()}</td>
                         <td className="px-5 py-3 font-medium text-slate-900">Rs.{(f.amount || 0).toLocaleString()}</td>
                         <td className="px-5 py-3"><Badge variant="outline" className={STATUS_COLORS[f.status] || ''}>{f.status}</Badge></td>
                         <td className="px-5 py-3 text-slate-500 text-xs">{f.challanNumber || '-'}</td>
                         <td className="px-5 py-3">{f.status !== 'Filed' && <Button size="sm" variant="outline" onClick={() => statusM.mutate({ id: f._id, payload: { status: 'Filed', filedDate: new Date().toISOString() } })} className="rounded-lg text-xs">Mark Filed</Button>}</td>
                       </tr>
                     ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 flex justify-between text-xs text-slate-500">
                <span>Showing {filings.length} of {filingQ.data?.data?.total || 0}</span>
                <Button variant="outline" size="sm" onClick={() => exportCSV(filings.map(f => ({ Type: f.filingType, Period: f.period, Company: f.companyId?.name, Amount: f.amount, Status: f.status, DueDate: new Date(f.dueDate).toLocaleDateString() })), 'filings-' + fy)} className="rounded-lg text-xs gap-1"><Download className="h-3 w-3" />Export</Button>
              </div>
            </Surface>
          </div>
        </TabsContent>

        <TabsContent value="tds">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200">FY {fy}</Badge>
                <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">Month: {month}</Badge>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => exportCSV(tdsRecords.map(r => ({ Employee: r.employeeId?.name, ID: r.employeeId?.employeeId, Salary: r.salary, TDS: r.tdsAmount, TaxableIncome: r.taxableIncome, Month: r.month })), 'tds-' + fy)} className="rounded-xl gap-1"><Download className="h-4 w-4" />Export</Button>
                <Button size="sm" onClick={autoTds} isLoading={tdsAutoM.isPending} className="rounded-xl gap-1"><Calculator className="h-4 w-4" />Auto TDS</Button>
              </div>
            </div>
            <Surface title={'TDS (' + (tdsQ.data?.data?.total || tdsRecords.length) + ')'} eyebrow="Deducted at source">
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white/80">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <th className="px-5 py-3">Employee</th><th className="px-5 py-3">ID</th><th className="px-5 py-3">Dept</th><th className="px-5 py-3">Month</th><th className="px-5 py-3">Salary</th><th className="px-5 py-3">Taxable</th><th className="px-5 py-3">TDS</th><th className="px-5 py-3">Regime</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tdsQ.isLoading ? <tr><td colSpan={8} className="px-5 py-8 text-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent mx-auto" /></td></tr> :
                     tdsRecords.length === 0 ? <tr><td colSpan={8} className="px-5 py-8 text-center"><EmptyPanel title="No TDS" description="Auto-calculate from salaries." /></td></tr> :
                     tdsRecords.map(r => (
                       <tr key={r._id} className="border-b border-slate-100 hover:bg-slate-50/60">
                         <td className="px-5 py-3"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 text-xs font-bold text-white">{r.employeeId?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'E'}</div><div><p className="font-semibold text-slate-900">{r.employeeId?.name}</p><p className="text-xs text-slate-500">{r.employeeId?.email}</p></div></div></td>
                         <td className="px-5 py-3 text-slate-600 font-mono text-xs">{r.employeeId?.employeeId}</td>
                         <td className="px-5 py-3 text-slate-600">{r.employeeId?.department}</td>
                         <td className="px-5 py-3 text-slate-600">{r.month}</td>
                         <td className="px-5 py-3 text-slate-700">Rs.{(r.salary || 0).toLocaleString()}</td>
                         <td className="px-5 py-3 text-slate-700">Rs.{(r.taxableIncome || 0).toLocaleString()}</td>
                         <td className="px-5 py-3 font-semibold text-slate-900">Rs.{(r.tdsAmount || 0).toLocaleString()}</td>
                         <td className="px-5 py-3"><Badge variant="outline" className="text-xs">{r.regime || 'new'}</Badge></td>
                       </tr>
                     ))}
                  </tbody>
                </table>
              </div>
            </Surface>
          </div>
        </TabsContent>

        <TabsContent value="deductions">
          <div className="space-y-5">
            <div className="flex justify-end"><Button size="sm" onClick={() => setShowDeduction(true)} className="rounded-xl gap-1"><Plus className="h-4 w-4" />Add Deduction</Button></div>
            <Surface title={'Deductions (' + (dedQ.data?.data?.total || deductions.length) + ')'} eyebrow="Exemptions">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {dedQ.isLoading ? <div className="col-span-full flex justify-center py-8"><div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" /></div> :
                 deductions.length === 0 ? <div className="col-span-full"><EmptyPanel title="No deductions" description="Add 80C, 80D, HRA, etc." /></div> :
                 deductions.map(d => (
                   <div key={d._id} className="rounded-xl border border-slate-200 bg-white/90 p-5 shadow-sm hover:shadow-md">
                     <div className="flex items-start justify-between">
                       <div><Badge variant="outline" className="mb-2">{d.section}</Badge><h3 className="text-lg font-semibold text-slate-950">Rs.{(d.amount || 0).toLocaleString()}</h3><p className="text-xs text-slate-500">{d.description || 'No description'}</p></div>
                       <Badge variant="outline" className={d.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : d.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'}>{d.status}</Badge>
                     </div>
                     <div className="mt-3 text-xs text-slate-500">
                       {d.employeeId ? <p>Emp: {d.employeeId.name} ({d.employeeId.employeeId})</p> : <p>Company-level</p>}
                       <p>FY: {d.financialYear}</p>
                     </div>
                   </div>
                 ))}
              </div>
            </Surface>
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <MetricCard title="Total Liability" value={'Rs.' + (rep.summary?.totalLiability || 0).toLocaleString()} subtitle="All filings" icon={FileText} tone="slate" />
              <MetricCard title="Paid" value={'Rs.' + (rep.summary?.paidAmount || 0).toLocaleString()} subtitle="Filed" icon={CheckCircle2} tone="emerald" />
              <MetricCard title="Pending" value={'Rs.' + (rep.summary?.pendingAmount || 0).toLocaleString()} subtitle="Awaiting" icon={Clock} tone="amber" />
            </div>
            <div className="grid gap-6 xl:grid-cols-2">
              <Surface title="TDS Trend" eyebrow="Monthly">
                {rep.tdsTrend?.length ? <div className="min-h-[280px] h-[40vh] lg:h-[300px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={rep.tdsTrend}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="month" stroke="#64748b" fontSize={12} /><YAxis stroke="#64748b" fontSize={12} /><Tooltip /><Line type="monotone" dataKey="totalTDS" stroke="#0f172a" strokeWidth={2} dot={{ r: 4 }} /></LineChart></ResponsiveContainer></div> : <EmptyPanel title="No TDS data" description="Calculate TDS to see trends." />}
              </Surface>
              <Surface title="Deductions by Section" eyebrow="Breakdown">
                {rep.deductionsBySection?.length ? <div className="min-h-[280px] h-[40vh] lg:h-[300px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={rep.deductionsBySection} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" nameKey="name" label={e => e.name + ': ' + e.value}>{rep.deductionsBySection.map((e, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div> : <EmptyPanel title="No deduction data" description="Add deductions to see breakdown." />}
              </Surface>
              <Surface title="Filings by Type" eyebrow="Distribution">
                {rep.filingsByType?.length ? <div className="min-h-[280px] h-[40vh] lg:h-[300px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={rep.filingsByType}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="name" stroke="#64748b" fontSize={12} /><YAxis stroke="#64748b" fontSize={12} /><Tooltip /><Bar dataKey="count" radius={[8, 8, 0, 0]}>{rep.filingsByType.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}</Bar></BarChart></ResponsiveContainer></div> : <EmptyPanel title="No filing data" description="Add filings to see distribution." />}
              </Surface>
              <Surface title="Status Breakdown" eyebrow="Overview">
                {rep.statusBreakdown?.length ? <div className="min-h-[280px] h-[40vh] lg:h-[300px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={rep.statusBreakdown} cx="50%" cy="50%" outerRadius={100} paddingAngle={4} dataKey="value" nameKey="name" label={e => e.name + ': ' + e.value}>{rep.statusBreakdown.map((e, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div> : <EmptyPanel title="No status data" description="Add filings to see breakdown." />}
              </Surface>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="compliance">
          <div className="space-y-5">
            <Surface title="Tax Documents" eyebrow="Uploads & Records">
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="relative">
                    <Upload className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input type="file" onChange={e => { const file = e.target.files?.[0]; if (!file) return; docM.mutate({ companyId, financialYear: fy, documentType: 'TaxReturn', title: file.name, description: file.name }) }} className="pl-9 rounded-xl" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {docQ.isLoading ? <div className="col-span-full flex justify-center py-8"><div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" /></div> :
                   documents.length === 0 ? <div className="col-span-full"><EmptyPanel title="No documents" description="Upload tax-related documents." /></div> :
                   documents.map(d => (
                     <div key={d._id} className="rounded-xl border border-slate-200 bg-white/90 p-5 shadow-sm hover:shadow-md">
                       <div className="flex items-start justify-between">
                         <div className="flex items-center gap-3">
                           <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100"><FileText className="h-5 w-5 text-slate-600" /></div>
                           <div>
                             <p className="font-semibold text-slate-900 text-sm">{d.title || 'Untitled'}</p>
                             <p className="text-xs text-slate-500">{d.documentType}</p>
                           </div>
                         </div>
                         <Badge variant="outline">{d.financialYear}</Badge>
                       </div>
                       <div className="mt-3 text-xs text-slate-500">
                         <p>{d.companyId?.name || 'Company'}</p>
                         <p>Uploaded: {new Date(d.createdAt).toLocaleDateString()}</p>
                       </div>
                     </div>
                   ))}
                </div>
              </div>
            </Surface>
            <Surface title="Compliance Checklist" eyebrow="Settings">
              <div className="space-y-3">
                <div className="rounded-xl border border-slate-200 bg-white/90 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <span className="text-sm text-slate-700">GST Registration Verified</span>
                  </div>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white/90 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <span className="text-sm text-slate-700">PAN Linked to Bank</span>
                  </div>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white/90 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-amber-600" />
                    <span className="text-sm text-slate-700">TAN Registration</span>
                  </div>
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>
                </div>
              </div>
            </Surface>
          </div>
        </TabsContent>
      </Tabs>

      <AddFilingModal open={showFiling} onClose={() => setShowFiling(false)} companyId={companyId} isSuperAdmin={isSuperAdmin} companyList={companyList} onSubmit={filingM.mutate} />
      <AddDeductionModal open={showDeduction} onClose={() => setShowDeduction(false)} companyId={companyId} employees={employees} onSubmit={dedM.mutate} />
    </div>
  )
}
