import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';

/**
 * Programmatically builds a standardized PDF with charts and data tables.
 * @param {Object} config - { title, subtitle, headers, data, chartRefs, summary }
 * @param {string} filename - The desired filename for the downloaded PDF.
 */
export const generateHybridReport = async (config, filename = 'report.pdf') => {
    const { title, subtitle, headers, data, chartRefs = [], summary = [] } = config;
    
    if (!data || data.length === 0) {
        toast.error('No data available to generate report.');
        return;
    }
    
    const toastId = toast.loading('Generating standardized report, please wait...');
    try {
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const margin = 14;
        let startY = margin;

        // 1. Draw Document Header
        pdf.setFontSize(22);
        pdf.setTextColor(40);
        pdf.text(title || 'System Report', margin, startY + 10);
        
        pdf.setFontSize(11);
        pdf.setTextColor(100);
        if (subtitle) {
            pdf.text(subtitle, margin, startY + 18);
        }
        pdf.text(`Generated on: ${new Date().toLocaleString()}`, margin, startY + 24);
        
        startY += 30;

        // 1.5 Draw Summary Metrics if provided
        if (summary && summary.length > 0) {
            pdf.setFontSize(14);
            pdf.setTextColor(40);
            pdf.text('Summary Metrics', margin, startY);
            startY += 8;
            
            pdf.setFontSize(11);
            pdf.setTextColor(80);
            summary.forEach((metric, idx) => {
                pdf.text(`• ${metric.label}: ${metric.value}`, margin + 5, startY + (idx * 6));
            });
            startY += (summary.length * 6) + 10;
        }

        // 2. Capture and Insert Charts
        for (const chartRef of chartRefs) {
            if (chartRef && chartRef.current) {
                const width = chartRef.current.offsetWidth;
                const height = chartRef.current.offsetHeight;
                
                const imgData = await htmlToImage.toPng(chartRef.current, {
                    backgroundColor: '#ffffff',
                    pixelRatio: 2, 
                    style: { margin: '0' }
                });

                const maxPdfChartWidth = pdfWidth - (margin * 2);
                const pdfChartHeight = (height * maxPdfChartWidth) / width;
                
                if (startY + pdfChartHeight > pdf.internal.pageSize.getHeight() - margin) {
                    pdf.addPage();
                    startY = margin;
                }

                pdf.addImage(imgData, 'PNG', margin, startY, maxPdfChartWidth, pdfChartHeight);
                startY += pdfChartHeight + 15;
            }
        }

        // 3. Generate Data Tables
        if (headers && data && headers.length > 0) {
            autoTable(pdf, {
                startY: startY,
                head: [headers],
                body: data,
                theme: 'striped',
                headStyles: { fillColor: [41, 128, 185] },
                margin: { top: margin },
                didDrawPage: function (data) {
                    // Footer
                    const str = "Page " + pdf.internal.getNumberOfPages();
                    pdf.setFontSize(10);
                    const pageSize = pdf.internal.pageSize;
                    const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
                    pdf.text(str, data.settings.margin.left, pageHeight - 10);
                }
            });
        }

        pdf.save(filename);
        toast.success('Report downloaded successfully!', { id: toastId });
    } catch (error) {
        console.error('Error generating PDF:', error);
        toast.error(`Failed to generate report: ${error?.message || 'Unknown error'}`, { id: toastId });
    }
};

/**
 * [DEPRECATED] Captures a DOM element and generates a PDF report.
 * Use generateHybridReport instead for standardized reports.
 */
export const generatePDFReport = async (domElement, filename = 'report.pdf') => {
    if (!domElement) {
        toast.error('Could not locate report content.');
        return;
    }
    
    console.warn('generatePDFReport is deprecated. Use generateHybridReport instead.');
    const toastId = toast.loading('Generating digital report, please wait...');
    try {
        const width = domElement.offsetWidth;
        const height = domElement.offsetHeight;

        const imgData = await htmlToImage.toPng(domElement, {
            backgroundColor: '#ffffff',
            pixelRatio: 2, 
            style: {
                margin: '0', 
            }
        });
        
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (height * pdfWidth) / width;
        
        let position = 0;
        const pageHeight = pdf.internal.pageSize.getHeight();
        let heightLeft = pdfHeight;

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
            position = heightLeft - pdfHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
            heightLeft -= pageHeight;
        }

        pdf.save(filename);
        toast.success('Report downloaded successfully!', { id: toastId });
    } catch (error) {
        console.error('Error generating PDF:', error);
        toast.error(`Failed to generate report: ${error?.message || 'Unknown error'}`, { id: toastId });
    }
};
