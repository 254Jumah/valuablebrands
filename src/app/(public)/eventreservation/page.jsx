'use client';
export const dynamic = 'force-dynamic';

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
  AlertCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';

export default function EventReservation() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registration, setRegistration] = useState(null);
  const [event, setEvent] = useState(null);
  const [brand, setBrand] = useState(null);

  const registrationId = searchParams?.get('rid');
  const brandId = searchParams?.get('bid');
  const eventId = searchParams?.get('eid');

  useEffect(() => {
    let isMounted = true;

    const fetchRegistrationData = async () => {
      // Check if we're in browser environment and have required params
      if (typeof window === 'undefined') {
        return;
      }

      if (!registrationId || !brandId || !eventId) {
        if (isMounted) {
          setError('Invalid QR code. Missing registration information.');
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);

        // Dynamic import to avoid server-side evaluation
        const { fetchSingleRegistrations } = await import('@/app/lib/action');

        const registrationsData = await fetchSingleRegistrations(
          registrationId,
          brandId,
          eventId
        );

        if (isMounted) {
          if (registrationsData && registrationsData.length > 0) {
            const reg = registrationsData[0];
            setRegistration(reg);
            setEvent(reg.eventId || {});
            setBrand(reg.brandId || {});
          } else {
            setRegistration(null);
            setError('Registration not found. Please verify your QR code.');
          }
        }
      } catch (err) {
        console.error('Failed to fetch registration:', err);
        if (isMounted) {
          setError('Unable to load registration details. Please try again.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchRegistrationData();
  }, [registrationId, brandId, eventId]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-amber-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-600 mx-auto"></div>
            <QrCode className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-emerald-600" />
          </div>
          <p className="mt-6 text-emerald-700 font-medium text-lg">
            Verifying your registration...
          </p>
          <p className="mt-2 text-emerald-600 text-sm">
            Please wait while we confirm your details
          </p>
        </div>
      </div>
    );
  }

  // Error state - Invalid QR or registration not found
  if (error || !registration) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-amber-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-red-200">
          <div className="px-6 py-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Registration Not Found
            </h1>
            <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6">
              <p className="text-gray-600">
                {error ||
                  'The QR code you scanned is invalid or the registration has been removed.'}
              </p>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Registration ID: {registrationId?.slice(-8) || 'N/A'}
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 text-white font-semibold hover:bg-emerald-700 transition duration-200"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success state - Valid registration found
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return format(date, 'PPP');
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return format(date, 'h:mm a');
    } catch {
      return '—';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-amber-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-200">
        {/* Success Header */}
        <div className="relative px-8 py-10 text-center bg-gradient-to-r from-emerald-600 via-emerald-700 to-amber-600 text-white">
          <div className="absolute top-0 left-0 w-32 h-32 bg-amber-400/20 rounded-full -translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-emerald-400/20 rounded-full translate-x-20 translate-y-20"></div>

          <div className="relative z-10">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-300 rounded-full animate-ping opacity-75"></div>
                <CheckCircle className="relative h-16 w-16 text-white drop-shadow-lg" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
              ✓ REGISTRATION VERIFIED
            </h1>
            <p className="text-emerald-100 text-lg">
              Valid QR Code • Registration Confirmed
            </p>
          </div>
        </div>

        {/* Registration Content */}
        <div className="px-6 md:px-8 py-8 space-y-6">
          {/* Quick Status Bar */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
              <span className="font-semibold text-emerald-800">Status:</span>
              <span className="text-emerald-700">
                {registration?.registrationStatus || 'Registered'}
              </span>
            </div>
            <div className="text-sm text-emerald-600 font-mono bg-white px-3 py-1 rounded-full">
              ID: {registration?._id?.slice(-8)}
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Event Details */}
            <div className="bg-white rounded-xl p-6 border border-emerald-100 shadow-sm">
              <h2 className="text-xl font-bold text-emerald-800 mb-4 flex items-center gap-2 border-b border-emerald-100 pb-3">
                <Calendar className="h-5 w-5" />
                Event Information
              </h2>
              <div className="space-y-4">
                <DetailRow
                  icon={<MapPin className="h-4 w-4" />}
                  label="Event"
                  value={event?.title || '—'}
                />
                <DetailRow
                  icon={<MapPin className="h-4 w-4" />}
                  label="Location"
                  value={event?.location || '—'}
                />
                <DetailRow
                  icon={<Calendar className="h-4 w-4" />}
                  label="Date"
                  value={formatDate(event?.date)}
                />
                <DetailRow
                  icon={<Calendar className="h-4 w-4" />}
                  label="Time"
                  value={event?.time || formatTime(event?.date) || '—'}
                />
              </div>
            </div>

            {/* Registration Details */}
            <div className="bg-white rounded-xl p-6 border border-amber-100 shadow-sm">
              <h2 className="text-xl font-bold text-amber-800 mb-4 flex items-center gap-2 border-b border-amber-100 pb-3">
                <Package className="h-5 w-5" />
                Package Details
              </h2>
              <div className="space-y-4">
                <DetailRow
                  icon={<Tag className="h-4 w-4" />}
                  label="Package"
                  value={
                    <span
                      className={`inline-flex px-2 py-1 rounded-md text-sm font-medium ${
                        registration?.packageTier === 'Gold'
                          ? 'bg-amber-100 text-amber-800'
                          : registration?.packageTier === 'Silver'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {registration?.packageTier || 'Standard'}
                    </span>
                  }
                />
                <DetailRow
                  icon={<Users className="h-4 w-4" />}
                  label="Max Pax"
                  value={
                    registration?.max_pax
                      ? `${registration.max_pax} guests`
                      : '—'
                  }
                />
                <DetailRow
                  icon={<Calendar className="h-4 w-4" />}
                  label="Registered"
                  value={formatDate(registration?.createdAt)}
                />
              </div>
            </div>

            {/* Contact Details */}
            <div className="bg-white rounded-xl p-6 border border-emerald-100 shadow-sm lg:col-span-2">
              <h2 className="text-xl font-bold text-emerald-800 mb-4 flex items-center gap-2 border-b border-emerald-100 pb-3">
                <User className="h-5 w-5" />
                Primary Contact
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailRow
                  icon={<User className="h-4 w-4" />}
                  label="Name"
                  value={registration?.primaryContactName || '—'}
                />
                <DetailRow
                  icon={<Mail className="h-4 w-4" />}
                  label="Email"
                  value={registration?.primaryContactEmail || '—'}
                />
                <DetailRow
                  icon={<Phone className="h-4 w-4" />}
                  label="Phone"
                  value={registration?.primaryContactPhone || '—'}
                />
                <DetailRow
                  icon={<Building className="h-4 w-4" />}
                  label="Business"
                  value={brand?.businessName || '—'}
                />
              </div>
            </div>
          </div>

          {/* Notes Section */}
          {registration?.notes && (
            <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
              <h3 className="font-semibold text-amber-800 mb-2">
                Additional Notes
              </h3>
              <p className="text-amber-700">{registration.notes}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={() => window.print()}
              className="flex-1 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4 text-white font-semibold hover:from-emerald-700 hover:to-emerald-800 transition duration-200 shadow-lg"
            >
              <QrCode className="h-5 w-5 mr-2" />
              Print Confirmation
            </button>
            <Link
              href="/"
              className="flex-1 inline-flex items-center justify-center rounded-xl bg-white border-2 border-emerald-600 px-6 py-4 text-emerald-700 font-semibold hover:bg-emerald-50 transition duration-200"
            >
              Back to Home
            </Link>
          </div>

          <p className="text-center text-xs text-gray-500 pt-4 border-t border-gray-100">
            This is an official registration confirmation. Please present this
            page or printed copy at the event check-in.
            <br />
            Registration ID: {registration?._id} • Scanned on{' '}
            {format(new Date(), 'PPP')}
          </p>
        </div>
      </div>
    </div>
  );
}

// Reusable detail row component
const DetailRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-emerald-600">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="font-medium text-gray-900 break-words">{value}</p>
    </div>
  </div>
);
