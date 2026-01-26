import { useState, useCallback, useMemo } from 'react';

// Default mock data in case imports fail
const defaultPackageCatalog = {
  Bronze: {
    price: 150000,
    includedPax: 2,
    benefits: ['Event attendance', 'Networking session', 'Digital certificate'],
  },
  Silver: {
    price: 300000,
    includedPax: 4,
    benefits: [
      'All Bronze benefits',
      'Premium seating',
      'Featured in event booklet',
    ],
  },
  Gold: {
    price: 500000,
    includedPax: 6,
    benefits: [
      'All Silver benefits',
      'VIP lounge access',
      'Stage recognition',
      'Media coverage',
    ],
  },
};

const defaultBrands = [
  {
    id: 'b_1',
    businessName: 'Tech Innovators Ltd',
    category: 'Technology',
    primaryContact: {
      name: 'John Doe',
      email: 'john@techinnovators.com',
      phone: '+254712345678',
    },
    createdAt: '2024-01-15T09:00:00.000Z',
  },
  {
    id: 'b_2',
    businessName: 'Green Solutions Kenya',
    category: 'Environmental',
    primaryContact: {
      name: 'Jane Smith',
      email: 'jane@greensolutions.co.ke',
      phone: '+254723456789',
    },
    createdAt: '2024-02-20T11:30:00.000Z',
  },
];

const defaultRegistrations = [
  {
    id: 'r_1',
    brandId: 'b_1',
    eventName: 'SME Excellence Awards 2024',
    packageTier: 'Gold',
    pax: 6,
    registrationStatus: 'Registered',
    invoiceStatus: 'Paid',
    invoiceNumber: 'INV-2024-001',
    amountTotal: 500000,
    amountPaid: 500000,
    dueDate: '2024-06-15T00:00:00.000Z',
    notes: 'VIP table requested near stage',
    reminders: [
      {
        id: 'rm_1',
        channel: 'Call',
        scheduledFor: '2024-05-20T10:00:00.000Z',
        status: 'Done',
        note: 'Confirmed attendance and seating',
      },
    ],
    updatedAt: '2024-05-15T10:30:00.000Z',
  },
  {
    id: 'r_2',
    brandId: 'b_2',
    eventName: 'SME Excellence Awards 2024',
    packageTier: 'Silver',
    pax: 4,
    registrationStatus: 'Interested',
    invoiceStatus: 'Sent',
    invoiceNumber: 'INV-2024-002',
    amountTotal: 300000,
    amountPaid: 150000,
    dueDate: '2024-06-30T00:00:00.000Z',
    notes: 'Awaiting board approval',
    reminders: [
      {
        id: 'rm_2',
        channel: 'Email',
        scheduledFor: '2024-05-25T14:00:00.000Z',
        status: 'Planned',
        note: 'Follow up on invoice payment',
      },
    ],
    updatedAt: '2024-05-10T14:20:00.000Z',
  },
];

// Try to import actual data, fall back to defaults
let importedBrands = defaultBrands;
let importedRegistrations = defaultRegistrations;

try {
  const { initialEventRegistrations } = await import('@/data/mockEventFinance');
  importedRegistrations = initialEventRegistrations || defaultRegistrations;
} catch (error) {
  console.warn('Could not load mockEventFinance, using default data');
}

try {
  const { initialBrands } = await import('@/app/admin/brands/page');
  importedBrands = initialBrands || defaultBrands;
} catch (error) {
  console.warn('Could not load brands data, using default data');
}

export function useEventFinance() {
  const [brands, setBrands] = useState(() => importedBrands);
  const [registrations, setRegistrations] = useState(
    () => importedRegistrations
  );

  // Generate ID helper
  const generateId = (prefix) =>
    `${prefix}_${Math.random().toString(36).slice(2, 10)}`;

  // Brand operations
  const addBrand = useCallback((brandData) => {
    const newBrand = {
      ...brandData,
      id: generateId('b'),
      createdAt: new Date().toISOString(),
    };
    setBrands((prev) => [newBrand, ...prev]);
    return newBrand;
  }, []);

  const updateBrand = useCallback((id, updates) => {
    setBrands((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
  }, []);

  const deleteBrand = useCallback((id) => {
    setBrands((prev) => prev.filter((b) => b.id !== id));
    // Also delete all registrations for this brand
    setRegistrations((prev) => prev.filter((r) => r.brandId !== id));
  }, []);

  const getBrandById = useCallback(
    (id) => {
      return brands.find((b) => b.id === id);
    },
    [brands]
  );

  // Registration operations
  const addRegistration = useCallback((regData) => {
    const newReg = {
      ...regData,
      id: generateId('r'),
      reminders: [],
      updatedAt: new Date().toISOString(),
    };
    setRegistrations((prev) => [newReg, ...prev]);
    return newReg;
  }, []);

  const updateRegistration = useCallback((id, updates) => {
    setRegistrations((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, ...updates, updatedAt: new Date().toISOString() }
          : r
      )
    );
  }, []);

  const deleteRegistration = useCallback((id) => {
    setRegistrations((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const getRegistrationById = useCallback(
    (id) => {
      return registrations.find((r) => r.id === id);
    },
    [registrations]
  );

  const getRegistrationsByBrandId = useCallback(
    (brandId) => {
      return registrations.filter((r) => r.brandId === brandId);
    },
    [registrations]
  );

  // Reminder operations
  const addReminder = useCallback((registrationId, reminder) => {
    const newReminder = {
      ...reminder,
      id: generateId('rm'),
    };
    setRegistrations((prev) =>
      prev.map((r) =>
        r.id === registrationId
          ? {
              ...r,
              reminders: [...(r.reminders || []), newReminder],
              updatedAt: new Date().toISOString(),
            }
          : r
      )
    );
  }, []);

  const updateReminder = useCallback((registrationId, reminderId, updates) => {
    setRegistrations((prev) =>
      prev.map((r) =>
        r.id === registrationId
          ? {
              ...r,
              reminders: (r.reminders || []).map((rm) =>
                rm.id === reminderId ? { ...rm, ...updates } : rm
              ),
              updatedAt: new Date().toISOString(),
            }
          : r
      )
    );
  }, []);

  const deleteReminder = useCallback((registrationId, reminderId) => {
    setRegistrations((prev) =>
      prev.map((r) =>
        r.id === registrationId
          ? {
              ...r,
              reminders: (r.reminders || []).filter(
                (rm) => rm.id !== reminderId
              ),
              updatedAt: new Date().toISOString(),
            }
          : r
      )
    );
  }, []);

  const memoizedValue = useMemo(
    () => ({
      brands,
      registrations,
      addBrand,
      updateBrand,
      deleteBrand,
      getBrandById,
      addRegistration,
      updateRegistration,
      deleteRegistration,
      getRegistrationById,
      getRegistrationsByBrandId,
      addReminder,
      updateReminder,
      deleteReminder,
    }),
    [
      brands,
      registrations,
      addBrand,
      updateBrand,
      deleteBrand,
      getBrandById,
      addRegistration,
      updateRegistration,
      deleteRegistration,
      getRegistrationById,
      getRegistrationsByBrandId,
      addReminder,
      updateReminder,
      deleteReminder,
    ]
  );

  return memoizedValue;
}
