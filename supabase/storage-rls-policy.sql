-- Create a policy that allows users to download only the mods they've purchased
-- This policy checks the purchases table to verify ownership

-- First, ensure the policy doesn't already exist
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Allow download for purchased mods'
        AND tablename = 'objects'
        AND schemaname = 'storage'
    ) THEN
        DROP POLICY "Allow download for purchased mods" ON storage.objects;
    END IF;
END
$$;

-- Create the policy that only allows users to download mods they've purchased
CREATE POLICY "Allow download for purchased mods" 
ON storage.objects 
FOR SELECT 
USING (
  -- This policy grants access if:
  -- 1. The user is authenticated
  -- 2. The bucket is 'mods'
  -- 3. The first part of the file path matches a mod_id in the user's purchases
  (auth.role() = 'authenticated')
  AND
  (bucket_id = 'mods')
  AND
  EXISTS (
    SELECT 1 FROM public.purchases
    WHERE 
      user_id = auth.uid()
      AND mod_id = SPLIT_PART(storage.objects.name, '/', 1)
      AND status = 'completed'
  )
);

-- Additional policy to allow service role to access all files (for admin purposes)
CREATE POLICY "Service role access to objects" 
ON storage.objects 
FOR ALL 
TO service_role 
USING (true);

-- Make sure the bucket exists (create if not exists)
INSERT INTO storage.buckets (id, name, public)
SELECT 'mods', 'mods', false
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'mods'
); 