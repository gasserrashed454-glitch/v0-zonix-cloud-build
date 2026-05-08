# File Interaction Menu System - Complete Documentation

## Overview

The File Interaction Menu is a beautiful popup interface that appears when users click on a file in the Zonix Cloud file manager. It provides intuitive access to five main file operations: View, Share, Favorite, Download, and Delete.

## Features

### 1. Responsive Menu Design
- **Color-Coded Options**: Each action has its own color scheme for visual clarity
  - View (Blue): Open file in viewer
  - Share (Green): Generate links and share via email
  - Favorite (Amber): Mark as favorite
  - Download (Purple): Download to device
  - Delete (Red): Move to trash

- **Grid Layout**: 2-column grid on mobile, scales appropriately
- **Smooth Animations**: Hover effects and transitions
- **Icon Integration**: Clear icons for each action with labels

### 2. Share Link Generation System
Generates shareable links in format: `Share-[10 alphanumeric characters]`

**Share Link Structure:**
```
Share Code Format:     Share-AbCdEfGhIj
Share URL Format:      https://zonix.me/share/AbCdEfGhIj
Domain:                zonix.me (configurable via NEXT_PUBLIC_APP_URL)
```

**Expiration Options:**
- 1 Hour
- 1 Day
- 7 Days
- 30 Days
- Never (no expiration)

### 3. File Actions

#### View Action
- Opens file in built-in multi-format viewer
- Supports: Images (PNG, JPG, GIF), PDF, Text, Code, Office documents
- Zoom controls (50-200% for images)
- Mobile-responsive preview
- Direct download from viewer
- Share directly from preview

#### Share Action
- **Generate Link**: Creates unique share code and URL
- **Auto-Copy**: Link automatically copied to clipboard
- **Email Sharing**: Send invitation email to recipient
- **Expiration**: Set access duration
- **Display**: Shows both code and full URL for sharing
- **Copy Buttons**: Individual copy buttons for code and URL

#### Favorite Action
- Toggle favorite status
- Visual feedback with star icon
- Persistent storage in database
- Favorites show indicator on file

#### Download Action
- Direct file download
- Preserves original filename
- Works across all file types
- Browser download manager handling

#### Delete Action
- Soft delete to trash (30-day recovery window)
- Confirmation dialog before deletion
- User-friendly warning message
- Toast notification on success

## API Endpoints

### Share Link API
**Endpoint:** `/api/files/share-link/route.ts`

#### POST - Create Share Link
```typescript
POST /api/files/share-link

Request Body:
{
  fileId: string,
  expiresIn?: '1hour' | '1day' | '7days' | '30days' | null
}

Response:
{
  shareCode: string,      // Format: "Share-AbCdEfGhIj"
  shareUrl: string,       // Format: "https://zonix.me/share/AbCdEfGhIj"
  expiresAt: string | null,
  createdAt: string
}
```

#### GET - List Share Links
```typescript
GET /api/files/share-link?fileId=<fileId>

Response:
{
  shares: Array<{
    id: string,
    file_id: string,
    share_code: string,
    shared_by: string,
    shareUrl: string,
    access_count: number,
    expires_at: string | null,
    created_at: string
  }>
}
```

#### DELETE - Revoke Share Link
```typescript
DELETE /api/files/share-link

Request Body:
{
  shareCode: string
}

Response:
{
  success: true
}
```

## File Sharing Utilities
**File:** `/lib/file-sharing.ts`

```typescript
// Generate unique share code
generateShareCode(): string
// Returns: "Share-AbCdEfGhIj"

// Create shareable URL
generateShareUrl(shareCode: string): string
// Returns: "https://zonix.me/share/AbCdEfGhIj"

// Parse share code from URL
parseShareCode(code: string): string
// Returns: "Share-AbCdEfGhIj"

// Get short code (removes "Share-" prefix)
getShortCode(fullShareCode: string): string
// Returns: "AbCdEfGhIj"

// Validate share code format
isValidShareCode(code: string): boolean
// Returns: true | false
```

## Component API

### FileInteractionMenu

```typescript
interface FileInteractionMenuProps {
  file: File | null              // Currently selected file
  isOpen: boolean                 // Menu visibility state
  onClose: () => void             // Close menu handler
  onView?: (file: File) => void   // View file handler
  onFavorite?: (file: File) => Promise<void>  // Favorite toggle
  onDownload?: (file: File) => void           // Download handler
  onDelete?: (file: File) => Promise<void>    // Delete handler
  onRefresh?: () => Promise<void>             // Refresh file list
}
```

**Usage in File Manager:**
```typescript
<FileInteractionMenu
  file={selectedFileForMenu}
  isOpen={fileInteractionOpen}
  onClose={() => {
    setFileInteractionOpen(false)
    setSelectedFileForMenu(null)
  }}
  onView={handleViewFile}
  onFavorite={handleMenuFavorite}
  onDownload={handleMenuDownload}
  onDelete={handleMenuDelete}
  onRefresh={() => mutateFiles()}
/>
```

## Database Schema

### file_shares Table
```sql
CREATE TABLE file_shares (
  id UUID PRIMARY KEY,
  file_id UUID REFERENCES files(id),
  share_code VARCHAR UNIQUE,      -- Format: "Share-AbCdEfGhIj"
  shared_by UUID REFERENCES auth.users(id),
  shared_with_email VARCHAR,      -- Optional, for email shares
  access_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP,
  created_at TIMESTAMP,
  
  FOREIGN KEY (file_id) REFERENCES files(id),
  FOREIGN KEY (shared_by) REFERENCES profiles(id)
)

-- RLS Policies
ALTER TABLE file_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their shares"
  ON file_shares
  FOR ALL
  USING (auth.uid() = shared_by)
  WITH CHECK (auth.uid() = shared_by);
```

## Security Considerations

1. **User Ownership Verification**: Checked before creating shares
2. **RLS Policies**: Users can only manage their own shares
3. **Expiration Control**: Time-based access revocation
4. **Access Tracking**: Monitors access count to detect abuse
5. **Email Validation**: Share recipients verified via email
6. **Soft Deletes**: Files retained for 30 days in trash
7. **Permission Levels**: View/edit/download granular controls

## User Experience Flow

### Sharing a File

1. User clicks on file → Opens interaction menu
2. User clicks "Share" → Share sub-menu appears
3. User sets expiration (optional)
4. User clicks "Generate Link" → Link created, auto-copied
5. User can now:
   - Share generated link via email/messaging
   - Enter recipient email → Sends email invitation
   - Share via social media/messaging apps

### Managing Shares

- View all active shares for a file
- Copy share code or full URL with one click
- Revoke share link anytime
- Set expiration or make permanent
- Track access counts

## Environment Variables

```bash
# Required
NEXT_PUBLIC_APP_URL=https://zonix.me  # Base URL for share links

# Optional (defaults above)
NEXT_PUBLIC_SHARE_LINK_BASE_PATH=/share  # Share link path
```

## File Type Support

### Viewer Support
- **Images**: PNG, JPG, GIF, WebP, SVG
- **Documents**: PDF, DOCX, XLSX, PPTX
- **Code**: JavaScript, TypeScript, Python, HTML, CSS, JSON
- **Text**: TXT, MD, CSV, LOG
- **Media**: MP3, MP4 (basic support)

### Download Support
- All file types (binary-safe)
- Preserves original filename and extension
- Respects MIME types

## Error Handling

- **Network Errors**: Retry mechanism with backoff
- **Permission Denied**: Clear user message
- **File Not Found**: Graceful fallback
- **Share Expired**: Time-based access revocation
- **Rate Limiting**: Prevent abuse with access limits

## Performance Optimizations

1. **Copy to Clipboard**: Uses async clipboard API
2. **Lazy Loading**: Viewer loads on-demand
3. **Image Optimization**: Thumbnail caching
4. **Database Indices**: On share_code and created_at
5. **SWR Caching**: File list updates with revalidation

## Accessibility

- Semantic HTML structure
- ARIA labels for all interactions
- Keyboard navigation support
- Color contrast compliance (WCAG AA)
- Screen reader compatible
- Focus management in modals
- Alt text for all icons

## Mobile Responsiveness

- **Touch-Friendly**: 44x44px minimum touch targets
- **Responsive Grid**: Adapts to screen size
- **Full-Screen Modals**: Better mobile experience
- **Bottom Sheet Option**: Alternative for mobile
- **Swipe to Close**: Native mobile gesture support

## Testing

### Unit Tests
- Share code generation uniqueness
- URL formatting validation
- Expiration date calculations
- Permission checking

### Integration Tests
- Share link creation workflow
- Email notification sending
- Access control verification
- Expiration enforcement

### E2E Tests
- File selection and menu open
- Share link generation
- Copy to clipboard
- Email sharing
- File download
- Favorite toggling
- Delete confirmation

## Future Enhancements

1. **Batch Operations**: Share multiple files at once
2. **Advanced Permissions**: Password-protected shares
3. **Download Limits**: Restrict number of downloads
4. **Watermarking**: Digital watermarks on shared files
5. **Analytics**: Share click tracking and statistics
6. **Custom Branding**: Branded share links
7. **OAuth Integration**: Auto-share to popular services
8. **Webhooks**: Notify external services on share events

## Troubleshooting

### Share Link Not Copying
- Check clipboard API browser support
- Verify HTTPS connection
- Clear browser cache

### Email Not Sending
- Verify email service configuration
- Check recipient email validity
- Review email rate limits

### Share Link Expired
- Generate new link with different expiration
- Use "Never" option for permanent shares

## Support

For issues or questions:
- Email: support@zonix.me
- Dashboard: Help → Contact Support
- Documentation: docs.zonix.me/sharing
