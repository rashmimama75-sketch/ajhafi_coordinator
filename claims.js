document.addEventListener('DOMContentLoaded', () => {
    // --- Claims data (loaded from backend) ---
    let claimsData = [];

    function fmtDate(iso) {
        if (!iso) return '—';
        const d = new Date(iso);
        if (isNaN(d)) return '—';
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    function mapClaimStatus(cat, status) {
        const k = String(cat || status || '').toLowerCase();
        if (k === 'approved' || k === 'claimed' || k === 'paid') return { label: 'Approved', cls: 'approved' };
        if (k === 'rejected') return { label: 'Rejected', cls: 'rejected' };
        if (k === 'hold' || k === 'under review' || k === 'under_review' || k === 'review') return { label: 'Under Review', cls: 'under-review' };
        if (k === 'pending') return { label: 'Pending', cls: 'pending' };
        return { label: (cat || status || '—'), cls: 'pending' };
    }

    function mapClaim(c) {
        const s = mapClaimStatus(c.category, c.status);
        return {
            id: c.claim_number,
            farmer: (c.farmer || '').trim() || '—',
            goatId: c.ear_tag_number || '—',
            deathDate: fmtDate(c.date_of_death),
            cause: c.cause_of_death ? ('Cause of Death: ' + c.cause_of_death) : '',
            status: s.label,
            statusClass: s.cls,
            amount: (c.claim_amount != null) ? ('₹ ' + Number(c.claim_amount).toLocaleString('en-IN')) : '—',
            amountDetail: 'Claim Amount',
            avatar: (window.AjahFiAPI ? AjahFiAPI.mediaUrl(c.photo) : (c.photo || ''))
        };
    }

    function updateSummaryCounts() {
        const by = (key) => claimsData.filter(c => c.status.toLowerCase() === key).length;
        const set = (sel, val) => { const el = document.querySelector(sel + ' .summary-card-val'); if (el) el.textContent = val; };
        set('.card-all', claimsData.length);
        set('.card-pending', by('pending'));
        set('.card-review', by('under review'));
        set('.card-approved', by('approved'));
        set('.card-rejected', by('rejected'));
    }

    async function loadClaims() {
        if (claimsListContainer) {
            claimsListContainer.innerHTML = '<div class="detail-card" style="text-align:center;padding:40px;color:var(--text-muted);">Loading claims…</div>';
        }
        try {
            const data = await AjahFiAPI.get('/coordinator/claims');
            const list = (data && data.claims) || [];
            claimsData = list.map(mapClaim);
            updateSummaryCounts();
            renderClaimsList();
        } catch (err) {
            if (claimsListContainer) {
                claimsListContainer.innerHTML = '<div class="detail-card" style="text-align:center;padding:40px;color:var(--color-rejected);">Could not load claims: ' + err.message + '</div>';
            }
        }
    }

    let currentFilter = 'all';
    let searchQuery = '';

    // --- DOM Elements ---
    const sidebar = document.getElementById('appSidebar');
    const sidebarToggleBtn = document.getElementById('sidebarToggle');
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationDropdown = document.getElementById('notificationDropdown');
    const profileBtn = document.getElementById('profileDropdownBtn');
    
    const claimSearchInput = document.getElementById('claimSearchInput');
    const claimsListContainer = document.getElementById('claimsListContainer');
    
    const tabs = document.querySelectorAll('.claims-tab');
    const summaryCards = document.querySelectorAll('.claims-summary-card');

    // --- Render function ---
    function renderClaimsList() {
        if (!claimsListContainer) return;
        claimsListContainer.innerHTML = '';

        // Filter data
        const filtered = claimsData.filter(claim => {
            const matchesSearch = 
                claim.id.toLowerCase().includes(searchQuery) ||
                claim.farmer.toLowerCase().includes(searchQuery) ||
                claim.goatId.toLowerCase().includes(searchQuery);
            
            const matchesTab = currentFilter === 'all' || claim.status.toLowerCase() === currentFilter;
            
            return matchesSearch && matchesTab;
        });

        if (filtered.length === 0) {
            claimsListContainer.innerHTML = `
                <div class="detail-card" style="text-align: center; padding: 40px; color: var(--text-muted);">
                    No claims found matching your filters.
                </div>
            `;
            return;
        }

        filtered.forEach(claim => {
            const itemHtml = `
                <div class="claim-list-item-card">
                    <div class="claim-item-left">
                        <img src="${claim.avatar}" alt="${claim.farmer}" class="claim-farmer-avatar" onerror="this.src='https://via.placeholder.com/48/22c55e/ffffff?text=${claim.farmer.charAt(0)}'">
                        <div class="claim-core-details">
                            <div class="claim-id-row">
                                <h4 class="claim-id-val">Claim ID: <a href="claim-detail.html?id=${claim.id}" class="claim-id-link"><strong>${claim.id}</strong></a></h4>
                            </div>
                            <div class="claim-sub-info">
                                <span>Farmer: <strong>${claim.farmer}</strong></span>
                                <span class="dot-separator">•</span>
                                <span>GOAT ID: <strong>${claim.goatId}</strong></span>
                                <span class="dot-separator">•</span>
                                <span>Date of Death: <strong>${claim.deathDate}</strong></span>
                            </div>
                            <div class="claim-raised-time">
                                <span>${claim.cause || ''}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="claim-item-right">
                        <span class="badge ${claim.statusClass}">${claim.status}</span>
                        <div class="claim-amount-box">
                            <h4 class="claim-amount-val">${claim.amount}</h4>
                            <span class="claim-amount-lbl">${claim.amountDetail}</span>
                        </div>
                        <i class="fa-solid fa-chevron-right action-nav-icon-bold"></i>
                    </div>
                </div>
            `;
            claimsListContainer.insertAdjacentHTML('beforeend', itemHtml);
        });

        // Add click listener to cards
        const cards = claimsListContainer.querySelectorAll('.claim-list-item-card');
        cards.forEach((card, index) => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('a')) return;
                const claim = filtered[index];
                window.location.href = `claim-detail.html?id=${claim.id}`;
            });
        });
    }

    // --- Tab and Summary Card Filters ---
    function setFilter(filter) {
        currentFilter = filter;
        
        // Update Tabs active class
        tabs.forEach(tab => {
            const tabFilter = tab.getAttribute('data-filter');
            if (tabFilter === currentFilter) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // Update Summary Cards active class
        summaryCards.forEach(card => {
            const cardFilter = card.getAttribute('data-filter');
            if (cardFilter === currentFilter) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });

        renderClaimsList();
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            setFilter(tab.getAttribute('data-filter'));
        });
    });

    summaryCards.forEach(card => {
        card.addEventListener('click', () => {
            setFilter(card.getAttribute('data-filter'));
        });
    });

    // --- Search input listener ---
    if (claimSearchInput) {
        claimSearchInput.addEventListener('input', () => {
            searchQuery = claimSearchInput.value.toLowerCase().trim();
            renderClaimsList();
        });
    }

    // --- Sidebar & Notification Dropdown ---
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

    const btnViewStats = document.getElementById('btnViewStats');
    if (btnViewStats) {
        btnViewStats.addEventListener('click', () => {
            window.location.href = 'reports.html';
        });
    }

    // Initial load (from backend)
    loadClaims();
});
