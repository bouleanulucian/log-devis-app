import React, { useState, useEffect } from 'react';
import { X, Check, FileText, Percent, CreditCard } from 'lucide-react';
import { Quote } from '../types';
import { Invoice } from '../types/extended';

interface InvoiceCreationModalProps {
    isOpen: boolean;
    onClose: () => void;
    quote: Quote;
    onCreateInvoice: (invoiceData: Partial<Invoice>) => void;
}

export const InvoiceCreationModal: React.FC<InvoiceCreationModalProps> = ({ isOpen, onClose, quote, onCreateInvoice }) => {
    const [invoiceType, setInvoiceType] = useState<'deposit' | 'progress' | 'final'>('deposit');
    const [depositPercentage, setDepositPercentage] = useState(30);
    const [amount, setAmount] = useState(0);

    useEffect(() => {
        if (invoiceType === 'deposit') {
            setAmount((quote.totalTTC * depositPercentage) / 100);
        } else if (invoiceType === 'final') {
            // In a real app, we'd subtract already invoiced amounts
            setAmount(quote.totalTTC);
        } else {
            setAmount(quote.totalTTC); // Default for progress for now
        }
    }, [invoiceType, depositPercentage, quote.totalTTC]);

    if (!isOpen) return null;

    const handleCreate = () => {
        const invoiceData: Partial<Invoice> = {
            type: invoiceType,
            totalTTC: amount,
            totalHT: (amount / (1 + (quote.taxRate || 20) / 100)), // Approximate back-calculation
            status: 'draft',
            sections: invoiceType === 'deposit' ? [
                {
                    id: crypto.randomUUID(),
                    title: "Acompte",
                    items: [
                        {
                            id: crypto.randomUUID(),
                            type: 'item',
                            description: `Acompte de ${depositPercentage}% sur le devis N° ${quote.number}`,
                            quantity: 1,
                            unit: 'forfait',
                            unitPrice: amount / (1 + (quote.taxRate || 20) / 100), // HT Amount
                            vatRate: quote.taxRate || 20,
                            total: amount / (1 + (quote.taxRate || 20) / 100)
                        }
                    ]
                }
            ] : quote.sections // For full invoices, copy sections (simplified)
        };
        onCreateInvoice(invoiceData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Facturer le devis n° {quote.number}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">

                    <div className="bg-indigo-50 p-4 rounded-lg flex items-center gap-3 border border-indigo-100">
                        <div className="bg-indigo-100 p-2 rounded-full text-indigo-600">
                            <FileText size={20} />
                        </div>
                        <div>
                            <p className="text-sm text-indigo-900 font-medium">Devis de {quote.totalTTC.toLocaleString('fr-FR', { style: 'currency', currency: quote.currency === '€' ? 'EUR' : quote.currency })}</p>
                            <p className="text-xs text-indigo-700">Client: {quote.clientName}</p>
                        </div>
                        <div className="ml-auto">
                            <span className="px-2 py-1 bg-indigo-200 text-indigo-800 text-xs font-bold rounded uppercase">Accepté</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50">
                            <input
                                type="radio"
                                name="invoiceType"
                                value="deposit"
                                checked={invoiceType === 'deposit'}
                                onChange={() => setInvoiceType('deposit')}
                                className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                            />
                            <div className="flex-1">
                                <span className="block font-medium text-gray-900">Acompte de {depositPercentage} %</span>
                                <span className="block text-xs text-gray-500">Prévu à la signature</span>
                            </div>
                            {invoiceType === 'deposit' && (
                                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded px-2 py-1">
                                    <input
                                        type="number"
                                        value={depositPercentage}
                                        onChange={(e) => setDepositPercentage(Number(e.target.value))}
                                        className="w-12 text-right text-sm font-bold outline-none"
                                        min="1" max="100"
                                    />
                                    <span className="text-gray-500 text-sm">%</span>
                                </div>
                            )}
                        </label>

                        <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50">
                            <input
                                type="radio"
                                name="invoiceType"
                                value="progress"
                                checked={invoiceType === 'progress'}
                                onChange={() => setInvoiceType('progress')}
                                className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                            />
                            <div className="flex-1">
                                <span className="block font-medium text-gray-900">Créer une facture de situation</span>
                                <span className="block text-xs text-gray-500">Facturer une partie des travaux réalisés</span>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50">
                            <input
                                type="radio"
                                name="invoiceType"
                                value="final"
                                checked={invoiceType === 'final'}
                                onChange={() => setInvoiceType('final')}
                                className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                            />
                            <div className="flex-1">
                                <span className="block font-medium text-gray-900">Créer la facture finale</span>
                                <span className="block text-xs text-gray-500">Solde du chantier</span>
                            </div>
                        </label>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600 font-medium">Total TTC à facturer</span>
                            <span className="text-xl font-bold text-indigo-600">{amount.toLocaleString('fr-FR', { style: 'currency', currency: quote.currency === '€' ? 'EUR' : quote.currency })}</span>
                        </div>
                        <p className="text-xs text-gray-500 text-right">
                            {invoiceType === 'deposit' ? `${amount.toLocaleString('fr-FR', { style: 'currency', currency: quote.currency === '€' ? 'EUR' : quote.currency })} / ${quote.totalTTC.toLocaleString('fr-FR', { style: 'currency', currency: quote.currency === '€' ? 'EUR' : quote.currency })}` : ''}
                        </p>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleCreate}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-all transform active:scale-95 flex items-center gap-2"
                    >
                        <Check size={18} /> Accepter et facturer
                    </button>
                </div>

            </div>
        </div>
    );
};
