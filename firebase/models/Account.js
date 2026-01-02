/**
 * Account Model
 * Matches GnuCash Android "accounts" table structure.
 */
export class Account {
    /**
     * @param {Object} data
     * @param {string} data.uid - Unique Identifier (GUID)
     * @param {string} data.name - Account Name
     * @param {string} data.fullName - Fully qualified name (e.g. Assets:Wallet)
     * @param {string} data.description - Description
     * @param {string} data.parent_uid - Parent Account UID
     * @param {string} [data.type] - AccountType (ASSET, LIABILITY, INCOME, EXPENSE, EQUITY, ROOT)
     * @param {string} [data.commodity_uid] - Currency/Commodity UID
     * @param {string} [data.color] - Hex Color Code
     * @param {boolean} [data.is_favorite]
     * @param {boolean} [data.is_hidden]
     * @param {boolean} [data.is_placeholder]
     * @param {string} [data.default_transfer_account_uid]
     */
    constructor(data = {}) {
        this.uid = data.uid || null; // Will be set by Firestore doc ID usually
        this.name = data.name || "";
        this.fullName = data.fullName || "";
        this.description = data.description || "";
        this.parent_uid = data.parent_uid || null;
        this.type = data.type || "ASSET";
        this.commodity_uid = data.commodity_uid || "INR"; // Default to INR/System Default
        this.color = data.color || "#757575"; // Default grey
        this.is_favorite = !!data.is_favorite;
        this.is_hidden = !!data.is_hidden;
        this.is_placeholder = !!data.is_placeholder;
        this.default_transfer_account_uid = data.default_transfer_account_uid || null;
        this.balance = data.balance || 0;

        // Timestamps
        this.created_at = data.created_at || new Date();
        this.modified_at = data.modified_at || new Date();
    }

    /**
     * Convert to Firestore Document Data
     */
    toFirestore() {
        return {
            name: this.name,
            fullName: this.fullName,
            description: this.description,
            parent_uid: this.parent_uid,
            type: this.type,
            commodity_uid: this.commodity_uid,
            color: this.color,
            is_favorite: this.is_favorite,
            is_hidden: this.is_hidden,
            is_placeholder: this.is_placeholder,
            default_transfer_account_uid: this.default_transfer_account_uid,
            balance: this.balance,
            created_at: this.created_at,
            modified_at: new Date() // Always update modified_at
        };
    }

    /**
     * Create generic Root Account
     */
    static createRoot() {
        return new Account({
            name: "ROOT",
            type: "ROOT",
            is_hidden: true,
            is_placeholder: true
        });
    }
}

export const AccountType = {
    ROOT: "ROOT",
    ASSET: "ASSET",
    CASH: "CASH",
    BANK: "BANK",
    LIABILITY: "LIABILITY",
    CREDIT_CARD: "CREDIT_CARD",
    INCOME: "INCOME",
    EXPENSE: "EXPENSE",
    EQUITY: "EQUITY",
    // Detailed types
    PAYABLE: "PAYABLE",
    RECEIVABLE: "RECEIVABLE",
    TRADING: "TRADING",
    CURRENCY: "CURRENCY"
};
