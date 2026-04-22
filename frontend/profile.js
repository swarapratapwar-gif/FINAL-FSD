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

    if (!mine.length) {
      list.innerHTML = '<p class="muted">You have not submitted projects yet.</p>';
    } else {
      list.innerHTML = mine.map(function (item) {
        return '<article class="project-item">'
          + '<h3>' + item.title + '</h3>'
          + '<p>' + item.description + '</p>'
          + '<a href="project-detail.html?id=' + item.id + '">Open</a>'
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
