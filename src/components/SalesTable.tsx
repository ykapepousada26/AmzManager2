import React, { useState } from 'react';
import { SaleOrder, DisplayCurrency, CountryId } from '../types';
import { AMAZON_MARKETPLACES } from '../data/marketplaces';
import { 
  Search, 
  Filter, 
  Download, 
  ArrowUpDown, 
  ShoppingBag, 
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SalesTableProps {
  sales: SaleOrder[];
  displayCurrency: DisplayCurrency;
  onExportCsv: () => void;
  onAddSale: () => void;
}

export const SalesTable: React.FC<SalesTableProps> = ({
  sales,
  displayCurrency,
  onExportCsv,
  onAddSale,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter logic
  const filteredSales = sales.filter((order) => {
    const matchesSearch =
      order.bookTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.amazonOrderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.countryName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFormat = selectedFormat === 'ALL' || order.format === selectedFormat;
    const matchesStatus = selectedStatus === 'ALL' || order.status === selectedStatus;

    return matchesSearch && matchesFormat && matchesStatus;
  });

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage) || 1;
  const paginatedSales = filteredSales.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getFormattedMoney = (order: SaleOrder, isRoyalty: boolean = false) => {
    const valLocal = isRoyalty ? order.netRoyalty : order.grossTotal;
    const valBrl = isRoyalty ? order.netRoyaltyBRL : order.grossTotalBRL;

    if (displayCurrency === 'BRL') {
      return `R$ ${valBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    if (displayCurrency === 'USD') {
      const mkt = AMAZON_MARKETPLACES[order.countryId];
      const usdVal = valLocal * (mkt ? mkt.exchangeRateToUSD : 1);
      return `$ ${usdVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    if (displayCurrency === 'EUR') {
      const mkt = AMAZON_MARKETPLACES[order.countryId];
      const eurVal = (valLocal * (mkt ? mkt.exchangeRateToUSD : 1)) / 1.09;
      return `€ ${eurVal.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    // ORIGINAL LOCAL CURRENCY
    return `${order.currencySymbol} ${valLocal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${order.currency})`;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg mb-6 overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 md:p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <span>Histórico de Pedidos & Vendas Amazon</span>
          </h3>
          <p className="text-xs text-slate-400">
            Acompanhe pedidos consolidados vindos da API Amazon SP-API em tempo real ({filteredSales.length} encontrados).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onAddSale}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-all shadow-sm flex items-center space-x-1"
          >
            <span>+ Registrar Venda Manual</span>
          </button>
          <button
            onClick={onExportCsv}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-lg text-xs transition-all flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 bg-slate-950/60 border-b border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por livro, ID de pedido ou país..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {/* Format */}
          <select
            value={selectedFormat}
            onChange={(e) => {
              setSelectedFormat(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">Todos os Formatos</option>
            <option value="Ebook">Ebook</option>
            <option value="Capa Comum">Capa Comum</option>
            <option value="Capa Dura">Capa Dura</option>
            <option value="Audiobook">Audiobook</option>
          </select>

          {/* Status */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">Todos os Status</option>
            <option value="Concluído">Concluído</option>
            <option value="Pendente">Pendente</option>
            <option value="Reembolsado">Reembolsado</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Pedido Amazon</th>
              <th className="py-3 px-4">Data</th>
              <th className="py-3 px-4">País</th>
              <th className="py-3 px-4">Título do Livro</th>
              <th className="py-3 px-4">Formato</th>
              <th className="py-3 px-4 text-center">Un.</th>
              <th className="py-3 px-4 text-right">Valor Bruto</th>
              <th className="py-3 px-4 text-right">Taxas Amazon</th>
              <th className="py-3 px-4 text-right">Royalty Líquido</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {paginatedSales.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-12 text-slate-500">
                  Nenhum pedido encontrado com os filtros aplicados.
                </td>
              </tr>
            ) : (
              paginatedSales.map((order) => {
                const mkt = AMAZON_MARKETPLACES[order.countryId];

                return (
                  <tr key={order.id} className="hover:bg-slate-800/50 transition-colors">
                    {/* Order ID */}
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      <span className="text-amber-400/90 font-semibold">{order.amazonOrderId}</span>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">{order.date}</td>

                    {/* Country */}
                    <td className="py-3 px-4 font-medium whitespace-nowrap">
                      <span className="flex items-center space-x-1.5">
                        <span className="text-base">{mkt ? mkt.flag : '🌐'}</span>
                        <span className="text-slate-200">{order.countryName}</span>
                      </span>
                    </td>

                    {/* Book Title */}
                    <td className="py-3 px-4 font-semibold text-slate-100 max-w-xs truncate">
                      {order.bookTitle}
                    </td>

                    {/* Format */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-medium text-[10px]">
                        {order.format}
                      </span>
                    </td>

                    {/* Units */}
                    <td className="py-3 px-4 text-center font-bold text-slate-200">{order.units}</td>

                    {/* Gross */}
                    <td className="py-3 px-4 text-right font-medium text-slate-300">
                      {getFormattedMoney(order, false)}
                    </td>

                    {/* Fee */}
                    <td className="py-3 px-4 text-right text-red-400/80 font-mono text-[11px]">
                      -{order.amazonFee.toFixed(2)} {order.currency}
                    </td>

                    {/* Net Royalty */}
                    <td className="py-3 px-4 text-right font-bold text-emerald-400">
                      {getFormattedMoney(order, true)}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          order.status === 'Concluído'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : order.status === 'Pendente'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-red-500/10 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div>
          Exibindo {(currentPage - 1) * itemsPerPage + 1} a{' '}
          {Math.min(currentPage * itemsPerPage, filteredSales.length)} de {filteredSales.length} pedidos
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold text-slate-200">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
