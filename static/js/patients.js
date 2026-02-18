// Project file: static/js/patients.js — frontend logic for patient management page; interacts with /api/patients and /api/doctors
let currentDoctors = []; 

const loadDoctorsList = async () => {
    const res = await fetch('/api/doctors');
    currentDoctors = await res.json();
    document.getElementById('p_docid').innerHTML = '<option value="">Select Doctor</option>' + 
        currentDoctors.map(d => `<option value="${d[0]}">ID: ${d[0]} - Dr. ${d[1]}</option>`).join('');
};

const loadPatients = async () => {
    const res = await fetch('/api/patients');
    const data = await res.json();
    const tbody = document.querySelector('#patTable tbody');
    tbody.innerHTML = data.map(p => `
        <tr id="pat-row-${p[0]}">
            <td>${p[0]}</td>
            <td class="cell-name">${p[1]}</td>
            <td class="cell-contact">${p[2]}</td>
            <td class="cell-date">${p[3]}</td>
            <td class="cell-docid">${p[4]}</td>
            <td>
                <button class="btn-edit" onclick="editPatient(${p[0]})" style="background: #ffc107; color: black; margin-right:5px;">Edit</button>
                <button class="btn-del" onclick="deletePatient(${p[0]})" style="background: #dc3545; color: white;">Delete</button>
            </td>
        </tr>`).join('');
};

const editPatient = (id) => {
    const row = document.getElementById(`pat-row-${id}`);
    const name = row.querySelector('.cell-name').innerText;
    const contact = row.querySelector('.cell-contact').innerText;
    const date = row.querySelector('.cell-date').innerText;
    const docId = row.querySelector('.cell-docid').innerText;

    row.innerHTML = `
        <td>${id}</td>
        <td><input type="text" id="edit-pname-${id}" value="${name}"></td>
        <td><input type="text" id="edit-pcontact-${id}" value="${contact}"></td>
        <td><input type="date" id="edit-pdate-${id}" value="${date}"></td>
        <td>
            <select id="edit-pdoc-${id}">
                ${currentDoctors.map(d => `<option value="${d[0]}" ${d[0] == docId ? 'selected' : ''}>ID: ${d[0]}</option>`).join('')}
            </select>
        </td>
        <td>
            <button onclick="savePatientEdit(${id})" style="background: #28a745; color: white;">Save</button>
            <button onclick="loadPatients()" style="background: #6c757d; color: white;">Cancel</button>
        </td>`;
};

const savePatientEdit = async (id) => {
    const payload = {
        action: 'update',
        id: id,
        name: document.getElementById(`edit-pname-${id}`).value,
        contact: document.getElementById(`edit-pcontact-${id}`).value,
        date: document.getElementById(`edit-pdate-${id}`).value,
        doc_id: document.getElementById(`edit-pdoc-${id}`).value
    };
    await fetch('/api/patients', { method: 'POST', body: JSON.stringify(payload) });
    loadPatients();
};

const downloadPatientsPDF = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("Clinic Management System - Patient Records", 14, 15);
    
    doc.autoTable({ 
        html: '#patTable',
        startY: 20,
        columnStyles: { 5: { display: 'none' } } // Hide Actions column
    });

    doc.save('Patients_Report.pdf');
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
    await fetch('/api/patients', { method: 'POST', body: JSON.stringify({action: 'delete', id}) });
    loadPatients();
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