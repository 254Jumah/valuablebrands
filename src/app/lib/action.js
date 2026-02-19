'use server';

import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import ExcelJS from 'exceljs';

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
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

import 'jspdf-autotable';
import EventPackage from '../models/EventPackage';
import Attendee from '../models/Attendee';

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

    const now = new Date();

    const events = await Event.aggregate([
      {
        $addFields: {
          isUpcoming: {
            $cond: [{ $gte: ['$date', now] }, 1, 0],
          },
        },
      },
      {
        $sort: {
          isUpcoming: -1, // upcoming events first
          date: 1, // closest date first
        },
      },
    ]);

    return events;
  } catch (err) {
    throw new Error('Failed to fetch events!');
  }
};
export const checkInAttendee = async (registrationId) => {
  'use server';
  await connect();
  try {
    const registration = await Registration.findById(registrationId)
      .populate('brandId')
      .populate('eventId');
    if (!registration) {
      throw new Error('Registration not found');
    }
    registration.checkedIn = true;
    await registration.save();
    return { success: true, message: 'Attendee checked in successfully' };
  } catch (error) {
    console.error('Error checking in attendee:', error);
    return {
      success: false,
      message: error.message || 'Failed to check in attendee',
    };
  }
};
export const getAttendees = async (eventId) => {
  'use server';
  await connect();
  try {
    const attendees = await Registration.find({ eventId }).populate('brandId');
    return attendees;
  } catch (error) {
    throw new Error('Failed to fetch attendees!');
  }
};
export const getEvent = async (eventId) => {
  'use server';
  await connect();
  try {
    const event = await Event.findById(eventId);

    // Convert MongoDB document to plain object
    return JSON.parse(JSON.stringify(event));
  } catch (error) {
    throw new Error('Failed to fetch event details!');
  }
};
export const getRegistrations = async (eventId) => {
  'use server';
  await connect();
  try {
    const registrations = await Registration.find({ eventId })
      .populate('brandId')
      .populate('packageId')
      .populate('eventId')
      .lean();

    return JSON.parse(JSON.stringify(registrations));
  } catch (error) {
    console.error('Error fetching registrations:', error);
    throw new Error('Failed to fetch registrations!');
  }
};
export const getBrandAttendees = async (eventId) => {
  'use server';
  await connect();
  try {
    // Get all attendees for this event, populated with brand details
    const attendees = await Attendee.find({ eventId })
      .populate('brandId')
      .populate('registrationId')
      .lean();

    // Group attendees by registration ID
    const attendeesByBrand = {};

    for (const attendee of attendees) {
      const regId = attendee.registrationId?._id || attendee.registrationId;

      if (attendee.isWalkIn) {
        // Handle walk-ins
        if (!attendeesByBrand['walkins']) {
          attendeesByBrand['walkins'] = [];
        }
        attendeesByBrand['walkins'].push(attendee);
      } else if (regId) {
        // Group by registration ID
        if (!attendeesByBrand[regId]) {
          attendeesByBrand[regId] = [];
        }
        attendeesByBrand[regId].push(attendee);
      }
    }

    return JSON.parse(JSON.stringify(attendeesByBrand));
  } catch (error) {
    console.error('Error fetching brand attendees:', error);
    throw new Error('Failed to fetch brand attendees!');
  }
};
// export const bulkUploadAttendees = async (eventId, fileBuffer) => {
//   'use server';
//   await connect();
//   try {
//     const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
//     const sheetName = workbook.SheetNames[0];
//     const sheet = workbook.Sheets[sheetName];
//     const rows = XLSX.utils.sheet_to_json(sheet);
//     const registrations = rows.map((row) => ({
//       eventId,
//       brandId: row.brandId, // Ensure your Excel has this column
//       name: row.name,
//       email: row.email,
//       phone: row.phone,
//       jobTitle: row.jobTitle,
//     }));
//     await Registration.insertMany(registrations);
//     return { success: true, message: 'Attendees uploaded successfully' };
//   } catch (error) {
//     console.error('Error uploading attendees:', error);
//     return {
//       success: false,
//       message: error.message || 'Failed to upload attendees',
//     };
//   }
// };

export const bulkUploadAttendees = async ({ fileBase64, eventId }) => {
  try {
    console.log('📥 bulkUploadAttendees called');
    console.log('➡ Event ID:', eventId);

    if (!fileBase64) {
      throw new Error('No file data provided');
    }

    if (!eventId) {
      throw new Error('Event ID is required');
    }

    await connect();

    // Convert base64 back to buffer
    const buffer = Buffer.from(fileBase64, 'base64');

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const sheet = workbook.getWorksheet('Attendees');
    if (!sheet) {
      throw new Error('Worksheet "Attendees" not found in the Excel file');
    }

    console.log(
      `📊 Processing sheet: ${sheet.name}, Total rows: ${sheet.rowCount}`
    );

    const results = [];
    const errors = [];
    let processedCount = 0;
    let skippedCount = 0;

    // Start from row 3 (after instruction row and header)
    for (let i = 3; i <= sheet.rowCount; i++) {
      const row = sheet.getRow(i);

      // Get values from cells
      const brandName = row.getCell(1).value?.toString().trim();
      const name = row.getCell(2).value?.toString().trim();
      const email = row.getCell(3).value?.toString().trim() || '';
      const phone = row.getCell(4).value?.toString().trim();
      const jobTitle = row.getCell(5).value?.toString().trim() || '';

      // Skip completely empty rows
      if (!brandName && !name && !phone) {
        skippedCount++;
        continue;
      }

      // Validate required fields
      if (!name) {
        errors.push(`Row ${i}: Name is required`);
        continue;
      }

      if (!phone) {
        errors.push(`Row ${i}: Phone number is required`);
        continue;
      }

      // Find registration by brand name
      const registrations = await Registration.find({
        eventId,
      }).populate('brandId');

      const matchingRegistration = registrations.find(
        (reg) =>
          reg.brandId?.businessName?.toLowerCase().trim() ===
          brandName?.toLowerCase().trim()
      );

      if (!matchingRegistration) {
        errors.push(`Row ${i}: Brand "${brandName}" not found for this event`);
        continue;
      }

      // Check if we've exceeded PAX limit
      const existingAttendees = await Attendee.countDocuments({
        registrationId: matchingRegistration._id,
        eventId,
      });

      if (existingAttendees >= matchingRegistration.pax) {
        errors.push(
          `Row ${i}: Cannot add more attendees. Brand "${brandName}" has reached maximum capacity (${matchingRegistration.pax})`
        );
        continue;
      }

      try {
        // Check if attendee already exists
        const existingAttendee = await Attendee.findOne({
          registrationId: matchingRegistration._id,
          eventId,
          phone: phone,
        });

        if (existingAttendee) {
          errors.push(
            `Row ${i}: Attendee with phone ${phone} already exists for this brand`
          );
          continue;
        }

        // Create attendee
        const attendee = await Attendee.create({
          registrationId: matchingRegistration._id,
          eventId: eventId,
          brandId: matchingRegistration.brandId._id,
          name: name,
          email: email,
          phone: phone,
          jobTitle: jobTitle,
          status: 'Registered',
          isWalkIn: false,
          createdAt: new Date(),
        });

        results.push(`Row ${i}: Imported - ${name}`);
        processedCount++;

        console.log(`✅ Imported: ${name} for ${brandName}`);
      } catch (err) {
        console.error(`Error creating attendee for row ${i}:`, err);
        errors.push(`Row ${i}: Failed to save - ${err.message}`);
      }
    }

    console.log(
      `📊 Upload complete: ${processedCount} imported, ${errors.length} errors, ${skippedCount} empty rows skipped`
    );

    return {
      success: true,
      imported: processedCount,
      errors: errors,
      totalProcessed: processedCount + errors.length,
      skippedRows: skippedCount,
    };
  } catch (error) {
    console.error('🔥 Bulk upload error:', error);
    throw new Error(error.message || 'Failed to upload attendees');
  }
};

export const createBrand = async (data) => {
  'use server';
  await connect();
  try {
    const brand = await BrandReg.create({
      businessName: data.businessName,
      category: data.category,
      website: data.website,
      address: data.address,
      city: data.city,
      country: data.country,
      status: data.status,
      tags: data.tags,
      notes: data.notes,
      primaryContactName: data.primaryContact.name,

      primaryContactTitle: data.primaryContact.title,
      primaryContactEmail: data.primaryContact.email,
      primaryContactPhone: data.primaryContact.phone,
      recordedBy: data.recordedBy || 'system',
    });
    return {
      success: true,
      message: 'Brand created successfully',
      data: brand,
    };
  } catch (error) {
    console.error('❌ createBrand error:', error);
    return {
      success: false,
      message: error.message || 'Failed to create brand',
    };
  }
};
// incase crush refere here down

// export const downloadAttendeeTemplate = async (eventId, brandId) => {
//   try {
//     console.log('📥 downloadAttendeeTemplate called');
//     console.log('➡ Event ID:', eventId);
//     console.log('➡ Brand ID:', brandId);

//     // 1️⃣ Validate
//     if (!eventId) {
//       throw new Error('No event selected.');
//     }

//     if (!brandId) {
//       throw new Error('No brand selected.');
//     }

//     await connect();

//     // 2️⃣ Get Registration with populated brand data
//     const registration = await Registration.findOne({
//       _id: brandId,
//       eventId,
//     }).populate('brandId'); // 👈 Add this to get the brand details

//     if (!registration) {
//       throw new Error('Registration not found for this event.');
//     }

//     // Get the brand name from the populated brandId
//     const brandName = registration.brandId?.businessName || 'Unknown Brand';
//     console.log('✅ Registration found for brand:', brandName);

//     const workbook = new ExcelJS.Workbook();
//     const sheet = workbook.addWorksheet('Attendees');

//     sheet.columns = [
//       { header: 'Brand Name', key: 'brandName', width: 30 },
//       { header: 'Name *', key: 'name', width: 30 },
//       { header: 'Email', key: 'email', width: 30 },
//       { header: 'Phone *', key: 'phone', width: 20 },
//       { header: 'Job Title', key: 'jobTitle', width: 30 },
//     ];

//     // Bold header
//     sheet.getRow(1).font = { bold: true };

//     // Freeze header row
//     sheet.views = [{ state: 'frozen', ySplit: 1 }];

//     // 3️⃣ Add 100 rows with Brand pre-filled
//     for (let i = 0; i < 100; i++) {
//       sheet.addRow({
//         brandName: brandName, // Use the populated brand name
//       });
//     }

//     // 4️⃣ Lock Brand column
//     sheet.getColumn('brandName').eachCell((cell, rowNumber) => {
//       if (rowNumber > 1) {
//         cell.protection = { locked: true };
//       }
//     });

//     // Protect sheet (so locked cells cannot be edited)
//     await sheet.protect('secure-template', {
//       selectLockedCells: false,
//       selectUnlockedCells: true,
//     });

//     const buffer = await workbook.xlsx.writeBuffer();

//     console.log('✅ Template generated successfully');

//     return buffer;
//   } catch (error) {
//     console.error('🔥 Template generation error:', error.message);
//     throw new Error(error.message || 'Failed to generate template');
//   }
// };

export const downloadAttendeeTemplate = async (eventId, brandId) => {
  try {
    console.log('📥 downloadAttendeeTemplate called');
    console.log('➡ Event ID:', eventId);
    console.log('➡ Brand ID:', brandId);

    // 1️⃣ Validate
    if (!eventId) {
      throw new Error('No event selected.');
    }

    if (!brandId) {
      throw new Error('No brand selected.');
    }

    await connect();

    // 2️⃣ Get Registration with populated brand data
    const registration = await Registration.findOne({
      _id: brandId,
      eventId,
    }).populate('brandId');

    if (!registration) {
      throw new Error('Registration not found for this event.');
    }

    // Capitalize brand name properly
    const brandName = (registration.brandId?.businessName || 'Unknown Brand')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    console.log('✅ Registration found for brand:', brandName);
    console.log('✅ Package:', registration.packageTier);
    console.log('✅ PAX:', registration.pax);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Attendees');

    // Set column widths
    sheet.columns = [
      { header: 'Brand Name', key: 'brandName', width: 35 },
      { header: 'Name *', key: 'name', width: 30 },
      { header: 'Email', key: 'email', width: 35 },
      { header: 'Phone *', key: 'phone', width: 20 },
      { header: 'Job Title', key: 'jobTitle', width: 30 },
    ];

    // Style header row
    const headerRow = sheet.getRow(1);
    headerRow.font = {
      bold: true,
      size: 12,
      color: { argb: 'FF333333' },
    };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4473C5' }, // Nice blue header
    };
    headerRow.font = {
      bold: true,
      size: 12,
      color: { argb: 'FFFFFFFF' }, // White text
    };
    headerRow.alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    };
    headerRow.height = 30;

    // Add instruction row with styling
    sheet.spliceRows(1, 0, []);
    const instructionRow = sheet.getRow(1);
    instructionRow.height = 40;

    // Create rich text for instruction
    const remainingSlots = registration.pax;
    instructionRow.getCell(1).value = {
      richText: [
        {
          text: '📋 TEMPLATE INSTRUCTIONS',
          font: { bold: true, size: 11, color: { argb: 'FFFF4444' } },
        },
        {
          text: ` | Brand: ${brandName} | Package: ${registration.packageTier} | Max Attendees: ${registration.pax}`,
          font: { bold: true, size: 11, color: { argb: 'FF333333' } },
        },
        {
          text: ' | DO NOT change Brand Name column',
          font: { bold: true, size: 11, color: { argb: 'FFFF4444' } },
        },
      ],
    };
    sheet.mergeCells(`A1:E1`);

    // Style instruction row background
    instructionRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFF3CD' }, // Light yellow background
    };
    instructionRow.alignment = {
      vertical: 'middle',
      horizontal: 'left',
      indent: 1,
    };

    // Add column headers with improved styling
    const columnHeaderRow = sheet.getRow(2);
    columnHeaderRow.height = 25;
    columnHeaderRow.font = {
      bold: true,
      size: 11,
      color: { argb: 'FF333333' },
    };
    columnHeaderRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE8F0FE' }, // Light blue for headers
    };
    columnHeaderRow.alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };

    // Freeze instruction and header rows
    sheet.views = [{ state: 'frozen', ySplit: 2 }];

    // 3️⃣ Add rows with Brand pre-filled (limit to package PAX)
    const maxRows = Math.min(registration.pax, 100); // Don't exceed 100 or package limit

    for (let i = 0; i < maxRows; i++) {
      const row = sheet.addRow({
        brandName: brandName,
      });

      // Style the brand name column
      const brandCell = row.getCell('brandName');
      brandCell.font = {
        bold: true,
        color: { argb: 'FF4473C5' }, // Blue text for brand
      };
      brandCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF0F7FF' }, // Very light blue background
      };
      brandCell.alignment = {
        vertical: 'middle',
        horizontal: 'left',
        indent: 1,
      };

      // Add a comment/tooltip
      brandCell.note = {
        texts: [
          {
            text: 'This brand name is pre-filled for: ',
            font: { italic: true },
          },
          { text: brandName, font: { bold: true } },
          { text: '\n\nPlease do not change this value.' },
        ],
      };

      // Style other cells
      row.getCell('name').alignment = {
        vertical: 'middle',
        horizontal: 'left',
      };
      row.getCell('email').alignment = {
        vertical: 'middle',
        horizontal: 'left',
      };
      row.getCell('phone').alignment = {
        vertical: 'middle',
        horizontal: 'left',
      };
      row.getCell('jobTitle').alignment = {
        vertical: 'middle',
        horizontal: 'left',
      };

      // Alternate row colors for better readability
      if (i % 2 === 0) {
        ['name', 'email', 'phone', 'jobTitle'].forEach((col) => {
          row.getCell(col).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFAFAFA' }, // Very light gray for alternating rows
          };
        });
      }
    }

    // Add data validation for required fields
    for (let rowNum = 3; rowNum < 3 + maxRows; rowNum++) {
      // Name column (B) - required
      sheet.getCell(`B${rowNum}`).dataValidation = {
        type: 'textLength',
        operator: 'greaterThan',
        formulas: [0],
        showErrorMessage: true,
        errorTitle: 'Required Field',
        error: 'Name is required for each attendee',
        prompt: 'Enter attendee full name',
        promptTitle: 'Name',
      };

      // Phone column (D) - required
      sheet.getCell(`D${rowNum}`).dataValidation = {
        type: 'textLength',
        operator: 'greaterThan',
        formulas: [0],
        showErrorMessage: true,
        errorTitle: 'Required Field',
        error: 'Phone number is required for each attendee',
        prompt: 'Enter phone number with country code',
        promptTitle: 'Phone',
      };

      // Email column (C) - optional but format validation
      sheet.getCell(`C${rowNum}`).dataValidation = {
        type: 'textLength',
        operator: 'greaterThan',
        formulas: [0],
        allowBlank: true,
        showErrorMessage: true,
        errorTitle: 'Invalid Email',
        error: 'Please enter a valid email address',
      };
    }

    // Add a summary row at the bottom
    const summaryRow = sheet.addRow([]);
    summaryRow.getCell(1).value =
      `Total rows: ${maxRows} (based on your package limit)`;
    summaryRow.font = { italic: true, color: { argb: 'FF666666' } };
    summaryRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF0F0F0' },
    };
    sheet.mergeCells(`A${3 + maxRows}:E${3 + maxRows}`);

    // Add borders to all cells
    for (let rowNum = 2; rowNum <= 3 + maxRows; rowNum++) {
      for (let colNum = 1; colNum <= 5; colNum++) {
        const cell = sheet.getCell(rowNum, colNum);
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          right: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        };
      }
    }

    const buffer = await workbook.xlsx.writeBuffer();

    console.log(`✅ Template generated successfully with ${maxRows} rows`);
    console.log('📊 Package limit applied:', registration.pax);

    return buffer;
  } catch (error) {
    console.error('🔥 Template generation error:', error.message);
    throw new Error(error.message || 'Failed to generate template');
  }
};

export const addAttendeeToRegistration = async (data) => {
  'use server';
  await connect();
  try {
    const {
      registrationId,
      eventId,
      brandId,
      name,
      email,
      phone,
      jobTitle,
      tableNumber,
      notes,
    } = data;

    // Find the registration
    const registration = await Registration.findById(registrationId);
    if (!registration) {
      throw new Error('Registration not found');
    }

    // Check if we haven't exceeded the expected pax
    const existingAttendeesCount = await Attendee.countDocuments({
      registrationId: registrationId,
    });

    if (existingAttendeesCount >= registration.pax) {
      throw new Error(
        `Cannot add more than ${registration.pax} attendees for this brand`
      );
    }

    // Create new attendee in Attendee collection (not just push to registration)
    const newAttendee = await Attendee.create({
      registrationId: registrationId,
      eventId: eventId,
      brandId: brandId,
      name: name,
      email: email || '',
      phone: phone,
      jobTitle: jobTitle || '',
      tableNumber: tableNumber || '',
      notes: notes || '',
      status: 'Checked-In', // Auto check-in when added during event
      checkedInAt: new Date(),
      isWalkIn: false, // This is from pre-registered brand
    });

    return {
      success: true,
      attendee: JSON.parse(JSON.stringify(newAttendee)),
      message: 'Attendee added and checked in successfully',
    };
  } catch (error) {
    console.error('Error adding attendee to registration:', error);
    return {
      success: false,
      message: error.message || 'Failed to add attendee to registration',
    };
  }
};

export const getBrands = async () => {
  'use server';
  await connect();
  try {
    const brands = await BrandReg.find().sort({ createdAt: -1 }); // newest first
    return brands;
  } catch (error) {
    throw new Error('Failed to fetch brands!');
  }
};
export const getPackages = async () => {
  'use server';
  await connect();
  try {
    const packages = await EventPackage.find().sort({ createdAt: -1 }); // newest first
    return packages;
  } catch (error) {
    throw new Error('Failed to fetch packages!');
  }
};
export const getEventStats = async (eventId) => {
  try {
    console.log('📊 getEventStats called for event:', eventId);

    if (!eventId) {
      throw new Error('Event ID is required');
    }

    await connect();

    // Get event details
    const event = await Event.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }
    console.log('✅ Event found:', event.title, 'Capacity:', event.capacity);

    // Get all registrations for this event
    const registrations = await Registration.find({ eventId }).populate(
      'brandId'
    );
    console.log(`✅ Found ${registrations.length} registrations`);

    // Calculate total brands
    const totalBrands = registrations.length;

    // Calculate total expected (sum of all pax)
    const totalExpected = registrations.reduce((sum, reg) => {
      return sum + (reg.pax || 0);
    }, 0);

    // Get all attendees for this event
    const attendees = await Attendee.find({ eventId });
    console.log(`✅ Found ${attendees.length} total attendees`);

    // Calculate checked in count (status 'Checked-In')
    const totalCheckedIn = attendees.filter(
      (a) => a.status === 'Checked-In'
    ).length;
    console.log(`✅ Checked in: ${totalCheckedIn}`);

    // Calculate walk-ins (isWalkIn flag)
    const walkIns = attendees.filter((a) => a.isWalkIn === true).length;
    console.log(`✅ Walk-ins: ${walkIns}`);

    // Calculate pending (Registered status)
    const pending = attendees.filter((a) => a.status === 'Registered').length;

    // Calculate no-shows
    const noShows = attendees.filter((a) => a.status === 'No-Show').length;

    // Calculate check-in rate (based on total expected, not attendees)
    const checkinRate =
      totalExpected > 0
        ? Math.round((totalCheckedIn / totalExpected) * 100)
        : 0;

    // Calculate remaining slots using event capacity
    // Slots Left = Event Capacity - Total Checked In
    const remainingCapacity = event?.capacity
      ? Math.max(0, event.capacity - totalCheckedIn)
      : 0;

    // Calculate by brand for debugging
    const brandStats = {};
    registrations.forEach((reg) => {
      const regAttendees = attendees.filter(
        (a) => a.registrationId?.toString() === reg._id.toString()
      );
      brandStats[reg.brandId?.businessName || 'Unknown'] = {
        expected: reg.pax,
        checkedIn: regAttendees.filter((a) => a.status === 'Checked-In').length,
        pending: regAttendees.filter((a) => a.status === 'Registered').length,
        noShow: regAttendees.filter((a) => a.status === 'No-Show').length,
      };
    });

    const stats = {
      totalBrands,
      totalExpected,
      totalCheckedIn,
      walkIns,
      pending,
      noShows,
      checkinRate,
      remainingCapacity,
      brandStats, // Include for debugging
    };

    console.log('✅ Final stats calculated:', {
      totalBrands,
      totalExpected,
      totalCheckedIn,
      walkIns,
      pending,
      noShows,
      checkinRate: checkinRate + '%',
      remainingCapacity,
      brandStats,
    });

    return stats;
  } catch (error) {
    console.error('🔥 Error getting event stats:', error);
    throw new Error(error.message || 'Failed to get event stats');
  }
};
export const getEventStatssss = async (eventId) => {
  try {
    console.log('📊 getEventStats called for event:', eventId);

    await connect();

    // Get all registrations for this event
    const registrations = await Registration.find({ eventId });
    const totalBrands = registrations.length;

    // Calculate total expected (sum of all pax)
    const totalExpected = registrations.reduce(
      (sum, reg) => sum + (reg.pax || 0),
      0
    );

    // Get all attendees for this event
    const attendees = await Attendee.find({ eventId });

    // Calculate checked in count
    const totalCheckedIn = attendees.filter(
      (a) => a.status === 'Checked-In'
    ).length;

    // Calculate walk-ins
    const walkIns = attendees.filter((a) => a.isWalkIn === true).length;

    // Calculate check-in rate
    const checkinRate =
      totalExpected > 0
        ? Math.round((totalCheckedIn / totalExpected) * 100)
        : 0;

    // Get event capacity (if you have it)
    const event = await Event.findById(eventId);
    const remainingCapacity = event?.capacity
      ? event.capacity - totalCheckedIn
      : 0;

    const stats = {
      totalBrands,
      totalExpected,
      totalCheckedIn,
      walkIns,
      checkinRate,
      remainingCapacity,
    };

    console.log('✅ Calculated stats:', stats);

    return stats;
  } catch (error) {
    console.error('🔥 Error getting event stats:', error);
    throw new Error('Failed to get event stats');
  }
};
export const markNoShow = async (registrationId) => {
  'use server';
  await connect();
  try {
    const registration = await Attendee.findById(registrationId);
    if (!registration) {
      throw new Error('Registration not found');
    }
    registration.noShow = true;
    await registration.save();
    return {
      success: true,
      message: 'Attendee marked as no-show successfully',
    };
  } catch (error) {
    console.error('Error marking attendee as no-show:', error);
    return {
      success: false,
      message: error.message || 'Failed to mark attendee as no-show',
    };
  }
};
export const registerWalkIn = async (data) => {
  'use server';
  await connect();
  try {
    const registration = await Registration.create({
      brandId: data.brandId,
      eventId: data.eventId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      walkIn: true, // explicitly set walkIn flag
    });
    return {
      success: true,
      message: 'Walk-in attendee registered successfully',
      data: registration,
    };
  } catch (error) {
    console.error('❌ registerWalkIn error:', error);
    return {
      success: false,
      message: error.message || 'Failed to register walk-in attendee',
    };
  }
};
export const downloadEventAttendees = async (eventId) => {
  'use server';
  await connect();
  try {
    const attendees = await Attendee.find({ eventId })
      .populate('brandId')
      .populate('registrationId')
      .lean();
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Event Attendees');
    sheet.columns = [
      { header: 'Brand Name', key: 'brandName', width: 30 },
      { header: 'Attendee Name', key: 'attendeeName', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone', key: 'phone', width: 20 },
      { header: 'Job Title', key: 'jobTitle', width: 30 },
      { header: 'Checked In', key: 'checkedIn', width: 15 },
      { header: 'No Show', key: 'noShow', width: 15 },
    ];
    attendees.forEach((attendee) => {
      sheet.addRow({
        brandName: attendee.brandId?.businessName || 'N/A',
        attendeeName: attendee.name,
        email: attendee.email,
        phone: attendee.phone,
        jobTitle: attendee.jobTitle,
        checkedIn: attendee.checkedIn ? 'Yes' : 'No',
        noShow: attendee.noShow ? 'Yes' : 'No',
      });
    });
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  } catch (error) {
    console.error('Error downloading event attendees:', error);
    throw new Error('Failed to download event attendees');
  }
};
export const undoCheckIn = async (registrationId) => {
  'use server';
  await connect();
  try {
    const registration = await Attendee.findById(registrationId);
    if (!registration) {
      throw new Error('Attendee not found');
    }
    registration.checkedIn = false;
    await registration.save();
    return { success: true, message: 'Attendee check-in undone successfully' };
  } catch (error) {
    console.error('Error undoing check-in:', error);
    return {
      success: false,
      message: error.message || 'Failed to undo check-in',
    };
  }
};

export const fetchUpcomingEvents = async () => {
  'use server';

  try {
    await connect();

    const now = new Date();

    const events = await Event.find({
      date: { $gte: now }, // only future events
    }).sort({
      date: 1, // closest date first
    });

    return events;
  } catch (err) {
    throw new Error('Failed to fetch upcoming events!');
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
export const fetchEventdetails = async (eventId) => {
  console.log('Fetching brands for event ID:', eventId);
  await connect();
  try {
    const brands = await BrandReg.find().sort({ createdAt: -1 }); // newest first

    return brands;
  } catch (err) {
    throw new Error('Failed to fetch event brands!');
  }
};
export const fetchEventBrands = async (eventId) => {
  await connect();

  try {
    const registrations = await Registration.find({ eventId })
      .populate('brandId') // 🔥 get full brand details
      .populate('eventId') // optional
      .sort({ createdAt: -1 })
      .lean();
    console.log('Fetched registrations:', registrations); // ✅ DEBUG LOG
    return registrations;
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
  await connect();

  try {
    // 🔁 CHECK DUPLICATE REGISTRATION
    const exists = await Registration.findOne({
      brandId: registrationData.brandId,
      eventId: registrationData.eventId,
    });

    if (exists) {
      return {
        success: false,
        message: 'This brand is already registered for this event',
      };
    }

    // 📥 FETCH BRAND + EVENT + PACKAGE
    const brand = await BrandReg.findById(registrationData.brandId).lean();
    const event = await Event.findById(registrationData.eventId).lean();
    const selectedPackage = await EventPackage.findById(
      registrationData.packageId
    ).lean();

    if (!brand || !event || !selectedPackage) {
      return { success: false, message: 'Brand, event, or package not found' };
    }

    // 📝 CREATE REGISTRATION
    const registration = await Registration.create({
      brandId: registrationData.brandId,
      eventId: registrationData.eventId,
      notes: registrationData.notes,
      pax: registrationData.pax,
      registrationStatus: registrationData.registrationStatus,
      recordedBy: registrationData.recordedBy || 'system',
      packageTier: registrationData.packageTier,
      packageId: selectedPackage._id,
      packageName: selectedPackage.name, // 👈 store snapshot
      packagePrice: selectedPackage.price, // 👈 store snapshot
    });
    // 🧾 GENERATE INVOICE NUMBER
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

    // 📅 SET DUE DATE (7 days from today)
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 7);

    // 💰 CREATE INVOICE
    const invoice = await Invoice.create({
      brandId: brand._id,
      eventId: event._id, // ✅ fixed typo
      registrationId: registration._id,
      packageId: selectedPackage._id,
      dueDate: dueDate,
      invoiceDate: today,
      recordedBy: registrationData.recordedBy || 'system',
      invoiceNumber,
      invoiceStatus: selectedPackage.price === 0 ? 'paid' : 'unpaid',
      totalAmount: selectedPackage.price,

      payments: [],
    });

    // 🌍 BUILD QR URL
    const buildQrUrl = () => {
      const baseUrl = process.env.PUBLIC_APP_URL || 'https://yourdomain.com';

      const params = new URLSearchParams({
        rid: registration._id.toString(),
        bid: brand._id.toString(),
        eid: event._id.toString(),
      });

      return `${baseUrl}/eventreservation?${params.toString()}`;
    };

    // 📄 GENERATE MODERN PDF
    const generatePDF = async () => {
      const doc = new jsPDF('p', 'mm', 'a4');

      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;

      const BRAND_COLOR = [79, 70, 229];
      const LIGHT_BG = [243, 244, 246];

      // HEADER
      doc.setFillColor(...BRAND_COLOR);
      doc.rect(0, 0, pageWidth, 42, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('REGISTRATION CONFIRMATION', pageWidth / 2, 26, {
        align: 'center',
      });

      // BODY CARD
      doc.setFillColor(...LIGHT_BG);
      doc.roundedRect(
        margin,
        55,
        pageWidth - margin * 2,
        pageHeight - 95,
        6,
        6,
        'F'
      );

      let y = 70;

      doc.setTextColor(55, 65, 81);
      doc.setFontSize(10);
      doc.text(
        `REGISTRATION ID: ${registration._id.toString().slice(-8)}`,
        margin + 6,
        y
      );

      y += 10;

      const section = (title) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.text(title, margin + 6, y);
        y += 6;
        doc.line(margin + 6, y, pageWidth - margin - 6, y);
        y += 8;
      };

      // EVENT DETAILS
      section('EVENT DETAILS');

      [
        ['Event', event.title],
        ['Date', new Date(event.date).toLocaleDateString()],
        ['Location', event.location || 'TBA'],
        ['Seats Reserved', `${registration.pax}`],
      ].forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(`${label}:`, margin + 6, y);
        doc.setFont('helvetica', 'normal');
        doc.text(String(value), margin + 42, y);
        y += 7;
      });

      // BRAND DETAILS
      y += 4;
      section('BRAND DETAILS');

      [
        ['Business', brand.businessName.toUpperCase()],
        ['Contact', brand.primaryContactName || 'N/A'],
        ['Email', brand.primaryContactEmail],
        ['Phone', brand.primaryContactPhone || 'N/A'],
      ].forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(`${label}:`, margin + 6, y);
        doc.setFont('helvetica', 'normal');
        doc.text(String(value), margin + 42, y);
        y += 7;
      });

      // PACKAGE DETAILS (🔥 FROM DATABASE)
      y += 4;
      section('PACKAGE DETAILS');

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Package: ${selectedPackage.name}`, margin + 6, y);
      y += 7;

      doc.setFont('helvetica', 'normal');
      doc.text(`Price: Ksh${selectedPackage.price}`, margin + 6, y);
      y += 7;

      doc.text(`Included Pax: ${selectedPackage.includedPax}`, margin + 6, y);
      y += 10;

      // ✅ Real Benefits From DB
      doc.setFont('helvetica', 'bold');
      doc.text('Benefits:', margin + 6, y);
      y += 7;

      doc.setFont('helvetica', 'normal');

      selectedPackage.benefits.forEach((benefit) => {
        doc.text(`• ${benefit}`, margin + 12, y);
        y += 6;
      });

      // QR CODE
      const qrUrl = buildQrUrl();
      const qrImage = await QRCode.toDataURL(qrUrl);

      doc.addImage(qrImage, 'PNG', pageWidth - margin - 60, y - 40, 45, 45);

      return doc.output('arraybuffer');
    };

    const pdfBuffer = await generatePDF();
    const pdfBase64 = Buffer.from(pdfBuffer).toString('base64');

    // 📧 EMAIL
    await transporter.sendMail({
      from: `EVENT MANAGEMENT <${process.env.EMAIL_USER}>`,
      to: brand.primaryContactEmail,
      subject: `✅ REGISTRATION CONFIRMED — ${brand.businessName}`,
      html: `
        <h2>🎉 Registration Confirmed</h2>
        <p>Your registration for <strong>${event.title}</strong> is confirmed.</p>
        <p>Selected Package: <strong>${selectedPackage.name}</strong></p>
        <p>Please find your confirmation PDF attached.</p>
      `,
      attachments: [
        {
          filename: `REGISTRATION_${registration._id.toString().slice(-8)}.pdf`,
          content: pdfBase64,
          encoding: 'base64',
        },
      ],
    });

    return {
      success: true,
      data: registration,
      message: 'Registration completed successfully',
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: error.message || 'Registration failed',
    };
  }
};

export const addRegistrationlatest = async (registrationData) => {
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

    // 📋 FETCH BRAND AND EVENT DETAILS
    const brand = await BrandReg.findById(registrationData.brandId).lean();
    const event = await Event.findById(registrationData.eventId).lean();

    if (!brand || !event) {
      return {
        success: false,
        message: 'Brand or event not found',
      };
    }

    // ✅ CREATE REGISTRATION
    const registration = await Registration.create({
      brandId: registrationData.brandId,
      eventId: registrationData.eventId,
      notes: registrationData.notes,
      packageTier: registrationData.packageTier,
      pax: registrationData.pax,
      registrationStatus: registrationData.registrationStatus,
      recordedBy: registrationData.recordedBy || 'system',
    });

    // 📄 GENERATE PDF CONFIRMATION
    const generatePDF = () => {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;

      // Title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('REGISTRATION CONFIRMATION', pageWidth / 2, margin, {
        align: 'center',
      });

      // Registration ID
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Registration ID: ${registration._id.toString().slice(-8)}`,
        margin,
        margin + 15
      );

      // Divider
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, margin + 20, pageWidth - margin, margin + 20);

      let yPos = margin + 30;

      // Event Details Section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Event Details', margin, yPos);
      yPos += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      const eventDetails = [
        ['Event:', event.title],
        [
          'Date:',
          event.date
            ? new Date(event.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            : 'TBA',
        ],
        ['Location:', event.location || 'Venue to be confirmed'],
        [
          'Seats:',
          `${registrationData.pax} ${registrationData.pax === 1 ? 'seat' : 'seats'}`,
        ],
      ];

      eventDetails.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, margin, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(value, margin + 30, yPos);
        yPos += 8;
      });

      yPos += 5;

      // Brand Details Section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Brand Details', margin, yPos);
      yPos += 10;

      doc.setFontSize(10);
      const brandDetails = [
        ['Business Name:', brand.businessName],
        ['Contact Person:', brand.primaryContactName || 'N/A'],
        ['Email:', brand.primaryContactEmail],
        ['Phone:', brand.primaryContactPhone || 'N/A'],
      ];

      brandDetails.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, margin, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(value, margin + 40, yPos);
        yPos += 8;
      });

      yPos += 10;

      // Package Details Section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Package Details', margin, yPos);
      yPos += 10;

      doc.setFontSize(12);
      doc.text(
        `Selected Package: ${registrationData.packageTier}`,
        margin,
        yPos
      );
      yPos += 8;

      doc.setFontSize(10);

      const packageFeatures = {
        Bronze: ['Standard seating', 'Basic networking', 'Event materials'],
        Silver: [
          'Priority seating',
          'Enhanced networking',
          'Event materials + Swag bag',
        ],
        Gold: [
          'VIP seating',
          'Exclusive networking',
          'Full premium package + Photo ops',
        ],
      };

      const features = packageFeatures[registrationData.packageTier] || [];
      features.forEach((feature) => {
        doc.text(`• ${feature}`, margin + 5, yPos);
        yPos += 7;
      });

      yPos += 10;

      // Notes Section
      if (registrationData.notes) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Special Notes', margin, yPos);
        yPos += 10;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        // Handle long notes with text wrapping
        const notesLines = doc.splitTextToSize(
          registrationData.notes,
          contentWidth
        );
        doc.text(notesLines, margin, yPos);
        yPos += notesLines.length * 7;
      }

      yPos += 15;

      // Terms & Conditions
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text('Terms & Conditions:', margin, yPos);
      yPos += 7;

      const terms = [
        '1. This registration is confirmed upon receipt of payment.',
        '2. Cancellations must be made 48 hours prior to the event.',
        '3. The organizers reserve the right to make changes to the schedule.',
        '4. This document serves as official confirmation of registration.',
      ];

      terms.forEach((term) => {
        doc.text(term, margin + 5, yPos);
        yPos += 7;
      });

      // Footer
      const footerY = doc.internal.pageSize.height - 20;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Generated on: ${new Date().toLocaleDateString()}`,
        margin,
        footerY
      );
      doc.text('© Event Management System', pageWidth - margin, footerY, {
        align: 'right',
      });

      return doc.output('arraybuffer');
    };

    // 📧 SEND EMAIL WITH PDF ATTACHMENT
    const recipientEmail = brand.primaryContactEmail;
    const recipientName = brand.primaryContactName || brand.businessName;
    const brandName = brand.businessName;
    const eventTitle = event.title;

    // Generate PDF
    const pdfBuffer = generatePDF();
    const pdfBase64 = Buffer.from(pdfBuffer).toString('base64');

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
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                     color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { padding: 30px; background: #f8fafc; border-radius: 0 0 10px 10px; }
            .badge { display: inline-block; background: #10b981; color: white;
                    padding: 8px 16px; border-radius: 20px; font-size: 14px; }
            .cta-button { display: inline-block; background: #667eea; color: white;
                        padding: 12px 24px; text-decoration: none; border-radius: 5px;
                        margin: 20px 0; font-weight: bold; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;
                     color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Registration Confirmed!</h1>
              <p>Your registration for ${eventTitle} has been successfully processed</p>
            </div>

            <div class="content">
              <div class="badge">Registration ID: ${registration._id.toString().slice(-8)}</div>

              <p>Dear <strong>${recipientName}</strong>,</p>

              <p>Thank you for registering <strong>${brandName}</strong> for <strong>${eventTitle}</strong>.
              We're excited to have you join us!</p>

              <h3>📋 Summary</h3>
              <ul>
                <li><strong>Event:</strong> ${eventTitle}</li>
                <li><strong>Package:</strong> ${registrationData.packageTier}</li>
                <li><strong>Seats:</strong> ${registrationData.pax}</li>
                <li><strong>Status:</strong> ${registrationData.registrationStatus}</li>
              </ul>

              <h3>📎 What's Attached?</h3>
              <p>Your confirmation PDF contains:</p>
              <ul>
                <li>Complete registration details</li>
                <li>Package features</li>
                <li>Terms and conditions</li>
                <li>Registration ID for reference</li>
              </ul>

              <p>
                <a href="#" class="cta-button">View Event Details</a>
              </p>

              <h3>📅 Next Steps</h3>
              <ol>
                <li>Review the attached confirmation PDF</li>
                <li>You will receive an invoice separately</li>
                <li>Event details will be sent 1 week prior</li>
                <li>Contact us for any changes needed</li>
              </ol>

              <div class="footer">
                <p>Need help? Contact us: 📧 events@yourcompany.com | 📞 +254 700 000 000</p>
                <p>© ${new Date().getFullYear()} Event Management System. All rights reserved.</p>
                <p><small>This is an automated message. Please do not reply to this email.</small></p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      attachments: [
        {
          filename: `Registration_Confirmation_${registration._id.toString().slice(-8)}.pdf`,
          content: pdfBase64,
          encoding: 'base64',
          contentType: 'application/pdf',
        },
      ],
    };

    // Send email with PDF attachment
    await transporter.sendMail(mailOptions);
    console.log(
      `✅ Registration confirmation email with PDF sent to: ${recipientEmail}`
    );

    return {
      success: true,
      data: registration,
      message: 'Registration added successfully with PDF confirmation',
    };
  } catch (error) {
    console.error('❌ addRegistration error:', error);
    return {
      success: false,
      message: error.message || 'Failed to add registration',
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
//       eventId: registrationData.eventId,
//     });

//     if (existingRegistration) {
//       return {
//         success: false,
//         message: 'This brand is already registered for this event',
//       };
//     }

//     // 📋 FETCH BRAND AND EVENT DETAILS FOR EMAIL
//     const brand = await BrandReg.findById(registrationData.brandId).lean();
//     const event = await Event.findById(registrationData.eventId).lean();

//     if (!brand || !event) {
//       return {
//         success: false,
//         message: 'Brand or event not found',
//       };
//     }

//     // ✅ CREATE CLEAN REGISTRATION (NO FINANCIAL DATA)
//     const registration = await Registration.create({
//       brandId: registrationData.brandId,
//       eventId: registrationData.eventId,
//       notes: registrationData.notes,
//       packageTier: registrationData.packageTier,
//       pax: registrationData.pax,
//       registrationStatus: registrationData.registrationStatus,
//       recordedBy: registrationData.recordedBy || 'system',
//     });

//     // 🎉 SEND MODERN REGISTRATION CONFIRMATION EMAIL
//     const recipientEmail = brand.primaryContactEmail;
//     const recipientName = brand.primaryContactName || brand.businessName;
//     const brandName = brand.businessName;
//     const eventTitle = event.title;
//     const eventDate = event.date
//       ? new Date(event.date).toLocaleDateString('en-US', {
//           weekday: 'long',
//           year: 'numeric',
//           month: 'long',
//           day: 'numeric',
//         })
//       : 'TBA';
//     const eventLocation = event.location || 'Venue to be confirmed';

//     // Package details
//     const packageDetails = {
//       Bronze: {
//         color: '#CD7F32',
//         features: ['Standard seating', 'Basic networking', 'Event materials'],
//       },
//       Silver: {
//         color: '#C0C0C0',
//         features: [
//           'Priority seating',
//           'Enhanced networking',
//           'Event materials + Swag bag',
//         ],
//       },
//       Gold: {
//         color: '#FFD700',
//         features: [
//           'VIP seating',
//           'Exclusive networking',
//           'Full premium package + Photo ops',
//         ],
//       },
//     };

//     const selectedPackage = packageDetails[registrationData.packageTier];

//     const mailOptions = {
//       from: `Event Management <${process.env.EMAIL_USER || 'events@yourcompany.com'}>`,
//       to: recipientEmail,
//       subject: `✅ Registration Confirmed: ${brandName} for ${eventTitle}`,
//       html: `
//         <!DOCTYPE html>
//         <html>
//         <head>
//           <meta charset="utf-8">
//           <meta name="viewport" content="width=device-width, initial-scale=1.0">
//           <title>Registration Confirmation</title>
//           <style>
//             @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

//             body {
//               font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
//               line-height: 1.6;
//               color: #333;
//               margin: 0;
//               padding: 0;
//               background-color: #f8fafc;
//             }
//             .container {
//               max-width: 600px;
//               margin: 0 auto;
//               background: white;
//               border-radius: 16px;
//               overflow: hidden;
//               box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
//             }
//             .header {
//               background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//               color: white;
//               padding: 40px 30px;
//               text-align: center;
//             }
//             .header h1 {
//               margin: 0;
//               font-size: 28px;
//               font-weight: 700;
//               letter-spacing: -0.5px;
//             }
//             .header p {
//               margin: 10px 0 0;
//               opacity: 0.9;
//               font-size: 16px;
//             }
//             .content {
//               padding: 40px 30px;
//             }
//             .badge {
//               display: inline-block;
//               padding: 8px 16px;
//               background: linear-gradient(135deg, #10b981 0%, #059669 100%);
//               color: white;
//               border-radius: 20px;
//               font-size: 14px;
//               font-weight: 600;
//               margin-bottom: 30px;
//             }
//             .section {
//               margin-bottom: 30px;
//               padding-bottom: 30px;
//               border-bottom: 1px solid #e2e8f0;
//             }
//             .section:last-child {
//               border-bottom: none;
//               margin-bottom: 0;
//               padding-bottom: 0;
//             }
//             .section-title {
//               font-size: 18px;
//               font-weight: 600;
//               color: #1e293b;
//               margin-bottom: 16px;
//               display: flex;
//               align-items: center;
//               gap: 10px;
//             }
//             .section-title svg {
//               color: #6366f1;
//             }
//             .details-grid {
//               display: grid;
//               grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
//               gap: 20px;
//               margin-top: 20px;
//             }
//             .detail-card {
//               background: #f8fafc;
//               padding: 20px;
//               border-radius: 12px;
//               border-left: 4px solid #6366f1;
//             }
//             .detail-label {
//               font-size: 12px;
//               color: #64748b;
//               text-transform: uppercase;
//               letter-spacing: 0.5px;
//               font-weight: 600;
//               margin-bottom: 6px;
//             }
//             .detail-value {
//               font-size: 16px;
//               font-weight: 600;
//               color: #1e293b;
//             }
//             .package-card {
//               background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
//               border: 1px solid #e2e8f0;
//               border-radius: 12px;
//               padding: 24px;
//               margin-top: 16px;
//               position: relative;
//               border-left: 4px solid ${selectedPackage.color};
//             }
//             .package-tier {
//               position: absolute;
//               top: -12px;
//               left: 24px;
//               background: ${selectedPackage.color};
//               color: white;
//               padding: 6px 16px;
//               border-radius: 20px;
//               font-size: 14px;
//               font-weight: 600;
//               text-transform: uppercase;
//               letter-spacing: 0.5px;
//             }
//             .features-list {
//               list-style: none;
//               padding: 0;
//               margin: 20px 0 0;
//             }
//             .features-list li {
//               padding: 8px 0;
//               padding-left: 28px;
//               position: relative;
//             }
//             .features-list li:before {
//               content: "✓";
//               position: absolute;
//               left: 0;
//               color: #10b981;
//               font-weight: bold;
//             }
//             .next-steps {
//               background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
//               border-radius: 12px;
//               padding: 24px;
//               margin-top: 30px;
//             }
//             .next-steps h3 {
//               margin-top: 0;
//               color: #0369a1;
//             }
//             .footer {
//               background: #1e293b;
//               color: #cbd5e1;
//               padding: 30px;
//               text-align: center;
//               font-size: 14px;
//             }
//             .footer a {
//               color: #60a5fa;
//               text-decoration: none;
//             }
//             .footer a:hover {
//               text-decoration: underline;
//             }
//             @media (max-width: 600px) {
//               .container {
//                 border-radius: 0;
//                 box-shadow: none;
//               }
//               .header, .content {
//                 padding: 30px 20px;
//               }
//               .details-grid {
//                 grid-template-columns: 1fr;
//               }
//             }
//           </style>
//         </head>
//         <body>
//           <div class="container">
//             <!-- Header -->
//             <div class="header">
//               <h1>🎉 Registration Confirmed!</h1>
//               <p>You're officially registered for ${eventTitle}</p>
//             </div>

//             <!-- Content -->
//             <div class="content">
//               <div class="badge">Registration ID: ${registration._id.toString().slice(-8)}</div>

//               <!-- Greeting -->
//               <div class="section">
//                 <p>Dear <strong>${recipientName}</strong>,</p>
//                 <p>Thank you for registering <strong>${brandName}</strong> for <strong>${eventTitle}</strong>. We're excited to have you join us!</p>
//               </div>

//               <!-- Registration Details -->
//               <div class="section">
//                 <div class="section-title">
//                   <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
//                     <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
//                   </svg>
//                   Registration Summary
//                 </div>

//                 <div class="details-grid">
//                   <div class="detail-card">
//                     <div class="detail-label">Event</div>
//                     <div class="detail-value">${eventTitle}</div>
//                   </div>
//                   <div class="detail-card">
//                     <div class="detail-label">Date</div>
//                     <div class="detail-value">${eventDate}</div>
//                   </div>
//                   <div class="detail-card">
//                     <div class="detail-label">Location</div>
//                     <div class="detail-value">${eventLocation}</div>
//                   </div>
//                   <div class="detail-card">
//                     <div class="detail-label">Seats Reserved</div>
//                     <div class="detail-value">${registrationData.pax} ${registrationData.pax === 1 ? 'seat' : 'seats'}</div>
//                   </div>
//                 </div>
//               </div>

//               <!-- Package Details -->
//               <div class="section">
//                 <div class="section-title">
//                   <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
//                     <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
//                   </svg>
//                   Your Package
//                 </div>

//                 <div class="package-card">
//                   <div class="package-tier">${registrationData.packageTier}</div>
//                   <h3 style="margin-top: 20px; color: #1e293b;">${registrationData.packageTier} Package Benefits</h3>
//                   <ul class="features-list">
//                     ${selectedPackage.features.map((feature) => `<li>${feature}</li>`).join('')}
//                   </ul>
//                 </div>
//               </div>

//               <!-- Status & Next Steps -->
//               <div class="section">
//                 <div class="section-title">
//                   <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
//                     <path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clip-rule="evenodd"/>
//                   </svg>
//                   Status & Next Steps
//                 </div>

//                 <div class="next-steps">
//                   <h3>Current Status: ${registrationData.registrationStatus}</h3>
//                   <p><strong>Next Steps:</strong></p>
//                   <ul class="features-list">
//                     <li>You will receive an invoice separately via email</li>
//                     <li>Event details and schedule will be sent 1 week before the event</li>
//                     <li>Check your email for any updates or changes</li>
//                     <li>Contact us if you need to modify your registration</li>
//                   </ul>
//                 </div>
//               </div>

//               <!-- Notes -->
//               ${
//                 registrationData.notes
//                   ? `
//               <div class="section">
//                 <div class="section-title">
//                   <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
//                     <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"/>
//                     <path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd"/>
//                   </svg>
//                   Special Notes
//                 </div>
//                 <div style="background: #fff7ed; padding: 16px; border-radius: 8px; border-left: 4px solid #f97316;">
//                   <p style="margin: 0; color: #9a3412;">${registrationData.notes}</p>
//                 </div>
//               </div>
//               `
//                   : ''
//               }

//               <!-- Contact Info -->
//               <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #e2e8f0;">
//                 <p style="color: #64748b; font-size: 14px;">
//                   Need assistance? Contact our team:<br>
//                   📧 events@yourcompany.com | 📞 +254 700 000 000
//                 </p>
//               </div>
//             </div>

//             <!-- Footer -->
//             <div class="footer">
//               <p>
//                 © ${new Date().getFullYear()} Event Management System. All rights reserved.<br>
//                 <small>This is an automated message. Please do not reply to this email.</small>
//               </p>
//               <p style="margin-top: 15px;">
//                 <a href="https://yourcompany.com/events">View Event Details</a> •
//                 <a href="https://yourcompany.com/contact">Contact Support</a> •
//                 <a href="https://yourcompany.com/privacy">Privacy Policy</a>
//               </p>
//             </div>
//           </div>
//         </body>
//         </html>
//       `,
//     };

//     // 📧 Send email (in background, don't await)
//     transporter
//       .sendMail(mailOptions)
//       .then(() => {
//         console.log(
//           `✅ Registration confirmation email sent to: ${recipientEmail}`
//         );
//       })
//       .catch((emailError) => {
//         console.error(
//           '❌ Error sending registration email:',
//           emailError.message
//         );
//         // Don't fail the registration if email fails
//       });

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
export const fetchRegistrations = async () => {
  'use server';
  try {
    await connect();

    const registrations = await Registration.find()
      .populate('brandId')
      .populate('eventId')
      .populate('packageId') // Populate recordedBy with name and email
      .sort({ createdAt: -1 })
      .lean(); // 🔥 CRITICAL

    return registrations;
  } catch (err) {
    console.error(err);
    throw new Error('Failed to fetch registrations!');
  }
};
export const fetchSingleRegistrations = async (
  registrationId,
  brandId,
  eventId
) => {
  'use server';
  try {
    await connect();

    const registrations = await Registration.find({
      _id: registrationId,
      brandId: brandId,
      eventId: eventId,
    })
      .populate('brandId')
      .populate('eventId')
      .sort({ createdAt: -1 })
      .lean(); // 🔥 CRITICAL

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
      .populate({
        path: 'brandId',
        model: 'BrandReg',
        select:
          'businessName primaryContactName primaryContactEmail primaryContactPhone address city country',
      })
      .populate({
        path: 'eventId',
        model: 'Event',
        select: 'title date location',
      })
      .populate({
        path: 'packageId',
        model: 'EventPackage',
        select: 'name price includedPax benefits',
      })
      .populate('registrationId')
      .sort({ createdAt: -1 }) // Most recent first
      .lean();

    // Transform the data to match what the UI expects
    const transformedInvoices = invoices.map((invoice) => {
      // Calculate total paid from payments array
      const amountPaid =
        invoice.payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

      return {
        id: invoice._id.toString(),
        invoiceNumber: invoice.invoiceNumber || '—',
        dueDate: invoice.dueDate,
        amountTotal: invoice.totalAmount || 0,
        amountPaid,
        status: invoice.invoiceStatus || 'Not sent',
        invoiceDate: invoice.invoiceDate,
        recordedBy: invoice.recordedBy,
        payments: invoice.payments || [],
        createdAt: invoice.createdAt,
        updatedAt: invoice.updatedAt,

        // Brand information (directly from populated data)
        brand: invoice.brandId
          ? {
              id: invoice.brandId._id.toString(),
              businessName: invoice.brandId.businessName || 'Unknown Business',
              primaryContact: {
                name: invoice.brandId.primaryContactName,
                email: invoice.brandId.primaryContactEmail,
                phone: invoice.brandId.primaryContactPhone,
              },
              address: invoice.brandId.address,
              city: invoice.brandId.city,
              country: invoice.brandId.country,
            }
          : null,

        // Event information
        event: invoice.eventId
          ? {
              id: invoice.eventId._id.toString(),
              title: invoice.eventId.title || 'Unknown Event',
              date: invoice.eventId.date,
              location: invoice.eventId.location,
            }
          : null,

        // Package information
        package: invoice.packageId
          ? {
              id: invoice.packageId._id.toString(),
              name: invoice.packageId.name || 'Unknown Package',
              price: invoice.packageId.price,
              includedPax: invoice.packageId.includedPax || 0,
              benefits: invoice.packageId.benefits || [],
            }
          : null,

        // For backward compatibility with existing UI code
        businessName: invoice.brandId?.businessName || 'Unknown Business',
        primaryContact: invoice.brandId
          ? {
              name: invoice.brandId.primaryContactName,
              email: invoice.brandId.primaryContactEmail,
              phone: invoice.brandId.primaryContactPhone,
            }
          : { name: '', email: '', phone: '' },
        eventName: invoice.eventId?.title || 'Unknown Event',
        eventLocation: invoice.eventId?.location,
        eventDate: invoice.eventId?.date,
        packageTier: invoice.packageId?.name || 'Unknown Package',
        pax: invoice.packageId?.includedPax || 0,
      };
    });

    return transformedInvoices;
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

export const createEventPackage = async (packageData) => {
  await connect();

  try {
    const pkg = await EventPackage.create(packageData);

    // Convert to plain object
    const plainPkg = pkg.toObject();

    return {
      ...plainPkg,
      id: plainPkg._id.toString(), // ensure id exists for frontend
    };
  } catch (error) {
    console.error('❌ createEventPackage error:', error);
    throw new Error('Failed to create package');
  }
};

export const getEventPackages = async () => {
  await connect();
  try {
    const packages = await EventPackage.find().lean();

    // Map to add 'id' for frontend
    const formattedPackages = packages.map((pkg) => ({
      ...pkg,
      id: pkg._id.toString(),
    }));
    console.log('✅ Fetched packages:', formattedPackages);
    return formattedPackages;
  } catch (error) {
    console.error('❌ getEventPackages error:', error);
    throw new Error('Failed to fetch packages');
  }
};

export const updateEventPackage = async (id, packageData) => {
  await connect();

  try {
    const updated = await EventPackage.findByIdAndUpdate(
      id,
      packageData,
      { new: true } // 🔥 return updated doc
    ).lean();

    return {
      ...updated,
      id: updated._id.toString(),
    };
  } catch (error) {
    console.error('❌ updateEventPackage error:', error);
    throw new Error('Failed to update package');
  }
};

export const deleteEventPackage = async (packageId) => {
  await connect();
  try {
    const deletedPackage =
      await EventPackage.findByIdAndDelete(packageId).lean();

    if (!deletedPackage) return null; // in case the ID doesn't exist

    return {
      ...deletedPackage,
      id: deletedPackage._id.toString(),
    };
  } catch (error) {
    console.error('❌ deleteEventPackage error:', error);
    throw new Error('Failed to delete package');
  }
};

export const toggleEventPackageStatus = async (packageId, isActive) => {
  await connect();

  try {
    const updatedPackage = await EventPackage.findByIdAndUpdate(
      packageId,
      { isActive },
      { new: true, runValidators: true }
    ).lean(); // 🔥 make it plain object

    if (!updatedPackage) return null;

    return {
      ...updatedPackage,
      id: updatedPackage._id.toString(),
    };
  } catch (error) {
    console.error('❌ toggleEventPackageStatus error:', error);
    throw new Error('Failed to toggle package status');
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
