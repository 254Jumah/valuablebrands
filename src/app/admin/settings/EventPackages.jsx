'use client';
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Plus,
  Pencil,
  Trash2,
  Crown,
  Star,
  Award,
  Package,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import your backend functions
// Adjust the import path based on your file structure
import {
  getEventPackages,
  createEventPackage,
  updateEventPackage,
  deleteEventPackage,
  toggleEventPackageStatus,
} from '@/app/lib/action';

const tierIcons = {
  Bronze: Award,
  Silver: Star,
  Gold: Crown,
};

const tierColors = {
  Bronze: 'border-orange-300 bg-orange-500/5',
  Silver: 'border-slate-300 bg-slate-500/5',
  Gold: 'border-amber-400 bg-amber-500/5',
};

const EventPackages = () => {
  const [packages, setPackages] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  const [isToggling, setIsToggling] = useState(null);
  const [form, setForm] = useState({
    name: '',
    price: '',
    includedPax: '',
    benefits: '',
  });

  // Fetch packages from backend
  const fetchPackages = async () => {
    setIsFetching(true);
    try {
      console.log('📡 Fetching packages from backend...');
      const data = await getEventPackages();
      console.log('✅ Packages fetched successfully:', data);
      setPackages(data);
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

  const resetForm = () => {
    setForm({ name: '', price: '', includedPax: '', benefits: '' });
    setEditingPkg(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleOpenEdit = (pkg) => {
    setEditingPkg(pkg);
    setForm({
      name: pkg.name,
      price: pkg.price.toString(),
      includedPax: pkg.includedPax.toString(),
      benefits: pkg.benefits.join('\n'),
    });
    setDialogOpen(true);
  };

  // Prepare package data for backend
  const preparePackageData = () => {
    const benefitsList = form.benefits
      .split('\n')
      .map((b) => b.trim())
      .filter(Boolean);

    const packageData = {
      name: form.name.trim(),
      price: Number(form.price),
      includedPax: Number(form.includedPax),
      benefits: benefitsList,
      isActive: editingPkg ? editingPkg.isActive : true,
    };

    // Include ID for updates
    if (editingPkg) {
      packageData.id = editingPkg.id;
    }

    return packageData;
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price || !form.includedPax) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const packageData = preparePackageData();
      console.log('📦 Prepared package data:', packageData);

      let result;
      if (editingPkg) {
        // Update existing package
        console.log(`📤 Updating package ${editingPkg.id}...`);
        result = await updateEventPackage(editingPkg.id, packageData);
        console.log('📥 Update result:', result);

        setPackages((prev) =>
          prev.map((p) => (p.id === editingPkg.id ? { ...p, ...result } : p))
        );
        toast.success('Package updated successfully');
      } else {
        // Create new package
        console.log('📤 Creating new package...');
        result = await createEventPackage(packageData);
        console.log('📥 Create result:', result);

        setPackages((prev) => [...prev, result]);
        toast.success('Package created successfully');
      }

      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('❌ Error saving package:', error);
      toast.error(error.message || 'Failed to save package');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const pkg = packages.find((p) => p.id === id);
    const pkgName = pkg?.name || 'Package';

    setIsDeleting(id);
    try {
      console.log(`🗑️ Deleting package ${id} - ${pkgName}...`);

      // Pass the package ID and any additional data needed
      const result = await deleteEventPackage(id, {
        reason: 'User deleted from admin panel',
        deletedBy: 'admin',
      });

      console.log('📥 Delete result:', result);

      setPackages((prev) => prev.filter((p) => p.id !== id));
      toast.success(`${pkgName} removed successfully`);
    } catch (error) {
      console.error('❌ Error deleting package:', error);
      toast.error(error.message || 'Failed to delete package');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleToggleActive = async (id) => {
    setIsToggling(id);
    try {
      const pkg = packages.find((p) => p.id === id);
      const newStatus = !pkg.isActive;

      console.log(`🔄 Toggling package ${id} - ${pkg.name} to: ${newStatus}`);

      const result = await toggleEventPackageStatus(id, newStatus);
      console.log('📥 Toggle result:', result);

      setPackages((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isActive: newStatus } : p))
      );

      toast.success(`${pkg.name} ${newStatus ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('❌ Error toggling package status:', error);
      toast.error(error.message || 'Failed to update package status');
    } finally {
      setIsToggling(null);
    }
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="border-border/50 animate-pulse">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 bg-muted rounded" />
                <div className="h-5 w-24 bg-muted rounded" />
              </div>
              <div className="h-6 w-10 bg-muted rounded" />
            </div>
            <div className="mt-2 space-y-2">
              <div className="h-8 w-32 bg-muted rounded" />
              <div className="h-4 w-24 bg-muted rounded" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 bg-muted rounded-full" />
                  <div className="h-4 w-40 bg-muted rounded" />
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-2">
              <div className="h-9 flex-1 bg-muted rounded" />
              <div className="h-9 w-9 bg-muted rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (isFetching) {
    return (
      <div className="space-y-6">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Event Packages</CardTitle>
              <CardDescription>Loading packages...</CardDescription>
            </div>
            <Button size="sm" disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              New Package
            </Button>
          </CardHeader>
        </Card>
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ToastContainer position="top-right" autoClose={3000} />
      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Event Packages</CardTitle>
            <CardDescription>
              Configure registration tiers with pricing and benefits
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                onClick={handleOpenCreate}
                disabled={isSubmitting}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Package
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingPkg ? 'Edit Package' : 'Create Package'}
                </DialogTitle>
                <DialogDescription>
                  Define the package name, pricing, and included benefits
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Package Name</Label>
                  <Input
                    placeholder="e.g. Platinum"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    disabled={isSubmitting}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Price (KES)</Label>
                    <Input
                      type="number"
                      placeholder="250000"
                      value={form.price}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, price: e.target.value }))
                      }
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Included Pax</Label>
                    <Input
                      type="number"
                      placeholder="8"
                      value={form.includedPax}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, includedPax: e.target.value }))
                      }
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Benefits (one per line)</Label>
                  <Textarea
                    rows={5}
                    placeholder={'8 seats\nStage mention\nVIP table'}
                    value={form.benefits}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, benefits: e.target.value }))
                    }
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingPkg ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
      </Card>

      {/* Package Cards */}
      {packages.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="text-lg mb-2">No Packages Yet</CardTitle>
            <CardDescription className="text-center mb-4">
              Get started by creating your first event package
            </CardDescription>
            <Button onClick={handleOpenCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Create Package
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => {
            const Icon = tierIcons[pkg.name] || Package;
            const colorClass = tierColors[pkg.name] || 'border-border bg-card';
            const isDeletingThis = isDeleting === pkg.id;
            const isTogglingThis = isToggling === pkg.id;

            return (
              <Card
                key={pkg.id}
                className={cn(
                  'relative overflow-hidden border-2 transition-all',
                  colorClass,
                  !pkg.isActive && 'opacity-50',
                  isDeletingThis && 'animate-pulse'
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      <CardTitle className="text-base">{pkg.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      {isTogglingThis ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : (
                        <Switch
                          checked={pkg.isActive}
                          onCheckedChange={() => handleToggleActive(pkg.id)}
                          disabled={isTogglingThis || isDeletingThis}
                        />
                      )}
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-foreground">
                      KES {pkg.price?.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {' '}
                      / {pkg.includedPax} pax
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1.5">
                    {pkg.benefits?.map((benefit, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {benefit}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleOpenEdit(pkg)}
                      disabled={isDeletingThis || isTogglingThis}
                    >
                      <Pencil className="mr-1 h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(pkg.id)}
                      disabled={isDeletingThis || isTogglingThis}
                    >
                      {isDeletingThis ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EventPackages;
