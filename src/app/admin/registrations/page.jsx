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
  X,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
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
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import backend API functions (you'll need to create these)
import {
  fetchEventBrands as fetchBrands,
  addRegistration as apiAddRegistration,
  updateRegistration as apiUpdateRegistration,
  deleteRegistration as apiDeleteRegistration,
  addReminder as apiAddReminder,
  updateReminder as apiUpdateReminder,
  deleteReminder as apiDeleteReminder,
  fetchRegistrations,
  fetchEvents,
} from '@/app/lib/action';

import { packageCatalog } from '@/data/mockEventFinance';
import { RemindersPanel } from '@/components/layout/RemindersPanel';
import useAuth from '@/app/hooks/useAuth';

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

// Loading Skeleton Components
const CardSkeleton = () => (
  <Card className="border-border/50">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-10 rounded-lg" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-8 w-32 mb-1" />
      <Skeleton className="h-3 w-40" />
    </CardContent>
  </Card>
);

const TableRowSkeleton = () => (
  <TableRow>
    <TableCell>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
    </TableCell>
    <TableCell className="hidden lg:table-cell">
      <Skeleton className="h-4 w-40" />
    </TableCell>
    <TableCell>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
    </TableCell>
    <TableCell className="hidden md:table-cell">
      <Skeleton className="h-4 w-12" />
    </TableCell>
    <TableCell>
      <div className="space-y-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-3 w-24" />
      </div>
    </TableCell>
    <TableCell className="hidden md:table-cell">
      <Skeleton className="h-4 w-20" />
    </TableCell>
    <TableCell className="hidden md:table-cell">
      <Skeleton className="h-4 w-20" />
    </TableCell>
    <TableCell className="hidden lg:table-cell">
      <Skeleton className="h-4 w-20" />
    </TableCell>
    <TableCell className="hidden lg:table-cell">
      <Skeleton className="h-6 w-10 rounded-full" />
    </TableCell>
    <TableCell>
      <div className="flex justify-end gap-2">
        <Skeleton className="h-8 w-8 rounded" />
        <Skeleton className="h-8 w-8 rounded" />
        <Skeleton className="h-8 w-8 rounded" />
      </div>
    </TableCell>
  </TableRow>
);

export default function AdminEventFinance() {
  const { email, name, role, id } = useAuth();
  const [loading, setLoading] = useState(true);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [error, setError] = useState(null);
  const [brands, setBrands] = useState([]);

  const [registrations, setRegistrations] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [invoiceFilter, setInvoiceFilter] = useState('All');

  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingRegistration, setViewingRegistration] = useState(null);
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const brandsById = useMemo(() => {
    return new Map(brands.map((b) => [b._id, b]));
  }, [brands]);

  const form = useForm({
    resolver: zodResolver(registrationSchema),
    defaultValues: emptyFormValues(),
    mode: 'onBlur',
  });
  const getBrandsData = async () => {
    setLoading(true);
    setLoadingBrands(true);
    try {
      const data = await fetchBrands();

      setBrands(data || []);
    } catch (error) {
      setError('Failed to load brands data');
      toast.error('Failed to load brands data');
    } finally {
      setLoading(false);
      setLoadingBrands(false);
    }
  };
  useEffect(() => {
    getBrandsData();
  }, []);

  const getEventsData = async () => {
    setLoading(true);
    setLoadingEvents(true);
    try {
      const data = await fetchEvents();
      setEvents(data || []);
    } catch (error) {
      setError('Failed to load events data');
      toast.error('Failed to load events data');
    } finally {
      setLoading(false);
      setLoadingEvents(false);
    }
  };
  useEffect(() => {
    getEventsData();
  }, []);
  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setLoadingBrands(true);

        const registrationsData = await fetchRegistrations();
        console.log('Fetched registrations:', registrationsData);
        setRegistrations(registrationsData || []);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
        setLoadingBrands(false);
      }
    };

    fetchData();
  }, []);

  // Auto-fill pricing/pax based on tier when creating
  const tier = form.watch('packageTier');
  useEffect(() => {
    if (editingId) return;
    const cfg = packageCatalog[tier];
    form.setValue('amountTotal', cfg?.price || 0, { shouldValidate: true });
    form.setValue('pax', cfg?.includedPax, { shouldValidate: true });
  }, [tier, editingId, form]);

  const filtered = useMemo(() => {
    if (loading) return [];

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
  }, [registrations, statusFilter, invoiceFilter, query, brandsById, loading]);

  const totals = useMemo(() => {
    if (loading)
      return { totalAmount: 0, paidAmount: 0, outstanding: 0, pax: 0 };

    const totalAmount = registrations.reduce((s, r) => s + r.amountTotal, 0);
    const paidAmount = registrations.reduce((s, r) => s + r.amountPaid, 0);
    const pax = registrations.reduce((s, r) => s + r.pax, 0);
    const outstanding = Math.max(0, totalAmount - paidAmount);
    return { totalAmount, paidAmount, outstanding, pax };
  }, [registrations, loading]);

  const openCreate = () => {
    setEditingId(null);
    form.reset(emptyFormValues());
    setFormDialogOpen(true);
  };

  const openEdit = (r) => {
    setEditingId(r.id);
    form.reset(registrationToFormValues(r));
    setFormDialogOpen(true);
  };

  const openDetail = (r) => {
    setViewingRegistration(r);
    setDetailDialogOpen(true);
  };

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const dueDateIso = values.dueDate
        ? dateInputToIso(values.dueDate)
        : undefined;

      const registrationData = {
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
        recordedBy: name,
      };

      if (editingId) {
        // Update registration
        const updatedRegistration = await apiUpdateRegistration(
          editingId,
          registrationData
        );
        setRegistrations((prev) =>
          prev.map((r) => (r.id === editingId ? updatedRegistration : r))
        );
      } else {
        const response = await apiAddRegistration(registrationData);

        if (!response.success) {
          throw new Error(response.message);
        }

        setRegistrations((prev) => [response.data, ...prev]);
        toast.success(response.message);
      }

      setFormDialogOpen(false);
      form.reset(emptyFormValues());
    } catch (err) {
      console.error('Submission error:', err);
      // Handle error (show toast, etc.)
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiDeleteRegistration(id);
      setRegistrations((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
      // Handle error
    }
  };

  // API wrapper functions for reminders (to be implemented)
  const handleAddReminder = async (registrationId, reminderData) => {
    try {
      const newReminder = await apiAddReminder(registrationId, reminderData);
      // Update local state
      setRegistrations((prev) =>
        prev.map((r) =>
          r.id === registrationId
            ? { ...r, reminders: [...(r.reminders || []), newReminder] }
            : r
        )
      );
      return newReminder;
    } catch (err) {
      console.error('Add reminder error:', err);
      throw err;
    }
  };

  const handleUpdateReminder = async (
    registrationId,
    reminderId,
    reminderData
  ) => {
    try {
      const updatedReminder = await apiUpdateReminder(
        registrationId,
        reminderId,
        reminderData
      );
      // Update local state
      setRegistrations((prev) =>
        prev.map((r) =>
          r.id === registrationId
            ? {
                ...r,
                reminders: (r.reminders || []).map((rm) =>
                  rm.id === reminderId ? updatedReminder : rm
                ),
              }
            : r
        )
      );
    } catch (err) {
      console.error('Update reminder error:', err);
      throw err;
    }
  };

  const handleDeleteReminder = async (registrationId, reminderId) => {
    try {
      await apiDeleteReminder(registrationId, reminderId);
      // Update local state
      setRegistrations((prev) =>
        prev.map((r) =>
          r.id === registrationId
            ? {
                ...r,
                reminders: (r.reminders || []).filter(
                  (rm) => rm.id !== reminderId
                ),
              }
            : r
        )
      );
    } catch (err) {
      console.error('Delete reminder error:', err);
      throw err;
    }
  };

  // Keep viewing registration in sync with state
  const currentViewReg = viewingRegistration
    ? (registrations.find((r) => r.id === viewingRegistration.id) ?? null)
    : null;
  // Remove the entire error return block (lines 324-346) and replace with:
  if (error) {
    return (
      <div className="space-y-6">
        {/* Keep the header with Add button */}
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

        {/* Error message card */}
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-start">
            <div className="shrink-0">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-red-800">
                Unable to Load Registration Data
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  We encountered an issue while loading the registration data.
                  This could be due to:
                </p>
                <ul className="mt-2 ml-5 list-disc space-y-1">
                  <li>Network connectivity issues</li>
                  <li>Temporary database unavailability</li>
                  <li>No registrations exist in the system yet</li>
                </ul>
                <p className="mt-3">
                  You can still add new registrations using the button above.
                </p>
              </div>
              <div className="mt-4">
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  size="sm"
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  Try Loading Again
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Show empty table structure for consistency */}
        <section className="rounded-xl border border-border bg-card p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search business, contact, invoice, event..."
                className="pl-9"
                disabled
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Select disabled>
                <SelectTrigger className="w-[190px]">
                  <SelectValue placeholder="Registration status" />
                </SelectTrigger>
              </Select>

              <Select disabled>
                <SelectTrigger className="w-[170px]">
                  <SelectValue placeholder="Invoice status" />
                </SelectTrigger>
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
                  <TableHead className="hidden lg:table-cell">
                    Balance
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Reminders
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={10} className="py-12 text-center">
                    <div className="mx-auto max-w-md">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                        <Users className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        No Registration Data Available
                      </h3>
                      <p className="mt-1 text-gray-600">
                        Start by adding your first registration
                      </p>
                      <Button onClick={openCreate} className="mt-4">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Your First Registration
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </section>

        {/* Show the form dialog (it will still work even if fetch fails) */}
        <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
          <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="flex flex-row items-center justify-between">
              <div>
                <DialogTitle>
                  {editingId ? 'Edit registration' : 'Add registration'}
                </DialogTitle>
                <DialogDescription className="mt-1">
                  {editingId
                    ? 'Update the registration details.'
                    : 'Register a business for an upcoming event.'}
                </DialogDescription>
              </div>
              <DialogClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </DialogClose>
            </DialogHeader>

            <div className="mt-4">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="brandId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={loadingBrands || isSubmitting}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select business" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {loadingBrands ? (
                                <div className="flex items-center justify-center py-2">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                </div>
                              ) : brands.length > 0 ? (
                                brands.map((b) => (
                                  // Use b._id if that's what's returned from your API
                                  <SelectItem
                                    key={b._id || b.id}
                                    value={b._id || b.id}
                                  >
                                    {b.businessName}
                                  </SelectItem>
                                ))
                              ) : (
                                <div className="py-2 px-3 text-sm text-gray-500">
                                  No businesses available
                                </div>
                              )}
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
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={loadingBrands || isSubmitting}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select business" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {loadingEvents ? (
                                <div className="flex items-center justify-center py-2">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                </div>
                              ) : events.length > 0 ? (
                                events.map((e) => (
                                  <SelectItem key={e._id} value={e._id}>
                                    {e.title}
                                  </SelectItem>
                                ))
                              ) : (
                                <div className="py-2 px-3 text-sm text-gray-500">
                                  No businesses available
                                </div>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="packageTier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Package tier</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={isSubmitting}
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
                            <Input
                              type="number"
                              inputMode="numeric"
                              {...field}
                              disabled={isSubmitting}
                            />
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
                            disabled={isSubmitting}
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
                            disabled={isSubmitting}
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
                            <Input
                              placeholder="e.g., INV-2024-012"
                              {...field}
                              disabled={isSubmitting}
                            />
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
                            <Input
                              type="date"
                              {...field}
                              disabled={isSubmitting}
                            />
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
                            <Input
                              type="number"
                              inputMode="numeric"
                              {...field}
                              disabled={isSubmitting}
                            />
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
                            <Input
                              type="number"
                              inputMode="numeric"
                              {...field}
                              disabled={isSubmitting}
                            />
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
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter className="mt-6">
                    <DialogClose asChild>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button
                      type="submit"
                      variant="hero"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : editingId ? (
                        'Update Registration'
                      ) : (
                        'Create Registration'
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <ToastContainer position="top-right" autoClose={3000} />
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
        <Button variant="hero" onClick={openCreate} disabled={loading}>
          <Plus className="mr-2 h-4 w-4" />
          Add registration
        </Button>
      </header>

      {/* Dashboard Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
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
                <p className="text-xs text-muted-foreground">
                  Balance remaining
                </p>
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
          </>
        )}
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
              disabled={loading}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v)}
              disabled={loading}
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
              disabled={loading}
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
          {loading ? (
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
                  <TableHead className="hidden lg:table-cell">
                    Balance
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Reminders
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <TableRowSkeleton key={i} />
                ))}
              </TableBody>
            </Table>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center">
              <div className="mx-auto max-w-md">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Users className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">
                  No registrations found
                </h3>
                <p className="text-muted-foreground mt-1">
                  {query || statusFilter !== 'All' || invoiceFilter !== 'All'
                    ? 'Try adjusting your search or filters'
                    : 'Get started by adding your first registration'}
                </p>
                {!query &&
                  statusFilter === 'All' &&
                  invoiceFilter === 'All' && (
                    <Button onClick={openCreate} className="mt-4">
                      <Plus className="mr-2 h-4 w-4" />
                      Add registration
                    </Button>
                  )}
              </div>
            </div>
          ) : (
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
                  <TableHead className="hidden lg:table-cell">
                    Balance
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Reminders
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => {
                  const brand = brandsById.get(r.brandId);
                  const balance = Math.max(0, r.amountTotal - r.amountPaid);
                  const pendingReminders = r.reminders
                    ? r.reminders.filter((rm) => rm.status === 'Planned').length
                    : 0;

                  return (
                    <TableRow key={r._id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-foreground uppercase">
                            {brand?.businessName ||
                              (typeof r.brandId === 'object' &&
                                r.brandId.businessName) ||
                              'Unknown Business'}
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
                          {r.eventName ||
                            (typeof r.eventId === 'object' &&
                              r.eventId.title) ||
                            'Unknown Event'}
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
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </section>

      {/* Registration Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {currentViewReg && (
            <>
              <DialogHeader className="flex flex-row items-center justify-between">
                <div>
                  <DialogTitle className="text-xl">
                    {brandsById.get(currentViewReg.brandId)?.businessName ??
                      'Registration'}
                  </DialogTitle>
                  <DialogDescription className="mt-1">
                    {currentViewReg.eventName}
                  </DialogDescription>
                </div>
                <DialogClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </DialogClose>
              </DialogHeader>

              <Tabs defaultValue="overview" className="mt-4">
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

                  <DialogFooter className="mt-6">
                    <DialogClose asChild>
                      <Button variant="outline">Close</Button>
                    </DialogClose>
                    <Button
                      variant="hero"
                      onClick={() => {
                        setDetailDialogOpen(false);
                        openEdit(currentViewReg);
                      }}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </DialogFooter>
                </TabsContent>

                <TabsContent value="reminders" className="mt-4">
                  <RemindersPanel
                    registrationId={currentViewReg.id}
                    reminders={currentViewReg.reminders || []}
                    onAddReminder={handleAddReminder}
                    onUpdateReminder={handleUpdateReminder}
                    onDeleteReminder={handleDeleteReminder}
                  />
                  <DialogFooter className="mt-6">
                    <DialogClose asChild>
                      <Button variant="outline">Close</Button>
                    </DialogClose>
                  </DialogFooter>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Registration Form Dialog */}
      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between">
            <div>
              <DialogTitle>
                {editingId ? 'Edit registration' : 'Add registration'}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {editingId
                  ? 'Update the registration details.'
                  : 'Register a business for an upcoming event.'}
              </DialogDescription>
            </div>
            <DialogClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </DialogHeader>

          <div className="mt-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="brandId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={loadingBrands || isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select business" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {loadingBrands ? (
                              <div className="flex items-center justify-center py-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                              </div>
                            ) : brands.length > 0 ? (
                              brands.map((b) => (
                                // Use b._id if that's what's returned from your API
                                <SelectItem
                                  key={b._id || b.id}
                                  value={b._id || b.id}
                                >
                                  {b.businessName}
                                </SelectItem>
                              ))
                            ) : (
                              <div className="py-2 px-3 text-sm text-gray-500">
                                No businesses available
                              </div>
                            )}
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
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={loadingBrands || isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select business" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {loadingEvents ? (
                              <div className="flex items-center justify-center py-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                              </div>
                            ) : events.length > 0 ? (
                              events.map((e) => (
                                <SelectItem key={e._id} value={e._id}>
                                  {e.title}
                                </SelectItem>
                              ))
                            ) : (
                              <div className="py-2 px-3 text-sm text-gray-500">
                                No businesses available
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="packageTier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Package tier</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isSubmitting}
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
                          <Input
                            type="number"
                            inputMode="numeric"
                            {...field}
                            disabled={isSubmitting}
                          />
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
                          disabled={isSubmitting}
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
                          disabled={isSubmitting}
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
                          <Input
                            placeholder="e.g., INV-2024-012"
                            {...field}
                            disabled={isSubmitting}
                          />
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
                          <Input
                            type="date"
                            {...field}
                            disabled={isSubmitting}
                          />
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
                          <Input
                            type="number"
                            inputMode="numeric"
                            {...field}
                            disabled={isSubmitting}
                          />
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
                          <Input
                            type="number"
                            inputMode="numeric"
                            {...field}
                            disabled={isSubmitting}
                          />
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
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter className="mt-6">
                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" variant="hero" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : editingId ? (
                      'Update Registration'
                    ) : (
                      'Create Registration'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
