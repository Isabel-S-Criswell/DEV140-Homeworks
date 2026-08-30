document.addEventListener('DOMContentLoaded', () => {

    const SHEETS_API_URL = 'https://script.google.com/macros/s/AKfycbw25hwFfwblp7pRj0uEhot_CXxtWwBTg6IfAq1JiGHUsrIUWxddt2I2G1idOuhNamA4/exec';

    // Course mapping for full names and custom badge/border colors
    const COURSE_CONFIG = {
        'CTIA170': { name: 'CompTIA A+ Core 2 and Certification Practice', color: '#e63946' }, // Red
        'DEV140':  { name: 'Web Development', color: '#2a9d8f' },                             // Green
        'DEV150':  { name: 'Linux & Command Line Foundations', color: '#7b2cbf' },            // Purple
        'AI125':   { name: 'Introduction to Applied AI for Data Analysis', color: '#7b2cbf' } // Purple
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

    // Populate course dropdown
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
            
            // Map course code to config
            const courseInfo = COURSE_CONFIG[courseCode] || { name: courseCode, color: '#6c757d' };

            const weekNum = getProp(item, 'week') || '-';
            const dueDate = getProp(item, 'date due') || getProp(item, 'due date') || getProp(item, 'due') || 'N/A';

            li.className = `assignment-card ${isDone ? 'complete' : ''} ${isHighPriority ? 'high-priority' : ''}`;
            
            // Set the left border color dynamically to match the course color
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
    // 5. EVENT LISTENERS
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

    // --------------------------------------------------
    // 6. THEME CUSTOMIZER
    // --------------------------------------------------
    const accentInput = document.getElementById('accent-color-input');
    const dashboardCard = document.getElementById('hw7-dashboard');

    if (accentInput && dashboardCard) {
        accentInput.addEventListener('input', (e) => {
            let color = e.target.value.trim();
            if (color) {
                dashboardCard.style.backgroundColor = color;
                dashboardCard.style.transition = 'background-color 0.3s ease';
            }
        });
    }

    // Initial fetch on page load
    fetchAssignmentsFromSheets();
});