document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();
    let selectedRegRole = 'Student';

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
        const msgEl = document.getElementById('regMessage');

        if (!msgEl) return;

        if (password !== confirmPass) {
            msgEl.style.color = '#f87171';
            msgEl.innerText = 'Passwords do not match!';
            msgEl.style.display = 'block';
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
                msgEl.style.color = '#f87171';
                msgEl.innerText = data.message || 'Registration failed!';
                msgEl.style.display = 'block';
                return;
            }

            msgEl.style.color = '#34d399';
            msgEl.innerText = `Account ${data.userCode || ''} created! Redirecting to Sign In...`.trim();
            msgEl.style.display = 'block';
            setTimeout(() => { window.location.href = 'login.html'; }, 1000);
        } catch (_) {
            msgEl.style.color = '#f87171';
            msgEl.innerText = 'Network error. Please try again!';
            msgEl.style.display = 'block';
        }
    });

    // Bấm "Continue with Google" trên trang Register -> vào thẳng portal theo role đang chọn
    document.querySelectorAll('#btnGoogleRegister, .btn-google-dark, .btn-google').forEach(btn => {
        btn.removeAttribute('onclick');
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const role = document.querySelector('.role-card.active')?.dataset.role || selectedRegRole || 'Student';
            const demoEmail = role === 'Teacher' ? 'lecturer@unit.edu.vn' : 'student@unit.edu.vn';
            const demoName = role === 'Teacher' ? 'University Lecturer' : 'Google Student';

            try {
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: demoEmail, password: '123456' })
                });
                if (res.ok) {
                    const data = await res.json();
                    localStorage.setItem('sims_user', JSON.stringify({
                        email: data.email || demoEmail,
                        fullName: data.fullName || demoName,
                        role: data.role || role,
                        userCode: data.userCode || (role === 'Teacher' ? 'GV001' : 'SV26001'),
                        major: data.major || 'Information Technology'
                    }));
                    window.location.href = role === 'Teacher' ? 'teacher.html' : 'student.html';
                    return;
                }
            } catch (_) { /* fallback */ }

            localStorage.setItem('sims_user', JSON.stringify({
                email: demoEmail,
                fullName: demoName,
                role,
                userCode: role === 'Teacher' ? 'GV001' : 'SV26001',
                major: 'Information Technology'
            }));
            window.location.href = role === 'Teacher' ? 'teacher.html' : 'student.html';
        });
    });
});