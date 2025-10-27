const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function setupAdminPassword() {
  try {
    // Set the admin password in Firestore
    await db.collection('config').doc('admin').set({
      password: 'fre2028',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    console.log('✅ Admin password has been set successfully!');
    console.log('Password: fre2028');
    console.log('Collection: config');
    console.log('Document: admin');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting admin password:', error);
    process.exit(1);
  }
}

setupAdminPassword();
