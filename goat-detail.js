document.addEventListener('DOMContentLoaded', () => {
    // --- Sidebar navigation toggle ---
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
        const d = new Date(iso);
        if (isNaN(d)) return String(iso);
        return d.toLocaleDateString('en-CA'); // yyyy-mm-dd to match the existing layout
    }
    function media(p) { return window.AjahFiAPI ? AjahFiAPI.mediaUrl(p) : (p || ''); }

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
        setText('lblInsuredBy', (g.farmer || '').trim());

        // Fields not exposed to the coordinator role
        setText('lblDob', '—');
        setText('lblPolicyValidTill', '—');
        setText('lblPolicyNo', '—');
        setText('lblPolicyStart', fmtDate(g.enrolled_date));
        setText('lblPolicyEnd', '—');
        setText('lblPremium', '—');

        // Photos
        const photo = g.photo ? media(g.photo) : 'goat_thumbnail.png';
        const headerImg = document.querySelector('.goat-header-image');
        if (headerImg) { headerImg.src = photo; headerImg.onerror = function () { this.src = 'goat_thumbnail.png'; }; }
        document.querySelectorAll('.goat-image-grid-card img').forEach(img => {
            img.src = photo;
            img.onerror = function () { this.src = 'goat_thumbnail.png'; };
        });

        // Vaccination records are not available via the coordinator goats endpoint
        const vaccinationList = document.getElementById('vaccinationList');
        if (vaccinationList) {
            vaccinationList.innerHTML = '<div style="padding:16px;color:var(--text-muted);font-size:13px;">Vaccination records are not available for this view.</div>';
        }
        setText('lblVaccinationSummary', '');

        const btnViewPolicyDetails = document.getElementById('btnViewPolicyDetails');
        if (btnViewPolicyDetails) {
            btnViewPolicyDetails.addEventListener('click', () => alert('Full policy details are not available in this view.'));
        }
    }

    // --- Goat Images Toggle ---
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
            const data = await AjahFiAPI.get('/coordinator/goats');
            const goats = (data && data.goats) || [];
            const g = goats.find(x => String(x.id) === String(id) || x.ear_tag_number === id);
            if (g) {
                renderGoat(g);
            } else if (headerEl) {
                headerEl.textContent = 'Goat not found';
            }
        } catch (err) {
            if (headerEl) headerEl.textContent = 'Could not load goat';
            console.warn('goat detail load failed:', err.message);
        }
    }

    loadGoat();
});
