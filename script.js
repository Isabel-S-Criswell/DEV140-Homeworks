document.addEventListener('DOMContentLoaded', () => {

    const SHEETS_API_URL = 'https://script.google.com/macros/s/AKfycbyHUioa23K3yTAyzFLiH-G_jojG73XhzgPgel6j2hoJn2feCYS7WhrDkscZoWJgiWDq/exec';

    let rawAssignments = [];
    let selectedWeek = 'ALL';

    const syncBtn = document.getElementById('sync-api-btn');
    const assignmentList = document.getElementById('sheet-assignment-list');
    const courseFilter = document.getElementById('course-filter');
    const statusFilter = document.getElementById('status-filter');

    // --------------------------------------------------
    // 1. CALCULATE CURRENT ACADEMIC WEEK DYNAMICALLY
    // --------------------------------------------------
    function getCurrentAcademicWeek() {
        // Term start date: Monday, July 6, 2026
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
    // 2. FETCH FROM APPS SCRIPT (WITH REDIRECT HANDLING)
    // --------------------------------------------------
    async function fetchAssignmentsFromSheets() {
        assignmentList.innerHTML = `<li class="loading-state">⏳ Connecting to Google Sheets...</li>`;

        try {
            // redirect: 'follow' is required for Google Apps Script execution URLs
            const response = await fetch(SHEETS_API_URL, { redirect: 'follow' });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            rawAssignments = await response.json();
            
            console.log("Successfully fetched data rows:", rawAssignments.length);

            populateCourseDropdown(rawAssignments);
            updateTermProgress(rawAssignments);
            renderFilteredAssignments();
        } catch (error) {
            console.error('Error fetching sheet data:', error);
            assignmentList.innerHTML = `
                <li class="assignment-card">
                    ❌ <strong>Sync Failed:</strong> ${error.message}.<br>
                    Make sure your Web App deployment is set to "Anyone" access.
                </li>`;
        }
    }

    // Populate course options dynamically (e.g., DEV140, DEV150, AI125, CTIA170)
    function populateCourseDropdown(data) {
        const courses = ['ALL', ...new Set(data.map(item => item.Class).filter(Boolean))];
        courseFilter.innerHTML = courses.map(c => `<option value="${c}">${c === 'ALL' ? 'All Courses' : c}</option>`).join('');
    }

    // --------------------------------------------------
    // 3. DYNAMIC TERM PROGRESS & WEEK BADGE
    // --------------------------------------------------
    function updateTermProgress(data) {
        const currentWeek = getCurrentAcademicWeek();
        const totalTasks = data.length;
        
        const completedTasks = data.filter(item => {
            const progressVal = (item.Progress || '').toString().trim().toLowerCase();
            const completeVal = (item.Complete || '').toString().trim().toLowerCase();
            return progressVal === 'complete' || completeVal === 'true';
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
        assignmentList.innerHTML = '';

        const selectedCourse = courseFilter.value;
        const selectedStatus = statusFilter.value;

        const filtered = rawAssignments.filter(item => {
            const matchesCourse = selectedCourse === 'ALL' || item.Class === selectedCourse;
            const matchesWeek = selectedWeek === 'ALL' || String(item.Week) === String(selectedWeek);
            
            const isCompleted = (item.Progress || '').toString().trim().toLowerCase() === 'complete' || 
                                (item.Complete || '').toString().trim().toLowerCase() === 'true';

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
            const isDone = (item.Progress || '').toString().trim().toLowerCase() === 'complete' || 
                           (item.Complete || '').toString().trim().toLowerCase() === 'true';
            const isHighPriority = item.Priority === 'High';

            li.className = `assignment-card ${isDone ? 'complete' : ''} ${isHighPriority ? 'high-priority' : ''}`;
            
            li.innerHTML = `
                <div class="assignment-details">
                    <strong>${item.Assignment || 'Untitled Assignment'}</strong>
                    <div class="assignment-meta">
                        📚 <strong>${item.Class || 'General'}</strong> | Week ${item.Week || '-'} | Due: ${item['Date Due'] || 'N/A'}
                        ${item.Priority ? ` | Priority: <em>${item.Priority}</em>` : ''}
                    </div>
                </div>
                <span class="badge ${isDone ? 'badge-complete' : 'badge-pending'}">
                    ${isDone ? 'Completed' : (item.Progress || 'Not Started')}
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

    // Week pills filtering
    document.querySelectorAll('.week-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.week-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            selectedWeek = e.target.getAttribute('data-week');
            renderFilteredAssignments();
        });
    });

    // --------------------------------------------------
    // 6. HIGH-VISIBILITY THEME CUSTOMIZER (Rubric Item 2)
    // Changes entire dashboard section background live!
    // --------------------------------------------------
    const accentInput = document.getElementById('accent-color-input');
    const dashboardCard = document.getElementById('hw7-dashboard');

    if (accentInput && dashboardCard) {
        accentInput.addEventListener('input', (e) => {
            const color = e.target.value.trim();
            dashboardCard.style.backgroundColor = color;
            dashboardCard.style.transition = 'background-color 0.3s ease';
        });
    }

    // Auto-fetch on initial page load
    fetchAssignmentsFromSheets();
});