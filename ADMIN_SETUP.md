# Admin Panel Setup Guide

This guide will help you set up the admin panel for managing partners on your website.

## Features

- **Keyboard Shortcut**: Press `Ctrl+Shift+A` anywhere on the site to open the admin login
- **Password Protection**: Secure access with password stored in Firestore
- **Full CRUD Operations**: Create, Read, Update, and Delete partners
- **Image Upload**: Upload partner logos/images to Firebase Storage
- **Category Management**: Organize partners by type (Financiële Partner, Strategische Partner, Performance Team)
- **Social Media Links**: Add multiple social media profiles for each partner

## Prerequisites

- Firebase project already set up
- Firebase CLI installed (`npm install -g firebase-tools`)
- Node.js and npm installed

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

This will install the `firebase` package (v10.7.1) which was added to package.json.

### 2. Configure Firebase Environment Variables

Create a `.env.local` file in the project root:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Firebase configuration values from Firebase Console > Project Settings > General > Your apps:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Initialize Firebase Storage Bucket

Go to Firebase Console > Storage and click "Get Started" to create a storage bucket if you haven't already.

### 4. Deploy Firestore and Storage Rules

Deploy the updated Firestore and Storage security rules:

```bash
firebase deploy --only firestore:rules,storage:rules
```

### 5. Set Up Admin Password

You need to manually create the admin password document in Firestore. You have two options:

#### Option A: Via Firebase Console (Recommended)

1. Go to Firebase Console > Firestore Database
2. Click "Start collection"
3. Collection ID: `config`
4. Document ID: `admin`
5. Add field:
   - Field: `password`
   - Type: `string`
   - Value: `fre2028`
6. Click "Save"

#### Option B: Via Script (Alternative)

1. Download your service account key from Firebase Console:
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Save as `serviceAccountKey.json` in the project root
   - **IMPORTANT**: Add this file to `.gitignore` (already done)

2. Install firebase-admin in the project root:
   ```bash
   npm install firebase-admin
   ```

3. Run the setup script:
   ```bash
   node scripts/setup-admin-password.js
   ```

4. Delete the service account key file after setup:
   ```bash
   del serviceAccountKey.json
   ```

### 6. Test Locally

Start the development server:

```bash
npm run dev
```

Visit `http://localhost:3000` and press `Ctrl+Shift+A` to open the admin login.

Enter password: `fre2028`

### 7. Deploy to Production

Deploy everything to Firebase:

```bash
npm run build
firebase deploy
```

## Usage

### Accessing Admin Panel

1. **From any page**: Press `Ctrl+Shift+A` on your keyboard
2. Enter the password: `fre2028`
3. You'll be redirected to `/admin`

### Managing Partners

**Add a Partner:**
1. Click "Add Partner" button
2. Fill in the form (name, category, description, etc.)
3. Upload an image
4. Add website and social media links (optional)
5. Click "Create Partner"

**Edit a Partner:**
1. Click the edit icon (pencil) on any partner card
2. Modify the fields
3. Upload a new image if needed
4. Click "Update Partner"

**Delete a Partner:**
1. Click the delete icon (trash) on any partner card
2. Confirm the deletion

**Display Order:**
- Set the "order" field to control the display order
- Lower numbers appear first (0, 1, 2, ...)

### Categories

Partners are organized into three categories:
- **Financiële Partner**: Financial sponsors ("De Leuvense 8")
- **Strategische Partner**: Strategic partners
- **Performance Team**: Performance and training partners

## Security Notes

- The admin password is stored in plain text in Firestore for simplicity
- Authentication is session-based (stored in sessionStorage)
- For production, consider implementing proper authentication (Firebase Auth)
- The Firestore rules currently allow public write access to partners collection
- Consider adding proper authentication checks in the security rules

## Firestore Data Structure

### Collection: `config`
```
admin/
  - password: "fre2028" (string)
  - updatedAt: timestamp
```

### Collection: `partners`
```
{partnerId}/
  - name: string
  - category: string
  - description: string
  - imageUrl: string
  - website: string (optional)
  - socials: object (optional)
    - instagram: string
    - linkedin: string
    - facebook: string
    - twitter: string
    - youtube: string
  - order: number
  - createdAt: timestamp
  - updatedAt: timestamp
```

## Firebase Storage Structure

```
partners/
  - {timestamp}_{filename}.{ext}
```

## Troubleshooting

**"Failed to load partners"**
- Check that Firestore rules are deployed
- Verify Firebase configuration in `.env.local`

**"Failed to upload image"**
- Check that Storage rules are deployed
- Verify storage bucket is initialized

**"Incorrect password"**
- Verify the password document exists in Firestore
- Check that the password field contains "fre2028"

**Keyboard shortcut not working**
- Make sure you're pressing Ctrl+Shift+A (not Cmd on Mac, use Ctrl)
- Try refreshing the page

## Changing the Admin Password

To change the admin password:

1. Go to Firebase Console > Firestore Database
2. Navigate to `config/admin`
3. Edit the `password` field
4. Save

## Files Created

- `lib/firebase.ts` - Firebase client initialization
- `types/partner.ts` - Partner type definitions
- `services/partnerService.ts` - Partner CRUD operations
- `services/adminService.ts` - Admin password validation
- `components/AdminPasswordModal.tsx` - Password modal and keyboard shortcut hook
- `pages/admin.tsx` - Admin panel page
- `storage.rules` - Firebase Storage security rules
- `scripts/setup-admin-password.js` - Script to initialize admin password
- `.env.local.example` - Example environment variables

## Next Steps

1. Add real partner data through the admin panel
2. Update the home page (`pages/index.tsx`) to fetch partners from Firestore
3. Update the partners page (`pages/partners.tsx`) to fetch partners from Firestore
4. Consider implementing proper authentication for production use
