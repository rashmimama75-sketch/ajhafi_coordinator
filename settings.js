document.addEventListener('DOMContentLoaded', () => {
    const ROLE_LABELS = { co: 'Coordinator', sd: 'Suraksha Didi', fr: 'Farmer', admin: 'Admin' };
    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = (val == null || val === '') ? '—' : val; };

    async function loadProfile() {
        if (!window.AjahFiAPI) return;
        try {
            const p = await AjahFiAPI.get('/coordinator/profile');
            if (!p) return;

            const name = (p.full_name || '').trim();
            const roleLabel = ROLE_LABELS[p.role] || (p.role || '—');
            const village = (p.village || '').trim();

            const avatar = document.getElementById('lblProfileAvatar');
            if (avatar) {
                avatar.src = p.photo ? AjahFiAPI.mediaUrl(p.photo) : 'goat_thumbnail.png';
                avatar.onerror = function () { this.src = 'goat_thumbnail.png'; };
                avatar.alt = name || 'Profile Photo';
            }

            setText('lblProfileName', name);
            setText('lblProfileRole', roleLabel);
            setText('lblProfileLocation', village);

            setText('lblProfileFullName', name);
            setText('lblProfileRoleText', roleLabel);
            setText('lblProfilePhone', p.mobile_number);
            // NOTE: the profile endpoint does not expose date of birth or gender,
            // so those rows were removed from the page.
            setText('lblProfileAddress', village);
        } catch (err) {
            console.warn('Could not load profile:', err.message);
        }
    }

    loadProfile();
});
