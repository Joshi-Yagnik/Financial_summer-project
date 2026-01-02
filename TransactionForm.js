import { auth } from "./firebase/firebase.js";
import { AccountsService } from "./firebase/services/AccountsService.js";
import { TransactionsService } from "./firebase/services/TransactionsService.js";
import { Transaction, Split } from "./firebase/models/Transaction.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// State
let currentUser = null;
let allAccounts = [];
let splits = []; // Array of internal objects { id: timestamp, accountUid: "", type: "DEBIT", amount: 0 }

// DOM
const splitsContainer = document.getElementById("splitsContainer");
const addSplitBtn = document.getElementById("addSplitBtn");
const imbalanceIndicator = document.getElementById("imbalanceIndicator");
const imbalanceAmountEl = document.getElementById("imbalanceAmount");
const saveButton = document.getElementById("saveButton");

// Event Listeners
document.getElementById("backButton").addEventListener("click", () => window.history.back());
addSplitBtn.addEventListener("click", () => addSplitRow());

saveButton.addEventListener("click", async () => {
    if (!validateTransaction()) return;
    await saveTransaction();
});

// Init
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        // Set today's date
        document.getElementById("date").valueAsDate = new Date();

        // Load data
        await loadAccounts(user.uid);

        // Check URL for pre-filling
        const urlParams = new URLSearchParams(window.location.search);
        const prefillAccountUid = urlParams.get('account_uid');

        // Add default splits (2 for double entry)
        addSplitRow(prefillAccountUid);
        addSplitRow();
    }
});

async function loadAccounts(userId) {
    allAccounts = await AccountsService.getAccounts(userId);
}

function addSplitRow(preSelectedAccountUid = null) {
    const splitId = Date.now() + Math.random(); // Unique ID for UI tracking

    // Default model
    const splitData = {
        id: splitId,
        accountUid: preSelectedAccountUid || "",
        type: "DEBIT", // Default
        amount: 0
    };
    splits.push(splitData);

    renderSplit(splitData);
    updateImbalance();
}

function renderSplit(splitData) {
    const row = document.createElement("div");
    row.className = "split-row";
    row.dataset.id = splitData.id;

    // Account Select
    const accountSelect = document.createElement("select");
    accountSelect.className = "account-select";
    accountSelect.innerHTML = `<option value="">-- Select Account --</option>`;

    allAccounts.forEach(acc => {
        const option = document.createElement("option");
        option.value = acc.uid;
        option.text = acc.fullName || acc.name;
        if (acc.uid === splitData.accountUid) option.selected = true;
        accountSelect.appendChild(option);
    });

    accountSelect.addEventListener("change", (e) => {
        splitData.accountUid = e.target.value;
    });

    // Top Row
    const topRow = document.createElement("div");
    topRow.className = "split-top";
    topRow.appendChild(accountSelect);

    // Remove Button
    const removeBtn = document.createElement("span");
    removeBtn.className = "material-icons remove-split";
    removeBtn.textContent = "close";
    removeBtn.onclick = () => removeSplit(splitData.id, row);
    row.appendChild(removeBtn);

    // Bottom Row
    const bottomRow = document.createElement("div");
    bottomRow.className = "split-bottom";

    // Type Toggle (Debit/Credit)
    // Actually, UI Simplification: Just allow entering Amount.
    // If it's a "Transfer", typically From -> To.
    // GnuCash: DEBIT (Left), CREDIT (Right).
    // Let's use a simpler "Action" toggle: "Deposit (+)" vs "Withdrawal (-)" logic is confusing for generic ledger.
    // Let's stick to "Charge" vs "Payment" or simply "Debit" vs "Credit".
    // Or even simpler: Just amount input. User types -100 or 100.
    // BUT common users prefer "Debit" / "Credit" buttons or distinct columns.
    // Let's try a Toggle: [DEBIT] [CREDIT]

    const typeToggle = document.createElement("div");
    typeToggle.className = "split-type-toggle";

    const btnDebit = document.createElement("button");
    btnDebit.className = `split-type-btn ${splitData.type === 'DEBIT' ? 'active' : ''}`;
    btnDebit.textContent = "DEBIT";

    const btnCredit = document.createElement("button");
    btnCredit.className = `split-type-btn ${splitData.type === 'CREDIT' ? 'active' : ''}`;
    btnCredit.textContent = "CREDIT";

    btnDebit.onclick = () => {
        splitData.type = 'DEBIT';
        btnDebit.classList.add('active');
        btnCredit.classList.remove('active');
        updateImbalance();
    };

    btnCredit.onclick = () => {
        splitData.type = 'CREDIT';
        btnCredit.classList.add('active');
        btnDebit.classList.remove('active');
        updateImbalance();
    };

    typeToggle.appendChild(btnDebit);
    typeToggle.appendChild(btnCredit);

    // Amount Input
    const amountGroup = document.createElement("div");
    amountGroup.className = "amount-input-group";
    amountGroup.innerHTML = `<span class="currency-symbol">₹</span>`;

    const amountInput = document.createElement("input");
    amountInput.type = "number";
    amountInput.placeholder = "0.00";
    amountInput.step = "0.01";
    amountInput.oninput = (e) => {
        splitData.amount = parseFloat(e.target.value) || 0;
        updateImbalance();
    };

    amountGroup.appendChild(amountInput);

    bottomRow.appendChild(typeToggle);
    bottomRow.appendChild(amountGroup);

    row.appendChild(topRow);
    row.appendChild(bottomRow);

    splitsContainer.appendChild(row);
}

function removeSplit(id, rowElement) {
    splits = splits.filter(s => s.id !== id);
    rowElement.remove();
    updateImbalance();
}

function updateImbalance() {
    // Calculate Sum
    // DEBIT = Positive Amount (Usually)
    // CREDIT = Negative Amount (Usually)
    // Wait, in Accounting Equation: Assets = Liabilities + Equity
    // Asset Debit (+) Credit (-)
    // Liability Debit (-) Credit (+)
    // Income Debit (-) Credit (+) 
    // Expense Debit (+) Credit (-)

    // To simplify for the "Transaction" service which expects balanced splits:
    // We will just sum the raw amounts where DEBIT is + and CREDIT is -.
    // The user must ensure they pick the right side. 
    // E.g. Paying for food: Expense (Debit +100), Wallet (Credit -100). Sum = 0. Correct.

    let sum = 0;
    splits.forEach(s => {
        // Amount is always entered as positive number in UI usually
        const val = Math.abs(s.amount);
        if (s.type === 'DEBIT') sum += val;
        else sum -= val;
    });

    // Round to 2 decimals
    sum = Math.round(sum * 100) / 100;

    imbalanceAmountEl.textContent = `₹${sum.toFixed(2)}`;

    if (sum === 0 && splits.length > 0 && splits.every(s => s.amount !== 0)) {
        imbalanceIndicator.classList.add("balanced");
        imbalanceIndicator.innerHTML = "Balanced";
        saveButton.style.opacity = "1";
        saveButton.style.pointerEvents = "auto";
    } else {
        imbalanceIndicator.classList.remove("balanced");
        imbalanceIndicator.innerHTML = `Imbalance: ${sum > 0 ? '+' : ''}₹${sum.toFixed(2)}`;
        saveButton.style.opacity = "0.5";
        saveButton.style.pointerEvents = "none";
    }
}

function validateTransaction() {
    if (splits.length < 2) {
        alert("Transaction must have at least 2 splits.");
        return false;
    }

    for (const s of splits) {
        if (!s.accountUid) {
            alert("All splits must have an account selected.");
            return false;
        }
    }
    return true;
}

async function saveTransaction() {
    try {
        const description = document.getElementById("description").value;
        const notes = document.getElementById("notes").value;
        const date = document.getElementById("date").valueAsDate;

        // Prepare Splits for Model
        const modelSplits = splits.map(s => {
            const val = Math.abs(s.amount);
            // If DEBIT -> Positive Amount
            // If CREDIT -> Negative Amount
            // This assumes the underlying Account Model treats (+) as Debit and (-) as Credit universally (Signed Amount)
            // or specific per account type.
            // TransactionService just sums them to check 0.
            const finalAmount = s.type === 'DEBIT' ? val : -val;

            return new Split({
                account_uid: s.accountUid,
                value_num: Math.round(finalAmount * 100), // Cents/Paisa
                value_denom: 100,
                type: s.type, // Store intent
                amount: finalAmount
            });
        });

        const tx = new Transaction({
            description,
            notes,
            timestamp: date,
            splits: modelSplits
        });

        await TransactionsService.createTransaction(currentUser.uid, tx);

        // Go back (to account detail if we came from there)
        window.history.back();

    } catch (e) {
        console.error(e);
        alert("Error saving transaction: " + e.message);
    }
}
