export type CountryId =
  | 'US'
  | 'MX'
  | 'CA'
  | 'AU'
  | 'JP'
  | 'AE'
  | 'FR'
  | 'DE'
  | 'ES'
  | 'IT'
  | 'NL'
  | 'BE'
  | 'IE'
  | 'TR'
  | 'PL'
  | 'SE'
  | 'GB';

export type BookFormat = 'Ebook' | 'Capa Comum' | 'Capa Dura' | 'Audiobook';

export interface AmazonMarketplace {
  id: CountryId;
  name: string;
  domain: string;
  flag: string;
  currency: string;
  currencySymbol: string;
  exchangeRateToUSD: number; // 1 Local Currency = X USD
  exchangeRateToBRL: number; // 1 Local Currency = X BRL
  region: 'América' | 'Europa' | 'Ásia-Pacífico' | 'Oriente Médio';
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  coverUrl: string;
  format: BookFormat;
  genre: string;
  pageCount: number;
  publicationDate: string;
  kdpRoyaltyRate: number; // e.g. 0.70 (70%) or 0.35 (35%)
  printingCostUSD: number;
  prices: Record<CountryId, number>; // Local price per country
}

export interface SaleOrder {
  id: string;
  amazonOrderId: string;
  bookId: string;
  bookTitle: string;
  countryId: CountryId;
  countryName: string;
  currency: string;
  currencySymbol: string;
  units: number;
  pricePerUnit: number;
  grossTotal: number;
  amazonFee: number;
  netRoyalty: number;
  grossTotalBRL: number;
  netRoyaltyBRL: number;
  date: string;
  format: BookFormat;
  status: 'Concluído' | 'Pendente' | 'Reembolsado';
}

export interface AmazonApiConfig {
  isConnected: boolean;
  mode: 'sandbox' | 'live';
  sellerId: string;
  lwaClientId: string;
  lwaClientSecret: string;
  refreshToken: string;
  lastSyncTime: string | null;
  autoSyncEnabled: boolean;
}

export type DisplayCurrency = 'ORIGINAL' | 'BRL' | 'USD' | 'EUR';
