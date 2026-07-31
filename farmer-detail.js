document.addEventListener('DOMContentLoaded', () => {
    // --- Sidebar & Notification setup ---
    const sidebar = document.getElementById('appSidebar');
    const sidebarToggleBtn = document.getElementById('sidebarToggle');
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationDropdown = document.getElementById('notificationDropdown');
    const profileBtn = document.getElementById('profileDropdownBtn');

    if (sidebarToggleBtn) {
        sidebarToggleBtn.addEventListener('click', (e) => { e.stopPropagation(); sidebar.classList.toggle('active'); });
    }
    document.addEventListener('click', (e) => {
        if (sidebar && !sidebar.contains(e.target) && (!sidebarToggleBtn || e.target !== sidebarToggleBtn)) sidebar.classList.remove('active');
        if (notificationDropdown && !notificationDropdown.contains(e.target) && notificationBtn && e.target !== notificationBtn && !notificationBtn.contains(e.target)) notificationDropdown.classList.remove('active');
    });
    if (notificationBtn) notificationBtn.addEventListener('click', (e) => { e.stopPropagation(); notificationDropdown.classList.toggle('active'); });
    if (profileBtn) profileBtn.addEventListener('click', () => alert("Profile settings & Coordinator options coming soon!"));

    // --- Helpers ---
    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = (val == null || val === '') ? '—' : val; };
    function fmtDate(iso) {
        if (!iso) return '—';
        const d = new Date(iso);
        if (isNaN(d)) return String(iso);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    function media(p) { return window.AjahFiAPI ? AjahFiAPI.mediaUrl(p) : (p || ''); }
    function escapeHtml(s) {
        return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    }
    function relabelStat(valId, label, value) {
        const el = document.getElementById(valId);
        if (!el) return;
        el.textContent = (value == null ? '—' : value);
        const lbl = el.previousElementSibling;
        if (lbl && lbl.classList && lbl.classList.contains('summary-box-label')) lbl.textContent = label;
    }

    function renderRecent(recent) {
        const container = document.querySelector('.recent-activity-list-container');
        if (!container) return;
        if (!recent || !recent.length) {
            container.innerHTML = '<div style="padding:24px;color:var(--text-muted);text-align:center;">No recent activity.</div>';
            return;
        }
        const iconFor = (type) => {
            const t = (type || '').toLowerCase();
            if (t === 'claim') return { icon: 'fa-hand-holding-dollar', cls: 'bg-purple-light text-purple' };
            if (t === 'policy') return { icon: 'fa-file-invoice', cls: 'bg-green-light text-green' };
            if (t === 'vaccination') return { icon: 'fa-syringe', cls: 'bg-blue-light text-blue' };
            return { icon: 'fa-user-plus', cls: 'bg-green-light text-green' };
        };
        container.innerHTML = recent.map(a => {
            const ic = iconFor(a.type);
            return `
                <div class="detail-activity-item">
                    <div class="activity-left">
                        <div class="activity-icon ${ic.cls}"><i class="fa-solid ${ic.icon}"></i></div>
                        <div class="activity-text">
                            <h5 class="activity-title-val">${escapeHtml(a.title || '')}</h5>
                            <p class="activity-subtext-val">${escapeHtml(fmtDate(a.at))}</p>
                        </div>
                    </div>
                    <i class="fa-solid fa-chevron-right chevron-nav-icon"></i>
                </div>`;
        }).join('');
    }

    function renderFarmer(f) {
        const name = (f.full_name || '').trim();
        const avatar = document.getElementById('lblAvatar');
        if (avatar) {
            avatar.src = f.photo ? media(f.photo) : 'goat_thumbnail.png';
            avatar.onerror = function () { this.src = 'goat_thumbnail.png'; };
            avatar.alt = name;
        }
        setText('lblName', name);
        const statusEl = document.getElementById('lblStatus');
        if (statusEl) {
            statusEl.textContent = f.is_active ? 'Active Farmer' : 'Inactive Farmer';
            statusEl.className = 'badge ' + (f.is_active ? 'approved' : 'rejected');
        }
        setText('lblPhone', f.mobile_number);
        setText('lblRegion', f.address || [f.village, f.block, f.district, f.state].filter(Boolean).join(', '));
        const idEl = document.getElementById('lblFarmerId');
        if (idEl) idEl.textContent = 'Farmer ID: ' + (f.didi_code || '—');
        const joinedEl = document.getElementById('lblJoined');
        if (joinedEl) joinedEl.textContent = 'Joined on ' + fmtDate(f.joined_at);

        setText('lblDob', f.date_of_birth);
        setText('lblGender', f.gender);
        setText('lblAadhaar', f.aadhaar_masked);
        setText('lblWhatsapp', f.mobile_number);
        setText('lblAddress', f.address);
        setText('lblStateName', f.state);
        setText('lblPinCode', f.pincode);
        setText('lblVillage', f.village);
        setText('lblGp', f.village);
        setText('lblBlock', f.block);
        setText('lblDistrict', f.district);
        setText('lblLandHolding', '—');
        setText('lblFarmingType', 'Goat Rearing');

        // Stat boxes: relabelled to the metrics the API actually provides
        relabelStat('lblTotalGoats', 'Policies Added', f.policies_added);
        relabelStat('lblInsuredGoats', 'Claims Assisted', f.claims_assisted);
        relabelStat('lblActivePolicies', 'Verifications', f.verifications_done);
        relabelStat('lblTotalClaims', 'Vaccinations', f.vaccinations_recorded);

        const btnCall = document.getElementById('btnCallFarmer');
        if (btnCall) btnCall.href = 'tel:' + (f.mobile_number || '');
        const btnWa = document.getElementById('btnWhatsappFarmer');
        if (btnWa) btnWa.href = 'https://wa.me/91' + (f.mobile_number || '');

        renderRecent(f.recent);
    }

    async function loadFarmer() {
        const id = new URLSearchParams(window.location.search).get('id');
        const nameEl = document.getElementById('lblName');
        if (!id) { if (nameEl) nameEl.textContent = 'No farmer selected'; return; }
        if (nameEl) nameEl.textContent = 'Loading…';
        try {
            const f = await AjahFiAPI.get('/coordinator/farmers/' + encodeURIComponent(id));
            if (f) renderFarmer(f);
        } catch (err) {
            if (nameEl) nameEl.textContent = 'Could not load farmer';
            console.warn('farmer detail load failed:', err.message);
        }
    }

    loadFarmer();
});
