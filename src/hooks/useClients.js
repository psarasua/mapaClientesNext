import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientApi } from '../lib/api';
import { invalidateRelatedQueries } from '../lib/queryClient';

// Hook para obtener todos los clientes
export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const response = await clientApi.getAll();
      // clientApi.getAll() ya devuelve directamente el array de clientes
      return Array.isArray(response) ? response : [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: true,
    retry: 2,
    meta: {
      errorMessage: 'Error al cargar los clientes'
    }
  });
}

// Hook para obtener un cliente específico
export function useClient(id) {
  return useQuery({
    queryKey: ['clients', id],
    queryFn: async () => {
      const response = await clientApi.getById(id);
      return response;
    },
    enabled: !!id, // Solo ejecutar si hay ID
    staleTime: 5 * 60 * 1000,
    meta: {
      errorMessage: 'Error al cargar el cliente'
    }
  });
}

// Hook para crear un cliente
export function useCreateClient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (clientData) => {
      const response = await clientApi.create(clientData);
      return response;
    },
    onSuccess: (data, variables) => {
      // Invalidar queries relacionadas
      invalidateRelatedQueries('client');
      
      // Añadir el nuevo cliente al cache optimísticamente si es posible
      queryClient.setQueryData(['clients'], (oldData) => {
        if (!oldData) return [data];
        return [...oldData, data];
      });
    },
    onError: (error, variables, context) => {
      console.error('Error creando cliente:', error);
    },
    meta: {
      successMessage: 'Cliente creado exitosamente',
      errorMessage: 'Error al crear el cliente'
    }
  });
}

// Hook para actualizar un cliente
export function useUpdateClient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...clientData }) => {
      const response = await clientApi.update({ id, ...clientData });
      return response;
    },
    onSuccess: (data, variables) => {
      // Invalidar queries relacionadas
      invalidateRelatedQueries('client');
      
      // Actualizar el cliente específico en el cache
      queryClient.setQueryData(['clients', variables.id], data);
      
      // Actualizar la lista de clientes
      queryClient.setQueryData(['clients'], (oldData) => {
        if (!oldData) return [data];
        return oldData.map(client => 
          client.id === variables.id ? { ...client, ...data } : client
        );
      });
    },
    onError: (error, variables, context) => {
      console.error('Error actualizando cliente:', error);
    },
    meta: {
      successMessage: 'Cliente actualizado exitosamente',
      errorMessage: 'Error al actualizar el cliente'
    }
  });
}

// Hook para eliminar un cliente
export function useDeleteClient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (clientId) => {
      const response = await clientApi.delete(clientId);
      return response;
    },
    onMutate: async (clientId) => {
      // Cancelar queries en progreso
      await queryClient.cancelQueries({ queryKey: ['clients'] });
      
      // Snapshot del estado anterior
      const previousClients = queryClient.getQueryData(['clients']);
      
      // Actualización optimista: remover el cliente inmediatamente
      queryClient.setQueryData(['clients'], (oldData) => {
        if (!oldData) return [];
        return oldData.filter(client => client.id !== clientId);
      });
      
      // Retornar contexto para rollback si es necesario
      return { previousClients };
    },
    onError: (error, clientId, context) => {
      // Rollback en caso de error
      if (context?.previousClients) {
        queryClient.setQueryData(['clients'], context.previousClients);
      }
      console.error('Error eliminando cliente:', error);
    },
    onSuccess: (data, variables) => {
      // Invalidar queries relacionadas
      invalidateRelatedQueries('client');
      
      // Remover el cliente específico del cache
      queryClient.removeQueries({ queryKey: ['clients', variables] });
    },
    meta: {
      successMessage: 'Cliente eliminado exitosamente',
      errorMessage: 'Error al eliminar el cliente'
    }
  });
}
