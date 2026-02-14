import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

export function generateAwardsPDF(options) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const reportDate = format(new Date(), 'MMMM d, yyyy');
  let y = 20;

  // ── Header ──
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Valuable Brands Africa', pageWidth / 2, y, { align: 'center' });
  y += 10;

  const titles = {
    full: 'Awards Full Report',
    results: 'Awards Results Report',
    analytics: 'Awards Analytics Report',
  };

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(titles[options.reportType], pageWidth / 2, y, { align: 'center' });
  y += 8;

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on ${reportDate}`, pageWidth / 2, y, { align: 'center' });
  doc.setTextColor(0);
  y += 15;

  // ── KPI Summary ──
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Overview', 14, y);
  y += 8;

  autoTable(doc, {
    startY: y,
    head: [['Metric', 'Value']],
    body: [
      ['Total Votes', options.totalVotes.toLocaleString()],
      ['Total Nominees', String(options.totalNominees)],
      ['Active Categories', String(options.openCategories)],
      ['Verified Votes', `${options.verifiedPct}%`],
    ],
    theme: 'striped',
    headStyles: { fillColor: [212, 175, 55] },
    styles: { fontSize: 10 },
  });
  y = doc.lastAutoTable.finalY + 12;

  // ── Categories ──
  if (options.reportType === 'full' || options.reportType === 'results') {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Award Categories', 14, y);
    y += 8;

    autoTable(doc, {
      startY: y,
      head: [['Category', 'Status', 'Nominees', 'Total Votes', 'Period']],
      body: options.categories.map((c) => [
        c.name,
        c.status.charAt(0).toUpperCase() + c.status.slice(1),
        String(c.nominees),
        c.totalVotes.toLocaleString(),
        `${c.startDate} → ${c.endDate}`,
      ]),
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 9 },
    });
    y = doc.lastAutoTable.finalY + 12;

    // ── Results Leaderboard ──
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Results Leaderboard', 14, y);
    y += 8;

    const sortedNominees = [...options.nominees].sort(
      (a, b) => b.votes - a.votes
    );

    autoTable(doc, {
      startY: y,
      head: [['Rank', 'Nominee', 'Category', 'Votes', 'Region', 'Trend']],
      body: sortedNominees.map((n, i) => [
        `#${i + 1}`,
        n.name,
        n.categoryName,
        n.votes.toLocaleString(),
        n.region,
        n.trend === 'up'
          ? '↑ Rising'
          : n.trend === 'down'
            ? '↓ Falling'
            : '— Stable',
      ]),
      theme: 'striped',
      headStyles: { fillColor: [212, 175, 55] },
      styles: { fontSize: 9 },
      didParseCell: (data) => {
        if (data.section === 'body' && data.row.index === 0) {
          data.cell.styles.fontStyle = 'bold';
        }
      },
    });
    y = doc.lastAutoTable.finalY + 12;
  }

  // ── Analytics ──
  if (options.reportType === 'full' || options.reportType === 'analytics') {
    if (options.reportType === 'full') {
      doc.addPage();
      y = 20;
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Analytics', pageWidth / 2, y, { align: 'center' });
      y += 15;
    }

    // Vote trends by channel
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Weekly Vote Trends by Channel', 14, y);
    y += 8;

    autoTable(doc, {
      startY: y,
      head: [['Day', 'Web', 'Mobile', 'SMS', 'Total']],
      body: options.voteTrends.map((d) => [
        d.day,
        String(d.web),
        String(d.mobile),
        String(d.sms),
        String(d.web + d.mobile + d.sms),
      ]),
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 9 },
    });
    y = doc.lastAutoTable.finalY + 12;

    // Regional distribution
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Votes by Region', 14, y);
    y += 8;

    const totalRegion = options.regionData.reduce((a, r) => a + r.value, 0);

    autoTable(doc, {
      startY: y,
      head: [['Region', 'Votes', 'Percentage']],
      body: options.regionData.map((r) => [
        r.name,
        r.value.toLocaleString(),
        `${((r.value / totalRegion) * 100).toFixed(1)}%`,
      ]),
      theme: 'striped',
      headStyles: { fillColor: [34, 197, 94] },
      styles: { fontSize: 9 },
    });
    y = doc.lastAutoTable.finalY + 12;

    // Peak hours
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Peak Voting Hours', 14, y);
    y += 8;

    autoTable(doc, {
      startY: y,
      head: [['Hour', 'Votes']],
      body: options.hourlyData.map((h) => [h.hour, String(h.votes)]),
      theme: 'striped',
      headStyles: { fillColor: [212, 175, 55] },
      styles: { fontSize: 9 },
    });

    y = doc.lastAutoTable.finalY + 12;

    // Category leaders
    const openCats = options.categories.filter((c) => c.status === 'open');
    if (openCats.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Category Leaders', 14, y);
      y += 8;

      const leaderRows = openCats.map((cat) => {
        const leader = options.nominees
          .filter((n) => n.categoryId === cat.id)
          .sort((a, b) => b.votes - a.votes)[0];
        return [
          cat.name,
          leader?.name || '—',
          leader ? leader.votes.toLocaleString() : '0',
          cat.totalVotes.toLocaleString(),
        ];
      });

      autoTable(doc, {
        startY: y,
        head: [['Category', 'Leader', 'Leader Votes', 'Total Votes']],
        body: leaderRows,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 9 },
      });
    }
  }

  // ── Footer ──
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount} | Valuable Brands Africa Awards — Confidential`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  const fileName = `VBA_${titles[options.reportType].replace(
    / /g,
    '_'
  )}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);
  return fileName;
}
