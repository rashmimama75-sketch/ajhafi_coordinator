document.addEventListener('DOMContentLoaded', () => {
    // --- Sidebar / notification ---
    const sidebar = document.getElementById('appSidebar');
    const sidebarToggleBtn = document.getElementById('sidebarToggle');
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationDropdown = document.getElementById('notificationDropdown');

    if (sidebarToggleBtn) {
        sidebarToggleBtn.addEventListener('click', (e) => { e.stopPropagation(); sidebar.classList.toggle('active'); });
    }
    document.addEventListener('click', (e) => {
        if (sidebar && !sidebar.contains(e.target) && (!sidebarToggleBtn || e.target !== sidebarToggleBtn)) sidebar.classList.remove('active');
        if (notificationDropdown && !notificationDropdown.contains(e.target) && notificationBtn && e.target !== notificationBtn && !notificationBtn.contains(e.target)) notificationDropdown.classList.remove('active');
    });
    if (notificationBtn) notificationBtn.addEventListener('click', (e) => { e.stopPropagation(); notificationDropdown.classList.toggle('active'); });

    // --- Helpers ---
    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = (val == null || val === '') ? '—' : val; };
    function cap(s) { s = String(s || ''); return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }
    function ageLabel(months) {
        if (months == null || isNaN(months)) return '—';
        months = Number(months);
        if (months < 12) return months + ' mo';
        const y = Math.floor(months / 12), m = months % 12;
        return m ? (y + ' yr ' + m + ' mo') : (y + (y === 1 ? ' Year' : ' Years'));
    }
    function fmtDate(iso) {
        if (!iso) return '—';
        const d = new Date(String(iso).replace(' ', 'T'));
        if (isNaN(d)) return String(iso);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    function money(n) { return (n == null || isNaN(n)) ? '—' : '₹ ' + Number(n).toLocaleString('en-IN'); }
    function media(p) { return window.AjahFiAPI ? AjahFiAPI.mediaUrl(p) : (p || ''); }

    const VAX_NAMES = { ppr: 'PPR', et_tt: 'ET-TT', ett: 'ET-TT', goat_pox: 'Goat Pox', fmd: 'FMD' };

    function renderVaccinations(vax) {
        const list = document.getElementById('vaccinationList');
        if (!list) return;
        if (!vax || !vax.length) {
            list.innerHTML = '<div style="padding:16px;color:var(--text-muted);font-size:13px;">No vaccination records.</div>';
            setText('lblVaccinationSummary', '');
            return;
        }
        let done = 0;
        list.innerHTML = vax.map(function (v) {
            const isDone = String(v.status || '').toLowerCase() === 'done';
            if (isDone) done++;
            const name = VAX_NAMES[String(v.type || '').toLowerCase()] || cap(String(v.type || '').replace(/_/g, ' '));
            const desc = isDone ? ('Given on ' + fmtDate(v.date)) : (v.next ? ('Due on ' + fmtDate(v.next)) : 'Pending');
            const iconBg = isDone ? 'background-color:#ecfdf5;color:#059669;' : 'background-color:#fffbeb;color:#d97706;';
            const icon = isDone ? 'fa-solid fa-check' : 'fa-solid fa-syringe';
            const pill = isDone ? 'background-color:#ecfdf5;color:#059669;' : 'background-color:#fffbeb;color:#d97706;';
            return '<div class="vaccination-item">' +
                '<div class="vaccination-item-left">' +
                '<div class="vaccination-item-icon-box" style="' + iconBg + '"><i class="' + icon + '"></i></div>' +
                '<div class="vaccination-item-title-info"><h4 class="vaccination-item-title">' + name + '</h4>' +
                '<span class="vaccination-item-desc">' + desc + '</span></div></div>' +
                '<span class="status-pill" style="' + pill + ' padding:4px 10px;border-radius:var(--radius-full);font-size:11px;font-weight:700;">' + (isDone ? 'Done' : 'Pending') + '</span></div>';
        }).join('');
        setText('lblVaccinationSummary', 'Completed: ' + done + ' / ' + vax.length);
    }

    function renderGoat(g) {
        const isActive = String(g.status).toLowerCase() === 'active';
        setText('lblGoatHeaderId', g.ear_tag_number);
        const statusPill = document.getElementById('lblGoatStatus');
        if (statusPill) {
            statusPill.textContent = '• ' + cap(g.status);
            statusPill.style.backgroundColor = isActive ? 'var(--brand-primary)' : '#ef4444';
        }

        setText('lblEarTag', g.ear_tag_number);
        setText('lblGender', cap(g.gender));
        setText('lblAge', ageLabel(g.age_months));
        setText('lblWeight', g.weight_kg != null ? g.weight_kg + ' kg' : '—');
        setText('lblBreed', g.breed);
        setText('lblDob', fmtDate(g.date_of_birth));

        const farmer = g.farmer || {};
        setText('lblInsuredBy', (farmer.name || '').trim());

        const p = g.policy || {};
        setText('lblPolicyNo', p.policy_number);
        setText('lblPolicyValidTill', fmtDate(p.valid_to));
        setText('lblPolicyStart', fmtDate(p.valid_from));
        setText('lblPolicyEnd', fmtDate(p.valid_to));
        setText('lblPremium', (p.amount_paid != null) ? money(p.amount_paid) : (p.annual_premium != null ? money(p.annual_premium) : '—'));
        setText('lblIssuedBy', p.issued_by);

        // Photos: header uses the face shot; the grid shows all
        const photos = g.photos || [];
        const face = photos.find(function (x) { return x.type === 'face'; }) || photos[0];
        const headerImg = document.querySelector('.goat-header-image');
        if (headerImg) {
            headerImg.src = face ? media(face.url) : 'goat_thumbnail.png';
            headerImg.onerror = function () { this.onerror = null; this.src = 'goat_thumbnail.png'; };
        }
        const grid = document.getElementById('goatImagesGrid');
        if (grid && photos.length) {
            grid.innerHTML = photos.map(function (ph) {
                return '<div class="goat-image-grid-card"><img src="' + media(ph.url) + '" alt="' + cap(ph.type) +
                    '" onerror="this.onerror=null;this.src=\'goat_thumbnail.png\';"></div>';
            }).join('');
        }

        renderVaccinations(g.vaccinations);
    }

    // Convert a /coordinator/goats list item into the /sd/goats shape (fallback only)
    function normalizeListGoat(g) {
        return {
            ear_tag_number: g.ear_tag_number, breed: g.breed, gender: g.gender,
            age_months: g.age_months, weight_kg: g.weight_kg, status: g.status,
            date_of_birth: null, enrolled_on: g.enrolled_date,
            farmer: { name: g.farmer, village: g.village },
            photos: g.photo ? [{ type: 'face', url: g.photo }] : [],
            vaccinations: [], policy: {}
        };
    }

    // --- Goat Images toggle ---
    const btnToggleImages = document.getElementById('btnToggleImages');
    const goatImagesGrid = document.getElementById('goatImagesGrid');
    if (btnToggleImages && goatImagesGrid) {
        btnToggleImages.addEventListener('click', () => {
            const isHidden = goatImagesGrid.style.display === 'none';
            goatImagesGrid.style.display = isHidden ? 'grid' : 'none';
            btnToggleImages.textContent = isHidden ? 'Show Less' : 'Show More';
        });
    }

    async function loadGoat() {
        const id = new URLSearchParams(window.location.search).get('id');
        const headerEl = document.getElementById('lblGoatHeaderId');
        if (!id) { if (headerEl) headerEl.textContent = 'No goat selected'; return; }
        if (headerEl) headerEl.textContent = 'Loading…';
        try {
            const g = await AjahFiAPI.get('/sd/goats/' + encodeURIComponent(id));
            if (g) { renderGoat(g); return; }
            if (headerEl) headerEl.textContent = 'Goat not found';
        } catch (err) {
            // Fallback: find the goat in the coordinator list (fewer fields)
            try {
                const data = await AjahFiAPI.get('/coordinator/goats');
                const goats = (data && data.goats) || [];
                const g = goats.find(function (x) { return String(x.id) === String(id) || x.ear_tag_number === id; });
                if (g) { renderGoat(normalizeListGoat(g)); return; }
            } catch (e2) { /* ignore */ }
            if (headerEl) headerEl.textContent = 'Could not load goat';
            console.warn('goat detail load failed:', err.message);
        }
    }

    loadGoat();
});
