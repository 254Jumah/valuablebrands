import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { profitLossSummary } from '@/data/mockFinanceAnalytics';

export const ProfitLossStatement = ({ formatCurrency }) => {
  const data = profitLossSummary;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profit & Loss Statement</CardTitle>
        <CardDescription>Financial summary for Q1 2024</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Revenue Section */}
        <div>
          <h4 className="mb-2 font-semibold text-emerald-600">Revenue</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sponsorships</span>
              <span>{formatCurrency(data.revenue.sponsorships)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ticket Sales</span>
              <span>{formatCurrency(data.revenue.ticketSales)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Registration Fees</span>
              <span>{formatCurrency(data.revenue.registrationFees)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Partnerships</span>
              <span>{formatCurrency(data.revenue.partnerships)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Other Income</span>
              <span>{formatCurrency(data.revenue.other)}</span>
            </div>
          </div>
          <div className="mt-2 flex justify-between border-t pt-2 font-semibold">
            <span>Total Revenue</span>
            <span className="text-emerald-600">
              {formatCurrency(data.revenue.total)}
            </span>
          </div>
        </div>

        <Separator />

        {/* Cost of Sales */}
        <div>
          <h4 className="mb-2 font-semibold text-orange-600">Cost of Sales</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Venue Costs</span>
              <span>{formatCurrency(data.costOfSales.venue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Catering</span>
              <span>{formatCurrency(data.costOfSales.catering)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Equipment</span>
              <span>{formatCurrency(data.costOfSales.equipment)}</span>
            </div>
          </div>
          <div className="mt-2 flex justify-between border-t pt-2 font-semibold">
            <span>Total Cost of Sales</span>
            <span className="text-orange-600">
              {formatCurrency(data.costOfSales.total)}
            </span>
          </div>
        </div>

        <div className="flex justify-between rounded-lg bg-emerald-500/10 p-3 font-semibold">
          <span>Gross Profit</span>
          <span className="text-emerald-600">
            {formatCurrency(data.grossProfit)}
          </span>
        </div>

        <Separator />

        {/* Operating Expenses */}
        <div>
          <h4 className="mb-2 font-semibold text-red-600">
            Operating Expenses
          </h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Marketing & Advertising
              </span>
              <span>{formatCurrency(data.operatingExpenses.marketing)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Staff & Payroll</span>
              <span>{formatCurrency(data.operatingExpenses.staffPayroll)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Contractors</span>
              <span>{formatCurrency(data.operatingExpenses.contractors)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Logistics</span>
              <span>{formatCurrency(data.operatingExpenses.logistics)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Administrative</span>
              <span>
                {formatCurrency(data.operatingExpenses.administrative)}
              </span>
            </div>
          </div>
          <div className="mt-2 flex justify-between border-t pt-2 font-semibold">
            <span>Total Operating Expenses</span>
            <span className="text-red-600">
              {formatCurrency(data.operatingExpenses.total)}
            </span>
          </div>
        </div>

        <div className="flex justify-between rounded-lg bg-blue-500/10 p-3 font-semibold">
          <span>Operating Profit</span>
          <span className="text-blue-600">
            {formatCurrency(data.operatingProfit)}
          </span>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Taxes (30%)</span>
            <span className="text-red-600">-{formatCurrency(data.taxes)}</span>
          </div>
        </div>

        <div className="flex justify-between rounded-lg bg-primary/10 p-4 text-lg font-bold">
          <span>Net Profit</span>
          <span className="text-primary">{formatCurrency(data.netProfit)}</span>
        </div>
      </CardContent>
    </Card>
  );
};
