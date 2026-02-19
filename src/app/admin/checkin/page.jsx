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
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';

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
  Briefcase,
  Users2,
  UserMinus,
  Download,
  Upload,
  FileSpreadsheet,
  PlusCircle,
  UserPlus2,
  FileDown,
} from 'lucide-react';
import { format, isToday, isFuture, isPast } from 'date-fns';

// Import actions
import {
  getEvent,
  getRegistrations,
  getEventStats,
  checkInAttendee,
  undoCheckIn,
  registerWalkIn,
  markNoShow,
  getBrandAttendees,
  addAttendeeToRegistration,
  fetchEvents as getEvents,
  getBrands,
  createBrand,
  getPackages,
  bulkUploadAttendees,
  downloadAttendeeTemplate,
  downloadEventAttendees,
} from '@/app/lib/action';

export default function EventCheckin() {
  // Event selection state
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [eventCategory, setEventCategory] = useState('today');

  // Data states
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [brandAttendees, setBrandAttendees] = useState({});
  const [brands, setBrands] = useState([]);
  const [packages, setPackages] = useState([]);
  const [stats, setStats] = useState({
    totalExpected: 0,
    totalCheckedIn: 0,
    walkIns: 0,
    checkinRate: 0,
    remainingCapacity: 0,
    totalBrands: 0,
  });

  // UI states
  const [searchQuery, setSearchQuery] = useState('');
  const [packageFilter, setPackageFilter] = useState('All');
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [walkInOpen, setWalkInOpen] = useState(false);
  const [checkInSheetOpen, setCheckInSheetOpen] = useState(false);
  const [addAttendeeOpen, setAddAttendeeOpen] = useState(false);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedAttendees, setSelectedAttendees] = useState({});

  // Walk-in form state
  const [walkInForm, setWalkInForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    tableNumber: '',
    notes: '',
  });

  // Add attendee form
  const [addAttendeeForm, setAddAttendeeForm] = useState({
    name: '',
    email: '',
    phone: '',
    jobTitle: '',
    tableNumber: '',
    notes: '',
  });

  // Brand selection for walk-in
  const [selectedBrandForWalkin, setSelectedBrandForWalkin] = useState(null);
  const [isNewBrand, setIsNewBrand] = useState(false);
  const [newBrandForm, setNewBrandForm] = useState({
    businessName: '',
    category: '',
    website: '',
    address: '',
    city: '',
    country: '',
    primaryContactName: '',
    primaryContactTitle: '',
    primaryContactEmail: '',
    primaryContactPhone: '',
    notes: '',
  });

  // Bulk upload
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);

  // Fetch all events on mount
  useEffect(() => {
    fetchEvents();
    fetchBrands();
    fetchPackages();
  }, []);

  // Fetch event data when selected event changes
  useEffect(() => {
    if (selectedEventId) {
      fetchEventData(selectedEventId);
    }
  }, [selectedEventId]);

  const fetchBrands = async () => {
    try {
      const brandsData = await getBrands();
      setBrands(brandsData);
    } catch (error) {
      toast.error('Failed to load brands');
    }
  };

  const fetchPackages = async () => {
    try {
      const packagesData = await getPackages();
      setPackages(packagesData);
    } catch (error) {
      toast.error('Failed to load packages');
    }
  };

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

      const registrationsData = await getRegistrations(eventId);
      setRegistrations(registrationsData);

      const attendeesData = await getBrandAttendees(eventId);
      setBrandAttendees(attendeesData);

      // Calculate stats manually
      const totalBrands = registrationsData.length;
      const totalExpected = registrationsData.reduce(
        (sum, reg) => sum + (reg.pax || 0),
        0
      );

      // Flatten all attendees
      const allAttendees = Object.values(attendeesData).flat();
      const totalCheckedIn = allAttendees.filter(
        (a) => a.status === 'Checked-In'
      ).length;
      const walkIns = allAttendees.filter((a) => a.isWalkIn).length;
      const checkinRate =
        totalExpected > 0
          ? Math.round((totalCheckedIn / totalExpected) * 100)
          : 0;

      // Calculate remaining slots correctly using event capacity
      const remainingCapacity = eventData?.capacity
        ? Math.max(0, eventData.capacity - totalCheckedIn)
        : 0;

      setStats({
        totalBrands,
        totalExpected,
        totalCheckedIn,
        walkIns,
        checkinRate,
        remainingCapacity, // This is now a number, not a percentage
      });

      console.log('📊 Stats calculated:', {
        totalBrands,
        totalExpected,
        totalCheckedIn,
        walkIns,
        checkinRate,
        remainingCapacity,
        eventCapacity: eventData?.capacity,
      });
    } catch (error) {
      toast.error(error.message || 'Failed to load event data');
    } finally {
      setLoading(false);
    }
  };

  const handleBrandSelect = (registration) => {
    setSelectedRegistration(registration);
    setSelectedAttendees({});
    setCheckInSheetOpen(true);
  };

  const handleAddAttendeeToBrand = async () => {
    if (!addAttendeeForm.name || !addAttendeeForm.phone) {
      toast.error('Name and phone are required');
      return;
    }

    try {
      setActionLoading(true);

      const response = await addAttendeeToRegistration({
        registrationId: selectedRegistration._id,
        eventId: selectedEventId,
        brandId: selectedRegistration.brandId._id,
        ...addAttendeeForm,
      });

      if (!response.success) {
        toast.error(response.message);
        return;
      }

      // Refresh attendees
      const attendeesData = await getBrandAttendees(selectedEventId);
      setBrandAttendees(attendeesData);

      const updatedStats = await getEventStats(selectedEventId);
      setStats(updatedStats);

      toast.success(response.message);

      // Reset form
      setAddAttendeeForm({
        name: '',
        email: '',
        phone: '',
        jobTitle: '',
        tableNumber: '',
        notes: '',
      });

      setAddAttendeeOpen(false);
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAttendeeCheckIn = async (attendeeId, name) => {
    try {
      setActionLoading(true);
      const updatedAttendee = await checkInAttendee(
        attendeeId,
        selectedEventId
      );

      setBrandAttendees((prev) => {
        const updated = { ...prev };
        for (const regId in updated) {
          updated[regId] = updated[regId].map((a) =>
            a._id === attendeeId ? updatedAttendee : a
          );
        }
        return updated;
      });

      const updatedStats = await getEventStats(selectedEventId);
      setStats(updatedStats);

      toast.success(`${name} checked in successfully`);
    } catch (error) {
      toast.error(error.message || 'Failed to check in attendee');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkCheckIn = async () => {
    try {
      setActionLoading(true);

      const attendeeIds = Object.keys(selectedAttendees).filter(
        (id) => selectedAttendees[id]
      );

      for (const attendeeId of attendeeIds) {
        await checkInAttendee(attendeeId, selectedEventId);
      }

      const attendeesData = await getBrandAttendees(selectedEventId);
      setBrandAttendees(attendeesData);

      const updatedStats = await getEventStats(selectedEventId);
      setStats(updatedStats);

      toast.success(`${attendeeIds.length} attendees checked in`);
      setSelectedAttendees({});
    } catch (error) {
      toast.error(error.message || 'Failed to check in attendees');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUndoCheckIn = async (attendeeId, name) => {
    try {
      setActionLoading(true);
      const updatedAttendee = await undoCheckIn(attendeeId, selectedEventId);

      setBrandAttendees((prev) => {
        const updated = { ...prev };
        for (const regId in updated) {
          updated[regId] = updated[regId].map((a) =>
            a._id === attendeeId ? updatedAttendee : a
          );
        }
        return updated;
      });

      const updatedStats = await getEventStats(selectedEventId);
      setStats(updatedStats);

      toast.success(`${name}'s check-in undone`);
    } catch (error) {
      toast.error(error.message || 'Failed to undo check-in');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkNoShow = async (attendeeId, name) => {
    try {
      setActionLoading(true);
      const updatedAttendee = await markNoShow(attendeeId, selectedEventId);

      setBrandAttendees((prev) => {
        const updated = { ...prev };
        for (const regId in updated) {
          updated[regId] = updated[regId].map((a) =>
            a._id === attendeeId ? updatedAttendee : a
          );
        }
        return updated;
      });

      const updatedStats = await getEventStats(selectedEventId);
      setStats(updatedStats);

      toast.success(`${name} marked as no-show`);
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

      let brandId = selectedBrandForWalkin;

      if (isNewBrand) {
        if (
          !newBrandForm.businessName ||
          !newBrandForm.primaryContactName ||
          !newBrandForm.primaryContactPhone
        ) {
          toast.error(
            'Business name, contact name and phone are required for new brand'
          );
          return;
        }

        const newBrand = await createBrand({
          ...newBrandForm,
          recordedBy: 'system',
          status: 'active',
          city: newBrandForm.city || 'Nairobi',
          country: newBrandForm.country || 'Kenya',
        });
        brandId = newBrand._id;
        setBrands((prev) => [newBrand, ...prev]);
      }

      const walkInData = {
        ...walkInForm,
        brandId: brandId,
        eventId: selectedEventId,
        isWalkIn: true,
      };

      await registerWalkIn(walkInData);

      const attendeesData = await getBrandAttendees(selectedEventId);
      setBrandAttendees(attendeesData);

      const updatedStats = await getEventStats(selectedEventId);
      setStats(updatedStats);

      toast.success(`${walkInForm.name} registered as walk-in`);

      // Reset form
      setWalkInForm({
        name: '',
        email: '',
        phone: '',
        company: '',
        tableNumber: '',
        notes: '',
      });
      setSelectedBrandForWalkin(null);
      setIsNewBrand(false);
      setNewBrandForm({
        businessName: '',
        category: '',
        website: '',
        address: '',
        city: '',
        country: '',
        primaryContactName: '',
        primaryContactTitle: '',
        primaryContactEmail: '',
        primaryContactPhone: '',
        notes: '',
      });
      setWalkInOpen(false);
    } catch (error) {
      toast.error(error.message || 'Failed to register walk-in');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      if (!selectedEventId) {
        toast.error('Please select an event first');
        return;
      }

      if (!selectedRegistration) {
        toast.error('Please select a brand first');
        return;
      }

      setActionLoading(true);

      const buffer = await downloadAttendeeTemplate(
        selectedEventId,
        selectedRegistration._id
      );

      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      const brandName =
        selectedRegistration.brandId?.businessName?.replace(/\s+/g, '_') ||
        'brand';
      const packageTier = selectedRegistration.packageTier || 'package';
      const date = new Date().toISOString().split('T')[0];

      link.href = url;
      link.download = `${brandName}_${packageTier}_attendees_${date}.xlsx`;
      link.click();

      window.URL.revokeObjectURL(url);

      toast.success(
        `Template downloaded for ${selectedRegistration.brandId?.businessName}`
      );
    } catch (error) {
      console.log('Frontend caught error:', error);
      toast.error(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadEventAttendees = async () => {
    try {
      if (!selectedEventId) {
        toast.error('Please select an event first');
        return;
      }

      setActionLoading(true);

      const buffer = await downloadEventAttendees(selectedEventId);

      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      const eventName = event?.title?.replace(/\s+/g, '_') || 'event';
      const date = new Date().toISOString().split('T')[0];

      link.href = url;
      link.download = `${eventName}_all_attendees_${date}.xlsx`;
      link.click();

      window.URL.revokeObjectURL(url);

      toast.success('All attendees downloaded successfully');
    } catch (error) {
      console.log('Frontend caught error:', error);
      toast.error(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls)$/)) {
      toast.error('Please upload an Excel file (.xlsx or .xls)');
      e.target.value = null;
      return;
    }

    if (!selectedRegistration) {
      toast.error('Please select a brand first');
      e.target.value = null;
      return;
    }

    try {
      setActionLoading(true);
      setUploadFile(file);
      setUploadProgress('Reading file...');

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target.result;
          const base64 = btoa(
            new Uint8Array(arrayBuffer).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              ''
            )
          );

          setUploadProgress(`Uploading file: ${file.name}...`);

          const result = await bulkUploadAttendees({
            fileBase64: base64,
            eventId: selectedEventId,
          });

          if (result.errors && result.errors.length > 0) {
            toast.warning(
              `Uploaded ${result.imported} attendees. ${result.errors.length} errors.`
            );
            console.error('Upload errors:', result.errors);
          } else {
            toast.success(`${result.imported} attendees uploaded successfully`);
          }

          const attendeesData = await getBrandAttendees(selectedEventId);
          setBrandAttendees(attendeesData);

          const updatedStats = await getEventStats(selectedEventId);
          setStats(updatedStats);

          setBulkUploadOpen(false);
          setUploadFile(null);
          setUploadProgress(null);
          setSelectedRegistration(null);
          e.target.value = null;
        } catch (error) {
          console.error('Upload error:', error);
          toast.error(error.message || 'Failed to process file');
          setUploadProgress(null);
          e.target.value = null;
        } finally {
          setActionLoading(false);
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('File read error:', error);
      toast.error('Failed to read file');
      setUploadProgress(null);
      setActionLoading(false);
      e.target.value = null;
    }
  };

  const getRegistrationStatus = (registration, attendees) => {
    const total = registration.pax;
    const checkedIn =
      attendees?.filter((a) => a.status === 'Checked-In').length || 0;

    if (checkedIn === 0)
      return { status: 'Pending', color: 'bg-yellow-100 text-yellow-800' };
    if (checkedIn < total)
      return { status: 'Partial', color: 'bg-blue-100 text-blue-800' };
    if (checkedIn === total)
      return { status: 'Complete', color: 'bg-green-100 text-green-800' };
    return { status: 'Pending', color: 'bg-yellow-100 text-yellow-800' };
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

  const getPackageBadge = (packageTier) => {
    const packageItem = packages.find(
      (p) => p.name === packageTier || p._id === packageTier
    );
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
      <Badge
        className={colors[packageItem?.name || packageTier] || colors.Standard}
      >
        {packageItem?.name || packageTier}
      </Badge>
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

  const filteredRegistrations = useMemo(() => {
    return registrations.filter((reg) => {
      const brandName = reg.brandId?.businessName?.toLowerCase() || '';
      const matchesSearch =
        searchQuery === '' ||
        brandName.includes(searchQuery.toLowerCase()) ||
        reg.packageTier?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPackage =
        packageFilter === 'All' || reg.packageTier === packageFilter;

      return matchesSearch && matchesPackage;
    });
  }, [registrations, searchQuery, packageFilter]);

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
  const canCheckIn = eventCategory === 'active' || eventCategory === 'today';

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

            <Select value={selectedEventId} onValueChange={setSelectedEventId}>
              <SelectTrigger className="w-full lg:w-[400px]">
                <SelectValue placeholder="Select an event" />
              </SelectTrigger>
              <SelectContent>
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
                <div className="flex gap-2">
                  {/* Download All Attendees Button */}
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-2"
                    onClick={handleDownloadEventAttendees}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <FileDown className="h-5 w-5" />
                    )}
                    Download All Attendees
                  </Button>

                  {/* Bulk Upload Button */}
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-2"
                    onClick={() => {
                      setSelectedRegistration(null);
                      setBulkUploadOpen(true);
                    }}
                    disabled={actionLoading}
                  >
                    <Upload className="h-5 w-5" />
                    Bulk Upload
                  </Button>

                  {/* Walk-in Button */}
                  <Button
                    size="lg"
                    className="gap-2"
                    onClick={() => setWalkInOpen(true)}
                    disabled={actionLoading || !canCheckIn}
                  >
                    <UserPlus className="h-5 w-5" />
                    Walk-in Registration
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                    <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {stats.totalBrands || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Brands Registered
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900">
                    <Users2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {stats.totalExpected || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Total Expected
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
                    <p className="text-2xl font-bold">
                      {stats.totalCheckedIn || 0}
                    </p>
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
                    <p className="text-2xl font-bold">{stats.walkIns || 0}</p>
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
                    <p className="text-2xl font-bold">
                      {stats.checkinRate || 0}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Check-in Rate
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Brands/Registrations Management */}
          <Card>
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <CardTitle>Brand Registrations</CardTitle>
                  <CardDescription>
                    View expected vs actual attendance by brand
                  </CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by brand or package..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-64"
                      disabled={actionLoading}
                    />
                  </div>
                  <Select
                    value={packageFilter}
                    onValueChange={(v) => setPackageFilter(v)}
                    disabled={actionLoading}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Package" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Packages</SelectItem>
                      {packages.map((pkg) => (
                        <SelectItem key={pkg._id} value={pkg.name}>
                          {pkg.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Brand / Company</TableHead>
                      <TableHead>Package</TableHead>
                      <TableHead>Expected (Pax)</TableHead>
                      <TableHead>Checked In</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRegistrations.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No registrations found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRegistrations.map((reg) => {
                        const attendees = brandAttendees[reg._id] || [];
                        const checkedIn = attendees.filter(
                          (a) => a.status === 'Checked-In'
                        ).length;
                        const noShow = attendees.filter(
                          (a) => a.status === 'No-Show'
                        ).length;
                        const pending = reg.pax - checkedIn - noShow;
                        const progress = (checkedIn / reg.pax) * 100;
                        const regStatus = getRegistrationStatus(reg, attendees);

                        return (
                          <TableRow key={reg._id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {reg.brandId?.businessName || 'Unknown Brand'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Contact: {reg.brandId?.primaryContactName}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getPackageBadge(reg.packageTier)}
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold">{reg.pax}</span>
                              <span className="text-sm text-muted-foreground ml-1">
                                people
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  <span className="font-medium">
                                    {checkedIn}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    checked
                                  </span>
                                </div>
                                {pending > 0 && (
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-yellow-500" />
                                    <span className="text-sm">{pending}</span>
                                    <span className="text-xs text-muted-foreground">
                                      pending
                                    </span>
                                  </div>
                                )}
                                {noShow > 0 && (
                                  <div className="flex items-center gap-2">
                                    <UserMinus className="h-4 w-4 text-red-500" />
                                    <span className="text-sm">{noShow}</span>
                                    <span className="text-xs text-muted-foreground">
                                      no-show
                                    </span>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="w-32 space-y-2">
                                <Progress value={progress} className="h-2" />
                                <span className="text-xs text-muted-foreground">
                                  {checkedIn}/{reg.pax} ({Math.round(progress)}
                                  %)
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={regStatus.color}>
                                {regStatus.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                onClick={() => handleBrandSelect(reg)}
                                disabled={actionLoading || !canCheckIn}
                              >
                                <Users className="h-4 w-4 mr-2" />
                                Manage Check-ins
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Walk-ins Section */}
          <Card>
            <CardHeader>
              <CardTitle>Walk-in Attendees</CardTitle>
              <CardDescription>
                Brands that registered on the day of event
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Table</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Check-in Time</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {brandAttendees['walkins']?.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No walk-in attendees
                        </TableCell>
                      </TableRow>
                    ) : (
                      brandAttendees['walkins']?.map((attendee) => (
                        <TableRow key={attendee._id}>
                          <TableCell className="font-medium">
                            {attendee.name}
                          </TableCell>
                          <TableCell>
                            {attendee.brandName || attendee.company || '—'}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="text-sm">{attendee.phone}</p>
                              <p className="text-xs text-muted-foreground">
                                {attendee.email}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{attendee.tableNumber || '—'}</TableCell>
                          <TableCell>
                            {getStatusBadge(attendee.status)}
                          </TableCell>
                          <TableCell>
                            {attendee.checkedInAt
                              ? format(new Date(attendee.checkedInAt), 'HH:mm')
                              : '—'}
                          </TableCell>
                          <TableCell className="text-right">
                            {attendee.status === 'Registered' && canCheckIn && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleAttendeeCheckIn(
                                    attendee._id,
                                    attendee.name
                                  )
                                }
                                disabled={actionLoading}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Check In
                              </Button>
                            )}
                            {attendee.status === 'Checked-In' && canCheckIn && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleUndoCheckIn(attendee._id, attendee.name)
                                }
                                disabled={actionLoading}
                              >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Undo
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Bulk Upload Sheet */}
      <Sheet open={bulkUploadOpen} onOpenChange={setBulkUploadOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Bulk Upload Attendees</SheetTitle>
            <SheetDescription>
              Upload multiple attendees using Excel file. Download template
              first, fill it with attendee data, then upload.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* Brand Selection Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Select Brand
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={selectedRegistration?._id}
                  onValueChange={(value) => {
                    const registration = registrations.find(
                      (r) => r._id === value
                    );
                    setSelectedRegistration(registration);
                    setUploadFile(null);
                    setUploadProgress(null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a brand for template" />
                  </SelectTrigger>
                  <SelectContent>
                    {registrations.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        No brands available
                      </div>
                    ) : (
                      registrations.map((reg) => {
                        const currentCount =
                          brandAttendees[reg._id]?.length || 0;
                        const remainingSlots = reg.pax - currentCount;

                        return (
                          <SelectItem key={reg._id} value={reg._id}>
                            <div className="flex items-center justify-between w-full">
                              <span>
                                {reg.brandId?.businessName || 'Unknown Brand'}
                              </span>
                              <div className="flex items-center gap-2 ml-2">
                                <Badge variant="outline">
                                  {reg.packageTier}
                                </Badge>
                                <Badge
                                  variant={
                                    remainingSlots > 0
                                      ? 'default'
                                      : 'destructive'
                                  }
                                >
                                  {remainingSlots} slots
                                </Badge>
                              </div>
                            </div>
                          </SelectItem>
                        );
                      })
                    )}
                  </SelectContent>
                </Select>

                {selectedRegistration && (
                  <div className="mt-3 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Package:</span>
                      <span className="font-medium">
                        {selectedRegistration.packageTier}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total PAX:</span>
                      <span className="font-medium">
                        {selectedRegistration.pax}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Current attendees:
                      </span>
                      <span className="font-medium">
                        {brandAttendees[selectedRegistration._id]?.length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 border-t mt-1">
                      <span className="text-muted-foreground">
                        Available slots:
                      </span>
                      <span className="font-bold text-green-600">
                        {selectedRegistration.pax -
                          (brandAttendees[selectedRegistration._id]?.length ||
                            0)}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Template Download Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  Step 1: Download Template
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleDownloadTemplate}
                  variant="outline"
                  className="w-full gap-2"
                  disabled={!selectedRegistration || actionLoading}
                >
                  {actionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Download Excel Template
                  {selectedRegistration?.brandId?.businessName &&
                    ` for ${selectedRegistration.brandId.businessName}`}
                </Button>

                <div className="mt-3 bg-blue-50 dark:bg-blue-950/50 p-3 rounded-md">
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-2">
                    Template features:
                  </p>
                  <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1 list-disc pl-4">
                    <li>Brand name pre-filled and locked</li>
                    <li>Required columns: Name *, Phone *</li>
                    <li>Optional: Email, Job Title</li>
                    <li>
                      Rows match your package limit (
                      {selectedRegistration?.pax || 100})
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* File Upload Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Step 2: Upload Filled Template
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    disabled={actionLoading || !selectedRegistration}
                    className="cursor-pointer"
                    key={uploadFile ? 'file-selected' : 'no-file'}
                  />

                  {uploadFile && (
                    <div className="flex items-center justify-between text-sm p-2 bg-muted rounded-md">
                      <span className="truncate max-w-[200px]">
                        {uploadFile.name}
                      </span>
                      <Badge variant="outline">
                        {(uploadFile.size / 1024).toFixed(1)} KB
                      </Badge>
                    </div>
                  )}

                  {uploadProgress && (
                    <div className="flex items-center gap-2 text-sm">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{uploadProgress}</span>
                    </div>
                  )}

                  <div className="border-t pt-3">
                    <p className="text-xs font-medium mb-2">Instructions:</p>
                    <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
                      <li>Fill only Name, Email, Phone, Job Title columns</li>
                      <li>Brand Name is pre-filled - do not change it</li>
                      <li>Phone number is required for each attendee</li>
                      <li>
                        Dont exceed available slots (
                        {selectedRegistration
                          ? selectedRegistration.pax -
                            (brandAttendees[selectedRegistration._id]?.length ||
                              0)
                          : 0}
                        )
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setBulkUploadOpen(false);
                  setUploadFile(null);
                  setUploadProgress(null);
                  setSelectedRegistration(null);
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 gap-2"
                onClick={handleFileUpload}
                disabled={!uploadFile || actionLoading || !selectedRegistration}
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Upload & Process
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Walk-in Registration Sheet */}
      <Sheet open={walkInOpen} onOpenChange={setWalkInOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Walk-in Registration</SheetTitle>
            <SheetDescription>
              Register a brand that did not pre-register
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 mt-6">
            {/* Brand Selection */}
            <div className="space-y-2">
              <Label>Select Brand/Company</Label>
              <div className="flex gap-2">
                <Select
                  value={selectedBrandForWalkin}
                  onValueChange={(value) => {
                    if (value === 'new') {
                      setIsNewBrand(true);
                      setSelectedBrandForWalkin(null);
                    } else {
                      setSelectedBrandForWalkin(value);
                      setIsNewBrand(false);
                      const brand = brands.find((b) => b._id === value);
                      setWalkInForm((prev) => ({
                        ...prev,
                        company: brand?.businessName || '',
                      }));
                    }
                  }}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select existing brand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">
                      <div className="flex items-center gap-2">
                        <PlusCircle className="h-4 w-4" />
                        Register New Brand
                      </div>
                    </SelectItem>
                    {brands.map((brand) => (
                      <SelectItem key={brand._id} value={brand._id}>
                        {brand.businessName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* New Brand Form */}
            {isNewBrand && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">New Brand Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    placeholder="Business Name *"
                    value={newBrandForm.businessName}
                    onChange={(e) =>
                      setNewBrandForm({
                        ...newBrandForm,
                        businessName: e.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="Category"
                    value={newBrandForm.category}
                    onChange={(e) =>
                      setNewBrandForm({
                        ...newBrandForm,
                        category: e.target.value,
                      })
                    }
                  />
                  <div className="border-t pt-3">
                    <p className="text-sm font-medium mb-2">Primary Contact</p>
                    <Input
                      placeholder="Contact Name *"
                      value={newBrandForm.primaryContactName}
                      onChange={(e) =>
                        setNewBrandForm({
                          ...newBrandForm,
                          primaryContactName: e.target.value,
                        })
                      }
                      className="mb-2"
                    />
                    <Input
                      placeholder="Contact Email"
                      type="email"
                      value={newBrandForm.primaryContactEmail}
                      onChange={(e) =>
                        setNewBrandForm({
                          ...newBrandForm,
                          primaryContactEmail: e.target.value,
                        })
                      }
                      className="mb-2"
                    />
                    <Input
                      placeholder="Contact Phone *"
                      value={newBrandForm.primaryContactPhone}
                      onChange={(e) =>
                        setNewBrandForm({
                          ...newBrandForm,
                          primaryContactPhone: e.target.value,
                        })
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Attendee Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Attendee Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  placeholder="Full Name *"
                  value={walkInForm.name}
                  onChange={(e) =>
                    setWalkInForm({
                      ...walkInForm,
                      name: e.target.value,
                    })
                  }
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={walkInForm.email}
                  onChange={(e) =>
                    setWalkInForm({
                      ...walkInForm,
                      email: e.target.value,
                    })
                  }
                />
                <Input
                  placeholder="Phone Number *"
                  value={walkInForm.phone}
                  onChange={(e) =>
                    setWalkInForm({
                      ...walkInForm,
                      phone: e.target.value,
                    })
                  }
                />
                <Input
                  placeholder="Table/Seat Assignment (Optional)"
                  value={walkInForm.tableNumber}
                  onChange={(e) =>
                    setWalkInForm({
                      ...walkInForm,
                      tableNumber: e.target.value,
                    })
                  }
                />
                <Textarea
                  placeholder="Notes (Optional)"
                  value={walkInForm.notes}
                  onChange={(e) =>
                    setWalkInForm({
                      ...walkInForm,
                      notes: e.target.value,
                    })
                  }
                />
              </CardContent>
            </Card>

            <div className="pt-4 border-t">
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
                Register Walk-in & Check In
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Check-in Sheet for Brand */}
      <Sheet open={checkInSheetOpen} onOpenChange={setCheckInSheetOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-xl">
          {selectedRegistration && (
            <>
              <SheetHeader>
                <SheetTitle>
                  Check-in Attendees -{' '}
                  {selectedRegistration.brandId?.businessName}
                </SheetTitle>
                <SheetDescription>
                  Package: {selectedRegistration.packageTier} | Expected:{' '}
                  {selectedRegistration.pax} people | Checked In:{' '}
                  {brandAttendees[selectedRegistration._id]?.filter(
                    (a) => a.status === 'Checked-In'
                  ).length || 0}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-4">
                {/* Progress Summary */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          Check-in Progress
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {brandAttendees[selectedRegistration._id]?.filter(
                            (a) => a.status === 'Checked-In'
                          ).length || 0}
                          /{selectedRegistration.pax}
                        </span>
                      </div>
                      <Progress
                        value={
                          ((brandAttendees[selectedRegistration._id]?.filter(
                            (a) => a.status === 'Checked-In'
                          ).length || 0) /
                            selectedRegistration.pax) *
                          100
                        }
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Add New Attendee Button */}
                <Sheet open={addAttendeeOpen} onOpenChange={setAddAttendeeOpen}>
                  <SheetTrigger asChild>
                    <Button className="w-full gap-2">
                      <UserPlus2 className="h-4 w-4" />
                      Add Arriving Attendee
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="overflow-y-auto sm:max-w-md">
                    <SheetHeader>
                      <SheetTitle>Add Attendee</SheetTitle>
                      <SheetDescription>
                        Record details of arriving person
                      </SheetDescription>
                    </SheetHeader>
                    <div className="space-y-4 mt-6">
                      <Input
                        placeholder="Full Name *"
                        value={addAttendeeForm.name}
                        onChange={(e) =>
                          setAddAttendeeForm({
                            ...addAttendeeForm,
                            name: e.target.value,
                          })
                        }
                      />
                      <Input
                        placeholder="Email"
                        type="email"
                        value={addAttendeeForm.email}
                        onChange={(e) =>
                          setAddAttendeeForm({
                            ...addAttendeeForm,
                            email: e.target.value,
                          })
                        }
                      />
                      <Input
                        placeholder="Phone Number *"
                        value={addAttendeeForm.phone}
                        onChange={(e) =>
                          setAddAttendeeForm({
                            ...addAttendeeForm,
                            phone: e.target.value,
                          })
                        }
                      />
                      <Input
                        placeholder="Job Title"
                        value={addAttendeeForm.jobTitle}
                        onChange={(e) =>
                          setAddAttendeeForm({
                            ...addAttendeeForm,
                            jobTitle: e.target.value,
                          })
                        }
                      />
                      <Input
                        placeholder="Table/Seat Assignment"
                        value={addAttendeeForm.tableNumber}
                        onChange={(e) =>
                          setAddAttendeeForm({
                            ...addAttendeeForm,
                            tableNumber: e.target.value,
                          })
                        }
                      />
                      <Textarea
                        placeholder="Notes"
                        value={addAttendeeForm.notes}
                        onChange={(e) =>
                          setAddAttendeeForm({
                            ...addAttendeeForm,
                            notes: e.target.value,
                          })
                        }
                      />
                      <Button
                        onClick={handleAddAttendeeToBrand}
                        className="w-full"
                        disabled={actionLoading}
                      >
                        {actionLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                        )}
                        Add & Check In
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Bulk Check-in */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Quick Check-in</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {brandAttendees[selectedRegistration._id]?.map(
                        (attendee) => (
                          <div
                            key={attendee._id}
                            className="flex items-center space-x-3"
                          >
                            <Checkbox
                              id={attendee._id}
                              checked={selectedAttendees[attendee._id] || false}
                              onCheckedChange={(checked) => {
                                setSelectedAttendees((prev) => ({
                                  ...prev,
                                  [attendee._id]: checked,
                                }));
                              }}
                              disabled={attendee.status !== 'Registered'}
                            />
                            <Label htmlFor={attendee._id} className="flex-1">
                              <div className="flex items-center justify-between">
                                <span>{attendee.name || 'Unnamed'}</span>
                                {attendee.status === 'Checked-In' && (
                                  <Badge variant="default" className="ml-2">
                                    Checked In
                                  </Badge>
                                )}
                                {attendee.status === 'No-Show' && (
                                  <Badge variant="destructive" className="ml-2">
                                    No-Show
                                  </Badge>
                                )}
                              </div>
                            </Label>
                          </div>
                        )
                      )}

                      <Button
                        className="w-full"
                        onClick={handleBulkCheckIn}
                        disabled={
                          actionLoading ||
                          Object.keys(selectedAttendees).filter(
                            (id) => selectedAttendees[id]
                          ).length === 0
                        }
                      >
                        {actionLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                        )}
                        Check In Selected (
                        {
                          Object.keys(selectedAttendees).filter(
                            (id) => selectedAttendees[id]
                          ).length
                        }
                        )
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Individual Check-ins */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Individual Check-ins
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {brandAttendees[selectedRegistration._id]?.map(
                        (attendee) => (
                          <div
                            key={attendee._id}
                            className="flex items-center justify-between border-b pb-3"
                          >
                            <div>
                              <p className="font-medium">
                                {attendee.name || 'Unnamed'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {attendee.email || attendee.phone}
                              </p>
                              {attendee.tableNumber && (
                                <Badge variant="outline" className="mt-1">
                                  Table: {attendee.tableNumber}
                                </Badge>
                              )}
                            </div>
                            <div className="flex gap-2">
                              {attendee.status === 'Registered' && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleAttendeeCheckIn(
                                        attendee._id,
                                        attendee.name
                                      )
                                    }
                                    disabled={actionLoading}
                                  >
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Check In
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleMarkNoShow(
                                        attendee._id,
                                        attendee.name
                                      )
                                    }
                                    disabled={actionLoading}
                                  >
                                    <UserX className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              {attendee.status === 'Checked-In' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleUndoCheckIn(
                                      attendee._id,
                                      attendee.name
                                    )
                                  }
                                  disabled={actionLoading}
                                >
                                  <RotateCcw className="h-4 w-4 mr-2" />
                                  Undo
                                </Button>
                              )}
                              {attendee.status === 'No-Show' && (
                                <Badge variant="destructive">No-Show</Badge>
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
