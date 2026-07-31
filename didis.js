document.addEventListener('DOMContentLoaded', () => {
    // --- Suraksha Didis data (loaded from backend) ---
    let didisData = [];

    function fmtDate(iso) {
        if (!iso) return '—';
        const d = new Date(iso);
        if (isNaN(d)) return '—';
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    function mapDidi(t) {
        return {
            id: t.id,
            name: (t.full_name || '').trim() || '—',
            phone: t.mobile_number || '',
            region: (t.village || '').trim() || '—',
            status: t.is_active ? 'Active' : 'Inactive',
            joined: fmtDate(t.joined_at),
            enrollments: t.enrollments,
            avatar: (window.AjahFiAPI ? AjahFiAPI.mediaUrl(t.photo) : (t.photo || ''))
        };
    }

    function updateDidiStats() {
        const vals = document.querySelectorAll('.didis-stat-card .stat-card-value, .farmers-stat-card .stat-card-value');
        if (vals.length < 3) return;
        const active = didisData.filter(d => d.status === 'Active').length;
        const inactive = didisData.length - active;
        const regions = new Set(didisData.map(d => d.region).filter(r => r && r !== '—')).size;
        vals[0].textContent = didisData.length.toLocaleString('en-IN');
        if (vals[1]) vals[1].textContent = active.toLocaleString('en-IN');
        if (vals[2]) vals[2].textContent = inactive.toLocaleString('en-IN');
        if (vals[3]) vals[3].textContent = regions.toLocaleString('en-IN');
    }

    async function loadDidis() {
        if (didisTableBody) {
            didisTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--text-muted);">Loading Suraksha Didis…</td></tr>';
        }
        try {
            const data = await AjahFiAPI.get('/coordinator/team');
            const list = (data && data.team) || [];
            didisData = list.map(mapDidi);
            filteredDidis = [...didisData];
            updateDidiStats();
            renderDidisTable();
        } catch (err) {
            if (didisTableBody) {
                didisTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--color-rejected);">Could not load Suraksha Didis: ' + err.message + '</td></tr>';
            }
        }
    }

    // --- State Management ---
    let currentPage = 1;
    const itemsPerPage = 5; // As per the reference UI showing 5 items per page
    let filteredDidis = [];

    // --- DOM Elements ---
    const sidebar = document.getElementById('appSidebar');
    const sidebarToggleBtn = document.getElementById('sidebarToggle');
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationDropdown = document.getElementById('notificationDropdown');
    const profileBtn = document.getElementById('profileDropdownBtn');
    const mainSearchInput = document.getElementById('mainSearchInput');

    const didiSearchInput = document.getElementById('didiSearchInput');
    const btnDidiFilter = document.getElementById('btnDidiFilter');
    const filterDidiDropdown = document.getElementById('filterDidiDropdown');
    const filterDidiStatus = document.getElementById('filterDidiStatus');
    const filterDidiRegion = document.getElementById('filterDidiRegion');
    const btnDidiFilterReset = document.getElementById('btnDidiFilterReset');
    const btnDidiFilterApply = document.getElementById('btnDidiFilterApply');

    const didisTableBody = document.getElementById('didisTableBody');
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
        if (filterDidiDropdown && !filterDidiDropdown.contains(e.target) && e.target !== btnDidiFilter && !btnDidiFilter.contains(e.target)) {
            filterDidiDropdown.classList.remove('active');
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

    // Toggle Filter Menu
    if (btnDidiFilter) {
        btnDidiFilter.addEventListener('click', (e) => {
            e.stopPropagation();
            filterDidiDropdown.classList.toggle('active');
        });
    }

    // --- Render Didis Table & Pagination ---
    function renderDidisTable() {
        if (!didisTableBody) return;
        didisTableBody.innerHTML = '';

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, filteredDidis.length);
        const pageItems = filteredDidis.slice(startIndex, endIndex);

        if (pageItems.length === 0) {
            didisTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 30px; color: var(--text-muted);">No Suraksha Didis found matching your criteria.</td></tr>`;
            if (paginationSummary) paginationSummary.textContent = 'Showing 0 to 0 of 0';
            renderPagination(0);
            return;
        }

        pageItems.forEach(didi => {
            const statusClass = didi.status.toLowerCase() === 'active' ? 'approved' : 'rejected';
            const rowHtml = `
                <tr>
                    <td>
                        <div class="farmer-profile-cell">
                            <img src="${didi.avatar}" alt="${didi.name}" class="table-farmer-img" onerror="this.src='https://via.placeholder.com/38/ff7a00/ffffff?text=${didi.name.charAt(0)}'">
                            <div class="farmer-info">
                                <span class="farmer-name-val">${didi.name}</span>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div class="phone-link-wrapper">
                            <a href="tel:${didi.phone}" class="contact-action-link phone" title="Call ${didi.name}">
                                <i class="fa-solid fa-phone"></i>
                                <span>${didi.phone}</span>
                            </a>
                        </div>
                    </td>
                    <td>
                        <span class="location-cell">
                            <i class="fa-solid fa-location-dot"></i>
                            <span>${didi.region}</span>
                        </span>
                    </td>
                    <td><span class="badge ${statusClass}">${didi.status}</span></td>
                    <td>${didi.joined}</td>
                    <td style="text-align: center;">
                        <button class="btn-action-detail btn-view-didi-details" data-id="${didi.id}" title="View Details">
                            <span>View</span>
                        </button>
                    </td>
                </tr>
            `;
            didisTableBody.insertAdjacentHTML('beforeend', rowHtml);
        });

        // Update summary text
        const displayStart = startIndex + 1;
        const displayEnd = startIndex + pageItems.length;

        if (paginationSummary) {
            paginationSummary.textContent = `Showing ${displayStart} to ${displayEnd} of ${filteredDidis.length}`;
        }

        const totalPages = Math.ceil(filteredDidis.length / itemsPerPage);
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
                renderDidisTable();
            });
        });
    }

    // --- Search Logic ---
    if (didiSearchInput) {
        didiSearchInput.addEventListener('input', () => {
            const query = didiSearchInput.value.toLowerCase().trim();
            applyFiltersAndSearch(query);
        });
    }

    // --- Filter Handlers ---
    if (btnDidiFilterApply) {
        btnDidiFilterApply.addEventListener('click', () => {
            applyFiltersAndSearch(didiSearchInput ? didiSearchInput.value.toLowerCase().trim() : '');
            filterDidiDropdown.classList.remove('active');
        });
    }

    if (btnDidiFilterReset) {
        btnDidiFilterReset.addEventListener('click', () => {
            if (filterDidiStatus) filterDidiStatus.value = 'all';
            if (filterDidiRegion) filterDidiRegion.value = 'all';
            applyFiltersAndSearch(didiSearchInput ? didiSearchInput.value.toLowerCase().trim() : '');
            filterDidiDropdown.classList.remove('active');
        });
    }

    function applyFiltersAndSearch(searchQuery) {
        const selectedStatusVal = filterDidiStatus ? filterDidiStatus.value : 'all';
        const selectedRegionVal = filterDidiRegion ? filterDidiRegion.value : 'all';

        filteredDidis = didisData.filter(didi => {
            const matchesSearch = didi.name.toLowerCase().includes(searchQuery) || didi.phone.includes(searchQuery);
            const matchesStatus = selectedStatusVal === 'all' || didi.status === selectedStatusVal;
            const matchesRegion = selectedRegionVal === 'all' || didi.region === selectedRegionVal;

            return matchesSearch && matchesStatus && matchesRegion;
        });

        currentPage = 1;
        renderDidisTable();
    }

    // Attach click listener for details view
    if (didisTableBody) {
        didisTableBody.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-view-didi-details');
            if (btn) {
                const didiId = btn.getAttribute('data-id');
                window.location.href = `didi-detail.html?id=${encodeURIComponent(didiId)}`;
            }
        });
    }

    // --- Global Search Bar Sync ---
    if (mainSearchInput) {
        mainSearchInput.addEventListener('input', () => {
            if (didiSearchInput) {
                didiSearchInput.value = mainSearchInput.value;
                applyFiltersAndSearch(mainSearchInput.value.toLowerCase().trim());
            }
        });
    }

    // --- Initial load from backend ---
    loadDidis();
});
