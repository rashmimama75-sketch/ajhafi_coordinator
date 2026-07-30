document.addEventListener('DOMContentLoaded', () => {
    // --- Sidebar navigation toggle ---
    const sidebar = document.getElementById('appSidebar');
    const sidebarToggleBtn = document.getElementById('sidebarToggle');
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationDropdown = document.getElementById('notificationDropdown');

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

    // --- Retrieve URL parameters ---
    const urlParams = new URLSearchParams(window.location.search);
    const goatId = urlParams.get('id') || 'SS-786';

    // --- Generate Stable Mock Data based on Goat ID ---
    function getGoatDetail(id) {
        // Calculate hash from ID string
        let hash = 0;
        for (let i = 0; i < id.length; hash += id.charCodeAt(i++));

        const breeds = ['Black Bengal', 'Jamunapuri', 'Beetal', 'Sirohi', 'Barbari'];
        const breed = breeds[hash % breeds.length];

        const earTag = `ET-${2000 + (hash % 800)}`;
        const gender = (hash % 2 === 0) ? 'Female' : 'Male';
        const age = `${1 + (hash % 4)} yr ${1 + (hash % 11)} mo`;
        const weight = `${20 + (hash % 60)} kg`;
        
        // Dates
        const policyStart = `2026-07-${10 + (hash % 18)}`;
        const policyEnd = `2027-07-${10 + (hash % 18)}`;
        const validTill = policyEnd;
        const dob = `2020-02-${10 + (hash % 18)}`;
        
        const policyNo = `POL-202607${10 + (hash % 18)}-00${10 + (hash % 89)}`;
        const premium = 300 + (hash % 3) * 50;
        const status = (hash % 4 === 0) ? 'Inactive' : 'Active';
        const insuredBy = (hash % 2 === 0) ? 'Rashmi' : 'Sunita Devi';

        const vaccinations = [
            { name: 'PPR', status: 'Done', date: `Given on 29 Jul 2026` },
            { name: 'ET-TT', status: (hash % 2 === 0) ? 'Pending' : 'Done', date: (hash % 2 === 0) ? `Due on 29 Jul 2026` : `Given on 28 Jul 2026` },
            { name: 'FMD', status: (hash % 3 === 0) ? 'Done' : 'Pending', date: (hash % 3 === 0) ? `Given on 25 Jul 2026` : `Due on 29 Jul 2026` },
            { name: 'Goat Pox', status: 'Pending', date: `Due on 29 Jul 2026` }
        ];

        return {
            id,
            breed,
            earTag,
            gender,
            age,
            weight,
            policyStart,
            policyEnd,
            validTill,
            dob,
            policyNo,
            premium,
            status,
            insuredBy,
            vaccinations
        };
    }

    const goat = getGoatDetail(goatId);

    // --- Populate DOM Elements ---
    document.getElementById('lblGoatHeaderId').textContent = goat.id;
    
    const statusPill = document.getElementById('lblGoatStatus');
    statusPill.textContent = `• ${goat.status}`;
    if (goat.status === 'Active') {
        statusPill.style.backgroundColor = 'var(--brand-primary)';
    } else {
        statusPill.style.backgroundColor = '#ef4444';
    }

    document.getElementById('lblPolicyValidTill').textContent = goat.validTill;
    document.getElementById('lblPolicyNo').textContent = goat.policyNo;
    document.getElementById('lblEarTag').textContent = goat.earTag;
    document.getElementById('lblGender').textContent = goat.gender;
    document.getElementById('lblAge').textContent = goat.age;
    document.getElementById('lblWeight').textContent = goat.weight;
    document.getElementById('lblBreed').textContent = goat.breed;
    document.getElementById('lblDob').textContent = goat.dob;
    
    document.getElementById('lblPolicyStart').textContent = goat.policyStart;
    document.getElementById('lblPolicyEnd').textContent = goat.policyEnd;
    document.getElementById('lblPremium').textContent = `₹ ${goat.premium}`;
    document.getElementById('lblInsuredBy').textContent = goat.insuredBy;

    // --- Render Vaccination List ---
    const vaccinationList = document.getElementById('vaccinationList');
    vaccinationList.innerHTML = '';
    
    let completedCount = 0;
    
    goat.vaccinations.forEach(vac => {
        const isDone = vac.status === 'Done';
        if (isDone) completedCount++;

        const iconBg = isDone ? 'background-color: #ecfdf5; color: #059669;' : 'background-color: #fffbeb; color: #d97706;';
        const icon = isDone ? 'fa-solid fa-check' : 'fa-solid fa-syringe';
        const pillBg = isDone ? 'background-color: #ecfdf5; color: #059669;' : 'background-color: #fffbeb; color: #d97706;';

        const itemHtml = `
            <div class="vaccination-item">
                <div class="vaccination-item-left">
                    <div class="vaccination-item-icon-box" style="${iconBg}">
                        <i class="${icon}"></i>
                    </div>
                    <div class="vaccination-item-title-info">
                        <h4 class="vaccination-item-title">${vac.name}</h4>
                        <span class="vaccination-item-desc">${vac.date}</span>
                    </div>
                </div>
                <span class="status-pill" style="${pillBg} padding: 4px 10px; border-radius: var(--radius-full); font-size: 11px; font-weight: 700;">${vac.status}</span>
            </div>
        `;
        vaccinationList.insertAdjacentHTML('beforeend', itemHtml);
    });

    document.getElementById('lblVaccinationSummary').textContent = `Completed: ${completedCount} / ${goat.vaccinations.length}`;

    // --- Goat Images Toggle ---
    const btnToggleImages = document.getElementById('btnToggleImages');
    const goatImagesGrid = document.getElementById('goatImagesGrid');

    if (btnToggleImages && goatImagesGrid) {
        btnToggleImages.addEventListener('click', () => {
            const isHidden = goatImagesGrid.style.display === 'none';
            if (isHidden) {
                goatImagesGrid.style.display = 'grid';
                btnToggleImages.textContent = 'Show Less';
            } else {
                goatImagesGrid.style.display = 'none';
                btnToggleImages.textContent = 'Show More';
            }
        });
    }

    // --- View Policy Details Click Handler ---
    const btnViewPolicyDetails = document.getElementById('btnViewPolicyDetails');
    if (btnViewPolicyDetails) {
        btnViewPolicyDetails.addEventListener('click', () => {
            alert(`Opening Policy Agreement Document for Policy No: ${goat.policyNo}`);
        });
    }
});
