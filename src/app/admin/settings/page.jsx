'use client';
import React from 'react';
import { Users, Package, Building2, SlidersHorizontal } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import UserManagement from './UserManagement';
import EventPackages from './EventPackages';
import CompanyProfile from './CompanyProfile';
import SystemPreferences from './SystemPreferences';

export default function AdminSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground lg:text-3xl">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage users, packages, company profile, and system preferences
        </p>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-4">
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="packages" className="gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Packages</span>
          </TabsTrigger>
          <TabsTrigger value="company" className="gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Company</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Preferences</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="packages">
          <EventPackages />
        </TabsContent>

        <TabsContent value="company">
          <CompanyProfile />
        </TabsContent>

        <TabsContent value="preferences">
          <SystemPreferences />
        </TabsContent>
      </Tabs>
    </div>
  );
}
