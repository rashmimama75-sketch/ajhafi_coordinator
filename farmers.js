document.addEventListener('DOMContentLoaded', () => {
    // --- Mock Farmers Dataset ---
    const farmersData = [
        { name: 'Ramesh Kumar', phone: '9876543210', region: 'Rairangpur', status: 'Active', joined: '12 Jan 2025', avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=100&q=80' },
        { name: 'Sanjay Tudu', phone: '8765432109', region: 'Baripada', status: 'Active', joined: '15 Jan 2025', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80' },
        { name: 'Mahesh Murmu', phone: '7654321098', region: 'Karanjia', status: 'Active', joined: '18 Jan 2025', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80' },
        { name: 'Prakash Nayak', phone: '6543210987', region: 'Udala', status: 'Active', joined: '20 Jan 2025', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80' },
        { name: 'Bikash Hembram', phone: '5432109876', region: 'Jashipur', status: 'Inactive', joined: '22 Jan 2025', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=100&q=80' },
        { name: 'Gopal Singh', phone: '4321098765', region: 'Rairangpur', status: 'Active', joined: '25 Jan 2025', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=100&q=80' },
        { name: 'Lalit Tudu', phone: '3210987654', region: 'Baripada', status: 'Inactive', joined: '28 Jan 2025', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&q=80' },
        { name: 'Dinabandhu Patra', phone: '2109876543', region: 'Karanjia', status: 'Active', joined: '30 Jan 2025', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80' },
        { name: 'Siba Murmu', phone: '1098765432', region: 'Udala', status: 'Active', joined: '02 Feb 2025', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80' },
        { name: 'Bhola Nayak', phone: '9876501234', region: 'Jashipur', status: 'Inactive', joined: '04 Feb 2025', avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=100&q=80' },
        { name: 'Rajesh Baskey', phone: '9123456780', region: 'Rairangpur', status: 'Active', joined: '06 Feb 2025', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80' },
        { name: 'Manoj Kisku', phone: '9123456781', region: 'Baripada', status: 'Active', joined: '08 Feb 2025', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=100&q=80' },
        { name: 'Suresh Chandra', phone: '9123456782', region: 'Karanjia', status: 'Active', joined: '10 Feb 2025', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=100&q=80' },
        { name: 'Karan Soren', phone: '9123456783', region: 'Udala', status: 'Inactive', joined: '12 Feb 2025', avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=100&q=80' },
        { name: 'Bablu Hembram', phone: '9123456784', region: 'Jashipur', status: 'Active', joined: '14 Feb 2025', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80' },
        { name: 'Arjun Giri', phone: '9123456785', region: 'Rairangpur', status: 'Active', joined: '15 Feb 2025', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80' },
        { name: 'Debendra Mohanta', phone: '9123456786', region: 'Baripada', status: 'Inactive', joined: '18 Feb 2025', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80' },
        { name: 'Laxman Marandi', phone: '9123456787', region: 'Karanjia', status: 'Active', joined: '20 Feb 2025', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&q=80' },
        { name: 'Sunil Pingua', phone: '9123456788', region: 'Udala', status: 'Active', joined: '22 Feb 2025', avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=100&q=80' },
        { name: 'Kartik Deogam', phone: '9123456789', region: 'Jashipur', status: 'Active', joined: '24 Feb 2025', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=100&q=80' }
    ];

    // --- State Management ---
    let currentPage = 1;
    const itemsPerPage = 8;
    let filteredFarmers = [...farmersData];

    // --- DOM Elements ---
    const sidebar = document.getElementById('appSidebar');
    const sidebarToggleBtn = document.getElementById('sidebarToggle');
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationDropdown = document.getElementById('notificationDropdown');
    const profileBtn = document.getElementById('profileDropdownBtn');
    const mainSearchInput = document.getElementById('mainSearchInput');

    const farmerSearchInput = document.getElementById('farmerSearchInput');
    const btnFarmerFilter = document.getElementById('btnFarmerFilter');
    const filterDropdown = document.getElementById('filterDropdown');
    const filterStatus = document.getElementById('filterStatus');
    const filterRegion = document.getElementById('filterRegion');
    const btnFilterReset = document.getElementById('btnFilterReset');
    const btnFilterApply = document.getElementById('btnFilterApply');

    const farmersTableBody = document.getElementById('farmersTableBody');
    const paginationSummary = document.getElementById('paginationSummary');
    const paginationControls = document.getElementById('paginationControls');

    // --- Setup Sidebar & Dropdowns ---
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
        if (filterDropdown && !filterDropdown.contains(e.target) && e.target !== btnFarmerFilter && !btnFarmerFilter.contains(e.target)) {
            filterDropdown.classList.remove('active');
        }

        // Close row actions dropdowns if clicked outside
        const activeRowDropdowns = document.querySelectorAll('.row-actions-dropdown.active');
        activeRowDropdowns.forEach(dropdown => {
            const btn = dropdown.previousElementSibling;
            if (e.target !== btn && !btn.contains(e.target) && e.target !== dropdown && !dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
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

    // Toggle Filter Menu
    if (btnFarmerFilter) {
        btnFarmerFilter.addEventListener('click', (e) => {
            e.stopPropagation();
            filterDropdown.classList.toggle('active');
        });
    }

    // --- Render Farmers Table & Pagination ---
    function renderFarmersTable() {
        if (!farmersTableBody) return;
        farmersTableBody.innerHTML = '';

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, filteredFarmers.length);
        const pageItems = filteredFarmers.slice(startIndex, endIndex);

        if (pageItems.length === 0) {
            farmersTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 30px; color: var(--text-muted);">No farmers found matching your criteria.</td></tr>`;
            if (paginationSummary) paginationSummary.textContent = 'Showing 0 to 0 of 0';
            renderPagination(0);
            return;
        }

        pageItems.forEach(farmer => {
            const statusClass = farmer.status.toLowerCase() === 'active' ? 'approved' : 'rejected';
            const rowHtml = `
                <tr>
                    <td>
                        <div class="farmer-profile-cell">
                            <img src="${farmer.avatar}" alt="${farmer.name}" class="table-farmer-img" onerror="this.src='https://via.placeholder.com/38/22c55e/ffffff?text=${farmer.name.charAt(0)}'">
                            <div class="farmer-info">
                                <span class="farmer-name-val">${farmer.name}</span>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div class="phone-link-wrapper">
                            <a href="tel:${farmer.phone}" class="contact-action-link phone" title="Call ${farmer.name}">
                                <i class="fa-solid fa-phone"></i>
                                <span>${farmer.phone}</span>
                            </a>
                        </div>
                    </td>
                    <td>${farmer.region}</td>
                    <td><span class="badge ${statusClass}">${farmer.status}</span></td>
                    <td>${farmer.joined}</td>
                    <td style="text-align: center;">
                        <button class="btn-action-detail btn-view-farmer-details" data-name="${farmer.name}" title="View Details">
                            <span>View</span>
                        </button>
                    </td>
                </tr>
            `;
            farmersTableBody.insertAdjacentHTML('beforeend', rowHtml);
        });

        // Setup view details actions
        const viewDetailsBtns = farmersTableBody.querySelectorAll('.btn-view-farmer-details');
        viewDetailsBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const farmerName = btn.getAttribute('data-name');
                window.location.href = `farmer-detail.html?name=${encodeURIComponent(farmerName)}`;
            });
        });

        // Update summary text
        const totalEntries = 1248; // Replicating database totals proportionally
        const displayStart = startIndex + 1;
        const displayEnd = startIndex + pageItems.length;
        const proportionalTotal = Math.round((filteredFarmers.length / farmersData.length) * totalEntries);
        
        if (paginationSummary) {
            paginationSummary.textContent = `Showing ${displayStart} to ${displayEnd} of ${filteredFarmers.length === farmersData.length ? totalEntries.toLocaleString() : filteredFarmers.length}`;
        }

        const totalPages = Math.ceil(filteredFarmers.length / itemsPerPage);
        renderPagination(totalPages);
    }

    function renderPagination(totalPages) {
        if (!paginationControls) return;
        paginationControls.innerHTML = '';

        if (totalPages <= 1) return;

        // Previous button
        const prevDisabled = currentPage === 1 ? 'disabled' : '';
        paginationControls.insertAdjacentHTML('beforeend', `
            <button class="page-btn ${prevDisabled}" data-page="${currentPage - 1}"><i class="fa-solid fa-chevron-left"></i></button>
        `);

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            const activeClass = i === currentPage ? 'active' : '';
            paginationControls.insertAdjacentHTML('beforeend', `
                <button class="page-btn ${activeClass}" data-page="${i}">${i}</button>
            `);
        }

        // Next button
        const nextDisabled = currentPage === totalPages ? 'disabled' : '';
        paginationControls.insertAdjacentHTML('beforeend', `
            <button class="page-btn ${nextDisabled}" data-page="${currentPage + 1}"><i class="fa-solid fa-chevron-right"></i></button>
        `);

        // Add event listeners to page buttons
        const pageBtns = paginationControls.querySelectorAll('.page-btn:not(.disabled)');
        pageBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                currentPage = parseInt(btn.getAttribute('data-page'));
                renderFarmersTable();
            });
        });
    }

    // --- Search Logic ---
    if (farmerSearchInput) {
        farmerSearchInput.addEventListener('input', () => {
            const query = farmerSearchInput.value.toLowerCase().trim();
            applyFiltersAndSearch(query);
        });
    }

    // --- Filter Handlers ---
    if (btnFilterApply) {
        btnFilterApply.addEventListener('click', () => {
            applyFiltersAndSearch(farmerSearchInput ? farmerSearchInput.value.toLowerCase().trim() : '');
            filterDropdown.classList.remove('active');
        });
    }

    if (btnFilterReset) {
        btnFilterReset.addEventListener('click', () => {
            if (filterStatus) filterStatus.value = 'all';
            if (filterRegion) filterRegion.value = 'all';
            applyFiltersAndSearch(farmerSearchInput ? farmerSearchInput.value.toLowerCase().trim() : '');
            filterDropdown.classList.remove('active');
        });
    }

    function applyFiltersAndSearch(searchQuery) {
        const selectedStatusVal = filterStatus ? filterStatus.value : 'all';
        const selectedRegionVal = filterRegion ? filterRegion.value : 'all';

        filteredFarmers = farmersData.filter(farmer => {
            const matchesSearch = farmer.name.toLowerCase().includes(searchQuery) || farmer.phone.includes(searchQuery);
            const matchesStatus = selectedStatusVal === 'all' || farmer.status === selectedStatusVal;
            const matchesRegion = selectedRegionVal === 'all' || farmer.region === selectedRegionVal;

            return matchesSearch && matchesStatus && matchesRegion;
        });

        currentPage = 1;
        renderFarmersTable();
    }

    // --- Global Search Bar Sync ---
    if (mainSearchInput) {
        mainSearchInput.addEventListener('input', () => {
            if (farmerSearchInput) {
                farmerSearchInput.value = mainSearchInput.value;
                applyFiltersAndSearch(mainSearchInput.value.toLowerCase().trim());
            }
        });
    }

    // --- Initial Render & Query Param Check ---
    const urlParams = new URLSearchParams(window.location.search);
    const searchQueryParam = urlParams.get('search');
    if (searchQueryParam) {
        if (farmerSearchInput) {
            farmerSearchInput.value = searchQueryParam;
        }
        applyFiltersAndSearch(searchQueryParam.toLowerCase().trim());
    } else {
        renderFarmersTable();
    }
});
