# Financial Management Application - Database Schema

## Overview

This document defines the complete Firestore database schema for a user-based financial management web application. The schema ensures strict user isolation, proper relationships, and supports all CRUD operations.

## Database: Firestore (NoSQL)

### Collection Structure

```
firestore/
├── users/                    # User profiles (optional, Auth handles auth)
├── accounts/                 # Main account categories
├── subAccounts/              # Sub-accounts under main accounts
├── transactions/             # All financial transactions
└── favorites/                # User's favorite accounts/sub-accounts
```

---

## 1. Users Collection

**Path:** `users/{userId}`

**Note:** Firebase Authentication handles user authentication. This collection stores additional user profile data.

### Document Structure

```typescript
{
  userId: string,              // Primary key (Firebase Auth UID)
  name: string,                // User's full name
  email: string,               // User's email (unique, from Auth)
  createdAt: Timestamp,        // Account creation date
  lastLoginAt: Timestamp,      // Last login timestamp
  currency: string,             // Default currency (e.g., "INR", "USD")
  settings: {
    theme: "light" | "dark",
    notifications: boolean
  }
}
```

### Example Document

```json
{
  "userId": "abc123xyz789",
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2025-01-15T10:30:00Z",
  "lastLoginAt": "2025-01-20T14:22:00Z",
  "currency": "INR",
  "settings": {
    "theme": "dark",
    "notifications": true
  }
}
```

---

## 2. Accounts Collection

**Path:** `accounts/{accountId}`

Stores main account categories (Assets, Liabilities, Income, Expenses, Equity).

### Document Structure

```typescript
{
  accountId: string,           // Auto-generated document ID
  userId: string,               // Foreign key → users.userId
  accountType: string,          // "Asset" | "Liability" | "Income" | "Expense" | "Equity"
  name: string,                 // Account name (e.g., "Assets", "Expenses")
  totalBalance: number,        // Calculated balance (default: 0.00)
  isFavorite: boolean,          // Favorite status (default: false)
  color: string,                // UI color code (e.g., "#2196f3")
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Example Documents

```json
// Asset Account
{
  "accountId": "acc_001",
  "userId": "abc123xyz789",
  "accountType": "Asset",
  "name": "Assets",
  "totalBalance": 50000.00,
  "isFavorite": true,
  "color": "#2196f3",
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-20T14:22:00Z"
}

// Expense Account
{
  "accountId": "acc_002",
  "userId": "abc123xyz789",
  "accountType": "Expense",
  "name": "Expenses",
  "totalBalance": 0.00,
  "isFavorite": false,
  "color": "#f44336",
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-15T10:30:00Z"
}
```

### Account Types

- **Asset**: Things you own (Cash, Bank Accounts, Investments)
- **Liability**: Things you owe (Loans, Credit Cards, Debts)
- **Income**: Money coming in (Salary, Business Income)
- **Expense**: Money going out (Groceries, Bills, Rent)
- **Equity**: Net worth (Opening Balances, Capital)

---

## 3. SubAccounts Collection

**Path:** `subAccounts/{subAccountId}`

Stores sub-accounts under main accounts (e.g., "Cash in Wallet" under "Assets").

### Document Structure

```typescript
{
  subAccountId: string,        // Auto-generated document ID
  accountId: string,           // Foreign key → accounts.accountId
  userId: string,               // Foreign key → users.userId
  name: string,                 // Sub-account name (e.g., "Cash in Wallet", "SBI Bank")
  balance: number,             // Calculated balance (default: 0.00)
  isFavorite: boolean,          // Favorite status (default: false)
  color: string,                // UI color code
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Example Documents

```json
// Cash in Wallet (under Assets)
{
  "subAccountId": "sub_001",
  "accountId": "acc_001",
  "userId": "abc123xyz789",
  "name": "Cash in Wallet",
  "balance": 5000.00,
  "isFavorite": true,
  "color": "#2196f3",
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-20T14:22:00Z"
}

// Checking Account (under Assets)
{
  "subAccountId": "sub_002",
  "accountId": "acc_001",
  "userId": "abc123xyz789",
  "name": "Checking Account",
  "balance": 45000.00,
  "isFavorite": false,
  "color": "#2196f3",
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-20T14:22:00Z"
}
```

---

## 4. Transactions Collection

**Path:** `transactions/{transactionId}`

Stores all financial transactions linked to accounts and sub-accounts.

### Document Structure

```typescript
{
  transactionId: string,        // Auto-generated document ID
  userId: string,               // Foreign key → users.userId
  accountId: string,            // Foreign key → accounts.accountId
  subAccountId: string,          // Foreign key → subAccounts.subAccountId
  transactionType: string,       // "Income" | "Expense" | "Transfer"
  amount: number,               // Transaction amount (always positive)
  description: string,          // Transaction description/note
  transactionDate: Timestamp,   // Date of transaction
  category: string,             // Optional category (e.g., "Groceries", "Salary")
  tags: string[],               // Optional tags for filtering
  createdAt: Timestamp,        // When record was created
  updatedAt: Timestamp          // When record was last updated
}
```

### Example Documents

```json
// Income Transaction
{
  "transactionId": "txn_001",
  "userId": "abc123xyz789",
  "accountId": "acc_003",
  "subAccountId": "sub_003",
  "transactionType": "Income",
  "amount": 50000.00,
  "description": "Monthly Salary",
  "transactionDate": "2025-01-01T00:00:00Z",
  "category": "Salary",
  "tags": ["salary", "monthly"],
  "createdAt": "2025-01-01T08:00:00Z",
  "updatedAt": "2025-01-01T08:00:00Z"
}

// Expense Transaction
{
  "transactionId": "txn_002",
  "userId": "abc123xyz789",
  "accountId": "acc_002",
  "subAccountId": "sub_001",
  "transactionType": "Expense",
  "amount": 2000.00,
  "description": "Grocery Shopping",
  "transactionDate": "2025-01-15T00:00:00Z",
  "category": "Groceries",
  "tags": ["food", "shopping"],
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-15T10:30:00Z"
}

// Transfer Transaction (between accounts)
{
  "transactionId": "txn_003",
  "userId": "abc123xyz789",
  "accountId": "acc_001",
  "subAccountId": "sub_001",
  "transactionType": "Transfer",
  "amount": 10000.00,
  "description": "Transfer to Savings",
  "transactionDate": "2025-01-18T00:00:00Z",
  "category": "Transfer",
  "tags": ["transfer", "savings"],
  "toAccountId": "acc_001",
  "toSubAccountId": "sub_004",
  "createdAt": "2025-01-18T12:00:00Z",
  "updatedAt": "2025-01-18T12:00:00Z"
}
```

### Transaction Types

- **Income**: Money added to account (increases balance)
- **Expense**: Money removed from account (decreases balance)
- **Transfer**: Money moved between accounts (decreases source, increases destination)

---

## 5. Favorites Collection

**Path:** `favorites/{favoriteId}`

Stores user's favorite accounts and sub-accounts for quick access.

### Document Structure

```typescript
{
  favoriteId: string,          // Auto-generated document ID
  userId: string,               // Foreign key → users.userId
  accountId: string | null,     // Foreign key → accounts.accountId (if favorite is account)
  subAccountId: string | null, // Foreign key → subAccounts.subAccountId (if favorite is sub-account)
  favoriteType: string,        // "account" | "subAccount"
  createdAt: Timestamp
}
```

### Example Documents

```json
// Favorite Account
{
  "favoriteId": "fav_001",
  "userId": "abc123xyz789",
  "accountId": "acc_001",
  "subAccountId": null,
  "favoriteType": "account",
  "createdAt": "2025-01-15T10:30:00Z"
}

// Favorite Sub-Account
{
  "favoriteId": "fav_002",
  "userId": "abc123xyz789",
  "accountId": null,
  "subAccountId": "sub_001",
  "favoriteType": "subAccount",
  "createdAt": "2025-01-15T10:30:00Z"
}
```

---

## Relationships & Data Integrity

### Foreign Key Relationships

```
users.userId
  ├── accounts.userId
  │     ├── subAccounts.accountId
  │     └── transactions.accountId
  ├── subAccounts.userId
  ├── transactions.userId
  │     └── transactions.subAccountId
  └── favorites.userId
```

### Data Integrity Rules

1. **User Isolation**: All queries must filter by `userId == currentUser.uid`
2. **Cascade Deletes**: 
   - Deleting an account should delete all sub-accounts
   - Deleting a sub-account should delete all transactions
   - Deleting a user should delete all related data
3. **Balance Updates**: 
   - Adding/updating/deleting transactions must recalculate balances
   - Sub-account balance = sum of all transactions for that sub-account
   - Account balance = sum of all sub-account balances
4. **Validation**:
   - `userId` must always be present and valid
   - `amount` must be positive number
   - `transactionType` must be one of: "Income", "Expense", "Transfer"
   - `accountType` must be one of: "Asset", "Liability", "Income", "Expense", "Equity"

---

## Indexes

### Required Composite Indexes

1. **Transactions by User and Account**
   - Fields: `userId` (Ascending), `accountId` (Ascending), `transactionDate` (Descending)

2. **Transactions by User and Sub-Account**
   - Fields: `userId` (Ascending), `subAccountId` (Ascending), `transactionDate` (Descending)

3. **Sub-Accounts by User and Account**
   - Fields: `userId` (Ascending), `accountId` (Ascending), `name` (Ascending)

4. **Accounts by User and Type**
   - Fields: `userId` (Ascending), `accountType` (Ascending), `createdAt` (Descending)

5. **Favorites by User**
   - Fields: `userId` (Ascending), `createdAt` (Descending)

---

## Balance Calculation Logic

### Sub-Account Balance

```
balance = SUM(
  IF transactionType == "Income" THEN +amount
  IF transactionType == "Expense" THEN -amount
  IF transactionType == "Transfer" AND isOutgoing THEN -amount
  IF transactionType == "Transfer" AND isIncoming THEN +amount
) WHERE subAccountId == currentSubAccountId
```

### Account Balance

```
totalBalance = SUM(subAccount.balance) 
WHERE accountId == currentAccountId
```

### Initialization

- New users: All balances default to `0.00`
- New accounts: `totalBalance = 0.00`
- New sub-accounts: `balance = 0.00`

---

## Query Patterns

### Get All Accounts for User
```javascript
query(
  collection(db, 'accounts'),
  where('userId', '==', currentUser.uid),
  orderBy('accountType', 'asc'),
  orderBy('createdAt', 'desc')
)
```

### Get Sub-Accounts for Account
```javascript
query(
  collection(db, 'subAccounts'),
  where('userId', '==', currentUser.uid),
  where('accountId', '==', accountId),
  orderBy('name', 'asc')
)
```

### Get Transactions for Sub-Account
```javascript
query(
  collection(db, 'transactions'),
  where('userId', '==', currentUser.uid),
  where('subAccountId', '==', subAccountId),
  orderBy('transactionDate', 'desc')
)
```

### Get Favorites
```javascript
query(
  collection(db, 'favorites'),
  where('userId', '==', currentUser.uid),
  orderBy('createdAt', 'desc')
)
```

---

## Security Considerations

1. **Authentication Required**: All operations require valid Firebase Auth user
2. **User Isolation**: Users can only access their own data
3. **Input Validation**: All inputs validated on client and server (via security rules)
4. **Balance Integrity**: Balance updates must be atomic (use transactions/batch writes)
5. **Audit Trail**: `createdAt` and `updatedAt` timestamps track all changes

---

## Migration & Initialization

### New User Setup

When a user signs up, initialize default accounts:

1. Create 5 default accounts (Asset, Liability, Income, Expense, Equity)
2. Create default sub-accounts for Assets (e.g., "Cash in Wallet", "Checking Account")
3. Set all balances to 0.00
4. Create user profile document

---

## Future Enhancements

1. **Budgeting**: Add budget collection with monthly/yearly limits
2. **Recurring Transactions**: Add schedule and frequency fields
3. **Attachments**: Add file storage references for receipts
4. **Categories**: Separate categories collection for better organization
5. **Reports**: Pre-calculated report data for performance
6. **Multi-Currency**: Support for multiple currencies per transaction

