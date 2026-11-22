document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();
    let selectedRegRole = 'Student';

    document.querySelectorAll('.role-card').forEach(card => {
        card.addEventListener('click', () => {
            selectedRegRole = card.dataset.role;
            document.querySelectorAll('.role-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            const codeLabel = document.getElementById('codeLabel');
            if (codeLabel) codeLabel.innerText = selectedRegRole === 'Student' ? 'Student ID (Optional)' : 'Lecturer ID (Optional)';
        });
    });

    document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fullName = document.getElementById('regFullName').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const userCode = document.getElementById('regCode').value.trim();
        const phone = document.getElementById('regPhone').value.trim();
        const major = document.getElementById('regMajor')?.value || 'Information Technology';
        const password = document.getElementById('regPass').value;
        const confirmPass = document.getElementById('regConfirmPass').value;
        const msgEl = document.getElementById('regMessage');

        if (password !== confirmPass) {
            msgEl.style.color = '#f87171';
            msgEl.innerText = 'Passwords do not match!';
            msgEl.style.display = 'block';
            return;
        }

        const res = await fetch('/api/portal/auth/register', {
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
        msgEl.innerText = `Account ${data.userCode} created! Redirecting to Sign In...`;
        msgEl.style.display = 'block';
        setTimeout(() => { window.location.href = 'login.html'; }, 1000);
    });
});