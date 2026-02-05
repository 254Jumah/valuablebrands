import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { packageCatalog } from '@/data/mockEventFinance';

const money = new Intl.NumberFormat('en-KE', {
  style: 'currency',
  currency: 'KES',
  maximumFractionDigits: 0,
});

export function generateInvoicePDF(data) {
  const { registration, brand, companyInfo } = data;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Colors
  const primaryColor = [79, 70, 229]; // Indigo
  const darkColor = [31, 41, 55];
  const grayColor = [107, 114, 128];

  let yPos = 20;

  // Header with company info
  doc.setFillColor(...primaryColor);
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

  // INVOICE title on right
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', pageWidth - 20, 25, { align: 'right' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(registration.invoiceNumber || 'DRAFT', pageWidth - 20, 35, {
    align: 'right',
  });

  yPos = 60;

  // Invoice details box
  doc.setTextColor(...darkColor);
  doc.setFontSize(10);

  // Left side - Bill To
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO:', 20, yPos);
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

  // Right side - Invoice details
  const rightX = pageWidth - 70;
  let rightY = 60;

  doc.setFont('helvetica', 'bold');
  doc.text('Invoice Date:', rightX, rightY);
  doc.setFont('helvetica', 'normal');
  doc.text(format(new Date(), 'MMMM d, yyyy'), rightX + 35, rightY);
  rightY += 6;

  if (registration.dueDate) {
    doc.setFont('helvetica', 'bold');
    doc.text('Due Date:', rightX, rightY);
    doc.setFont('helvetica', 'normal');
    doc.text(
      format(new Date(registration.dueDate), 'MMMM d, yyyy'),
      rightX + 35,
      rightY
    );
    rightY += 6;
  }

  doc.setFont('helvetica', 'bold');
  doc.text('Status:', rightX, rightY);
  doc.setFont('helvetica', 'normal');
  doc.text(registration.invoiceStatus, rightX + 35, rightY);

  yPos = Math.max(yPos, rightY) + 15;

  // Event info
  doc.setFillColor(245, 245, 245);
  doc.rect(20, yPos, pageWidth - 40, 20, 'F');
  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'bold');
  doc.text('Event:', 25, yPos + 8);
  doc.setFont('helvetica', 'normal');
  doc.text(registration.eventName, 45, yPos + 8);
  doc.setFont('helvetica', 'bold');
  doc.text('Package:', 25, yPos + 15);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `${registration.packageTier} (${registration.pax} seats)`,
    50,
    yPos + 15
  );

  yPos += 30;

  // Line items table
  const packageInfo = packageCatalog[registration.packageTier];

  autoTable(doc, {
    startY: yPos,
    head: [['Description', 'Qty', 'Unit Price', 'Amount']],
    body: [
      [
        `${registration.packageTier} Package - ${
          registration.eventName
        }\n${packageInfo.benefits.join(', ')}`,
        '1',
        money.format(packageInfo.price),
        money.format(packageInfo.price),
      ],
      ...(registration.pax > packageInfo.includedPax
        ? [
            [
              `Additional Seats (${
                registration.pax - packageInfo.includedPax
              } extra)`,
              String(registration.pax - packageInfo.includedPax),
              money.format(10000),
              money.format(
                (registration.pax - packageInfo.includedPax) * 10000
              ),
            ],
          ]
        : []),
    ],
    headStyles: {
      fillColor: primaryColor,
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
      0: { cellWidth: 90 },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' },
    },
    margin: { left: 20, right: 20 },
  });

  yPos = doc.lastAutoTable.finalY + 10;

  // Totals
  const totalsX = pageWidth - 80;
  const totalsValueX = pageWidth - 20;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  doc.text('Subtotal:', totalsX, yPos);
  doc.setTextColor(...darkColor);
  doc.text(money.format(registration.amountTotal), totalsValueX, yPos, {
    align: 'right',
  });
  yPos += 7;

  doc.setTextColor(...grayColor);
  doc.text('Amount Paid:', totalsX, yPos);
  doc.setTextColor(34, 197, 94); // Green
  doc.text(money.format(registration.amountPaid), totalsValueX, yPos, {
    align: 'right',
  });
  yPos += 7;

  // Balance due
  const balance = Math.max(
    0,
    registration.amountTotal - registration.amountPaid
  );
  doc.setFillColor(...primaryColor);
  doc.rect(totalsX - 10, yPos - 5, pageWidth - totalsX, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('Balance Due:', totalsX, yPos + 3);
  doc.text(money.format(balance), totalsValueX, yPos + 3, { align: 'right' });

  yPos += 25;

  // Payment terms
  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Payment Terms & Instructions', 20, yPos);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...grayColor);
  yPos += 7;
  doc.text('• Payment is due within 14 days of invoice date', 20, yPos);
  yPos += 5;
  doc.text(
    '• Bank: Kenya Commercial Bank | Account: 1234567890 | Branch: Nairobi',
    20,
    yPos
  );
  yPos += 5;
  doc.text('• M-Pesa Paybill: 123456 | Account: Your Invoice Number', 20, yPos);
  yPos += 5;
  doc.text('• Please include invoice number in payment reference', 20, yPos);

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setFillColor(245, 245, 245);
  doc.rect(0, footerY - 10, pageWidth, 30, 'F');
  doc.setTextColor(...grayColor);
  doc.setFontSize(8);
  doc.text('Thank you for your business!', pageWidth / 2, footerY, {
    align: 'center',
  });
  doc.text(
    `Generated on ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}`,
    pageWidth / 2,
    footerY + 5,
    { align: 'center' }
  );

  return doc;
}

export function downloadInvoicePDF(data) {
  const doc = generateInvoicePDF(data);
  const filename = `Invoice-${
    data.registration.invoiceNumber || 'DRAFT'
  }-${data.brand?.businessName?.replace(/\s+/g, '_') || 'Unknown'}.pdf`;
  doc.save(filename);
}
