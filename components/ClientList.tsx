import React, { useState } from 'react';
import { Client } from '../types';
import { Search, Plus, Mail, Phone, MapPin, Building2, User, X } from 'lucide-react';

interface ClientListProps {
  clients: Client[];
  onAddClient: (client: Client) => void;
  onUpdateClient: (client: Client) => void;
  onSelectClient: (client: Client) => void;
}

export const ClientList: React.FC<ClientListProps> = ({ clients, onAddClient, onUpdateClient, onSelectClient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  
  // Form State
  const [clientType, setClientType] = useState<'Particulier' | 'Professionnel'>('Particulier');
  const [formData, setFormData] = useState({
    civility: 'M.',
    firstName: '',
    lastName: '',
    companyName: '',
    siren: '',
    vatNumber: '',
    email: '',
    phone: '',
    address: '',
  });

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddModal = () => {
    setEditingClientId(null);
    setClientType('Particulier');
    setFormData({
      civility: 'M.',
      firstName: '',
      lastName: '',
      companyName: '',
      siren: '',
      vatNumber: '',
      email: '',
      phone: '',
      address: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClientId(client.id);
    setClientType(client.type);
    
    // Parse name for Particulier if needed, or just put full name in LastName for simplicity or CompanyName
    // For this example, we will assign the full name to relevant fields
    setFormData({
      civility: 'M.',
      firstName: '',
      lastName: client.type === 'Particulier' ? client.name : '',
      companyName: client.type === 'Professionnel' ? client.name : '',
      siren: '', // In a real app, these would be stored in the Client object
      vatNumber: '',
      email: client.email,
      phone: client.phone,
      address: client.address,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalName = '';
    if (clientType === 'Particulier') {
      finalName = `${formData.firstName} ${formData.lastName}`.trim();
      // Fallback if firstname empty
      if (!finalName) finalName = formData.lastName;
    } else {
      finalName = formData.companyName;
    }

    if (finalName) {
      const clientData: Client = {
        id: editingClientId || crypto.randomUUID(),
        name: finalName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        type: clientType,
      };

      if (editingClientId) {
        onUpdateClient(clientData);
      } else {
        onAddClient(clientData);
      }
      
      setIsModalOpen(false);
    }
  };

  return (
    <div className="p-6 w-full bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Contacts</h1>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 bg-[#5552D9] text-white px-4 py-2 rounded-lg hover:bg-[#4338ca] transition-colors font-medium shadow-sm text-sm"
        >
          <Plus size={18} /> Nouveau contact
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Rechercher un contact..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-[#5552D9] outline-none"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-500 font-semibold uppercase text-xs tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-6 py-3">Contact</th>
                <th className="px-6 py-3">Coordonnées</th>
                <th className="px-6 py-3">Adresse</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${client.type === 'Professionnel' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                        {client.type === 'Professionnel' ? <Building2 size={16} /> : <User size={16} />}
                      </div>
                      <span className="font-medium text-gray-900">{client.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 text-xs">
                      {client.email && (
                        <div className="flex items-center gap-2">
                          <Mail size={12} className="text-gray-400" /> {client.email}
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center gap-2">
                          <Phone size={12} className="text-gray-400" /> {client.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                     {client.address || '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full border ${
                        client.type === 'Professionnel' 
                        ? 'bg-purple-50 text-purple-700 border-purple-100' 
                        : 'bg-blue-50 text-blue-700 border-blue-100'
                    }`}>
                      {client.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => openEditModal(client)}
                      className="text-[#5552D9] hover:text-[#4338ca] font-medium text-xs"
                    >
                      Modifier
                    </button>
                  </td>
                </tr>
              ))}
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    Aucun client trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
               <h2 className="text-lg font-bold text-gray-900">{editingClientId ? 'Modifier le contact' : 'Ajouter un contact'}</h2>
               <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                 <X size={20} />
               </button>
            </div>
            
            <form onSubmit={handleSubmit}>
               <div className="p-6 space-y-6">
                  {/* Toggle Type */}
                  <div className="flex p-1 bg-gray-100 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setClientType('Particulier')}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all shadow-sm ${clientType === 'Particulier' ? 'bg-white text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        Particulier
                      </button>
                      <button
                        type="button"
                        onClick={() => setClientType('Professionnel')}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all shadow-sm ${clientType === 'Professionnel' ? 'bg-white text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        Professionnel
                      </button>
                  </div>

                  <div className="space-y-4">
                    {clientType === 'Particulier' ? (
                      // --- PARTICULIER FIELDS ---
                      <div className="grid grid-cols-12 gap-4">
                         <div className="col-span-3">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Civilité</label>
                            <select 
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5552D9] outline-none text-sm bg-white"
                              value={formData.civility}
                              onChange={e => setFormData({...formData, civility: e.target.value})}
                            >
                               <option>M.</option>
                               <option>Mme</option>
                            </select>
                         </div>
                         <div className="col-span-9 grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Nom <span className="text-indigo-100 bg-indigo-600 px-1 rounded text-[10px]">requis</span></label>
                              <input 
                                required={clientType === 'Particulier'}
                                type="text" 
                                value={formData.lastName}
                                onChange={e => setFormData({...formData, lastName: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5552D9] outline-none text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Prénom</label>
                              <input 
                                type="text" 
                                value={formData.firstName}
                                onChange={e => setFormData({...formData, firstName: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5552D9] outline-none text-sm"
                              />
                            </div>
                         </div>
                      </div>
                    ) : (
                      // --- PROFESSIONNEL FIELDS ---
                      <div className="space-y-4">
                         <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Nom de la société <span className="text-indigo-100 bg-indigo-600 px-1 rounded text-[10px]">requis</span></label>
                            <input 
                              required={clientType === 'Professionnel'}
                              type="text" 
                              value={formData.companyName}
                              onChange={e => setFormData({...formData, companyName: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5552D9] outline-none text-sm"
                            />
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Numéro SIREN / SIRET</label>
                              <input 
                                type="text" 
                                value={formData.siren}
                                onChange={e => setFormData({...formData, siren: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5552D9] outline-none text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Numéro de TVA</label>
                              <input 
                                type="text" 
                                value={formData.vatNumber}
                                onChange={e => setFormData({...formData, vatNumber: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5552D9] outline-none text-sm"
                              />
                            </div>
                         </div>
                      </div>
                    )}

                    <div className="border-t border-gray-100 my-4 pt-4">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Coordonnées</h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Adresse email</label>
                            <input 
                              type="email" 
                              value={formData.email}
                              onChange={e => setFormData({...formData, email: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5552D9] outline-none text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Numéro de téléphone</label>
                            <input 
                              type="tel" 
                              value={formData.phone}
                              onChange={e => setFormData({...formData, phone: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5552D9] outline-none text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Adresse</label>
                          <input 
                            type="text" 
                            value={formData.address}
                            onChange={e => setFormData({...formData, address: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5552D9] outline-none text-sm"
                            placeholder="Rechercher une adresse..."
                          />
                        </div>
                    </div>
                  </div>
               </div>
             
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-[#5552D9] text-white rounded-lg hover:bg-[#4338ca] text-sm font-medium shadow-sm transition-colors"
                >
                  {editingClientId ? 'Enregistrer les modifications' : 'Créer le contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};