# Newsletter Feature Deployment Script
# Run this script to deploy the newsletter feature to Firebase

Write-Host "🚀 Deploying Newsletter Feature to Firebase..." -ForegroundColor Cyan
Write-Host ""

# Check if Firebase CLI is installed
Write-Host "Checking Firebase CLI..." -ForegroundColor Yellow
$firebaseVersion = firebase --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Firebase CLI not found. Installing..." -ForegroundColor Red
    npm install -g firebase-tools
} else {
    Write-Host "✅ Firebase CLI found: $firebaseVersion" -ForegroundColor Green
}

Write-Host ""
Write-Host "Logging in to Firebase..." -ForegroundColor Yellow
firebase login

Write-Host ""
Write-Host "Setting Firebase project..." -ForegroundColor Yellow
firebase use fre-2028-website

Write-Host ""
Write-Host "📦 Step 1: Deploying Firestore rules and indexes..." -ForegroundColor Cyan
firebase deploy --only firestore

Write-Host ""
Write-Host "⚡ Step 2: Deploying Cloud Functions..." -ForegroundColor Cyan
firebase deploy --only functions

Write-Host ""
Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Go to Firebase Console: https://console.firebase.google.com/project/fre-2028-website/firestore" -ForegroundColor White
Write-Host "2. Verify Firestore is enabled" -ForegroundColor White
Write-Host "3. Test the newsletter by visiting your website and clicking 'Ontvang updates'" -ForegroundColor White
Write-Host ""
Write-Host "Function URL:" -ForegroundColor Yellow
Write-Host "https://europe-west1-fre-2028-website.cloudfunctions.net/newsletter" -ForegroundColor White
Write-Host ""
