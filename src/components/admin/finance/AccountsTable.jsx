'use client';
import React from 'react';
import { format } from 'date-fns';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';
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

const statusConfig = {
  Pending: {
    icon: Clock,
    color: 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
  },
  Overdue: {
    icon: AlertCircle,
    color: 'bg-red-500/10 text-red-700 border-red-200',
  },
  Paid: {
    icon: CheckCircle2,
    color: 'bg-green-500/10 text-green-700 border-green-200',
  },
};

export const AccountsTable = ({ payables, receivables, formatCurrency }) => {
  const totalPayables = payables.reduce((sum, p) => sum + p.amount, 0);
  const totalReceivables = receivables.reduce((sum, r) => sum + r.amount, 0);
  const overduePayables = payables.filter((p) => p.status === 'Overdue');
  const overdueReceivables = receivables.filter((r) => r.status === 'Overdue');

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Accounts Payable */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-red-600">Accounts Payable</CardTitle>
              <CardDescription>Outstanding payments to vendors</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(totalPayables)}
              </div>
              {overduePayables.length > 0 && (
                <div className="text-xs text-red-600">
                  {overduePayables.length} overdue
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-[350px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payables.map((item) => {
                  const StatusIcon = statusConfig[item.status].icon;
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.vendor}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {item.invoiceNumber}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(item.dueDate), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={statusConfig[item.status].color}
                        >
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {item.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Accounts Receivable */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-emerald-600">
                Accounts Receivable
              </CardTitle>
              <CardDescription>
                Outstanding payments from clients
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-emerald-600">
                {formatCurrency(totalReceivables)}
              </div>
              {overdueReceivables.length > 0 && (
                <div className="text-xs text-red-600">
                  {overdueReceivables.length} overdue
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-[350px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receivables.map((item) => {
                  const StatusIcon = statusConfig[item.status].icon;
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.client}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {item.invoiceNumber}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(item.dueDate), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={statusConfig[item.status].color}
                        >
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {item.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
