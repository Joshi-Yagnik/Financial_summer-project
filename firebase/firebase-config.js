/**
 * Firebase Configuration and Initialization
 * 
 * Centralized Firebase setup with authentication state management.
 * Use this file to initialize Firebase in your application.
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { initDatabase } from './database.js';
import { initAuth, getCurrentUserId } from './auth-manager.js';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBvU2bIQsg7LoWkDfjTpMHU-WTrEBalMuw",
  authDomain: "financial-summer-project.firebaseapp.com",
  projectId: "financial-summer-project",
  storageBucket: "financial-summer-project.firebasestorage.app",
  messagingSenderId: "502346293460",
  appId: "1:502346293460:web:379e8369eddfd47ce51b41",
  measurementId: "G-9C8T2LGM4Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = initDatabase(app);

// Initialize authentication manager
initAuth(auth, (user, previousUser) => {
  if (user) {
    console.log('User authenticated:', user.uid);
    // User is logged in
  } else {
    console.log('User logged out');
    // User is logged out - redirect to login if needed
    if (previousUser) {
      // Only redirect if user was previously logged in (not on initial load)
      // Uncomment if you want automatic redirect on logout
      // window.location.href = 'login.html';
    }
  }
});

// Export for use in other modules
export { app, auth, db, getCurrentUserId };

// Also export as default for convenience
export default { app, auth, db, getCurrentUserId };

