# Iframe Video Upload Guide

## Overview
You can now upload episodes in two ways:
1. **Local Video File** - Upload video files from your computer to Supabase Storage
2. **Iframe Link** - Add iframe embed links to host videos externally (e.g., Blogger, YouTube, etc.)

## New Upload Page Features

### Uploading with Local Video Files (Original Method)
1. Select **"Upload local video file"** option
2. Choose your video file from your computer
3. Fill in episode details
4. Optionally upload a thumbnail image
5. Click **"Upload to database"**

### Uploading with Iframe Links (New Feature)
1. Select **"Add iframe link"** option
2. Paste your iframe embed code or URL in the **"Iframe embed link"** field
3. Fill in episode details (title, description, episode number, etc.)
4. Optionally upload a thumbnail image (this acts as the cover image)
5. Click **"Upload to database"**

## Iframe Format Examples

### Blogger Video (Like Your Example)
```html
<iframe allowfullscreen="allowfullscreen" class="b-hbp-video b-uploaded" frameborder="0" height="266" src="https://www.blogger.com/video.g?token=..." webkitallowfullscreen="webkitallowfullscreen" width="320"></iframe>
```

### YouTube Embed
```html
<iframe width="560" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0" allowfullscreen></iframe>
```

### Vimeo Embed
```html
<iframe src="https://player.vimeo.com/video/123456789" width="640" height="360" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>
```

## Accepted Input Formats

The system accepts:
- **Full iframe HTML code**: Copy the entire `<iframe>...</iframe>` tag
- **Just the src URL**: Extract and paste only the `src` attribute value

### Example - Both Work:
✅ Full HTML:
```html
<iframe src="https://www.blogger.com/video.g?token=..."></iframe>
```

✅ URL only:
```
https://www.blogger.com/video.g?token=...
```

## Important Notes

### For Iframe Videos:
- **Playback controls**: Built-in iframe controls will be displayed
- **Disabled features**: 
  - Video progress seeking (embedded iframes manage their own timeline)
  - Play/pause buttons (controlled by iframe's internal player)
  - Speed control (not available for embedded content)
  - Picture-in-picture (depends on iframe's allowfullscreen setting)
  - Mute and volume controls (handled by iframe)
- **Fullscreen**: ✅ Supported with `allowfullscreen` attribute
- **Cross-origin**: Content must allow embedding and have proper CORS headers

### For Local Video Files:
- All original features available (seeking, speed control, PIP, etc.)
- Video hosted on your Supabase Storage
- Full player control from Cartoon Stream

## Database Changes

A new column has been added to the episodes table:
- **`video_type`** (text): Either `'file'` or `'iframe'`
  - Automatically set based on upload mode
  - Allows the player to render correctly

## Video Player Behavior

The video player automatically detects the video type:
1. **If `video_type = 'file'`**: Renders HTML5 video element with full controls
2. **If `video_type = 'iframe'`**: Embeds the iframe and shows iframe's native controls

The player intelligently disables incompatible controls for iframe videos.

## Troubleshooting

### "Invalid iframe link" error
- Verify the iframe src URL is valid and accessible
- Check that the content allows embedding
- Try just pasting the src URL instead of the full HTML

### Iframe not displaying
- Ensure the source allows cross-origin embedding
- Check browser console for CORS errors
- Verify the thumbnail_url is set (useful as fallback)

### Video won't play
- **Local files**: Check Supabase Storage permissions
- **Iframes**: Verify the external content is accessible and allows embedding
- Check that video_type is correctly set in database

## Migration from Old Schema

If you have an existing Supabase database, run this SQL to add the new column:

```sql
ALTER TABLE public.episodes 
ADD COLUMN video_type text DEFAULT 'file';
```

## Technical Details

### Upload Endpoint
The upload form now accepts:
- `uploadMode`: Either `'file'` or `'iframe'`
- `iframeUrl`: The iframe URL or HTML (only when mode is 'iframe')

### Video Player Props
The AdvancedVideoPlayer component automatically detects:
- `episode.video_type`: Type of video ('file' or 'iframe')
- `episode.video_url`: Can be a file URL or iframe embed

### Helper Functions
- `extractIframeSrc()`: Parses iframe HTML to extract the src URL
- `isIframe`: Boolean flag indicating if current episode is an iframe video
