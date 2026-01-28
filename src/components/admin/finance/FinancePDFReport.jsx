import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { profitLossSummary, financialKPIs } from '@/data/mockFinanceAnalytics';

function formatKES(amount) {
  return `KES ${amount.toLocaleString()}`;
}

export function generateFinancePDF(options) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const reportDate = format(new Date(), 'MMMM d, yyyy');
  let yPosition = 20;

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Valuable Brands Africa', pageWidth / 2, yPosition, {
    align: 'center',
  });
  yPosition += 10;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  const titles = {
    summary: 'Financial Summary Report',
    detailed: 'Detailed Financial Report',
    transactions: 'Transaction Report',
    cashflow: 'Cash Flow Statement',
    pnl: 'Profit & Loss Statement',
  };
  doc.text(titles[options.reportType], pageWidth / 2, yPosition, {
    align: 'center',
  });
  yPosition += 8;

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on ${reportDate}`, pageWidth / 2, yPosition, {
    align: 'center',
  });
  doc.setTextColor(0);
  yPosition += 15;

  // Summary Report
  if (options.reportType === 'summary' || options.reportType === 'detailed') {
    // KPIs Section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Key Performance Indicators', 14, yPosition);
    yPosition += 8;

    const kpiData = financialKPIs
      .slice(0, 8)
      .map((kpi) => [
        kpi.name,
        kpi.name.includes('Margin') || kpi.name === 'ROI'
          ? `${kpi.value.toFixed(1)}%`
          : formatKES(kpi.value),
        `${kpi.change > 0 ? '+' : ''}${kpi.change}%`,
        kpi.period,
      ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Metric', 'Value', 'Change', 'Period']],
      body: kpiData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 9 },
    });

    yPosition = doc.lastAutoTable.finalY + 15;

    // Income by Source
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Revenue Breakdown', 14, yPosition);
    yPosition += 8;

    const incomeData = options.income.map((item) => [
      item.source,
      formatKES(item.amount),
      `${item.percentage}%`,
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Source', 'Amount', 'Percentage']],
      body: incomeData,
      theme: 'striped',
      headStyles: { fillColor: [34, 197, 94] },
      styles: { fontSize: 9 },
    });

    yPosition = doc.lastAutoTable.finalY + 15;

    // Expense by Category
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Expense Breakdown', 14, yPosition);
    yPosition += 8;

    const expenseData = options.expenses.map((item) => [
      item.category,
      formatKES(item.amount),
      `${item.percentage}%`,
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Category', 'Amount', 'Percentage']],
      body: expenseData,
      theme: 'striped',
      headStyles: { fillColor: [239, 68, 68] },
      styles: { fontSize: 9 },
    });
  }

  // Transactions Report
  if (
    options.reportType === 'transactions' ||
    options.reportType === 'detailed'
  ) {
    if (options.reportType === 'detailed') {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Transaction History', 14, yPosition);
    yPosition += 8;

    const txData = options.transactions.map((tx) => [
      format(new Date(tx.date), 'MMM d, yyyy'),
      tx.type,
      tx.category,
      tx.description.substring(0, 30),
      tx.type === 'Income' ? formatKES(tx.amount) : '',
      tx.type === 'Expense' ? formatKES(tx.amount) : '',
      tx.paymentStatus,
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [
        [
          'Date',
          'Type',
          'Category',
          'Description',
          'Income',
          'Expense',
          'Status',
        ],
      ],
      body: txData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 8 },
      columnStyles: {
        3: { cellWidth: 40 },
      },
    });
  }

  // Cash Flow Report
  if (options.reportType === 'cashflow' || options.reportType === 'detailed') {
    if (options.reportType === 'detailed') {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Cash Flow Statement', 14, yPosition);
    yPosition += 8;

    const cfData = options.cashFlow.map((item) => [
      format(new Date(item.date), 'MMM d, yyyy'),
      item.description,
      item.category,
      item.inflow > 0 ? formatKES(item.inflow) : '',
      item.outflow > 0 ? formatKES(item.outflow) : '',
      formatKES(item.balance),
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [
        ['Date', 'Description', 'Category', 'Inflow', 'Outflow', 'Balance'],
      ],
      body: cfData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 8 },
    });

    yPosition = doc.lastAutoTable.finalY + 15;

    // Accounts Payable
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Accounts Payable', 14, yPosition);
    yPosition += 8;

    const apData = options.payables.map((item) => [
      item.vendor,
      item.invoiceNumber,
      format(new Date(item.dueDate), 'MMM d, yyyy'),
      formatKES(item.amount),
      item.status,
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Vendor', 'Invoice #', 'Due Date', 'Amount', 'Status']],
      body: apData,
      theme: 'striped',
      headStyles: { fillColor: [239, 68, 68] },
      styles: { fontSize: 9 },
    });

    yPosition = doc.lastAutoTable.finalY + 15;

    // Accounts Receivable
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Accounts Receivable', 14, yPosition);
    yPosition += 8;

    const arData = options.receivables.map((item) => [
      item.client,
      item.invoiceNumber,
      format(new Date(item.dueDate), 'MMM d, yyyy'),
      formatKES(item.amount),
      item.status,
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Client', 'Invoice #', 'Due Date', 'Amount', 'Status']],
      body: arData,
      theme: 'striped',
      headStyles: { fillColor: [34, 197, 94] },
      styles: { fontSize: 9 },
    });
  }

  // P&L Report
  if (options.reportType === 'pnl') {
    const pnl = profitLossSummary;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Revenue', 14, yPosition);
    yPosition += 8;

    const revenueData = [
      ['Sponsorships', formatKES(pnl.revenue.sponsorships)],
      ['Ticket Sales', formatKES(pnl.revenue.ticketSales)],
      ['Registration Fees', formatKES(pnl.revenue.registrationFees)],
      ['Partnerships', formatKES(pnl.revenue.partnerships)],
      ['Other Income', formatKES(pnl.revenue.other)],
      ['Total Revenue', formatKES(pnl.revenue.total)],
    ];

    autoTable(doc, {
      startY: yPosition,
      body: revenueData,
      theme: 'plain',
      styles: { fontSize: 10 },
      columnStyles: { 0: { fontStyle: 'normal' }, 1: { halign: 'right' } },
      didParseCell: (data) => {
        if (data.row.index === revenueData.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [220, 252, 231];
        }
      },
    });

    yPosition = doc.lastAutoTable.finalY + 10;

    doc.setFont('helvetica', 'bold');
    doc.text('Cost of Sales', 14, yPosition);
    yPosition += 8;

    const cosData = [
      ['Venue Costs', formatKES(pnl.costOfSales.venue)],
      ['Catering', formatKES(pnl.costOfSales.catering)],
      ['Equipment', formatKES(pnl.costOfSales.equipment)],
      ['Total Cost of Sales', formatKES(pnl.costOfSales.total)],
    ];

    autoTable(doc, {
      startY: yPosition,
      body: cosData,
      theme: 'plain',
      styles: { fontSize: 10 },
      columnStyles: { 1: { halign: 'right' } },
      didParseCell: (data) => {
        if (data.row.index === cosData.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [254, 226, 226];
        }
      },
    });

    yPosition = doc.lastAutoTable.finalY + 5;

    autoTable(doc, {
      startY: yPosition,
      body: [['Gross Profit', formatKES(pnl.grossProfit)]],
      theme: 'plain',
      styles: { fontSize: 11, fontStyle: 'bold' },
      columnStyles: { 1: { halign: 'right' } },
      didParseCell: (data) => {
        data.cell.styles.fillColor = [220, 252, 231];
      },
    });

    yPosition = doc.lastAutoTable.finalY + 10;

    doc.setFont('helvetica', 'bold');
    doc.text('Operating Expenses', 14, yPosition);
    yPosition += 8;

    const opexData = [
      ['Marketing & Advertising', formatKES(pnl.operatingExpenses.marketing)],
      ['Staff & Payroll', formatKES(pnl.operatingExpenses.staffPayroll)],
      ['Contractors', formatKES(pnl.operatingExpenses.contractors)],
      ['Logistics', formatKES(pnl.operatingExpenses.logistics)],
      ['Administrative', formatKES(pnl.operatingExpenses.administrative)],
      ['Total Operating Expenses', formatKES(pnl.operatingExpenses.total)],
    ];

    autoTable(doc, {
      startY: yPosition,
      body: opexData,
      theme: 'plain',
      styles: { fontSize: 10 },
      columnStyles: { 1: { halign: 'right' } },
      didParseCell: (data) => {
        if (data.row.index === opexData.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [254, 226, 226];
        }
      },
    });

    yPosition = doc.lastAutoTable.finalY + 5;

    autoTable(doc, {
      startY: yPosition,
      body: [
        ['Operating Profit', formatKES(pnl.operatingProfit)],
        ['Taxes (30%)', `(${formatKES(pnl.taxes)})`],
        ['Net Profit', formatKES(pnl.netProfit)],
      ],
      theme: 'plain',
      styles: { fontSize: 11, fontStyle: 'bold' },
      columnStyles: { 1: { halign: 'right' } },
      didParseCell: (data) => {
        if (data.row.index === 2) {
          data.cell.styles.fillColor = [219, 234, 254];
        }
      },
    });
  }

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount} | Valuable Brands Africa - Confidential`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  const fileName = `VBA_${titles[options.reportType].replace(
    / /g,
    '_'
  )}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);
}
