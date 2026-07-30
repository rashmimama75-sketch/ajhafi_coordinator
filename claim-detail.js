document.addEventListener('DOMContentLoaded', () => {
    // --- Mock Claims Database ---
    const claimsData = [
        {
            id: 'CLM1001',
            farmer: 'Ramesh Kumar',
            goatId: 'G12345',
            earTag: 'BG-2456',
            breed: 'Black Bengal',
            gender: 'Female',
            age: '2 Years',
            sumInsured: '₹ 20,000',
            policyNumber: 'POL/2024/001234',
            policyValid: '16 Jul 2027',
            deathDate: '22 Jul 2026',
            raisedDate: '23 Jul 2026, 09:45 AM',
            status: 'Pending',
            statusClass: 'pending',
            amount: '₹ 5,000',
            cause: 'Disease',
            location: 'Jamdihi, Baripada, Mayurbhanj, Odisha',
            avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=80&q=80'
        },
        {
            id: 'CLM1002',
            farmer: 'Sita Devi',
            goatId: 'G23450',
            earTag: 'BG-8812',
            breed: 'Sirohi',
            gender: 'Female',
            age: '3 Years',
            sumInsured: '₹ 25,000',
            policyNumber: 'POL/2024/009845',
            policyValid: '20 Jul 2027',
            deathDate: '21 Jul 2026',
            raisedDate: '21 Jul 2026, 11:20 AM',
            status: 'Under Review',
            statusClass: 'under-review',
            amount: '₹ 5,000',
            cause: 'Accident',
            location: 'Karanjia, Mayurbhanj, Odisha',
            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&q=80'
        },
        {
            id: 'CLM0999',
            farmer: 'Mohan Singh',
            goatId: 'G12310',
            earTag: 'BG-1092',
            breed: 'Beetal',
            gender: 'Male',
            age: '1.5 Years',
            sumInsured: '₹ 18,000',
            policyNumber: 'POL/2023/007742',
            policyValid: '18 Jun 2026',
            deathDate: '20 Jul 2026',
            raisedDate: '20 Jul 2026, 04:10 PM',
            status: 'Approved',
            statusClass: 'approved',
            amount: '₹ 5,000',
            cause: 'Disease',
            location: 'Bhanjpur, Baripada, Odisha',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80'
        },
        {
            id: 'CLM0997',
            farmer: 'Laxmi Nayak',
            goatId: 'G12250',
            earTag: 'BG-4321',
            breed: 'Jamunapari',
            gender: 'Female',
            age: '4 Years',
            sumInsured: '₹ 30,000',
            policyNumber: 'POL/2024/005510',
            policyValid: '02 Feb 2027',
            deathDate: '19 Jul 2026',
            raisedDate: '19 Jul 2026, 02:30 PM',
            status: 'Rejected',
            statusClass: 'rejected',
            amount: '₹ 5,000',
            cause: 'Bloating',
            location: 'Udala, Mayurbhanj, Odisha',
            avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=80&q=80'
        },
        {
            id: 'CLM1003',
            farmer: 'Babu Lal',
            goatId: 'G23330',
            earTag: 'BG-2311',
            breed: 'Black Bengal',
            gender: 'Male',
            age: '2.5 Years',
            sumInsured: '₹ 22,000',
            policyNumber: 'POL/2024/008892',
            policyValid: '10 Aug 2027',
            deathDate: '23 Jul 2026',
            raisedDate: '23 Jul 2026, 08:15 AM',
            status: 'Under Review',
            statusClass: 'under-review',
            amount: '₹ 5,000',
            cause: 'Pneumonia',
            location: 'Jashipur, Mayurbhanj, Odisha',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80'
        },
        {
            id: 'CLM1004',
            farmer: 'Purnima Behera',
            goatId: 'G12401',
            earTag: 'BG-6789',
            breed: 'Sirohi',
            gender: 'Female',
            age: '1 Year',
            sumInsured: '₹ 15,000',
            policyNumber: 'POL/2025/000214',
            policyValid: '15 Jan 2028',
            deathDate: '23 Jul 2026',
            raisedDate: '23 Jul 2026, 10:50 AM',
            status: 'Pending',
            statusClass: 'pending',
            amount: '₹ 5,000',
            cause: 'Disease',
            location: 'Rairangpur, Mayurbhanj, Odisha',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=80&q=80'
        }
    ];

    // --- DOM Elements ---
    const sidebar = document.getElementById('appSidebar');
    const sidebarToggleBtn = document.getElementById('sidebarToggle');
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationDropdown = document.getElementById('notificationDropdown');
    const profileBtn = document.getElementById('profileDropdownBtn');

    // UI Fields
    const lblClaimId = document.getElementById('lblClaimId');
    const lblClaimStatus = document.getElementById('lblClaimStatus');
    const lblReportedDate = document.getElementById('lblReportedDate');
    const lblReportedBy = document.getElementById('lblReportedBy');

    const lblGoatId = document.getElementById('lblGoatId');
    const lblEarTag = document.getElementById('lblEarTag');
    const lblBreed = document.getElementById('lblBreed');
    const lblGender = document.getElementById('lblGender');
    const lblAge = document.getElementById('lblAge');
    const lblSumInsured = document.getElementById('lblSumInsured');
    const lblPolicyNumber = document.getElementById('lblPolicyNumber');
    const lblPolicyValid = document.getElementById('lblPolicyValid');

    const lblDateOfDeath = document.getElementById('lblDateOfDeath');
    const lblCauseOfDeath = document.getElementById('lblCauseOfDeath');
    const lblLocation = document.getElementById('lblLocation');
    const lblDeathReportedBy = document.getElementById('lblDeathReportedBy');

    // Stepper nodes
    const stepperProgressLine = document.getElementById('stepperProgressLine');
    const step3 = document.getElementById('step3');
    const step3Status = document.getElementById('step3Status');
    const step4 = document.getElementById('step4');
    const step4Status = document.getElementById('step4Status');
    const step5 = document.getElementById('step5');
    const step5Status = document.getElementById('step5Status');

    // Get claim ID from URL query params
    const urlParams = new URLSearchParams(window.location.search);
    const claimIdParam = urlParams.get('id');

    // Find claim
    let claim = claimsData.find(c => c.id === claimIdParam);

    // Fallback/Dynamic generation if ID is not found or is custom
    if (!claim && claimIdParam) {
        // Simple hash calculation to generate stable random values
        let hash = 0;
        for (let i = 0; i < claimIdParam.length; hash += claimIdParam.charCodeAt(i++));

        const farmers = ['Ramesh Kumar', 'Sita Devi', 'Mohan Singh', 'Laxmi Nayak', 'Babu Lal', 'Purnima Behera'];
        const breeds = ['Black Bengal', 'Sirohi', 'Beetal', 'Jamunapari'];
        const causes = ['Disease', 'Accident', 'Bloating', 'Pneumonia'];
        const locations = ['Jamdihi, Baripada, Mayurbhanj, Odisha', 'Karanjia, Mayurbhanj, Odisha', 'Udala, Mayurbhanj, Odisha', 'Rairangpur, Mayurbhanj, Odisha'];
        const statuses = ['Pending', 'Under Review', 'Approved', 'Rejected'];

        const selectedStatus = statuses[hash % statuses.length];
        const statusClass = selectedStatus.toLowerCase().replace(' ', '-');

        claim = {
            id: claimIdParam,
            farmer: farmers[hash % farmers.length],
            goatId: `G12${300 + (hash % 600)}`,
            earTag: `BG-${1000 + (hash % 8999)}`,
            breed: breeds[hash % breeds.length],
            gender: hash % 2 === 0 ? 'Female' : 'Male',
            age: `${1 + (hash % 3)} Years`,
            sumInsured: `₹ ${15000 + (hash % 3 * 5000)}`,
            policyNumber: `POL/2024/00${1000 + (hash % 8999)}`,
            policyValid: `${10 + (hash % 15)} Jul 2027`,
            deathDate: `${15 + (hash % 5)} Jul 2026`,
            raisedDate: `${16 + (hash % 5)} Jul 2026, 10:00 AM`,
            status: selectedStatus,
            statusClass: statusClass,
            amount: '₹ 5,000',
            cause: causes[hash % causes.length],
            location: locations[hash % locations.length],
            avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=80&q=80'
        };
    }

    // Default fallback if no param at all
    if (!claim) {
        claim = claimsData[0];
    }

    // --- Fill UI Fields ---
    lblClaimId.textContent = claim.id;
    lblClaimStatus.textContent = claim.status;
    lblClaimStatus.className = `badge ${claim.statusClass}`;

    lblReportedDate.textContent = claim.raisedDate.split(',')[0];
    lblReportedBy.textContent = claim.farmer;

    lblGoatId.textContent = claim.goatId;
    lblEarTag.textContent = claim.earTag;
    lblBreed.textContent = claim.breed;
    lblGender.textContent = claim.gender;
    lblAge.textContent = claim.age;
    lblSumInsured.textContent = claim.sumInsured;
    lblPolicyNumber.textContent = claim.policyNumber;
    lblPolicyValid.textContent = claim.policyValid;

    lblDateOfDeath.textContent = claim.deathDate;
    lblCauseOfDeath.textContent = claim.cause;
    lblLocation.textContent = claim.location;
    lblDeathReportedBy.textContent = claim.farmer;

    // --- Populate Vaccination History ---
    const vaccinationTableBody = document.getElementById('vaccinationTableBody');
    if (vaccinationTableBody) {
        const vaccinations = [
            { name: 'PPR Vaccine', date: '12 Jan 2026', by: 'Sita Devi (Didi)', status: 'Completed', statusClass: 'approved' },
            { name: 'Goat Pox Vaccine', date: '05 Feb 2026', by: 'Sita Devi (Didi)', status: 'Completed', statusClass: 'approved' },
            { name: 'FMD Vaccine', date: '20 Mar 2026', by: 'Dr. B. K. Mohanty (Vet)', status: 'Completed', statusClass: 'approved' },
            { name: 'Enterotoxaemia (ET) Vaccine', date: '15 May 2026', by: 'Gita Rani (Didi)', status: 'Completed', statusClass: 'approved' }
        ];

        vaccinationTableBody.innerHTML = '';
        vaccinations.forEach(vac => {
            const row = `
                <tr>
                    <td style="padding: 12px 16px; font-size: 13px; font-weight: 600; color: var(--text-main); border-bottom: 1px solid var(--border-color);">${vac.name}</td>
                    <td style="padding: 12px 16px; font-size: 13px; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">${vac.date}</td>
                    <td style="padding: 12px 16px; font-size: 13px; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">${vac.by}</td>
                    <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color);"><span class="badge ${vac.statusClass}" style="padding: 4px 8px; font-size: 11px;">${vac.status}</span></td>
                </tr>
            `;
            vaccinationTableBody.insertAdjacentHTML('beforeend', row);
        });
    }

    // Set stepper states
    if (claim.status === 'Pending') {
        stepperProgressLine.style.width = '37.5%'; // Line reaches halfway to Step 3

        step3.classList.add('active');
        step3Status.textContent = 'In Progress';
        step3Status.style.color = 'var(--brand-primary)';

        step4.className = 'claim-stepper-step pending';
        step4Status.textContent = 'Pending';

        step5.className = 'claim-stepper-step pending';
        step5Status.textContent = 'Pending';
    }
    else if (claim.status === 'Under Review') {
        stepperProgressLine.style.width = '62.5%'; // Line reaches step 3 and goes halfway to Step 4

        step3.className = 'claim-stepper-step completed';
        step3.querySelector('.claim-step-circle').innerHTML = '<i class="fa-solid fa-check"></i>';

        step4.className = 'claim-stepper-step active';
        step4Status.textContent = 'In Progress';
        step4Status.style.color = 'var(--brand-primary)';

        step5.className = 'claim-stepper-step pending';
        step5Status.textContent = 'Pending';
    }
    else if (claim.status === 'Approved') {
        stepperProgressLine.style.width = '100%'; // Full line

        step3.className = 'claim-stepper-step completed';
        step3.querySelector('.claim-step-circle').innerHTML = '<i class="fa-solid fa-check"></i>';

        step4.className = 'claim-stepper-step completed';
        step4.querySelector('.claim-step-circle').innerHTML = '<i class="fa-solid fa-check"></i>';
        step4Status.textContent = 'Approved';

        step5.className = 'claim-stepper-step completed';
        step5.querySelector('.claim-step-circle').innerHTML = '<i class="fa-solid fa-check"></i>';
        step5Status.textContent = 'Paid';
    }
    else if (claim.status === 'Rejected') {
        stepperProgressLine.style.width = '75%'; // Reaches step 4 but stops

        step3.className = 'claim-stepper-step completed';
        step3.querySelector('.claim-step-circle').innerHTML = '<i class="fa-solid fa-check"></i>';

        step4.className = 'claim-stepper-step active';
        step4.querySelector('.claim-step-circle').style.borderColor = 'var(--color-rejected)';
        step4.querySelector('.claim-step-circle').style.color = 'var(--color-rejected)';
        step4Status.textContent = 'Rejected';
        step4Status.style.color = 'var(--color-rejected)';

        step5.className = 'claim-stepper-step pending';
        step5Status.textContent = 'Cancelled';
    }

    // --- Buttons Actions ---
    const btnDownloadPDF = document.getElementById('btnDownloadPDF');
    if (btnDownloadPDF) {
        btnDownloadPDF.addEventListener('click', () => {
            alert(`Generating and downloading PDF receipt for claim: ${claim.id}`);
        });
    }

    const btnClaimApprove = document.getElementById('btnClaimApprove');
    if (btnClaimApprove) {
        btnClaimApprove.addEventListener('click', () => {
            alert(`Claim ${claim.id} has been Approved successfully.`);
        });
    }

    const btnClaimReject = document.getElementById('btnClaimReject');
    if (btnClaimReject) {
        btnClaimReject.addEventListener('click', () => {
            alert(`Claim ${claim.id} has been Rejected.`);
        });
    }

    // --- Sidebar & Notification Toggle ---
    if (sidebarToggleBtn) {
        sidebarToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('active');
        });
    }

    document.addEventListener('click', (e) => {
        if (sidebar && !sidebar.contains(e.target) && (!sidebarToggleBtn || e.target !== sidebarToggleBtn)) {
            sidebar.classList.remove('active');
        }
        if (notificationDropdown && !notificationDropdown.contains(e.target) && notificationBtn && e.target !== notificationBtn && !notificationBtn.contains(e.target)) {
            notificationDropdown.classList.remove('active');
        }
    });

    if (notificationBtn) {
        notificationBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            notificationDropdown.classList.toggle('active');
        });
    }

    if (profileBtn) {
        profileBtn.addEventListener('click', () => {
            alert("Profile settings & Coordinator options coming soon!");
        });
    }
});
