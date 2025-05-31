function toggleMenu() {
    document.getElementById('navLinks').classList.toggle('active');
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
  