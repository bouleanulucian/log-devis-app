import React, { useState } from 'react';
import { Search, Plus, MapPin, Calendar, Building2, User, MoreHorizontal, Edit2, Trash2 } from 'lucide-react';
import { ProjectModal } from './ProjectModal';
// We need a Project type. Assuming it's not fully defined yet or we use a placeholder.
// Let's define a local interface or assume one exists in types.
// Checking types.ts, there isn't a specific Project interface exported, but Quote has siteName.
// Let's define a simple one here or in types.ts. For now, I'll define it locally to match ProjectModal expectations if any.
// Actually ProjectModal expects onSave with siteName, address, dates, client.

interface Project {
    id: string;
    name: string;
    address: string;
    clientName: string;
    status: 'En cours' | 'Terminé' | 'À venir';
    startDate?: string;
    endDate?: string;
}

interface ProjectListProps {
    // In a real app, we'd pass projects here. For now, we might need to mock or lift state.
    // Since App.tsx doesn't seem to have a "projects" state array (it has quotes and clients),
    // we might need to derive projects from quotes OR add a projects state to App.tsx.
    // For this step, I'll assume we pass a list and handlers.
    projects?: Project[];
    onAddProject?: (project: any) => void;
}

export const ProjectList: React.FC<ProjectListProps> = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Mock data for display since we don't have a global projects state yet
    const [projects, setProjects] = useState<Project[]>([
        { id: '1', name: 'Rénovation Cuisine', address: '12 Rue de la Paix, Paris', clientName: 'Jean Dupont', status: 'En cours', startDate: '2023-11-01' },
        { id: '2', name: 'Construction Garage', address: '8 Impasse des Lilas, Lyon', clientName: 'Marie Curie', status: 'À venir', startDate: '2023-12-15' },
    ]);

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSaveProject = (projectData: any) => {
        // ProjectModal returns { siteName, address, startDate, endDate, clientId }
        // We need to map this to our Project type
        const newProject: Project = {
            id: crypto.randomUUID(),
            name: projectData.siteName,
            address: projectData.address,
            clientName: 'Client Inconnu', // We'd need to look up client name from ID in a real app
            status: 'À venir',
            startDate: projectData.startDate,
            endDate: projectData.endDate
        };
        setProjects([...projects, newProject]);
        setIsModalOpen(false);
    };

    return (
        <div className="p-8 w-full bg-gray-50 min-h-screen font-sans">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Chantiers</h1>
                    <p className="text-gray-500 mt-1 text-sm">Gérez vos chantiers et suivez leur avancement.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm shadow-indigo-200"
                >
                    <Plus size={18} /> Nouveau chantier
                </button>
            </div>

            {/* Toolbar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 p-4 flex gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Rechercher un chantier, un client..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                    <div key={project.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all group cursor-pointer">
                        <div className="p-5">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                                        <Building2 size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{project.name}</h3>
                                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                            <MapPin size={12} /> {project.address}
                                        </p>
                                    </div>
                                </div>
                                <button className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-50">
                                    <MoreHorizontal size={18} />
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500 flex items-center gap-2">
                                        <User size={14} /> Client
                                    </span>
                                    <span className="font-medium text-gray-900">{project.clientName}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500 flex items-center gap-2">
                                        <Calendar size={14} /> Début
                                    </span>
                                    <span className="font-medium text-gray-900">{project.startDate ? new Date(project.startDate).toLocaleDateString('fr-FR') : '-'}</span>
                                </div>
                            </div>

                            <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between items-center">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${project.status === 'En cours' ? 'bg-blue-50 text-blue-700' :
                                        project.status === 'Terminé' ? 'bg-green-50 text-green-700' :
                                            'bg-gray-100 text-gray-700'
                                    }`}>
                                    {project.status}
                                </span>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded">
                                        <Edit2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <ProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveProject}
                clients={[]} // We would pass clients here
            />
        </div>
    );
};
