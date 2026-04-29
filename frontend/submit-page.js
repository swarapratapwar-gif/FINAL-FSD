document.addEventListener('DOMContentLoaded', () => {
  if (!App.requireAuth()) {
    App.showLoginRequired('.container');
    return;
  }

  const submitForm = document.getElementById('submitForm');
  const statusBox = document.getElementById('statusBox');
  const viewMyProjects = document.getElementById('viewMyProjects');

  submitForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    statusBox.style.display = 'block';
    statusBox.style.background = '#F3F4F6';
    statusBox.style.color = '#374151';
    statusBox.textContent = 'Uploading project...';
    viewMyProjects.style.display = 'none';

    try {
      const formData = new FormData();
      formData.append('title', document.getElementById('title').value);
      formData.append('teamName', document.getElementById('teamName').value);
      formData.append('teamMembers', document.getElementById('teamMembers').value);
      formData.append('domain', document.getElementById('domain').value);
      formData.append('abstract', document.getElementById('description').value);
      formData.append('guideName', document.getElementById('guideName').value);
      formData.append('year', document.getElementById('year').value);
      formData.append('batch', document.getElementById('batch').value);
      formData.append('techStack', document.getElementById('techStack').value);
      
      const github = document.getElementById('githubLink').value;
      if (github) formData.append('githubLink', github);
      
      const linkedin = document.getElementById('linkedinLink').value;
      if (linkedin) formData.append('linkedinLink', linkedin);

      const researchPaper = document.getElementById('researchPaper').files[0];
      if (researchPaper) {
        formData.append('researchPaper', researchPaper);
      } else {
        throw new Error("Research Paper PDF is required.");
      }

      const presentation = document.getElementById('presentation').files[0];
      if (presentation) {
        formData.append('presentation', presentation);
      }

      await App.api('/projects', {
        method: 'POST',
        body: formData
      }, true); // isFormData = true

      statusBox.style.background = '#DCFCE7';
      statusBox.style.color = '#16A34A';
      statusBox.textContent = 'Project submitted successfully!';
      
      submitForm.reset();
      viewMyProjects.style.display = 'block';

    } catch (error) {
      statusBox.style.background = '#FEE2E2';
      statusBox.style.color = '#DC2626';
      statusBox.textContent = error.message || 'Failed to submit project.';
    }
  });
});
