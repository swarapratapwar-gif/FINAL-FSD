// Sample student data
const studentsData = [
    {
        rollNo: 'AI001',
        name: 'Aditya Kumar',
        year: '1st',
        batch: 'A',
        projects: 2
    },
    {
        rollNo: 'AI002',
        name: 'Bhavna Singh',
        year: '1st',
        batch: 'A',
        projects: 1
    },
    {
        rollNo: 'AI003',
        name: 'Chirag Patel',
        year: '2nd',
        batch: 'B',
        projects: 3
    },
    {
        rollNo: 'AI004',
        name: 'Divya Sharma',
        year: '2nd',
        batch: 'B',
        projects: 2
    },
    {
        rollNo: 'AI005',
        name: 'Eshan Verma',
        year: '3rd',
        batch: 'C',
        projects: 4
    },
    {
        rollNo: 'AI006',
        name: 'Faria Khan',
        year: '3rd',
        batch: 'C',
        projects: 3
    },
    {
        rollNo: 'AI007',
        name: 'Gaurav Desai',
        year: '4th',
        batch: 'A',
        projects: 5
    },
    {
        rollNo: 'AI008',
        name: 'Hina Gupta',
        year: '4th',
        batch: 'A',
        projects: 4
    }
];

document.addEventListener('DOMContentLoaded', function() {
    const yearFilter = document.getElementById('yearFilter');
    const batchFilter = document.getElementById('batchFilter');
    const studentSearch = document.getElementById('studentSearch');
    const recordsTableBody = document.getElementById('recordsTableBody');

    // Initial load
    populateTable(studentsData);

    // Event listeners for filters
    yearFilter.addEventListener('change', applyFilters);
    batchFilter.addEventListener('change', applyFilters);
    studentSearch.addEventListener('input', applyFilters);

    function applyFilters() {
        const selectedYear = yearFilter.value;
        const selectedBatch = batchFilter.value;
        const searchTerm = studentSearch.value.toLowerCase();

        const filtered = studentsData.filter(student => {
            const yearMatch = !selectedYear || student.year === selectedYear;
            const batchMatch = !selectedBatch || student.batch === selectedBatch;
            const nameMatch = !searchTerm || student.name.toLowerCase().includes(searchTerm);

            return yearMatch && batchMatch && nameMatch;
        });

        populateTable(filtered);
    }

    function populateTable(data) {
        recordsTableBody.innerHTML = '';

        if (data.length === 0) {
            recordsTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px; color: #999;">No students found</td></tr>';
            return;
        }

        data.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.rollNo}</td>
                <td>${student.name}</td>
                <td>${student.year}</td>
                <td>Batch ${student.batch}</td>
                <td><strong>${student.projects}</strong></td>
                <td>
                    <a href="my-projects.html?student=${student.name}" class="btn-view">View Projects</a>
                </td>
            `;
            recordsTableBody.appendChild(row);
        });
    }
});