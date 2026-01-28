'use client';
import React, { useState } from 'react';
import {
  FileText,
  Download,
  TrendingUp,
  PieChart,
  Wallet,
  Receipt,
  BarChart3,
  FileSpreadsheet,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Data
import {
  monthlyFinanceData,
  cashFlowData,
  accountsPayable,
  accountsReceivable,
  expensesByCategory,
  incomeBySource,
  financialKPIs,
} from '@/data/mockFinanceAnalytics';
import { initialTransactions } from '@/data/mockFinance';

// Components
import { FinanceOverviewCards } from '@/components/admin/finance/FinanceOverviewCards';
import { RevenueExpenseChart } from '@/components/admin/finance/RevenueExpenseChart';
import { ExpenseBreakdownChart } from '@/components/admin/finance/ExpenseBreakdownChart';
import { IncomeSourcesChart } from '@/components/admin/finance/IncomeSourcesChart';
import { CashFlowTable } from '@/components/admin/finance/CashFlowTable';
import { AccountsTable } from '@/components/admin/finance/AccountsTable';
import { ProfitLossStatement } from '@/components/admin/finance/ProfitLossStatement';
import { QuarterlyComparisonChart } from '@/components/admin/finance/QuarterlyComparisonChart';
import { generateFinancePDF } from '@/components/admin/finance/FinancePDFReport';

function formatKES(amount) {
  return `KES ${amount.toLocaleString()}`;
}

export default function FinanceAnalytics() {
  const [period, setPeriod] = useState('q1-2024');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async (reportType) => {
    setIsGenerating(true);
    // Small delay for UX
    await new Promise((resolve) => setTimeout(resolve, 500));

    generateFinancePDF({
      transactions: initialTransactions,
      monthlyData: monthlyFinanceData,
      expenses: expensesByCategory,
      income: incomeBySource,
      cashFlow: cashFlowData,
      payables: accountsPayable,
      receivables: accountsReceivable,
      reportType,
    });

    setIsGenerating(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Financial Analytics
          </h1>
          <p className="text-muted-foreground">
            Complete financial overview, reports, and analysis
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="q1-2024">Q1 2024</SelectItem>
              <SelectItem value="q4-2023">Q4 2023</SelectItem>
              <SelectItem value="q3-2023">Q3 2023</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={isGenerating}>
                {isGenerating ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Generate Report
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>PDF Reports</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleGenerateReport('summary')}>
                <FileText className="mr-2 h-4 w-4" />
                Summary Report
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleGenerateReport('detailed')}
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Detailed Report
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleGenerateReport('transactions')}
              >
                <Receipt className="mr-2 h-4 w-4" />
                Transaction Report
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleGenerateReport('cashflow')}
              >
                <Wallet className="mr-2 h-4 w-4" />
                Cash Flow Statement
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleGenerateReport('pnl')}>
                <BarChart3 className="mr-2 h-4 w-4" />
                Profit & Loss Statement
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* KPI Cards */}
      <FinanceOverviewCards kpis={financialKPIs} formatCurrency={formatKES} />

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-5">
          <TabsTrigger value="overview" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="cashflow" className="gap-2">
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">Cash Flow</span>
          </TabsTrigger>
          <TabsTrigger value="accounts" className="gap-2">
            <Receipt className="h-4 w-4" />
            <span className="hidden sm:inline">Accounts</span>
          </TabsTrigger>
          <TabsTrigger value="pnl" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">P&L</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <PieChart className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <RevenueExpenseChart data={monthlyFinanceData} />
            <ExpenseBreakdownChart
              data={expensesByCategory}
              formatCurrency={formatKES}
            />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <IncomeSourcesChart
              data={incomeBySource}
              formatCurrency={formatKES}
            />
            <QuarterlyComparisonChart formatCurrency={formatKES} />
          </div>
        </TabsContent>

        {/* Cash Flow Tab */}
        <TabsContent value="cashflow" className="space-y-6">
          <CashFlowTable data={cashFlowData} formatCurrency={formatKES} />
        </TabsContent>

        {/* Accounts Tab */}
        <TabsContent value="accounts" className="space-y-6">
          <AccountsTable
            payables={accountsPayable}
            receivables={accountsReceivable}
            formatCurrency={formatKES}
          />
        </TabsContent>

        {/* P&L Tab */}
        <TabsContent value="pnl" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <ProfitLossStatement formatCurrency={formatKES} />
            <div className="space-y-6">
              <QuarterlyComparisonChart formatCurrency={formatKES} />
              <IncomeSourcesChart
                data={incomeBySource}
                formatCurrency={formatKES}
              />
            </div>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <ExpenseBreakdownChart
              data={expensesByCategory}
              formatCurrency={formatKES}
            />
            <IncomeSourcesChart
              data={incomeBySource}
              formatCurrency={formatKES}
            />
          </div>
          <RevenueExpenseChart data={monthlyFinanceData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
