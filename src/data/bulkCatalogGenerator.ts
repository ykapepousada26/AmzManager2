import { Book, BookFormat, CountryId, SaleOrder } from '../types';
import { AMAZON_MARKETPLACES } from './marketplaces';

const GENRES = [
  'Desenvolvimento Pessoal',
  'Tecnologia & Programação',
  'Finanças & Investimentos',
  'Ficção Científica',
  'Engenharia de Software',
  'Negócios & Empreendedorismo',
  'História & Biografia',
  'Psicologia & Comportamento',
  'Romance & Literatura',
  'Saúde & Bem-Estar',
  'Filosofia & Sociedade',
  'Marketing Digital',
];

const AUTHORS = [
  'Lucas Mendes',
  'Carlos Eduardo Silva',
  'Mariana Santos',
  'Fernanda Oliveira',
  'Roberto Almeida',
  'Beatriz Lima',
  'Gabriel Costa',
  'Juliana Rocha',
  'Rodrigo Martins',
  'Camila Ribeiro',
];

const TITLE_PREFIXES = [
  'O Segredo de',
  'Guia Prático de',
  'Manual Avançado de',
  'A Arte de',
  'Domine o',
  'Estruturas de',
  'O Código do',
  'Fundamentos de',
  'As Leis de',
  'O Poder do',
  'Estratégias de',
  'A Revolução do',
  'Caminhos para',
  'A Mente de',
  'Práticas de',
];

const TITLE_SUBJECTS = [
  'Sucesso Financeiro',
  'Arquitetura de Sistemas',
  'Foco e Produtividade',
  'Inteligência Artificial',
  'Liderança Estratégica',
  'Investimentos Internacionais',
  'Redes de Computadores',
  'Gestão do Tempo',
  'Machine Learning',
  'Comunicação de Alto Impacto',
  'Cybersegurança',
  'Empreendedorismo Digital',
  'Design de Experiência do Usuário',
  'Mindset Vencedor',
  'Metodologias Ágeis',
];

const FORMATS: BookFormat[] = ['Ebook', 'Capa Comum', 'Capa Dura'];

export function generate2000BooksCatalog(count: number = 2050): Book[] {
  const books: Book[] = [];

  for (let i = 1; i <= count; i++) {
    const prefix = TITLE_PREFIXES[i % TITLE_PREFIXES.length];
    const subject = TITLE_SUBJECTS[(i * 3) % TITLE_SUBJECTS.length];
    const vol = Math.floor(i / 15) + 1;
    const title = vol > 1 ? `${prefix} ${subject} - Vol. ${vol}` : `${prefix} ${subject}`;

    const author = AUTHORS[i % AUTHORS.length];
    const format = FORMATS[i % FORMATS.length];
    const genre = GENRES[i % GENRES.length];
    const pageCount = 120 + ((i * 17) % 400);

    const isEbook = format === 'Ebook';
    const isHardcover = format === 'Capa Dura';

    const kdpRoyaltyRate = isEbook ? 0.70 : (isHardcover ? 0.60 : 0.60);
    const printingCostUSD = isEbook ? 0 : (isHardcover ? 6.50 : 3.20);

    const baseUSD = isEbook ? 4.99 + ((i % 10) * 1.0) : 14.99 + ((i % 25) * 1.5);

    const prices: Record<CountryId, number> = {
      US: Number(baseUSD.toFixed(2)),
      MX: Number((baseUSD * 18.5).toFixed(2)),
      CA: Number((baseUSD * 1.35).toFixed(2)),
      AU: Number((baseUSD * 1.52).toFixed(2)),
      JP: Math.round(baseUSD * 145),
      AE: Number((baseUSD * 3.67).toFixed(2)),
      FR: Number((baseUSD * 0.92).toFixed(2)),
      DE: Number((baseUSD * 0.92).toFixed(2)),
      ES: Number((baseUSD * 0.92).toFixed(2)),
      IT: Number((baseUSD * 0.92).toFixed(2)),
      NL: Number((baseUSD * 0.92).toFixed(2)),
      BE: Number((baseUSD * 0.92).toFixed(2)),
      IE: Number((baseUSD * 0.92).toFixed(2)),
      TR: Number((baseUSD * 33.0).toFixed(2)),
      PL: Number((baseUSD * 4.05).toFixed(2)),
      SE: Number((baseUSD * 10.5).toFixed(2)),
      GB: Number((baseUSD * 0.78).toFixed(2)),
    };

    const isbn = `978-6555${String(i).padStart(6, '0')}`;
    const coverImages = [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=80',
    ];

    books.push({
      id: `book-bulk-${i}`,
      title,
      author,
      isbn,
      coverUrl: coverImages[i % coverImages.length],
      format,
      genre,
      pageCount,
      publicationDate: `2024-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
      kdpRoyaltyRate,
      printingCostUSD,
      prices,
    });
  }

  return books;
}

export function generateBulkSales(booksList: Book[], count: number = 400): SaleOrder[] {
  const countries: CountryId[] = [
    'US', 'MX', 'CA', 'AU', 'JP', 'AE', 'FR', 'DE', 'ES', 'IT', 'NL', 'BE', 'IE', 'TR', 'PL', 'SE', 'GB'
  ];

  const countryWeights: Record<CountryId, number> = {
    US: 25, GB: 12, DE: 10, CA: 8, FR: 7, ES: 6, IT: 6, JP: 5, AU: 4, MX: 4, NL: 3, BE: 2, PL: 2, SE: 2, AE: 2, TR: 1, IE: 1,
  };

  const now = new Date();
  const orders: SaleOrder[] = [];
  const safeBooks = booksList.length > 0 ? booksList : generate2000BooksCatalog(100);

  for (let i = 0; i < count; i++) {
    const rand = Math.random() * 100;
    let cumulative = 0;
    let selectedCountry: CountryId = 'US';
    for (const c of countries) {
      cumulative += countryWeights[c];
      if (rand <= cumulative) {
        selectedCountry = c;
        break;
      }
    }

    const mkt = AMAZON_MARKETPLACES[selectedCountry];
    const book = safeBooks[i % safeBooks.length];
    const units = Math.floor(Math.random() * 3) + 1;
    const pricePerUnit = book.prices[selectedCountry] || 15.0;
    const grossTotal = Number((units * pricePerUnit).toFixed(2));

    const printingInLocal = book.printingCostUSD * (mkt.exchangeRateToBRL / 5.60) / (mkt.exchangeRateToBRL || 1);
    const amazonFee = Number((grossTotal * (1 - book.kdpRoyaltyRate) + (units * printingInLocal)).toFixed(2));
    const netRoyalty = Math.max(0, Number((grossTotal - amazonFee).toFixed(2)));

    const grossTotalBRL = Number((grossTotal * mkt.exchangeRateToBRL).toFixed(2));
    const netRoyaltyBRL = Number((netRoyalty * mkt.exchangeRateToBRL).toFixed(2));

    const daysAgo = Math.floor(Math.random() * 60);
    const orderDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    orders.push({
      id: `ord-bulk-${i + 1000}`,
      amazonOrderId: `114-${Math.floor(1000000 + Math.random() * 9000000)}-${Math.floor(1000000 + Math.random() * 9000000)}`,
      bookId: book.id,
      bookTitle: book.title,
      countryId: selectedCountry,
      countryName: mkt.name,
      currency: mkt.currency,
      currencySymbol: mkt.currencySymbol,
      units,
      pricePerUnit,
      grossTotal,
      amazonFee,
      netRoyalty,
      grossTotalBRL,
      netRoyaltyBRL,
      date: orderDate.toISOString().split('T')[0],
      format: book.format,
      status: Math.random() > 0.05 ? 'Concluído' : (Math.random() > 0.5 ? 'Pendente' : 'Reembolsado'),
    });
  }

  return orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function parseCsvCatalog(csvText: string): Book[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];

  const books: Book[] = [];
  const startIndex = lines[0].toLowerCase().includes('title') || lines[0].toLowerCase().includes('titulo') ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const cols = lines[i].split(/[,;\t]/).map((c) => c.replace(/^"|"$/g, '').trim());
    if (cols.length < 2) continue;

    const title = cols[0] || `Livro ${i}`;
    const author = cols[1] || 'Autor Desconhecido';
    const isbn = cols[2] || `978-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    const formatRaw = (cols[3] || 'Capa Comum').toLowerCase();
    const format: BookFormat = formatRaw.includes('ebook') || formatRaw.includes('kindle') 
      ? 'Ebook' 
      : (formatRaw.includes('dura') || formatRaw.includes('hardcover') ? 'Capa Dura' : 'Capa Comum');
    
    const basePrice = parseFloat(cols[4]) || (format === 'Ebook' ? 7.99 : 19.99);

    books.push({
      id: `book-csv-${Date.now()}-${i}`,
      title,
      author,
      isbn,
      coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
      format,
      genre: cols[5] || 'Geral',
      pageCount: parseInt(cols[6]) || 200,
      publicationDate: new Date().toISOString().split('T')[0],
      kdpRoyaltyRate: format === 'Ebook' ? 0.70 : 0.60,
      printingCostUSD: format === 'Ebook' ? 0 : 3.50,
      prices: {
        US: basePrice,
        MX: Number((basePrice * 18.5).toFixed(2)),
        CA: Number((basePrice * 1.35).toFixed(2)),
        AU: Number((basePrice * 1.52).toFixed(2)),
        JP: Math.round(basePrice * 145),
        AE: Number((basePrice * 3.67).toFixed(2)),
        FR: Number((basePrice * 0.92).toFixed(2)),
        DE: Number((basePrice * 0.92).toFixed(2)),
        ES: Number((basePrice * 0.92).toFixed(2)),
        IT: Number((basePrice * 0.92).toFixed(2)),
        NL: Number((basePrice * 0.92).toFixed(2)),
        BE: Number((basePrice * 0.92).toFixed(2)),
        IE: Number((basePrice * 0.92).toFixed(2)),
        TR: Number((basePrice * 33.0).toFixed(2)),
        PL: Number((basePrice * 4.05).toFixed(2)),
        SE: Number((basePrice * 10.5).toFixed(2)),
        GB: Number((basePrice * 0.78).toFixed(2)),
      },
    });
  }

  return books;
}
