'use client';
import { useState, useMemo, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  SheetTrigger,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Users,
  UserCheck,
  UserPlus,
  UserX,
  Search,
  Clock,
  MapPin,
  Calendar,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Building2,
  Phone,
  Mail,
  Ticket,
  TrendingUp,
  Loader2,
  CalendarDays,
  CalendarRange,
  CalendarCheck,
  History,
} from 'lucide-react';
import { format, isToday, isFuture, isPast, parseISO } from 'date-fns';

// Import actions
import {
  getEvent,
  getAttendees,
  getEventStats,
  checkInAttendee,
  undoCheckIn,
  registerWalkIn,
  markNoShow,
  fetchEvents as getEvents,
} from '@/app/lib/action';

export const ticketPricing = {
  Standard: 2500,
  VIP: 10000,
  Speaker: 0,
  Exhibitor: 15000,
  'Walk-In': 3500,
};

export default function EventCheckin() {
  // Event selection state
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [eventCategory, setEventCategory] = useState('today');

  // Data states
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [stats, setStats] = useState({
    totalRegistered: 0,
    checkedIn: 0,
    walkIns: 0,
    checkinRate: 0,
    remainingCapacity: 0,
  });

  // UI states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [ticketFilter, setTicketFilter] = useState('All');
  const [walkInOpen, setWalkInOpen] = useState(false);
  const [walkInForm, setWalkInForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    tableNumber: '',
    notes: '',
  });
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch all events on mount
  useEffect(() => {
    fetchEvents();
  }, []);

  // Fetch event data when selected event changes
  useEffect(() => {
    if (selectedEventId) {
      fetchEventData(selectedEventId);
    }
  }, [selectedEventId]);

  // Categorize events
  const categorizedEvents = useMemo(() => {
    const now = new Date();

    return {
      today: events.filter((e) => {
        const eventDate = new Date(e?.date);
        return isToday(eventDate);
      }),
      upcoming: events.filter((e) => {
        const eventDate = new Date(e?.date);
        return isFuture(eventDate) && !isToday(eventDate);
      }),
      active: events.filter((e) => {
        const startDate = new Date(e.date);
        const endDate = e.endDate ? new Date(e.endDate) : startDate;
        return now >= startDate && now <= endDate;
      }),
      past: events.filter((e) => {
        const eventDate = new Date(e.date);
        const daysAgo = 7;
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - daysAgo);
        return isPast(eventDate) && eventDate >= weekAgo;
      }),
    };
  }, [events]);

  // Auto-select best event based on category
  useEffect(() => {
    if (events.length > 0 && !selectedEventId) {
      if (categorizedEvents.active.length > 0) {
        setSelectedEventId(categorizedEvents.active[0]._id);
        setEventCategory('active');
      } else if (categorizedEvents.today.length > 0) {
        setSelectedEventId(categorizedEvents.today[0]._id);
        setEventCategory('today');
      } else if (categorizedEvents.upcoming.length > 0) {
        setSelectedEventId(categorizedEvents.upcoming[0]._id);
        setEventCategory('upcoming');
      } else if (categorizedEvents.past.length > 0) {
        setSelectedEventId(categorizedEvents.past[0]._id);
        setEventCategory('past');
      }
    }
  }, [categorizedEvents, events.length, selectedEventId]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const eventsData = await getEvents();
      setEvents(eventsData);
    } catch (error) {
      toast.error(error.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const fetchEventData = async (eventId) => {
    try {
      setLoading(true);

      const eventData = await getEvent(eventId);
      setEvent(eventData);

      const attendeesData = await getAttendees(eventId);
      setAttendees(attendeesData);

      const statsData = await getEventStats(eventId);
      setStats(statsData);
    } catch (error) {
      toast.error(error.message || 'Failed to load event data');
    } finally {
      setLoading(false);
    }
  };

  const filteredAttendees = useMemo(() => {
    return attendees.filter((a) => {
      const matchesSearch =
        searchQuery === '' ||
        a.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.phone?.includes(searchQuery) ||
        a.company?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
      const matchesTicket =
        ticketFilter === 'All' || a.ticketType === ticketFilter;

      return matchesSearch && matchesStatus && matchesTicket;
    });
  }, [attendees, searchQuery, statusFilter, ticketFilter]);

  const handleEventChange = (eventId) => {
    setSelectedEventId(eventId);
    setSearchQuery('');
    setStatusFilter('All');
    setTicketFilter('All');
  };

  const handleCheckIn = async (id, name) => {
    try {
      setActionLoading(true);
      const updatedAttendee = await checkInAttendee(id, selectedEventId);

      setAttendees((prev) =>
        prev.map((a) => (a._id === id ? updatedAttendee : a))
      );

      const updatedStats = await getEventStats(selectedEventId);
      setStats(updatedStats);

      toast.success(`${name} has been checked in successfully.`);
    } catch (error) {
      toast.error(error.message || 'Failed to check in attendee');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUndoCheckIn = async (id, name) => {
    try {
      setActionLoading(true);
      const updatedAttendee = await undoCheckIn(id, selectedEventId);

      setAttendees((prev) =>
        prev.map((a) => (a._id === id ? updatedAttendee : a))
      );

      const updatedStats = await getEventStats(selectedEventId);
      setStats(updatedStats);

      toast.success(`${name}'s check-in has been undone.`);
    } catch (error) {
      toast.error(error.message || 'Failed to undo check-in');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkNoShow = async (id, name) => {
    try {
      setActionLoading(true);
      const updatedAttendee = await markNoShow(id, selectedEventId);

      setAttendees((prev) =>
        prev.map((a) => (a._id === id ? updatedAttendee : a))
      );

      const updatedStats = await getEventStats(selectedEventId);
      setStats(updatedStats);

      toast.success(`${name} has been marked as no-show.`);
    } catch (error) {
      toast.error(error.message || 'Failed to mark as no-show');
    } finally {
      setActionLoading(false);
    }
  };

  const handleWalkInSubmit = async () => {
    if (!walkInForm.name || !walkInForm.phone) {
      toast.error('Name and phone are required.');
      return;
    }

    try {
      setActionLoading(true);

      const walkInData = {
        ...walkInForm,
        eventId: selectedEventId,
        ticketType: 'Walk-In',
        ticketPrice: ticketPricing['Walk-In'],
      };

      const newAttendee = await registerWalkIn(walkInData);

      setAttendees((prev) => [newAttendee, ...prev]);

      const updatedStats = await getEventStats(selectedEventId);
      setStats(updatedStats);

      toast.success(
        `${walkInForm.name} has been registered. Fee: KES ${ticketPricing['Walk-In'].toLocaleString()}`
      );

      setWalkInForm({
        name: '',
        email: '',
        phone: '',
        company: '',
        tableNumber: '',
        notes: '',
      });
      setWalkInOpen(false);
    } catch (error) {
      toast.error(error.message || 'Failed to register walk-in');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      Registered: { variant: 'outline', icon: <Clock className="h-3 w-3" /> },
      'Checked-In': {
        variant: 'default',
        icon: <CheckCircle2 className="h-3 w-3" />,
      },
      'No-Show': {
        variant: 'destructive',
        icon: <XCircle className="h-3 w-3" />,
      },
      'Walk-In': {
        variant: 'secondary',
        icon: <UserPlus className="h-3 w-3" />,
      },
    };
    const { variant, icon } = variants[status] || variants.Registered;
    return (
      <Badge variant={variant} className="gap-1">
        {icon}
        {status}
      </Badge>
    );
  };

  const getTicketBadge = (ticket) => {
    const colors = {
      Standard: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      VIP: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
      Speaker:
        'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      Exhibitor:
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'Walk-In':
        'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    };
    return (
      <Badge className={colors[ticket] || colors.Standard}>{ticket}</Badge>
    );
  };

  const getEventStatusIcon = (category) => {
    switch (category) {
      case 'today':
        return <CalendarCheck className="h-4 w-4" />;
      case 'upcoming':
        return <CalendarRange className="h-4 w-4" />;
      case 'active':
        return <Clock className="h-4 w-4" />;
      case 'past':
        return <History className="h-4 w-4" />;
      default:
        return <CalendarDays className="h-4 w-4" />;
    }
  };

  if (loading && events.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <CalendarDays className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-2">No Events Found</h2>
        <p className="text-muted-foreground">There are no events available.</p>
      </div>
    );
  }

  const currentTime = format(new Date(), 'HH:mm');

  return (
    <div className="space-y-6">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Event Selector Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex items-center gap-2 min-w-[200px]">
              {getEventStatusIcon(eventCategory)}
              <span className="font-medium capitalize">
                {eventCategory} Events
              </span>
            </div>

            <Select value={selectedEventId} onValueChange={handleEventChange}>
              <SelectTrigger className="w-full lg:w-[400px]">
                <SelectValue placeholder="Select an event" />
              </SelectTrigger>
              <SelectContent>
                {/* Today's Events */}
                {categorizedEvents.today.length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-sm font-semibold bg-muted/50">
                      <span className="flex items-center gap-2">
                        <CalendarCheck className="h-4 w-4" />
                        Todays Events
                      </span>
                    </div>
                    {categorizedEvents.today.map((event) => (
                      <SelectItem
                        key={event._id}
                        value={event._id}
                        className="pl-6"
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{event.title}</span>
                          <Badge variant="outline" className="ml-2">
                            {event.time || 'TBD'}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </>
                )}

                {/* Active Events */}
                {categorizedEvents.active.length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-sm font-semibold bg-muted/50">
                      <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        In Progress
                      </span>
                    </div>
                    {categorizedEvents.active.map((event) => (
                      <SelectItem
                        key={event._id}
                        value={event._id}
                        className="pl-6"
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{event.title}</span>
                          <Badge
                            variant="default"
                            className="ml-2 animate-pulse"
                          >
                            LIVE
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </>
                )}

                {/* Upcoming Events */}
                {categorizedEvents.upcoming.length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-sm font-semibold bg-muted/50">
                      <span className="flex items-center gap-2">
                        <CalendarRange className="h-4 w-4" />
                        Upcoming Events
                      </span>
                    </div>
                    {categorizedEvents.upcoming.map((event) => (
                      <SelectItem
                        key={event._id}
                        value={event._id}
                        className="pl-6"
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{event.title}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {format(new Date(event.date), 'MMM d')}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </>
                )}

                {/* Past Events */}
                {categorizedEvents.past.length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-sm font-semibold bg-muted/50">
                      <span className="flex items-center gap-2">
                        <History className="h-4 w-4" />
                        Recent Events
                      </span>
                    </div>
                    {categorizedEvents.past.map((event) => (
                      <SelectItem
                        key={event._id}
                        value={event._id}
                        className="pl-6"
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{event.title}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {format(new Date(event.date), 'MMM d')}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>

            {/* Quick category filters */}
            <div className="flex gap-2 ml-auto">
              <Button
                variant={eventCategory === 'today' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  if (categorizedEvents.today.length > 0) {
                    setSelectedEventId(categorizedEvents.today[0]._id);
                    setEventCategory('today');
                  }
                }}
                disabled={categorizedEvents.today.length === 0}
              >
                Today ({categorizedEvents.today.length})
              </Button>
              <Button
                variant={eventCategory === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  if (categorizedEvents.active.length > 0) {
                    setSelectedEventId(categorizedEvents.active[0]._id);
                    setEventCategory('active');
                  }
                }}
                disabled={categorizedEvents.active.length === 0}
              >
                Live ({categorizedEvents.active.length})
              </Button>
              <Button
                variant={eventCategory === 'upcoming' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  if (categorizedEvents.upcoming.length > 0) {
                    setSelectedEventId(categorizedEvents.upcoming[0]._id);
                    setEventCategory('upcoming');
                  }
                }}
                disabled={categorizedEvents.upcoming.length === 0}
              >
                Upcoming ({categorizedEvents.upcoming.length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event Details - Only show if event is selected */}
      {selectedEventId && event && (
        <>
          {/* Event Header */}
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {eventCategory === 'active' && (
                      <Badge variant="default" className="animate-pulse">
                        LIVE NOW
                      </Badge>
                    )}
                    {eventCategory === 'today' && (
                      <Badge variant="secondary">TODAY</Badge>
                    )}
                    <span className="text-sm text-muted-foreground">
                      {currentTime}
                    </span>
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-bold">
                    {event.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(event.date), 'EEEE, MMMM d, yyyy')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {event.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {event.location}
                    </span>
                  </div>
                </div>
                <Sheet open={walkInOpen} onOpenChange={setWalkInOpen}>
                  <SheetTrigger asChild>
                    <Button
                      size="lg"
                      className="gap-2"
                      disabled={
                        actionLoading ||
                        eventCategory === 'past' ||
                        eventCategory === 'upcoming'
                      }
                    >
                      <UserPlus className="h-5 w-5" />
                      Register Walk-in
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Register Walk-in Attendee</SheetTitle>
                      <SheetDescription>
                        Quick registration for on-site attendees. Fee: KES{' '}
                        {ticketPricing['Walk-In'].toLocaleString()}
                      </SheetDescription>
                    </SheetHeader>
                    <div className="space-y-4 mt-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={walkInForm.name}
                          onChange={(e) =>
                            setWalkInForm({
                              ...walkInForm,
                              name: e.target.value,
                            })
                          }
                          placeholder="Enter full name"
                          disabled={actionLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          value={walkInForm.phone}
                          onChange={(e) =>
                            setWalkInForm({
                              ...walkInForm,
                              phone: e.target.value,
                            })
                          }
                          placeholder="+254 7XX XXX XXX"
                          disabled={actionLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={walkInForm.email}
                          onChange={(e) =>
                            setWalkInForm({
                              ...walkInForm,
                              email: e.target.value,
                            })
                          }
                          placeholder="email@company.com"
                          disabled={actionLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          value={walkInForm.company}
                          onChange={(e) =>
                            setWalkInForm({
                              ...walkInForm,
                              company: e.target.value,
                            })
                          }
                          placeholder="Company name"
                          disabled={actionLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tableNumber">
                          Table/Seat Assignment
                        </Label>
                        <Input
                          id="tableNumber"
                          value={walkInForm.tableNumber}
                          onChange={(e) =>
                            setWalkInForm({
                              ...walkInForm,
                              tableNumber: e.target.value,
                            })
                          }
                          placeholder="e.g., STD-45"
                          disabled={actionLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                          id="notes"
                          value={walkInForm.notes}
                          onChange={(e) =>
                            setWalkInForm({
                              ...walkInForm,
                              notes: e.target.value,
                            })
                          }
                          placeholder="Any special requirements..."
                          disabled={actionLoading}
                        />
                      </div>
                      <div className="pt-4 border-t">
                        <div className="flex justify-between items-center mb-4">
                          <span className="font-medium">Walk-in Fee</span>
                          <span className="text-lg font-bold text-primary">
                            KES {ticketPricing['Walk-In'].toLocaleString()}
                          </span>
                        </div>
                        <Button
                          onClick={handleWalkInSubmit}
                          className="w-full gap-2"
                          disabled={actionLoading}
                        >
                          {actionLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                          Register & Check In
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {stats.totalRegistered}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Pre-registered
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                    <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.checkedIn}</p>
                    <p className="text-xs text-muted-foreground">Checked In</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900">
                    <UserPlus className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.walkIns}</p>
                    <p className="text-xs text-muted-foreground">Walk-ins</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                    <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.checkinRate}%</p>
                    <p className="text-xs text-muted-foreground">
                      Check-in Rate
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                    <Ticket className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {stats.remainingCapacity}
                    </p>
                    <p className="text-xs text-muted-foreground">Slots Left</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Attendees Management */}
          <Card>
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <CardTitle>Attendee Management</CardTitle>
                  <CardDescription>
                    Search, check-in, and manage event attendees
                  </CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, email, phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-64"
                      disabled={actionLoading}
                    />
                  </div>
                  <Select
                    value={statusFilter}
                    onValueChange={(v) => setStatusFilter(v)}
                    disabled={actionLoading}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Status</SelectItem>
                      <SelectItem value="Registered">Registered</SelectItem>
                      <SelectItem value="Checked-In">Checked-In</SelectItem>
                      <SelectItem value="No-Show">No-Show</SelectItem>
                      <SelectItem value="Walk-In">Walk-In</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={ticketFilter}
                    onValueChange={(v) => setTicketFilter(v)}
                    disabled={actionLoading}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Ticket" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Tickets</SelectItem>
                      <SelectItem value="Standard">Standard</SelectItem>
                      <SelectItem value="VIP">VIP</SelectItem>
                      <SelectItem value="Speaker">Speaker</SelectItem>
                      <SelectItem value="Exhibitor">Exhibitor</SelectItem>
                      <SelectItem value="Walk-In">Walk-In</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList>
                  <TabsTrigger value="all">
                    All ({attendees.length})
                  </TabsTrigger>
                  <TabsTrigger value="pending">
                    Pending (
                    {attendees.filter((a) => a.status === 'Registered').length})
                  </TabsTrigger>
                  <TabsTrigger value="checked">
                    Checked In (
                    {
                      attendees.filter(
                        (a) =>
                          a.status === 'Checked-In' || a.status === 'Walk-In'
                      ).length
                    }
                    )
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-4">
                  <AttendeeTable
                    attendees={filteredAttendees}
                    onCheckIn={handleCheckIn}
                    onUndoCheckIn={handleUndoCheckIn}
                    onMarkNoShow={handleMarkNoShow}
                    getStatusBadge={getStatusBadge}
                    getTicketBadge={getTicketBadge}
                    actionLoading={actionLoading}
                    eventCategory={eventCategory}
                  />
                </TabsContent>

                <TabsContent value="pending" className="mt-4">
                  <AttendeeTable
                    attendees={filteredAttendees.filter(
                      (a) => a.status === 'Registered'
                    )}
                    onCheckIn={handleCheckIn}
                    onUndoCheckIn={handleUndoCheckIn}
                    onMarkNoShow={handleMarkNoShow}
                    getStatusBadge={getStatusBadge}
                    getTicketBadge={getTicketBadge}
                    actionLoading={actionLoading}
                    eventCategory={eventCategory}
                  />
                </TabsContent>

                <TabsContent value="checked" className="mt-4">
                  <AttendeeTable
                    attendees={filteredAttendees.filter(
                      (a) => a.status === 'Checked-In' || a.status === 'Walk-In'
                    )}
                    onCheckIn={handleCheckIn}
                    onUndoCheckIn={handleUndoCheckIn}
                    onMarkNoShow={handleMarkNoShow}
                    getStatusBadge={getStatusBadge}
                    getTicketBadge={getTicketBadge}
                    actionLoading={actionLoading}
                    eventCategory={eventCategory}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function AttendeeTable({
  attendees,
  onCheckIn,
  onUndoCheckIn,
  onMarkNoShow,
  getStatusBadge,
  getTicketBadge,
  actionLoading,
  eventCategory,
}) {
  const canCheckIn = eventCategory === 'active' || eventCategory === 'today';

  if (attendees.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No attendees found</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Attendee</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Ticket</TableHead>
            <TableHead>Table</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Check-in Time</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {attendees.map((attendee) => (
            <TableRow
              key={attendee._id}
              className={
                attendee.status === 'Checked-In' ||
                attendee.status === 'Walk-In'
                  ? 'bg-green-50/50 dark:bg-green-950/20'
                  : ''
              }
            >
              <TableCell>
                <div>
                  <p className="font-medium">{attendee.name}</p>
                  {attendee.company && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {attendee.company}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <p className="text-sm flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {attendee.phone}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {attendee.email}
                  </p>
                </div>
              </TableCell>
              <TableCell>{getTicketBadge(attendee.ticketType)}</TableCell>
              <TableCell>
                {attendee.tableNumber ? (
                  <Badge variant="outline">{attendee.tableNumber}</Badge>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>{getStatusBadge(attendee.status)}</TableCell>
              <TableCell>
                {attendee.checkedInAt ? (
                  <span className="text-sm">
                    {format(new Date(attendee.checkedInAt), 'HH:mm')}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {attendee.status === 'Registered' && canCheckIn && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => onCheckIn(attendee._id, attendee.name)}
                        className="gap-1"
                        disabled={actionLoading}
                      >
                        {actionLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                        Check In
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          onMarkNoShow(attendee._id, attendee.name)
                        }
                        className="gap-1 text-destructive"
                        disabled={actionLoading}
                      >
                        <UserX className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  {attendee.status === 'Registered' && !canCheckIn && (
                    <Badge variant="outline" className="text-muted-foreground">
                      Check-in unavailable
                    </Badge>
                  )}
                  {(attendee.status === 'Checked-In' ||
                    attendee.status === 'Walk-In') &&
                    canCheckIn && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          onUndoCheckIn(attendee._id, attendee.name)
                        }
                        className="gap-1"
                        disabled={actionLoading}
                      >
                        {actionLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RotateCcw className="h-4 w-4" />
                        )}
                        Undo
                      </Button>
                    )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
