document.addEventListener('DOMContentLoaded', () => {
    // --- Farmers data (loaded from backend) ---
    let farmersData = [];

    function fmtDate(iso) {
        if (!iso) return '—';
        const d = new Date(iso);
        if (isNaN(d)) return '—';
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    function mapFarmer(f) {
        return {
            id: f.id,
            name: (f.full_name || '').trim() || '—',
            phone: f.mobile_number || '',
            region: (f.village || '').trim() || '—',
            status: f.is_active ? 'Active' : 'Inactive',
            joined: fmtDate(f.joined_at),
            enrollments: f.enrollments,
            avatar: (window.AjahFiAPI ? AjahFiAPI.mediaUrl(f.photo) : (f.photo || ''))
        };
    }

    function updateFarmerStats() {
        const vals = document.querySelectorAll('.farmers-stat-card .stat-card-value');
        if (vals.length < 4) return;
        const active = farmersData.filter(f => f.status === 'Active').length;
        const inactive = farmersData.length - active;
        const regions = new Set(farmersData.map(f => f.region).filter(r => r && r !== '—')).size;
        vals[0].textContent = farmersData.length.toLocaleString('en-IN');
        vals[1].textContent = active.toLocaleString('en-IN');
        vals[2].textContent = inactive.toLocaleString('en-IN');
        vals[3].textContent = regions.toLocaleString('en-IN');
    }

    async function loadFarmers() {
        if (farmersTableBody) {
            farmersTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--text-muted);">Loading farmers…</td></tr>';
        }
        try {
            const data = await AjahFiAPI.get('/coordinator/farmers');
            const list = (data && data.team) || [];
            farmersData = list.map(mapFarmer);
            filteredFarmers = [...farmersData];
            updateFarmerStats();

            const searchQueryParam = new URLSearchParams(window.location.search).get('search');
            if (searchQueryParam) {
                if (farmerSearchInput) farmerSearchInput.value = searchQueryParam;
                applyFiltersAndSearch(searchQueryParam.toLowerCase().trim());
            } else {
                renderFarmersTable();
            }
        } catch (err) {
            if (farmersTableBody) {
                farmersTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--color-rejected);">Could not load farmers: ' + err.message + '</td></tr>';
            }
        }
    }

    // --- State Management ---
    let currentPage = 1;
    const itemsPerPage = 8;
    let filteredFarmers = [];

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
                        <button class="btn-action-detail btn-view-farmer-details" data-id="${farmer.id}" title="View Details">
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
                const farmerId = btn.getAttribute('data-id');
                window.location.href = `farmer-detail.html?id=${encodeURIComponent(farmerId)}`;
            });
        });

        // Update summary text
        const displayStart = startIndex + 1;
        const displayEnd = startIndex + pageItems.length;

        if (paginationSummary) {
            paginationSummary.textContent = `Showing ${displayStart} to ${displayEnd} of ${filteredFarmers.length}`;
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

    // --- Initial load from backend ---
    loadFarmers();
});
