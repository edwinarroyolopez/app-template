import { useProviders } from './useProviders';

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function usePurchaseProviders(search?: string) {
  const providersQuery = useProviders(search);

  function existsByName(name: string) {
    const target = normalize(name);
    return (providersQuery.data || []).some((provider) => normalize(provider.name) === target);
  }

  return {
    providers: providersQuery.data || [],
    existsByName,
    isLoading: providersQuery.isLoading,
    isFetching: providersQuery.isFetching,
  };
}
