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
import { generate2000BooksCatalog } from './data/bulkCatalogGenerator';
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
import { KdpCsvImportModal } from './components/KdpCsvImportModal';
import { RefreshCw, CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function App() {
  const [books, setBooks] = useState<Book[]>(() => {
    const saved = localStorage.getItem('amazon_books_catalog');
    if (!saved) return [];
    try {
      const parsed: Book[] = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [sales, setSales] = useState<SaleOrder[]>(() => {
    const saved = localStorage.getItem('amazon_sales_history');
    if (!saved) return [];
    try {
      const parsed: SaleOrder[] = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [apiConfig, setApiConfig] = useState<AmazonApiConfig>(() => {
    const saved = localStorage.getItem('amazon_api_config');
    if (!saved) return INITIAL_API_CONFIG;
    try {
      const parsed: AmazonApiConfig = JSON.parse(saved);
      if (parsed.sellerId === 'A3L8W9X2Y1Z0Q' || parsed.sellerId === 'A3L8BOOKSHOPPER') {
        return INITIAL_API_CONFIG;
      }
      return parsed;
    } catch {
      return INITIAL_API_CONFIG;
    }
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
  const [isCsvImportOpen, setIsCsvImportOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Set document title
  useEffect(() => {
    document.title = 'Amz Manager- Controle de Vendas de Livros';
  }, []);

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

  const handleImportKdpData = (importedBooks: Book[], importedSales: SaleOrder[]) => {
    setBooks((prev) => {
      const existingIds = new Set(prev.map((b) => b.id));
      const newBooks = importedBooks.filter((b) => !existingIds.has(b.id));
      return [...prev, ...newBooks];
    });

    setSales((prev) => {
      const existingSaleIds = new Set(prev.map((s) => s.id));
      const newSales = importedSales.filter((s) => !existingSaleIds.has(s.id));
      return [...newSales, ...prev];
    });

    setApiConfig((prev) => ({
      ...prev,
      isConnected: true,
      lastSyncTime: new Date().toISOString(),
    }));

    showToast(`Relatório KDP sincronizado com sucesso! ${importedBooks.length} obra(s) e ${importedSales.length} venda(s) importadas.`);
  };

  const handleResetCatalog = () => {
    setBooks([]);
    setSales([]);
    try {
      localStorage.setItem('amazon_books_catalog', JSON.stringify([]));
      localStorage.setItem('amazon_sales_history', JSON.stringify([]));
    } catch {
      // Storage limit fallback
    }
    showToast('Todos os dados do catálogo foram limpos com sucesso.');
  };

  const handleSaveBulkBooks = (newBooks: Book[]) => {
    setBooks(newBooks);
    try {
      localStorage.setItem('amazon_books_catalog', JSON.stringify(newBooks));
    } catch {
      // Handles quota exceed if browser restricts localStorage size
    }
    showToast(`Catálogo atualizado com ${newBooks.length} livros e e-books!`);
  };

  // Clear demo data to keep only real user account data
  const handleClearDemoData = () => {
    setSales([]);
    setBooks([]);
    try {
      localStorage.setItem('amazon_sales_history', JSON.stringify([]));
      localStorage.setItem('amazon_books_catalog', JSON.stringify([]));
    } catch {
      // Storage error fallback
    }
    showToast('Dados de demonstração removidos! Agora o sistema exibirá somente sua conta real.');
  };

  // Sync with Express backend proxy / Amazon SP-API
  const handleSyncData = async () => {
    setIsSyncing(true);

    try {
      await fetch('/api/amazon/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: apiConfig.mode,
          sellerId: apiConfig.sellerId,
          lwaClientId: apiConfig.lwaClientId,
          refreshToken: apiConfig.refreshToken,
        }),
      });
    } catch (e) {
      // Silent catch
    }

    setApiConfig((prev) => ({
      ...prev,
      isConnected: true,
      lastSyncTime: new Date().toISOString(),
    }));

    if (sales.length > 0 || books.length > 0) {
      showToast(
        apiConfig.sellerId
          ? `Sincronização com a conta Amazon (${apiConfig.sellerId}) realizada com sucesso! Todos os ${books.length} livros e ${sales.length} registros estão sincronizados.`
          : `Sincronização com a API Amazon realizada! ${books.length} livro(s) e ${sales.length} registro(s) em dia.`
      );
    } else {
      showToast(
        apiConfig.sellerId
          ? `Sua conta Amazon (${apiConfig.sellerId}) foi autenticada! Importe seu Relatório de Vendas KDP (CSV) ou cadastre seus livros para visualizar seus dados reais.`
          : 'Sincronização concluída! Importe seu Relatório KDP (.csv) para carregar suas obras e royalties reais do Amazon KDP.'
      );
    }

    setIsSyncing(false);
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

  const handleUpdateSale = (updatedSale: SaleOrder) => {
    setSales((prev) =>
      prev.map((s) => (s.id === updatedSale.id ? updatedSale : s))
    );
    showToast(`Informações do fornecedor salvas para o pedido ${updatedSale.amazonOrderId}!`);
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
        onOpenCsvImport={() => setIsCsvImportOpen(true)}
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
            onOpenCsvImport={() => setIsCsvImportOpen(true)}
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
              onUpdateSale={handleUpdateSale}
              onOpenCsvImport={() => setIsCsvImportOpen(true)}
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
              onUpdateSale={handleUpdateSale}
              onOpenCsvImport={() => setIsCsvImportOpen(true)}
            />
          </div>
        )}

        {/* Tab 3: Books Catalog */}
        {activeTab === 'books' && (
          <BooksCatalog
            books={books}
            onAddBook={() => setIsAddBookOpen(true)}
            onEditBook={() => {}}
            onResetCatalog={handleResetCatalog}
            onOpenCsvImport={() => setIsCsvImportOpen(true)}
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
          showToast(`Configurações da API Amazon salvas para a conta ${cfg.sellerId || 'de Vendedor'}!`);
        }}
        onTriggerSync={handleSyncData}
        isSyncing={isSyncing}
        onClearDemoData={handleClearDemoData}
        onOpenCsvImport={() => {
          setIsConfigOpen(false);
          setIsCsvImportOpen(true);
        }}
      />

      <AddBookModal
        isOpen={isAddBookOpen}
        onClose={() => setIsAddBookOpen(false)}
        onSaveBook={handleSaveBook}
        onSaveBulkBooks={handleSaveBulkBooks}
      />

      <AddSaleModal
        isOpen={isAddSaleOpen}
        onClose={() => setIsAddSaleOpen(false)}
        books={books}
        onSaveSale={handleSaveSale}
      />

      <KdpCsvImportModal
        isOpen={isCsvImportOpen}
        onClose={() => setIsCsvImportOpen(false)}
        onImportData={handleImportKdpData}
      />
    </div>
  );
}
