import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatCurrency } from './calculations';

// Branding Logo (New United American Metal Works Logo)
const LOGO_BASE64 = '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';

export const exportToPDF = (projectInfo, materials, estimate, options, settings, currentUserId) => {
    try {
        const doc = new jsPDF();

        // Final Layout Specs
        const margin = 14;
        const colorBlue = [33, 53, 110]; // United Blue
        const colorGold = [241, 196, 15]; // United Gold
        const colorGray = [100, 100, 100];

        // Logo Rendering
        try {
            doc.addImage(LOGO_BASE64, 'PNG', margin, 10, 50, 15);
        } catch (e) {
            console.error("PDF Logo Failure", e);
        }

        // Title Section
        doc.setFontSize(22);
        doc.setTextColor(colorBlue[0], colorBlue[1], colorBlue[2]);
        doc.text('ESTIMATE REPORT', 105, 25, { align: 'center' });

        // Metadata
        doc.setFontSize(10);
        doc.setTextColor(colorGray[0], colorGray[1], colorGray[2]);
        doc.text(`Estimate: ${projectInfo.estimateNumber}`, margin, 35);
        doc.text(`Date: ${projectInfo.date}`, 196 - margin, 35, { align: 'right' });
        doc.text(`Salesperson: ${currentUserId || projectInfo.preparedBy || 'United Staff'}`, margin, 40);

        // Project Info
        doc.setFontSize(14);
        doc.setTextColor(30, 30, 30);
        doc.text('Project Information', margin, 52);
        doc.setFontSize(11);
        doc.text(`Client: ${projectInfo.clientName || 'N/A'}`, margin, 58);
        doc.text(`Project: ${projectInfo.projectName || 'N/A'}`, margin, 64);
        doc.text(`Address: ${projectInfo.address || 'N/A'}`, margin, 70);

        // Scope
        doc.setFontSize(14);
        doc.text('Scope of Work', margin, 82);
        doc.setFontSize(10);
        const splitScope = doc.splitTextToSize(projectInfo.scopeSummary || 'Standard fabrication and/or installation services.', 180);
        doc.text(splitScope, margin, 88);

        let curY = 88 + (splitScope.length * 5) + 10;

        // Materials Table
        doc.setFontSize(14);
        doc.text('Materials & Items', margin, curY);
        curY += 6;

        doc.autoTable({
            startY: curY,
            head: [['Category', 'Description', 'Qty', 'Unit Cost', 'Total']],
            body: materials.map(m => [
                m.category, m.description, `${m.quantity} ${m.unit}`,
                formatCurrency(m.unitCost), formatCurrency(m.quantity * m.unitCost)
            ]),
            theme: 'striped',
            headStyles: { fillStyle: [100, 100, 100], textColor: 255 },
            styles: { fontSize: 9 }
        });

        curY = doc.lastAutoTable.finalY + 15;

        // Pricing Scenarios
        doc.setFontSize(14);
        doc.text('Investment Summary', margin, curY);
        curY += 6;

        doc.autoTable({
            startY: curY,
            head: [['Pricing Scenario', 'Selling Price', 'Margin %', 'Estimated Earnings']],
            body: Object.entries(estimate.variants).map(([key, data]) => [
                key.toUpperCase(),
                formatCurrency(data.totalSellingPrice),
                `${data.margin}%`,
                formatCurrency(data.profitAmount)
            ]),
            theme: 'striped',
            headStyles: { fillStyle: colorBlue, textColor: 255 }
        });

        curY = doc.lastAutoTable.finalY + 15;

        // Detailed Cost Breakdown (internal)
        doc.setFontSize(14);
        doc.text('Core Cost Breakdown', margin, curY);
        curY += 6;

        const breakdown = [
            ['Fabrication Cost', formatCurrency(estimate.fabCost)],
            ['Installation Cost', formatCurrency(estimate.instCost)],
            ['Material Cost (incl. waste)', formatCurrency(estimate.materialsWithWaste)],
            ['Equipment / Misc Adders', formatCurrency((estimate.finishAdder || 0) + (estimate.rentalAdder || 0) + (options.equipmentRental || 0))],
            ['TOTAL PRODUCTION BASIS', formatCurrency(estimate.subtotalCostBasis)]
        ];

        doc.autoTable({
            startY: curY,
            head: [['Cost Layer', 'Value']],
            body: breakdown,
            theme: 'grid',
            headStyles: { fillStyle: [240, 240, 240], textColor: 0 },
            columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } }
        });

        // Footer
        const finalY = doc.internal.pageSize.height - 20;
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('This estimate is valid for 30 days. Final pricing subject to site verification.', 105, finalY, { align: 'center' });
        doc.text('United American Metal Works', 105, finalY + 5, { align: 'center' });

        doc.save(`${projectInfo.estimateNumber}_${projectInfo.projectName.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
        console.error("Critical PDF Export Error", err);
        alert("Failed to generate PDF. Please check console for errors.");
    }
};

export const exportToCSV = (materials) => {
    if (materials.length === 0) return;
    const headers = ['Category', 'Description', 'Unit', 'Quantity', 'UnitCost', 'Total'];
    const rows = materials.map(m => [
        m.category, m.description, m.unit, m.quantity, m.unitCost,
        (m.quantity * m.unitCost).toFixed(2)
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', 'materials_list.csv');
    link.click();
};
