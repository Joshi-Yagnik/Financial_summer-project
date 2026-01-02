/**
 * Commodity (Currency) Model
 */
export class Commodity {
    constructor(data = {}) {
        this.uid = data.uid || data.currencyCode || "INR"; // ISO 4217 Code usually
        this.namespace = data.namespace || "CURRENCY";
        this.fullname = data.fullname || "";
        this.mnemonic = data.mnemonic || ""; // Symbol e.g. $ or ₹
        this.local_symbol = data.local_symbol || "";
        this.fraction = data.fraction || 100; // Smallest fraction (100 for cents, 1000 for mills)
    }

    toFirestore() {
        return {
            namespace: this.namespace,
            fullname: this.fullname,
            mnemonic: this.mnemonic,
            local_symbol: this.local_symbol,
            fraction: this.fraction
        };
    }
}
