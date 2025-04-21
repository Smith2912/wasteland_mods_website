# Mod Delivery System with Supabase Storage

This document explains how the mod file delivery system works in our application, using Supabase Storage to securely provide access to purchased mods.

## Architecture Overview

1. **Mod Files Storage**: All mod files are stored in a private Supabase Storage bucket named `mods`.
2. **Access Control**: Access to files is restricted by Row Level Security (RLS) policies that verify purchases.
3. **Secure Downloads**: Downloads are provided via temporary signed URLs that expire after 5 minutes.

## File Organization

Mod files in the Supabase bucket should follow this structure:

```
mods/
  ├── mod-id-1/
  │   ├── mod-id-1-latest.zip    # Latest version
  │   ├── mod-id-1-v1.0.0.zip    # Specific version
  │   └── documentation.pdf
  │
  ├── mod-id-2/
  │   ├── mod-id-2-latest.zip
  │   └── ...
```

The path convention is important because our RLS policy uses it to verify ownership.

## Security Measures

1. **Private Bucket**: The `mods` bucket is private (not public).
2. **RLS Policy**: Only authenticated users who have purchased a mod can access its files.
3. **Temporary URLs**: Download links expire after 5 minutes.
4. **Server-side Verification**: Purchase status is verified on our server, not just in the frontend.

## How Downloads Work

1. **User Authentication**: User must be logged in to access downloads.
2. **Purchase Verification**: Our API endpoint checks if the user has purchased the mod.
3. **Signed URL Generation**: A temporary signed URL is generated using the service role client.
4. **Redirection**: User is redirected to this URL for the download.
5. **Expiration**: The URL becomes invalid after 5 minutes.

## Implementation Details

### API Endpoint

The download API endpoint is at `/api/download/[modId]`. It:

1. Authenticates the user via Supabase session cookies
2. Verifies the purchase in the database
3. Generates a signed URL for the download
4. Redirects to the signed URL

### Frontend Integration

The mod's download button links directly to our API endpoint:

```jsx
<a href={`/api/download/${mod.id}`} className="download-button">
  Download
</a>
```

### SQL Policy

Our policy only allows file access if the mod ID (derived from the file path) exists in the user's purchases:

```sql
CREATE POLICY "Allow download for purchased mods" 
ON storage.objects 
FOR SELECT 
USING (
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
```

## Uploading New Mod Files

To upload new mod files to the system:

1. Access the Supabase dashboard
2. Go to Storage → mods bucket
3. Create a folder with the mod ID if it doesn't exist
4. Upload the mod file with proper naming convention
5. Ensure both the latest version and version-specific files are uploaded

## Troubleshooting

- **Access Denied**: Verify the user is authenticated and has purchased the mod
- **Missing Files**: Check if the file exists in the correct path in the bucket
- **Expired URLs**: Generate a new URL by accessing the download endpoint again 