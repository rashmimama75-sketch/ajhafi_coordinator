document.addEventListener('DOMContentLoaded', () => {
    // --- Mock Database for Suraksha Didis ---
    const didisDetailDb = {
        'Laxmi Murmu': {
            name: 'Laxmi Murmu',
            phone: '8765432109',
            region: 'Rairangpur, Odisha',
            didiId: 'SDI-2025-00128',
            status: 'Active',
            joined: 'Joined on 18 Jan 2025',
            avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
            dob: '12 Mar 1992',
            gender: 'Female',
            aadhaar: 'XXXX XXXX 1234',
            address: 'Kendujhar, Rairangpur, Odisha - 757043',
            village: 'Kendujhar',
            block: 'Rairangpur',
            district: 'Mayurbhanj',
            state: 'Odisha',
            pinCode: '757043',
            workingRegion: 'Rairangpur Block',
            workingVillages: '12 Villages',
            supervisor: 'Biren Kumar',
            reportingTo: 'Block Coordinator',
            assignedOn: '18 Jan 2025',
            policiesAdded: '128',
            policiesTrend: '<i class="fa-solid fa-arrow-up"></i> 15% vs last month',
            claimsAssisted: '24',
            claimsTrend: '<i class="fa-solid fa-arrow-up"></i> 8% vs last month',
            verificationsDone: '36',
            verificationsTrend: '<i class="fa-solid fa-arrow-up"></i> 12% vs last month',
            vaccinationsRecorded: '248',
            vaccinationsTrend: '<i class="fa-solid fa-arrow-up"></i> 18% vs last month',
            activities: [
                { title: 'Added 3 new policies', desc: '22 Jul 2025 • 10:30 AM', icon: 'fa-file-invoice', iconClass: 'bg-green-light text-green' },
                { title: 'Assisted in 2 claim requests', desc: '21 Jul 2025 • 03:15 PM', icon: 'fa-hand-holding-dollar', iconClass: 'bg-purple-light text-purple' },
                { title: 'Completed field verification', desc: '20 Jul 2025 • 11:45 AM', icon: 'fa-shield-halved', iconClass: 'bg-blue-light text-blue' }
            ]
        }
    };

    // --- Dynamic Profile Detail Generator (Fallback for other Didis) ---
    function generateDidiProfile(name) {
        const avatars = [
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
            'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=120&q=80',
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
            'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80'
        ];

        // Pick avatar based on name string sum
        let hash = 0;
        for (let i = 0; i < name.length; hash += name.charCodeAt(i++));
        const avatarUrl = avatars[hash % avatars.length];
        
        // Generate values
        const phone = '912345' + (1000 + (hash % 9000));
        const regions = ['Rairangpur', 'Baripada', 'Karanjia', 'Udala', 'Jashipur'];
        const regionSelected = regions[hash % regions.length];
        const isActive = hash % 5 !== 0; // most active
        
        return {
            name: name,
            phone: phone,
            region: `${regionSelected}, Odisha`,
            didiId: `SDI-2025-00${100 + (hash % 899)}`,
            status: isActive ? 'Active' : 'Inactive',
            joined: `Joined on ${10 + (hash % 18)} Jan 2025`,
            avatar: avatarUrl,
            dob: '24 Apr 1990',
            gender: 'Female',
            aadhaar: `XXXX XXXX ${3000 + (hash % 6999)}`,
            address: `Village - Nuasahi, PO - Kendujhar, ${regionSelected}, Odisha - 757043`,
            village: 'Nuasahi',
            block: regionSelected,
            district: 'Mayurbhanj',
            state: 'Odisha',
            pinCode: '757043',
            workingRegion: `${regionSelected} Block`,
            workingVillages: `${6 + (hash % 10)} Villages`,
            supervisor: 'Biren Kumar',
            reportingTo: 'Block Coordinator',
            assignedOn: `${10 + (hash % 18)} Jan 2025`,
            policiesAdded: `${80 + (hash % 100)}`,
            policiesTrend: '<i class="fa-solid fa-arrow-up"></i> 10% vs last month',
            claimsAssisted: `${15 + (hash % 20)}`,
            claimsTrend: '<i class="fa-solid fa-arrow-up"></i> 5% vs last month',
            verificationsDone: `${20 + (hash % 30)}`,
            verificationsTrend: '<i class="fa-solid fa-arrow-up"></i> 15% vs last month',
            vaccinationsRecorded: `${150 + (hash % 150)}`,
            vaccinationsTrend: '<i class="fa-solid fa-arrow-up"></i> 12% vs last month',
            activities: [
                { title: 'Added 2 new policies', desc: `18 Jul 2025 • 09:30 AM`, icon: 'fa-file-invoice', iconClass: 'bg-green-light text-green' },
                { title: 'Completed field verification', desc: `15 Jul 2025 • 02:45 PM`, icon: 'fa-shield-halved', iconClass: 'bg-blue-light text-blue' }
            ]
        };
    }

    // --- State Management ---
    const sidebar = document.getElementById('appSidebar');
    const sidebarToggleBtn = document.getElementById('sidebarToggle');
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationDropdown = document.getElementById('notificationDropdown');
    const profileBtn = document.getElementById('profileDropdownBtn');

    // --- Setup Sidebar & Notification Toggles ---
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

    // --- Load Profile details ---
    const urlParams = new URLSearchParams(window.location.search);
    const didiName = urlParams.get('name') || 'Laxmi Murmu';

    // Get from DB or generate dynamically
    let didi = didisDetailDb[didiName];
    if (!didi) {
        didi = generateDidiProfile(didiName);
    }

    // Populate DOM Elements
    const avatarEl = document.getElementById('lblAvatar');
    if (avatarEl) {
        avatarEl.src = didi.avatar;
        avatarEl.alt = didi.name;
    }

    const nameEl = document.getElementById('lblName');
    if (nameEl) nameEl.textContent = didi.name;

    const statusEl = document.getElementById('lblStatus');
    if (statusEl) {
        statusEl.textContent = didi.status;
        statusEl.className = `badge ${didi.status.toLowerCase() === 'active' ? 'approved' : 'rejected'}`;
    }

    const phoneEl = document.getElementById('lblPhone');
    if (phoneEl) phoneEl.textContent = didi.phone;

    const regionEl = document.getElementById('lblRegion');
    if (regionEl) regionEl.textContent = didi.region;

    const idEl = document.getElementById('lblDidiId');
    if (idEl) idEl.textContent = `Didi ID: ${didi.didiId}`;

    const joinedEl = document.getElementById('lblJoined');
    if (joinedEl) joinedEl.textContent = didi.joined;

    // Personal details card
    const dobEl = document.getElementById('lblDob');
    if (dobEl) dobEl.textContent = didi.dob;

    const genderEl = document.getElementById('lblGender');
    if (genderEl) genderEl.textContent = didi.gender;

    const aadhaarEl = document.getElementById('lblAadhaar');
    if (aadhaarEl) aadhaarEl.textContent = didi.aadhaar;

    const whatsappEl = document.getElementById('lblWhatsapp');
    if (whatsappEl) whatsappEl.textContent = didi.phone; // matches phone

    const addressEl = document.getElementById('lblAddress');
    if (addressEl) addressEl.textContent = didi.address;

    const villageEl = document.getElementById('lblVillage');
    if (villageEl) villageEl.textContent = didi.village || 'Nuasahi';

    const blockEl = document.getElementById('lblBlock');
    if (blockEl) blockEl.textContent = didi.block || 'Rairangpur';

    const districtEl = document.getElementById('lblDistrict');
    if (districtEl) districtEl.textContent = didi.district || 'Mayurbhanj';

    const stateEl = document.getElementById('lblStateName');
    if (stateEl) stateEl.textContent = didi.state || 'Odisha';

    const pinEl = document.getElementById('lblPinCode');
    if (pinEl) pinEl.textContent = didi.pinCode || '757043';

    // Work Info
    const wRegionEl = document.getElementById('lblWorkingRegion');
    if (wRegionEl) wRegionEl.textContent = didi.workingRegion;

    const wVillagesEl = document.getElementById('lblWorkingVillages');
    if (wVillagesEl) wVillagesEl.textContent = didi.workingVillages;

    const supervisorEl = document.getElementById('lblSupervisor');
    if (supervisorEl) supervisorEl.textContent = didi.supervisor;

    const reportingEl = document.getElementById('lblReportingTo');
    if (reportingEl) reportingEl.textContent = didi.reportingTo;

    const assignedEl = document.getElementById('lblAssignedOn');
    if (assignedEl) assignedEl.textContent = didi.assignedOn;

    // Performance Overview
    const pAddedEl = document.getElementById('lblPoliciesAdded');
    if (pAddedEl) pAddedEl.textContent = didi.policiesAdded;

    const pAddedTrendEl = document.getElementById('lblPoliciesTrend');
    if (pAddedTrendEl) pAddedTrendEl.innerHTML = didi.policiesTrend;

    const cAssistedEl = document.getElementById('lblClaimsAssisted');
    if (cAssistedEl) cAssistedEl.textContent = didi.claimsAssisted;

    const cAssistedTrendEl = document.getElementById('lblClaimsTrend');
    if (cAssistedTrendEl) cAssistedTrendEl.innerHTML = didi.claimsTrend;

    const vDoneEl = document.getElementById('lblVerificationsDone');
    if (vDoneEl) vDoneEl.textContent = didi.verificationsDone;

    const vDoneTrendEl = document.getElementById('lblVerificationsTrend');
    if (vDoneTrendEl) vDoneTrendEl.innerHTML = didi.verificationsTrend;

    const vacRecEl = document.getElementById('lblVaccinationsRecorded');
    if (vacRecEl) vacRecEl.textContent = didi.vaccinationsRecorded;

    const vacRecTrendEl = document.getElementById('lblVaccinationsTrend');
    if (vacRecTrendEl) vacRecTrendEl.innerHTML = didi.vaccinationsTrend;

    // Call and WhatsApp buttons
    const btnCall = document.getElementById('btnCallDidi');
    if (btnCall) btnCall.href = `tel:${didi.phone}`;

    const btnWhatsapp = document.getElementById('btnWhatsappDidi');
    if (btnWhatsapp) btnWhatsapp.href = `https://wa.me/91${didi.phone}`;

    // Populate Recent Activity list
    const activityContainer = document.getElementById('activityContainer');
    if (activityContainer && didi.activities) {
        activityContainer.innerHTML = '';
        didi.activities.forEach(act => {
            const actHtml = `
                <div class="detail-activity-item">
                    <div class="activity-left">
                        <div class="activity-icon ${act.iconClass}">
                            <i class="fa-solid ${act.icon}"></i>
                        </div>
                        <div class="activity-text">
                            <h5 class="activity-title-val">${act.title}</h5>
                            <p class="activity-subtext-val">${act.desc}</p>
                        </div>
                    </div>
                    <i class="fa-solid fa-chevron-right chevron-nav-icon"></i>
                </div>
            `;
            activityContainer.insertAdjacentHTML('beforeend', actHtml);
        });
    }
});
