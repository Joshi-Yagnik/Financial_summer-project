# Financial Management Database - Complete Solution

## 📦 What's Included

This package provides a **complete, production-ready database schema** for a user-based financial management web application using Firebase Firestore.

### Core Features

✅ **User Isolation** - Strict data separation per user  
✅ **Complete CRUD Operations** - Create, Read, Update, Delete for all entities  
✅ **Automatic Balance Calculations** - Real-time balance updates  
✅ **Cascade Deletes** - Proper cleanup when deleting accounts  
✅ **Security Rules** - Comprehensive access control  
✅ **Indexes** - Optimized query performance  
✅ **User Initialization** - Auto-setup for new users  
✅ **Validation** - Input validation and error handling  

## 📁 Files Overview

| File | Purpose |
|------|---------|
| `DATABASE_SCHEMA.md` | Complete schema documentation with examples |
| `DATABASE_SETUP_GUIDE.md` | Step-by-step setup instructions |
| `firestore.rules` | Security rules for all collections |
| `firestore.indexes.json` | Index configuration for queries |
| `database.js` | CRUD utility functions |
| `initializeUser.js` | User initialization script |
| `FIRESTORE_SETUP.md` | Basic Firestore setup (existing) |

## 🚀 Quick Start

### 1. Deploy Security Rules
```bash
# Copy firestore.rules to Firebase Console → Firestore → Rules
# Or use CLI:
firebase deploy --only firestore:rules
```

### 2. Deploy Indexes
```bash
firebase deploy --only firestore:indexes
```

### 3. Use in Your Code
```javascript
import { initDatabase, createTransaction } from './database.js';
import { initializeNewUser } from './initializeUser.js';

const db = initDatabase(app);

// Initialize new user
await initializeNewUser(db, userId, email, name);

// Create transaction (balance auto-updates)
await createTransaction(db, userId, {
  accountId: 'acc_001',
  subAccountId: 'sub_001',
  transactionType: 'Income',
  amount: 5000.00,
  description: 'Salary'
});
```

## 🗂️ Database Structure

```
Firestore
├── users/{userId}
│   └── Profile data, settings
│
├── accounts/{accountId}
│   └── Main categories (Asset, Liability, Income, Expense, Equity)
│
├── subAccounts/{subAccountId}
│   └── Sub-accounts under main accounts
│
├── transactions/{transactionId}
│   └── All financial transactions
│
└── favorites/{favoriteId}
    └── User's favorite accounts/sub-accounts
```

## 🔐 Security

- ✅ Authentication required for all operations
- ✅ Users can only access their own data
- ✅ Input validation on all fields
- ✅ Type checking and constraints
- ✅ Prevents unauthorized access

## 📊 Key Functions

### Accounts
- `createAccount()` - Create new account
- `getAccounts()` - Get all user accounts
- `updateAccount()` - Update account
- `deleteAccount()` - Delete account (cascades)

### Sub-Accounts
- `createSubAccount()` - Create sub-account
- `getSubAccountsByAccount()` - Get sub-accounts
- `updateSubAccount()` - Update sub-account
- `deleteSubAccount()` - Delete sub-account (cascades)

### Transactions
- `createTransaction()` - Create transaction (auto-updates balance)
- `getTransactionsBySubAccount()` - Get transactions
- `updateTransaction()` - Update transaction (recalculates balance)
- `deleteTransaction()` - Delete transaction (recalculates balance)

### Balance Calculations
- `recalculateSubAccountBalance()` - Recalculate sub-account balance
- `recalculateAccountBalance()` - Recalculate account balance

### Favorites
- `addFavorite()` - Add favorite
- `getFavorites()` - Get all favorites
- `removeFavorite()` - Remove favorite

## 🎯 Use Cases Supported

✅ **Dashboard Views**
- Recent transactions
- All accounts
- Favorites
- Account balances

✅ **Account Management**
- Create/edit/delete accounts
- Create/edit/delete sub-accounts
- Favorite accounts

✅ **Transaction Management**
- Add income/expense transactions
- Transfer between accounts
- Edit/delete transactions
- Real-time balance updates

✅ **User Management**
- User signup with initialization
- User profile management
- User-specific data isolation

## 📈 Performance

- **Indexed Queries** - Fast lookups by userId, accountId, subAccountId
- **Batch Operations** - Atomic cascade deletes
- **Real-time Updates** - Firestore listeners for live data
- **Optimized Structure** - Denormalized for query performance

## 🔄 Data Flow

```
User Signup
  ↓
Initialize User (create profile + default accounts)
  ↓
User Creates Transaction
  ↓
Transaction Saved → Balance Recalculated
  ↓
Sub-Account Balance Updated → Account Balance Updated
  ↓
UI Updates in Real-Time
```

## 📝 Example Usage

### Complete Workflow

```javascript
// 1. User signs up
const user = await createUserWithEmailAndPassword(auth, email, password);
await initializeNewUser(db, user.uid, email, name);

// 2. Get user's accounts
const accounts = await getAccounts(db, user.uid);

// 3. Get sub-accounts for an account
const subAccounts = await getSubAccountsByAccount(db, user.uid, accounts[0].accountId);

// 4. Create a transaction
const transactionId = await createTransaction(db, user.uid, {
  accountId: accounts[0].accountId,
  subAccountId: subAccounts[0].subAccountId,
  transactionType: 'Income',
  amount: 10000.00,
  description: 'Salary',
  transactionDate: Timestamp.now()
});

// 5. Get transactions
const transactions = await getTransactionsBySubAccount(db, user.uid, subAccounts[0].subAccountId);

// 6. Balance is automatically updated!
// Check sub-account balance
const subAccount = await getSubAccount(db, user.uid, subAccounts[0].subAccountId);
console.log('Balance:', subAccount.balance); // 10000.00
```

## 🛡️ Validation

All functions include validation:

- ✅ userId must be valid string
- ✅ amount must be positive number
- ✅ accountType must be valid type
- ✅ transactionType must be valid type
- ✅ Ownership verification before operations

## 🚨 Error Handling

All functions throw descriptive errors:

```javascript
try {
  await createTransaction(db, userId, {...});
} catch (error) {
  console.error(error.message);
  // "Invalid amount: must be a positive number"
  // "Unauthorized: Account does not belong to user"
  // etc.
}
```

## 📚 Documentation

- **DATABASE_SCHEMA.md** - Complete schema with examples
- **DATABASE_SETUP_GUIDE.md** - Setup instructions
- **Code Comments** - Inline documentation in all functions

## ✅ Production Checklist

Before deploying to production:

- [ ] Security rules deployed
- [ ] Indexes created and built
- [ ] User initialization tested
- [ ] All CRUD operations tested
- [ ] Balance calculations verified
- [ ] Error handling tested
- [ ] Cascade deletes tested
- [ ] Performance tested with real data

## 🔮 Future Ready

The schema supports future enhancements:

- Budgeting system
- Recurring transactions
- Multi-currency support
- File attachments
- Advanced reporting
- Data exports

## 📞 Support

For issues or questions:

1. Check `DATABASE_SCHEMA.md` for schema details
2. Check `DATABASE_SETUP_GUIDE.md` for setup help
3. Review code comments in `database.js`
4. Check Firebase Console for errors

---

**Ready to use!** Follow `DATABASE_SETUP_GUIDE.md` to get started.

