App.applyNavState();

document.getElementById('clearSessionBtn').addEventListener('click', function () {
  App.clearAuth();
  const status = document.getElementById('status');
  status.className = 'status ok';
  status.textContent = 'Local session cleared.';
  setTimeout(function () { window.location.href = 'login.html'; }, 500);
});
