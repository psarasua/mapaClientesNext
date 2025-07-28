import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { repartoApi } from '../lib/api';
import { invalidateRelatedQueries } from '../lib/queryClient';

// Hook para obtener todos los repartos
export function useRepartos() {
  return useQuery({
    queryKey: ['repartos'],
    queryFn: async () => {
      const response = await repartoApi.getAll();
      // repartoApi.getAll() devuelve { success, repartos, total, source }
      if (response && response.repartos) {
        return response.repartos;
      }
      return Array.isArray(response) ? response : [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: true,
    retry: 2,
    meta: {
      errorMessage: 'Error al cargar los repartos'
    }
  });
}

// Hook para crear un reparto
export function useCreateReparto() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (repartoData) => {
      const response = await repartoApi.create(repartoData);
      return response;
    },
    onSuccess: (data, variables) => {
      // Invalidar queries relacionadas
      invalidateRelatedQueries('reparto');
      
      // Añadir el nuevo reparto al cache optimísticamente
      queryClient.setQueryData(['repartos'], (oldData) => {
        if (!oldData) return [data];
        return [...oldData, data];
      });
    },
    onError: (error, variables, context) => {
      console.error('Error creando reparto:', error);
    },
    meta: {
      successMessage: 'Reparto creado exitosamente',
      errorMessage: 'Error al crear el reparto'
    }
  });
}

// Hook para actualizar un reparto
export function useUpdateReparto() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...repartoData }) => {
      const response = await repartoApi.update({ id, ...repartoData });
      return response;
    },
    onSuccess: (data, variables) => {
      // Invalidar queries relacionadas
      invalidateRelatedQueries('reparto');
      
      // Actualizar la lista de repartos
      queryClient.setQueryData(['repartos'], (oldData) => {
        if (!oldData) return [data];
        return oldData.map(reparto => 
          reparto.id === variables.id ? { ...reparto, ...data } : reparto
        );
      });
    },
    onError: (error, variables, context) => {
      console.error('Error actualizando reparto:', error);
    },
    meta: {
      successMessage: 'Reparto actualizado exitosamente',
      errorMessage: 'Error al actualizar el reparto'
    }
  });
}

// Hook para eliminar un reparto
export function useDeleteReparto() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (repartoId) => {
      const response = await repartoApi.delete(repartoId);
      return response;
    },
    onMutate: async (repartoId) => {
      // Cancelar queries en progreso
      await queryClient.cancelQueries({ queryKey: ['repartos'] });
      
      // Snapshot del estado anterior
      const previousRepartos = queryClient.getQueryData(['repartos']);
      
      // Actualización optimista: remover el reparto inmediatamente
      queryClient.setQueryData(['repartos'], (oldData) => {
        if (!oldData) return [];
        return oldData.filter(reparto => reparto.id !== repartoId);
      });
      
      // Retornar contexto para rollback si es necesario
      return { previousRepartos };
    },
    onError: (error, repartoId, context) => {
      // Rollback en caso de error
      if (context?.previousRepartos) {
        queryClient.setQueryData(['repartos'], context.previousRepartos);
      }
      console.error('Error eliminando reparto:', error);
    },
    onSuccess: (data, variables) => {
      // Invalidar queries relacionadas
      invalidateRelatedQueries('reparto');
    },
    meta: {
      successMessage: 'Reparto eliminado exitosamente',
      errorMessage: 'Error al eliminar el reparto'
    }
  });
}
