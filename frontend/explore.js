document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const suggestionsBox = document.getElementById('suggestionsBox');
  const batchSelect = document.getElementById('batchSelect');
  const yearGroup = document.getElementById('yearGroup');
  const yearSelect = document.getElementById('yearSelect');
  const deptCheckboxes = document.querySelectorAll('#deptCheckboxes input[type="checkbox"]');
  const clearFiltersBtn = document.getElementById('clearFilters');
  const projectGrid = document.getElementById('projectGrid');
  const emptyState = document.getElementById('emptyState');
  const loader = document.getElementById('loader');
  
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const pageInfo = document.getElementById('pageInfo');

  let currentPage = 1;
  const limit = 12;
  let debounceTimer;

  // Initialize
  fetchProjects();

  // Search Autocomplete
  searchInput.addEventListener('input', (e) => {
    const q = e.target.value.trim();
    clearTimeout(debounceTimer);
    
    if (q.length >= 2) {
      debounceTimer = setTimeout(async () => {
        try {
          const suggestions = await App.api(`/projects/suggestions?q=${encodeURIComponent(q)}`);
          if (suggestions.length > 0) {
            suggestionsBox.innerHTML = suggestions.map(s => 
              `<div class="suggestion-item" onclick="selectSuggestion('${s.id}')">
                <strong>${App.escapeHtml(s.title)}</strong><br>
                <small>${App.escapeHtml(s.ownerName)}</small>
               </div>`
            ).join('');
            suggestionsBox.style.display = 'block';
          } else {
            suggestionsBox.style.display = 'none';
          }
        } catch (error) {
          console.error('Suggestions error:', error);
        }
      }, 300);
    } else {
      suggestionsBox.style.display = 'none';
    }

    // Also trigger main search after delay
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      currentPage = 1;
      fetchProjects();
    }, 500);
  });

  window.selectSuggestion = function(id) {
    window.location.href = `project-detail.html?id=${id}`;
  };

  // Close suggestions when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.autocomplete-container')) {
      suggestionsBox.style.display = 'none';
    }
  });

  // Filters
  batchSelect.addEventListener('change', () => {
    if (batchSelect.value !== 'all') {
      yearGroup.style.display = 'block';
    } else {
      yearGroup.style.display = 'none';
      yearSelect.value = 'all';
    }
    currentPage = 1;
    fetchProjects();
  });

  yearSelect.addEventListener('change', () => {
    currentPage = 1;
    fetchProjects();
  });

  deptCheckboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      // Logic for single dept select as API currently handles single. If multiple needed, would pass array.
      // For now, we take the first checked.
      currentPage = 1;
      fetchProjects();
    });
  });

  clearFiltersBtn.addEventListener('click', () => {
    searchInput.value = '';
    batchSelect.value = 'all';
    yearSelect.value = 'all';
    yearGroup.style.display = 'none';
    deptCheckboxes.forEach(cb => cb.checked = false);
    currentPage = 1;
    fetchProjects();
  });

  // Pagination
  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      fetchProjects();
    }
  });

  nextBtn.addEventListener('click', () => {
    currentPage++;
    fetchProjects();
  });

  async function fetchProjects() {
    loader.style.display = 'block';
    projectGrid.style.display = 'none';
    emptyState.style.display = 'none';

    try {
      const params = new URLSearchParams();
      if (searchInput.value.trim()) params.append('search', searchInput.value.trim());
      if (batchSelect.value !== 'all') params.append('batch', batchSelect.value);
      if (yearSelect.value !== 'all') params.append('year', yearSelect.value);
      
      const selectedDept = Array.from(deptCheckboxes).find(cb => cb.checked);
      if (selectedDept) params.append('department', selectedDept.value);

      params.append('page', currentPage);
      params.append('limit', limit);

      const response = await App.api(`/projects?${params.toString()}`);
      renderProjects(response);
    } catch (error) {
      App.showToast('Failed to load projects', 'error');
    } finally {
      loader.style.display = 'none';
    }
  }

  function renderProjects(data) {
    const { projects, totalPages, currentPage: page } = data;

    if (projects.length === 0) {
      emptyState.style.display = 'block';
      projectGrid.style.display = 'none';
      pageInfo.textContent = 'Page 1 of 1';
      prevBtn.disabled = true;
      nextBtn.disabled = true;
      return;
    }

    projectGrid.innerHTML = projects.map(p => {
      const coverUrl = p.coverImage ? `/uploads/${p.coverImage}` : null;
      const coverHtml = coverUrl 
        ? `<div class="project-cover" style="background-image: url('${coverUrl}'); height: 160px; background-size: cover; background-position: center; border-radius: 8px 8px 0 0;"></div>`
        : `<div class="project-cover" style="background: var(--primary-color); height: 160px; display: flex; align-items: center; justify-content: center; color: white; border-radius: 8px 8px 0 0;">No Image</div>`;

      const techTags = (p.techStack || []).slice(0, 3).map(t => `<span class="badge">${App.escapeHtml(t)}</span>`).join('');
      const moreTags = (p.techStack && p.techStack.length > 3) ? `<span class="badge">+${p.techStack.length - 3}</span>` : '';

      return `
        <div class="card project-card" style="padding: 0; display: flex; flex-direction: column;">
          ${coverHtml}
          <div style="padding: 1.5rem; flex-grow: 1; display: flex; flex-direction: column;">
            <div style="margin-bottom: 0.5rem;">
              <span class="badge" style="background: var(--bg-secondary); color: var(--text-main);">${App.escapeHtml(p.batch)}</span>
              <span class="badge" style="background: var(--bg-secondary); color: var(--text-main);">${App.escapeHtml(p.domain)}</span>
            </div>
            <h3 style="margin-bottom: 0.5rem;">${App.escapeHtml(p.title)}</h3>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem;">${App.escapeHtml(p.ownerName)}</p>
            
            <div style="margin-bottom: 1.5rem; flex-grow: 1;">
              ${techTags} ${moreTags}
            </div>
            
            <a href="project-detail.html?id=${p.id}" class="btn btn-outline" style="width: 100%; text-align: center;">View Details →</a>
          </div>
        </div>
      `;
    }).join('');

    projectGrid.style.display = 'grid';

    // Pagination controls
    pageInfo.textContent = `Page ${page} of ${totalPages || 1}`;
    prevBtn.disabled = page <= 1;
    nextBtn.disabled = page >= totalPages;
  }
});
