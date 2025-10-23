# Build & Deploy Guide

## Deploy Changes to Website (Next.js)

```powershell
# Build the Next.js app
npm run build

# Then deploy to hosting
firebase deploy --only hosting
```

**Note:** Firebase will automatically build Next.js when you deploy, but running `npm run build` first helps catch errors locally.

This deploys changes in:
- `pages/` - All page components
- `components/` - React components
- `styles/` - CSS files
- `public/` - Static assets
- Any other Next.js code

---

## Deploy Changes to Functions (Backend)

```powershell
# Deploy only the Cloud Functions
firebase deploy --only functions
```

This deploys changes in:
- `functions/index.js` - Function logic
- `functions/welcome_email_content.js` - Email templates
- `functions/package.json` - Dependencies
- `functions/.env` - Environment variables

---

## Deploy Firestore Rules/Indexes

```powershell
# Deploy database rules and indexes
firebase deploy --only firestore
```

This deploys:
- `firestore.rules` - Security rules
- `firestore.indexes.json` - Database indexes

---

## Deploy Everything at Once

```powershell
# Deploy all components
firebase deploy
```

---

## Common Workflows

### After changing frontend code (pages/components/styles)
```powershell
npm run build
firebase deploy --only hosting
```

### After changing newsletter function
```powershell
firebase deploy --only functions
```

### After changing database rules
```powershell
firebase deploy --only firestore
```

### First time setup or major changes
```powershell
firebase deploy
```

---

## Quick Reference

| Changed Files | Command |
|---------------|---------|
| `pages/`, `components/`, `styles/`, `public/` | `firebase deploy --only hosting` |
| `functions/` | `firebase deploy --only functions` |
| `firestore.rules`, `firestore.indexes.json` | `firebase deploy --only firestore` |
| Everything | `firebase deploy` |

---

**Tip:** Always test locally with `npm run dev` before deploying!
