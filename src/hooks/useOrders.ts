import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../services/orderService';
import type { Order } from '../types';

// Hook for fetching orders
export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => orderService.getAllOrders(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook for fetching order statistics
export const useOrderStats = () => {
  return useQuery({
    queryKey: ['orderStats'],
    queryFn: () => orderService.getOrderStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook for updating order status
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: Order['status'] }) =>
      orderService.updateOrderStatus(orderId, status),
    
    // Optimistic update - instantly update the UI
    onMutate: async ({ orderId, status }: { orderId: string; status: Order['status'] }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['orders'] });
      
      // Snapshot the previous value
      const previousOrders = queryClient.getQueryData<Order[]>(['orders']);
      
      // Optimistically update to the new value
      if (previousOrders) {
        queryClient.setQueryData<Order[]>(['orders'], (old = []) =>
          old.map(order =>
            order.id === orderId
              ? { ...order, status, updated_at: new Date().toISOString() }
              : order
          )
        );
      }
      
      // Return a context object with the snapshotted value
      return { previousOrders };
    },
    
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err: any, _variables: { orderId: string; status: Order['status'] }, context: any) => {
      console.error('❌ Order status update failed:', err);
      if (context?.previousOrders) {
        queryClient.setQueryData(['orders'], context.previousOrders);
      }
    },
    
    // Always refetch after error or success
    onSettled: () => {
      // Invalidate orders query to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      
      // Invalidate order stats to update the counts
      queryClient.invalidateQueries({ queryKey: ['orderStats'] });
    },
    
    onSuccess: (_data: any, variables: { orderId: string; status: Order['status'] }) => {
      console.log(`✅ Order ${variables.orderId} status updated to ${variables.status}`);
    },
  });
};
