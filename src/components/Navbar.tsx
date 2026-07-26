import React from 'react';
import { 
  BookOpen, 
  RefreshCw, 
  PlusCircle, 
  Settings, 
  Globe, 
  CheckCircle2, 
  AlertCircle,
  Download,
  Home,
  LayoutDashboard
} from 'lucide-react';
import { DisplayCurrency, AmazonApiConfig } from '../types';

interface NavbarProps {
  apiConfig: AmazonApiConfig;
  onOpenConfig: () => void;
  onOpenAddBook: () => void;
  onOpenAddSale: () => void;
  onSync: () => void;
  isSyncing: boolean;
  displayCurrency: DisplayCurrency;
  onChangeCurrency: (curr: DisplayCurrency) => void;
  onExportCsv: () => void;
  activeTab: 'home' | 'dashboard' | 'sales' | 'books' | 'countries';
  setActiveTab: (tab: 'home' | 'dashboard' | 'sales' | 'books' | 'countries') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  apiConfig,
  onOpenConfig,
  onOpenAddBook,
  onOpenAddSale,
  onSync,
  isSyncing,
  displayCurrency,
  onChangeCurrency,
  onExportCsv,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & App Title */}
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="p-2 bg-amber-500 text-slate-950 rounded-xl shadow-lg font-bold group-hover:bg-amber-400 transition-colors">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-lg tracking-tight text-slate-100">
                  BookSales <span className="text-amber-400 font-extrabold">Amazon</span>
                </h1>
                <span className="text-xs bg-slate-800 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-medium">
                  SP-API 17 Países
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Controle global de vendas &amp; royalties de livros
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              id="nav-tab-home"
              onClick={() => setActiveTab('home')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'home'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Início</span>
            </button>
            <button
              id="nav-tab-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Painel</span>
            </button>
            <button
              id="nav-tab-sales"
              onClick={() => setActiveTab('sales')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'sales'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              Vendas &amp; Pedidos
            </button>
            <button
              id="nav-tab-books"
              onClick={() => setActiveTab('books')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'books'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              Catálogo de Livros
            </button>
            <button
              id="nav-tab-countries"
              onClick={() => setActiveTab('countries')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'countries'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              17 Países
            </button>
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Direct Painel Access Button when not on dashboard */}
            {activeTab !== 'dashboard' && (
              <button
                id="btn-navbar-access-painel"
                onClick={() => setActiveTab('dashboard')}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition-all shadow-sm"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Acessar Painel</span>
              </button>
            )}

            {/* Currency Switcher */}
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
              <span className="px-2 text-slate-400 font-medium hidden lg:inline">Exibir em:</span>
              <button
                onClick={() => onChangeCurrency('BRL')}
                className={`px-2 py-1 rounded font-bold transition-all ${
                  displayCurrency === 'BRL'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Converter para Reais (R$)"
              >
                R$ BRL
              </button>
              <button
                onClick={() => onChangeCurrency('USD')}
                className={`px-2 py-1 rounded font-bold transition-all ${
                  displayCurrency === 'USD'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Converter para Dólares ($)"
              >
                $ USD
              </button>
              <button
                onClick={() => onChangeCurrency('EUR')}
                className={`px-2 py-1 rounded font-bold transition-all ${
                  displayCurrency === 'EUR'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Converter para Euros (€)"
              >
                € EUR
              </button>
            </div>

            {/* Sync Button */}
            <button
              onClick={onSync}
              disabled={isSyncing}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 transition-all disabled:opacity-50"
              title="Sincronizar Vendas com Amazon API"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isSyncing ? 'Sincronizando...' : 'Sincronizar'}</span>
            </button>

            {/* Amazon API Status Indicator */}
            <button
              onClick={onOpenConfig}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                apiConfig.isConnected
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
                  : 'bg-red-950/60 border-red-500/40 text-red-300 hover:bg-red-900/60'
              }`}
              title="Configurações da API Amazon SP-API"
            >
              {apiConfig.isConnected ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden xl:inline">API Conectada</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                  <span className="hidden xl:inline">Desconectada</span>
                </>
              )}
              <Settings className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-2 py-1 font-semibold rounded ${
              activeTab === 'home' ? 'text-amber-400 bg-slate-800' : 'text-slate-400'
            }`}
          >
            Início
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-2 py-1 font-semibold rounded ${
              activeTab === 'dashboard' ? 'text-amber-400 bg-slate-800' : 'text-slate-400'
            }`}
          >
            Painel
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-2 py-1 font-semibold rounded ${
              activeTab === 'sales' ? 'text-amber-400 bg-slate-800' : 'text-slate-400'
            }`}
          >
            Vendas
          </button>
          <button
            onClick={() => setActiveTab('books')}
            className={`px-2 py-1 font-semibold rounded ${
              activeTab === 'books' ? 'text-amber-400 bg-slate-800' : 'text-slate-400'
            }`}
          >
            Livros
          </button>
          <button
            onClick={() => setActiveTab('countries')}
            className={`px-2 py-1 font-semibold rounded ${
              activeTab === 'countries' ? 'text-amber-400 bg-slate-800' : 'text-slate-400'
            }`}
          >
            17 Países
          </button>
        </div>
      </div>
    </header>
  );
};

