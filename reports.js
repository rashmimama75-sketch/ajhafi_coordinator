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

    // --- Download Report (server-generated PDF from the backend, like the app) ---
    // Uses GET /coordinator/report.pdf?range=... which returns the official PDF.

    function saveBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    }

    function base64ToBlob(b64, type) {
        // Accept raw base64 or a data: URI
        const comma = b64.indexOf(',');
        if (b64.slice(0, 5) === 'data:' && comma !== -1) { b64 = b64.slice(comma + 1); }
        const bin = atob(b64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) { bytes[i] = bin.charCodeAt(i); }
        return new Blob([bytes], { type: type || 'application/pdf' });
    }

    async function fetchReportPdf(apiRange) {
        const token = AjahFiAPI.getToken();
        const headers = token ? { 'Authorization': 'Bearer ' + token } : {};
        let url = AjahFiAPI.base + '/coordinator/report.pdf';
        if (apiRange) { url += '?range=' + encodeURIComponent(apiRange); }

        let res = await fetch(url, { headers: headers });

        // Bad range value → retry once without it (range is optional on the API)
        if (res.status === 422 && apiRange) {
            res = await fetch(AjahFiAPI.base + '/coordinator/report.pdf', { headers: headers });
        }
        if (res.status === 401) {
            AjahFiAPI.clearSession();
            window.location.replace('login.html');
            throw new Error('Session expired');
        }
        if (!res.ok) { throw new Error('Report download failed (HTTP ' + res.status + ')'); }
        return res;
    }

    async function buildAndDownloadReport() {
        if (!window.AjahFiAPI) return;

        const rangeBtn = document.querySelector('.btn-chart-range.active');
        const range = rangeBtn ? rangeBtn.getAttribute('data-range') : '7';
        const apiRange = RANGE_MAP[range] || 'last7';

        const res = await fetchReportPdf(apiRange);
        const stamp = new Date().toISOString().slice(0, 10);
        const filename = 'AjahFi_Report_' + stamp + '.pdf';

        const ct = (res.headers.get('content-type') || '').toLowerCase();
        if (ct.indexOf('application/json') !== -1) {
            // Some backends wrap the file in JSON — handle a URL or base64 payload.
            const data = await res.json().catch(function () { return null; });
            const link = data && (data.url || data.pdf_url || data.file || data.download_url || data.path);
            const b64 = data && (data.pdf || data.pdf_base64 || data.base64 || data.data || data.content);
            if (link) {
                const full = AjahFiAPI.mediaUrl(link);
                const fileRes = await fetch(full, { headers: { 'Authorization': 'Bearer ' + AjahFiAPI.getToken() } });
                if (!fileRes.ok) { throw new Error('Report file fetch failed (HTTP ' + fileRes.status + ')'); }
                saveBlob(await fileRes.blob(), filename);
            } else if (b64 && typeof b64 === 'string') {
                saveBlob(base64ToBlob(b64, 'application/pdf'), filename);
            } else {
                throw new Error('Unexpected report response from server');
            }
        } else {
            // Normal case: the response body IS the PDF.
            saveBlob(await res.blob(), filename);
        }
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
