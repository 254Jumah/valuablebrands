export const packageCatalog = {
  Bronze: {
    price: 50_000,
    includedPax: 2,
    benefits: ['2 seats', 'Logo on program', 'Standard table'],
  },
  Silver: {
    price: 120_000,
    includedPax: 4,
    benefits: ['4 seats', 'Logo on backdrop', 'VIP table'],
  },
  Gold: {
    price: 250_000,
    includedPax: 8,
    benefits: ['8 seats', 'Stage mention', 'Premium placement', 'VIP table'],
  },
};

export const initialEventRegistrations = [
  {
    id: 'r1',
    eventName: 'SME Excellence Awards 2024',
    brandId: 'b1',
    packageTier: 'Silver',
    pax: 4,
    registrationStatus: 'Registered',
    invoiceStatus: 'Part-paid',
    invoiceNumber: 'INV-2024-001',
    amountTotal: 120_000,
    amountPaid: 60_000,
    dueDate: '2024-03-05T00:00:00.000Z',
    reminders: [
      {
        id: 'rm1',
        channel: 'WhatsApp',
        scheduledFor: '2024-03-01T09:00:00.000Z',
        status: 'Sent',
        note: 'Shared invoice and package details.',
      },
    ],
    updatedAt: '2024-03-01T09:10:00.000Z',
  },
  {
    id: 'r2',
    eventName: 'SME Excellence Awards 2024',
    brandId: 'b2',
    packageTier: 'Bronze',
    pax: 2,
    registrationStatus: 'Interested',
    invoiceStatus: 'Not sent',
    amountTotal: 50_000,
    amountPaid: 0,
    reminders: [
      {
        id: 'rm2',
        channel: 'Call',
        scheduledFor: '2024-03-02T14:00:00.000Z',
        status: 'Planned',
        note: 'Confirm decision maker and attendance count.',
      },
    ],
    updatedAt: '2024-03-01T12:40:00.000Z',
  },
];
