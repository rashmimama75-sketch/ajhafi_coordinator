document.addEventListener('DOMContentLoaded', () => {
    // --- Mock Sparkline Data ---
    const datesLabel = ['17 Jul', '19 Jul', '21 Jul', '23 Jul'];
    const activePoliciesData = [800, 920, 850, 986];
    const claimsHistoryData = [45, 62, 55, 72];
    const enrollmentsData = [20, 35, 30, 48];

    // Helper for gradients
    function getGradient(ctx, colorStart, colorEnd) {
        const gradient = ctx.createLinearGradient(0, 0, 0, 70);
        gradient.addColorStop(0, colorStart);
        gradient.addColorStop(1, colorEnd);
        return gradient;
    }

    // --- Search Filter Logic (queries live items) ---
    const searchInput = document.getElementById('activitySearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            document.querySelectorAll('.activity-timeline-item').forEach(item => {
                const title = (item.querySelector('.activity-title') || {}).textContent || '';
                const desc = (item.querySelector('.activity-description') || {}).textContent || '';
                const badgesText = Array.from(item.querySelectorAll('.activity-badge'))
                    .map(badge => badge.textContent.toLowerCase()).join(' ');
                const hay = (title + ' ' + desc + ' ' + badgesText).toLowerCase();
                item.style.display = hay.includes(query) ? 'flex' : 'none';
            });
        });
    }

    // --- Live activity feed (/coordinator/live_activity) ---
    const activityContainer = document.getElementById('activityTimelineContainer');

    const ACTIVITY_STYLES = {
        enrollment: { dot: 'dot-green', box: 'bg-green-light text-green', icon: 'fa-user-plus', title: 'New Enrollment' },
        claim: { dot: 'dot-purple', box: 'bg-purple-light text-purple', icon: 'fa-file-medical', title: 'Claim Activity' },
        policy: { dot: 'dot-orange', box: 'bg-orange-light text-orange', icon: 'fa-file-contract', title: 'Policy Issued' },
        approval: { dot: 'dot-blue', box: 'bg-blue-light text-blue', icon: 'fa-circle-check', title: 'Claim Approved' },
        payment: { dot: 'dot-green', box: 'bg-green-light text-green', icon: 'fa-indian-rupee-sign', title: 'Payment' }
    };

    function fmtTime(iso) {
        if (!iso) return '';
        const d = new Date(iso);
        if (isNaN(d)) return iso;
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + ', ' +
            d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }

    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    }

    function renderActivity(items) {
        if (!activityContainer) return;
        if (!items || !items.length) {
            activityContainer.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);">No recent activity.</div>';
            return;
        }
        activityContainer.innerHTML = items.map(it => {
            const st = ACTIVITY_STYLES[(it.type || '').toLowerCase()] || ACTIVITY_STYLES.enrollment;
            const detail = String(it.detail || '').replace(/ClaimStatus\./g, '').replace(/GoatStatus\./g, '');
            const actor = (it.actor || '').trim();
            return `
                <div class="activity-timeline-item ${st.dot}" data-type="${esc(it.type)}">
                    <div class="activity-indicator-group">
                        <div class="activity-timeline-dot"></div>
                        <div class="activity-icon-box ${st.box}">
                            <i class="fa-solid ${st.icon}"></i>
                        </div>
                    </div>
                    <div class="activity-details-block">
                        <div class="activity-text-info">
                            <span class="activity-title">${esc(st.title)}</span>
                            <span class="activity-description">${esc(detail)}</span>
                        </div>
                        <div class="activity-tags">
                            ${actor ? `<span class="activity-badge badge-farmer-green">By: ${esc(actor)}</span>` : ''}
                        </div>
                        <div class="activity-right-group">
                            <span class="activity-time">${esc(fmtTime(it.time))}</span>
                        </div>
                    </div>
                </div>`;
        }).join('');
    }

    async function loadActivity() {
        if (!window.AjahFiAPI || !activityContainer) return;
        activityContainer.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);">Loading activity…</div>';
        try {
            const data = await AjahFiAPI.get('/coordinator/live_activity');
            renderActivity(Array.isArray(data) ? data : (data && data.items) || []);
        } catch (err) {
            activityContainer.innerHTML = '<div style="text-align:center;padding:40px;color:var(--color-rejected);">Could not load activity: ' + err.message + '</div>';
        }
    }
    loadActivity();

    // --- Sidebar and Notification Dropdown Toggle ---
    const sidebar = document.getElementById('appSidebar');
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationDropdown = document.getElementById('notificationDropdown');
    const profileBtn = document.getElementById('profileDropdownBtn');

    document.addEventListener('click', (e) => {
        if (sidebar && !sidebar.contains(e.target) && e.target.id !== 'sidebarToggle') {
            sidebar.classList.remove('active');
        }
        if (notificationDropdown && !notificationDropdown.contains(e.target) && notificationBtn && !notificationBtn.contains(e.target)) {
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
});
