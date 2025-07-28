import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../lib/api';
import { invalidateRelatedQueries } from '../lib/queryClient';

// Hook para obtener todos los usuarios
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await userApi.getAll();
      // userApi.getAll() devuelve { success, users, total, source }
      if (response && response.users) {
        return response.users;
      }
      return Array.isArray(response) ? response : [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: true,
    retry: 2,
    meta: {
      errorMessage: 'Error al cargar los usuarios'
    }
  });
}

// Hook para crear un usuario
export function useCreateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userData) => {
      const response = await userApi.create(userData);
      return response;
    },
    onSuccess: (data, variables) => {
      // Invalidar queries relacionadas
      invalidateRelatedQueries('user');
      
      // Añadir el nuevo usuario al cache optimísticamente
      queryClient.setQueryData(['users'], (oldData) => {
        if (!oldData) return [data];
        return [...oldData, data];
      });
    },
    onError: (error, variables, context) => {
      console.error('Error creando usuario:', error);
    },
    meta: {
      successMessage: 'Usuario creado exitosamente',
      errorMessage: 'Error al crear el usuario'
    }
  });
}

// Hook para actualizar un usuario
export function useUpdateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...userData }) => {
      const response = await userApi.update({ id, ...userData });
      return response;
    },
    onSuccess: (data, variables) => {
      // Invalidar queries relacionadas
      invalidateRelatedQueries('user');
      
      // Actualizar la lista de usuarios
      queryClient.setQueryData(['users'], (oldData) => {
        if (!oldData) return [data];
        return oldData.map(user => 
          user.id === variables.id ? { ...user, ...data } : user
        );
      });
    },
    onError: (error, variables, context) => {
      console.error('Error actualizando usuario:', error);
    },
    meta: {
      successMessage: 'Usuario actualizado exitosamente',
      errorMessage: 'Error al actualizar el usuario'
    }
  });
}

// Hook para eliminar un usuario
export function useDeleteUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId) => {
      const response = await userApi.delete(userId);
      return response;
    },
    onMutate: async (userId) => {
      // Cancelar queries en progreso
      await queryClient.cancelQueries({ queryKey: ['users'] });
      
      // Snapshot del estado anterior
      const previousUsers = queryClient.getQueryData(['users']);
      
      // Actualización optimista: remover el usuario inmediatamente
      queryClient.setQueryData(['users'], (oldData) => {
        if (!oldData) return [];
        return oldData.filter(user => user.id !== userId);
      });
      
      // Retornar contexto para rollback si es necesario
      return { previousUsers };
    },
    onError: (error, userId, context) => {
      // Rollback en caso de error
      if (context?.previousUsers) {
        queryClient.setQueryData(['users'], context.previousUsers);
      }
      console.error('Error eliminando usuario:', error);
    },
    onSuccess: (data, variables) => {
      // Invalidar queries relacionadas
      invalidateRelatedQueries('user');
    },
    meta: {
      successMessage: 'Usuario eliminado exitosamente',
      errorMessage: 'Error al eliminar el usuario'
    }
  });
}
