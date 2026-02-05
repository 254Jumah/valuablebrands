import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

const money = new Intl.NumberFormat('en-KE', {
  style: 'currency',
  currency: 'KES',
  maximumFractionDigits: 0,
});

export function generateReceiptPDF(data) {
  const {
    registration,
    brand,
    paymentAmount,
    paymentNote,
    receiptNumber,
    companyInfo,
  } = data;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Colors
  const successColor = [34, 197, 94]; // Green
  const darkColor = [31, 41, 55];
  const grayColor = [107, 114, 128];

  let yPos = 20;

  // Header with company info
  doc.setFillColor(...successColor);
  doc.rect(0, 0, pageWidth, 45, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(companyInfo.name, 20, yPos);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  yPos += 8;
  doc.text(companyInfo.address, 20, yPos);
  yPos += 5;
  doc.text(`${companyInfo.phone} | ${companyInfo.email}`, 20, yPos);
  yPos += 5;
  doc.text(companyInfo.website, 20, yPos);

  // RECEIPT title on right
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('RECEIPT', pageWidth - 20, 25, { align: 'right' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const rcptNum =
    receiptNumber || `RCP-${Date.now().toString(36).toUpperCase()}`;
  doc.text(rcptNum, pageWidth - 20, 35, { align: 'right' });

  yPos = 55;

  // Payment confirmation banner
  doc.setFillColor(240, 253, 244); // Light green
  doc.rect(20, yPos, pageWidth - 40, 25, 'F');
  doc.setDrawColor(...successColor);
  doc.setLineWidth(0.5);
  doc.rect(20, yPos, pageWidth - 40, 25, 'S');

  doc.setTextColor(...successColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('✓ PAYMENT RECEIVED', pageWidth / 2, yPos + 10, { align: 'center' });
  doc.setFontSize(18);
  doc.text(money.format(paymentAmount), pageWidth / 2, yPos + 20, {
    align: 'center',
  });

  yPos += 35;

  // Receipt details
  doc.setTextColor(...darkColor);
  doc.setFontSize(10);

  // Left side - Received From
  doc.setFont('helvetica', 'bold');
  doc.text('RECEIVED FROM:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  yPos += 6;
  doc.text(brand?.businessName || 'Unknown Business', 20, yPos);
  yPos += 5;
  if (brand?.primaryContact?.name) {
    doc.text(brand.primaryContact.name, 20, yPos);
    yPos += 5;
  }
  if (brand?.primaryContact?.email) {
    doc.text(brand.primaryContact.email, 20, yPos);
    yPos += 5;
  }
  if (brand?.primaryContact?.phone) {
    doc.text(brand.primaryContact.phone, 20, yPos);
    yPos += 5;
  }

  // Right side - Receipt details
  const rightX = pageWidth - 70;
  let rightY = yPos - 21;

  doc.setFont('helvetica', 'bold');
  doc.text('Receipt Date:', rightX, rightY);
  doc.setFont('helvetica', 'normal');
  doc.text(format(new Date(), 'MMMM d, yyyy'), rightX + 30, rightY);
  rightY += 6;

  doc.setFont('helvetica', 'bold');
  doc.text('Receipt Time:', rightX, rightY);
  doc.setFont('helvetica', 'normal');
  doc.text(format(new Date(), 'h:mm a'), rightX + 30, rightY);
  rightY += 6;

  doc.setFont('helvetica', 'bold');
  doc.text('Invoice Ref:', rightX, rightY);
  doc.setFont('helvetica', 'normal');
  doc.text(registration.invoiceNumber || 'N/A', rightX + 30, rightY);

  yPos = Math.max(yPos, rightY) + 15;

  // Payment details table
  autoTable(doc, {
    startY: yPos,
    head: [['Description', 'Details']],
    body: [
      ['Event', registration.eventName],
      ['Package', `${registration.packageTier} (${registration.pax} seats)`],
      ['Invoice Number', registration.invoiceNumber || 'N/A'],
      ['Payment Amount', money.format(paymentAmount)],
      ['Payment Method', paymentNote || 'Cash/Bank Transfer'],
    ],
    headStyles: {
      fillColor: successColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    bodyStyles: {
      textColor: darkColor,
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    columnStyles: {
      0: { cellWidth: 60, fontStyle: 'bold' },
      1: { cellWidth: 110 },
    },
    margin: { left: 20, right: 20 },
  });

  yPos = doc.lastAutoTable.finalY + 15;

  // Account Summary
  doc.setFillColor(245, 245, 245);
  doc.rect(20, yPos, pageWidth - 40, 35, 'F');

  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Account Summary', 25, yPos + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  const summaryY = yPos + 16;
  doc.text('Total Invoice Amount:', 25, summaryY);
  doc.text(money.format(registration.amountTotal), 100, summaryY);

  doc.text('Total Paid to Date:', 25, summaryY + 7);
  doc.setTextColor(...successColor);
  doc.text(
    money.format(registration.amountPaid + paymentAmount),
    100,
    summaryY + 7
  );

  const newBalance = Math.max(
    0,
    registration.amountTotal - registration.amountPaid - paymentAmount
  );
  doc.setTextColor(...darkColor);
  doc.text('Remaining Balance:', 25, summaryY + 14);
  doc.setTextColor(
    newBalance > 0 ? 239 : 34,
    newBalance > 0 ? 68 : 197,
    newBalance > 0 ? 68 : 94
  );
  doc.setFont('helvetica', 'bold');
  doc.text(money.format(newBalance), 100, summaryY + 14);

  yPos += 50;

  // Thank you message
  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(11);
  doc.text('Thank you for your payment!', pageWidth / 2, yPos, {
    align: 'center',
  });

  yPos += 15;

  // Notes section
  if (paymentNote) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Payment Reference/Notes:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    yPos += 6;
    doc.text(paymentNote, 20, yPos);
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 25;
  doc.setFillColor(245, 245, 245);
  doc.rect(0, footerY - 10, pageWidth, 35, 'F');
  doc.setTextColor(...grayColor);
  doc.setFontSize(8);
  doc.text(
    'This is an official receipt for the payment received.',
    pageWidth / 2,
    footerY,
    { align: 'center' }
  );
  doc.text(
    'Please retain this receipt for your records.',
    pageWidth / 2,
    footerY + 5,
    { align: 'center' }
  );
  doc.text(
    `Generated on ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}`,
    pageWidth / 2,
    footerY + 10,
    { align: 'center' }
  );

  return doc;
}

export function downloadReceiptPDF(data) {
  const doc = generateReceiptPDF(data);
  const filename = `Receipt-${data.receiptNumber || Date.now()}-${
    data.brand?.businessName?.replace(/\s+/g, '_') || 'Unknown'
  }.pdf`;
  doc.save(filename);
}
