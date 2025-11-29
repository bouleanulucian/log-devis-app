import { AppData, User } from '../types/extended';
import { Quote, Client } from '../types';

/**
 * StorageService - Handles all localStorage operations with type safety
 * Provides data persistence for the entire application
 */
export class StorageService {
    private static readonly STORAGE_VERSION = '1.0';
    private static readonly KEYS = {
        QUOTES: 'log-devis-quotes',
        CLIENTS: 'log-devis-clients',
        TEMPLATES: 'log-devis-templates',
        VERSIONS: 'log-devis-versions',
        NOTIFICATIONS: 'log-devis-notifications',
        INVOICES: 'log-devis-invoices',
        CURRENT_USER: 'log-devis-current-user',
        SETTINGS: 'log-devis-settings',
        STORAGE_VERSION: 'log-devis-version'
    };

    /**
     * Save data to localStorage with error handling
     */
    static save<T>(key: string, data: T): void {
        try {
            const serialized = JSON.stringify(data);
            localStorage.setItem(key, serialized);
        } catch (error) {
            console.error(`Error saving to localStorage (${key}):`, error);
            throw new Error(`Failed to save data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Load data from localStorage with type safety
     */
    static load<T>(key: string, defaultValue: T): T {
        try {
            const item = localStorage.getItem(key);
            if (item === null) {
                return defaultValue;
            }
            return JSON.parse(item) as T;
        } catch (error) {
            console.error(`Error loading from localStorage (${key}):`, error);
            return defaultValue;
        }
    }

    /**
     * Remove data from localStorage
     */
    static remove(key: string): void {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`Error removing from localStorage (${key}):`, error);
        }
    }

    /**
     * Clear all application data
     */
    static clearAll(): void {
        Object.values(this.KEYS).forEach(key => {
            this.remove(key);
        });
    }

    /**
     * Save quotes to storage
     */
    static saveQuotes(quotes: Quote[]): void {
        this.save(this.KEYS.QUOTES, quotes);
    }

    /**
     * Load quotes from storage
     */
    static loadQuotes(): Quote[] {
        return this.load<Quote[]>(this.KEYS.QUOTES, []);
    }

    /**
     * Save clients to storage
     */
    static saveClients(clients: Client[]): void {
        this.save(this.KEYS.CLIENTS, clients);
    }

    /**
     * Load clients from storage
     */
    static loadClients(): Client[] {
        return this.load<Client[]>(this.KEYS.CLIENTS, []);
    }

    /**
     * Save templates to storage
     */
    static saveTemplates(templates: any[]): void {
        this.save(this.KEYS.TEMPLATES, templates);
    }

    /**
     * Load templates from storage
     */
    static loadTemplates(): any[] {
        return this.load<any[]>(this.KEYS.TEMPLATES, []);
    }

    /**
     * Save versions to storage
     */
    static saveVersions(versions: any[]): void {
        this.save(this.KEYS.VERSIONS, versions);
    }

    /**
     * Load versions from storage
     */
    static loadVersions(): any[] {
        return this.load<any[]>(this.KEYS.VERSIONS, []);
    }

    /**
     * Save notifications to storage
     */
    static saveNotifications(notifications: any[]): void {
        this.save(this.KEYS.NOTIFICATIONS, notifications);
    }

    /**
     * Load notifications from storage
     */
    static loadNotifications(): any[] {
        return this.load<any[]>(this.KEYS.NOTIFICATIONS, []);
    }

    /**
     * Save invoices to storage
     */
    static saveInvoices(invoices: any[]): void {
        this.save(this.KEYS.INVOICES, invoices);
    }

    /**
     * Load invoices from storage
     */
    static loadInvoices(): any[] {
        return this.load<any[]>(this.KEYS.INVOICES, []);
    }

    /**
     * Save current user to storage
     */
    static saveCurrentUser(user: User): void {
        this.save(this.KEYS.CURRENT_USER, user);
    }

    /**
     * Load current user from storage
     */
    static loadCurrentUser(): User | null {
        return this.load<User | null>(this.KEYS.CURRENT_USER, null);
    }

    /**
     * Save settings to storage
     */
    static saveSettings(settings: any): void {
        this.save(this.KEYS.SETTINGS, settings);
    }

    /**
     * Load settings from storage
     */
    static loadSettings(): any {
        return this.load<any>(this.KEYS.SETTINGS, {
            language: 'ro',
            currency: '€',
            defaultTaxRate: 20,
            defaultPaymentTerms: "30% à l'ouverture du chantier ;\n30% après avoir achevé 35% des travaux ;\nSolde à la réception.",
            companyInfo: {
                name: 'Votre Entreprise',
                address: '',
                phone: '',
                email: '',
            },
            notifications: {
                enabled: true,
                expiryWarningDays: 7,
                emailNotifications: false
            }
        });
    }

    /**
     * Export all data as JSON string
     */
    static exportData(): string {
        const data: any = {
            version: this.STORAGE_VERSION,
            exportDate: new Date().toISOString(),
            quotes: this.loadQuotes(),
            clients: this.loadClients(),
            templates: this.loadTemplates(),
            versions: this.loadVersions(),
            notifications: this.loadNotifications(),
            invoices: this.loadInvoices(),
            settings: this.loadSettings()
        };
        return JSON.stringify(data, null, 2);
    }

    /**
     * Import data from JSON string
     */
    static importData(json: string): void {
        try {
            const data = JSON.parse(json);

            // Validate version compatibility
            if (data.version && data.version !== this.STORAGE_VERSION) {
                console.warn(`Importing data from version ${data.version}, current version is ${this.STORAGE_VERSION}`);
            }

            // Import each data type
            if (data.quotes) this.saveQuotes(data.quotes);
            if (data.clients) this.saveClients(data.clients);
            if (data.templates) this.saveTemplates(data.templates);
            if (data.versions) this.saveVersions(data.versions);
            if (data.notifications) this.saveNotifications(data.notifications);
            if (data.invoices) this.saveInvoices(data.invoices);
            if (data.settings) this.saveSettings(data.settings);

            console.log('Data imported successfully');
        } catch (error) {
            console.error('Error importing data:', error);
            throw new Error('Failed to import data. Please check the file format.');
        }
    }

    /**
     * Download data as JSON file
     */
    static downloadBackup(): void {
        const data = this.exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `log-devis-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * Get storage usage information
     */
    static getStorageInfo(): { used: number; available: number; percentage: number } {
        let used = 0;
        for (const key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                used += localStorage[key].length + key.length;
            }
        }

        // localStorage typically has 5-10MB limit
        const available = 5 * 1024 * 1024; // 5MB
        const percentage = (used / available) * 100;

        return { used, available, percentage };
    }

    /**
     * Initialize storage with default data if empty
     */
    static initialize(defaultQuotes: Quote[], defaultClients: Client[]): void {
        // Check if already initialized
        const existingQuotes = this.loadQuotes();
        if (existingQuotes.length > 0) {
            console.log('Storage already initialized with data');
            return;
        }

        // Initialize with default data
        this.saveQuotes(defaultQuotes);
        this.saveClients(defaultClients);
        this.saveTemplates([]);
        this.saveVersions([]);
        this.saveNotifications([]);
        this.saveInvoices([]);

        // Create default user (simulated)
        const defaultUser: User = {
            id: 'user-1',
            name: 'Utilisateur Admin',
            email: 'admin@example.com',
            role: 'admin'
        };
        this.saveCurrentUser(defaultUser);

        console.log('Storage initialized with default data');
    }
}
