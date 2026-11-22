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
        document.getElementById('emailInput').value = email;
        document.getElementById('passwordInput').value = pass;
        selectRole(role, document.querySelector(`.role-tab[data-role="${role}"]`));
    }

    function redirectByRole(role) {
        if (role === 'Admin') window.location.href = 'admin.html';
        else if (role === 'Teacher') window.location.href = 'teacher.html';
        else window.location.href = 'student.html';
    }

    document.querySelectorAll('.role-tab').forEach(btn => btn.addEventListener('click', () => selectRole(btn.dataset.role, btn)));
    document.querySelectorAll('.demo-account-item').forEach(item => item.addEventListener('click', () => fillDemo(item.dataset.email, item.dataset.pass, item.dataset.role)));

    document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('emailInput').value.trim();
        const password = document.getElementById('passwordInput').value;
        const errEl = document.getElementById('errorMsg');
        errEl.style.display = 'none';

        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (res.ok) {
            const data = await res.json();
            localStorage.setItem('sims_user', JSON.stringify({
                email: data.email,
                fullName: data.fullName,
                role: data.role,
                userCode: data.userCode,
                major: data.major
            }));
            redirectByRole(data.role);
        } else {
            const err = await res.json().catch(() => ({}));
            errEl.innerText = err.message || 'Invalid email or password!';
            errEl.style.display = 'block';
        }
    });
});