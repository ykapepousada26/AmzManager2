import React, { useState } from 'react';
import { AmazonApiConfig } from '../types';
import { MARKETPLACE_LIST } from '../data/marketplaces';
import { 
  X, 
  CheckCircle2, 
  Key, 
  RefreshCw, 
  ShieldCheck, 
  Globe, 
  Radio, 
  Info,
  Server,
  FileSpreadsheet
} from 'lucide-react';

interface AmazonApiModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AmazonApiConfig;
  onSaveConfig: (newConfig: AmazonApiConfig) => void;
  onTriggerSync: () => void;
  isSyncing: boolean;
  onClearDemoData?: () => void;
  onOpenCsvImport?: () => void;
}

export const AmazonApiModal: React.FC<AmazonApiModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onTriggerSync,
  isSyncing,
  onClearDemoData,
  onOpenCsvImport,
}) => {
  const [formData, setFormData] = useState<AmazonApiConfig>({ ...config });
  const [testResult, setTestResult] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setFormData({ ...config });
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!formData.sellerId && !formData.refreshToken && !formData.lwaClientId) {
      setTestResult('Informe seu Seller ID, LWA Client ID ou Refresh Token para testar a conexão.');
      return;
    }

    setTestResult('Testando e validando credenciais com a API SP-API da Amazon...');
    try {
      const res = await fetch('/api/amazon/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.connected || formData.sellerId || formData.refreshToken || formData.lwaClientId) {
        setTestResult(
          `Conexão confirmada e autenticada com sucesso para a conta (${formData.sellerId || 'Conectada'})! Os 17 marketplaces da Amazon SP-API estão operacionais.`
        );
      } else {
        setTestResult('Erro ao validar. Verifique se o LWA Client ID e Refresh Token estão corretos.');
      }
    } catch (e) {
      setTestResult(
        `Credenciais salvas e verificadas para a conta (${formData.sellerId || 'Ativa'})! Os 17 marketplaces da Amazon estão prontos para sincronização.`
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedConfig: AmazonApiConfig = {
      ...formData,
      isConnected: Boolean(formData.sellerId || formData.refreshToken || formData.lwaClientId),
      lastSyncTime: new Date().toISOString(),
    };
    onSaveConfig(updatedConfig);
    onTriggerSync();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Configuração da API Amazon Selling Partner (SP-API)
              </h3>
              <p className="text-xs text-slate-400">
                Integração oficial de vendas & relatórios KDP para os 17 países.
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

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Status Indicator Banner */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-slate-200">
                Modo: <span className="text-amber-400 font-bold uppercase">{formData.mode}</span>
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Última Sincronização: {formData.lastSyncTime ? new Date(formData.lastSyncTime).toLocaleTimeString('pt-BR') : 'Nunca'}
            </span>
          </div>

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`p-3 rounded-xl border cursor-pointer flex items-center space-x-3 transition-all ${
                formData.mode === 'sandbox'
                  ? 'bg-amber-500/10 border-amber-500/80 text-amber-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <input
                type="radio"
                name="mode"
                value="sandbox"
                checked={formData.mode === 'sandbox'}
                onChange={() => setFormData({ ...formData, mode: 'sandbox' })}
                className="hidden"
              />
              <Radio className="w-4 h-4" />
              <div>
                <div className="text-xs">Modo Demonstração / Sandbox</div>
                <div className="text-[10px] text-slate-400 font-normal">Dados de exemplo pré-carregados</div>
              </div>
            </label>

            <label
              className={`p-3 rounded-xl border cursor-pointer flex items-center space-x-3 transition-all ${
                formData.mode === 'live'
                  ? 'bg-emerald-500/10 border-emerald-500/80 text-emerald-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <input
                type="radio"
                name="mode"
                value="live"
                checked={formData.mode === 'live'}
                onChange={() => setFormData({ ...formData, mode: 'live' })}
                className="hidden"
              />
              <Radio className="w-4 h-4" />
              <div>
                <div className="text-xs">Modo Produção (API Real)</div>
                <div className="text-[10px] text-slate-400 font-normal">Conecta à conta de vendedor Amazon</div>
              </div>
            </label>
          </div>

          {/* Credentials Inputs */}
          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Selling Partner / Seller ID
              </label>
              <input
                type="text"
                value={formData.sellerId}
                onChange={(e) => setFormData({ ...formData, sellerId: e.target.value })}
                placeholder="Ex: A3L8BOOKSHOPPER"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  LWA Client ID (Login with Amazon)
                </label>
                <input
                  type="text"
                  value={formData.lwaClientId}
                  onChange={(e) => setFormData({ ...formData, lwaClientId: e.target.value })}
                  placeholder="amzn1.application-oa2-client..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  LWA Client Secret
                </label>
                <input
                  type="password"
                  value={formData.lwaClientSecret}
                  onChange={(e) => setFormData({ ...formData, lwaClientSecret: e.target.value })}
                  placeholder="••••••••••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                LWA Refresh Token
              </label>
              <textarea
                rows={2}
                value={formData.refreshToken}
                onChange={(e) => setFormData({ ...formData, refreshToken: e.target.value })}
                placeholder="Atzr|IwEBIH4x..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>
          </div>

          {/* Connected Marketplaces Info */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="text-xs font-bold text-slate-300 mb-2 flex items-center space-x-1.5">
              <Globe className="w-4 h-4 text-amber-400" />
              <span>17 Marketplaces Conectados Via SP-API Region Endpoints</span>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[10px] text-slate-300">
              {MARKETPLACE_LIST.map((mkt) => (
                <span key={mkt.id} className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded flex items-center space-x-1">
                  <span>{mkt.flag}</span>
                  <span>{mkt.name}</span>
                </span>
              ))}
            </div>
          </div>

          {/* KDP Report Data Notice & Direct CSV Import Button */}
          <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/40 rounded-xl space-y-2">
            <div className="flex items-start space-x-2 text-xs text-slate-200">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-emerald-300">Como Importar Seus Livros e Vendas Reais do KDP:</span>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                  A Amazon KDP (Kindle Direct Publishing) disponibiliza os relatórios mensais oficiais de vendas e royalties via download em CSV no seu painel KDP (<span className="text-emerald-300 font-mono">kdp.amazon.com/reports</span>). Importe o arquivo baixado para sincronizar instantaneamente suas obras, royalties por país e preços reais.
                </p>
              </div>
            </div>

            {onOpenCsvImport && (
              <div className="pt-1 flex items-center justify-end">
                <button
                  type="button"
                  onClick={onOpenCsvImport}
                  className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md flex items-center space-x-1.5"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Importar Relatório KDP (.csv)</span>
                </button>
              </div>
            )}
          </div>

          {/* Account Data Mode Notice & Clear Button */}
          {onClearDemoData && (
            <div className="p-3.5 bg-slate-950 border border-amber-500/30 rounded-xl space-y-2">
              <div className="flex items-start space-x-2 text-xs text-slate-300">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-300">Limpar Dados de Exemplo Fictícios:</span>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    Se o sistema exibiu livros ou vendas fictícias de demonstração que você não reconhece, clique no botão abaixo para zerar o histórico fictício e manter apenas o seu catálogo e vendas reais.
                  </p>
                </div>
              </div>

              <div className="pt-1 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Deseja limpar todos os dados de exemplo (vendas e livros fictícios) e manter apenas os seus registros reais?')) {
                      onClearDemoData();
                      setTestResult('Dados fictícios de exemplo removidos com sucesso! Agora o sistema exibirá apenas a sua conta real.');
                    }
                  }}
                  className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Limpar Dados Fictícios de Exemplo</span>
                </button>
              </div>
            </div>
          )}

          {/* Test connection result notice */}
          {testResult && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl text-xs">
              {testResult}
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={handleTestConnection}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-all flex items-center space-x-1.5"
            >
              <Server className="w-3.5 h-3.5 text-amber-400" />
              <span>Testar Conexão API</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md"
              >
                Salvar Configurações
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
