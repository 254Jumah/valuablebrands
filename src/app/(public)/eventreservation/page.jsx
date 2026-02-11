'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle,
  QrCode,
  Calendar,
  MapPin,
  User,
  Mail,
  Phone,
  Building,
  Tag,
  Package,
  Users,
} from 'lucide-react';
import { fetchSingleRegistrations } from '@/app/lib/action';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';

export default function EventReservation() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registration, setRegistration] = useState(null);
  const [event, setEvent] = useState(null);
  const [brand, setBrand] = useState(null);

  const registrationId = searchParams.get('rid');
  const brandId = searchParams.get('bid');
  const eventId = searchParams.get('eid');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const registrationsData = await fetchSingleRegistrations(
          registrationId,
          brandId,
          eventId
        );

        if (registrationsData && registrationsData.length > 0) {
          const reg = registrationsData[0];
          setRegistration(reg);
          setEvent(reg.eventId || {});
          setBrand(reg.brandId || {});
        } else {
          setRegistration(null);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [registrationId, brandId, eventId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-amber-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-emerald-700 font-medium">
            Loading registration details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !registration) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-amber-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-amber-200">
          <div className="px-6 py-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">❌</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">
              Registration Not Found
            </h1>
            <p className="mt-2 text-gray-600">
              {error || 'The registration details could not be loaded.'}
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 text-white font-semibold hover:bg-emerald-700 transition duration-200"
            >
              Back to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'PPP');
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'h:mm a');
    } catch {
      return '—';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-amber-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-amber-200">
        {/* HEADER */}
        <div className="relative px-8 py-10 text-center bg-gradient-to-r from-emerald-600 via-emerald-700 to-amber-600 text-white">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-24 h-24 bg-amber-400/20 rounded-full -translate-x-12 -translate-y-12"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-400/20 rounded-full translate-x-16 translate-y-16"></div>

          <div className="relative z-10">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-300 rounded-full animate-ping"></div>
                <CheckCircle className="relative h-16 w-16 text-emerald-100 drop-shadow-lg" />
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              REGISTRATION VERIFIED
            </h1>
            <p className="text-emerald-100 text-lg">
              Your registration has been successfully confirmed
            </p>
          </div>
        </div>

        {/* CONTENT */}
        <div className="px-8 py-10 space-y-8">
          {/* MAIN INFO GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT COLUMN - Event Details */}
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-emerald-50 to-amber-50 rounded-2xl p-6 border border-emerald-100">
                <h2 className="text-xl font-bold text-emerald-800 mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Event Details
                </h2>
                <div className="space-y-3">
                  <InfoRow
                    icon={<Calendar className="h-4 w-4 text-emerald-600" />}
                    label="Event Title"
                    value={event?.title || 'Siaya Breakfast'}
                  />
                  <InfoRow
                    icon={<MapPin className="h-4 w-4 text-emerald-600" />}
                    label="Location"
                    value={event?.location || 'Siaya'}
                  />
                  <InfoRow
                    icon={<Calendar className="h-4 w-4 text-emerald-600" />}
                    label="Date"
                    value={formatDate(event?.date)}
                  />
                  <InfoRow
                    icon={<Calendar className="h-4 w-4 text-emerald-600" />}
                    label="Time"
                    value={event?.time || formatTime(event?.date) || '09:00'}
                  />
                  <InfoRow
                    icon={<Users className="h-4 w-4 text-emerald-600" />}
                    label="Capacity"
                    value={`${event?.capacity || 500} attendees`}
                  />
                  <div className="pt-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
                      {event?.category || 'Seminar'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Brand Details */}
              <div className="bg-gradient-to-r from-amber-50 to-emerald-50 rounded-2xl p-6 border border-amber-100">
                <h2 className="text-xl font-bold text-amber-800 mb-4 flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Brand Information
                </h2>
                <div className="space-y-3">
                  <InfoRow
                    icon={<Building className="h-4 w-4 text-amber-600" />}
                    label="Business Name"
                    value={brand?.businessName || 'Tito Dishes'}
                  />
                  <InfoRow
                    icon={<MapPin className="h-4 w-4 text-amber-600" />}
                    label="Address"
                    value={`${brand?.city || 'Kisumu'}, ${brand?.country || 'Kenya'}`}
                  />
                  <InfoRow
                    icon={<Tag className="h-4 w-4 text-amber-600" />}
                    label="Category"
                    value={brand?.category || 'Butchery'}
                  />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN - Registration Details */}
            <div className="space-y-6">
              {/* Registration Info */}
              <div className="bg-gradient-to-r from-emerald-50 to-amber-50 rounded-2xl p-6 border border-emerald-100">
                <h2 className="text-xl font-bold text-emerald-800 mb-4 flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  Registration Details
                </h2>
                <div className="space-y-3">
                  <InfoRow
                    icon={<QrCode className="h-4 w-4 text-emerald-600" />}
                    label="Registration ID"
                    value={registration?._id?.slice(-8) || '—'}
                  />
                  <InfoRow
                    icon={<Package className="h-4 w-4 text-emerald-600" />}
                    label="Package Tier"
                    value={
                      <span className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded text-sm font-medium ${
                            registration?.packageTier === 'Gold'
                              ? 'bg-amber-100 text-amber-800'
                              : registration?.packageTier === 'Silver'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {registration?.packageTier || 'Gold'} Package
                        </span>
                      </span>
                    }
                  />
                  <InfoRow
                    icon={<Users className="h-4 w-4 text-emerald-600" />}
                    label="Max Pax"
                    value={`${registration?.max_pax || 8} persons`}
                  />
                  <InfoRow
                    icon={<Calendar className="h-4 w-4 text-emerald-600" />}
                    label="Registered On"
                    value={formatDate(registration?.createdAt)}
                  />
                </div>
              </div>

              {/* Contact Details */}
              <div className="bg-gradient-to-r from-amber-50 to-emerald-50 rounded-2xl p-6 border border-amber-100">
                <h2 className="text-xl font-bold text-amber-800 mb-4 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Primary Contact
                </h2>
                <div className="space-y-3">
                  <InfoRow
                    icon={<User className="h-4 w-4 text-amber-600" />}
                    label="Name"
                    value={
                      registration?.primaryContactName || 'Titus Olouch Jumah'
                    }
                  />
                  <InfoRow
                    icon={<Mail className="h-4 w-4 text-amber-600" />}
                    label="Email"
                    value={
                      registration?.primaryContactEmail ||
                      'jumahitius@gmail.com'
                    }
                  />
                  <InfoRow
                    icon={<Phone className="h-4 w-4 text-amber-600" />}
                    label="Phone"
                    value={registration?.primaryContactPhone || '+254725968323'}
                  />
                  <InfoRow
                    icon={<User className="h-4 w-4 text-amber-600" />}
                    label="Title"
                    value={registration?.primaryContactTitle || 'Owner'}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* STATUS & NOTES */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Card */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-bold mb-2">Registration Status</h3>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`h-3 w-3 rounded-full animate-pulse ${
                    registration?.registrationStatus === 'Registered'
                      ? 'bg-green-400'
                      : registration?.registrationStatus === 'Pending'
                        ? 'bg-amber-400'
                        : 'bg-red-400'
                  }`}
                ></div>
                <span className="text-xl font-bold">
                  {registration?.registrationStatus || 'Registered'}
                </span>
              </div>
              <p className="text-emerald-100">
                This registration is confirmed and valid. Please present this
                confirmation to event staff upon arrival for seat assignment and
                check-in.
              </p>
            </div>

            {/* Notes Card */}
            <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-2xl p-6 border border-amber-200">
              <h3 className="text-lg font-bold text-amber-800 mb-2">
                Additional Notes
              </h3>
              <p className="text-amber-700">
                {registration?.notes || 'Welcome notes will appear here.'}
              </p>
            </div>
          </div>

          {/* TAGS */}
          {registration?.tags && registration.tags.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-emerald-100">
              <h3 className="text-lg font-bold text-emerald-800 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {registration.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-emerald-100 to-amber-100 text-emerald-800 border border-emerald-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/"
                className="flex-1 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4 text-white font-semibold hover:from-emerald-700 hover:to-emerald-800 transition duration-200 shadow-lg hover:shadow-xl"
              >
                Back to Homepage
              </Link>
              <button
                onClick={() => window.print()}
                className="flex-1 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4 text-white font-semibold hover:from-amber-600 hover:to-amber-700 transition duration-200 shadow-lg hover:shadow-xl"
              >
                Print Confirmation
              </button>
            </div>
            <p className="text-center text-sm text-gray-600">
              Please present this confirmation page to the event administrator
              upon arrival.
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="bg-gradient-to-r from-emerald-800 to-amber-800 px-8 py-6 text-center text-emerald-100">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-left">
              <p className="font-bold text-lg">Event Management System</p>
              <p className="text-sm text-emerald-200">
                Professional Event Registration
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <p className="text-sm">
                © {new Date().getFullYear()} All rights reserved
              </p>
              <p className="text-xs text-emerald-300 mt-1">
                Registration ID: {registration?._id?.slice(-12)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- INFO ROW COMPONENT ---------- */
const InfoRow = ({ icon, label, value }) => {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-white/50 hover:bg-white/80 transition duration-200">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-emerald-100 to-amber-100 shadow-sm">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {label}
        </p>
        <p className="font-semibold text-gray-800 wrap-break-word mt-1">
          {value}
        </p>
      </div>
    </div>
  );
};
