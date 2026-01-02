import { db } from "../firebase.js";
import {
    collection,
    doc,
    getDoc,
    setDoc,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { Commodity } from "../models/Commodity.js";

const COLLECTION = "commodities";

export class CommoditiesService {

    static async getCommodity(uid) {
        // e.g. "INR"
        const docRef = doc(db, COLLECTION, uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
            return new Commodity({ uid: snap.id, ...snap.data() });
        }
        return null;
    }

    static async createCommodity(commodity) {
        await setDoc(doc(db, COLLECTION, commodity.uid), commodity.toFirestore());
    }

    // Seed default currencies if needed
    static async seedDefaults() {
        const defaults = [
            new Commodity({ uid: "INR", fullname: "Indian Rupee", mnemonic: "INR", local_symbol: "₹" }),
            new Commodity({ uid: "USD", fullname: "US Dollar", mnemonic: "USD", local_symbol: "$" }),
            new Commodity({ uid: "EUR", fullname: "Euro", mnemonic: "EUR", local_symbol: "€" })
        ];

        for (const c of defaults) {
            await this.createCommodity(c);
        }
    }
}
