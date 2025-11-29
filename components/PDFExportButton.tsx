import React from 'react';
import { Download, Printer, FileText } from 'lucide-react';
import { Quote, Client } from '../types';
import { PDFService } from '../services/pdfService';
import { StorageService } from '../services/storageService';

interface PDFExportButtonProps {
    quote: Quote;
    client: Client;
    variant?: 'default' | 'icon';
}

export const PDFExportButton: React.FC<PDFExportButtonProps> = ({
    quote,
    client,
    variant = 'default'
}) => {
    const [loading, setLoading] = React.useState(false);

    const handleExport = async () => {
        try {
            setLoading(true);
            const settings = StorageService.loadSettings();
            PDFService.generateQuotePDF(quote, client, settings.companyInfo);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Eroare la generarea PDF-ului');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        try {
            const settings = StorageService.loadSettings();
            PDFService.printQuote(quote, client, settings.companyInfo);
        } catch (error) {
            console.error('Error printing:', error);
            alert('Eroare la printare');
        }
    };

    if (variant === 'icon') {
        return (
            <button
                onClick={handleExport}
                disabled={loading}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Exportă PDF"
            >
                {loading ? (
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                ) : (
                    <Download className="w-5 h-5 text-gray-700" />
                )}
            </button>
        );
    }

    return (
        <div className="flex gap-2">
            <button
                onClick={handleExport}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
                {loading ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Se generează...</span>
                    </>
                ) : (
                    <>
                        <Download className="w-4 h-4" />
                        <span>Exportă PDF</span>
                    </>
                )}
            </button>

            <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
                <Printer className="w-4 h-4" />
                <span>Printează</span>
            </button>
        </div>
    );
};
