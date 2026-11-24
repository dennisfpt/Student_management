const GOOGLE_CLIENT_ID = '621031816511-ro6ihrmgvve5jr54537fe5hervc0uqdc.apps.googleusercontent.com';

document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();
    let currentRole = 'Student';

    function selectRole(role, btn) {
        currentRole = role;
        document.querySelectorAll('.role-tab').forEach(t => t.classList.remove('active'));
        if (btn) btn.classList.add('active');
        const labels = { Student: 'Student Email', Teacher: 'Lecturer Email', Admin: 'Administrator Email' };
        const emailLabel = document.getElementById('emailLabel');
        if (emailLabel) emailLabel.innerText = labels[role] || 'Email';
    }

    function fillDemo(email, pass, role) {
        const emailInput = document.getElementById('emailInput');
        const passInput = document.getElementById('passwordInput');
        if (emailInput) emailInput.value = email;
        if (passInput) passInput.value = pass;
        selectRole(role, document.querySelector(`.role-tab[data-role="${role}"]`));
    }

    function redirectByRole(role) {
        if (role === 'Admin') window.location.href = 'admin.html';
        else if (role === 'Teacher') window.location.href = 'teacher.html';
        else window.location.href = 'student.html';
    }

    function saveUserAndRedirect(data, fallbackRole, fallbackEmail, fallbackName) {
        const role = data?.role || fallbackRole || 'Student';
        localStorage.setItem('sims_user', JSON.stringify({
            email: data?.email || fallbackEmail,
            fullName: data?.fullName || fallbackName,
            role,
            userCode: data?.userCode || (role === 'Admin' ? 'ADM01' : (role === 'Teacher' ? 'GV001' : 'SV26001')),
            major: data?.major || 'Information Technology'
        }));
        redirectByRole(role);
    }

    function showError(msg) {
        const errEl = document.getElementById('errorMsg');
        if (!errEl) return;
        errEl.innerText = msg;
        errEl.style.display = 'block';
    }

    document.querySelectorAll('.role-tab').forEach(btn => {
        btn.addEventListener('click', () => selectRole(btn.dataset.role, btn));
    });

    document.querySelectorAll('.demo-account-item').forEach(item => {
        item.addEventListener('click', () => fillDemo(item.dataset.email, item.dataset.pass, item.dataset.role));
    });

    document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('emailInput')?.value.trim() || '';
        const password = document.getElementById('passwordInput')?.value || '';
        const errEl = document.getElementById('errorMsg');
        if (errEl) errEl.style.display = 'none';

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (res.ok) {
                const data = await res.json();
                saveUserAndRedirect(data, currentRole, email, email);
            } else {
                const err = await res.json().catch(() => ({}));
                showError(err.message || 'Invalid email or password!');
            }
        } catch (_) {
            showError('Network error. Please try again!');
        }
    });

    // Bấm "Continue with Google" -> bật popup chọn tài khoản Google thật
    document.querySelectorAll('#btnGoogleLogin, .btn-google-light, .btn-google').forEach(btn => {
        btn.removeAttribute('onclick');
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const errEl = document.getElementById('errorMsg');
            if (errEl) errEl.style.display = 'none';

            if (!window.google?.accounts?.oauth2) {
                showError('Google Sign-In SDK is still loading. Please try again in a second.');
                return;
            }

            const role = document.querySelector('.role-tab.active')?.dataset.role || currentRole || 'Student';
            const tokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: GOOGLE_CLIENT_ID,
                scope: 'openid email profile',
                callback: async (tokenResponse) => {
                    if (!tokenResponse?.access_token) return;
                    try {
                        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                            headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                        });
                        const profile = await userInfoRes.json();
                        if (!profile?.email) {
                            showError('Could not retrieve your Google email.');
                            return;
                        }

                        const res = await fetch('/api/auth/google', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                email: profile.email,
                                fullName: profile.name || profile.email.split('@')[0],
                                role
                            })
                        });

                        const data = await res.json().catch(() => ({}));
                        if (!res.ok) {
                            showError(data.message || 'Google sign-in failed.');
                            return;
                        }

                        saveUserAndRedirect(data, role, profile.email, profile.name || profile.email);
                    } catch (_) {
                        showError('Failed to complete Google sign-in.');
                    }
                }
            });

            tokenClient.requestAccessToken({ prompt: 'select_account' });
        });
    });
});