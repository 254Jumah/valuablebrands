// 'use client';
// export const dynamic = 'force-dynamic';

// import { useSearchParams } from 'next/navigation';
// import Link from 'next/link';
// import {
//   CheckCircle,
//   AlertCircle,
//   Calendar,
//   MapPin,
//   User,
//   Mail,
//   Phone,
//   Building,
//   Package,
//   Users,
//   QrCode,
// } from 'lucide-react';
// import { useEffect, useState } from 'react';
// import { format } from 'date-fns';

// export default function EventReservation() {
//   const searchParams = useSearchParams();

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [registration, setRegistration] = useState(null);
//   const [event, setEvent] = useState(null);
//   const [brand, setBrand] = useState(null);

//   const registrationId = searchParams?.get('rid');
//   const brandId = searchParams?.get('bid');
//   const eventId = searchParams?.get('eid');

//   useEffect(() => {
//     let isMounted = true;

//     const fetchRegistrationData = async () => {
//       if (!registrationId || !brandId || !eventId) {
//         setError('Invalid QR code.');
//         setLoading(false);
//         return;
//       }

//       try {
//         setLoading(true);

//         const { fetchSingleRegistrations } = await import('@/app/lib/action');

//         const data = await fetchSingleRegistrations(
//           registrationId,
//           brandId,
//           eventId
//         );

//         if (isMounted) {
//           if (data && data.length > 0) {
//             const reg = data[0];
//             setRegistration(reg);
//             setEvent(reg.eventId || {});
//             setBrand(reg.brandId || {});
//           } else {
//             setError('Registration not found.');
//           }
//         }
//       } catch (err) {
//         console.error(err);
//         if (isMounted) {
//           setError('Unable to verify registration.');
//         }
//       } finally {
//         if (isMounted) setLoading(false);
//       }
//     };

//     fetchRegistrationData();
//   }, [registrationId, brandId, eventId]);

//   const formatDate = (date) => (date ? format(new Date(date), 'PPP') : '—');

//   const formatTime = (date) => (date ? format(new Date(date), 'p') : '—');

//   /* ---------------- LOADING ---------------- */

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center space-y-4">
//           <div className="animate-spin h-14 w-14 border-4 border-emerald-200 border-t-emerald-600 rounded-full mx-auto" />
//           <p className="text-emerald-700 font-medium">
//             Verifying registration...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   /* ---------------- ERROR ---------------- */

//   if (error || !registration) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
//         <div className="w-full max-w-md bg-white rounded-xl shadow-lg border p-6 text-center space-y-4">
//           <AlertCircle className="h-14 w-14 text-red-500 mx-auto" />
//           <h2 className="text-xl font-semibold text-gray-800">
//             Registration Invalid
//           </h2>
//           <p className="text-gray-600 text-sm">
//             {error || 'QR code is invalid or registration removed.'}
//           </p>
//           <Link
//             href="/"
//             className="inline-flex justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-white font-medium hover:bg-emerald-700 transition"
//           >
//             Return Home
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   /* ---------------- SUCCESS ---------------- */

//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
//       <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border overflow-hidden">
//         {/* Header */}
//         <div className="bg-emerald-600 text-white text-center px-6 py-8">
//           <CheckCircle className="h-14 w-14 mx-auto mb-3" />
//           <h1 className="text-2xl font-bold">Registration Verified</h1>
//           <p className="text-emerald-100 text-sm mt-1">QR Code Valid</p>
//         </div>

//         <div className="p-6 space-y-6">
//           {/* Status */}
//           <div className="flex justify-between items-center bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
//             <span className="text-sm font-medium text-emerald-800">
//               {registration.registrationStatus || 'Registered'}
//             </span>
//             <span className="text-xs font-mono bg-white px-3 py-1 rounded-full text-emerald-700">
//               ID: {registration._id?.slice(-8)}
//             </span>
//           </div>

//           {/* Event Info */}
//           <Section title="Event Details">
//             <InfoRow icon={<Calendar size={16} />} label="Event">
//               {event?.title}
//             </InfoRow>
//             <InfoRow icon={<MapPin size={16} />} label="Location">
//               {event?.location}
//             </InfoRow>
//             <InfoRow icon={<Calendar size={16} />} label="Date">
//               {formatDate(event?.date)}
//             </InfoRow>
//             <InfoRow icon={<Calendar size={16} />} label="Time">
//               {event?.time || formatTime(event?.date)}
//             </InfoRow>
//           </Section>

//           {/* Package Info */}
//           <Section title="Package Details">
//             <InfoRow icon={<Package size={16} />} label="Tier">
//               {registration?.packageTier}
//             </InfoRow>
//             <InfoRow icon={<Users size={16} />} label="Guests">
//               {registration?.max_pax || '—'}
//             </InfoRow>
//           </Section>

//           {/* Contact Info */}
//           <Section title="Primary Contact">
//             <InfoRow icon={<User size={16} />} label="Name">
//               {registration?.primaryContactName}
//             </InfoRow>
//             <InfoRow icon={<Mail size={16} />} label="Email">
//               {registration?.primaryContactEmail}
//             </InfoRow>
//             <InfoRow icon={<Phone size={16} />} label="Phone">
//               {registration?.primaryContactPhone}
//             </InfoRow>
//             <InfoRow icon={<Building size={16} />} label="Business">
//               {brand?.businessName}
//             </InfoRow>
//           </Section>

//           {/* Notes */}
//           {registration?.notes && (
//             <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm">
//               <strong className="block mb-1 text-amber-800">Notes</strong>
//               <p className="text-amber-700">{registration.notes}</p>
//             </div>
//           )}

//           {/* Actions */}
//           <div className="flex flex-col sm:flex-row gap-4">
//             <button
//               onClick={() => window.print()}
//               className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition"
//             >
//               <QrCode size={18} />
//               Print
//             </button>

//             <Link
//               href="/"
//               className="flex-1 flex items-center justify-center border border-emerald-600 text-emerald-700 py-3 rounded-lg font-medium hover:bg-emerald-50 transition"
//             >
//               Home
//             </Link>
//           </div>

//           <p className="text-xs text-center text-gray-400 pt-4 border-t">
//             Verified on {format(new Date(), 'PPP')}
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ---------------- COMPONENTS ---------------- */

// const Section = ({ title, children }) => (
//   <div className="space-y-3">
//     <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
//       {title}
//     </h3>
//     <div className="space-y-2">{children}</div>
//   </div>
// );

// const InfoRow = ({ icon, label, children }) => (
//   <div className="flex items-start gap-3 text-sm">
//     <div className="text-emerald-600 mt-0.5">{icon}</div>
//     <div>
//       <p className="text-gray-500 text-xs uppercase">{label}</p>
//       <p className="font-medium text-gray-900">{children || '—'}</p>
//     </div>
//   </div>
// );
import React from 'react'; // Required in classic React, optional in modern React setups

function WelcomeMessage() {
  const name = 'User'; // JavaScript logic can be included
  return (
    <div>
      <h1>Hello, {name}!</h1> {/* JSX markup returned */}
      <p>Welcome to the application.</p>
    </div>
  );
}

// In modern React/JavaScript, you'd typically export it
export default WelcomeMessage;
