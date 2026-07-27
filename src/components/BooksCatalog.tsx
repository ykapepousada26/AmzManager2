import React, { useState, useEffect } from 'react';
import { Book, CountryId } from '../types';
import { MARKETPLACE_LIST, AMAZON_MARKETPLACES } from '../data/marketplaces';
import { BookOpen, Plus, Search, ExternalLink, Sparkles, Globe, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';

interface BooksCatalogProps {
  books: Book[];
  onAddBook: () => void;
  onEditBook?: (book: Book) => void;
  onResetCatalog?: () => void;
}

export const BooksCatalog: React.FC<BooksCatalogProps> = ({
  books,
  onAddBook,
  onEditBook,
  onResetCatalog,
}) => {
  const [selectedBook, setSelectedBook] = useState<Book | null>(books[0] || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formatFilter, setFormatFilter] = useState<'Todos' | 'Ebook' | 'Capa Comum' | 'Capa Dura'>('Todos');

  // Pagination for large 2000+ book catalogs
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, formatFilter]);

  const filteredBooks = books.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.isbn.includes(searchQuery);
    const matchesFormat = formatFilter === 'Todos' || b.format === formatFilter;
    return matchesSearch && matchesFormat;
  });

  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedBooks = filteredBooks.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);

  const activeBook = selectedBook || paginatedBooks[0] || books[0];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg p-5 mb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <span>Catálogo de Livros e Títulos Publicados</span>
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {books.length} {books.length === 1 ? 'Livro' : 'Livros'} à Venda
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Gerencie preços de capa, ISBN e royalties KDP por cada um dos 17 países onde suas obras estão à venda.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          {onResetCatalog && (
            <button
              onClick={onResetCatalog}
              title="Restaurar catálogo completo com todos os títulos"
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold rounded-xl text-xs transition-all flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Sincronizar Catálogo ({books.length})</span>
            </button>
          )}

          <button
            onClick={onAddBook}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center space-x-1.5 shadow-md"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Cadastrar Novo Livro (ISBN)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-5">
        {/* Books List Column */}
        <div className="lg:col-span-5 space-y-3">
          {/* Search and Format Filters */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por título, autor ou ISBN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Format Pills Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
              {(['Todos', 'Ebook', 'Capa Comum', 'Capa Dura'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setFormatFilter(fmt)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all shrink-0 ${
                    formatFilter === fmt
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>Listando {filteredBooks.length} de {books.length} títulos</span>
            {filteredBooks.length === 0 && (
              <button
                onClick={() => { setSearchQuery(''); setFormatFilter('Todos'); }}
                className="text-amber-400 hover:underline"
              >
                Limpar filtros
              </button>
            )}
          </div>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {paginatedBooks.length === 0 ? (
              <div className="text-center py-8 bg-slate-950/40 rounded-xl border border-slate-800 text-slate-400 text-xs">
                Nenhum livro encontrado com os filtros atuais.
              </div>
            ) : (
              paginatedBooks.map((book) => {
                const isSelected = activeBook && activeBook.id === book.id;

                return (
                  <div
                    key={book.id}
                    onClick={() => setSelectedBook(book)}
                    className={`flex items-start space-x-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-800 border-amber-500/80 text-slate-100 shadow-md ring-1 ring-amber-500/30'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/40 hover:border-slate-700'
                    }`}
                  >
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="w-14 h-20 object-cover rounded-lg shadow border border-slate-700/50 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          {book.format}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-bold">
                          {(book.kdpRoyaltyRate * 100).toFixed(0)}% Royalty
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-100 truncate">{book.title}</h4>
                      <p className="text-[11px] text-slate-400 truncate">{book.author}</p>
                      <div className="flex items-center space-x-2 text-[10px] text-slate-500 mt-2">
                        <span>ISBN: {book.isbn}</span>
                        <span>•</span>
                        <span>{book.pageCount} págs.</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs text-slate-400">
              <button
                disabled={safePage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center space-x-2">
                <span>Página <strong className="text-amber-400">{safePage}</strong> de <strong className="text-slate-200">{totalPages}</strong></span>
              </div>

              <button
                disabled={safePage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Selected Book Details & 17 Marketplace Prices */}
        {activeBook && (
          <div className="lg:col-span-7 bg-slate-950/80 border border-slate-800 rounded-2xl p-5">
            <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4 pb-5 border-b border-slate-800">
              <img
                src={activeBook.coverUrl}
                alt={activeBook.title}
                className="w-24 h-36 object-cover rounded-xl shadow-xl border border-slate-700 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {activeBook.format}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">ISBN: {activeBook.isbn}</span>
                </div>
                <h3 className="text-lg font-extrabold text-slate-100 leading-tight">
                  {activeBook.title}
                </h3>
                <p className="text-xs text-slate-300 mt-1 font-medium">Por {activeBook.author}</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 text-xs">
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Gênero</span>
                    <span className="font-semibold text-slate-200">{activeBook.genre}</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Páginas</span>
                    <span className="font-semibold text-slate-200">{activeBook.pageCount} pág.</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Taxa KDP</span>
                    <span className="font-bold text-emerald-400">
                      {(activeBook.kdpRoyaltyRate * 100).toFixed(0)}% Royalty
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Price list per Marketplace */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                  <Globe className="w-4 h-4 text-amber-400" />
                  <span>Preço de Capa Configurado em cada Loja Amazon (17 Países)</span>
                </h4>
                <span className="text-[10px] text-slate-400">Moeda Local por País</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-64 overflow-y-auto pr-1">
                {MARKETPLACE_LIST.map((mkt) => {
                  const localPrice = activeBook.prices[mkt.id] || 0;
                  const estimatedRoyalty = localPrice * activeBook.kdpRoyaltyRate;

                  return (
                    <div
                      key={mkt.id}
                      className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                        <span className="flex items-center space-x-1">
                          <span>{mkt.flag}</span>
                          <span>{mkt.name}</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">{mkt.id}</span>
                      </div>

                      <div className="mt-1.5 font-bold text-slate-100 text-xs">
                        {mkt.currencySymbol} {localPrice.toFixed(2)}
                      </div>

                      <div className="text-[10px] text-emerald-400 font-medium mt-0.5">
                        Est. Royalty: {mkt.currencySymbol} {estimatedRoyalty.toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
