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
            } else if (errEl) {
                const err = await res.json().catch(() => ({}));
                errEl.innerText = err.message || 'Invalid email or password!';
                errEl.style.display = 'block';
            }
        } catch (_) {
            if (errEl) {
                errEl.innerText = 'Network error. Please try again!';
                errEl.style.display = 'block';
            }
        }
    });

    // Bấm "Continue with Google" -> đăng nhập thẳng theo role đang chọn
    document.querySelectorAll('#btnGoogleLogin, .btn-google-light, .btn-google').forEach(btn => {
        btn.removeAttribute('onclick');
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const role = document.querySelector('.role-tab.active')?.dataset.role || currentRole || 'Student';
            const firstDemo = document.querySelector(`.demo-account-item[data-role="${role}"]`);
            const demoEmail = firstDemo?.dataset.email
                || (role === 'Admin' ? 'admin@unit.edu.vn' : (role === 'Teacher' ? 'lecturer@unit.edu.vn' : 'student@unit.edu.vn'));
            const demoPass = firstDemo?.dataset.pass || '123456';
            const demoName = role === 'Admin' ? 'System Admin' : (role === 'Teacher' ? 'University Lecturer' : 'Google Student');

            try {
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: demoEmail, password: demoPass })
                });
                if (res.ok) {
                    const data = await res.json();
                    saveUserAndRedirect(data, role, demoEmail, demoName);
                    return;
                }
            } catch (_) { /* fallback */ }

            saveUserAndRedirect(null, role, demoEmail, demoName);
        });
    });
});