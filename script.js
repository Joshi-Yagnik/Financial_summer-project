// Enable or disable Parent Account select
document.getElementById('parentToggle').addEventListener('change', function() {
    document.getElementById('parentAccount').disabled = !this.checked;
  });
  
  // Enable or disable Default Transfer Account select
  document.getElementById('transferToggle').addEventListener('change', function() {
    document.getElementById('transferAccount').disabled = !this.checked;
  });
  
  document.getElementById("backButton").addEventListener("click", function () {
  if (
    confirm("Are you sure you want to go back? Unsaved changes will be lost.")
  ) {
    window.location.href = "All.html";
  }
});

// data display
const saveBtn = document.querySelector(".icon-right .material-icons");

    saveBtn.addEventListener("click", (e) => {
      e.preventDefault();

      const accountName = document.getElementById("accountName").value.trim();
      if (!accountName) {
        alert("Please enter an account name.");
        return;
      }

      const newEntry = {
        id: Date.now(),
        accountName: accountName,
        description: document.getElementById("description").value.trim(),
        parentEnabled: document.getElementById("parentToggle").checked,
        parentAccount: document.getElementById("parentAccount").value.trim(),
        type: document.getElementById("accountType").value,
        currency: document.getElementById("currency").value,
        color: document.getElementById("accountColor").value,
        placeholder: document.getElementById("placeholder").checked,
        hidden: document.getElementById("hidden").checked,
        favorite: document.getElementById("favorite").checked,
        transferEnabled: document.getElementById("transferToggle").checked,
        transferAccount: document.getElementById("transferAccount").value.trim()
      };

      let accounts = JSON.parse(localStorage.getItem("accountList")) || [];

      if (accounts.length >= 5) accounts.shift(); // remove oldest

      accounts.push(newEntry);

      localStorage.setItem("accountList", JSON.stringify(accounts));

      // Redirect after save
      window.location.href = "All.html";
    });