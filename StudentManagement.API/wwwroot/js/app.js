const rawUser = localStorage.getItem('sims_user');
const currentUser = rawUser ? JSON.parse(rawUser) : null;

if (!currentUser) {
    window.location.href = 'login.html';
}

const ROLE_LABELS = {
    Admin: 'Administrator',
    Teacher: 'Lecturer',
    Student: 'Student'
};

if (currentUser) {
    const nameEl = document.getElementById('userNameDisplay');
    const roleEl = document.getElementById('userRoleBadge');
    if (nameEl) nameEl.innerText = currentUser.fullName;
    if (roleEl) roleEl.innerText = ROLE_LABELS[currentUser.role] || currentUser.role;
}

function refreshIcons() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function sparklineSvg(color) {
    return `<svg class="kpi-sparkline" viewBox="0 0 100 28" fill="none"><path d="M2 22 C18 10, 28 24, 45 14 C62 4, 75 18, 98 6" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/></svg>`;
}

function logout() {
    localStorage.removeItem('sims_user');
    window.location.href = 'login.html';
}

let cache = {
    students: [],
    teachers: [],
    courses: [],
    classes: [],
    grades: [
        { id: 1, studentId: 'SV26001', courseId: 'IT101', credits: 3, midtermScore: 8.5, finalScore: 9.0, gpa: 3.6, status: 'Excellent' },
        { id: 2, studentId: 'SV26001', courseId: 'IT202', credits: 3, midtermScore: 8.0, finalScore: 8.5, gpa: 3.3, status: 'Good' },
        { id: 3, studentId: 'SV26002', courseId: 'IT101', credits: 3, midtermScore: 9.0, finalScore: 9.0, gpa: 3.7, status: 'Excellent' }
    ],
    semesters: [
        { id: 'FALL-2026', name: 'Fall Semester (2026 - 2027)', start: '2026-09-01', end: '2027-01-15', status: 'Active' },
        { id: 'SPRING-2027', name: 'Spring Semester (2026 - 2027)', start: '2027-02-01', end: '2027-06-30', status: 'Upcoming' }
    ],
    schedules: [
        { day: 'Monday', time: '08:00 - 10:00', classId: 'IT-K26A1', course: 'ASP.NET Core & Web Architecture', room: 'Room A1.205', lecturer: 'Dr. Nguyen Van Minh' },
        { day: 'Tuesday', time: '10:30 - 12:00', classId: 'MKT-K26A1', course: 'Digital Marketing & SEO Strategy', room: 'Room B1.301', lecturer: 'Dr. Le Thi Thu Ha' },
        { day: 'Thursday', time: '14:00 - 16:00', classId: 'GD-K26A1', course: 'UI/UX Product Design', room: 'Studio C2.104', lecturer: 'MFA. Vo Minh Tuan' }
    ]
};

let dynamicState = {
    profile: {
        email: currentUser?.email || 'an.nv@unit.edu.vn',
        studentId: currentUser?.userCode || 'SV26001',
        fullName: currentUser?.fullName || 'Nguyen Thi Mai',
        phone: '0901234567',
        major: currentUser?.major || 'Information Technology',
        avatarBase64: ''
    },
    invoices: [],
    announcements: [],
    tickets: [],
    assignments: [],
    attendanceRecords: [],
    scholarships: [],
    events: [],
    auditLogs: []
};

function buildVietQrUrl(invoice) {
    const bank = invoice.bankCode || 'MB';
    const acc = invoice.accountNo || '0865156242';
    const amount = Math.round(invoice.amountVnd || 0);
    const info = encodeURIComponent(`${invoice.id} ${dynamicState.profile.studentId}`);
    const accName = encodeURIComponent(invoice.accountName || 'DUONG THI KIM YEN');
    return `https://img.vietqr.io/image/${bank}-${acc}-compact2.png?amount=${amount}&addInfo=${info}&accountName=${accName}`;
}

async function syncPortalState() {
    const email = encodeURIComponent(currentUser?.email || 'an.nv@unit.edu.vn');
    try {
        const res = await fetch(`/api/academic/state?email=${email}&t=${Date.now()}`);
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.students)) cache.students = data.students;
            if (Array.isArray(data.teachers)) cache.teachers = data.teachers;
            if (Array.isArray(data.courses)) cache.courses = data.courses;
            if (Array.isArray(data.schedules) && data.schedules.length > 0) cache.schedules = data.schedules;

            if (Array.isArray(data.classes)) {
                const prevById = new Map((cache.classes || []).map(c => [c.id, c]));
                const deptCounters = {};

                cache.classes = data.classes.map(cl => {
                    const realCount = cache.students.filter(s => s.classId === cl.id).length;
                    const prev = prevById.get(cl.id);
                    const targetLecId = cl.lecturerId || prev?.lecturerId || '';
                    let lec = cache.teachers.find(t => t.id === targetLecId);

                    if (!lec && cache.teachers.length > 0) {
                        const deptTeachers = cache.teachers.filter(t => t.department === cl.department);
                        const pool = deptTeachers.length > 0 ? deptTeachers : cache.teachers;
                        const idx = deptCounters[cl.department] || 0;
                        lec = pool[Math.floor(idx / 3) % pool.length];
                        deptCounters[cl.department] = idx + 1;
                    }

                    const invalidName = !cl.lecturerName || cl.lecturerName === 'Assigned Lecturer' || cl.lecturerName === 'Unassigned';
                    return {
                        ...cl,
                        maxCapacity: cl.maxCapacity || 30,
                        enrolledCount: (typeof cl.enrolledCount === 'number' && cl.enrolledCount > 0) ? cl.enrolledCount : realCount,
                        lecturerId: lec?.id || targetLecId,
                        lecturerName: lec?.fullName || (!invalidName ? cl.lecturerName : prev?.lecturerName) || 'Unassigned'
                    };
                });
            }

            if (data.profile) dynamicState.profile = { ...dynamicState.profile, ...data.profile };
            if (data.invoices) dynamicState.invoices = data.invoices;
            if (data.announcements) dynamicState.announcements = data.announcements;
            if (data.tickets) dynamicState.tickets = data.tickets;
            if (data.assignments) dynamicState.assignments = data.assignments;
            if (data.attendanceRecords) dynamicState.attendanceRecords = data.attendanceRecords;
            if (data.scholarships) dynamicState.scholarships = data.scholarships;
            if (data.events) dynamicState.events = data.events;
            if (data.auditLogs) dynamicState.auditLogs = data.auditLogs;
            if (dynamicState.profile.fullName && document.getElementById('userNameDisplay')) {
                document.getElementById('userNameDisplay').innerText = dynamicState.profile.fullName;
            }
        }
    } catch (_) { }
}

async function loadAllData() {
    await syncPortalState();
}

setInterval(async () => {
    const modalOpen = document.getElementById('appModal')?.classList.contains('open');
    const tag = document.activeElement?.tagName;
    if (modalOpen || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    await syncPortalState();
    const currentTab = typeof activeTab !== 'undefined' ? activeTab : window.activeTab;
    if (typeof currentTab !== 'undefined' && ['support', 'assignments', 'notifications', 'overview', 'audit', 'scholarships', 'attendance', 'tuition', 'events'].includes(currentTab) && typeof renderContent === 'function') {
        renderContent();
    }
}, 5000);

function openQrPaymentModal(invoiceId) {
    const inv = dynamicState.invoices.find(i => i.id === invoiceId);
    if (!inv) return;
    const qrUrl = buildVietQrUrl(inv);
    openModal(`Scan VietQR to Pay • ${inv.id}`, `
        <div style="text-align:center;">
            <p style="color:var(--text-muted); font-size:13px; margin-bottom:12px;">
                Semester: <strong style="color:#fff;">${inv.semester}</strong><br>
                Recipient: <strong style="color:#34d399;">MB Bank • 0865156242 (DUONG THI KIM YEN)</strong><br>
                Amount Due: <strong style="color:#38bdf8; font-size:18px;">${Number(inv.amountVnd).toLocaleString('en-US')} VND</strong>
            </p>
            <div style="background:#ffffff; padding:12px; border-radius:14px; display:inline-block; margin-bottom:14px;">
                <img src="${qrUrl}" alt="VietQR Payment" style="width:240px; height:auto; display:block;">
            </div>
            <p style="font-size:12px; color:var(--text-muted); margin-bottom:16px;">
                Transfer Content: <strong style="color:#fbbf24;">${inv.id} ${dynamicState.profile.studentId}</strong>
            </p>
            <button class="btn-primary" id="btnConfirmQrPaid">✓ I Have Completed the Transfer</button>
        </div>
    `);

    document.getElementById('btnConfirmQrPaid')?.addEventListener('click', async () => {
        await fetch(`/api/academic/pay/${inv.id}`, { method: 'POST' }).catch(() => { });
        inv.paid = true;
        closeModal();
        alert(`Payment confirmed for invoice ${inv.id}!`);
        if (typeof renderContent === 'function') renderContent();
    });
}

function handleGlobalSearch(keyword) {
    const k = (keyword || '').toLowerCase();
    document.querySelectorAll('#mainContent tbody tr').forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(k) ? '' : 'none';
    });
}

function openModal(title, html) {
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalBody').innerHTML = html;
    document.getElementById('appModal').classList.add('open');
    refreshIcons();
}

function closeModal() {
    document.getElementById('appModal').classList.remove('open');
}

document.getElementById('globalSearch')?.addEventListener('keyup', (e) => handleGlobalSearch(e.target.value));
document.getElementById('btnLogout')?.addEventListener('click', logout);
document.getElementById('btnCloseModal')?.addEventListener('click', closeModal);
refreshIcons();