document.addEventListener('DOMContentLoaded', () => {

    const SHEETS_API_URL = 'https://script.google.com/macros/s/AKfycbw25hwFfwblp7pRj0uEhot_CXxtWwBTg6IfAq1JiGHUsrIUWxddt2I2G1idOuhNamA4/exec';

    // Course mapping for full names and custom badge/border colors
    const COURSE_CONFIG = {
        'CTIA170': { name: 'CompTIA A+ Core 2 and Certification Practice', color: '#e63946' },
        'DEV140':  { name: 'Web Development', color: '#2a9d8f' },
        'DEV150':  { name: 'Linux & Command Line Foundations', color: '#7b2cbf' },
        'AI125':   { name: 'Introduction to Applied AI for Data Analysis', color: '#7b2cbf' }
    };

    // Global UI Theme Palettes
    const THEMES = {
        default: {
            '--bg-color': '#f8fafc',
            '--card-bg': '#ffffff',
            '--text-color': '#1e293b',
            '--heading-color': '#3B0764',
            '--accent-color': '#3B0764',
            '--accent-hover': '#581c87',
            '--border-color': '#e2e8f0',
            '--subtext-color': '#64748b',
            '--sticky-bg': '#fef08a',
            '--sticky-text': '#1e293b'
        },
        ocean: {
            '--bg-color': '#f0f9ff',
            '--card-bg': '#ffffff',
            '--text-color': '#0f172a',
            '--heading-color': '#0369a1',
            '--accent-color': '#0369a1',
            '--accent-hover': '#0284c7',
            '--border-color': '#bae6fd',
            '--subtext-color': '#0369a1',
            '--sticky-bg': '#bae6fd',
            '--sticky-text': '#0369a1'
        },
        emerald: {
            '--bg-color': '#f0fdf4',
            '--card-bg': '#ffffff',
            '--text-color': '#064e3b',
            '--heading-color': '#047857',
            '--accent-color': '#047857',
            '--accent-hover': '#059669',
            '--border-color': '#a7f3d0',
            '--subtext-color': '#047857',
            '--sticky-bg': '#a7f3d0',
            '--sticky-text': '#064e3b'
        },
        sunset: {
            '--bg-color': '#fff7ed',
            '--card-bg': '#ffffff',
            '--text-color': '#431407',
            '--heading-color': '#c2410c',
            '--accent-color': '#c2410c',
            '--accent-hover': '#ea580c',
            '--border-color': '#ffedd5',
            '--subtext-color': '#9a3412',
            '--sticky-bg': '#fed7aa',
            '--sticky-text': '#431407'
        },
        rose: {
            '--bg-color': '#fff1f2',
            '--card-bg': '#ffffff',
            '--text-color': '#4c0519',
            '--heading-color': '#be123c',
            '--accent-color': '#be123c',
            '--accent-hover': '#e11d48',
            '--border-color': '#fecdd3',
            '--subtext-color': '#9f1239',
            '--sticky-bg': '#fecdd3',
            '--sticky-text': '#4c0519'
        },
        dark: {
            '--bg-color': '#0f172a',
            '--card-bg': '#1e293b',
            '--text-color': '#f8fafc',
            '--heading-color': '#38bdf8',
            '--accent-color': '#38bdf8',
            '--accent-hover': '#0ea5e9',
            '--border-color': '#334155',
            '--subtext-color': '#94a3b8',
            '--sticky-bg': '#334155',
            '--sticky-text': '#f8fafc'
        }
    };

    let rawAssignments = [];
    let selectedWeek = 'ALL';

    const syncBtn = document.getElementById('sync-api-btn');
    const assignmentList = document.getElementById('sheet-assignment-list');
    const courseFilter = document.getElementById('course-filter');
    const statusFilter = document.getElementById('status-filter');

    // Case-insensitive key lookup helper
    function getProp(obj, key) {
        if (!obj) return '';
        const foundKey = Object.keys(obj).find(k => k.toLowerCase() === key.toLowerCase());
        return foundKey ? obj[foundKey] : '';
    }

    // Helper: Determine if an assignment item is marked complete
    function isItemComplete(item) {
        const progressVal = String(getProp(item, 'progress')).trim().toLowerCase();
        const completeVal = String(getProp(item, 'complete')).trim().toLowerCase();
        const statusVal = String(getProp(item, 'status')).trim().toLowerCase();

        return progressVal === 'complete' || 
               completeVal === 'true' || 
               statusVal === 'complete' || 
               statusVal === 'completed';
    }

    // --------------------------------------------------
    // 1. CALCULATE CURRENT ACADEMIC WEEK DYNAMICALLY
    // --------------------------------------------------
    function getCurrentAcademicWeek() {
        const termStart = new Date('2026-07-06T00:00:00');
        const today = new Date();
        const diffInMs = today - termStart;
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        
        let currentWeek = Math.floor(diffInDays / 7) + 1;
        if (currentWeek < 1) currentWeek = 1;
        if (currentWeek > 11) currentWeek = 11;
        return currentWeek;
    }

    // --------------------------------------------------
    // 2. FETCH FROM APPS SCRIPT
    // --------------------------------------------------
    async function fetchAssignmentsFromSheets() {
        if (assignmentList) {
            assignmentList.innerHTML = `<li class="loading-state">⏳ Connecting to Google Sheets...</li>`;
        }

        try {
            const response = await fetch(SHEETS_API_URL, { redirect: 'follow' });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            const unparsedRows = Array.isArray(data) ? data : (data.data || data.rows || []);
            rawAssignments = unparsedRows.filter(item => {
                const title = getProp(item, 'assignment') || getProp(item, 'title');
                return title && String(title).trim().toLowerCase() !== 'empty';
            });
            
            populateCourseDropdown(rawAssignments);
            updateTermProgress(rawAssignments);
            renderFilteredAssignments();
        } catch (error) {
            console.error('Error fetching sheet data:', error);
            if (assignmentList) {
                assignmentList.innerHTML = `
                    <li class="assignment-card">
                        ❌ <strong>Sync Failed:</strong> ${error.message}.<br>
                        Make sure your Web App deployment is set to "Anyone" access.
                    </li>`;
            }
        }
    }

    function populateCourseDropdown(data) {
        if (!courseFilter) return;
        const rawCourses = data.map(item => getProp(item, 'class') || getProp(item, 'course')).filter(Boolean);
        const courses = ['ALL', ...new Set(rawCourses)];
        courseFilter.innerHTML = courses.map(c => `<option value="${c}">${c === 'ALL' ? 'All Courses' : c}</option>`).join('');
    }

    // --------------------------------------------------
    // 3. DYNAMIC TERM PROGRESS & WEEK BADGE
    // --------------------------------------------------
    function updateTermProgress(data) {
        const currentWeek = getCurrentAcademicWeek();
        const totalTasks = data.length;
        const completedTasks = data.filter(isItemComplete).length;
        const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        const fillBar = document.getElementById('term-progress-fill');
        const statusText = document.getElementById('term-status-text');
        const badgeText = document.getElementById('week-badge');
        const termHeader = document.getElementById('term-header');

        if (fillBar && statusText && badgeText) {
            fillBar.style.width = `${completionPercentage}%`;
            if (termHeader) termHeader.textContent = `Term Progress (Week ${currentWeek} of 11)`;
            badgeText.textContent = `Week ${currentWeek} | ${completedTasks}/${totalTasks} Tasks Done`;
            statusText.textContent = `${completionPercentage}% of overall term coursework completed (${completedTasks} of ${totalTasks} assignments marked Complete).`;
        }
    }

    // --------------------------------------------------
    // 4. RENDER FILTERED ASSIGNMENTS TO DOM
    // --------------------------------------------------
    function renderFilteredAssignments() {
        if (!assignmentList) return;
        assignmentList.innerHTML = '';

        const selectedCourse = courseFilter ? courseFilter.value : 'ALL';
        const selectedStatus = statusFilter ? statusFilter.value : 'ALL';

        const filtered = rawAssignments.filter(item => {
            const itemCourse = getProp(item, 'class') || getProp(item, 'course');
            const itemWeek = getProp(item, 'week');
            
            const matchesCourse = selectedCourse === 'ALL' || itemCourse === selectedCourse;
            const matchesWeek = selectedWeek === 'ALL' || String(itemWeek) === String(selectedWeek);
            
            const isDone = isItemComplete(item);
            const matchesStatus = selectedStatus === 'ALL' || 
                (selectedStatus === 'Complete' && isDone) || 
                (selectedStatus === 'Pending' && !isDone);

            return matchesCourse && matchesWeek && matchesStatus;
        });

        if (filtered.length === 0) {
            assignmentList.innerHTML = `<li class="assignment-card">No assignments found for Week ${selectedWeek} / ${selectedCourse}.</li>`;
            return;
        }

        filtered.forEach(item => {
            const li = document.createElement('li');
            const isDone = isItemComplete(item);
            
            const priorityVal = getProp(item, 'priority');
            const isHighPriority = String(priorityVal).toLowerCase() === 'high';

            const title = getProp(item, 'assignment') || getProp(item, 'title') || getProp(item, 'name') || 'Untitled Assignment';
            const courseCode = (getProp(item, 'class') || getProp(item, 'course') || 'General').trim();
            
            const courseInfo = COURSE_CONFIG[courseCode] || { name: courseCode, color: '#6c757d' };

            const weekNum = getProp(item, 'week') || '-';
            const dueDate = getProp(item, 'date due') || getProp(item, 'due date') || getProp(item, 'due') || 'N/A';

            li.className = `assignment-card ${isDone ? 'complete' : ''} ${isHighPriority ? 'high-priority' : ''}`;
            li.style.borderLeftColor = courseInfo.color;
            
            li.innerHTML = `
                <div class="assignment-details">
                    <strong>${title}</strong>
                    <div class="assignment-meta">
                        <span class="course-tag" style="background-color: ${courseInfo.color}; text-shadow: 0 1px 2px rgba(0,0,0,0.2);">
                            ${courseInfo.name} (${courseCode})
                        </span> 
                        <span class="meta-item">📅 Week ${weekNum} | Due: ${dueDate}</span>
                        ${priorityVal ? `<span class="meta-item">| Priority: <em>${priorityVal}</em></span>` : ''}
                    </div>
                </div>
                <span class="badge ${isDone ? 'badge-complete' : 'badge-pending'}">
                    ${isDone ? 'Completed' : 'Pending'}
                </span>
            `;

            assignmentList.appendChild(li);
        });
    }

    // --------------------------------------------------
    // 5. GLOBAL SITE THEME CUSTOMIZER
    // --------------------------------------------------
    const swatches = document.querySelectorAll('.theme-swatch');

    swatches.forEach(swatch => {
        swatch.addEventListener('click', () => {
            const themeKey = swatch.getAttribute('data-theme');
            const themeVars = THEMES[themeKey];

            if (themeVars) {
                Object.keys(themeVars).forEach(key => {
                    document.documentElement.style.setProperty(key, themeVars[key]);
                });

                swatches.forEach(s => s.classList.remove('active'));
                swatch.classList.add('active');
            }
        });
    });

    // --------------------------------------------------
    // 6. STICKY NOTE SCRATCHPAD (CREATE & REMOVE NODES)
    // --------------------------------------------------
    const noteInput = document.getElementById('note-input');
    const addNoteBtn = document.getElementById('add-note-btn');
    const stickyNoteList = document.getElementById('sticky-note-list');

    function createStickyNote() {
        if (!noteInput) return;
        const textValue = noteInput.value.trim();
        if (!textValue) return;

        const li = document.createElement('li');
        li.className = 'sticky-card';

        const p = document.createElement('p');
        p.textContent = textValue;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-note-btn';
        deleteBtn.innerHTML = '&times;';
        deleteBtn.title = 'Delete note';
        deleteBtn.setAttribute('aria-label', 'Delete note');

        deleteBtn.addEventListener('click', () => {
            li.remove();
        });

        li.appendChild(p);
        li.appendChild(deleteBtn);
        if (stickyNoteList) stickyNoteList.appendChild(li);

        noteInput.value = '';
    }

    // --------------------------------------------------
    // 7. EVENT LISTENERS
    // --------------------------------------------------
    if (syncBtn) {
        syncBtn.addEventListener('click', fetchAssignmentsFromSheets);
    }
    if (courseFilter) {
        courseFilter.addEventListener('change', renderFilteredAssignments);
    }
    if (statusFilter) {
        statusFilter.addEventListener('change', renderFilteredAssignments);
    }

    document.querySelectorAll('.week-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.week-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            selectedWeek = e.target.getAttribute('data-week');
            renderFilteredAssignments();
        });
    });

    if (addNoteBtn && noteInput) {
        addNoteBtn.addEventListener('click', createStickyNote);
        
        noteInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                createStickyNote();
            }
        });
    }

    // Initial fetch on page load
    fetchAssignmentsFromSheets();
});