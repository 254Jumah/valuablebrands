'use client';
import React, { useState, useEffect, useMemo } from 'react';
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
  Eye,
  Trash2,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  addBrand,
  fetchbrands,
  updateBrandAction,
  deleteBrandAction,
} from '@/app/lib/action';
import useAuth from '@/app/hooks/useAuth';
import { ScrollArea } from '@/components/ui/scroll-area';

// API Configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Default status options (will be enriched from brands data)
const defaultStatusOptions = ['Prospect', 'Active', 'Do not contact'];

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
          <div className="space-y-1 flex-1 hidden sm:block">
            <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// VIEW MODAL COMPONENT
// ============================================================================

function ViewBrandModal({ brand, isOpen, onClose }) {
  if (!brand) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {brand.businessName}
          </DialogTitle>
          <DialogDescription>
            Brand details and contact information
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-125 w-full rounded-md border">
          <div className="space-y-6 py-4">
            {/* Business Details */}

            <section>
              <h3 className="font-semibold text-lg mb-3 pb-2 border-b">
                Business Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Business Name</p>
                  <p className="font-medium">{brand.businessName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium">{brand.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge
                    className={cn('mt-1', getStatusBadgeClass(brand.status))}
                  >
                    {brand.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Website</p>
                  <p className="font-medium">{brand.website || '—'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">
                    {[brand.address, brand.city, brand.country]
                      .filter(Boolean)
                      .join(', ') || '—'}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">Tags</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {(brand.tags || []).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-blue-50 px-2 py-1 text-xs text-blue-700"
                      >
                        {tag}
                      </span>
                    ))}
                    {(!brand.tags || brand.tags.length === 0) && (
                      <span className="text-gray-400">No tags</span>
                    )}
                  </div>
                </div>
                {brand.notes && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500">Notes</p>
                    <p className="font-medium mt-1 whitespace-pre-wrap">
                      {brand.notes}
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Primary Contact */}
            <section>
              <h3 className="font-semibold text-lg mb-3 pb-2 border-b">
                Primary Contact
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{brand.primaryContactName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Title</p>
                  <p className="font-medium">
                    {brand.primaryContactTitle || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{brand.primaryContactEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{brand.primaryContactPhone}</p>
                </div>
              </div>
            </section>

            {/* Secondary Contact */}
            {brand.secondaryContact && (
              <section>
                <h3 className="font-semibold text-lg mb-3 pb-2 border-b">
                  Secondary Contact
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{brand.secondaryContact.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Title</p>
                    <p className="font-medium">
                      {brand.secondaryContact.title || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">
                      {brand.secondaryContact.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">
                      {brand.secondaryContact.phone}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* Metadata */}
            <section>
              <h3 className="font-semibold text-lg mb-3 pb-2 border-b">
                Metadata
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Registered By</p>
                  <p className="font-medium">{brand.recordedBy || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Registered Date</p>
                  <p className="font-medium">
                    {brand.createdAt
                      ? new Date(brand.createdAt).toLocaleDateString()
                      : '—'}
                  </p>
                </div>
              </div>
            </section>
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// DELETE MODAL COMPONENT
// ============================================================================

function DeleteBrandModal({ brand, isOpen, onClose, onConfirm }) {
  const [deleteReason, setDeleteReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteReason.trim()) {
      toast.error('Please provide a reason for deletion');
      return;
    }

    setIsDeleting(true);
    try {
      await onConfirm(brand._id || brand.id, deleteReason);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-600 flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Delete Brand
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{' '}
            <strong>{brand?.businessName}</strong>? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">
              <strong>Warning:</strong> Deleting this brand will permanently
              remove all associated data.
            </p>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium">
              Reason for deletion *
            </label>
            <textarea
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              placeholder="Please explain why you are deleting this brand..."
              className="w-full min-h-32 rounded-md border px-3 py-2 text-sm"
              rows={4}
            />
            <p className="text-xs text-gray-500">
              This helps us improve our processes. Minimum 10 characters.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={
              isDeleting ||
              !deleteReason.trim() ||
              deleteReason.trim().length < 10
            }
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Brand
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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

  // View/Delete Modals
  const [viewingBrand, setViewingBrand] = useState(null);
  const [deletingBrand, setDeletingBrand] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const getbrandsData = async () => {
    setLoading(true);
    try {
      const data = await fetchbrands();
      setBrands(data || []);
    } catch (error) {
      console.error('Failed to fetch brands:', error);
      setError('Failed to load brands data');
      toast.error('Failed to load brands data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getbrandsData();
  }, []);

  // ============================================================================
  // DERIVED STATE - Get status options from brands data
  // ============================================================================

  // Get unique statuses from brands data
  const statusOptions = useMemo(() => {
    if (!brands || brands.length === 0) return defaultStatusOptions;

    // Extract unique statuses from brands
    const uniqueStatuses = [
      ...new Set(
        brands.map((brand) => brand.status).filter(Boolean) // Remove null/undefined
      ),
    ];

    // Combine with default options and remove duplicates
    return [...new Set([...defaultStatusOptions, ...uniqueStatuses])];
  }, [brands]);

  // ============================================================================
  // FORM HANDLERS
  // ============================================================================

  const openCreateForm = () => {
    setFormData({
      ...initialBrandForm,
      status: statusOptions[0] || 'Prospect',
    });
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
      status: brand.status || statusOptions[0] || 'Prospect',
      tags: (brand.tags || []).join(', ') || '',
      notes: brand.notes || '',

      primaryContactName: brand.primaryContactName || '',
      primaryContactTitle: brand.primaryContactTitle || '',
      primaryContactEmail: brand.primaryContactEmail || '',
      primaryContactPhone: brand.primaryContactPhone || '',

      secondaryContactEnabled: !!brand.secondaryContact,
      secondaryContactName: brand.secondaryContact?.name || '',
      secondaryContactTitle: brand.secondaryContact?.title || '',
      secondaryContactEmail: brand.secondaryContact?.email || '',
      secondaryContactPhone: brand.secondaryContact?.phone || '',
    });

    setEditingBrandId(brand._id || brand.id);
    setFormError('');
    setIsFormOpen(true);
  };

  const openViewModal = (brand) => {
    setViewingBrand(brand);
    setIsViewModalOpen(true);
  };

  const openDeleteModal = (brand) => {
    setDeletingBrand(brand);
    setIsDeleteModalOpen(true);
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
        recordedBy: name,
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
        // Update existing brand using the separate function
        const updatedBrand = await updateBrandDetails(
          editingBrandId,
          brandData
        );

        // Update local state
        setBrands((prev) =>
          prev.map((brand) =>
            (brand._id || brand.id) === editingBrandId ? updatedBrand : brand
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
      getbrandsData();
      setIsFormOpen(false);
      setFormData({
        ...initialBrandForm,
        status: statusOptions[0] || 'Prospect',
      });
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
  // DELETE HANDLER
  // ============================================================================

  const handleDeleteBrand = async (brandId, deleteReason) => {
    try {
      console.log(`🗑️ DELETING BRAND ID: ${brandId}`);

      const result = await deleteBrandAction(brandId, deleteReason);

      if (!result.success) {
        throw new Error(result.message || 'Failed to delete brand');
      }

      // Update local state
      setBrands((prev) =>
        prev.filter((brand) => (brand._id || brand.id) !== brandId)
      );

      toast.success('Brand deleted successfully!');
      console.log('✅ BRAND DELETED SUCCESSFULLY');
    } catch (error) {
      console.error('❌ ERROR DELETING BRAND:', error);
      toast.error(error.message);
      throw error;
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
  // UPDATE BRAND FUNCTION
  // ============================================================================
  const updateBrandDetails = async (brandId, brandData) => {
    try {
      console.log(`🔄 UPDATING BRAND ID: ${brandId}`);

      const result = await updateBrandAction(brandId, brandData);

      if (!result.success) {
        throw new Error(result.message || 'Failed to update brand');
      }
      getbrandsData(); // Refresh the brands list

      console.log('✅ BRAND UPDATED SUCCESSFULLY');
      return result.data;
    } catch (error) {
      console.error('❌ ERROR UPDATING BRAND:', error);
      throw error;
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

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
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Primary Contact</TableHead>
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
                              <div className="font-medium uppercase">
                                {brand?.businessName}
                              </div>
                              <div className="text-sm text-gray-600">
                                {[brand?.city, brand?.country]
                                  .filter(Boolean)
                                  .join(', ') || '—'}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {brand?.category}
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
                        <TableCell>
                          {brand?.primaryContactName && (
                            <div>
                              <div className="font-medium">
                                {brand?.primaryContactName}
                              </div>
                              <div className="text-sm text-gray-600">
                                {brand?.primaryContactEmail}
                              </div>
                              <div className="text-xs text-gray-500">
                                {brand?.primaryContactPhone}
                              </div>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openViewModal(brand)}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditForm(brand)}
                              title="Edit Brand"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteModal(brand)}
                              title="Delete Brand"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

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

      {/* View Modal */}
      <ViewBrandModal
        brand={viewingBrand}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingBrand(null);
        }}
      />

      {/* Delete Modal */}
      <DeleteBrandModal
        brand={deletingBrand}
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingBrand(null);
        }}
        onConfirm={handleDeleteBrand}
      />
    </div>
  );
}
