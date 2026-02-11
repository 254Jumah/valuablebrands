'use client';
import React, { useState } from 'react';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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

const initialPackages = [
  {
    id: 'pkg1',
    name: 'Bronze',
    price: 50000,
    includedPax: 2,
    benefits: ['2 seats', 'Logo on program', 'Standard table'],
    isActive: true,
    color: 'orange',
  },
  {
    id: 'pkg2',
    name: 'Silver',
    price: 120000,
    includedPax: 4,
    benefits: [
      '4 seats',
      'Logo on backdrop',
      'VIP table',
      'Social media mention',
    ],
    isActive: true,
    color: 'slate',
  },
  {
    id: 'pkg3',
    name: 'Gold',
    price: 250000,
    includedPax: 8,
    benefits: [
      '8 seats',
      'Stage mention',
      'Premium placement',
      'VIP table',
      'Brand video display',
      'Keynote opportunity',
    ],
    isActive: true,
    color: 'amber',
  },
];

const EventPackages = () => {
  const [packages, setPackages] = useState(initialPackages);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState(null);
  const [form, setForm] = useState({
    name: '',
    price: '',
    includedPax: '',
    benefits: '',
  });

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

  const handleSave = () => {
    if (!form.name.trim() || !form.price || !form.includedPax) {
      toast.error('Please fill in all required fields');
      return;
    }

    const benefitsList = form.benefits
      .split('\n')
      .map((b) => b.trim())
      .filter(Boolean);

    if (editingPkg) {
      setPackages((prev) =>
        prev.map((p) =>
          p.id === editingPkg.id
            ? {
                ...p,
                name: form.name.trim(),
                price: Number(form.price),
                includedPax: Number(form.includedPax),
                benefits: benefitsList,
              }
            : p
        )
      );
      toast.success('Package updated');
    } else {
      const newPkg = {
        id: `pkg_${Math.random().toString(36).slice(2, 8)}`,
        name: form.name.trim(),
        price: Number(form.price),
        includedPax: Number(form.includedPax),
        benefits: benefitsList,
        isActive: true,
        color: 'blue',
      };
      setPackages((prev) => [...prev, newPkg]);
      toast.success('Package created');
    }
    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id) => {
    setPackages((prev) => prev.filter((p) => p.id !== id));
    toast.success('Package removed');
  };

  const handleToggleActive = (id) => {
    setPackages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
    );
  };

  return (
    <div className="space-y-6">
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
              <Button size="sm" onClick={handleOpenCreate}>
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
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  {editingPkg ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
      </Card>

      {/* Package Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg) => {
          const Icon = tierIcons[pkg.name] || Package;
          const colorClass = tierColors[pkg.name] || 'border-border bg-card';

          return (
            <Card
              key={pkg.id}
              className={cn(
                'relative overflow-hidden border-2 transition-all',
                colorClass,
                !pkg.isActive && 'opacity-50'
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    <CardTitle className="text-base">{pkg.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={pkg.isActive}
                      onCheckedChange={() => handleToggleActive(pkg.id)}
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-bold text-foreground">
                    KES {pkg.price.toLocaleString()}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {' '}
                    / {pkg.includedPax} pax
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  {pkg.benefits.map((benefit, i) => (
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
                  >
                    <Pencil className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(pkg.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default EventPackages;
