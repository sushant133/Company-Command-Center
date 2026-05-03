import { useState } from 'react'
import {
  DollarSign,
  FileText,
  Landmark,
  PieChart,
  Receipt,
  TrendingUp,
} from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/Tabs'
import TaxManagement from './TaxManagement'

export default function FinanceModule({ isSuperAdmin }) {
  const [activeTab, setActiveTab] = useState('tax')

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="tax">
            <Receipt className="mr-1.5 h-4 w-4" />
            Tax Management
          </TabsTrigger>
          <TabsTrigger value="budget">
            <DollarSign className="mr-1.5 h-4 w-4" />
            {isSuperAdmin ? 'Consolidated Budget' : 'Company Budget'}
          </TabsTrigger>
          <TabsTrigger value="income">
            <TrendingUp className="mr-1.5 h-4 w-4" />
            {isSuperAdmin ? 'Portfolio Income' : 'Income Tracker'}
          </TabsTrigger>
          <TabsTrigger value="expenses">
            <FileText className="mr-1.5 h-4 w-4" />
            {isSuperAdmin ? 'Expense Approvals' : 'My Expenses'}
          </TabsTrigger>
          <TabsTrigger value="assets">
            <Landmark className="mr-1.5 h-4 w-4" />
            {isSuperAdmin ? 'Asset Overview' : 'Company Assets'}
          </TabsTrigger>
          <TabsTrigger value="projections">
            <PieChart className="mr-1.5 h-4 w-4" />
            {isSuperAdmin ? 'Projections' : 'Forecasts'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tax">
          <TaxManagement isSuperAdmin={isSuperAdmin} />
        </TabsContent>

        <TabsContent value="budget">
          <div className="rounded-[1.35rem] border border-slate-200 bg-white/80 p-8 text-center">
            <DollarSign className="mx-auto h-10 w-10 text-slate-400" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              {isSuperAdmin ? 'Consolidated Budget' : 'Company Budget'}
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              {isSuperAdmin
                ? 'Cross-company budget allocation and tracking across all portfolio companies.'
                : 'Department-level budget tracking and alerts for your company.'}
            </p>
          </div>
        </TabsContent>

        <TabsContent value="income">
          <div className="rounded-[1.35rem] border border-slate-200 bg-white/80 p-8 text-center">
            <TrendingUp className="mx-auto h-10 w-10 text-slate-400" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              {isSuperAdmin ? 'Portfolio Income' : 'Income Tracker'}
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              {isSuperAdmin
                ? 'Revenue tracking across all portfolio companies with YoY comparison.'
                : 'Revenue streams and income tracking for your company.'}
            </p>
          </div>
        </TabsContent>

        <TabsContent value="expenses">
          <div className="rounded-[1.35rem] border border-slate-200 bg-white/80 p-8 text-center">
            <FileText className="mx-auto h-10 w-10 text-slate-400" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              {isSuperAdmin ? 'Expense Approvals' : 'My Expenses'}
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              {isSuperAdmin
                ? 'Review and approve expense requests from all companies in the portfolio.'
                : 'Submit expense requests and track your spending against budget.'}
            </p>
          </div>
        </TabsContent>

        <TabsContent value="assets">
          <div className="rounded-[1.35rem] border border-slate-200 bg-white/80 p-8 text-center">
            <Landmark className="mx-auto h-10 w-10 text-slate-400" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              {isSuperAdmin ? 'Asset Overview' : 'Company Assets'}
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              {isSuperAdmin
                ? 'Portfolio-wide fixed assets overview with depreciation tracking.'
                : 'Manage fixed assets and depreciation for your company.'}
            </p>
          </div>
        </TabsContent>

        <TabsContent value="projections">
          <div className="rounded-[1.35rem] border border-slate-200 bg-white/80 p-8 text-center">
            <PieChart className="mx-auto h-10 w-10 text-slate-400" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              {isSuperAdmin ? 'Financial Projections' : 'Forecasts'}
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              {isSuperAdmin
                ? 'Portfolio-level forecasting and financial projections with risk assessment.'
                : 'Company revenue forecasts and quarterly projections.'}
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
