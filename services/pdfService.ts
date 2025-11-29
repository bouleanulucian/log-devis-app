import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Quote, QuoteSection, Client } from '../types';
import { Invoice } from '../types/extended';
import { CalculationService } from './calculationService';

/**
 * PDFService - Generate professional PDF documents for quotes and invoices
 */
export class PDFService {
    private static readonly COLORS = {
        primary: [41, 128, 185], // Professional blue
        secondary: [52, 73, 94], // Dark gray
        text: [44, 62, 80],
        lightGray: [236, 240, 241],
        success: [46, 204, 113],
    };

    /**
     * Generate PDF for a quote
     */
    static generateQuotePDF(quote: Quote, client: Client, companyInfo?: any): void {
        const doc = new jsPDF();
        let yPosition = 20;

        // Add header
        yPosition = this.addQuoteHeader(doc, quote, companyInfo, yPosition);

        // Add client information
        yPosition = this.addClientInfo(doc, client, quote, yPosition);

        // Add items table
        yPosition = this.addItemsTable(doc, quote.sections, yPosition);

        // Add totals
        yPosition = this.addTotals(doc, quote, yPosition);

        // Add payment terms
        this.addPaymentTerms(doc, quote.paymentTerms, yPosition);

        // Add footer
        this.addFooter(doc, companyInfo);

        // Download the PDF
        doc.save(`Devis-${quote.number}.pdf`);
    }

    /**
     * Generate PDF for an invoice
     */
    static generateInvoicePDF(invoice: Invoice, client: Client, companyInfo?: any): void {
        const doc = new jsPDF();
        let yPosition = 20;

        // Add header
        yPosition = this.addInvoiceHeader(doc, invoice, companyInfo, yPosition);

        // Add client information
        yPosition = this.addClientInfo(doc, client, invoice as any, yPosition);

        // Add items table
        yPosition = this.addItemsTable(doc, invoice.sections, yPosition);

        // Add totals
        yPosition = this.addInvoiceTotals(doc, invoice, yPosition);

        // Add payment information
        yPosition = this.addPaymentInfo(doc, invoice, yPosition);

        // Add footer
        this.addFooter(doc, companyInfo);

        // Download the PDF
        doc.save(`Facture-${invoice.number}.pdf`);
    }

    /**
     * Add quote header
     */
    private static addQuoteHeader(
        doc: jsPDF,
        quote: Quote,
        companyInfo: any,
        startY: number
    ): number {
        // Company name
        doc.setFontSize(20);
        doc.setTextColor(...this.COLORS.primary);
        doc.text(companyInfo?.name || 'Votre Entreprise', 20, startY);

        // Company details
        doc.setFontSize(9);
        doc.setTextColor(...this.COLORS.text);
        if (companyInfo?.address) doc.text(companyInfo.address, 20, startY + 7);
        if (companyInfo?.phone) doc.text(`Tél: ${companyInfo.phone}`, 20, startY + 12);
        if (companyInfo?.email) doc.text(`Email: ${companyInfo.email}`, 20, startY + 17);

        // DEVIS title
        doc.setFontSize(24);
        doc.setTextColor(...this.COLORS.secondary);
        doc.setFont(undefined, 'bold');
        doc.text('DEVIS', 200, startY, { align: 'right' });

        // Quote number and date
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(...this.COLORS.text);
        doc.text(`N° ${quote.number}`, 200, startY + 10, { align: 'right' });
        doc.text(`Date: ${this.formatDate(quote.date)}`, 200, startY + 15, { align: 'right' });
        doc.text(`Validité: ${this.formatDate(quote.expiryDate)}`, 200, startY + 20, { align: 'right' });

        return startY + 30;
    }

    /**
     * Add invoice header
     */
    private static addInvoiceHeader(
        doc: jsPDF,
        invoice: Invoice,
        companyInfo: any,
        startY: number
    ): number {
        // Company name
        doc.setFontSize(20);
        doc.setTextColor(...this.COLORS.primary);
        doc.text(companyInfo?.name || 'Votre Entreprise', 20, startY);

        // Company details
        doc.setFontSize(9);
        doc.setTextColor(...this.COLORS.text);
        if (companyInfo?.address) doc.text(companyInfo.address, 20, startY + 7);
        if (companyInfo?.phone) doc.text(`Tél: ${companyInfo.phone}`, 20, startY + 12);
        if (companyInfo?.email) doc.text(`Email: ${companyInfo.email}`, 20, startY + 17);

        // FACTURE title
        doc.setFontSize(24);
        doc.setTextColor(...this.COLORS.primary);
        doc.setFont(undefined, 'bold');
        doc.text('FACTURE', 200, startY, { align: 'right' });

        // Invoice number and dates
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(...this.COLORS.text);
        doc.text(`N° ${invoice.number}`, 200, startY + 10, { align: 'right' });
        doc.text(`Date: ${this.formatDate(invoice.issueDate)}`, 200, startY + 15, { align: 'right' });
        doc.text(`Échéance: ${this.formatDate(invoice.dueDate)}`, 200, startY + 20, { align: 'right' });

        return startY + 30;
    }

    /**
     * Add client information
     */
    private static addClientInfo(
        doc: jsPDF,
        client: Client,
        quote: Quote,
        startY: number
    ): number {
        // Client box
        doc.setFillColor(...this.COLORS.lightGray);
        doc.rect(20, startY, 85, 35, 'F');

        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(...this.COLORS.secondary);
        doc.text('CLIENT', 25, startY + 7);

        doc.setFont(undefined, 'normal');
        doc.setTextColor(...this.COLORS.text);
        doc.text(client.name, 25, startY + 13);
        doc.text(client.address, 25, startY + 18);
        if (client.phone) doc.text(client.phone, 25, startY + 23);
        if (client.email) doc.text(client.email, 25, startY + 28);

        // Project box
        doc.setFillColor(...this.COLORS.lightGray);
        doc.rect(110, startY, 85, 35, 'F');

        doc.setFont(undefined, 'bold');
        doc.setTextColor(...this.COLORS.secondary);
        doc.text('CHANTIER', 115, startY + 7);

        doc.setFont(undefined, 'normal');
        doc.setTextColor(...this.COLORS.text);
        doc.text(quote.siteName || '-', 115, startY + 13);
        doc.text(quote.title, 115, startY + 18);
        if (quote.visitDate) doc.text(`Visite: ${this.formatDate(quote.visitDate)}`, 115, startY + 23);
        if (quote.startDate) doc.text(`Début: ${this.formatDate(quote.startDate)}`, 115, startY + 28);

        return startY + 40;
    }

    /**
     * Add items table
     */
    private static addItemsTable(
        doc: jsPDF,
        sections: QuoteSection[],
        startY: number
    ): number {
        const tableData: any[] = [];

        sections.forEach((section) => {
            // Add section header
            tableData.push([
                { content: section.title, colSpan: 5, styles: { fontStyle: 'bold', fillColor: this.COLORS.primary } }
            ]);

            // Add items
            section.items.forEach((item) => {
                if (item.type === 'item') {
                    tableData.push([
                        item.description,
                        item.quantity.toString(),
                        item.unit,
                        CalculationService.formatCurrency(item.unitPrice, ''),
                        CalculationService.formatCurrency(item.total, '')
                    ]);
                } else if (item.type === 'subheading') {
                    tableData.push([
                        { content: item.description, colSpan: 5, styles: { fontStyle: 'italic', fillColor: [245, 245, 245] } }
                    ]);
                } else if (item.type === 'text') {
                    tableData.push([
                        { content: item.description, colSpan: 5, styles: { fontSize: 9, textColor: [100, 100, 100] } }
                    ]);
                } else if (item.type === 'spacer') {
                    tableData.push([
                        { content: '', colSpan: 5, styles: { minCellHeight: 5 } }
                    ]);
                }
            });
        });

        autoTable(doc, {
            startY: startY,
            head: [['Description', 'Quantité', 'Unité', 'PU HT', 'Total HT']],
            body: tableData,
            theme: 'grid',
            headStyles: {
                fillColor: this.COLORS.secondary,
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 10
            },
            columnStyles: {
                0: { cellWidth: 90 },
                1: { cellWidth: 25, halign: 'center' },
                2: { cellWidth: 20, halign: 'center' },
                3: { cellWidth: 30, halign: 'right' },
                4: { cellWidth: 30, halign: 'right' }
            },
            styles: {
                fontSize: 9,
                cellPadding: 3
            }
        });

        return (doc as any).lastAutoTable.finalY + 10;
    }

    /**
     * Add totals section for quote
     */
    private static addTotals(doc: jsPDF, quote: Quote, startY: number): number {
        const totals = CalculationService.calculateQuoteTotals(quote);
        const xRight = 200;
        const xLabel = 140;

        doc.setFontSize(10);
        doc.setTextColor(...this.COLORS.text);

        let y = startY;

        // Subtotal
        doc.text('Sous-total HT:', xLabel, y);
        doc.text(CalculationService.formatCurrency(totals.subtotal, quote.currency), xRight, y, { align: 'right' });
        y += 7;

        // Discount if applicable
        if (quote.discount && quote.discount > 0) {
            const discountLabel = quote.discountType === 'percentage'
                ? `Réduction (${quote.discount}%):`
                : 'Réduction:';
            doc.text(discountLabel, xLabel, y);
            doc.text(`-${CalculationService.formatCurrency(totals.discountAmount, quote.currency)}`, xRight, y, { align: 'right' });
            y += 7;
        }

        // Total HT
        doc.setFont(undefined, 'bold');
        doc.text('Total HT:', xLabel, y);
        doc.text(CalculationService.formatCurrency(totals.totalHT, quote.currency), xRight, y, { align: 'right' });
        y += 7;

        // TVA
        doc.setFont(undefined, 'normal');
        const taxRate = quote.taxRate || 20;
        doc.text(`TVA (${taxRate}%):', xLabel, y);
    doc.text(CalculationService.formatCurrency(totals.taxAmount, quote.currency), xRight, y, { align: 'right' });
    y += 7;

    // Total TTC
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...this.COLORS.primary);
    doc.text('Total TTC:', xLabel, y);
    doc.text(CalculationService.formatCurrency(totals.totalTTC, quote.currency), xRight, y, { align: 'right' });

    return y + 15;
  }

  /**
   * Add totals section for invoice
   */
  private static addInvoiceTotals(doc: jsPDF, invoice: Invoice, startY: number): number {
    const xRight = 200;
    const xLabel = 140;

    doc.setFontSize(10);
    doc.setTextColor(...this.COLORS.text);

    let y = startY;

    // Total HT
    doc.setFont(undefined, 'bold');
    doc.text('Total HT:', xLabel, y);
    doc.text(CalculationService.formatCurrency(invoice.totalHT, invoice.currency), xRight, y, { align: 'right' });
    y += 7;

    // TVA
    doc.setFont(undefined, 'normal');
    const taxAmount = invoice.totalTTC - invoice.totalHT;
    doc.text('TVA:', xLabel, y);
    doc.text(CalculationService.formatCurrency(taxAmount, invoice.currency), xRight, y, { align: 'right' });
    y += 7;

    // Total TTC
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...this.COLORS.primary);
    doc.text('Total TTC:', xLabel, y);
    doc.text(CalculationService.formatCurrency(invoice.totalTTC, invoice.currency), xRight, y, { align: 'right' });
    y += 10;

    // Payment status
    doc.setFontSize(10);
    doc.setTextColor(...this.COLORS.text);
    doc.text('Déjà payé:', xLabel, y);
    doc.text(CalculationService.formatCurrency(invoice.amountPaid, invoice.currency), xRight, y, { align: 'right' });
    y += 7;

    // Amount due
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...this.COLORS.success);
    doc.text('Reste à payer:', xLabel, y);
    doc.text(CalculationService.formatCurrency(invoice.amountDue, invoice.currency), xRight, y, { align: 'right' });

    return y + 15;
  }

  /**
   * Add payment terms
   */
  private static addPaymentTerms(doc: jsPDF, paymentTerms: string, startY: number): void {
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...this.COLORS.secondary);
    doc.text('CONDITIONS DE PAIEMENT:', 20, startY);

    doc.setFont(undefined, 'normal');
    doc.setTextColor(...this.COLORS.text);
    const lines = paymentTerms.split('\n');
    lines.forEach((line, index) => {
      doc.text(line, 20, startY + 5 + (index * 5));
    });
  }

  /**
   * Add payment information for invoice
   */
  private static addPaymentInfo(doc: jsPDF, invoice: Invoice, startY: number): number {
    if (invoice.payments.length === 0) {
      return startY;
    }

    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...this.COLORS.secondary);
    doc.text('HISTORIQUE DES PAIEMENTS:', 20, startY);

    const paymentData = invoice.payments.map(p => [
      this.formatDate(p.date),
      p.method,
      p.reference,
      CalculationService.formatCurrency(p.amount, invoice.currency)
    ]);

    autoTable(doc, {
      startY: startY + 5,
      head: [['Date', 'Méthode', 'Référence', 'Montant']],
      body: paymentData,
      theme: 'plain',
      headStyles: {
        fillColor: this.COLORS.lightGray,
        textColor: this.COLORS.text,
        fontStyle: 'bold'
      },
      columnStyles: {
        3: { halign: 'right' }
      }
    });

    return (doc as any).lastAutoTable.finalY + 10;
  }

  /**
   * Add footer
   */
  private static addFooter(doc: jsPDF, companyInfo: any): void {
    const pageHeight = doc.internal.pageSize.height;
    const footerY = pageHeight - 20;

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);

    const footerText = [];
    if (companyInfo?.taxId) footerText.push(`SIRET: ${ companyInfo.taxId }`);
    if (companyInfo?.registrationNumber) footerText.push(`RCS: ${ companyInfo.registrationNumber }`);
    
    if (footerText.length > 0) {
      doc.text(footerText.join(' | '), 105, footerY, { align: 'center' });
    }

    // Page number
    doc.text(`Page 1`, 105, footerY + 5, { align: 'center' });
  }

  /**
   * Format date for display
   */
  private static formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  /**
   * Print preview (opens PDF in new window)
   */
  static printQuote(quote: Quote, client: Client, companyInfo?: any): void {
    const doc = new jsPDF();
    let yPosition = 20;

    yPosition = this.addQuoteHeader(doc, quote, companyInfo, yPosition);
    yPosition = this.addClientInfo(doc, client, quote, yPosition);
    yPosition = this.addItemsTable(doc, quote.sections, yPosition);
    yPosition = this.addTotals(doc, quote, yPosition);
    this.addPaymentTerms(doc, quote.paymentTerms, yPosition);
    this.addFooter(doc, companyInfo);

    // Open in new window for printing
    window.open(doc.output('bloburl'), '_blank');
  }
}
