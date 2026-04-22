App.applyNavState();

const statusBox = document.getElementById('status');
const params = new URLSearchParams(window.location.search);
const id = params.get('id');

async function loadDetail() {
  if (!id) {
    statusBox.className = 'status error';
    statusBox.textContent = 'Missing project id.';
    return;
  }

  try {
    const project = await App.api('/projects/' + encodeURIComponent(id));
    document.getElementById('title').textContent = project.title;
    document.getElementById('meta').textContent = 'By ' + project.ownerName + ' | Batch ' + project.batch;
    document.getElementById('description').textContent = project.description;
    document.getElementById('tech').textContent = 'Tech: ' + project.techStack;

    const links = [];
    if (project.github) links.push('<a target="_blank" href="' + project.github + '">GitHub</a>');
    if (project.linkedin) links.push('<a target="_blank" href="' + project.linkedin + '">LinkedIn</a>');
    document.getElementById('links').innerHTML = links.join(' | ');

    // Display file downloads
    const filesHtml = [];
    if (project.researchPaper) {
      filesHtml.push('<a target="_blank" href="/uploads/' + encodeURIComponent(project.researchPaper) + '" class="button-link">📄 Download Research Paper</a>');
    }
    if (project.presentation) {
      filesHtml.push('<a target="_blank" href="/uploads/' + encodeURIComponent(project.presentation) + '" class="button-link">🎬 Download Presentation</a>');
    }
    if (filesHtml.length > 0) {
      document.getElementById('filesSection').innerHTML = '<div style="margin: 12px 0;">' + filesHtml.join('&nbsp; | &nbsp;') + '</div>';
    }

    const user = App.getUser();
    if (user && user.id === project.ownerId) {
      document.getElementById('ownerActions').innerHTML = '<button class="submit" id="deleteBtn">Delete Project</button>';
      document.getElementById('deleteBtn').onclick = async function () {
        try {
          await App.api('/projects/' + encodeURIComponent(id), { method: 'DELETE' });
          window.location.href = 'explore.html';
        } catch (error) {
          statusBox.className = 'status error';
          statusBox.textContent = error.message;
        }
      };
    }

    statusBox.className = 'status ok';
    statusBox.textContent = 'Project loaded.';
  } catch (error) {
    statusBox.className = 'status error';
    statusBox.textContent = error.message;
  }
}

loadDetail();
