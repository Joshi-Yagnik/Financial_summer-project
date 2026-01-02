import { auth } from "./firebase/firebase.js";
import { AccountsService } from "./firebase/services/AccountsService.js";
import { TransactionsService } from "./firebase/services/TransactionsService.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

let currentUser = null;
let currentAccountUid = null;
let currentAccount = null;

// DOM Elements
const accountNameEl = document.getElementById("accountName");
const accountBalanceEl = document.getElementById("accountBalance");
const transactionListEl = document.getElementById("transactionList");
const backButton = document.getElementById("backButton");
const editButton = document.getElementById("editButton");
const addTransactionBtn = document.getElementById("addTransactionBtn");

// Event Listeners
backButton.addEventListener("click", () => window.location.href = "All.html");
editButton.addEventListener("click", () => {
    if (currentAccountUid) window.location.href = `CreateAccount.html?edit=${currentAccountUid}`;
});
addTransactionBtn.addEventListener("click", () => {
    // Navigate to TransactionForm with pre-selected account
    if (currentAccountUid) window.location.href = `TransactionForm.html?account_uid=${currentAccountUid}`;
});

// Auth
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        const urlParams = new URLSearchParams(window.location.search);
        currentAccountUid = urlParams.get('uid');

        if (currentAccountUid) {
            await loadAccountDetails(user.uid, currentAccountUid);
            await loadTransactions(user.uid, currentAccountUid);
        } else {
            alert("No account specified");
            window.location.href = "All.html";
        }
    } else {
        // window.location.href = "login.html";
    }
});

async function loadAccountDetails(userId, accountUid) {
    try {
        currentAccount = await AccountsService.getAccount(accountUid);
        if (currentAccount) {
            accountNameEl.textContent = currentAccount.name;
            // Format balance
            // Assuming commodity is INR for now or get from Account
            const currencySymbol = "₹";
            accountBalanceEl.textContent = `${currencySymbol}${(currentAccount.balance || 0).toFixed(2)}`;
        }
    } catch (e) {
        console.error("Error loading account", e);
    }
}

async function loadTransactions(userId, accountUid) {
    try {
        const transactions = await TransactionsService.getTransactionsForAccount(userId, accountUid);

        if (transactions.length === 0) {
            transactionListEl.innerHTML = '<div class="empty-state">No transactions found.</div>';
            return;
        }

        transactionListEl.innerHTML = "";

        // Render
        transactions.forEach(tx => {
            const card = document.createElement("div");
            card.className = "transaction-card";

            // Calculate Amount for THIS account
            // Sum of all splits belonging to this account
            const accountSplits = tx.splits.filter(s => s.account_uid === accountUid);
            const amount = accountSplits.reduce((sum, s) => sum + s.amount, 0);

            const isPositive = amount >= 0;
            const amountClass = isPositive ? "positive" : "negative";
            const formattedAmount = `${isPositive ? '+' : ''}${amount.toFixed(2)}`;

            // Date Formatting
            const date = new Date(tx.timestamp);
            const dateStr = date.toLocaleDateString();

            card.innerHTML = `
                <div class="tx-left">
                    <div class="tx-description">${tx.description || "No Description"}</div>
                    <div class="tx-date">${dateStr}</div>
                </div>
                <div class="tx-right">
                    <div class="tx-amount ${amountClass}">₹${formattedAmount}</div>
                    <!-- Running balance calculation requires fetching all previous txs or storing it. 
                         For now, just showing transaction amount. -->
                </div>
            `;

            // Click to edit?
            // card.addEventListener("click", () => window.location.href = `TransactionForm.html?edit=${tx.uid}`);

            transactionListEl.appendChild(card);
        });

    } catch (e) {
        console.error("Error loading transactions", e);
        transactionListEl.innerHTML = '<div class="empty-state">Error loading transactions.</div>';
    }
}
