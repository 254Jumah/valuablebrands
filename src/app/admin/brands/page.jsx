'use client';
import React, { useState, useEffect } from 'react';
import {
  Building2,
  Pencil,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Save,
  Loader2,
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { addBrand, fetchbrands } from '@/app/lib/action';
import useAuth from '@/app/hooks/useAuth';

// API Configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Status options
const statusOptions = ['Prospect', 'Active', 'Do not contact'];

// ============================================================================
// DATA MODELS AND UTILITIES
// ============================================================================

// Brand data model
const initialBrandForm = {
  // Business Details
  businessName: '',
  category: '',
  website: '',
  address: '',
  city: '',
  country: '',
  status: 'Prospect',
  tags: '',
  notes: '',

  // Primary Contact (Required)
  primaryContactName: '',
  primaryContactTitle: '',
  primaryContactEmail: '',
  primaryContactPhone: '',

  // Secondary Contact (Optional)
  secondaryContactEnabled: false,
  secondaryContactName: '',
  secondaryContactTitle: '',
  secondaryContactEmail: '',
  secondaryContactPhone: '',
};

// Helper to convert tags string to array
const parseTags = (tagsString) => {
  if (!tagsString) return [];
  return tagsString
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
};

// Helper for status badge styling
const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Active':
      return 'bg-green-100 text-green-800 hover:bg-green-100 border-green-200';
    case 'Prospect':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200';
    case 'Do not contact':
      return 'bg-red-100 text-red-800 hover:bg-red-100 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200';
  }
};

// ============================================================================
// API SERVICE - SIMPLIFIED
// ============================================================================

// ============================================================================
// SKELETON COMPONENTS
// ============================================================================

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="flex items-center space-x-3 p-3 border rounded-lg"
        >
          <div className="h-10 w-10 rounded-lg bg-gray-200 animate-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse hidden md:block" />
          <div className="space-y-1 flex-1 hidden sm:block">
            <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AdminBrands() {
  const { email, name, role, id } = useAuth();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState(initialBrandForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [editingBrandId, setEditingBrandId] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  // ============================================================================
  // FORM HANDLERS - SIMPLIFIED
  // ============================================================================

  const openCreateForm = () => {
    setFormData(initialBrandForm);
    setEditingBrandId(null);
    setFormError('');
    setIsFormOpen(true);
  };

  const openEditForm = (brand) => {
    console.log('✏️ EDITING BRAND:', brand);

    setFormData({
      businessName: brand.businessName || '',
      category: brand.category || '',
      website: brand.website || '',
      address: brand.address || '',
      city: brand.city || '',
      country: brand.country || '',
      status: brand.status || 'Prospect',
      tags: (brand.tags || []).join(', ') || '',
      notes: brand.notes || '',

      primaryContactName: brand.primaryContact?.name || '',
      primaryContactTitle: brand.primaryContact?.title || '',
      primaryContactEmail: brand.primaryContact?.email || '',
      primaryContactPhone: brand.primaryContact?.phone || '',

      secondaryContactEnabled: !!brand.secondaryContact,
      secondaryContactName: brand.secondaryContact?.name || '',
      secondaryContactTitle: brand.secondaryContact?.title || '',
      secondaryContactEmail: brand.secondaryContact?.email || '',
      secondaryContactPhone: brand.secondaryContact?.phone || '',
    });

    setEditingBrandId(brand.id);
    setFormError('');
    setIsFormOpen(true);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleSecondaryContact = () => {
    setFormData((prev) => ({
      ...prev,
      secondaryContactEnabled: !prev.secondaryContactEnabled,
    }));
  };

  // ============================================================================
  // VALIDATION AND SUBMISSION
  // ============================================================================

  const validateForm = () => {
    console.log('🔍 VALIDATING FORM DATA...');
    console.log('Form data:', formData);

    // Required fields validation
    if (!formData.businessName.trim()) {
      setFormError('Business name is required');
      return false;
    }

    if (!formData.category.trim()) {
      setFormError('Category is required');
      return false;
    }

    if (!formData.primaryContactName.trim()) {
      setFormError('Primary contact name is required');
      return false;
    }

    if (!formData.primaryContactEmail.trim()) {
      setFormError('Primary contact email is required');
      return false;
    }

    if (!formData.primaryContactPhone.trim()) {
      setFormError('Primary contact phone is required');
      return false;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.primaryContactEmail)) {
      setFormError('Primary contact email is invalid');
      return false;
    }

    // If secondary contact is enabled, validate its fields
    if (formData.secondaryContactEnabled) {
      if (
        !formData.secondaryContactName.trim() ||
        !formData.secondaryContactEmail.trim() ||
        !formData.secondaryContactPhone.trim()
      ) {
        setFormError('Secondary contact requires name, email, and phone');
        return false;
      }

      if (!emailRegex.test(formData.secondaryContactEmail)) {
        setFormError('Secondary contact email is invalid');
        return false;
      }
    }

    console.log('✅ FORM VALIDATION PASSED');
    setFormError('');
    return true;
  };

  const handleSubmit = async () => {
    console.log('🟡 SUBMIT BUTTON CLICKED');

    if (!validateForm()) {
      console.log('❌ FORM VALIDATION FAILED');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      console.log('🔄 STARTING SUBMISSION PROCESS...');

      // Prepare brand data
      const brandData = {
        businessName: formData.businessName,
        category: formData.category,
        website: formData.website || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        country: formData.country || undefined,
        status: formData.status,
        tags: parseTags(formData.tags),
        notes: formData.notes || undefined,
        primaryContact: {
          name: formData.primaryContactName,
          title: formData.primaryContactTitle || undefined,
          email: formData.primaryContactEmail,
          phone: formData.primaryContactPhone,
        },
        secondaryContact: formData.secondaryContactEnabled
          ? {
              name: formData.secondaryContactName,
              title: formData.secondaryContactTitle || undefined,
              email: formData.secondaryContactEmail,
              phone: formData.secondaryContactPhone,
            }
          : undefined,
      };

      if (editingBrandId) {
        // Update existing brand
        console.log(`🔄 UPDATING BRAND ID: ${editingBrandId}`);

        // Call your update API
        const response = await fetch(
          `${API_BASE_URL}/brands/${editingBrandId}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(brandData),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to update brand');
        }

        const updatedBrand = await response.json();

        // Update local state
        setBrands((prev) =>
          prev.map((brand) =>
            brand.id === editingBrandId ? updatedBrand : brand
          )
        );

        toast.success('Brand updated successfully!');
        console.log('✅ BRAND UPDATED');
      } else {
        // Create new brand
        console.log('🆕 CREATING NEW BRAND...');

        // Call your addBrand function from actions
        const newBrand = await addBrand(brandData);

        if (!newBrand) {
          throw new Error('Failed to create brand');
        }

        // Add to local state
        setBrands((prev) => [newBrand, ...prev]);

        toast.success('Brand created successfully!');
        console.log('✅ NEW BRAND CREATED');
      }

      // Close form and reset
      setIsFormOpen(false);
      setFormData(initialBrandForm);
      setEditingBrandId(null);

      console.log('🏁 SUBMISSION COMPLETED SUCCESSFULLY');
    } catch (err) {
      console.error('❌ SUBMISSION ERROR:', err);
      setFormError(`Failed to save: ${err.message}`);
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
      console.log('🟢 SUBMISSION PROCESS ENDED');
    }
  };
  // ============================================================================
  // FILTERING AND PAGINATION
  // ============================================================================

  const filteredBrands = brands.filter((brand) => {
    // Status filter
    if (statusFilter !== 'All' && brand.status !== statusFilter) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const searchable = [
        brand.businessName,
        brand.category,
        brand.primaryContact?.name,
        brand.primaryContact?.email,
        brand.primaryContact?.phone,
        (brand.tags || []).join(' '),
      ]
        .join(' ')
        .toLowerCase();

      return searchable.includes(query);
    }

    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredBrands.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBrands = filteredBrands.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // ============================================================================
  // RENDER
  // ============================================================================
  const getbrandsData = async () => {
    setLoading(true);
    try {
      const data = await fetchbrands();

      setBrands(data || []);

      // Transform data for display
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getbrandsData();
  }, []);
  return (
    <div className="space-y-6">
      {/* Header */}
      <ToastContainer position="top-right" autoClose={3000} />
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold lg:text-3xl">Brands</h1>
          <p className="text-gray-600">
            Register businesses and keep contact details ready for events.
          </p>
        </div>
        <Button
          onClick={openCreateForm}
          className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Register Brand
        </Button>
      </header>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={getbrandsData}
            className="mt-2 border-red-200 text-red-700 hover:bg-red-100"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Search and Filter */}
      <section className="rounded-xl border bg-white p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search brands..."
              className="pl-9"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Brands Table */}
        <div className="mt-4">
          {loading ? (
            <TableSkeleton />
          ) : filteredBrands.length === 0 ? (
            <div className="text-center py-10">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No brands found</p>
              <Button
                variant="outline"
                onClick={openCreateForm}
                className="mt-3"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add First Brand
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Category
                    </TableHead>
                    <TableHead>Primary Contact</TableHead>
                    <TableHead className="hidden lg:table-cell">Tags</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedBrands.map((brand) => (
                    <TableRow key={brand._id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-linear-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {brand?.businessName}
                            </div>
                            <div className="text-sm text-gray-600">
                              {[brand?.city, brand?.country]
                                .filter(Boolean)
                                .join(', ') || '—'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            'font-medium',
                            getStatusBadgeClass(brand.status)
                          )}
                        >
                          {brand.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {brand?.category}
                      </TableCell>
                      <TableCell>
                        {brand?.primaryContact && (
                          <div>
                            <div className="font-medium">
                              {brand?.primaryContact?.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              {brand?.primaryContact?.email}
                            </div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {(brand?.tags || []).slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-md bg-blue-50 px-2 py-1 text-xs text-blue-700"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditForm(brand)}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="hidden sm:inline ml-2">Edit</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {filteredBrands.length > itemsPerPage && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t px-4 py-3 mt-4">
                  <div className="text-sm text-gray-600">
                    Showing {startIndex + 1} to{' '}
                    {Math.min(startIndex + itemsPerPage, filteredBrands.length)}{' '}
                    of {filteredBrands.length}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex gap-1">
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) pageNum = i + 1;
                          else if (currentPage <= 3) pageNum = i + 1;
                          else if (currentPage >= totalPages - 2)
                            pageNum = totalPages - 4 + i;
                          else pageNum = currentPage - 2 + i;

                          return (
                            <Button
                              key={pageNum}
                              variant={
                                currentPage === pageNum ? 'default' : 'outline'
                              }
                              size="sm"
                              onClick={() => goToPage(pageNum)}
                              className={cn(
                                currentPage === pageNum &&
                                  'bg-linear-to-r from-blue-600 to-purple-600 text-white'
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
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Brand Form Sheet */}
      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-xl h-full flex flex-col p-0"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 border-b bg-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle>
                  {editingBrandId ? 'Edit Brand' : 'Register New Brand'}
                </SheetTitle>
                <SheetDescription>
                  {editingBrandId
                    ? 'Update brand details'
                    : 'Add a new business and contact information'}
                </SheetDescription>
              </div>
              <SheetClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-4 w-4" />
                </Button>
              </SheetClose>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {formError && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 font-medium">{formError}</p>
              </div>
            )}

            {/* Business Details Section */}
            <div className="space-y-6">
              <section>
                <h3 className="text-lg font-semibold mb-4">Business Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Business Name *
                    </label>
                    <Input
                      value={formData.businessName}
                      onChange={(e) =>
                        handleInputChange('businessName', e.target.value)
                      }
                      placeholder="Enter business name"
                      className="w-full"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Category *
                      </label>
                      <Input
                        value={formData.category}
                        onChange={(e) =>
                          handleInputChange('category', e.target.value)
                        }
                        placeholder="e.g., Technology, Retail"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Status *
                      </label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) =>
                          handleInputChange('status', value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Website
                      </label>
                      <Input
                        value={formData.website}
                        onChange={(e) =>
                          handleInputChange('website', e.target.value)
                        }
                        placeholder="https://example.com"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Tags
                      </label>
                      <Input
                        value={formData.tags}
                        onChange={(e) =>
                          handleInputChange('tags', e.target.value)
                        }
                        placeholder="Separate with commas"
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        City
                      </label>
                      <Input
                        value={formData.city}
                        onChange={(e) =>
                          handleInputChange('city', e.target.value)
                        }
                        placeholder="City"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Country
                      </label>
                      <Input
                        value={formData.country}
                        onChange={(e) =>
                          handleInputChange('country', e.target.value)
                        }
                        placeholder="Country"
                        className="w-full"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium mb-1">
                        Address
                      </label>
                      <Input
                        value={formData.address}
                        onChange={(e) =>
                          handleInputChange('address', e.target.value)
                        }
                        placeholder="Full address"
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) =>
                        handleInputChange('notes', e.target.value)
                      }
                      placeholder="Additional notes about this brand..."
                      className="w-full min-h-24 rounded-md border px-3 py-2 text-sm"
                      rows={4}
                    />
                  </div>
                </div>
              </section>

              {/* Primary Contact Section */}
              <section>
                <h3 className="text-lg font-semibold mb-4">
                  Primary Contact *
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Name *
                      </label>
                      <Input
                        value={formData.primaryContactName}
                        onChange={(e) =>
                          handleInputChange(
                            'primaryContactName',
                            e.target.value
                          )
                        }
                        placeholder="Full name"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Title
                      </label>
                      <Input
                        value={formData.primaryContactTitle}
                        onChange={(e) =>
                          handleInputChange(
                            'primaryContactTitle',
                            e.target.value
                          )
                        }
                        placeholder="e.g., Marketing Manager"
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Email *
                      </label>
                      <Input
                        value={formData.primaryContactEmail}
                        onChange={(e) =>
                          handleInputChange(
                            'primaryContactEmail',
                            e.target.value
                          )
                        }
                        placeholder="email@company.com"
                        type="email"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Phone *
                      </label>
                      <Input
                        value={formData.primaryContactPhone}
                        onChange={(e) =>
                          handleInputChange(
                            'primaryContactPhone',
                            e.target.value
                          )
                        }
                        placeholder="+254 xxx xxx xxx"
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Secondary Contact Section */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Secondary Contact</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={toggleSecondaryContact}
                  >
                    {formData.secondaryContactEnabled ? 'Remove' : 'Add'}{' '}
                    Secondary Contact
                  </Button>
                </div>

                {formData.secondaryContactEnabled ? (
                  <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Name *
                        </label>
                        <Input
                          value={formData.secondaryContactName}
                          onChange={(e) =>
                            handleInputChange(
                              'secondaryContactName',
                              e.target.value
                            )
                          }
                          placeholder="Full name"
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Title
                        </label>
                        <Input
                          value={formData.secondaryContactTitle}
                          onChange={(e) =>
                            handleInputChange(
                              'secondaryContactTitle',
                              e.target.value
                            )
                          }
                          placeholder="e.g., Finance Director"
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Email *
                        </label>
                        <Input
                          value={formData.secondaryContactEmail}
                          onChange={(e) =>
                            handleInputChange(
                              'secondaryContactEmail',
                              e.target.value
                            )
                          }
                          placeholder="email@company.com"
                          type="email"
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Phone *
                        </label>
                        <Input
                          value={formData.secondaryContactPhone}
                          onChange={(e) =>
                            handleInputChange(
                              'secondaryContactPhone',
                              e.target.value
                            )
                          }
                          placeholder="+254 xxx xxx xxx"
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg">
                    <p className="text-gray-600">No secondary contact added</p>
                  </div>
                )}
              </section>
            </div>
          </div>

          {/* Form Actions */}
          <div className="sticky bottom-0 border-t bg-white px-6 py-4">
            <div className="flex items-center justify-end gap-3">
              <SheetClose asChild>
                <Button variant="outline" disabled={isSubmitting}>
                  Cancel
                </Button>
              </SheetClose>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white min-w-32"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {editingBrandId ? 'Update Brand' : 'Save Brand'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
