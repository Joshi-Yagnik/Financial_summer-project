function goBack() {
    window.location.href = "assets.html";
}

function createAccount() {
    window.location.href = "CreateAccount.html";
}

function openAccount(accountId) {
    switch (accountId) {
        case "cash-in-wallet":
            window.location.href = "cash-in-wallet.html";
            break;
        case "checking-account":
            window.location.href = "checking-account.html";
            break;
        case "savings-account":
            alert("Savings Account transactions page coming soon!");
            break;
        default:
            alert(`Opening for ${accountId.replace("-", " ")}`);
    }
}

// function openAccount(accountId) {
//     alert("Open account: " + accountId);
// }

function editAccount(accountId) {
    alert("Edit account: " + accountId);
}

function deleteAccount(accountId) {
    alert("Delete account: " + accountId);
}

/* Toggle dropdown for kebab or card menus */
function toggleDropdown(icon) {
    const dropdown = icon.nextElementSibling;

    // Close other dropdowns
    document.querySelectorAll(".dropdown").forEach((menu) => {
        if (menu !== dropdown) {
            menu.classList.remove("show");
        }
    });

    dropdown.classList.toggle("show");
}

/* Close menus when clicking outside */
document.addEventListener("click", (e) => {
    if (!e.target.closest(".right") && !e.target.closest(".kebab-menu")) {
        document.querySelectorAll(".dropdown").forEach((menu) => {
            menu.classList.remove("show");
        });
    }
});

/* Toggle favorite icons */
document.querySelectorAll(".favorite-icon").forEach((icon) => {
    icon.addEventListener("click", (e) => {
        e.stopPropagation();
        icon.classList.toggle("active");
        icon.textContent = icon.classList.contains("active") ? "favorite" : "favorite_border";
    });
});
