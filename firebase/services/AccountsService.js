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
    writeBatch
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { Account, AccountType } from "../models/Account.js";

const COLLECTION = "accounts";

export class AccountsService {

    /**
     * Create a new Account
     * @param {string} userId
     * @param {Account} accountModel 
     */
    static async createAccount(userId, accountModel) {
        if (!userId) throw new Error("UserId required");

        const accountsRef = collection(db, "users", userId, COLLECTION); // Subcollection under user?
        // Wait, previous implementation used root 'accounts' collection with 'userId' field.
        // GnuCash Android is local DB (single user per file).
        // Since we are moving to "Professional" data management, subcollection `users/{uid}/accounts` is cleaner for isolation.
        // BUT, changing structure now might break existing `getAccounts` in `database.js` if I don't migrate logic carefully.
        // The plan didn't specify changing path structure, but "Professional" implies better data shaping.
        // I will stick to root collection with `userId` for now to avoid massive migration complexity in one go, 
        // OR I will enforce the `userId` field usage strictly.
        // Let's stick to root collection `accounts` with `userId` to match current `database.js` pattern but clean it up.

        const data = accountModel.toFirestore();
        data.userId = userId; // Enforce ownership

        const docRef = await addDoc(collection(db, COLLECTION), data);
        return docRef.id;
    }

    /**
     * Get all accounts for user
     * @param {string} userId 
     * @returns {Promise<Account[]>}
     */
    static async getAccounts(userId) {
        const q = query(
            collection(db, COLLECTION),
            where("userId", "==", userId),
            orderBy("name", "asc") // Basic sort
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => {
            const data = doc.data();
            const acc = new Account({ uid: doc.id, ...data });
            // Fix timestamps if they are Firestore Timestamps
            if (data.created_at?.toDate) acc.created_at = data.created_at.toDate();
            if (data.modified_at?.toDate) acc.modified_at = data.modified_at.toDate();
            return acc;
        });
    }

    /**
     * Get single account
     * @param {string} uid 
     */
    static async getAccount(uid) {
        const docRef = doc(db, COLLECTION, uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
            const data = snap.data();
            const acc = new Account({ uid: snap.id, ...data });
            if (data.created_at?.toDate) acc.created_at = data.created_at.toDate();
            if (data.modified_at?.toDate) acc.modified_at = data.modified_at.toDate();
            return acc;
        }
        return null;
    }

    /**
     * Update Account
     * @param {string} uid 
     * @param {Object} updates 
     */
    static async updateAccount(uid, updates) {
        const docRef = doc(db, COLLECTION, uid);
        updates.modified_at = serverTimestamp();
        await updateDoc(docRef, updates);
    }

    /**
     * Delete Account (and ideally subaccounts/transactions? recursive delete is dangerous/complex usually)
     * For now, shallow delete.
     * @param {string} uid 
     */
    static async deleteAccount(uid) {
        await deleteDoc(doc(db, COLLECTION, uid));
    }
}
