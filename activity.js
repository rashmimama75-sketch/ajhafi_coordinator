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

    // --- Search Filter Logic ---
    const searchInput = document.getElementById('activitySearchInput');
    const timelineItems = document.querySelectorAll('.activity-timeline-item');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            timelineItems.forEach(item => {
                const title = item.querySelector('.activity-title').textContent.toLowerCase();
                const desc = item.querySelector('.activity-description').textContent.toLowerCase();
                const badgesText = Array.from(item.querySelectorAll('.activity-badge'))
                                       .map(badge => badge.textContent.toLowerCase())
                                       .join(' ');
                
                if (title.includes(query) || desc.includes(query) || badgesText.includes(query)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }

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
