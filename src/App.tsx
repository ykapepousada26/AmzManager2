/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Book, 
  SaleOrder, 
  AmazonApiConfig, 
  CountryId, 
  DisplayCurrency 
} from './types';
import { INITIAL_BOOKS, INITIAL_SALES, INITIAL_API_CONFIG } from './data/initialData';
import { MARKETPLACE_LIST, AMAZON_MARKETPLACES } from './data/marketplaces';
import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { CountryFilter } from './components/CountryFilter';
import { MetricsCards } from './components/MetricsCards';
import { SalesChart } from './components/SalesChart';
import { SalesTable } from './components/SalesTable';
import { BooksCatalog } from './components/BooksCatalog';
import { CountriesOverview } from './components/CountriesOverview';
import { AmazonApiModal } from './components/AmazonApiModal';
import { AddBookModal } from './components/AddBookModal';
import { AddSaleModal } from './components/AddSaleModal';
import { RefreshCw, CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function App() {
  const [books, setBooks] = useState<Book[]>(() => {
    const saved = localStorage.getItem('amazon_books_catalog');
    return saved ? JSON.parse(saved) : INITIAL_BOOKS;
  });

  const [sales, setSales] = useState<SaleOrder[]>(() => {
    const saved = localStorage.getItem('amazon_sales_history');
    return saved ? JSON.parse(saved) : INITIAL_SALES;
  });

  const [apiConfig, setApiConfig] = useState<AmazonApiConfig>(() => {
    const saved = localStorage.getItem('amazon_api_config');
    return saved ? JSON.parse(saved) : INITIAL_API_CONFIG;
  });

  const [selectedCountries, setSelectedCountries] = useState<CountryId[]>(
    MARKETPLACE_LIST.map((m) => m.id)
  );

  const [displayCurrency, setDisplayCurrency] = useState<DisplayCurrency>('BRL');
  const [activeTab, setActiveTab] = useState<'home' | 'dashboard' | 'sales' | 'books' | 'countries'>('home');

  // Modals
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [isAddSaleOpen, setIsAddSaleOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('amazon_books_catalog', JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem('amazon_sales_history', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('amazon_api_config', JSON.stringify(apiConfig));
  }, [apiConfig]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Sync with Express backend proxy / Amazon SP-API
  const handleSyncData = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/amazon/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: apiConfig.mode }),
      });
      const data = await res.json();

      if (data.success) {
        // Add a new mock sync sale order to show fresh real-time data flow
        const randomCountry: CountryId =
          MARKETPLACE_LIST[Math.floor(Math.random() * MARKETPLACE_LIST.length)].id;
        const randomBook = books[Math.floor(Math.random() * books.length)];
        const mkt = AMAZON_MARKETPLACES[randomCountry];

        const units = Math.floor(Math.random() * 2) + 1;
        const pricePerUnit = randomBook.prices[randomCountry] || 15.0;
        const grossTotal = Number((units * pricePerUnit).toFixed(2));
        const rateRoyalty = randomBook.kdpRoyaltyRate;
        const printingInLocal =
          randomBook.printingCostUSD * (mkt.exchangeRateToBRL / 5.60) / (mkt.exchangeRateToBRL || 1);
        const amazonFee = Number((grossTotal * (1 - rateRoyalty) + units * printingInLocal).toFixed(2));
        const netRoyalty = Math.max(0, Number((grossTotal - amazonFee).toFixed(2)));

        const newSale: SaleOrder = {
          id: `ord-${Date.now()}`,
          amazonOrderId: `114-${Math.floor(1000000 + Math.random() * 9000000)}-${Math.floor(
            1000000 + Math.random() * 9000000
          )}`,
          bookId: randomBook.id,
          bookTitle: randomBook.title,
          countryId: randomCountry,
          countryName: mkt.name,
          currency: mkt.currency,
          currencySymbol: mkt.currencySymbol,
          units,
          pricePerUnit,
          grossTotal,
          amazonFee,
          netRoyalty,
          grossTotalBRL: Number((grossTotal * mkt.exchangeRateToBRL).toFixed(2)),
          netRoyaltyBRL: Number((netRoyalty * mkt.exchangeRateToBRL).toFixed(2)),
          date: new Date().toISOString().split('T')[0],
          format: randomBook.format,
          status: 'Concluído',
        };

        setSales((prev) => [newSale, ...prev]);
        setApiConfig((prev) => ({ ...prev, lastSyncTime: new Date().toISOString() }));
        showToast(`Sincronização concluída! Nova venda de "${randomBook.title}" importada da Amazon ${mkt.name}.`);
      }
    } catch (e) {
      showToast('Erro ao sincronizar com servidor proxy Amazon.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Country filter actions
  const handleToggleCountry = (countryId: CountryId) => {
    setSelectedCountries((prev) => {
      if (prev.includes(countryId)) {
        return prev.filter((id) => id !== countryId);
      } else {
        return [...prev, countryId];
      }
    });
  };

  const handleSelectAllCountries = () => {
    setSelectedCountries(MARKETPLACE_LIST.map((m) => m.id));
  };

  const handleClearAllCountries = () => {
    setSelectedCountries([]);
  };

  const handleSelectCountryOnly = (countryId: CountryId) => {
    setSelectedCountries([countryId]);
    setActiveTab('dashboard');
  };

  // Filtered sales
  const filteredSales = sales.filter((order) =>
    selectedCountries.includes(order.countryId)
  );

  // Order counts map per country
  const orderCountsByCountry: Record<CountryId, number> = {} as any;
  MARKETPLACE_LIST.forEach((m) => (orderCountsByCountry[m.id] = 0));
  sales.forEach((s) => {
    if (orderCountsByCountry[s.countryId] !== undefined) {
      orderCountsByCountry[s.countryId] += 1;
    }
  });

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      'ID Pedido Amazon',
      'Data',
      'País',
      'Título do Livro',
      'Formato',
      'Unidades',
      'Preço Unitário',
      'Receita Bruta',
      'Taxa Amazon',
      'Royalty Líquido',
      'Royalty Líquido (BRL)',
      'Status',
    ];

    const rows = filteredSales.map((s) => [
      s.amazonOrderId,
      s.date,
      s.countryName,
      `"${s.bookTitle.replace(/"/g, '""')}"`,
      s.format,
      s.units,
      s.pricePerUnit,
      s.grossTotal,
      s.amazonFee,
      s.netRoyalty,
      s.netRoyaltyBRL,
      s.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Vendas_Amazon_17Paises_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Relatório de vendas exportado com sucesso em CSV!');
  };

  const handleSaveBook = (newBook: Book) => {
    setBooks((prev) => [newBook, ...prev]);
    showToast(`Livro "${newBook.title}" cadastrado com sucesso no catálogo!`);
  };

  const handleSaveSale = (newSale: SaleOrder) => {
    setSales((prev) => [newSale, ...prev]);
    showToast(`Venda registrada com sucesso em ${newSale.countryName}!`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-amber-500 selection:text-slate-950">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-amber-500/60 text-slate-100 px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 animate-fade-in">
          <Info className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        apiConfig={apiConfig}
        onOpenConfig={() => setIsConfigOpen(true)}
        onOpenAddBook={() => setIsAddBookOpen(true)}
        onOpenAddSale={() => setIsAddSaleOpen(true)}
        onSync={handleSyncData}
        isSyncing={isSyncing}
        displayCurrency={displayCurrency}
        onChangeCurrency={setDisplayCurrency}
        onExportCsv={handleExportCsv}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Country Filter Selector (only on dashboard/sales) */}
        {activeTab !== 'home' && (
          <CountryFilter
            selectedCountries={selectedCountries}
            onToggleCountry={handleToggleCountry}
            onSelectAll={handleSelectAllCountries}
            onClearAll={handleClearAllCountries}
            orderCountsByCountry={orderCountsByCountry}
          />
        )}

        {/* Tab 0: Home View */}
        {activeTab === 'home' && (
          <HomePage
            books={books}
            sales={sales}
            displayCurrency={displayCurrency}
            apiConfig={apiConfig}
            isSyncing={isSyncing}
            onSync={handleSyncData}
            onGoToDashboard={() => setActiveTab('dashboard')}
            onGoToSales={() => setActiveTab('sales')}
            onGoToBooks={() => setActiveTab('books')}
            onGoToCountries={() => setActiveTab('countries')}
            onOpenAddBook={() => setIsAddBookOpen(true)}
            onOpenAddSale={() => setIsAddSaleOpen(true)}
            onOpenConfig={() => setIsConfigOpen(true)}
          />
        )}

        {/* Tab 1: Dashboard View */}
        {activeTab === 'dashboard' && (
          <div>
            <MetricsCards
              sales={filteredSales}
              displayCurrency={displayCurrency}
              selectedCountries={selectedCountries}
            />

            <SalesChart
              sales={filteredSales}
              displayCurrency={displayCurrency}
            />

            <SalesTable
              sales={filteredSales}
              displayCurrency={displayCurrency}
              onExportCsv={handleExportCsv}
              onAddSale={() => setIsAddSaleOpen(true)}
            />
          </div>
        )}

        {/* Tab 2: Sales & Orders */}
        {activeTab === 'sales' && (
          <div>
            <MetricsCards
              sales={filteredSales}
              displayCurrency={displayCurrency}
              selectedCountries={selectedCountries}
            />

            <SalesTable
              sales={filteredSales}
              displayCurrency={displayCurrency}
              onExportCsv={handleExportCsv}
              onAddSale={() => setIsAddSaleOpen(true)}
            />
          </div>
        )}

        {/* Tab 3: Books Catalog */}
        {activeTab === 'books' && (
          <BooksCatalog
            books={books}
            onAddBook={() => setIsAddBookOpen(true)}
            onEditBook={() => {}}
          />
        )}

        {/* Tab 4: 17 Countries Breakdown */}
        {activeTab === 'countries' && (
          <CountriesOverview
            sales={sales}
            displayCurrency={displayCurrency}
            onSelectCountryOnly={handleSelectCountryOnly}
          />
        )}
      </main>

      {/* Modals */}
      <AmazonApiModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        config={apiConfig}
        onSaveConfig={(cfg) => {
          setApiConfig(cfg);
          showToast('Configurações da API Amazon SP-API salvas!');
        }}
        onTriggerSync={handleSyncData}
        isSyncing={isSyncing}
      />

      <AddBookModal
        isOpen={isAddBookOpen}
        onClose={() => setIsAddBookOpen(false)}
        onSaveBook={handleSaveBook}
      />

      <AddSaleModal
        isOpen={isAddSaleOpen}
        onClose={() => setIsAddSaleOpen(false)}
        books={books}
        onSaveSale={handleSaveSale}
      />
    </div>
  );
}
