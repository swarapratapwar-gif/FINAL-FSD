document.addEventListener('DOMContentLoaded', async () => {
  if (!App.requireAdmin()) return;

  await loadDashboard();

  async function loadDashboard() {
    try {
      const [stats, projects, users] = await Promise.all([
        App.api('/admin/stats'),
        App.api('/admin/projects'),
        App.api('/admin/users')
      ]);

      renderStats(stats);
      renderCharts(stats);
      renderProjects(projects);
      renderUsers(users);
    } catch (error) {
      App.showToast(error.message, 'error');
    }
  }

  function renderStats(stats) {
    const container = document.getElementById('adminStats');
    
    // Find most active batch
    let mostActiveBatch = '-';
    let maxCount = 0;
    for (const [batch, count] of Object.entries(stats.projectsByBatch)) {
      if (count > maxCount) {
        maxCount = count;
        mostActiveBatch = batch;
      }
    }

    container.innerHTML = `
      <div class="stat-card">
        <div class="stat-number">${stats.totalProjects}</div>
        <div class="stat-label">Total Projects</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${stats.totalUsers}</div>
        <div class="stat-label">Total Users</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${Object.keys(stats.projectsByDepartment).length}</div>
        <div class="stat-label">Total Departments</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${mostActiveBatch}</div>
        <div class="stat-label">Most Active Batch</div>
      </div>
    `;
  }

  function renderCharts(stats) {
    const deptChart = document.getElementById('deptChart');
    const batchChart = document.getElementById('batchChart');

    deptChart.innerHTML = createBarChart(stats.projectsByDepartment, stats.totalProjects);
    batchChart.innerHTML = createBarChart(stats.projectsByBatch, stats.totalProjects);
  }

  function createBarChart(dataObj, total) {
    if (total === 0) return '<p class="empty-text">No data available</p>';
    
    let html = '';
    const sorted = Object.entries(dataObj).sort((a, b) => b[1] - a[1]);
    
    // Find max value to normalize bars
    const maxVal = sorted[0][1];

    for (const [label, count] of sorted) {
      const width = Math.max(5, (count / maxVal) * 100);
      html += `
        <div class="bar-row">
          <div class="bar-label">${App.escapeHtml(label)}</div>
          <div class="bar-track">
            <div class="bar-fill" style="width: ${width}%" title="${count} projects"></div>
          </div>
          <div class="bar-value">${count}</div>
        </div>
      `;
    }
    return html;
  }

  function renderProjects(projects) {
    const tbody = document.getElementById('projectsTable');
    if (projects.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center">No projects found.</td></tr>';
      return;
    }

    tbody.innerHTML = projects.slice(0, 20).map(p => `
      <tr>
        <td><strong><a href="project-detail.html?id=${p.id}">${App.escapeHtml(p.title)}</a></strong></td>
        <td>${App.escapeHtml(p.ownerName)}</td>
        <td>${App.escapeHtml(p.department)}</td>
        <td>${App.escapeHtml(p.batch)}</td>
        <td>${App.formatDate(p.createdAt)}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="deleteProject('${p.id}')">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  function renderUsers(users) {
    const tbody = document.getElementById('usersTable');
    if (users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center">No users found.</td></tr>';
      return;
    }

    tbody.innerHTML = users.map(u => `
      <tr>
        <td><strong>${App.escapeHtml(u.name)}</strong> ${u.role === 'admin' ? '<span class="badge badge-admin">Admin</span>' : ''}</td>
        <td>${App.escapeHtml(u.email)}</td>
        <td>${App.escapeHtml(u.department || '-')}</td>
        <td>${App.escapeHtml(u.year || '-')}</td>
        <td>${App.escapeHtml(u.batch || '-')}</td>
        <td>${App.formatDate(u.createdAt)}</td>
        <td>
          ${u.id !== 'admin-001' ? `<button class="btn btn-danger btn-sm" onclick="deleteUser('${u.id}')">Delete</button>` : '-'}
        </td>
      </tr>
    `).join('');
  }

  window.deleteProject = async function(id) {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await App.api(`/admin/projects/${id}`, { method: 'DELETE' });
      App.showToast('Project deleted successfully', 'success');
      loadDashboard();
    } catch (error) {
      App.showToast(error.message, 'error');
    }
  };

  window.deleteUser = async function(id) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await App.api(`/admin/users/${id}`, { method: 'DELETE' });
      App.showToast('User deleted successfully', 'success');
      loadDashboard();
    } catch (error) {
      App.showToast(error.message, 'error');
    }
  };
});
