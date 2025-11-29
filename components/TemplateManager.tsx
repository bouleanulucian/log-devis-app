import React, { useState } from 'react';
import { FileText, Plus, X, Copy, Trash2, Eye } from 'lucide-react';
import { QuoteTemplate } from '../types/extended';
import { Quote } from '../types';

interface TemplateManagerProps {
    templates: QuoteTemplate[];
    onAddTemplate: (template: QuoteTemplate) => void;
    onDeleteTemplate: (id: string) => void;
    onUseTemplate: (template: QuoteTemplate) => void;
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({
    templates,
    onAddTemplate,
    onDeleteTemplate,
    onUseTemplate
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const categories = ['all', 'Construction', 'Rénovation', 'Plomberie', 'Électricité', 'General', 'Autre'];

    const filteredTemplates = templates.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">📋 Șabloane</h1>
            </div>

            {/* Search and Filter */}
            <div className="mb-6 flex gap-4">
                <input
                    type="text"
                    placeholder="Caută șabloane..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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

            {/* Templates Grid */}
            {filteredTemplates.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>Niciun șablon găsit</p>
                    <p className="text-sm mt-2">Creează un șablon din editor de devize</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTemplates.map((template) => (
                        <div
                            key={template.id}
                            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                                    <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
                                <span className="px-2 py-1 bg-gray-100 rounded">{template.category}</span>
                                <span>{template.sections.length} sections</span>
                                <span>• Folosit {template.usageCount}x</span>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => onUseTemplate(template)}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                                >
                                    <Copy className="w-4 h-4" />
                                    Folosește
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirm('Sigur vrei să ștergi acest șablon?')) {
                                            onDeleteTemplate(template.id);
                                        }
                                    }}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
