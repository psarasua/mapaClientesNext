import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { truckApi } from '../lib/api';
import { invalidateRelatedQueries } from '../lib/queryClient';

// Hook para obtener todos los camiones
export function useTrucks() {
  return useQuery({
    queryKey: ['trucks'],
    queryFn: async () => {
      const response = await truckApi.getAll();
      // truckApi.getAll() devuelve { success, trucks, total, source }
      if (response && response.trucks) {
        return response.trucks;
      }
      return Array.isArray(response) ? response : [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: true,
    retry: 2,
    meta: {
      errorMessage: 'Error al cargar los camiones'
    }
  });
}

// Hook para crear un camión
export function useCreateTruck() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (truckData) => {
      const response = await truckApi.create(truckData);
      return response;
    },
    onSuccess: (data, variables) => {
      // Invalidar queries relacionadas
      invalidateRelatedQueries('truck');
      
      // Añadir el nuevo camión al cache optimísticamente
      queryClient.setQueryData(['trucks'], (oldData) => {
        if (!oldData) return [data];
        return [...oldData, data];
      });
    },
    onError: (error, variables, context) => {
      console.error('Error creando camión:', error);
    },
    meta: {
      successMessage: 'Camión creado exitosamente',
      errorMessage: 'Error al crear el camión'
    }
  });
}

// Hook para actualizar un camión
export function useUpdateTruck() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...truckData }) => {
      const response = await truckApi.update({ id, ...truckData });
      return response;
    },
    onSuccess: (data, variables) => {
      // Invalidar queries relacionadas
      invalidateRelatedQueries('truck');
      
      // Actualizar la lista de camiones
      queryClient.setQueryData(['trucks'], (oldData) => {
        if (!oldData) return [data];
        return oldData.map(truck => 
          truck.id === variables.id ? { ...truck, ...data } : truck
        );
      });
    },
    onError: (error, variables, context) => {
      console.error('Error actualizando camión:', error);
    },
    meta: {
      successMessage: 'Camión actualizado exitosamente',
      errorMessage: 'Error al actualizar el camión'
    }
  });
}

// Hook para eliminar un camión
export function useDeleteTruck() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (truckId) => {
      const response = await truckApi.delete(truckId);
      return response;
    },
    onMutate: async (truckId) => {
      // Cancelar queries en progreso
      await queryClient.cancelQueries({ queryKey: ['trucks'] });
      
      // Snapshot del estado anterior
      const previousTrucks = queryClient.getQueryData(['trucks']);
      
      // Actualización optimista: remover el camión inmediatamente
      queryClient.setQueryData(['trucks'], (oldData) => {
        if (!oldData) return [];
        return oldData.filter(truck => truck.id !== truckId);
      });
      
      // Retornar contexto para rollback si es necesario
      return { previousTrucks };
    },
    onError: (error, truckId, context) => {
      // Rollback en caso de error
      if (context?.previousTrucks) {
        queryClient.setQueryData(['trucks'], context.previousTrucks);
      }
      console.error('Error eliminando camión:', error);
    },
    onSuccess: (data, variables) => {
      // Invalidar queries relacionadas
      invalidateRelatedQueries('truck');
    },
    meta: {
      successMessage: 'Camión eliminado exitosamente',
      errorMessage: 'Error al eliminar el camión'
    }
  });
}
