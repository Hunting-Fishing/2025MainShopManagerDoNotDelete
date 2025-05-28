
// Compatibility layer for components that import @/lib/supabase
// This file re-exports the supabase client from the correct location
export { supabase } from '@/integrations/supabase/client';
export type { Database } from '@/integrations/supabase/types';
