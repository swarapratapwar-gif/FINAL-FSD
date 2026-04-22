App.applyNavState();

const records = document.getElementById('records');
const statusBox = document.getElementById('status');

async function loadRecords() {
  try {
    const projects = await App.api('/projects');
    const summary = {};

    projects.forEach(function (item) {
      if (!summary[item.ownerId]) {
        summary[item.ownerId] = {
          name: item.ownerName,
          projects: 0,
          latestBatch: item.batch
        };
      }
      summary[item.ownerId].projects += 1;
      summary[item.ownerId].latestBatch = item.batch;
    });

    const rows = Object.values(summary);
    if (!rows.length) {
      records.innerHTML = '<p class="muted">No student records yet.</p>';
      return;
    }

    records.innerHTML = '<div class="table-like">'
      + rows.map(function (row) {
        return '<div class="table-row">'
          + '<strong>' + row.name + '</strong>'
          + '<span>' + row.projects + ' projects</span>'
          + '<span>Batch ' + row.latestBatch + '</span>'
          + '</div>';
      }).join('')
      + '</div>';

    statusBox.className = 'status ok';
    statusBox.textContent = 'Loaded ' + rows.length + ' student record(s).';
  } catch (error) {
    statusBox.className = 'status error';
    statusBox.textContent = error.message;
  }
}

loadRecords();
