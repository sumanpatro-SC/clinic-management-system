let globalPatients = [];

const loadDataForDropdowns = async () => {
    const pRes = await fetch('/api/patients');
    globalPatients = await pRes.json();
    document.getElementById('bn').innerHTML = '<option value="">Select Patient</option>' + 
        globalPatients.map(p => `<option value="${p[1]}">${p[1]}</option>`).join('');

    const dRes = await fetch('/api/doctors');
    const doctors = await dRes.json();
    document.getElementById('bd').innerHTML = '<option value="">Select Doctor</option>' + 
        doctors.map(d => `<option value="${d[0]}">ID: ${d[0]} (Dr. ${d[1]})</option>`).join('');
};

const autoFillContact = () => {
    const selectedName = document.getElementById('bn').value;
    const patient = globalPatients.find(p => p[1] === selectedName);
    document.getElementById('bc').value = patient ? patient[2] : "";
};

const loadBillTable = async () => {
    const res = await fetch('/api/billing');
    const data = await res.json();
    const tbody = document.querySelector('#billTable tbody');
    tbody.innerHTML = data.map(b => `
        <tr><td>${b[0]}</td><td>${b[1]}</td><td>${b[2]}</td><td>${b[3]}</td><td>${b[4]}</td>
        <td><button class="btn-del" onclick="deleteBill(${b[0]})">Delete</button></td></tr>`).join('');
};

const sortTable = (tableId, colIndex) => {
    const table = document.getElementById(tableId);
    const tbody = table.tBodies[0];
    const rows = Array.from(tbody.rows);
    const isAscending = table.dataset.sortOrder !== 'asc';
    
    rows.sort((x, y) => {
        const xVal = parseFloat(x.cells[colIndex].innerText) || x.cells[colIndex].innerText.toLowerCase();
        const yVal = parseFloat(y.cells[colIndex].innerText) || y.cells[colIndex].innerText.toLowerCase();
        if (typeof xVal === 'number' && typeof yVal === 'number') {
            return isAscending ? xVal - yVal : yVal - xVal;
        }
        return isAscending ? xVal.localeCompare(yVal) : yVal.localeCompare(xVal);
    });

    table.dataset.sortOrder = isAscending ? 'asc' : 'desc';
    rows.forEach(row => tbody.appendChild(row));
};

document.getElementById('billForm').onsubmit = async (e) => {
    e.preventDefault();
    const payload = {
        p_name: document.getElementById('bn').value, d_id: document.getElementById('bd').value,
        contact: document.getElementById('bc').value, amount: document.getElementById('ba').value
    };
    await fetch('/api/billing', { method: 'POST', body: JSON.stringify(payload) });
    loadBillTable(); 
    e.target.reset();
};

const deleteBill = async (id) => {
    if(confirm("Confirm deletion?")) {
        await fetch('/api/billing', { method: 'POST', body: JSON.stringify({action: 'delete', id}) });
        loadBillTable();
    }
};

window.onload = () => { loadDataForDropdowns(); loadBillTable(); };