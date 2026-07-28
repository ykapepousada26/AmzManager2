import { Book, SaleOrder, AmazonApiConfig } from '../types';

export const INITIAL_BOOKS: Book[] = [];

export const INITIAL_SALES: SaleOrder[] = [];

export const INITIAL_API_CONFIG: AmazonApiConfig = {
  isConnected: false,
  sellerId: '',
  lwaClientId: '',
  lwaClientSecret: '',
  refreshToken: '',
  mode: 'live',
  lastSyncTime: '',
  autoSyncEnabled: false,
};
