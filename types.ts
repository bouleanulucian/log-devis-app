export enum UnitType {
  SQM = 'm²',
  LM = 'ml',
  PCS = 'ens',
  HOUR = 'h',
  KG = 'kg',
  LITRE = 'L',
  GLOBAL = 'forfait'
}

export interface QuoteItem {
  id: string;
  type: 'item' | 'subheading' | 'text' | 'spacer' | 'pagebreak';
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  vatRate: number;
  total: number;
}

export interface QuoteSection {
  id: string;
  title: string;
  items: QuoteItem[];
}

export type QuoteStatus =
  | 'Brouillon'
  | 'En Attente'  // Pending approval
  | 'Finalisé'
  | 'Envoyé'
  | 'Accepté'
  | 'Rejeté'      // Rejected
  | 'Facturé'
  | 'Perdu';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  notes?: string;
  type: 'Particulier' | 'Professionnel';
}

export interface Quote {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  siteName: string; // "Chantier"
  title: string; // Internal project name
  status: QuoteStatus;

  // Dates
  date: string; // Date d'émission
  expiryDate: string; // Date d'expiration
  visitDate?: string; // Visite préalable
  startDate?: string; // Début des travaux
  duration?: string; // Durée estimée

  sections: QuoteSection[];
  currency: string;
  totalHT: number;
  totalTTC: number;
  paymentTerms: string;

  // Advanced features (new)
  discount?: number; // Discount value (percentage or fixed amount)
  discountType?: 'percentage' | 'fixed'; // Type of discount
  taxRate?: number; // TVA percentage (default 20)
  margin?: number; // Profit margin percentage
  templateId?: string; // ID if created from template
  versionHistory?: string[]; // Array of QuoteVersion IDs
  currentVersion?: number; // Current version number
  approvalWorkflow?: any; // WorkflowState (from extended types)
  invoiceId?: string; // Linked invoice ID
  tags?: string[]; // Tags for categorization
  createdBy?: string; // User who created this
  lastModifiedBy?: string; // User who last modified
  lastModifiedAt?: string; // Last modification timestamp
}

export type ViewState =
  | 'dashboard'
  | 'clients'
  | 'quotes'
  | 'quote-editor'
  | 'templates'
  | 'invoices'
  | 'invoice-editor'
  | 'reports';