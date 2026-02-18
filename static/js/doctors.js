const loadDoctors = async () => {
    const res = await fetch('/api/doctors');
    const data = await res.json();
    const tbody = document.querySelector('#docTable tbody');
    tbody.innerHTML = data.map(d => `
        <tr>
            <td>${d[0]}</td>
            <td>${d[1]}</td>
            <td>${d[2]}</td>
            <td>${d[3]}</td>
            <td><button class="btn-del" onclick="deleteDoc(${d[0]})">Delete</button></td>
        </tr>`).join('');
};

const sortTable = (colIndex) => {
    const table = document.getElementById("docTable");
    const tbody = table.tBodies[0];
    const rows = Array.from(tbody.rows);
    const isAscending = table.dataset.sortOrder !== 'asc';
    
    rows.sort((x, y) => {
        const xVal = x.cells[colIndex].innerText.toLowerCase();
        const yVal = y.cells[colIndex].innerText.toLowerCase();
        return isAscending ? xVal.localeCompare(yVal) : yVal.localeCompare(xVal);
    });

    table.dataset.sortOrder = isAscending ? 'asc' : 'desc';
    rows.forEach(row => tbody.appendChild(row));
};

const exportToPDF = () => { window.print(); };

const exportToCSV = (tableId) => {
    let csv = [];
    const rows = document.querySelectorAll(`#${tableId} tr`);
    for (const row of rows) {
        const cols = Array.from(row.querySelectorAll("td, th")).slice(0, -1);
        csv.push(cols.map(c => c.innerText).join(","));
    }
    const blob = new Blob([csv.join("\n")], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'Doctors_List.csv';
    a.click();
};

document.getElementById('docForm').onsubmit = async (e) => {
    e.preventDefault();
    const payload = {
        name: document.getElementById('name').value,
        spec: document.getElementById('spec').value,
        contact: document.getElementById('contact').value
    };
    await fetch('/api/doctors', { method: 'POST', body: JSON.stringify(payload) });
    loadDoctors();
    e.target.reset();
};

const deleteDoc = async (id) => {
    if(confirm("Delete Doctor?")) {
        await fetch('/api/doctors', { method: 'POST', body: JSON.stringify({action: 'delete', id}) });
        loadDoctors();
    }
};

window.onload = loadDoctors;