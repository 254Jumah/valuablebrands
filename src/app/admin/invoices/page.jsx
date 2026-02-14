'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import {
  FileText,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  DollarSign,
  Send,
  Eye,
  Download,
  Receipt,
  Loader2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Remove CRM import and replace with API service

import {
  fetchInvoices,
  createInvoice,
  updateInvoice,
  recordPayment,
  markInvoiceOverdue,
  clearInvoice,
  fetchbrands,
} from '@/app/lib/action';

// PDF generation utilities
import { downloadInvoicePDF } from '@/components/admin/invoices/InvoicePDF';
import { downloadReceiptPDF } from '@/components/admin/invoices/ReceiptPDF';

const invoiceStatuses = ['Not sent', 'Sent', 'Part-paid', 'Paid', 'Overdue'];

const money = new Intl.NumberFormat('en-KE', {
  style: 'currency',
  currency: 'KES',
  maximumFractionDigits: 0,
});

function badgeForInvoice(status) {
  switch (status) {
    case 'Paid':
      return 'default';
    case 'Part-paid':
      return 'secondary';
    case 'Overdue':
      return 'destructive';
    case 'Sent':
      return 'outline';
    default:
      return 'outline';
  }
}

function generateInvoiceNumber() {
  const year = new Date().getFullYear();
  const num = String(Math.floor(Math.random() * 9000) + 1000);
  return `INV-${year}-${num}`;
}

// Company info for PDFs
const companyInfo = {
  name: 'Valuable Brands Ltd',
  address: '123 Business Park, Nairobi, Kenya',
  phone: '+254 700 123 456',
  email: 'finance@valuablebrands.co.ke',
  website: 'www.valuablebrands.co.ke',
};

export default function InvoiceManagement() {
  // State for data
  const [invoices, setInvoices] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI state
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [generateReceipt, setGenerateReceipt] = useState(true);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Only fetch invoices - they contain all needed data
      const invoicesData = await fetchInvoices();
      setInvoices(invoicesData);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load invoices. Please try again.');
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    const q = query.trim().toLowerCase();
    return invoices
      .filter((invoice) =>
        statusFilter === 'All' ? true : invoice.status === statusFilter
      )
      .filter((invoice) => {
        if (!q) return true;
        const haystack = [
          invoice.brand?.businessName,
          invoice.brand?.primaryContact?.name,
          invoice.brand?.primaryContact?.email,
          invoice.invoiceNumber,
          invoice.event?.title,
          invoice.package?.name,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(q);
      });
  }, [invoices, statusFilter, query]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = invoices.reduce((sum, inv) => sum + inv.amountTotal, 0);
    const paid = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
    const outstanding = total - paid;

    const paidCount = invoices.filter((inv) => inv.status === 'Paid').length;
    const pendingCount = invoices.filter(
      (inv) => inv.status === 'Sent' || inv.status === 'Part-paid'
    ).length;
    const overdueCount = invoices.filter(
      (inv) => inv.status === 'Overdue'
    ).length;
    const notSentCount = invoices.filter(
      (inv) => inv.status === 'Not sent'
    ).length;

    return {
      total,
      paid,
      outstanding,
      paidCount,
      pendingCount,
      overdueCount,
      notSentCount,
    };
  }, [invoices]);

  const openDetail = (invoice) => {
    setSelectedInvoice(invoice);
    setDetailOpen(true);
  };

  const handleIssueInvoice = async (invoice) => {
    try {
      const invoiceNumber = invoice.invoiceNumber || generateInvoiceNumber();
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);

      const updatedInvoice = await createInvoice({
        ...invoice,
        invoiceNumber,
        status: 'Sent',
        dueDate: dueDate.toISOString(),
      });

      // Update local state
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === invoice.id ? updatedInvoice : inv))
      );

      toast.success('Invoice issued successfully');

      // Update detail view if open
      if (selectedInvoice?.id === invoice.id) {
        setSelectedInvoice(updatedInvoice);
      }
    } catch (err) {
      console.error('Failed to issue invoice:', err);
      toast.error('Failed to issue invoice');
    }
  };

  const handleMarkOverdue = async (invoice) => {
    try {
      const updatedInvoice = await markInvoiceOverdue(invoice.id);

      setInvoices((prev) =>
        prev.map((inv) => (inv.id === invoice.id ? updatedInvoice : inv))
      );

      toast.success('Invoice marked as overdue');

      if (selectedInvoice?.id === invoice.id) {
        setSelectedInvoice(updatedInvoice);
      }
    } catch (err) {
      console.error('Failed to mark invoice as overdue:', err);
      toast.error('Failed to update invoice');
    }
  };

  const openPaymentDialog = (invoice) => {
    setSelectedInvoice(invoice);
    setPaymentAmount('');
    setPaymentNote('');
    setPaymentDialogOpen(true);
  };

  const handleRecordPayment = async () => {
    if (!selectedInvoice) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    try {
      // Record payment via API
      const { updatedInvoice, receipt } = await recordPayment(
        selectedInvoice.id,
        {
          amount,
          note: paymentNote,
          generateReceipt,
        }
      );

      // Update local state
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === selectedInvoice.id ? updatedInvoice : inv
        )
      );

      // Generate receipt PDF if needed
      if (generateReceipt && receipt) {
        downloadReceiptPDF({
          registration: updatedInvoice,
          brand: updatedInvoice.brand, // Use nested brand
          paymentAmount: amount,
          paymentNote,
          companyInfo,
        });
      }

      setPaymentDialogOpen(false);
      setSelectedInvoice(null);
      toast.success('Payment recorded successfully');
    } catch (err) {
      console.error('Failed to record payment:', err);
      toast.error('Failed to record payment');
    }
  };

  const handleClearInvoice = async (invoice) => {
    try {
      const { updatedInvoice, receipt } = await clearInvoice(invoice.id);

      setInvoices((prev) =>
        prev.map((inv) => (inv.id === invoice.id ? updatedInvoice : inv))
      );

      // Generate receipt PDF
      downloadReceiptPDF({
        registration: updatedInvoice,
        brand: updatedInvoice.brand, // Use nested brand
        paymentAmount: updatedInvoice.amountTotal - invoice.amountPaid,
        paymentNote: 'Full balance cleared',
        companyInfo,
      });

      toast.success('Invoice cleared successfully');

      if (selectedInvoice?.id === invoice.id) {
        setSelectedInvoice(updatedInvoice);
      }
    } catch (err) {
      console.error('Failed to clear invoice:', err);
      toast.error('Failed to clear invoice');
    }
  };

  const handleDownloadInvoice = (invoice) => {
    downloadInvoicePDF({
      registration: invoice,
      brand: invoice.brand, // Pass the nested brand object
      companyInfo,
    });
  };

  const handleRetry = () => {
    loadData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading invoices...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-12 w-12 mx-auto text-destructive" />
          <h2 className="text-xl font-semibold">Error Loading Data</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={handleRetry}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ToastContainer position="bottom-center" autoClose={3000} />

      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground lg:text-3xl">
            Invoice Management
          </h1>
          <p className="text-muted-foreground">
            Issue, track, and clear invoices for event registrations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadData}>
            Refresh
          </Button>
        </div>
      </header>

      {/* Stats Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Invoiced
            </CardTitle>
            <div className="rounded-lg bg-primary p-2">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="font-display text-2xl font-bold text-foreground">
              {money.format(stats.total)}
            </p>
            <p className="text-xs text-muted-foreground">
              {invoices.length} invoices
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Collected
            </CardTitle>
            <div className="rounded-lg bg-green-500/20 p-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="font-display text-2xl font-bold text-foreground">
              {money.format(stats.paid)}
            </p>
            <p className="text-xs text-muted-foreground">
              {stats.paidCount} paid in full
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Outstanding
            </CardTitle>
            <div className="rounded-lg bg-yellow-500/20 p-2">
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="font-display text-2xl font-bold text-foreground">
              {money.format(stats.outstanding)}
            </p>
            <p className="text-xs text-muted-foreground">
              {stats.pendingCount} pending
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overdue
            </CardTitle>
            <div className="rounded-lg bg-destructive/20 p-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="font-display text-2xl font-bold text-foreground">
              {stats.overdueCount}
            </p>
            <p className="text-xs text-muted-foreground">
              {stats.notSentCount} not sent yet
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Filters */}
      <section className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by business, invoice number..."
              className="pl-9"
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v)}
          >
            <SelectTrigger className="w-45">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All statuses</SelectItem>
              {invoiceStatuses.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Invoice Table */}
        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Business</TableHead>
                <TableHead className="hidden md:table-cell">Event</TableHead>
                <TableHead>Package</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Amount</TableHead>
                <TableHead className="hidden lg:table-cell">Paid</TableHead>
                <TableHead className="hidden lg:table-cell">Balance</TableHead>
                <TableHead className="hidden lg:table-cell">Due Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    No invoices found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((invoice) => {
                  const balance = Math.max(
                    0,
                    invoice.amountTotal - invoice.amountPaid
                  );
                  const paidPercent =
                    invoice.amountTotal > 0
                      ? (invoice.amountPaid / invoice.amountTotal) * 100
                      : 0;
                  return (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <span className="font-mono text-sm text-foreground">
                          {invoice.invoiceNumber || '—'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-foreground">
                            {invoice.brand?.businessName ?? 'Unknown'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {invoice.brand?.primaryContact?.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-sm text-foreground">
                          {invoice.event?.title}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          <Badge variant="outline">
                            {invoice.package?.name}
                          </Badge>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={badgeForInvoice(invoice.status)}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell font-medium">
                        {money.format(invoice.amountTotal)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="space-y-1">
                          <span className="text-sm">
                            {money.format(invoice.amountPaid)}
                          </span>
                          <Progress
                            value={paidPercent}
                            className="h-1.5 w-16"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell font-medium">
                        <span className={cn(balance > 0 && 'text-destructive')}>
                          {money.format(balance)}
                        </span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {invoice.dueDate
                          ? format(new Date(invoice.dueDate), 'MMM d, yyyy')
                          : '—'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDetail(invoice)}
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          {invoice.invoiceNumber && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDownloadInvoice(invoice)}
                              title="Download invoice PDF"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}

                          {invoice.status === 'Not sent' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleIssueInvoice(invoice)}
                              title="Issue invoice"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}

                          {(invoice.status === 'Sent' ||
                            invoice.status === 'Part-paid' ||
                            invoice.status === 'Overdue') && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openPaymentDialog(invoice)}
                              title="Record payment"
                            >
                              <DollarSign className="h-4 w-4" />
                            </Button>
                          )}

                          {invoice.status !== 'Paid' &&
                            invoice.status !== 'Not sent' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleClearInvoice(invoice)}
                                title="Clear invoice (mark fully paid)"
                              >
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              </Button>
                            )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Invoice Detail Sheet */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Invoice Details</SheetTitle>
            <SheetDescription>
              {selectedInvoice?.invoiceNumber || 'No invoice number'}
            </SheetDescription>
          </SheetHeader>

          {selectedInvoice && (
            <div className="mt-6 space-y-6">
              {/* Business Info */}
              <div className="rounded-lg border border-border p-4">
                <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                  Bill To
                </h3>
                <div className="space-y-1">
                  <p className="font-medium text-foreground">
                    {selectedInvoice?.brand?.businessName ?? 'Unknown'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedInvoice?.brand?.primaryContact?.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedInvoice?.brand?.primaryContact?.email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedInvoice?.brand?.primaryContact?.phone}
                  </p>
                </div>
              </div>

              {/* Invoice Details */}
              <div className="rounded-lg border border-border p-4">
                <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                  Invoice Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Event</span>
                    <span className="text-sm font-medium text-foreground">
                      {selectedInvoice.eventName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Package
                    </span>
                    <Badge variant="outline">
                      {selectedInvoice.packageTier}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Seats (Pax)
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {selectedInvoice.pax}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Status
                    </span>
                    <Badge variant={badgeForInvoice(selectedInvoice.status)}>
                      {selectedInvoice.status}
                    </Badge>
                  </div>
                  {selectedInvoice.dueDate && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Due Date
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {format(
                          new Date(selectedInvoice.dueDate),
                          'MMMM d, yyyy'
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="rounded-lg border border-border p-4">
                <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                  Payment Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Total Amount
                    </span>
                    <span className="text-lg font-bold text-foreground">
                      {money.format(selectedInvoice.amountTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Amount Paid
                    </span>
                    <span className="text-sm font-medium text-green-600">
                      {money.format(selectedInvoice.amountPaid)}
                    </span>
                  </div>
                  <div className="border-t border-border pt-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-foreground">
                        Balance Due
                      </span>
                      <span
                        className={cn(
                          'text-lg font-bold',
                          selectedInvoice.amountTotal -
                            selectedInvoice.amountPaid >
                            0
                            ? 'text-destructive'
                            : 'text-green-600'
                        )}
                      >
                        {money.format(
                          Math.max(
                            0,
                            selectedInvoice.amountTotal -
                              selectedInvoice.amountPaid
                          )
                        )}
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={
                      selectedInvoice.amountTotal > 0
                        ? (selectedInvoice.amountPaid /
                            selectedInvoice.amountTotal) *
                          100
                        : 0
                    }
                    className="h-2"
                  />
                </div>
              </div>

              {/* Notes */}
              {selectedInvoice.notes && (
                <div className="rounded-lg border border-border p-4">
                  <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                    Payment Notes
                  </h3>
                  <pre className="whitespace-pre-wrap text-sm text-foreground">
                    {selectedInvoice.notes}
                  </pre>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                {selectedInvoice.invoiceNumber && (
                  <Button
                    variant="outline"
                    onClick={() => handleDownloadInvoice(selectedInvoice)}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download Invoice
                  </Button>
                )}
                {selectedInvoice.status === 'Not sent' && (
                  <Button
                    onClick={() => handleIssueInvoice(selectedInvoice)}
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Issue Invoice
                  </Button>
                )}
                {selectedInvoice.status !== 'Paid' &&
                  selectedInvoice.status !== 'Not sent' && (
                    <>
                      <Button
                        onClick={() => openPaymentDialog(selectedInvoice)}
                        className="gap-2"
                      >
                        <DollarSign className="h-4 w-4" />
                        Record Payment
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleClearInvoice(selectedInvoice)}
                        className="gap-2"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Clear Invoice
                      </Button>
                    </>
                  )}
                {selectedInvoice.status === 'Sent' && (
                  <Button
                    variant="destructive"
                    onClick={() => handleMarkOverdue(selectedInvoice)}
                    className="gap-2"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    Mark Overdue
                  </Button>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Payment Dialog */}
      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              {selectedInvoice && (
                <>
                  Recording payment for{' '}
                  {selectedInvoice.brand?.businessName || 'Unknown Business'}
                  <br />
                  <span className="font-medium">
                    Balance:{' '}
                    {money.format(
                      Math.max(
                        0,
                        selectedInvoice.amountTotal - selectedInvoice.amountPaid
                      )
                    )}
                  </span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Payment Amount (KES)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                min={0}
                max={
                  selectedInvoice
                    ? selectedInvoice.amountTotal - selectedInvoice.amountPaid
                    : undefined
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Payment Reference (optional)</Label>
              <Textarea
                id="note"
                placeholder="e.g., M-Pesa transaction ID, bank reference..."
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="generate-receipt"
                checked={generateReceipt}
                onCheckedChange={(checked) =>
                  setGenerateReceipt(checked === true)
                }
              />
              <Label
                htmlFor="generate-receipt"
                className="text-sm font-normal cursor-pointer"
              >
                Generate receipt PDF after recording payment
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPaymentDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRecordPayment}
              disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
            >
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
