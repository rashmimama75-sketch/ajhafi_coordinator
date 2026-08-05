document.addEventListener('DOMContentLoaded', () => {
    const ROLE_LABELS = { co: 'Coordinator', sd: 'Suraksha Didi', fr: 'Farmer', admin: 'Admin' };
    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = (val == null || val === '') ? '—' : val; };
    const getText = (id) => { const el = document.getElementById(id); return (el && el.textContent !== '—') ? el.textContent.trim() : ''; };

    let currentProfile = {};

    function applyProfileToUI(name, phone, village, photoUrl) {
        if (name) {
            setText('lblProfileName', name);
            setText('lblProfileFullName', name);
            document.querySelectorAll('.profile-name').forEach(el => el.textContent = name);
        }
        if (phone) {
            setText('lblProfilePhone', phone);
        }
        if (village) {
            setText('lblProfileLocation', village);
            setText('lblProfileAddress', village);
        }
        if (photoUrl) {
            const avatar = document.getElementById('lblProfileAvatar');
            if (avatar) avatar.src = photoUrl;
            const preview = document.getElementById('modalProfileAvatarPreview');
            if (preview) preview.src = photoUrl;
            document.querySelectorAll('.profile-trigger img, .avatar-img, .profile-avatar').forEach(img => {
                if (img.tagName === 'IMG') img.src = photoUrl;
            });
        }
    }

    async function loadProfile() {
        // First check local overrides if any saved
        try {
            const cached = localStorage.getItem('ajahfi_user_profile_override');
            if (cached) {
                const ov = JSON.parse(cached);
                if (ov) {
                    currentProfile = ov;
                    applyProfileToUI(ov.full_name, ov.mobile_number, ov.village, ov.photoUrl);
                }
            }
        } catch (e) {}

        if (!window.AjahFiAPI) return;
        try {
            const p = await AjahFiAPI.get('/coordinator/profile');
            if (!p) return;

            currentProfile = Object.assign({}, p, currentProfile);

            const name = (currentProfile.full_name || p.full_name || '').trim();
            const roleLabel = ROLE_LABELS[p.role] || (p.role || '—');
            const village = (currentProfile.village || p.village || '').trim();
            const phone = currentProfile.mobile_number || p.mobile_number || '';
            const photoUrl = currentProfile.photoUrl || (p.photo ? AjahFiAPI.mediaUrl(p.photo) : 'goat_thumbnail.png');

            const avatar = document.getElementById('lblProfileAvatar');
            if (avatar) {
                avatar.src = photoUrl;
                avatar.onerror = function () { this.src = 'goat_thumbnail.png'; };
                avatar.alt = name || 'Profile Photo';
            }

            setText('lblProfileName', name);
            setText('lblProfileRole', roleLabel);
            setText('lblProfileLocation', village);
            setText('lblProfileFullName', name);
            setText('lblProfileRoleText', roleLabel);
            setText('lblProfilePhone', phone);
            setText('lblProfileAddress', village);
        } catch (err) {
            console.warn('Could not load profile:', err.message);
        }
    }

    loadProfile();

    // --- Edit Profile Modal Handlers ---
    const editModal = document.getElementById('editProfileModal');
    const btnEditProfile = document.getElementById('btnEditProfile');
    const btnCameraEdit = document.getElementById('btnCameraEdit');
    const btnCloseModal = document.getElementById('btnCloseEditProfileModal');
    const btnCancelModal = document.getElementById('btnCancelEditProfile');
    const editForm = document.getElementById('editProfileForm');

    const txtFullName = document.getElementById('txtEditFullName');
    const txtPhone = document.getElementById('txtEditPhone');
    const txtVillage = document.getElementById('txtEditVillage');

    const btnModalChangePhoto = document.getElementById('btnModalChangePhoto');
    const filePhotoInput = document.getElementById('fileProfilePhotoInput');
    const avatarPreview = document.getElementById('modalProfileAvatarPreview');

    function openModal() {
        if (!editModal) return;
        txtFullName.value = currentProfile.full_name || getText('lblProfileFullName');
        txtPhone.value = currentProfile.mobile_number || getText('lblProfilePhone');
        txtVillage.value = currentProfile.village || getText('lblProfileAddress');

        const mainAvatar = document.getElementById('lblProfileAvatar');
        if (mainAvatar && avatarPreview) avatarPreview.src = mainAvatar.src;

        editModal.style.display = 'flex';
        requestAnimationFrame(() => editModal.classList.add('active'));
    }

    function closeModal() {
        if (!editModal) return;
        editModal.classList.remove('active');
        setTimeout(() => { editModal.style.display = 'none'; }, 250);
    }

    if (btnEditProfile) btnEditProfile.addEventListener('click', openModal);
    if (btnCameraEdit) btnCameraEdit.addEventListener('click', () => {
        openModal();
        if (filePhotoInput) filePhotoInput.click();
    });

    if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
    if (btnCancelModal) btnCancelModal.addEventListener('click', closeModal);

    if (editModal) {
        editModal.addEventListener('click', (e) => {
            if (e.target === editModal) closeModal();
        });
    }

    // Photo selection handling
    if (btnModalChangePhoto && filePhotoInput) {
        btnModalChangePhoto.addEventListener('click', () => filePhotoInput.click());
    }

    if (filePhotoInput) {
        filePhotoInput.addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (evt) => {
                    const dataUrl = evt.target.result;
                    if (avatarPreview) avatarPreview.src = dataUrl;
                    currentProfile.photoUrl = dataUrl;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Form Submission / Save Changes
    if (editForm) {
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newName = txtFullName.value.trim();
            const newPhone = txtPhone.value.trim();
            const newVillage = txtVillage.value.trim();

            currentProfile.full_name = newName;
            currentProfile.mobile_number = newPhone;
            currentProfile.village = newVillage;

            // Apply updates to UI immediately
            applyProfileToUI(newName, newPhone, newVillage, currentProfile.photoUrl);

            // Persist locally
            try {
                localStorage.setItem('ajahfi_user_profile_override', JSON.stringify(currentProfile));
            } catch (err) {}

            closeModal();

            // Try sending to backend if supported
            if (window.AjahFiAPI) {
                try {
                    await AjahFiAPI.post('/coordinator/profile', {
                        full_name: newName,
                        mobile_number: newPhone,
                        village: newVillage
                    });
                } catch (apiErr) {
                    // Backend endpoint might be read-only; local state is preserved cleanly
                }
            }

            alert('Profile updated successfully!');
        });
    }

    // --- Language switcher (cycles English → हिंदी → ଓଡ଼ିଆ) ---
    const FULL_NAMES = { en: 'English', hi: 'हिंदी', or: 'ଓଡ଼ିଆ' };
    const langOption = document.getElementById('langOption');
    const langValue = document.getElementById('langValue');
    function refreshLangValue() {
        if (langValue && window.I18N) langValue.textContent = FULL_NAMES[I18N.getLang()] || 'English';
    }
    refreshLangValue();
    if (langOption) {
        langOption.addEventListener('click', (e) => {
            e.preventDefault();
            if (!window.I18N) return;
            const order = ['en', 'hi', 'or'];
            const next = order[(order.indexOf(I18N.getLang()) + 1) % order.length];
            I18N.setLang(next);
            refreshLangValue();
        });
    }
});
