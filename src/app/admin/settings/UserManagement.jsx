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
import { Badge } from '@/components/ui/badge';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Shield,
  UserCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const roleBadge = {
  Admin: 'bg-red-500/10 text-red-700 border-red-200',
  Editor: 'bg-blue-500/10 text-blue-700 border-blue-200',
  Viewer: 'bg-muted text-muted-foreground border-border',
};

const statusBadge = {
  Active: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
  Inactive: 'bg-muted text-muted-foreground border-border',
  Suspended: 'bg-red-500/10 text-red-700 border-red-200',
};

const initialUsers = [
  {
    id: 'u1',
    name: 'Admin User',
    email: 'admin@valuablebrands.co.ke',
    role: 'Admin',
    status: 'Active',
    lastLogin: '2024-03-20T10:30:00Z',
    createdAt: '2023-01-01T00:00:00Z',
  },
  {
    id: 'u2',
    name: 'Sarah Wanjiku',
    email: 'sarah@valuablebrands.co.ke',
    role: 'Editor',
    status: 'Active',
    lastLogin: '2024-03-19T14:20:00Z',
    createdAt: '2023-06-15T00:00:00Z',
  },
  {
    id: 'u3',
    name: 'James Ochieng',
    email: 'james@valuablebrands.co.ke',
    role: 'Editor',
    status: 'Active',
    lastLogin: '2024-03-18T09:45:00Z',
    createdAt: '2023-08-01T00:00:00Z',
  },
  {
    id: 'u4',
    name: 'Grace Muthoni',
    email: 'grace@valuablebrands.co.ke',
    role: 'Viewer',
    status: 'Inactive',
    lastLogin: '2024-02-10T16:00:00Z',
    createdAt: '2024-01-10T00:00:00Z',
  },
];

const UserManagement = () => {
  const [users, setUsers] = useState(initialUsers);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'Viewer' });

  const resetForm = () => {
    setForm({ name: '', email: '', role: 'Viewer' });
    setEditingUser(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setForm({ name: user.name, email: user.email, role: user.role });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Name and email are required');
      return;
    }

    if (editingUser) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                name: form.name.trim(),
                email: form.email.trim(),
                role: form.role,
              }
            : u
        )
      );
      toast.success('User updated successfully');
    } else {
      const newUser = {
        id: `u_${Math.random().toString(36).slice(2, 8)}`,
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        status: 'Active',
        lastLogin: 'Never',
        createdAt: new Date().toISOString(),
      };
      setUsers((prev) => [...prev, newUser]);
      toast.success('User created successfully');
    }
    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    toast.success('User removed');
  };

  const handleToggleStatus = (id) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' }
          : u
      )
    );
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">User Management</CardTitle>
          <CardDescription>
            Manage system users and their access levels
          </CardDescription>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={handleOpenCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Edit User' : 'Create New User'}
              </DialogTitle>
              <DialogDescription>
                {editingUser
                  ? 'Update user details and role'
                  : 'Add a new user to the system'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  placeholder="Enter full name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  type="email"
                  placeholder="user@example.com"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={form.role}
                  onValueChange={(v) => setForm((f) => ({ ...f, role: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin — Full access</SelectItem>
                    <SelectItem value="Editor">
                      Editor — Create & edit content
                    </SelectItem>
                    <SelectItem value="Viewer">
                      Viewer — Read-only access
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editingUser ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      <UserCircle className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn('text-xs', roleBadge[user.role])}
                  >
                    <Shield className="mr-1 h-3 w-3" />
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn('text-xs', statusBadge[user.status])}
                  >
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {user.lastLogin === 'Never'
                    ? 'Never'
                    : new Date(user.lastLogin).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenEdit(user)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleToggleStatus(user.id)}
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        {user.status === 'Active' ? 'Suspend' : 'Activate'}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(user.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default UserManagement;
