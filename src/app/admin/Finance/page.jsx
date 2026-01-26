'use client';
import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import {
  Banknote,
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  PieChart,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
const categoryColors = {
  Sponsorship: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
  'Ticket Sales': 'bg-blue-500/10 text-blue-600 border-blue-200',
  'Registration Fees': 'bg-violet-500/10 text-violet-600 border-violet-200',
  Venue: 'bg-orange-500/10 text-orange-600 border-orange-200',
  Catering: 'bg-pink-500/10 text-pink-600 border-pink-200',
  Equipment: 'bg-cyan-500/10 text-cyan-600 border-cyan-200',
  Marketing: 'bg-purple-500/10 text-purple-600 border-purple-200',
  Staff: 'bg-amber-500/10 text-amber-600 border-amber-200',
  Contractor: 'bg-indigo-500/10 text-indigo-600 border-indigo-200',
  Logistics: 'bg-teal-500/10 text-teal-600 border-teal-200',
  Miscellaneous: 'bg-gray-500/10 text-gray-600 border-gray-200',
};

const statusColors = {
  Pending: 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
  Paid: 'bg-green-500/10 text-green-700 border-green-200',
  Overdue: 'bg-red-500/10 text-red-700 border-red-200',
  Cancelled: 'bg-gray-500/10 text-gray-500 border-gray-200',
};

function formatKES(amount) {
  return `KES ${amount.toLocaleString()}`;
}
const initialTransactions = [
  {
    id: 'tx1',
    date: '2024-03-01T00:00:00.000Z',
    type: 'Income',
    category: 'Sponsorship',
    description: 'Gold Sponsor - Safaricom',
    amount: 500000,
    paymentStatus: 'Paid',
    reference: 'SPO-2024-001',
    eventName: 'SME Excellence Awards 2024',
  },
  {
    id: 'tx2',
    date: '2024-03-02T00:00:00.000Z',
    type: 'Income',
    category: 'Sponsorship',
    description: 'Silver Sponsor - KCB Bank',
    amount: 250000,
    paymentStatus: 'Paid',
    reference: 'SPO-2024-002',
    eventName: 'SME Excellence Awards 2024',
  },
  {
    id: 'tx3',
    date: '2024-03-05T00:00:00.000Z',
    type: 'Income',
    category: 'Registration Fees',
    description: 'Table bookings - 15 businesses',
    amount: 180000,
    paymentStatus: 'Paid',
    reference: 'REG-2024-001',
    eventName: 'SME Excellence Awards 2024',
  },
  {
    id: 'tx4',
    date: '2024-03-10T00:00:00.000Z',
    type: 'Expense',
    category: 'Venue',
    description: 'Kempinski Villa Rosa - Main Hall',
    amount: 350000,
    paymentStatus: 'Paid',
    reference: 'VEN-2024-001',
    eventName: 'SME Excellence Awards 2024',
  },
  {
    id: 'tx5',
    date: '2024-03-12T00:00:00.000Z',
    type: 'Expense',
    category: 'Catering',
    description: 'Dinner service - 200 guests',
    amount: 180000,
    paymentStatus: 'Pending',
    reference: 'CAT-2024-001',
    eventName: 'SME Excellence Awards 2024',
  },
  {
    id: 'tx6',
    date: '2024-03-15T00:00:00.000Z',
    type: 'Expense',
    category: 'Equipment',
    description: 'AV Equipment rental - Sound & Lighting',
    amount: 85000,
    paymentStatus: 'Paid',
    reference: 'EQP-2024-001',
    eventName: 'SME Excellence Awards 2024',
  },
  {
    id: 'tx7',
    date: '2024-03-18T00:00:00.000Z',
    type: 'Expense',
    category: 'Marketing',
    description: 'Social media ads & PR',
    amount: 45000,
    paymentStatus: 'Paid',
    reference: 'MKT-2024-001',
    eventName: 'SME Excellence Awards 2024',
  },
  {
    id: 'tx8',
    date: '2024-03-20T00:00:00.000Z',
    type: 'Expense',
    category: 'Contractor',
    description: 'Event coordinator - Jane Mwangi',
    amount: 75000,
    paymentStatus: 'Pending',
    reference: 'CON-2024-001',
    eventName: 'SME Excellence Awards 2024',
  },
  {
    id: 'tx9',
    date: '2024-03-22T00:00:00.000Z',
    type: 'Expense',
    category: 'Staff',
    description: 'Ushers & Support staff (10 people)',
    amount: 30000,
    paymentStatus: 'Paid',
    reference: 'STF-2024-001',
    eventName: 'SME Excellence Awards 2024',
  },
  {
    id: 'tx10',
    date: '2024-03-25T00:00:00.000Z',
    type: 'Expense',
    category: 'Logistics',
    description: 'Transport & setup',
    amount: 25000,
    paymentStatus: 'Overdue',
    reference: 'LOG-2024-001',
    eventName: 'SME Excellence Awards 2024',
  },
  {
    id: 'tx11',
    date: '2024-04-01T00:00:00.000Z',
    type: 'Income',
    category: 'Ticket Sales',
    description: 'VIP Tickets - Brand Summit',
    amount: 120000,
    paymentStatus: 'Paid',
    reference: 'TKT-2024-001',
    eventName: 'Brand Innovation Summit',
  },
  {
    id: 'tx12',
    date: '2024-04-05T00:00:00.000Z',
    type: 'Expense',
    category: 'Venue',
    description: 'Radisson Blu - Conference Hall',
    amount: 200000,
    paymentStatus: 'Pending',
    reference: 'VEN-2024-002',
    eventName: 'Brand Innovation Summit',
  },
];

const initialBudgets = [
  {
    id: 'bg1',
    category: 'Venue',
    budgeted: 400000,
    actual: 350000,
    eventName: 'SME Excellence Awards 2024',
  },
  {
    id: 'bg2',
    category: 'Catering',
    budgeted: 200000,
    actual: 180000,
    eventName: 'SME Excellence Awards 2024',
  },
  {
    id: 'bg3',
    category: 'Equipment',
    budgeted: 100000,
    actual: 85000,
    eventName: 'SME Excellence Awards 2024',
  },
  {
    id: 'bg4',
    category: 'Marketing',
    budgeted: 60000,
    actual: 45000,
    eventName: 'SME Excellence Awards 2024',
  },
  {
    id: 'bg5',
    category: 'Contractor',
    budgeted: 80000,
    actual: 75000,
    eventName: 'SME Excellence Awards 2024',
  },
  {
    id: 'bg6',
    category: 'Staff',
    budgeted: 40000,
    actual: 30000,
    eventName: 'SME Excellence Awards 2024',
  },
  {
    id: 'bg7',
    category: 'Logistics',
    budgeted: 30000,
    actual: 25000,
    eventName: 'SME Excellence Awards 2024',
  },
  {
    id: 'bg8',
    category: 'Miscellaneous',
    budgeted: 50000,
    actual: 20000,
    eventName: 'SME Excellence Awards 2024',
  },
];

export default function FinanceManagement() {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [budgets] = useState(initialBudgets);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Summary calculations
  const summary = useMemo(() => {
    const totalIncome = transactions
      .filter((t) => t.type === 'Income' && t.paymentStatus === 'Paid')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
      .filter((t) => t.type === 'Expense' && t.paymentStatus === 'Paid')
      .reduce((sum, t) => sum + t.amount, 0);
    const pendingPayables = transactions
      .filter((t) => t.type === 'Expense' && t.paymentStatus === 'Pending')
      .reduce((sum, t) => sum + t.amount, 0);
    const pendingReceivables = transactions
      .filter((t) => t.type === 'Income' && t.paymentStatus === 'Pending')
      .reduce((sum, t) => sum + t.amount, 0);
    const overduePayments = transactions.filter(
      (t) => t.paymentStatus === 'Overdue'
    ).length;

    return {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      pendingPayables,
      pendingReceivables,
      overduePayments,
    };
  }, [transactions]);

  // Budget analysis
  const budgetAnalysis = useMemo(() => {
    const totalBudgeted = budgets.reduce((sum, b) => sum + b.budgeted, 0);
    const totalActual = budgets.reduce((sum, b) => sum + b.actual, 0);
    return {
      totalBudgeted,
      totalActual,
      variance: totalBudgeted - totalActual,
      utilizationPercent: Math.round((totalActual / totalBudgeted) * 100),
    };
  }, [budgets]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesType = filterType === 'all' || t.type === filterType;
      const matchesStatus =
        filterStatus === 'all' || t.paymentStatus === filterStatus;
      const matchesSearch =
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.eventName?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesStatus && matchesSearch;
    });
  }, [transactions, filterType, filterStatus, searchTerm]);

  const handleDeleteTransaction = () => {
    if (selectedTransaction) {
      setTransactions((prev) =>
        prev.filter((t) => t.id !== selectedTransaction.id)
      );
      setSelectedTransaction(null);
      setIsDeleteOpen(false);
    }
  };

  const handleUpdateStatus = (id, newStatus) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, paymentStatus: newStatus } : t))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Finance Management
          </h1>
          <p className="text-muted-foreground">
            Track revenue, expenses, and budgets across all events
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm" onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {formatKES(summary.totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              +{formatKES(summary.pendingReceivables)} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatKES(summary.totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatKES(summary.pendingPayables)} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                summary.netBalance >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              {formatKES(summary.netBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.overduePayments} overdue payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Budget Utilization
            </CardTitle>
            <PieChart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {budgetAnalysis.utilizationPercent}%
            </div>
            <Progress
              value={budgetAnalysis.utilizationPercent}
              className="mt-2 h-2"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {formatKES(budgetAnalysis.variance)} under budget
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">
            <Receipt className="mr-2 h-4 w-4" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="budget">
            <PieChart className="mr-2 h-4 w-4" />
            Budget Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <Select
                    value={filterType}
                    onValueChange={(v) => setFilterType(v)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Income">Income</SelectItem>
                      <SelectItem value="Expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={filterStatus}
                    onValueChange={(v) => setFilterStatus(v)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="Overdue">Overdue</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="h-24 text-center text-muted-foreground"
                      >
                        No transactions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(tx.date), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {tx.type === 'Income' ? (
                              <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4 text-red-600" />
                            )}
                            <div>
                              <p className="font-medium">{tx.description}</p>
                              {tx.reference && (
                                <p className="text-xs text-muted-foreground">
                                  {tx.reference}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={categoryColors[tx.category]}
                          >
                            {tx.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {tx.eventName || '—'}
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              tx.type === 'Income'
                                ? 'text-emerald-600'
                                : 'text-red-600'
                            }
                          >
                            {tx.type === 'Income' ? '+' : '-'}
                            {formatKES(tx.amount)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={statusColors[tx.paymentStatus]}
                          >
                            {tx.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => setSelectedTransaction(tx)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingTransaction(tx);
                                  setIsFormOpen(true);
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              {tx.paymentStatus === 'Pending' && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleUpdateStatus(tx.id, 'Paid')
                                  }
                                >
                                  <Banknote className="mr-2 h-4 w-4" />
                                  Mark as Paid
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                  setSelectedTransaction(tx);
                                  setIsDeleteOpen(true);
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                Budget vs Actual - SME Excellence Awards 2024
              </CardTitle>
              <CardDescription>
                Track spending against allocated budgets by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {budgets.map((budget) => {
                  const percent = Math.round(
                    (budget.actual / budget.budgeted) * 100
                  );
                  const isOverBudget = budget.actual > budget.budgeted;
                  return (
                    <div key={budget.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={categoryColors[budget.category]}
                          >
                            {budget.category}
                          </Badge>
                        </div>
                        <div className="text-right text-sm">
                          <span className={isOverBudget ? 'text-red-600' : ''}>
                            {formatKES(budget.actual)}
                          </span>
                          <span className="text-muted-foreground">
                            {' '}
                            / {formatKES(budget.budgeted)}
                          </span>
                        </div>
                      </div>
                      <div className="relative">
                        <Progress
                          value={Math.min(percent, 100)}
                          className={`h-3 ${
                            isOverBudget ? '[&>div]:bg-red-500' : ''
                          }`}
                        />
                        <span className="absolute right-0 top-0 -mt-6 text-xs text-muted-foreground">
                          {percent}%
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {isOverBudget
                          ? `Over budget by ${formatKES(
                              budget.actual - budget.budgeted
                            )}`
                          : `${formatKES(
                              budget.budgeted - budget.actual
                            )} remaining`}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Summary */}
              <div className="mt-8 rounded-lg border bg-muted/50 p-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Budget
                    </p>
                    <p className="text-xl font-semibold">
                      {formatKES(budgetAnalysis.totalBudgeted)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                    <p className="text-xl font-semibold">
                      {formatKES(budgetAnalysis.totalActual)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Variance</p>
                    <p
                      className={`text-xl font-semibold ${
                        budgetAnalysis.variance >= 0
                          ? 'text-emerald-600'
                          : 'text-red-600'
                      }`}
                    >
                      {budgetAnalysis.variance >= 0 ? '+' : ''}
                      {formatKES(budgetAnalysis.variance)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Transaction Form Sheet */}
      <Sheet
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingTransaction(null);
        }}
      >
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>
              {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
            </SheetTitle>
            <SheetDescription>
              {editingTransaction
                ? 'Update transaction details'
                : 'Record a new income or expense'}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select defaultValue={editingTransaction?.type || 'Expense'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Income">Income</SelectItem>
                    <SelectItem value="Expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select defaultValue={editingTransaction?.category || 'Venue'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sponsorship">Sponsorship</SelectItem>
                    <SelectItem value="Ticket Sales">Ticket Sales</SelectItem>
                    <SelectItem value="Registration Fees">
                      Registration Fees
                    </SelectItem>
                    <SelectItem value="Venue">Venue</SelectItem>
                    <SelectItem value="Catering">Catering</SelectItem>
                    <SelectItem value="Equipment">Equipment</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Staff">Staff</SelectItem>
                    <SelectItem value="Contractor">Contractor</SelectItem>
                    <SelectItem value="Logistics">Logistics</SelectItem>
                    <SelectItem value="Miscellaneous">Miscellaneous</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                placeholder="e.g., Venue deposit"
                defaultValue={editingTransaction?.description}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount (KES)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  defaultValue={editingTransaction?.amount}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  defaultValue={editingTransaction?.paymentStatus || 'Pending'}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Reference Number</Label>
              <Input
                placeholder="e.g., INV-2024-001"
                defaultValue={editingTransaction?.reference}
              />
            </div>
            <div className="space-y-2">
              <Label>Event</Label>
              <Select defaultValue={editingTransaction?.eventName || ''}>
                <SelectTrigger>
                  <SelectValue placeholder="Select event" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SME Excellence Awards 2024">
                    SME Excellence Awards 2024
                  </SelectItem>
                  <SelectItem value="Brand Innovation Summit">
                    Brand Innovation Summit
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsFormOpen(false)}>
                {editingTransaction ? 'Update' : 'Add'} Transaction
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTransaction}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
