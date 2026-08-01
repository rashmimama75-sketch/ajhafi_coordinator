document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const sidebar = document.getElementById('appSidebar');
    const sidebarToggleBtn = document.getElementById('sidebarToggle');
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationDropdown = document.getElementById('notificationDropdown');
    const profileBtn = document.getElementById('profileDropdownBtn');

    // --- Sidebar & Notification Toggle ---
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
    function cap(s) { s = String(s || ''); return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }
    function fmtDate(iso) {
        if (!iso) return '—';
        const d = new Date(String(iso).replace(' ', 'T'));
        if (isNaN(d)) return String(iso);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    function ageLabel(months) {
        if (months == null || isNaN(months)) return '—';
        months = Number(months);
        if (months < 12) return months + ' mo';
        const y = Math.floor(months / 12), m = months % 12;
        return m ? (y + 'y ' + m + 'm') : (y + (y === 1 ? ' Year' : ' Years'));
    }
    function money(n) { return (n == null || isNaN(n)) ? '—' : '₹ ' + Number(n).toLocaleString('en-IN'); }
    function mapStatus(s) {
        const k = String(s || '').toLowerCase();
        if (k === 'claimed' || k === 'approved' || k === 'paid') return { label: 'Approved', cls: 'approved' };
        if (k === 'rejected') return { label: 'Rejected', cls: 'rejected' };
        if (k === 'hold' || k === 'under review') return { label: 'Under Review', cls: 'under-review' };
        if (k === 'pending') return { label: 'Pending', cls: 'pending' };
        return { label: cap(s) || '—', cls: 'pending' };
    }

    const VAX_NAMES = { ppr: 'PPR Vaccine', et_tt: 'Enterotoxaemia (ET-TT)', ett: 'Enterotoxaemia (ET)', goat_pox: 'Goat Pox Vaccine', fmd: 'FMD Vaccine' };

    function renderVaccinations(vaccinations) {
        const body = document.getElementById('vaccinationTableBody');
        if (!body) return;
        if (!vaccinations || !vaccinations.length) {
            body.innerHTML = '<tr><td colspan="4" style="padding:16px;text-align:center;color:var(--text-muted);font-size:13px;">No vaccination records.</td></tr>';
            return;
        }
        body.innerHTML = vaccinations.map(v => {
            const name = VAX_NAMES[(v.vaccine_type || '').toLowerCase()] || cap((v.vaccine_type || '').replace(/_/g, ' ')) + ' Vaccine';
            const done = String(v.status || '').toLowerCase() === 'done' || String(v.status || '').toLowerCase() === 'completed';
            const statusLabel = done ? 'Completed' : cap(v.status || 'Pending');
            const statusCls = done ? 'approved' : 'pending';
            const by = v.batch_number ? ('Batch: ' + v.batch_number) : '—';
            return `
                <tr>
                    <td style="padding: 12px 16px; font-size: 13px; font-weight: 600; color: var(--text-main); border-bottom: 1px solid var(--border-color);">${name}</td>
                    <td style="padding: 12px 16px; font-size: 13px; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">${fmtDate(v.date)}</td>
                    <td style="padding: 12px 16px; font-size: 13px; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">${by}</td>
                    <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color);"><span class="badge ${statusCls}" style="padding: 4px 8px; font-size: 11px;">${statusLabel}</span></td>
                </tr>`;
        }).join('');
    }

    function setStepper(statusLabel) {
        const stepperProgressLine = document.getElementById('stepperProgressLine');
        const step3 = document.getElementById('step3');
        const step3Status = document.getElementById('step3Status');
        const step4 = document.getElementById('step4');
        const step4Status = document.getElementById('step4Status');
        const step5 = document.getElementById('step5');
        const step5Status = document.getElementById('step5Status');
        if (!stepperProgressLine || !step3 || !step4 || !step5) return;

        if (statusLabel === 'Pending') {
            stepperProgressLine.style.width = '37.5%';
            step3.classList.add('active');
            if (step3Status) { step3Status.textContent = 'In Progress'; step3Status.style.color = 'var(--brand-primary)'; }
            step4.className = 'claim-stepper-step pending';
            if (step4Status) step4Status.textContent = 'Pending';
            step5.className = 'claim-stepper-step pending';
            if (step5Status) step5Status.textContent = 'Pending';
        } else if (statusLabel === 'Under Review') {
            stepperProgressLine.style.width = '62.5%';
            step3.className = 'claim-stepper-step completed';
            const c3 = step3.querySelector('.claim-step-circle'); if (c3) c3.innerHTML = '<i class="fa-solid fa-check"></i>';
            step4.className = 'claim-stepper-step active';
            if (step4Status) { step4Status.textContent = 'In Progress'; step4Status.style.color = 'var(--brand-primary)'; }
            step5.className = 'claim-stepper-step pending';
            if (step5Status) step5Status.textContent = 'Pending';
        } else if (statusLabel === 'Approved') {
            stepperProgressLine.style.width = '100%';
            ['3', '4', '5'].forEach(n => {
                const st = document.getElementById('step' + n);
                st.className = 'claim-stepper-step completed';
                const c = st.querySelector('.claim-step-circle'); if (c) c.innerHTML = '<i class="fa-solid fa-check"></i>';
            });
            if (step4Status) step4Status.textContent = 'Approved';
            if (step5Status) step5Status.textContent = 'Paid';
        } else if (statusLabel === 'Rejected') {
            stepperProgressLine.style.width = '75%';
            step3.className = 'claim-stepper-step completed';
            const c3 = step3.querySelector('.claim-step-circle'); if (c3) c3.innerHTML = '<i class="fa-solid fa-check"></i>';
            step4.className = 'claim-stepper-step active';
            const c4 = step4.querySelector('.claim-step-circle');
            if (c4) { c4.style.borderColor = 'var(--color-rejected)'; c4.style.color = 'var(--color-rejected)'; }
            if (step4Status) { step4Status.textContent = 'Rejected'; step4Status.style.color = 'var(--color-rejected)'; }
            step5.className = 'claim-stepper-step pending';
            if (step5Status) step5Status.textContent = 'Cancelled';
        }
    }

    const EVIDENCE_LABELS = {
        ear_tag: 'Ear Tag Photo',
        full_body: 'Full Body Photo',
        close_up: 'Close-up Photo',
        location: 'Site Visit Photo',
        site_visit: 'Site Visit Photo',
        document: 'Document',
        documents: 'Documents'
    };

    function renderEvidence(list) {
        const grid = document.getElementById('evidenceGrid');
        if (!grid) return;
        if (!list || !list.length) {
            grid.innerHTML = '<div class="claim-evidence-item" style="grid-column:1 / -1;text-align:center;color:var(--text-muted);padding:20px;">No evidence uploaded for this claim.</div>';
            return;
        }
        grid.innerHTML = list.map(function (ev) {
            const url = (window.AjahFiAPI ? AjahFiAPI.mediaUrl(ev.url) : ev.url) || '';
            const key = String(ev.type || '').toLowerCase();
            const label = EVIDENCE_LABELS[key] || cap(String(ev.type || 'Evidence').replace(/_/g, ' '));
            const isPdf = /\.pdf(\?|$)/i.test(ev.url || '');
            if (isPdf) {
                return '<div class="claim-evidence-item" style="justify-content:center;height:100%;">' +
                    '<a href="' + url + '" target="_blank" rel="noopener" class="claim-evidence-img" ' +
                    'style="display:flex;align-items:center;justify-content:center;background-color:#f1f5f9;text-decoration:none;">' +
                    '<i class="fa-regular fa-file-pdf" style="font-size:28px;color:var(--color-rejected);"></i></a>' +
                    '<span class="claim-evidence-lbl">' + label + '</span></div>';
            }
            return '<div class="claim-evidence-item">' +
                '<a href="' + url + '" target="_blank" rel="noopener" title="Open full image">' +
                '<img src="' + url + '" alt="' + label + '" class="claim-evidence-img" ' +
                'onerror="this.onerror=null;this.src=\'goat_thumbnail.png\';"></a>' +
                '<span class="claim-evidence-lbl">' + label + '</span></div>';
        }).join('');
    }

    function renderClaim(c) {
        const goat = c.goat || {};
        const st = mapStatus(c.status);

        setText('lblClaimId', c.claim_number);
        const statusEl = document.getElementById('lblClaimStatus');
        if (statusEl) { statusEl.textContent = st.label; statusEl.className = 'badge ' + st.cls; }
        setText('lblReportedDate', fmtDate(c.claim_reported_on));
        setText('lblReportedBy', (c.reported_by || c.farmer || '').trim());

        // Goat photo in the Goat Information card
        const goatImg = document.getElementById('goatAvatar');
        if (goatImg) {
            goatImg.src = goat.photo ? (window.AjahFiAPI ? AjahFiAPI.mediaUrl(goat.photo) : goat.photo) : 'goat_thumbnail.png';
            goatImg.onerror = function () { this.onerror = null; this.src = 'goat_thumbnail.png'; };
        }

        setText('lblGoatId', goat.ear_tag_number);
        setText('lblEarTag', goat.ear_tag_number);
        setText('lblBreed', goat.breed);
        setText('lblGender', cap(goat.gender));
        setText('lblAge', ageLabel(goat.age_months));
        setText('lblSumInsured', money(c.sum_insured));
        setText('lblPolicyNumber', c.policy_number);
        setText('lblPolicyValid', fmtDate(c.policy_valid_to));

        setText('lblDateOfDeath', fmtDate(c.date_of_death));
        setText('lblCauseOfDeath', c.cause_of_death);
        setText('lblLocation', c.location);
        setText('lblDeathReportedBy', (c.reported_by || c.farmer || '').trim());

        renderVaccinations(c.vaccinations);
        renderEvidence(c.evidence);
        setStepper(st.label);

        // Action buttons (onclick assignment so re-renders don't stack handlers)
        const btnPDF = document.getElementById('btnDownloadPDF');
        if (btnPDF) btnPDF.onclick = () => alert('Generating PDF receipt for claim: ' + c.claim_number);
        const btnApprove = document.getElementById('btnClaimApprove');
        if (btnApprove) btnApprove.onclick = () => reviewClaim(c, 'approve', btnApprove);
        const btnReject = document.getElementById('btnClaimReject');
        if (btnReject) btnReject.onclick = () => reviewClaim(c, 'reject', btnReject);
    }

    // Send an approve/reject decision to the backend, then refresh the page.
    async function reviewClaim(c, action, btn) {
        const body = { claim_number: c.claim_number, action: action };

        if (action === 'approve') {
            const def = (c.claim_amount != null ? c.claim_amount : c.sum_insured) || '';
            const input = prompt('Approve claim ' + c.claim_number + '\nEnter the approved claim amount (₹):', def);
            if (input === null) return; // cancelled
            const amt = Number(String(input).replace(/[^0-9.]/g, ''));
            if (isNaN(amt) || amt <= 0) { alert('Please enter a valid amount.'); return; }
            body.claim_amount = amt;
        } else {
            if (!confirm('Reject claim ' + c.claim_number + '?\nThis submits your review decision to the backend.')) return;
        }

        const original = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Please wait…';
        try {
            const res = await AjahFiAPI.post('/coordinator/review_claim', body);
            if (res && res.status === 'success') {
                alert('Claim ' + (action === 'approve' ? 'approved' : 'rejected') + ' successfully.');
                loadClaim(); // refresh with the new state
            } else {
                alert('Could not ' + action + ' claim: ' + ((res && res.reason) || 'unknown error'));
                btn.disabled = false;
                btn.textContent = original;
            }
        } catch (err) {
            alert('Could not ' + action + ' claim: ' + err.message);
            btn.disabled = false;
            btn.textContent = original;
        }
    }

    async function loadClaim() {
        const claimNo = new URLSearchParams(window.location.search).get('id');
        const idEl = document.getElementById('lblClaimId');
        if (!claimNo) { if (idEl) idEl.textContent = 'No claim selected'; return; }
        if (idEl) idEl.textContent = 'Loading…';
        try {
            const c = await AjahFiAPI.get('/coordinator/claims/' + encodeURIComponent(claimNo));
            if (c) renderClaim(c);
        } catch (err) {
            if (idEl) idEl.textContent = 'Could not load claim';
            console.warn('claim detail load failed:', err.message);
        }
    }

    loadClaim();
});
