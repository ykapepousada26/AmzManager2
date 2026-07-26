import React, { useState } from 'react';
import { Book, SaleOrder, CountryId } from '../types';
import { MARKETPLACE_LIST, AMAZON_MARKETPLACES } from '../data/marketplaces';
import { X, ShoppingBag, DollarSign } from 'lucide-react';

interface AddSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
  onSaveSale: (newSale: SaleOrder) => void;
}

export const AddSaleModal: React.FC<AddSaleModalProps> = ({
  isOpen,
  onClose,
  books,
  onSaveSale,
}) => {
  const [selectedBookId, setSelectedBookId] = useState<string>(books[0]?.id || '');
  const [countryId, setCountryId] = useState<CountryId>('US');
  const [units, setUnits] = useState(1);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const book = books.find((b) => b.id === selectedBookId) || books[0];
  const mkt = AMAZON_MARKETPLACES[countryId];

  const pricePerUnit = book ? book.prices[countryId] || 14.99 : 14.99;
  const grossTotal = Number((pricePerUnit * units).toFixed(2));
  const rateRoyalty = book ? book.kdpRoyaltyRate : 0.70;

  const printingInLocal = book ? book.printingCostUSD * (mkt.exchangeRateToBRL / 5.60) / (mkt.exchangeRateToBRL || 1) : 0;
  const amazonFee = Number((grossTotal * (1 - rateRoyalty) + units * printingInLocal).toFixed(2));
  const netRoyalty = Math.max(0, Number((grossTotal - amazonFee).toFixed(2)));

  const grossTotalBRL = Number((grossTotal * mkt.exchangeRateToBRL).toFixed(2));
  const netRoyaltyBRL = Number((netRoyalty * mkt.exchangeRateToBRL).toFixed(2));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!book) return;

    const newSale: SaleOrder = {
      id: `ord-${Date.now()}`,
      amazonOrderId: `112-${Math.floor(1000000 + Math.random() * 9000000)}-${Math.floor(1000000 + Math.random() * 9000000)}`,
      bookId: book.id,
      bookTitle: book.title,
      countryId,
      countryName: mkt.name,
      currency: mkt.currency,
      currencySymbol: mkt.currencySymbol,
      units: Number(units),
      pricePerUnit,
      grossTotal,
      amazonFee,
      netRoyalty,
      grossTotalBRL,
      netRoyaltyBRL,
      date,
      format: book.format,
      status: 'Concluído',
    };

    onSaveSale(newSale);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Registrar Venda Manual de Livro
              </h3>
              <p className="text-xs text-slate-400">
                Adicione vendas diretas ou autorais nos 17 países.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 bg-slate-800 hover:bg-slate-700 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Select Book */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Selecionar Livro</label>
            <select
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
            >
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title} ({b.format})
                </option>
              ))}
            </select>
          </div>

          {/* Country Selection */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              País / Marketplace Amazon (17 Opções)
            </label>
            <select
              value={countryId}
              onChange={(e) => setCountryId(e.target.value as CountryId)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
            >
              {MARKETPLACE_LIST.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.flag} {m.name} - Amazon ({m.currency})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Unidades Vendidas</label>
              <input
                type="number"
                min={1}
                value={units}
                onChange={(e) => setUnits(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Data da Venda</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Calculated Breakdown Card */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between font-semibold text-slate-300">
              <span>Preço Unitário ({mkt.currency}):</span>
              <span>{mkt.currencySymbol} {pricePerUnit.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-slate-300">
              <span>Receita Bruta Total:</span>
              <span>{mkt.currencySymbol} {grossTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-red-400 font-semibold">
              <span>Taxa/Fulfillment Amazon:</span>
              <span>-{mkt.currencySymbol} {amazonFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-emerald-400 font-bold text-sm pt-2 border-t border-slate-800">
              <span>Royalty Líquido Estimado:</span>
              <span>{mkt.currencySymbol} {netRoyalty.toFixed(2)}</span>
            </div>
            <div className="text-[10px] text-slate-400 text-right font-medium">
              ≈ R$ {netRoyaltyBRL.toFixed(2)} em Reais
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all shadow-md"
            >
              Registrar Venda
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
