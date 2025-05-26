
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AdminStats {
  totalEvents: number;
  totalVenues: number;
  totalUsers: number;
  totalRevenue: number;
}

export const useAdminStats = () => {
  return useQuery({
    queryKey: ['adminStats'],
    queryFn: async (): Promise<AdminStats> => {
      // Fetch events count
      const { count: eventsCount, error: eventsError } = await supabase
        .from('Events')
        .select('*', { count: 'exact', head: true });

      if (eventsError) throw eventsError;

      // Fetch venues count
      const { count: venuesCount, error: venuesError } = await supabase
        .from('Venues')
        .select('*', { count: 'exact', head: true });

      if (venuesError) throw venuesError;

      // Fetch users count
      const { count: usersCount, error: usersError } = await supabase
        .from('Users')
        .select('*', { count: 'exact', head: true });

      if (usersError) throw usersError;

      // Fetch total revenue from paid transactions
      const { data: revenueData, error: revenueError } = await supabase
        .from('Transactions')
        .select('total_amount')
        .eq('payment_status', 'Paid');

      if (revenueError) throw revenueError;

      const totalRevenue = revenueData?.reduce((sum, transaction) => {
        return sum + (Number(transaction.total_amount) || 0);
      }, 0) || 0;

      return {
        totalEvents: eventsCount || 0,
        totalVenues: venuesCount || 0,
        totalUsers: usersCount || 0,
        totalRevenue,
      };
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};
