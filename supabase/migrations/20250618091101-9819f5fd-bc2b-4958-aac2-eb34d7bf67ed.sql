
-- Check the current structure of work_order_parts table
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'work_order_parts' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Enable RLS on work_order_parts table if not already enabled
ALTER TABLE public.work_order_parts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for work_order_parts if they don't exist
DROP POLICY IF EXISTS "Enable read access for all users" ON public.work_order_parts;
CREATE POLICY "Enable read access for all users" ON public.work_order_parts
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.work_order_parts;
CREATE POLICY "Enable insert for authenticated users" ON public.work_order_parts
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.work_order_parts;
CREATE POLICY "Enable update for authenticated users" ON public.work_order_parts
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.work_order_parts;
CREATE POLICY "Enable delete for authenticated users" ON public.work_order_parts
    FOR DELETE USING (auth.role() = 'authenticated');

-- Also ensure work_order_job_lines has proper RLS policies
ALTER TABLE public.work_order_job_lines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.work_order_job_lines;
CREATE POLICY "Enable read access for all users" ON public.work_order_job_lines
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.work_order_job_lines;
CREATE POLICY "Enable insert for authenticated users" ON public.work_order_job_lines
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.work_order_job_lines;
CREATE POLICY "Enable update for authenticated users" ON public.work_order_job_lines
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.work_order_job_lines;
CREATE POLICY "Enable delete for authenticated users" ON public.work_order_job_lines
    FOR DELETE USING (auth.role() = 'authenticated');
