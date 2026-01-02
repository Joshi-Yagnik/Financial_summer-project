/**
 * User Initialization Script
 * 
 * This script initializes default accounts and sub-accounts for new users.
 * Run this when a user signs up to create their initial financial structure.
 */

import { initDatabase, createAccount, createSubAccount } from './firebase/database.js';

/**
 * Default account configuration
 */
const DEFAULT_ACCOUNTS = [
  {
    accountType: 'Asset',
    name: 'Assets',
    color: '#2196f3',
    subAccounts: [
      { name: 'Cash in Wallet', color: '#2196f3' },
      { name: 'Checking Account', color: '#2196f3' },
      { name: 'Savings Account', color: '#2196f3' }
    ]
  },
  {
    accountType: 'Liability',
    name: 'Liabilities',
    color: '#f44336',
    subAccounts: [
      { name: 'Credit Cards', color: '#f44336' },
      { name: 'Loans', color: '#f44336' }
    ]
  },
  {
    accountType: 'Income',
    name: 'Income',
    color: '#4caf50',
    subAccounts: [
      { name: 'Salary', color: '#4caf50' },
      { name: 'Business Income', color: '#4caf50' }
    ]
  },
  {
    accountType: 'Expense',
    name: 'Expenses',
    color: '#ff9800',
    subAccounts: [
      { name: 'Groceries', color: '#ff9800' },
      { name: 'Bills', color: '#ff9800' },
      { name: 'Entertainment', color: '#ff9800' }
    ]
  },
  {
    accountType: 'Equity',
    name: 'Equity',
    color: '#9c27b0',
    subAccounts: [
      { name: 'Opening Balances', color: '#9c27b0' }
    ]
  }
];

/**
 * Initialize default accounts and sub-accounts for a new user
 * @param {Object} db - Firestore database instance
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Created accounts and sub-accounts
 */
export async function initializeUserAccounts(db, userId) {
  if (!userId || typeof userId !== 'string') {
    throw new Error('Valid userId is required');
  }

  const createdAccounts = [];
  const createdSubAccounts = [];

  try {
    // Create all default accounts and their sub-accounts
    for (const accountConfig of DEFAULT_ACCOUNTS) {
      // Create main account
      const accountId = await createAccount(db, userId, {
        accountType: accountConfig.accountType,
        name: accountConfig.name,
        color: accountConfig.color,
        isFavorite: false
      });

      createdAccounts.push({
        accountId,
        accountType: accountConfig.accountType,
        name: accountConfig.name
      });

      // Create sub-accounts for this account
      for (const subAccountConfig of accountConfig.subAccounts) {
        const subAccountId = await createSubAccount(db, userId, accountId, {
          name: subAccountConfig.name,
          color: subAccountConfig.color,
          isFavorite: false
        });

        createdSubAccounts.push({
          subAccountId,
          accountId,
          name: subAccountConfig.name
        });
      }
    }

    return {
      success: true,
      accounts: createdAccounts,
      subAccounts: createdSubAccounts,
      message: `Successfully initialized ${createdAccounts.length} accounts and ${createdSubAccounts.length} sub-accounts`
    };
  } catch (error) {
    console.error('Error initializing user accounts:', error);
    throw new Error(`Failed to initialize user accounts: ${error.message}`);
  }
}

/**
 * Initialize user profile
 * @param {Object} db - Firestore database instance
 * @param {string} userId - User ID
 * @param {string} email - User email
 * @param {string} name - User name
 * @returns {Promise<void>}
 */
export async function initializeUserProfile(db, userId, email, name) {
  if (!userId || !email || !name) {
    throw new Error('userId, email, and name are required');
  }

  const { doc, setDoc, serverTimestamp } = await import(
    "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"
  );

  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, {
    userId: userId,
    email: email,
    name: name,
    currency: 'INR',
    createdAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
    settings: {
      theme: 'dark',
      notifications: true
    }
  });
}

/**
 * Complete user initialization (profile + accounts)
 * Call this when a user signs up
 * @param {Object} db - Firestore database instance
 * @param {string} userId - User ID
 * @param {string} email - User email
 * @param {string} name - User name
 * @returns {Promise<Object>} - Initialization result
 */
export async function initializeNewUser(db, userId, email, name) {
  try {
    // Initialize user profile
    await initializeUserProfile(db, userId, email, name);

    // Initialize default accounts and sub-accounts
    const accountsResult = await initializeUserAccounts(db, userId);

    return {
      success: true,
      userId: userId,
      profile: {
        email: email,
        name: name
      },
      accounts: accountsResult.accounts,
      subAccounts: accountsResult.subAccounts,
      message: 'User successfully initialized'
    };
  } catch (error) {
    console.error('Error initializing new user:', error);
    throw error;
  }
}

/**
 * Usage Example:
 * 
 * import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
 * import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
 * import { initDatabase, initializeNewUser } from './initializeUser.js';
 * 
 * const app = initializeApp(firebaseConfig);
 * const auth = getAuth(app);
 * const db = initDatabase(app);
 * 
 * onAuthStateChanged(auth, async (user) => {
 *   if (user) {
 *     // Check if user is new (no accounts exist)
 *     const accounts = await getAccounts(db, user.uid);
 *     if (accounts.length === 0) {
 *       // Initialize new user
 *       await initializeNewUser(db, user.uid, user.email, user.displayName || 'User');
 *     }
 *   }
 * });
 */

