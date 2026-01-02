import { db } from "../firebase.js";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    writeBatch,
    increment
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { Transaction } from "../models/Transaction.js";

const COLLECTION = "transactions";
const ACCOUNTS_COLLECTION = "accounts";

export class TransactionsService {

    /**
     * Create a new Transaction with Splits
     * @param {string} userId 
     * @param {Transaction} transactionModel 
     */
    static async createTransaction(userId, transactionModel) {
        if (!userId) throw new Error("UserId required");

        // Double Entry Validation
        if (!transactionModel.isBalanced()) {
            throw new Error("Transaction is not balanced! Sum of splits must be 0.");
        }

        const data = transactionModel.toFirestore();
        data.userId = userId;

        const batch = writeBatch(db);
        const txRef = doc(collection(db, COLLECTION));

        batch.set(txRef, data);

        // Update Account Balances
        for (const split of transactionModel.splits) {
            if (split.account_uid) {
                const accountRef = doc(db, ACCOUNTS_COLLECTION, split.account_uid);
                // Increment balance by split amount
                // Note: split.amount is a number (float).
                batch.update(accountRef, {
                    balance: increment(split.amount),
                    modified_at: serverTimestamp()
                });
            }
        }

        await batch.commit();
        return txRef.id;
    }

    /**
     * Get transactions for an account (looking at splits)
     */
    static async getTransactionsForAccount(userId, accountUid) {
        const q = query(
            collection(db, COLLECTION),
            where("userId", "==", userId),
            where("involvedAccountUids", "array-contains", accountUid),
            orderBy("timestamp", "desc")
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => {
            const data = doc.data();
            const tx = new Transaction({ uid: doc.id, ...data });
            if (data.created_at?.toDate) tx.created_at = data.created_at.toDate();
            if (data.modified_at?.toDate) tx.modified_at = data.modified_at.toDate();
            if (data.timestamp?.toDate) tx.timestamp = data.timestamp.toDate();
            return tx;
        });
    }
}
