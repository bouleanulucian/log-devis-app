import React, { useState } from 'react';
import { Invoice } from '../types/extended';
import { Search, Plus, Receipt, Calendar, DollarSign, MoreHorizontal, Eye, Trash2, Download } from 'lucide-react';
import { CalculationService } from '../services/calculationService';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ro } from 'date-fns/locale';

interface InvoiceListProps {
    invoices: Invoice[];
    onSelectInvoice: (invoice: Invoice) => void;
    onCreateInvoice: () => void;
    onDeleteInvoice: (id: string) => void;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({
    invoices,
    onSelectInvoice,
    onCreateInvoice,
    onDeleteInvoice
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string | 'all'>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const filteredInvoices = invoices.filter(invoice => {
        const matchesSearch =
            invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invoice.siteName.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: Invoice['status']) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-800 border-green-200';
            case 'partial': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'sent': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
            case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusLabel = (status: Invoice['status']) => {
        const labels = {
            'draft': 'Draft',
            'sent': 'Trimisă',
            'partial': 'Parțial',
            'paid': 'Plătită',
            'overdue': 'Întârziată',
            'cancelled': 'Anulată'
        };
        return labels[status];
    };

    const statusOptions = [
        { value: 'all', label: 'Toate statusurile' },
        { value: 'draft', label: 'Draft' },
        { value: 'sent', label: 'Trimise' },
        { value: 'partial', label: 'Parțial plătite' },
        { value: 'paid', label: 'Plătite' },
        { value: 'overdue', label: 'Întârziate' },
        { value: 'cancelled', label: 'Anulate' }
    ];

    const stats = {
        total: invoices.length,
        paid: invoices.filter(i => i.status === 'paid').length,
        pending: invoices.filter(i => ['sent', 'partial'].includes(i.status)).length,
        overdue: invoices.filter(i => i.status === 'overdue').length,
        totalRevenue: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.totalTTC, 0),
        pendingRevenue: invoices.filter(i => ['sent', 'partial'].includes(i.status)).reduce((sum, i) => sum + i.amountDue, 0)
    };

    return (
        <div className="flex-1 overflow-auto">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Facturi</h1>
                        <p className="text-gray-600 mt-1">{filteredInvoices.length} factur{filteredInvoices.length !== 1 ? 'i' : 'ă'}</p>
                    </div>
                    <button
                        onClick={onCreateInvoice}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Factură nouă</span>
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Receipt className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total facturi</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Încasări</p>
                                <p className="text-xl font-bold text-gray-900">
                                    {CalculationService.formatCurrency(stats.totalRevenue, '€')}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">În așteptare</p>
                                <p className="text-xl font-bold text-gray-900">
                                    {CalculationService.formatCurrency(stats.pendingRevenue, '€')}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                <span className="text-red-600 font-bold">{stats.overdue}</span>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Întârziate</p>
                                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Caută facturi..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Invoice Grid */}
            <div className="p-6">
                {filteredInvoices.length === 0 ? (
                    <div className="text-center py-16">
                        <Receipt className="w-20 h-20 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Nicio factură</h3>
                        <p className="text-gray-600 mb-6">
                            {searchTerm || filterStatus !== 'all'
                                ? 'Nu s-au găsit facturi cu aceste criterii'
                                : 'Începe prin a crea prima ta factură'}
                        </p>
                        {!searchTerm && filterStatus === 'all' && (
                            <button
                                onClick={onCreateInvoice}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Creează factură</span>
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredInvoices.map((invoice) => (
                            <div
                                key={invoice.id}
                                onClick={() => onSelectInvoice(invoice)}
                                className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                            {invoice.number}
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">{invoice.clientName}</p>
                                        {invoice.siteName && (
                                            <p className="text-xs text-gray-500">{invoice.siteName}</p>
                                        )}
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(invoice.status)}`}>
                                        {getStatusLabel(invoice.status)}
                                    </span>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Total:</span>
                                        <span className="font-semibold text-gray-900">
                                            {CalculationService.formatCurrency(invoice.totalTTC, invoice.currency)}
                                        </span>
                                    </div>
                                    {invoice.amountPaid > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Plătit:</span>
                                            <span className="font-medium text-green-600">
                                                {CalculationService.formatCurrency(invoice.amountPaid, invoice.currency)}
                                            </span>
                                        </div>
                                    )}
                                    {invoice.amountDue > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Rest:</span>
                                            <span className="font-medium text-blue-600">
                                                {CalculationService.formatCurrency(invoice.amountDue, invoice.currency)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>Scadență: {invoice.dueDate}</span>
                                    </div>
                                    {invoice.payments.length > 0 && (
                                        <span className="text-xs text-gray-500">
                                            {invoice.payments.length} plăț{invoice.payments.length !== 1 ? 'i' : 'i'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div >
    );
};
