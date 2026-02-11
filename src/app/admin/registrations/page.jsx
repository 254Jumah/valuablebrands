'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { z } from 'zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import {
  Users,
  Calendar,
  Eye,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
  Loader2,
  Building,
  Tag,
  UserCheck,
  FileText,
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
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import backend API functions
import {
  fetchEventBrands as fetchBrands,
  addRegistration as apiAddRegistration,
  updateRegistration as apiUpdateRegistration,
  deleteRegistration as apiDeleteRegistration,
  fetchRegistrations,
  fetchUpcomingEvents as fetchEvents,
  getEventPackages,
} from '@/app/lib/action';

import useAuth from '@/app/hooks/useAuth';

const registrationStatuses = [
  'Lead',
  'Interested',
  'Registered',
  'Attended',
  'Cancelled',
];

function badgeForRegistration(status) {
  switch (status) {
    case 'Registered':
      return 'default';
    case 'Attended':
      return 'success';
    case 'Interested':
      return 'secondary';
    case 'Cancelled':
      return 'destructive';
    default:
      return 'outline';
  }
}

// Updated schema - pax is removed, it's derived from package.includedPax
const registrationSchema = z.object({
  brandId: z.string().min(1, 'Business is required'),
  eventId: z.string().min(1, 'Event is required'),
  packages: z
    .array(
      z.object({
        packageId: z.string().min(1, 'Package is required'),
        packageTier: z.string().min(1, 'Package tier is required'),
        // pax is now derived from the package, not stored in form
      })
    )
    .min(1, 'At least one package is required'),
  registrationStatus: z.enum([
    'Lead',
    'Interested',
    'Registered',
    'Attended',
    'Cancelled',
  ]),
  notes: z.string().trim().max(1000).optional().or(z.literal('')),
});

function emptyFormValues() {
  return {
    brandId: '',
    eventId: '',
    packages: [],
    registrationStatus: 'Interested',
    notes: '',
  };
}

function registrationToFormValues(r) {
  // Handle both old and new format
  const packages = r.packages || [
    {
      packageId: r.packageId,
      packageTier: r.packageTier,
      // pax is not included in form state anymore
    },
  ];

  return {
    brandId: r.brandId,
    eventId: r.eventId,
    packages: packages,
    registrationStatus: r.registrationStatus,
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
      <Skeleton className="h-4 w-20" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-4 w-12" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-6 w-24 rounded-full" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-4 w-24" />
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

export default function AdminRegistrations() {
  const { email, name, role, id } = useAuth();
  const [loading, setLoading] = useState(true);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [error, setError] = useState(null);
  const [brands, setBrands] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingRegistration, setViewingRegistration] = useState(null);
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [packages, setPackages] = useState([]);
  const [isFetching, setIsFetching] = useState(false);

  const brandsById = useMemo(() => {
    return new Map(brands.map((b) => [b._id, b]));
  }, [brands]);

  const eventsById = useMemo(() => {
    return new Map(events.map((e) => [e._id, e]));
  }, [events]);

  const packagesById = useMemo(() => {
    return new Map(packages.map((p) => [p._id, p]));
  }, [packages]);

  const form = useForm({
    resolver: zodResolver(registrationSchema),
    defaultValues: emptyFormValues(),
    mode: 'onBlur',
  });

  // Setup field array for packages
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'packages',
  });

  // Auto-set packageTier when package is selected
  const watchPackages = form.watch('packages');

  useEffect(() => {
    if (!packages.length) return;

    watchPackages?.forEach((pkg, index) => {
      if (pkg?.packageId) {
        const selectedPackage = packagesById.get(pkg.packageId);
        if (selectedPackage && pkg.packageTier !== selectedPackage.name) {
          form.setValue(`packages.${index}.packageTier`, selectedPackage.name, {
            shouldValidate: true,
          });
        }
      }
    });
  }, [watchPackages, packages, packagesById, form]);

  // Fetch brands
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

  const fetchPackages = async () => {
    setIsFetching(true);
    try {
      console.log('📡 Fetching packages from backend...');
      const data = await getEventPackages();
      console.log('✅ Packages fetched successfully:', data);
      setPackages(data || []);
    } catch (error) {
      console.error('❌ Error fetching packages:', error);
      toast.error('Failed to load packages');
    } finally {
      setIsFetching(false);
    }
  };

  // Load packages on component mount
  useEffect(() => {
    fetchPackages();
  }, []);

  // Fetch events
  const getEventsData = async () => {
    setLoadingEvents(true);
    try {
      const data = await fetchEvents();
      setEvents(data || []);
    } catch (error) {
      setError('Failed to load events data');
      toast.error('Failed to load events data');
    } finally {
      setLoadingEvents(false);
    }
  };

  // Fetch registrations
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const registrationsData = await fetchRegistrations();
        setRegistrations(registrationsData || []);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    getBrandsData();
    getEventsData();
  }, []);

  // Filter registrations
  const filtered = useMemo(() => {
    if (loading) return [];

    const q = query.trim().toLowerCase();
    return registrations
      .filter((r) =>
        statusFilter === 'All' ? true : r.registrationStatus === statusFilter
      )
      .filter((r) => {
        if (!q) return true;
        const brand = brandsById.get(r.brandId);
        const event = eventsById.get(r.eventId);
        const packages = r.packages || [{ packageTier: r.packageTier }];
        const packageText = packages.map((p) => p.packageTier).join(' ');

        const haystack = [
          event?.title,
          brand?.businessName,
          brand?.category,
          brand?.primaryContact?.name,
          brand?.primaryContact?.email,
          packageText,
          r.notes,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(q);
      });
  }, [registrations, statusFilter, query, brandsById, eventsById, loading]);

  // Registration statistics
  const stats = useMemo(() => {
    if (loading) return { total: 0, registered: 0, attended: 0, totalPax: 0 };

    const total = registrations.length;
    const registered = registrations.filter(
      (r) => r.registrationStatus === 'Registered'
    ).length;
    const attended = registrations.filter(
      (r) => r.registrationStatus === 'Attended'
    ).length;

    // Calculate total pax from packages
    const totalPax = registrations.reduce((s, r) => {
      const packages = r.packages || [
        {
          packageId: r.packageId,
          pax: r.pax, // fallback for old format
        },
      ];

      return (
        s +
        packages.reduce((sum, p) => {
          // If it's new format with packageId, get includedPax from package
          if (p.packageId && packagesById.has(p.packageId)) {
            return sum + packagesById.get(p.packageId).includedPax;
          }
          // Fallback for old format
          return sum + (p.pax || 0);
        }, 0)
      );
    }, 0);

    return { total, registered, attended, totalPax };
  }, [registrations, loading, packagesById]);

  const openCreate = () => {
    setEditingId(null);
    form.reset(emptyFormValues());
    setFormDialogOpen(true);
  };

  const openEdit = (r) => {
    setEditingId(r._id);
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
      // Calculate total pax from selected packages
      const totalPax = values.packages.reduce((sum, p) => {
        const pkg = packagesById.get(p.packageId);
        return sum + (pkg?.includedPax || 0);
      }, 0);

      const registrationData = {
        brandId: values.brandId,
        eventId: values.eventId,
        packages: values.packages.map((p) => ({
          packageId: p.packageId,
          packageTier: p.packageTier,
        })),
        // Keep single fields for backward compatibility
        packageId: values.packages[0]?.packageId,
        packageTier: values.packages[0]?.packageTier,
        pax: totalPax,
        registrationStatus: values.registrationStatus,
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
          prev.map((r) => (r._id === editingId ? updatedRegistration : r))
        );
        toast.success('Registration updated successfully');
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
      toast.error(`Error: ${err.message || 'Failed to save registration'}`);
      console.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiDeleteRegistration(id);
      setRegistrations((prev) => prev.filter((r) => r._id !== id));
      toast.success('Registration deleted successfully');
    } catch (err) {
      toast.error('Failed to delete registration');
      console.error('Delete error:', err);
    }
  };

  const currentViewReg = viewingRegistration
    ? (registrations.find((r) => r._id === viewingRegistration._id) ?? null)
    : null;

  if (error) {
    return (
      <div className="space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground lg:text-3xl">
              Event Registrations
            </h1>
            <p className="text-muted-foreground">
              Manage business registrations for upcoming events.
            </p>
          </div>
          <Button
            variant="default"
            onClick={openCreate}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add registration
          </Button>
        </header>

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
              <p className="mt-2 text-sm text-red-700">
                Failed to load registration data. Please try again or add new
                registrations.
              </p>
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground lg:text-3xl">
            Event Registrations
          </h1>
          <p className="text-muted-foreground">
            Manage business registrations, package tiers, and attendance status.
          </p>
        </div>
        <Button
          variant="default"
          onClick={openCreate}
          disabled={loading}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add registration
        </Button>
      </header>

      {/* Dashboard Cards - Registration Focused */}
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
                  Total Registrations
                </CardTitle>
                <div className="rounded-lg bg-primary/10 p-2">
                  <Users className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="font-display text-2xl font-bold text-foreground">
                  {stats.total}
                </p>
                <p className="text-xs text-muted-foreground">
                  All registration records
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Confirmed
                </CardTitle>
                <div className="rounded-lg bg-green-100 p-2">
                  <UserCheck className="h-4 w-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="font-display text-2xl font-bold text-foreground">
                  {stats.registered}
                </p>
                <p className="text-xs text-muted-foreground">
                  Status: Registered
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Attended
                </CardTitle>
                <div className="rounded-lg bg-blue-100 p-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="font-display text-2xl font-bold text-foreground">
                  {stats.attended}
                </p>
                <p className="text-xs text-muted-foreground">
                  Status: Attended
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Pax
                </CardTitle>
                <div className="rounded-lg bg-purple-100 p-2">
                  <Users className="h-4 w-4 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="font-display text-2xl font-bold text-foreground">
                  {stats.totalPax}
                </p>
                <p className="text-xs text-muted-foreground">
                  Seats registered
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </section>

      {/* Registrations Table */}
      <section className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search business, event, package..."
              className="pl-9"
              disabled={loading}
            />
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v)}
              disabled={loading}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All statuses</SelectItem>
                {registrationStatuses.map((s) => (
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
                  <TableHead>Event</TableHead>
                  <TableHead>Packages</TableHead>
                  <TableHead>Total Pax</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
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
                  {query || statusFilter !== 'All'
                    ? 'Try adjusting your search or filters'
                    : 'Get started by adding your first registration'}
                </p>
                {!query && statusFilter === 'All' && (
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
                  <TableHead>Event</TableHead>
                  <TableHead>Packages</TableHead>
                  <TableHead>Total Pax</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => {
                  const brand = brandsById.get(r.brandId);
                  const event = eventsById.get(r.eventId);
                  const packages = r.packages || [
                    {
                      packageId: r.packageId,
                      packageTier: r.packageTier,
                    },
                  ];

                  // Calculate total pax from packages
                  const totalPax = packages.reduce((sum, p) => {
                    if (p.packageId && packagesById.has(p.packageId)) {
                      return sum + packagesById.get(p.packageId).includedPax;
                    }
                    return sum + (r.pax || 0); // fallback for old format
                  }, 0);

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
                          {brand?.primaryContact?.name && (
                            <div className="text-xs text-muted-foreground">
                              {brand.primaryContact.name}
                            </div>
                          )}
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
                          {packages.map((pkg, idx) => {
                            const pkgDetails = packagesById.get(pkg.packageId);
                            return (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="capitalize mr-1"
                              >
                                {pkg.packageTier} (
                                {pkgDetails?.includedPax || r.pax || 0} pax)
                              </Badge>
                            );
                          })}
                        </div>
                      </TableCell>
                      <TableCell>{totalPax}</TableCell>
                      <TableCell>
                        <Badge
                          variant={badgeForRegistration(r.registrationStatus)}
                        >
                          {r.registrationStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {r?.createdAt
                            ? format(new Date(r.createdAt), 'MMM d, yyyy')
                            : 'N/A'}
                        </div>
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
                                  from the system.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => handleDelete(r._id)}
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
        <DialogContent className="sm:max-w-lg">
          {currentViewReg && (
            <>
              <DialogHeader className="flex flex-row items-center justify-between">
                <div>
                  <DialogTitle className="text-xl">
                    Registration Details
                  </DialogTitle>
                  <DialogDescription className="mt-1">
                    View registration information
                  </DialogDescription>
                </div>
                <DialogClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </DialogClose>
              </DialogHeader>

              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Business</p>
                    <p className="font-medium caret-pink-600 capitalize">
                      {(() => {
                        if (
                          typeof currentViewReg.brandId === 'object' &&
                          currentViewReg.brandId?.businessName
                        ) {
                          return currentViewReg.brandId.businessName;
                        }
                        const brand = brandsById.get(currentViewReg.brandId);
                        return brand?.businessName || 'Unknown Business';
                      })()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Event</p>
                    <p className="font-medium capitalize caret-pink-700">
                      {(() => {
                        if (currentViewReg.eventName) {
                          return currentViewReg.eventName;
                        }
                        if (
                          typeof currentViewReg.eventId === 'object' &&
                          currentViewReg.eventId?.title
                        ) {
                          return currentViewReg.eventId.title;
                        }
                        const event = eventsById.get(currentViewReg.eventId);
                        return event?.title || 'Unknown Event';
                      })()}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Packages</p>
                  <div className="space-y-2 mt-1">
                    {(
                      currentViewReg.packages || [
                        {
                          packageId: currentViewReg.packageId,
                          packageTier: currentViewReg.packageTier,
                        },
                      ]
                    ).map((pkg, idx) => {
                      const pkgDetails = packagesById.get(pkg.packageId);
                      return (
                        <div key={idx} className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {pkg.packageTier}
                          </Badge>
                          <span className="text-sm">
                            {pkgDetails?.includedPax || currentViewReg.pax || 0}{' '}
                            pax
                          </span>
                          {pkgDetails?.price && (
                            <span className="text-xs text-muted-foreground">
                              Ksh{pkgDetails.price}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge
                    variant={badgeForRegistration(
                      currentViewReg.registrationStatus
                    )}
                  >
                    {currentViewReg.registrationStatus}
                  </Badge>
                </div>

                {currentViewReg.notes && (
                  <div>
                    <p className="text-xs text-muted-foreground">Notes</p>
                    <p className="text-sm mt-1 p-2 bg-muted rounded">
                      {currentViewReg.notes}
                    </p>
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  <p>Recorded by: {currentViewReg.recordedBy || 'System'}</p>
                  <p>
                    Created:{' '}
                    {format(new Date(currentViewReg.createdAt), 'PPpp')}
                  </p>
                  <p>
                    Updated:{' '}
                    {format(new Date(currentViewReg.updatedAt), 'PPpp')}
                  </p>
                </div>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Close</Button>
                  </DialogClose>
                  <Button
                    onClick={() => {
                      setDetailDialogOpen(false);
                      openEdit(currentViewReg);
                    }}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Registration
                  </Button>
                </DialogFooter>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Registration Form Dialog */}
      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Registration' : 'Add Registration'}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Update registration details.'
                : 'Register a business for an event.'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                              <SelectItem key={b._id} value={b._id}>
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
                  name="eventId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={loadingEvents || isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select event" />
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
                              No events available
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Packages Section - Using DB packages, no manual pax input */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-base">Packages</FormLabel>
                  {packages.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const firstPackage = packages[0];
                        append({
                          packageId: firstPackage._id,
                          packageTier: firstPackage.name,
                        });
                      }}
                      disabled={isSubmitting || isFetching}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Package
                    </Button>
                  )}
                </div>

                {isFetching ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : packages.length === 0 ? (
                  <div className="text-center py-6 border border-dashed rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      No packages available.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Please create packages first.
                    </p>
                  </div>
                ) : fields.length === 0 ? (
                  <div className="text-center py-6 border border-dashed rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      No packages added yet.
                    </p>
                    <Button
                      type="button"
                      variant="link"
                      onClick={() => {
                        const firstPackage = packages[0];
                        append({
                          packageId: firstPackage._id,
                          packageTier: firstPackage.name,
                        });
                      }}
                      className="mt-2"
                    >
                      Add your first package
                    </Button>
                  </div>
                ) : (
                  fields.map((field, index) => {
                    const selectedPackageId = form.watch(
                      `packages.${index}.packageId`
                    );
                    const selectedPackage = selectedPackageId
                      ? packagesById.get(selectedPackageId)
                      : null;

                    return (
                      <div
                        key={field.id}
                        className="space-y-4 p-4 border rounded-lg relative"
                      >
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => remove(index)}
                            disabled={isSubmitting}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}

                        <h4 className="font-medium text-sm">
                          Package {index + 1}
                        </h4>

                        <FormField
                          control={form.control}
                          name={`packages.${index}.packageId`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Package Tier</FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                                disabled={isSubmitting}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select package" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {packages.map((pkg) => (
                                    <SelectItem key={pkg._id} value={pkg._id}>
                                      {pkg.name} - Ksh{pkg.price} (
                                      {pkg.includedPax} pax)
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {selectedPackage && (
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Included Pax
                              </p>
                              <p className="font-medium">
                                {selectedPackage.includedPax} seats
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Price
                              </p>
                              <p className="font-medium">
                                Ksh{selectedPackage.price}
                              </p>
                            </div>
                            {selectedPackage.benefits &&
                              selectedPackage.benefits.length > 0 && (
                                <div className="col-span-2">
                                  <p className="text-xs text-muted-foreground mb-1">
                                    Benefits
                                  </p>
                                  <ul className="text-xs list-disc list-inside">
                                    {selectedPackage.benefits
                                      .slice(0, 2)
                                      .map((benefit, i) => (
                                        <li
                                          key={i}
                                          className="text-muted-foreground"
                                        >
                                          {benefit}
                                        </li>
                                      ))}
                                    {selectedPackage.benefits.length > 2 && (
                                      <li className="text-muted-foreground">
                                        +{selectedPackage.benefits.length - 2}{' '}
                                        more
                                      </li>
                                    )}
                                  </ul>
                                </div>
                              )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <FormField
                control={form.control}
                name="registrationStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registration Status</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
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
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Special requests, seating notes, etc."
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
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
                  disabled={
                    isSubmitting || packages.length === 0 || fields.length === 0
                  }
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
        </DialogContent>
      </Dialog>
    </div>
  );
}
