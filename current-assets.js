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

/* Favorites persistence utilities */
function _getFavorites() {
    try {
        return JSON.parse(localStorage.getItem("favorites") || "{}");
    } catch (e) {
        return {};
    }
}

function _saveFavorites(obj) {
    localStorage.setItem("favorites", JSON.stringify(obj || {}));
}

/* Toggle favorite icons and persist by account id */
document.addEventListener("DOMContentLoaded", () => {
    const favorites = _getFavorites();

    // initialize icons from storage
    document.querySelectorAll(".favorite-icon").forEach((icon) => {
        const id = icon.dataset.accountId;
        if (id && favorites[id]) {
            icon.classList.add("active");
            icon.textContent = "favorite";
        } else {
            icon.classList.remove("active");
            icon.textContent = "favorite_border";
        }

        // attach handler
        icon.addEventListener("click", (e) => {
            e.stopPropagation();
            const id = icon.dataset.accountId;
            if (!id) return;

            icon.classList.toggle("active");
            const isActive = icon.classList.contains("active");
            icon.textContent = isActive ? "favorite" : "favorite_border";

            const favs = _getFavorites();
            if (isActive) favs[id] = true;
            else delete favs[id];
            _saveFavorites(favs);
        });
    });
});
