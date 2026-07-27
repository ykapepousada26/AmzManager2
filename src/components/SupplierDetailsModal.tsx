import React, { useState, useEffect } from 'react';
import { SaleOrder } from '../types';
import { X, Truck, Building2, DollarSign, PackageCheck, Calculator } from 'lucide-react';

interface SupplierDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: SaleOrder | null;
  onSaveSupplierDetails: (updatedSale: SaleOrder) => void;
}

export const SupplierDetailsModal: React.FC<SupplierDetailsModalProps> = ({
  isOpen,
  onClose,
  order,
  onSaveSupplierDetails,
}) => {
  const [supplier, setSupplier] = useState('');
  const [productCost, setProductCost] = useState<number | ''>('');
  const [shippingCost, setShippingCost] = useState<number | ''>('');

  useEffect(() => {
    if (order) {
      setSupplier(order.supplier || '');
      setProductCost(order.productCost !== undefined ? order.productCost : '');
      setShippingCost(order.shippingCost !== undefined ? order.shippingCost : '');
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const costProdNum = typeof productCost === 'number' ? productCost : 0;
  const costShipNum = typeof shippingCost === 'number' ? shippingCost : 0;
  const totalCost = costProdNum + costShipNum;
  const netProfit = Number((order.netRoyalty - totalCost).toFixed(2));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedSale: SaleOrder = {
      ...order,
      supplier: supplier.trim() || undefined,
      productCost: typeof productCost === 'number' ? productCost : undefined,
      shippingCost: typeof shippingCost === 'number' ? shippingCost : undefined,
    };

    onSaveSupplierDetails(updatedSale);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Dados do Fornecedor &amp; Custos</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/40">
                  {order.status}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Pedido Amazon: <span className="text-amber-400 font-mono font-semibold">{order.amazonOrderId}</span>
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

        {/* Order Summary Pill */}
        <div className="p-4 bg-slate-950/40 border-b border-slate-800/80 text-xs text-slate-300 space-y-1">
          <div className="font-semibold text-slate-100 text-sm truncate">{order.bookTitle}</div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-400">
            <span>País: <strong className="text-slate-200">{order.countryName}</strong></span>
            <span>Formato: <strong className="text-slate-200">{order.format}</strong></span>
            <span>Qtd: <strong className="text-slate-200">{order.units} un.</strong></span>
            <span>Royalty Líquido: <strong className="text-emerald-400">{order.currencySymbol} {order.netRoyalty.toFixed(2)}</strong></span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Campo 1: Fornecedor */}
          <div>
            <label className="block font-semibold text-slate-200 mb-1 flex items-center space-x-1.5">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>Fornecedor / Gráfica / Plataforma</span>
            </label>
            <input
              type="text"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder="Ex: Gráfica Express, KDP Print, Printful, etc."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Campo 2: Preço do Produto */}
          <div>
            <label className="block font-semibold text-slate-200 mb-1 flex items-center space-x-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Preço do Produto (Custo do Item / Impressão) ({order.currencySymbol})</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={productCost}
              onChange={(e) => setProductCost(e.target.value === '' ? '' : parseFloat(e.target.value))}
              placeholder="Ex: 12.50"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Campo 3: Custo de Envio */}
          <div>
            <label className="block font-semibold text-slate-200 mb-1 flex items-center space-x-1.5">
              <Truck className="w-4 h-4 text-blue-400" />
              <span>Custo de Envio / Frete ({order.currencySymbol})</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={shippingCost}
              onChange={(e) => setShippingCost(e.target.value === '' ? '' : parseFloat(e.target.value))}
              placeholder="Ex: 8.00"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Calculated Cost & Profit Preview */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-slate-300 font-semibold">
              <span className="flex items-center space-x-1.5">
                <Calculator className="w-4 h-4 text-slate-400" />
                <span>Custo Total do Fornecedor + Envio:</span>
              </span>
              <span className="text-slate-100 font-mono text-sm">{order.currencySymbol} {totalCost.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between font-bold pt-1.5 border-t border-slate-800/60">
              <span className="text-slate-300">Lucro Líquido Estimado da Venda:</span>
              <span className={`font-mono text-sm ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {order.currencySymbol} {netProfit.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end space-x-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg transition-all flex items-center space-x-2"
            >
              <PackageCheck className="w-4 h-4" />
              <span>Salvar Detalhes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
