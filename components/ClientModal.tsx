import React, { useState } from 'react';
import { X, Plus, ChevronDown } from 'lucide-react';
import { Client } from '../types';

interface ClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (client: Client) => void;
    client?: Client; // Optional client for editing
}

export const ClientModal: React.FC<ClientModalProps> = ({ isOpen, onClose, onSave, client }) => {
    const [activeTab, setActiveTab] = useState<'info' | 'accounting' | 'other'>('info');
    const [type, setType] = useState<'Particulier' | 'Professionnel'>(client?.type || 'Particulier');

    // Form State
    const [civility, setCivility] = useState('M.');
    const [lastName, setLastName] = useState(client?.type === 'Particulier' ? client.name.split(' ').pop() || '' : '');
    const [firstName, setFirstName] = useState(client?.type === 'Particulier' ? client.name.split(' ').slice(0, -1).join(' ') || '' : '');
    const [address, setAddress] = useState(client?.address || '');
    const [email, setEmail] = useState(client?.email || '');
    const [phone, setPhone] = useState(client?.phone || '');
    const [companyName, setCompanyName] = useState(client?.type === 'Professionnel' ? client.name : '');

    // Reset state when client changes or modal opens
    React.useEffect(() => {
        if (isOpen) {
            if (client) {
                setType(client.type);
                setAddress(client.address);
                setEmail(client.email);
                setPhone(client.phone);
                if (client.type === 'Professionnel') {
                    setCompanyName(client.name);
                    setLastName('');
                    setFirstName('');
                } else {
                    const parts = client.name.split(' ');
                    setLastName(parts.length > 1 ? parts.pop() || '' : parts[0]);
                    setFirstName(parts.length > 1 ? parts.join(' ') : '');
                    setCompanyName('');
                }
            } else {
                // Reset for new client
                setType('Particulier');
                setCivility('M.');
                setLastName('');
                setFirstName('');
                setAddress('');
                setEmail('');
                setPhone('');
                setCompanyName('');
            }
        }
    }, [isOpen, client]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (type === 'Particulier' && !lastName) {
            alert('Le nom est requis');
            return;
        }
        if (type === 'Professionnel' && !companyName) {
            alert("Le nom de l'entreprise est requis");
            return;
        }

        const newClient: Client = {
            id: client?.id || crypto.randomUUID(),
            name: type === 'Professionnel' ? companyName : `${firstName} ${lastName}`.trim(),
            email,
            phone,
            address,
            type,
            notes: client?.notes || ''
        };

        onSave(newClient);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-gray-900">{client ? 'Modifier le contact' : `Ajouter un ${type === 'Particulier' ? 'client' : 'contact pro'}`}</h2>
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setType('Particulier')}
                                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${type === 'Particulier' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Particulier
                            </button>
                            <button
                                onClick={() => setType('Professionnel')}
                                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${type === 'Professionnel' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Professionnel
                            </button>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 px-6">
                    <button
                        onClick={() => setActiveTab('info')}
                        className={`py-3 px-1 mr-6 text-sm font-medium border-b-2 transition-colors ${activeTab === 'info' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Informations
                    </button>
                    <button
                        onClick={() => setActiveTab('accounting')}
                        className={`py-3 px-1 mr-6 text-sm font-medium border-b-2 transition-colors ${activeTab === 'accounting' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Comptabilité
                    </button>
                    <button
                        onClick={() => setActiveTab('other')}
                        className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'other' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Autres
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {activeTab === 'info' && (
                        <div className="space-y-6">

                            {type === 'Professionnel' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'entreprise <span className="text-indigo-600">*</span></label>
                                    <input
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                                        placeholder="Ex: SARL Construction"
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-12 gap-4">
                                <div className="col-span-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Civilité</label>
                                    <div className="relative">
                                        <select
                                            value={civility}
                                            onChange={(e) => setCivility(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white"
                                        >
                                            <option>M.</option>
                                            <option>Mme</option>
                                            <option>Mlle</option>
                                        </select>
                                        <ChevronDown size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="col-span-5">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom <span className="text-indigo-600">*</span></label>
                                    <input
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                                        placeholder="Nom de famille"
                                    />
                                </div>
                                <div className="col-span-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                                    <input
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                                        placeholder="Prénom"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                                <input
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                                    placeholder="Rechercher une adresse..."
                                />
                                <button className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                                    <Plus size={14} /> Ajouter une adresse
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse email</label>
                                <input
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                                    placeholder="email@exemple.com"
                                />
                                <button className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                                    <Plus size={14} /> Ajouter une adresse email
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de téléphone</label>
                                <div className="flex gap-2">
                                    <div className="w-20 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center text-gray-600">
                                        🇫🇷 +33
                                    </div>
                                    <input
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                                        placeholder="06 12 34 56 78"
                                    />
                                </div>
                                <button className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                                    <Plus size={14} /> Ajouter un numéro de téléphone
                                </button>
                            </div>

                        </div>
                    )}

                    {activeTab === 'accounting' && (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                            <p>Options de comptabilité (TVA, SIRET, etc.)</p>
                        </div>
                    )}

                    {activeTab === 'other' && (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                            <p>Notes et autres informations</p>
                        </div>
                    )}
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
                        onClick={handleSave}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-all transform active:scale-95"
                    >
                        {client ? 'Enregistrer' : 'Créer le contact'}
                    </button>
                </div>

            </div>
        </div>
    );
};
