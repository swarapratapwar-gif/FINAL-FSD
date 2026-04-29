const TOKEN_KEY = 'eduachieve_token';
const THEME_KEY = 'eduachieve_theme';

function getToken() { return localStorage.getItem(TOKEN_KEY); }
function saveToken(t) { localStorage.setItem(TOKEN_KEY, t); }
function clearToken() { localStorage.removeItem(TOKEN_KEY); }

function getTheme() { return localStorage.getItem(THEME_KEY) || 'light'; }
function saveTheme(t) { localStorage.setItem(THEME_KEY, t); document.documentElement.setAttribute('data-theme', t); }

function initTheme() {
    const theme = getTheme();
    document.documentElement.setAttribute('data-theme', theme);
}

// Initialize theme immediately to avoid flash
initTheme();

function decodeToken(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch { return null; }
}

function checkAuth() {
  const token = getToken();
  if (!token) return null;
  const payload = decodeToken(token);
  if (!payload || payload.exp * 1000 < Date.now()) { clearToken(); return null; }
  return payload;
}

function requireAdmin() {
  const user = checkAuth();
  if (!user || user.role !== 'admin') {
    window.location.href = 'index.html';
    return null;
  }
  return user;
}

function showLoginRequired(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  container.innerHTML = `
    <div style="text-align:center; padding:60px 20px; max-width:400px; margin:0 auto;" class="login-required-card">
      <div style="font-size:3rem; margin-bottom:16px;" class="lock-icon">🔒</div>
      <h2 style="font-size:1.4rem; font-weight:700; margin-bottom:8px;">Login Required</h2>
      <p style="color:#6B7280; margin-bottom:24px;">You need a PCCOE college account to access this page.</p>
      <a href="login.html" class="btn-primary" style="margin-right:8px;">Login</a>
      <a href="register.html" class="btn-outline">Create Account</a>
    </div>
  `;
}

function updateNavbar() {
  const user = checkAuth();
  const loginBtn = document.getElementById('navLogin');
  const logoutBtn = document.getElementById('navLogout');
  const navUser = document.getElementById('navUser');
  const adminLink = document.getElementById('navAdmin');
  const navActions = document.querySelector('.nav-actions');

  if (user) {
    if (loginBtn) loginBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'inline-block';
    if (navUser) navUser.textContent = user.name || user.email.split('@')[0];
    if (adminLink) adminLink.style.display = user.role === 'admin' ? 'inline-block' : 'none';
  } else {
    if (loginBtn) loginBtn.style.display = 'inline-block';
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (navUser) navUser.textContent = '';
    if (adminLink) adminLink.style.display = 'none';
  }

  // Inject Theme Switcher if not present
  if (navActions && !document.getElementById('navThemeToggle')) {
    const themeWrap = document.createElement('div');
    themeWrap.className = 'theme-switcher';
    themeWrap.innerHTML = `
      <span style="font-size: 0.8rem; color: #9CA3AF;">☀️</span>
      <label class="toggle-switch">
        <input type="checkbox" id="navThemeToggle" ${getTheme() === 'dark' ? 'checked' : ''}>
        <span class="slider"></span>
      </label>
      <span style="font-size: 0.8rem; color: #9CA3AF;">🌙</span>
    `;
    navActions.appendChild(themeWrap);

    document.getElementById('navThemeToggle').addEventListener('change', (e) => {
      saveTheme(e.target.checked ? 'dark' : 'light');
    });
  }
}

function logout() {
  clearToken();
  window.location.href = 'index.html';
}

// Call on every page
document.addEventListener('DOMContentLoaded', updateNavbar);

const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== '5055' 
  ? 'http://localhost:5055' 
  : window.location.protocol === 'file:' 
    ? 'http://localhost:5055' 
    : '';

// Common helper for API calls
async function apiCall(endpoint, options = {}) {
  const token = getToken();
  const headers = { ...(options.headers || {}) };
  
  if (token && !options.noAuth) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  // Only set Content-Type for JSON – let browser set it for FormData
  if (!options.isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
  const config = {
    method: options.method || 'GET',
    headers,
  };
  
  if (options.body) {
    config.body = options.isFormData ? options.body : JSON.stringify(options.body);
  }

  try {
    const fullUrl = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    const response = await fetch(fullUrl, config);
    
    let data;
    const text = await response.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error('Server returned an invalid response (not JSON). Please check if backend is running.');
      }
    } else {
      data = {};
    }

    if (!response.ok) {
      throw new Error(data.message || `Error ${response.status}`);
    }
    return data;
  } catch (error) {
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error('Could not connect to the server. Please ensure the backend is running on port 5055.');
    }
    throw error;
  }
}

// Global escape HTML to prevent XSS
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
         .toString()
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

function formatDate(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Setup search autocomplete universally
document.addEventListener('DOMContentLoaded', () => {
    const searchInputs = document.querySelectorAll('.search-input-global');
    searchInputs.forEach(input => {
        let timeout;
        const suggestionBox = document.createElement('div');
        suggestionBox.className = 'search-suggestions';
        input.parentNode.appendChild(suggestionBox);
        input.parentNode.style.position = 'relative';

        input.addEventListener('input', (e) => {
            clearTimeout(timeout);
            const query = e.target.value.trim();
            if (query.length < 2) {
                suggestionBox.style.display = 'none';
                return;
            }
            timeout = setTimeout(async () => {
                try {
                    const data = await apiCall(`/api/projects/suggestions?q=${encodeURIComponent(query)}`);
                    if (data && data.length > 0) {
                        suggestionBox.innerHTML = data.map(p => `
                            <div class="suggestion-item" onclick="window.location.href='project-detail.html?id=${p.id}'">
                                <strong>${escapeHtml(p.title)}</strong> <br>
                                <span style="font-size: 0.75rem; color: #6B7280;">${escapeHtml(p.batch || '')}</span>
                            </div>
                        `).join('');
                        suggestionBox.style.display = 'block';
                    } else {
                        suggestionBox.innerHTML = '<div class="suggestion-item">No results found</div>';
                        suggestionBox.style.display = 'block';
                    }
                } catch (e) {
                    console.error('Search error', e);
                }
            }, 300);
        });

        // Hide when clicking outside
        document.addEventListener('click', (e) => {
            if (!input.contains(e.target) && !suggestionBox.contains(e.target)) {
                suggestionBox.style.display = 'none';
            }
        });
    });
});
