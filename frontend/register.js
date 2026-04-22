App.applyNavState();

document.getElementById('registerForm').addEventListener('submit', async function (event) {
  event.preventDefault();
  const status = document.getElementById('status');

  try {
    const payload = await App.api('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value.trim()
      })
    });

    App.saveAuth(payload.token, payload.user);
    status.className = 'status ok';
    status.textContent = 'Registration successful. Redirecting...';
    setTimeout(function () { window.location.href = 'explore.html'; }, 700);
  } catch (error) {
    status.className = 'status error';
    status.textContent = error.message;
  }
});
