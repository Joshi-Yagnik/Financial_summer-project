import { auth } from "./firebase/firebase.js";
import { AccountsService } from "./firebase/services/AccountsService.js";
import { Account, AccountType } from "./firebase/models/Account.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

let currentUser = null;
let isEditMode = false;
let editingAccountUid = null;
let allAccounts = []; // Cache for dropdowns

// Toggles
document.getElementById("parentToggle").addEventListener("change", function () {
  document.getElementById("parentAccount").disabled = !this.checked;
});

document.getElementById("transferToggle").addEventListener("change", function () {
  document.getElementById("transferAccount").disabled = !this.checked;
});

document.getElementById("backButton").addEventListener("click", function () {
  // if (confirm("Are you sure you want to go back? Unsaved changes will be lost.")) {
  window.location.href = "All.html";
  // }
});

// Auth State
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    await populateAccountDropdowns(user.uid);
    checkEditMode();
  }
});

async function populateAccountDropdowns(userId) {
  try {
    allAccounts = await AccountsService.getAccounts(userId);

    const parentSelect = document.getElementById("parentAccount");
    const transferSelect = document.getElementById("transferAccount");

    // Clear Options (keep default disabled placeholder if needed, or just clear)
    parentSelect.innerHTML = "<option value=''>-- Select Parent Account --</option>";
    transferSelect.innerHTML = "<option value=''>-- Select Transfer Account --</option>";

    allAccounts.forEach(acc => {
      // Build options
      // Use fullName or name
      const option = document.createElement("option");
      option.value = acc.uid;
      option.text = acc.fullName || acc.name;
      parentSelect.appendChild(option.cloneNode(true));
      transferSelect.appendChild(option);
    });

  } catch (e) {
    console.error("Error loading accounts for dropdowns", e);
  }
}

async function checkEditMode() {
  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get('edit');

  if (editId) {
    isEditMode = true;
    editingAccountUid = editId;
    document.querySelector("h1").innerText = "Edit Account";
    await loadAccountData(editId);
  }
}

async function loadAccountData(uid) {
  try {
    const account = await AccountsService.getAccount(uid);
    if (!account) {
      alert("Account not found");
      return;
    }

    document.getElementById("accountName").value = account.name;
    document.getElementById("description").value = account.description;

    // Parent Account
    if (account.parent_uid) {
      document.getElementById("parentToggle").checked = true;
      document.getElementById("parentAccount").disabled = false;
      document.getElementById("parentAccount").value = account.parent_uid;
    }

    document.getElementById("accountType").value = account.type || "ASSET";
    document.getElementById("currency").value = account.commodity_uid || "INR"; // Mapping needs improvement if value isn't exact
    document.getElementById("accountColor").value = account.color || "#000000";

    document.getElementById("placeholder").checked = account.is_placeholder;
    document.getElementById("hidden").checked = account.is_hidden;
    document.getElementById("favorite").checked = account.is_favorite;

    // Default Transfer
    if (account.default_transfer_account_uid) {
      document.getElementById("transferToggle").checked = true;
      document.getElementById("transferAccount").disabled = false;
      document.getElementById("transferAccount").value = account.default_transfer_account_uid;
    }

  } catch (error) {
    console.error("Error loading account:", error);
    alert("Failed to load account data.");
  }
}

// Save
const saveBtn = document.getElementById("saveButton");

saveBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  if (!currentUser) {
    alert("You must be logged in.");
    return;
  }

  const accountName = document.getElementById("accountName").value.trim();
  if (!accountName) {
    alert("Please enter an account name.");
    return;
  }

  // Construct Account Model
  const data = {
    name: accountName,
    description: document.getElementById("description").value.trim(),
    type: document.getElementById("accountType").value,
    commodity_uid: document.getElementById("currency").value.split(" ")[0], // Extract "INR" from "INR (Indian Rupee)" if necessary
    color: document.getElementById("accountColor").value,
    is_favorite: document.getElementById("favorite").checked,
    is_hidden: document.getElementById("hidden").checked,
    is_placeholder: document.getElementById("placeholder").checked
  };

  // Parent Account
  if (document.getElementById("parentToggle").checked) {
    data.parent_uid = document.getElementById("parentAccount").value;
  }

  // Transfer Account
  if (document.getElementById("transferToggle").checked) {
    data.default_transfer_account_uid = document.getElementById("transferAccount").value;
  }

  // Update FullName Logic (simplified)
  // If parent selected, fetch parent's name + this name. 
  // For now, rely on logic inside AccountService or just set it:
  if (data.parent_uid) {
    const parent = allAccounts.find(a => a.uid === data.parent_uid);
    if (parent) {
      data.fullName = `${parent.fullName || parent.name}:${data.name}`;
    } else {
      data.fullName = data.name;
    }
  } else {
    data.fullName = data.name;
  }

  const accountModel = new Account(data);

  try {
    if (isEditMode) {
      await AccountsService.updateAccount(editingAccountUid, accountModel.toFirestore());
      alert("Account updated successfully!");
    } else {
      await AccountsService.createAccount(currentUser.uid, accountModel);
      alert("Account created successfully!");
    }
    window.location.href = "All.html";
  } catch (error) {
    console.error("Error saving account:", error);
    alert("Error saving: " + error.message);
  }
});

// Currency Parsing helper
// Note: CreateAccount.html select has values like "INR (Indian Rupee)".
// We need to ensure we save just "INR" or valid UID.
// The code `document.getElementById("currency").value.split(" ")[0]` assumes format "CODE (Name)"
