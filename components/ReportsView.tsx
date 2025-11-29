import React, { useState, useMemo } from 'react';
import { Quote, Client } from '../types';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Area,
    AreaChart
} from 'recharts';
import {
    TrendingUp,
    TrendingDown,
    Minus,
    Download,
    Calendar,
    Users,
    FileText,
    DollarSign,
    Target,
    Award,
    Activity,
    Filter,
    ChevronDown
} from 'lucide-react';
import { ReportService } from '../services/reportService';
import { ExportService } from '../services/exportService';
import { ReportPeriod, DateRange } from '../types/report';

interface ReportsViewProps {
    quotes: Quote[];
    clients: Client[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const STATUS_COLORS: { [key: string]: string } = {
    'Brouillon': '#94a3b8',
    'En Attente': '#fbbf24',
    'Finalisé': '#3b82f6',
    'Envoyé': '#06b6d4',
    'Accepté': '#10b981',
    'Rejeté': '#ef4444',
    'Facturé': '#8b5cf6',
    'Perdu': '#64748b'
};

export const ReportsView: React.FC<ReportsViewProps> = ({ quotes, clients }) => {
    const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>('month');
    const [customDateRange, setCustomDateRange] = useState<{ start: string; end: string }>({
        start: '',
        end: ''
    });
    const [showExportMenu, setShowExportMenu] = useState(false);

    // Get date range based on selected period
    const dateRange = useMemo<DateRange>(() => {
        if (selectedPeriod === 'custom' && customDateRange.start && customDateRange.end) {
            return ReportService.getDateRange('custom', customDateRange.start, customDateRange.end);
        }
        return ReportService.getDateRange(selectedPeriod);
    }, [selectedPeriod, customDateRange]);

    // Generate comprehensive report
    const report = useMemo(() => {
        return ReportService.generateComprehensiveReport(quotes, clients, dateRange);
    }, [quotes, clients, dateRange]);

    // Format currency
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('ro-RO', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    // Format percentage
    const formatPercentage = (value: number) => {
        return `${value.toFixed(1)}%`;
    };

    // Render trend icon
    const renderTrendIcon = (trend: 'up' | 'down' | 'stable') => {
        switch (trend) {
            case 'up':
                return <TrendingUp className="w-5 h-5 text-green-500" />;
            case 'down':
                return <TrendingDown className="w-5 h-5 text-red-500" />;
            default:
                return <Minus className="w-5 h-5 text-gray-500" />;
        }
    };

    // Prepare chart data
    const revenueChartData = report.revenueData.map(item => ({
        name: item.period,
        'Chiffre d\'affaires HT': item.totalHT,
        'Chiffre d\'affaires TTC': item.totalTTC,
        'Nombre de devis': item.count
    }));

    const statusChartData = report.statusStats.map(item => ({
        name: item.status,
        value: item.count,
        totalValue: item.totalValue
    }));

    const funnelData = [
        { name: 'Brouillon', value: report.conversionFunnel.draft, fill: '#94a3b8' },
        { name: 'Envoyé', value: report.conversionFunnel.sent, fill: '#3b82f6' },
        { name: 'Accepté', value: report.conversionFunnel.accepted, fill: '#10b981' },
        { name: 'Facturé', value: report.conversionFunnel.invoiced, fill: '#8b5cf6' }
    ];

    const topClientsData = report.topClients.slice(0, 10).map(client => ({
        name: client.clientName.length > 20 ? client.clientName.substring(0, 20) + '...' : client.clientName,
        revenue: client.totalRevenue,
        quotes: client.quoteCount
    }));

    return (
        <div className="reports-view">
            {/* Header */}
            <div className="report-header">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Rapports & Analyses</h1>
                    <p className="text-gray-600">
                        Analyses détaillées de votre activité · {dateRange.label}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Period selector */}
                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <select
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value as ReportPeriod)}
                            className="bg-transparent border-none outline-none text-sm font-medium text-gray-700"
                        >
                            <option value="day">Aujourd'hui</option>
                            <option value="week">7 derniers jours</option>
                            <option value="month">30 derniers jours</option>
                            <option value="quarter">Trimestre</option>
                            <option value="year">Année</option>
                            <option value="custom">Personnalisé</option>
                        </select>
                    </div>

                    {/* Custom date range */}
                    {selectedPeriod === 'custom' && (
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={customDateRange.start}
                                onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                            />
                            <span className="text-gray-500">à</span>
                            <input
                                type="date"
                                value={customDateRange.end}
                                onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                            />
                        </div>
                    )}

                    {/* Export Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            className="btn btn-secondary flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Exporter
                            <ChevronDown className="w-4 h-4" />
                        </button>
                        {showExportMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowExportMenu(false)}
                                />
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20 overflow-hidden">
                                    <div className="py-1">
                                        <button
                                            onClick={() => {
                                                ExportService.exportReportToExcel(report);
                                                setShowExportMenu(false);
                                            }}
                                            className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                        >
                                            <span className="text-lg">📊</span>
                                            <div>
                                                <div className="font-medium text-gray-900 text-sm">Excel</div>
                                                <div className="text-xs text-gray-500">Rapport complet formaté</div>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => {
                                                ExportService.exportReportToJSON(report);
                                                setShowExportMenu(false);
                                            }}
                                            className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                        >
                                            <span className="text-lg">📋</span>
                                            <div>
                                                <div className="font-medium text-gray-900 text-sm">JSON</div>
                                                <div className="text-xs text-gray-500">Données structurées</div>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="kpi-grid">
                <div className="kpi-card">
                    <div className="kpi-header">
                        <div className="kpi-icon" style={{ backgroundColor: '#e0f2fe' }}>
                            <DollarSign className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="kpi-trend">
                            {renderTrendIcon(report.revenueTrend.trend)}
                            <span className={`text-sm font-medium ${report.revenueTrend.trend === 'up' ? 'text-green-600' :
                                report.revenueTrend.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                                }`}>
                                {formatPercentage(Math.abs(report.revenueTrend.changePercentage))}
                            </span>
                        </div>
                    </div>
                    <div className="kpi-value">{formatCurrency(report.summary.totalRevenue)}</div>
                    <div className="kpi-label">Chiffre d'affaires total</div>
                    <div className="kpi-subtitle text-gray-500 text-sm mt-1">
                        {formatCurrency(report.revenueTrend.previous)} période précédente
                    </div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-header">
                        <div className="kpi-icon" style={{ backgroundColor: '#dbeafe' }}>
                            <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                    <div className="kpi-value">{report.summary.totalQuotes}</div>
                    <div className="kpi-label">Devis créés</div>
                    <div className="kpi-subtitle text-gray-500 text-sm mt-1">
                        Moyenne: {formatCurrency(report.summary.averageQuoteValue)}
                    </div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-header">
                        <div className="kpi-icon" style={{ backgroundColor: '#d1fae5' }}>
                            <Target className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                    <div className="kpi-value">{formatPercentage(report.summary.conversionRate)}</div>
                    <div className="kpi-label">Taux de conversion</div>
                    <div className="kpi-subtitle text-gray-500 text-sm mt-1">
                        {report.conversionFunnel.accepted} devis acceptés
                    </div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-header">
                        <div className="kpi-icon" style={{ backgroundColor: '#fef3c7' }}>
                            <Award className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                    <div className="kpi-value">{report.summary.topClient}</div>
                    <div className="kpi-label">Meilleur client</div>
                    <div className="kpi-subtitle text-gray-500 text-sm mt-1">
                        {report.clientStats.length} clients actifs
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="charts-grid">
                {/* Revenue Trend */}
                <div className="chart-card chart-card-large">
                    <div className="chart-header">
                        <h3 className="chart-title">Évolution du chiffre d'affaires</h3>
                        <p className="chart-subtitle">Performance mensuelle HT/TTC</p>
                    </div>
                    <div className="chart-content">
                        <ResponsiveContainer width="100%" height={320}>
                            <AreaChart data={revenueChartData}>
                                <defs>
                                    <linearGradient id="colorHT" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorTTC" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                    }}
                                    formatter={(value: any) => formatCurrency(value)}
                                />
                                <Legend />
                                <Area
                                    type="monotone"
                                    dataKey="Chiffre d'affaires HT"
                                    stroke="#3b82f6"
                                    fillOpacity={1}
                                    fill="url(#colorHT)"
                                    strokeWidth={2}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="Chiffre d'affaires TTC"
                                    stroke="#10b981"
                                    fillOpacity={1}
                                    fill="url(#colorTTC)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Status Distribution */}
                <div className="chart-card">
                    <div className="chart-header">
                        <h3 className="chart-title">Répartition par statut</h3>
                        <p className="chart-subtitle">Distribution des devis</p>
                    </div>
                    <div className="chart-content">
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={statusChartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={(entry) => `${entry.name}: ${entry.value}`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {statusChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: any) => value} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Conversion Funnel */}
                <div className="chart-card">
                    <div className="chart-header">
                        <h3 className="chart-title">Tunnel de conversion</h3>
                        <p className="chart-subtitle">Parcours des devis</p>
                    </div>
                    <div className="chart-content">
                        <div className="funnel-container">
                            {funnelData.map((stage, index) => {
                                const percentage = report.conversionFunnel.total > 0
                                    ? (stage.value / report.conversionFunnel.total) * 100
                                    : 0;

                                return (
                                    <div key={stage.name} className="funnel-stage">
                                        <div className="funnel-bar-container">
                                            <div
                                                className="funnel-bar"
                                                style={{
                                                    width: `${percentage}%`,
                                                    backgroundColor: stage.fill,
                                                    minWidth: percentage > 0 ? '60px' : '0'
                                                }}
                                            >
                                                <span className="funnel-value">{stage.value}</span>
                                            </div>
                                        </div>
                                        <div className="funnel-label">
                                            <span className="funnel-name">{stage.name}</span>
                                            <span className="funnel-percentage">{percentage.toFixed(1)}%</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-600">Taux de conversion global:</span>
                                    <span className="ml-2 font-semibold text-green-600">
                                        {formatPercentage(report.conversionFunnel.overallConversionRate)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Envoyé → Accepté:</span>
                                    <span className="ml-2 font-semibold text-blue-600">
                                        {formatPercentage(report.conversionFunnel.sentToAcceptedRate)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Clients */}
                <div className="chart-card chart-card-large">
                    <div className="chart-header">
                        <h3 className="chart-title">Top 10 clients</h3>
                        <p className="chart-subtitle">Classement par chiffre d'affaires</p>
                    </div>
                    <div className="chart-content">
                        <ResponsiveContainer width="100%" height={320}>
                            <BarChart data={topClientsData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis type="number" stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <YAxis dataKey="name" type="category" stroke="#6b7280" style={{ fontSize: '12px' }} width={120} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px'
                                    }}
                                    formatter={(value: any, name: string) => {
                                        if (name === 'revenue') return formatCurrency(value);
                                        return value;
                                    }}
                                    labelFormatter={(label) => `Client: ${label}`}
                                />
                                <Legend />
                                <Bar dataKey="revenue" fill="#3b82f6" name="CA (€)" radius={[0, 8, 8, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Client Segments */}
                <div className="chart-card">
                    <div className="chart-header">
                        <h3 className="chart-title">Segmentation clients</h3>
                        <p className="chart-subtitle">Répartition par valeur</p>
                    </div>
                    <div className="chart-content">
                        <div className="space-y-4">
                            {report.clientSegments.map((segment, index) => {
                                const segmentLabels = {
                                    top: { label: 'Premium (Top 20%)', color: '#10b981', icon: '👑' },
                                    medium: { label: 'Standard (30%)', color: '#3b82f6', icon: '⭐' },
                                    low: { label: 'Occasionnel (50%)', color: '#94a3b8', icon: '💼' }
                                };

                                const info = segmentLabels[segment.segment];
                                const percentage = report.summary.totalRevenue > 0
                                    ? (segment.totalRevenue / report.summary.totalRevenue) * 100
                                    : 0;

                                return (
                                    <div key={segment.segment} className="segment-item">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl">{info.icon}</span>
                                                <span className="font-medium text-gray-900">{info.label}</span>
                                            </div>
                                            <span className="text-sm text-gray-600">{segment.count} clients</span>
                                        </div>
                                        <div className="segment-bar-bg">
                                            <div
                                                className="segment-bar"
                                                style={{
                                                    width: `${percentage}%`,
                                                    backgroundColor: info.color
                                                }}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between mt-1 text-sm">
                                            <span className="text-gray-600">{formatCurrency(segment.totalRevenue)}</span>
                                            <span className="font-semibold" style={{ color: info.color }}>
                                                {formatPercentage(percentage)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Quote Stats Table */}
                <div className="chart-card chart-card-large">
                    <div className="chart-header">
                        <h3 className="chart-title">Statistiques détaillées</h3>
                        <p className="chart-subtitle">Métriques par statut</p>
                    </div>
                    <div className="chart-content">
                        <div className="stats-table">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Statut</th>
                                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Nombre</th>
                                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Valeur totale</th>
                                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Valeur moyenne</th>
                                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">%</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.statusStats.map((stat) => (
                                        <tr key={stat.status} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-3 h-3 rounded-full"
                                                        style={{ backgroundColor: STATUS_COLORS[stat.status] || '#94a3b8' }}
                                                    />
                                                    <span className="font-medium text-gray-900">{stat.status}</span>
                                                </div>
                                            </td>
                                            <td className="text-right py-3 px-4 text-gray-700">{stat.count}</td>
                                            <td className="text-right py-3 px-4 font-medium text-gray-900">
                                                {formatCurrency(stat.totalValue)}
                                            </td>
                                            <td className="text-right py-3 px-4 text-gray-700">
                                                {formatCurrency(stat.averageValue)}
                                            </td>
                                            <td className="text-right py-3 px-4">
                                                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm font-medium">
                                                    {formatPercentage(stat.percentage)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Forecasts */}
                {report.forecasts.length > 0 && (
                    <div className="chart-card">
                        <div className="chart-header">
                            <h3 className="chart-title">Prévisions</h3>
                            <p className="chart-subtitle">Estimations futures</p>
                        </div>
                        <div className="chart-content">
                            <div className="space-y-3">
                                {report.forecasts.map((forecast) => (
                                    <div key={forecast.period} className="forecast-item">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium text-gray-700">{forecast.period}</span>
                                            <div className="flex items-center gap-2">
                                                {renderTrendIcon(forecast.trend)}
                                                <span className="text-sm text-gray-600">{forecast.confidence}% confiance</span>
                                            </div>
                                        </div>
                                        <div className="text-lg font-bold text-gray-900">
                                            {formatCurrency(forecast.predictedRevenue)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
        .reports-view {
          padding: 2rem;
          max-width: 1600px;
          margin: 0 auto;
        }

        .report-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .kpi-card {
          background: white;
          padding: 1.5rem;
          rounded: 12px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
        }

        .kpi-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .kpi-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .kpi-trend {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .kpi-value {
          font-size: 2rem;
          font-weight: bold;
          color: #111827;
          margin-bottom: 0.25rem;
        }

        .kpi-label {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(480px, 1fr));
          gap: 1.5rem;
        }

        .chart-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
        }

        .chart-card-large {
          grid-column: span 2;
        }

        .chart-header {
          margin-bottom: 1.5rem;
        }

        .chart-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 0.25rem;
        }

        .chart-subtitle {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .chart-content {
          position: relative;
        }

        .funnel-container {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .funnel-stage {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .funnel-bar-container {
          width: 100%;
          height: 48px;
          background: #f3f4f6;
          border-radius: 8px;
          overflow: hidden;
        }

        .funnel-bar {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: width 0.3s ease;
          border-radius: 8px;
        }

        .funnel-value {
          color: white;
          font-weight: 600;
          font-size: 1rem;
        }

        .funnel-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .funnel-name {
          font-weight: 500;
          color: #374151;
        }

        .funnel-percentage {
          font-weight: 600;
          color: #6b7280;
          font-size: 0.875rem;
        }

        .segment-item {
          padding: 1rem;
          background: #f9fafb;
          border-radius: 8px;
        }

        .segment-bar-bg {
          width: 100%;
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }

        .segment-bar {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .stats-table {
          overflow-x: auto;
        }

        .forecast-item {
          padding: 1rem;
          background: #f9fafb;
          border-radius: 8px;
        }

        @media (max-width: 1200px) {
          .chart-card-large {
            grid-column: span 1;
          }

          .charts-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    );
};
