import React, { useState } from 'react';
import { SaleOrder, DisplayCurrency, CountryId } from '../types';
import { AMAZON_MARKETPLACES } from '../data/marketplaces';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { BarChart2, PieChart as PieChartIcon, TrendingUp, Globe } from 'lucide-react';

interface SalesChartProps {
  sales: SaleOrder[];
  displayCurrency: DisplayCurrency;
}

export const SalesChart: React.FC<SalesChartProps> = ({ sales, displayCurrency }) => {
  const [chartType, setChartType] = useState<'country' | 'trend' | 'format'>('country');

  const getCurrencySymbol = () => {
    if (displayCurrency === 'BRL') return 'R$';
    if (displayCurrency === 'USD') return '$';
    if (displayCurrency === 'EUR') return '€';
    return 'R$';
  };

  const getConvertedValue = (order: SaleOrder) => {
    const mkt = AMAZON_MARKETPLACES[order.countryId];
    if (displayCurrency === 'BRL') return order.netRoyaltyBRL;
    if (displayCurrency === 'USD') return order.netRoyalty * (mkt ? mkt.exchangeRateToUSD : 1);
    if (displayCurrency === 'EUR') return (order.netRoyalty * (mkt ? mkt.exchangeRateToUSD : 1)) / 1.09;
    return order.netRoyaltyBRL;
  };

  // 1. Data by Country
  const countryDataMap: Record<string, { country: string; flag: string; royalty: number; units: number }> = {};

  sales.forEach((order) => {
    const mkt = AMAZON_MARKETPLACES[order.countryId];
    const key = order.countryId;
    if (!countryDataMap[key]) {
      countryDataMap[key] = {
        country: mkt ? mkt.name : order.countryId,
        flag: mkt ? mkt.flag : '🌐',
        royalty: 0,
        units: 0,
      };
    }
    countryDataMap[key].royalty += getConvertedValue(order);
    countryDataMap[key].units += order.units;
  });

  const countryChartData = Object.values(countryDataMap)
    .map((item) => ({
      name: `${item.flag} ${item.country}`,
      royalty: Number(item.royalty.toFixed(2)),
      units: item.units,
    }))
    .sort((a, b) => b.royalty - a.royalty);

  // 2. Data by Date Trend
  const dateDataMap: Record<string, { date: string; royalty: number; units: number }> = {};
  sales.forEach((order) => {
    const d = order.date;
    if (!dateDataMap[d]) {
      dateDataMap[d] = { date: d, royalty: 0, units: 0 };
    }
    dateDataMap[d].royalty += getConvertedValue(order);
    dateDataMap[d].units += order.units;
  });

  const trendChartData = Object.values(dateDataMap)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((item) => ({
      date: item.date.slice(5), // MM-DD
      royalty: Number(item.royalty.toFixed(2)),
      units: item.units,
    }));

  // 3. Data by Format
  const formatDataMap: Record<string, { name: string; royalty: number; units: number }> = {};
  sales.forEach((order) => {
    const fmt = order.format || 'Ebook';
    if (!formatDataMap[fmt]) {
      formatDataMap[fmt] = { name: fmt, royalty: 0, units: 0 };
    }
    formatDataMap[fmt].royalty += getConvertedValue(order);
    formatDataMap[fmt].units += order.units;
  });

  const formatChartData = Object.values(formatDataMap).map((item) => ({
    name: item.name,
    value: Number(item.royalty.toFixed(2)),
    units: item.units,
  }));

  const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#6366f1'];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-sm md:text-base font-bold text-slate-100 flex items-center space-x-2">
            <BarChart2 className="w-5 h-5 text-amber-400" />
            <span>Análise Gráfica de Desempenho Global</span>
          </h3>
          <p className="text-xs text-slate-400">
            Royalties e vendas por país, formato de livro e linha do tempo.
          </p>
        </div>

        {/* Toggle Chart View */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setChartType('country')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              chartType === 'country'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Por País</span>
          </button>
          <button
            onClick={() => setChartType('trend')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              chartType === 'trend'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Evolução</span>
          </button>
          <button
            onClick={() => setChartType('format')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              chartType === 'format'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PieChartIcon className="w-3.5 h-3.5" />
            <span>Por Formato</span>
          </button>
        </div>
      </div>

      <div className="h-72 w-full mt-4">
        {chartType === 'country' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={countryChartData} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="name"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                interval={0}
                angle={-35}
                textAnchor="end"
              />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#f8fafc',
                  fontSize: '12px',
                }}
                formatter={(val: any) => [`${getCurrencySymbol()} ${val}`, 'Royalties Líquidos']}
              />
              <Bar dataKey="royalty" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Royalties Líquidos" />
            </BarChart>
          </ResponsiveContainer>
        )}

        {chartType === 'trend' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendChartData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
              <defs>
                <linearGradient id="colorRoyalty" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#f8fafc',
                  fontSize: '12px',
                }}
                formatter={(val: any) => [`${getCurrencySymbol()} ${val}`, 'Lucro em Royalties']}
              />
              <Area
                type="monotone"
                dataKey="royalty"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRoyalty)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {chartType === 'format' && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={formatChartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {formatChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#f8fafc',
                  fontSize: '12px',
                }}
                formatter={(val: any) => [`${getCurrencySymbol()} ${val}`, 'Total Royalties']}
              />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
