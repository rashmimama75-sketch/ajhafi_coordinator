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
    function clearTrend(id) { const el = document.getElementById(id); if (el) el.innerHTML = ''; }

    function renderRecent(recent) {
        const container = document.getElementById('activityContainer');
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

    function renderDidi(d) {
        const name = (d.full_name || '').trim();
        const avatar = document.getElementById('lblAvatar');
        if (avatar) {
            avatar.src = d.photo ? media(d.photo) : 'goat_thumbnail.png';
            avatar.onerror = function () { this.src = 'goat_thumbnail.png'; };
            avatar.alt = name;
        }
        setText('lblName', name);
        const statusEl = document.getElementById('lblStatus');
        if (statusEl) {
            statusEl.textContent = d.is_active ? 'Active' : 'Inactive';
            statusEl.className = 'badge ' + (d.is_active ? 'approved' : 'rejected');
        }
        setText('lblPhone', d.mobile_number);
        setText('lblRegion', d.address || [d.village, d.block, d.district, d.state].filter(Boolean).join(', '));
        const idEl = document.getElementById('lblDidiId');
        if (idEl) idEl.textContent = 'Didi ID: ' + (d.didi_code || '—');
        const joinedEl = document.getElementById('lblJoined');
        if (joinedEl) joinedEl.textContent = 'Joined on ' + fmtDate(d.joined_at);

        setText('lblDob', d.date_of_birth);
        setText('lblGender', d.gender);
        setText('lblAadhaar', d.aadhaar_masked);
        setText('lblWhatsapp', d.mobile_number);
        setText('lblAddress', d.address);
        setText('lblVillage', d.village);
        setText('lblBlock', d.block);
        setText('lblDistrict', d.district);
        setText('lblStateName', d.state);
        setText('lblPinCode', d.pincode);

        // Work info
        setText('lblWorkingRegion', d.district || d.block || d.village);
        setText('lblWorkingVillages', d.village);
        setText('lblSupervisor', (d.supervisor || '').trim());
        setText('lblReportingTo', d.reporting_to);
        setText('lblAssignedOn', fmtDate(d.joined_at));

        // Performance overview (maps directly to API fields)
        setText('lblPoliciesAdded', d.policies_added);
        setText('lblClaimsAssisted', d.claims_assisted);
        setText('lblVerificationsDone', d.verifications_done);
        setText('lblVaccinationsRecorded', d.vaccinations_recorded);
        // Remove the mock trend badges (no trend data from the API)
        clearTrend('lblPoliciesTrend');
        clearTrend('lblClaimsTrend');
        clearTrend('lblVerificationsTrend');
        clearTrend('lblVaccinationsTrend');

        const btnCall = document.getElementById('btnCallDidi');
        if (btnCall) btnCall.href = 'tel:' + (d.mobile_number || '');
        const btnWa = document.getElementById('btnWhatsappDidi');
        if (btnWa) btnWa.href = 'https://wa.me/91' + (d.mobile_number || '');

        renderRecent(d.recent);
    }

    async function loadDidi() {
        const id = new URLSearchParams(window.location.search).get('id');
        const nameEl = document.getElementById('lblName');
        if (!id) { if (nameEl) nameEl.textContent = 'No Didi selected'; return; }
        if (nameEl) nameEl.textContent = 'Loading…';
        try {
            const d = await AjahFiAPI.get('/coordinator/didis/' + encodeURIComponent(id));
            if (d) renderDidi(d);
        } catch (err) {
            if (nameEl) nameEl.textContent = 'Could not load Suraksha Didi';
            console.warn('didi detail load failed:', err.message);
        }
    }

    loadDidi();
});
