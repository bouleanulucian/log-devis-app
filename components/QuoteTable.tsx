import React, { useState, useRef, useEffect } from 'react';
import { QuoteSection, QuoteItem, UnitType } from '../types';
import { Trash2, GripVertical, MoreVertical, Copy, Plus, ListChecks, Sparkles, ArrowDown, Scissors } from 'lucide-react';
import { EditableField } from './EditableField';

interface QuoteTableProps {
  sections: QuoteSection[];
  currency: string;
  onUpdateSection: (sectionId: string, updates: Partial<QuoteSection>) => void;
  onDeleteSection: (sectionId: string) => void;
  onDuplicateSection: (sectionId: string) => void;
  onUpdateItem: (sectionId: string, itemId: string, updates: Partial<QuoteItem>) => void;
  onAddItem: (sectionId: string) => void;
  onDeleteItem: (sectionId: string, itemId: string) => void;
  onGenerateAI: (sectionId: string) => void;
}

const SectionMenu = ({
  onDuplicate,
  onDelete,
  onAddLine,
  onGenerateAI
}: {
  onDuplicate: () => void,
  onDelete: () => void,
  onAddLine: () => void,
  onGenerateAI: () => void
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className="text-gray-400 hover:text-indigo-600 p-1 rounded hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
      >
        <MoreVertical size={16} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-white shadow-xl rounded-lg border border-gray-100 z-50 py-1 text-sm animate-in fade-in zoom-in-95 duration-100">
          <button
            onClick={(e) => { e.stopPropagation(); onGenerateAI(); setIsOpen(false); }}
            className="w-full text-left px-4 py-2.5 hover:bg-indigo-50 flex items-center gap-3 text-indigo-600 font-medium"
          >
            <Sparkles size={16} />
            <span>Générer avec IA</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onAddLine(); setIsOpen(false); }}
            className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 text-gray-700"
          >
            <Plus size={16} className="text-gray-400" />
            <span>Insérer une ligne</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDuplicate(); setIsOpen(false); }}
            className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 text-gray-700"
          >
            <Copy size={16} className="text-gray-400" />
            <span>Dupliquer la section</span>
          </button>
          <div className="border-t border-gray-100 my-1"></div>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); setIsOpen(false); }}
            className="w-full text-left px-4 py-2.5 hover:bg-red-50 flex items-center gap-3 text-red-600"
          >
            <Trash2 size={16} />
            <span>Supprimer la section</span>
          </button>
        </div>
      )}
    </div>
  );
};

export const QuoteTable: React.FC<QuoteTableProps> = ({
  sections,
  currency,
  onUpdateSection,
  onDeleteSection,
  onDuplicateSection,
  onUpdateItem,
  onAddItem,
  onDeleteItem,
  onGenerateAI
}) => {
  return (
    <div className="bg-white">
      {/* Main Table Header - Clean & Professional */}
      <div className="grid grid-cols-12 gap-0 border-b-2 border-gray-800 text-gray-800 text-[10px] font-bold uppercase tracking-wider mb-2">
        <div className="col-span-1 py-2 px-2">N°</div>
        <div className="col-span-6 py-2 px-2">Désignation</div>
        <div className="col-span-1 py-2 px-2 text-center">Qté</div>
        <div className="col-span-1 py-2 px-2 text-center">Unité</div>
        <div className="col-span-1 py-2 px-2 text-right">P.U. HT</div>
        <div className="col-span-2 py-2 px-2 text-right">Total HT</div>
      </div>

      {sections.length === 0 && (
        <div className="p-12 text-center text-gray-400 bg-gray-50/50 border border-dashed border-gray-200 rounded-lg">
          <p>Aucune ligne. Commencez par ajouter une section ou utilisez l'IA.</p>
        </div>
      )}

      {sections.map((section, sIndex) => {
        const sectionNumber = sIndex + 1;
        const sectionTotal = section.items.reduce((sum, item) => {
          if (item.type === 'item') return sum + (item.quantity * item.unitPrice);
          return sum;
        }, 0);

        let subheadingCounter = 0;
        let itemCounter = 0;

        return (
          <div key={section.id} className="group mb-6">
            {/* Section Header Row - Distinctive */}
            <div className="grid grid-cols-12 gap-0 bg-gray-100 border-b border-gray-200 hover:bg-gray-200/50 transition-colors rounded-t-sm">
              <div className="col-span-1 py-2 px-2 text-gray-700 font-bold text-sm flex items-center justify-center">
                <button
                  className="opacity-0 group-hover:opacity-100 -ml-2 mr-1 cursor-grab text-gray-400 hover:text-gray-600"
                  title="Déplacer"
                >
                  <GripVertical size={12} />
                </button>
                {sectionNumber}
              </div>
              <div className="col-span-11 py-2 px-2 flex justify-between items-center">
                <EditableField
                  value={section.title}
                  onChange={(val) => onUpdateSection(section.id, { title: val })}
                  className="font-bold text-gray-900 text-sm bg-transparent uppercase tracking-tight"
                  placeholder="TITRE DE LA SECTION"
                />
                <div className="flex items-center gap-4">
                  <span className="font-bold text-gray-900 text-sm">{sectionTotal.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {currency}</span>

                  <SectionMenu
                    onDuplicate={() => onDuplicateSection(section.id)}
                    onDelete={() => onDeleteSection(section.id)}
                    onAddLine={() => onAddItem(section.id)}
                    onGenerateAI={() => onGenerateAI(section.id)}
                  />
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="border-l border-r border-b border-gray-100 rounded-b-sm">
              {section.items.map((item, iIndex) => {
                let displayNumber = '';

                if (item.type === 'subheading') {
                  subheadingCounter++;
                  itemCounter = 0;
                  displayNumber = `${sectionNumber}.${subheadingCounter}`;
                } else if (item.type === 'item') {
                  itemCounter++;
                  if (subheadingCounter > 0) {
                    displayNumber = `${sectionNumber}.${subheadingCounter}.${itemCounter}`;
                  } else {
                    displayNumber = `${sectionNumber}.${itemCounter}`;
                  }
                }

                // 1. SPACER
                if (item.type === 'spacer') {
                  return (
                    <div key={item.id} className="grid grid-cols-12 gap-0 hover:bg-gray-50 group/item relative h-[24px]">
                      <div className="col-span-1 border-r border-gray-100/50"></div>
                      <div className="col-span-11"></div>
                      <div className="absolute right-2 top-0.5 opacity-0 group-hover/item:opacity-100 flex gap-1">
                        <button onClick={() => onDeleteItem(section.id, item.id)} className="p-1 text-gray-400 hover:text-red-500 rounded hover:bg-gray-100">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                }

                // 2. PAGE BREAK
                if (item.type === 'pagebreak') {
                  return (
                    <div key={item.id} className="grid grid-cols-12 gap-0 bg-gray-50/30 hover:bg-gray-50 group/item relative h-[30px] print:break-after-page">
                      <div className="col-span-1 border-r border-gray-100/50"></div>
                      <div className="col-span-11 flex items-center justify-center">
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium uppercase tracking-widest border-b border-dashed border-gray-300 w-full mx-12 justify-center py-1">
                          <Scissors size={10} /> Saut de page
                        </div>
                      </div>
                      <div className="absolute right-2 top-1 opacity-0 group-hover/item:opacity-100 flex gap-1">
                        <button onClick={() => onDeleteItem(section.id, item.id)} className="p-1 text-gray-400 hover:text-red-500 rounded hover:bg-gray-100">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                }

                // 3. SUBHEADING
                if (item.type === 'subheading') {
                  return (
                    <div key={item.id} className="grid grid-cols-12 gap-0 hover:bg-gray-50 group/item relative min-h-[32px] mt-2">
                      <div className="col-span-1 py-1 px-2 text-gray-500 text-xs border-r border-gray-100/50 flex items-center justify-center font-semibold">
                        {displayNumber}
                      </div>
                      <div className="col-span-11 py-1 px-2">
                        <input
                          value={item.description}
                          onChange={(e) => onUpdateItem(section.id, item.id, { description: e.target.value })}
                          className="w-full bg-transparent border-none p-0 text-sm font-bold text-gray-800 focus:ring-0 placeholder-gray-400 uppercase"
                          placeholder="Sous-titre..."
                        />
                      </div>
                      <div className="absolute right-2 top-1 opacity-0 group-hover/item:opacity-100 flex gap-1">
                        <button onClick={() => onDeleteItem(section.id, item.id)} className="p-1 text-gray-400 hover:text-red-500 rounded hover:bg-gray-100">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                }

                // 4. TEXT BLOCK
                if (item.type === 'text') {
                  return (
                    <div key={item.id} className="grid grid-cols-12 gap-0 hover:bg-gray-50 group/item relative min-h-[32px]">
                      <div className="col-span-1 py-2 px-2 text-gray-500 text-sm border-r border-gray-100/50 flex items-start justify-center"></div>
                      <div className="col-span-11 py-2 px-2">
                        <textarea
                          value={item.description}
                          onChange={(e) => onUpdateItem(section.id, item.id, { description: e.target.value })}
                          className="w-full bg-transparent border-none p-0 text-sm text-gray-600 italic focus:ring-0 resize-none leading-relaxed"
                          rows={Math.max(1, Math.ceil(item.description.length / 100))}
                          placeholder="Texte descriptif ou note..."
                        />
                      </div>
                      <div className="absolute right-2 top-1 opacity-0 group-hover/item:opacity-100 flex gap-1">
                        <button onClick={() => onDeleteItem(section.id, item.id)} className="p-1 text-gray-400 hover:text-red-500 rounded hover:bg-gray-100">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                }

                // 5. STANDARD ITEM
                return (
                  <div key={item.id} className="grid grid-cols-12 gap-0 border-b border-gray-50 hover:bg-gray-50 group/item relative min-h-[40px]">

                    {/* Col 1: ID */}
                    <div className="col-span-1 py-2 px-2 text-gray-400 text-[10px] border-r border-gray-100/50 flex items-start justify-center pt-3">
                      {displayNumber}
                    </div>

                    {/* Col 2: Designation */}
                    <div className="col-span-6 py-2 px-2 border-r border-gray-100/50">
                      <textarea
                        value={item.description}
                        onChange={(e) => onUpdateItem(section.id, item.id, { description: e.target.value })}
                        className={`w-full bg-transparent border-none p-0 text-sm text-gray-800 focus:ring-0 resize-none leading-relaxed ${subheadingCounter > 0 ? 'pl-4' : ''}`}
                        rows={Math.max(1, Math.ceil(item.description.length / 80))}
                        placeholder="Description de l'ouvrage..."
                      />
                    </div>

                    {/* Col 3: QTY */}
                    <div className="col-span-1 py-2 px-2 border-r border-gray-100/50 flex items-start justify-center">
                      <EditableField
                        type="number"
                        value={item.quantity}
                        onChange={(val) => onUpdateItem(section.id, item.id, { quantity: val, total: val * item.unitPrice })}
                        className="text-center text-sm w-16 text-gray-700"
                      />
                    </div>

                    {/* Col 4: Unit */}
                    <div className="col-span-1 py-2 px-2 border-r border-gray-100/50 flex items-start justify-center">
                      <select
                        value={item.unit}
                        onChange={(e) => onUpdateItem(section.id, item.id, { unit: e.target.value })}
                        className="bg-transparent text-sm text-gray-500 border-none focus:ring-0 cursor-pointer text-center p-0 w-full appearance-none"
                      >
                        {Object.values(UnitType).map((u) => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                    </div>

                    {/* Col 5: Unit Price */}
                    <div className="col-span-1 py-2 px-2 border-r border-gray-100/50 text-right">
                      <EditableField
                        type="number"
                        value={item.unitPrice}
                        onChange={(val) => onUpdateItem(section.id, item.id, { unitPrice: val, total: item.quantity * val })}
                        className="text-right text-sm w-full text-gray-700"
                      />
                    </div>

                    {/* Col 6: Total */}
                    <div className="col-span-2 py-2 px-2 text-right">
                      <div className="font-medium text-gray-900 text-sm">
                        {(item.quantity * item.unitPrice).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {currency}
                      </div>
                    </div>

                    {/* Hover Actions */}
                    <div className="absolute right-2 top-1 opacity-0 group-hover/item:opacity-100 flex gap-1">
                      <button
                        onClick={() => onDeleteItem(section.id, item.id)}
                        className="p-1 text-gray-400 hover:text-red-500 rounded hover:bg-gray-100"
                        title="Supprimer la ligne"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};