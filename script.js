document.addEventListener('DOMContentLoaded', () => {

    const SHEETS_API_URL = 'https://script.google.com/macros/s/AKfycbxOqsMHfh2Qf0XTPhWeUznCCheEMtkJdcwZN6bGj1kQDSF4LAxn8rwwMdi-yN0NLrah/exec';

    let rawAssignments = [];
    let selectedWeek = 'ALL';

    const syncBtn = document.getElementById('sync-api-btn');
    const assignmentList = document.getElementById('sheet-assignment-list');
    const courseFilter = document.getElementById('course-filter');
    const statusFilter = document.getElementById('status-filter');

    // Helper function to safely read object properties regardless of case
    function getProp(obj, key) {
        if (!obj) return '';
        const foundKey = Object.keys(obj).find(k => k.toLowerCase() === key.toLowerCase());
        return foundKey ? obj[foundKey] : '';
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
            // Handle cases where data is wrapped in an object property (e.g., data.data or data.rows)
            rawAssignments = Array.isArray(data) ? data : (data.data || data.rows || []);
            
            console.log("Successfully fetched data rows:", rawAssignments.length);

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

    // Populate course options dynamically
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
        
        const completedTasks = data.filter(item => {
            const progressVal = String(getProp(item, 'progress')).trim().toLowerCase();
            const completeVal = String(getProp(item, 'complete')).trim().toLowerCase();
            const statusVal = String(getProp(item, 'status')).trim().toLowerCase();
            return progressVal === 'complete' || completeVal === 'true' || statusVal === 'complete' || statusVal === 'completed';
        }).length;

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
            
            const progressVal = String(getProp(item, 'progress')).trim().toLowerCase();
            const completeVal = String(getProp(item, 'complete')).trim().toLowerCase();
            const statusVal = String(getProp(item, 'status')).trim().toLowerCase();

            const isCompleted = progressVal === 'complete' || completeVal === 'true' || statusVal === 'complete' || statusVal === 'completed';

            const matchesStatus = selectedStatus === 'ALL' || 
                (selectedStatus === 'Complete' && isCompleted) || 
                (selectedStatus === 'Pending' && !isCompleted);

            return matchesCourse && matchesWeek && matchesStatus;
        });

        if (filtered.length === 0) {
            assignmentList.innerHTML = `<li class="assignment-card">No assignments found for Week ${selectedWeek} / ${selectedCourse}.</li>`;
            return;
        }

        filtered.forEach(item => {
            const li = document.createElement('li');
            
            const progressVal = String(getProp(item, 'progress')).trim().toLowerCase();
            const completeVal = String(getProp(item, 'complete')).trim().toLowerCase();
            const statusVal = String(getProp(item, 'status')).trim().toLowerCase();
            const isDone = progressVal === 'complete' || completeVal === 'true' || statusVal === 'complete' || statusVal === 'completed';
            
            const priorityVal = getProp(item, 'priority');
            const isHighPriority = String(priorityVal).toLowerCase() === 'high';

            const title = getProp(item, 'assignment') || getProp(item, 'title') || getProp(item, 'name') || 'Untitled Assignment';
            const courseName = getProp(item, 'class') || getProp(item, 'course') || 'General';
            const weekNum = getProp(item, 'week') || '-';
            const dueDate = getProp(item, 'date due') || getProp(item, 'due date') || getProp(item, 'due') || 'N/A';

            li.className = `assignment-card ${isDone ? 'complete' : ''} ${isHighPriority ? 'high-priority' : ''}`;
            
            li.innerHTML = `
                <div class="assignment-details">
                    <strong>${title}</strong>
                    <div class="assignment-meta">
                        📚 <strong>${courseName}</strong> | Week ${weekNum} | Due: ${dueDate}
                        ${priorityVal ? ` | Priority: <em>${priorityVal}</em>` : ''}
                    </div>
                </div>
                <span class="badge ${isDone ? 'badge-complete' : 'badge-pending'}">
                    ${isDone ? 'Completed' : (progressVal || statusVal || 'Pending')}
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
    // 6. THEME CUSTOMIZER FIX
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

    // Initial fetch
    fetchAssignmentsFromSheets();
});