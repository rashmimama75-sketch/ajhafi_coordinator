document.addEventListener('DOMContentLoaded', () => {
    // --- Activity Overview chart data (aggregated from /coordinator/live_activity) ---
    let activities = [];

    function niceCeil(n) { return Math.max(5, Math.ceil((n || 0) / 5) * 5); }

    function updateChartAxis(maxVal) {
        const labels = document.querySelectorAll('.grid-axis-label');
        const steps = [maxVal, maxVal * 0.8, maxVal * 0.6, maxVal * 0.4, maxVal * 0.2, 0];
        labels.forEach((el, i) => { if (steps[i] != null) el.textContent = Math.round(steps[i]); });
    }

    function buildChartData(range) {
        const now = new Date();
        let buckets, span; // span = days per bucket
        if (range === '30') { buckets = 6; span = 5; }
        else if (range === '365') { buckets = 12; span = 30; }
        else { buckets = 7; span = 1; }

        const arr = [];
        for (let i = 0; i < buckets; i++) {
            arr.push({ active: 0, claims: 0, enrollments: 0, endDate: new Date(now.getTime() - i * span * 86400000) });
        }
        activities.forEach(a => {
            const t = new Date(String(a.time || '').replace(' ', 'T'));
            if (isNaN(t)) return;
            const daysAgo = Math.floor((now - t) / 86400000);
            if (daysAgo < 0) return;
            const b = Math.floor(daysAgo / span);
            if (b >= buckets) return;
            const type = String(a.type || '').toLowerCase();
            if (type === 'enrollment') { arr[b].active++; arr[b].enrollments++; }
            else if (type === 'claim') arr[b].claims++;
        });
        arr.reverse(); // oldest bucket on the left
        const fmtDay = d => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
        const fmtMon = d => d.toLocaleDateString('en-GB', { month: 'short' });
        return arr.map(b => ({
            active: b.active, claims: b.claims, enrollments: b.enrollments,
            label: (range === '365') ? fmtMon(b.endDate) : fmtDay(b.endDate)
        }));
    }

    // --- State Management ---
    const sidebar = document.getElementById('appSidebar');
    const sidebarToggleBtn = document.getElementById('sidebarToggle');
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationDropdown = document.getElementById('notificationDropdown');
    const profileBtn = document.getElementById('profileDropdownBtn');
    const barChartContainer = document.getElementById('barChartContainer');

    // --- Render Chart Function (heights scaled to the real data) ---
    function renderChart(range) {
        if (!barChartContainer) return;
        const data = buildChartData(range);
        let max = 0;
        data.forEach(d => { max = Math.max(max, d.active, d.claims, d.enrollments); });
        const niceMax = niceCeil(max);
        updateChartAxis(niceMax);
        const h = v => (niceMax > 0 ? Math.round(v / niceMax * 100) : 0);
        barChartContainer.innerHTML = data.map(item => (
            '<div class="chart-bar-group"><div class="bar-subgroup">' +
            '<div class="single-bar bar-green" style="height:' + h(item.active) + '%;" title="Active Policies: ' + item.active + '"></div>' +
            '<div class="single-bar bar-purple" style="height:' + h(item.claims) + '%;" title="Claims: ' + item.claims + '"></div>' +
            '<div class="single-bar bar-blue" style="height:' + h(item.enrollments) + '%;" title="Enrollments: ' + item.enrollments + '"></div>' +
            '</div><span class="bar-x-label">' + item.label + '</span></div>'
        )).join('');
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

    // Load activity data from the backend, then render the chart
    async function loadActivityChart() {
        if (window.AjahFiAPI) {
            try {
                const acts = await AjahFiAPI.get('/coordinator/live_activity');
                activities = Array.isArray(acts) ? acts : [];
            } catch (err) {
                console.warn('Could not load activity chart:', err.message);
                activities = [];
            }
        }
        const activeBtn = document.querySelector('.btn-chart-range.active');
        renderChart(activeBtn ? activeBtn.getAttribute('data-range') : '7');
    }
    loadActivityChart();

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
