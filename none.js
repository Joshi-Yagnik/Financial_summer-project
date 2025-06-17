function toggleMenu() {
  const menu = document.getElementById("navLinks");
  const toggleButton = document.querySelector(".menu-btn");

  menu.classList.toggle("active");

  // Hide or show the menu button based on menu state
  if (menu.classList.contains("active")) {
    toggleButton.style.display = "none";
  } else {
    toggleButton.style.display = "inline-block";
  }
}

// Hide menu when clicking outside
document.addEventListener("click", function (event) {
  const menu = document.getElementById("navLinks");
  const toggleButton = document.querySelector(".menu-btn");

  if (
    menu.classList.contains("active") &&
    !menu.contains(event.target) &&
    !toggleButton.contains(event.target)
  ) {
    menu.classList.remove("active");
    toggleButton.style.display = "inline-block"; // Show button again
  }
});

// Book bar
function toggleBookDropdown() {
  const list = document.getElementById("bookList");
  list.style.display = list.style.display === "block" ? "none" : "block";
}

function selectBook(bookName) {
  document.querySelector(".selected-book").innerText = bookName;
  document.getElementById("bookList").style.display = "none";
}

function openCreateForm() {
  // Redirect to another page
  window.location.href = "CreateAccount.html";
}

// Toggle the visibility of the menu
// function openCreateForm() {
//     document.getElementById("createForm").style.display = "block";
//   }

function closeCreateForm() {
  document.getElementById("createForm").style.display = "none";
}
// Loop through all favorite icons on the page
document.querySelectorAll(".favorite-icon").forEach((icon) => {
  // Get the parent card of the icon
  const card = icon.closest(".card");

  // Get a unique identifier for the card (set via data-id attribute)
  const cardId = card.getAttribute("data-id");

  // Check if this card is already in favorites (on page load)
  if (localStorage.getItem(`fav-${cardId}`)) {
    icon.innerText = "favorite"; // Set filled heart icon
    icon.classList.add("active"); // Add active color class
  }

  // Add click event to toggle favorite
  icon.addEventListener("click", function () {
    const isFavorited = icon.classList.contains("active");

    if (isFavorited) {
      // If already favorited, remove from localStorage
      icon.innerText = "favorite_border"; // Show empty heart icon
      icon.classList.remove("active"); // Remove active color
      localStorage.removeItem(`fav-${cardId}`); // Delete from localStorage
    } else {
      // If not favorited, add to localStorage
      icon.innerText = "favorite"; // Show filled heart icon
      icon.classList.add("active"); // Add active color
      localStorage.setItem(`fav-${cardId}`, card.outerHTML); // Save card HTML
    }
  });
});

