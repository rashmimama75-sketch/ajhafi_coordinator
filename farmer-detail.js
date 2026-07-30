document.addEventListener('DOMContentLoaded', () => {
    // --- Mock Database for Farmer Profiles ---
    const farmersDetailDb = {
        'Ramesh Kumar': {
            name: 'Ramesh Kumar',
            phone: '9876543210',
            region: 'Kendujhar, Rairangpur, Odisha - 757043',
            farmerId: 'FRM-2025-00156',
            status: 'Active Farmer',
            statusClass: 'approved',
            joined: 'Joined on 12 Jan 2025',
            avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=120&q=80',
            dob: '15 Aug 1985',
            gender: 'Male',
            aadhaar: 'XXXX XXXX 5678',
            address: 'Village - Nuasahi, PO - Kendujhar, PS - Rairangpur, Odisha - 757043',
            village: 'Nuasahi',
            gp: 'Nuasahi',
            block: 'Rairangpur',
            district: 'Mayurbhanj',
            land: '2.5 Acres',
            farmingType: 'Goat Rearing',
            totalGoats: '32',
            insuredGoats: '28',
            activePolicies: '5',
            totalClaims: '2',
            activities: [
                { title: 'Policy purchased for 2 goats', desc: 'Policy ID: POL-2025-00234 • 22 Jul 2026', icon: 'fa-file-invoice', iconClass: 'bg-green-light text-green' },
                { title: 'Claim submitted for 1 goat', desc: 'Claim ID: CLM-2025-00087 • 20 Jul 2026', icon: 'fa-hand-holding-dollar', iconClass: 'bg-purple-light text-purple' },
                { title: 'Goat vaccination recorded', desc: '3 goats vaccinated • 18 Jul 2026', icon: 'fa-syringe', iconClass: 'bg-blue-light text-blue' }
            ]
        },
        'Sanjay Tudu': {
            name: 'Sanjay Tudu',
            phone: '8765432109',
            region: 'Bhanjpur, Baripada, Odisha - 757001',
            farmerId: 'FRM-2025-00204',
            status: 'Active Farmer',
            statusClass: 'approved',
            joined: 'Joined on 15 Jan 2025',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
            dob: '23 May 1990',
            gender: 'Male',
            aadhaar: 'XXXX XXXX 1092',
            address: 'Village - Bhanjpur, PO - Baripada, PS - Baripada, Odisha - 757001',
            village: 'Bhanjpur',
            gp: 'Bhanjpur',
            block: 'Baripada',
            district: 'Mayurbhanj',
            land: '3.0 Acres',
            farmingType: 'Goat Rearing',
            totalGoats: '24',
            insuredGoats: '20',
            activePolicies: '4',
            totalClaims: '1',
            activities: [
                { title: 'Ear Tag registration completed', desc: 'Tag IDs: GT-8812, GT-8813 • 19 Jul 2026', icon: 'fa-tag', iconClass: 'bg-green-light text-green' },
                { title: 'Goat vaccination recorded', desc: '5 goats vaccinated • 14 Jul 2026', icon: 'fa-syringe', iconClass: 'bg-blue-light text-blue' }
            ]
        }
    };

    // --- Dynamic Profile Detail Generator (Fallback) ---
    function generateFarmerProfile(name) {
        // Fallback names generator
        const avatars = [
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
            'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80',
            'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=120&q=80',
            'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&q=80',
            'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
            'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=120&q=80'
        ];

        // Pick avatar based on name string sum
        let hash = 0;
        for (let i = 0; i < name.length; hash += name.charCodeAt(i++));
        const avatarUrl = avatars[hash % avatars.length];
        
        // Generate random phone, region, etc.
        const phone = '912345' + (1000 + (hash % 9000));
        const regions = ['Rairangpur', 'Baripada', 'Karanjia', 'Udala', 'Jashipur'];
        const regionSelected = regions[hash % regions.length];
        
        const isActive = hash % 3 !== 0; // 2/3 active, 1/3 inactive
        
        return {
            name: name,
            phone: phone,
            region: `Village - Nuasahi, PO - Kendujhar, ${regionSelected}, Odisha`,
            farmerId: `FRM-2025-00${100 + (hash % 899)}`,
            status: isActive ? 'Active Farmer' : 'Inactive Farmer',
            statusClass: isActive ? 'approved' : 'rejected',
            joined: `Joined on ${10 + (hash % 18)} Jan 2025`,
            avatar: avatarUrl,
            dob: '12 Nov 1988',
            gender: hash % 5 === 0 ? 'Female' : 'Male',
            aadhaar: `XXXX XXXX ${3000 + (hash % 6999)}`,
            address: `Village - Nuasahi, PO - Kendujhar, PS - ${regionSelected}, Odisha - 757043`,
            village: 'Nuasahi',
            gp: 'Nuasahi',
            block: regionSelected,
            district: 'Mayurbhanj',
            land: `${1.5 + (hash % 4) * 0.5} Acres`,
            farmingType: 'Goat Rearing',
            totalGoats: `${10 + (hash % 30)}`,
            insuredGoats: `${8 + (hash % 25)}`,
            activePolicies: `${3 + (hash % 8)}`,
            totalClaims: `${hash % 4}`,
            activities: [
                { title: 'Goat health check completed', desc: `Verified by Suraksha Didi • ${15 + (hash % 10)} Jul 2026`, icon: 'fa-shield-heart', iconClass: 'bg-green-light text-green' },
                { title: 'Goat vaccination recorded', desc: `2 goats vaccinated • ${10 + (hash % 5)} Jul 2026`, icon: 'fa-syringe', iconClass: 'bg-blue-light text-blue' }
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
    const farmerName = urlParams.get('name') || 'Ramesh Kumar';

    // Get from DB or generate dynamically
    let farmer = farmersDetailDb[farmerName];
    if (!farmer) {
        farmer = generateFarmerProfile(farmerName);
    }

    // Populate DOM Elements
    const avatarEl = document.getElementById('lblAvatar');
    if (avatarEl) {
        avatarEl.src = farmer.avatar;
        avatarEl.alt = farmer.name;
    }

    const nameEl = document.getElementById('lblName');
    if (nameEl) nameEl.textContent = farmer.name;

    const statusEl = document.getElementById('lblStatus');
    if (statusEl) {
        statusEl.textContent = farmer.status;
        statusEl.className = `badge ${farmer.statusClass}`;
    }

    const phoneEl = document.getElementById('lblPhone');
    if (phoneEl) phoneEl.textContent = farmer.phone;

    const regionEl = document.getElementById('lblRegion');
    if (regionEl) regionEl.textContent = farmer.region;

    const idEl = document.getElementById('lblFarmerId');
    if (idEl) idEl.textContent = `Farmer ID: ${farmer.farmerId}`;

    const joinedEl = document.getElementById('lblJoined');
    if (joinedEl) joinedEl.textContent = farmer.joined;

    // Personal details card
    const dobEl = document.getElementById('lblDob');
    if (dobEl) dobEl.textContent = farmer.dob;

    const genderEl = document.getElementById('lblGender');
    if (genderEl) genderEl.textContent = farmer.gender;

    const aadhaarEl = document.getElementById('lblAadhaar');
    if (aadhaarEl) aadhaarEl.textContent = farmer.aadhaar;

    const whatsappEl = document.getElementById('lblWhatsapp');
    if (whatsappEl) whatsappEl.textContent = farmer.phone; // matches phone

    const addressEl = document.getElementById('lblAddress');
    if (addressEl) addressEl.textContent = farmer.address;

    const stateEl = document.getElementById('lblStateName');
    if (stateEl) stateEl.textContent = farmer.state || 'Odisha';

    const pinEl = document.getElementById('lblPinCode');
    if (pinEl) pinEl.textContent = farmer.pinCode || '757043';

    // Farm details card
    const villageEl = document.getElementById('lblVillage');
    if (villageEl) villageEl.textContent = farmer.village;

    const gpEl = document.getElementById('lblGp');
    if (gpEl) gpEl.textContent = farmer.gp;

    const blockEl = document.getElementById('lblBlock');
    if (blockEl) blockEl.textContent = farmer.block;

    const districtEl = document.getElementById('lblDistrict');
    if (districtEl) districtEl.textContent = farmer.district;

    const landEl = document.getElementById('lblLandHolding');
    if (landEl) landEl.textContent = farmer.land;

    const farmingEl = document.getElementById('lblFarmingType');
    if (farmingEl) farmingEl.textContent = farmer.farmingType;

    // Goat stats summary boxes
    const tGoatsEl = document.getElementById('lblTotalGoats');
    if (tGoatsEl) tGoatsEl.textContent = farmer.totalGoats;

    const iGoatsEl = document.getElementById('lblInsuredGoats');
    if (iGoatsEl) iGoatsEl.textContent = farmer.insuredGoats;

    const actPolEl = document.getElementById('lblActivePolicies');
    if (actPolEl) actPolEl.textContent = farmer.activePolicies;

    const tClaimsEl = document.getElementById('lblTotalClaims');
    if (tClaimsEl) tClaimsEl.textContent = farmer.totalClaims;

    // Populate Call and WhatsApp Action buttons
    const btnCall = document.getElementById('btnCallFarmer');
    if (btnCall) btnCall.href = `tel:${farmer.phone}`;

    const btnWhatsapp = document.getElementById('btnWhatsappFarmer');
    if (btnWhatsapp) btnWhatsapp.href = `https://wa.me/91${farmer.phone}`;

    // Populate Recent Activity list
    const activityContainer = document.querySelector('.recent-activity-list-container');
    if (activityContainer && farmer.activities) {
        activityContainer.innerHTML = '';
        farmer.activities.forEach(act => {
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
