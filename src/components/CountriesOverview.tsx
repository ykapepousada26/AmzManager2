import React from 'react';
import { SaleOrder, DisplayCurrency, CountryId } from '../types';
import { MARKETPLACE_LIST } from '../data/marketplaces';
import { Globe, ArrowRight, TrendingUp, DollarSign } from 'lucide-react';

interface CountriesOverviewProps {
  sales: SaleOrder[];
  displayCurrency: DisplayCurrency;
  onSelectCountryOnly: (countryId: CountryId) => void;
}

export const CountriesOverview: React.FC<CountriesOverviewProps> = ({
  sales,
  displayCurrency,
  onSelectCountryOnly,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg p-5 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <Globe className="w-5 h-5 text-amber-400" />
            <span>Desempenho Detalhado por País (17 Lojas Amazon)</span>
          </h3>
          <p className="text-xs text-slate-400">
            Acompanhamento individualizado de vendas, faturamento e conversão cambial por país.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-5">
        {MARKETPLACE_LIST.map((mkt) => {
          // Calculate country sales stats
          const countrySales = sales.filter((s) => s.countryId === mkt.id);
          const totalUnits = countrySales.reduce((acc, s) => acc + s.units, 0);
          const totalGrossLocal = countrySales.reduce((acc, s) => acc + s.grossTotal, 0);
          const totalNetLocal = countrySales.reduce((acc, s) => acc + s.netRoyalty, 0);
          const totalNetBrl = countrySales.reduce((acc, s) => acc + s.netRoyaltyBRL, 0);

          return (
            <div
              key={mkt.id}
              className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all hover:shadow-lg group"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{mkt.flag}</span>
                    <div>
                      <h4 className="font-bold text-sm text-slate-100">{mkt.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">{mkt.domain}</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-900 text-amber-400 border border-slate-800">
                    {mkt.currency}
                  </span>
                </div>

                {/* Metrics */}
                <div className="space-y-2 my-3 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Unidades Vendidas:</span>
                    <span className="font-bold text-slate-200">{totalUnits} un.</span>
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>Receita Bruta ({mkt.currency}):</span>
                    <span className="font-semibold text-slate-300">
                      {mkt.currencySymbol} {totalGrossLocal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between text-emerald-400 font-bold pt-1 border-t border-slate-800">
                    <span>Royalties Líquidos:</span>
                    <span>
                      {mkt.currencySymbol} {totalNetLocal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-400 text-right">
                    ≈ R$ {totalNetBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} em BRL
                  </div>
                </div>
              </div>

              {/* Action */}
              <button
                onClick={() => onSelectCountryOnly(mkt.id)}
                className="w-full mt-2 py-2 bg-slate-900 group-hover:bg-amber-500 group-hover:text-slate-950 text-slate-300 font-bold rounded-xl text-xs transition-all flex items-center justify-center space-x-1 border border-slate-800 group-hover:border-amber-400"
              >
                <span>Filtrar Apenas {mkt.name}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
