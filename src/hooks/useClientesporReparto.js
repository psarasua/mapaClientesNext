import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

/**
 * Hook para obtener todas las asignaciones cliente-reparto
 */
export function useClientesporReparto() {
  return useQuery({
    queryKey: ['clientesporreparto'],
    queryFn: async () => {
      const response = await fetch('/api/clientesporreparto');
      if (!response.ok) {
        throw new Error('Error al obtener asignaciones cliente-reparto');
      }
      const data = await response.json();
      return Array.isArray(data) ? data : (data.clientesReparto || data.data || []);
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}

/**
 * Hook para crear una nueva asignación cliente-reparto
 */
export function useCreateClienteReparto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newAssignment) => {
      const response = await fetch('/api/clientesporreparto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAssignment),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear asignación');
      }

      return response.json();
    },
    onMutate: async (newAssignment) => {
      // Cancelar queries salientes
      await queryClient.cancelQueries({ queryKey: ['clientesporreparto'] });

      // Snapshot del estado anterior
      const previousAssignments = queryClient.getQueryData(['clientesporreparto']);

      // Optimistic update
      queryClient.setQueryData(['clientesporreparto'], (old = []) => [
        ...old,
        {
          ...newAssignment,
          id: Date.now(), // ID temporal
          created_at: new Date().toISOString(),
        },
      ]);

      return { previousAssignments };
    },
    onError: (err, newAssignment, context) => {
      // Rollback en caso de error
      if (context?.previousAssignments) {
        queryClient.setQueryData(['clientesporreparto'], context.previousAssignments);
      }
    },
    onSettled: () => {
      // Refrescar datos
      queryClient.invalidateQueries({ queryKey: ['clientesporreparto'] });
    },
  });
}

/**
 * Hook para actualizar una asignación cliente-reparto
 */
export function useUpdateClienteReparto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updatedAssignment) => {
      const response = await fetch('/api/clientesporreparto', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedAssignment),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al actualizar asignación');
      }

      return response.json();
    },
    onMutate: async (updatedAssignment) => {
      await queryClient.cancelQueries({ queryKey: ['clientesporreparto'] });

      const previousAssignments = queryClient.getQueryData(['clientesporreparto']);

      queryClient.setQueryData(['clientesporreparto'], (old = []) =>
        old.map((assignment) =>
          assignment.id === updatedAssignment.id
            ? { ...assignment, ...updatedAssignment, updated_at: new Date().toISOString() }
            : assignment
        )
      );

      return { previousAssignments };
    },
    onError: (err, updatedAssignment, context) => {
      if (context?.previousAssignments) {
        queryClient.setQueryData(['clientesporreparto'], context.previousAssignments);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['clientesporreparto'] });
    },
  });
}

/**
 * Hook para eliminar una asignación cliente-reparto
 */
export function useDeleteClienteReparto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ client_id, reparto_id }) => {
      const response = await fetch(`/api/clientesporreparto?client_id=${client_id}&reparto_id=${reparto_id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al eliminar asignación');
      }

      return response.json();
    },
    onMutate: async ({ client_id, reparto_id }) => {
      await queryClient.cancelQueries({ queryKey: ['clientesporreparto'] });

      const previousAssignments = queryClient.getQueryData(['clientesporreparto']);

      queryClient.setQueryData(['clientesporreparto'], (old = []) =>
        old.filter((assignment) => 
          !(assignment.client_id === client_id && assignment.reparto_id === reparto_id)
        )
      );

      return { previousAssignments };
    },
    onError: (err, variables, context) => {
      if (context?.previousAssignments) {
        queryClient.setQueryData(['clientesporreparto'], context.previousAssignments);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['clientesporreparto'] });
    },
  });
}

/**
 * Hook para obtener asignaciones filtradas por cliente
 */
export function useClientesporRepartoByClient(clientId) {
  return useQuery({
    queryKey: ['clientesporreparto', 'client', clientId],
    queryFn: async () => {
      const response = await fetch(`/api/clientesporreparto?client_id=${clientId}`);
      if (!response.ok) {
        throw new Error('Error al obtener asignaciones del cliente');
      }
      const data = await response.json();
      return Array.isArray(data) ? data : (data.clientesReparto || data.data || []);
    },
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook para obtener asignaciones filtradas por reparto
 */
export function useClientesporRepartoByReparto(repartoId) {
  return useQuery({
    queryKey: ['clientesporreparto', 'reparto', repartoId],
    queryFn: async () => {
      const response = await fetch(`/api/clientesporreparto?reparto_id=${repartoId}`);
      if (!response.ok) {
        throw new Error('Error al obtener asignaciones del reparto');
      }
      const data = await response.json();
      return Array.isArray(data) ? data : (data.clientesReparto || data.data || []);
    },
    enabled: !!repartoId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook para estadísticas de asignaciones
 */
export function useClientesporRepartoStats() {
  const { data: assignments = [] } = useClientesporReparto();

  const stats = {
    total: assignments.length,
    byReparto: assignments.reduce((acc, assignment) => {
      acc[assignment.reparto_id] = (acc[assignment.reparto_id] || 0) + 1;
      return acc;
    }, {}),
    byClient: assignments.reduce((acc, assignment) => {
      acc[assignment.client_id] = (acc[assignment.client_id] || 0) + 1;
      return acc;
    }, {}),
  };

  return stats;
}
