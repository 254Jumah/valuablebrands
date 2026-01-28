import React from 'react';
import {
  TrendingUp,
  Wallet,
  DollarSign,
  CreditCard,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const iconMap = {
  'Gross Revenue': DollarSign,
  'Net Profit': TrendingUp,
  'Operating Expenses': CreditCard,
  'Profit Margin': PiggyBank,
  'Cash Flow': Wallet,
  'Outstanding Receivables': ArrowDownRight,
  'Accounts Payable': ArrowUpRight,
  ROI: TrendingUp,
};

export const FinanceOverviewCards = ({ kpis, formatCurrency }) => {
  const topKPIs = kpis.slice(0, 4);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {topKPIs.map((kpi) => {
        const Icon = iconMap[kpi.name] || DollarSign;
        const isPercentage = kpi.name === 'Profit Margin' || kpi.name === 'ROI';
        const displayValue = isPercentage
          ? `${kpi.value.toFixed(1)}%`
          : formatCurrency(kpi.value);

        return (
          <Card key={kpi.name} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.name}
              </CardTitle>
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg',
                  kpi.changeType === 'increase'
                    ? 'bg-emerald-500/10 text-emerald-600'
                    : kpi.changeType === 'decrease'
                      ? 'bg-red-500/10 text-red-600'
                      : 'bg-muted text-muted-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{displayValue}</div>
              <div className="mt-1 flex items-center gap-1 text-xs">
                {kpi.changeType === 'increase' ? (
                  <ArrowUpRight className="h-3 w-3 text-emerald-600" />
                ) : kpi.changeType === 'decrease' ? (
                  <ArrowDownRight className="h-3 w-3 text-red-600" />
                ) : (
                  <Minus className="h-3 w-3 text-muted-foreground" />
                )}
                <span
                  className={cn(
                    kpi.changeType === 'increase'
                      ? 'text-emerald-600'
                      : kpi.changeType === 'decrease'
                        ? 'text-red-600'
                        : 'text-muted-foreground'
                  )}
                >
                  {kpi.change}%
                </span>
                <span className="text-muted-foreground">{kpi.period}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
