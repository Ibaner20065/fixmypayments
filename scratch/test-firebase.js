const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

const privateKey = process.env.FIREBASE_PRIVATE_KEY
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/^["']|["']$/g, '').trim()
  : undefined;

console.log('Project ID:', process.env.FIREBASE_PROJECT_ID);
console.log('Client Email:', process.env.FIREBASE_CLIENT_EMAIL);
console.log('Private Key Start:', privateKey ? privateKey.substring(0, 30) + '...' : 'MISSING');

if (!privateKey || !process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL) {
  console.error('❌ Missing credentials in .env.local');
  process.exit(1);
}

try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  });
  
  console.log('⏳ Connecting to Firestore...');
  admin.firestore().collection('users').limit(1).get()
    .then(() => {
      console.log('✅ FIREBASE_OK: Connection successful!');
      process.exit(0);
    })
    .catch(e => {
      console.error('❌ FIREBASE_ERROR:', e.message);
      process.exit(1);
    });
} catch (e) {
  console.error('❌ INIT_ERROR:', e.message);
  process.exit(1);
}
