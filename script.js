document.addEventListener('DOMContentLoaded', () => {

    // 🔗 PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE
    const SHEETS_API_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE';

    let rawAssignments = [];
    let selectedWeek = 'ALL';

    const syncBtn = document.getElementById('sync-api-btn');
    const assignmentList = document.getElementById('sheet-assignment-list');
    const courseFilter = document.getElementById('course-filter');
    const statusFilter = document.getElementById('status-filter');

    // --------------------------------------------------
    // 1. FETCH API DATA FROM GOOGLE SHEETS
    // --------------------------------------------------
    async function fetchAssignmentsFromSheets() {
        if (!SHEETS_API_URL || SHEETS_API_URL.includes('YOUR_GOOGLE_APPS_SCRIPT')) {
            assignmentList.innerHTML = `<li class="assignment-card">⚠️ Paste your Apps Script Web App URL into line 4 of script.js</li>`;
            return;
        }

        assignmentList.innerHTML = `<li class="loading-state">Syncing live planner data...</li>`;

        try {
            const response = await fetch(SHEETS_API_URL);
            rawAssignments = await response.json();

            populateCourseDropdown(rawAssignments);
            updateTermProgress(rawAssignments);
            renderFilteredAssignments();
        } catch (error) {
            console.error('Error fetching sheet data:', error);
            assignmentList.innerHTML = `<li class="assignment-card">❌ Failed to sync data. Verify Web App permission is set to "Anyone".</li>`;
        }
    }

    // Populate course options dynamically (e.g., DEV140, DEV150, AI125, CTIA170)
    function populateCourseDropdown(data) {
        const courses = ['ALL', ...new Set(data.map(item => item.Class).filter(Boolean))];
        courseFilter.innerHTML = courses.map(c => `<option value="${c}">${c === 'ALL' ? 'All Courses' : c}</option>`).join('');
    }

    // --------------------------------------------------
    // 2. DYNAMIC TERM PROGRESS CALCULATOR (Rubric Item 1 & 2)
    // --------------------------------------------------
    function updateTermProgress(data) {
        if (!data || data.length === 0) return;

        const totalTasks = data.length;
        const completedTasks = data.filter(item => 
            item.Progress === 'Complete' || item.Complete === 'TRUE' || item.Complete === true
        ).length;

        const percentage = Math.round((completedTasks / totalTasks) * 100);

        const fillBar = document.getElementById('term-progress-fill');
        const statusText = document.getElementById('term-status-text');
        const badgeText = document.getElementById('week-badge');

        if (fillBar && statusText && badgeText) {
            fillBar.style.width = `${percentage}%`;
            badgeText.textContent = `${completedTasks} / ${totalTasks} Completed`;
            statusText.textContent = `${percentage}% of overall term coursework completed across all 4 courses.`;
        }
    }

    // --------------------------------------------------
    // 3. RENDER FILTERED DOM NODES (Rubric Item 3)
    // --------------------------------------------------
    function renderFilteredAssignments() {
        assignmentList.innerHTML = '';

        const selectedCourse = courseFilter.value;
        const selectedStatus = statusFilter.value;

        const filtered = rawAssignments.filter(item => {
            const matchesCourse = selectedCourse === 'ALL' || item.Class === selectedCourse;
            const matchesWeek = selectedWeek === 'ALL' || String(item.Week) === String(selectedWeek);
            
            const isCompleted = item.Progress === 'Complete' || item.Complete === 'TRUE';
            const matchesStatus = selectedStatus === 'ALL' || 
                (selectedStatus === 'Complete' && isCompleted) || 
                (selectedStatus === 'Pending' && !isCompleted);

            return matchesCourse && matchesWeek && matchesStatus;
        });

        if (filtered.length === 0) {
            assignmentList.innerHTML = `<li class="assignment-card">No assignments found matching the selected filters.</li>`;
            return;
        }

        filtered.forEach(item => {
            const li = document.createElement('li');
            const isDone = item.Progress === 'Complete' || item.Complete === 'TRUE';
            const isHighPriority = item.Priority === 'High';

            li.className = `assignment-card ${isDone ? 'complete' : ''} ${isHighPriority ? 'high-priority' : ''}`;
            
            li.innerHTML = `
                <div class="assignment-details">
                    <strong>${item.Assignment || 'Untitled Task'}</strong>
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
    // 4. EVENT LISTENERS
    // --------------------------------------------------
    if (syncBtn) syncBtn.addEventListener('click', fetchAssignmentsFromSheets);
    if (courseFilter) courseFilter.addEventListener('change', renderFilteredAssignments);
    if (statusFilter) statusFilter.addEventListener('change', renderFilteredAssignments);

    // Week selector buttons listener
    document.querySelectorAll('.week-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.week-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            selectedWeek = e.target.getAttribute('data-week');
            renderFilteredAssignments();
        });
    });

    // Accent Color Customizer (Rubric Requirement)
    const accentInput = document.getElementById('accent-color-input');
    const previewBox = document.getElementById('accent-preview-box');

    if (accentInput && previewBox) {
        accentInput.addEventListener('input', (e) => {
            previewBox.style.backgroundColor = e.target.value.trim();
        });
    }
});