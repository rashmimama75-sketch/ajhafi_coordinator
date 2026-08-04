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
        const valSpan = v => '<span class="bar-value" style="position:absolute;top:-15px;left:50%;transform:translateX(-50%);font-size:9px;font-weight:700;color:#334155;white-space:nowrap;">' + v + '</span>';
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

    // --- OpenStreetMap (Leaflet) with active-goat locations ---
    function initReportsMap() {
        const el = document.getElementById('reportsMap');
        if (!el || typeof L === 'undefined') return;

        const map = L.map(el, { scrollWheelZoom: true }).setView([20.5, 82.5], 6);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
        setTimeout(function () { map.invalidateSize(); }, 250);

        if (!window.AjahFiAPI) return;
        AjahFiAPI.get('/coordinator/goat_locations').then(function (locs) {
            locs = Array.isArray(locs) ? locs : [];
            const markers = [];
            locs.forEach(function (loc) {
                if (loc.lat == null || loc.lng == null) return;
                const count = loc.active_goats || 0;
                const icon = L.divIcon({
                    className: 'goat-marker',
                    html: '<div style="background:#16a34a;color:#fff;border-radius:50%;width:36px;height:36px;' +
                        'display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;' +
                        'border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.35);">' + count + '</div>',
                    iconSize: [36, 36], iconAnchor: [18, 18]
                });
                const m = L.marker([loc.lat, loc.lng], { icon: icon }).addTo(map);
                m.bindPopup('<strong>' + (loc.area || 'Area') + '</strong><br>Active Goats: ' + count);
                markers.push(m);
            });
            if (markers.length) {
                map.fitBounds(L.featureGroup(markers).getBounds().pad(0.4), { maxZoom: 10 });
            }
        }).catch(function (err) { console.warn('goat locations load failed:', err.message); });
    }
    initReportsMap();

    // --- Download Report (PDF export of the live report data) ---
    const RANGE_LABEL = { '7': 'Last 7 Days', '30': 'Last 1 Month', '365': 'Last 1 Year' };

    function getJsPDF() {
        // jsPDF UMD exposes itself as window.jspdf.jsPDF
        return (window.jspdf && window.jspdf.jsPDF) ? window.jspdf.jsPDF : null;
    }

    async function buildAndDownloadReport() {
        if (!window.AjahFiAPI) return;
        const JsPDF = getJsPDF();
        if (!JsPDF) { throw new Error('PDF library not loaded'); }

        const rangeBtn = document.querySelector('.btn-chart-range.active');
        const range = rangeBtn ? rangeBtn.getAttribute('data-range') : '7';
        const apiRange = RANGE_MAP[range] || 'last7';
        const rangeLabel = RANGE_LABEL[range] || 'Last 7 Days';

        // Pull the same data the page shows: KPIs + the activity series.
        const [d, days] = await Promise.all([
            AjahFiAPI.get('/coordinator/dashboard').catch(function () { return null; }),
            (perfCache[apiRange]
                ? Promise.resolve(perfCache[apiRange])
                : AjahFiAPI.get('/coordinator/performance?range=' + apiRange)
                    .then(function (r) { return (r && r.days) || []; })
                    .catch(function () { return []; }))
        ]);

        const now = new Date();
        const doc = new JsPDF({ unit: 'pt', format: 'a4' });
        const pageW = doc.internal.pageSize.getWidth();
        const marginX = 40;
        // Use "Rs." rather than the ₹ glyph — the built-in PDF font can't render ₹.
        const rupee = function (n) {
            if (n == null || isNaN(n)) return '-';
            return 'Rs. ' + Number(n).toLocaleString('en-IN');
        };
        const numOrDash = function (n) { return (n == null || isNaN(n)) ? '-' : Number(n).toLocaleString('en-IN'); };

        // Header
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.setTextColor(22, 101, 52); // brand green
        doc.text('AjahFi Coordinator Report', marginX, 50);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text('Generated: ' + now.toLocaleString('en-IN'), marginX, 70);
        doc.text('Activity range: ' + rangeLabel, marginX, 84);
        doc.setDrawColor(220);
        doc.line(marginX, 94, pageW - marginX, 94);

        // Summary table
        doc.autoTable({
            startY: 110,
            head: [['Summary', 'Value']],
            body: [
                ['Active Policies', numOrDash(d && d.active_policies)],
                ['Total Claims', numOrDash(d && d.total_claims)],
                ['Today Premium Collection', rupee(d && d.range_premium)],
                ['Total Premium Collection', rupee(d && d.total_premium)]
            ],
            theme: 'grid',
            headStyles: { fillColor: [22, 101, 52], textColor: 255, fontStyle: 'bold' },
            styles: { fontSize: 10, cellPadding: 6 },
            margin: { left: marginX, right: marginX }
        });

        // Activity Overview table
        const bodyRows = (days || []).map(function (row) {
            return [
                row.label || row.date || '',
                numOrDash(row.active_policies || 0),
                numOrDash(row.claims || 0),
                numOrDash(row.enrollments || 0)
            ];
        });
        doc.autoTable({
            startY: (doc.lastAutoTable ? doc.lastAutoTable.finalY : 130) + 24,
            head: [['Date', 'Active Policies', 'Claims', 'Enrollments']],
            body: bodyRows.length ? bodyRows : [['No activity data', '', '', '']],
            theme: 'striped',
            headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
            styles: { fontSize: 10, cellPadding: 6 },
            columnStyles: { 1: { halign: 'center' }, 2: { halign: 'center' }, 3: { halign: 'center' } },
            margin: { left: marginX, right: marginX },
            didDrawPage: function () {
                // Section title above the activity table
            }
        });

        const stamp = now.toISOString().slice(0, 10);
        doc.save('AjahFi_Report_' + stamp + '.pdf');
    }

    const downloadCard = document.getElementById('downloadReportCard');
    const downloadSubtitle = document.getElementById('downloadReportSubtitle');
    if (downloadCard) {
        let busy = false;
        const run = async function () {
            if (busy) return;
            busy = true;
            const original = downloadSubtitle ? downloadSubtitle.textContent : '';
            if (downloadSubtitle) downloadSubtitle.textContent = 'Preparing report…';
            try {
                await buildAndDownloadReport();
                if (downloadSubtitle) downloadSubtitle.textContent = 'Report downloaded ✓';
            } catch (err) {
                console.warn('Download failed:', err.message);
                if (downloadSubtitle) downloadSubtitle.textContent = 'Could not build report — try again';
            } finally {
                busy = false;
                setTimeout(function () { if (downloadSubtitle) downloadSubtitle.textContent = original || 'Download detailed reports (PDF)'; }, 2500);
            }
        };
        downloadCard.addEventListener('click', run);
        downloadCard.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); run(); }
        });
    }
});
