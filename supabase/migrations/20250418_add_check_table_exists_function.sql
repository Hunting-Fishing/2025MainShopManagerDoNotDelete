
-- Create function to check if a table exists to avoid errors with missing tables
CREATE OR REPLACE FUNCTION public.check_if_table_exists(table_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  table_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public'
    AND table_name = $1
  ) INTO table_exists;
  
  RETURN table_exists;
END;
$$;

-- Grant execution permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION public.check_if_table_exists TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_if_table_exists TO anon;
