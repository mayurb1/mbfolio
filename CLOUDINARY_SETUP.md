# Cloudinary Setup Instructions

## Current Configuration
Your Cloudinary cloud name has been configured: `dvuk0t5kj`

## Required Steps to Complete Setup

### 1. Create Upload Preset in Cloudinary Dashboard

1. Go to your [Cloudinary Console](https://console.cloudinary.com/)
2. Navigate to **Settings** → **Upload** → **Upload presets**
3. Click **Add upload preset**
4. Configure the preset:
   - **Preset name**: `project_images`
   - **Signing Mode**: `Unsigned` (recommended for frontend uploads)
   - **Folder**: `portfolio/projects` (optional, for organization)
   - **Access Mode**: `Public`
   - **Max file size**: `10000000` (10MB)
   - **Allowed formats**: `jpg,png,gif,webp`
   - **Max image width**: `1920` (optional)
   - **Max image height**: `1080` (optional)
   - **Auto optimize quality**: `Enabled`
   - **Auto format**: `Enabled`

### 2. Update Backend Environment (Optional)

If you want to implement server-side uploads later, update your backend `.env` file:

```bash
# Extract from your CLOUDINARY_URL
CLOUDINARY_CLOUD_NAME=dvuk0t5kj
CLOUDINARY_API_KEY=your_api_key_from_url
CLOUDINARY_API_SECRET=your_api_secret_from_url
```

### 3. Test the Upload Functionality

1. Start your development server
2. Navigate to the ProjectForm in admin
3. Try uploading an image
4. Check for any error messages in the console

## Current Implementation Features

✅ **Frontend Configuration Complete**:
- Environment variables set
- Upload components created
- Error handling implemented
- File validation (type, size)
- Upload progress tracking
- Toast notifications

✅ **Upload Flow**:
1. User selects/drags image file
2. File validation (type, size)
3. Upload to Cloudinary via unsigned preset
4. URL returned and saved to form
5. Success/error feedback via toast

## Troubleshooting

### Common Issues:

**"Upload preset not found" error**:
- Make sure you created the `project_images` preset in Cloudinary dashboard
- Ensure the preset is set to "Unsigned" mode

**"Invalid upload parameters" error**:
- Check that your cloud name is correct in `.env`
- Verify the preset name matches exactly

**File size errors**:
- Default limit is 10MB
- Can be adjusted in both preset and code

**Network/CORS errors**:
- Cloudinary should allow cross-origin requests by default
- Check browser network tab for detailed error messages

## File Structure

```
src/admin/
├── hooks/
│   └── useImageUpload.js       # Image upload logic
├── components/
│   └── ui/
│       ├── ImageUpload.jsx     # Single image upload
│       └── MultiImageUpload.jsx # Multiple image upload
└── services/
    └── projectService.js       # Cloudinary upload service
```

## Next Steps

1. Create the upload preset as described above
2. Test the functionality
3. Optionally customize the preset settings (image transformations, etc.)
4. Consider implementing image optimization/transformations

The implementation is ready to use once the upload preset is configured!