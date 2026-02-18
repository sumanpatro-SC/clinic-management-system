// Project file: static/js/billing.js — frontend logic for billing page; uses /api/patients, /api/doctors, /api/billing
let globalPatients = [];
let globalDoctors = [];

const loadDataForDropdowns = async () => {
    const pRes = await fetch('/api/patients');
    globalPatients = await pRes.json();
    document.getElementById('bn').innerHTML = '<option value="">Select Patient</option>' + 
        globalPatients.map(p => `<option value="${p[1]}">${p[1]}</option>`).join('');

    const dRes = await fetch('/api/doctors');
    globalDoctors = await dRes.json();
    document.getElementById('bd').innerHTML = '<option value="">Select Doctor</option>' + 
        globalDoctors.map(d => `<option value="${d[0]}">ID: ${d[0]} (Dr. ${d[1]})</option>`).join('');
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
        <tr id="bill-row-${b[0]}">
            <td>${b[0]}</td>
            <td class="cell-name">${b[1]}</td>
            <td class="cell-did">${b[2]}</td>
            <td class="cell-contact">${b[3]}</td>
            <td class="cell-amount">${b[4]}</td>
            <td>
                <button class="btn-edit" onclick="editBill(${b[0]})" style="background: #ffc107; color: black; margin-right:5px;">Edit</button>
                <button class="btn-del" onclick="deleteBill(${b[0]})" style="background: #dc3545; color: white;">Delete</button>
            </td>
        </tr>`).join('');
};

// --- PDF DOWNLOAD FEATURE ---
const downloadBillingPDF = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("Clinic Management System - Billing History", 14, 15);
    
    doc.autoTable({ 
        html: '#billTable',
        startY: 20,
        columnStyles: { 5: { display: 'none' } } // Hide Actions column
    });

    doc.save('Billing_History_Report.pdf');
};

// --- UPDATE LOGIC: EDIT MODE ---
const editBill = (id) => {
    const row = document.getElementById(`bill-row-${id}`);
    const currentName = row.querySelector('.cell-name').innerText;
    const currentDid = row.querySelector('.cell-did').innerText;
    const currentContact = row.querySelector('.cell-contact').innerText;
    const currentAmount = row.querySelector('.cell-amount').innerText;

    row.innerHTML = `
        <td>${id}</td>
        <td>
            <select id="edit-bn-${id}" onchange="autoFillEditContact(${id})">
                ${globalPatients.map(p => `<option value="${p[1]}" ${p[1] === currentName ? 'selected' : ''}>${p[1]}</option>`).join('')}
            </select>
        </td>
        <td>
            <select id="edit-bd-${id}">
                ${globalDoctors.map(d => `<option value="${d[0]}" ${d[0] == currentDid ? 'selected' : ''}>ID: ${d[0]}</option>`).join('')}
            </select>
        </td>
        <td><input type="text" id="edit-bc-${id}" value="${currentContact}" readonly></td>
        <td><input type="number" id="edit-ba-${id}" value="${currentAmount}"></td>
        <td>
            <button onclick="saveEdit(${id})" style="background: #28a745; color: white;">Save</button>
            <button onclick="loadBillTable()" style="background: #6c757d; color: white;">Cancel</button>
        </td>`;
};

const autoFillEditContact = (id) => {
    const selectedName = document.getElementById(`edit-bn-${id}`).value;
    const patient = globalPatients.find(p => p[1] === selectedName);
    document.getElementById(`edit-bc-${id}`).value = patient ? patient[2] : "";
};

const saveEdit = async (id) => {
    const payload = {
        action: 'update',
        id: id,
        p_name: document.getElementById(`edit-bn-${id}`).value,
        d_id: document.getElementById(`edit-bd-${id}`).value,
        contact: document.getElementById(`edit-bc-${id}`).value,
        amount: document.getElementById(`edit-ba-${id}`).value
    };
    await fetch('/api/billing', { method: 'POST', body: JSON.stringify(payload) });
    loadBillTable();
};

// --- SORTING AND OTHER CRUD ---
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
    loadBillTable(); e.target.reset();
};

const deleteBill = async (id) => {
    await fetch('/api/billing', { method: 'POST', body: JSON.stringify({action: 'delete', id}) });
    loadBillTable();
};

window.onload = () => { loadDataForDropdowns(); loadBillTable(); };