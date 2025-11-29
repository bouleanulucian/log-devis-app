import React, { useMemo, useState } from 'react';
import {
  Plus,
  Info,
  Check,
  Send,
  FileText,
  Calendar as CalendarIcon,
  BarChart3,
  ArrowRight,
  Trash2,
  Square,
  CheckSquare,
  TrendingUp,
  MoreHorizontal
} from 'lucide-react';
import { Quote, Client, ViewState } from '../types';

interface DashboardProps {
  quotes: Quote[];
  clients: Client[];
  onNavigate: (view: ViewState, filterStatus?: string) => void;
}

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-200/60 ${className}`}>
    {children}
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ quotes, clients, onNavigate }) => {
  const currentYear = new Date().getFullYear();
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', text: 'Relancer M. Dupont', completed: false },
    { id: '2', text: 'Envoyer facture acompte chantier Nice', completed: true }
  ]);

  const handleAddTask = () => {
    const text = prompt("Nouvelle tâche :");
    if (text) {
      setTasks([...tasks, { id: crypto.randomUUID(), text, completed: false }]);
    }
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  // --- CALCULATIONS ---

  const stats = useMemo(() => {
    const sumTotal = (qs: Quote[]) => qs.reduce((acc, q) => acc + q.totalTTC, 0);
    const sumVAT = (qs: Quote[]) => qs.reduce((acc, q) => acc + (q.totalTTC - q.totalHT), 0);

    const acceptedQuotes = quotes.filter(q => q.status === 'Accepté' || q.status === 'Facturé' || q.status === 'Finalisé');
    const pendingQuotes = quotes.filter(q => q.status === 'Brouillon' || q.status === 'Envoyé');
    const lostQuotes = quotes.filter(q => q.status === 'Perdu');
    const invoicedQuotes = quotes.filter(q => q.status === 'Facturé');

    const revenueTTC = sumTotal(acceptedQuotes);
    const vatCollected = sumVAT(acceptedQuotes);

    const pipelineTotal = sumTotal(quotes);
    const pendingTotal = sumTotal(pendingQuotes);
    const acceptedTotal = sumTotal(acceptedQuotes);
    const lostTotal = sumTotal(lostQuotes);

    return {
      revenueTTC,
      vatCollected,
      countAccepted: acceptedQuotes.length,
      countPending: pendingQuotes.length,
      countLost: lostQuotes.length,
      totalPending: pendingTotal,
      totalAccepted: acceptedTotal,
      totalLost: lostTotal,
      totalPipeline: pipelineTotal,
      invoicesCount: invoicedQuotes.length,
      invoicesTotal: sumTotal(invoicedQuotes)
    };
  }, [quotes]);

  const chartData = useMemo(() => {
    const months = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
    const monthlyTotals = new Array(12).fill(0);

    quotes.forEach(q => {
      const d = new Date(q.date);
      if (d.getFullYear() === currentYear) {
        monthlyTotals[d.getMonth()] += q.totalTTC;
      }
    });

    const maxVal = Math.max(...monthlyTotals, 1);

    return months.map((month, index) => ({
      month,
      value: monthlyTotals[index],
      percentage: (monthlyTotals[index] / maxVal) * 100
    }));
  }, [quotes, currentYear]);

  const recentEvents = useMemo(() => {
    return [...quotes]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [quotes]);

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      {/* Main Content Column */}
      <div className="flex-1 p-8 space-y-8 overflow-y-auto">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              Tableau de bord
            </h1>
            <p className="text-sm text-gray-500 mt-1">Bienvenue, voici un aperçu de votre activité.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
              <span className="text-xs font-medium text-gray-500 px-2">HT</span>
              <div className="w-10 h-5 bg-indigo-600 rounded-full relative cursor-pointer">
                <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"></div>
              </div>
              <span className="text-xs font-medium text-indigo-600 px-2">TTC</span>
            </div>

            <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm gap-2 text-sm text-gray-600">
              <CalendarIcon size={16} className="text-gray-400" />
              <span className="font-medium">Cette année</span>
            </div>
          </div>
        </div>

        {/* Revenue Chart Card */}
        <Card className="p-8 shadow-soft">
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center gap-2 text-gray-500 font-medium text-sm uppercase tracking-wide">
                Chiffre d'affaires (Signé)
              </div>
              <div className="text-4xl font-bold text-gray-900 mt-2 tracking-tight">
                {stats.revenueTTC.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} €
                <span className="text-lg text-gray-400 font-normal ml-2">TTC</span>
              </div>
              <div className="flex items-center gap-2 mt-2 text-sm">
                <span className="text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <TrendingUp size={14} /> +12.5%
                </span>
                <span className="text-gray-400">vs année précédente</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-gray-400 font-medium text-sm">Objectif Annuel</div>
              <div className="text-2xl font-bold text-gray-300 mt-1">
                1M €
              </div>
            </div>
          </div>

          {/* CSS Bar Chart */}
          <div className="h-64 flex items-end justify-between gap-4 px-2">
            {chartData.map((d, i) => (
              <div key={i} className="flex flex-col items-center flex-1 h-full justify-end group cursor-pointer">
                {/* Tooltip on hover */}
                <div className="mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs rounded px-2 py-1 pointer-events-none whitespace-nowrap z-10 shadow-lg">
                  {d.value.toLocaleString('fr-FR')} €
                </div>
                {/* Bar */}
                <div
                  className={`w-full max-w-[40px] rounded-t-md transition-all relative ${d.value > 0 ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-gray-100'}`}
                  style={{ height: d.value > 0 ? `${Math.max(d.percentage, 2)}%` : '4px' }}
                >
                </div>
                {/* Label */}
                <div className="text-xs text-gray-400 mt-4 font-medium">{d.month}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* VAT Stats Row */}
        <div className="grid grid-cols-4 gap-6">
          <Card className="p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="text-sm font-medium text-gray-500 mb-1">TVA Collectée</div>
            <div className="text-2xl font-bold text-gray-900">{stats.vatCollected.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} €</div>
            <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 w-[70%]"></div>
            </div>
          </Card>
          <Card className="p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="text-sm font-medium text-gray-500 mb-1">TVA Déductible</div>
            <div className="text-2xl font-bold text-gray-900">0 €</div>
            <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gray-300 w-[0%]"></div>
            </div>
          </Card>
          <Card className="p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="text-sm font-medium text-gray-500 mb-1">TVA à payer</div>
            <div className="text-2xl font-bold text-indigo-600">{stats.vatCollected.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} €</div>
            <div className="mt-4 text-xs text-gray-400">Prochaine déclaration: 24/12</div>
          </Card>
          <Card className="p-6 flex flex-col justify-between bg-indigo-600 text-white border-none shadow-lg shadow-indigo-200">
            <div className="text-sm font-medium text-indigo-100 mb-1">Devis en attente</div>
            <div className="text-3xl font-bold">{stats.countPending}</div>
            <button onClick={() => onNavigate('quotes', 'Brouillon')} className="mt-4 text-xs bg-white/10 hover:bg-white/20 transition-colors rounded px-3 py-1.5 w-fit font-medium">
              Voir les devis
            </button>
          </Card>
        </div>

        {/* Bottom Widgets Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

          {/* Factures / Recent Activity */}
          <Card className="xl:col-span-2 p-0 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
              <h3 className="font-bold text-gray-900 text-lg">Activité Récente</h3>
              <button
                onClick={() => onNavigate('quotes')}
                className="text-sm text-indigo-600 font-medium hover:text-indigo-700 hover:underline"
              >
                Tout voir
              </button>
            </div>

            <div className="p-0">
              {recentEvents.length === 0 ? (
                <div className="p-8 text-center text-gray-400">Aucune activité récente.</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {recentEvents.map((quote) => (
                    <div key={quote.id} className="flex items-center gap-4 p-4 hover:bg-gray-50/50 transition-colors group cursor-pointer" onClick={() => onNavigate('quotes')}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${quote.status === 'Finalisé' || quote.status === 'Accepté' ? 'bg-emerald-100 text-emerald-600' :
                        quote.status === 'Envoyé' ? 'bg-blue-100 text-blue-600' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                        {quote.status === 'Envoyé' ? <Send size={18} /> :
                          quote.status === 'Accepté' ? <Check size={18} /> :
                            <FileText size={18} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-medium text-gray-900 truncate">{quote.title}</p>
                          <span className="text-xs text-gray-400 whitespace-nowrap">{quote.date}</span>
                        </div>
                        <div className="flex justify-between items-center mt-0.5">
                          <p className="text-xs text-gray-500 truncate">{quote.clientName} • {quote.number}</p>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${quote.status === 'Accepté' ? 'bg-emerald-50 text-emerald-700' :
                              quote.status === 'Envoyé' ? 'bg-blue-50 text-blue-700' :
                                'bg-gray-100 text-gray-600'
                            }`}>{quote.status}</span>
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight size={16} className="text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Tasks */}
          <Card className="p-0 overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
              <h3 className="font-bold text-gray-900 text-lg">Tâches</h3>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreHorizontal size={20} />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto max-h-[400px]">
              <div className="space-y-1">
                {tasks.map(task => (
                  <div key={task.id} className="flex items-start gap-3 group p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <button onClick={() => toggleTask(task.id)} className={`mt-0.5 text-gray-300 hover:text-indigo-600 transition-colors ${task.completed ? 'text-emerald-500 hover:text-emerald-600' : ''}`}>
                      {task.completed ? <CheckSquare size={20} /> : <Square size={20} />}
                    </button>
                    <div className="flex-1">
                      <p className={`text-sm text-gray-700 ${task.completed ? 'line-through text-gray-400' : ''}`}>{task.text}</p>
                    </div>
                    <button onClick={() => deleteTask(task.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={handleAddTask}
                className="mt-4 flex items-center justify-center gap-2 text-gray-500 hover:text-indigo-600 text-sm font-medium transition-colors w-full p-3 border border-dashed border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50/50"
              >
                <Plus size={16} /> Ajouter une tâche
              </button>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
};