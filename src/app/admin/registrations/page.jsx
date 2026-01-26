'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import {
  Banknote,
  CalendarClock,
  Eye,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
  Bell,
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

import { packageCatalog } from '@/data/mockEventFinance';
import { RemindersPanel } from '@/components/layout/RemindersPanel';
import { useEventFinance } from '@/hooks/useEventFinance';

const registrationStatuses = [
  'Lead',
  'Interested',
  'Registered',
  'Attended',
  'Cancelled',
];
const invoiceStatuses = ['Not sent', 'Sent', 'Part-paid', 'Paid', 'Overdue'];
const packageTiers = ['Bronze', 'Silver', 'Gold'];

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
    default:
      return 'outline';
  }
}

function badgeForRegistration(status) {
  switch (status) {
    case 'Registered':
      return 'default';
    case 'Interested':
      return 'secondary';
    case 'Cancelled':
      return 'destructive';
    default:
      return 'outline';
  }
}

function isoToDateInput(iso) {
  if (!iso) return '';
  return new Date(iso).toISOString().slice(0, 10);
}

function dateInputToIso(date) {
  if (!date) return undefined;
  return new Date(`${date}T00:00:00.000Z`).toISOString();
}

const registrationSchema = z
  .object({
    brandId: z.string().min(1, 'Business is required'),
    eventName: z.string().trim().min(2, 'Event name is required').max(160),
    packageTier: z.enum(['Bronze', 'Silver', 'Gold']),
    pax: z.coerce.number().int().min(1).max(200),
    registrationStatus: z.enum([
      'Lead',
      'Interested',
      'Registered',
      'Attended',
      'Cancelled',
    ]),
    invoiceStatus: z.enum(['Not sent', 'Sent', 'Part-paid', 'Paid', 'Overdue']),
    invoiceNumber: z.string().trim().max(50).optional().or(z.literal('')),
    amountTotal: z.coerce.number().min(0).max(100_000_000),
    amountPaid: z.coerce.number().min(0).max(100_000_000),
    dueDate: z.string().optional().or(z.literal('')),
    notes: z.string().trim().max(1000).optional().or(z.literal('')),
  })
  .refine((v) => v.amountPaid <= v.amountTotal, {
    message: 'Paid amount cannot exceed total',
    path: ['amountPaid'],
  });

function emptyFormValues() {
  return {
    brandId: '',
    eventName: 'SME Excellence Awards 2024',
    packageTier: 'Bronze',
    pax: packageCatalog.Bronze.includedPax,
    registrationStatus: 'Interested',
    invoiceStatus: 'Not sent',
    invoiceNumber: '',
    amountTotal: packageCatalog.Bronze.price,
    amountPaid: 0,
    dueDate: '',
    notes: '',
  };
}

function registrationToFormValues(r) {
  return {
    brandId: r.brandId,
    eventName: r.eventName,
    packageTier: r.packageTier,
    pax: r.pax,
    registrationStatus: r.registrationStatus,
    invoiceStatus: r.invoiceStatus,
    invoiceNumber: r.invoiceNumber ?? '',
    amountTotal: r.amountTotal,
    amountPaid: r.amountPaid,
    dueDate: isoToDateInput(r.dueDate),
    notes: r.notes ?? '',
  };
}

export default function AdminEventFinance() {
  const {
    brands,
    registrations,
    addRegistration,
    updateRegistration,
    deleteRegistration,
    addReminder,
    updateReminder,
    deleteReminder,
  } = useEventFinance();

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [invoiceFilter, setInvoiceFilter] = useState('All');

  // Sheet states
  const [formSheetOpen, setFormSheetOpen] = useState(false);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingRegistration, setViewingRegistration] = useState(null);

  const brandsById = useMemo(() => {
    return new Map(brands.map((b) => [b.id, b]));
  }, [brands]);

  const form = useForm({
    resolver: zodResolver(registrationSchema),
    defaultValues: emptyFormValues(),
    mode: 'onBlur',
  });

  // Auto-fill pricing/pax based on tier when creating
  const tier = form.watch('packageTier');
  useEffect(() => {
    if (editingId) return;
    const cfg = packageCatalog[tier];
    form.setValue('amountTotal', cfg.price, { shouldValidate: true });
    form.setValue('pax', cfg.includedPax, { shouldValidate: true });
  }, [tier, editingId, form]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return registrations
      .filter((r) =>
        statusFilter === 'All' ? true : r.registrationStatus === statusFilter
      )
      .filter((r) =>
        invoiceFilter === 'All' ? true : r.invoiceStatus === invoiceFilter
      )
      .filter((r) => {
        if (!q) return true;
        const brand = brandsById.get(r.brandId);
        const haystack = [
          r.eventName,
          brand?.businessName,
          brand?.category,
          brand?.primaryContact?.name,
          brand?.primaryContact?.email,
          r.packageTier,
          r.invoiceNumber,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(q);
      });
  }, [registrations, statusFilter, invoiceFilter, query, brandsById]);

  const totals = useMemo(() => {
    const totalAmount = registrations.reduce((s, r) => s + r.amountTotal, 0);
    const paidAmount = registrations.reduce((s, r) => s + r.amountPaid, 0);
    const pax = registrations.reduce((s, r) => s + r.pax, 0);
    const outstanding = Math.max(0, totalAmount - paidAmount);
    return { totalAmount, paidAmount, outstanding, pax };
  }, [registrations]);

  const openCreate = () => {
    setEditingId(null);
    form.reset(emptyFormValues());
    setFormSheetOpen(true);
  };

  const openEdit = (r) => {
    setEditingId(r.id);
    form.reset(registrationToFormValues(r));
    setFormSheetOpen(true);
  };

  const openDetail = (r) => {
    setViewingRegistration(r);
    setDetailSheetOpen(true);
  };

  const onSubmit = (values) => {
    const dueDateIso = values.dueDate
      ? dateInputToIso(values.dueDate)
      : undefined;

    if (editingId) {
      updateRegistration(editingId, {
        brandId: values.brandId,
        eventName: values.eventName,
        packageTier: values.packageTier,
        pax: values.pax,
        registrationStatus: values.registrationStatus,
        invoiceStatus: values.invoiceStatus,
        invoiceNumber: values.invoiceNumber || undefined,
        amountTotal: values.amountTotal,
        amountPaid: values.amountPaid,
        dueDate: dueDateIso,
        notes: values.notes || undefined,
      });
    } else {
      addRegistration({
        brandId: values.brandId,
        eventName: values.eventName,
        packageTier: values.packageTier,
        pax: values.pax,
        registrationStatus: values.registrationStatus,
        invoiceStatus: values.invoiceStatus,
        invoiceNumber: values.invoiceNumber || undefined,
        amountTotal: values.amountTotal,
        amountPaid: values.amountPaid,
        dueDate: dueDateIso,
        notes: values.notes || undefined,
      });
    }

    setFormSheetOpen(false);
  };

  const handleDelete = (id) => {
    deleteRegistration(id);
  };

  // Keep viewing registration in sync with state
  const currentViewReg = viewingRegistration
    ? (registrations.find((r) => r.id === viewingRegistration.id) ?? null)
    : null;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground lg:text-3xl">
            Registrations & Finances
          </h1>
          <p className="text-muted-foreground">
            Track business interest, seats (pax), package tier, invoices, and
            payments for upcoming events.
          </p>
        </div>
        <Button variant="hero" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add registration
        </Button>
      </header>

      {/* Dashboard Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Expected revenue
            </CardTitle>
            <div className="rounded-lg bg-primary p-2">
              <Banknote className="h-4 w-4 text-primary-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="font-display text-2xl font-bold text-foreground">
              {money.format(totals.totalAmount)}
            </p>
            <p className="text-xs text-muted-foreground">
              From all tracked registrations
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Collected
            </CardTitle>
            <div className="rounded-lg bg-accent p-2">
              <Banknote className="h-4 w-4 text-accent-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="font-display text-2xl font-bold text-foreground">
              {money.format(totals.paidAmount)}
            </p>
            <p className="text-xs text-muted-foreground">
              Payments received to date
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Outstanding
            </CardTitle>
            <div className="rounded-lg bg-muted p-2">
              <CalendarClock className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="font-display text-2xl font-bold text-foreground">
              {money.format(totals.outstanding)}
            </p>
            <p className="text-xs text-muted-foreground">Balance remaining</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total pax
            </CardTitle>
            <div className="rounded-lg bg-muted p-2">
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="font-display text-2xl font-bold text-foreground">
              {totals.pax}
            </p>
            <p className="text-xs text-muted-foreground">
              Seats requested/confirmed
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Table */}
      <section className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search business, contact, invoice, event..."
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v)}
            >
              <SelectTrigger className="w-[190px]">
                <SelectValue placeholder="Registration status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All registrations</SelectItem>
                {registrationStatuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={invoiceFilter}
              onValueChange={(v) => setInvoiceFilter(v)}
            >
              <SelectTrigger className="w-[170px]">
                <SelectValue placeholder="Invoice status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All invoices</SelectItem>
                {invoiceStatuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead className="hidden lg:table-cell">Event</TableHead>
                <TableHead>Package</TableHead>
                <TableHead className="hidden md:table-cell">Pax</TableHead>
                <TableHead>Invoice</TableHead>
                <TableHead className="hidden md:table-cell">Total</TableHead>
                <TableHead className="hidden md:table-cell">Paid</TableHead>
                <TableHead className="hidden lg:table-cell">Balance</TableHead>
                <TableHead className="hidden lg:table-cell">
                  Reminders
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    No registrations found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((r) => {
                  const brand = brandsById.get(r.brandId);
                  const balance = Math.max(0, r.amountTotal - r.amountPaid);
                  const pendingReminders = r.reminders
                    ? r.reminders.filter((rm) => rm.status === 'Planned').length
                    : 0;

                  return (
                    <TableRow key={r.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-foreground">
                            {brand?.businessName ?? 'Unknown business'}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge
                              variant={badgeForRegistration(
                                r.registrationStatus
                              )}
                            >
                              {r.registrationStatus}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {brand?.primaryContact?.phone ?? ''}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="text-sm text-foreground">
                          {r.eventName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-foreground">
                            {r.packageTier}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Incl: {packageCatalog[r.packageTier].includedPax}{' '}
                            pax
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {r.pax}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge variant={badgeForInvoice(r.invoiceStatus)}>
                            {r.invoiceStatus}
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            {r.invoiceNumber ? r.invoiceNumber : '—'}
                            {r.dueDate ? (
                              <span className="ml-2">
                                Due {format(new Date(r.dueDate), 'MMM d')}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {money.format(r.amountTotal)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {money.format(r.amountPaid)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span
                          className={cn(
                            'text-sm',
                            balance > 0
                              ? 'text-foreground'
                              : 'text-muted-foreground'
                          )}
                        >
                          {money.format(balance)}
                        </span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {pendingReminders > 0 ? (
                          <Badge variant="secondary" className="gap-1">
                            <Bell className="h-3 w-3" />
                            {pendingReminders}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDetail(r)}
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(r)}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete registration?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently remove this registration
                                  and all associated reminders.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => handleDelete(r.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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

      {/* Detail Sheet with Tabs */}
      <Sheet open={detailSheetOpen} onOpenChange={setDetailSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl">
          {currentViewReg && (
            <>
              <SheetHeader>
                <SheetTitle>
                  {brandsById.get(currentViewReg.brandId)?.businessName ??
                    'Registration'}
                </SheetTitle>
                <SheetDescription>{currentViewReg.eventName}</SheetDescription>
              </SheetHeader>

              <Tabs defaultValue="overview" className="mt-6">
                <TabsList className="w-full">
                  <TabsTrigger value="overview" className="flex-1">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="reminders" className="flex-1">
                    Reminders
                    {currentViewReg.reminders &&
                      currentViewReg.reminders.filter(
                        (rm) => rm.status === 'Planned'
                      ).length > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {
                            currentViewReg.reminders.filter(
                              (rm) => rm.status === 'Planned'
                            ).length
                          }
                        </Badge>
                      )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-4 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Package</p>
                      <p className="font-medium text-foreground">
                        {currentViewReg.packageTier}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {packageCatalog[
                          currentViewReg.packageTier
                        ].benefits.join(' • ')}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Pax (seats)
                      </p>
                      <p className="font-medium text-foreground">
                        {currentViewReg.pax}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Registration status
                      </p>
                      <Badge
                        variant={badgeForRegistration(
                          currentViewReg.registrationStatus
                        )}
                      >
                        {currentViewReg.registrationStatus}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Invoice status
                      </p>
                      <Badge
                        variant={badgeForInvoice(currentViewReg.invoiceStatus)}
                      >
                        {currentViewReg.invoiceStatus}
                      </Badge>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <h4 className="mb-3 text-sm font-semibold text-foreground">
                      Financial summary
                    </h4>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="font-display text-lg font-bold text-foreground">
                          {money.format(currentViewReg.amountTotal)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Paid</p>
                        <p className="font-display text-lg font-bold text-foreground">
                          {money.format(currentViewReg.amountPaid)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Balance</p>
                        <p
                          className={cn(
                            'font-display text-lg font-bold',
                            currentViewReg.amountTotal -
                              currentViewReg.amountPaid >
                              0
                              ? 'text-destructive'
                              : 'text-foreground'
                          )}
                        >
                          {money.format(
                            Math.max(
                              0,
                              currentViewReg.amountTotal -
                                currentViewReg.amountPaid
                            )
                          )}
                        </p>
                      </div>
                    </div>
                    {currentViewReg.invoiceNumber && (
                      <p className="mt-3 text-sm text-muted-foreground">
                        Invoice: {currentViewReg.invoiceNumber}
                        {currentViewReg.dueDate && (
                          <span className="ml-2">
                            • Due{' '}
                            {format(
                              new Date(currentViewReg.dueDate),
                              'MMM d, yyyy'
                            )}
                          </span>
                        )}
                      </p>
                    )}
                  </div>

                  {currentViewReg.notes && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Notes</p>
                      <p className="text-sm text-foreground">
                        {currentViewReg.notes}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setDetailSheetOpen(false)}
                    >
                      Close
                    </Button>
                    <Button
                      variant="hero"
                      onClick={() => {
                        setDetailSheetOpen(false);
                        openEdit(currentViewReg);
                      }}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="reminders" className="mt-4">
                  <RemindersPanel
                    registrationId={currentViewReg.id}
                    reminders={currentViewReg.reminders || []}
                    onAddReminder={addReminder}
                    onUpdateReminder={updateReminder}
                    onDeleteReminder={deleteReminder}
                  />
                </TabsContent>
              </Tabs>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Form Sheet */}
      <Sheet open={formSheetOpen} onOpenChange={setFormSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingId ? 'Edit registration' : 'Add registration'}
            </SheetTitle>
            <SheetDescription>
              {editingId
                ? 'Update the registration details.'
                : 'Register a business for an upcoming event.'}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                <FormField
                  control={form.control}
                  name="brandId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select business" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {brands.map((b) => (
                            <SelectItem key={b.id} value={b.id}>
                              {b.businessName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="eventName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., SME Excellence Awards 2024"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="packageTier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Package tier</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select tier" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {packageTiers.map((t) => (
                              <SelectItem key={t} value={t}>
                                {t} ({money.format(packageCatalog[t].price)})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pax"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pax (seats)</FormLabel>
                        <FormControl>
                          <Input type="number" inputMode="numeric" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="registrationStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Registration status</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {registrationStatuses.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="invoiceStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Invoice status</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {invoiceStatuses.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="invoiceNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Invoice #</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., INV-2024-012" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="amountTotal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total (KES)</FormLabel>
                        <FormControl>
                          <Input type="number" inputMode="numeric" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="amountPaid"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Paid (KES)</FormLabel>
                        <FormControl>
                          <Input type="number" inputMode="numeric" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Any special requests, seating notes, etc."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFormSheetOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="hero">
                    Save
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
