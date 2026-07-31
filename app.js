document.addEventListener('DOMContentLoaded', () => {
    // --- Mock Data ---
    let claimsData = [
        { id: 'CLM1001', goatId: 'G12345', farmer: 'Ramesh Kumar', dod: '22 Jul 2026', status: 'Pending', amount: '₹15,000', policy: 'POL-986221', didi: 'Sita Devi (ID: D304)' },
        { id: 'CLM1002', goatId: 'G12340', farmer: 'Sita Devi', dod: '21 Jul 2026', status: 'Under Review', amount: '₹18,500', policy: 'POL-986210', didi: 'Gita Rani (ID: D102)' },
        { id: 'CLM1003', goatId: 'G12330', farmer: 'Mohan Singh', dod: '20 Jul 2026', status: 'Approved', amount: '₹12,000', policy: 'POL-986195', didi: 'Radha Das (ID: D220)' },
        { id: 'CLM1004', goatId: 'G12321', farmer: 'Anil Sharma', dod: '19 Jul 2026', status: 'Rejected', amount: '₹14,000', policy: 'POL-986180', didi: 'Sita Devi (ID: D304)' },
        { id: 'CLM1005', goatId: 'G12315', farmer: 'Karan Singh', dod: '18 Jul 2026', status: 'Pending', amount: '₹16,000', policy: 'POL-986175', didi: 'Gita Rani (ID: D102)' },
        { id: 'CLM1006', goatId: 'G12300', farmer: 'Sunita Bai', dod: '17 Jul 2026', status: 'Approved', amount: '₹15,000', policy: 'POL-986160', didi: 'Radha Das (ID: D220)' },
        { id: 'CLM1007', goatId: 'G12290', farmer: 'Rajendra Prasad', dod: '16 Jul 2026', status: 'Under Review', amount: '₹13,500', policy: 'POL-986150', didi: 'Sita Devi (ID: D304)' },
        { id: 'CLM1008', goatId: 'G12285', farmer: 'Meena Kumari', dod: '15 Jul 2026', status: 'Approved', amount: '₹15,000', policy: 'POL-986145', didi: 'Anita Devi (ID: D306)' },
        { id: 'CLM1009', goatId: 'G12270', farmer: 'Vijay Kumar', dod: '14 Jul 2026', status: 'Pending', amount: '₹19,000', policy: 'POL-986130', didi: 'Gita Rani (ID: D102)' },
        { id: 'CLM1010', goatId: 'G12260', farmer: 'Prem Lal', dod: '13 Jul 2026', status: 'Rejected', amount: '₹11,000', policy: 'POL-986120', didi: 'Anita Devi (ID: D306)' }
    ];

    // Chart Data Arrays (17 Jul to 23 Jul)
    const datesLabel = ['17 Jul', '19 Jul', '21 Jul', '23 Jul'];
    const activePoliciesData = [800, 920, 850, 986];
    const claimsHistoryData = [45, 62, 55, 72];
    const enrollmentsData = [20, 35, 28, 48];
    const totalPremiumData = [6, 12, 10, 12.8];

    // --- State Management ---
    let currentPage = 1;
    const itemsPerPage = 3;
    let filteredClaims = [...claimsData];
    let selectedClaim = null;

    // --- DOM Elements ---
    const sidebar = document.getElementById('appSidebar');
    const sidebarToggleBtn = document.getElementById('sidebarToggle');
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationDropdown = document.getElementById('notificationDropdown');
    const profileBtn = document.getElementById('profileDropdownBtn');
    const mainSearchInput = document.getElementById('mainSearchInput');
    const claimsTableBody = document.getElementById('claimsTableBody');
    const paginationInfo = document.getElementById('paginationInfo');
    const paginationControls = document.getElementById('paginationControls');

    // Modal elements
    const claimModal = document.getElementById('claimModal');
    const btnCloseModal = document.getElementById('btnCloseModal');
    const modalClaimId = document.getElementById('modalClaimId');
    const modalGoatId = document.getElementById('modalGoatId');
    const modalFarmerName = document.getElementById('modalFarmerName');
    const modalDateOfDeath = document.getElementById('modalDateOfDeath');
    const modalStatusBadge = document.getElementById('modalStatusBadge');
    const btnRejectClaim = document.getElementById('btnRejectClaim');
    const btnApproveClaim = document.getElementById('btnApproveClaim');

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
    });

    notificationBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notificationDropdown.classList.toggle('active');
    });

    profileBtn.addEventListener('click', () => {
        alert("Profile settings & Coordinator options coming soon!");
    });

    // Sidebar navigation active state toggle
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const href = item.getAttribute('href');
            if (href === '#' || !href) {
                e.preventDefault();
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
            }
        });
    });

    // --- Helper function for Chart Gradients ---
    function getGradient(ctx, colorStart, colorEnd) {
        const gradient = ctx.createLinearGradient(0, 0, 0, 70);
        gradient.addColorStop(0, colorStart);
        gradient.addColorStop(1, colorEnd);
        return gradient;
    }

    // --- Render Sparkline Charts ---
    // 1. Active Policies Chart (Blue / Greenish Brand color theme)
    const ctxPolicies = document.getElementById('chartActivePolicies').getContext('2d');
    const policiesGradient = getGradient(ctxPolicies, 'rgba(21, 128, 61, 0.25)', 'rgba(21, 128, 61, 0.0)');
    new Chart(ctxPolicies, {
        type: 'line',
        data: {
            labels: datesLabel,
            datasets: [{
                data: activePoliciesData,
                borderColor: '#15803d',
                borderWidth: 2,
                pointBackgroundColor: '#15803d',
                pointHoverRadius: 4,
                fill: true,
                backgroundColor: policiesGradient,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { font: { size: 9 }, color: '#64748b' }
                },
                y: {
                    grid: { display: false },
                    ticks: { font: { size: 9 }, color: '#64748b' }
                }
            }
        }
    });

    // 2. Claims History Chart (Purple)
    const ctxClaims = document.getElementById('chartClaimsHistory').getContext('2d');
    const claimsGradient = getGradient(ctxClaims, 'rgba(109, 40, 217, 0.25)', 'rgba(109, 40, 217, 0.0)');
    new Chart(ctxClaims, {
        type: 'line',
        data: {
            labels: datesLabel,
            datasets: [{
                data: claimsHistoryData,
                borderColor: '#6d28d9',
                borderWidth: 2,
                pointBackgroundColor: '#6d28d9',
                pointHoverRadius: 4,
                fill: true,
                backgroundColor: claimsGradient,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { font: { size: 9 }, color: '#64748b' }
                },
                y: {
                    grid: { display: false },
                    ticks: { font: { size: 9 }, color: '#64748b' }
                }
            }
        }
    });

    // 3. Enrollments Chart (Green)
    const ctxEnrollments = document.getElementById('chartEnrollments').getContext('2d');
    const enrollmentsGradient = getGradient(ctxEnrollments, 'rgba(21, 128, 61, 0.25)', 'rgba(21, 128, 61, 0.0)');
    new Chart(ctxEnrollments, {
        type: 'line',
        data: {
            labels: datesLabel,
            datasets: [{
                data: enrollmentsData,
                borderColor: '#16a34a',
                borderWidth: 2,
                pointBackgroundColor: '#16a34a',
                pointHoverRadius: 4,
                fill: true,
                backgroundColor: enrollmentsGradient,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { font: { size: 9 }, color: '#64748b' }
                },
                y: {
                    grid: { display: false },
                    ticks: { font: { size: 9 }, color: '#64748b' }
                }
            }
        }
    });

    // 4. Total Premium Chart (Orange)
    const ctxPremium = document.getElementById('chartTotalPremium').getContext('2d');
    const premiumGradient = getGradient(ctxPremium, 'rgba(217, 119, 6, 0.25)', 'rgba(217, 119, 6, 0.0)');
    new Chart(ctxPremium, {
        type: 'line',
        data: {
            labels: datesLabel,
            datasets: [{
                data: totalPremiumData,
                borderColor: '#d97706',
                borderWidth: 2,
                pointBackgroundColor: '#d97706',
                pointHoverRadius: 4,
                fill: true,
                backgroundColor: premiumGradient,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { font: { size: 9 }, color: '#64748b' }
                },
                y: {
                    grid: { display: false },
                    ticks: { font: { size: 9 }, color: '#64748b' }
                }
            }
        }
    });

    // --- Table Filtering & Search ---
    mainSearchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        filteredClaims = claimsData.filter(claim => 
            claim.farmer.toLowerCase().includes(query) ||
            claim.id.toLowerCase().includes(query) ||
            claim.goatId.toLowerCase().includes(query)
        );
        currentPage = 1;
        renderTable();
    });

    // --- Render Table & Pagination ---
    function renderTable() {
        claimsTableBody.innerHTML = '';
        
        const totalItems = filteredClaims.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
        
        // Boundaries
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
        const paginatedItems = filteredClaims.slice(startIndex, endIndex);

        if (paginatedItems.length === 0) {
            claimsTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 30px;">No claims matching search.</td></tr>`;
            paginationInfo.textContent = `Showing 0 of 0 entries`;
            paginationControls.innerHTML = '';
            return;
        }

        paginatedItems.forEach(claim => {
            const tr = document.createElement('tr');
            
            // Map status CSS class
            let statusClass = 'pending';
            if (claim.status === 'Under Review') statusClass = 'under-review';
            if (claim.status === 'Approved') statusClass = 'approved';
            if (claim.status === 'Rejected') statusClass = 'rejected';

            tr.innerHTML = `
                <td>
                    <div class="goat-profile-cell">
                        <img src="goat_thumbnail.png" alt="Goat profile image" class="table-goat-img">
                        <div class="goat-info">
                            <span class="goat-id-lbl">GOAT ID:</span>
                            <span class="goat-id-val">${claim.goatId}</span>
                        </div>
                    </div>
                <td>
                    <a href="farmers.html?search=${encodeURIComponent(claim.farmer)}" class="farmer-table-link" title="Connect with ${claim.farmer}">
                        <strong>${claim.farmer}</strong>
                    </a>
                </td>
                <td>${claim.dod}</td>
                <td><strong>${claim.id}</strong></td>
                <td><span class="badge ${statusClass}">${claim.status}</span></td>
                <td>
                    <button class="btn-action-detail btn-view-claim" data-id="${claim.id}">
                        <span>View Details</span>
                        <i class="fa-solid fa-chevron-right" style="font-size: 8px;"></i>
                    </button>
                </td>
                <td>
                    <button class="btn-more"><i class="fa-solid fa-ellipsis-vertical"></i></button>
                </td>
            `;
            claimsTableBody.appendChild(tr);
        });

        // Update Pagination Text
        paginationInfo.textContent = `Showing ${totalItems === 0 ? 0 : startIndex + 1} to ${endIndex} of ${totalItems} entries`;

        // Update Pagination Controls
        renderPagination(totalPages);
        setupViewDetailsListeners();
    }

    function renderPagination(totalPages) {
        paginationControls.innerHTML = '';

        // Previous button
        const prevBtn = document.createElement('button');
        prevBtn.className = `page-btn ${currentPage === 1 ? 'disabled' : ''}`;
        prevBtn.innerHTML = `<i class="fa-solid fa-chevron-left"></i>`;
        prevBtn.disabled = currentPage === 1;
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderTable();
            }
        });
        paginationControls.appendChild(prevBtn);

        // Page buttons
        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `page-btn ${currentPage === i ? 'active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.addEventListener('click', () => {
                currentPage = i;
                renderTable();
            });
            paginationControls.appendChild(pageBtn);
        }

        // Next button
        const nextBtn = document.createElement('button');
        nextBtn.className = `page-btn ${currentPage === totalPages ? 'disabled' : ''}`;
        nextBtn.innerHTML = `<i class="fa-solid fa-chevron-right"></i>`;
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderTable();
            }
        });
        paginationControls.appendChild(nextBtn);
    }

    // --- Modal Logic ---
    function setupViewDetailsListeners() {
        const viewBtns = document.querySelectorAll('.btn-view-claim');
        viewBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const claimId = btn.getAttribute('data-id');
                selectedClaim = claimsData.find(c => c.id === claimId);
                
                if (selectedClaim) {
                    modalClaimId.textContent = selectedClaim.id;
                    modalGoatId.textContent = `GOAT ID: ${selectedClaim.goatId}`;
                    modalFarmerName.textContent = selectedClaim.farmer;
                    modalDateOfDeath.textContent = selectedClaim.dod;
                    
                    // Style status badge in modal
                    let statusClass = 'pending';
                    if (selectedClaim.status === 'Under Review') statusClass = 'under-review';
                    if (selectedClaim.status === 'Approved') statusClass = 'approved';
                    if (selectedClaim.status === 'Rejected') statusClass = 'rejected';
                    
                    modalStatusBadge.textContent = selectedClaim.status;
                    modalStatusBadge.className = `badge ${statusClass}`;
                    
                    claimModal.classList.add('active');
                }
            });
        });
    }

    // Close Modal Events
    btnCloseModal.addEventListener('click', () => {
        claimModal.classList.remove('active');
    });

    claimModal.addEventListener('click', (e) => {
        if (e.target === claimModal) {
            claimModal.classList.remove('active');
        }
    });

    // Approve Claim Action
    btnApproveClaim.addEventListener('click', () => {
        if (selectedClaim) {
            selectedClaim.status = 'Approved';
            // Update stats or reload lists
            alert(`Claim ${selectedClaim.id} Approved successfully!`);
            claimModal.classList.remove('active');
            renderTable();
            updateDashboardCounters();
        }
    });

    // Reject Claim Action
    btnRejectClaim.addEventListener('click', () => {
        if (selectedClaim) {
            selectedClaim.status = 'Rejected';
            alert(`Claim ${selectedClaim.id} Rejected successfully.`);
            claimModal.classList.remove('active');
            renderTable();
            updateDashboardCounters();
        }
    });

    // Dynamic stats update on state change
    function updateDashboardCounters() {
        let approvedCount = claimsData.filter(c => c.status === 'Approved').length;
        let rejectedCount = claimsData.filter(c => c.status === 'Rejected').length;
        let pendingCount = claimsData.filter(c => c.status === 'Pending').length;
        let reviewCount = claimsData.filter(c => c.status === 'Under Review').length;

        // Note: update dashboard UI Claim Overview counts
        const cards = document.querySelectorAll('.claims-status-card');
        if (cards.length >= 4) {
            // Pending
            cards[0].querySelector('.status-count').textContent = pendingCount + 70; // offsetting from mock base numbers
            // Under Review
            cards[1].querySelector('.status-count').textContent = reviewCount + 16;
            // Approved
            cards[2].querySelector('.status-count').textContent = approvedCount + 22;
            // Rejected
            cards[3].querySelector('.status-count').textContent = rejectedCount + 8;
        }
    }

    // Contact Support Action
    document.getElementById('btnContactSupport').addEventListener('click', () => {
        alert("Contacting Support. A support representative will get back to you shortly.");
    });

    // Initialize View
    renderTable();

    // --- Live dashboard stats from backend (/coordinator/dashboard) ---
    function fmtNum(n) {
        if (n === null || n === undefined || isNaN(n)) return '—';
        return Number(n).toLocaleString('en-IN');
    }
    function fmtPremium(n) {
        if (n === null || n === undefined || isNaN(n)) return '—';
        n = Number(n);
        if (n >= 10000000) return '₹' + (n / 10000000).toFixed(2).replace(/\.00$/, '') + ' Cr';
        if (n >= 100000) return '₹' + (n / 100000).toFixed(1).replace(/\.0$/, '') + ' Lakh';
        return '₹' + n.toLocaleString('en-IN');
    }
    function setStat(id, val) {
        const el = document.getElementById(id);
        if (el && val !== undefined && val !== null && !isNaN(val)) el.textContent = fmtNum(val);
    }

    async function loadDashboardStats() {
        if (!window.AjahFiAPI) return;
        try {
            const d = await AjahFiAPI.get('/coordinator/dashboard');
            if (!d) return;
            setStat('valActivePolicies', d.active_policies);
            setStat('valClaimsHistory', d.total_claims);
            setStat('valEnrollments', d.total_enrollments);
            setStat('valTotalDidis', d.total_didis);
            setStat('valTotalFarmers', d.total_farmers);
            if (d.total_premium !== undefined && d.total_premium !== null) {
                const el = document.getElementById('valTotalPremium');
                if (el) el.textContent = fmtPremium(d.total_premium);
            }

            const statusCards = document.querySelectorAll('.claims-status-card .status-count');
            if (statusCards.length >= 4) {
                statusCards[0].textContent = fmtNum(d.claims_pending);
                statusCards[1].textContent = fmtNum(d.claims_under_review);
                statusCards[2].textContent = fmtNum(d.claims_approved);
                statusCards[3].textContent = fmtNum(d.claims_rejected);
            }
        } catch (err) {
            // Keep the placeholder numbers if the call fails; log for debugging.
            console.warn('Could not load dashboard stats:', err.message);
        }
    }
    loadDashboardStats();
});
