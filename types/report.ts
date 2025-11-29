import { Quote, QuoteStatus } from '../types';

// ============================================================================
// DATE RANGE TYPES
// ============================================================================

export type ReportPeriod = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

export interface DateRange {
  startDate: string;
  endDate: string;
  label: string;
}

// ============================================================================
// REVENUE ANALYTICS
// ============================================================================

export interface RevenueData {
  date: string;
  period: string; // e.g., "2025-01", "Week 12", etc.
  totalHT: number;
  totalTTC: number;
  count: number;
  averageValue: number;
}

export interface RevenueByStatus {
  status: QuoteStatus;
  totalHT: number;
  totalTTC: number;
  count: number;
  percentage: number;
}

export interface RevenueTrend {
  current: number;
  previous: number;
  change: number;
  changePercentage: number;
  trend: 'up' | 'down' | 'stable';
}

// ============================================================================
// CLIENT ANALYTICS
// ============================================================================

export interface ClientStats {
  clientId: string;
  clientName: string;
  clientType: 'Particulier' | 'Professionnel';
  totalRevenue: number;
  quoteCount: number;
  acceptedCount: number;
  rejectedCount: number;
  acceptanceRate: number;
  averageQuoteValue: number;
  lastQuoteDate: string;
  lifetimeValue: number;
}

export interface ClientSegment {
  segment: 'top' | 'medium' | 'low' | 'inactive';
  clients: ClientStats[];
  totalRevenue: number;
  count: number;
}

// ============================================================================
// QUOTE ANALYTICS
// ============================================================================

export interface QuoteStatusStats {
  status: QuoteStatus;
  count: number;
  totalValue: number;
  percentage: number;
  averageValue: number;
}

export interface ConversionFunnel {
  draft: number;
  sent: number;
  accepted: number;
  invoiced: number;
  total: number;
  draftToSentRate: number;
  sentToAcceptedRate: number;
  acceptedToInvoicedRate: number;
  overallConversionRate: number;
}

export interface QuoteMetrics {
  totalQuotes: number;
  totalRevenue: number;
  averageQuoteValue: number;
  medianQuoteValue: number;
  highestQuoteValue: number;
  lowestQuoteValue: number;
  conversionRate: number;
  acceptanceRate: number;
}

// ============================================================================
// TEMPLATE ANALYTICS
// ============================================================================

export interface TemplateStats {
  templateId: string;
  templateName: string;
  usageCount: number;
  totalRevenue: number;
  averageQuoteValue: number;
  acceptanceRate: number;
  lastUsed: string;
}

// ============================================================================
// TIME-BASED ANALYTICS
// ============================================================================

export interface TimeStats {
  period: string;
  quotes: number;
  revenue: number;
  averageValue: number;
}

export interface PeakAnalysis {
  bestDay: string;
  bestWeek: string;
  bestMonth: string;
  peakRevenue: number;
  peakQuotes: number;
}

// ============================================================================
// PREDICTIVE ANALYTICS
// ============================================================================

export interface Forecast {
  period: string;
  predictedRevenue: number;
  confidence: number; // 0-100
  trend: 'up' | 'down' | 'stable';
}

export interface GrowthMetrics {
  monthOverMonth: number;
  quarterOverQuarter: number;
  yearOverYear: number;
  projectedAnnual: number;
}

// ============================================================================
// COMPREHENSIVE REPORT
// ============================================================================

export interface ComprehensiveReport {
  dateRange: DateRange;
  generatedAt: string;
  
  // Summary
  summary: {
    totalRevenue: number;
    totalQuotes: number;
    averageQuoteValue: number;
    conversionRate: number;
    topClient: string;
    topTemplate: string;
  };
  
  // Revenue
  revenueData: RevenueData[];
  revenueByStatus: RevenueByStatus[];
  revenueTrend: RevenueTrend;
  
  // Clients
  clientStats: ClientStats[];
  clientSegments: ClientSegment[];
  topClients: ClientStats[];
  
  // Quotes
  quoteMetrics: QuoteMetrics;
  statusStats: QuoteStatusStats[];
  conversionFunnel: ConversionFunnel;
  
  // Templates
  templateStats: TemplateStats[];
  
  // Time-based
  timeStats: TimeStats[];
  peakAnalysis: PeakAnalysis;
  
  // Predictions
  forecasts: Forecast[];
  growthMetrics: GrowthMetrics;
}

// ============================================================================
// REPORT FILTERS
// ============================================================================

export interface ReportFilters {
  dateRange: DateRange;
  clientIds?: string[];
  statuses?: QuoteStatus[];
  templateIds?: string[];
  minValue?: number;
  maxValue?: number;
  clientType?: 'Particulier' | 'Professionnel';
}

// ============================================================================
// EXPORT OPTIONS
// ============================================================================

export type ReportExportFormat = 'pdf' | 'excel' | 'csv' | 'json';

export interface ReportExportOptions {
  format: ReportExportFormat;
  includeCharts: boolean;
  includeRawData: boolean;
  fileName?: string;
}
