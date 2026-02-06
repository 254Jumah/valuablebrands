'use server';

import bcrypt from 'bcryptjs';
import crypto from 'crypto';

import connect from '../utils/db';
import User from '../models/User';
import cloudinary from '../config/cloudinary';

import Loan from '../models/Loan';
import nodemailer from 'nodemailer';

import axios from 'axios';
import BrandReg from '../models/BrandReg';
import Event from '../models/Event';
import Registration from '../models/Registration';
import Invoice from '../models/Invoice';

const transporter = nodemailer.createTransport({
  host: 'smtp.privateemail.com',
  port: 587, // Use 465 for SSL
  secure: false, // Set to true if you're using port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
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

// export const addRegistration = async (registrationData) => {
//   'use server';
//   await connect();

//   try {
//     // 🔎 CHECK FOR DUPLICATE REGISTRATION
//     const existingRegistration = await Registration.findOne({
//       brandId: registrationData.brandId,
//       eventId: registrationData.eventId, // Fixed: should be eventId, not eventName
//     });

//     if (existingRegistration) {
//       return {
//         success: false,
//         message: 'This brand is already registered for this event',
//       };
//     }

//     // ✅ CREATE CLEAN REGISTRATION (NO FINANCIAL DATA)
//     const registration = await Registration.create({
//       brandId: registrationData.brandId,
//       eventId: registrationData.eventId, // Fixed: eventId, not eventName
//       notes: registrationData.notes,
//       packageTier: registrationData.packageTier,
//       pax: registrationData.pax,
//       registrationStatus: registrationData.registrationStatus,
//       recordedBy: registrationData.recordedBy || 'system',
//     });
//   const mailOptions = {
//       from: `${businessInfo.name} <${
//         process.env.EMAIL_USER || "jumahtitus@gmail.com"
//       }>`,
//       to: email,
//       subject: `🎉 Welcome to ${businessInfo.name}!`,
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
//           <h2 style="color: #16a34a;">Dear ${name},</h2>
//           <p>We are excited to welcome you to <strong>${
//             businessInfo.name
//           }</strong>! 🎊</p>
//           <p>Your account has been successfully created with the role of <strong>${role}</strong>.</p>
//           <p>We’re glad to have you onboard and look forward to achieving great things together. 🚀</p>
//           <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
//           <p style="font-size: 0.8em; color: #999;">
//             © ${new Date().getFullYear()} ${
//         businessInfo.name
//       }. All rights reserved.
//           </p>
//         </div>
//       `,
//     };

//     transporter.sendMail(mailOptions).catch((emailError) => {
//       console.error("Error sending welcome email:", emailError.message);
//     });

//     return {
//       success: true,
//       data: registration,
//       message: 'Registration added successfully',
//     };
//   } catch (error) {
//     console.error('❌ addRegistration error:', error);
//     return {
//       success: false,
//       message: error.message || 'Failed to add registration',
//     };
//   }
// };

export const addRegistration = async (registrationData) => {
  'use server';
  await connect();

  try {
    // 🔎 CHECK FOR DUPLICATE REGISTRATION
    const existingRegistration = await Registration.findOne({
      brandId: registrationData.brandId,
      eventId: registrationData.eventId,
    });

    if (existingRegistration) {
      return {
        success: false,
        message: 'This brand is already registered for this event',
      };
    }

    // 📋 FETCH BRAND AND EVENT DETAILS FOR EMAIL
    const brand = await BrandReg.findById(registrationData.brandId).lean();
    const event = await Event.findById(registrationData.eventId).lean();

    if (!brand || !event) {
      return {
        success: false,
        message: 'Brand or event not found',
      };
    }

    // ✅ CREATE CLEAN REGISTRATION (NO FINANCIAL DATA)
    const registration = await Registration.create({
      brandId: registrationData.brandId,
      eventId: registrationData.eventId,
      notes: registrationData.notes,
      packageTier: registrationData.packageTier,
      pax: registrationData.pax,
      registrationStatus: registrationData.registrationStatus,
      recordedBy: registrationData.recordedBy || 'system',
    });

    // 🎉 SEND MODERN REGISTRATION CONFIRMATION EMAIL
    const recipientEmail = brand.primaryContactEmail;
    const recipientName = brand.primaryContactName || brand.businessName;
    const brandName = brand.businessName;
    const eventTitle = event.title;
    const eventDate = event.date
      ? new Date(event.date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'TBA';
    const eventLocation = event.location || 'Venue to be confirmed';

    // Package details
    const packageDetails = {
      Bronze: {
        color: '#CD7F32',
        features: ['Standard seating', 'Basic networking', 'Event materials'],
      },
      Silver: {
        color: '#C0C0C0',
        features: [
          'Priority seating',
          'Enhanced networking',
          'Event materials + Swag bag',
        ],
      },
      Gold: {
        color: '#FFD700',
        features: [
          'VIP seating',
          'Exclusive networking',
          'Full premium package + Photo ops',
        ],
      },
    };

    const selectedPackage = packageDetails[registrationData.packageTier];

    const mailOptions = {
      from: `Event Management <${process.env.EMAIL_USER || 'events@yourcompany.com'}>`,
      to: recipientEmail,
      subject: `✅ Registration Confirmed: ${brandName} for ${eventTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Registration Confirmation</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f8fafc;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 40px 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 700;
              letter-spacing: -0.5px;
            }
            .header p {
              margin: 10px 0 0;
              opacity: 0.9;
              font-size: 16px;
            }
            .content {
              padding: 40px 30px;
            }
            .badge {
              display: inline-block;
              padding: 8px 16px;
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white;
              border-radius: 20px;
              font-size: 14px;
              font-weight: 600;
              margin-bottom: 30px;
            }
            .section {
              margin-bottom: 30px;
              padding-bottom: 30px;
              border-bottom: 1px solid #e2e8f0;
            }
            .section:last-child {
              border-bottom: none;
              margin-bottom: 0;
              padding-bottom: 0;
            }
            .section-title {
              font-size: 18px;
              font-weight: 600;
              color: #1e293b;
              margin-bottom: 16px;
              display: flex;
              align-items: center;
              gap: 10px;
            }
            .section-title svg {
              color: #6366f1;
            }
            .details-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 20px;
              margin-top: 20px;
            }
            .detail-card {
              background: #f8fafc;
              padding: 20px;
              border-radius: 12px;
              border-left: 4px solid #6366f1;
            }
            .detail-label {
              font-size: 12px;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              font-weight: 600;
              margin-bottom: 6px;
            }
            .detail-value {
              font-size: 16px;
              font-weight: 600;
              color: #1e293b;
            }
            .package-card {
              background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 24px;
              margin-top: 16px;
              position: relative;
              border-left: 4px solid ${selectedPackage.color};
            }
            .package-tier {
              position: absolute;
              top: -12px;
              left: 24px;
              background: ${selectedPackage.color};
              color: white;
              padding: 6px 16px;
              border-radius: 20px;
              font-size: 14px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .features-list {
              list-style: none;
              padding: 0;
              margin: 20px 0 0;
            }
            .features-list li {
              padding: 8px 0;
              padding-left: 28px;
              position: relative;
            }
            .features-list li:before {
              content: "✓";
              position: absolute;
              left: 0;
              color: #10b981;
              font-weight: bold;
            }
            .next-steps {
              background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
              border-radius: 12px;
              padding: 24px;
              margin-top: 30px;
            }
            .next-steps h3 {
              margin-top: 0;
              color: #0369a1;
            }
            .footer {
              background: #1e293b;
              color: #cbd5e1;
              padding: 30px;
              text-align: center;
              font-size: 14px;
            }
            .footer a {
              color: #60a5fa;
              text-decoration: none;
            }
            .footer a:hover {
              text-decoration: underline;
            }
            @media (max-width: 600px) {
              .container {
                border-radius: 0;
                box-shadow: none;
              }
              .header, .content {
                padding: 30px 20px;
              }
              .details-grid {
                grid-template-columns: 1fr;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Header -->
            <div class="header">
              <h1>🎉 Registration Confirmed!</h1>
              <p>You're officially registered for ${eventTitle}</p>
            </div>

            <!-- Content -->
            <div class="content">
              <div class="badge">Registration ID: ${registration._id.toString().slice(-8)}</div>

              <!-- Greeting -->
              <div class="section">
                <p>Dear <strong>${recipientName}</strong>,</p>
                <p>Thank you for registering <strong>${brandName}</strong> for <strong>${eventTitle}</strong>. We're excited to have you join us!</p>
              </div>

              <!-- Registration Details -->
              <div class="section">
                <div class="section-title">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  Registration Summary
                </div>

                <div class="details-grid">
                  <div class="detail-card">
                    <div class="detail-label">Event</div>
                    <div class="detail-value">${eventTitle}</div>
                  </div>
                  <div class="detail-card">
                    <div class="detail-label">Date</div>
                    <div class="detail-value">${eventDate}</div>
                  </div>
                  <div class="detail-card">
                    <div class="detail-label">Location</div>
                    <div class="detail-value">${eventLocation}</div>
                  </div>
                  <div class="detail-card">
                    <div class="detail-label">Seats Reserved</div>
                    <div class="detail-value">${registrationData.pax} ${registrationData.pax === 1 ? 'seat' : 'seats'}</div>
                  </div>
                </div>
              </div>

              <!-- Package Details -->
              <div class="section">
                <div class="section-title">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  Your Package
                </div>

                <div class="package-card">
                  <div class="package-tier">${registrationData.packageTier}</div>
                  <h3 style="margin-top: 20px; color: #1e293b;">${registrationData.packageTier} Package Benefits</h3>
                  <ul class="features-list">
                    ${selectedPackage.features.map((feature) => `<li>${feature}</li>`).join('')}
                  </ul>
                </div>
              </div>

              <!-- Status & Next Steps -->
              <div class="section">
                <div class="section-title">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clip-rule="evenodd"/>
                  </svg>
                  Status & Next Steps
                </div>

                <div class="next-steps">
                  <h3>Current Status: ${registrationData.registrationStatus}</h3>
                  <p><strong>Next Steps:</strong></p>
                  <ul class="features-list">
                    <li>You will receive an invoice separately via email</li>
                    <li>Event details and schedule will be sent 1 week before the event</li>
                    <li>Check your email for any updates or changes</li>
                    <li>Contact us if you need to modify your registration</li>
                  </ul>
                </div>
              </div>

              <!-- Notes -->
              ${
                registrationData.notes
                  ? `
              <div class="section">
                <div class="section-title">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"/>
                    <path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd"/>
                  </svg>
                  Special Notes
                </div>
                <div style="background: #fff7ed; padding: 16px; border-radius: 8px; border-left: 4px solid #f97316;">
                  <p style="margin: 0; color: #9a3412;">${registrationData.notes}</p>
                </div>
              </div>
              `
                  : ''
              }

              <!-- Contact Info -->
              <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #e2e8f0;">
                <p style="color: #64748b; font-size: 14px;">
                  Need assistance? Contact our team:<br>
                  📧 events@yourcompany.com | 📞 +254 700 000 000
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div class="footer">
              <p>
                © ${new Date().getFullYear()} Event Management System. All rights reserved.<br>
                <small>This is an automated message. Please do not reply to this email.</small>
              </p>
              <p style="margin-top: 15px;">
                <a href="https://yourcompany.com/events">View Event Details</a> •
                <a href="https://yourcompany.com/contact">Contact Support</a> •
                <a href="https://yourcompany.com/privacy">Privacy Policy</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    // 📧 Send email (in background, don't await)
    transporter
      .sendMail(mailOptions)
      .then(() => {
        console.log(
          `✅ Registration confirmation email sent to: ${recipientEmail}`
        );
      })
      .catch((emailError) => {
        console.error(
          '❌ Error sending registration email:',
          emailError.message
        );
        // Don't fail the registration if email fails
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

export const updateRegistration = async (id, registrationData) => {
  'use server';
  await connect();

  try {
    // ✅ UPDATE ONLY REGISTRATION FIELDS
    const updatedRegistration = await Registration.findByIdAndUpdate(
      id,
      {
        brandId: registrationData.brandId,
        eventId: registrationData.eventId,
        notes: registrationData.notes,
        packageTier: registrationData.packageTier,
        pax: registrationData.pax,
        registrationStatus: registrationData.registrationStatus,
        // NO FINANCIAL FIELDS
      },
      { new: true, runValidators: true }
    );

    if (!updatedRegistration) {
      return {
        success: false,
        message: 'Registration not found',
      };
    }

    return {
      success: true,
      data: updatedRegistration,
      message: 'Registration updated successfully',
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
export const createInvoice = async (invoiceData) => {
  await connect();
  try {
    const invoice = await Invoice.create(invoiceData);
    return {
      success: true,
      data: invoice,
    };
  } catch (error) {
    console.error('❌ createInvoice error:', error);
    return {
      success: false,
      message: error.message || 'Failed to create invoice',
    };
  }
};
export const fetchInvoices = async () => {
  await connect();
  try {
    const invoices = await Invoice.find()
      .populate('brandId', 'businessName')
      .lean();
    return invoices;
  } catch (error) {
    console.error('❌ fetchInvoices error:', error);
    throw new Error('Failed to fetch invoices');
  }
};
export const updateInvoice = async (invoiceId, invoiceData) => {
  await connect();
  try {
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      invoiceId,
      invoiceData,
      { new: true, runValidators: true }
    );
    if (!updatedInvoice) {
      throw new Error('Invoice not found');
    }
    return {
      success: true,
      data: updatedInvoice,
    };
  } catch (error) {
    console.error('❌ updateInvoice error:', error);
    return {
      success: false,
      message: error.message || 'Failed to update invoice',
    };
  }
};
export const recordPayment = async (paymentData) => {
  await connect();
  try {
    const payment = await Payment.create(paymentData);
    return {
      success: true,
      data: payment,
    };
  } catch (error) {
    console.error('❌ recordPayment error:', error);
    return {
      success: false,
      message: error.message || 'Failed to record payment',
    };
  }
};
export const markInvoiceOverdue = async (invoiceId) => {
  await connect();
  try {
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      invoiceId,
      { status: 'Overdue' },
      { new: true, runValidators: true }
    );
    if (!updatedInvoice) {
      throw new Error('Invoice not found');
    }
    return updatedInvoice;
  } catch (error) {
    console.error('❌ markInvoiceOverdue error:', error);
    throw error;
  }
};
export const clearInvoice = async (invoiceId) => {
  await connect();
  try {
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      invoiceId,
      { status: 'Not sent' },
      { new: true, runValidators: true }
    );
    if (!updatedInvoice) {
      throw new Error('Invoice not found');
    }
    return updatedInvoice;
  } catch (error) {
    console.error('❌ clearInvoice error:', error);
    throw error;
  }
};
export const sendMessage = async (messageData) => {
  await connect();
  try {
    const message = await Message.create(messageData);
    return {
      success: true,
      data: message,
    };
  } catch (error) {
    console.error('❌ sendMessage error:', error);
    return {
      success: false,
      message: error.message || 'Failed to send message',
    };
  }
};
export const fetchMessageHistory = async () => {
  await connect();
  try {
    const messages = await Message.find()
      .populate('brandId', 'businessName')
      .lean();
    return messages;
  } catch (error) {
    console.error('❌ fetchMessageHistory error:', error);
    throw new Error('Failed to fetch message history');
  }
};
export const fetchMessageTemplates = async () => {
  await connect();
  try {
    const templates = await MessageTemplate.find().lean();
    return templates;
  } catch (error) {
    console.error('❌ fetchMessageTemplates error:', error);
    throw new Error('Failed to fetch message templates');
  }
};
// ================= CONTRIBUTIONS =====================
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
