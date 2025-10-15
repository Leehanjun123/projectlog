-- Add image_url column to updates table
ALTER TABLE updates
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_updates_image_url ON updates(image_url) WHERE image_url IS NOT NULL;

-- Note: You also need to create a Storage bucket in Supabase Dashboard
-- 1. Go to Supabase Dashboard → Storage
-- 2. Create new bucket named "update-images"
-- 3. Set bucket to PUBLIC (so images can be displayed)
-- 4. Add policy: Allow authenticated users to upload
-- 5. Add policy: Allow everyone to read

/*
Storage Policies to add in Supabase Dashboard → Storage → update-images → Policies:

1. INSERT Policy (Allow authenticated uploads):
   Name: "Authenticated users can upload images"
   Policy: (bucket_id = 'update-images' AND auth.role() = 'authenticated')

2. SELECT Policy (Allow public read):
   Name: "Public can view images"
   Policy: (bucket_id = 'update-images')

3. DELETE Policy (Allow users to delete own images):
   Name: "Users can delete own images"
   Policy: (bucket_id = 'update-images' AND auth.uid()::text = (storage.foldername(name))[1])
*/
