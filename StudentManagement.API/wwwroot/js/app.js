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

const DEFAULT_TEACHERS = [
    { id: 'GV-IT01', fullName: 'Dr. Nguyen Van Minh', department: 'Information Technology', email: 'minh.tv@unit.edu.vn', phone: '0901112201' },
    { id: 'GV-IT02', fullName: 'MSc. Tran Hoang Nam', department: 'Information Technology', email: 'nam.th@unit.edu.vn', phone: '0901112202' },
    { id: 'GV-MKT01', fullName: 'Dr. Le Thi Thu Ha', department: 'Marketing', email: 'ha.ltt@unit.edu.vn', phone: '0901112203' },
    { id: 'GV-MKT02', fullName: 'MSc. Pham Quoc Bao', department: 'Marketing', email: 'bao.pq@unit.edu.vn', phone: '0901112204' },
    { id: 'GV-GD01', fullName: 'MFA. Vo Minh Tuan', department: 'Graphic Design', email: 'tuan.vm@unit.edu.vn', phone: '0901112205' },
    { id: 'GV-GD02', fullName: 'MSc. Dang Ngoc Lan', department: 'Graphic Design', email: 'lan.dn@unit.edu.vn', phone: '0901112206' }
];

const DEFAULT_CLASSES = [
    { id: 'IT-K26A1', name: 'Software Engineering K26 - A1', department: 'Information Technology', lecturerId: 'GV-IT01', lecturerName: 'Dr. Nguyen Van Minh', maxCapacity: 30, enrolledCount: 28, status: 'Active' },
    { id: 'IT-K26A2', name: 'Software Engineering K26 - A2', department: 'Information Technology', lecturerId: 'GV-IT01', lecturerName: 'Dr. Nguyen Van Minh', maxCapacity: 30, enrolledCount: 28, status: 'Active' },
    { id: 'IT-K26A3', name: 'Cybersecurity & Cloud K26 - A3', department: 'Information Technology', lecturerId: 'GV-IT01', lecturerName: 'Dr. Nguyen Van Minh', maxCapacity: 30, enrolledCount: 28, status: 'Active' },
    { id: 'IT-K26B1', name: 'Full-Stack Web K26 - B1', department: 'Information Technology', lecturerId: 'GV-IT02', lecturerName: 'MSc. Tran Hoang Nam', maxCapacity: 30, enrolledCount: 28, status: 'Active' },
    { id: 'IT-K26B2', name: 'Data Engineering K26 - B2', department: 'Information Technology', lecturerId: 'GV-IT02', lecturerName: 'MSc. Tran Hoang Nam', maxCapacity: 30, enrolledCount: 28, status: 'Active' },
    { id: 'IT-K26B3', name: 'Mobile App Dev K26 - B3', department: 'Information Technology', lecturerId: 'GV-IT02', lecturerName: 'MSc. Tran Hoang Nam', maxCapacity: 30, enrolledCount: 27, status: 'Active' },
    { id: 'MKT-K26A1', name: 'Digital Marketing K26 - A1', department: 'Marketing', lecturerId: 'GV-MKT01', lecturerName: 'Dr. Le Thi Thu Ha', maxCapacity: 30, enrolledCount: 28, status: 'Active' },
    { id: 'MKT-K26A2', name: 'Digital Marketing K26 - A2', department: 'Marketing', lecturerId: 'GV-MKT01', lecturerName: 'Dr. Le Thi Thu Ha', maxCapacity: 30, enrolledCount: 28, status: 'Active' },
    { id: 'MKT-K26A3', name: 'Brand Strategy K26 - A3', department: 'Marketing', lecturerId: 'GV-MKT01', lecturerName: 'Dr. Le Thi Thu Ha', maxCapacity: 30, enrolledCount: 28, status: 'Active' },
    { id: 'MKT-K26B1', name: 'SEO & Performance K26 - B1', department: 'Marketing', lecturerId: 'GV-MKT02', lecturerName: 'MSc. Pham Quoc Bao', maxCapacity: 30, enrolledCount: 28, status: 'Active' },
    { id: 'MKT-K26B2', name: 'Social Media K26 - B2', department: 'Marketing', lecturerId: 'GV-MKT02', lecturerName: 'MSc. Pham Quoc Bao', maxCapacity: 30, enrolledCount: 28, status: 'Active' },
    { id: 'MKT-K26B3', name: 'Market Analytics K26 - B3', department: 'Marketing', lecturerId: 'GV-MKT02', lecturerName: 'MSc. Pham Quoc Bao', maxCapacity: 30, enrolledCount: 27, status: 'Active' },
    { id: 'GD-K26A1', name: 'UI/UX Product Design K26 - A1', department: 'Graphic Design', lecturerId: 'GV-GD01', lecturerName: 'MFA. Vo Minh Tuan', maxCapacity: 30, enrolledCount: 28, status: 'Active' },
    { id: 'GD-K26A2', name: 'UI/UX Product Design K26 - A2', department: 'Graphic Design', lecturerId: 'GV-GD01', lecturerName: 'MFA. Vo Minh Tuan', maxCapacity: 30, enrolledCount: 28, status: 'Active' },
    { id: 'GD-K26A3', name: 'Brand Identity K26 - A3', department: 'Graphic Design', lecturerId: 'GV-GD01', lecturerName: 'MFA. Vo Minh Tuan', maxCapacity: 30, enrolledCount: 28, status: 'Active' },
    { id: 'GD-K26B1', name: '2D & Motion Graphics K26 - B1', department: 'Graphic Design', lecturerId: 'GV-GD02', lecturerName: 'MSc. Dang Ngoc Lan', maxCapacity: 30, enrolledCount: 28, status: 'Active' },
    { id: 'GD-K26B2', name: '3D & Visual Modeling K26 - B2', department: 'Graphic Design', lecturerId: 'GV-GD02', lecturerName: 'MSc. Dang Ngoc Lan', maxCapacity: 30, enrolledCount: 28, status: 'Active' },
    { id: 'GD-K26B3', name: 'Technical Illustration K26 - B3', department: 'Graphic Design', lecturerId: 'GV-GD02', lecturerName: 'MSc. Dang Ngoc Lan', maxCapacity: 30, enrolledCount: 27, status: 'Active' }
];

const DEFAULT_COURSES = [
    { id: 'MATH201', name: 'Discrete Mathematics & Applied Calculus', department: 'Information Technology', credits: 3 },
    { id: 'PROG101', name: 'Object-Oriented Programming (C# / C++)', department: 'Information Technology', credits: 3 },
    { id: 'SEC301', name: 'Network & Application Security', department: 'Information Technology', credits: 3 },
    { id: 'IT101', name: 'Web Architecture & ASP.NET Core', department: 'Information Technology', credits: 3 },
    { id: 'IT202', name: 'PostgreSQL & Database Systems', department: 'Information Technology', credits: 3 },
    { id: 'MKT101', name: 'Digital Marketing & Consumer Insights', department: 'Marketing', credits: 3 },
    { id: 'GD101', name: 'Visual Design & Typography Principles', department: 'Graphic Design', credits: 3 },
    { id: 'GD202', name: 'UI/UX Prototyping & Design Systems', department: 'Graphic Design', credits: 3 }
];

let cache = {
    students: [],
    teachers: [...DEFAULT_TEACHERS],
    courses: [...DEFAULT_COURSES],
    classes: [...DEFAULT_CLASSES],
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
        classId: 'IT-K26A1',
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

function resolveAttendanceModuleName(rec, index) {
    if (rec.courseName) return rec.courseName;
    if (rec.moduleName) return rec.moduleName;
    if (rec.course) return rec.course;

    const matchedCourse = cache.courses.find(cs => cs.id === rec.courseId);
    if (matchedCourse?.name) return matchedCourse.name;

    const matchedClass = cache.classes.find(cl => cl.id === rec.classId);
    if (matchedClass?.name) return matchedClass.name;

    const deptCourses = cache.courses.filter(cs => !matchedClass || cs.department === matchedClass.department);
    if (deptCourses.length > 0) {
        return deptCourses[index % deptCourses.length].name;
    }

    return rec.courseId || rec.classId || 'Core Academic Module';
}

async function syncPortalState() {
    const email = encodeURIComponent(currentUser?.email || 'an.nv@unit.edu.vn');
    try {
        const res = await fetch(`/api/academic/state?email=${email}`);
        if (res.ok) {
            const data = await res.json();

            if (Array.isArray(data.teachers) && data.teachers.length > 0) {
                cache.teachers = data.teachers.map((t, idx) => {
                    const fallback = DEFAULT_TEACHERS[idx % DEFAULT_TEACHERS.length];
                    return {
                        ...fallback,
                        ...t,
                        id: t.id || fallback.id,
                        fullName: t.fullName || fallback.fullName,
                        department: t.department || t.major || fallback.department
                    };
                });
            }

            if (Array.isArray(data.courses) && data.courses.length > 0) {
                const defaultMap = new Map(DEFAULT_COURSES.map(c => [c.id, c]));
                cache.courses = data.courses.map((cs, idx) => {
                    const fb = defaultMap.get(cs.id) || DEFAULT_COURSES[idx % DEFAULT_COURSES.length];
                    const dept = cs.department || cs.major || fb.department;
                    return {
                        ...fb,
                        ...cs,
                        id: cs.id || fb.id,
                        name: cs.name || fb.name,
                        department: dept,
                        credits: cs.credits || fb.credits || 3
                    };
                });
            }

            if (Array.isArray(data.students) && data.students.length > 0) {
                cache.students = data.students.map((s, idx) => {
                    const major = s.major || s.department || 'Information Technology';
                    const fallbackClass = major === 'Marketing' ? 'MKT-K26A1' : (major === 'Graphic Design' ? 'GD-K26A1' : 'IT-K26A1');
                    return {
                        ...s,
                        id: s.id || `SV26${String(idx + 1).padStart(3, '0')}`,
                        fullName: s.fullName || s.name || `Student ${idx + 1}`,
                        major,
                        classId: s.classId || s.classCode || fallbackClass,
                        gpa: s.gpa ?? 3.5
                    };
                });
            }

            if (Array.isArray(data.classes) && data.classes.length > 0) {
                const prevById = new Map((cache.classes || []).map(c => [c.id, c]));
                const defaultById = new Map(DEFAULT_CLASSES.map(c => [c.id, c]));
                const deptCounters = {};

                cache.classes = data.classes.map((cl, idx) => {
                    const fb = defaultById.get(cl.id) || DEFAULT_CLASSES[idx % DEFAULT_CLASSES.length];
                    const prev = prevById.get(cl.id);
                    const dept = cl.department || cl.major || fb.department;
                    const realCount = cache.students.filter(s => s.classId === (cl.id || fb.id)).length;
                    const targetLecId = cl.lecturerId || prev?.lecturerId || fb.lecturerId || '';
                    let lec = cache.teachers.find(t => t.id === targetLecId);

                    if (!lec && cache.teachers.length > 0) {
                        const deptTeachers = cache.teachers.filter(t => t.department === dept);
                        const pool = deptTeachers.length > 0 ? deptTeachers : cache.teachers;
                        const cIdx = deptCounters[dept] || 0;
                        lec = pool[Math.floor(cIdx / 3) % pool.length];
                        deptCounters[dept] = cIdx + 1;
                    }

                    const invalidName = !cl.lecturerName || cl.lecturerName === 'Assigned Lecturer' || cl.lecturerName === 'Unassigned';
                    return {
                        ...fb,
                        ...cl,
                        id: cl.id || fb.id,
                        name: cl.name || fb.name,
                        department: dept,
                        maxCapacity: cl.maxCapacity || 30,
                        enrolledCount: realCount > 0 ? realCount : (typeof cl.enrolledCount === 'number' && cl.enrolledCount > 0 ? cl.enrolledCount : fb.enrolledCount),
                        lecturerId: lec?.id || targetLecId,
                        lecturerName: lec?.fullName || (!invalidName ? cl.lecturerName : prev?.lecturerName) || fb.lecturerName
                    };
                });
            }

            if (Array.isArray(data.schedules) && data.schedules.length > 0) {
                cache.schedules = data.schedules;
            }

            if (data.profile) {
                const resolvedMajor = data.profile.major || currentUser?.major || 'Information Technology';
                const resolvedClass = data.profile.classId || (resolvedMajor === 'Marketing' ? 'MKT-K26A1' : (resolvedMajor === 'Graphic Design' ? 'GD-K26A1' : 'IT-K26A1'));
                dynamicState.profile = {
                    ...dynamicState.profile,
                    ...data.profile,
                    major: resolvedMajor,
                    classId: resolvedClass
                };
            }

            if (data.invoices) dynamicState.invoices = data.invoices;
            if (data.announcements) dynamicState.announcements = data.announcements;
            if (data.tickets) dynamicState.tickets = data.tickets;
            if (data.assignments) dynamicState.assignments = data.assignments;
            if (Array.isArray(data.attendanceRecords)) {
                dynamicState.attendanceRecords = data.attendanceRecords.map((rec, idx) => {
                    const resolvedName = resolveAttendanceModuleName(rec, idx);
                    return {
                        ...rec,
                        courseName: resolvedName,
                        moduleName: resolvedName
                    };
                });
            }
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