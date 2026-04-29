document.addEventListener('DOMContentLoaded', async () => {
  if (!App.requireAuth()) return;

  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('id');
  if (!projectId) {
    window.location.href = 'explore.html';
    return;
  }

  const form = document.getElementById('editForm');
  const submitBtn = document.getElementById('submitBtn');

  try {
    const project = await App.api(`/projects/${projectId}`);
    const user = App.getUser();
    
    if (project.ownerId !== user.id && user.role !== 'admin') {
      App.showToast('You do not have permission to edit this project', 'error');
      window.location.href = 'explore.html';
      return;
    }

    // Pre-fill form
    document.getElementById('title').value = project.title || '';
    document.getElementById('teamName').value = project.teamName || '';
    document.getElementById('guideName').value = project.guideName || '';
    document.getElementById('domain').value = project.domain || '';
    document.getElementById('department').value = project.department || '';
    document.getElementById('year').value = project.year || '';
    document.getElementById('batch').value = project.batch || '';
    document.getElementById('teamMembers').value = (project.teamMembers || []).join(', ');
    document.getElementById('techStack').value = (project.techStack || []).join(', ');
    document.getElementById('abstract').value = project.abstract || '';
    document.getElementById('github').value = project.github || '';
    document.getElementById('linkedin').value = project.linkedin || '';

  } catch (error) {
    App.showToast('Failed to load project details', 'error');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.textContent = 'Saving...';
    submitBtn.disabled = true;

    try {
      const formData = new FormData();
      formData.append('title', document.getElementById('title').value);
      formData.append('teamName', document.getElementById('teamName').value);
      formData.append('guideName', document.getElementById('guideName').value);
      formData.append('domain', document.getElementById('domain').value);
      formData.append('department', document.getElementById('department').value);
      formData.append('year', document.getElementById('year').value);
      formData.append('batch', document.getElementById('batch').value);
      formData.append('teamMembers', document.getElementById('teamMembers').value);
      formData.append('techStack', document.getElementById('techStack').value);
      formData.append('abstract', document.getElementById('abstract').value);
      formData.append('github', document.getElementById('github').value);
      formData.append('linkedin', document.getElementById('linkedin').value);

      const rpFile = document.getElementById('researchPaper').files[0];
      if (rpFile) formData.append('researchPaper', rpFile);

      const pptFile = document.getElementById('presentation').files[0];
      if (pptFile) formData.append('presentation', pptFile);

      const imgFile = document.getElementById('coverImage').files[0];
      if (imgFile) formData.append('coverImage', imgFile);

      await App.api(`/projects/${projectId}`, {
        method: 'PUT',
        body: formData
      });

      App.showToast('Project updated successfully', 'success');
      setTimeout(() => {
        window.location.href = `project-detail.html?id=${projectId}`;
      }, 1500);

    } catch (error) {
      App.showToast(error.message, 'error');
      submitBtn.textContent = 'Save Changes →';
      submitBtn.disabled = false;
    }
  });
});
