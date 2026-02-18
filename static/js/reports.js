//  frontend logic for reports summary page; queries /api/billing
const loadReport = async () => {
    const res = await fetch('/api/billing');
    const data = await res.json();
    const tbody = document.querySelector('#reportTable tbody');
    
    tbody.innerHTML = data.map(b => `
        <tr>
            <td>P-${b[0]}</td>
            <td>${b[1]}</td>
            <td>₹${b[4]}</td>
            <td>${b[3]}</td>
            <td>D-${b[2]}</td>
            <td class="no-print">
                <button class="btn-view" onclick="window.location='/report_view.html?bill_id=${b[0]}'" style="background:#007bff;color:white;margin-right:8px;">View</button>
                <button class="btn-del" onclick="deleteReportEntry(${b[0]})" style="background: #dc3545; color: white;">Delete</button>
            </td>
        </tr>`).join('');
};

const deleteReportEntry = async (id) => {
    // Direct delete without pop-up as requested
    await fetch('/api/billing', { 
        method: 'POST', 
        body: JSON.stringify({action: 'delete', id}) 
    });
    loadReport();
};

const downloadReportPDF = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("Clinic Management System - Final Financial Report", 14, 15);
    
    doc.autoTable({ 
        html: '#reportTable',
        startY: 20,
        columnStyles: { 5: { display: 'none' } } // Hide the Action column in PDF
    });

    doc.save('Clinic_Financial_Report.pdf');
};

const exportReportCSV = () => {
    let csv = "Patient ID,Name,Bill,Contact,Doctor ID\n";
    document.querySelectorAll("#reportTable tbody tr").forEach(tr => {
        const row = Array.from(tr.querySelectorAll("td")).slice(0, 5).map(td => td.innerText).join(",");
        csv += row + "\n";
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'Clinic_Final_Report.csv';
    a.click();
};

window.onload = loadReport;