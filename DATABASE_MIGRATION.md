# Database Migration - Add Video Type Support

## ⚠️ Important: Add the `video_type` Column to Your Supabase Database

The iframe video feature requires a new column in your `episodes` table. Follow these steps:

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Click **"SQL Editor"** on the left sidebar
3. Click **"New Query"**

### Step 2: Run This SQL Command

Copy and paste the following SQL into the editor:

```sql
-- Add video_type column to episodes table
ALTER TABLE public.episodes 
ADD COLUMN IF NOT EXISTS video_type text DEFAULT 'file';

-- Create an index for better query performance (optional)
CREATE INDEX IF NOT EXISTS episodes_video_type_idx ON public.episodes(video_type);
```

### Step 3: Execute
Click the **"Run"** button (or press Ctrl+Enter)

You should see: ✅ `Success. No rows returned`

## What This Does

- **Adds `video_type` column**: Stores either `'file'` (for local uploads) or `'iframe'` (for external embeds)
- **Default value**: Set to `'file'` for backward compatibility
- **Index**: Improves query performance when filtering by video type

## Verification

To verify the column was added, run this query:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'episodes' AND column_name = 'video_type';
```

You should see one row with:
- `column_name`: video_type
- `data_type`: text

## If You Get an Error

### "Column already exists"
✅ This is good! Your database already has the column.

### Other errors
- Make sure you're logged into the correct Supabase project
- Check that you have write permissions on the episodes table
- Try removing `IF NOT EXISTS` from the command

## Manual Column Addition (Alternative)

If you prefer using the UI:
1. Go to **Database** → **Tables** → **episodes**
2. Click **"Add column"**
3. Set:
   - **Name**: `video_type`
   - **Type**: `text`
   - **Default value**: `file`
4. Click **"Save"**

## Now You Can Upload Iframe Videos!

After running the SQL:
1. Reload your web app
2. Go to the Admin Upload page
3. Select **"Add iframe link"**
4. Paste your iframe URL or HTML code
5. Fill in episode details and upload!

The app will automatically detect whether you're uploading:
- ✅ **Local video files** → Stored in Supabase Storage
- ✅ **Iframe links** → Embedded directly from external sources
