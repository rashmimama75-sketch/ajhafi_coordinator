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

    // --- Search Filter Logic ---
    if (goatSearchInput) {
        goatSearchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const cards = accordionContainer.querySelectorAll('.farmer-accordion-card');

            cards.forEach(card => {
                const farmerName = card.querySelector('h4').textContent.toLowerCase();
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

                // If query is empty, reset display
                if (query === '') {
                    goatRows.forEach(row => row.style.display = 'flex');
                    card.style.display = 'block';
                    return;
                }

                // Show card if farmer matches or any of their goats match
                if (matchesFarmer || matchesGoats) {
                    card.style.display = 'block';
                    
                    // If farmer matched but no specific goat matched, show all goats
                    if (matchesFarmer && !matchesGoats) {
                        goatRows.forEach(row => row.style.display = 'flex');
                    }
                    
                    // Automatically expand card to show search results
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

    // --- View All Goats Click Handler ---
    const goatsData = {
        'ramesh kumar': [
            { id: 'G12345', earTag: 'ET2321', gender: 'Female', age: '2.5 Years', weight: '32 Kg', status: 'Active' },
            { id: 'G12346', earTag: 'ET2322', gender: 'Male', age: '1.8 Years', weight: '28 Kg', status: 'Active' },
            { id: 'G12347', earTag: 'ET2323', gender: 'Female', age: '2.2 Years', weight: '30 Kg', status: 'Active' },
            { id: 'G12350', earTag: 'ET2326', gender: 'Female', age: '2.0 Years', weight: '29 Kg', status: 'Active' },
            { id: 'G12351', earTag: 'ET2327', gender: 'Male', age: '1.2 Years', weight: '22 Kg', status: 'Active' },
            { id: 'G12352', earTag: 'ET2328', gender: 'Female', age: '3.1 Years', weight: '34 Kg', status: 'Active' },
            { id: 'G12353', earTag: 'ET2329', gender: 'Female', age: '1.7 Years', weight: '26 Kg', status: 'Active' },
            { id: 'G12354', earTag: 'ET2330', gender: 'Male', age: '2.8 Years', weight: '31 Kg', status: 'Active' },
            { id: 'G12355', earTag: 'ET2331', gender: 'Female', age: '2.4 Years', weight: '30 Kg', status: 'Active' },
            { id: 'G12356', earTag: 'ET2332', gender: 'Female', age: '1.9 Years', weight: '27 Kg', status: 'Active' },
            { id: 'G12357', earTag: 'ET2333', gender: 'Male', age: '2.1 Years', weight: '29 Kg', status: 'Active' },
            { id: 'G12358', earTag: 'ET2334', gender: 'Female', age: '2.6 Years', weight: '33 Kg', status: 'Active' },
            { id: 'G12359', earTag: 'ET2335', gender: 'Female', age: '1.5 Years', weight: '24 Kg', status: 'Active' },
            { id: 'G12360', earTag: 'ET2336', gender: 'Male', age: '2.3 Years', weight: '30 Kg', status: 'Active' },
            { id: 'G12361', earTag: 'ET2337', gender: 'Female', age: '2.7 Years', weight: '31 Kg', status: 'Active' },
            { id: 'G12362', earTag: 'ET2338', gender: 'Female', age: '1.4 Years', weight: '23 Kg', status: 'Inactive' },
            { id: 'G12363', earTag: 'ET2339', gender: 'Male', age: '3.5 Years', weight: '36 Kg', status: 'Inactive' },
            { id: 'G12364', earTag: 'ET2340', gender: 'Female', age: '2.2 Years', weight: '28 Kg', status: 'Inactive' }
        ],
        'sita devi': [
            { id: 'G12348', earTag: 'ET2324', gender: 'Female', age: '1.5 Years', weight: '25 Kg', status: 'Active' },
            { id: 'G12365', earTag: 'ET2341', gender: 'Female', age: '2.0 Years', weight: '28 Kg', status: 'Active' },
            { id: 'G12366', earTag: 'ET2342', gender: 'Male', age: '1.7 Years', weight: '26 Kg', status: 'Active' },
            { id: 'G12367', earTag: 'ET2343', gender: 'Female', age: '2.5 Years', weight: '31 Kg', status: 'Active' },
            { id: 'G12368', earTag: 'ET2344', gender: 'Female', age: '1.2 Years', weight: '21 Kg', status: 'Active' },
            { id: 'G12369', earTag: 'ET2345', gender: 'Male', age: '2.3 Years', weight: '29 Kg', status: 'Active' },
            { id: 'G12370', earTag: 'ET2346', gender: 'Female', age: '2.8 Years', weight: '33 Kg', status: 'Active' },
            { id: 'G12371', earTag: 'ET2347', gender: 'Female', age: '1.9 Years', weight: '27 Kg', status: 'Active' },
            { id: 'G12372', earTag: 'ET2348', gender: 'Male', age: '2.1 Years', weight: '30 Kg', status: 'Active' },
            { id: 'G12373', earTag: 'ET2349', gender: 'Female', age: '2.4 Years', weight: '31 Kg', status: 'Active' },
            { id: 'G12374', earTag: 'ET2350', gender: 'Female', age: '1.6 Years', weight: '24 Kg', status: 'Inactive' },
            { id: 'G12375', earTag: 'ET2351', gender: 'Male', age: '3.2 Years', weight: '35 Kg', status: 'Inactive' }
        ],
        'babu lal': [
            { id: 'G12349', earTag: 'ET2325', gender: 'Male', age: '3.0 Years', weight: '35 Kg', status: 'Active' },
            { id: 'G12376', earTag: 'ET2352', gender: 'Female', age: '2.1 Years', weight: '29 Kg', status: 'Active' },
            { id: 'G12377', earTag: 'ET2353', gender: 'Male', age: '1.9 Years', weight: '27 Kg', status: 'Active' },
            { id: 'G12378', earTag: 'ET2354', gender: 'Female', age: '2.4 Years', weight: '31 Kg', status: 'Active' },
            { id: 'G12379', earTag: 'ET2355', gender: 'Female', age: '1.6 Years', weight: '24 Kg', status: 'Active' },
            { id: 'G12380', earTag: 'ET2356', gender: 'Male', age: '2.0 Years', weight: '28 Kg', status: 'Active' },
            { id: 'G12381', earTag: 'ET2357', gender: 'Female', age: '2.6 Years', weight: '32 Kg', status: 'Active' },
            { id: 'G12382', earTag: 'ET2358', gender: 'Female', age: '1.8 Years', weight: '26 Kg', status: 'Active' },
            { id: 'G12383', earTag: 'ET2359', gender: 'Male', age: '2.2 Years', weight: '30 Kg', status: 'Active' },
            { id: 'G12384', earTag: 'ET2360', gender: 'Female', age: '2.7 Years', weight: '33 Kg', status: 'Active' },
            { id: 'G12385', earTag: 'ET2361', gender: 'Female', age: '1.4 Years', weight: '23 Kg', status: 'Active' },
            { id: 'G12386', earTag: 'ET2362', gender: 'Male', age: '3.1 Years', weight: '36 Kg', status: 'Active' },
            { id: 'G12387', earTag: 'ET2363', gender: 'Female', age: '2.3 Years', weight: '29 Kg', status: 'Active' },
            { id: 'G12388', earTag: 'ET2364', gender: 'Male', age: '1.5 Years', weight: '22 Kg', status: 'Active' },
            { id: 'G12389', earTag: 'ET2365', gender: 'Female', age: '2.9 Years', weight: '34 Kg', status: 'Active' },
            { id: 'G12390', earTag: 'ET2366', gender: 'Female', age: '1.7 Years', weight: '25 Kg', status: 'Active' },
            { id: 'G12391', earTag: 'ET2367', gender: 'Male', age: '2.5 Years', weight: '31 Kg', status: 'Active' },
            { id: 'G12392', earTag: 'ET2368', gender: 'Female', age: '2.0 Years', weight: '28 Kg', status: 'Active' },
            { id: 'G12393', earTag: 'ET2369', gender: 'Female', age: '1.2 Years', weight: '21 Kg', status: 'Active' },
            { id: 'G12394', earTag: 'ET2370', gender: 'Male', age: '2.8 Years', weight: '32 Kg', status: 'Active' },
            { id: 'G12395', earTag: 'ET2371', gender: 'Female', age: '2.4 Years', weight: '30 Kg', status: 'Active' },
            { id: 'G12396', earTag: 'ET2372', gender: 'Female', age: '1.9 Years', weight: '27 Kg', status: 'Inactive' },
            { id: 'G12397', earTag: 'ET2373', gender: 'Male', age: '2.1 Years', weight: '29 Kg', status: 'Inactive' },
            { id: 'G12398', earTag: 'ET2374', gender: 'Female', age: '2.6 Years', weight: '33 Kg', status: 'Inactive' },
            { id: 'G12399', earTag: 'ET2375', gender: 'Female', age: '1.5 Years', weight: '24 Kg', status: 'Inactive' }
        ]
    };

    function createGoatCardHtml(goat) {
        const genderIcon = goat.gender === 'Female' 
            ? '<i class="fa-solid fa-venus" style="color: #ec4899; margin-right: 2px;"></i> Female' 
            : '<i class="fa-solid fa-mars" style="color: #3b82f6; margin-right: 2px;"></i> Male';

        const statusStyle = goat.status === 'Active'
            ? 'background-color: var(--brand-primary-light); color: var(--brand-primary); padding: 4px 10px; border-radius: var(--radius-full); font-size: 11px; font-weight: 700;'
            : 'background-color: #fef2f2; color: #ef4444; padding: 4px 10px; border-radius: var(--radius-full); font-size: 11px; font-weight: 700;';

        return `
            <div class="goat-row-card">
                <div style="display: flex; align-items: center; gap: 16px;">
                    <img src="goat_thumbnail.png" alt="Goat image"
                        style="width: 48px; height: 48px; border-radius: var(--radius-sm); object-fit: cover;">
                    <div>
                        <h5
                            style="font-size: 14px; font-weight: 700; color: var(--text-main); margin: 0 0 2px 0;">
                            GOAT ID: <a href="goat-detail.html?id=${goat.id}" class="goat-id-link">${goat.id}</a></h5>
                        <div
                            style="display: flex; align-items: center; gap: 12px; font-size: 12px; color: var(--text-muted); font-weight: 550; flex-wrap: wrap;">
                            <span>Ear Tag: ${goat.earTag}</span>
                            <span>•</span>
                            <span>${genderIcon}</span>
                            <span>•</span>
                            <span><i class="fa-regular fa-calendar" style="margin-right: 2px;"></i> ${goat.age}</span>
                            <span>•</span>
                            <span><i class="fa-solid fa-weight-hanging" style="margin-right: 2px;"></i>
                                ${goat.weight}</span>
                        </div>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 16px;">
                    <span class="status-pill ${goat.status.toLowerCase()}"
                        style="${statusStyle}">${goat.status}</span>
                    <button
                        style="background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 14px;"><i
                            class="fa-solid fa-chevron-right"></i></button>
                </div>
            </div>
        `;
    }

    const viewAllRows = document.querySelectorAll('.view-all-row');
    viewAllRows.forEach(row => {
        row.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = row.closest('.farmer-accordion-card');
            const farmerName = card.querySelector('h4').textContent.trim().toLowerCase();
            const accordionContent = card.querySelector('.accordion-content');
            
            if (goatsData[farmerName]) {
                // Clear existing goat cards
                const oldGoatCards = accordionContent.querySelectorAll('.goat-row-card');
                oldGoatCards.forEach(c => c.remove());
                
                // Construct the HTML for all goats
                const goatsHtml = goatsData[farmerName].map(goat => createGoatCardHtml(goat)).join('');
                
                // Hide/remove the view-all-row
                row.remove();
                
                // Insert the new goats at the beginning of the accordionContent
                accordionContent.insertAdjacentHTML('afterbegin', goatsHtml);
            }
        });
    });

    // --- Row Card Navigation Event Delegation ---
    if (accordionContainer) {
        accordionContainer.addEventListener('click', (e) => {
            const rowCard = e.target.closest('.goat-row-card');
            if (rowCard) {
                if (e.target.closest('a') || e.target.closest('button')) return;
                const idLink = rowCard.querySelector('.goat-id-link');
                if (idLink) {
                    const goatId = idLink.textContent.trim();
                    window.location.href = `goat-detail.html?id=${goatId}`;
                }
            }
        });
    }
});

// --- Global function for Accordion toggling ---
function toggleAccordion(headerElement) {
    const card = headerElement.closest('.farmer-accordion-card');
    const content = card.querySelector('.accordion-content');
    const chevron = card.querySelector('.accordion-chevron');

    if (content) {
        const isActive = content.classList.contains('active');
        
        // Toggle active class
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
