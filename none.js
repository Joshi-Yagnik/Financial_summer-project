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
