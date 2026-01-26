'use client';
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Building2,
  Pencil,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  SheetClose,
} from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export const initialBrands = [
  {
    id: 'b1',
    businessName: 'Kujali Foods',
    category: 'Food & Beverage',
    website: 'https://example.com',
    city: 'Nairobi',
    country: 'Kenya',
    status: 'Active',
    tags: ['SME', 'Awards'],
    notes: 'Interested in sponsoring Q2 awards gala.',
    primaryContact: {
      name: 'Sarah Kimani',
      title: 'CEO',
      email: 'sarah@kujalifoods.co.ke',
      phone: '+254 700 000 000',
    },
    secondaryContact: {
      name: 'Peter Otieno',
      title: 'Marketing Lead',
      email: 'peter@kujalifoods.co.ke',
      phone: '+254 711 111 111',
    },
    createdAt: '2024-02-12T10:15:00.000Z',
  },
  {
    id: 'b2',
    businessName: 'Uhuru Bank',
    category: 'Financial Services',
    city: 'Nairobi',
    country: 'Kenya',
    status: 'Prospect',
    tags: ['Corporate', 'Gala'],
    primaryContact: {
      name: 'Amina Hassan',
      title: 'Marketing Director',
      email: 'amina@uhurubank.co.ke',
      phone: '+254 722 222 222',
    },
    createdAt: '2024-03-01T08:00:00.000Z',
  },
  {
    id: 'b3',
    businessName: 'Tech Solutions Ltd',
    category: 'Technology',
    city: 'Mombasa',
    country: 'Kenya',
    status: 'Active',
    tags: ['Startup', 'Innovation'],
    primaryContact: {
      name: 'James Mwangi',
      title: 'CTO',
      email: 'james@techsolutions.co.ke',
      phone: '+254 733 333 333',
    },
    createdAt: '2024-03-15T09:00:00.000Z',
  },
  {
    id: 'b4',
    businessName: 'Green Energy Corp',
    category: 'Renewable Energy',
    city: 'Nakuru',
    country: 'Kenya',
    status: 'Prospect',
    tags: ['Green', 'Sustainability'],
    primaryContact: {
      name: 'Lisa Wangari',
      title: 'Operations Director',
      email: 'lisa@greenenergy.co.ke',
      phone: '+254 744 444 444',
    },
    createdAt: '2024-03-20T11:30:00.000Z',
  },
  {
    id: 'b5',
    businessName: 'Urban Logistics',
    category: 'Transport & Logistics',
    city: 'Nairobi',
    country: 'Kenya',
    status: 'Active',
    tags: ['Logistics', 'Delivery'],
    primaryContact: {
      name: 'David Omondi',
      title: 'CEO',
      email: 'david@urbanlogistics.co.ke',
      phone: '+254 755 555 555',
    },
    createdAt: '2024-03-25T14:45:00.000Z',
  },
  {
    id: 'b6',
    businessName: 'MediCare Solutions',
    category: 'Healthcare',
    city: 'Kisumu',
    country: 'Kenya',
    status: 'Do not contact',
    tags: ['Healthcare', 'Pharma'],
    primaryContact: {
      name: 'Dr. Susan Atieno',
      title: 'Medical Director',
      email: 'susan@medicare.co.ke',
      phone: '+254 766 666 666',
    },
    createdAt: '2024-04-01T10:00:00.000Z',
  },
  {
    id: 'b7',
    businessName: 'Artisan Crafts Kenya',
    category: 'Retail & Crafts',
    city: 'Eldoret',
    country: 'Kenya',
    status: 'Active',
    tags: ['Handmade', 'Local'],
    primaryContact: {
      name: 'John Kamau',
      title: 'Owner',
      email: 'john@artisancrafts.co.ke',
      phone: '+254 777 777 777',
    },
    createdAt: '2024-04-05T08:30:00.000Z',
  },
  {
    id: 'b8',
    businessName: 'Digital Marketing Pro',
    category: 'Marketing Agency',
    city: 'Nairobi',
    country: 'Kenya',
    status: 'Prospect',
    tags: ['Digital', 'Agency'],
    primaryContact: {
      name: 'Grace Wanjiku',
      title: 'Marketing Director',
      email: 'grace@digitalpro.co.ke',
      phone: '+254 788 888 888',
    },
    createdAt: '2024-04-10T13:15:00.000Z',
  },
];

const statusOptions = ['Prospect', 'Active', 'Do not contact'];

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Contact name is required').max(120),
  title: z.string().trim().max(120).optional().or(z.literal('')),
  email: z.string().trim().email('Invalid email').max(255),
  phone: z.string().trim().min(5, 'Phone is required').max(40),
});

const brandSchema = z.object({
  businessName: z.string().trim().min(2, 'Business name is required').max(160),
  category: z.string().trim().min(2, 'Category is required').max(120),
  website: z
    .string()
    .trim()
    .url('Invalid website URL')
    .max(255)
    .optional()
    .or(z.literal('')),
  address: z.string().trim().max(255).optional().or(z.literal('')),
  city: z.string().trim().max(120).optional().or(z.literal('')),
  country: z.string().trim().max(120).optional().or(z.literal('')),
  status: z.enum(['Prospect', 'Active', 'Do not contact']),
  tagsCsv: z.string().trim().max(300).optional().or(z.literal('')),
  notes: z.string().trim().max(1000).optional().or(z.literal('')),
  primaryContact: contactSchema,
  secondaryContactEnabled: z.boolean().default(false),
  secondaryContact: contactSchema.partial().optional(),
});

function toTags(csv) {
  if (!csv) return [];
  return csv
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function statusBadgeVariant(status) {
  switch (status) {
    case 'Active':
      return 'default';
    case 'Prospect':
      return 'secondary';
    case 'Do not contact':
      return 'outline';
    default:
      return 'secondary';
  }
}

function emptyFormValues() {
  return {
    businessName: '',
    category: '',
    website: '',
    address: '',
    city: '',
    country: '',
    status: 'Prospect',
    tagsCsv: '',
    notes: '',
    primaryContact: {
      name: '',
      title: '',
      email: '',
      phone: '',
    },
    secondaryContactEnabled: false,
    secondaryContact: {
      name: '',
      title: '',
      email: '',
      phone: '',
    },
  };
}

function brandToFormValues(brand) {
  return {
    businessName: brand.businessName,
    category: brand.category,
    website: brand.website ?? '',
    address: brand.address ?? '',
    city: brand.city ?? '',
    country: brand.country ?? '',
    status: brand.status,
    tagsCsv: brand.tags.join(', '),
    notes: brand.notes ?? '',
    primaryContact: {
      name: brand.primaryContact.name,
      title: brand.primaryContact.title ?? '',
      email: brand.primaryContact.email,
      phone: brand.primaryContact.phone,
    },
    secondaryContactEnabled: !!brand.secondaryContact,
    secondaryContact: {
      name: brand.secondaryContact?.name ?? '',
      title: brand.secondaryContact?.title ?? '',
      email: brand.secondaryContact?.email ?? '',
      phone: brand.secondaryContact?.phone ?? '',
    },
  };
}

// Function to prepare data for backend
function prepareDataForBackend(values, editingId) {
  const tags = toTags(values.tagsCsv);
  const secondaryEnabled = values.secondaryContactEnabled;
  const secondary = secondaryEnabled
    ? {
        name: (values.secondaryContact?.name ?? '').trim(),
        title: (values.secondaryContact?.title ?? '') || undefined,
        email: (values.secondaryContact?.email ?? '').trim(),
        phone: (values.secondaryContact?.phone ?? '').trim(),
      }
    : undefined;

  const backendData = {
    // Common fields for both create and update
    businessName: values.businessName,
    category: values.category,
    website: values.website || null,
    address: values.address || null,
    city: values.city || null,
    country: values.country || null,
    status: values.status,
    tags: tags,
    notes: values.notes || null,
    primaryContact: {
      name: values.primaryContact.name,
      title: values.primaryContact.title || null,
      email: values.primaryContact.email,
      phone: values.primaryContact.phone,
    },
    secondaryContact:
      secondary?.email && secondary?.phone && secondary?.name
        ? secondary
        : null,
  };

  // Add operation type for the backend
  if (editingId) {
    backendData.id = editingId;
    backendData.operation = 'update';
  } else {
    backendData.operation = 'create';
  }

  return backendData;
}

// Skeleton loading component for table
function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center space-x-3 p-3 border rounded-lg"
        >
          <div className="h-10 w-10 rounded-lg bg-muted animate-pulse flex-shrink-0" />
          <div className="space-y-2 flex-1 min-w-0">
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
            <div className="h-3 w-24 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-6 w-20 bg-muted rounded animate-pulse flex-shrink-0" />
          <div className="h-4 w-24 bg-muted rounded animate-pulse hidden md:block flex-shrink-0" />
          <div className="space-y-1 flex-1 min-w-0 hidden sm:block">
            <div className="h-4 w-28 bg-muted rounded animate-pulse" />
            <div className="h-3 w-32 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-8 w-16 bg-muted rounded animate-pulse flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}

// Mobile-friendly form skeleton
function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="h-4 w-32 bg-muted rounded animate-pulse" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="h-4 w-20 bg-muted rounded animate-pulse" />
            <div className="h-10 w-full bg-muted rounded animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-20 bg-muted rounded animate-pulse" />
            <div className="h-10 w-full bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="h-4 w-32 bg-muted rounded animate-pulse" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="h-4 w-20 bg-muted rounded animate-pulse" />
            <div className="h-10 w-full bg-muted rounded animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-20 bg-muted rounded animate-pulse" />
            <div className="h-10 w-full bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminBrands() {
  const [brands, setBrands] = React.useState(() => initialBrands);
  const [query, setQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('All');
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const itemsPerPage = 5;

  const form = useForm({
    resolver: zodResolver(brandSchema),
    defaultValues: emptyFormValues(),
    mode: 'onBlur',
  });

  // Simulate loading
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return brands
      .filter((b) =>
        statusFilter === 'All' ? true : b.status === statusFilter
      )
      .filter((b) => {
        if (!q) return true;
        const haystack = [
          b.businessName,
          b.category,
          b.primaryContact.name,
          b.primaryContact.email,
          b.primaryContact.phone,
          b.tags.join(' '),
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(q);
      });
  }, [brands, query, statusFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedBrands = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const openCreate = () => {
    setEditingId(null);
    form.reset(emptyFormValues());
    setSheetOpen(true);
  };

  const openEdit = (brand) => {
    setEditingId(brand.id);
    form.reset(brandToFormValues(brand));
    setSheetOpen(true);
  };

  const onSubmit = async (values) => {
    setIsSubmitting(true);

    // Prepare data for backend
    const backendData = prepareDataForBackend(values, editingId);

    // Console log the data being sent to backend
    console.log('📤 Sending to backend:', JSON.stringify(backendData, null, 2));

    // Also log in a more readable format for debugging
    console.group('🚀 Form Submission Data');
    console.log('Operation:', backendData.operation);
    console.log('Business Name:', backendData.businessName);
    console.log('Category:', backendData.category);
    console.log('Status:', backendData.status);
    console.log('Primary Contact:', backendData.primaryContact);
    console.log('Secondary Contact:', backendData.secondaryContact);
    console.log('Tags:', backendData.tags);
    console.log('Notes length:', backendData.notes?.length || 0, 'characters');
    console.groupEnd();

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const tags = toTags(values.tagsCsv);
      const now = new Date().toISOString();
      const secondaryEnabled = values.secondaryContactEnabled;
      const secondary = secondaryEnabled
        ? {
            name: (values.secondaryContact?.name ?? '').trim(),
            title: (values.secondaryContact?.title ?? '') || undefined,
            email: (values.secondaryContact?.email ?? '').trim(),
            phone: (values.secondaryContact?.phone ?? '').trim(),
          }
        : undefined;

      if (editingId) {
        setBrands((prev) =>
          prev.map((b) =>
            b.id === editingId
              ? {
                  ...b,
                  businessName: values.businessName,
                  category: values.category,
                  website: values.website || undefined,
                  address: values.address || undefined,
                  city: values.city || undefined,
                  country: values.country || undefined,
                  status: values.status,
                  tags,
                  notes: values.notes || undefined,
                  primaryContact: {
                    name: values.primaryContact.name,
                    title: values.primaryContact.title || undefined,
                    email: values.primaryContact.email,
                    phone: values.primaryContact.phone,
                  },
                  secondaryContact:
                    secondary?.email && secondary?.phone && secondary?.name
                      ? secondary
                      : undefined,
                }
              : b
          )
        );
        console.log('✅ Brand updated successfully:', values.businessName);
      } else {
        const newBrand = {
          id: `b_${Date.now()}_${Math.random().toString(16).slice(2)}`,
          businessName: values.businessName,
          category: values.category,
          website: values.website || undefined,
          address: values.address || undefined,
          city: values.city || undefined,
          country: values.country || undefined,
          status: values.status,
          tags,
          notes: values.notes || undefined,
          primaryContact: {
            name: values.primaryContact.name,
            title: values.primaryContact.title || undefined,
            email: values.primaryContact.email,
            phone: values.primaryContact.phone,
          },
          secondaryContact:
            secondary?.email && secondary?.phone && secondary?.name
              ? secondary
              : undefined,
          createdAt: now,
        };
        setBrands((prev) => [newBrand, ...prev]);
        console.log('✅ Brand created successfully:', values.businessName);
      }
    } catch (error) {
      console.error('❌ Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
      setSheetOpen(false);
    }
  };

  const secondaryEnabled = form.watch('secondaryContactEnabled');

  // Pagination handlers
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Reset page when filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [query, statusFilter]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground lg:text-3xl">
            Brands
          </h1>
          <p className="text-muted-foreground">
            Register businesses and keep contact details ready for events.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="hero"
            onClick={openCreate}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            size="default"
          >
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Register Brand</span>
            <span className="sm:hidden">Add Brand</span>
          </Button>
        </div>
      </header>

      <section className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search business, category, contact, tags..."
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v)}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All statuses</SelectItem>
                {statusOptions.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          {isLoading ? (
            <TableSkeleton />
          ) : (
            <>
              <div className="min-w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[180px]">Business</TableHead>
                      <TableHead className="min-w-[100px]">Status</TableHead>
                      <TableHead className="min-w-[120px] hidden md:table-cell">
                        Category
                      </TableHead>
                      <TableHead className="min-w-[160px]">
                        Primary contact
                      </TableHead>
                      <TableHead className="min-w-[120px] hidden lg:table-cell">
                        Tags
                      </TableHead>
                      <TableHead className="text-right min-w-[90px]">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedBrands.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="py-10 text-center text-sm text-muted-foreground"
                        >
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Building2 className="h-8 w-8 text-muted-foreground" />
                            <p>No brands found. Try a different search.</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={openCreate}
                              className="mt-2"
                            >
                              <Plus className="mr-2 h-3 w-3" />
                              Add your first brand
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedBrands.map((b) => (
                        <TableRow
                          key={b.id}
                          className="hover:bg-muted/50 transition-colors"
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 shadow-sm">
                                <Building2 className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="min-w-0">
                                <div
                                  className="font-medium text-foreground truncate"
                                  title={b.businessName}
                                >
                                  {b.businessName}
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {b.city || b.country
                                    ? [b.city, b.country]
                                        .filter(Boolean)
                                        .join(', ')
                                    : '—'}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={statusBadgeVariant(b.status)}
                              className={cn(
                                'font-medium text-xs',
                                b.status === 'Active' &&
                                  'bg-green-100 text-green-800 hover:bg-green-100 border-green-200',
                                b.status === 'Prospect' &&
                                  'bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200',
                                b.status === 'Do not contact' &&
                                  'bg-red-100 text-red-800 hover:bg-red-100 border-red-200'
                              )}
                            >
                              {b.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <span
                              className="text-sm text-foreground"
                              title={b.category}
                            >
                              {b.category}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-0.5">
                              <div
                                className="text-sm font-medium text-foreground truncate"
                                title={b.primaryContact.name}
                              >
                                {b.primaryContact.name}
                              </div>
                              <div
                                className="text-xs text-muted-foreground truncate"
                                title={b.primaryContact.email}
                              >
                                {b.primaryContact.email}
                              </div>
                              <div
                                className="text-xs text-muted-foreground truncate"
                                title={b.primaryContact.phone}
                              >
                                {b.primaryContact.phone}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="flex flex-wrap gap-1">
                              {b.tags.length === 0 ? (
                                <span className="text-xs text-muted-foreground">
                                  —
                                </span>
                              ) : (
                                b.tags.slice(0, 3).map((t) => (
                                  <span
                                    key={t}
                                    className="rounded-md bg-gradient-to-r from-blue-50 to-purple-50 px-2 py-0.5 text-xs text-blue-700 border border-blue-100 truncate max-w-[100px]"
                                    title={t}
                                  >
                                    {t}
                                  </span>
                                ))
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEdit(b)}
                              className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 shadow-sm"
                            >
                              <Pencil className="h-4 w-4 sm:mr-2" />
                              <span className="hidden sm:inline">Edit</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              {filtered.length > itemsPerPage && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border px-2 sm:px-4 py-3 mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing{' '}
                    <span className="font-medium">
                      {(currentPage - 1) * itemsPerPage + 1}
                    </span>{' '}
                    to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, filtered.length)}
                    </span>{' '}
                    of <span className="font-medium">{filtered.length}</span>{' '}
                    results
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className="h-8 px-2 sm:px-3 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden sm:inline ml-1">Previous</span>
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <Button
                              key={pageNum}
                              variant={
                                currentPage === pageNum ? 'default' : 'outline'
                              }
                              size="sm"
                              onClick={() => goToPage(pageNum)}
                              className={cn(
                                'h-8 w-8 p-0 sm:p-2',
                                currentPage === pageNum
                                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm'
                                  : 'border-blue-200 hover:bg-blue-50'
                              )}
                            >
                              {pageNum}
                            </Button>
                          );
                        }
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className="h-8 px-2 sm:px-3 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                    >
                      <span className="hidden sm:inline mr-1">Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md md:max-w-lg lg:max-w-xl p-0 sm:p-0 h-full flex flex-col"
        >
          {/* Fixed Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background px-4 py-3 sm:px-6 sm:py-4">
            <div className="min-w-0">
              <SheetTitle className="text-lg font-semibold truncate">
                {editingId ? 'Edit Brand' : 'Register Brand'}
              </SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground mt-1 truncate">
                Save business details and contacts for upcoming events.
              </SheetDescription>
            </div>
            <SheetClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-muted flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </SheetClose>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
            {isSubmitting ? (
              <FormSkeleton />
            ) : (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {/* Business Details Section */}
                  <div className="space-y-4">
                    <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <span className="h-5 w-5 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center text-xs">
                        1
                      </span>
                      Business details
                    </h2>

                    <div className="grid gap-4">
                      <FormField
                        control={form.control}
                        name="businessName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Business name{' '}
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., Valuable Brands Ltd"
                                {...field}
                                className="w-full"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Category <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., Financial Services"
                                {...field}
                                className="w-full"
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
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://"
                                inputMode="url"
                                {...field}
                                className="w-full"
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              Optional
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Status <span className="text-red-500">*</span>
                            </FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {statusOptions.map((s) => (
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

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Street / Building / P.O. Box"
                              {...field}
                              className="w-full"
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Optional
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Nairobi"
                                {...field}
                                className="w-full"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Kenya"
                                {...field}
                                className="w-full"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="tagsCsv"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tags</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Sponsor, SME, Gala"
                              {...field}
                              className="w-full"
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Comma-separated. Used for quick searching.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <textarea
                              className={cn(
                                'min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none'
                              )}
                              placeholder="Anything important about this brand (preferences, past events, constraints...)"
                              {...field}
                              rows={4}
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Optional
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Primary Contact Section */}
                  <div className="space-y-4">
                    <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <span className="h-5 w-5 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center text-xs">
                        2
                      </span>
                      Primary contact <span className="text-red-500">*</span>
                    </h2>
                    <div className="grid gap-4">
                      <FormField
                        control={form.control}
                        name="primaryContact.name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Full name"
                                {...field}
                                className="w-full"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="primaryContact.title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role / Title</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Marketing Manager"
                                {...field}
                                className="w-full"
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              Optional
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="primaryContact.email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="name@company.com"
                                inputMode="email"
                                autoComplete="email"
                                {...field}
                                className="w-full"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="primaryContact.phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="+254 ..."
                                inputMode="tel"
                                autoComplete="tel"
                                {...field}
                                className="w-full"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Secondary Contact Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <span className="h-5 w-5 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center text-xs">
                          3
                        </span>
                        Secondary contact
                      </h2>
                      <button
                        type="button"
                        className={cn(
                          'text-sm font-medium px-3 py-1 rounded-md transition-colors',
                          secondaryEnabled
                            ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                            : 'text-muted-foreground bg-gray-50 hover:bg-gray-100'
                        )}
                        onClick={() =>
                          form.setValue(
                            'secondaryContactEnabled',
                            !secondaryEnabled
                          )
                        }
                      >
                        {secondaryEnabled ? 'Remove' : 'Add'}
                      </button>
                    </div>

                    {secondaryEnabled ? (
                      <div className="rounded-lg border border-blue-100 bg-blue-50/30 p-4 space-y-4">
                        <div className="grid gap-4">
                          <FormField
                            control={form.control}
                            name="secondaryContact.name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Full name"
                                    {...field}
                                    className="w-full"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="secondaryContact.title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Role / Title</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Finance / Procurement"
                                    {...field}
                                    className="w-full"
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
                            name="secondaryContact.email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="name@company.com"
                                    inputMode="email"
                                    {...field}
                                    className="w-full"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="secondaryContact.phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="+254 ..."
                                    inputMode="tel"
                                    {...field}
                                    className="w-full"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground pt-2 border-t border-blue-100">
                          <span className="font-medium">Tip:</span> Fill at
                          least name, email and phone if you want it saved.
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/50 p-6 text-center">
                        <p className="text-sm text-muted-foreground">
                          Add a secondary contact for backup communication
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Form Actions */}
                  <div className="sticky bottom-0 bg-background pt-4 border-t border-border">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setSheetOpen(false)}
                        className="border-gray-300 hover:bg-gray-50"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="default"
                        disabled={isSubmitting}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-300 min-w-[120px]"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-2">
                            <svg
                              className="animate-spin h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Saving...
                          </span>
                        ) : (
                          <span>
                            {editingId ? 'Save changes' : 'Save brand'}
                          </span>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
