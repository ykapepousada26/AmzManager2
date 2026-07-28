import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Globe2, 
  TrendingUp, 
  DollarSign, 
  Sparkles, 
  ArrowRight, 
  RefreshCw, 
  CheckCircle2, 
  Layers, 
  BarChart3, 
  ShieldCheck, 
  PlusCircle, 
  Globe, 
  Coins, 
  Zap,
  ShoppingBag
} from 'lucide-react';
import { Book, SaleOrder, DisplayCurrency, AmazonApiConfig } from '../types';
import { MARKETPLACE_LIST } from '../data/marketplaces';

interface HomePageProps {
  books: Book[];
  sales: SaleOrder[];
  displayCurrency: DisplayCurrency;
  apiConfig: AmazonApiConfig;
  isSyncing: boolean;
  onSync: () => void;
  onGoToDashboard: () => void;
  onGoToSales: () => void;
  onGoToBooks: () => void;
  onGoToCountries: () => void;
  onOpenAddBook: () => void;
  onOpenAddSale: () => void;
  onOpenConfig: () => void;
  onOpenCsvImport?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  books,
  sales,
  displayCurrency,
  apiConfig,
  isSyncing,
  onSync,
  onGoToDashboard,
  onGoToSales,
  onGoToBooks,
  onGoToCountries,
  onOpenAddBook,
  onOpenAddSale,
  onOpenConfig,
  onOpenCsvImport,
}) => {
  // Calculate quick metrics for summary cards
  const totalUnits = sales.reduce((acc, curr) => acc + curr.units, 0);

  // Royalty in BRL
  const totalRoyaltyBRL = sales.reduce((acc, curr) => acc + curr.netRoyaltyBRL, 0);
  const totalGrossBRL = sales.reduce((acc, curr) => acc + curr.grossTotalBRL, 0);

  // Get active country count from sales
  const activeCountriesCount = new Set(sales.map((s) => s.countryId)).size;

  const currencySymbolMap: Record<DisplayCurrency, string> = {
    BRL: 'R$',
    USD: '$',
    EUR: '€',
    ORIGINAL: 'R$',
  };

  const currentCurrencySymbol = currencySymbolMap[displayCurrency];

  const formatCurrency = (amountBRL: number) => {
    if (displayCurrency === 'USD') {
      const usdAmount = amountBRL / 5.60;
      return `$ ${usdAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (displayCurrency === 'EUR') {
      const eurAmount = amountBRL / 6.10;
      return `€ ${eurAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `R$ ${amountBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div id="home-page-container" className="space-y-10 py-2 animate-fade-in">
      {/* Hero Banner Section */}
      <section id="hero-banner" className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 p-8 md:p-12 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Plataforma Inteligente KDP Author Hub &amp; SP-API</span>
          </div>

          <h1 id="hero-title" className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Gestão Global de Vendas e Royalties Amazon em <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">17 Países</span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
            Monitore suas vendas de e-books, capa comum e capa dura com conversão automática de moedas (USD, EUR, GBP, JPY para BRL), cálculo de margens KDP e dados consolidados em tempo real.
          </p>

          {/* Primary Action Button Bar */}
          <div id="hero-action-bar" className="pt-4 flex flex-wrap items-center gap-4">
            {/* Direct Dashboard Access Button */}
            <button
              id="btn-access-dashboard-primary"
              onClick={onGoToDashboard}
              className="flex items-center space-x-3 px-7 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base rounded-2xl shadow-xl shadow-amber-500/20 hover:shadow-amber-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <LayoutDashboard className="w-5 h-5 stroke-[2.5]" />
              <span>Acessar Painel Principal</span>
              <ArrowRight className="w-5 h-5 ml-1" />
            </button>

            {/* Secondary Buttons */}
            <button
              id="btn-access-books"
              onClick={onGoToBooks}
              className="flex items-center space-x-2 px-5 py-4 bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm rounded-2xl transition-all"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Ver Catálogo ({books.length})</span>
            </button>

            <button
              id="btn-sync-home"
              onClick={onSync}
              disabled={isSyncing}
              className="flex items-center space-x-2 px-5 py-4 bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm rounded-2xl transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Amazon'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Snapshot Counters */}
      <section id="snapshot-metrics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Net Royalties */}
        <div id="card-snapshot-royalties" className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Royalties Líquidos</span>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {formatCurrency(totalRoyaltyBRL)}
            </h3>
            <p className="text-xs text-emerald-400 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Lucro líquido consolidado
            </p>
          </div>
        </div>

        {/* Total Units Sold */}
        <div id="card-snapshot-units" className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Unidades Vendidas</span>
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {totalUnits.toLocaleString('pt-BR')} <span className="text-base text-slate-400 font-normal">livros</span>
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-1">
              {sales.length} pedidos em histórico
            </p>
          </div>
        </div>

        {/* Global Marketplaces */}
        <div id="card-snapshot-countries" className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Presença Global</span>
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
              <Globe2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {activeCountriesCount} <span className="text-base text-slate-400 font-normal">de 17 Países</span>
            </h3>
            <p className="text-xs text-blue-400 font-medium mt-1">
              Lojas Amazon ativas no catálogo
            </p>
          </div>
        </div>

        {/* Books in Catalog */}
        <div id="card-snapshot-catalog" className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Títulos no Catálogo</span>
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {books.length} <span className="text-base text-slate-400 font-normal">obras</span>
            </h3>
            <p className="text-xs text-purple-400 font-medium mt-1">
              Formatos Ebook, Capa Comum e Capa Dura
            </p>
          </div>
        </div>
      </section>

      {/* Quick Navigation Cards & Direct Access Banner */}
      <section id="quick-navigation-grid" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Painel Analytics Card */}
        <div id="nav-card-dashboard" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-amber-500/50 transition-all">
          <div className="space-y-3">
            <div className="p-3 bg-amber-500/10 text-amber-400 w-fit rounded-xl">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Painel Geral Analytics</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Gráficos de evolução temporal, distribuição geográfica por país, métricas de ticket médio e taxas da Amazon.
            </p>
          </div>
          <button
            id="btn-goto-dashboard-card"
            onClick={onGoToDashboard}
            className="mt-6 w-full flex items-center justify-center space-x-2 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all"
          >
            <span>Abrir Painel Analytics</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Vendas & Pedidos Card */}
        <div id="nav-card-sales" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-amber-500/50 transition-all">
          <div className="space-y-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 w-fit rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Vendas &amp; Relatório de Pedidos</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Tabela detalhada de transações por Amazon Order ID, filtros por marketplace, livro e exportação em CSV.
            </p>
          </div>
          <button
            id="btn-goto-sales-card"
            onClick={onGoToSales}
            className="mt-6 w-full flex items-center justify-center space-x-2 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl border border-slate-700 transition-all"
          >
            <span>Ver Registro de Vendas</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 17 Países Amazon Card */}
        <div id="nav-card-countries" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-amber-500/50 transition-all">
          <div className="space-y-3">
            <div className="p-3 bg-blue-500/10 text-blue-400 w-fit rounded-xl">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Desempenho por 17 Países</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Detalhamento de participação por loja Amazon (EUA, Brasil, Alemanha, Japão, Canadá, Reino Unido, etc.).
            </p>
          </div>
          <button
            id="btn-goto-countries-card"
            onClick={onGoToCountries}
            className="mt-6 w-full flex items-center justify-center space-x-2 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl border border-slate-700 transition-all"
          >
            <span>Explorar Lojas Globais</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Platform Features Highlight */}
      <section id="platform-features" className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Recursos de Gestão KDP e SP-API
            </h2>
            <p className="text-slate-400 text-sm">
              Ferramentas desenvolvidas para autores independentes e editoras digitais
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenAddSale}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl flex items-center space-x-1.5 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Registrar Venda</span>
            </button>
            <button
              onClick={onOpenAddBook}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Novo Livro</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2">
            <Coins className="w-5 h-5 text-amber-400" />
            <h4 className="font-bold text-white text-sm">Conversão Multi-Moedas</h4>
            <p className="text-slate-400 text-xs">
              Converte automaticamente royalties em USD, EUR, GBP, JPY, CAD para Reais (BRL) usando taxas oficiais atualizadas.
            </p>
          </div>

          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2">
            <Zap className="w-5 h-5 text-emerald-400" />
            <h4 className="font-bold text-white text-sm">Amazon SP-API Direct</h4>
            <p className="text-slate-400 text-xs">
              Integração via proxy com a Selling Partner API da Amazon para recebimento instantâneo de pedidos e relatórios de royalties.
            </p>
          </div>

          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2">
            <Layers className="w-5 h-5 text-blue-400" />
            <h4 className="font-bold text-white text-sm">Custo de Impressão &amp; Taxas</h4>
            <p className="text-slate-400 text-xs">
              Cálculo exato de deduções da Amazon (35% / 70% KDP + custo de impressão por página para capas comuns e duras).
            </p>
          </div>

          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
            <h4 className="font-bold text-white text-sm">Exportação de Relatórios</h4>
            <p className="text-slate-400 text-xs">
              Exporte todo o seu histórico de pedidos com filtros de data e país em formato CSV para contabilidade e IRPF.
            </p>
          </div>
        </div>
      </section>

      {/* Marketplaces Grid Preview */}
      <section id="marketplaces-grid" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Globe className="w-5 h-5 text-amber-400" />
            <span>17 Lojas Amazon Conectadas</span>
          </h2>
          <button
            onClick={onGoToCountries}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center space-x-1"
          >
            <span>Ver Análise Detalhada</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {MARKETPLACE_LIST.map((mkt) => {
            const countrySales = sales.filter((s) => s.countryId === mkt.id);
            const countryUnits = countrySales.reduce((acc, curr) => acc + curr.units, 0);

            return (
              <div
                key={mkt.id}
                onClick={onGoToCountries}
                className="bg-slate-900/80 border border-slate-800/80 hover:border-amber-500/40 p-3 rounded-xl flex items-center space-x-3 cursor-pointer transition-all hover:bg-slate-800/60"
              >
                <span className="text-2xl">{mkt.flag}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-200 truncate">{mkt.name}</div>
                  <div className="text-[11px] text-slate-400">
                    {countryUnits > 0 ? `${countryUnits} un. vendidas` : 'Sem vendas'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA Access Banner */}
      <section id="bottom-cta-banner" className="bg-amber-500 text-slate-950 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-2xl font-black tracking-tight">Pronto para analisar seus dados de vendas?</h3>
          <p className="text-slate-900 text-sm font-medium max-w-xl">
            Acesse o painel completo com gráficos interativos de faturamento, rankings de vendas por título e histórico de transações.
          </p>
        </div>
        <button
          id="btn-access-dashboard-bottom"
          onClick={onGoToDashboard}
          className="px-8 py-4 bg-slate-950 hover:bg-slate-900 text-white font-bold text-base rounded-xl shadow-xl flex items-center space-x-3 transition-all shrink-0"
        >
          <LayoutDashboard className="w-5 h-5 text-amber-400" />
          <span>Acessar Painel Agora</span>
          <ArrowRight className="w-5 h-5 text-amber-400" />
        </button>
      </section>
    </div>
  );
};
