import React, { useState } from 'react';
import { Quote, QuoteSection } from '../types';
import { QuoteTemplate } from '../types/extended';
import { X, Save, FileText } from 'lucide-react';

interface SaveTemplateModalProps {
    quote: Quote;
    isOpen: boolean;
    onClose: () => void;
    onSave: (template: QuoteTemplate) => void;
}

export const SaveTemplateModal: React.FC<SaveTemplateModalProps> = ({
    quote,
    isOpen,
    onClose,
    onSave
}) => {
    const [name, setName] = useState(quote.title || '');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<string>('General');
    const [tags, setTags] = useState<string>('');

    if (!isOpen) return null;

    const categories = ['Construction', 'Rénovation', 'Plomberie', 'Électricité', 'General', 'Autre'];

    const handleSave = () => {
        if (!name.trim()) {
            alert('Te rog introdu un nume pentru șablon');
            return;
        }

        const template: QuoteTemplate = {
            id: crypto.randomUUID(),
            name: name.trim(),
            description: description.trim(),
            category,
            sections: JSON.parse(JSON.stringify(quote.sections)), // Deep clone
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            usageCount: 0,
            tags: tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
        };

        onSave(template);
        onClose();

        // Reset form
        setName('');
        setDescription('');
        setCategory('General');
        setTags('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Salvează ca șablon</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nume șablon *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="ex: Renovare Apartament Standard"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Descriere
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Descrie conținutul și scopul acestui șablon..."
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Categorie
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Etichete (opțional)
                        </label>
                        <input
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="ex: apartament, renovare, baie (separate prin virgulă)"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Separă etichetele cu virgulă
                        </p>
                    </div>

                    {/* Preview */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Preview șablon:</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                            <p><span className="font-medium">Secțiuni:</span> {quote.sections.length}</p>
                            <p><span className="font-medium">Linii totale:</span> {quote.sections.reduce((sum, s) => sum + s.items.length, 0)}</p>
                            {quote.sections.length > 0 && (
                                <div className="mt-2">
                                    <p className="font-medium text-xs text-gray-500 mb-1">Secțiuni incluse:</p>
                                    <ul className="list-disc list-inside text-xs text-gray-600 space-y-0.5">
                                        {quote.sections.slice(0, 5).map(s => (
                                            <li key={s.id}>{s.title}</li>
                                        ))}
                                        {quote.sections.length > 5 && (
                                            <li className="text-gray-400">+{quote.sections.length - 5} mai multe...</li>
                                        )}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        Anulează
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Save className="w-4 h-4" />
                        <span>Salvează șablonul</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
