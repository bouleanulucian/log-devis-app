import React, { useState } from 'react';
import { Quote, Client } from '../types';
import { Invoice, Payment } from '../types/extended';
import { ArrowLeft, Save, Plus, Trash2, Calendar } from 'lucide-react';
import { CalculationService } from '../services/calculationService';

interface InvoiceEditorProps {
    quote?: Quote;
    invoice?: Invoice;
    client?: Client;
    clients?: Client[]; // Add clients list for selection
    onSave: (invoice: Invoice) => void;
    onBack: () => void;
}

export const InvoiceEditor: React.FC<InvoiceEditorProps> = ({
    quote,
    invoice: existingInvoice,
    client,
    clients,
    onSave,
    onBack
}) => {
    const today = new Date().toISOString().split('T')[0];
    const defaultDueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const [invoice, setInvoice] = useState<Invoice>(existingInvoice || {
        id: crypto.randomUUID(),
        number: `FACT${new Date().getFullYear().toString().substring(2)}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        quoteId: quote?.id || '',
        clientId: quote?.clientId || client?.id || '',
        clientName: quote?.clientName || client?.name || '',
        siteName: quote?.siteName || '',
        issueDate: today,
        dueDate: defaultDueDate,
        status: 'draft',
        sections: JSON.parse(JSON.stringify(quote?.sections || [])),
        totalHT: quote?.totalHT || 0,
        totalTTC: quote?.totalTTC || 0,
        discount: quote?.discount,
        discountType: quote?.discountType,
        payments: [],
        amountPaid: 0,
        amountDue: quote?.totalTTC || 0,
        currency: quote?.currency || '€',
        notes: ''
    });

    const [newPayment, setNewPayment] = useState<Partial<Payment>>({
        amount: 0,
        date: today,
        method: 'Virement',
        reference: '',
        notes: ''
    });

    const handleAddPayment = () => {
        if (!newPayment.amount || newPayment.amount <= 0) {
            alert('Te rog introdu o sumă validă');
            return;
        }

        const payment: Payment = {
            id: crypto.randomUUID(),
            amount: newPayment.amount,
            date: newPayment.date || today,
            method: newPayment.method as Payment['method'],
            reference: newPayment.reference || '',
            notes: newPayment.notes
        };

        const updatedPayments = [...invoice.payments, payment];
        const amountPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
        const amountDue = invoice.totalTTC - amountPaid;

        setInvoice({
            ...invoice,
            payments: updatedPayments,
            amountPaid,
            amountDue,
            status: amountDue <= 0 ? 'paid' : amountPaid > 0 ? 'partial' : invoice.status
        });

        // Reset form
        setNewPayment({
            amount: 0,
            date: today,
            method: 'Virement',
            reference: '',
            notes: ''
        });
    };

    const handleDeletePayment = (paymentId: string) => {
        if (!confirm('Sigur vrei să ștergi această plată?')) return;

        const updatedPayments = invoice.payments.filter(p => p.id !== paymentId);
        const amountPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
        const amountDue = invoice.totalTTC - amountPaid;

        setInvoice({
            ...invoice,
            payments: updatedPayments,
            amountPaid,
            amountDue,
            status: amountDue <= 0 ? 'paid' : amountPaid > 0 ? 'partial' : 'draft'
        });
    };

    const handleSave = () => {
        onSave(invoice);
    };

    const getStatusColor = (status: Invoice['status']) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-800';
            case 'partial': return 'bg-yellow-100 text-yellow-800';
            case 'sent': return 'bg-blue-100 text-blue-800';
            case 'overdue': return 'bg-red-100 text-red-800';
            case 'cancelled': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: Invoice['status']) => {
        const labels = {
            'draft': 'Draft',
            'sent': 'Trimisă',
            'partial': 'Parțial plătită',
            'paid': 'Plătită',
            'overdue': 'Întârziată',
            'cancelled': 'Anulată'
        };
        return labels[status];
    };

    return (
        <div className="flex-1 overflow-auto bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={onBack}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Factură {invoice.number}
                                </h1>
                                {clients && !invoice.clientName ? (
                                    <select
                                        className="text-sm text-gray-600 border-none bg-transparent focus:ring-0 p-0 cursor-pointer hover:bg-gray-50"
                                        onChange={(e) => {
                                            const selectedClient = clients.find(c => c.id === e.target.value);
                                            if (selectedClient) {
                                                setInvoice({
                                                    ...invoice,
                                                    clientId: selectedClient.id,
                                                    clientName: selectedClient.name
                                                });
                                            }
                                        }}
                                        defaultValue=""
                                    >
                                        <option value="" disabled>Selectează client...</option>
                                        {clients.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <p className="text-sm text-gray-600">{invoice.clientName}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}>
                                {getStatusLabel(invoice.status)}
                            </span>
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Save className="w-4 h-4" />
                                <span>Salvează</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 max-w-6xl mx-auto space-y-6">
                {/* Invoice Details */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalii factură</h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Dată emitere
                            </label>
                            <input
                                type="date"
                                value={invoice.issueDate}
                                onChange={(e) => setInvoice({ ...invoice, issueDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Scadență
                            </label>
                            <input
                                type="date"
                                value={invoice.dueDate}
                                onChange={(e) => setInvoice({ ...invoice, dueDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Notițe
                            </label>
                            <textarea
                                value={invoice.notes}
                                onChange={(e) => setInvoice({ ...invoice, notes: e.target.value })}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                placeholder="Not adiționale..."
                            />
                        </div>
                    </div>
                </div>

                {/* Totals Summary */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Sumă factură</h3>

                    <div className="space-y-2">
                        <div className="flex justify-between text-gray-600">
                            <span>Total HT:</span>
                            <span className="font-medium">{CalculationService.formatCurrency(invoice.totalHT, invoice.currency)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>TVA:</span>
                            <span className="font-medium">{CalculationService.formatCurrency(invoice.totalTTC - invoice.totalHT, invoice.currency)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                            <span>Total TTC:</span>
                            <span>{CalculationService.formatCurrency(invoice.totalTTC, invoice.currency)}</span>
                        </div>
                        <div className="flex justify-between text-green-600 pt-2">
                            <span>Plătit:</span>
                            <span className="font-medium">{CalculationService.formatCurrency(invoice.amountPaid, invoice.currency)}</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold text-blue-600 pt-2 border-t border-gray-200">
                            <span>Rest de plată:</span>
                            <span>{CalculationService.formatCurrency(invoice.amountDue, invoice.currency)}</span>
                        </div>
                    </div>
                </div>

                {/* Payments */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Plăți</h3>

                    {/* Payment History */}
                    {invoice.payments.length > 0 && (
                        <div className="mb-6">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">Istoric plăți</h4>
                            <div className="space-y-2">
                                {invoice.payments.map((payment) => (
                                    <div
                                        key={payment.id}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <span className="font-medium text-gray-900">
                                                    {CalculationService.formatCurrency(payment.amount, invoice.currency)}
                                                </span>
                                                <span className="text-sm text-gray-600">{payment.method}</span>
                                                <span className="text-sm text-gray-500">{payment.date}</span>
                                            </div>
                                            {payment.reference && (
                                                <p className="text-sm text-gray-600 mt-1">Ref: {payment.reference}</p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleDeletePayment(payment.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Add Payment Form */}
                    {invoice.amountDue > 0 && (
                        <div className="border-t border-gray-200 pt-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">Adaugă plată</h4>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">Sumă</label>
                                    <input
                                        type="number"
                                        value={newPayment.amount}
                                        onChange={(e) => setNewPayment({ ...newPayment, amount: parseFloat(e.target.value) })}
                                        placeholder="0.00"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">Dată</label>
                                    <input
                                        type="date"
                                        value={newPayment.date}
                                        onChange={(e) => setNewPayment({ ...newPayment, date: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">Metodă</label>
                                    <select
                                        value={newPayment.method}
                                        onChange={(e) => setNewPayment({ ...newPayment, method: e.target.value as Payment['method'] })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="Virement">Virement</option>
                                        <option value="Chèque">Chèque</option>
                                        <option value="Espèces">Espèces</option>
                                        <option value="Carte">Carte</option>
                                        <option value="Autre">Autre</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">Referință</label>
                                    <input
                                        type="text"
                                        value={newPayment.reference}
                                        onChange={(e) => setNewPayment({ ...newPayment, reference: e.target.value })}
                                        placeholder="Nr. tranzacție..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleAddPayment}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Adaugă plată</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
