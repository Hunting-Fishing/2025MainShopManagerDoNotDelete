import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Types
export interface GunsmithJob {
  id: string;
  job_number: string;
  customer_id?: string;
  firearm_id?: string;
  status: string;
  priority: string;
  job_type: string;
  description?: string;
  diagnosis?: string;
  work_performed?: string;
  labor_hours?: number;
  labor_rate?: number;
  parts_cost?: number;
  total_cost?: number;
  estimated_completion?: string;
  actual_completion?: string;
  assigned_to?: string;
  received_date?: string;
  notes?: string;
  created_at: string;
  customers?: { first_name: string; last_name?: string };
  gunsmith_firearms?: { make: string; model: string; serial_number?: string };
}

export interface GunsmithFirearm {
  id: string;
  customer_id: string;
  make: string;
  model: string;
  serial_number?: string;
  caliber?: string;
  firearm_type: string;
  classification: string;
  barrel_length?: number;
  registration_number?: string;
  condition?: string;
  notes?: string;
  customers?: { first_name: string; last_name?: string };
}

export interface GunsmithPart {
  id: string;
  part_number?: string;
  name: string;
  category?: string;
  manufacturer?: string;
  quantity: number;
  min_quantity: number;
  unit_cost?: number;
  retail_price?: number;
  location?: string;
}

// Stats hook
export function useGunsmithStats() {
  return useQuery({
    queryKey: ['gunsmith-stats'],
    queryFn: async () => {
      const [jobsResult, partsResult, appointmentsResult, licensesResult] = await Promise.all([
        (supabase as any).from('gunsmith_jobs').select('status, total_cost'),
        (supabase as any).from('gunsmith_parts').select('quantity, min_quantity'),
        (supabase as any).from('gunsmith_appointments').select('status').eq('status', 'scheduled'),
        (supabase as any).from('gunsmith_customer_licenses').select('expiry_date')
      ]);

      const jobs = jobsResult.data || [];
      const parts = partsResult.data || [];
      const appointments = appointmentsResult.data || [];
      const licenses = licensesResult.data || [];

      const pendingJobs = jobs.filter((j: any) => j.status === 'pending').length;
      const inProgressJobs = jobs.filter((j: any) => j.status === 'in_progress').length;
      const completedJobs = jobs.filter((j: any) => j.status === 'completed').length;
      const revenue = jobs.filter((j: any) => j.status === 'completed').reduce((sum: number, j: any) => sum + (j.total_cost || 0), 0);
      const lowStockParts = parts.filter((p: any) => p.quantity <= p.min_quantity).length;
      const upcomingAppointments = appointments.length;
      
      const today = new Date();
      const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
      const expiringLicenses = licenses.filter((l: any) => {
        const expiry = new Date(l.expiry_date);
        return expiry <= thirtyDaysFromNow && expiry >= today;
      }).length;

      return {
        pendingJobs,
        inProgressJobs,
        completedJobs,
        revenue,
        lowStockParts,
        upcomingAppointments,
        expiringLicenses
      };
    }
  });
}

// Jobs hooks
export function useGunsmithJobs(status?: string) {
  return useQuery({
    queryKey: ['gunsmith-jobs', status],
    queryFn: async () => {
      let query = (supabase as any)
        .from('gunsmith_jobs')
        .select('*, customers(first_name, last_name), gunsmith_firearms(make, model, serial_number)')
        .order('created_at', { ascending: false });
      
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as GunsmithJob[];
    }
  });
}

export function useCreateGunsmithJob() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (job: Partial<GunsmithJob>) => {
      const jobNumber = `GS-${Date.now().toString(36).toUpperCase()}`;
      const { error } = await (supabase as any)
        .from('gunsmith_jobs')
        .insert({ ...job, job_number: jobNumber });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gunsmith-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['gunsmith-stats'] });
      toast({ title: 'Job created successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to create job', variant: 'destructive' });
    }
  });
}

export function useUpdateGunsmithJob() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<GunsmithJob> & { id: string }) => {
      const { error } = await (supabase as any)
        .from('gunsmith_jobs')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gunsmith-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['gunsmith-stats'] });
      toast({ title: 'Job updated' });
    }
  });
}

// Firearms hooks
export function useGunsmithFirearms(customerId?: string) {
  return useQuery({
    queryKey: ['gunsmith-firearms', customerId],
    queryFn: async () => {
      let query = (supabase as any)
        .from('gunsmith_firearms')
        .select('*, customers(first_name, last_name)')
        .order('created_at', { ascending: false });
      
      if (customerId) {
        query = query.eq('customer_id', customerId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as GunsmithFirearm[];
    }
  });
}

export function useCreateGunsmithFirearm() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (firearm: Partial<GunsmithFirearm>) => {
      const { error } = await (supabase as any)
        .from('gunsmith_firearms')
        .insert(firearm);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gunsmith-firearms'] });
      toast({ title: 'Firearm registered successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to register firearm', variant: 'destructive' });
    }
  });
}

// Parts hooks
export function useGunsmithParts() {
  return useQuery({
    queryKey: ['gunsmith-parts'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('gunsmith_parts')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as GunsmithPart[];
    }
  });
}

export function useCreateGunsmithPart() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (part: Partial<GunsmithPart>) => {
      const { error } = await (supabase as any)
        .from('gunsmith_parts')
        .insert(part);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gunsmith-parts'] });
      toast({ title: 'Part added successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to add part', variant: 'destructive' });
    }
  });
}
