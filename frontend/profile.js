App.applyNavState();
App.requireAuth('login.html');

const profileText = document.getElementById('profileText');
const list = document.getElementById('myProjects');
const statusBox = document.getElementById('status');

async function loadProfile() {
  const user = App.getUser();
  profileText.textContent = user ? (user.name + ' (' + user.email + ')') : 'Unknown user';

  try {
    const all = await App.api('/projects');
    const mine = all.filter(function (item) {
      return user && item.ownerId === user.id;
    });

    const countBox = document.getElementById('projectCount');
    if (countBox) {
      countBox.textContent = mine.length + ' project' + (mine.length === 1 ? '' : 's');
    }

    if (!mine.length) {
      list.innerHTML = '<p class="muted">You have not submitted projects yet.</p>';
    } else {
      list.innerHTML = mine.map(function (item) {
        return '<article class="project-tile">'
          + '<div class="project-cover" style="background: linear-gradient(135deg, #1e293b, #7c3aed 55%, #f59e0b);"></div>'
          + '<div class="project-tile-body">'
          + '<span class="project-badge">' + item.batch + '</span>'
          + '<h3>' + item.title + '</h3>'
          + '<p class="summary">' + item.description + '</p>'
          + '<div class="project-tile-footer">'
          + '<span class="muted">' + item.techStack + '</span>'
          + '<a class="button-link alt" href="project-detail.html?id=' + item.id + '">Open</a>'
          + '</div>'
          + '</div>'
          + '</article>';
      }).join('');
    }

    statusBox.className = 'status ok';
    statusBox.textContent = 'Loaded ' + mine.length + ' project(s).';
  } catch (error) {
    statusBox.className = 'status error';
    statusBox.textContent = error.message;
  }
}

loadProfile();
