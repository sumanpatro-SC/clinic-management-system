// Project file: static/js/doctors.js — frontend logic for doctor management page; calls /api/doctors
const loadDoctors = async () => {
    const res = await fetch('/api/doctors');
    const data = await res.json();
    const tbody = document.querySelector('#docTable tbody');
    tbody.innerHTML = data.map(d => `
        <tr id="row-${d[0]}">
            <td>${d[0]}</td>
            <td class="cell-name">${d[1]}</td>
            <td class="cell-spec">${d[2]}</td>
            <td class="cell-contact">${d[3]}</td>
            <td>
                <button class="btn-edit" onclick="editRow(${d[0]})" style="background: #ffc107; color: black; margin-right:5px;">Edit</button>
                <button class="btn-del" onclick="deleteDoc(${d[0]})" style="background: #dc3545; color: white;">Delete</button>
            </td>
        </tr>`).join('');
};

// --- NEW PDF DOWNLOAD FUNCTION ---
const downloadDoctorsPDF = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.text("Clinic Management System - Doctors List", 14, 15);
    
    doc.autoTable({ 
        html: '#docTable',
        startY: 20,
        // Column 4 is the "Action" column (Edit/Delete buttons) - we hide it in the PDF
        columnStyles: { 4: { display: 'none' } } 
    });

    doc.save('Doctors_Report.pdf');
};

const editRow = (id) => {
    const row = document.getElementById(`row-${id}`);
    const name = row.querySelector('.cell-name').innerText;
    const spec = row.querySelector('.cell-spec').innerText;
    const contact = row.querySelector('.cell-contact').innerText;

    row.innerHTML = `
        <td>${id}</td>
        <td><input type="text" id="edit-name-${id}" value="${name}"></td>
        <td><input type="text" id="edit-spec-${id}" value="${spec}"></td>
        <td><input type="text" id="edit-contact-${id}" value="${contact}"></td>
        <td>
            <button onclick="saveRow(${id})" style="background: #28a745; color: white;">Save</button>
            <button onclick="loadDoctors()" style="background: #6c757d; color: white;">Cancel</button>
        </td>`;
};

const saveRow = async (id) => {
    const payload = {
        action: 'update',
        id: id,
        name: document.getElementById(`edit-name-${id}`).value,
        spec: document.getElementById(`edit-spec-${id}`).value,
        contact: document.getElementById(`edit-contact-${id}`).value
    };
    await fetch('/api/doctors', { method: 'POST', body: JSON.stringify(payload) });
    loadDoctors();
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

const exportToCSV = (tableId) => {
    let csv = [];
    const rows = document.querySelectorAll(`#${tableId} tr`);
    for (const row of rows) {
        const cols = Array.from(row.querySelectorAll("td, th")).slice(0, -1);
        csv.push(cols.map(c => c.innerText).join(","));
    }
    const blob = new Blob([csv.join("\n")], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'Doctors_List.csv'; a.click();
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
    await fetch('/api/doctors', { method: 'POST', body: JSON.stringify({action: 'delete', id}) });
    loadDoctors();
};

window.onload = loadDoctors;