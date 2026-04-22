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
      return '<article class="project-item">'
        + '<h3>New Project: ' + item.title + '</h3>'
        + '<p>' + item.ownerName + ' submitted a project in batch ' + item.batch + '.</p>'
        + '<a href="project-detail.html?id=' + item.id + '">View</a>'
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
