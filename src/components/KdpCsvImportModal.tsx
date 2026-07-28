import React, { useState } from 'react';
import { Book, SaleOrder, CountryId } from '../types';
import { AMAZON_MARKETPLACES, MARKETPLACE_LIST } from '../data/marketplaces';
import { X, Upload, FileText, CheckCircle2, AlertCircle, HelpCircle, FileSpreadsheet } from 'lucide-react';

interface KdpCsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportData: (importedBooks: Book[], importedSales: SaleOrder[]) => void;
}

export const KdpCsvImportModal: React.FC<KdpCsvImportModalProps> = ({
  isOpen,
  onClose,
  onImportData,
}) => {
  const [csvText, setCsvText] = useState('');
  const [parsedPreview, setParsedPreview] = useState<{ books: Book[]; sales: SaleOrder[] } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const detectCountryFromMarketplaceStr = (str: string): CountryId => {
    const lower = str.toLowerCase().trim();
    if (lower.includes('uk') || lower.includes('co.uk') || lower.includes('united kingdom') || lower.includes('gb')) return 'GB';
    if (lower.includes('de') || lower.includes('germany') || lower.includes('.de')) return 'DE';
    if (lower.includes('fr') || lower.includes('france') || lower.includes('.fr')) return 'FR';
    if (lower.includes('es') || lower.includes('spain') || lower.includes('.es')) return 'ES';
    if (lower.includes('it') || lower.includes('italy') || lower.includes('.it')) return 'IT';
    if (lower.includes('ca') || lower.includes('canada') || lower.includes('.ca')) return 'CA';
    if (lower.includes('mx') || lower.includes('mexico') || lower.includes('.com.mx')) return 'MX';
    if (lower.includes('jp') || lower.includes('japan') || lower.includes('.co.jp')) return 'JP';
    if (lower.includes('au') || lower.includes('australia') || lower.includes('.com.au')) return 'AU';
    if (lower.includes('nl') || lower.includes('netherlands') || lower.includes('.nl')) return 'NL';
    if (lower.includes('se') || lower.includes('sweden') || lower.includes('.se')) return 'SE';
    if (lower.includes('pl') || lower.includes('poland') || lower.includes('.pl')) return 'PL';
    if (lower.includes('be') || lower.includes('belgium') || lower.includes('.com.be')) return 'BE';
    if (lower.includes('ae') || lower.includes('emirates') || lower.includes('.ae')) return 'AE';
    if (lower.includes('ie') || lower.includes('ireland') || lower.includes('.ie')) return 'IE';
    if (lower.includes('tr') || lower.includes('turkey') || lower.includes('.com.tr')) return 'TR';
    return 'US';
  };

  const parseCsvContent = (text: string) => {
    setErrorMessage(null);
    if (!text.trim()) {
      setErrorMessage('Cole ou selecione o conteúdo de um arquivo CSV de relatório KDP.');
      setParsedPreview(null);
      return;
    }

    try {
      const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
      if (lines.length < 2) {
        setErrorMessage('O arquivo precisa ter um cabeçalho e pelo menos 1 linha de dados.');
        setParsedPreview(null);
        return;
      }

      // Detect delimiter (comma or semicolon)
      const firstLine = lines[0];
      const delimiter = firstLine.includes(';') ? ';' : ',';
      const headers = firstLine.split(delimiter).map((h) => h.trim().replace(/^"|"$/g, '').toLowerCase());

      // Helper column indexes
      const titleIdx = headers.findIndex((h) => h.includes('title') || h.includes('título') || h.includes('livro') || h.includes('obra'));
      const asinIdx = headers.findIndex((h) => h.includes('asin') || h.includes('isbn') || h.includes('id'));
      const marketplaceIdx = headers.findIndex((h) => h.includes('marketplace') || h.includes('país') || h.includes('country') || h.includes('loja'));
      const unitsIdx = headers.findIndex((h) => h.includes('unit') || h.includes('unidade') || h.includes('qtd') || h.includes('quantity'));
      const royaltyIdx = headers.findIndex((h) => h.includes('royalt') || h.includes('lucro') || h.includes('net') || h.includes('ganho'));
      const priceIdx = headers.findIndex((h) => h.includes('price') || h.includes('preço') || h.includes('valor'));
      const dateIdx = headers.findIndex((h) => h.includes('date') || h.includes('data'));
      const formatIdx = headers.findIndex((h) => h.includes('format') || h.includes('tipo') || h.includes('tipo de produto'));

      const booksMap = new Map<string, Book>();
      const parsedSales: SaleOrder[] = [];

      for (let i = 1; i < lines.length; i++) {
        const rawLine = lines[i].trim();
        if (!rawLine) continue;

        // Split line considering quotes
        const cols = rawLine.split(new RegExp(`${delimiter}(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)`)).map((c) => c.trim().replace(/^"|"$/g, ''));

        const title = titleIdx !== -1 && cols[titleIdx] ? cols[titleIdx] : `Obra KDP #${i}`;
        const asin = asinIdx !== -1 && cols[asinIdx] ? cols[asinIdx] : `ASIN-${1000 + i}`;
        const mktStr = marketplaceIdx !== -1 && cols[marketplaceIdx] ? cols[marketplaceIdx] : 'US';
        const countryId = detectCountryFromMarketplaceStr(mktStr);
        const mkt = AMAZON_MARKETPLACES[countryId] || AMAZON_MARKETPLACES['US'];

        const unitsRaw = unitsIdx !== -1 ? cols[unitsIdx] : '1';
        const units = Math.max(1, parseInt(unitsRaw.replace(/[^0-9]/g, '') || '1', 10));

        const priceRaw = priceIdx !== -1 ? cols[priceIdx] : '15.00';
        const pricePerUnit = parseFloat(priceRaw.replace(',', '.').replace(/[^0-9.]/g, '') || '15.00');

        const royaltyRaw = royaltyIdx !== -1 ? cols[royaltyIdx] : '10.50';
        const netRoyalty = parseFloat(royaltyRaw.replace(',', '.').replace(/[^0-9.]/g, '') || '10.50');

        const dateRaw = dateIdx !== -1 && cols[dateIdx] ? cols[dateIdx] : new Date().toISOString().split('T')[0];
        const formatRaw = formatIdx !== -1 && cols[formatIdx] ? cols[formatIdx] : 'Ebook';
        const formatStr = formatRaw.toLowerCase().includes('paper') || formatRaw.toLowerCase().includes('físico') || formatRaw.toLowerCase().includes('capa')
          ? 'Capa Comum'
          : formatRaw.toLowerCase().includes('audio')
          ? 'Audiobook'
          : 'Ebook';

        const bookId = asin;
        if (!booksMap.has(bookId)) {
          const pricesObj: Record<CountryId, number> = {} as any;
          MARKETPLACE_LIST.forEach((m) => (pricesObj[m.id] = pricePerUnit));
          booksMap.set(bookId, {
            id: bookId,
            title,
            author: 'Autor Principal',
            isbn: asin,
            coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80',
            format: formatStr,
            genre: 'Literatura & Ficção',
            pageCount: 250,
            publicationDate: '2024-01-01',
            kdpRoyaltyRate: 0.7,
            printingCostUSD: 2.15,
            prices: pricesObj,
          });
        }

        const grossTotal = Number((units * pricePerUnit).toFixed(2));
        const amazonFee = Number(Math.max(0, grossTotal - netRoyalty).toFixed(2));

        const sale: SaleOrder = {
          id: `real-kdp-ord-${i}-${Date.now()}`,
          amazonOrderId: `114-${Math.floor(1000000 + Math.random() * 9000000)}-${Math.floor(1000000 + Math.random() * 9000000)}`,
          bookId,
          bookTitle: title,
          countryId,
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
          date: dateRaw,
          format: formatStr,
          status: 'Concluído',
        };

        parsedSales.push(sale);
      }

      const booksArray = Array.from(booksMap.values());
      if (booksArray.length === 0 && parsedSales.length === 0) {
        setErrorMessage('Não foi possível identificar linhas de dados válidos no CSV informado.');
        setParsedPreview(null);
        return;
      }

      setParsedPreview({ books: booksArray, sales: parsedSales });
    } catch (e: any) {
      setErrorMessage(`Erro ao processar o arquivo CSV: ${e.message || 'Verifique o formato das colunas.'}`);
      setParsedPreview(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCsvText(content);
        parseCsvContent(content);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (!parsedPreview) return;
    onImportData(parsedPreview.books, parsedPreview.sales);
    onClose();
    setCsvText('');
    setParsedPreview(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Importar Relatório KDP / Amazon (CSV)</h3>
              <p className="text-xs text-slate-400">Importe seu relatório oficial de vendas e royalties do Amazon KDP.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 bg-slate-800 hover:bg-slate-700 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {/* File Upload zone */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300">
              1. Selecionar Arquivo do Relatório (.csv ou .txt)
            </label>
            <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-xl p-5 text-center bg-slate-950/50 transition-all cursor-pointer relative group">
              <input
                type="file"
                accept=".csv,.txt,.tsv"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
              />
              <div className="space-y-2 pointer-events-none">
                <Upload className="w-8 h-8 mx-auto text-emerald-400 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-semibold text-slate-200">
                  Clique ou arraste seu arquivo KDP em formato CSV aqui
                </p>
                <p className="text-[11px] text-slate-400">
                  Relatório Mensal de Royalties, Vendas por País ou Cadastro de Títulos KDP
                </p>
              </div>
            </div>
          </div>

          {/* Direct Textarea Fallback */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-300">
                2. Ou Cole o Conteúdo do CSV / Excel Abaixo
              </label>
              {csvText && (
                <button
                  type="button"
                  onClick={() => {
                    setCsvText('');
                    setParsedPreview(null);
                    setErrorMessage(null);
                  }}
                  className="text-[11px] text-rose-400 hover:underline"
                >
                  Limpar
                </button>
              )}
            </div>
            <textarea
              rows={5}
              value={csvText}
              onChange={(e) => {
                setCsvText(e.target.value);
                parseCsvContent(e.target.value);
              }}
              placeholder={`Cole aqui as linhas do seu relatório CSV da Amazon...
Exemplo:
Título, ASIN, Marketplace, Unidades, Royalty, Preço, Data
Meu Livro de Ficção, B08X12345, Amazon.com.br, 15, 142.50, 19.90, 2026-07-28`}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Preview Panel */}
          {parsedPreview && (
            <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-3">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Dados identificados e prontos para sincronização!</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-300">
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Títulos Encontrados</span>
                  <span className="text-sm font-bold text-slate-100">{parsedPreview.books.length} Obras</span>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Pedidos/Vendas</span>
                  <span className="text-sm font-bold text-slate-100">{parsedPreview.sales.length} Lançamentos</span>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 col-span-2 sm:col-span-1">
                  <span className="text-[11px] text-slate-400 block">Total Unidades</span>
                  <span className="text-sm font-bold text-amber-400">
                    {parsedPreview.sales.reduce((acc, curr) => acc + curr.units, 0)} Unid.
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-all"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!parsedPreview || parsedPreview.sales.length === 0}
            onClick={handleConfirmImport}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center space-x-2 shadow-lg"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirmar e Importar no Painel</span>
          </button>
        </div>
      </div>
    </div>
  );
};
