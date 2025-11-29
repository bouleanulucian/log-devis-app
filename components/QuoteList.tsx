import React, { useState } from 'react';
import { Quote, Client } from '../types';
import { Invoice } from '../types/extended';
import { Search, Plus, List as ListIcon, LayoutGrid, MoreHorizontal, Copy, Trash2, Download, ChevronDown, FileText } from 'lucide-react';
import { ExportService } from '../services/exportService';
import { InvoiceCreationModal } from './InvoiceCreationModal';

interface QuoteListProps {
  quotes: Quote[];
  clients: Client[];
  onSelectQuote: (quote: Quote) => void;
  onCreateQuote: () => void;
  onDuplicateQuote: (quote: Quote) => void;
  onDeleteQuote: (id: string) => void;
  onCreateInvoice: (invoiceData: Partial<Invoice>) => void;
}

export const QuoteList: React.FC<QuoteListProps> = ({
  quotes,
  clients,
  onSelectQuote,
  onCreateQuote,
  onDeleteQuote,
  onDuplicateQuote,
  onCreateInvoice
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Invoice Modal State
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedQuoteForInvoice, setSelectedQuoteForInvoice] = useState<Quote | null>(null);

  const handleInvoiceClick = (e: React.MouseEvent, quote: Quote) => {
    e.stopPropagation();
    setSelectedQuoteForInvoice(quote);
    setShowInvoiceModal(true);
  };

  const filteredQuotes = quotes.filter(quote =>
    quote.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusColumns = [
    { id: 'Brouillon', label: 'Brouillons', color: 'bg-gray-100 text-gray-700', border: 'border-gray-200' },
    { id: 'Envoyé', label: 'Envoyés', color: 'bg-blue-50 text-blue-700', border: 'border-blue-200' },
    { id: 'Accepté', label: 'Acceptés', color: 'bg-emerald-50 text-emerald-700', border: 'border-emerald-200' },
    { id: 'Facturé', label: 'Facturés', color: 'bg-purple-50 text-purple-700', border: 'border-purple-200' },
    { id: 'Perdu', label: 'Perdus', color: 'bg-red-50 text-red-700', border: 'border-red-200' }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto h-screen flex flex-col font-sans">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Devis & Factures</h1>
          <p className="text-gray-500 mt-1 text-sm">Gérez vos devis et suivez leur état d'avancement.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Export Menu */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 font-medium shadow-sm transition-all"
            >
              <Download size={18} />
              Exporter
              <ChevronDown size={16} />
            </button>
            {showExportMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowExportMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20 overflow-hidden">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        ExportService.exportQuotesToExcel(filteredQuotes, clients);
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                    >
                      <span className="text-lg">📊</span>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">Excel</div>
                        <div className="text-xs text-gray-500">Format .xlsx avec formatage</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        ExportService.exportQuotesToCSV(filteredQuotes);
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                    >
                      <span className="text-lg">📄</span>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">CSV</div>
                        <div className="text-xs text-gray-500">Données tabulaires simples</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        ExportService.exportQuotesToJSON(filteredQuotes);
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                    >
                      <span className="text-lg">📋</span>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">JSON</div>
                        <div className="text-xs text-gray-500">Format structuré</div>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            onClick={onCreateQuote}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium shadow-sm shadow-indigo-200 transition-all hover:scale-105"
          >
            <Plus size={20} />
            Nouveau devis
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher un devis, un client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm shadow-sm"
          />
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <ListIcon size={18} />
          </button>
          <button
            onClick={() => setViewMode('board')}
            className={`p-2 rounded-md transition-all ${viewMode === 'board' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <LayoutGrid size={18} />
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex-1 flex flex-col">
          <div className="overflow-y-auto flex-1">
            <table className="w-full">
              <thead className="bg-gray-50/50 border-b border-gray-200 sticky top-0 backdrop-blur-sm z-10">
                <tr>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Numéro</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Titre</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Montant TTC</th>
                  <th className="text-center py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="py-4 px-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredQuotes.map((quote) => (
                  <tr
                    key={quote.id}
                    onClick={() => onSelectQuote(quote)}
                    className="hover:bg-gray-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-6 font-medium text-gray-900 text-sm">{quote.number}</td>
                    <td className="py-4 px-6 text-gray-600">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs border border-indigo-100">
                          {quote.clientName.charAt(0)}
                        </div>
                        <span className="text-sm font-medium">{quote.clientName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-600 max-w-xs truncate text-sm">{quote.title || '-'}</td>
                    <td className="py-4 px-6 text-gray-500 text-sm">{new Date(quote.date).toLocaleDateString('fr-FR')}</td>
                    <td className="py-4 px-6 text-right font-bold text-gray-900 text-sm">
                      {quote.totalTTC.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${quote.status === 'Accepté' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        quote.status === 'Envoyé' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          quote.status === 'Facturé' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            quote.status === 'Perdu' ? 'bg-red-50 text-red-700 border-red-200' :
                              'bg-gray-100 text-gray-700 border-gray-200'
                        }`}>
                        {quote.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleInvoiceClick(e, quote)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                          title="Facturer"
                        >
                          <FileText size={16} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onDuplicateQuote(quote); }}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                          title="Dupliquer"
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onDeleteQuote(quote.id); }}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredQuotes.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                      Aucun devis trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-6 flex-1">
          {statusColumns.map(col => (
            <div key={col.id} className="min-w-[300px] flex flex-col bg-gray-50/50 rounded-xl border border-gray-200/50">
              <div className={`p-4 border-b ${col.border} ${col.color} bg-opacity-20 rounded-t-xl flex justify-between items-center`}>
                <h3 className="font-semibold text-sm">{col.label}</h3>
                <span className="bg-white/50 px-2 py-0.5 rounded-md text-xs font-bold shadow-sm">
                  {filteredQuotes.filter(q => q.status === col.id).length}
                </span>
              </div>
              <div className="p-3 space-y-3 overflow-y-auto flex-1">
                {filteredQuotes.filter(q => q.status === col.id).map(quote => (
                  <div
                    key={quote.id}
                    onClick={() => onSelectQuote(quote)}
                    className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-300 cursor-pointer transition-all group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-gray-500">{quote.number}</span>
                      <span className="text-xs text-gray-400">{new Date(quote.date).toLocaleDateString()}</span>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1 truncate">{quote.clientName}</h4>
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2 h-10">{quote.title || 'Sans titre'}</p>
                    <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                      <span className="font-bold text-gray-900">{quote.totalTTC.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
                      <button
                        onClick={(e) => handleInvoiceClick(e, quote)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        title="Facturer"
                      >
                        <FileText size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedQuoteForInvoice && (
        <InvoiceCreationModal
          isOpen={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
          quote={selectedQuoteForInvoice}
          onCreateInvoice={onCreateInvoice}
        />
      )}
    </div>
  );
};