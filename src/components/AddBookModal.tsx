import React, { useState } from 'react';
import { Book, BookFormat, CountryId } from '../types';
import { MARKETPLACE_LIST } from '../data/marketplaces';
import { X, Search, Sparkles, BookOpen, DollarSign } from 'lucide-react';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveBook: (newBook: Book) => void;
}

export const AddBookModal: React.FC<AddBookModalProps> = ({
  isOpen,
  onClose,
  onSaveBook,
}) => {
  const [isbn, setIsbn] = useState('');
  const [isSearchingIsbn, setIsSearchingIsbn] = useState(false);
  const [isbnMessage, setIsbnMessage] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [format, setFormat] = useState<BookFormat>('Capa Comum');
  const [genre, setGenre] = useState('Ficção');
  const [pageCount, setPageCount] = useState(250);
  const [royaltyRate, setRoyaltyRate] = useState(0.70);
  const [printingCostUSD, setPrintingCostUSD] = useState(3.50);

  // Default price multipliers for each of the 17 countries
  const [prices, setPrices] = useState<Record<CountryId, number>>({
    US: 14.99,
    MX: 279.00,
    CA: 19.99,
    AU: 22.50,
    JP: 1980,
    AE: 55.00,
    FR: 13.99,
    DE: 13.99,
    ES: 13.99,
    IT: 13.99,
    NL: 13.99,
    BE: 13.99,
    IE: 13.99,
    TR: 320.00,
    PL: 59.90,
    SE: 159.00,
    GB: 11.99,
  });

  if (!isOpen) return null;

  const handleSearchIsbn = async () => {
    if (!isbn) return;
    setIsSearchingIsbn(true);
    setIsbnMessage('Consultando dados do livro na API Open Library / Amazon...');

    const cleanIsbn = isbn.replace(/[^0-9X]/gi, '');

    try {
      const res = await fetch(`/api/books/isbn/${encodeURIComponent(isbn)}`);
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (data.found) {
            setTitle(data.title || title);
            setAuthor(data.author || author);
            setCoverUrl(data.coverUrl || coverUrl);
            if (data.pageCount) setPageCount(data.pageCount);
            setIsbnMessage('Livro localizado e dados preenchidos com sucesso!');
            return;
          }
        }
      }
      throw new Error('Proxy offline');
    } catch (e) {
      // Fallback: call Open Library directly from client browser if static host (Netlify)
      try {
        const openLibRes = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${cleanIsbn}&format=json&jscmd=data`);
        const data = await openLibRes.json();
        const bookData = data[`ISBN:${cleanIsbn}`];

        if (bookData) {
          setTitle(bookData.title || title);
          setAuthor(bookData.authors ? bookData.authors.map((a: any) => a.name).join(', ') : author);
          if (bookData.cover?.large || bookData.cover?.medium) {
            setCoverUrl(bookData.cover.large || bookData.cover.medium);
          }
          if (bookData.number_of_pages) setPageCount(bookData.number_of_pages);
          setIsbnMessage('Livro localizado via OpenLibrary (Modo Direto)!');
        } else {
          setIsbnMessage('ISBN não encontrado na base pública. Preencha os campos manualmente.');
        }
      } catch (err) {
        setIsbnMessage('Erro ao buscar ISBN. Você pode preencher manualmente.');
      }
    } finally {
      setIsSearchingIsbn(false);
    }
  };

  const handlePriceChange = (countryId: CountryId, val: number) => {
    setPrices((prev) => ({ ...prev, [countryId]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author) {
      alert('Por favor, informe pelo menos o Título e o Autor.');
      return;
    }

    const newBook: Book = {
      id: `book-${Date.now()}`,
      title,
      author,
      isbn: isbn || `978-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      coverUrl: coverUrl || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80',
      format,
      genre,
      pageCount: Number(pageCount),
      publicationDate: new Date().toISOString().split('T')[0],
      kdpRoyaltyRate: Number(royaltyRate),
      printingCostUSD: Number(printingCostUSD),
      prices,
    };

    onSaveBook(newBook);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Cadastrar Novo Livro no Catálogo Amazon
              </h3>
              <p className="text-xs text-slate-400">
                Busca automática por ISBN e preços customizáveis para os 17 países.
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

        {/* Modal Form Scrollable */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* ISBN Search Bar */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <label className="block text-xs font-bold text-slate-200 mb-1.5">
              Buscar Livro por ISBN-10 / ISBN-13
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Ex: 9786555123012"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={handleSearchIsbn}
                disabled={isSearchingIsbn || !isbn}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-all flex items-center space-x-1 disabled:opacity-50"
              >
                <Search className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{isSearchingIsbn ? 'Buscando...' : 'Buscar ISBN'}</span>
              </button>
            </div>
            {isbnMessage && (
              <p className="text-[11px] text-amber-300 mt-2 font-medium">{isbnMessage}</p>
            )}
          </div>

          {/* Core Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Título do Livro *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: A Arte de Vender Livros"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Autor *</label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Ex: Lucas Mendes"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Formato</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as BookFormat)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="Ebook">Ebook</option>
                <option value="Capa Comum">Capa Comum</option>
                <option value="Capa Dura">Capa Dura</option>
                <option value="Audiobook">Audiobook</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Taxa Royalty KDP</label>
              <select
                value={royaltyRate}
                onChange={(e) => setRoyaltyRate(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value={0.70}>70% (KDP Padrão)</option>
                <option value={0.35}>35% (KDP Reduzido)</option>
                <option value={0.60}>60% (Capa Dura / Dist. Expandida)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Nº Páginas</label>
              <input
                type="number"
                value={pageCount}
                onChange={(e) => setPageCount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">URL da Capa</label>
              <input
                type="text"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* 17 Countries Price Inputs Grid */}
          <div className="pt-2">
            <h4 className="font-bold text-slate-200 mb-2 flex items-center justify-between">
              <span>Definir Preços de Capa por País (17 Lojas Amazon)</span>
              <span className="text-[10px] text-slate-400 font-normal">Valores em Moeda Local</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto p-2 bg-slate-950 rounded-xl border border-slate-800">
              {MARKETPLACE_LIST.map((mkt) => (
                <div key={mkt.id} className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <div className="flex items-center justify-between text-[11px] font-medium text-slate-300 mb-1">
                    <span className="flex items-center space-x-1 truncate">
                      <span>{mkt.flag}</span>
                      <span>{mkt.name}</span>
                    </span>
                    <span className="text-slate-500 font-mono">{mkt.currency}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-slate-400 font-semibold">{mkt.currencySymbol}</span>
                    <input
                      type="number"
                      step="0.01"
                      value={prices[mkt.id] || 0}
                      onChange={(e) => handlePriceChange(mkt.id, Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-100 font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2 shrink-0">
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
              Salvar Livro no Catálogo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
