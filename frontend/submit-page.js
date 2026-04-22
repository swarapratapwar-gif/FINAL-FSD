App.applyNavState();
App.requireAuth('login.html');

document.getElementById('submitForm').addEventListener('submit', async function (event) {
  event.preventDefault();
  const status = document.getElementById('status');

  try {
    // Create FormData to handle file uploads
    const formData = new FormData();
    formData.append('title', document.getElementById('title').value.trim());
    formData.append('description', document.getElementById('description').value.trim());
    formData.append('techStack', document.getElementById('techStack').value.trim());
    formData.append('batch', document.getElementById('batch').value.trim());
    formData.append('github', document.getElementById('github').value.trim());
    formData.append('linkedin', document.getElementById('linkedin').value.trim());
    
    // Add file inputs
    const researchPaperFile = document.getElementById('researchPaper').files[0];
    if (!researchPaperFile) {
      status.className = 'status error';
      status.textContent = 'Research paper PDF is required.';
      return;
    }
    formData.append('researchPaper', researchPaperFile);

    const presentationFile = document.getElementById('presentation').files[0];
    if (presentationFile) {
      formData.append('presentation', presentationFile);
    }

    // Make request with FormData (don't set Content-Type header, browser will handle it)
    const token = App.getToken();
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token
      },
      body: formData
    });

    const data = await response.json();
    
    if (!response.ok) {
      status.className = 'status error';
      status.textContent = data.message || 'Error submitting project.';
      return;
    }

    status.className = 'status ok';
    status.textContent = 'Project submitted successfully.';
    event.target.reset();
  } catch (error) {
    status.className = 'status error';
    status.textContent = error.message || 'Error submitting project.';
  }
});
