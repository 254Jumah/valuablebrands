'use client';
import { useState } from 'react';

import {
  Award,
  LayoutDashboard,
  Calendar,
  Trophy,
  FileText,
  Image,
  LogOut,
  Menu,
  Bell,
  UserCircle,
  Settings,
  Building2,
  Banknote,
  BarChart3,
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import useAuth from '@/app/hooks/useAuth';

const adminNavItems = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { name: 'Events', path: '/admin/events', icon: Calendar },
  { name: 'Brands', path: '/admin/brands', icon: Building2 },
  { name: 'Registrations', path: '/admin/registrations', icon: Banknote },
  { name: 'Finance', path: '/admin/Finance', icon: Banknote },
  { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  { name: 'Team', path: '/admin/team', icon: Building2 },
  { name: 'Awards', path: '/admin/awards', icon: Trophy },
  { name: 'Blog', path: '/admin/blog', icon: FileText },
  { name: 'Media', path: '/admin/media', icon: Image },
];

export const AdminLayout = ({ children }) => {
  const { email, name, role, id } = useAuth();
  const location = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Static placeholder data (UI only)
  const adminUser = {
    name: name || 'Admin User',
    email: email || 'admin@valuablebrands.co.ke',
    role: role || 'Administrator',
  };

  const [notifications, setNotifications] = useState(() => [
    {
      id: 'n1',
      title: 'New nomination received',
      detail: 'Best Emerging Brand • Kujali Foods',
      time: '10m ago',
      unread: true,
    },
    {
      id: 'n2',
      title: 'Event updated',
      detail: 'Brand Innovation Summit • Venue changed',
      time: '2h ago',
      unread: true,
    },
    {
      id: 'n3',
      title: 'Blog draft saved',
      detail: '“Event Planning Trends for 2024”',
      time: 'Yesterday',
      unread: false,
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markNotificationRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform bg-sidebar transition-transform lg:relative lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
            <Award className="h-8 w-8 text-sidebar-primary" />
            <span className="font-display text-lg font-bold text-sidebar-foreground">
              Admin Panel
            </span>
          </div>
          <nav className="flex-1 space-y-1 p-4">
            {adminNavItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  location.pathname === item.path
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="border-t border-sidebar-border p-4">
            <Link href="/">
              <Button
                variant="ghost"
                className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground"
              >
                <LogOut className="h-5 w-5" />
                Back to Site
              </Button>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex-1" />

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open notifications"
                  className="relative"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span
                      aria-label={`${unreadCount} unread notifications`}
                      className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground"
                    >
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {unreadCount > 0 ? (
                  <DropdownMenuItem
                    className="cursor-pointer justify-center text-sm"
                    onSelect={(e) => {
                      e.preventDefault();
                      markAllNotificationsRead();
                    }}
                  >
                    Mark all as read
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    className="justify-center text-sm text-muted-foreground"
                    disabled
                  >
                    You’re all caught up
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <div className="max-h-80 overflow-auto">
                  {notifications.map((n) => (
                    <DropdownMenuItem
                      key={n.id}
                      className="cursor-pointer items-start gap-3 py-2"
                      onSelect={(e) => {
                        e.preventDefault();
                        markNotificationRead(n.id);
                      }}
                    >
                      <div
                        className={cn(
                          'mt-1 h-2 w-2 rounded-full',
                          n.unread ? 'bg-primary' : 'bg-muted'
                        )}
                        aria-hidden
                      />
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-center justify-between gap-3">
                          <span
                            className={cn(
                              'text-sm font-medium',
                              n.unread
                                ? 'text-foreground'
                                : 'text-muted-foreground'
                            )}
                          >
                            {n.title}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {n.time}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {n.detail}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  asChild
                  className="cursor-pointer justify-center"
                >
                  <Link href="/admin">View all</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open profile menu"
                >
                  <UserCircle className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground">
                      {adminUser.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {adminUser.email}
                    </span>
                    <span className="mt-1 text-xs text-muted-foreground">
                      {adminUser.role}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <UserCircle className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer flex items-center"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-background p-4 lg:p-6">
          {children}
        </main>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};
