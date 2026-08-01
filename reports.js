document.addEventListener('DOMContentLoaded', () => {
    // --- Activity Overview chart data (from /coordinator/performance) ---
    const RANGE_MAP = { '7': 'last7', '30': 'last30', '365': 'last365' };
    const perfCache = {};

    function niceCeil(n) { return Math.max(5, Math.ceil((n || 0) / 5) * 5); }

    function updateChartAxis(maxVal) {
        const labels = document.querySelectorAll('.grid-axis-label');
        const steps = [maxVal, maxVal * 0.8, maxVal * 0.6, maxVal * 0.4, maxVal * 0.2, 0];
        labels.forEach((el, i) => { if (steps[i] != null) el.textContent = Math.round(steps[i]); });
    }

    // --- State Management ---
    const sidebar = document.getElementById('appSidebar');
    const sidebarToggleBtn = document.getElementById('sidebarToggle');
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationDropdown = document.getElementById('notificationDropdown');
    const profileBtn = document.getElementById('profileDropdownBtn');
    const barChartContainer = document.getElementById('barChartContainer');

    // --- Render Chart from performance days[] (scaled to the real data) ---
    function renderChart(days) {
        if (!barChartContainer) return;
        days = days || [];
        let max = 0;
        days.forEach(d => { max = Math.max(max, +d.active_policies || 0, +d.claims || 0, +d.enrollments || 0); });
        const niceMax = niceCeil(max);
        updateChartAxis(niceMax);
        const h = v => (niceMax > 0 ? Math.round((+v || 0) / niceMax * 100) : 0);
        const valSpan = v => (v > 0
            ? '<span class="bar-value" style="position:absolute;top:-15px;left:50%;transform:translateX(-50%);font-size:9px;font-weight:700;color:#334155;white-space:nowrap;">' + v + '</span>'
            : '');
        barChartContainer.innerHTML = days.map(d => {
            const ap = +d.active_policies || 0, cl = +d.claims || 0, en = +d.enrollments || 0;
            const label = d.label || d.date || '';
            return '<div class="chart-bar-group"><div class="bar-subgroup">' +
                '<div class="single-bar bar-green" style="height:' + h(ap) + '%;position:relative;" title="Active Policies: ' + ap + '">' + valSpan(ap) + '</div>' +
                '<div class="single-bar bar-purple" style="height:' + h(cl) + '%;position:relative;" title="Claims: ' + cl + '">' + valSpan(cl) + '</div>' +
                '<div class="single-bar bar-blue" style="height:' + h(en) + '%;position:relative;" title="Enrollments: ' + en + '">' + valSpan(en) + '</div>' +
                '</div><span class="bar-x-label">' + label + '</span></div>';
        }).join('');
    }

    async function loadAndRender(range) {
        const apiRange = RANGE_MAP[range] || 'last7';
        if (perfCache[apiRange]) { renderChart(perfCache[apiRange]); return; }
        if (barChartContainer) barChartContainer.innerHTML = '<div style="padding:30px;color:var(--text-muted);text-align:center;width:100%;">Loading…</div>';
        try {
            const data = await AjahFiAPI.get('/coordinator/performance?range=' + apiRange);
            const days = (data && data.days) || [];
            perfCache[apiRange] = days;
            renderChart(days);
        } catch (err) {
            console.warn('Could not load performance:', err.message);
            if (barChartContainer) barChartContainer.innerHTML = '<div style="padding:30px;color:var(--color-rejected);text-align:center;width:100%;">Could not load activity data.</div>';
        }
    }

    // --- Toggle Chart Filter Range ---
    const rangeButtons = document.querySelectorAll('.btn-chart-range');
    rangeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            rangeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const range = btn.getAttribute('data-range');
            loadAndRender(range);
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

    // Initial load from the backend
    const activeRangeBtn = document.querySelector('.btn-chart-range.active');
    loadAndRender(activeRangeBtn ? activeRangeBtn.getAttribute('data-range') : '7');

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
