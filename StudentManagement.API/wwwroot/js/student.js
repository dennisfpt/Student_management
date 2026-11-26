if (!currentUser || currentUser.role !== 'Student') {
    window.location.href = currentUser?.role === 'Admin' ? 'admin.html' : (currentUser?.role === 'Teacher' ? 'teacher.html' : 'login.html');
}

const STUDENT_MENUS = [
    { id: 'overview', icon: 'layout-dashboard', label: 'Dashboard' },
    { id: 'classes', icon: 'book-open', label: 'My Classes' },
    { id: 'assignments', icon: 'upload-cloud', label: 'Assignments' },
    { id: 'grades', icon: 'file-spreadsheet', label: 'My Grades' },
    { id: 'attendance', icon: 'check-circle-2', label: 'Attendance' },
    { id: 'events', icon: 'calendar-check', label: 'Events & Conduct' },
    { id: 'schedules', icon: 'clock', label: 'Timetable' },
    { id: 'tuition', icon: 'credit-card', label: 'Tuition & Scholarships' },
    { id: 'notifications', icon: 'bell', label: 'Notifications' },
    { id: 'support', icon: 'life-buoy', label: 'Student Support' },
    { id: 'profile', icon: 'user', label: 'Profile' },
    { id: 'settings', icon: 'settings', label: 'Settings' }
];

let activeTab = 'overview';

function getStudentAvatarUrl() {
    const p = dynamicState.profile;
    return p.avatarBase64 || ('https://ui-avatars.com/api/?name=' + encodeURIComponent(p.fullName || currentUser.fullName) + '&background=2563eb&color=fff&size=160');
}

function updateTopbarAvatar() {
    const topbarUser = document.querySelector('.topbar-user');
    if (!topbarUser) return;
    let img = document.getElementById('topbarStudentAvatar');
    if (!img) {
        img = document.createElement('img');
        img.id = 'topbarStudentAvatar';
        img.style.cssText = 'width:34px;height:34px;border-radius:50%;object-fit:cover;border:2px solid #38bdf8;';
        topbarUser.insertBefore(img, topbarUser.firstChild);
    }
    img.src = getStudentAvatarUrl();
}

function getCategoryBadge(cat) {
    if (cat === 'Tuition' || cat === 'Tuition Reminder') return '<span class="status-pill pill-amber">Tuition</span>';
    if (cat === 'Timetable Change' || cat === 'Schedule Notice') return '<span class="status-pill pill-rose">Schedule Update</span>';
    if (cat === 'Assignment' || cat === 'Grade Published') return '<span class="status-pill pill-blue">' + cat + '</span>';
    return '<span class="status-pill pill-blue">' + (cat || 'Academic') + '</span>';
}

function getMyStudentRecord() {
    return cache.students.find(s => s.email.toLowerCase() === dynamicState.profile.email.toLowerCase()) || {
        id: dynamicState.profile.studentId || 'SV26001',
        fullName: dynamicState.profile.fullName || currentUser.fullName,
        email: dynamicState.profile.email || currentUser.email,
        major: currentUser.major || 'Information Technology',
        classId: 'IT-K26A1',
        gpa: 3.60
    };
}

function renderSidebar() {
    const sidebar = document.getElementById('sidebarMenu');
    sidebar.innerHTML = STUDENT_MENUS.map(m =>
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
    const unpaidCount = (dynamicState.invoices || []).filter(i => !i.paid).length;
    const myRec = getMyStudentRecord();
    const myClassInfo = cache.classes.find(cl => cl.id === myRec.classId);
    const pendingAsmCount = (dynamicState.assignments || []).filter(a => a.classId === myRec.classId && !(a.submissions || []).some(s => s.studentId === myRec.id)).length;
    const myScholarship = (dynamicState.scholarships || []).find(s => s.studentId === myRec.id);
    const myAtt = (dynamicState.attendanceRecords || []).find(r => r.studentId === myRec.id);
    const attRate = myAtt ? Math.round((myAtt.attendedSessions / Math.max(1, myAtt.totalSessions)) * 100) : 95;
    const examEligible = attRate >= 80;

    if (activeTab === 'overview') {
        c.innerHTML = `
            <div class="dashboard-hero-banner">
                <div style="display:flex; align-items:center; gap:16px;">
                    <img src="${getStudentAvatarUrl()}" alt="Avatar" style="width:56px; height:56px; border-radius:50%; object-fit:cover; border:2px solid #38bdf8;">
                    <div>
                        <h1>Student Dashboard</h1>
                        <p>${myRec.id} • Class <strong>${myRec.classId}</strong> (${myRec.major})</p>
                    </div>
                </div>
                <div style="display:flex; gap:10px;">
                    <button class="btn-outline" id="btnHeroAsm"><i data-lucide="upload-cloud" style="width:16px;height:16px;"></i> Assignments (${pendingAsmCount})</button>
                    <button class="btn-action" id="btnGoTuition"><i data-lucide="qr-code" style="width:16px;height:16px;"></i> Pay Tuition (${unpaidCount})</button>
                </div>
            </div>

            ${myScholarship ? `
            <div class="card-box" style="margin-bottom:16px; background:linear-gradient(90deg, rgba(245,158,11,0.18), rgba(16,185,129,0.16)); border:1px solid rgba(251,191,36,0.4); display:flex; align-items:center; gap:14px;">
                <i data-lucide="award" style="width:28px;height:28px;color:#fbbf24;"></i>
                <div>
                    <strong style="color:#fbbf24;">Congratulations! You earned the ${myScholarship.tier} Scholarship!</strong><br>
                    <small style="color:#e2e8f0;">GPA ${Number(myScholarship.gpa).toFixed(2)} • Automatic Tuition Waiver: -${Number(myScholarship.waiverAmountVnd).toLocaleString('en-US')} VND</small>
                </div>
            </div>` : ''}

            <div class="kpi-grid">
                <div class="kpi-card kpi-blue">
                    <div class="kpi-top"><div class="kpi-icon"><i data-lucide="school"></i></div><div><div class="kpi-value" style="font-size:20px;">${myRec.classId}</div><div class="kpi-label">My Homeroom Class</div></div></div>
                    <div class="kpi-footer"><span class="kpi-trend-up">${myRec.major}</span>${sparklineSvg('#38bdf8')}</div>
                </div>
                <div class="kpi-card kpi-emerald">
                    <div class="kpi-top"><div class="kpi-icon"><i data-lucide="upload-cloud"></i></div><div><div class="kpi-value">${pendingAsmCount}</div><div class="kpi-label">Pending Assignments</div></div></div>
                    <div class="kpi-footer"><span class="kpi-trend-up">Due Soon</span>${sparklineSvg('#34d399')}</div>
                </div>
                <div class="kpi-card kpi-purple">
                    <div class="kpi-top"><div class="kpi-icon"><i data-lucide="graduation-cap"></i></div><div><div class="kpi-value">${Number(myRec.gpa ?? 3.6).toFixed(2)}</div><div class="kpi-label">Cumulative GPA</div></div></div>
                    <div class="kpi-footer"><span class="kpi-trend-up">4.0 Scale</span>${sparklineSvg('#c084fc')}</div>
                </div>
                <div class="kpi-card kpi-amber">
                    <div class="kpi-top"><div class="kpi-icon"><i data-lucide="check-circle-2"></i></div><div><div class="kpi-value">${attRate}%</div><div class="kpi-label">Attendance (${examEligible ? 'Exam OK' : 'Banned'})</div></div></div>
                    <div class="kpi-footer"><span class="kpi-trend-up">${examEligible ? 'Eligible' : 'Ineligible <80%'}</span>${sparklineSvg('#fbbf24')}</div>
                </div>
            </div>

            <div class="charts-grid">
                <div class="card-box">
                    <h3><i data-lucide="calendar" style="width:17px;height:17px;color:#38bdf8;"></i> My Schedule Today</h3>
                    <div class="activity-list">
                        <div class="activity-item"><span><strong>08:00 - 10:00</strong> &nbsp; Core Major Lecture (${myRec.classId})</span><span class="pill-blue status-pill">Room A1.205</span></div>
                        <div class="activity-item"><span><strong>10:30 - 12:00</strong> &nbsp; Practical Studio Lab</span><span class="pill-blue status-pill">Room B1.301</span></div>
                        <div class="activity-item"><span><strong>14:00 - 16:00</strong> &nbsp; Capstone Workshop</span><span class="pill-blue status-pill">Room C1.102</span></div>
                    </div>
                </div>
                <div class="card-box">
                    <h3><i data-lucide="bell" style="width:17px;height:17px;color:#fbbf24;"></i> Latest Admin &amp; Faculty Notices</h3>
                    <div class="activity-list">
                        ${(dynamicState.announcements || []).slice(0, 3).map(n => `
                            <div class="activity-item">
                                <div>
                                    ${getCategoryBadge(n.category)}
                                    <strong style="margin-left:6px;">${n.title}</strong>
                                </div>
                                ${n.invoiceId ? `<button class="btn-sm btn-edit" data-ov-qr="${n.invoiceId}">Scan QR</button>` : `<small style="color:var(--text-muted)">${n.createdAt}</small>`}
                            </div>`).join('')}
                    </div>
                </div>
            </div>`;

        document.getElementById('btnHeroAsm')?.addEventListener('click', () => switchTab('assignments'));
        document.getElementById('btnGoTuition')?.addEventListener('click', () => switchTab('tuition'));
        c.querySelectorAll('[data-ov-qr]').forEach(btn => btn.addEventListener('click', () => openQrPaymentModal(btn.dataset.ovQr)));

    } else if (activeTab === 'classes') {
        const majorCourses = cache.courses.filter(cs => cs.department === myRec.major);
        c.innerHTML = `
            <div class="page-header"><h1>My Class &amp; Enrolled Courses • ${myRec.classId}</h1></div>
            <div class="card-box" style="margin-bottom:16px;">
                <h3>Homeroom Section Details</h3>
                <p style="color:var(--text-muted); margin-top:6px;">
                    Class: <strong style="color:#fff;">${myClassInfo?.name || myRec.classId}</strong> &nbsp;|&nbsp;
                    Major: <strong style="color:#38bdf8;">${myRec.major}</strong> &nbsp;|&nbsp;
                    Advisor / Lecturer: <strong style="color:#34d399;">${myClassInfo?.lecturerName || 'Assigned Faculty'}</strong>
                </p>
            </div>
            <div class="kpi-grid" style="grid-template-columns: repeat(2, 1fr);">
                ${majorCourses.map(cs => `
                    <div class="kpi-card kpi-blue">
                        <div class="kpi-top"><div class="kpi-icon"><i data-lucide="book-open"></i></div><div><div class="kpi-value" style="font-size:17px;">${cs.id} • ${cs.name}</div><div class="kpi-label">${cs.credits} Credits • ${cs.department}</div></div></div>
                        <button class="btn-action" style="width:100%;justify-content:center;margin-top:8px;" data-go-asm="1">Open Course Assignments</button>
                    </div>`).join('')}
            </div>`;
        c.querySelectorAll('[data-go-asm]').forEach(btn => btn.addEventListener('click', () => switchTab('assignments')));

    } else if (activeTab === 'assignments') {
        const classAssignments = (dynamicState.assignments || []).filter(a => a.classId === myRec.classId);
        c.innerHTML = `
            <div class="page-header">
                <div><h1>Course Assignments &amp; Submissions</h1><p style="color:var(--text-muted)">Class ${myRec.classId} • Submit your project files or repository links before the deadline</p></div>
                <button class="btn-outline" id="btnSyncAsmStu"><i data-lucide="refresh-cw" style="width:15px;height:15px;"></i> Refresh Assignments</button>
            </div>
            <div class="activity-list">
                ${classAssignments.length === 0 ? '<div class="card-box"><p style="color:var(--text-muted)">No assignments posted for your class yet.</p></div>' : classAssignments.map(a => {
            const mySub = (a.submissions || []).find(s => s.studentId === myRec.id || s.studentEmail.toLowerCase() === myRec.email.toLowerCase());
            const isGraded = mySub && mySub.score !== null && mySub.score !== undefined;
            return `
                    <div class="card-box" style="margin-bottom:14px;">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px;">
                            <div>
                                <span class="status-pill pill-blue">${a.classId}</span>
                                <span class="status-pill pill-amber" style="margin-left:6px;">Due: ${a.dueDate}</span>
                                <h3 style="margin-top:10px; margin-bottom:6px; font-size:16px;">${a.title}</h3>
                                <p style="color:var(--text-muted); font-size:13px; line-height:1.5;">${a.description}</p>
                            </div>
                            <div style="text-align:right; flex-shrink:0;">
                                ${isGraded
                    ? `<span class="status-pill" style="font-size:13px;">Graded: ${mySub.score} / 10</span>`
                    : (mySub ? '<span class="status-pill pill-blue">Submitted • Awaiting Grade</span>' : '<span class="status-pill pill-rose">Not Submitted</span>')}
                                <div style="margin-top:10px;">
                                    <button class="btn-action" data-open-submit="${a.id}">${mySub ? 'Resubmit Work' : 'Submit Assignment'}</button>
                                </div>
                            </div>
                        </div>
                        ${mySub ? `
                        <div style="margin-top:12px; padding:10px 12px; border-radius:10px; background:rgba(56,189,248,0.08); border:1px solid rgba(56,189,248,0.25); font-size:12.5px;">
                            <strong>Your Submission (${mySub.submittedAt}):</strong> ${mySub.fileName}
                            ${mySub.note ? `<br><span style="color:var(--text-muted)">Note: ${mySub.note}</span>` : ''}
                            ${isGraded ? `<br><strong style="color:#34d399;">Lecturer Feedback:</strong> ${mySub.feedback || 'Well done!'}` : ''}
                        </div>` : ''}
                    </div>`;
        }).join('')}
            </div>`;

        document.getElementById('btnSyncAsmStu')?.addEventListener('click', async () => {
            await syncPortalState();
            renderContent();
        });

        c.querySelectorAll('[data-open-submit]').forEach(btn => btn.addEventListener('click', () => {
            const asm = (dynamicState.assignments || []).find(x => x.id === btn.dataset.openSubmit);
            if (!asm) return;
            openModal(`Submit Work • ${asm.title}`, `
                <div class="form-group">
                    <label>Submission Link (GitHub / Google Drive / Figma URL)</label>
                    <input id="subLinkInput" class="input-control" placeholder="https://github.com/username/project...">
                </div>
                <div class="form-group">
                    <label>Or Attach File (PDF, ZIP, DOCX, PNG — Max 5MB)</label>
                    <input type="file" id="subFileInput" class="input-control">
                </div>
                <div class="form-group">
                    <label>Submission Note for Lecturer</label>
                    <textarea id="subNoteInput" rows="3" class="input-control" placeholder="Optional notes about your implementation..."></textarea>
                </div>
                <button class="btn-primary" id="btnConfirmSubmitAsm">Confirm &amp; Upload Submission</button>
            `);

            let attachedFileName = '';
            let attachedFileData = '';
            document.getElementById('subFileInput')?.addEventListener('change', (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                attachedFileName = file.name;
                const reader = new FileReader();
                reader.onload = () => { attachedFileData = reader.result; };
                reader.readAsDataURL(file);
            });

            document.getElementById('btnConfirmSubmitAsm')?.addEventListener('click', async () => {
                const link = document.getElementById('subLinkInput').value.trim();
                const note = document.getElementById('subNoteInput').value.trim();
                if (!link && !attachedFileData) {
                    alert('Please enter a repository/drive link or attach a file!');
                    return;
                }
                const res = await fetch(`/api/grade/assignments/${asm.id}/submit`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        studentId: myRec.id,
                        studentName: myRec.fullName,
                        studentEmail: myRec.email,
                        fileName: attachedFileName || link,
                        fileDataOrLink: attachedFileData || link,
                        note
                    })
                });
                if (res.ok) {
                    await syncPortalState();
                    closeModal();
                    alert('Assignment submitted successfully!');
                    renderContent();
                }
            });
        }));

    } else if (activeTab === 'grades') {
        const gradedAsms = [];
        (dynamicState.assignments || []).forEach(a => {
            const sub = (a.submissions || []).find(s => s.studentId === myRec.id && s.score !== null && s.score !== undefined);
            if (sub) gradedAsms.push({ title: a.title, score: sub.score, feedback: sub.feedback });
        });

        c.innerHTML = `
            <div class="page-header"><h1>My Grades &amp; Assignment Scores</h1></div>
            <div class="card-box" style="margin-bottom:16px;">
                <h3>Semester Course Transcript</h3>
                <table>
                    <thead><tr><th>Subject</th><th>Credits</th><th>Midterm</th><th>Final</th><th>Total</th><th>Result</th></tr></thead>
                    <tbody>
                        ${cache.grades.map(g => {
            const total = ((g.midtermScore + g.finalScore) / 2).toFixed(1);
            const pillClass = g.status === 'Excellent' ? 'pill-amber' : 'status-pill';
            return `<tr><td><strong>${g.courseId}</strong></td><td>${g.credits || 3}</td><td>${g.midtermScore}</td><td>${g.finalScore}</td><td><strong>${total}</strong></td><td><span class="status-pill ${pillClass}">${g.status}</span></td></tr>`;
        }).join('')}
                    </tbody>
                </table>
            </div>
            <div class="card-box">
                <h3>Graded Coursework &amp; Labs (${gradedAsms.length})</h3>
                ${gradedAsms.length === 0 ? '<p style="color:var(--text-muted); font-size:13px;">No graded assignment submissions yet.</p>' : `
                <table>
                    <thead><tr><th>Assignment</th><th>Score (10-pt)</th><th>Lecturer Feedback</th></tr></thead>
                    <tbody>
                        ${gradedAsms.map(g => `<tr><td><strong>${g.title}</strong></td><td><span class="status-pill">${g.score} / 10</span></td><td>${g.feedback || '—'}</td></tr>`).join('')}
                    </tbody>
                </table>`}
            </div>`;

    } else if (activeTab === 'attendance') {
        const majorCourses = cache.courses.filter(cs => cs.department === myRec.major);
        const defaultModules = majorCourses.length >= 4
            ? majorCourses.slice(0, 4).map((cs, i) => {
                const total = 15;
                const absent = myAtt ? (i === 0 ? Math.min(total, myAtt.absentSessions || 0) : 0) : (i === 3 ? 2 : (i === 1 ? 1 : 0));
                const attended = total - absent;
                const rateMod = (attended / total) * 100;
                const status = rateMod < 80 ? 'Banned' : (absent >= 2 ? 'Pending' : 'Eligible');
                return { name: cs.name, attended, total, absent, status };
            })
            : [
                { name: 'Computer Networks', attended: 15, total: 15, absent: 0, status: 'Eligible' },
                { name: 'Database Systems', attended: 14, total: 15, absent: 1, status: 'Eligible' },
                { name: 'Cybersecurity', attended: 15, total: 15, absent: 0, status: 'Eligible' },
                { name: 'Web Development', attended: 13, total: 15, absent: 2, status: 'Pending' }
            ];

        const sumAttended = defaultModules.reduce((s, m) => s + m.attended, 0);
        const sumTotal = defaultModules.reduce((s, m) => s + m.total, 0);
        const sumAbsent = defaultModules.reduce((s, m) => s + m.absent, 0);
        const displayRate = myAtt && myAtt.totalSessions > 0 ? attRate : Math.round((sumAttended / Math.max(1, sumTotal)) * 100);
        const displayAbsentRate = Math.max(0, 100 - displayRate);
        const displayPresentCount = myAtt ? myAtt.attendedSessions : sumAttended;
        const displayAbsentCount = myAtt ? myAtt.absentSessions : sumAbsent;
        const displayTotalCount = myAtt ? myAtt.totalSessions : sumTotal;
        const isAllEligible = displayRate >= 80 && defaultModules.every(m => m.status !== 'Banned');

        c.innerHTML = `
            <div class="att-header-bar">
                <div class="att-title-group">
                    <h1>My Attendance &amp; Final Exam Eligibility</h1>
                    <p>Track your attendance and check your exam eligibility status</p>
                </div>
                <div class="att-meta-pills">
                    <div class="att-pill-box"><span>Academic Year</span><strong>2025 - 2026</strong></div>
                    <div class="att-pill-box"><span>Semester</span><strong>Fall Semester</strong></div>
                </div>
            </div>

            <div class="att-top-grid">
                <div class="card-box" style="margin-bottom:0;">
                    <h3><i data-lucide="activity" style="width:16px;height:16px;color:#38bdf8;"></i> Overall Attendance Rate (${displayRate}%)</h3>
                    <div class="att-donut-layout">
                        <div class="att-donut-wrap">
                            <canvas id="stuAttDoughnut"></canvas>
                            <div class="att-donut-center">
                                <div class="att-donut-percent">${displayRate}%</div>
                                <div class="att-donut-sub">Attendance Rate</div>
                            </div>
                        </div>
                        <div class="att-legend-list">
                            <div class="att-legend-item">
                                <div style="display:flex;align-items:flex-start;gap:8px;">
                                    <span class="att-legend-dot" style="background:#38bdf8;"></span>
                                    <div>
                                        <div style="font-size:13px;font-weight:700;">Present</div>
                                        <div style="font-size:12px;color:#94a3b8;">(${displayPresentCount}/${displayTotalCount})</div>
                                    </div>
                                </div>
                                <strong style="font-size:18px;color:#38bdf8;">${displayRate}%</strong>
                            </div>
                            <div class="att-legend-item">
                                <div style="display:flex;align-items:flex-start;gap:8px;">
                                    <span class="att-legend-dot" style="background:#a855f7;"></span>
                                    <div>
                                        <div style="font-size:13px;font-weight:700;">Absent</div>
                                        <div style="font-size:12px;color:#94a3b8;">(${displayAbsentCount}/${displayTotalCount})</div>
                                    </div>
                                </div>
                                <strong style="font-size:18px;color:#c084fc;">${displayAbsentRate}%</strong>
                            </div>
                        </div>
                    </div>
                    <div class="att-note-banner ${isAllEligible ? '' : 'warning'}">
                        <div>
                            <strong>${isAllEligible ? 'You are meeting the attendance requirement!' : 'WARNING: Your attendance is below the required threshold!'}</strong>
                            <div style="font-size:12px;opacity:0.9;">${isAllEligible ? 'Keep it up!' : 'Please contact Student Support if you have valid absence proofs.'}</div>
                        </div>
                        <i data-lucide="${isAllEligible ? 'check-circle-2' : 'alert-circle'}" style="width:18px;height:18px;flex-shrink:0;"></i>
                    </div>
                </div>

                <div class="card-box" style="margin-bottom:0;">
                    <h3><i data-lucide="calendar-check" style="width:16px;height:16px;color:#38bdf8;"></i> Session Breakdown</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Module</th>
                                <th>Attended</th>
                                <th>Absent</th>
                                <th>Exam Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${defaultModules.map(m => {
            const pillClass =
                m.status === 'Eligible' ? 'status-pill' :
                    m.status === 'Pending' ? 'status-pill pill-amber' :
                        'status-pill pill-rose';
            return `
                                    <tr>
                                        <td><strong>${m.name}</strong></td>
                                        <td>${m.attended} / ${m.total}</td>
                                        <td>${m.absent}</td>
                                        <td><span class="${pillClass}">${m.status}</span></td>
                                    </tr>`;
        }).join('')}
                        </tbody>
                    </table>
                    <div style="display:flex;justify-content:flex-end;margin-top:12px;">
                        <button type="button" id="btnViewAllSessions" style="background:none;border:none;color:#38bdf8;font-size:12.5px;font-weight:600;cursor:pointer;">
                            View All Sessions →
                        </button>
                    </div>
                </div>
            </div>

            <div class="att-bottom-grid">
                <div class="card-box" style="margin-bottom:0;">
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
                        <h3 style="margin-bottom:0;"><i data-lucide="trending-up" style="width:16px;height:16px;color:#38bdf8;"></i> Attendance Trend</h3>
                        <div style="text-align:right;">
                            <strong style="font-size:15px;color:#38bdf8;">${displayRate}%</strong>
                            <div style="font-size:11.5px;color:#94a3b8;">Dec 2025</div>
                        </div>
                    </div>
                    <div style="height:175px;"><canvas id="stuAttTrendCanvas"></canvas></div>
                </div>

                <div class="card-box" style="margin-bottom:0;">
                    <h3><i data-lucide="award" style="width:16px;height:16px;color:#38bdf8;"></i> Exam Eligibility</h3>
                    <div class="att-eligibility-card">
                        <div class="att-eligibility-badge" ${isAllEligible ? '' : 'style="background:rgba(244,63,94,0.16);border-color:rgba(244,63,94,0.4);color:#fb7185;"'}>
                            <i data-lucide="${isAllEligible ? 'check' : 'x'}" style="width:24px;height:24px;"></i>
                        </div>
                        <div>
                            <div style="font-size:16px;font-weight:800;color:${isAllEligible ? '#34d399' : '#fb7185'};margin-bottom:6px;">
                                ${isAllEligible ? 'Eligible for Final Exam' : 'Final Exam Eligibility Restricted'}
                            </div>
                            <p style="font-size:13px;color:#cbd5e1;line-height:1.5;">
                                ${isAllEligible
                ? 'You have met the attendance requirement for all registered modules.'
                : 'One or more modules have absences below the 80% attendance requirement. Submit an appeal in Student Support.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>`;

        document.getElementById('btnViewAllSessions')?.addEventListener('click', () => switchTab('schedules'));

        if (typeof Chart !== 'undefined') {
            new Chart(document.getElementById('stuAttDoughnut'), {
                type: 'doughnut',
                data: {
                    labels: ['Present', 'Absent'],
                    datasets: [{
                        data: [displayRate, displayAbsentRate],
                        backgroundColor: ['#38bdf8', '#a855f7'],
                        borderWidth: 0,
                        cutout: '76%'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } }
                }
            });

            new Chart(document.getElementById('stuAttTrendCanvas'), {
                type: 'line',
                data: {
                    labels: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    datasets: [{
                        data: [88, 91, 93, 94, displayRate],
                        borderColor: '#38bdf8',
                        backgroundColor: 'rgba(56, 189, 248, 0.14)',
                        fill: true,
                        tension: 0.35,
                        pointRadius: 4,
                        pointBackgroundColor: '#38bdf8'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { min: 25, max: 100, ticks: { callback: v => v + '%', color: '#94a3b8', stepSize: 25 }, grid: { color: 'rgba(148, 163, 184, 0.12)' } },
                        x: { ticks: { color: '#94a3b8' }, grid: { display: false } }
                    }
                }
            });
        }

    } else if (activeTab === 'events') {
        const allEvents = dynamicState.events || [];
        const isAttendedByMe = (e) => {
            if (e.checkedIn) return true;
            return (e.attendees || []).some(a =>
                (typeof a === 'string' && (a === myRec.id || a.toLowerCase() === myRec.email.toLowerCase())) ||
                (a?.studentId === myRec.id) ||
                ((a?.studentEmail || '').toLowerCase() === myRec.email.toLowerCase())
            );
        };
        const attendedEvents = allEvents.filter(isAttendedByMe);
        const upcomingEvents = allEvents.filter(e => !isAttendedByMe(e));
        const bonusPoints = attendedEvents.reduce((sum, e) => sum + (Number(e.conductPoints) || 0), 0);
        const totalConductScore = Math.min(100, 75 + bonusPoints);

        c.innerHTML = `
            <div class="page-header">
                <div><h1>Campus Events &amp; Conduct Points</h1><p style="color:var(--text-muted)">Track events you attended, check in to upcoming workshops, and accumulate conduct points</p></div>
                <button class="btn-outline" id="btnRefreshEvents"><i data-lucide="refresh-cw" style="width:15px;height:15px;"></i> Refresh</button>
            </div>
            <div class="kpi-grid" style="grid-template-columns: repeat(3, 1fr);">
                <div class="kpi-card kpi-blue"><div class="kpi-top"><div class="kpi-icon"><i data-lucide="award"></i></div><div><div class="kpi-value">${totalConductScore} / 100</div><div class="kpi-label">Conduct Score</div></div></div></div>
                <div class="kpi-card kpi-emerald"><div class="kpi-top"><div class="kpi-icon"><i data-lucide="calendar-check"></i></div><div><div class="kpi-value">${attendedEvents.length}</div><div class="kpi-label">Events Attended</div></div></div></div>
                <div class="kpi-card kpi-purple"><div class="kpi-top"><div class="kpi-icon"><i data-lucide="sparkles"></i></div><div><div class="kpi-value">+${bonusPoints} pts</div><div class="kpi-label">Bonus Event Points</div></div></div></div>
            </div>

            <div class="card-box" style="margin-bottom:16px;">
                <h3><i data-lucide="check-circle-2" style="width:17px;height:17px;color:#34d399;"></i> Events I Have Attended (${attendedEvents.length})</h3>
                ${attendedEvents.length === 0 ? '<p style="color:var(--text-muted); font-size:13px;">You have not attended any campus events yet.</p>' : `
                <table>
                    <thead><tr><th>Event ID</th><th>Event Title</th><th>Organizer</th><th>Venue</th><th>Check-in Time</th><th>Points Earned</th></tr></thead>
                    <tbody>
                        ${attendedEvents.map(e => {
            const myEvtAtt = (e.attendees || []).find(a =>
                (typeof a === 'object') && (a?.studentId === myRec.id || (a?.studentEmail || '').toLowerCase() === myRec.email.toLowerCase())
            );
            return `
                            <tr>
                                <td><strong>${e.id}</strong></td>
                                <td><strong>${e.title}</strong></td>
                                <td>${e.organizer}</td>
                                <td>${e.venue}</td>
                                <td>${myEvtAtt?.checkedInAt || new Date().toISOString().slice(0, 16).replace('T', ' ')}</td>
                                <td><span class="status-pill">+${e.conductPoints} pts</span></td>
                            </tr>`;
        }).join('')}
                    </tbody>
                </table>`}
            </div>

            <div class="card-box">
                <h3><i data-lucide="calendar" style="width:17px;height:17px;color:#38bdf8;"></i> Upcoming Campus Events &amp; Workshops (${upcomingEvents.length})</h3>
                <div class="activity-list">
                    ${upcomingEvents.length === 0 ? '<p style="color:var(--text-muted); font-size:13px;">No new events available for check-in.</p>' : upcomingEvents.map(e => `
                        <div class="activity-item">
                            <div>
                                <span class="status-pill pill-blue">+${e.conductPoints} Conduct Pts</span>
                                <strong style="margin-left:8px;">${e.title}</strong><br>
                                <small style="color:var(--text-muted)">${e.eventDate} • ${e.venue} (${e.organizer})</small>
                            </div>
                            <button type="button" class="btn-action" data-evt-checkin="${e.id}">Check-in / Register</button>
                        </div>`).join('')}
                </div>
            </div>`;

        document.getElementById('btnRefreshEvents')?.addEventListener('click', async () => { await syncPortalState(); renderContent(); });
        c.querySelectorAll('[data-evt-checkin]').forEach(btn => btn.addEventListener('click', async (ev) => {
            ev.preventDefault();
            const evtId = btn.dataset.evtCheckin;
            const targetEvt = allEvents.find(x => String(x.id) === String(evtId));
            if (!targetEvt) return;

            btn.disabled = true;
            btn.innerText = 'Checking in...';

            try {
                const res = await fetch(`/api/academic/events/${evtId}/checkin`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        eventId: evtId,
                        studentId: myRec.id,
                        studentName: myRec.fullName,
                        studentEmail: myRec.email,
                        classId: myRec.classId
                    })
                });
                if (res.ok) {
                    await syncPortalState();
                }
            } catch (_) { }

            targetEvt.checkedIn = true;
            targetEvt.attendees = Array.isArray(targetEvt.attendees) ? targetEvt.attendees : [];
            if (!isAttendedByMe(targetEvt)) {
                targetEvt.attendees.push({
                    studentId: myRec.id,
                    studentName: myRec.fullName,
                    studentEmail: myRec.email,
                    checkedInAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
                });
            }

            renderContent();
            alert(`Event check-in confirmed: ${targetEvt.title} (+${targetEvt.conductPoints} pts)!`);
        }));

    } else if (activeTab === 'schedules') {
        c.innerHTML = `
            <div class="page-header"><h1>Weekly Timetable • ${myRec.classId}</h1></div>
            <div class="card-box">
                <table class="timetable-grid">
                    <thead><tr><th>Time</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th></tr></thead>
                    <tbody>
                        <tr><td><strong>08:00 - 10:00</strong></td><td><div class="slot-card slot-blue"><strong>${myRec.classId} Lecture</strong><br>Room A1.205</div></td><td></td><td></td><td><div class="slot-card slot-purple"><strong>Major Seminar</strong><br>Room C1.102</div></td><td></td></tr>
                        <tr><td><strong>10:30 - 12:00</strong></td><td></td><td><div class="slot-card slot-emerald"><strong>Practical Lab</strong><br>Room B1.301</div></td><td></td><td></td><td><div class="slot-card slot-amber"><strong>Studio Project</strong><br>Room A1.203</div></td></tr>
                    </tbody>
                </table>
            </div>`;

    } else if (activeTab === 'tuition') {
        c.innerHTML = `
            <div class="page-header">
                <div><h1>Tuition, Scholarships &amp; VietQR Payments</h1><p style="color:var(--text-muted)">Scan dynamic MB Bank QR code (0865156242 • DUONG THI KIM YEN) issued by Admin</p></div>
                <button class="btn-outline" id="btnRefreshInvoices"><i data-lucide="refresh-cw" style="width:15px;height:15px;"></i> Sync Latest Invoices</button>
            </div>
            ${myScholarship ? `
            <div class="card-box" style="margin-bottom:16px; border:1px solid rgba(52,211,153,0.4); background:rgba(16,185,129,0.1);">
                <strong style="color:#34d399;">Active Merit Scholarship: ${myScholarship.tier}</strong> — Tuition Waiver Applied: <strong>-${Number(myScholarship.waiverAmountVnd).toLocaleString('en-US')} VND</strong>
            </div>` : ''}
            <div class="card-box">
                <table>
                    <thead><tr><th>Invoice</th><th>Semester</th><th>Credits</th><th>Amount (VND)</th><th>Issued Date</th><th>Status</th><th>Action</th></tr></thead>
                    <tbody>
                        ${(dynamicState.invoices || []).map(inv => `
                            <tr>
                                <td><strong>${inv.id}</strong></td>
                                <td>${inv.semester}</td>
                                <td>${inv.credits}</td>
                                <td><strong style="color:#38bdf8;">${Number(inv.amountVnd).toLocaleString('en-US')} ₫</strong></td>
                                <td>${inv.createdAt}</td>
                                <td>${inv.paid ? '<span class="status-pill">Paid</span>' : '<span class="status-pill pill-amber">Unpaid</span>'}</td>
                                <td>${inv.paid ? '—' : `<button class="btn-sm btn-edit" data-qr-inv="${inv.id}">Scan QR Code</button>`}</td>
                            </tr>`).join('')}
                    </tbody>
                </table>
            </div>`;
        document.getElementById('btnRefreshInvoices')?.addEventListener('click', async () => {
            await syncPortalState();
            renderContent();
        });
        c.querySelectorAll('[data-qr-inv]').forEach(btn => btn.addEventListener('click', () => openQrPaymentModal(btn.dataset.qrInv)));

    } else if (activeTab === 'notifications') {
        c.innerHTML = `
            <div class="page-header">
                <div><h1>University Notifications</h1><p style="color:var(--text-muted)">Live schedule updates, assignments, support replies, and tuition QR notices</p></div>
                <button class="btn-outline" id="btnSyncNotifs"><i data-lucide="refresh-cw" style="width:15px;height:15px;"></i> Refresh</button>
            </div>
            <div class="card-box">
                <div class="activity-list">
                    ${(dynamicState.announcements || []).map(n => {
            const linkedInv = n.invoiceId ? (dynamicState.invoices || []).find(i => i.id === n.invoiceId) : null;
            const isPaid = linkedInv?.paid;
            return `
                        <div class="activity-item" style="align-items:flex-start; gap:14px;">
                            <div>
                                <div style="margin-bottom:6px;">${getCategoryBadge(n.category)} <strong style="font-size:14.5px; color:#38bdf8; margin-left:6px;">${n.title}</strong></div>
                                <p style="margin:6px 0; color:var(--text-white); line-height:1.5; white-space:pre-line;">${n.message}</p>
                                <small style="color:var(--text-muted)">Issued: ${n.createdAt}</small>
                            </div>
                            ${n.invoiceId ? (isPaid
                    ? '<span class="status-pill" style="flex-shrink:0;">Paid</span>'
                    : `<button class="btn-action" style="flex-shrink:0;" data-notif-qr="${n.invoiceId}">Scan QR (${Number(n.amountVnd || n.AmountVnd || 0).toLocaleString('en-US')} ₫)</button>`) : ''}
                        </div>`;
        }).join('')}
                </div>
            </div>`;
        document.getElementById('btnSyncNotifs')?.addEventListener('click', async () => {
            await syncPortalState();
            renderContent();
        });
        c.querySelectorAll('[data-notif-qr]').forEach(btn => btn.addEventListener('click', () => openQrPaymentModal(btn.dataset.notifQr)));

    } else if (activeTab === 'support') {
        const myTickets = (dynamicState.tickets || []).filter(t => t.studentEmail.toLowerCase() === myRec.email.toLowerCase());
        c.innerHTML = `
            <div class="page-header">
                <div><h1>Student Support &amp; Helpdesk</h1><p style="color:var(--text-muted)">Submit requests for profile updates, tuition queries, exam appeals, or certificates</p></div>
                <button class="btn-outline" id="btnRefreshTickets"><i data-lucide="refresh-cw" style="width:15px;height:15px;"></i> Refresh Status</button>
            </div>
            <div class="charts-grid">
                <div class="card-box">
                    <h3><i data-lucide="send" style="width:17px;height:17px;color:#38bdf8;"></i> Submit New Support Request</h3>
                    <div class="form-group">
                        <label>Support Category</label>
                        <select id="supCategory" class="input-control">
                            <option value="Profile Record Update">Profile Record Update (Name / Phone / Major)</option>
                            <option value="Tuition & QR Payment">Tuition Fee &amp; VietQR Verification</option>
                            <option value="Exam Eligibility Appeal">Attendance / Final Exam Eligibility Appeal</option>
                            <option value="Enrollment Certificate">Enrollment / Transcript Certificate</option>
                            <option value="Other Academic Support">Other Academic Support</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Request Subject</label>
                        <input id="supSubject" class="input-control" placeholder="e.g. Request to update phone number or class section">
                    </div>
                    <div class="form-group">
                        <label>Detailed Description</label>
                        <textarea id="supDescription" rows="4" class="input-control" placeholder="Describe what you need assistance with so Admin can contact you..."></textarea>
                    </div>
                    <button class="btn-primary" id="btnSubmitStudentTicket">Send Support Request to Admin</button>
                </div>

                <div class="card-box">
                    <h3><i data-lucide="inbox" style="width:17px;height:17px;color:#34d399;"></i> My Support History (${myTickets.length})</h3>
                    <div class="activity-list">
                        ${myTickets.length === 0 ? '<p style="color:var(--text-muted); font-size:13px;">You have not submitted any support requests yet.</p>' : myTickets.map(t => {
            const pill = t.status === 'Resolved' ? 'status-pill' : (t.status === 'In Progress' ? 'pill-blue status-pill' : 'pill-amber status-pill');
            return `
                            <div class="activity-item" style="flex-direction:column; align-items:flex-start; gap:6px;">
                                <div style="display:flex; justify-content:space-between; width:100%;">
                                    <strong>${t.id} • ${t.subject}</strong>
                                    <span class="${pill}">${t.status}</span>
                                </div>
                                <small style="color:#38bdf8;">Category: ${t.category} • ${t.createdAt}</small>
                                <p style="font-size:12.5px; color:var(--text-white); margin:2px 0;">${t.description}</p>
                                ${t.adminReply ? `<div style="width:100%; margin-top:4px; padding:8px 10px; border-radius:8px; background:rgba(16,185,129,0.12); border:1px solid rgba(16,185,129,0.3); font-size:12.5px;"><strong style="color:#34d399;">Admin Response:</strong> ${t.adminReply}</div>` : ''}
                            </div>`;
        }).join('')}
                    </div>
                </div>
            </div>`;

        document.getElementById('btnRefreshTickets')?.addEventListener('click', async () => {
            await syncPortalState();
            renderContent();
        });

        document.getElementById('btnSubmitStudentTicket')?.addEventListener('click', async () => {
            const category = document.getElementById('supCategory').value;
            const subject = document.getElementById('supSubject').value.trim();
            const description = document.getElementById('supDescription').value.trim();
            if (!subject || !description) {
                alert('Please enter both subject and detailed description.');
                return;
            }
            const res = await fetch('/api/academic/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId: myRec.id,
                    studentName: myRec.fullName,
                    studentEmail: myRec.email,
                    category,
                    subject,
                    description
                })
            });
            if (res.ok) {
                await syncPortalState();
                alert('Your support request has been sent to Administration!');
                renderContent();
            }
        });

    } else if (activeTab === 'profile') {
        c.innerHTML = `
            <div class="page-header">
                <div>
                    <h1>Student Profile</h1>
                    <p style="color:var(--text-muted)">You can update your profile photo. Academic &amp; personal records are managed by Administration.</p>
                </div>
            </div>
            <div class="charts-grid" style="grid-template-columns: 300px 1fr;">
                <div class="card-box" style="text-align:center;">
                    <img id="profileAvatarPreview" src="${getStudentAvatarUrl()}" alt="Student Avatar" style="width:140px; height:140px; border-radius:50%; object-fit:cover; border:3px solid #38bdf8; margin-bottom:14px;">
                    <h3 style="justify-content:center; margin-bottom:4px;">${myRec.fullName}</h3>
                    <p style="color:var(--text-muted); font-size:13px; margin-bottom:16px;">${myRec.id} • Class ${myRec.classId}</p>
                    <label class="btn-outline" style="cursor:pointer; justify-content:center; width:100%; margin-bottom:10px;">
                        <i data-lucide="camera" style="width:16px;height:16px;"></i> Choose New Photo
                        <input type="file" id="avatarFileInput" accept="image/*" style="display:none;">
                    </label>
                    <button class="btn-primary" id="btnSaveStudentAvatar">Save Profile Photo</button>
                </div>
                <div class="card-box">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                        <h3 style="margin:0;">Official Student Record</h3>
                        <span class="status-pill pill-blue"><i data-lucide="lock" style="width:12px;height:12px;"></i> Admin Managed (Read-Only)</span>
                    </div>
                    <div class="form-group"><label>Student ID</label><input class="input-control" value="${myRec.id}" readonly style="opacity:0.75; cursor:not-allowed;"></div>
                    <div class="form-group"><label>Full Name</label><input class="input-control" value="${myRec.fullName}" readonly style="opacity:0.75; cursor:not-allowed;"></div>
                    <div class="form-group"><label>University Email</label><input class="input-control" value="${myRec.email}" readonly style="opacity:0.75; cursor:not-allowed;"></div>
                    <div class="form-group"><label>Homeroom Class</label><input class="input-control" value="${myRec.classId}" readonly style="opacity:0.75; cursor:not-allowed;"></div>
                    <div class="form-group"><label>Major / Program</label><input class="input-control" value="${myRec.major}" readonly style="opacity:0.75; cursor:not-allowed;"></div>
                    <button class="btn-outline" id="btnReqProfileChange" style="margin-top:6px;"><i data-lucide="life-buoy" style="width:15px;height:15px;"></i> Need Info Changed? Open Student Support</button>
                </div>
            </div>`;

        document.getElementById('btnReqProfileChange')?.addEventListener('click', () => switchTab('support'));

        document.getElementById('avatarFileInput')?.addEventListener('change', (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
                dynamicState.profile.avatarBase64 = reader.result;
                document.getElementById('profileAvatarPreview').src = reader.result;
                updateTopbarAvatar();
            };
            reader.readAsDataURL(file);
        });

        document.getElementById('btnSaveStudentAvatar')?.addEventListener('click', async () => {
            if (!dynamicState.profile.avatarBase64) {
                alert('Please choose a photo first!');
                return;
            }
            const res = await fetch('/api/student/avatar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: myRec.email,
                    role: 'Student',
                    defaultName: myRec.fullName,
                    avatarBase64: dynamicState.profile.avatarBase64
                })
            });
            if (res.ok) {
                updateTopbarAvatar();
                alert('Student profile photo updated successfully!');
            }
        });

    } else if (activeTab === 'settings') {
        c.innerHTML = `
            <div class="page-header"><h1>Account Preferences</h1></div>
            <div class="card-box" style="max-width:620px;">
                <div class="toggle-row"><div><strong>Tuition &amp; QR Alerts</strong><br><small style="color:var(--text-muted)">Notify immediately when Admin issues a new tuition invoice</small></div><label class="switch"><input type="checkbox" checked><span class="slider"></span></label></div>
                <div class="toggle-row"><div><strong>Assignment &amp; Grade Alerts</strong><br><small style="color:var(--text-muted)">Notify when lecturers post assignments or publish scores</small></div><label class="switch"><input type="checkbox" checked><span class="slider"></span></label></div>
                <div class="toggle-row" style="border:none;"><div><strong>Midnight Dark Theme</strong><br><small style="color:var(--text-muted)">Glassmorphism dark interface</small></div><label class="switch"><input type="checkbox" checked><span class="slider"></span></label></div>
            </div>`;
    }

    refreshIcons();
}

(async () => {
    await loadAllData();
    updateTopbarAvatar();
    renderSidebar();
    renderContent();
})();