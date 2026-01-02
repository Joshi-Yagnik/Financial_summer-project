# Firestore Database Setup Guide

## Data Storage Structure

### Collection: `transactions`

Transactions are stored in Firestore under the `transactions` collection. Each transaction document contains:

```javascript
{
  userId: "user-uid-here",           // Current logged-in user's Firebase Auth UID
  accountId: "assets",                // Parent account identifier
  subAccountId: "cash-in-wallet",     // Sub-account identifier
  date: Timestamp,                    // Transaction date
  description: "Transaction description",
  amount: 100.50,                     // Transaction amount (number)
  type: "income" | "expense",         // Transaction type
  createdAt: Timestamp                // When transaction was created
}
```

### Firestore Path
```
transactions/
  └── {auto-generated-document-id}/
      ├── userId: "abc123..."
      ├── accountId: "assets"
      ├── subAccountId: "cash-in-wallet"
      ├── date: Timestamp
      ├── description: "Groceries"
      ├── amount: 150.00
      ├── type: "expense"
      └── createdAt: Timestamp
```

## Required Firestore Security Rules

**IMPORTANT:** You must configure Firestore security rules to allow authenticated users to read and write their own transactions.

### Go to Firebase Console:
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `financial-summer-project`
3. Go to **Firestore Database** → **Rules**

### Add these security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Transactions collection
    match /transactions/{transactionId} {
      // Allow read if the transaction belongs to the current user
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      
      // Allow create if the transaction is being created by the current user
      allow create: if request.auth != null && 
                       request.resource.data.userId == request.auth.uid &&
                       request.resource.data.accountId is string &&
                       request.resource.data.subAccountId is string &&
                       request.resource.data.amount is number &&
                       request.resource.data.type in ['income', 'expense'];
      
      // Allow update/delete if the transaction belongs to the current user
      allow update, delete: if request.auth != null && 
                               resource.data.userId == request.auth.uid;
    }
    
    // Users collection (if you're storing user data)
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Testing the Rules:
1. Click **Publish** to save the rules
2. Try adding a transaction in the app
3. Check the browser console (F12) for any errors

## Common Issues

### Error: "Permission denied"
- **Solution:** Update Firestore security rules as shown above
- Make sure you're logged in (check Firebase Auth)

### Error: "Network error" or "Unavailable"
- **Solution:** Check your internet connection
- Verify Firebase project is active

### Transactions not showing up
- **Solution:** 
  1. Check browser console for errors
  2. Verify you're logged in with the correct user
  3. Check Firestore console to see if data was saved
  4. Verify the query filters match (userId, accountId, subAccountId)

## Data Query Structure

Transactions are queried with these filters:
- `userId == currentUser.uid` (only current user's transactions)
- `accountId == 'assets'` (only Assets account transactions)
- `subAccountId == 'cash-in-wallet'` (only Cash in Wallet sub-account)

This ensures complete data isolation between users and accounts.

