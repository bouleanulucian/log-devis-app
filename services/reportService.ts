import { Quote, Client, QuoteStatus } from '../types';
import {
    DateRange,
    ReportPeriod,
    RevenueData,
    RevenueByStatus,
    RevenueTrend,
    ClientStats,
    ClientSegment,
    QuoteStatusStats,
    ConversionFunnel,
    QuoteMetrics,
    TemplateStats,
    TimeStats,
    PeakAnalysis,
    Forecast,
    GrowthMetrics,
    ComprehensiveReport,
    ReportFilters
} from '../types/report';

/**
 * ReportService - Advanced analytics and reporting
 * Provides comprehensive business insights and metrics
 */
export class ReportService {

    // ============================================================================
    // DATE RANGE UTILITIES
    // ============================================================================

    static getDateRange(period: ReportPeriod, customStart?: string, customEnd?: string): DateRange {
        const now = new Date();
        let startDate: Date;
        let endDate = now;
        let label = '';

        switch (period) {
            case 'day':
                startDate = new Date(now);
                startDate.setHours(0, 0, 0, 0);
                label = 'Today';
                break;
            case 'week':
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 7);
                label = 'Last 7 Days';
                break;
            case 'month':
                startDate = new Date(now);
                startDate.setMonth(now.getMonth() - 1);
                label = 'Last 30 Days';
                break;
            case 'quarter':
                startDate = new Date(now);
                startDate.setMonth(now.getMonth() - 3);
                label = 'Last Quarter';
                break;
            case 'year':
                startDate = new Date(now);
                startDate.setFullYear(now.getFullYear() - 1);
                label = 'Last Year';
                break;
            case 'custom':
                if (!customStart || !customEnd) {
                    throw new Error('Custom date range requires start and end dates');
                }
                startDate = new Date(customStart);
                endDate = new Date(customEnd);
                label = `${customStart} to ${customEnd}`;
                break;
            default:
                startDate = new Date(now);
                startDate.setMonth(now.getMonth() - 1);
                label = 'Last 30 Days';
        }

        return {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            label
        };
    }

    static filterQuotesByDateRange(quotes: Quote[], dateRange: DateRange): Quote[] {
        return quotes.filter(q => {
            const quoteDate = new Date(q.date);
            const start = new Date(dateRange.startDate);
            const end = new Date(dateRange.endDate);
            return quoteDate >= start && quoteDate <= end;
        });
    }

    // ============================================================================
    // REVENUE ANALYTICS
    // ============================================================================

    static calculateRevenueData(quotes: Quote[], period: ReportPeriod, dateRange: DateRange): RevenueData[] {
        const filteredQuotes = this.filterQuotesByDateRange(quotes, dateRange);
        const groupedData: Map<string, Quote[]> = new Map();

        filteredQuotes.forEach(quote => {
            const key = this.getDateKey(quote.date, period);
            if (!groupedData.has(key)) {
                groupedData.set(key, []);
            }
            groupedData.get(key)!.push(quote);
        });

        const revenueData: RevenueData[] = [];
        groupedData.forEach((quotes, period) => {
            const totalHT = quotes.reduce((sum, q) => sum + q.totalHT, 0);
            const totalTTC = quotes.reduce((sum, q) => sum + q.totalTTC, 0);
            const count = quotes.length;

            revenueData.push({
                date: quotes[0].date,
                period,
                totalHT,
                totalTTC,
                count,
                averageValue: count > 0 ? totalHT / count : 0
            });
        });

        return revenueData.sort((a, b) => a.date.localeCompare(b.date));
    }

    static calculateRevenueByStatus(quotes: Quote[], dateRange: DateRange): RevenueByStatus[] {
        const filteredQuotes = this.filterQuotesByDateRange(quotes, dateRange);
        const statusMap: Map<QuoteStatus, Quote[]> = new Map();

        filteredQuotes.forEach(quote => {
            if (!statusMap.has(quote.status)) {
                statusMap.set(quote.status, []);
            }
            statusMap.get(quote.status)!.push(quote);
        });

        const totalRevenue = filteredQuotes.reduce((sum, q) => sum + q.totalHT, 0);
        const result: RevenueByStatus[] = [];

        statusMap.forEach((quotes, status) => {
            const totalHT = quotes.reduce((sum, q) => sum + q.totalHT, 0);
            const totalTTC = quotes.reduce((sum, q) => sum + q.totalTTC, 0);

            result.push({
                status,
                totalHT,
                totalTTC,
                count: quotes.length,
                percentage: totalRevenue > 0 ? (totalHT / totalRevenue) * 100 : 0
            });
        });

        return result.sort((a, b) => b.totalHT - a.totalHT);
    }

    static calculateRevenueTrend(quotes: Quote[], currentRange: DateRange): RevenueTrend {
        const currentQuotes = this.filterQuotesByDateRange(quotes, currentRange);
        const currentRevenue = currentQuotes.reduce((sum, q) => sum + q.totalHT, 0);

        // Calculate previous period
        const start = new Date(currentRange.startDate);
        const end = new Date(currentRange.endDate);
        const duration = end.getTime() - start.getTime();

        const prevStart = new Date(start.getTime() - duration);
        const prevEnd = new Date(start);

        const previousRange: DateRange = {
            startDate: prevStart.toISOString().split('T')[0],
            endDate: prevEnd.toISOString().split('T')[0],
            label: 'Previous Period'
        };

        const previousQuotes = this.filterQuotesByDateRange(quotes, previousRange);
        const previousRevenue = previousQuotes.reduce((sum, q) => sum + q.totalHT, 0);

        const change = currentRevenue - previousRevenue;
        const changePercentage = previousRevenue > 0 ? (change / previousRevenue) * 100 : 0;

        let trend: 'up' | 'down' | 'stable';
        if (Math.abs(changePercentage) < 5) {
            trend = 'stable';
        } else if (changePercentage > 0) {
            trend = 'up';
        } else {
            trend = 'down';
        }

        return {
            current: currentRevenue,
            previous: previousRevenue,
            change,
            changePercentage,
            trend
        };
    }

    // ============================================================================
    // CLIENT ANALYTICS
    // ============================================================================

    static calculateClientStats(quotes: Quote[], clients: Client[], dateRange: DateRange): ClientStats[] {
        const filteredQuotes = this.filterQuotesByDateRange(quotes, dateRange);
        const clientMap: Map<string, Quote[]> = new Map();

        filteredQuotes.forEach(quote => {
            if (!clientMap.has(quote.clientId)) {
                clientMap.set(quote.clientId, []);
            }
            clientMap.get(quote.clientId)!.push(quote);
        });

        const stats: ClientStats[] = [];

        clientMap.forEach((clientQuotes, clientId) => {
            const client = clients.find(c => c.id === clientId);
            if (!client) return;

            const totalRevenue = clientQuotes.reduce((sum, q) => sum + q.totalHT, 0);
            const acceptedQuotes = clientQuotes.filter(q => q.status === 'Accepté' || q.status === 'Facturé');
            const rejectedQuotes = clientQuotes.filter(q => q.status === 'Rejeté');

            const sortedByDate = [...clientQuotes].sort((a, b) => b.date.localeCompare(a.date));

            stats.push({
                clientId,
                clientName: client.name,
                clientType: client.type,
                totalRevenue,
                quoteCount: clientQuotes.length,
                acceptedCount: acceptedQuotes.length,
                rejectedCount: rejectedQuotes.length,
                acceptanceRate: clientQuotes.length > 0 ? (acceptedQuotes.length / clientQuotes.length) * 100 : 0,
                averageQuoteValue: clientQuotes.length > 0 ? totalRevenue / clientQuotes.length : 0,
                lastQuoteDate: sortedByDate[0]?.date || '',
                lifetimeValue: totalRevenue
            });
        });

        return stats.sort((a, b) => b.totalRevenue - a.totalRevenue);
    }

    static segmentClients(clientStats: ClientStats[]): ClientSegment[] {
        const sorted = [...clientStats].sort((a, b) => b.totalRevenue - a.totalRevenue);
        const topCount = Math.ceil(sorted.length * 0.2); // Top 20%
        const mediumCount = Math.ceil(sorted.length * 0.3); // Next 30%

        const segments: ClientSegment[] = [
            {
                segment: 'top',
                clients: sorted.slice(0, topCount),
                totalRevenue: sorted.slice(0, topCount).reduce((sum, c) => sum + c.totalRevenue, 0),
                count: topCount
            },
            {
                segment: 'medium',
                clients: sorted.slice(topCount, topCount + mediumCount),
                totalRevenue: sorted.slice(topCount, topCount + mediumCount).reduce((sum, c) => sum + c.totalRevenue, 0),
                count: mediumCount
            },
            {
                segment: 'low',
                clients: sorted.slice(topCount + mediumCount),
                totalRevenue: sorted.slice(topCount + mediumCount).reduce((sum, c) => sum + c.totalRevenue, 0),
                count: sorted.length - topCount - mediumCount
            }
        ];

        return segments;
    }

    // ============================================================================
    // QUOTE ANALYTICS
    // ============================================================================

    static calculateQuoteMetrics(quotes: Quote[], dateRange: DateRange): QuoteMetrics {
        const filteredQuotes = this.filterQuotesByDateRange(quotes, dateRange);

        if (filteredQuotes.length === 0) {
            return {
                totalQuotes: 0,
                totalRevenue: 0,
                averageQuoteValue: 0,
                medianQuoteValue: 0,
                highestQuoteValue: 0,
                lowestQuoteValue: 0,
                conversionRate: 0,
                acceptanceRate: 0
            };
        }

        const values = filteredQuotes.map(q => q.totalHT).sort((a, b) => a - b);
        const totalRevenue = values.reduce((sum, v) => sum + v, 0);
        const acceptedCount = filteredQuotes.filter(q => q.status === 'Accepté' || q.status === 'Facturé').length;
        const sentCount = filteredQuotes.filter(q =>
            q.status === 'Envoyé' || q.status === 'Accepté' || q.status === 'Facturé' || q.status === 'Rejeté'
        ).length;

        return {
            totalQuotes: filteredQuotes.length,
            totalRevenue,
            averageQuoteValue: totalRevenue / filteredQuotes.length,
            medianQuoteValue: values[Math.floor(values.length / 2)],
            highestQuoteValue: Math.max(...values),
            lowestQuoteValue: Math.min(...values),
            conversionRate: filteredQuotes.length > 0 ? (acceptedCount / filteredQuotes.length) * 100 : 0,
            acceptanceRate: sentCount > 0 ? (acceptedCount / sentCount) * 100 : 0
        };
    }

    static calculateStatusStats(quotes: Quote[], dateRange: DateRange): QuoteStatusStats[] {
        const filteredQuotes = this.filterQuotesByDateRange(quotes, dateRange);
        const statusMap: Map<QuoteStatus, Quote[]> = new Map();

        filteredQuotes.forEach(quote => {
            if (!statusMap.has(quote.status)) {
                statusMap.set(quote.status, []);
            }
            statusMap.get(quote.status)!.push(quote);
        });

        const totalCount = filteredQuotes.length;
        const stats: QuoteStatusStats[] = [];

        statusMap.forEach((quotes, status) => {
            const totalValue = quotes.reduce((sum, q) => sum + q.totalHT, 0);

            stats.push({
                status,
                count: quotes.length,
                totalValue,
                percentage: totalCount > 0 ? (quotes.length / totalCount) * 100 : 0,
                averageValue: quotes.length > 0 ? totalValue / quotes.length : 0
            });
        });

        return stats;
    }

    static calculateConversionFunnel(quotes: Quote[], dateRange: DateRange): ConversionFunnel {
        const filteredQuotes = this.filterQuotesByDateRange(quotes, dateRange);

        const draft = filteredQuotes.filter(q => q.status === 'Brouillon' || q.status === 'En Attente').length;
        const sent = filteredQuotes.filter(q =>
            q.status === 'Envoyé' || q.status === 'Finalisé' || q.status === 'Accepté' || q.status === 'Facturé' || q.status === 'Rejeté'
        ).length;
        const accepted = filteredQuotes.filter(q => q.status === 'Accepté' || q.status === 'Facturé').length;
        const invoiced = filteredQuotes.filter(q => q.status === 'Facturé').length;

        return {
            draft,
            sent,
            accepted,
            invoiced,
            total: filteredQuotes.length,
            draftToSentRate: draft > 0 ? (sent / (draft + sent)) * 100 : 0,
            sentToAcceptedRate: sent > 0 ? (accepted / sent) * 100 : 0,
            acceptedToInvoicedRate: accepted > 0 ? (invoiced / accepted) * 100 : 0,
            overallConversionRate: filteredQuotes.length > 0 ? (accepted / filteredQuotes.length) * 100 : 0
        };
    }

    // ============================================================================
    // TEMPLATE ANALYTICS
    // ============================================================================

    static calculateTemplateStats(quotes: Quote[], dateRange: DateRange): TemplateStats[] {
        const filteredQuotes = this.filterQuotesByDateRange(quotes, dateRange);
        const templateMap: Map<string, Quote[]> = new Map();

        filteredQuotes.forEach(quote => {
            if (quote.templateId) {
                if (!templateMap.has(quote.templateId)) {
                    templateMap.set(quote.templateId, []);
                }
                templateMap.get(quote.templateId)!.push(quote);
            }
        });

        const stats: TemplateStats[] = [];

        templateMap.forEach((quotes, templateId) => {
            const totalRevenue = quotes.reduce((sum, q) => sum + q.totalHT, 0);
            const acceptedQuotes = quotes.filter(q => q.status === 'Accepté' || q.status === 'Facturé');
            const sortedByDate = [...quotes].sort((a, b) => b.date.localeCompare(a.date));

            stats.push({
                templateId,
                templateName: `Template ${templateId}`, // Would be replaced with actual template name
                usageCount: quotes.length,
                totalRevenue,
                averageQuoteValue: quotes.length > 0 ? totalRevenue / quotes.length : 0,
                acceptanceRate: quotes.length > 0 ? (acceptedQuotes.length / quotes.length) * 100 : 0,
                lastUsed: sortedByDate[0]?.date || ''
            });
        });

        return stats.sort((a, b) => b.usageCount - a.usageCount);
    }

    // ============================================================================
    // PREDICTIVE ANALYTICS
    // ============================================================================

    static generateForecasts(quotes: Quote[], periods: number = 3): Forecast[] {
        // Simple linear regression forecast
        const revenueByMonth: { [key: string]: number } = {};

        quotes.forEach(quote => {
            const month = quote.date.substring(0, 7); // YYYY-MM
            if (!revenueByMonth[month]) {
                revenueByMonth[month] = 0;
            }
            revenueByMonth[month] += quote.totalHT;
        });

        const months = Object.keys(revenueByMonth).sort();
        const values = months.map(m => revenueByMonth[m]);

        if (values.length < 2) {
            return [];
        }

        // Calculate average growth rate
        let totalGrowth = 0;
        for (let i = 1; i < values.length; i++) {
            if (values[i - 1] > 0) {
                totalGrowth += (values[i] - values[i - 1]) / values[i - 1];
            }
        }
        const avgGrowthRate = totalGrowth / (values.length - 1);

        const forecasts: Forecast[] = [];
        const lastValue = values[values.length - 1];
        const lastMonth = new Date(months[months.length - 1] + '-01');

        for (let i = 1; i <= periods; i++) {
            const futureMonth = new Date(lastMonth);
            futureMonth.setMonth(lastMonth.getMonth() + i);
            const predictedRevenue = lastValue * Math.pow(1 + avgGrowthRate, i);

            forecasts.push({
                period: futureMonth.toISOString().substring(0, 7),
                predictedRevenue,
                confidence: Math.max(20, 90 - (i * 15)), // Confidence decreases with distance
                trend: avgGrowthRate > 0.05 ? 'up' : avgGrowthRate < -0.05 ? 'down' : 'stable'
            });
        }

        return forecasts;
    }

    static calculateGrowthMetrics(quotes: Quote[]): GrowthMetrics {
        const now = new Date();

        // Month over month
        const thisMonth = this.filterQuotesByDateRange(quotes, {
            startDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0],
            endDate: now.toISOString().split('T')[0],
            label: 'This Month'
        });
        const lastMonth = this.filterQuotesByDateRange(quotes, {
            startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0],
            endDate: new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0],
            label: 'Last Month'
        });

        const thisMonthRevenue = thisMonth.reduce((sum, q) => sum + q.totalHT, 0);
        const lastMonthRevenue = lastMonth.reduce((sum, q) => sum + q.totalHT, 0);
        const monthOverMonth = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

        // Project annual based on average
        const last12Months = this.filterQuotesByDateRange(quotes, {
            startDate: new Date(now.getFullYear() - 1, now.getMonth(), 1).toISOString().split('T')[0],
            endDate: now.toISOString().split('T')[0],
            label: 'Last 12 Months'
        });
        const last12Revenue = last12Months.reduce((sum, q) => sum + q.totalHT, 0);

        return {
            monthOverMonth,
            quarterOverQuarter: 0, // Simplified
            yearOverYear: 0, // Simplified
            projectedAnnual: last12Revenue
        };
    }

    // ============================================================================
    // COMPREHENSIVE REPORT
    // ============================================================================

    static generateComprehensiveReport(
        quotes: Quote[],
        clients: Client[],
        dateRange: DateRange
    ): ComprehensiveReport {
        const revenueData = this.calculateRevenueData(quotes, 'month', dateRange);
        const clientStats = this.calculateClientStats(quotes, clients, dateRange);
        const quoteMetrics = this.calculateQuoteMetrics(quotes, dateRange);
        const topClients = clientStats.slice(0, 10);

        return {
            dateRange,
            generatedAt: new Date().toISOString(),

            summary: {
                totalRevenue: quoteMetrics.totalRevenue,
                totalQuotes: quoteMetrics.totalQuotes,
                averageQuoteValue: quoteMetrics.averageQuoteValue,
                conversionRate: quoteMetrics.conversionRate,
                topClient: topClients[0]?.clientName || 'N/A',
                topTemplate: 'N/A'
            },

            revenueData,
            revenueByStatus: this.calculateRevenueByStatus(quotes, dateRange),
            revenueTrend: this.calculateRevenueTrend(quotes, dateRange),

            clientStats,
            clientSegments: this.segmentClients(clientStats),
            topClients,

            quoteMetrics,
            statusStats: this.calculateStatusStats(quotes, dateRange),
            conversionFunnel: this.calculateConversionFunnel(quotes, dateRange),

            templateStats: this.calculateTemplateStats(quotes, dateRange),

            timeStats: [],
            peakAnalysis: {
                bestDay: '',
                bestWeek: '',
                bestMonth: '',
                peakRevenue: 0,
                peakQuotes: 0
            },

            forecasts: this.generateForecasts(quotes),
            growthMetrics: this.calculateGrowthMetrics(quotes)
        };
    }

    // ============================================================================
    // HELPER METHODS
    // ============================================================================

    private static getDateKey(date: string, period: ReportPeriod): string {
        const d = new Date(date);

        switch (period) {
            case 'day':
                return date;
            case 'week':
                const week = this.getWeekNumber(d);
                return `${d.getFullYear()}-W${week}`;
            case 'month':
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            case 'quarter':
                const quarter = Math.floor(d.getMonth() / 3) + 1;
                return `${d.getFullYear()}-Q${quarter}`;
            case 'year':
                return `${d.getFullYear()}`;
            default:
                return date;
        }
    }

    private static getWeekNumber(date: Date): number {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }
}
