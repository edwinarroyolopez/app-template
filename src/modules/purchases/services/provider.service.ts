import { providersApi } from './providers.api';

export const providerService = {
  list: providersApi.listProviders,
  create: providersApi.createProvider,
};
