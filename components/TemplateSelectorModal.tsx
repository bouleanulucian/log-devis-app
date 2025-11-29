import React, { useState } from 'react';
import { X, Search, FileText, Copy } from 'lucide-react';
import { QuoteTemplate } from '../types/extended';

interface TemplateSelectorModalProps {
    templates: QuoteTemplate[];
    isOpen: boolean;
    onClose: () => void;
    onSelect: (template: QuoteTemplate) => void;
}

export const TemplateSelectorModal: React.FC<TemplateSelectorModalProps> = ({
    templates,
    isOpen,
    onClose,
    onSelect
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    if (!isOpen) return null;

    const categories = ['all', 'Construction', 'Rénovation', 'Plomberie', 'Électricité', 'General', 'Autre'];

    const filteredTemplates = templates.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleSelect = (template: QuoteTemplate) => {
        onSelect(template);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Selectează un șablon</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Search and Filter */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Caută șabloane..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>
                                    {cat === 'all' ? 'Toate categoriile' : cat}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Templates List */}
                <div className="flex-1 overflow-y-auto p-6">
                    {filteredTemplates.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <p className="text-lg font-medium">Niciun șablon găsit</p>
                            <p className="text-sm mt-1">Încearcă să modifici criteriile de căutare</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredTemplates.map((template) => (
                                <div
                                    key={template.id}
                                    onClick={() => handleSelect(template)}
                                    className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                {template.name}
                                            </h3>
                                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                {template.description}
                                            </p>
                                        </div>
                                        <Copy className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0 ml-2" />
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span className="px-2 py-1 bg-gray-100 rounded font-medium">
                                            {template.category}
                                        </span>
                                        <span>{template.sections.length} secțiuni</span>
                                        <span>•</span>
                                        <span>Folosit {template.usageCount}x</span>
                                    </div>

                                    {template.tags && template.tags.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-1">
                                            {template.tags.slice(0, 3).map((tag, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                            {template.tags.length > 3 && (
                                                <span className="px-2 py-0.5 text-gray-500 text-xs">
                                                    +{template.tags.length - 3} mai multe
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            {filteredTemplates.length} șablon{filteredTemplates.length !== 1 ? 'e' : ''} găsit{filteredTemplates.length !== 1 ? 'e' : ''}
                        </p>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            Anulează
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
