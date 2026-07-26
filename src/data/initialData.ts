import { Book, SaleOrder, AmazonApiConfig, CountryId } from '../types';
import { AMAZON_MARKETPLACES } from './marketplaces';

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

export const INITIAL_SALES: SaleOrder[] = generateSales();
