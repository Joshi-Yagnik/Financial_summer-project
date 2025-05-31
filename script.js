// Enable or disable Parent Account select
document.getElementById('parentToggle').addEventListener('change', function() {
    document.getElementById('parentAccount').disabled = !this.checked;
  });
  
  // Enable or disable Default Transfer Account select
  document.getElementById('transferToggle').addEventListener('change', function() {
    document.getElementById('transferAccount').disabled = !this.checked;
  });
  