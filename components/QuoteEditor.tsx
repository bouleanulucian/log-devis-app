import React, { useState, useCallback, useEffect, useRef } from 'react';
import { QuoteSection, QuoteItem, UnitType, Quote, QuoteStatus, Client } from '../types';
import { generateQuoteFromDescription } from '../services/geminiService';
import { QuoteTable } from './QuoteTable';
import {
   Plus,
   Sparkles,
   Calendar,
   History,
   Send,
   RefreshCw,
   HardHat,
   ArrowLeft,
   ChevronDown,
   Check,
   Edit,
   Share2,
   MoreHorizontal,
   FileInput,
   Users,
   FileText,
   Eye,
   Download,
   Printer,
   Type,
   Heading,
   Loader2,
   Copy,
   Trash2,
   X,
   FileCheck,
   Truck,
   ArrowDown,
   Scissors,
   Save,
   ListChecks
} from 'lucide-react';

interface QuoteEditorProps {
   quote: Quote;
   clients: Client[];
   onSave: (quote: Quote) => void;
   onBack: () => void;
   onDelete: (quoteId: string) => void;
   onDuplicate: (quote: Quote) => void;
}

export const QuoteEditor: React.FC<QuoteEditorProps> = ({
   quote: initialQuote,
   clients,
   onSave,
   onBack,
   onDelete,
   onDuplicate
}) => {
   const [quote, setQuote] = useState<Quote>(initialQuote);
   const [isGenerating, setIsGenerating] = useState(false);
   const [aiPrompt, setAiPrompt] = useState('');
   const [showAiModal, setShowAiModal] = useState(false);
   const [targetSectionId, setTargetSectionId] = useState<string | null>(null);
   const [showMargins, setShowMargins] = useState(false);

   // Dropdown States
   const [activeDropdown, setActiveDropdown] = useState<'convert' | 'more' | 'none'>('none');
   const [showSettingsModal, setShowSettingsModal] = useState(false);
   const dropdownRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      setQuote(initialQuote);
   }, [initialQuote]);

   // Close dropdowns when clicking outside
   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setActiveDropdown('none');
         }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
   }, []);

   const updateQuote = (updates: Partial<Quote>, shouldSave = false) => {
      const updatedQuote = { ...quote, ...updates };
      setQuote(updatedQuote);
      if (shouldSave) {
         onSave(updatedQuote);
      }
   };

   const calculateTotals = useCallback(() => {
      const totalHT = quote.sections.reduce((total, section) => {
         return total + section.items.reduce((sTotal, item) => {
            if (item.type !== 'item') return sTotal;
            return sTotal + (item.quantity * item.unitPrice);
         }, 0);
      }, 0);

      let finalTotalHT = totalHT;
      if (quote.discount) {
         finalTotalHT = totalHT * (1 - (quote.discount / 100));
      }

      const totalVAT = finalTotalHT * 0.20;
      const totalTTC = finalTotalHT + totalVAT;

      return { totalHT: finalTotalHT, totalVAT, totalTTC };
   }, [quote.sections, quote.discount]);

   const totals = calculateTotals();

   useEffect(() => {
      if (Math.abs(quote.totalTTC - totals.totalTTC) > 0.01) {
         updateQuote({ totalHT: totals.totalHT, totalTTC: totals.totalTTC });
      }
   }, [totals]);

   // --- Handlers ---

   const updateSection = (sectionId: string, updates: Partial<QuoteSection>) => {
      updateQuote({
         sections: quote.sections.map(s => s.id === sectionId ? { ...s, ...updates } : s)
      });
   };

   const deleteSection = (sectionId: string) => {
      const section = quote.sections.find(s => s.id === sectionId);
      if (!section) return;
      const hasContent = section.items.some(i => i.description.trim() !== '' || i.total > 0);
      if (!hasContent) {
         updateQuote({ sections: quote.sections.filter(s => s.id !== sectionId) });
      } else {
         if (confirm('Supprimer cette section et tout son contenu ?')) {
            updateQuote({ sections: quote.sections.filter(s => s.id !== sectionId) });
         }
      }
   };

   const duplicateSection = (sectionId: string) => {
      const sectionIndex = quote.sections.findIndex(s => s.id === sectionId);
      if (sectionIndex === -1) return;
      const sectionToDuplicate = quote.sections[sectionIndex];
      const newSection: QuoteSection = {
         ...sectionToDuplicate,
         id: crypto.randomUUID(),
         title: `${sectionToDuplicate.title} (Copie)`,
         items: sectionToDuplicate.items.map(item => ({ ...item, id: crypto.randomUUID() }))
      };
      const newSections = [...quote.sections];
      newSections.splice(sectionIndex + 1, 0, newSection);
      updateQuote({ sections: newSections });
   };

   const updateItem = (sectionId: string, itemId: string, updates: Partial<QuoteItem>) => {
      updateQuote({
         sections: quote.sections.map(s => {
            if (s.id !== sectionId) return s;
            return {
               ...s,
               items: s.items.map(i => i.id === itemId ? { ...i, ...updates } : i)
            };
         })
      });
   };

   const deleteItem = (sectionId: string, itemId: string) => {
      updateQuote({
         sections: quote.sections.map(s => {
            if (s.id !== sectionId) return s;
            return { ...s, items: s.items.filter(i => i.id !== itemId) };
         })
      });
   };

   const addItemToLastSection = (type: 'item' | 'subheading' | 'text' | 'spacer' | 'pagebreak') => {
      const newItem: QuoteItem = {
         id: crypto.randomUUID(),
         type,
         description: type === 'subheading' ? 'Nouveau sous-titre' : '',
         quantity: type === 'item' ? 1 : 0,
         unit: type === 'item' ? UnitType.PCS : '',
         unitPrice: 0,
         vatRate: 20,
         total: 0
      };

      if (quote.sections.length === 0) {
         const newSectionId = crypto.randomUUID();
         updateQuote({
            sections: [...quote.sections, { id: newSectionId, title: 'Nouvelle section', items: [newItem] }]
         });
      } else {
         const lastSection = quote.sections[quote.sections.length - 1];
         updateQuote({
            sections: quote.sections.map(s => {
               if (s.id !== lastSection.id) return s;
               return { ...s, items: [...s.items, newItem] };
            })
         });
      }
   };

   const addSection = () => {
      updateQuote({
         sections: [...quote.sections, { id: crypto.randomUUID(), title: 'Nouvelle section', items: [] }]
      });
   };

   const addItemToSection = (sectionId: string) => {
      const newItem: QuoteItem = {
         id: crypto.randomUUID(),
         type: 'item',
         description: '',
         quantity: 1,
         unit: UnitType.PCS,
         unitPrice: 0,
         vatRate: 20,
         total: 0
      };
      updateQuote({
         sections: quote.sections.map(s => {
            if (s.id !== sectionId) return s;
            return { ...s, items: [...s.items, newItem] };
         })
      });
   }

   const handleAiForSection = (sectionId: string) => {
      setTargetSectionId(sectionId);
      setAiPrompt('');
      setShowAiModal(true);
   }

   const handleGenerateQuote = async () => {
      if (!aiPrompt.trim()) return;
      setIsGenerating(true);
      try {
         const generatedSections = await generateQuoteFromDescription(aiPrompt, quote.currency);
         if (generatedSections.length > 0) {
            if (targetSectionId) {
               const allNewItems = generatedSections.flatMap(s => s.items);
               updateQuote({
                  sections: quote.sections.map(s => {
                     if (s.id !== targetSectionId) return s;
                     return { ...s, items: [...s.items, ...allNewItems] };
                  })
               });
            } else {
               updateQuote({ sections: [...quote.sections, ...generatedSections] });
            }
            setShowAiModal(false);
            setAiPrompt('');
            setTargetSectionId(null);
         } else {
            alert("L'IA n'a pas pu générer de contenu.");
         }
      } catch (error: any) {
         console.error(error);
         alert(error.message || "Erreur lors de la génération.");
      } finally {
         setIsGenerating(false);
      }
   };

   const handleDiscount = () => {
      const discountStr = prompt("Entrez le pourcentage de remise (ex: 10 pour 10%)", quote.discount?.toString() || "");
      if (discountStr !== null) {
         const discount = parseFloat(discountStr);
         if (!isNaN(discount) && discount >= 0 && discount <= 100) {
            updateQuote({ discount });
         }
      }
   };

   const showToast = (message: string) => {
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-bounce flex items-center gap-2 text-sm';
      toast.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-400"><polyline points="20 6 9 17 4 12"></polyline></svg> ${message}`;
      document.body.appendChild(toast);
      setTimeout(() => {
         toast.classList.add('opacity-0', 'transition-opacity', 'duration-500');
         setTimeout(() => document.body.removeChild(toast), 500);
      }, 3000);
   };

   const handleSave = () => {
      onSave(quote);
      showToast('Devis enregistré avec succès !');
   };

   const handleConvert = (type: string) => {
      showToast(`${type} généré avec succès (Simulation)`);
      setActiveDropdown('none');
   };

   const currentClient = clients.find(c => c.id === quote.clientId);

   // Logic to determine the label for the "Sous-section" button
   const getNextSubheadingLabel = () => {
      const lastSection = quote.sections[quote.sections.length - 1];
      if (!lastSection) return 'Sous-section 1.1';

      const sectionIndex = quote.sections.length;
      // Count existing subheadings in last section to guess next number
      const subheadingCount = lastSection.items.filter(i => i.type === 'subheading').length;
      return `Sous-section ${sectionIndex}.${subheadingCount + 1}`;
   };

   return (
      <div className="flex bg-gray-100 min-h-screen font-sans">

         {/* --- CENTER COLUMN: MAIN DOCUMENT --- */}
         <div className="flex-1 flex flex-col h-screen overflow-hidden">

            {/* Top Toolbar - Sticky */}
            <div className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center shadow-sm z-20">
               <div className="flex items-center gap-4">
                  <button onClick={onBack} className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors">
                     <ArrowLeft size={20} />
                  </button>
                  <div>
                     <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        {quote.number}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${quote.status === 'Accepté' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                           quote.status === 'Envoyé' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              'bg-gray-100 text-gray-600 border-gray-200'
                           }`}>
                           {quote.status}
                        </span>
                     </h1>
                     <p className="text-xs text-gray-500">Dernière sauvegarde: Aujourd'hui à 10:42</p>
                  </div>
               </div>

               <div className="flex items-center gap-3">
                  <button onClick={() => setShowSettingsModal(true)} className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Paramètres">
                     <Edit size={18} />
                  </button>
                  <div className="h-6 w-px bg-gray-200 mx-1"></div>
                  <button onClick={() => window.print()} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium">
                     <Printer size={16} /> Imprimer
                  </button>
                  <button onClick={handleSave} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors text-sm font-medium">
                     <Save size={16} /> Enregistrer
                  </button>
               </div>
            </div>

            {/* Document Workspace */}
            <div className="flex-1 overflow-y-auto p-8 bg-gray-100/50">
               <div className="max-w-[210mm] mx-auto bg-white shadow-lg min-h-[297mm] relative print:shadow-none print:m-0 print:w-full">

                  {/* Document Content */}
                  <div className="p-[15mm] md:p-[20mm]">

                     {/* Header Section */}
                     <div className="flex justify-between items-start mb-12">
                        <div className="w-1/2">
                           <div className="mb-6">
                              <h1 className="text-2xl font-bold text-gray-900 mb-2">DEVIS</h1>
                              <p className="text-sm text-gray-500">N° {quote.number}</p>
                              <p className="text-sm text-gray-500">Date: {new Date(quote.date).toLocaleDateString('fr-FR')}</p>
                              <p className="text-sm text-gray-500">Valable jusqu'au: {new Date(quote.expiryDate).toLocaleDateString('fr-FR')}</p>
                           </div>

                           <div className="mb-6">
                              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Intitulé du projet</label>
                              <input
                                 value={quote.title}
                                 onChange={(e) => updateQuote({ title: e.target.value })}
                                 className="w-full font-serif text-lg text-gray-900 border-b border-gray-200 focus:border-indigo-500 outline-none py-1 placeholder-gray-300"
                                 placeholder="Ex: Rénovation Appartement..."
                              />
                           </div>
                        </div>

                        <div className="w-1/3 bg-gray-50 p-4 rounded-lg border border-gray-100">
                           <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Client</h3>
                           <select
                              value={quote.clientId}
                              onChange={(e) => {
                                 const c = clients.find(cl => cl.id === e.target.value);
                                 if (c) updateQuote({ clientId: c.id, clientName: c.name });
                              }}
                              className="w-full font-bold text-gray-900 bg-transparent border-none p-0 focus:ring-0 cursor-pointer text-sm mb-1"
                           >
                              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                           </select>
                           <div className="text-sm text-gray-600 whitespace-pre-line">
                              {currentClient?.address || 'Adresse non renseignée'}
                           </div>
                        </div>
                     </div>

                     {/* Quote Table */}
                     <div className="mb-12">
                        <QuoteTable
                           sections={quote.sections}
                           currency={quote.currency}
                           onUpdateSection={updateSection}
                           onDeleteSection={deleteSection}
                           onDuplicateSection={duplicateSection}
                           onUpdateItem={updateItem}
                           onAddItem={addItemToSection}
                           onDeleteItem={deleteItem}
                           onGenerateAI={handleAiForSection}
                        />
                     </div>

                     {/* Totals Section */}
                     <div className="flex justify-end mb-12 break-inside-avoid">
                        <div className="w-1/3 space-y-3">
                           <div className="flex justify-between text-sm text-gray-600">
                              <span>Total HT</span>
                              <span className="font-medium">{totals.totalHT.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {quote.currency}</span>
                           </div>
                           {quote.discount && quote.discount > 0 && (
                              <div className="flex justify-between text-sm text-emerald-600">
                                 <span>Remise ({quote.discount}%)</span>
                                 <span>- {(totals.totalHT / (1 - quote.discount / 100) * (quote.discount / 100)).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {quote.currency}</span>
                              </div>
                           )}
                           <div className="flex justify-between text-sm text-gray-600">
                              <span>TVA (20%)</span>
                              <span className="font-medium">{totals.totalVAT.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {quote.currency}</span>
                           </div>
                           <div className="border-t border-gray-200 pt-3 flex justify-between items-end">
                              <span className="text-base font-bold text-gray-900">Total TTC</span>
                              <span className="text-xl font-bold text-indigo-600">{totals.totalTTC.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {quote.currency}</span>
                           </div>
                        </div>
                     </div>

                     {/* Terms & Conditions */}
                     <div className="border-t border-gray-100 pt-8 break-inside-avoid">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Conditions de paiement</h3>
                        <textarea
                           value={quote.paymentTerms}
                           onChange={(e) => updateQuote({ paymentTerms: e.target.value })}
                           className="w-full text-sm text-gray-600 border-none p-0 bg-transparent focus:ring-0 resize-none"
                           rows={4}
                           placeholder="Conditions de règlement..."
                        />
                     </div>

                  </div>
               </div>

               {/* Bottom Spacer */}
               <div className="h-32"></div>
            </div>

            {/* Floating Action Bar (Bottom) */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-md border border-gray-200/50 shadow-2xl rounded-full px-6 py-3 flex items-center gap-4 z-40 transition-all hover:scale-105">
               <button onClick={() => addItemToLastSection('item')} className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 font-medium text-sm transition-colors">
                  <Plus size={18} /> Ligne
               </button>
               <div className="w-px h-4 bg-gray-300"></div>
               <button onClick={() => addItemToLastSection('subheading')} className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 font-medium text-sm transition-colors">
                  <Heading size={18} /> Sous-titre
               </button>
               <div className="w-px h-4 bg-gray-300"></div>
               <button onClick={() => addItemToLastSection('text')} className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 font-medium text-sm transition-colors">
                  <Type size={18} /> Texte
               </button>
               <div className="w-px h-4 bg-gray-300"></div>
               <button onClick={addSection} className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 font-medium text-sm transition-colors">
                  <ListChecks size={18} /> Section
               </button>
               <div className="w-px h-4 bg-gray-300"></div>
               <button onClick={() => { setTargetSectionId(null); setShowAiModal(true); setAiPrompt(''); }} className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-bold text-sm transition-colors">
                  <Sparkles size={18} /> Assistant IA
               </button>
            </div>

         </div>

         {/* --- RIGHT SIDEBAR (Tools) --- */}
         <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-screen z-30 shadow-sm hidden xl:flex">
            <div className="p-6 border-b border-gray-100">
               <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Outils</h3>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto flex-1">

               {/* Status Actions */}
               <div className="space-y-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase">État du devis</p>
                  <button
                     onClick={() => updateQuote({ status: 'Accepté' }, true)}
                     className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium py-2 px-4 rounded-lg flex items-center gap-3 transition-colors text-sm border border-emerald-200"
                  >
                     <Check size={16} /> Marquer comme accepté
                  </button>
                  <button
                     onClick={() => updateQuote({ status: 'Envoyé' }, true)}
                     className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 px-4 rounded-lg flex items-center gap-3 transition-colors text-sm border border-blue-200"
                  >
                     <Send size={16} /> Marquer comme envoyé
                  </button>
               </div>

               {/* Conversion */}
               <div className="space-y-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase">Conversion</p>
                  <button onClick={() => handleConvert("Facture")} className="w-full flex items-center gap-3 text-gray-600 hover:text-indigo-600 hover:bg-gray-50 p-2 rounded-lg transition-colors text-sm">
                     <FileCheck size={16} /> Créer une facture
                  </button>
                  <button onClick={() => handleConvert("Acompte")} className="w-full flex items-center gap-3 text-gray-600 hover:text-indigo-600 hover:bg-gray-50 p-2 rounded-lg transition-colors text-sm">
                     <FileText size={16} /> Facture d'acompte
                  </button>
               </div>

               {/* Actions */}
               <div className="space-y-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase">Actions</p>
                  <button onClick={() => onDuplicate(quote)} className="w-full flex items-center gap-3 text-gray-600 hover:text-indigo-600 hover:bg-gray-50 p-2 rounded-lg transition-colors text-sm">
                     <Copy size={16} /> Dupliquer
                  </button>
                  <button onClick={() => onDelete(quote.id)} className="w-full flex items-center gap-3 text-gray-600 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors text-sm">
                     <Trash2 size={16} /> Supprimer
                  </button>
               </div>

               {/* Margins Toggle */}
               <div className="pt-6 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                     <span className="text-sm font-medium text-gray-700">Afficher les marges</span>
                     <button
                        onClick={() => setShowMargins(!showMargins)}
                        className={`w-10 h-5 rounded-full transition-colors relative ${showMargins ? 'bg-indigo-600' : 'bg-gray-300'}`}
                     >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${showMargins ? 'left-6' : 'left-1'}`}></div>
                     </button>
                  </div>
                  {showMargins && (
                     <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700">
                        Marge estimée sur ce devis: <strong>32%</strong>
                     </div>
                  )}
               </div>

            </div>
         </div>

         {/* AI Modal */}
         {showAiModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
               <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
                  <div className="flex justify-between items-center mb-6">
                     <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                           <Sparkles size={24} />
                        </div>
                        <div>
                           <h3 className="text-xl font-bold text-gray-900">Assistant Gemini</h3>
                           <p className="text-xs text-gray-500">Expert en chiffrage du bâtiment (RGE)</p>
                        </div>
                     </div>
                     <button onClick={() => setShowAiModal(false)} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                     </button>
                  </div>
                  <textarea
                     value={aiPrompt}
                     onChange={(e) => setAiPrompt(e.target.value)}
                     placeholder="Décrivez les travaux à chiffrer... ex: 'Rénovation complète d'une salle de bain de 5m2...'"
                     className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-gray-800 mb-6 text-sm"
                     autoFocus
                  />
                  <div className="flex justify-end gap-3">
                     <button onClick={() => setShowAiModal(false)} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors text-sm">Annuler</button>
                     <button onClick={handleGenerateQuote} disabled={isGenerating || !aiPrompt.trim()} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 text-sm">
                        {isGenerating ? <><Loader2 size={16} className="animate-spin" /> Analyse...</> : <><Sparkles size={16} /> Générer</>}
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* Settings Modal */}
         {showSettingsModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
               <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="text-lg font-bold text-gray-900">Paramètres</h3>
                     <button onClick={() => setShowSettingsModal(false)} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                     </button>
                  </div>
                  <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Numéro</label>
                        <input
                           type="text"
                           value={quote.number}
                           onChange={(e) => updateQuote({ number: e.target.value })}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                        />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                           <input
                              type="date"
                              value={quote.date}
                              onChange={(e) => updateQuote({ date: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                           />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Expiration</label>
                           <input
                              type="date"
                              value={quote.expiryDate}
                              onChange={(e) => updateQuote({ expiryDate: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                           />
                        </div>
                     </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                     <button onClick={() => setShowSettingsModal(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium">Fermer</button>
                  </div>
               </div>
            </div>
         )}

      </div>
   );
};