import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

/**
 * Hook para manejo de autenticación con React Query
 */
export function useAuth() {
  const queryClient = useQueryClient();

  // Query para obtener el usuario actual
  const {
    data: user,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['auth', 'currentUser'],
    queryFn: async () => {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          return null; // No autenticado
        }
        throw new Error('Error al verificar autenticación');
      }
      
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: (failureCount, error) => {
      // No reintentar si es 401 (no autorizado)
      if (error?.message?.includes('401')) return false;
      return failureCount < 3;
    }
  });

  // Mutation para login
  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error en el login');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Actualizar cache con datos del usuario
      queryClient.setQueryData(['auth', 'currentUser'], data.user);
      
      // Invalidar otras queries que puedan depender de la autenticación
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['trucks'] });
    },
    onError: (error) => {
      console.error('Error en login:', error);
    }
  });

  // Mutation para logout
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Error al cerrar sesión');
      }

      return response.json();
    },
    onSuccess: () => {
      // Limpiar cache de usuario
      queryClient.setQueryData(['auth', 'currentUser'], null);
      
      // Limpiar todas las queries para evitar mostrar datos sin autorización
      queryClient.clear();
    },
    onError: (error) => {
      console.error('Error en logout:', error);
    }
  });

  // Mutation para registro (si está disponible)
  const registerMutation = useMutation({
    mutationFn: async (userData) => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error en el registro');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Actualizar cache con datos del nuevo usuario
      queryClient.setQueryData(['auth', 'currentUser'], data.user);
    },
    onError: (error) => {
      console.error('Error en registro:', error);
    }
  });

  // Funciones de conveniencia
  const login = (credentials) => loginMutation.mutate(credentials);
  const logout = () => logoutMutation.mutate();
  const register = (userData) => registerMutation.mutate(userData);

  // Estado de las mutaciones
  const isLoggingIn = loginMutation.isPending;
  const isLoggingOut = logoutMutation.isPending;
  const isRegistering = registerMutation.isPending;

  // Errores de las mutaciones
  const loginError = loginMutation.error;
  const logoutError = logoutMutation.error;
  const registerError = registerMutation.error;

  return {
    // Estado del usuario
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    
    // Funciones de autenticación
    login,
    logout,
    register,
    refetch,
    
    // Estados de carga
    isLoggingIn,
    isLoggingOut,
    isRegistering,
    
    // Errores
    loginError,
    logoutError,
    registerError,
    
    // Mutations para uso avanzado
    loginMutation,
    logoutMutation,
    registerMutation
  };
}

/**
 * Hook para verificar permisos de usuario
 */
export function usePermissions() {
  const { user, isAuthenticated } = useAuth();

  const hasPermission = (permission) => {
    if (!isAuthenticated || !user) return false;
    
    // Lógica de permisos basada en rol o permisos específicos
    if (user.role === 'admin') return true;
    
    // Agregar más lógica de permisos según sea necesario
    return user.permissions?.includes(permission) || false;
  };

  const isAdmin = () => hasPermission('admin') || user?.role === 'admin';
  const canManageUsers = () => hasPermission('manage_users') || isAdmin();
  const canManageClients = () => hasPermission('manage_clients') || isAdmin();
  const canManageTrucks = () => hasPermission('manage_trucks') || isAdmin();

  return {
    hasPermission,
    isAdmin,
    canManageUsers,
    canManageClients,
    canManageTrucks
  };
}
