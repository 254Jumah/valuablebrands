'use client';
import { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Calendar,
  MapPin,
  Video,
  Clock,
  Users,
  Loader2,
  X,
  Save,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// API service functions
import {
  addEvent,
  updateEvent,
  deleteEvent,
  fetchEventBrands,
  fetchEvents,
} from '@/app/lib/action';
import useAuth from '@/app/hooks/useAuth';
import Image from 'next/image';

// Event Form initial state
const initialEventForm = {
  title: '',
  date: '',
  time: '09:00',
  location: '',
  description: '',
  category: '',
  featured: false,
  image: '',
  youtubeUrl: '',
  capacity: 0,
  price: 0,
  status: 'Upcoming',
};

export default function AdminEvents() {
  const { email, name, role, id } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Event Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState(initialEventForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [editingEventId, setEditingEventId] = useState(null);

  // View modal state
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [eventBrands, setEventBrands] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(false);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');

  const categories = useMemo(() => {
    if (!events || events.length === 0) return [];
    // Extract unique categories from events
    const uniqueCategories = [
      ...new Set(events.map((event) => event.category).filter(Boolean)),
    ];

    return uniqueCategories;
  }, [events]);

  // Countdown timer component
  const EventCountdown = ({ eventDate }) => {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

    useEffect(() => {
      const calculateTimeLeft = () => {
        const now = new Date();
        const event = new Date(eventDate);
        const difference = event - now;

        if (difference > 0) {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24));
          const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((difference / (1000 * 60)) % 60);

          return { days, hours, minutes };
        }
        return { days: 0, hours: 0, minutes: 0 };
      };

      const timer = setInterval(() => {
        setTimeLeft(calculateTimeLeft());
      }, 60000);

      setTimeLeft(calculateTimeLeft());
      return () => clearInterval(timer);
    }, [eventDate]);

    const isPastEvent = new Date(eventDate) < new Date();

    if (isPastEvent) {
      return (
        <Badge variant="destructive" className="text-xs">
          <Clock className="h-3 w-3 mr-1" />
          Ended
        </Badge>
      );
    }

    if (timeLeft.days > 30) {
      return (
        <div className="text-xs text-blue-600">{timeLeft.days} days left</div>
      );
    }

    if (timeLeft.days > 0) {
      return (
        <div className="text-xs text-orange-600 font-medium">
          {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
        </div>
      );
    }

    return (
      <div className="text-xs text-green-600 font-medium">
        Today! {timeLeft.hours}h {timeLeft.minutes}m
      </div>
    );
  };

  // Fetch events
  const getEventsData = async () => {
    setLoading(true);
    try {
      const data = await fetchEvents();
      setEvents(data || []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      setError('Failed to load events data');
      toast.error('Failed to load events data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch brands for an event
  const getEventBrands = async (eventId) => {
    setLoadingBrands(true);
    try {
      const brands = await fetchEventBrands(eventId);
      setEventBrands(brands || []);
    } catch (error) {
      console.error('Failed to fetch event brands:', error);
      toast.error('Failed to load registered brands');
    } finally {
      setLoadingBrands(false);
    }
  };

  useEffect(() => {
    getEventsData();
  }, []);

  // Filter events
  const filteredEvents = events.filter((event) =>
    event.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Event Form Handlers
  const openCreateForm = () => {
    setFormData({
      ...initialEventForm,
      date: new Date().toISOString().split('T')[0],
    });
    setEditingEventId(null);
    setFormError('');
    setIsFormOpen(true);
  };

  const openEditForm = (event) => {
    setFormData({
      title: event.title || '',
      date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
      time: event.time || '09:00',
      location: event.location || '',
      description: event.description || '',
      category: event.category || '',
      featured: event.featured || false,
      image: event.image || '',
      youtubeUrl: event.youtubeUrl || '',
      capacity: event.capacity || 0,
      price: event.price || 0,
      status: event.status || 'Upcoming',
    });
    setEditingEventId(event._id || event.id);
    setFormError('');
    setIsFormOpen(true);
  };

  const openViewModal = async (event) => {
    setSelectedEvent(event);
    await getEventBrands(event._id || event.id);
    setIsViewModalOpen(true);
  };

  const openDeleteModal = (event) => {
    setDeletingEvent(event);
    setIsDeleteModalOpen(true);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setFormError('Event title is required');
      return false;
    }
    if (!formData.date) {
      setFormError('Event date is required');
      return false;
    }
    if (!formData.location.trim()) {
      setFormError('Location is required');
      return false;
    }
    if (!formData.category.trim()) {
      setFormError('Category is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setFormError('');

    try {
      const eventData = {
        title: formData.title,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        description: formData.description,
        category: formData.category,
        featured: formData.featured,
        recordedBy: name || email,
        capacity: formData.capacity || undefined,

        status: formData.status,
      };

      if (editingEventId) {
        const response = await updateEvent(editingEventId, eventData);

        if (!response.success) {
          throw new Error(response.message);
        }

        setEvents((prev) =>
          prev.map((event) =>
            (event._id || event.id) === editingEventId ? response.data : event
          )
        );

        toast.success(response.message);
        getEventsData();
      } else {
        // Create event
        const response = await addEvent(eventData);

        if (!response.success) {
          throw new Error(response.message);
        }

        setEvents((prev) => [response.data, ...prev]);
        toast.success(response.message);
      }

      setIsFormOpen(false);
      setFormData(initialEventForm);
      setEditingEventId(null);
      getEventsData();
    } catch (err) {
      console.error('Submission error:', err);
      setFormError(`Failed to save: ${err.message}`);
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  const categoriess = [
    'Conference',
    'Workshop',
    'Seminar',
    'Webinar',
    'Breakfast',
    'Networking',
    'Exhibition',
    'Training & Talks',
    'Pitching',
    'Meals & Social',
    'Investor Sessions',
    'Virtual',
  ];

  const handleDeleteEvent = async (eventId, reason) => {
    try {
      const result = await deleteEvent(eventId, reason);

      if (!result.success) {
        throw new Error(result.message || 'Failed to delete event');
      }

      // Update local state
      setEvents((prev) =>
        prev.filter((event) => (event._id || event.id) !== eventId)
      );

      toast.success('Event deleted successfully!');
      setIsDeleteModalOpen(false);
      setDeletingEvent(null);
      setDeleteReason('');
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error(error.message);
    }
  };

  // Table Skeleton
  const TableSkeleton = () => {
    return (
      <>
        {[1, 2, 3, 4, 5].map((i) => (
          <TableRow key={i} className="hover:bg-muted/30">
            <TableCell className="p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </TableCell>
            <TableCell className="p-4">
              <Skeleton className="h-4 w-24" />
            </TableCell>
            <TableCell className="p-4">
              <Skeleton className="h-4 w-32" />
            </TableCell>
            <TableCell className="p-4">
              <Skeleton className="h-6 w-16 rounded-full" />
            </TableCell>
            <TableCell className="p-4">
              <Skeleton className="h-6 w-16 rounded-full" />
            </TableCell>
            <TableCell className="p-4">
              <div className="flex justify-end gap-2">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </>
    );
  };

  return (
    <div className="space-y-8">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">
            Manage Events
          </h1>
          <p className="text-muted-foreground">
            Create, edit, and manage your events
          </p>
        </div>
        <Button
          onClick={openCreateForm}
          className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={getEventsData}
            className="mt-2 border-red-200 text-red-700 hover:bg-red-100"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {categories.length > 0 && (
            <Select
              onValueChange={(value) => {
                if (value === 'all') {
                  setSearchQuery('');
                } else {
                  setSearchQuery(value);
                }
              }}
            >
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-card rounded-xl shadow-soft border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="p-4 font-medium text-sm">Event</TableHead>
                <TableHead className="p-4 font-medium text-sm">Date</TableHead>
                <TableHead className="p-4 font-medium text-sm">
                  Location
                </TableHead>
                <TableHead className="p-4 font-medium text-sm">
                  Capacity
                </TableHead>

                <TableHead className="p-4 font-medium text-sm">
                  Category
                </TableHead>
                <TableHead className="p-4 font-medium text-sm">
                  Status
                </TableHead>
                <TableHead className="p-4 font-medium text-sm text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableSkeleton />
              ) : filteredEvents.length > 0 ? (
                filteredEvents.map((event) => (
                  <TableRow
                    key={event._id || event.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Calendar className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {event.youtubeUrl && (
                              <span className="flex items-center gap-1">
                                <Video className="w-3 h-3" /> Has Video
                              </span>
                            )}
                            {event.featured && (
                              <span className="text-primary">Featured</span>
                            )}
                          </div>
                          <div className="mt-1">
                            <EventCountdown eventDate={event.date} />
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="p-4 text-sm">
                      {new Date(event.date).toLocaleDateString('en-KE', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                      {event.time && (
                        <div className="text-xs text-muted-foreground">
                          {event.time}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="p-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate max-w-[150px]">
                          {event.location}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="p-4">
                      <span className="px-3 py-1 rounded-full bg-muted text-xs font-medium">
                        {event.capacity}
                      </span>
                    </TableCell>
                    <TableCell className="p-4">
                      <span className="px-3 py-1 rounded-full bg-muted text-xs font-medium">
                        {event.category}
                      </span>
                    </TableCell>
                    <TableCell className="p-4">
                      <Badge
                        variant={
                          event.status === 'Ongoing' ? 'default' : 'outline'
                        }
                        className={`
                          ${event.status === 'Upcoming' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200' : ''}
                          ${event.status === 'Ongoing' ? 'bg-green-100 text-green-800 hover:bg-green-100 border-green-200' : ''}
                          ${event.status === 'Completed' ? 'bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200' : ''}
                        `}
                      >
                        {event.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openViewModal(event)}
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditForm(event)}
                          title="Edit Event"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteModal(event)}
                          title="Delete Event"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="p-12 text-center">
                    <div className="space-y-4">
                      <Calendar className="w-12 h-12 text-muted-foreground mx-auto" />
                      <div>
                        <h3 className="font-medium">No events found</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {searchQuery
                            ? 'Try adjusting your search'
                            : 'Create your first event to get started'}
                        </p>
                      </div>
                      {!searchQuery && (
                        <Button onClick={openCreateForm}>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Event
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Event Form Sheet */}
      {/* Event Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEventId ? 'Edit Event' : 'Create New Event'}
            </DialogTitle>
            <DialogDescription>
              {editingEventId
                ? 'Update event details'
                : 'Add a new event to the calendar'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {formError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 font-medium">{formError}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">
                Event Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter event title"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date *</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Time</label>
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Location *
              </label>
              <Input
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Enter event location"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Category *
              </label>

              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>

                <SelectContent>
                  {categoriess.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange('description', e.target.value)
                }
                placeholder="Describe the event..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Capacity
                </label>
                <Input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) =>
                    handleInputChange('capacity', parseInt(e.target.value) || 0)
                  }
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Upcoming">Upcoming</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-end pt-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) =>
                      handleInputChange('featured', e.target.checked)
                    }
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className="text-sm font-medium">Featured Event</span>
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : editingEventId ? (
                'Update Event'
              ) : (
                'Create Event'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Event Sheet */}
      <Sheet open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-2xl lg:max-w-4xl p-0"
        >
          <SheetHeader className="border-b px-6 py-4">
            {selectedEvent && (
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <SheetTitle className="text-lg font-semibold truncate">
                    {selectedEvent.title}
                  </SheetTitle>
                  {selectedEvent.featured && (
                    <Badge className="mt-1 bg-gradient-to-r from-yellow-500 to-orange-500">
                      Featured
                    </Badge>
                  )}
                </div>
                <SheetClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </SheetClose>
              </div>
            )}
          </SheetHeader>

          <div className="overflow-y-auto max-h-[calc(100vh-4rem)] px-6 py-4">
            {selectedEvent && (
              <div className="space-y-6">
                {/* Event Image - Mobile Optimized */}
                {selectedEvent.image && (
                  <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 aspect-video">
                    <Image
                      src={selectedEvent.image}
                      alt={selectedEvent.title}
                      className="w-full h-full object-cover"
                      width={800}
                      height={450}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                )}

                {/* Quick Info Cards - Mobile Optimized */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="text-xs font-medium text-blue-700">
                        Date
                      </span>
                    </div>
                    <p className="text-sm font-semibold">
                      {new Date(selectedEvent.date).toLocaleDateString(
                        'en-KE',
                        {
                          day: 'numeric',
                          month: 'short',
                        }
                      )}
                    </p>
                  </div>

                  <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-green-600" />
                      <span className="text-xs font-medium text-green-700">
                        Time
                      </span>
                    </div>
                    <p className="text-sm font-semibold">
                      {selectedEvent.time || 'TBD'}
                    </p>
                  </div>

                  <div className="bg-purple-50 border border-purple-100 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="h-4 w-4 text-purple-600" />
                      <span className="text-xs font-medium text-purple-700">
                        Location
                      </span>
                    </div>
                    <p className="text-sm font-semibold truncate">
                      {selectedEvent.location}
                    </p>
                  </div>

                  <div className="bg-orange-50 border border-orange-100 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="h-4 w-4 text-orange-600" />
                      <span className="text-xs font-medium text-orange-700">
                        Status
                      </span>
                    </div>
                    <Badge
                      variant={
                        selectedEvent.status === 'Ongoing'
                          ? 'default'
                          : 'outline'
                      }
                      className={`
                        ${selectedEvent.status === 'Upcoming' ? 'bg-blue-100 text-blue-800 border-blue-200' : ''}
                        ${selectedEvent.status === 'Ongoing' ? 'bg-green-100 text-green-800 border-green-200' : ''}
                        ${selectedEvent.status === 'Completed' ? 'bg-gray-100 text-gray-800 border-gray-200' : ''}
                        text-xs font-medium
                      `}
                    >
                      {selectedEvent.status}
                    </Badge>
                  </div>
                </div>

                {/* Countdown Timer - Mobile Optimized */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm">Event Countdown</h3>
                    <Clock className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="flex justify-center">
                    <div className="bg-white border border-gray-300 rounded-lg p-4 w-full max-w-xs">
                      <EventCountdown eventDate={selectedEvent.date} />
                    </div>
                  </div>
                </div>

                {/* Description Section */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Description</h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {selectedEvent.description || 'No description provided.'}
                    </p>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedEvent.capacity > 0 && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-sm mb-2">Capacity</h3>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium">
                          {selectedEvent.capacity} attendees
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedEvent.price > 0 && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-sm mb-2">
                        Ticket Price
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-green-700">
                          KES {selectedEvent.price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedEvent.youtubeUrl && (
                    <div className="col-span-2">
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-sm mb-2">
                          Video Link
                        </h3>
                        <a
                          href={selectedEvent.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-blue-600 hover:underline text-sm"
                        >
                          <Video className="h-4 w-4" />
                          Watch on YouTube
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Registered Brands Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">Registered Brands</h3>
                    <Badge variant="outline" className="text-xs">
                      {eventBrands.length} registered
                    </Badge>
                  </div>

                  {loadingBrands ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2 flex-1">
                              <Skeleton className="h-3 w-32" />
                              <Skeleton className="h-2 w-24" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : eventBrands.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="text-left p-3 font-medium">
                                Business
                              </th>
                              <th className="text-left p-3 font-medium">
                                Contact
                              </th>
                              <th className="text-left p-3 font-medium">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {eventBrands.map((brand) => (
                              <tr
                                key={brand._id || brand.id}
                                className="hover:bg-gray-50"
                              >
                                <td className="p-3">
                                  <div>
                                    <p className="font-medium">
                                      {brand.businessName}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      {brand.primaryContactEmail}
                                    </p>
                                  </div>
                                </td>
                                <td className="p-3">
                                  <div>
                                    <p>{brand.primaryContactName}</p>
                                    <p className="text-xs text-gray-600">
                                      {brand.primaryContactPhone}
                                    </p>
                                  </div>
                                </td>
                                <td className="p-3">
                                  <Badge
                                    variant={
                                      brand.status === 'Confirmed'
                                        ? 'default'
                                        : 'outline'
                                    }
                                    className={`
                                      ${brand.status === 'Confirmed' ? 'bg-green-100 text-green-800 border-green-200' : ''}
                                      ${brand.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : ''}
                                      ${brand.status === 'Cancelled' ? 'bg-red-100 text-red-800 border-red-200' : ''}
                                      text-xs
                                    `}
                                  >
                                    {brand.status}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 text-sm">
                        No brands registered for this event yet
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        Brands will appear here once they register
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Event Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Delete Event
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <strong>{deletingEvent?.title}</strong>? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> Deleting this event will permanently
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
                placeholder="Please explain why you are deleting this event..."
                className="w-full min-h-32 rounded-md border px-3 py-2 text-sm"
                rows={4}
              />
              <p className="text-xs text-gray-500">
                This helps us improve our processes. Minimum 10 characters.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeletingEvent(null);
                setDeleteReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                handleDeleteEvent(
                  deletingEvent?._id || deletingEvent?.id,
                  deleteReason
                )
              }
              disabled={!deleteReason.trim() || deleteReason.trim().length < 10}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
