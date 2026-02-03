import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatCurrency } from './calculations';

export const exportToPDF = (projectInfo, materials, estimate, options, settings, currentUserId, logoSrc) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Brand Colors
    const colorYellow = [251, 191, 36];
    const colorBlue = [59, 130, 246];
    const colorGray = [100, 100, 100];
    const colorDarkGray = [40, 40, 40];

    // Header with Logo
    // logoSrc is passed as a parameter

    // Title
    doc.setFontSize(22);
    doc.setTextColor(colorDarkGray[0], colorDarkGray[1], colorDarkGray[2]);
    doc.text('UNITED ESTIMATOR APP', 105, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(colorGray[0], colorGray[1], colorGray[2]);
    doc.text(`Estimate #: ${projectInfo.estimateNumber}`, 15, 30);
    doc.text(`Date: ${projectInfo.date}`, 150, 30);
    doc.text(`Vendedor / Salesperson: ${currentUserId || projectInfo.preparedBy || 'N/A'}`, 15, 35);

    // Client Info
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Client Information:', 15, 50);
    doc.setFontSize(10);
    doc.text(`Client: ${projectInfo.clientName}`, 15, 56);
    doc.text(`Project: ${projectInfo.projectName}`, 15, 62);
    doc.text(`Address: ${projectInfo.address}`, 15, 68);

    // Scope
    doc.setFontSize(12);
    doc.text('Scope of Work:', 15, 80);
    doc.setFontSize(10);
    const splitScope = doc.splitTextToSize(projectInfo.scopeSummary || 'No scope summary provided.', 180);
    doc.text(splitScope, 15, 86);

    let currentY = 86 + (splitScope.length * 5) + 10;

    // Materials List
    doc.setFontSize(12);
    doc.text('Materials List:', 15, currentY);
    currentY += 6;

    const materialsData = materials.map(m => [
        m.category || 'N/A',
        m.description || 'N/A',
        `${m.quantity} ${m.unit || 'EA'}`,
        formatCurrency(m.unitCost),
        formatCurrency(m.quantity * m.unitCost)
    ]);

    doc.autoTable({
        startY: currentY,
        head: [['Category', 'Description', 'Qty', 'Unit Cost', 'Total']],
        body: materialsData,
        theme: 'striped',
        styles: { fontSize: 8 },
        headStyles: { fillStyle: colorGray, textColor: [255, 255, 255] }
    });

    currentY = doc.lastAutoTable.finalY + 10;

    // Pricing Table
    doc.setFontSize(12);
    doc.text('Pricing Options & Earnings:', 15, currentY);
    currentY += 6;

    const variantData = Object.entries(estimate.variants).map(([key, data]) => [
        key.charAt(0).toUpperCase() + key.slice(1),
        formatCurrency(data.totalSellingPrice),
        `${formatCurrency(data.commissionAmount)} (${((data.commissionAmount / data.totalSellingPrice) * 100).toFixed(1)}% of total)`,
        formatCurrency(data.profitAmount),
        `${data.margin}%`
    ]);

    doc.autoTable({
        startY: currentY,
        head: [['Scenario', 'Total Price', 'Commission (Vendedor)', 'Earnings', 'Margin']],
        body: variantData,
        theme: 'striped',
        headStyles: { fillStyle: colorYellow, textColor: [0, 0, 0] }
    });

    currentY = doc.lastAutoTable.finalY + 15;

    // Detailed Breakdown
    doc.setFontSize(12);
    doc.text('Production Cost Breakdown:', 15, currentY);
    currentY += 6;

    const breakdownData = [
        ['Materials w/ Waste', `Subtotal + ${settings.materialWaste}% waste`, formatCurrency(estimate.materialsWithWaste)],
        ['Fabrication Cost', estimate.fabCost > 0 ? `Level ${options.fabComplexity} (${settings.fabMultipliers[options.fabComplexity]}%)` : 'N/A', formatCurrency(estimate.fabCost)],
        ['Installation Cost', estimate.instCost > 0 ? `Level ${options.instComplexity} (${settings.instMultipliers[options.instComplexity]}%)` : 'N/A', formatCurrency(estimate.instCost)],
        ['Special Finish', estimate.finishAdder > 0 ? options.finishType : 'N/A', formatCurrency(estimate.finishAdder)],
        ['Rental Equipment (Internal)', estimate.rentalAdder > 0 ? options.rentalType : 'N/A', formatCurrency(estimate.rentalAdder)],
        ['External Equipment', options.equipmentRental > 0 ? 'Fixed direct entry' : 'N/A', formatCurrency(options.equipmentRental)],
        ['TOTAL PRODUCTION BASIS', 'Sum of all production layers', formatCurrency(estimate.subtotalCostBasis)]
    ].filter(row => row[2] !== '$0.00' || row[0] === 'TOTAL PRODUCTION BASIS');

    doc.autoTable({
        startY: currentY,
        head: [['Cost Layer', 'Logic', 'Total Cost']],
        body: breakdownData,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillStyle: colorBlue, textColor: [255, 255, 255] },
        columnStyles: { 2: { halign: 'right', fontStyle: 'bold' } }
    });

    currentY = doc.lastAutoTable.finalY + 15;

    // Notes/Exclusions
    if (projectInfo.notes) {
        doc.setFontSize(12);
        doc.text('Notes & Exclusions:', 15, currentY);
        currentY += 6;
        doc.setFontSize(10);
        const splitNotes = doc.splitTextToSize(projectInfo.notes, 180);
        doc.text(splitNotes, 15, currentY);
        currentY += (splitNotes.length * 5) + 10;
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('This estimate is valid for 30 days. Final pricing subject to field verification.', 105, 285, { align: 'center' });
    doc.text(`Page 1 of 1`, 190, 285);

    doc.save(`${projectInfo.estimateNumber}_${projectInfo.projectName.replace(/\s+/g, '_')}.pdf`);
};

export const exportToCSV = (materials) => {
    if (materials.length === 0) return;
    const headers = ['Category', 'Description', 'Unit', 'Quantity', 'UnitCost', 'Total'];
    const rows = materials.map(m => [
        m.category,
        m.description,
        m.unit,
        m.quantity,
        m.unitCost,
        (m.quantity * m.unitCost).toFixed(2)
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'materials_list.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
