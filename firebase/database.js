/**
 * Financial Management Application - Database Utility Functions
 * 
 * This module provides CRUD operations for all database collections
 * with proper user isolation, validation, and balance calculations.
 */

import {
  getFirestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  writeBatch,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/**
 * Initialize Firestore database
 */
export function initDatabase(app) {
  return getFirestore(app);
}

/**
 * ============================================
 * VALIDATION HELPERS
 * ============================================
 */

/**
 * Validate userId - STRICT validation
 * @param {string} userId - User ID to validate
 * @param {string} currentUserId - Current authenticated user's UID (optional, for cross-check)
 * @returns {string} Validated and trimmed userId
 * @throws {Error} If userId is invalid or doesn't match current user
 */
function validateUserId(userId, currentUserId = null) {
  // Check if userId exists and is valid
  if (!userId) {
    throw new Error('userId is required and cannot be null or undefined');
  }

  if (typeof userId !== 'string') {
    throw new Error(`Invalid userId: expected string, got ${typeof userId}`);
  }

  const trimmed = userId.trim();
  if (trimmed === '') {
    throw new Error('userId cannot be an empty string');
  }

  // If currentUserId is provided, ensure they match (security check)
  if (currentUserId && trimmed !== currentUserId) {
    throw new Error('Security violation: userId does not match authenticated user');
  }

  return trimmed;
}

/**
 * Require userId - ensures userId is always present
 * @param {string} userId - User ID
 * @returns {string} Validated userId
 * @throws {Error} If userId is missing
 */
function requireUserId(userId) {
  if (!userId) {
    throw new Error('CRITICAL: userId is required for all database operations. User must be authenticated.');
  }
  return validateUserId(userId);
}

function validateAmount(amount) {
  if (typeof amount !== 'number' || amount <= 0 || isNaN(amount)) {
    throw new Error('Invalid amount: must be a positive number');
  }
  return amount;
}

function validateAccountType(accountType) {
  const validTypes = ['Asset', 'Liability', 'Income', 'Expense', 'Equity'];
  if (!validTypes.includes(accountType)) {
    throw new Error(`Invalid accountType: must be one of ${validTypes.join(', ')}`);
  }
  return accountType;
}

function validateTransactionType(transactionType) {
  const validTypes = ['Income', 'Expense', 'Transfer'];
  if (!validTypes.includes(transactionType)) {
    throw new Error(`Invalid transactionType: must be one of ${validTypes.join(', ')}`);
  }
  return transactionType;
}

/**
 * ============================================
 * ACCOUNTS CRUD OPERATIONS
 * ============================================
 */

/**
 * Create a new account
 * @param {Object} db - Firestore database instance
 * @param {string} userId - User ID
 * @param {Object} accountData - Account data
 * @returns {Promise<string>} - Account ID
 */
export async function createAccount(db, userId, accountData) {
  // STRICT validation - userId is required
  const validatedUserId = requireUserId(userId);
  validateAccountType(accountData.accountType);

  // Ensure userId is included in data (double-check)
  const accountDataWithUserId = {
    userId: validatedUserId, // Use validated userId
    accountType: accountData.accountType,
    name: accountData.name || accountData.accountType,
    totalBalance: 0.00,
    isFavorite: accountData.isFavorite || false,
    color: accountData.color || '#2196f3',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  // Final validation before write
  if (!accountDataWithUserId.userId) {
    throw new Error('CRITICAL: userId is missing from account data. Cannot create account without user ID.');
  }

  const accountRef = await addDoc(collection(db, 'accounts'), accountDataWithUserId);

  return accountRef.id;
}

/**
 * Get all accounts for a user
 * @param {Object} db - Firestore database instance
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of account documents
 */
export async function getAccounts(db, userId) {
  // STRICT validation - userId is required
  const validatedUserId = requireUserId(userId);

  const accountsRef = collection(db, 'accounts');
  const q = query(
    accountsRef,
    where('userId', '==', validatedUserId), // Always use validated userId
    orderBy('accountType', 'asc'),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    // Verify ownership (security check)
    if (data.userId !== validatedUserId) {
      console.warn('Security warning: Account found with mismatched userId');
    }
    return {
      accountId: doc.id,
      ...data
    };
  });
}

/**
 * Get account by ID
 * @param {Object} db - Firestore database instance
 * @param {string} userId - User ID
 * @param {string} accountId - Account ID
 * @returns {Promise<Object>} - Account document
 */
export async function getAccount(db, userId, accountId) {
  // STRICT validation
  const validatedUserId = requireUserId(userId);
  if (!accountId || typeof accountId !== 'string' || accountId.trim() === '') {
    throw new Error('accountId is required and must be a non-empty string');
  }

  const accountRef = doc(db, 'accounts', accountId);
  const accountSnap = await getDoc(accountRef);

  if (!accountSnap.exists()) {
    throw new Error('Account not found');
  }

  const accountData = accountSnap.data();

  // STRICT ownership verification
  if (!accountData.userId) {
    throw new Error('Security error: Account missing userId field');
  }

  if (accountData.userId !== validatedUserId) {
    throw new Error('Unauthorized: Account does not belong to authenticated user');
  }

  return {
    accountId: accountSnap.id,
    ...accountData
  };
}

/**
 * Update account
 * @param {Object} db - Firestore database instance
 * @param {string} userId - User ID
 * @param {string} accountId - Account ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<void>}
 */
export async function updateAccount(db, userId, accountId, updateData) {
  // STRICT validation
  const validatedUserId = requireUserId(userId);
  if (!accountId || typeof accountId !== 'string' || accountId.trim() === '') {
    throw new Error('accountId is required and must be a non-empty string');
  }

  // Verify ownership (this also validates userId)
  const account = await getAccount(db, validatedUserId, accountId);

  // Ensure userId cannot be changed
  const updateFields = {
    ...updateData,
    updatedAt: serverTimestamp()
  };

  // Prevent userId modification
  if ('userId' in updateFields) {
    delete updateFields.userId;
    console.warn('Warning: Attempted to modify userId. This field is protected.');
  }

  // Ensure userId remains in document
  if (updateFields.accountType) {
    validateAccountType(updateFields.accountType);
  }

  const accountRef = doc(db, 'accounts', accountId);
  await updateDoc(accountRef, updateFields);
}

/**
 * Delete account (and cascade delete sub-accounts and transactions)
 * @param {Object} db - Firestore database instance
 * @param {string} userId - User ID
 * @param {string} accountId - Account ID
 * @returns {Promise<void>}
 */
export async function deleteAccount(db, userId, accountId) {
  // STRICT validation
  const validatedUserId = requireUserId(userId);
  if (!accountId || typeof accountId !== 'string' || accountId.trim() === '') {
    throw new Error('accountId is required and must be a non-empty string');
  }

  // Verify ownership (this also validates userId)
  await getAccount(db, validatedUserId, accountId);

  const batch = writeBatch(db);

  // Get all sub-accounts (uses validated userId)
  const subAccounts = await getSubAccountsByAccount(db, validatedUserId, accountId);

  // Delete all transactions for each sub-account
  for (const subAccount of subAccounts) {
    const transactions = await getTransactionsBySubAccount(db, validatedUserId, subAccount.subAccountId);
    transactions.forEach(txn => {
      batch.delete(doc(db, 'transactions', txn.transactionId));
    });
    // Delete sub-account
    batch.delete(doc(db, 'subAccounts', subAccount.subAccountId));
  }

  // Delete account
  batch.delete(doc(db, 'accounts', accountId));

  // Delete related favorites
  const favorites = await getFavoritesByAccount(db, validatedUserId, accountId);
  favorites.forEach(fav => {
    batch.delete(doc(db, 'favorites', fav.favoriteId));
  });

  await batch.commit();
}

/**
 * ============================================
 * SUB-ACCOUNTS CRUD OPERATIONS
 * ============================================
 */

/**
 * Create a new sub-account
 * @param {Object} db - Firestore database instance
 * @param {string} userId - User ID
 * @param {string} accountId - Parent account ID
 * @param {Object} subAccountData - Sub-account data
 * @returns {Promise<string>} - Sub-account ID
 */
export async function createSubAccount(db, userId, accountId, subAccountData) {
  // STRICT validation
  const validatedUserId = requireUserId(userId);
  if (!accountId || typeof accountId !== 'string' || accountId.trim() === '') {
    throw new Error('accountId is required and must be a non-empty string');
  }

  // Verify parent account exists and belongs to user (this also validates userId)
  await getAccount(db, validatedUserId, accountId);

  // Ensure userId is always included
  const subAccountDataWithUserId = {
    accountId: accountId,
    userId: validatedUserId, // Use validated userId
    name: subAccountData.name,
    balance: 0.00,
    isFavorite: subAccountData.isFavorite || false,
    color: subAccountData.color || '#2196f3',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  // Final validation
  if (!subAccountDataWithUserId.userId) {
    throw new Error('CRITICAL: userId is missing from sub-account data. Cannot create sub-account without user ID.');
  }

  const subAccountRef = await addDoc(collection(db, 'subAccounts'), subAccountDataWithUserId);

  return subAccountRef.id;
}

/**
 * Get all sub-accounts for an account
 * @param {Object} db - Firestore database instance
 * @param {string} userId - User ID
 * @param {string} accountId - Account ID
 * @returns {Promise<Array>} - Array of sub-account documents
 */
export async function getSubAccountsByAccount(db, userId, accountId) {
  // STRICT validation
  const validatedUserId = requireUserId(userId);
  if (!accountId || typeof accountId !== 'string' || accountId.trim() === '') {
    throw new Error('accountId is required and must be a non-empty string');
  }

  const subAccountsRef = collection(db, 'subAccounts');
  const q = query(
    subAccountsRef,
    where('userId', '==', validatedUserId), // Always use validated userId
    where('accountId', '==', accountId),
    orderBy('name', 'asc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    // Verify ownership (security check)
    if (data.userId !== validatedUserId) {
      console.warn('Security warning: Sub-account found with mismatched userId');
    }
    return {
      subAccountId: doc.id,
      ...data
    };
  });
}

/**
 * Get sub-account by ID
 * @param {Object} db - Firestore database instance
 * @param {string} userId - User ID
 * @param {string} subAccountId - Sub-account ID
 * @returns {Promise<Object>} - Sub-account document
 */
export async function getSubAccount(db, userId, subAccountId) {
  // STRICT validation
  const validatedUserId = requireUserId(userId);
  if (!subAccountId || typeof subAccountId !== 'string' || subAccountId.trim() === '') {
    throw new Error('subAccountId is required and must be a non-empty string');
  }

  const subAccountRef = doc(db, 'subAccounts', subAccountId);
  const subAccountSnap = await getDoc(subAccountRef);

  if (!subAccountSnap.exists()) {
    throw new Error('Sub-account not found');
  }

  const subAccountData = subAccountSnap.data();

  // STRICT ownership verification
  if (!subAccountData.userId) {
    throw new Error('Security error: Sub-account missing userId field');
  }

  if (subAccountData.userId !== validatedUserId) {
    throw new Error('Unauthorized: Sub-account does not belong to authenticated user');
  }

  return {
    subAccountId: subAccountSnap.id,
    ...subAccountData
  };
}

/**
 * Update sub-account
 * @param {Object} db - Firestore database instance
 * @param {string} userId - User ID
 * @param {string} subAccountId - Sub-account ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<void>}
 */
export async function updateSubAccount(db, userId, subAccountId, updateData) {
  // STRICT validation
  const validatedUserId = requireUserId(userId);
  if (!subAccountId || typeof subAccountId !== 'string' || subAccountId.trim() === '') {
    throw new Error('subAccountId is required and must be a non-empty string');
  }

  // Verify ownership (this also validates userId)
  await getSubAccount(db, validatedUserId, subAccountId);

  // Ensure userId cannot be changed
  const updateFields = {
    ...updateData,
    updatedAt: serverTimestamp()
  };

  // Prevent userId and accountId modification
  if ('userId' in updateFields) {
    delete updateFields.userId;
    console.warn('Warning: Attempted to modify userId. This field is protected.');
  }
  if ('accountId' in updateFields) {
    delete updateFields.accountId;
    console.warn('Warning: Attempted to modify accountId. This field is protected.');
  }

  const subAccountRef = doc(db, 'subAccounts', subAccountId);
  await updateDoc(subAccountRef, updateFields);
}

/**
 * Delete sub-account (and cascade delete transactions)
 * @param {Object} db - Firestore database instance
 * @param {string} userId - User ID
 * @param {string} subAccountId - Sub-account ID
 * @returns {Promise<void>}
 */
export async function deleteSubAccount(db, userId, subAccountId) {
  // STRICT validation
  const validatedUserId = requireUserId(userId);
  if (!subAccountId || typeof subAccountId !== 'string' || subAccountId.trim() === '') {
    throw new Error('subAccountId is required and must be a non-empty string');
  }

  // Verify ownership (this also validates userId)
  await getSubAccount(db, validatedUserId, subAccountId);

  const batch = writeBatch(db);

  // Delete all transactions (uses validated userId)
  const transactions = await getTransactionsBySubAccount(db, validatedUserId, subAccountId);
  transactions.forEach(txn => {
    batch.delete(doc(db, 'transactions', txn.transactionId));
  });

  // Delete sub-account
  batch.delete(doc(db, 'subAccounts', subAccountId));

  // Delete related favorites
  const favorites = await getFavoritesBySubAccount(db, validatedUserId, subAccountId);
  favorites.forEach(fav => {
    batch.delete(doc(db, 'favorites', fav.favoriteId));
  });

  await batch.commit();

  // Recalculate parent account balance (get accountId from sub-account before deletion)
  const subAccount = await getSubAccount(db, validatedUserId, subAccountId);
  const parentAccountId = subAccount.accountId;

  // Note: We get accountId before deletion, so we can still recalculate
  await recalculateAccountBalance(db, validatedUserId, parentAccountId);
}

/**
 * ============================================
 * TRANSACTIONS CRUD OPERATIONS
 * ============================================
 */

/**
 * Create a new transaction and update balances
 * @param {Object} db - Firestore database instance
 * @param {string} userId - User ID
 * @param {Object} transactionData - Transaction data
 * @returns {Promise<string>} - Transaction ID
 */
export async function createTransaction(db, userId, transactionData) {
  // STRICT validation
  const validatedUserId = requireUserId(userId);
  validateTransactionType(transactionData.transactionType);
  validateAmount(transactionData.amount);

  if (!transactionData.accountId || typeof transactionData.accountId !== 'string' || transactionData.accountId.trim() === '') {
    throw new Error('accountId is required and must be a non-empty string');
  }

  if (!transactionData.subAccountId || typeof transactionData.subAccountId !== 'string' || transactionData.subAccountId.trim() === '') {
    throw new Error('subAccountId is required and must be a non-empty string');
  }

  // Verify account and sub-account exist and belong to user (validates ownership)
  await getAccount(db, validatedUserId, transactionData.accountId);
  await getSubAccount(db, validatedUserId, transactionData.subAccountId);

  const batch = writeBatch(db);
  const timestamp = transactionData.transactionDate || Timestamp.now();
  const serverTime = serverTimestamp();

  // Common data
  const baseTransaction = {
    userId: validatedUserId,
    amount: transactionData.amount,
    description: transactionData.description || '',
    transactionDate: timestamp,
    category: transactionData.category || '',
    tags: transactionData.tags || [],
    createdAt: serverTime,
    updatedAt: serverTime
  };

  if (transactionData.transactionType === 'Transfer') {
    // Validate destination
    if (!transactionData.toAccountId || !transactionData.toSubAccountId) {
      throw new Error('toAccountId and toSubAccountId are required for Transfer transactions');
    }

    // Verify destination ownership
    await getAccount(db, validatedUserId, transactionData.toAccountId);
    await getSubAccount(db, validatedUserId, transactionData.toSubAccountId);

    const sourceRef = doc(collection(db, 'transactions'));
    const destRef = doc(collection(db, 'transactions'));

    // Source Transaction (Outgoing)
    const sourceTxn = {
      ...baseTransaction,
      accountId: transactionData.accountId,
      subAccountId: transactionData.subAccountId,
      transactionType: 'Transfer',
      transferType: 'Outgoing',
      linkedTransactionId: destRef.id,
      toAccountId: transactionData.toAccountId,
      toSubAccountId: transactionData.toSubAccountId
    };

    // Destination Transaction (Incoming)
    const destTxn = {
      ...baseTransaction,
      accountId: transactionData.toAccountId,
      subAccountId: transactionData.toSubAccountId,
      transactionType: 'Transfer',
      transferType: 'Incoming',
      linkedTransactionId: sourceRef.id,
      fromAccountId: transactionData.accountId,
      fromSubAccountId: transactionData.subAccountId
    };

    batch.set(sourceRef, sourceTxn);
    batch.set(destRef, destTxn);

    await batch.commit();

    // Recalculate balances for BOTH
    await recalculateSubAccountBalance(db, validatedUserId, transactionData.subAccountId);
    await recalculateAccountBalance(db, validatedUserId, transactionData.accountId);

    // Only recalculate destination if it's different from source (handle edge case)
    if (transactionData.subAccountId !== transactionData.toSubAccountId) {
      await recalculateSubAccountBalance(db, validatedUserId, transactionData.toSubAccountId);
      if (transactionData.accountId !== transactionData.toAccountId) {
        await recalculateAccountBalance(db, validatedUserId, transactionData.toAccountId);
      }
    }

    return sourceRef.id;

  } else {
    // Normal Income/Expense
    const transactionDataWithUserId = {
      ...baseTransaction,
      accountId: transactionData.accountId,
      subAccountId: transactionData.subAccountId,
      transactionType: transactionData.transactionType
    };

    const transactionRef = doc(collection(db, 'transactions'));
    batch.set(transactionRef, transactionDataWithUserId);

    await batch.commit();

    // Recalculate balances
    await recalculateSubAccountBalance(db, validatedUserId, transactionData.subAccountId);
    await recalculateAccountBalance(db, validatedUserId, transactionData.accountId);

    return transactionRef.id;
  }
}

/**
 * Get transactions for a sub-account
 * @param {Object} db - Firestore database instance
 * @param {string} userId - User ID
 * @param {string} subAccountId - Sub-account ID
 * @param {Object} options - Query options (limit, startAfter)
 * @returns {Promise<Array>} - Array of transaction documents
 */
export async function getTransactionsBySubAccount(db, userId, subAccountId, options = {}) {
  // STRICT validation
  const validatedUserId = requireUserId(userId);
  if (!subAccountId || typeof subAccountId !== 'string' || subAccountId.trim() === '') {
    throw new Error('subAccountId is required and must be a non-empty string');
  }

  const transactionsRef = collection(db, 'transactions');
  let q = query(
    transactionsRef,
    where('userId', '==', validatedUserId), // Always use validated userId
    where('subAccountId', '==', subAccountId),
    orderBy('transactionDate', 'desc')
  );

  if (options.limit) {
    q = query(q, limit(options.limit));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    // Verify ownership (security check)
    if (data.userId && data.userId !== validatedUserId) {
      console.warn('Security warning: Transaction found with mismatched userId');
    }
    return {
      transactionId: doc.id,
      ...data,
      transactionDate: data.transactionDate?.toDate ? data.transactionDate.toDate() : data.transactionDate
    };
  });
}

/**
 * Get all transactions for a user
 * @param {Object} db - Firestore database instance
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} - Array of transaction documents
 */
export async function getAllTransactions(db, userId, options = {}) {
  // STRICT validation
  const validatedUserId = requireUserId(userId);

  const transactionsRef = collection(db, 'transactions');
  let q = query(
    transactionsRef,
    where('userId', '==', validatedUserId), // Always use validated userId
    orderBy('transactionDate', 'desc')
  );

  if (options.limit) {
    q = query(q, limit(options.limit));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    // Verify ownership (security check)
    if (data.userId && data.userId !== validatedUserId) {
      console.warn('Security warning: Transaction found with mismatched userId');
    }
    return {
      transactionId: doc.id,
      ...data,
      transactionDate: data.transactionDate?.toDate ? data.transactionDate.toDate() : data.transactionDate
    };
  });
}

/**
 * Get transaction by ID
 * @param {Object} db - Firestore database instance
 * @param {string} userId - User ID
 * @param {string} transactionId - Transaction ID
 * @returns {Promise<Object>} - Transaction document
 */
export async function getTransaction(db, userId, transactionId) {
  // STRICT validation
  const validatedUserId = requireUserId(userId);
  if (!transactionId || typeof transactionId !== 'string' || transactionId.trim() === '') {
    throw new Error('transactionId is required and must be a non-empty string');
  }

  const transactionRef = doc(db, 'transactions', transactionId);
  const transactionSnap = await getDoc(transactionRef);

  if (!transactionSnap.exists()) {
    throw new Error('Transaction not found');
  }

  const transactionData = transactionSnap.data();

  // STRICT ownership verification
  if (!transactionData.userId) {
    throw new Error('Security error: Transaction missing userId field');
  }

  if (transactionData.userId !== validatedUserId) {
    throw new Error('Unauthorized: Transaction does not belong to authenticated user');
  }

  return {
    transactionId: transactionSnap.id,
    ...transactionData,
    transactionDate: transactionData.transactionDate?.toDate ? transactionData.transactionDate.toDate() : transactionData.transactionDate
  };
}

/**
 * Update transaction and recalculate balances
 * @param {Object} db - Firestore database instance
 * @param {string} userId - User ID
 * @param {string} transactionId - Transaction ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<void>}
 */
export async function updateTransaction(db, userId, transactionId, updateData) {
  // STRICT validation
  const validatedUserId = requireUserId(userId);
  if (!transactionId || typeof transactionId !== 'string' || transactionId.trim() === '') {
    throw new Error('transactionId is required and must be a non-empty string');
  }

  // Get existing transaction (this also validates ownership)
  const transaction = await getTransaction(db, validatedUserId, transactionId);

  if (updateData.amount) {
    validateAmount(updateData.amount);
  }
  if (updateData.transactionType) {
    validateTransactionType(updateData.transactionType);
  }

  // Ensure userId, accountId, and subAccountId cannot be changed
  const updateFields = {
    ...updateData,
    updatedAt: serverTimestamp()
  };

  // Prevent critical field modification during simple update
  if ('userId' in updateFields) delete updateFields.userId;
  if ('accountId' in updateFields && updateFields.accountId === transaction.accountId) delete updateFields.accountId; // Allow if unchanged
  if ('subAccountId' in updateFields && updateFields.subAccountId === transaction.subAccountId) delete updateFields.subAccountId; // Allow if unchanged

  const batch = writeBatch(db);

  // 1. Update current transaction
  const transactionRef = doc(db, 'transactions', transactionId);
  batch.update(transactionRef, updateFields);

  // 2. If this is a Transfer and has a linked transaction, update that too
  let linkedTransaction = null;
  if (transaction.transactionType === 'Transfer' && transaction.linkedTransactionId) {
    linkedTransaction = await getTransaction(db, validatedUserId, transaction.linkedTransactionId);
    const linkedRef = doc(db, 'transactions', transaction.linkedTransactionId);

    // Propagate common updates (amount, date, description, category, tags)
    const linkedUpdates = {};
    if ('amount' in updateFields) linkedUpdates.amount = updateFields.amount;
    if ('transactionDate' in updateFields) linkedUpdates.transactionDate = updateFields.transactionDate;
    if ('description' in updateFields) linkedUpdates.description = updateFields.description;
    if ('category' in updateFields) linkedUpdates.category = updateFields.category;
    if ('tags' in updateFields) linkedUpdates.tags = updateFields.tags;

    // Add timestamp
    linkedUpdates.updatedAt = serverTimestamp();

    if (Object.keys(linkedUpdates).length > 0) {
      batch.update(linkedRef, linkedUpdates);
    }
  }

  await batch.commit();

  // Recalculate balances (use validated userId)
  await recalculateSubAccountBalance(db, validatedUserId, transaction.subAccountId);
  await recalculateAccountBalance(db, validatedUserId, transaction.accountId);

  if (linkedTransaction) {
    await recalculateSubAccountBalance(db, validatedUserId, linkedTransaction.subAccountId);
    await recalculateAccountBalance(db, validatedUserId, linkedTransaction.accountId);
  }
}

/**
 * Delete transaction and recalculate balances
 * @param {Object} db - Firestore database instance
 * @param {string} userId - User ID
 * @param {string} transactionId - Transaction ID
 * @returns {Promise<void>}
 */
export async function deleteTransaction(db, userId, transactionId) {
  // STRICT validation
  const validatedUserId = requireUserId(userId);
  if (!transactionId || typeof transactionId !== 'string' || transactionId.trim() === '') {
    throw new Error('transactionId is required and must be a non-empty string');
  }

  // Get transaction to get account/sub-account IDs (this also validates ownership)
  const transaction = await getTransaction(db, validatedUserId, transactionId);

  const batch = writeBatch(db);

  // Delete transaction
  batch.delete(doc(db, 'transactions', transactionId));

  // If Linked Transaction (Transfer), delete that too
  let linkedTransaction = null;
  if (transaction.transactionType === 'Transfer' && transaction.linkedTransactionId) {
    try {
      linkedTransaction = await getTransaction(db, validatedUserId, transaction.linkedTransactionId);
      batch.delete(doc(db, 'transactions', transaction.linkedTransactionId));
    } catch (e) {
      console.warn('Linked transaction not found or already deleted');
    }
  }

  await batch.commit();

  // Recalculate balances (use validated userId)
  await recalculateSubAccountBalance(db, validatedUserId, transaction.subAccountId);
  await recalculateAccountBalance(db, validatedUserId, transaction.accountId);

  if (linkedTransaction) {
    await recalculateSubAccountBalance(db, validatedUserId, linkedTransaction.subAccountId);
    await recalculateAccountBalance(db, validatedUserId, linkedTransaction.accountId);
  }
}

/**
 * ============================================
 * BALANCE CALCULATION FUNCTIONS
 * ============================================
 */

/**
 * Recalculate sub-account balance from all transactions
 * @param {Object} db - Firestore database instance
 * @param {string} userId - User ID
 * @param {string} subAccountId - Sub-account ID
 * @returns {Promise<number>} - New balance
 */
export async function recalculateSubAccountBalance(db, userId, subAccountId) {
  // STRICT validation
  const validatedUserId = requireUserId(userId);
  if (!subAccountId || typeof subAccountId !== 'string' || subAccountId.trim() === '') {
    throw new Error('subAccountId is required and must be a non-empty string');
  }

  // Verify sub-account exists and belongs to user
  const subAccount = await getSubAccount(db, validatedUserId, subAccountId);

  // Get transactions (uses validated userId)
  const transactions = await getTransactionsBySubAccount(db, validatedUserId, subAccountId);

  let balance = 0.00;
  transactions.forEach(txn => {
    const amount = parseFloat(txn.amount);
    if (txn.transactionType === 'Income') {
      balance += amount;
    } else if (txn.transactionType === 'Expense') {
      balance -= amount;
    } else if (txn.transactionType === 'Transfer') {
      if (txn.transferType === 'Incoming') {
        balance += amount;
      } else {
        // Default to Outgoing if not specified or explicit Outgoing
        balance -= amount;
      }
    }
  });

  // Update sub-account balance (ownership already verified)
  const subAccountRef = doc(db, 'subAccounts', subAccountId);
  await updateDoc(subAccountRef, {
    balance: balance,
    updatedAt: serverTimestamp()
  });

  return balance;
}

/**
 * Recalculate account balance from all sub-accounts
 * @param {Object} db - Firestore database instance
 * @param {string} userId - User ID
 * @param {string} accountId - Account ID
 * @returns {Promise<number>} - New total balance
 */
export async function recalculateAccountBalance(db, userId, accountId) {
  // STRICT validation
  const validatedUserId = requireUserId(userId);
  if (!accountId || typeof accountId !== 'string' || accountId.trim() === '') {
    throw new Error('accountId is required and must be a non-empty string');
  }

  // Verify account exists and belongs to user
  const account = await getAccount(db, validatedUserId, accountId);

  // Get sub-accounts (uses validated userId)
  const subAccounts = await getSubAccountsByAccount(db, validatedUserId, accountId);

  let totalBalance = 0.00;
  subAccounts.forEach(subAccount => {
    totalBalance += parseFloat(subAccount.balance || 0);
  });

  // Update account balance (ownership already verified)
  const accountRef = doc(db, 'accounts', accountId);
  await updateDoc(accountRef, {
    totalBalance: totalBalance,
    updatedAt: serverTimestamp()
  });

  return totalBalance;
}

/**
 * ============================================
 * FAVORITES CRUD OPERATIONS
 * ============================================
 */

/**
 * Add favorite
 * @param {Object} db - Firestore database instance
 * @param {string} userId - User ID
 * @param {string} accountId - Account ID (optional)
 * @param {string} subAccountId - Sub-account ID (optional)
 * @returns {Promise<string>} - Favorite ID
 */
export async function addFavorite(db, userId, accountId = null, subAccountId = null) {
  // STRICT validation
  const validatedUserId = requireUserId(userId);

  if (!accountId && !subAccountId) {
    throw new Error('Either accountId or subAccountId must be provided');
  }

  // Ensure userId is always included
  const favoriteData = {
    userId: validatedUserId, // Use validated userId
    accountId: accountId || null,
    subAccountId: subAccountId || null,
    favoriteType: accountId ? 'account' : 'subAccount',
    createdAt: serverTimestamp()
  };

  // Final validation
  if (!favoriteData.userId) {
    throw new Error('CRITICAL: userId is missing from favorite data. Cannot create favorite without user ID.');
  }

  const favoriteRef = await addDoc(collection(db, 'favorites'), favoriteData);

  return favoriteRef.id;
}

/**
 * Get all favorites for a user
 * @param {Object} db - Firestore database instance
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of favorite documents
 */
export async function getFavorites(db, userId) {
  // STRICT validation
  const validatedUserId = requireUserId(userId);

  const favoritesRef = collection(db, 'favorites');
  const q = query(
    favoritesRef,
    where('userId', '==', validatedUserId), // Always use validated userId
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    // Verify ownership (security check)
    if (data.userId && data.userId !== validatedUserId) {
      console.warn('Security warning: Favorite found with mismatched userId');
    }
    return {
      favoriteId: doc.id,
      ...data
    };
  });
}

/**
 * Remove favorite
 * @param {Object} db - Firestore database instance
 * @param {string} userId - User ID
 * @param {string} favoriteId - Favorite ID
 * @returns {Promise<void>}
 */
export async function removeFavorite(db, userId, favoriteId) {
  // STRICT validation
  const validatedUserId = requireUserId(userId);
  if (!favoriteId || typeof favoriteId !== 'string' || favoriteId.trim() === '') {
    throw new Error('favoriteId is required and must be a non-empty string');
  }

  const favoriteRef = doc(db, 'favorites', favoriteId);
  const favoriteSnap = await getDoc(favoriteRef);

  if (!favoriteSnap.exists()) {
    throw new Error('Favorite not found');
  }

  const favoriteData = favoriteSnap.data();

  // STRICT ownership verification
  if (!favoriteData.userId) {
    throw new Error('Security error: Favorite missing userId field');
  }

  if (favoriteData.userId !== validatedUserId) {
    throw new Error('Unauthorized: Favorite does not belong to authenticated user');
  }

  await deleteDoc(favoriteRef);
}

// Helper functions for favorites
async function getFavoritesByAccount(db, userId, accountId) {
  const favorites = await getFavorites(db, userId);
  return favorites.filter(fav => fav.accountId === accountId);
}

async function getFavoritesBySubAccount(db, userId, subAccountId) {
  const favorites = await getFavorites(db, userId);
  return favorites.filter(fav => fav.subAccountId === subAccountId);
}

