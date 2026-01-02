# Database Setup Guide

Complete guide to setting up and deploying the Firestore database schema for the Financial Management Application.

## 📋 Prerequisites

1. Firebase project created at [Firebase Console](https://console.firebase.google.com/)
2. Firestore Database enabled
3. Firebase Authentication enabled (Email/Password)
4. Node.js and Firebase CLI installed (for deployment)

## 🚀 Quick Setup Steps

### Step 1: Deploy Firestore Security Rules

1. **Using Firebase Console (Recommended for beginners):**
   - Go to Firebase Console → Firestore Database → Rules
   - Copy the contents of `firestore.rules`
   - Paste into the rules editor
   - Click **Publish**

2. **Using Firebase CLI:**
   ```bash
   firebase deploy --only firestore:rules
   ```

### Step 2: Deploy Firestore Indexes

1. **Using Firebase Console:**
   - Go to Firebase Console → Firestore Database → Indexes
   - Click **Create Index**
   - For each index in `firestore.indexes.json`, create manually:
     - Select collection
     - Add fields in order
     - Set sort order (ASC/DESC)
     - Click **Create**

2. **Using Firebase CLI (Recommended):**
   ```bash
   firebase deploy --only firestore:indexes
   ```

### Step 3: Initialize Firebase in Your Application

Add this to your main application file (e.g., `firebase.js`):

```javascript
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { initDatabase } from './database.js';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  // ... other config
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = initDatabase(app);

export { app, auth, db };
```

### Step 4: Initialize New Users

Add user initialization to your signup flow:

```javascript
import { initializeNewUser } from './initializeUser.js';
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// In your signup handler
async function handleSignup(email, password, name) {
  try {
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Initialize user in Firestore
    await initializeNewUser(db, user.uid, email, name);

    console.log('User created and initialized successfully!');
  } catch (error) {
    console.error('Signup error:', error);
  }
}
```

## 📁 File Structure

```
project-root/
├── DATABASE_SCHEMA.md          # Complete schema documentation
├── DATABASE_SETUP_GUIDE.md     # This file
├── firestore.rules            # Security rules
├── firestore.indexes.json      # Index configuration
├── database.js                 # CRUD utility functions
├── initializeUser.js           # User initialization script
└── FIRESTORE_SETUP.md          # Basic Firestore setup (existing)
```

## 🔐 Security Rules Overview

The security rules ensure:

- ✅ Only authenticated users can access data
- ✅ Users can only access their own data (strict user isolation)
- ✅ All writes validate userId matches authenticated user
- ✅ Input validation for all fields
- ✅ Type checking for amounts, account types, transaction types

### Testing Security Rules

Use the Firebase Console Rules Playground to test your rules:

1. Go to Firestore Database → Rules
2. Click **Rules Playground**
3. Test various scenarios:
   - Authenticated user reading own data ✅
   - Authenticated user reading other user's data ❌
   - Unauthenticated user accessing data ❌

## 📊 Database Collections

### Collections Created:

1. **users/** - User profiles
2. **accounts/** - Main account categories
3. **subAccounts/** - Sub-accounts under main accounts
4. **transactions/** - All financial transactions
5. **favorites/** - User's favorite accounts/sub-accounts

## 🔄 Using Database Functions

### Example: Create an Account

```javascript
import { createAccount } from './database.js';

const accountId = await createAccount(db, userId, {
  accountType: 'Asset',
  name: 'My Assets',
  color: '#2196f3',
  isFavorite: false
});
```

### Example: Create a Transaction

```javascript
import { createTransaction, Timestamp } from './database.js';

const transactionId = await createTransaction(db, userId, {
  accountId: 'acc_001',
  subAccountId: 'sub_001',
  transactionType: 'Income',
  amount: 5000.00,
  description: 'Monthly Salary',
  transactionDate: Timestamp.now()
});

// Balance is automatically recalculated!
```

### Example: Get All Accounts

```javascript
import { getAccounts } from './database.js';

const accounts = await getAccounts(db, userId);
console.log(accounts);
// [
//   { accountId: 'acc_001', accountType: 'Asset', name: 'Assets', ... },
//   { accountId: 'acc_002', accountType: 'Expense', name: 'Expenses', ... }
// ]
```

### Example: Get Transactions for Sub-Account

```javascript
import { getTransactionsBySubAccount } from './database.js';

const transactions = await getTransactionsBySubAccount(db, userId, subAccountId);
// Returns transactions sorted by date (newest first)
```

## ⚖️ Balance Calculation

Balances are **automatically calculated** when:

- ✅ Transaction is created
- ✅ Transaction is updated
- ✅ Transaction is deleted
- ✅ Sub-account balance changes

### Balance Logic:

- **Sub-Account Balance**: Sum of all transactions
  - Income: `+amount`
  - Expense: `-amount`
  - Transfer: `-amount` (outgoing) or `+amount` (incoming)

- **Account Balance**: Sum of all sub-account balances

## 🗑️ Cascade Deletes

When deleting:

- **Account** → Deletes all sub-accounts → Deletes all transactions
- **Sub-Account** → Deletes all transactions
- **Transaction** → Recalculates balances

All cascade operations use Firestore batch writes for atomicity.

## 📈 Indexes

Required indexes are defined in `firestore.indexes.json`. These enable:

- Fast queries by userId + accountId
- Fast queries by userId + subAccountId
- Sorted results by date, name, etc.

**Note:** Firestore will automatically create indexes when you run queries, but it's better to deploy them upfront.

## 🧪 Testing

### Test User Initialization

```javascript
import { initializeNewUser } from './initializeUser.js';

// Test initialization
const result = await initializeNewUser(db, 'test-user-id', 'test@example.com', 'Test User');
console.log(result);
// {
//   success: true,
//   accounts: [...],
//   subAccounts: [...]
// }
```

### Test CRUD Operations

```javascript
import { 
  createAccount, 
  getAccounts, 
  updateAccount, 
  deleteAccount 
} from './database.js';

// Create
const accountId = await createAccount(db, userId, {...});

// Read
const accounts = await getAccounts(db, userId);

// Update
await updateAccount(db, userId, accountId, { isFavorite: true });

// Delete (cascades to sub-accounts and transactions)
await deleteAccount(db, userId, accountId);
```

## 🚨 Common Issues & Solutions

### Issue: "Permission denied" errors

**Solution:**
- Verify security rules are deployed
- Check that user is authenticated
- Ensure userId in request matches authenticated user

### Issue: Index missing errors

**Solution:**
- Deploy indexes using `firebase deploy --only firestore:indexes`
- Or create indexes manually in Firebase Console
- Wait for index to finish building (can take a few minutes)

### Issue: Balance not updating

**Solution:**
- Check that transaction operations are completing successfully
- Verify balance calculation functions are being called
- Check browser console for errors

### Issue: Cascade delete not working

**Solution:**
- Ensure batch writes are being used (they are in the provided functions)
- Check that all related documents exist
- Verify user has permission to delete all related documents

## 📝 Data Migration

If you have existing data, you may need to:

1. **Migrate existing transactions** to new schema
2. **Recalculate all balances** using `recalculateSubAccountBalance()` and `recalculateAccountBalance()`
3. **Update userId references** if user IDs changed

## 🔮 Future Enhancements

The schema supports future additions:

- **Budgeting**: Add `budgets` collection
- **Recurring Transactions**: Add `schedules` collection
- **Attachments**: Add file storage references
- **Categories**: Add `categories` collection
- **Reports**: Add pre-calculated report data

## 📚 Additional Resources

- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firestore Indexes](https://firebase.google.com/docs/firestore/query-data/indexing)

## ✅ Checklist

Before going to production:

- [ ] Security rules deployed and tested
- [ ] All indexes created and built
- [ ] User initialization tested
- [ ] CRUD operations tested
- [ ] Balance calculations verified
- [ ] Cascade deletes tested
- [ ] Error handling implemented
- [ ] User authentication flow working
- [ ] Data validation working

---

**Need Help?** Check the `DATABASE_SCHEMA.md` for detailed schema documentation.

