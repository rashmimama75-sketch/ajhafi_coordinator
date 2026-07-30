document.addEventListener('DOMContentLoaded', () => {
    // --- Mock Suraksha Didis Dataset ---
    const didisData = [
        { name: 'Sita Devi', phone: '9876543210', region: 'Baripada', status: 'Active', joined: '12 Jan 2025', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80' },
        { name: 'Laxmi Murmu', phone: '8765432109', region: 'Rairangpur', status: 'Active', joined: '18 Jan 2025', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80' },
        { name: 'Kamala Tudu', phone: '7654321098', region: 'Karanjia', status: 'Active', joined: '20 Jan 2025', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80' },
        { name: 'Sunita Hembram', phone: '6543210987', region: 'Udala', status: 'Active', joined: '25 Jan 2025', avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=100&q=80' },
        { name: 'Parbati Soren', phone: '5432109876', region: 'Jashipur', status: 'Inactive', joined: '02 Feb 2025', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80' },
        { name: 'Anita Devi', phone: '4321098765', region: 'Rairangpur', status: 'Active', joined: '05 Feb 2025', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80' },
        { name: 'Radha Das', phone: '3210987654', region: 'Baripada', status: 'Active', joined: '08 Feb 2025', avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=100&q=80' },
        { name: 'Basanti Murmu', phone: '2109876543', region: 'Karanjia', status: 'Active', joined: '10 Feb 2025', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80' },
        { name: 'Gita Soren', phone: '1098765432', region: 'Udala', status: 'Active', joined: '12 Feb 2025', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80' },
        { name: 'Mamata Naik', phone: '9876501234', region: 'Jashipur', status: 'Inactive', joined: '15 Feb 2025', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80' },
        { name: 'Champa Tudu', phone: '9123456790', region: 'Rairangpur', status: 'Active', joined: '18 Feb 2025', avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=100&q=80' },
        { name: 'Purnima Hansdah', phone: '9123456791', region: 'Baripada', status: 'Active', joined: '20 Feb 2025', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80' }
    ];

    // --- State Management ---
    let currentPage = 1;
    const itemsPerPage = 5; // As per the reference UI showing 5 items per page
    let filteredDidis = [...didisData];

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
                        <button class="btn-action-detail btn-view-didi-details" data-name="${didi.name}" title="View Details">
                            <span>View</span>
                        </button>
                    </td>
                </tr>
            `;
            didisTableBody.insertAdjacentHTML('beforeend', rowHtml);
        });

        // Update summary text
        const totalEntries = 156; // Replicating database totals proportionally
        const displayStart = startIndex + 1;
        const displayEnd = startIndex + pageItems.length;
        
        if (paginationSummary) {
            paginationSummary.textContent = `Showing ${displayStart} to ${displayEnd} of ${filteredDidis.length === didisData.length ? totalEntries : filteredDidis.length}`;
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
                const name = btn.getAttribute('data-name');
                window.location.href = `didi-detail.html?name=${encodeURIComponent(name)}`;
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

    // --- Initial Render ---
    renderDidisTable();
});
