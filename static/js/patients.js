const loadDoctorsList = async () => {
    const res = await fetch('/api/doctors');
    const docs = await res.json();
    document.getElementById('p_docid').innerHTML = '<option value="">Select Doctor</option>' + 
        docs.map(d => `<option value="${d[0]}">ID: ${d[0]} - Dr. ${d[1]}</option>`).join('');
};

const loadPatients = async () => {
    const res = await fetch('/api/patients');
    const data = await res.json();
    const tbody = document.querySelector('#patTable tbody');
    tbody.innerHTML = data.map(p => `
        <tr><td>${p[0]}</td><td>${p[1]}</td><td>${p[2]}</td><td>${p[3]}</td><td>${p[4]}</td>
        <td><button class="btn-del" onclick="deletePatient(${p[0]})">Delete</button></td></tr>`).join('');
};

const sortTable = (tableId, colIndex) => {
    const table = document.getElementById(tableId);
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

document.getElementById('patForm').onsubmit = async (e) => {
    e.preventDefault();
    const payload = {
        name: document.getElementById('p_name').value,
        contact: document.getElementById('p_contact').value,
        date: document.getElementById('p_date').value,
        doc_id: document.getElementById('p_docid').value
    };
    await fetch('/api/patients', { method: 'POST', body: JSON.stringify(payload) });
    loadPatients();
    e.target.reset();
};

const deletePatient = async (id) => {
    if(confirm("Confirm deletion?")) {
        await fetch('/api/patients', { method: 'POST', body: JSON.stringify({action: 'delete', id}) });
        loadPatients();
    }
};

const exportToCSV = (tableId) => {
    let csv = [];
    const rows = document.querySelectorAll(`#${tableId} tr`);
    for (const row of rows) {
        const cols = Array.from(row.querySelectorAll("td, th")).slice(0, -1);
        csv.push(cols.map(c => c.innerText).join(","));
    }
    const blob = new Blob([csv.join("\n")], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'patient_list.csv'; a.click();
};

window.onload = () => { loadDoctorsList(); loadPatients(); };