'use server';

import bcrypt from 'bcryptjs';
import crypto from 'crypto';

import connect from '../utils/db';
import User from '../models/User';
import cloudinary from '../config/cloudinary';

import Loan from '../models/Loan';

import axios from 'axios';
import BrandReg from '../models/BrandReg';
import Event from '../models/Event';
import Registration from '../models/Registration';
export const member = async (memberData) => {
  const { name, email, password, role } = memberData;

  try {
    await connect();

    // Check if member already exists by ID number or email in a single query
    const existingMember = await User.findOne({
      role: 'Superadmin',
      $or: [{ email }, { role }],
    });

    // 🔹 Then check business existence
    if (existingMember) {
      if (existingMember.email === email) {
        throw new Error('email iko');
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newMember = new User({
      name,
      email,

      role,
      password: hashedPassword,
    });

    await newMember.save();

    return {
      message: 'Superadmin account created successfully',
      user: {
        email: newMember.email,
        role: newMember.role,
        createdAt: newMember.createdAt,
      },
    };
  } catch (error) {
    console.error('Error in adding member:', error.message);
    throw new Error(error.message || 'Failed to create account');
  }
};
export const addMember = async (formData) => {
  await connect();

  let passportPhotoUrl = ''; // ✅ MOVE HERE

  try {
    const data =
      formData instanceof FormData ? Object.fromEntries(formData) : formData;

    const {
      firstName,
      lastName,
      email,
      phone,
      idNumber,
      dateOfBirth,
      gender,
      address,
      city,
      county,
      graduationYear,
      specialization,
      currentEmployer,
      occupation,
      membershipCategory,
      password,
      passportPhoto,
    } = data;
    const hashedPassword = await bcrypt.hash(password, 10);

    const membershipNumber = `KAH-${crypto
      .randomBytes(3)
      .toString('hex')
      .toUpperCase()}`;

    // --- checks ---
    const existingMemberByEmail = await User.findOne({
      email: email.toLowerCase(),
    });
    if (existingMemberByEmail) {
      return { success: false, message: 'Email already exists' };
    }

    const existingMemberById = await User.findOne({ idNumber });
    if (existingMemberById) {
      return { success: false, message: 'ID already exists' };
    }

    // --- upload passport ---
    if (passportPhoto && typeof passportPhoto !== 'string') {
      const bytes = await passportPhoto.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64String = buffer.toString('base64');
      const dataURI = `data:${passportPhoto.type};base64,${base64String}`;

      const uploadResult = await cloudinary.v2.uploader.upload(dataURI, {
        folder: 'members/passports',
        public_id: `passport_${idNumber}_${Date.now()}`,
      });

      passportPhotoUrl = uploadResult.secure_url;
    } else if (typeof passportPhoto === 'string') {
      passportPhotoUrl = passportPhoto;
    } else {
      throw new Error('Passport photo is required');
    }

    // --- save user ---
    const newMember = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase(),
      phone,
      idNumber,
      dateOfBirth,
      gender,
      address,
      name: `${firstName.trim()} ${lastName.trim()}`,
      city,
      county,
      graduationYear,
      specialization,
      currentEmployer,
      occupation,
      membershipNumber,
      membershipCategory,
      password: hashedPassword, // Make sure to hash this in production
      passportPhoto: passportPhotoUrl,
      role: 'member',
      status: 'Active',
    });

    await newMember.save();
    // Extract first name for SMS
    const Name = newMember.firstName.split(' ')[0].toUpperCase();
    // Prepare SMS message
    const smsMessage = `Dear ${Name}, welcome to the Kahalumni Association! Your membership number is ${newMember.membershipNumber}. Log in to start managing your account.`;
    const smsPayload = {
      apikey: process.env.API_KEY, // Use environment variable
      partnerID: process.env.PARTNER_ID, // Use environment variable
      message: smsMessage,
      shortcode: process.env.SENDERID, // Use environment variable
      mobile: phone,
    };

    // Send SMS
    try {
      const smsResponse = await axios.post(
        'https://sms.textsms.co.ke/api/services/sendsms/',
        smsPayload
      );

      const responseCode = smsResponse.data.responses[0]['response-code']; // Fix typo here
      if (responseCode === 200) {
      } else {
        console.error(
          'Failed to send SMS:',
          smsResponse.data.responses[0]['response-description']
        );
      }
    } catch (smsError) {
      console.error(
        'Error during SMS sending:',
        smsError.response ? smsError.response.data : smsError.message
      );
    }
    return { success: true, message: 'Member registered successfully' };
  } catch (error) {
    console.error('Error in addMember:', error);

    // ✅ SAFE cleanup
    if (passportPhotoUrl) {
      try {
        await cloudinary.v2.uploader.destroy(passportPhotoUrl);
      } catch (e) {
        console.error('Cleanup failed:', e);
      }
    }

    return {
      success: false,
      message: error.message || 'Registration failed',
    };
  }
};
export const fetchEvents = async () => {
  'use server';
  try {
    await connect();
    const events = await Event.find().sort({ date: 1 }); // ascending order
    console.log({ events });
    return events; // Return the array directly
  } catch (err) {
    throw new Error('Failed to fetch events!');
  }
};
export const addEvent = async (data) => {
  'use server';
  await connect();
  try {
    const event = await Event.create({
      title: data.title,
      description: data.description,
      date: data.date,
      location: data.location,
      featured: data.featured || false,
      category: data.category,
      time: data.time,
      recordedBy: data.recordedBy,
      status: data.status,
      image: data.image,
      capacity: data.capacity,
    });
    return {
      success: true,
      message: 'Event created successfully',
      data: event,
    };
  } catch (error) {
    console.error('❌ addEvent error:', error);
    return {
      success: false,
      message: error.message || 'Failed to create event',
    };
  }
};
export const updateEvent = async (eventId, data) => {
  'use server';
  await connect();
  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      {
        title: data.title,
        description: data.description,
        date: data.date,
        location: data.location,
        category: data.category,
        image: data.image,
      },
      { new: true, runValidators: true }
    );
    if (!updatedEvent) {
      throw new Error('Event not found');
    }
    return {
      success: true,
      message: 'Event updated successfully',
      data: updatedEvent,
    };
  } catch (error) {
    console.error('❌ updateEvent error:', error);
    return {
      success: false,
      message: error.message || 'Failed to update event',
    };
  }
};

export const deleteEvent = async (eventId) => {
  'use server';
  await connect();
  try {
    const deletedEvent = await Event.findByIdAndDelete(eventId);
    if (!deletedEvent) {
      throw new Error('Event not found');
    }
    return {
      success: true,
      message: 'Event deleted successfully',
    };
  } catch (error) {
    console.error('❌ deleteEvent error:', error);
    return {
      success: false,
      message: error.message || 'Failed to delete event',
    };
  }
};
export const fetchEventBrands = async () => {
  'use server';
  await connect();
  try {
    const brands = await BrandReg.find().sort({ createdAt: -1 }); // newest first
    console.log({ brands });
    return brands;
  } catch (err) {
    throw new Error('Failed to fetch event brands!');
  }
};
// export const addBrand = async (data) => {
//   'use server';
//   await connect();

//   try {
//     const brand = await BrandReg.create({
//       businessName: data.businessName,
//       category: data.category,
//       website: data.website,
//       address: data.address,
//       city: data.city,
//       country: data.country,
//       status: data.status,
//       tags: data.tags,
//       notes: data.notes,

//       primaryContactName: data.primaryContact.name,
//       primaryContactTitle: data.primaryContact.title,
//       primaryContactEmail: data.primaryContact.email,
//       primaryContactPhone: data.primaryContact.phone,

//       secondaryContactEnabled: !!data.secondaryContact,
//       secondaryContactName: data.secondaryContact?.name,
//       secondaryContactEmail: data.secondaryContact?.email,
//       secondaryContactPhone: data.secondaryContact?.phone,
//       secondaryContactTitle: data.secondaryContact?.title,

//       recordedBy: 'system', // or session user
//     });

//     return {
//       success: true,
//       message: 'Brand created successfully',
//       data: brand,
//     };
//   } catch (error) {
//     console.error('❌ addBrand error:', error);
//     return {
//       success: false,
//       message: error.message || 'Failed to create brand',
//     };
//   }
// };

export async function addBrand(data) {
  await connect();

  // Normalize name to avoid case issues
  const businessName = data.businessName.trim().toLowerCase();

  const existingBrand = await BrandReg.findOne({
    businessName,
    country: data.country,
  });

  if (existingBrand) {
    return {
      success: false,
      message: 'Brand already exists',
    };
  }

  const brand = await BrandReg.create({
    businessName,
    category: data.category,
    address: data.address,
    city: data.city,
    country: data.country,
    status: data.status,
    tags: data.tags,
    notes: data.notes,

    website: data.website,
    primaryContactName: data.primaryContact.name,
    primaryContactTitle: data.primaryContact.title,
    primaryContactEmail: data.primaryContact.email,
    primaryContactPhone: data.primaryContact.phone,

    recordedBy: data.recordedBy || 'system', // or session user
  });

  return {
    success: true,
    data: {
      id: brand._id.toString(),
      businessName: brand.businessName,
      category: brand.category,
      status: brand.status,
    },
  };
}
export async function updateBrandAction(brandId, data) {
  await connect();

  const businessName = data.businessName.trim().toLowerCase();

  // 🔍 Prevent duplicate brand name (excluding current brand)
  const existingBrand = await BrandReg.findOne({
    businessName,
    _id: { $ne: brandId },
  });

  if (existingBrand) {
    return {
      success: false,
      message: 'Another brand with this name already exists',
    };
  }

  const brand = await BrandReg.findByIdAndUpdate(
    brandId,
    {
      businessName,
      category: data.category,
      address: data.address,
      city: data.city,
      country: data.country,
      status: data.status,
      tags: data.tags,
      notes: data.notes,

      primaryContactName: data.primaryContact?.name,
      primaryContactTitle: data.primaryContact?.title,
      primaryContactEmail: data.primaryContact?.email,
      primaryContactPhone: data.primaryContact?.phone,
    },
    { new: true, runValidators: true }
  );

  if (!brand) {
    return {
      success: false,
      message: 'Brand not found',
    };
  }

  return {
    success: true,
    data: {
      id: brand._id.toString(),
      businessName: brand.businessName,
      category: brand.category,
      status: brand.status,
    },
  };
}

export const fetchbrands = async () => {
  'use server';
  try {
    await connect();

    const brands = await BrandReg.find().sort({ createdAt: -1 }); // newest first; // Ensure this returns an array
    console.log({ brands });
    return brands; // Return the array directly
  } catch (err) {
    throw new Error('Failed to fetch brands!');
  }
};
export const deleteBrandAction = async (brandId) => {
  await connect();
  try {
    const deletedBrand = await BrandReg.findByIdAndDelete(brandId);
    if (!deletedBrand) {
      return {
        success: false,
        message: 'Brand not found',
      };
    }
    return {
      success: true,
      message: 'Brand deleted successfully',
    };
  } catch (error) {
    console.error('❌ deleteBrandAction error:', error);
    return {
      success: false,
      message: 'Failed to delete brand',
    };
  }
};

export const addRegistration = async (registrationData) => {
  'use server';
  await connect();
  try {
    const registration = await Registration.create({
      amountPaid: registrationData.amountPaid,

      amountTotal: registrationData.amountTotal,
      brandId: registrationData.brandId,
      dueDate: registrationData.dueDate,
      eventId: registrationData.eventName,

      invoiceNumber: registrationData.invoiceNumber,
      invoiceStatus: registrationData.invoiceStatus,
      notes: registrationData.notes,

      notes: registrationData.notes,
      packageTier: registrationData.packageTier,
      pax: registrationData.pax,
      registrationStatus: registrationData.registrationStatus,
      recordedBy: registrationData.recordedBy || 'system', // or session user
    });
    return {
      success: true,
      data: registration,
      message: 'Registration added successfully',
    };
  } catch (error) {
    console.error('❌ addRegistration error:', error);

    return {
      success: false,
      message: error.message || 'Failed to add registration',
    };
  }
};
export const fetchRegistrations = async () => {
  'use server';
  try {
    await connect();

    const registrations = await Registration.find()
      .populate('brandId')
      .populate('eventId')
      .sort({ createdAt: -1 })
      .lean(); // 🔥 CRITICAL
    console.log({ registrations });
    return registrations;
  } catch (err) {
    console.error(err);
    throw new Error('Failed to fetch registrations!');
  }
};

export const updateRegistration = async (registrationId, registrationData) => {
  'use server';
  await connect();
  try {
    const updatedRegistration = await Registration.findByIdAndUpdate(
      registrationId,
      registrationData,
      { new: true, runValidators: true }
    );
    if (!updatedRegistration) {
      throw new Error('Registration not found');
    }
    return {
      success: true,
      message: 'Registration updated successfully',
      data: updatedRegistration,
    };
  } catch (error) {
    console.error('❌ updateRegistration error:', error);
    return {
      success: false,
      message: error.message || 'Failed to update registration',
    };
  }
};
export const deleteRegistration = async (registrationId) => {
  'use server';
  await connect();
  try {
    const deletedRegistration =
      await Registration.findByIdAndDelete(registrationId);
    if (!deletedRegistration) {
      throw new Error('Registration not found');
    }
    return {
      success: true,
      message: 'Registration deleted successfully',
    };
  } catch (error) {
    console.error('❌ deleteRegistration error:', error);
    return {
      success: false,
      message: error.message || 'Failed to delete registration',
    };
  }
};

export const addReminder = async (reminderData) => {
  await connect();
  try {
    const reminder = await Reminder.create(reminderData);
    return {
      success: true,
      data: reminder,
    };
  } catch (error) {
    console.error('❌ addReminder error:', error);
    return {
      success: false,
      message: error.message || 'Failed to add reminder',
    };
  }
};
export const updateReminder = async (reminderId, reminderData) => {
  await connect();
  try {
    const updatedReminder = await Reminder.findByIdAndUpdate(
      reminderId,
      reminderData,
      { new: true, runValidators: true }
    );
    if (!updatedReminder) {
      throw new Error('Reminder not found');
    }
    return {
      success: true,
      message: 'Reminder updated successfully',
      data: updatedReminder,
    };
  } catch (error) {
    console.error('❌ updateReminder error:', error);
    return {
      success: false,
      message: error.message || 'Failed to update reminder',
    };
  }
};
export const deleteReminder = async (reminderId) => {
  await connect();
  try {
    const deletedReminder = await Reminder.findByIdAndDelete(reminderId);
    if (!deletedReminder) {
      throw new Error('Reminder not found');
    }
    return {
      success: true,
      message: 'Reminder deleted successfully',
    };
  } catch (error) {
    console.error('❌ deleteReminder error:', error);
    return {
      success: false,
      message: error.message || 'Failed to delete reminder',
    };
  }
};

export const addpayment = async (memberData) => {
  await connect();

  const {
    amount,
    date,
    type,
    description,
    recordedBy,
    modeOfPayment,
    paymentreference,
  } = memberData;

  try {
    // 1️⃣ Find member
    const member = await User.findById(memberId);

    if (!member) {
      throw new Error('Member not found');
    }

    // 2️⃣ Save contribution
    const contribution = await Contribution.create({
      member: memberId,
      amount: Number(amount),
      type,
      description,
      modeOfPayment,
      paymentReference: paymentreference,
      recordedBy,
      date: date ? new Date(date) : new Date(),
    });

    // 3️⃣ Calculate new balance for SAME TYPE
    const balanceAgg = await Contribution.aggregate([
      { $match: { member: member._id, type } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const newBalance = balanceAgg[0]?.total || 0;

    // 4️⃣ SMS
    const smsMessage = `Dear ${member.firstName}, we have received your payment of KES ${amount} for ${type}.
Your total ${type} contributions are now KES ${newBalance}.
Thank you for supporting Kahalumni Association.`;

    const smsPayload = {
      apikey: process.env.API_KEY,
      partnerID: process.env.PARTNER_ID,
      message: smsMessage,
      shortcode: process.env.SENDERID,
      mobile: member.phone,
    };

    // Non-blocking SMS
    axios
      .post('https://sms.textsms.co.ke/api/services/sendsms/', smsPayload)
      .catch((e) => console.error('SMS error:', e.message));

    return {
      success: true,
      message: 'Payment recorded successfully',
      balance: newBalance,
      type,
    };
  } catch (error) {
    console.error('Error in addpayment:', error);

    // Duplicate payment reference
    if (error.code === 11000) {
      return {
        success: false,
        message: 'Payment reference already exists',
      };
    }

    return {
      success: false,
      message: error.message,
    };
  }
};

export const getRecentContributions = async (limit = 10) => {
  await connect();

  try {
    const contributions = await Contribution.find()
      .sort({ date: -1 })
      .limit(limit)
      .populate('member', 'firstName lastName membershipNumber phone name')
      .populate('recordedBy', 'firstName lastName')
      .lean();

    return {
      success: true,
      data: contributions.map((c) => ({
        id: c._id,

        // 🔹 contribution fields
        amount: c.amount,
        type: c.type,
        date: c.date,
        modeOfPayment: c.modeOfPayment,
        paymentReference: c.paymentReference,

        // 🔹 member fields (flattened)
        memberId: c.member?._id,
        firstName: c.member?.firstName,
        lastName: c.member?.lastName,
        memberName: c.member?.name,
        membershipNumber: c.member?.membershipNumber,
        phone: c.member?.phone,

        // 🔹 recorded by
        recordedBy: c.recordedBy
          ? `${c.recordedBy.firstName} ${c.recordedBy.lastName}`
          : 'System',
      })),
    };
  } catch (error) {
    console.error('Error fetching contributions:', error);
    return {
      success: false,
      message: 'Failed to fetch contributions',
    };
  }
};

export const fetchUsers = async () => {
  'use server';
  try {
    await connect();

    const members = await User.find({ role: 'member' }); // Ensure this returns an array

    return members; // Return the array directly
  } catch (err) {
    throw new Error('Failed to fetch users!');
  }
};

export const fetchUserswithloan = async () => {
  'use server';

  try {
    await connect();

    // 1️⃣ Fetch members
    const users = await User.find({ role: 'member' })
      .select(
        'firstName lastName membershipNumber name phone email passportPhoto  status gender'
      )
      .lean();

    // 2️⃣ Enrich each user
    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        // 🔹 Total loan-type contributions
        const loanContribAgg = await Contribution.aggregate([
          {
            $match: {
              member: user._id,
              type: 'loans',
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$amount' },
            },
          },
        ]);

        const loanContributionsTotal =
          loanContribAgg.length > 0 ? loanContribAgg[0].total : 0;

        // 🔹 ANNUAL contributions (individual records)
        const annualContributions = await Contribution.find({
          member: user._id,
          type: 'annual',
        })
          .sort({ date: -1 })
          .lean();

        const annualContributionTotal = annualContributions.reduce(
          (sum, c) => sum + c.amount,
          0
        );

        // 🔹 User loans
        const loans = await Loan.find({ user: user._id }).lean();

        // 🔹 Attach repayments to each loan
        const loansWithRepayments = await Promise.all(
          loans.map(async (loan) => {
            const repayments = await LoanRepayment.find({
              loan: loan._id,
            })
              .sort({ paymentDate: 1 })
              .lean();

            const totalRepaid = repayments.reduce(
              (sum, r) => sum + r.amountPaid,
              0
            );

            return {
              ...loan,
              totalRepaid,
              repayments,
            };
          })
        );

        return {
          ...user,
          loanContributionsTotal,
          annualContributionTotal,
          annualContributions, // 👈 individual records
          loans: loansWithRepayments,
        };
      })
    );

    console.log({ enrichedUsers });
    return enrichedUsers;
  } catch (err) {
    console.error(err);
    throw new Error('Failed to fetch users with loan data');
  }
};

export const recordLoanPaymentss = async (data) => {
  'use server';
  await connect();
  try {
    const { loanId, amountPaid, paymentDate, recordedBy } = data;
    const loan = await Loan.findById(loanId);
    if (!loan) {
      throw new Error('Loan not found');
    }
    const repayment = await LoanRepayment.create({
      loan: loanId,
      amountPaid,
      paymentDate: new Date(paymentDate),
      recordedBy,
    });
    loan.balance -= amountPaid;
    if (loan.balance <= 0) {
      loan.status = 'closed';
      loan.balance = 0;
    }
    await loan.save();
    return {
      success: true,
      message: 'Loan payment recorded successfully',
      repaymentId: repayment._id,
    };
  } catch (error) {
    console.error('❌ recordLoanPayment error:', error);
    return {
      success: false,
      message: error.message || 'Failed to record loan payment',
    };
  }
};

export const recordLoanPayment = async (data) => {
  'use server';
  await connect();

  try {
    const {
      loanId,
      amount,
      paymentMethod,
      paymentReference,
      paymentDate,
      recordedBy,
      memberId,
    } = data;

    // 1️⃣ Fetch loan
    const loan = await Loan.findById(loanId).populate('user');
    if (!loan) {
      throw new Error('Loan not found');
    }

    if (loan.status !== 'active') {
      throw new Error('Loan is not active');
    }

    // 2️⃣ Calculate new balance
    const newBalance = loan.balance - amount;
    const balanceAfterPayment = newBalance > 0 ? newBalance : 0;

    // 3️⃣ Save repayment record
    const repayment = await LoanRepayment.create({
      loan: loan._id,
      user: loan.user._id,
      amountPaid: amount,
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      modeOfPayment: paymentMethod,
      paymentReference,
      recordedBy,
      balanceAfterPayment,
    });

    // 4️⃣ Update loan
    loan.balance = balanceAfterPayment;

    let smsMessage = '';

    if (loan.balance === 0) {
      loan.status = 'completed';

      smsMessage = `🎉 Congratulations ${loan.user.firstName}!
Your loan (${loan.loanRef}) has been fully repaid.
Thank you for your commitment.`;
    } else {
      const today = new Date();
      const dueDate = new Date(loan.dueDate);

      let monthsRemaining = 0;
      if (dueDate > today) {
        monthsRemaining =
          (dueDate.getFullYear() - today.getFullYear()) * 12 +
          (dueDate.getMonth() - today.getMonth());
      }
      const formattedDueDate = new Date(loan.dueDate).toLocaleDateString(
        'en-GB',
        {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }
      );

      smsMessage = `Payment received for loan (${loan.loanRef}).
Amount: KES ${amount}
Remaining balance: KES ${loan.balance}
Remaining period: ${monthsRemaining} month(s)
Due on ${formattedDueDate}.`;
    }

    await loan.save();

    // 5️⃣ Send SMS (DO NOT change your SMS function)
    /*
    await sendSMS({
      to: loan.user.phone,
      message: smsMessage,
    });
    */
    const smsPayload = {
      apikey: process.env.API_KEY,
      partnerID: process.env.PARTNER_ID,
      message: smsMessage,
      shortcode: process.env.SENDERID,
      mobile: loan.user.phone,
    };

    // Non-blocking SMS
    axios
      .post('https://sms.textsms.co.ke/api/services/sendsms/', smsPayload)
      .catch((e) => console.error('SMS error:', e.message));

    return {
      success: true,
      message: 'Loan payment recorded successfully',
      repaymentId: repayment._id,
      loanStatus: loan.status,
      balance: loan.balance,
    };
  } catch (error) {
    console.error('❌ recordLoanPayment error:', error);
    return {
      success: false,
      message: error.message || 'Failed to record loan payment',
    };
  }
};
