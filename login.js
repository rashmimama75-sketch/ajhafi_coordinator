document.addEventListener('DOMContentLoaded', () => {
    // --- Password show/hide toggle ---
    const pwInput = document.getElementById('passwordInput');
    const pwToggle = document.getElementById('pwToggle');

    if (pwToggle && pwInput) {
        pwToggle.addEventListener('click', () => {
            const isHidden = pwInput.type === 'password';
            pwInput.type = isHidden ? 'text' : 'password';
            pwToggle.querySelector('i').className = isHidden
                ? 'fa-solid fa-eye'
                : 'fa-solid fa-eye-slash';
            pwToggle.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
        });
    }

    // --- Mobile number: digits only, max 10 ---
    const mobileInput = document.getElementById('mobileInput');
    if (mobileInput) {
        mobileInput.addEventListener('input', () => {
            mobileInput.value = mobileInput.value.replace(/\D/g, '').slice(0, 10);
        });
        // Block non-digit key presses (allow navigation/editing keys)
        mobileInput.addEventListener('keypress', (e) => {
            if (!/[0-9]/.test(e.key)) {
                e.preventDefault();
            }
        });
    }

    // --- Role selection ---
    const roleCards = document.getElementById('roleCards');
    let selectedRole = 'coordinator';

    if (roleCards) {
        roleCards.addEventListener('click', (e) => {
            const card = e.target.closest('.role-card');
            if (!card) return;
            roleCards.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedRole = card.dataset.role;
        });
    }

    // --- Sign in (real backend auth) ---
    const loginForm = document.getElementById('loginForm');
    const signInBtn = loginForm ? loginForm.querySelector('.btn-signin') : null;

    function setLoading(isLoading) {
        if (!signInBtn) return;
        signInBtn.disabled = isLoading;
        signInBtn.textContent = isLoading ? 'Signing in…' : 'Sign In';
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const mobile = document.getElementById('mobileInput').value.trim();
            const password = pwInput.value;

            if (!mobile || !password) {
                alert('Please enter your mobile number and password.');
                return;
            }

            if (!/^[0-9]{10}$/.test(mobile)) {
                alert('Please enter a valid 10-digit mobile number.');
                return;
            }

            // Only the Coordinator dashboard is built in this project.
            const backendRole = 'co';

            setLoading(true);
            try {
                const data = await AjahFiAPI.login(mobile, password, backendRole);

                if (data && data.access_token) {
                    AjahFiAPI.setToken(data.access_token);
                    AjahFiAPI.setProfile({ role: backendRole, mobile: mobile, ts: Date.now() });
                    window.location.href = 'index.html';
                } else {
                    alert(data && data.reason ? data.reason : 'Login failed. Please check your details and try again.');
                }
            } catch (err) {
                alert('Could not sign in: ' + err.message);
            } finally {
                setLoading(false);
            }
        });
    }

    // --- Language selector (placeholder) ---
    const langSelector = document.getElementById('langSelector');
    if (langSelector) {
        langSelector.addEventListener('click', () => {
            alert('Language options coming soon.');
        });
    }
});
