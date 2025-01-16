window.onload = function() {
    // PDF download functionality
    document.getElementById('downloadPDF').addEventListener('click', function() {
        const element = document.querySelector('.clinical-summary');
        const opt = {
            margin: 1,
            filename: 'clinical-summary.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        // Generate the PDF
        html2pdf().set(opt).from(element).save();
    });

    // Rest of your existing code...
    ZOHO.embeddedApp.on("PageLoad", function (data) {
        ZOHO.CRM.API.getRecord({
            Entity: data.Entity,
            RecordID: data.EntityId[0]
        })
        .then(function(response){
            displayClinicalSummary(response.data[0]);
        });
    });

    // Your existing functions...
    
    ZOHO.embeddedApp.init();
};

function displayClinicalSummary(data) {
    const severityClass = getSeverityClass(data.Severity);
    const summaryHTML = `
        <h1>Clinical Visit Summary</h1>
        <div class="patient-info">
            <h2>Patient Information</h2>
            <p><strong>Patient Name:</strong> ${data.Patient.name}</p>
            <p><strong>Visit ID:</strong> ${data.Name}</p>
            <p><strong>Visit Date:</strong> ${formatDate(data.Visit_Date)}</p>
        </div>

        <div class="visit-details">
            <h2>Visit Details</h2>
            <p><strong>Doctor:</strong> ${data.Doctor.name}</p>
            <p><strong>Department:</strong> ${data.Departments.name}</p>
            <p><strong>Check In:</strong> ${formatDateTime(data.Check_In)}</p>
            <p><strong>Check Out:</strong> ${formatDateTime(data.Check_Out)}</p>
        </div>

        <div class="clinical-data">
            <h2>Clinical Information</h2>
            <p><strong>Diagnosis:</strong> ${formatList(data.Diagnosis)}</p>
            <p><strong>Severity:</strong> <span class="severity-indicator ${severityClass}">${data.Severity}/5</span></p>
            <p><strong>Risk Factors:</strong> ${formatList(data.Risk_Factors)}</p>
            <p><strong>Doctor's Notes:</strong> ${data.Doctor_s_Notes || 'None'}</p>
        </div>

        <div class="prescriptions">
            <h2>Prescriptions</h2>
            <table>
                <thead>
                    <tr>
                        <th>Drug</th>
                        <th>Dosage</th>
                        <th>Frequency</th>
                        <th>Duration</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.Subform_1.map(prescription => `
                        <tr>
                            <td>${prescription.Drug}</td>
                            <td>${prescription.Dosage}</td>
                            <td>${prescription.Frequency}</td>
                            <td>${prescription.Duration} days</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="follow-up">
            <h2>Follow-up</h2>
            <p><strong>Next Appointment:</strong> ${formatDateTime(data.Follow_Up_Date)}</p>
        </div>
    `;

    document.querySelector('.clinical-summary').innerHTML = summaryHTML;
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatDateTime(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatList(array) {
    return array.join(', ') || 'None';
}

function getSeverityClass(severity) {
    const level = parseInt(severity);
    if (level <= 2) return 'severity-low';
    if (level <= 3) return 'severity-medium';
    return 'severity-high';
}
