document.querySelectorAll(".kebab-icon").forEach((icon) => {
  icon.addEventListener("click", function (event) {
    event.stopPropagation(); // Prevents closing immediately
    closeAllMenus(); // Close others if open
    const popup = this.nextElementSibling;
    popup.classList.toggle("hidden");
  });
});

function closeAllMenus() {
  document.querySelectorAll(".popup-menu").forEach((menu) => {
    menu.classList.add("hidden");
  });
}

window.addEventListener("click", function () {
  closeAllMenus(); // Close when clicked anywhere else
});

function toggleDropdown() {
  const dropdown = document.getElementById("accountDropdown");
  dropdown.classList.toggle("hidden");
}

// Close dropdown if clicked outside
document.addEventListener("click", function (event) {
  const dropdown = document.getElementById("accountDropdown");
  const centerTitle = document.querySelector(".center-title");
  if (!centerTitle.contains(event.target)) {
    dropdown.classList.add("hidden");
  }
});

const kebabIcon = document.getElementById("headerKebab");
const headerMenu = document.getElementById("headerMenu");

kebabIcon.addEventListener("click", () => {
  headerMenu.classList.toggle("hidden");
});

// Optional: close if clicking outside
window.addEventListener("click", function (e) {
  if (!kebabIcon.contains(e.target) && !headerMenu.contains(e.target)) {
    headerMenu.classList.add("hidden");
  }
});

function openCreateForm() {
  window.location.href = "CreateAccount.html";
}

