document.addEventListener('DOMContentLoaded', () => {
    // --- Mock Chart Data ---
    const chartData = {
        '7': [
            { label: '16 May', active: 120, claims: 40, reports: 30, pctActive: 48, pctClaims: 16, pctReports: 12 },
            { label: '17 May', active: 150, claims: 55, reports: 35, pctActive: 60, pctClaims: 22, pctReports: 14 },
            { label: '18 May', active: 180, claims: 60, reports: 40, pctActive: 72, pctClaims: 24, pctReports: 16 },
            { label: '19 May', active: 160, claims: 50, reports: 32, pctActive: 64, pctClaims: 20, pctReports: 12.8 },
            { label: '20 May', active: 200, claims: 70, reports: 45, pctActive: 80, pctClaims: 28, pctReports: 18 },
            { label: '21 May', active: 170, claims: 65, reports: 38, pctActive: 68, pctClaims: 26, pctReports: 15.2 },
            { label: '22 May', active: 190, claims: 75, reports: 50, pctActive: 76, pctClaims: 30, pctReports: 20 }
        ],
        '30': [
            { label: 'Week 1', active: 620, claims: 180, reports: 120, pctActive: 55, pctClaims: 20, pctReports: 15 },
            { label: 'Week 2', active: 750, claims: 240, reports: 160, pctActive: 65, pctClaims: 26, pctReports: 18 },
            { label: 'Week 3', active: 890, claims: 210, reports: 140, pctActive: 75, pctClaims: 22, pctReports: 16 },
            { label: 'Week 4', active: 986, claims: 250, reports: 180, pctActive: 85, pctClaims: 28, pctReports: 20 }
        ],
        '365': [
            { label: 'Q 1', active: 2400, claims: 650, reports: 400, pctActive: 60, pctClaims: 18, pctReports: 12 },
            { label: 'Q 2', active: 3100, claims: 820, reports: 550, pctActive: 75, pctClaims: 22, pctReports: 15 },
            { label: 'Q 3', active: 2800, claims: 720, reports: 480, pctActive: 70, pctClaims: 20, pctReports: 13.5 },
            { label: 'Q 4', active: 3800, claims: 980, reports: 690, pctActive: 90, pctClaims: 26, pctReports: 18 }
        ]
    };

    // --- State Management ---
    const sidebar = document.getElementById('appSidebar');
    const sidebarToggleBtn = document.getElementById('sidebarToggle');
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationDropdown = document.getElementById('notificationDropdown');
    const profileBtn = document.getElementById('profileDropdownBtn');
    const barChartContainer = document.getElementById('barChartContainer');

    // --- Render Chart Function ---
    function renderChart(range) {
        if (!barChartContainer) return;
        barChartContainer.innerHTML = '';
        
        const data = chartData[range] || chartData['7'];
        data.forEach(item => {
            const barGroupHtml = `
                <div class="chart-bar-group">
                    <div class="bar-subgroup">
                        <div class="single-bar bar-green" style="height: ${item.pctActive}%;" title="Active Policies: ${item.active}"></div>
                        <div class="single-bar bar-purple" style="height: ${item.pctClaims}%;" title="Claims: ${item.claims}"></div>
                        <div class="single-bar bar-blue" style="height: ${item.pctReports}%;" title="Reports: ${item.reports}"></div>
                    </div>
                    <span class="bar-x-label">${item.label}</span>
                </div>
            `;
            barChartContainer.insertAdjacentHTML('beforeend', barGroupHtml);
        });
    }

    // --- Toggle Chart Filter Range ---
    const rangeButtons = document.querySelectorAll('.btn-chart-range');
    rangeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            rangeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const range = btn.getAttribute('data-range');
            renderChart(range);
        });
    });

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

    // Initial load
    renderChart('7');

    // --- Live report KPIs from backend (/coordinator/dashboard) ---
    function money(n) {
        if (n === null || n === undefined || isNaN(n)) return '—';
        return '₹ ' + Number(n).toLocaleString('en-IN');
    }
    function num(n) {
        if (n === null || n === undefined || isNaN(n)) return '—';
        return Number(n).toLocaleString('en-IN');
    }
    async function loadReports() {
        if (!window.AjahFiAPI) return;
        try {
            const d = await AjahFiAPI.get('/coordinator/dashboard');
            if (!d) return;
            const cards = document.querySelectorAll('.farmers-stat-card');
            const put = (i, label, value) => {
                if (!cards[i]) return;
                const lbl = cards[i].querySelector('.stat-card-label');
                const val = cards[i].querySelector('.stat-card-value');
                if (lbl && label) lbl.textContent = label;
                if (val) val.textContent = value;
            };
            put(0, 'Active Policies', num(d.active_policies));
            put(1, 'Total Claims', num(d.total_claims));
            put(2, 'Today Premium Collection', money(d.range_premium));
            put(3, 'Total Premium Collection', money(d.total_premium));
        } catch (err) {
            console.warn('Could not load reports:', err.message);
        }
    }
    loadReports();
});
