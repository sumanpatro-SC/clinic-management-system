const loadReport = async () => {
    const res = await fetch('/api/billing');
    const data = await res.json();
    document.querySelector('tbody').innerHTML = data.map(b => `
        <tr>
            <td>P-${b[0]}</td>
            <td>${b[1]}</td>
            <td>₹${b[4]}</td>
            <td>${b[3]}</td>
            <td>D-${b[2]}</td>
            <td><button class="btn-del" onclick="deleteEntry(${b[0]})">Delete</button></td>
        </tr>`).join('');
};

const deleteEntry = async (id) => {
    if(confirm("Remove from report?")) {
        await fetch('/api/billing', { method: 'POST', body: JSON.stringify({action: 'delete', id}) });
        loadReport();
    }
};

const exportCSV = () => {
    let csv = "Patient ID,Name,Bill,Contact,Doctor ID\n";
    document.querySelectorAll("tbody tr").forEach(tr => {
        const row = Array.from(tr.querySelectorAll("td")).slice(0,5).map(td => td.innerText).join(",");
        csv += row + "\n";
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'Clinic_Report.csv';
    a.click();
};

window.onload = loadReport;