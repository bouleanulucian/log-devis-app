import React, { useState, useEffect } from 'react';
import { ViewState, Client, Quote, QuoteStatus } from './types';
import { QuoteTemplate, Notification, User, Invoice } from './types/extended';
import { Sidebar } from './components/Sidebar';
import { ClientList } from './components/ClientList';
import { QuoteList } from './components/QuoteList';
import { QuoteEditor } from './components/QuoteEditor';
import { Dashboard } from './components/Dashboard';
import { TemplateManager } from './components/TemplateManager';
import { InvoiceList } from './components/InvoiceList';
import { InvoiceEditor } from './components/InvoiceEditor';
import { NotificationCenter } from './components/NotificationCenter';
import { ReportsView } from './components/ReportsView';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { StorageService } from './services/storageService';
import { NotificationService } from './services/notificationService';
import { CalculationService } from './services/calculationService';
import { initI18n } from './services/i18n';
import { Construction, LayoutDashboard } from 'lucide-react';

// --- MOCK DATA ---
const MOCK_CLIENTS: Client[] = [
  { id: '1', name: 'Empire De Construction', email: 'contact@empire.com', phone: '06 12 34 56 78', address: 'Chateau Lerins, Cannes', type: 'Professionnel' },
  { id: '2', name: 'David Boisson', email: 'david@gmail.com', phone: '07 98 76 54 32', address: '12 Rue de la Paix, Paris', type: 'Particulier' },
  { id: '3', name: 'SCI EQUERRE', email: 'contact@sciequerre.fr', phone: '01 44 55 66 77', address: '7 rue l\'équerre', type: 'Professionnel' },
];

const MOCK_QUOTES: Quote[] = [
  {
    id: '101',
    number: 'DEV25143',
    clientId: '1',
    clientName: 'Empire De Construction',
    siteName: 'Chateau Lerins',
    title: 'Rénovation Aile Ouest',
    status: 'Finalisé',
    date: '2025-09-17',
    expiryDate: '2025-10-17',
    visitDate: '2025-09-10',
    startDate: '2025-11-15',
    duration: '45',
    currency: '€',
    totalHT: 70149.00,
    totalTTC: 84178.80,
    paymentTerms: "30% à la commande\n30% au démarrage\nSolde à la réception",
    sections: [
      {
        id: 's1',
        title: 'Installation et protection périphérique',
        items: [
          { id: 'i1', type: 'item', description: "Installation de l'échafaudage (échafaudage disponible sur place)", quantity: 1, unit: 'ens', unitPrice: 550, vatRate: 20, total: 550 }
        ]
      },
      {
        id: 's2',
        title: 'Installation des coffrages PBK',
        items: [
          { id: 'i2', type: 'item', description: "Étayage de la charpente en pente, selon le plan fourni par le client.", quantity: 349, unit: 'm²', unitPrice: 12, vatRate: 20, total: 4188 },
          { id: 'i3', type: 'item', description: "Création du coffrage périmétral.", quantity: 95, unit: 'ml', unitPrice: 22, vatRate: 20, total: 2090 }
        ]
      }
    ]
  },
  {
    id: '102',
    number: 'DEV25144',
    clientId: '2',
    clientName: 'David Boisson',
    siteName: '12 Rue de la Paix',
    title: 'Réparation Fuite SDB',
    status: 'Brouillon',
    date: '2025-11-22',
    expiryDate: '2025-12-21',
    currency: '€',
    totalHT: 23424.32,
    totalTTC: 28109.18,
    paymentTerms: "Acompte 40% avant travaux",
    sections: []
  },
  {
    id: '103',
    number: 'DEV25130',
    clientId: '3',
    clientName: 'SCI EQUERRE',
    siteName: '7 rue l\'équerre',
    title: 'Fondations',
    status: 'Accepté',
    date: '2025-02-10',
    expiryDate: '2025-03-10',
    currency: '€',
    totalHT: 9928.80,
    totalTTC: 11914.56,
    paymentTerms: "Standard",
    sections: []
  }
];

const App: React.FC = () => {
  // Initialize i18n on app load
  useEffect(() => {
    initI18n();
  }, []);

  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [clients, setClients] = useState<Client[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [templates, setTemplates] = useState<QuoteTemplate[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [activeQuoteFilter, setActiveQuoteFilter] = useState<string | undefined>(undefined);
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    // Initialize storage with mock data if empty
    StorageService.initialize(MOCK_QUOTES, MOCK_CLIENTS);

    // Load data
    setClients(StorageService.loadClients());
    setQuotes(StorageService.loadQuotes());
    setTemplates(StorageService.loadTemplates());
    setNotifications(StorageService.loadNotifications());
    setInvoices(StorageService.loadInvoices());
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (quotes.length > 0) {
      StorageService.saveQuotes(quotes);
    }
  }, [quotes]);

  useEffect(() => {
    if (clients.length > 0) {
      StorageService.saveClients(clients);
    }
  }, [clients]);

  useEffect(() => {
    StorageService.saveTemplates(templates);
  }, [templates]);

  useEffect(() => {
    StorageService.saveNotifications(notifications);
  }, [notifications]);

  useEffect(() => {
    StorageService.saveInvoices(invoices);
  }, [invoices]);

  // Check for expiring quotes periodically
  useEffect(() => {
    const checkNotifications = () => {
      const settings = StorageService.loadSettings();
      if (!settings.notifications.enabled) return;

      const expiryNotifications = NotificationService.checkExpiringQuotes(
        quotes,
        settings.notifications.expiryWarningDays
      );

      if (expiryNotifications.length > 0) {
        setNotifications(prev => {
          // Avoid duplicate notifications
          const existingIds = new Set(prev.map(n => `${n.quoteId}-${n.type}`));
          const newNotifications = expiryNotifications.filter(
            n => !existingIds.has(`${n.quoteId}-${n.type}`)
          );
          return [...prev, ...newNotifications];
        });
      }
    };

    // Check immediately
    checkNotifications();

    // Check every hour
    const interval = setInterval(checkNotifications, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [quotes]);

  // --- Actions ---

  const handleAddClient = (client: Client) => {
    setClients([...clients, client]);
  };

  const handleUpdateClient = (updatedClient: Client) => {
    setClients(clients.map(c => c.id === updatedClient.id ? updatedClient : c));
  };

  const handleCreateQuote = () => {
    const newQuoteId = crypto.randomUUID();
    const newQuote: Quote = {
      id: newQuoteId,
      number: `DEV${new Date().getFullYear().toString().substring(2)}${Math.floor(Math.random() * 1000)}`,
      clientId: '',
      clientName: '',
      siteName: '',
      title: 'Nouveau chantier',
      status: 'Brouillon',
      date: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      currency: '€',
      totalHT: 0,
      totalTTC: 0,
      paymentTerms: "30% à l'ouverture du chantier ;\n30% après avoir achevé 35% des travaux ;\nSolde à la réception.",
      sections: []
    };
    setQuotes([newQuote, ...quotes]);
    setEditingQuoteId(newQuoteId);
    setCurrentView('quote-editor');
  };

  const handleEditQuote = (quote: Quote) => {
    setEditingQuoteId(quote.id);
    setCurrentView('quote-editor');
  };

  const handleSaveQuote = (updatedQuote: Quote) => {
    setQuotes(quotes.map(q => q.id === updatedQuote.id ? updatedQuote : q));
  };

  const handleDeleteQuote = (quoteId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce devis ?')) {
      setQuotes(quotes.filter(q => q.id !== quoteId));
      // Ensure we stay on list view or refresh it
      if (currentView === 'quote-editor' && editingQuoteId === quoteId) {
        setCurrentView('quotes');
        setEditingQuoteId(null);
      }
    }
  };

  const handleDuplicateQuote = (quote: Quote) => {
    const newQuote: Quote = {
      ...quote,
      id: crypto.randomUUID(),
      number: `${quote.number} (Copie)`,
      title: `${quote.title} (Copie)`,
      status: 'Brouillon',
      date: new Date().toISOString().split('T')[0],
      sections: quote.sections.map(s => ({
        ...s,
        id: crypto.randomUUID(),
        items: s.items.map(i => ({ ...i, id: crypto.randomUUID() }))
      }))
    };
    setQuotes([newQuote, ...quotes]);
    setEditingQuoteId(newQuote.id);
    setCurrentView('quote-editor');
  };

  const handleDashboardNavigate = (view: ViewState, filterStatus?: string) => {
    setActiveQuoteFilter(filterStatus);
    setCurrentView(view);
  }


  const handleSidebarNavigate = (view: ViewState) => {
    setActiveQuoteFilter(undefined); // Reset filters when navigating from sidebar
    setCurrentView(view);
  }

  // --- Template Actions ---

  const handleAddTemplate = (template: QuoteTemplate) => {
    setTemplates([template, ...templates]);
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(templates.filter(t => t.id !== templateId));
  };

  const handleUseTemplate = (template: QuoteTemplate) => {
    const newQuoteId = crypto.randomUUID();
    const newQuote: Quote = {
      id: newQuoteId,
      number: `DEV${new Date().getFullYear().toString().substring(2)}${Math.floor(Math.random() * 1000)}`,
      clientId: '',
      clientName: '',
      siteName: '',
      title: template.name,
      status: 'Brouillon',
      date: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      currency: '€',
      totalHT: 0,
      totalTTC: 0,
      paymentTerms: "30% à l'ouverture du chantier ;\n30% après avoir achevé 35% des travaux ;\nSolde à la réception.",
      sections: JSON.parse(JSON.stringify(template.sections)), // Deep clone
      templateId: template.id
    };

    // Update totals
    const updatedQuote = CalculationService.updateQuoteTotals(newQuote);

    setQuotes([updatedQuote, ...quotes]);
    setEditingQuoteId(updatedQuote.id);
    setCurrentView('quote-editor');

    // Increment usage count
    setTemplates(templates.map(t =>
      t.id === template.id
        ? { ...t, usageCount: t.usageCount + 1 }
        : t
    ));
  };

  // --- Notification Actions ---

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(NotificationService.markAsRead(notifications, notificationId));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  const handleNavigateToQuote = (quoteId: string) => {
    const quote = quotes.find(q => q.id === quoteId);
    if (quote) {
      handleEditQuote(quote);
    }
  };

  // --- Invoice Actions ---

  const handleCreateInvoice = (invoiceData?: Partial<Invoice>) => {
    const newInvoice: Invoice = {
      id: crypto.randomUUID(),
      number: `FAC${new Date().getFullYear().toString().substring(2)}${Math.floor(Math.random() * 1000)}`,
      quoteId: '',
      clientId: '',
      clientName: '',
      siteName: '',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'draft',
      type: 'standard',
      sections: [],
      totalHT: 0,
      totalTTC: 0,
      payments: [],
      amountPaid: 0,
      amountDue: 0,
      currency: '€',
      ...invoiceData // Override with provided data (e.g. from modal)
    };

    setInvoices([newInvoice, ...invoices]);
    setEditingInvoiceId(newInvoice.id);
    setCurrentView('invoice-editor');
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoiceId(invoice.id);
    setCurrentView('invoice-editor');
  };

  const handleSaveInvoice = (updatedInvoice: Invoice) => {
    const existingIndex = invoices.findIndex(i => i.id === updatedInvoice.id);
    if (existingIndex >= 0) {
      setInvoices(invoices.map(i => i.id === updatedInvoice.id ? updatedInvoice : i));
    } else {
      setInvoices([updatedInvoice, ...invoices]);
    }
    setCurrentView('invoices');
    setEditingInvoiceId(null);
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    if (confirm('Sigur vrei să ștergi această factură?')) {
      setInvoices(invoices.filter(i => i.id !== invoiceId));
      if (currentView === 'invoice-editor' && editingInvoiceId === invoiceId) {
        setCurrentView('invoices');
        setEditingInvoiceId(null);
      }
    }
  };

  const activeQuote = quotes.find(q => q.id === editingQuoteId);
  const activeInvoice = invoices.find(i => i.id === editingInvoiceId);


  // --- Render Views ---

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard quotes={quotes} clients={clients} onNavigate={handleDashboardNavigate} />;
      case 'clients':
        return <ClientList clients={clients} onAddClient={handleAddClient} onUpdateClient={handleUpdateClient} onSelectClient={() => { }} />;
      case 'quotes':
        return (
          <QuoteList
            quotes={quotes}
            clients={clients}
            onSelectQuote={handleEditQuote}
            onCreateQuote={handleCreateQuote}
            onDuplicateQuote={handleDuplicateQuote}
            onDeleteQuote={handleDeleteQuote}
            onCreateInvoice={handleCreateInvoice}
          />
        );
      case 'quote-editor':
        if (!activeQuote) return <div>Devis introuvable</div>;
        return (
          <QuoteEditor
            quote={activeQuote}
            clients={clients}
            onSave={handleSaveQuote}
            onBack={() => setCurrentView('quotes')}
            onDelete={handleDeleteQuote}
            onDuplicate={handleDuplicateQuote}
            onClientCreate={handleAddClient}
          />
        );
      case 'templates':
        return (
          <TemplateManager
            templates={templates}
            onAddTemplate={handleAddTemplate}
            onDeleteTemplate={handleDeleteTemplate}
            onUseTemplate={handleUseTemplate}
          />
        );
      case 'reports':
        return <ReportsView quotes={quotes} clients={clients} />;
      case 'invoices':
        return (
          <InvoiceList
            invoices={invoices}
            onSelectInvoice={handleEditInvoice}
            onCreateInvoice={handleCreateInvoice}
            onDeleteInvoice={handleDeleteInvoice}
          />
        );
      case 'invoice-editor':
        return (
          <InvoiceEditor
            invoice={activeInvoice}
            clients={clients}
            onSave={handleSaveInvoice}
            onBack={() => setCurrentView('invoices')}
          />
        );
      default:
        return <div>Vue inconnue</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900 overflow-hidden">
      {/* Sidebar is hidden when in editor mode for max focus, matches standard CRM behavior */}
      {currentView !== 'quote-editor' && (
        <Sidebar currentView={currentView} onChangeView={handleSidebarNavigate} />
      )}

      <div className={`flex-1 flex flex-col h-screen ${currentView !== 'quote-editor' ? 'ml-64' : ''}`}>
        {/* Header with Notifications and Language Switcher */}
        {currentView !== 'quote-editor' && (
          <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-end gap-3">
            <NotificationCenter
              notifications={notifications}
              onMarkAsRead={handleMarkAsRead}
              onClearAll={handleClearAllNotifications}
              onNavigate={handleNavigateToQuote}
            />
            <LanguageSwitcher />
          </div>
        )}

        {renderContent()}
      </div>
    </div>
  );
};

export default App;