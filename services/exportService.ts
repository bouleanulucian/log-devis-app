import { Quote, Client } from '../types';
import { ComprehensiveReport } from '../types/report';
import * as XLSX from 'xlsx';

/**
 * ExportService - Multi-format export capabilities
 * Supports Excel, CSV, JSON, and enhanced PDF exports
 */
export class ExportService {

    // ============================================================================
    // EXCEL EXPORT
    // ============================================================================

    static exportQuoteToExcel(quote: Quote, client?: Client): void {
        const workbook = XLSX.utils.book_new();

        // Quote Details Sheet
        const detailsData = [
            ['DEVIS'],
            [],
            ['Numéro:', quote.number],
            ['Date d\'émission:', quote.date],
            ['Date d\'expiration:', quote.expiryDate],
            ['Statut:', quote.status],
            [],
            ['CLIENT'],
            ['Nom:', quote.clientName],
            ['Email:', client?.email || ''],
            ['Téléphone:', client?.phone || ''],
            ['Adresse:', client?.address || ''],
            [],
            ['PROJET'],
            ['Chantier:', quote.siteName],
            ['Titre:', quote.title],
            ['Date de visite:', quote.visitDate || 'N/A'],
            ['Date de démarrage:', quote.startDate || 'N/A'],
            ['Durée:', quote.duration ? `${quote.duration} jours` : 'N/A'],
        ];

        const detailsSheet = XLSX.utils.aoa_to_sheet(detailsData);
        XLSX.utils.book_append_sheet(workbook, detailsSheet, 'Détails');

        // Items Sheet
        const itemsData: any[][] = [
            ['Section', 'Description', 'Quantité', 'Unité', 'Prix Unitaire', 'TVA %', 'Total HT']
        ];

        quote.sections.forEach(section => {
            itemsData.push([section.title, '', '', '', '', '', '']);
            section.items.forEach(item => {
                if (item.type === 'item') {
                    itemsData.push([
                        '',
                        item.description,
                        item.quantity,
                        item.unit,
                        item.unitPrice,
                        item.vatRate,
                        item.total
                    ]);
                } else if (item.type === 'subheading') {
                    itemsData.push(['', `  ${item.description}`, '', '', '', '', '']);
                }
            });
        });

        itemsData.push([]);
        itemsData.push(['', '', '', '', '', 'Total HT:', quote.totalHT]);
        itemsData.push(['', '', '', '', '', 'TVA:', quote.totalTTC - quote.totalHT]);
        itemsData.push(['', '', '', '', '', 'Total TTC:', quote.totalTTC]);

        const itemsSheet = XLSX.utils.aoa_to_sheet(itemsData);

        // Set column widths
        itemsSheet['!cols'] = [
            { wch: 20 },
            { wch: 50 },
            { wch: 10 },
            { wch: 8 },
            { wch: 12 },
            { wch: 8 },
            { wch: 12 }
        ];

        XLSX.utils.book_append_sheet(workbook, itemsSheet, 'Articles');

        // Generate and download
        XLSX.writeFile(workbook, `Devis_${quote.number}_${quote.clientName}.xlsx`);
    }

    static exportQuotesToExcel(quotes: Quote[], clients: Client[]): void {
        const workbook = XLSX.utils.book_new();

        // Summary Sheet
        const summaryData: any[][] = [
            ['Numéro', 'Client', 'Chantier', 'Titre', 'Date', 'Expiration', 'Statut', 'Total HT', 'Total TTC']
        ];

        quotes.forEach(quote => {
            summaryData.push([
                quote.number,
                quote.clientName,
                quote.siteName,
                quote.title,
                quote.date,
                quote.expiryDate,
                quote.status,
                quote.totalHT,
                quote.totalTTC
            ]);
        });

        // Add totals
        const totalHT = quotes.reduce((sum, q) => sum + q.totalHT, 0);
        const totalTTC = quotes.reduce((sum, q) => sum + q.totalTTC, 0);
        summaryData.push([]);
        summaryData.push(['', '', '', '', '', '', 'TOTAL:', totalHT, totalTTC]);

        const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

        // Set column widths
        summarySheet['!cols'] = [
            { wch: 12 },
            { wch: 25 },
            { wch: 25 },
            { wch: 25 },
            { wch: 12 },
            { wch: 12 },
            { wch: 12 },
            { wch: 12 },
            { wch: 12 }
        ];

        XLSX.utils.book_append_sheet(workbook, summarySheet, 'Résumé');

        // Client Sheet
        const clientData: any[][] = [
            ['ID', 'Nom', 'Email', 'Téléphone', 'Adresse', 'Type']
        ];

        clients.forEach(client => {
            clientData.push([
                client.id,
                client.name,
                client.email,
                client.phone,
                client.address,
                client.type
            ]);
        });

        const clientSheet = XLSX.utils.aoa_to_sheet(clientData);
        clientSheet['!cols'] = [
            { wch: 10 },
            { wch: 25 },
            { wch: 25 },
            { wch: 15 },
            { wch: 35 },
            { wch: 15 }
        ];

        XLSX.utils.book_append_sheet(workbook, clientSheet, 'Clients');

        // Generate and download
        const timestamp = new Date().toISOString().split('T')[0];
        XLSX.writeFile(workbook, `Export_Devis_${timestamp}.xlsx`);
    }

    static exportReportToExcel(report: ComprehensiveReport): void {
        const workbook = XLSX.utils.book_new();

        // Summary Sheet
        const summaryData = [
            ['RAPPORT D\'ACTIVITÉ'],
            ['Période:', report.dateRange.label],
            ['Généré le:', new Date(report.generatedAt).toLocaleString('fr-FR')],
            [],
            ['RÉSUMÉ'],
            ['Chiffre d\'affaires total:', report.summary.totalRevenue],
            ['Nombre de devis:', report.summary.totalQuotes],
            ['Valeur moyenne:', report.summary.averageQuoteValue],
            ['Taux de conversion:', `${report.summary.conversionRate}%`],
            ['Meilleur client:', report.summary.topClient],
        ];

        const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(workbook, summarySheet, 'Résumé');

        // Revenue Data Sheet
        const revenueData: any[][] = [
            ['Période', 'CA HT', 'CA TTC', 'Nombre', 'Valeur Moyenne']
        ];

        report.revenueData.forEach(item => {
            revenueData.push([
                item.period,
                item.totalHT,
                item.totalTTC,
                item.count,
                item.averageValue
            ]);
        });

        const revenueSheet = XLSX.utils.aoa_to_sheet(revenueData);
        XLSX.utils.book_append_sheet(workbook, revenueSheet, 'CA par période');

        // Client Stats Sheet
        const clientData: any[][] = [
            ['Client', 'Type', 'CA Total', 'Nb Devis', 'Acceptés', 'Taux Accept.', 'Valeur Moy.']
        ];

        report.clientStats.forEach(client => {
            clientData.push([
                client.clientName,
                client.clientType,
                client.totalRevenue,
                client.quoteCount,
                client.acceptedCount,
                `${client.acceptanceRate.toFixed(1)}%`,
                client.averageQuoteValue
            ]);
        });

        const clientSheet = XLSX.utils.aoa_to_sheet(clientData);
        XLSX.utils.book_append_sheet(workbook, clientSheet, 'Statistiques Clients');

        // Status Stats Sheet
        const statusData: any[][] = [
            ['Statut', 'Nombre', 'Valeur Totale', 'Pourcentage', 'Valeur Moyenne']
        ];

        report.statusStats.forEach(stat => {
            statusData.push([
                stat.status,
                stat.count,
                stat.totalValue,
                `${stat.percentage.toFixed(1)}%`,
                stat.averageValue
            ]);
        });

        const statusSheet = XLSX.utils.aoa_to_sheet(statusData);
        XLSX.utils.book_append_sheet(workbook, statusSheet, 'Par Statut');

        // Generate and download
        const timestamp = new Date().toISOString().split('T')[0];
        XLSX.writeFile(workbook, `Rapport_${report.dateRange.label}_${timestamp}.xlsx`);
    }

    // ============================================================================
    // CSV EXPORT
    // ============================================================================

    static exportQuoteToCSV(quote: Quote): void {
        const rows: string[][] = [
            ['Section', 'Type', 'Description', 'Quantité', 'Unité', 'Prix Unitaire', 'TVA %', 'Total']
        ];

        quote.sections.forEach(section => {
            section.items.forEach(item => {
                rows.push([
                    section.title,
                    item.type,
                    item.description,
                    item.quantity.toString(),
                    item.unit,
                    item.unitPrice.toString(),
                    item.vatRate.toString(),
                    item.total.toString()
                ]);
            });
        });

        const csvContent = rows.map(row =>
            row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
        ).join('\n');

        this.downloadFile(
            csvContent,
            `Devis_${quote.number}_${quote.clientName}.csv`,
            'text/csv;charset=utf-8;'
        );
    }

    static exportQuotesToCSV(quotes: Quote[]): void {
        const rows: string[][] = [
            ['Numéro', 'Client', 'Chantier', 'Titre', 'Date', 'Expiration', 'Statut', 'Total HT', 'Total TTC']
        ];

        quotes.forEach(quote => {
            rows.push([
                quote.number,
                quote.clientName,
                quote.siteName,
                quote.title,
                quote.date,
                quote.expiryDate,
                quote.status,
                quote.totalHT.toString(),
                quote.totalTTC.toString()
            ]);
        });

        const csvContent = rows.map(row =>
            row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
        ).join('\n');

        const timestamp = new Date().toISOString().split('T')[0];
        this.downloadFile(
            csvContent,
            `Export_Devis_${timestamp}.csv`,
            'text/csv;charset=utf-8;'
        );
    }

    static exportClientsToCSV(clients: Client[]): void {
        const rows: string[][] = [
            ['ID', 'Nom', 'Email', 'Téléphone', 'Adresse', 'Type', 'Notes']
        ];

        clients.forEach(client => {
            rows.push([
                client.id,
                client.name,
                client.email,
                client.phone,
                client.address,
                client.type,
                client.notes || ''
            ]);
        });

        const csvContent = rows.map(row =>
            row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
        ).join('\n');

        const timestamp = new Date().toISOString().split('T')[0];
        this.downloadFile(
            csvContent,
            `Export_Clients_${timestamp}.csv`,
            'text/csv;charset=utf-8;'
        );
    }

    // ============================================================================
    // JSON EXPORT
    // ============================================================================

    static exportQuoteToJSON(quote: Quote): void {
        const json = JSON.stringify(quote, null, 2);
        this.downloadFile(
            json,
            `Devis_${quote.number}.json`,
            'application/json'
        );
    }

    static exportQuotesToJSON(quotes: Quote[]): void {
        const json = JSON.stringify(quotes, null, 2);
        const timestamp = new Date().toISOString().split('T')[0];
        this.downloadFile(
            json,
            `Export_Devis_${timestamp}.json`,
            'application/json'
        );
    }

    static exportReportToJSON(report: ComprehensiveReport): void {
        const json = JSON.stringify(report, null, 2);
        const timestamp = new Date().toISOString().split('T')[0];
        this.downloadFile(
            json,
            `Rapport_${timestamp}.json`,
            'application/json'
        );
    }

    // ============================================================================
    // BATCH EXPORT
    // ============================================================================

    static batchExportQuotes(
        quotes: Quote[],
        clients: Client[],
        format: 'excel' | 'csv' | 'json'
    ): void {
        switch (format) {
            case 'excel':
                this.exportQuotesToExcel(quotes, clients);
                break;
            case 'csv':
                this.exportQuotesToCSV(quotes);
                break;
            case 'json':
                this.exportQuotesToJSON(quotes);
                break;
        }
    }

    // ============================================================================
    // UTILITY METHODS
    // ============================================================================

    private static downloadFile(content: string, fileName: string, mimeType: string): void {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    static getFormatIcon(format: string): string {
        switch (format) {
            case 'excel':
                return '📊';
            case 'csv':
                return '📄';
            case 'json':
                return '📋';
            case 'pdf':
                return '📕';
            default:
                return '📁';
        }
    }

    static getFormatLabel(format: string): string {
        switch (format) {
            case 'excel':
                return 'Microsoft Excel (.xlsx)';
            case 'csv':
                return 'CSV (.csv)';
            case 'json':
                return 'JSON (.json)';
            case 'pdf':
                return 'PDF (.pdf)';
            default:
                return format;
        }
    }
}
