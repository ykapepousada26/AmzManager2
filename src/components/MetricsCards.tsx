import React from 'react';
import { SaleOrder, DisplayCurrency, CountryId } from '../types';
import { AMAZON_MARKETPLACES } from '../data/marketplaces';
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingBag, 
  Globe2, 
  Sparkles,
  PieChart
} from 'lucide-react';

interface MetricsCardsProps {
  sales: SaleOrder[];
  displayCurrency: DisplayCurrency;
  selectedCountries: CountryId[];
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({
  sales,
  displayCurrency,
  selectedCountries,
}) => {
  // Calculate Totals based on selected display currency
  let totalGross = 0;
  let totalNet = 0;
  let totalUnits = 0;
  const activeCountriesSet = new Set<string>();

  sales.forEach((order) => {
    totalUnits += order.units;
    activeCountriesSet.add(order.countryId);

    const mkt = AMAZON_MARKETPLACES[order.countryId];

    if (displayCurrency === 'BRL') {
      totalGross += order.grossTotalBRL;
      totalNet += order.netRoyaltyBRL;
    } else if (displayCurrency === 'USD') {
      const rateUsd = mkt ? mkt.exchangeRateToUSD : 1;
      totalGross += order.grossTotal * rateUsd;
      totalNet += order.netRoyalty * rateUsd;
    } else if (displayCurrency === 'EUR') {
      const rateUsd = mkt ? mkt.exchangeRateToUSD : 1;
      // 1 EUR ~ 1.09 USD -> USD / 1.09
      totalGross += (order.grossTotal * rateUsd) / 1.09;
      totalNet += (order.netRoyalty * rateUsd) / 1.09;
    } else {
      // ORIGINAL
      totalGross += order.grossTotalBRL;
      totalNet += order.netRoyaltyBRL;
    }
  });

  const getCurrencySymbol = () => {
    if (displayCurrency === 'BRL') return 'R$';
    if (displayCurrency === 'USD') return '$';
    if (displayCurrency === 'EUR') return '€';
    return 'R$ (Convertido)';
  };

  const formatMoney = (val: number) => {
    return `${getCurrencySymbol()} ${val.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const netMargin = totalGross > 0 ? ((totalNet / totalGross) * 100).toFixed(1) : '0';
  const avgRoyaltyPerUnit = totalUnits > 0 ? (totalNet / totalUnits).toFixed(2) : '0';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {/* Gross Sales */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400">Receita Bruta Amazon</span>
          <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl lg:text-2xl font-black text-slate-100 tracking-tight">
          {formatMoney(totalGross)}
        </div>
        <div className="flex items-center text-[11px] text-slate-400 mt-2">
          <span className="text-emerald-400 font-bold flex items-center mr-1">
            <TrendingUp className="w-3 h-3 mr-0.5" /> +14.2%
          </span>
          vs período anterior
        </div>
      </div>

      {/* Net Royalties */}
      <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-4 shadow-lg hover:border-emerald-500/50 transition-all relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-emerald-400">Royalties Líquidos (Seu Lucro)</span>
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl lg:text-2xl font-black text-emerald-300 tracking-tight">
          {formatMoney(totalNet)}
        </div>
        <div className="flex items-center text-[11px] text-slate-400 mt-2">
          <span className="bg-emerald-500/10 text-emerald-300 font-bold px-1.5 py-0.5 rounded mr-1">
            {netMargin}% Margem
          </span>
          lucro direto retido
        </div>
      </div>

      {/* Units Sold */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400">Unidades Vendidas</span>
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <ShoppingBag className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl lg:text-2xl font-black text-slate-100 tracking-tight">
          {totalUnits.toLocaleString('pt-BR')} <span className="text-xs text-slate-400 font-normal">livros</span>
        </div>
        <div className="flex items-center text-[11px] text-slate-400 mt-2">
          <span className="font-semibold text-slate-300">
            Média: {getCurrencySymbol()} {avgRoyaltyPerUnit} / un
          </span>
        </div>
      </div>

      {/* Active Countries */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400">Países com Vendas</span>
          <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
            <Globe2 className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl lg:text-2xl font-black text-slate-100 tracking-tight">
          {activeCountriesSet.size} <span className="text-xs text-slate-400 font-normal">de 17 Países</span>
        </div>
        <div className="flex items-center text-[11px] text-slate-400 mt-2">
          <span className="text-purple-300 font-semibold">
            {((activeCountriesSet.size / 17) * 100).toFixed(0)}% cobertura global
          </span>
        </div>
      </div>

      {/* Orders Count */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400">Total de Pedidos</span>
          <div className="p-2 bg-slate-800 text-slate-300 rounded-xl border border-slate-700">
            <PieChart className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl lg:text-2xl font-black text-slate-100 tracking-tight">
          {sales.length} <span className="text-xs text-slate-400 font-normal">transações</span>
        </div>
        <div className="flex items-center text-[11px] text-slate-400 mt-2">
          <span className="text-slate-400">
            {selectedCountries.length < 17 ? `${selectedCountries.length} países filtrados` : 'Todos os 17 países'}
          </span>
        </div>
      </div>
    </div>
  );
};
