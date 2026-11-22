if (!currentUser || currentUser.role !== 'Admin') {
    window.location.href = currentUser?.role === 'Teacher' ? 'teacher.html' : (currentUser?.role === 'Student' ? 'student.html' : 'login.html');
}

const ADMIN_MENUS = [
    { id: 'overview', icon: 'layout-dashboard', label: 'Overview' },
    { id: 'students', icon: 'graduation-cap', label: 'Students (500)' },
    { id: 'teachers', icon: 'user-check', label: 'Lecturers' },
    { id: 'classes', icon: 'school', label: 'Classes (≤30/cls)' },
    { id: 'courses', icon: 'book-open', label: 'Courses' },
    { id: 'semesters', icon: 'calendar-range', label: 'Semesters' },
    { id: 'schedules', icon: 'clock', label: 'Timetable' },
    { id: 'grades', icon: 'file-spreadsheet', label: 'Grades' },
    { id: 'attendance', icon: 'check-circle-2', label: 'Attendance' },
    { id: 'scholarships', icon: 'award', label: 'Scholarships' },
    { id: 'events', icon: 'calendar-check', label: 'Events & Conduct' },
    { id: 'emails', icon: 'mail', label: 'Email Center' },
    { id: 'support', icon: 'life-buoy', label: 'Support Desk' },
    { id: 'audit', icon: 'shield-alert', label: 'Audit Logs' },
    { id: 'reports', icon: 'bar-chart-3', label: 'Reports' },
    { id: 'settings', icon: 'settings', label: 'Settings' }
];

let activeTab = 'overview';
let filterMajor = 'ALL';
let filterClass = 'ALL';
let studentPage = 1;
const STUDENTS_PER_PAGE = 25;

function renderSidebar() {
    const sidebar = document.getElementById('sidebarMenu');
    sidebar.innerHTML = ADMIN_MENUS.map(m =>
        `<div class="menu-item ${m.id === activeTab ? 'active' : ''}" data-tab="${m.id}"><i data-lucide="${m.icon}"></i><span>${m.label}</span></div>`
    ).join('');
    sidebar.querySelectorAll('.menu-item').forEach(el => el.addEventListener('click', () => switchTab(el.dataset.tab)));
    refreshIcons();
}

function switchTab(id) {
    activeTab = id;
    renderSidebar();
    renderContent();
}

function renderContent() {
    const c = document.getElementById('mainContent');

    if (activeTab === 'overview') {
        const itCount = cache.students.filter(s => s.major === 'Information Technology').length;
        const mktCount = cache.students.filter(s => s.major === 'Marketing').length;
        const gdCount = cache.students.filter(s => s.major === 'Graphic Design').length;
        const openTickets = (dynamicState.tickets || []).filter(t => t.status !== 'Resolved').length;

        c.innerHTML = `
            <div class="dashboard-hero-banner">
                <div>
                    <h1>Dashboard Overview</h1>
                    <p>3 Faculties: Information Technology (${itCount}) • Marketing (${mktCount}) • Graphic Design (${gdCount})</p>
                </div>
                <div style="display:flex; gap:10px;">
                    <button class="btn-outline" id="btnHeroTuitionQr"><i data-lucide="qr-code" style="width:16px;height:16px;"></i> Publish Tuition QR</button>
                    <button class="btn-action" id="btnHeroManage"><i data-lucide="user-plus" style="width:16px;height:16px;"></i> Manage Students</button>
                </div>
            </div>

            <div class="kpi-grid">
                <div class="kpi-card kpi-blue">
                    <div class="kpi-top"><div class="kpi-icon"><i data-lucide="users"></i></div><div><div class="kpi-value">${cache.students.length}</div><div class="kpi-label">Total Enrolled Students</div></div></div>
                    <div class="kpi-footer"><span class="kpi-trend-up">3 Majors</span>${sparklineSvg('#38bdf8')}</div>
                </div>
                <div class="kpi-card kpi-emerald">
                    <div class="kpi-top"><div class="kpi-icon"><i data-lucide="user-check"></i></div><div><div class="kpi-value">${cache.teachers.length}</div><div class="kpi-label">Specialized Lecturers</div></div></div>
                    <div class="kpi-footer"><span class="kpi-trend-up">1 Major / Lecturer</span>${sparklineSvg('#34d399')}</div>
                </div>
                <div class="kpi-card kpi-purple">
                    <div class="kpi-top"><div class="kpi-icon"><i data-lucide="school"></i></div><div><div class="kpi-value">${cache.classes.length}</div><div class="kpi-label">Active Classes (≤30 SV)</div></div></div>
                    <div class="kpi-footer"><span class="kpi-trend-up">Avg 27.8 / Class</span>${sparklineSvg('#c084fc')}</div>
                </div>
                <div class="kpi-card kpi-amber">
                    <div class="kpi-top"><div class="kpi-icon"><i data-lucide="life-buoy"></i></div><div><div class="kpi-value">${openTickets}</div><div class="kpi-label">Open Support Requests</div></div></div>
                    <div class="kpi-footer"><span class="kpi-trend-up">Student Helpdesk</span>${sparklineSvg('#fbbf24')}</div>
                </div>
            </div>

            <div class="charts-grid">
                <div class="card-box">
                    <h3><i data-lucide="bar-chart-3" style="width:18px;height:18px;color:#38bdf8;"></i> Student Distribution by Major (${cache.students.length} Students)</h3>
                    <canvas id="academicChart" height="125"></canvas>
                </div>
                <div class="card-box">
                    <h3><i data-lucide="activity" style="width:18px;height:18px;color:#c084fc;"></i> Recent Activities</h3>
                    <div class="activity-list">
                        ${(dynamicState.announcements || []).slice(0, 4).map(a => `
                            <div class="activity-item">
                                <span><strong>${a.title}</strong></span>
                                <small style="color:var(--text-muted)">${a.createdAt}</small>
                            </div>`).join('')}
                    </div>
                </div>
            </div>

            <div class="card-box">
                <h3><i data-lucide="zap" style="width:18px;height:18px;color:#fbbf24;"></i> Quick Actions</h3>
                <div class="quick-actions-grid" style="grid-template-columns: repeat(4, 1fr);">
                    <button class="qa-tile qa-blue" id="qaAddStudent"><i data-lucide="user-plus" style="width:20px;height:20px;"></i><span>Add Student</span></button>
                    <button class="qa-tile qa-purple" id="qaScholarships"><i data-lucide="award" style="width:20px;height:20px;"></i><span>Run Scholarships</span></button>
                    <button class="qa-tile qa-emerald" id="qaEmailCenter"><i data-lucide="mail" style="width:20px;height:20px;"></i><span>Send Class Email</span></button>
                    <button class="qa-tile qa-amber" id="qaAuditLogs"><i data-lucide="shield-alert" style="width:20px;height:20px;"></i><span>Security Audit Logs</span></button>
                </div>
            </div>`;

        document.getElementById('btnHeroManage')?.addEventListener('click', () => switchTab('students'));
        document.getElementById('btnHeroTuitionQr')?.addEventListener('click', openPublishTuitionModal);
        document.getElementById('qaAddStudent')?.addEventListener('click', openAddStudentModal);
        document.getElementById('qaScholarships')?.addEventListener('click', () => switchTab('scholarships'));
        document.getElementById('qaEmailCenter')?.addEventListener('click', () => switchTab('emails'));
        document.getElementById('qaAuditLogs')?.addEventListener('click', () => switchTab('audit'));

        if (typeof Chart !== 'undefined') {
            new Chart(document.getElementById('academicChart'), {
                type: 'bar',
                data: {
                    labels: ['Information Technology', 'Marketing', 'Graphic Design'],
                    datasets: [{
                        label: 'Enrolled Students',
                        data: [itCount, mktCount, gdCount],
                        backgroundColor: ['#38bdf8', '#c084fc', '#34d399'],
                        borderRadius: 8
                    }]
                },
                options: {
                    plugins: { legend: { labels: { color: '#94a3b8' } } },
                    scales: {
                        x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                        y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
                    }
                }
            });
        }

    } else if (activeTab === 'students') {
        let filtered = cache.students;
        if (filterMajor !== 'ALL') filtered = filtered.filter(s => s.major === filterMajor);
        if (filterClass !== 'ALL') filtered = filtered.filter(s => s.classId === filterClass);

        const totalPages = Math.max(1, Math.ceil(filtered.length / STUDENTS_PER_PAGE));
        if (studentPage > totalPages) studentPage = 1;
        const startIdx = (studentPage - 1) * STUDENTS_PER_PAGE;
        const pageSlice = filtered.slice(startIdx, startIdx + STUDENTS_PER_PAGE);

        c.innerHTML = `
            <div class="page-header">
                <div><h1>Student Directory (${filtered.length} / ${cache.students.length} Students)</h1><p style="color:var(--text-muted)">Real-time enrollment across Information Technology, Marketing &amp; Graphic Design</p></div>
                <div style="display:flex; gap:10px;">
                    <button class="btn-outline" id="btnExportCsv"><i data-lucide="download" style="width:15px;height:15px;"></i> Export CSV</button>
                    <button class="btn-action" id="btnOpenAddStudent"><i data-lucide="plus" style="width:15px;height:15px;"></i> Add Student</button>
                </div>
            </div>
            <div class="card-box">
                <div class="filter-toolbar">
                    <select id="selFilterMajor" class="filter-select">
                        <option value="ALL" ${filterMajor === 'ALL' ? 'selected' : ''}>All Majors (3)</option>
                        <option value="Information Technology" ${filterMajor === 'Information Technology' ? 'selected' : ''}>Information Technology</option>
                        <option value="Marketing" ${filterMajor === 'Marketing' ? 'selected' : ''}>Marketing</option>
                        <option value="Graphic Design" ${filterMajor === 'Graphic Design' ? 'selected' : ''}>Graphic Design</option>
                    </select>
                    <select id="selFilterClass" class="filter-select">
                        <option value="ALL">All Classes (${cache.classes.length})</option>
                        ${cache.classes
                .filter(cl => filterMajor === 'ALL' || cl.department === filterMajor)
                .map(cl => `<option value="${cl.id}" ${filterClass === cl.id ? 'selected' : ''}>${cl.id} (${cl.enrolledCount}/${cl.maxCapacity} SV)</option>`)
                .join('')}
                    </select>
                </div>
                <table>
                    <thead><tr><th>Student ID</th><th>Full Name</th><th>Major</th><th>Class</th><th>Email</th><th>GPA</th><th>Actions</th></tr></thead>
                    <tbody>
                        ${pageSlice.map(s => `
                            <tr>
                                <td><strong>${s.id}</strong></td>
                                <td>${s.fullName}</td>
                                <td><span class="status-pill pill-blue">${s.major}</span></td>
                                <td><strong>${s.classId}</strong></td>
                                <td>${s.email}</td>
                                <td>${Number(s.gpa ?? 3.5).toFixed(2)}</td>
                                <td>
                                    <button class="btn-sm btn-success" data-edit-student="${s.id}">Edit</button>
                                    <button class="btn-sm btn-edit" data-mail-person="${s.email}" data-mail-name="${s.fullName}">Email</button>
                                    <button class="btn-sm btn-delete" data-del-student="${s.id}">Delete</button>
                                </td>
                            </tr>`).join('')}
                    </tbody>
                </table>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:16px; color:var(--text-muted); font-size:13px;">
                    <span>Showing ${startIdx + 1}–${Math.min(startIdx + STUDENTS_PER_PAGE, filtered.length)} of ${filtered.length} students</span>
                    <div style="display:flex; gap:8px;">
                        <button class="btn-outline" id="btnPrevPage" ${studentPage <= 1 ? 'disabled' : ''}>← Prev</button>
                        <span style="padding:8px 12px;">Page ${studentPage} / ${totalPages}</span>
                        <button class="btn-outline" id="btnNextPage" ${studentPage >= totalPages ? 'disabled' : ''}>Next →</button>
                    </div>
                </div>
            </div>`;

        document.getElementById('selFilterMajor')?.addEventListener('change', (e) => { filterMajor = e.target.value; filterClass = 'ALL'; studentPage = 1; renderContent(); });
        document.getElementById('selFilterClass')?.addEventListener('change', (e) => { filterClass = e.target.value; studentPage = 1; renderContent(); });
        document.getElementById('btnPrevPage')?.addEventListener('click', () => { if (studentPage > 1) { studentPage--; renderContent(); } });
        document.getElementById('btnNextPage')?.addEventListener('click', () => { if (studentPage < totalPages) { studentPage++; renderContent(); } });
        document.getElementById('btnExportCsv')?.addEventListener('click', exportCsv);
        document.getElementById('btnOpenAddStudent')?.addEventListener('click', openAddStudentModal);
        c.querySelectorAll('[data-edit-student]').forEach(btn => btn.addEventListener('click', () => openEditStudentModal(btn.dataset.editStudent)));
        c.querySelectorAll('[data-mail-person]').forEach(btn => btn.addEventListener('click', () => openQuickPersonEmailModal(btn.dataset.mailPerson, btn.dataset.mailName)));
        c.querySelectorAll('[data-del-student]').forEach(btn => btn.addEventListener('click', () => deleteStudent(btn.dataset.delStudent)));

    } else if (activeTab === 'teachers') {
        c.innerHTML = `
            <div class="page-header">
                <div><h1>Faculty &amp; Lecturers (${cache.teachers.length})</h1><p style="color:var(--text-muted)">Rule: Each lecturer belongs to 1 specialized major and teaches multiple classes (≤30 students/class)</p></div>
                <button class="btn-action" id="btnOpenAddTeacher"><i data-lucide="plus" style="width:15px;height:15px;"></i> Add Lecturer</button>
            </div>
            <div class="card-box">
                <table>
                    <thead><tr><th>Lecturer ID</th><th>Full Name</th><th>Single Major / Specialty</th><th>Assigned Classes</th><th>Email</th><th>Actions</th></tr></thead>
                    <tbody>
                        ${cache.teachers.map(t => {
            const assigned = cache.classes.filter(cl => cl.lecturerId === t.id).map(cl => `${cl.id} (${cl.enrolledCount})`).join(', ') || 'None';
            return `
                            <tr>
                                <td><strong>${t.id}</strong></td>
                                <td>${t.fullName}</td>
                                <td><span class="status-pill pill-blue">${t.department}</span></td>
                                <td style="font-size:12.5px;">${assigned}</td>
                                <td>${t.email}</td>
                                <td>
                                    <button class="btn-sm btn-success" data-edit-teacher="${t.id}">Edit</button>
                                    <button class="btn-sm btn-edit" data-mail-person="${t.email}" data-mail-name="${t.fullName}">Email</button>
                                    <button class="btn-sm btn-delete" data-del-teacher="${t.id}">Delete</button>
                                </td>
                            </tr>`;
        }).join('')}
                    </tbody>
                </table>
            </div>`;
        document.getElementById('btnOpenAddTeacher')?.addEventListener('click', openAddTeacherModal);
        c.querySelectorAll('[data-edit-teacher]').forEach(btn => btn.addEventListener('click', () => openEditTeacherModal(btn.dataset.editTeacher)));
        c.querySelectorAll('[data-mail-person]').forEach(btn => btn.addEventListener('click', () => openQuickPersonEmailModal(btn.dataset.mailPerson, btn.dataset.mailName)));
        c.querySelectorAll('[data-del-teacher]').forEach(btn => btn.addEventListener('click', () => deleteTeacher(btn.dataset.delTeacher)));

    } else if (activeTab === 'classes') {
        c.innerHTML = `
            <div class="page-header">
                <div><h1>Class Sections (${cache.classes.length} Classes • Max 30 Students/Class)</h1><p style="color:var(--text-muted)">Total enrolled across all classes: ${cache.students.length} students</p></div>
                <button class="btn-action" id="btnOpenAddClass"><i data-lucide="plus" style="width:15px;height:15px;"></i> Create Class</button>
            </div>
            <div class="card-box">
                <table>
                    <thead><tr><th>Class Code</th><th>Class Name</th><th>Major</th><th>Assigned Lecturer (Same Major)</th><th>Class Size</th><th>Status</th><th>Action</th></tr></thead>
                    <tbody>
                        ${cache.classes.map(cl => `
                            <tr>
                                <td><strong>${cl.id}</strong></td>
                                <td>${cl.name}</td>
                                <td>${cl.department}</td>
                                <td>${cl.lecturerName}</td>
                                <td><strong style="color:#38bdf8;">${cl.enrolledCount} / ${cl.maxCapacity}</strong></td>
                                <td><span class="status-pill">${cl.enrolledCount >= cl.maxCapacity ? 'Full' : 'Active'}</span></td>
                                <td><button class="btn-sm btn-edit" data-view-cls="${cl.id}">View Roster</button></td>
                            </tr>`).join('')}
                    </tbody>
                </table>
            </div>`;
        document.getElementById('btnOpenAddClass')?.addEventListener('click', openAddClassModal);
        c.querySelectorAll('[data-view-cls]').forEach(btn => btn.addEventListener('click', () => {
            filterClass = btn.dataset.viewCls;
            filterMajor = 'ALL';
            studentPage = 1;
            switchTab('students');
        }));

    } else if (activeTab === 'courses') {
        c.innerHTML = `
            <div class="page-header"><h1>Course Catalog</h1></div>
            <div class="card-box"><table><thead><tr><th>Course Code</th><th>Subject</th><th>Major</th><th>Credits</th></tr></thead><tbody>${cache.courses.map(cs => `<tr><td><strong>${cs.id}</strong></td><td>${cs.name}</td><td>${cs.department}</td><td>${cs.credits}</td></tr>`).join('')}</tbody></table></div>`;

    } else if (activeTab === 'semesters') {
        c.innerHTML = `<div class="page-header"><h1>Academic Semesters</h1></div><div class="card-box"><table><thead><tr><th>Code</th><th>Semester</th><th>Start</th><th>End</th><th>Status</th></tr></thead><tbody>${cache.semesters.map(s => `<tr><td><strong>${s.id}</strong></td><td>${s.name}</td><td>${s.start}</td><td>${s.end}</td><td><span class="status-pill">${s.status}</span></td></tr>`).join('')}</tbody></table></div>`;

    } else if (activeTab === 'schedules') {
        c.innerHTML = `
            <div class="page-header">
                <h1>Master Timetable</h1>
                <button class="btn-action" id="btnNotifyTimetableChange"><i data-lucide="mail" style="width:15px;height:15px;"></i> Notify Timetable Change via Email</button>
            </div>
            <div class="card-box">
                <table class="timetable-grid">
                    <thead><tr><th>Time</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th></tr></thead>
                    <tbody>
                        <tr><td><strong>08:00 - 10:00</strong></td><td><div class="slot-card slot-blue"><strong>IT-K26A1</strong><br>Web Architecture</div></td><td></td><td></td><td><div class="slot-card slot-amber"><strong>GD-K26A1</strong><br>UI/UX Design</div></td><td></td></tr>
                        <tr><td><strong>10:30 - 12:00</strong></td><td></td><td><div class="slot-card slot-purple"><strong>MKT-K26A1</strong><br>Digital Marketing</div></td><td></td><td></td><td><div class="slot-card slot-emerald"><strong>IT-K26B1</strong><br>PostgreSQL DB</div></td></tr>
                    </tbody>
                </table>
            </div>`;
        document.getElementById('btnNotifyTimetableChange')?.addEventListener('click', () => switchTab('emails'));

    } else if (activeTab === 'grades') {
        c.innerHTML = `<div class="page-header"><h1>Academic Grades</h1></div><div class="card-box"><table><thead><tr><th>Student ID</th><th>Subject</th><th>Midterm</th><th>Final</th><th>GPA</th><th>Result</th></tr></thead><tbody>${cache.grades.map(g => `<tr><td><strong>${g.studentId}</strong></td><td>${g.courseId}</td><td>${g.midtermScore}</td><td>${g.finalScore}</td><td>${g.gpa}</td><td><span class="status-pill">${g.status}</span></td></tr>`).join('')}</tbody></table></div>`;

    } else if (activeTab === 'attendance') {
        const attList = dynamicState.attendanceRecords || [];
        const bannedList = attList.filter(r => r.totalSessions > 0 && (r.attendedSessions / r.totalSessions) < 0.8);
        c.innerHTML = `
            <div class="page-header">
                <div><h1>Attendance &amp; Exam Eligibility Monitor</h1><p style="color:var(--text-muted)">Students below 80% attendance are automatically flagged as Banned from Final Exams</p></div>
            </div>
            <div class="charts-grid">
                <div class="card-box"><h3>Overall Attendance Rate</h3><canvas id="attDoughnut" height="160"></canvas></div>
                <div class="card-box">
                    <h3><i data-lucide="alert-triangle" style="width:17px;height:17px;color:#fb7185;"></i> Exam Ineligibility Watchlist (${bannedList.length} Banned)</h3>
                    ${bannedList.length === 0 ? '<p style="color:var(--text-muted); font-size:13px;">No students currently banned. Lecturers can sync class attendance in Teacher Portal.</p>' : `
                    <table>
                        <thead><tr><th>Student ID</th><th>Name</th><th>Class</th><th>Absent</th><th>Status</th></tr></thead>
                        <tbody>
                            ${bannedList.map(b => `<tr><td><strong>${b.studentId}</strong></td><td>${b.studentName}</td><td>${b.classId}</td><td>${b.absentSessions}/${b.totalSessions}</td><td><span class="status-pill pill-rose">Exam Banned</span></td></tr>`).join('')}
                        </tbody>
                    </table>`}
                </div>
            </div>`;
        if (typeof Chart !== 'undefined') {
            new Chart(document.getElementById('attDoughnut'), { type: 'doughnut', data: { labels: ['Eligible (96%)', 'Exam Banned (4%)'], datasets: [{ data: [96, 4], backgroundColor: ['#38bdf8', '#f43f5e'] }] } });
        }

    } else if (activeTab === 'scholarships') {
        const awards = dynamicState.scholarships || [];
        const totalBudget = awards.reduce((sum, a) => sum + Number(a.waiverAmountVnd || 0), 0);
        c.innerHTML = `
            <div class="page-header">
                <div><h1>Merit Scholarship &amp; Tuition Waiver Engine</h1><p style="color:var(--text-muted)">Automatically evaluate 500 students across IT, Marketing &amp; Graphic Design based on cumulative GPA</p></div>
                <button class="btn-action" id="btnRunScholarshipEval"><i data-lucide="sparkles" style="width:16px;height:16px;"></i> Run Auto-Evaluation (${cache.students.length} Students)</button>
            </div>
            <div class="kpi-grid" style="grid-template-columns: repeat(3, 1fr);">
                <div class="kpi-card kpi-blue"><div class="kpi-top"><div class="kpi-icon"><i data-lucide="award"></i></div><div><div class="kpi-value">${awards.length}</div><div class="kpi-label">Eligible Scholars</div></div></div></div>
                <div class="kpi-card kpi-emerald"><div class="kpi-top"><div class="kpi-icon"><i data-lucide="banknote"></i></div><div><div class="kpi-value">${(totalBudget / 1000000).toFixed(1)}M ₫</div><div class="kpi-label">Total Tuition Waiver</div></div></div></div>
                <div class="kpi-card kpi-purple"><div class="kpi-top"><div class="kpi-icon"><i data-lucide="percent"></i></div><div><div class="kpi-value">3 Tiers</div><div class="kpi-label">100% / 50% / 30%</div></div></div></div>
            </div>
            <div class="card-box">
                <table>
                    <thead><tr><th>Student ID</th><th>Full Name</th><th>Major</th><th>Class</th><th>GPA</th><th>Scholarship Tier</th><th>Tuition Waiver</th></tr></thead>
                    <tbody>
                        ${awards.length === 0 ? '<tr><td colspan="7" style="text-align:center; color:var(--text-muted); padding:24px;">Click "Run Auto-Evaluation" to calculate merit scholarships for all 500 students.</td></tr>' : awards.slice(0, 60).map(a => `
                            <tr>
                                <td><strong>${a.studentId}</strong></td>
                                <td>${a.studentName}</td>
                                <td>${a.major}</td>
                                <td>${a.classId}</td>
                                <td><strong style="color:#38bdf8;">${Number(a.gpa).toFixed(2)}</strong></td>
                                <td><span class="status-pill pill-amber">${a.tier}</span></td>
                                <td><strong style="color:#34d399;">-${Number(a.waiverAmountVnd).toLocaleString('en-US')} ₫</strong></td>
                            </tr>`).join('')}
                    </tbody>
                </table>
            </div>`;

        document.getElementById('btnRunScholarshipEval')?.addEventListener('click', async () => {
            const res = await fetch('/api/portal/admin/evaluate-scholarships', { method: 'POST' });
            if (res.ok) {
                const d = await res.json();
                await syncPortalState();
                alert(`Scholarship evaluation complete! ${d.totalAwarded} students qualified.`);
                renderContent();
            }
        });

    } else if (activeTab === 'events') {
        const events = dynamicState.events || [];
        c.innerHTML = `
            <div class="page-header">
                <div><h1>Campus Events &amp; Conduct Point Management</h1><p style="color:var(--text-muted)">Publish university workshops, hackathons, and club activities with automatic conduct points</p></div>
                <button class="btn-action" id="btnOpenCreateEvent"><i data-lucide="plus" style="width:15px;height:15px;"></i> Create Campus Event</button>
            </div>
            <div class="card-box">
                <table>
                    <thead><tr><th>Event ID</th><th>Title</th><th>Organizer</th><th>Date &amp; Venue</th><th>Conduct Pts</th><th>Checked-in Students</th></tr></thead>
                    <tbody>
                        ${events.map(e => `
                            <tr>
                                <td><strong>${e.id}</strong></td>
                                <td><strong>${e.title}</strong></td>
                                <td>${e.organizer}</td>
                                <td>${e.eventDate}<br><small style="color:var(--text-muted)">${e.venue}</small></td>
                                <td><span class="status-pill pill-amber">+${e.conductPoints} pts</span></td>
                                <td><span class="status-pill pill-blue">${e.attendees?.length || 0} Attendees</span></td>
                            </tr>`).join('')}
                    </tbody>
                </table>
            </div>`;

        document.getElementById('btnOpenCreateEvent')?.addEventListener('click', () => {
            openModal('Create New Campus Event', `
                <div class="form-group"><label>Event Title</label><input id="evtTitle" class="input-control" placeholder="e.g. UI/UX Design Workshop 2026"></div>
                <div class="form-group"><label>Organizer / Club</label><input id="evtOrg" class="input-control" value="Student Affairs & Clubs"></div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                    <div class="form-group"><label>Date &amp; Time</label><input id="evtDate" class="input-control" value="2026-12-18 14:00"></div>
                    <div class="form-group"><label>Conduct Points</label><input id="evtPts" type="number" class="input-control" value="8"></div>
                </div>
                <div class="form-group"><label>Venue</label><input id="evtVenue" class="input-control" value="Main Hall A"></div>
                <button class="btn-primary" id="btnSubmitNewEvt">Publish Event to Student Portal</button>
            `);
            document.getElementById('btnSubmitNewEvt')?.addEventListener('click', async () => {
                const title = document.getElementById('evtTitle').value.trim();
                if (!title) return;
                const res = await fetch('/api/portal/events', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title,
                        organizer: document.getElementById('evtOrg').value.trim(),
                        eventDate: document.getElementById('evtDate').value.trim(),
                        venue: document.getElementById('evtVenue').value.trim(),
                        conductPoints: parseInt(document.getElementById('evtPts').value, 10) || 5,
                        status: 'Upcoming'
                    })
                });
                if (res.ok) {
                    await syncPortalState();
                    closeModal();
                    renderContent();
                }
            });
        });

    } else if (activeTab === 'emails') {
        c.innerHTML = `
            <div class="page-header">
                <div><h1>Academic Email &amp; Class Notification Center</h1><p style="color:var(--text-muted)">Select specific classes to automatically notify all enrolled students &amp; assigned lecturer</p></div>
                <div style="display:flex; gap:10px;">
                    <button class="btn-outline" id="btnForceSqlSync"><i data-lucide="database" style="width:15px;height:15px;"></i> Sync to SQL Server</button>
                    <button class="btn-action" id="btnOpenTuitionQrModal"><i data-lucide="qr-code" style="width:16px;height:16px;"></i> Publish Tuition + QR Email</button>
                </div>
            </div>
            <div class="charts-grid">
                <div class="card-box">
                    <h3><i data-lucide="send" style="width:17px;height:17px;color:#38bdf8;"></i> Compose Class / Academic Email</h3>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                        <div class="form-group">
                            <label>Recipient Target</label>
                            <select id="mailTargetGroup" class="input-control">
                                <option value="Class" selected>Specific Class(es) — Auto-fetch Students</option>
                                <option value="Students">All Students (${cache.students.length})</option>
                                <option value="Lecturers">All Lecturers (${cache.teachers.length})</option>
                                <option value="All">Entire University (Students &amp; Lecturers)</option>
                                <option value="Single">Single Email Address</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Notice Category</label>
                            <select id="mailCategory" class="input-control">
                                <option value="Timetable Change">Timetable / Room Change</option>
                                <option value="Schedule Notice">Class &amp; Exam Schedule</option>
                                <option value="Tuition Reminder">Tuition Payment Reminder</option>
                                <option value="General Notice">General Academic Notice</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-group" id="classPickerWrap">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                            <label style="margin:0;">Select Class Section(s) to Notify</label>
                            <span id="selectedClassCountBadge" class="status-pill pill-blue">0 classes • 0 students selected</span>
                        </div>
                        <div style="max-height:175px; overflow-y:auto; border:1px solid var(--border-glass); border-radius:10px; padding:10px; background:rgba(6,11,25,0.55); display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                            ${cache.classes.map(cl => `
                                <label style="display:flex; align-items:center; gap:8px; font-size:12.5px; color:#f8fafc; cursor:pointer; padding:6px 8px; border-radius:8px; background:rgba(255,255,255,0.03);">
                                    <input type="checkbox" class="chk-mail-class" value="${cl.id}" data-count="${cl.enrolledCount}">
                                    <span><strong>${cl.id}</strong> (${cl.enrolledCount} SV) • <small style="color:var(--text-muted)">${cl.lecturerName}</small></span>
                                </label>`).join('')}
                        </div>
                        <label style="display:flex; align-items:center; gap:8px; margin-top:8px; font-size:12.5px; color:var(--text-muted); cursor:pointer;">
                            <input type="checkbox" id="chkIncludeClassLecturer" checked>
                            <span>Also CC the assigned Lecturer(s) of selected class(es)</span>
                        </label>
                    </div>

                    <div class="form-group" id="singleEmailWrap" style="display:none;">
                        <label>Recipient Email</label>
                        <input id="mailSingleAddress" type="email" class="input-control" placeholder="e.g. an.nv@unit.edu.vn">
                    </div>

                    <div class="form-group">
                        <label>Email Subject</label>
                        <input id="mailSubject" class="input-control" placeholder="e.g. Timetable Update: Room changed to B1.301">
                    </div>
                    <div class="form-group">
                        <label>Message Content</label>
                        <textarea id="mailBody" rows="4" class="input-control" placeholder="Enter detailed schedule update or announcement..."></textarea>
                    </div>
                    <button class="btn-primary" id="btnDispatchAcademicEmail">Send Email &amp; Post to Class Portal</button>
                </div>

                <div class="card-box">
                    <h3><i data-lucide="history" style="width:17px;height:17px;color:#34d399;"></i> Recent Dispatched Notices</h3>
                    <div class="activity-list">
                        ${(dynamicState.announcements || []).map(a => `
                            <div class="activity-item" style="align-items:flex-start;">
                                <div>
                                    <span class="pill-blue status-pill" style="margin-bottom:6px;">${a.category || 'Notice'}</span>
                                    <span class="pill-amber status-pill" style="margin-bottom:6px; margin-left:4px;">${a.targetGroup || 'ALL'}</span><br>
                                    <strong>${a.title}</strong>
                                    <p style="font-size:12px; color:var(--text-muted); margin-top:4px;">${a.message}</p>
                                </div>
                                <small style="color:var(--text-muted); flex-shrink:0;">${a.createdAt}</small>
                            </div>`).join('')}
                    </div>
                </div>
            </div>`;

        const updateSelectedClassBadge = () => {
            const checked = Array.from(c.querySelectorAll('.chk-mail-class:checked'));
            const totalStudents = checked.reduce((sum, el) => sum + (parseInt(el.dataset.count, 10) || 0), 0);
            const badge = document.getElementById('selectedClassCountBadge');
            if (badge) badge.innerText = `${checked.length} class(es) • ${totalStudents} students selected`;
        };

        c.querySelectorAll('.chk-mail-class').forEach(chk => chk.addEventListener('change', updateSelectedClassBadge));

        document.getElementById('mailTargetGroup')?.addEventListener('change', (e) => {
            const val = e.target.value;
            document.getElementById('classPickerWrap').style.display = val === 'Class' ? 'block' : 'none';
            document.getElementById('singleEmailWrap').style.display = val === 'Single' ? 'block' : 'none';
        });

        document.getElementById('btnForceSqlSync')?.addEventListener('click', async () => {
            const res = await fetch('/api/portal/sync-db', { method: 'POST' });
            if (res.ok) {
                const d = await res.json();
                await syncPortalState();
                alert(`${d.message} (${d.students} Students, ${d.teachers} Teachers synced)`);
            }
        });

        document.getElementById('btnOpenTuitionQrModal')?.addEventListener('click', openPublishTuitionModal);

        document.getElementById('btnDispatchAcademicEmail')?.addEventListener('click', async () => {
            const group = document.getElementById('mailTargetGroup').value;
            const category = document.getElementById('mailCategory').value;
            const subject = document.getElementById('mailSubject').value.trim();
            const body = document.getElementById('mailBody').value.trim();

            if (!subject || !body) {
                alert('Please enter both subject and message content.');
                return;
            }

            const selectedClassIds = Array.from(c.querySelectorAll('.chk-mail-class:checked')).map(el => el.value);
            if (group === 'Class' && selectedClassIds.length === 0) {
                alert('Please select at least one class section!');
                return;
            }

            const includeLecturer = document.getElementById('chkIncludeClassLecturer')?.checked ?? true;
            const singleRecipients = group === 'Single' ? [document.getElementById('mailSingleAddress').value.trim()] : [];

            const res = await fetch('/api/portal/admin/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    targetGroup: group,
                    classIds: selectedClassIds,
                    includeLecturer,
                    category,
                    subject,
                    body,
                    recipientEmails: singleRecipients
                })
            });

            if (res.ok) {
                const data = await res.json();
                await syncPortalState();
                alert(`Dispatched to ${data.targetLabel} (${data.emailsSent}/${data.totalTargets} SMTP emails delivered)!`);
                renderContent();
            }
        });

    } else if (activeTab === 'support') {
        const tickets = dynamicState.tickets || [];
        const pendingCount = tickets.filter(t => t.status !== 'Resolved').length;
        c.innerHTML = `
            <div class="page-header">
                <div><h1>Student Support Desk (${pendingCount} Open Requests)</h1><p style="color:var(--text-muted)">View incoming student support requests, contact students directly, and update ticket status</p></div>
                <button class="btn-outline" id="btnAdminSyncTickets"><i data-lucide="refresh-cw" style="width:15px;height:15px;"></i> Refresh Requests</button>
            </div>
            <div class="card-box">
                <table>
                    <thead><tr><th>Ticket ID</th><th>Student</th><th>Category</th><th>Issue Details</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                        ${tickets.length === 0 ? '<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:24px;">No student support tickets received yet.</td></tr>' : tickets.map(t => {
            const pill = t.status === 'Resolved' ? 'status-pill' : (t.status === 'In Progress' ? 'pill-blue status-pill' : 'pill-amber status-pill');
            return `
                            <tr>
                                <td><strong>${t.id}</strong><br><small style="color:var(--text-muted)">${t.createdAt}</small></td>
                                <td><strong>${t.studentName}</strong> (${t.studentId})<br><small style="color:#38bdf8;">${t.studentEmail}</small></td>
                                <td><span class="status-pill pill-blue">${t.category}</span></td>
                                <td style="max-width:300px;">
                                    <strong>${t.subject}</strong>
                                    <p style="font-size:12px; color:var(--text-muted); margin:4px 0;">${t.description}</p>
                                    ${t.adminReply ? `<small style="color:#34d399;">Replied: ${t.adminReply}</small>` : ''}
                                </td>
                                <td><span class="${pill}">${t.status}</span></td>
                                <td>
                                    <button class="btn-sm btn-edit" data-reply-ticket="${t.id}">Reply &amp; Contact</button>
                                    <button class="btn-sm btn-success" data-edit-student="${t.studentId}">Edit Student</button>
                                </td>
                            </tr>`;
        }).join('')}
                    </tbody>
                </table>
            </div>`;

        document.getElementById('btnAdminSyncTickets')?.addEventListener('click', async () => {
            await syncPortalState();
            renderContent();
        });

        c.querySelectorAll('[data-edit-student]').forEach(btn => btn.addEventListener('click', () => openEditStudentModal(btn.dataset.editStudent)));

        c.querySelectorAll('[data-reply-ticket]').forEach(btn => btn.addEventListener('click', () => {
            const t = tickets.find(x => x.id === btn.dataset.replyTicket);
            if (!t) return;
            openModal(`Respond to ${t.studentName} (${t.id})`, `
                <div class="form-group"><label>Student Contact Email</label><input class="input-control" value="${t.studentEmail}" readonly></div>
                <div class="form-group"><label>Student Request</label><input class="input-control" value="${t.subject}" readonly></div>
                <div class="form-group">
                    <label>Ticket Status</label>
                    <select id="repTicketStatus" class="input-control">
                        <option value="In Progress" ${t.status === 'In Progress' ? 'selected' : ''}>In Progress (Contacting Student)</option>
                        <option value="Resolved" selected>Resolved (Completed)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Admin Response (Sent via Email &amp; Student Portal)</label>
                    <textarea id="repTicketBody" rows="4" class="input-control" placeholder="Enter instructions or confirmation for the student...">${t.adminReply || ''}</textarea>
                </div>
                <button class="btn-primary" id="btnSendTicketReply">Send Response &amp; Notify Student</button>
            `);

            document.getElementById('btnSendTicketReply')?.addEventListener('click', async () => {
                const status = document.getElementById('repTicketStatus').value;
                const adminReply = document.getElementById('repTicketBody').value.trim();
                if (!adminReply) return;

                const res = await fetch('/api/portal/admin/reply-ticket', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ticketId: t.id, status, adminReply })
                });
                if (res.ok) {
                    await syncPortalState();
                    closeModal();
                    alert(`Response sent to ${t.studentEmail} and updated on Student Portal!`);
                    renderContent();
                }
            });
        }));

    } else if (activeTab === 'audit') {
        const logs = dynamicState.auditLogs || [];
        c.innerHTML = `
            <div class="page-header">
                <div><h1>Enterprise Security &amp; Audit Trail (${logs.length} Events)</h1><p style="color:var(--text-muted)">Immutable log of grade changes, attendance locks, scholarship runs &amp; record edits</p></div>
                <button class="btn-outline" id="btnRefreshAudit"><i data-lucide="refresh-cw" style="width:15px;height:15px;"></i> Refresh Logs</button>
            </div>
            <div class="card-box">
                <table>
                    <thead><tr><th>Timestamp</th><th>Actor</th><th>Event Type</th><th>Target</th><th>Audit Detail</th></tr></thead>
                    <tbody>
                        ${logs.length === 0 ? '<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:24px;">No audit events recorded yet.</td></tr>' : logs.map(l => `
                            <tr>
                                <td style="font-size:12px; color:var(--text-muted);">${l.timestamp}</td>
                                <td><strong>${l.actor}</strong></td>
                                <td><span class="status-pill pill-blue">${l.action}</span></td>
                                <td><strong>${l.target}</strong></td>
                                <td style="font-size:12.5px;">${l.detail}</td>
                            </tr>`).join('')}
                    </tbody>
                </table>
            </div>`;
        document.getElementById('btnRefreshAudit')?.addEventListener('click', async () => {
            await syncPortalState();
            renderContent();
        });

    } else if (activeTab === 'reports') {
        const majors = ['Information Technology', 'Marketing', 'Graphic Design'];
        const majorStats = majors.map(m => {
            const list = cache.students.filter(s => s.major === m);
            const avgGpa = list.length ? (list.reduce((sum, s) => sum + (Number(s.gpa) || 3.5), 0) / list.length) : 0;
            const honors = list.filter(s => (Number(s.gpa) || 0) >= 3.6).length;
            return { major: m, count: list.length, avgGpa: Number(avgGpa.toFixed(2)), honors };
        });

        const totalAvgGpa = cache.students.length
            ? (cache.students.reduce((sum, s) => sum + (Number(s.gpa) || 3.5), 0) / cache.students.length).toFixed(2)
            : '3.50';
        const excellentCount = cache.students.filter(s => (Number(s.gpa) || 0) >= 3.6).length;
        const goodCount = cache.students.filter(s => (Number(s.gpa) || 0) >= 3.2 && (Number(s.gpa) || 0) < 3.6).length;
        const averageCount = cache.students.filter(s => (Number(s.gpa) || 0) < 3.2).length;

        c.innerHTML = `
            <div class="page-header">
                <div>
                    <h1>Academic Analytics &amp; Performance Reports</h1>
                    <p style="color:var(--text-muted)">Live statistical breakdown computed from ${cache.students.length} enrolled students across 3 faculties</p>
                </div>
                <button class="btn-action" id="btnRepExport"><i data-lucide="download" style="width:15px;height:15px;"></i> Export Full CSV Report</button>
            </div>

            <div class="kpi-grid">
                <div class="kpi-card kpi-blue">
                    <div class="kpi-top"><div class="kpi-icon"><i data-lucide="graduation-cap"></i></div><div><div class="kpi-value">${totalAvgGpa}</div><div class="kpi-label">Institutional Avg GPA</div></div></div>
                    <div class="kpi-footer"><span class="kpi-trend-up">+0.14 vs Spring</span>${sparklineSvg('#38bdf8')}</div>
                </div>
                <div class="kpi-card kpi-emerald">
                    <div class="kpi-top"><div class="kpi-icon"><i data-lucide="award"></i></div><div><div class="kpi-value">${excellentCount}</div><div class="kpi-label">Dean's List (GPA ≥ 3.6)</div></div></div>
                    <div class="kpi-footer"><span class="kpi-trend-up">${((excellentCount / Math.max(1, cache.students.length)) * 100).toFixed(1)}% of Students</span>${sparklineSvg('#34d399')}</div>
                </div>
                <div class="kpi-card kpi-purple">
                    <div class="kpi-top"><div class="kpi-icon"><i data-lucide="layers"></i></div><div><div class="kpi-value">92.6%</div><div class="kpi-label">Class Capacity Utilization</div></div></div>
                    <div class="kpi-footer"><span class="kpi-trend-up">${cache.students.length} / ${cache.classes.length * 30} Seats</span>${sparklineSvg('#c084fc')}</div>
                </div>
                <div class="kpi-card kpi-amber">
                    <div class="kpi-top"><div class="kpi-icon"><i data-lucide="check-circle-2"></i></div><div><div class="kpi-value">98.2%</div><div class="kpi-label">Course Completion Rate</div></div></div>
                    <div class="kpi-footer"><span class="kpi-trend-up">3 Active Faculties</span>${sparklineSvg('#fbbf24')}</div>
                </div>
            </div>

            <div class="charts-grid" style="grid-template-columns: 1.5fr 1fr;">
                <div class="card-box">
                    <h3><i data-lucide="trending-up" style="width:17px;height:17px;color:#38bdf8;"></i> GPA Growth Trajectory by Faculty</h3>
                    <div style="height:260px;"><canvas id="repChart"></canvas></div>
                </div>
                <div class="card-box">
                    <h3><i data-lucide="pie-chart" style="width:17px;height:17px;color:#c084fc;"></i> Academic Classification (${cache.students.length} Students)</h3>
                    <div style="height:260px; display:flex; align-items:center; justify-content:center;"><canvas id="repDoughnutChart"></canvas></div>
                </div>
            </div>

            <div class="charts-grid" style="grid-template-columns: 1fr 1.2fr;">
                <div class="card-box">
                    <h3><i data-lucide="bar-chart-2" style="width:17px;height:17px;color:#34d399;"></i> Average GPA &amp; Honors by Major</h3>
                    <div style="height:230px;"><canvas id="repMajorBarChart"></canvas></div>
                </div>
                <div class="card-box">
                    <h3><i data-lucide="table" style="width:17px;height:17px;color:#fbbf24;"></i> Faculty Executive Summary</h3>
                    <table>
                        <thead><tr><th>Faculty / Major</th><th>Students</th><th>Classes</th><th>Avg GPA</th><th>Honors (≥3.6)</th></tr></thead>
                        <tbody>
                            ${majorStats.map(st => `
                                <tr>
                                    <td><strong>${st.major}</strong></td>
                                    <td>${st.count}</td>
                                    <td>${cache.classes.filter(cl => cl.department === st.major).length}</td>
                                    <td><span class="status-pill pill-blue">${st.avgGpa.toFixed(2)}</span></td>
                                    <td><span class="status-pill">${st.honors} SV</span></td>
                                </tr>`).join('')}
                        </tbody>
                    </table>
                </div>
            </div>`;

        document.getElementById('btnRepExport')?.addEventListener('click', exportCsv);

        if (typeof Chart !== 'undefined') {
            const lineCtx = document.getElementById('repChart').getContext('2d');
            const gradBlue = lineCtx.createLinearGradient(0, 0, 0, 250);
            gradBlue.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
            gradBlue.addColorStop(1, 'rgba(56, 189, 248, 0.0)');

            new Chart(lineCtx, {
                type: 'line',
                data: {
                    labels: ['Spring 2025', 'Summer 2025', 'Fall 2025', 'Spring 2026', 'Fall 2026'],
                    datasets: [
                        { label: 'Information Technology', data: [3.22, 3.29, 3.38, 3.46, majorStats[0]?.avgGpa || 3.52], borderColor: '#38bdf8', backgroundColor: gradBlue, borderWidth: 3, pointRadius: 4, fill: true, tension: 0.42 },
                        { label: 'Marketing', data: [3.18, 3.25, 3.31, 3.40, majorStats[1]?.avgGpa || 3.48], borderColor: '#c084fc', borderWidth: 2.5, pointRadius: 4, tension: 0.42 },
                        { label: 'Graphic Design', data: [3.26, 3.33, 3.41, 3.49, majorStats[2]?.avgGpa || 3.55], borderColor: '#34d399', borderWidth: 2.5, pointRadius: 4, tension: 0.42 }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { labels: { color: '#cbd5e1', usePointStyle: true } } },
                    scales: {
                        x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.04)' } },
                        y: { min: 3.0, max: 3.8, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.06)' } }
                    }
                }
            });

            new Chart(document.getElementById('repDoughnutChart'), {
                type: 'doughnut',
                data: {
                    labels: [`Excellent ≥ 3.6 (${excellentCount})`, `Good 3.2–3.59 (${goodCount})`, `Standard < 3.2 (${averageCount})`],
                    datasets: [{ data: [excellentCount, goodCount, averageCount], backgroundColor: ['#38bdf8', '#c084fc', '#34d399'], borderColor: '#0f172a', borderWidth: 3, hoverOffset: 6 }]
                },
                options: { responsive: true, maintainAspectRatio: false, cutout: '66%', plugins: { legend: { position: 'bottom', labels: { color: '#cbd5e1', padding: 14, usePointStyle: true } } } }
            });

            new Chart(document.getElementById('repMajorBarChart'), {
                type: 'bar',
                data: {
                    labels: ['IT', 'Marketing', 'Graphic Design'],
                    datasets: [{ label: 'Avg GPA (4.0)', data: majorStats.map(s => s.avgGpa), backgroundColor: ['#38bdf8', '#c084fc', '#34d399'], borderRadius: 8, barThickness: 36 }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
                        y: { min: 2.5, max: 4.0, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.06)' } }
                    }
                }
            });
        }

    } else if (activeTab === 'settings') {
        c.innerHTML = `
            <div class="page-header"><h1>System Settings</h1></div>
            <div class="card-box" style="max-width:650px;">
                <h3>Institutional Rules &amp; Preferences</h3>
                <div class="toggle-row"><div><strong>Max Class Capacity Limit (30 Students/Class)</strong><br><small style="color:var(--text-muted)">Enforce maximum 30 students per class section</small></div><label class="switch"><input type="checkbox" checked disabled><span class="slider"></span></label></div>
                <div class="toggle-row"><div><strong>Single-Major Lecturer Constraint</strong><br><small style="color:var(--text-muted)">Each lecturer specializes in 1 major and teaches multiple classes</small></div><label class="switch"><input type="checkbox" checked disabled><span class="slider"></span></label></div>
                <div class="toggle-row"><div><strong>Automatic Exam Eligibility Lock (&lt;80% Attendance)</strong><br><small style="color:var(--text-muted)">Automatically ban students absent &gt; 3/15 sessions from Final Exams</small></div><label class="switch"><input type="checkbox" checked disabled><span class="slider"></span></label></div>
                <div class="toggle-row" style="border:none;"><div><strong>Immutable Security Audit Logging</strong><br><small style="color:var(--text-muted)">Record all grade edits, scholarship runs &amp; record updates</small></div><label class="switch"><input type="checkbox" checked disabled><span class="slider"></span></label></div>
            </div>`;
    }
    refreshIcons();
}

function openAddStudentModal() {
    openModal('Add New Student (Real Persistence)', `
        <div class="form-group"><label>Full Name</label><input id="stName" class="input-control" placeholder="e.g. Le Minh Hoang"></div>
        <div class="form-group"><label>Email</label><input id="stEmail" class="input-control" placeholder="hoang.lm@unit.edu.vn"></div>
        <div class="form-group">
            <label>Major</label>
            <select id="stMajor" class="input-control">
                <option value="Information Technology">Information Technology</option>
                <option value="Marketing">Marketing</option>
                <option value="Graphic Design">Graphic Design</option>
            </select>
        </div>
        <div class="form-group">
            <label>Assign Class (Max 30 Students)</label>
            <select id="stClass" class="input-control">
                ${cache.classes.map(cl => `<option value="${cl.id}">${cl.id} - ${cl.department} (${cl.enrolledCount}/${cl.maxCapacity} SV)</option>`).join('')}
            </select>
        </div>
        <div class="form-group"><label>GPA</label><input id="stGpa" type="number" step="0.01" class="input-control" value="3.50"></div>
        <button class="btn-primary" id="btnSubSt">Save Student to Server</button>
    `);

    document.getElementById('btnSubSt')?.addEventListener('click', async () => {
        const major = document.getElementById('stMajor').value;
        const classId = document.getElementById('stClass').value;
        const payload = {
            fullName: document.getElementById('stName').value.trim(),
            email: document.getElementById('stEmail').value.trim(),
            major,
            classId,
            gpa: parseFloat(document.getElementById('stGpa').value) || 3.5
        };
        if (!payload.fullName || !payload.email) return;

        const res = await fetch('/api/portal/students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            alert(err.message || 'Cannot add student to this class!');
            return;
        }
        await syncPortalState();
        closeModal();
        renderContent();
    });
}

function openEditStudentModal(id) {
    const s = cache.students.find(item => item.id === id);
    if (!s) return;
    openModal(`Edit Student • ${s.id}`, `
        <div class="form-group"><label>Full Name</label><input id="edStName" class="input-control" value="${s.fullName}"></div>
        <div class="form-group"><label>Email</label><input id="edStEmail" class="input-control" value="${s.email}"></div>
        <div class="form-group">
            <label>Major</label>
            <select id="edStMajor" class="input-control">
                ${['Information Technology', 'Marketing', 'Graphic Design'].map(m => `<option value="${m}" ${s.major === m ? 'selected' : ''}>${m}</option>`).join('')}
            </select>
        </div>
        <div class="form-group">
            <label>Class (Max 30 Students)</label>
            <select id="edStClass" class="input-control">
                ${cache.classes.map(cl => `<option value="${cl.id}" ${s.classId === cl.id ? 'selected' : ''}>${cl.id} (${cl.enrolledCount}/${cl.maxCapacity} SV)</option>`).join('')}
            </select>
        </div>
        <div class="form-group"><label>GPA</label><input id="edStGpa" type="number" step="0.01" class="input-control" value="${s.gpa ?? 3.5}"></div>
        <button class="btn-primary" id="btnSaveEditStudent">Save Changes</button>
    `);

    document.getElementById('btnSaveEditStudent')?.addEventListener('click', async () => {
        const payload = {
            id: s.id,
            fullName: document.getElementById('edStName').value.trim(),
            email: document.getElementById('edStEmail').value.trim(),
            major: document.getElementById('edStMajor').value,
            classId: document.getElementById('edStClass').value,
            gpa: parseFloat(document.getElementById('edStGpa').value) || 3.5
        };
        const res = await fetch(`/api/portal/students/${s.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            alert(err.message || 'Update failed!');
            return;
        }
        await syncPortalState();
        closeModal();
        renderContent();
    });
}

async function deleteStudent(id) {
    if (!confirm(`Delete student ${id}?`)) return;
    await fetch(`/api/portal/students/${id}`, { method: 'DELETE' });
    await syncPortalState();
    renderContent();
}

function openAddTeacherModal() {
    openModal('Add Specialized Lecturer (1 Major)', `
        <div class="form-group"><label>Full Name</label><input id="gvName" class="input-control" placeholder="e.g. Dr. Pham Thanh Son"></div>
        <div class="form-group"><label>Email</label><input id="gvEmail" class="input-control" placeholder="son.pt@unit.edu.vn"></div>
        <div class="form-group">
            <label>Single Major / Specialty</label>
            <select id="gvDept" class="input-control">
                <option value="Information Technology">Information Technology</option>
                <option value="Marketing">Marketing</option>
                <option value="Graphic Design">Graphic Design</option>
            </select>
        </div>
        <button class="btn-primary" id="btnSubGv">Save Lecturer</button>
    `);
    document.getElementById('btnSubGv')?.addEventListener('click', async () => {
        const payload = {
            fullName: document.getElementById('gvName').value.trim(),
            email: document.getElementById('gvEmail').value.trim(),
            department: document.getElementById('gvDept').value,
            phone: '0901234567'
        };
        if (!payload.fullName || !payload.email) return;
        await fetch('/api/portal/teachers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        await syncPortalState();
        closeModal();
        renderContent();
    });
}

function openEditTeacherModal(id) {
    const t = cache.teachers.find(item => item.id === id);
    if (!t) return;
    openModal(`Edit Lecturer • ${t.id}`, `
        <div class="form-group"><label>Full Name</label><input id="edGvName" class="input-control" value="${t.fullName}"></div>
        <div class="form-group"><label>Email</label><input id="edGvEmail" class="input-control" value="${t.email}"></div>
        <div class="form-group">
            <label>Single Major / Specialty</label>
            <select id="edGvDept" class="input-control">
                ${['Information Technology', 'Marketing', 'Graphic Design'].map(m => `<option value="${m}" ${t.department === m ? 'selected' : ''}>${m}</option>`).join('')}
            </select>
        </div>
        <button class="btn-primary" id="btnSaveEditTeacher">Save Changes</button>
    `);
    document.getElementById('btnSaveEditTeacher')?.addEventListener('click', async () => {
        await fetch(`/api/portal/teachers/${t.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: t.id,
                fullName: document.getElementById('edGvName').value.trim(),
                email: document.getElementById('edGvEmail').value.trim(),
                department: document.getElementById('edGvDept').value,
                phone: t.phone || '0901234567'
            })
        });
        await syncPortalState();
        closeModal();
        renderContent();
    });
}

async function deleteTeacher(id) {
    if (!confirm(`Delete lecturer ${id}?`)) return;
    await fetch(`/api/portal/teachers/${id}`, { method: 'DELETE' });
    await syncPortalState();
    renderContent();
}

function openAddClassModal() {
    openModal('Create New Class (Max 30 Students)', `
        <div class="form-group"><label>Class Code</label><input id="clId" class="input-control" placeholder="e.g. IT-K26C1"></div>
        <div class="form-group"><label>Class Name</label><input id="clName" class="input-control" placeholder="e.g. Cloud Computing K26 - C1"></div>
        <div class="form-group">
            <label>Major</label>
            <select id="clDept" class="input-control">
                <option value="Information Technology">Information Technology</option>
                <option value="Marketing">Marketing</option>
                <option value="Graphic Design">Graphic Design</option>
            </select>
        </div>
        <div class="form-group">
            <label>Assign Lecturer (Filtered by Same Major)</label>
            <select id="clLecturer" class="input-control">
                ${cache.teachers.filter(t => t.department === 'Information Technology').map(t => `<option value="${t.id}">${t.fullName} (${t.department})</option>`).join('')}
            </select>
        </div>
        <button class="btn-primary" id="btnSubCl">Create Class</button>
    `);

    document.getElementById('clDept')?.addEventListener('change', (e) => {
        const dept = e.target.value;
        const lecSel = document.getElementById('clLecturer');
        lecSel.innerHTML = cache.teachers
            .filter(t => t.department === dept)
            .map(t => `<option value="${t.id}">${t.fullName} (${t.department})</option>`)
            .join('');
    });

    document.getElementById('btnSubCl')?.addEventListener('click', async () => {
        const lecId = document.getElementById('clLecturer').value;
        const lec = cache.teachers.find(t => t.id === lecId);
        const payload = {
            id: document.getElementById('clId').value.trim(),
            name: document.getElementById('clName').value.trim(),
            department: document.getElementById('clDept').value,
            lecturerId: lecId,
            lecturerName: lec ? lec.fullName : 'Assigned Lecturer',
            maxCapacity: 30,
            status: 'Active'
        };
        if (!payload.id || !payload.name) return;
        await fetch('/api/portal/classes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        await syncPortalState();
        closeModal();
        renderContent();
    });
}

function openPublishTuitionModal() {
    openModal('Publish Tuition Notice & Send QR Email', `
        <div class="form-group"><label>Academic Semester</label><input id="pubSem" class="input-control" value="Spring Semester (2026 - 2027)"></div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div class="form-group"><label>Credits</label><input id="pubCredits" type="number" class="input-control" value="16"></div>
            <div class="form-group"><label>Amount (VND)</label><input id="pubAmount" type="number" class="input-control" value="14500000"></div>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div class="form-group"><label>Receiving Bank</label><input class="input-control" value="MB Bank (MB)" readonly></div>
            <div class="form-group"><label>Account No.</label><input id="pubAcc" class="input-control" value="0865156242"></div>
        </div>
        <div class="form-group"><label>Message</label><input id="pubNote" class="input-control" value="Tuition fee invoice for upcoming semester. Scan the VietQR code to pay."></div>
        <button class="btn-primary" id="btnSubmitPublishTuition">Publish QR &amp; Email All Students</button>
    `);

    document.getElementById('btnSubmitPublishTuition')?.addEventListener('click', async () => {
        const res = await fetch('/api/portal/admin/publish-tuition', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                studentEmail: 'ALL',
                semester: document.getElementById('pubSem').value.trim(),
                credits: parseInt(document.getElementById('pubCredits').value, 10) || 15,
                amountVnd: parseFloat(document.getElementById('pubAmount').value) || 0,
                bankCode: 'MB',
                accountNo: document.getElementById('pubAcc').value.trim(),
                accountName: 'DUONG THI KIM YEN',
                note: document.getElementById('pubNote').value.trim(),
                recipientEmails: cache.students.map(s => s.email)
            })
        });
        if (res.ok) {
            const data = await res.json();
            await syncPortalState();
            closeModal();
            alert(`Published tuition VietQR & sent ${data.emailsSent} email(s)!`);
            renderContent();
        }
    });
}

function openQuickPersonEmailModal(email, name) {
    openModal(`Send Email to ${name}`, `
        <div class="form-group"><label>Recipient</label><input class="input-control" value="${email}" readonly></div>
        <div class="form-group"><label>Subject</label><input id="qpSubj" class="input-control" value="Academic Schedule Notice - Unit University"></div>
        <div class="form-group"><label>Message</label><textarea id="qpBody" rows="4" class="input-control" placeholder="Enter message..."></textarea></div>
        <button class="btn-primary" id="btnSendQuickPersonMail">Send Email</button>
    `);
    document.getElementById('btnSendQuickPersonMail')?.addEventListener('click', async () => {
        const subject = document.getElementById('qpSubj').value.trim();
        const body = document.getElementById('qpBody').value.trim();
        if (!subject || !body) return;
        const res = await fetch('/api/portal/admin/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ targetGroup: 'Single', category: 'Direct Notice', subject, body, recipientEmails: [email] })
        });
        if (res.ok) {
            await syncPortalState();
            closeModal();
            alert(`Email sent to ${email}!`);
        }
    });
}

function exportCsv() {
    const csv = 'StudentID,FullName,Major,ClassID,Email,GPA\n' + cache.students.map(s => `${s.id},"${s.fullName}","${s.major}",${s.classId},${s.email},${s.gpa ?? 3.5}`).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })); a.download = 'UnitUniversity_500_Students.csv'; a.click();
}

(async () => {
    await loadAllData();
    renderSidebar();
    renderContent();
})();