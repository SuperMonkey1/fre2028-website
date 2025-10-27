# Quick Admin Password Setup

Since Firebase Storage needs to be initialized manually in the Firebase Console, follow these steps:

## 1. Enable Firebase Storage

1. Go to: https://console.firebase.google.com/project/fre-2028-website/storage
2. Click "Get Started" 
3. Click "Done" (use the default security rules, we'll update them after)

## 2. Deploy Storage Rules

After enabling Storage in the console, run:

```bash
firebase deploy --only storage
```

## 3. Set Up Admin Password

Go to Firebase Console and manually create the password:

1. Go to: https://console.firebase.google.com/project/fre-2028-website/firestore
2. Click "Start collection" (if first time) or find the `config` collection
3. Create/Edit document:
   - Collection ID: `config`
   - Document ID: `admin`
   - Field name: `password`
   - Field type: `string`
   - Field value: `fre2028`
4. Click "Save"

## 4. Test the Admin Panel

1. Start dev server: `npm run dev`
2. Press `Ctrl+Shift+A` on any page
3. Enter password: `fre2028`
4. You'll be redirected to `/admin`

## All Done! 🎉

Your admin panel is ready to use. You can now:
- Add partners with images
- Edit existing partners
- Delete partners
- Manage all partner information

The admin panel is accessible via `Ctrl+Shift+A` from anywhere on your site.
