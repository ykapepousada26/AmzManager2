import { Book, SaleOrder, AmazonApiConfig, CountryId } from '../types';
import { AMAZON_MARKETPLACES } from './marketplaces';
import { generate2000BooksCatalog, generateBulkSales } from './bulkCatalogGenerator';

export const INITIAL_BOOKS: Book[] = [
  {
    id: 'book-1',
    title: 'O Enigma do Horizonte Direct',
    author: 'Lucas Mendes',
    isbn: '978-6555123012',
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80',
    format: 'Capa Comum',
    genre: 'Ficção / Thriller',
    pageCount: 320,
    publicationDate: '2025-03-15',
    kdpRoyaltyRate: 0.70,
    printingCostUSD: 3.50,
    prices: {
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
    },
  },
  {
    id: 'book-2',
    title: 'Códigos do Futuro: Guia Prático de IA',
    author: 'Lucas Mendes & Ana Silva',
    isbn: '978-6555123029',
    coverUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=400&q=80',
    format: 'Ebook',
    genre: 'Tecnologia / Não-Ficção',
    pageCount: 210,
    publicationDate: '2025-06-01',
    kdpRoyaltyRate: 0.70,
    printingCostUSD: 0,
    prices: {
      US: 9.99,
      MX: 179.00,
      CA: 12.99,
      AU: 14.99,
      JP: 1200,
      AE: 36.90,
      FR: 8.99,
      DE: 8.99,
      ES: 8.99,
      IT: 8.99,
      NL: 8.99,
      BE: 8.99,
      IE: 8.99,
      TR: 199.00,
      PL: 39.90,
      SE: 99.00,
      GB: 7.99,
    },
  },
  {
    id: 'book-3',
    title: 'A Jornada do Líder Global',
    author: 'Lucas Mendes',
    isbn: '978-6555123036',
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80',
    format: 'Capa Dura',
    genre: 'Negócios / Gestão',
    pageCount: 410,
    publicationDate: '2025-09-10',
    kdpRoyaltyRate: 0.60,
    printingCostUSD: 6.20,
    prices: {
      US: 24.99,
      MX: 449.00,
      CA: 32.99,
      AU: 36.00,
      JP: 3200,
      AE: 92.00,
      FR: 22.99,
      DE: 22.99,
      ES: 22.99,
      IT: 22.99,
      NL: 22.99,
      BE: 22.99,
      IE: 22.99,
      TR: 550.00,
      PL: 99.00,
      SE: 269.00,
      GB: 19.99,
    },
  },
  {
    id: 'book-4',
    title: 'O Milagre da Mente Focada',
    author: 'Lucas Mendes',
    isbn: '978-6555123043',
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
    format: 'Ebook',
    genre: 'Desenvolvimento Pessoal',
    pageCount: 185,
    publicationDate: '2025-01-20',
    kdpRoyaltyRate: 0.70,
    printingCostUSD: 0,
    prices: {
      US: 7.99,
      MX: 149.00,
      CA: 10.99,
      AU: 12.50,
      JP: 1000,
      AE: 29.90,
      FR: 6.99,
      DE: 6.99,
      ES: 6.99,
      IT: 6.99,
      NL: 6.99,
      BE: 6.99,
      IE: 6.99,
      TR: 150.00,
      PL: 32.90,
      SE: 85.00,
      GB: 5.99,
    },
  },
  {
    id: 'book-5',
    title: 'Algoritmos e Estrutura de Dados Modernos',
    author: 'Lucas Mendes & Carlos Eduardo',
    isbn: '978-6555123050',
    coverUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=400&q=80',
    format: 'Capa Comum',
    genre: 'Tecnologia / Programação',
    pageCount: 480,
    publicationDate: '2024-11-05',
    kdpRoyaltyRate: 0.70,
    printingCostUSD: 4.80,
    prices: {
      US: 29.99,
      MX: 549.00,
      CA: 39.99,
      AU: 44.90,
      JP: 3900,
      AE: 110.00,
      FR: 27.99,
      DE: 27.99,
      ES: 27.99,
      IT: 27.99,
      NL: 27.99,
      BE: 27.99,
      IE: 27.99,
      TR: 650.00,
      PL: 129.00,
      SE: 320.00,
      GB: 23.99,
    },
  },
  {
    id: 'book-6',
    title: 'Finanças Pessoais e Liberdade Financeira',
    author: 'Lucas Mendes',
    isbn: '978-6555123067',
    coverUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80',
    format: 'Ebook',
    genre: 'Finanças / Investimentos',
    pageCount: 230,
    publicationDate: '2025-04-12',
    kdpRoyaltyRate: 0.70,
    printingCostUSD: 0,
    prices: {
      US: 8.99,
      MX: 169.00,
      CA: 11.99,
      AU: 13.90,
      JP: 1100,
      AE: 32.90,
      FR: 7.99,
      DE: 7.99,
      ES: 7.99,
      IT: 7.99,
      NL: 7.99,
      BE: 7.99,
      IE: 7.99,
      TR: 180.00,
      PL: 36.90,
      SE: 92.00,
      GB: 6.99,
    },
  },
  {
    id: 'book-7',
    title: 'Crônicas das Estrelas Perdidas',
    author: 'Lucas Mendes',
    isbn: '978-6555123074',
    coverUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80',
    format: 'Capa Comum',
    genre: 'Ficção Científica',
    pageCount: 360,
    publicationDate: '2024-08-30',
    kdpRoyaltyRate: 0.70,
    printingCostUSD: 3.80,
    prices: {
      US: 16.99,
      MX: 310.00,
      CA: 22.99,
      AU: 25.00,
      JP: 2200,
      AE: 62.00,
      FR: 15.99,
      DE: 15.99,
      ES: 15.99,
      IT: 15.99,
      NL: 15.99,
      BE: 15.99,
      IE: 15.99,
      TR: 380.00,
      PL: 69.90,
      SE: 180.00,
      GB: 13.99,
    },
  },
  {
    id: 'book-8',
    title: 'Segredos da Arquitetura de Software',
    author: 'Lucas Mendes',
    isbn: '978-6555123081',
    coverUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=80',
    format: 'Capa Dura',
    genre: 'Engenharia de Software',
    pageCount: 520,
    publicationDate: '2025-02-18',
    kdpRoyaltyRate: 0.60,
    printingCostUSD: 7.50,
    prices: {
      US: 34.99,
      MX: 620.00,
      CA: 46.99,
      AU: 52.00,
      JP: 4600,
      AE: 130.00,
      FR: 32.99,
      DE: 32.99,
      ES: 32.99,
      IT: 32.99,
      NL: 32.99,
      BE: 32.99,
      IE: 32.99,
      TR: 750.00,
      PL: 149.00,
      SE: 380.00,
      GB: 27.99,
    },
  },
];

export const INITIAL_API_CONFIG: AmazonApiConfig = {
  isConnected: true,
  mode: 'sandbox',
  sellerId: 'A3L8BOOKSHOPPER',
  lwaClientId: 'amzn1.application-oa2-client.9842a1bc',
  lwaClientSecret: '••••••••••••••••••••••••••••••••',
  refreshToken: 'Atzr|IwEBIH4x79kP0q1vL...',
  lastSyncTime: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  autoSyncEnabled: true,
};

// Generate realistic sales orders across all 17 countries
const countries: CountryId[] = [
  'US', 'MX', 'CA', 'AU', 'JP', 'AE', 'FR', 'DE', 'ES', 'IT', 'NL', 'BE', 'IE', 'TR', 'PL', 'SE', 'GB'
];

function generateSales(): SaleOrder[] {
  const orders: SaleOrder[] = [];
  let orderCounter = 1001;

  // Generate sales for the last 60 days
  const now = new Date();
  
  // Sample distribution weights
  const countryWeights: Record<CountryId, number> = {
    US: 25,
    GB: 12,
    DE: 10,
    CA: 8,
    FR: 7,
    ES: 6,
    IT: 6,
    JP: 5,
    AU: 4,
    MX: 4,
    NL: 3,
    BE: 2,
    PL: 2,
    SE: 2,
    AE: 2,
    TR: 1,
    IE: 1,
  };

  for (let i = 0; i < 95; i++) {
    // Pick country based on distribution
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
    const book = INITIAL_BOOKS[i % INITIAL_BOOKS.length];
    const units = Math.floor(Math.random() * 3) + 1;
    const pricePerUnit = book.prices[selectedCountry] || 15.0;
    const grossTotal = Number((units * pricePerUnit).toFixed(2));
    
    // KDP Fee calculation (30% Amazon fee for 70% rate, plus printing if physical)
    const printingInLocal = book.printingCostUSD * (mkt.exchangeRateToBRL / 5.60) / (mkt.exchangeRateToBRL || 1);
    const amazonFee = Number((grossTotal * (1 - book.kdpRoyaltyRate) + (units * printingInLocal)).toFixed(2));
    const netRoyalty = Math.max(0, Number((grossTotal - amazonFee).toFixed(2)));

    const grossTotalBRL = Number((grossTotal * mkt.exchangeRateToBRL).toFixed(2));
    const netRoyaltyBRL = Number((netRoyalty * mkt.exchangeRateToBRL).toFixed(2));

    const daysAgo = Math.floor(Math.random() * 45);
    const orderDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    orders.push({
      id: `ord-${orderCounter}`,
      amazonOrderId: `${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000000 + Math.random() * 9000000)}-${Math.floor(1000000 + Math.random() * 9000000)}`,
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
      status: Math.random() > 0.04 ? 'Concluído' : (Math.random() > 0.5 ? 'Pendente' : 'Reembolsado'),
    });

    orderCounter++;
  }

  // Sort by date descending
  return orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export const INITIAL_SALES: SaleOrder[] = generateBulkSales(generate2000BooksCatalog(2050), 380);
