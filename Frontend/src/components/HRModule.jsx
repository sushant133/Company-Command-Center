import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Briefcase, Building2, Calendar, FileSpreadsheet, Mail, MapPin, Phone, Plus, Search, UserCheck, Users, X } from 'lucide-react'
import { hrAPI, companiesAPI } from '../api/platform'
import { useAuth } from '../hooks/useAuth'
import { Surface, MetricCard, EmptyPanel } from './app/AppShell'
import Button from './ui/Button'
import Input from './ui/Input'
import Select from './ui/Select'
import Badge from './ui/Badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/Tabs'

const STATUS_COLORS = { active: 'bg-emerald-50 text-emerald-700 border-emerald-200', inactive: 'bg-slate-50 text-slate-600 border-slate-200', onleave: 'bg-amber-50 text-amber-700 border-amber-200' }
const GENDER_COLORS = { male: '#3b82f6', female: '#ec4899', other: '#8b5cf6', prefer_not_to_say: '#94a3b8' }
const CHART_COLORS = ['#0f172a', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']

function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[1.5rem] border border-white/70 bg-white/95 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-slate-100"><X className="h-5 w-5 text-slate-500" /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default function HRModule({ isSuperAdmin }) {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('employees')
  const [search, setSearch] = useState('')
  const [companyFilter, setCompanyFilter] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [joinDateFrom, setJoinDateFrom] = useState('')
  const [joinDateTo, setJoinDateTo] = useState('')
  const [showEmp, setShowEmp] = useState(false)
  const [showJob, setShowJob] = useState(false)
  const [showDept, setShowDept] = useState(false)
  const [err, setErr] = useState('')
  const [toast, setToast] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(timer)
  }, [toast])

  const companyIdParam = isSuperAdmin ? companyFilter || undefined : user?.companyId

  const empParams = useMemo(() => {
    const p = {}
    if (companyIdParam) p.companyId = companyIdParam
    if (search) p.search = search
    if (departmentFilter) p.department = departmentFilter
    if (roleFilter) p.role = roleFilter
    if (statusFilter) p.status = statusFilter
    if (joinDateFrom) p.joinDateFrom = joinDateFrom
    if (joinDateTo) p.joinDateTo = joinDateTo
    return p
  }, [companyIdParam, search, departmentFilter, roleFilter, statusFilter, joinDateFrom, joinDateTo])

  const repParams = useMemo(() => ({ ...(companyIdParam && { companyId: companyIdParam }) }), [companyIdParam])

  const empQ = useQuery({ queryKey: ['hr-employees', empParams], queryFn: () => hrAPI.getEmployees(empParams), enabled: activeTab === 'employees' })
  const deptQ = useQuery({ queryKey: ['hr-departments', companyIdParam], queryFn: () => hrAPI.getDepartments({ companyId: companyIdParam }), enabled: activeTab === 'departments' || activeTab === 'employees' })
  const jobQ = useQuery({ queryKey: ['hr-jobs', companyIdParam], queryFn: () => hrAPI.getJobs({ companyId: companyIdParam }), enabled: activeTab === 'recruitment' })
  const repQ = useQuery({ queryKey: ['hr-reports', repParams], queryFn: () => hrAPI.getReports(repParams), enabled: activeTab === 'reports' })
  const compQ = useQuery({ queryKey: ['companies'], queryFn: companiesAPI.list, enabled: isSuperAdmin })

  const employees = (empQ.data?.employees || [])
  const departments = Array.isArray(deptQ.data) ? deptQ.data : (deptQ.data?.data || [])
  const jobs = Array.isArray(jobQ.data) ? jobQ.data : (jobQ.data?.data || [])
  const reports = repQ.data?.data || repQ.data || {}
  const allCompanies = compQ.data || []

  const companyList = isSuperAdmin && allCompanies.length > 0 ? allCompanies : [...new Map(employees.filter(e => e.companyId?._id).map(e => [e.companyId._id, { _id: e.companyId._id, name: e.companyId.name }])).values()]

  const uniqDepts = useMemo(() => [...new Set(employees.map(e => e.department))].filter(Boolean).sort(), [employees])
  const uniqRoles = useMemo(() => [...new Set(employees.map(e => e.role))].filter(Boolean).sort(), [employees])
  const summary = reports.summary || {}

  // Mutations
  const empM = useMutation({ mutationFn: hrAPI.createEmployee, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['hr-employees'] }); queryClient.invalidateQueries({ queryKey: ['hr-reports'] }); queryClient.invalidateQueries({ queryKey: ['hr-departments'] }); closeEmp() }, onError: (e) => setErr(e.message || 'Failed') })
  const jobM = useMutation({ mutationFn: hrAPI.createJob, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['hr-jobs'] }); queryClient.invalidateQueries({ queryKey: ['hr-reports'] }); closeJob() }, onError: (e) => setErr(e.message || 'Failed') })
  const deptM = useMutation({ mutationFn: hrAPI.createDepartment, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['hr-departments'] }); queryClient.invalidateQueries({ queryKey: ['hr-reports'] }); closeDept() }, onError: (e) => setErr(e.message || 'Failed') })
  const importM = useMutation({
    mutationFn: hrAPI.importEmployees,
    onSuccess: (res) => {
      setToast({ type: 'success', message: res.message || `Imported ${res.data?.imported || 0} employees successfully` })
      queryClient.invalidateQueries({ queryKey: ['hr-employees'] })
      queryClient.invalidateQueries({ queryKey: ['hr-reports'] })
      queryClient.invalidateQueries({ queryKey: ['hr-departments'] })
    },
    onError: (e) => setToast({ type: 'error', message: e.message || 'Import failed. Please check the file format.' }),
  })

  // Forms
  const [ef, setEf] = useState({ employeeId: '', name: '', email: '', phone: '', companyId: '', department: '', role: '', status: 'active', gender: 'prefer_not_to_say', joinDate: '', salary: '', address: '' })
  const [jf, setJf] = useState({ title: '', companyId: '', department: '', location: 'Remote', type: 'full-time', status: 'open', description: '', requirements: '', salaryMin: '', salaryMax: '', currency: 'USD', closingDate: '' })
  const [df, setDf] = useState({ name: '', companyId: '', code: '', description: '', budget: '', location: '' })

  const closeEmp = () => { setShowEmp(false); setErr(''); setEf({ employeeId: '', name: '', email: '', phone: '', companyId: isSuperAdmin ? '' : user?.companyId || '', department: '', role: '', status: 'active', gender: 'prefer_not_to_say', joinDate: '', salary: '', address: '' }) }
  const closeJob = () => { setShowJob(false); setErr(''); setJf({ title: '', companyId: isSuperAdmin ? '' : user?.companyId || '', department: '', location: 'Remote', type: 'full-time', status: 'open', description: '', requirements: '', salaryMin: '', salaryMax: '', currency: 'USD', closingDate: '' }) }
  const closeDept = () => { setShowDept(false); setErr(''); setDf({ name: '', companyId: isSuperAdmin ? '' : user?.companyId || '', code: '', description: '', budget: '', location: '' }) }

  const subEmp = () => {
    if (!ef.employeeId || !ef.name || !ef.email || !ef.companyId || !ef.department || !ef.role || !ef.joinDate) { setErr('Fill required fields'); return }
    empM.mutate({ ...ef, salary: ef.salary ? Number(ef.salary) : 0 })
  }
  const subJob = () => {
    if (!jf.title || !jf.companyId || !jf.department) { setErr('Fill required fields'); return }
    jobM.mutate({ ...jf, requirements: jf.requirements.split(',').map(r => r.trim()).filter(Boolean), salaryMin: jf.salaryMin ? Number(jf.salaryMin) : undefined, salaryMax: jf.salaryMax ? Number(jf.salaryMax) : undefined })
  }
  const subDept = () => {
    if (!df.name || !df.companyId) { setErr('Fill required fields'); return }
    deptM.mutate({ ...df, budget: df.budget ? Number(df.budget) : 0 })
  }

  const compSelect = (val, onChange, label = 'Company') => (
    <Select value={val} onChange={onChange} className="rounded-2xl">
      <option value="">{isSuperAdmin ? `Select ${label}` : label}</option>
      {companyList.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
    </Select>
  )

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`rounded-[1.25rem] border px-4 py-3 text-sm ${toast.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
          {toast.message}
        </div>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Human Resources</h2>
          <p className="mt-1 text-sm text-slate-500">{isSuperAdmin ? 'Manage people data across all companies' : `Manage people data for ${user?.company?.name || 'your company'}`}</p>
        </div>
        {isSuperAdmin && <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200 self-start"><Building2 className="mr-1 h-3.5 w-3.5" />Global Access</Badge>}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="employees"><Users className="mr-1.5 h-4 w-4" />All Employees</TabsTrigger>
          <TabsTrigger value="recruitment"><Briefcase className="mr-1.5 h-4 w-4" />Recruitment</TabsTrigger>
          <TabsTrigger value="departments"><MapPin className="mr-1.5 h-4 w-4" />Departments</TabsTrigger>
          <TabsTrigger value="reports"><UserCheck className="mr-1.5 h-4 w-4" />Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="employees">
          <div className="space-y-5">
            <Surface title="Filters" eyebrow="Search & Filter">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input placeholder="Search employees..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 rounded-2xl" />
                </div>
                {isSuperAdmin && compSelect(companyFilter, e => setCompanyFilter(e.target.value))}
                <Select value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)} className="rounded-2xl">
                  <option value="">All Departments</option>
                  {uniqDepts.map(d => <option key={d} value={d}>{d}</option>)}
                </Select>
                <Select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="rounded-2xl">
                  <option value="">All Roles</option>
                  {uniqRoles.map(r => <option key={r} value={r}>{r}</option>)}
                </Select>
                <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="rounded-2xl">
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="onleave">On Leave</option>
                </Select>
                <Input type="date" label="From" value={joinDateFrom} onChange={e => setJoinDateFrom(e.target.value)} className="rounded-2xl" />
                <Input type="date" label="To" value={joinDateTo} onChange={e => setJoinDateTo(e.target.value)} className="rounded-2xl" />
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <Button variant="outline" size="sm" onClick={() => { setSearch(''); setCompanyFilter(''); setDepartmentFilter(''); setRoleFilter(''); setStatusFilter(''); setJoinDateFrom(''); setJoinDateTo('') }} className="rounded-xl">Reset filters</Button>
                <div className="flex flex-wrap gap-2">
                  {!isSuperAdmin && (
                    <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) importM.mutate(file)
                          e.target.value = ''
                        }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        isLoading={importM.isPending}
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-xl gap-1"
                      >
                        <FileSpreadsheet className="h-4 w-4" />Import from Excel
                      </Button>
                    </>
                  )}
                  <Button size="sm" onClick={() => { setErr(''); closeEmp(); setShowEmp(true) }} className="rounded-xl gap-1"><Plus className="h-4 w-4" />Add Employee</Button>
                </div>
              </div>
            </Surface>

            <Surface title={`Employees (${empQ.data?.total || employees.length})`} eyebrow="Directory">
              <div className="overflow-x-auto rounded-[1.25rem] border border-slate-200 bg-white/80">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <th className="px-5 py-3">Employee</th><th className="px-5 py-3">ID</th>
                      {isSuperAdmin && <th className="px-5 py-3">Company</th>}
                      <th className="px-5 py-3">Dept</th><th className="px-5 py-3">Role</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Gender</th><th className="px-5 py-3">Join Date</th><th className="px-5 py-3">Contact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {empQ.isLoading ? (
                      <tr><td colSpan={isSuperAdmin ? 9 : 8} className="px-5 py-8 text-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent mx-auto" /></td></tr>
                    ) : employees.length === 0 ? (
                      <tr><td colSpan={isSuperAdmin ? 9 : 8} className="px-5 py-8 text-center"><EmptyPanel title="No employees found" description="Add employees to get started." /></td></tr>
                    ) : employees.map(emp => (
                      <tr key={emp._id} className="border-b border-slate-100 hover:bg-slate-50/60">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 text-xs font-bold text-white">{emp.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'E'}</div>
                            <div><p className="font-semibold text-slate-900">{emp.name}</p><p className="text-xs text-slate-500">{emp.email}</p></div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-slate-600 font-mono text-xs">{emp.employeeId}</td>
                        {isSuperAdmin && <td className="px-5 py-3 text-slate-600">{emp.companyId?.name || '-'}</td>}
                        <td className="px-5 py-3 text-slate-600">{emp.department}</td>
                        <td className="px-5 py-3 text-slate-600">{emp.role}</td>
                        <td className="px-5 py-3"><Badge variant="outline" className={STATUS_COLORS[emp.status] || ''}>{emp.status}</Badge></td>
                        <td className="px-5 py-3 capitalize text-slate-600">{emp.gender?.replace(/_/g, ' ')}</td>
                        <td className="px-5 py-3 text-slate-600">{emp.joinDate ? new Date(emp.joinDate).toLocaleDateString() : '-'}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2 text-slate-500">
                            {emp.phone && <a href={`tel:${emp.phone}`} className="hover:text-slate-900"><Phone className="h-3.5 w-3.5" /></a>}
                            <a href={`mailto:${emp.email}`} className="hover:text-slate-900"><Mail className="h-3.5 w-3.5" /></a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {(empQ.data?.total || 0) > 0 && <div className="mt-3 flex justify-between text-xs text-slate-500"><span>Showing {employees.length} of {empQ.data.total}</span><span>Page {empQ.data?.page || 1} of {empQ.data?.pages || 1}</span></div>}
            </Surface>
          </div>
        </TabsContent>

        <TabsContent value="recruitment">
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard title="Open Positions" value={jobs.filter(j => j.status === 'open').length} subtitle="Currently hiring" icon={Briefcase} tone="sky" />
              <MetricCard title="Total Applications" value={jobs.reduce((s, j) => s + (j.applicants || 0), 0)} subtitle="Received so far" icon={Users} tone="emerald" />
              <MetricCard title="Paused" value={jobs.filter(j => j.status === 'paused').length} subtitle="On hold" icon={Calendar} tone="amber" />
              <MetricCard title="Closed" value={jobs.filter(j => j.status === 'closed').length} subtitle="Filled" icon={UserCheck} tone="slate" />
            </div>
            <Surface title="Job Postings" eyebrow="Open roles" action={<Button size="sm" onClick={() => { setErr(''); closeJob(); setShowJob(true) }} className="rounded-xl gap-1"><Plus className="h-4 w-4" />Add Job</Button>}>
              <div className="space-y-4">
                {jobQ.isLoading ? <div className="flex justify-center py-8"><div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" /></div> :
                  jobs.length === 0 ? <EmptyPanel title="No job postings" description="Create job postings to start tracking recruitment." /> :
                  jobs.map(job => (
                    <div key={job._id} className="rounded-[1.35rem] border border-slate-200 bg-white/90 p-5 shadow-sm hover:shadow-md">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-slate-950">{job.title}</h3>
                            <Badge variant="outline" className={job.status === 'open' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : job.status === 'paused' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-600 border-slate-200'}>{job.status}</Badge>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-500">
                            <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{job.companyId?.name || 'Company'}</span>
                            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location}</span>
                            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{job.type}</span>
                          </div>
                          <p className="mt-3 text-sm text-slate-600 line-clamp-2">{job.description}</p>
                          {job.requirements?.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{job.requirements.map((r, i) => <Badge key={i} variant="outline" className="text-xs">{r}</Badge>)}</div>}
                        </div>
                        <div className="flex flex-col items-end gap-2 min-w-[140px]">
                          <div className="text-right"><p className="text-2xl font-bold text-slate-900">{job.applicants || 0}</p><p className="text-xs text-slate-500">Applicants</p></div>
                          {job.salaryMin > 0 && <p className="text-sm text-slate-600">{job.currency} {job.salaryMin.toLocaleString()} - {job.salaryMax.toLocaleString()}</p>}
                          <p className="text-xs text-slate-400">Posted {job.postedDate ? new Date(job.postedDate).toLocaleDateString() : '-'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </Surface>
          </div>
        </TabsContent>

        <TabsContent value="departments">
          <div className="space-y-5">
            <Surface title="Departments" eyebrow="Organizational structure" action={<Button size="sm" onClick={() => { setErr(''); closeDept(); setShowDept(true) }} className="rounded-xl gap-1"><Plus className="h-4 w-4" />Add Department</Button>}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {deptQ.isLoading ? <div className="col-span-full flex justify-center py-8"><div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" /></div> :
                  departments.length === 0 ? <div className="col-span-full"><EmptyPanel title="No departments" description="Create departments to organize your workforce." /></div> :
                  departments.map(dept => (
                    <div key={dept._id} className="rounded-[1.35rem] border border-slate-200 bg-white/90 p-5 shadow-sm hover:shadow-md">
                      <div className="flex items-start justify-between">
                        <div><h3 className="text-lg font-semibold text-slate-950">{dept.name}</h3><p className="text-xs text-slate-500">{dept.code || 'No code'}</p></div>
                        <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200">{dept.employeeCount || 0} members</Badge>
                      </div>
                      <p className="mt-3 text-sm text-slate-600 line-clamp-2">{dept.description || 'No description'}</p>
                      <div className="mt-4 space-y-2 text-sm">
                        {dept.headId && <div className="flex items-center gap-2 text-slate-600"><Users className="h-4 w-4 text-slate-400" /> Head: {dept.headId.name || 'Unknown'}</div>}
                        {dept.location && <div className="flex items-center gap-2 text-slate-600"><MapPin className="h-4 w-4 text-slate-400" /> {dept.location}</div>}
                        {dept.budget > 0 && <div className="flex items-center gap-2 text-slate-600"><Briefcase className="h-4 w-4 text-slate-400" /> Budget: ${dept.budget.toLocaleString()}</div>}
                      </div>
                      {isSuperAdmin && dept.companyId && <div className="mt-3 pt-3 border-t border-slate-100"><p className="text-xs text-slate-500">{dept.companyId.name || 'Company'}</p></div>}
                    </div>
                  ))}
              </div>
            </Surface>
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              <MetricCard title="Total Employees" value={summary.totalEmployees || 0} subtitle="All time" icon={Users} tone="slate" />
              <MetricCard title="Active" value={summary.activeEmployees || 0} subtitle="Working" icon={UserCheck} tone="emerald" />
              <MetricCard title="New Hires" value={summary.newHiresThisMonth || 0} subtitle="This month" icon={Calendar} tone="sky" />
              <MetricCard title="Avg Tenure" value={`${summary.avgTenureDays || 0}d`} subtitle="Days" icon={Briefcase} tone="amber" />
              <MetricCard title="Open Jobs" value={summary.openJobs || 0} subtitle="Postings" icon={Briefcase} tone="sky" />
            </div>
            {repQ.isLoading ? <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" /></div> : (
              <div className="grid gap-6 lg:grid-cols-2">
                <Surface title="Headcount Trend" eyebrow="Monthly hires">
                  {reports.headcountByMonth?.length > 0 ? (
                    <div className="min-h-[280px] h-[40vh] lg:h-[300px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={reports.headcountByMonth}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="month" stroke="#64748b" fontSize={12} /><YAxis stroke="#64748b" fontSize={12} /><Tooltip /><Line type="monotone" dataKey="hires" stroke="#0f172a" strokeWidth={2} dot={{ r: 4, fill: '#0f172a' }} activeDot={{ r: 6 }} /></LineChart></ResponsiveContainer></div>
                  ) : <EmptyPanel title="No trend data" description="Hire employees to see trends." />}
                </Surface>
                <Surface title="Gender Ratio" eyebrow="Diversity">
                  {reports.genderDistribution?.length > 0 ? (
                    <div className="min-h-[280px] h-[40vh] lg:h-[300px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={reports.genderDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" nameKey="name" label={e => `${e.name}: ${e.value}`}>{reports.genderDistribution.map((e, i) => <Cell key={i} fill={GENDER_COLORS[e.name] || CHART_COLORS[i % CHART_COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div>
                  ) : <EmptyPanel title="No gender data" description="Gender data appears here." />}
                </Surface>
                <Surface title="Department Distribution" eyebrow="By dept">
                  {reports.departmentDistribution?.length > 0 ? (
                    <div className="min-h-[280px] h-[40vh] lg:h-[300px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={reports.departmentDistribution} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis type="number" stroke="#64748b" fontSize={12} /><YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} width={100} /><Tooltip /><Bar dataKey="value" radius={[0, 8, 8, 0]}>{reports.departmentDistribution.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}</Bar></BarChart></ResponsiveContainer></div>
                  ) : <EmptyPanel title="No dept data" description="Assign departments to see distribution." />}
                </Surface>
                <Surface title="Status Breakdown" eyebrow="Overview">
                  {reports.statusBreakdown?.length > 0 ? (
                    <div className="min-h-[280px] h-[40vh] lg:h-[300px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={reports.statusBreakdown} cx="50%" cy="50%" outerRadius={100} paddingAngle={4} dataKey="value" nameKey="name" label={e => `${e.name}: ${e.value}`}>{reports.statusBreakdown.map((e, i) => <Cell key={i} fill={e.name === 'active' ? '#10b981' : e.name === 'inactive' ? '#94a3b8' : e.name === 'onleave' ? '#f59e0b' : CHART_COLORS[i % CHART_COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div>
                  ) : <EmptyPanel title="No status data" description="Status data appears here." />}
                </Surface>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Employee Modal */}
      <Modal open={showEmp} onClose={closeEmp} title="Add Employee">
        <div className="space-y-3">
          {err && <p className="text-sm text-red-500">{err}</p>}
          <Input label="Employee ID *" value={ef.employeeId} onChange={e => setEf({ ...ef, employeeId: e.target.value })} className="rounded-2xl" />
          <Input label="Full Name *" value={ef.name} onChange={e => setEf({ ...ef, name: e.target.value })} className="rounded-2xl" />
          <Input label="Email *" type="email" value={ef.email} onChange={e => setEf({ ...ef, email: e.target.value })} className="rounded-2xl" />
          <Input label="Phone" value={ef.phone} onChange={e => setEf({ ...ef, phone: e.target.value })} className="rounded-2xl" />
          {isSuperAdmin && compSelect(ef.companyId, e => setEf({ ...ef, companyId: e.target.value }))}
          <Input label="Department *" value={ef.department} onChange={e => setEf({ ...ef, department: e.target.value })} className="rounded-2xl" />
          <Input label="Role *" value={ef.role} onChange={e => setEf({ ...ef, role: e.target.value })} className="rounded-2xl" />
          <Select label="Status" value={ef.status} onChange={e => setEf({ ...ef, status: e.target.value })} className="rounded-2xl">
            <option value="active">Active</option><option value="inactive">Inactive</option><option value="onleave">On Leave</option>
          </Select>
          <Select label="Gender" value={ef.gender} onChange={e => setEf({ ...ef, gender: e.target.value })} className="rounded-2xl">
            <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option><option value="prefer_not_to_say">Prefer not to say</option>
          </Select>
          <Input label="Join Date *" type="date" value={ef.joinDate} onChange={e => setEf({ ...ef, joinDate: e.target.value })} className="rounded-2xl" />
          <Input label="Salary" type="number" value={ef.salary} onChange={e => setEf({ ...ef, salary: e.target.value })} className="rounded-2xl" />
          <Input label="Address" value={ef.address} onChange={e => setEf({ ...ef, address: e.target.value })} className="rounded-2xl" />
          <Button isLoading={empM.isPending} onClick={subEmp} className="w-full rounded-2xl">Create Employee</Button>
        </div>
      </Modal>

      {/* Add Job Modal */}
      <Modal open={showJob} onClose={closeJob} title="Add Job Posting">
        <div className="space-y-3">
          {err && <p className="text-sm text-red-500">{err}</p>}
          <Input label="Title *" value={jf.title} onChange={e => setJf({ ...jf, title: e.target.value })} className="rounded-2xl" />
          {isSuperAdmin && compSelect(jf.companyId, e => setJf({ ...jf, companyId: e.target.value }))}
          <Input label="Department *" value={jf.department} onChange={e => setJf({ ...jf, department: e.target.value })} className="rounded-2xl" />
          <Input label="Location" value={jf.location} onChange={e => setJf({ ...jf, location: e.target.value })} className="rounded-2xl" />
          <Select label="Type" value={jf.type} onChange={e => setJf({ ...jf, type: e.target.value })} className="rounded-2xl">
            <option value="full-time">Full-time</option><option value="part-time">Part-time</option><option value="contract">Contract</option><option value="internship">Internship</option>
          </Select>
          <Select label="Status" value={jf.status} onChange={e => setJf({ ...jf, status: e.target.value })} className="rounded-2xl">
            <option value="open">Open</option><option value="paused">Paused</option><option value="closed">Closed</option><option value="draft">Draft</option>
          </Select>
          <Input label="Description" value={jf.description} onChange={e => setJf({ ...jf, description: e.target.value })} className="rounded-2xl" />
          <Input label="Requirements (comma separated)" value={jf.requirements} onChange={e => setJf({ ...jf, requirements: e.target.value })} className="rounded-2xl" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Salary Min" type="number" value={jf.salaryMin} onChange={e => setJf({ ...jf, salaryMin: e.target.value })} className="rounded-2xl" />
            <Input label="Salary Max" type="number" value={jf.salaryMax} onChange={e => setJf({ ...jf, salaryMax: e.target.value })} className="rounded-2xl" />
          </div>
          <Select label="Currency" value={jf.currency} onChange={e => setJf({ ...jf, currency: e.target.value })} className="rounded-2xl">
            <option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option><option value="NPR">NPR</option>
          </Select>
          <Input label="Closing Date" type="date" value={jf.closingDate} onChange={e => setJf({ ...jf, closingDate: e.target.value })} className="rounded-2xl" />
          <Button isLoading={jobM.isPending} onClick={subJob} className="w-full rounded-2xl">Create Job</Button>
        </div>
      </Modal>

      {/* Add Department Modal */}
      <Modal open={showDept} onClose={closeDept} title="Add Department">
        <div className="space-y-3">
          {err && <p className="text-sm text-red-500">{err}</p>}
          <Input label="Name *" value={df.name} onChange={e => setDf({ ...df, name: e.target.value })} className="rounded-2xl" />
          {isSuperAdmin && compSelect(df.companyId, e => setDf({ ...df, companyId: e.target.value }))}
          <Input label="Code" value={df.code} onChange={e => setDf({ ...df, code: e.target.value })} className="rounded-2xl" />
          <Input label="Description" value={df.description} onChange={e => setDf({ ...df, description: e.target.value })} className="rounded-2xl" />
          <Input label="Budget" type="number" value={df.budget} onChange={e => setDf({ ...df, budget: e.target.value })} className="rounded-2xl" />
          <Input label="Location" value={df.location} onChange={e => setDf({ ...df, location: e.target.value })} className="rounded-2xl" />
          <Button isLoading={deptM.isPending} onClick={subDept} className="w-full rounded-2xl">Create Department</Button>
        </div>
      </Modal>
    </div>
  )
}
