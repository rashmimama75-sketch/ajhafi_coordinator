document.addEventListener('DOMContentLoaded', () => {
    // --- Setup Sidebar & Notification Dropdown ---
    const sidebar = document.getElementById('appSidebar');
    const sidebarToggleBtn = document.getElementById('sidebarToggle');
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationDropdown = document.getElementById('notificationDropdown');
    const profileBtn = document.getElementById('profileDropdownBtn');
    const goatSearchInput = document.getElementById('goatSearchInput');
    const accordionContainer = document.getElementById('accordionContainer');

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

    // --- Search Filter Logic (operates on the live accordion cards) ---
    if (goatSearchInput) {
        goatSearchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const cards = accordionContainer.querySelectorAll('.farmer-accordion-card');

            cards.forEach(card => {
                const nameEl = card.querySelector('h4');
                const farmerName = nameEl ? nameEl.textContent.toLowerCase() : '';
                const goatRows = card.querySelectorAll('.goat-row-card');
                let matchesFarmer = farmerName.includes(query);
                let matchesGoats = false;

                goatRows.forEach(row => {
                    const goatText = row.textContent.toLowerCase();
                    if (goatText.includes(query)) {
                        row.style.display = 'flex';
                        matchesGoats = true;
                    } else {
                        row.style.display = 'none';
                    }
                });

                if (query === '') {
                    goatRows.forEach(row => row.style.display = 'flex');
                    card.style.display = 'block';
                    return;
                }

                if (matchesFarmer || matchesGoats) {
                    card.style.display = 'block';
                    if (matchesFarmer && !matchesGoats) {
                        goatRows.forEach(row => row.style.display = 'flex');
                    }
                    const content = card.querySelector('.accordion-content');
                    const chevron = card.querySelector('.accordion-chevron');
                    if (content) {
                        content.classList.add('active');
                        content.style.display = 'block';
                    }
                    if (chevron) {
                        chevron.className = 'fa-solid fa-chevron-up accordion-chevron';
                    }
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    // --- Formatting helpers ---
    function cap(s) {
        s = String(s || '');
        return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
    }
    function ageLabel(months) {
        if (months == null || isNaN(months)) return '—';
        months = Number(months);
        if (months < 12) return months + ' mo';
        const y = Math.floor(months / 12);
        const m = months % 12;
        return m ? (y + 'y ' + m + 'm') : (y + (y === 1 ? ' Year' : ' Years'));
    }
    function media(p) {
        return window.AjahFiAPI ? AjahFiAPI.mediaUrl(p) : (p || '');
    }

    // --- Build a single goat row ---
    function createGoatRowHtml(goat) {
        const gender = cap(goat.gender);
        const genderIcon = gender === 'Female'
            ? '<i class="fa-solid fa-venus" style="color: #ec4899; margin-right: 2px;"></i> Female'
            : '<i class="fa-solid fa-mars" style="color: #3b82f6; margin-right: 2px;"></i> Male';

        const isActive = String(goat.status).toLowerCase() === 'active';
        const statusStyle = isActive
            ? 'background-color: var(--brand-primary-light); color: var(--brand-primary); padding: 4px 10px; border-radius: var(--radius-full); font-size: 11px; font-weight: 700;'
            : 'background-color: #fef2f2; color: #ef4444; padding: 4px 10px; border-radius: var(--radius-full); font-size: 11px; font-weight: 700;';
        const photo = goat.photo || 'goat_thumbnail.png';

        return `
            <div class="goat-row-card">
                <div style="display: flex; align-items: center; gap: 16px;">
                    <img src="${photo}" onerror="this.src='goat_thumbnail.png'" alt="Goat image"
                        style="width: 48px; height: 48px; border-radius: var(--radius-sm); object-fit: cover;">
                    <div>
                        <h5 style="font-size: 14px; font-weight: 700; color: var(--text-main); margin: 0 0 2px 0;">
                            GOAT ID: <a href="goat-detail.html?id=${encodeURIComponent(goat.id)}" class="goat-id-link">${goat.earTag}</a></h5>
                        <div style="display: flex; align-items: center; gap: 12px; font-size: 12px; color: var(--text-muted); font-weight: 550; flex-wrap: wrap;">
                            <span>Ear Tag: ${goat.earTag}</span>
                            <span>•</span>
                            <span>${genderIcon}</span>
                            <span>•</span>
                            <span><i class="fa-regular fa-calendar" style="margin-right: 2px;"></i> ${goat.age}</span>
                            <span>•</span>
                            <span><i class="fa-solid fa-weight-hanging" style="margin-right: 2px;"></i> ${goat.weight}</span>
                        </div>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 16px;">
                    <span class="status-pill" style="${statusStyle}">${cap(goat.status)}</span>
                    <button style="background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 14px;"><i class="fa-solid fa-chevron-right"></i></button>
                </div>
            </div>
        `;
    }

    // --- Build a farmer accordion card ---
    function createAccordionCard(group, openByDefault) {
        const total = group.goats.length;
        const active = group.goats.filter(g => String(g.status).toLowerCase() === 'active').length;
        const rows = group.goats.map(createGoatRowHtml).join('');
        const contentClass = openByDefault ? 'accordion-content active' : 'accordion-content';
        const contentStyle = openByDefault ? '' : 'style="display: none;"';
        const chevron = openByDefault ? 'fa-chevron-up' : 'fa-chevron-down';
        const avatar = group.photo || 'goat_thumbnail.png';

        return `
            <div class="farmer-accordion-card">
                <div class="accordion-header" onclick="toggleAccordion(this)">
                    <div style="display: flex; align-items: center; gap: 16px;">
                        <img src="${avatar}" onerror="this.src='goat_thumbnail.png'" alt="Farmer Avatar"
                            style="width: 48px; height: 48px; border-radius: var(--radius-full); object-fit: cover;">
                        <div>
                            <h4 style="font-size: 15px; font-weight: 700; color: var(--text-main); margin: 0 0 4px 0;">${group.name}</h4>
                            <div style="display: flex; align-items: center; gap: 12px; font-size: 12px; color: var(--text-muted); font-weight: 550;">
                                <span><i class="fa-solid fa-location-dot" style="margin-right: 4px; color: var(--brand-primary);"></i> ${group.village || '—'}</span>
                            </div>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 32px;">
                        <div style="text-align: right;">
                            <span style="font-size: 10px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Total Goats</span>
                            <h4 style="font-size: 18px; font-weight: 700; color: #7c3aed; margin: 2px 0 0 0;">${total}</h4>
                        </div>
                        <div style="text-align: right;">
                            <span style="font-size: 10px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Active</span>
                            <h4 style="font-size: 18px; font-weight: 700; color: #16a34a; margin: 2px 0 0 0;">${active}</h4>
                        </div>
                        <i class="fa-solid ${chevron} accordion-chevron" style="color: var(--text-muted); font-size: 12px; transition: transform 0.2s;"></i>
                    </div>
                </div>
                <div class="${contentClass}" ${contentStyle}>
                    ${rows}
                </div>
            </div>
        `;
    }

    function mapGoat(g) {
        return {
            id: g.id,
            earTag: g.ear_tag_number || ('#' + g.id),
            gender: g.gender,
            age: ageLabel(g.age_months),
            weight: (g.weight_kg != null ? g.weight_kg + ' Kg' : '—'),
            status: g.status,
            photo: media(g.photo),
            farmer: (g.farmer || '').trim() || 'Unknown',
            farmerPhoto: media(g.farmer_photo),
            village: (g.village || '').trim()
        };
    }

    async function loadGoats() {
        if (!accordionContainer) return;
        accordionContainer.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-muted);">Loading goats…</div>';
        try {
            const data = await AjahFiAPI.get('/coordinator/goats');
            const goats = ((data && data.goats) || []).map(mapGoat);

            if (!goats.length) {
                accordionContainer.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-muted);">No goats found.</div>';
                return;
            }

            // Group goats by farmer (preserving first-seen order)
            const groups = {};
            const order = [];
            goats.forEach(g => {
                if (!groups[g.farmer]) {
                    groups[g.farmer] = { name: g.farmer, photo: g.farmerPhoto, village: g.village, goats: [] };
                    order.push(g.farmer);
                }
                groups[g.farmer].goats.push(g);
            });

            accordionContainer.innerHTML = order
                .map((name, i) => createAccordionCard(groups[name], i === 0))
                .join('');

            // Update the top summary stat cards
            const counts = (data && data.counts) || {};
            const totalGoats = (data && data.total != null) ? data.total : goats.length;
            const activeGoats = (counts.active != null) ? counts.active
                : goats.filter(g => String(g.status).toLowerCase() === 'active').length;
            const statVals = document.querySelectorAll('.stat-card-value');
            if (statVals.length >= 4) {
                statVals[0].textContent = order.length;            // Total Farmers (with goats)
                statVals[1].textContent = totalGoats;              // Total Goats
                statVals[2].textContent = activeGoats;             // Active Goats
                statVals[3].textContent = (totalGoats - activeGoats); // Inactive Goats
            }
        } catch (err) {
            accordionContainer.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--color-rejected);">Could not load goats: ' + err.message + '</div>';
        }
    }

    // --- Row Card Navigation Event Delegation ---
    if (accordionContainer) {
        accordionContainer.addEventListener('click', (e) => {
            const rowCard = e.target.closest('.goat-row-card');
            if (rowCard) {
                if (e.target.closest('a') || e.target.closest('button')) return;
                const idLink = rowCard.querySelector('.goat-id-link');
                const href = idLink && idLink.getAttribute('href');
                if (href) window.location.href = href;
            }
        });
    }

    loadGoats();
});

// --- Global function for Accordion toggling ---
function toggleAccordion(headerElement) {
    const card = headerElement.closest('.farmer-accordion-card');
    const content = card.querySelector('.accordion-content');
    const chevron = card.querySelector('.accordion-chevron');

    if (content) {
        const isActive = content.classList.contains('active');
        if (isActive) {
            content.classList.remove('active');
            content.style.display = 'none';
            if (chevron) {
                chevron.className = 'fa-solid fa-chevron-down accordion-chevron';
            }
        } else {
            content.classList.add('active');
            content.style.display = 'block';
            if (chevron) {
                chevron.className = 'fa-solid fa-chevron-up accordion-chevron';
            }
        }
    }
}
