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

    // --- Sign in ---
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
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

            // ----------------------------------------------------------------
            // TODO: Connect to backend here.
            // When you have the backend URL, replace the demo redirect below
            // with a real login request, e.g.:
            //
            // const res = await fetch(`${API_BASE_URL}/auth/login`, {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ mobile, password, role: selectedRole })
            // });
            // const data = await res.json();
            // if (res.ok) { localStorage.setItem('token', data.token); ... }
            // ----------------------------------------------------------------

            // Demo behaviour (no backend yet): save a session flag and send
            // Coordinator to the dashboard. When the backend is connected,
            // store the real token returned by the API instead.
            if (selectedRole === 'coordinator') {
                localStorage.setItem('ajahfi_auth', JSON.stringify({
                    role: selectedRole,
                    mobile: mobile,
                    ts: Date.now()
                }));
                window.location.href = 'index.html';
            } else {
                alert(`Signed in as "${selectedRole}". (This role's dashboard isn't built yet.)`);
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
