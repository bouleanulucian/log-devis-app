import { Quote, QuoteSection, QuoteStatus } from '../types';

// ============================================================================
// TEMPLATE TYPES
// ============================================================================

export interface QuoteTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  sections: QuoteSection[];
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  tags?: string[];
}

export type TemplateCategory =
  | 'Construction'
  | 'Rénovation'
  | 'Plomberie'
  | 'Électricité'
  | 'General'
  | 'Autre';

// ============================================================================
// VERSION HISTORY TYPES
// ============================================================================

export interface QuoteVersion {
  id: string;
  quoteId: string;
  versionNumber: number;
  timestamp: string;
  author: string;
  changes: string;
  snapshot: Quote;
}

export interface VersionDiff {
  added: string[];
  removed: string[];
  modified: string[];
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export type NotificationType =
  | 'expiry-warning'
  | 'approval-request'
  | 'status-change'
  | 'system'
  | 'payment-due'
  | 'quote-accepted'
  | 'quote-rejected';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  quoteId?: string;
  invoiceId?: string;
  read: boolean;
  timestamp: string;
  actionUrl?: string;
}

// ============================================================================
// INVOICE TYPES
// ============================================================================

export type InvoiceStatus =
  | 'draft'
  | 'sent'
  | 'partial'
  | 'paid'
  | 'overdue'
  | 'cancelled';

export interface Payment {
  id: string;
  amount: number;
  date: string;
  method: 'Virement' | 'Chèque' | 'Espèces' | 'Carte' | 'Autre';
  reference: string;
  notes?: string;
}

export interface Invoice {
  id: string;
  number: string;
  quoteId: string;
  clientId: string;
  clientName: string;
  siteName: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  type: 'standard' | 'deposit' | 'progress' | 'final'; // Added type distinction

  // Content (copied from quote)
  sections: QuoteSection[];

  // Amounts
  totalHT: number;
  totalTTC: number;
  discount?: number;
  discountType?: 'percentage' | 'fixed';

  // Payment tracking
  payments: Payment[];
  amountPaid: number;
  amountDue: number;

  // Additional info
  notes?: string;
  currency: string;
}

// ============================================================================
// USER & WORKFLOW TYPES
// ============================================================================

export type UserRole = 'admin' | 'manager' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface WorkflowState {
  status: QuoteStatus;
  submittedBy?: string;
  submittedAt?: string;
  approver?: string;
  approvedAt?: string;
  rejectionReason?: string;
  history: WorkflowHistoryEntry[];
}

export interface WorkflowHistoryEntry {
  id: string;
  timestamp: string;
  action: 'created' | 'submitted' | 'approved' | 'rejected' | 'modified';
  user: string;
  notes?: string;
}

// ============================================================================
// REPORT TYPES
// ============================================================================

export interface ReportDateRange {
  startDate: string;
  endDate: string;
  label: string;
}

export interface RevenueData {
  date: string;
  totalHT: number;
  totalTTC: number;
  count: number;
}

export interface ClientStats {
  clientId: string;
  clientName: string;
  totalRevenue: number;
  quoteCount: number;
  acceptanceRate: number;
}

export interface QuoteStatusStats {
  status: QuoteStatus;
  count: number;
  totalValue: number;
}

export interface ConversionFunnel {
  draft: number;
  sent: number;
  accepted: number;
  invoiced: number;
  conversionRate: number;
}

// ============================================================================
// EXTENDED QUOTE INTERFACE (additions to base Quote type)
// ============================================================================

export interface QuoteExtensions {
  // Discount
  discount?: number;
  discountType?: 'percentage' | 'fixed';

  // Tax
  taxRate?: number; // TVA percentage, default 20

  // Margin
  margin?: number; // profit margin percentage

  // Template
  templateId?: string;

  // Version control
  versionHistory?: string[]; // array of QuoteVersion IDs
  currentVersion?: number;

  // Workflow
  approvalWorkflow?: WorkflowState;

  // Invoice link
  invoiceId?: string;

  // Categorization
  tags?: string[];

  // Metadata
  createdBy?: string;
  lastModifiedBy?: string;
  lastModifiedAt?: string;
}

// ============================================================================
// STORAGE TYPES
// ============================================================================

export interface AppData {
  quotes: Quote[];
  clients: any[]; // Using Client from main types
  templates: QuoteTemplate[];
  versions: QuoteVersion[];
  notifications: Notification[];
  invoices: Invoice[];
  currentUser: User;
  settings: AppSettings;
}

export interface AppSettings {
  language: 'ro' | 'en';
  currency: string;
  defaultTaxRate: number;
  defaultPaymentTerms: string;
  companyInfo: CompanyInfo;
  notifications: NotificationSettings;
}

export interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  taxId?: string;
  registrationNumber?: string;
}

export interface NotificationSettings {
  enabled: boolean;
  expiryWarningDays: number;
  emailNotifications: boolean;
}
