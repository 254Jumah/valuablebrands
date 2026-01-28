import React from 'react';
import { format } from 'date-fns';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const categoryColors = {
  Balance: 'bg-gray-500/10 text-gray-600 border-gray-200',
  Sponsorship: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
  Registration: 'bg-violet-500/10 text-violet-600 border-violet-200',
  Tickets: 'bg-blue-500/10 text-blue-600 border-blue-200',
  Venue: 'bg-orange-500/10 text-orange-600 border-orange-200',
  Catering: 'bg-pink-500/10 text-pink-600 border-pink-200',
  Equipment: 'bg-cyan-500/10 text-cyan-600 border-cyan-200',
  Marketing: 'bg-purple-500/10 text-purple-600 border-purple-200',
  Payroll: 'bg-amber-500/10 text-amber-600 border-amber-200',
  Contractor: 'bg-indigo-500/10 text-indigo-600 border-indigo-200',
};

export const CashFlowTable = ({ data, formatCurrency }) => {
  const currentBalance = data[data.length - 1]?.balance || 0;
  const totalInflow = data.reduce((sum, item) => sum + item.inflow, 0);
  const totalOutflow = data.reduce((sum, item) => sum + item.outflow, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Cash Flow Statement
            </CardTitle>
            <CardDescription>
              Track money movement in and out of the business
            </CardDescription>
          </div>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-emerald-600" />
              <span className="text-muted-foreground">Inflow:</span>
              <span className="font-semibold text-emerald-600">
                {formatCurrency(totalInflow)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowDownRight className="h-4 w-4 text-red-600" />
              <span className="text-muted-foreground">Outflow:</span>
              <span className="font-semibold text-red-600">
                {formatCurrency(totalOutflow)}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center justify-between rounded-lg bg-primary/5 p-4">
          <span className="text-sm font-medium">Current Cash Balance</span>
          <span className="text-2xl font-bold text-primary">
            {formatCurrency(currentBalance)}
          </span>
        </div>
        <div className="max-h-[400px] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Inflow</TableHead>
                <TableHead className="text-right">Outflow</TableHead>
                <TableHead className="text-right">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(item.date), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="font-medium">
                    {item.description}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        categoryColors[item.category] || categoryColors.Balance
                      }
                    >
                      {item.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {item.inflow > 0 && (
                      <span className="text-emerald-600">
                        +{formatCurrency(item.inflow)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.outflow > 0 && (
                      <span className="text-red-600">
                        -{formatCurrency(item.outflow)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(item.balance)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
