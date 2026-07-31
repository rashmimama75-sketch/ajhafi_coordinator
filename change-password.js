document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('changePasswordForm');
    const currentEl = document.getElementById('currentPassword');
    const newEl = document.getElementById('newPassword');
    const confirmEl = document.getElementById('confirmPassword');
    const btn = document.getElementById('btnUpdatePwd');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const currentPw = currentEl.value;
        const newPw = newEl.value;
        const confirmPw = confirmEl.value;

        // --- Client-side checks ---
        if (!currentPw || !newPw || !confirmPw) {
            alert('Please fill in all password fields.');
            return;
        }
        if (newPw.length < 6) {
            alert('Your new password must be at least 6 characters long.');
            return;
        }
        if (newPw !== confirmPw) {
            alert('The new password and confirmation do not match.');
            return;
        }
        if (newPw === currentPw) {
            alert('Your new password must be different from the current password.');
            return;
        }

        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Updating…';

        try {
            // The backend verifies current_password and rejects it if wrong.
            const res = await AjahFiAPI.post('/auth/set_password', {
                password: newPw,
                current_password: currentPw
            });

            if (res && res.status === 'success') {
                alert('Password updated successfully. Please sign in again with your new password.');
                AjahFiAPI.clearSession();
                window.location.replace('login.html');
            } else {
                // e.g. "current password is incorrect"
                alert(res && res.reason ? res.reason.charAt(0).toUpperCase() + res.reason.slice(1) : 'Could not update password. Please try again.');
                btn.disabled = false;
                btn.textContent = originalText;
            }
        } catch (err) {
            alert('Could not update password: ' + err.message);
            btn.disabled = false;
            btn.textContent = originalText;
        }
    });
});
