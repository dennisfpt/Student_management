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

const MAX_CLASS_CAPACITY = 30;
const MAJORS_LIST = ['Information Technology', 'Marketing', 'Graphic Design'];

const DEFAULT_TEACHERS = [
    { id: 'GV-IT01', fullName: 'Dr. Nguyen Van Minh', department: 'Information Technology', email: 'minh.tv@unit.edu.vn', phone: '0901112201' },
    { id: 'GV-IT02', fullName: 'MSc. Tran Hoang Nam', department: 'Information Technology', email: 'nam.th@unit.edu.vn', phone: '0901112202' },
    { id: 'GV-MKT01', fullName: 'Dr. Le Thi Thu Ha', department: 'Marketing', email: 'ha.ltt@unit.edu.vn', phone: '0901112203' },
    { id: 'GV-MKT02', fullName: 'MSc. Pham Quoc Bao', department: 'Marketing', email: 'bao.pq@unit.edu.vn', phone: '0901112204' },
    { id: 'GV-GD01', fullName: 'MFA. Vo Minh Tuan', department: 'Graphic Design', email: 'tuan.vm@unit.edu.vn', phone: '0901112205' },
    { id: 'GV-GD02', fullName: 'MSc. Dang Ngoc Lan', department: 'Graphic Design', email: 'lan.dn@unit.edu.vn', phone: '0901112206' }
];

const DEFAULT_CLASSES = [
    { id: 'IT-K26A1', name: 'Software Engineering K26 - A1', department: 'Information Technology', lecturerId: 'GV-IT01', lecturerName: 'Dr. Nguyen Van Minh', maxCapacity: MAX_CLASS_CAPACITY, enrolledCount: 0, status: 'Active' },
    { id: 'IT-K26A2', name: 'Software Engineering K26 - A2', department: 'Information Technology', lecturerId: 'GV-IT01', lecturerName: 'Dr. Nguyen Van Minh', maxCapacity: MAX_CLASS_CAPACITY, enrolledCount: 0, status: 'Active' },
    { id: 'IT-K26A3', name: 'Cybersecurity & Cloud K26 - A3', department: 'Information Technology', lecturerId: 'GV-IT01', lecturerName: 'Dr. Nguyen Van Minh', maxCapacity: MAX_CLASS_CAPACITY, enrolledCount: 0, status: 'Active' },
    { id: 'IT-K26B1', name: 'Full-Stack Web K26 - B1', department: 'Information Technology', lecturerId: 'GV-IT02', lecturerName: 'MSc. Tran Hoang Nam', maxCapacity: MAX_CLASS_CAPACITY, enrolledCount: 0, status: 'Active' },
    { id: 'IT-K26B2', name: 'Data Engineering K26 - B2', department: 'Information Technology', lecturerId: 'GV-IT02', lecturerName: 'MSc. Tran Hoang Nam', maxCapacity: MAX_CLASS_CAPACITY, enrolledCount: 0, status: 'Active' },
    { id: 'IT-K26B3', name: 'Mobile App Dev K26 - B3', department: 'Information Technology', lecturerId: 'GV-IT02', lecturerName: 'MSc. Tran Hoang Nam', maxCapacity: MAX_CLASS_CAPACITY, enrolledCount: 0, status: 'Active' },
    { id: 'MKT-K26A1', name: 'Digital Marketing K26 - A1', department: 'Marketing', lecturerId: 'GV-MKT01', lecturerName: 'Dr. Le Thi Thu Ha', maxCapacity: MAX_CLASS_CAPACITY, enrolledCount: 0, status: 'Active' },
    { id: 'MKT-K26A2', name: 'Digital Marketing K26 - A2', department: 'Marketing', lecturerId: 'GV-MKT01', lecturerName: 'Dr. Le Thi Thu Ha', maxCapacity: MAX_CLASS_CAPACITY, enrolledCount: 0, status: 'Active' },
    { id: 'MKT-K26A3', name: 'Brand Strategy K26 - A3', department: 'Marketing', lecturerId: 'GV-MKT01', lecturerName: 'Dr. Le Thi Thu Ha', maxCapacity: MAX_CLASS_CAPACITY, enrolledCount: 0, status: 'Active' },
    { id: 'MKT-K26B1', name: 'SEO & Performance K26 - B1', department: 'Marketing', lecturerId: 'GV-MKT02', lecturerName: 'MSc. Pham Quoc Bao', maxCapacity: MAX_CLASS_CAPACITY, enrolledCount: 0, status: 'Active' },
    { id: 'MKT-K26B2', name: 'Social Media K26 - B2', department: 'Marketing', lecturerId: 'GV-MKT02', lecturerName: 'MSc. Pham Quoc Bao', maxCapacity: MAX_CLASS_CAPACITY, enrolledCount: 0, status: 'Active' },
    { id: 'MKT-K26B3', name: 'Market Analytics K26 - B3', department: 'Marketing', lecturerId: 'GV-MKT02', lecturerName: 'MSc. Pham Quoc Bao', maxCapacity: MAX_CLASS_CAPACITY, enrolledCount: 0, status: 'Active' },
    { id: 'GD-K26A1', name: 'UI/UX Product Design K26 - A1', department: 'Graphic Design', lecturerId: 'GV-GD01', lecturerName: 'MFA. Vo Minh Tuan', maxCapacity: MAX_CLASS_CAPACITY, enrolledCount: 0, status: 'Active' },
    { id: 'GD-K26A2', name: 'UI/UX Product Design K26 - A2', department: 'Graphic Design', lecturerId: 'GV-GD01', lecturerName: 'MFA. Vo Minh Tuan', maxCapacity: MAX_CLASS_CAPACITY, enrolledCount: 0, status: 'Active' },
    { id: 'GD-K26A3', name: 'Brand Identity K26 - A3', department: 'Graphic Design', lecturerId: 'GV-GD01', lecturerName: 'MFA. Vo Minh Tuan', maxCapacity: MAX_CLASS_CAPACITY, enrolledCount: 0, status: 'Active' },
    { id: 'GD-K26B1', name: '2D & Motion Graphics K26 - B1', department: 'Graphic Design', lecturerId: 'GV-GD02', lecturerName: 'MSc. Dang Ngoc Lan', maxCapacity: MAX_CLASS_CAPACITY, enrolledCount: 0, status: 'Active' },
    { id: 'GD-K26B2', name: '3D & Visual Modeling K26 - B2', department: 'Graphic Design', lecturerId: 'GV-GD02', lecturerName: 'MSc. Dang Ngoc Lan', maxCapacity: MAX_CLASS_CAPACITY, enrolledCount: 0, status: 'Active' },
    { id: 'GD-K26B3', name: 'Technical Illustration K26 - B3', department: 'Graphic Design', lecturerId: 'GV-GD02', lecturerName: 'MSc. Dang Ngoc Lan', maxCapacity: MAX_CLASS_CAPACITY, enrolledCount: 0, status: 'Active' }
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

function inferMajorFromClassId(classId, index = 0) {
    const code = String(classId || '').toUpperCase();
    if (code.startsWith('MKT-')) return 'Marketing';
    if (code.startsWith('GD-')) return 'Graphic Design';
    if (code.startsWith('IT-')) return 'Information Technology';
    return MAJORS_LIST[index % MAJORS_LIST.length];
}

function getMajorPrefix(major) {
    if (major === 'Marketing') return 'MKT';
    if (major === 'Graphic Design') return 'GD';
    return 'IT';
}

function balanceStudentsIntoClasses(rawStudents, rawClasses, teachers) {
    const deptCounters = {};
    const classList = rawClasses.map((cl, idx) => {
        const fb = DEFAULT_CLASSES[idx % DEFAULT_CLASSES.length];
        const dept = cl.department || cl.major || fb.department;
        const cap = Math.min(MAX_CLASS_CAPACITY, Math.max(1, Number(cl.maxCapacity) || MAX_CLASS_CAPACITY));
        let lec = teachers.find(t => t.id === cl.lecturerId);
        if (!lec && teachers.length > 0) {
            const deptTeachers = teachers.filter(t => t.department === dept);
            const pool = deptTeachers.length > 0 ? deptTeachers : teachers;
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
            maxCapacity: cap,
            enrolledCount: 0,
            lecturerId: lec?.id || cl.lecturerId || '',
            lecturerName: lec?.fullName || (!invalidName ? cl.lecturerName : fb.lecturerName)
        };
    });

    const classMap = new Map(classList.map(c => [c.id, c]));
    const ensureAvailableDeptClass = (dept, preferredId) => {
        if (preferredId && classMap.has(preferredId)) {
            const pref = classMap.get(preferredId);
            if (pref.enrolledCount < pref.maxCapacity) return pref;
        }
        const candidate = classList.find(c => c.department === dept && c.enrolledCount < c.maxCapacity);
        if (candidate) return candidate;

        const prefix = getMajorPrefix(dept);
        const existingDeptCount = classList.filter(c => c.department === dept).length + 1;
        const newId = `${prefix}-K26S${existingDeptCount}`;
        const deptTeachers = teachers.filter(t => t.department === dept);
        const lec = deptTeachers[(existingDeptCount - 1) % Math.max(1, deptTeachers.length)] || teachers[0];
        const created = {
            id: newId,
            name: `${dept} K26 - Section ${existingDeptCount}`,
            department: dept,
            lecturerId: lec?.id || '',
            lecturerName: lec?.fullName || 'Assigned Lecturer',
            maxCapacity: MAX_CLASS_CAPACITY,
            enrolledCount: 0,
            status: 'Active'
        };
        classList.push(created);
        classMap.set(newId, created);
        return created;
    };

    const normalizedStudents = rawStudents.map((s, idx) => {
        const rawClass = (s.classId || s.classCode || '').trim();
        const major = (s.major && s.major.trim())
            ? s.major.trim()
            : inferMajorFromClassId(rawClass, idx);
        return {
            ...s,
            id: s.id || `SV26${String(idx + 1).padStart(3, '0')}`,
            fullName: s.fullName || s.name || `Student ${idx + 1}`,
            major,
            _preferredClass: rawClass,
            gpa: s.gpa ?? 0
        };
    });

    const unassigned = [];
    for (const st of normalizedStudents) {
        const target = st._preferredClass ? classMap.get(st._preferredClass) : null;
        if (target && target.department === st.major && target.enrolledCount < target.maxCapacity) {
            target.enrolledCount += 1;
            st.classId = target.id;
        } else {
            unassigned.push(st);
        }
    }

    const rrIndexByDept = {};
    for (const st of unassigned) {
        const deptClasses = classList.filter(c => c.department === st.major);
        const openClasses = deptClasses.filter(c => c.enrolledCount < c.maxCapacity);
        if (openClasses.length > 0) {
            const idx = rrIndexByDept[st.major] || 0;
            const chosen = openClasses[idx % openClasses.length];
            rrIndexByDept[st.major] = idx + 1;
            chosen.enrolledCount += 1;
            st.classId = chosen.id;
        } else {
            const created = ensureAvailableDeptClass(st.major, null);
            created.enrolledCount += 1;
            st.classId = created.id;
        }
        delete st._preferredClass;
    }

    for (const st of normalizedStudents) {
        delete st._preferredClass;
    }

    return { students: normalizedStudents, classes: classList };
}

function getVisibleAnnouncements() {
    const list = Array.isArray(dynamicState?.announcements) ? dynamicState.announcements : [];
    if (currentUser?.role === 'Teacher') {
        return list.filter(a => {
            const cat = (a.category || '').toLowerCase();
            const title = (a.title || '').toLowerCase();
            const target = (a.targetGroup || '').toLowerCase();
            if (cat.includes('tuition') || title.includes('tuition') || title.includes('vietqr')) return false;
            if (target === 'students' || target === 'student') return false;
            return true;
        });
    }
    return list;
}

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

function updateNotificationBell() {
    const topbarUser = document.querySelector('.topbar-user');
    const topbar = document.querySelector('.topbar');
    if (!topbarUser || !topbar) return;

    const visibleList = getVisibleAnnouncements();
    const count = visibleList.length;
    let bellWrap = document.getElementById('topbarNotifBellWrap');
    if (!bellWrap) {
        bellWrap = document.createElement('button');
        bellWrap.id = 'topbarNotifBellWrap';
        bellWrap.type = 'button';
        bellWrap.title = 'Notifications';
        bellWrap.style.cssText = 'position:relative;display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:10px;border:1px solid rgba(148,163,184,0.25);background:rgba(15,23,42,0.75);color:#f8fafc;cursor:pointer;margin-right:12px;flex-shrink:0;';
        bellWrap.innerHTML = `
            <i data-lucide="bell" style="width:17px;height:17px;"></i>
            <span id="topbarNotifBadge" style="position:absolute;top:-5px;right:-5px;min-width:18px;height:18px;padding:0 5px;border-radius:999px;background:#ef4444;color:#fff;font-size:11px;font-weight:700;display:none;align-items:center;justify-content:center;">0</span>
        `;
        bellWrap.addEventListener('click', () => {
            if (typeof switchTab === 'function' && (currentUser?.role === 'Student' || currentUser?.role === 'Teacher')) {
                switchTab('notifications');
                return;
            }
            const items = getVisibleAnnouncements().slice(0, 8);
            openModal(`Notifications (${items.length})`, items.length
                ? items.map(n => `<div style="padding:10px 0;border-bottom:1px solid rgba(148,163,184,0.15);"><strong>${n.title || 'Notice'}</strong> <small style="color:#64748b;">• ${n.createdAt || ''}</small><p style="margin:4px 0 0;color:#cbd5e1;font-size:12.5px;">${n.message || ''}</p></div>`).join('')
                : '<p style="color:#94a3b8;">No notifications yet.</p>');
        });
        topbarUser.insertBefore(bellWrap, topbarUser.firstChild);
    }

    const badge = document.getElementById('topbarNotifBadge');
    if (badge) {
        badge.innerText = String(count);
        badge.style.display = count > 0 ? 'inline-flex' : 'none';
    }
    refreshIcons();
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

            const rawClasses = (Array.isArray(data.classes) && data.classes.length > 0) ? data.classes : DEFAULT_CLASSES;
            const rawStudents = (Array.isArray(data.students) && data.students.length > 0) ? data.students : [];

            const rawMajors = new Set(rawStudents.map(s => (s.major || s.department || '').trim()).filter(Boolean));
            const allSingleDefault = rawMajors.size <= 1 && rawStudents.length > 30 && rawStudents.every(s => !(s.classId || s.classCode || '').trim());

            const preparedStudents = rawStudents.map((s, idx) => {
                const rawClass = (s.classId || s.classCode || '').trim();
                const major = (!allSingleDefault && s.major && s.major.trim())
                    ? s.major.trim()
                    : inferMajorFromClassId(rawClass, idx);
                return {
                    ...s,
                    major,
                    classId: rawClass
                };
            });

            const balanced = balanceStudentsIntoClasses(preparedStudents, rawClasses, cache.teachers);
            cache.students = balanced.students;
            cache.classes = balanced.classes;

            if (Array.isArray(data.schedules) && data.schedules.length > 0) {
                cache.schedules = data.schedules;
            }

            if (data.profile) {
                const matchedStu = cache.students.find(s => (s.email || '').toLowerCase() === (data.profile.email || currentUser?.email || '').toLowerCase());
                const resolvedMajor = matchedStu?.major || data.profile.major || currentUser?.major || 'Information Technology';
                const resolvedClass = matchedStu?.classId || data.profile.classId || (resolvedMajor === 'Marketing' ? 'MKT-K26A1' : (resolvedMajor === 'Graphic Design' ? 'GD-K26A1' : 'IT-K26A1'));
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

    updateNotificationBell();
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
updateNotificationBell();
refreshIcons();