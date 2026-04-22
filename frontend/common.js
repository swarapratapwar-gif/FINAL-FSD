(function () {
  const AUTH_TOKEN_KEY = 'token';
  const AUTH_USER_KEY = 'user';

  function getToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY) || '';
  }

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem(AUTH_USER_KEY) || 'null');
    } catch (error) {
      return null;
    }
  }

  function saveAuth(token, user) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  }

  function clearAuth() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  }

  async function api(path, options) {
    const headers = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) {
      headers.Authorization = 'Bearer ' + token;
    }

    const response = await fetch('/api' + path, {
      method: options && options.method ? options.method : 'GET',
      headers: Object.assign(headers, options && options.headers ? options.headers : {}),
      body: options && options.body ? options.body : undefined
    });

    const payload = await response.json().catch(function () { return {}; });
    if (!response.ok) {
      throw new Error(payload.message || 'Request failed');
    }

    return payload;
  }

  function requireAuth(redirectPath) {
    if (!getToken()) {
      window.location.href = redirectPath || 'login.html';
      return false;
    }
    return true;
  }

  function applyNavState() {
    const user = getUser();
    const userLabel = document.getElementById('navUser');
    const authLink = document.getElementById('navAuth');
    const logoutBtn = document.getElementById('navLogout');

    if (userLabel) {
      userLabel.textContent = user ? ('Hi, ' + user.name) : 'Guest';
    }

    if (authLink) {
      authLink.style.display = user ? 'none' : 'inline-block';
    }

    if (logoutBtn) {
      logoutBtn.style.display = user ? 'inline-block' : 'none';
      logoutBtn.onclick = function () {
        clearAuth();
        window.location.href = 'index.html';
      };
    }
  }

  window.App = {
    api,
    getToken,
    getUser,
    saveAuth,
    clearAuth,
    requireAuth,
    applyNavState
  };
})();
