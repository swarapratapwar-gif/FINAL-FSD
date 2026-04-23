App.applyNavState();

const themeSwitch = document.getElementById('themeSwitch');
if (themeSwitch) {
  const syncSwitch = function () {
    themeSwitch.classList.toggle('on', document.body.classList.contains('dark-mode'));
  };

  syncSwitch();
  themeSwitch.addEventListener('click', function () {
    App.toggleTheme();
    syncSwitch();
  });

  const observer = new MutationObserver(syncSwitch);
  observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
}

document.getElementById('clearSessionBtn').addEventListener('click', function () {
  App.clearAuth();
  const status = document.getElementById('status');
  status.className = 'status ok';
  status.textContent = 'Local session cleared.';
  setTimeout(function () { window.location.href = 'login.html'; }, 500);
});
