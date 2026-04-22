App.applyNavState();

const projectList = document.getElementById('projectList');
const statusBox = document.getElementById('status');
const searchInput = document.getElementById('searchInput');
const batchSelect = document.getElementById('batchSelect');

function renderProjects(items) {
  if (!items.length) {
    projectList.innerHTML = '<p class="muted">No projects found.</p>';
    return;
  }

  projectList.innerHTML = items.map(function (item) {
    return '<article class="project-item">'
      + '<h3>' + item.title + '</h3>'
      + '<p>' + item.description + '</p>'
      + '<p class="tags">' + item.techStack + ' | Batch ' + item.batch + ' | ' + item.ownerName + '</p>'
      + '<a href="project-detail.html?id=' + item.id + '">View details</a>'
      + '</article>';
  }).join('');
}

async function loadBatches() {
  try {
    const batches = await App.api('/projects/batches');
    batches.forEach(function (batch) {
      const option = document.createElement('option');
      option.value = batch;
      option.textContent = 'Batch ' + batch;
      batchSelect.appendChild(option);
    });
  } catch (error) {
    statusBox.className = 'status error';
    statusBox.textContent = error.message;
  }
}

async function loadProjects() {
  try {
    const q = searchInput.value.trim();
    const batch = batchSelect.value;
    const endpoint = q
      ? '/projects/search?q=' + encodeURIComponent(q) + '&batch=' + encodeURIComponent(batch)
      : '/projects?batch=' + encodeURIComponent(batch);

    const projects = await App.api(endpoint);
    renderProjects(projects);
    statusBox.className = 'status ok';
    statusBox.textContent = 'Loaded ' + projects.length + ' project(s).';
  } catch (error) {
    statusBox.className = 'status error';
    statusBox.textContent = error.message;
  }
}

searchInput.addEventListener('input', loadProjects);
batchSelect.addEventListener('change', loadProjects);

loadBatches().then(loadProjects);
