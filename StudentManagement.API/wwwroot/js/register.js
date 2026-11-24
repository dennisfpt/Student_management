const GOOGLE_CLIENT_ID = '621031816511-ro6ihrmgvve5jr54537fe5hervc0uqdc.apps.googleusercontent.com';

document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();
    let selectedRegRole = 'Student';

    function showRegMessage(text, isError = true) {
        const msgEl = document.getElementById('regMessage');
        if (!msgEl) return;
        msgEl.style.color = isError ? '#f87171' : '#34d399';
        msgEl.innerText = text;
        msgEl.style.display = 'block';
    }

    document.querySelectorAll('.role-card').forEach(card => {
        card.addEventListener('click', () => {
            selectedRegRole = card.dataset.role;
            document.querySelectorAll('.role-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            const codeLabel = document.getElementById('codeLabel');
            if (codeLabel) {
                codeLabel.innerText = selectedRegRole === 'Student' ? 'Student ID (Optional)' : 'Lecturer ID (Optional)';
            }
        });
    });

    document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fullName = document.getElementById('regFullName')?.value.trim() || '';
        const email = document.getElementById('regEmail')?.value.trim() || '';
        const userCode = document.getElementById('regCode')?.value.trim() || '';
        const phone = document.getElementById('regPhone')?.value.trim() || '';
        const major = document.getElementById('regMajor')?.value || 'Information Technology';
        const password = document.getElementById('regPass')?.value || '';
        const confirmPass = document.getElementById('regConfirmPass')?.value || '';

        if (password !== confirmPass) {
            showRegMessage('Passwords do not match!', true);
            return;
        }

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, email, password, role: selectedRegRole, userCode, phone, major })
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                showRegMessage(data.message || 'Registration failed!', true);
                return;
            }

            showRegMessage(`Account ${data.userCode || ''} created! Redirecting to Sign In...`.trim(), false);
            setTimeout(() => { window.location.href = 'login.html'; }, 1000);
        } catch (_) {
            showRegMessage('Network error. Please try again!', true);
        }
    });

    // Bấm "Sign up with Google" -> bật popup chọn tài khoản Google thật & tạo/đăng nhập luôn
    document.querySelectorAll('#btnGoogleReg, #btnGoogleRegister, .btn-google-dark, .btn-google').forEach(btn => {
        btn.removeAttribute('onclick');
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!window.google?.accounts?.oauth2) {
                showRegMessage('Google Sign-In SDK is still loading. Please try again in a second.', true);
                return;
            }

            const role = document.querySelector('.role-card.active')?.dataset.role || selectedRegRole || 'Student';
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
                            showRegMessage('Could not retrieve your Google email.', true);
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
                            showRegMessage(data.message || 'Google sign-up failed.', true);
                            return;
                        }

                        const finalRole = data.role || role;
                        localStorage.setItem('sims_user', JSON.stringify({
                            email: data.email || profile.email,
                            fullName: data.fullName || profile.name || profile.email,
                            role: finalRole,
                            userCode: data.userCode || (finalRole === 'Teacher' ? 'GV001' : 'SV26001'),
                            major: data.major || 'Information Technology'
                        }));
                        window.location.href = finalRole === 'Admin'
                            ? 'admin.html'
                            : (finalRole === 'Teacher' ? 'teacher.html' : 'student.html');
                    } catch (_) {
                        showRegMessage('Failed to complete Google sign-up.', true);
                    }
                }
            });

            tokenClient.requestAccessToken({ prompt: 'select_account' });
        });
    });
});