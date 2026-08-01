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

    // Drive the progress stepper from the backend `stages` array (the real workflow).
    function setStepperFromStages(stages) {
        const line = document.getElementById('stepperProgressLine');
        if (!Array.isArray(stages) || !stages.length) return;
        const total = stages.length;

        let filledIndex = -1, currentIndex = -1, rejectedIndex = -1;
        stages.forEach((s, i) => {
            const st = String(s.status || '').toLowerCase();
            if (st === 'completed') filledIndex = i;
            if (st === 'current') currentIndex = i;
            if (st === 'rejected') rejectedIndex = i;
        });
        const targetIndex = rejectedIndex >= 0 ? rejectedIndex : (currentIndex >= 0 ? currentIndex : filledIndex);
        if (line) line.style.width = (total > 1 ? Math.max(0, targetIndex) / (total - 1) * 100 : 0) + '%';

        stages.forEach((s, i) => {
            const stepEl = document.getElementById('step' + (i + 1));
            if (!stepEl) return;
            const circle = stepEl.querySelector('.claim-step-circle');
            const statusEl = stepEl.querySelector('.claim-step-status');
            const st = String(s.status || '').toLowerCase();
            if (circle) { circle.style.borderColor = ''; circle.style.color = ''; }
            if (statusEl) statusEl.style.color = '';

            if (st === 'completed') {
                stepEl.className = 'claim-stepper-step completed';
                if (circle) circle.innerHTML = '<i class="fa-solid fa-check"></i>';
                if (statusEl) statusEl.textContent = s.at ? fmtDate(s.at) : 'Completed';
            } else if (st === 'current') {
                stepEl.className = 'claim-stepper-step active';
                if (circle) circle.textContent = (i + 1);
                if (statusEl) { statusEl.textContent = 'In Progress'; statusEl.style.color = 'var(--brand-primary)'; }
            } else if (st === 'rejected') {
                stepEl.className = 'claim-stepper-step';
                if (circle) { circle.innerHTML = '<i class="fa-solid fa-xmark"></i>'; circle.style.borderColor = 'var(--color-rejected)'; circle.style.color = 'var(--color-rejected)'; }
                if (statusEl) { statusEl.textContent = 'Rejected'; statusEl.style.color = 'var(--color-rejected)'; }
            } else {
                stepEl.className = 'claim-stepper-step pending';
                if (circle) circle.textContent = (i + 1);
                if (statusEl) statusEl.textContent = 'Pending';
            }
        });
    }

    // Fallback stepper (used only if the backend didn't send `stages`).
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
        if (Array.isArray(c.stages) && c.stages.length) setStepperFromStages(c.stages);
        else setStepper(st.label);

        // PDF button
        const btnPDF = document.getElementById('btnDownloadPDF');
        if (btnPDF) btnPDF.onclick = () => alert('Generating PDF receipt for claim: ' + c.claim_number);

        // Approve/Reject are only active while the claim is at coordinator review
        updateActionButtons(c);
    }

    // Enable Approve/Reject only when the claim is awaiting coordinator review.
    // Once acted on (here or from the app) the claim moves on, so both buttons
    // stay disabled and the current stage is shown.
    function updateActionButtons(c) {
        const btnApprove = document.getElementById('btnClaimApprove');
        const btnReject = document.getElementById('btnClaimReject');
        const row = document.querySelector('.claim-action-buttons-row');
        if (!btnApprove || !btnReject) return;

        // Restore default labels (in case one showed "Please wait…")
        const setLabel = (btn, text) => { const s = btn.querySelector('span'); if (s) s.textContent = text; else btn.textContent = text; };
        setLabel(btnApprove, 'Approved');
        setLabel(btnReject, 'Reject');

        const stages = Array.isArray(c.stages) ? c.stages : [];
        const currentStage = stages.find(s => String(s.status).toLowerCase() === 'current');
        const stageKey = String(c.stage || (currentStage && currentStage.key) || '').toLowerCase();
        const reviewable = stageKey === 'coordinator_review';

        const setDisabled = (btn, disabled) => {
            btn.disabled = disabled;
            btn.style.opacity = disabled ? '0.5' : '';
            btn.style.cursor = disabled ? 'not-allowed' : '';
            btn.style.pointerEvents = disabled ? 'none' : '';
        };

        let msg = document.getElementById('claimActionStatus');
        if (!msg && row) {
            msg = document.createElement('div');
            msg.id = 'claimActionStatus';
            msg.style.cssText = 'flex-basis:100%;width:100%;text-align:center;margin-top:10px;padding:10px 12px;font-size:13px;font-weight:600;color:var(--text-muted);background:#f8fafc;border-radius:10px;';
            row.appendChild(msg);
        }

        if (reviewable) {
            setDisabled(btnApprove, false);
            setDisabled(btnReject, false);
            btnApprove.onclick = () => reviewClaim(c, 'approve', btnApprove);
            btnReject.onclick = () => reviewClaim(c, 'reject', btnReject);
            if (msg) msg.style.display = 'none';
        } else {
            setDisabled(btnApprove, true);
            setDisabled(btnReject, true);
            btnApprove.onclick = null;
            btnReject.onclick = null;
            const label = currentStage ? currentStage.label : mapStatus(c.status).label;
            if (msg) { msg.textContent = 'Current stage: ' + label; msg.style.display = 'block'; }
        }
    }

    // Send an approve/reject decision (one-time), then refresh the true state.
    async function reviewClaim(c, action, btn) {
        const body = { claim_number: c.claim_number, action: action };
        if (action === 'approve') {
            const amt = (c.claim_amount != null) ? c.claim_amount : c.sum_insured;
            if (amt != null) body.claim_amount = amt;
        }

        // Lock BOTH buttons immediately so the action can't be repeated.
        const btnApprove = document.getElementById('btnClaimApprove');
        const btnReject = document.getElementById('btnClaimReject');
        [btnApprove, btnReject].forEach(b => {
            if (b) { b.disabled = true; b.style.pointerEvents = 'none'; b.style.opacity = '0.5'; }
        });
        const span = btn.querySelector('span');
        if (span) span.textContent = 'Please wait…';

        try {
            await AjahFiAPI.post('/coordinator/review_claim', body);
        } catch (err) {
            console.warn('review_claim error:', err.message);
        } finally {
            // Reload so the status badge, progress stepper and buttons all
            // reflect the claim's new stage (buttons stay disabled once past review).
            loadClaim();
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
