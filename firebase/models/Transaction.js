/**
 * Transaction Model
 * Represents a financial transaction consisting of multiple Splits.
 * Double-entry accounting principle: Sum of splits must be 0.
 */
export class Transaction {
    constructor(data = {}) {
        this.uid = data.uid || null;
        this.description = data.description || "";
        this.notes = data.notes || "";
        this.timestamp = data.timestamp || new Date(); // Transaction Date
        this.commodity_uid = data.commodity_uid || "INR"; // Currency of the transaction
        this.is_exported = !!data.is_exported;
        this.is_template = !!data.is_template;
        this.splits = (data.splits || []).map(s => s instanceof Split ? s : new Split(s));

        this.created_at = data.created_at || new Date();
        this.modified_at = data.modified_at || new Date();
    }

    /**
     * Check if transaction is balanced (sum of splits == 0)
     */
    isBalanced() {
        // Simple sum check. Warning: Floating point arithmetic issues possible.
        // For production, use integer math (cents).
        const sum = this.splits.reduce((acc, split) => acc + split.amount, 0);
        return Math.abs(sum) < 0.0001; // Epsilon for float check
    }

    toFirestore() {
        return {
            description: this.description,
            notes: this.notes,
            timestamp: this.timestamp,
            commodity_uid: this.commodity_uid,
            is_exported: this.is_exported,
            is_template: this.is_template,
            // Store splits as array of objects in Firestore for simplicity, 
            // or subcollection? 
            // Storing as array inside Transaction document is easier for atomic reads/writes,
            // but GnuCash Android has a separate table.
            // Firestore advice: If splits < 500, array is fine. Transactions usually have 2-4 splits.
            splits: this.splits.map(s => s.toFirestore()),
            // Indexing helper: List of all accounts involved in this transaction
            involvedAccountUids: [...new Set(this.splits.map(s => s.account_uid))],
            created_at: this.created_at,
            modified_at: new Date()
        };
    }
}

/**
 * Split Model
 * A single part of a transaction affecting one account.
 */
export class Split {
    constructor(data = {}) {
        this.uid = data.uid || null;
        this.memo = data.memo || "";
        this.account_uid = data.account_uid || null;
        this.transaction_uid = data.transaction_uid || null;
        this.type = data.type || "GT"; // GnuCash Transaction? Or user defined type

        // Value in transaction currency
        this.value_num = data.value_num || 0;
        this.value_denom = data.value_denom || 100;

        // Quantity in account commodity (e.g. stock shares, or foreign currency equivalent)
        this.quantity_num = data.quantity_num || 0;
        this.quantity_denom = data.quantity_denom || 100;

        this.reconcile_state = data.reconcile_state || "n"; // n=not reconciled, c=cleared, y=reconciled
        this.reconcile_date = data.reconcile_date || null;

        // Helper: Amount as float
        this.amount = data.amount !== undefined ? data.amount : (this.value_num / this.value_denom);
    }

    toFirestore() {
        return {
            memo: this.memo,
            account_uid: this.account_uid,
            // transaction_uid is implicit if stored in array
            type: this.type,
            value_num: this.value_num,
            value_denom: this.value_denom,
            quantity_num: this.quantity_num,
            quantity_denom: this.quantity_denom,
            reconcile_state: this.reconcile_state,
            reconcile_date: this.reconcile_date,
            amount: this.amount // Store float for easier querying/indexing if needed
        };
    }
}
