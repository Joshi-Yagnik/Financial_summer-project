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

function changecolor(x){
  /*x.classList.toggle("bi-heart-fill");*/
  if(x.className == 'bi bi-heart'){
    x.className = 'bi bi-heart-fill';
  }
  else if(x.className == 'bi bi-heart-fill'){
    x.className = 'bi bi-heart';
  }
}