import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { diaEntregaApi } from '../lib/api';
import { invalidateRelatedQueries } from '../lib/queryClient';

// Hook para obtener todos los días de entrega
export function useDiasEntrega() {
  return useQuery({
    queryKey: ['diasEntrega'],
    queryFn: async () => {
      const response = await diaEntregaApi.getAll();
      // diaEntregaApi.getAll() devuelve { success, diasEntrega, total, source }
      if (response && response.diasEntrega) {
        return response.diasEntrega;
      }
      return Array.isArray(response) ? response : [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: true,
    retry: 2,
    meta: {
      errorMessage: 'Error al cargar los días de entrega'
    }
  });
}

// Hook para crear un día de entrega
export function useCreateDiaEntrega() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (diaEntregaData) => {
      const response = await diaEntregaApi.create(diaEntregaData);
      return response;
    },
    onSuccess: (data, variables) => {
      // Invalidar queries relacionadas
      invalidateRelatedQueries('diaEntrega');
      
      // Añadir el nuevo día de entrega al cache optimísticamente
      queryClient.setQueryData(['diasEntrega'], (oldData) => {
        if (!oldData) return [data];
        return [...oldData, data];
      });
    },
    onError: (error, variables, context) => {
      console.error('Error creando día de entrega:', error);
    },
    meta: {
      successMessage: 'Día de entrega creado exitosamente',
      errorMessage: 'Error al crear el día de entrega'
    }
  });
}

// Hook para actualizar un día de entrega
export function useUpdateDiaEntrega() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...diaEntregaData }) => {
      const response = await diaEntregaApi.update({ id, ...diaEntregaData });
      return response;
    },
    onSuccess: (data, variables) => {
      // Invalidar queries relacionadas
      invalidateRelatedQueries('diaEntrega');
      
      // Actualizar la lista de días de entrega
      queryClient.setQueryData(['diasEntrega'], (oldData) => {
        if (!oldData) return [data];
        return oldData.map(dia => 
          dia.id === variables.id ? { ...dia, ...data } : dia
        );
      });
    },
    onError: (error, variables, context) => {
      console.error('Error actualizando día de entrega:', error);
    },
    meta: {
      successMessage: 'Día de entrega actualizado exitosamente',
      errorMessage: 'Error al actualizar el día de entrega'
    }
  });
}

// Hook para eliminar un día de entrega
export function useDeleteDiaEntrega() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (diaEntregaId) => {
      const response = await diaEntregaApi.delete(diaEntregaId);
      return response;
    },
    onMutate: async (diaEntregaId) => {
      // Cancelar queries en progreso
      await queryClient.cancelQueries({ queryKey: ['diasEntrega'] });
      
      // Snapshot del estado anterior
      const previousDiasEntrega = queryClient.getQueryData(['diasEntrega']);
      
      // Actualización optimista: remover el día de entrega inmediatamente
      queryClient.setQueryData(['diasEntrega'], (oldData) => {
        if (!oldData) return [];
        return oldData.filter(dia => dia.id !== diaEntregaId);
      });
      
      // Retornar contexto para rollback si es necesario
      return { previousDiasEntrega };
    },
    onError: (error, diaEntregaId, context) => {
      // Rollback en caso de error
      if (context?.previousDiasEntrega) {
        queryClient.setQueryData(['diasEntrega'], context.previousDiasEntrega);
      }
      console.error('Error eliminando día de entrega:', error);
    },
    onSuccess: (data, variables) => {
      // Invalidar queries relacionadas
      invalidateRelatedQueries('diaEntrega');
    },
    meta: {
      successMessage: 'Día de entrega eliminado exitosamente',
      errorMessage: 'Error al eliminar el día de entrega'
    }
  });
}
