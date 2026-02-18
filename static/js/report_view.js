// Project file: static/js/report_view.js — frontend logic to display a single billing report; reads query param `bill_id` and fetches data from APIs
const qs = (k) => new URLSearchParams(window.location.search).get(k);

const loadReportDetails = async () => {
    const billId = qs('bill_id');
    if (!billId) {
        document.getElementById('reportDetails').innerText = 'Missing bill_id in query string.';
        return;
    }

    try {
        // Fetch all data
        const [bRes, pRes, dRes] = await Promise.all([
            fetch('/api/billing'),
            fetch('/api/patients'),
            fetch('/api/doctors')
        ]);
        
        const bills = await bRes.json();
        const patients = await pRes.json();
        const doctors = await dRes.json();

        // Find bill record
        const bill = bills.find(x => String(x[0]) === String(billId));
        if (!bill) {
            document.getElementById('reportDetails').innerText = 'Billing record not found.';
            return;
        }

        // bill tuple: [id, p_name, d_id, contact, amount]
        const [billId_, p_name, d_id, contact, amount] = bill;

        // Find patient by name
        const patient = patients.find(p => p[1] === p_name) || null;

        // Find doctor by id
        const doctor = doctors.find(d => String(d[0]) === String(d_id)) || null;

        // Render all data
        const wrap = document.getElementById('reportDetails');
        wrap.innerHTML = '';

        // Billing Section
        const billSection = document.createElement('div');
        billSection.className = 'detail-section';
        billSection.innerHTML = `
            <h3>💳 Billing Information</h3>
            <div class="detail-row">
                <div class="detail-col">
                    <strong>Bill ID:</strong>
                    <div>${billId_}</div>
                </div>
                <div class="detail-col">
                    <strong>Amount:</strong>
                    <div>₹${amount}</div>
                </div>
                <div class="detail-col">
                    <strong>Contact:</strong>
                    <div>${contact}</div>
                </div>
            </div>
        `;
        wrap.appendChild(billSection);

        // Patient Section
        const patientSection = document.createElement('div');
        patientSection.className = 'detail-section';
        patientSection.innerHTML = '<h3>👤 Patient Details</h3>';
        if (patient) {
            // patient tuple: [id, name, contact, date, doc_id]
            const patDetailsRow = document.createElement('div');
            patDetailsRow.className = 'detail-row';
            patDetailsRow.innerHTML = `
                <div class="detail-col">
                    <strong>Patient ID:</strong>
                    <div>${patient[0]}</div>
                </div>
                <div class="detail-col">
                    <strong>Name:</strong>
                    <div>${patient[1]}</div>
                </div>
                <div class="detail-col">
                    <strong>Contact:</strong>
                    <div>${patient[2]}</div>
                </div>
                <div class="detail-col">
                    <strong>Appointment Date:</strong>
                    <div>${patient[3]}</div>
                </div>
            `;
            patientSection.appendChild(patDetailsRow);
        } else {
            const notFound = document.createElement('div');
            notFound.innerText = 'Patient details not found.';
            patientSection.appendChild(notFound);
        }
        wrap.appendChild(patientSection);

        // Doctor Section
        const docSection = document.createElement('div');
        docSection.className = 'detail-section';
        docSection.innerHTML = '<h3>👨‍⚕️ Doctor Details</h3>';
        if (doctor) {
            // doctor tuple: [id, name, spec, contact]
            const docDetailsRow = document.createElement('div');
            docDetailsRow.className = 'detail-row';
            docDetailsRow.innerHTML = `
                <div class="detail-col">
                    <strong>Doctor ID:</strong>
                    <div>${doctor[0]}</div>
                </div>
                <div class="detail-col">
                    <strong>Name:</strong>
                    <div>Dr. ${doctor[1]}</div>
                </div>
                <div class="detail-col">
                    <strong>Speciality:</strong>
                    <div>${doctor[2]}</div>
                </div>
                <div class="detail-col">
                    <strong>Contact:</strong>
                    <div>${doctor[3]}</div>
                </div>
            `;
            docSection.appendChild(docDetailsRow);
        } else {
            const notFound = document.createElement('div');
            notFound.innerText = 'Doctor details not found.';
            docSection.appendChild(notFound);
        }
        wrap.appendChild(docSection);

    } catch (error) {
        console.error('Error loading report details:', error);
        document.getElementById('reportDetails').innerText = 'Error loading report details. Please try again.';
    }
};

window.onload = loadReportDetails;
