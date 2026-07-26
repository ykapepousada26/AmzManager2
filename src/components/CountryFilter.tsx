import React, { useState } from 'react';
import { CountryId } from '../types';
import { MARKETPLACE_LIST } from '../data/marketplaces';
import { Globe, Check, Layers, Filter } from 'lucide-react';

interface CountryFilterProps {
  selectedCountries: CountryId[];
  onToggleCountry: (countryId: CountryId) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  orderCountsByCountry: Record<CountryId, number>;
}

export const CountryFilter: React.FC<CountryFilterProps> = ({
  selectedCountries,
  onToggleCountry,
  onSelectAll,
  onClearAll,
  orderCountsByCountry,
}) => {
  const [activeRegion, setActiveRegion] = useState<string>('TODOS');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const isAllSelected = selectedCountries.length === MARKETPLACE_LIST.length;

  const filteredMarketplaces = MARKETPLACE_LIST.filter((mkt) => {
    const matchesRegion = activeRegion === 'TODOS' || mkt.region === activeRegion;
    const matchesSearch =
      mkt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mkt.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mkt.currency.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRegion && matchesSearch;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-5 shadow-lg mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-bold text-slate-100 text-sm md:text-base">
                Filtro por Países / Marketplaces Amazon (17)
              </h2>
              <span className="text-xs bg-amber-500/10 text-amber-300 font-semibold px-2.5 py-0.5 rounded-full border border-amber-500/30">
                {selectedCountries.length} de 17 Selecionados
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Selecione um ou múltiplos países para filtrar relatórios, receitas e royalties.
            </p>
          </div>
        </div>

        {/* Quick Select Buttons */}
        <div className="flex items-center space-x-2 self-start md:self-auto">
          <button
            onClick={onSelectAll}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              isAllSelected
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            Todos os 17 Países
          </button>
          <button
            onClick={onClearAll}
            disabled={selectedCountries.length === 0}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200 hover:bg-slate-700 transition-all disabled:opacity-40"
          >
            Limpar
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 my-3">
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
          {['TODOS', 'América', 'Europa', 'Ásia-Pacífico', 'Oriente Médio'].map((region) => (
            <button
              key={region}
              onClick={() => setActiveRegion(region)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                activeRegion === region
                  ? 'bg-slate-700 text-amber-300 border border-slate-600 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {region === 'TODOS' ? 'Todas Regiões' : region}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-48">
          <input
            type="text"
            placeholder="Buscar país..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>
      </div>

      {/* Marketplaces Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-9 gap-2 mt-2">
        {filteredMarketplaces.map((mkt) => {
          const isSelected = selectedCountries.includes(mkt.id);
          const count = orderCountsByCountry[mkt.id] || 0;

          return (
            <button
              key={mkt.id}
              onClick={() => onToggleCountry(mkt.id)}
              className={`relative flex flex-col items-start p-2.5 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-slate-800 border-amber-500/70 text-slate-100 shadow-md ring-1 ring-amber-500/30'
                  : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xl leading-none">{mkt.flag}</span>
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-800 text-slate-600 border border-slate-700'
                  }`}
                >
                  {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </span>
              </div>

              <div className="font-bold text-xs truncate w-full">{mkt.name}</div>

              <div className="flex items-center justify-between w-full text-[10px] text-slate-400 mt-1 pt-1 border-t border-slate-800/60">
                <span className="font-mono text-slate-400">{mkt.currencySymbol}</span>
                <span
                  className={`font-semibold px-1.5 py-0.5 rounded ${
                    count > 0 ? 'bg-amber-500/10 text-amber-300' : 'bg-slate-800/50 text-slate-500'
                  }`}
                >
                  {count} vendas
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
