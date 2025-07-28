// Configuración del QueryClient para React Query
import { QueryClient } from '@tanstack/react-query';

// Crear una instancia del QueryClient con configuración optimizada
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Tiempo que los datos se consideran "frescos" (5 minutos)
      staleTime: 5 * 60 * 1000,
      // Tiempo que los datos se mantienen en caché (10 minutos)
      gcTime: 10 * 60 * 1000,
      // Refetch cuando la ventana vuelve a tener foco
      refetchOnWindowFocus: true,
      // Refetch cuando se reconecta la red
      refetchOnReconnect: true,
      // Reintentos automáticos en caso de error
      retry: 2,
      // Función de reintento con backoff exponencial
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Reintentos para mutaciones (crear, actualizar, eliminar)
      retry: 1,
      // Función de reintento más conservadora para mutaciones
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    },
  },
});

// Función helper para invalidar queries relacionadas después de mutaciones
export const invalidateRelatedQueries = async (entityType) => {
  switch (entityType) {
    case 'client':
      await queryClient.invalidateQueries({ queryKey: ['clients'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      break;
    case 'user':
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      break;
    case 'truck':
      await queryClient.invalidateQueries({ queryKey: ['trucks'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      break;
    case 'reparto':
      await queryClient.invalidateQueries({ queryKey: ['repartos'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      break;
    case 'diaEntrega':
      await queryClient.invalidateQueries({ queryKey: ['diasEntrega'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      break;
    case 'clienteporReparto':
      await queryClient.invalidateQueries({ queryKey: ['clientesporReparto'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      break;
    default:
      // Invalidar todo el dashboard por defecto
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  }
};
