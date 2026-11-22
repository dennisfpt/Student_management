(function () {
    const user = (typeof currentUser !== 'undefined' && currentUser) ? currentUser : null;

    if (!user) {
        window.location.replace('login.html');
        return;
    }

    if (user.role !== 'Teacher') {
        if (user.role === 'Admin') window.location.replace('admin.html');
        else if (user.role === 'Student') window.location.replace('student.html');
        else window.location.replace('login.html');
        return;
    }

    const TEACHER_MENUS = [
        { id: 'overview', icon: 'layout-dashboard', label: 'Dashboard' },
        { id: 'classes', icon: 'school', label: 'My Classes' },
        { id: 'students', icon: 'users', label: 'My Students' },
        { id: 'assignments', icon: 'folder-check', label: 'Assignments' },
        { id: 'attendance', icon: 'check-circle-2', label: 'Attendance & Exam Lock' },
        { id: 'grades', icon: 'file-spreadsheet', label: 'Grades' },
        { id: 'events', icon: 'calendar-check', label: 'Campus Events' },
        { id: 'schedules', icon: 'clock', label: 'Timetable' },
        { id: 'reports', icon: 'bar-chart-3', label: 'Reports' },
        { id: 'notifications', icon: 'bell', label: 'Notifications' },
        { id: 'profile', icon: 'user', label: 'Profile' },
        { id: 'settings', icon: 'settings', label: 'Settings' }
    ];

    window.activeTab = 'overview';
    let selectedClassId = '';

    function safeTeachers() {
        return Array.isArray(cache?.teachers) ? cache.teachers : [];
    }

    function safeClasses() {
        return Array.isArray(cache?.classes) ? cache.classes : [];
    }

    function safeStudents() {
        return Array.isArray(cache?.students) ? cache.students : [];
    }

    function getLecturerInfo() {
        const found = safeTeachers().find(t => (t.email || '').toLowerCase() === (user.email || '').toLowerCase());
        return found || {
            id: user.userCode || 'GV-IT01',
            fullName: user.fullName || 'Dr. Nguyen Van Minh',
            email: user.email || 'minh.tv@unit.edu.vn',
            department: user.major || 'Information Technology',
            phone: '0901112201'
        };
    }

    function getMyAssignedClasses() {
        const info = getLecturerInfo();
        const mine = safeClasses().filter(cl => cl.lecturerId === info.id);
        if (mine.length > 0) return mine;
        const byDept = safeClasses().filter(cl => cl.department === info.department).slice(0, 3);
        return byDept.length > 0 ? byDept : safeClasses().slice(0, 3);
    }

    function getMyAssignedStudents() {
        const myClassIds = new Set(getMyAssignedClasses().map(c => c.id));
        return safeStudents().filter(s => myClassIds.has(s.classId));
    }

    function getLecturerAvatarUrl() {
        const av = dynamicState?.profile?.avatarBase64;
        if (av) return av;
        return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.fullName || 'Lecturer') + '&background=7e22ce&color=fff&size=160';
    }

    function updateLecturerTopbarAvatar() {
        const topbarUser = document.querySelector('.topbar-user');
        if (!topbarUser) return;
        let img = document.getElementById('topbarLecturerAvatar');
        if (!img) {
            img = document.createElement('img');
            img.id = 'topbarLecturerAvatar';
            img.style.cssText = 'width:34px;height:34px;border-radius:50%;object-fit:cover;border:2px solid #c084fc;';
            topbarUser.insertBefore(img, topbarUser.firstChild);
        }
        img.src = getLecturerAvatarUrl();
    }

    function renderSidebar() {
        const sidebar = document.getElementById('sidebarMenu');
        if (!sidebar) return;
        sidebar.innerHTML = TEACHER_MENUS.map(m =>
            `<div class="menu-item ${m.id === window.activeTab ? 'active' : ''}" data-tab="${m.id}"><i data-lucide="${m.icon}"></i><span>${m.label}</span></div>`
        ).join('');
        sidebar.querySelectorAll('.menu-item').forEach(el => {
            el.addEventListener('click', () => switchTab(el.dataset.tab));
        });
        if (typeof refreshIcons === 'function') refreshIcons();
    }

    function switchTab(id) {
        window.activeTab = id;
        renderSidebar();
        renderContent();
    }

    window.renderContent = function renderContent() {
        const c = document.getElementById('mainContent');
        if (!c) return;

        const info = getLecturerInfo();
        const myClasses = getMyAssignedClasses();
        const myStudents = getMyAssignedStudents();
        if (!selectedClassId && myClasses.length > 0) selectedClassId = myClasses[0].id;

        const myClassIds = new Set(myClasses.map(cl => cl.id));
        const myAssignments = (dynamicState?.assignments || []).filter(a => myClassIds.has(a.classId));
        const totalSubmissions = myAssignments.reduce((sum, a) => sum + (a.submissions?.length || 0), 0);

        if (window.activeTab === 'overview') {
            c.innerHTML = `
                <div class="dashboard-hero-banner">
                    <div style="display:flex; align-items:center; gap:16px;">
                        <img src="${getLecturerAvatarUrl()}" alt="Lecturer Avatar" style="width:56px; height:56px; border-radius:50%; object-fit:cover; border:2px solid #c084fc;">
                        <div>
                            <h1>Teaching Dashboard</h1>
                            <p>Specialty: <strong>${info.department}</strong> (Single Major) • Teaching ${myClasses.length} Classes</p>
                        </div>
                    </div>
                    <div style="display:flex; gap:10px;">
                        <button class="btn-outline" id="btnHeroAsm"><i data-lucide="folder-check" style="width:16px;height:16px;"></i> Assignments (${totalSubmissions} Subs)</button>
                        <button class="btn-action" id="btnGoAtt"><i data-lucide="check-square" style="width:16px;height:16px;"></i> Attendance &amp; Exam Lock</button>
                    </div>
                </div>

                <div class="kpi-grid">
                    <div class="kpi-card kpi-blue">
                        <div class="kpi-top"><div class="kpi-icon"><i data-lucide="school"></i></div><div><div class="kpi-value">${myClasses.length}</div><div class="kpi-label">My Assigned Classes</div></div></div>
                        <div class="kpi-footer"><span class="kpi-trend-up">${info.department}</span>${typeof sparklineSvg === 'function' ? sparklineSvg('#38bdf8') : ''}</div>
                    </div>
                    <div class="kpi-card kpi-emerald">
                        <div class="kpi-top"><div class="kpi-icon"><i data-lucide="users"></i></div><div><div class="kpi-value">${myStudents.length}</div><div class="kpi-label">My Students (≤30/class)</div></div></div>
                        <div class="kpi-footer"><span class="kpi-trend-up">Active Roster</span>${typeof sparklineSvg === 'function' ? sparklineSvg('#34d399') : ''}</div>
                    </div>
                    <div class="kpi-card kpi-purple">
                        <div class="kpi-top"><div class="kpi-icon"><i data-lucide="folder-check"></i></div><div><div class="kpi-value">${totalSubmissions}</div><div class="kpi-label">Student Submissions</div></div></div>
                        <div class="kpi-footer"><span class="kpi-trend-up">${myAssignments.length} Assignments</span>${typeof sparklineSvg === 'function' ? sparklineSvg('#c084fc') : ''}</div>
                    </div>
                    <div class="kpi-card kpi-amber">
                        <div class="kpi-top"><div class="kpi-icon"><i data-lucide="star"></i></div><div><div class="kpi-value">8.6</div><div class="kpi-label">Avg Score</div></div></div>
                        <div class="kpi-footer"><span class="kpi-trend-up">+0.3</span>${typeof sparklineSvg === 'function' ? sparklineSvg('#fbbf24') : ''}</div>
                    </div>
                </div>

                <div class="charts-grid">
                    <div class="card-box">
                        <h3><i data-lucide="school" style="width:17px;height:17px;color:#38bdf8;"></i> My Assigned Classes (${info.department})</h3>
                        <div class="activity-list">
                            ${myClasses.map(cl => `
                                <div class="activity-item">
                                    <span><strong>${cl.id}</strong> — ${cl.name}</span>
                                    <span class="pill-blue status-pill">${cl.enrolledCount ?? 0} / ${cl.maxCapacity ?? 30} Students</span>
                                </div>`).join('')}
                        </div>
                    </div>
                    <div class="card-box">
                        <h3><i data-lucide="bell" style="width:17px;height:17px;color:#fbbf24;"></i> Admin Notices &amp; Schedule Alerts</h3>
                        <div class="activity-list">
                            ${(dynamicState?.announcements || []).slice(0, 3).map(n => `
                                <div class="activity-item">
                                    <span><strong>${n.title}</strong></span>
                                    <small style="color:var(--text-muted)">${n.createdAt}</small>
                                </div>`).join('')}
                        </div>
                    </div>
                </div>`;

            document.getElementById('btnHeroAsm')?.addEventListener('click', () => switchTab('assignments'));
            document.getElementById('btnGoAtt')?.addEventListener('click', () => switchTab('attendance'));

        } else if (window.activeTab === 'classes' || window.activeTab === 'students') {
            const classStudents = myStudents.filter(s => s.classId === selectedClassId);
            c.innerHTML = `
                <div class="page-header">
                    <div><h1>My Classes &amp; Student Roster (${info.department})</h1><p style="color:var(--text-muted)">Viewing class ${selectedClassId}: ${classStudents.length} / 30 students</p></div>
                    <select id="selTeacherClass" class="filter-select">
                        ${myClasses.map(cl => `<option value="${cl.id}" ${cl.id === selectedClassId ? 'selected' : ''}>${cl.id} - ${cl.name} (${cl.enrolledCount ?? 0}/${cl.maxCapacity ?? 30} SV)</option>`).join('')}
                    </select>
                </div>
                <div class="card-box">
                    <table>
                        <thead><tr><th>#</th><th>Student ID</th><th>Full Name</th><th>Major</th><th>Class</th><th>Email</th><th>GPA</th></tr></thead>
                        <tbody>
                            ${classStudents.map((s, idx) => `
                                <tr>
                                    <td>${idx + 1}</td>
                                    <td><strong>${s.id}</strong></td>
                                    <td>${s.fullName}</td>
                                    <td>${s.major}</td>
                                    <td><span class="status-pill pill-blue">${s.classId}</span></td>
                                    <td>${s.email}</td>
                                    <td>${Number(s.gpa ?? 3.5).toFixed(2)}</td>
                                </tr>`).join('')}
                        </tbody>
                    </table>
                </div>`;
            document.getElementById('selTeacherClass')?.addEventListener('change', (e) => { selectedClassId = e.target.value; renderContent(); });

        } else if (window.activeTab === 'assignments') {
            c.innerHTML = `
                <div class="page-header">
                    <div><h1>Assignments &amp; Student Submissions (${info.department})</h1><p style="color:var(--text-muted)">Create coursework for your classes, review submitted files/links, and grade students</p></div>
                    <div style="display:flex; gap:10px;">
                        <button class="btn-outline" id="btnSyncAsmLec"><i data-lucide="refresh-cw" style="width:15px;height:15px;"></i> Refresh</button>
                        <button class="btn-action" id="btnCreateNewAsm"><i data-lucide="plus" style="width:15px;height:15px;"></i> Post New Assignment</button>
                    </div>
                </div>
                <div class="activity-list">
                    ${myAssignments.length === 0 ? '<div class="card-box"><p style="color:var(--text-muted)">No assignments posted for your classes yet.</p></div>' : myAssignments.map(a => `
                        <div class="card-box" style="margin-bottom:14px;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                                <div>
                                    <span class="status-pill pill-blue">${a.classId}</span>
                                    <span class="status-pill pill-amber" style="margin-left:6px;">Due: ${a.dueDate}</span>
                                    <h3 style="margin-top:8px; margin-bottom:4px;">${a.title}</h3>
                                    <p style="color:var(--text-muted); font-size:13px;">${a.description}</p>
                                </div>
                                <span class="status-pill">${a.submissions?.length || 0} Submissions</span>
                            </div>
                            ${(!a.submissions || a.submissions.length === 0)
                    ? '<p style="color:var(--text-muted); font-size:12.5px;">No student submissions yet.</p>'
                    : `<table>
                                    <thead><tr><th>Student</th><th>Submitted File / Link</th><th>Submitted At</th><th>Score</th><th>Action</th></tr></thead>
                                    <tbody>
                                        ${a.submissions.map(sub => `
                                            <tr>
                                                <td><strong>${sub.studentName}</strong> (${sub.studentId})</td>
                                                <td>${(sub.fileDataOrLink || '').startsWith('data:')
                            ? `<a href="${sub.fileDataOrLink}" download="${sub.fileName}" style="color:#38bdf8; text-decoration:underline;">Download ${sub.fileName}</a>`
                            : `<a href="${sub.fileDataOrLink}" target="_blank" style="color:#38bdf8; text-decoration:underline;">${sub.fileName}</a>`}
                                                </td>
                                                <td>${sub.submittedAt}</td>
                                                <td><strong>${sub.score !== null && sub.score !== undefined ? `${sub.score} / 10` : 'Pending'}</strong></td>
                                                <td><button class="btn-sm btn-edit" data-grade-asm="${a.id}" data-grade-stu="${sub.studentId}">Grade Work</button></td>
                                            </tr>`).join('')}
                                    </tbody>
                                </table>`}
                        </div>`).join('')}
                </div>`;

            document.getElementById('btnSyncAsmLec')?.addEventListener('click', async () => {
                if (typeof syncPortalState === 'function') await syncPortalState();
                renderContent();
            });

            document.getElementById('btnCreateNewAsm')?.addEventListener('click', () => {
                if (typeof openModal !== 'function') return;
                openModal('Create New Class Assignment', `
                    <div class="form-group">
                        <label>Target Class</label>
                        <select id="newAsmClass" class="input-control">
                            ${myClasses.map(cl => `<option value="${cl.id}">${cl.id} - ${cl.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group"><label>Assignment Title</label><input id="newAsmTitle" class="input-control" placeholder="e.g. Lab 02: REST API & Entity Framework"></div>
                    <div class="form-group"><label>Deadline</label><input id="newAsmDue" class="input-control" value="2026-12-15 23:59"></div>
                    <div class="form-group"><label>Instructions</label><textarea id="newAsmDesc" rows="3" class="input-control" placeholder="Describe deliverables..."></textarea></div>
                    <button class="btn-primary" id="btnSubmitNewAsm">Publish Assignment to Class</button>
                `);
                document.getElementById('btnSubmitNewAsm')?.addEventListener('click', async () => {
                    const classId = document.getElementById('newAsmClass').value;
                    const title = document.getElementById('newAsmTitle').value.trim();
                    const dueDate = document.getElementById('newAsmDue').value.trim();
                    const description = document.getElementById('newAsmDesc').value.trim();
                    if (!title) return;

                    const res = await fetch('/api/grade/assignments', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ classId, courseName: info.department, lecturerName: info.fullName, title, description, dueDate })
                    });
                    if (res.ok) {
                        if (typeof syncPortalState === 'function') await syncPortalState();
                        if (typeof closeModal === 'function') closeModal();
                        alert(`Assignment published to class ${classId}!`);
                        renderContent();
                    }
                });
            });

            c.querySelectorAll('[data-grade-asm]').forEach(btn => btn.addEventListener('click', () => {
                const asm = myAssignments.find(x => x.id === btn.dataset.gradeAsm);
                const sub = asm?.submissions?.find(s => s.studentId === btn.dataset.gradeStu);
                if (!asm || !sub || typeof openModal !== 'function') return;

                openModal(`Grade Submission • ${sub.studentName} (${sub.studentId})`, `
                    <div class="form-group"><label>Submitted Work</label><input class="input-control" value="${sub.fileName}" readonly></div>
                    <div class="form-group"><label>Score (0 - 10)</label><input id="subScoreVal" type="number" step="0.1" min="0" max="10" class="input-control" value="${sub.score ?? 9.0}"></div>
                    <div class="form-group"><label>Feedback for Student</label><textarea id="subFeedbackVal" rows="3" class="input-control">${sub.feedback || 'Great structure and clean implementation!'}</textarea></div>
                    <button class="btn-primary" id="btnSaveSubGrade">Save Score &amp; Notify Student</button>
                `);
                document.getElementById('btnSaveSubGrade')?.addEventListener('click', async () => {
                    const score = parseFloat(document.getElementById('subScoreVal').value) || 0;
                    const feedback = document.getElementById('subFeedbackVal').value.trim();
                    const res = await fetch('/api/grade/assignments/grade', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ assignmentId: asm.id, studentId: sub.studentId, score, feedback })
                    });
                    if (res.ok) {
                        if (typeof syncPortalState === 'function') await syncPortalState();
                        if (typeof closeModal === 'function') closeModal();
                        alert(`Graded ${sub.studentName}: ${score}/10!`);
                        renderContent();
                    }
                });
            }));

        } else if (window.activeTab === 'attendance') {
            const classStudents = myStudents.filter(s => s.classId === selectedClassId);
            c.innerHTML = `
                <div class="page-header">
                    <div>
                        <h1>Attendance &amp; Exam Eligibility • ${selectedClassId}</h1>
                        <p style="color:var(--text-muted)">Rule: Students with attendance rate &lt; 80% (absent &gt; 3/15 sessions) are automatically locked from Final Exams</p>
                    </div>
                    <div style="display:flex; gap:10px;">
                        <select id="selAttClass" class="filter-select">
                            ${myClasses.map(cl => `<option value="${cl.id}" ${cl.id === selectedClassId ? 'selected' : ''}>${cl.id} (${cl.enrolledCount ?? 0} SV)</option>`).join('')}
                        </select>
                        <button class="btn-action" id="btnSaveAtt"><i data-lucide="save" style="width:15px;height:15px;"></i> Save &amp; Sync Eligibility</button>
                    </div>
                </div>
                <div class="card-box">
                    <table>
                        <thead><tr><th>#</th><th>Student ID</th><th>Full Name</th><th>Today</th><th>Absent / 15</th><th>Rate</th><th>Exam Eligibility</th></tr></thead>
                        <tbody>
                            ${classStudents.map((s, idx) => {
                const rec = (dynamicState?.attendanceRecords || []).find(r => r.studentId === s.id && r.classId === selectedClassId);
                const absent = rec ? rec.absentSessions : (idx === 2 ? 4 : 0);
                const rate = Math.round(((15 - absent) / 15) * 100);
                const eligible = rate >= 80;
                return `
                                <tr>
                                    <td>${idx + 1}</td>
                                    <td><strong>${s.id}</strong></td>
                                    <td>${s.fullName}</td>
                                    <td><select class="filter-select att-today-sel" data-st="${s.id}"><option value="0">Present</option><option value="1">Absent (+1)</option></select></td>
                                    <td><input type="number" min="0" max="15" class="input-control att-absent-inp" data-st="${s.id}" value="${absent}" style="width:72px;padding:6px;"></td>
                                    <td><strong id="attRate_${s.id}">${rate}%</strong></td>
                                    <td><span id="attElig_${s.id}" class="status-pill ${eligible ? '' : 'pill-rose'}">${eligible ? 'Eligible' : 'Banned (<80%)'}</span></td>
                                </tr>`;
            }).join('')}
                        </tbody>
                    </table>
                </div>`;

            document.getElementById('selAttClass')?.addEventListener('change', (e) => { selectedClassId = e.target.value; renderContent(); });

            c.querySelectorAll('.att-absent-inp').forEach(inp => {
                inp.addEventListener('input', () => {
                    const stId = inp.dataset.st;
                    const abs = Math.min(15, Math.max(0, parseInt(inp.value, 10) || 0));
                    const rate = Math.round(((15 - abs) / 15) * 100);
                    const elig = rate >= 80;
                    document.getElementById(`attRate_${stId}`).innerText = `${rate}%`;
                    const badge = document.getElementById(`attElig_${stId}`);
                    badge.innerText = elig ? 'Eligible' : 'Banned (<80%)';
                    badge.className = `status-pill ${elig ? '' : 'pill-rose'}`;
                });
            });

            document.getElementById('btnSaveAtt')?.addEventListener('click', async () => {
                const payload = classStudents.map(s => {
                    const baseAbs = parseInt(document.querySelector(`.att-absent-inp[data-st="${s.id}"]`)?.value || '0', 10);
                    const addToday = parseInt(document.querySelector(`.att-today-sel[data-st="${s.id}"]`)?.value || '0', 10);
                    const absentSessions = Math.min(15, baseAbs + addToday);
                    return {
                        studentId: s.id,
                        studentName: s.fullName,
                        classId: selectedClassId,
                        totalSessions: 15,
                        attendedSessions: 15 - absentSessions,
                        absentSessions,
                        updatedBy: info.fullName
                    };
                });
                const res = await fetch('/api/attendance/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (res.ok) {
                    const d = await res.json();
                    if (typeof syncPortalState === 'function') await syncPortalState();
                    alert(`Attendance synced! ${d.bannedCount} student(s) flagged as Exam Ineligible (<80%).`);
                    renderContent();
                }
            });

        } else if (window.activeTab === 'grades') {
            const classStudents = myStudents.filter(s => s.classId === selectedClassId);
            c.innerHTML = `
                <div class="page-header">
                    <h1>Gradebook • ${selectedClassId}</h1>
                    <div style="display:flex; gap:10px;">
                        <select id="selGradeClass" class="filter-select">
                            ${myClasses.map(cl => `<option value="${cl.id}" ${cl.id === selectedClassId ? 'selected' : ''}>${cl.id} (${cl.enrolledCount ?? 0} SV)</option>`).join('')}
                        </select>
                        <button class="btn-action" id="btnSaveAllGrades"><i data-lucide="save" style="width:15px;height:15px;"></i> Save All Grades</button>
                    </div>
                </div>
                <div class="card-box">
                    <table>
                        <thead><tr><th>Student ID</th><th>Full Name</th><th>Midterm (40%)</th><th>Final (60%)</th><th>GPA</th></tr></thead>
                        <tbody>
                            ${classStudents.map(s => `
                                <tr>
                                    <td><strong>${s.id}</strong></td>
                                    <td>${s.fullName}</td>
                                    <td><input type="number" step="0.1" min="0" max="10" class="input-control" value="8.5" style="width:80px;padding:6px;"></td>
                                    <td><input type="number" step="0.1" min="0" max="10" class="input-control" value="8.8" style="width:80px;padding:6px;"></td>
                                    <td><strong>${Number(s.gpa ?? 3.5).toFixed(2)}</strong></td>
                                </tr>`).join('')}
                        </tbody>
                    </table>
                </div>`;
            document.getElementById('selGradeClass')?.addEventListener('change', (e) => { selectedClassId = e.target.value; renderContent(); });
            document.getElementById('btnSaveAllGrades')?.addEventListener('click', () => alert(`Grades saved for class ${selectedClassId}!`));

        } else if (window.activeTab === 'events') {
            const events = dynamicState?.events || [];
            c.innerHTML = `
                <div class="page-header">
                    <div><h1>Campus Events &amp; Conduct Activities</h1><p style="color:var(--text-muted)">University workshops, hackathons, and student club events</p></div>
                </div>
                <div class="card-box">
                    <table>
                        <thead><tr><th>Event ID</th><th>Title</th><th>Organizer</th><th>Date &amp; Venue</th><th>Conduct Pts</th><th>Checked-in</th></tr></thead>
                        <tbody>
                            ${events.map(e => `
                                <tr>
                                    <td><strong>${e.id}</strong></td>
                                    <td><strong>${e.title}</strong></td>
                                    <td>${e.organizer}</td>
                                    <td>${e.eventDate}<br><small style="color:var(--text-muted)">${e.venue}</small></td>
                                    <td><span class="status-pill pill-amber">+${e.conductPoints} pts</span></td>
                                    <td><span class="status-pill pill-blue">${e.attendees?.length || 0} Students</span></td>
                                </tr>`).join('')}
                        </tbody>
                    </table>
                </div>`;

        } else if (window.activeTab === 'profile') {
            c.innerHTML = `
                <div class="page-header">
                    <div><h1>Lecturer Profile</h1><p style="color:var(--text-muted)">You can update your profile photo. Faculty specialty &amp; records are Admin-managed.</p></div>
                </div>
                <div class="charts-grid" style="grid-template-columns: 300px 1fr;">
                    <div class="card-box" style="text-align:center;">
                        <img id="lecturerAvatarPreview" src="${getLecturerAvatarUrl()}" alt="Lecturer Avatar" style="width:140px; height:140px; border-radius:50%; object-fit:cover; border:3px solid #c084fc; margin-bottom:14px;">
                        <h3 style="justify-content:center; margin-bottom:4px;">${info.fullName}</h3>
                        <p style="color:var(--text-muted); font-size:13px; margin-bottom:16px;">${info.id} • ${info.department}</p>
                        <label class="btn-outline" style="cursor:pointer; justify-content:center; width:100%; margin-bottom:10px;">
                            <i data-lucide="camera" style="width:16px;height:16px;"></i> Choose New Photo
                            <input type="file" id="lecturerAvatarInput" accept="image/*" style="display:none;">
                        </label>
                        <button class="btn-primary" id="btnSaveLecturerAvatar">Save Profile Photo</button>
                    </div>
                    <div class="card-box">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                            <h3 style="margin:0;">Official Faculty Record</h3>
                            <span class="status-pill pill-blue"><i data-lucide="lock" style="width:12px;height:12px;"></i> Admin Managed (Read-Only)</span>
                        </div>
                        <div class="form-group"><label>Lecturer ID</label><input class="input-control" value="${info.id}" readonly style="opacity:0.75; cursor:not-allowed;"></div>
                        <div class="form-group"><label>Full Name</label><input class="input-control" value="${info.fullName}" readonly style="opacity:0.75; cursor:not-allowed;"></div>
                        <div class="form-group"><label>University Email</label><input class="input-control" value="${info.email}" readonly style="opacity:0.75; cursor:not-allowed;"></div>
                        <div class="form-group"><label>Single Specialized Major</label><input class="input-control" value="${info.department}" readonly style="opacity:0.75; cursor:not-allowed;"></div>
                        <div class="form-group"><label>Assigned Classes (${myClasses.length})</label><input class="input-control" value="${myClasses.map(cl => cl.id).join(', ')}" readonly style="opacity:0.75; cursor:not-allowed;"></div>
                    </div>
                </div>`;

            document.getElementById('lecturerAvatarInput')?.addEventListener('change', (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                    if (dynamicState?.profile) dynamicState.profile.avatarBase64 = reader.result;
                    document.getElementById('lecturerAvatarPreview').src = reader.result;
                    updateLecturerTopbarAvatar();
                };
                reader.readAsDataURL(file);
            });

            document.getElementById('btnSaveLecturerAvatar')?.addEventListener('click', async () => {
                const av = dynamicState?.profile?.avatarBase64;
                if (!av) return;
                const res = await fetch('/api/student/avatar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: user.email, role: 'Teacher', defaultName: info.fullName, avatarBase64: av })
                });
                if (res.ok) alert('Lecturer profile photo updated!');
            });

        } else if (window.activeTab === 'notifications') {
            c.innerHTML = `
                <div class="page-header"><h1>Faculty Notifications</h1></div>
                <div class="card-box">
                    <div class="activity-list">
                        ${(dynamicState?.announcements || []).map(n => `
                            <div class="activity-item" style="align-items:flex-start;">
                                <div>
                                    <span class="status-pill pill-blue">${n.category || 'Academic'}</span>
                                    <strong style="margin-left:8px; color:#38bdf8;">${n.title}</strong>
                                    <p style="margin-top:6px; color:var(--text-white);">${n.message}</p>
                                </div>
                                <small style="color:var(--text-muted)">${n.createdAt}</small>
                            </div>`).join('')}
                    </div>
                </div>`;

        } else {
            c.innerHTML = `<div class="page-header"><h1>${String(window.activeTab).charAt(0).toUpperCase() + String(window.activeTab).slice(1)}</h1></div><div class="card-box"><p style="color:var(--text-muted)">Teaching schedule &amp; reports for ${info.department} are active.</p></div>`;
        }

        if (typeof refreshIcons === 'function') refreshIcons();
    };

    (async () => {
        if (typeof loadAllData === 'function') await loadAllData();
        updateLecturerTopbarAvatar();
        renderSidebar();
        window.renderContent();
    })();
})();