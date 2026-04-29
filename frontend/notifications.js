App.applyNavState();

const list = document.getElementById('notifications');
const statusBox = document.getElementById('status');

async function loadNotifications() {
  try {
    const projects = await App.api('/projects');
    const latest = projects.slice(0, 8);

    if (!latest.length) {
      list.innerHTML = '<p class="muted">No notifications yet.</p>';
      return;
    }

    list.innerHTML = latest.map(function (item) {
      return '<article class="project-tile">'
        + '<div class="project-cover" style="background: linear-gradient(135deg, #0f172a, #334155 55%, #f97316);"></div>'
        + '<div class="project-tile-body">'
        + '<span class="project-badge">New</span>'
        + '<h3>New Project: ' + item.title + '</h3>'
        + '<p class="summary">' + item.ownerName + ' submitted a project in batch ' + item.batch + '.</p>'
        + '<div class="project-tile-footer">'
        + '<span class="muted">Latest update</span>'
        + '<a class="button-link alt" href="project-detail.html?id=' + item.id + '">View</a>'
        + '</div>'
        + '</div>'
        + '</article>';
    }).join('');

    statusBox.className = 'status ok';
    statusBox.textContent = 'Showing latest ' + latest.length + ' updates.';
  } catch (error) {
    statusBox.className = 'status error';
    statusBox.textContent = error.message;
  }
}

loadNotifications();
