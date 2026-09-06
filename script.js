document.addEventListener('DOMContentLoaded', () => {

    const SHEETS_API_URL = 'https://script.google.com/macros/s/AKfycbw25hwFfwblp7pRj0uEhot_CXxtWwBTg6IfAq1JiGHUsrIUWxddt2I2G1idOuhNamA4/exec';

    // Course mapping for full names and custom badge/border colors
    const COURSE_CONFIG = {
        'CTIA170': { name: 'CompTIA A+ Core 2 and Certification Practice', color: '#e63946' },
        'DEV140':  { name: 'Web Development', color: '#2a9d8f' },
        'DEV150':  { name: 'Linux & Command Line Foundations', color: '#7b2cbf' },
        'AI125':   { name: 'Introduction to Applied AI for Data Analysis', color: '#7b2cbf' }
    };

    // Global UI Theme Palettes (Light & Dark Variants)
    const THEMES = {
        purple: {
            light: {
                '--bg-color': '#f8fafc',
                '--card-bg': '#ffffff',
                '--text-color': '#1e293b',
                '--heading-color': '#3B0764',
                '--accent-color': '#3B0764',
                '--accent-hover': '#581c87',
                '--border-color': '#e2e8f0',
                '--subtext-color': '#64748b',
                '--input-bg': '#ffffff'
            },
            dark: {
                '--bg-color': '#0f0716',
                '--card-bg': '#1a0c27',
                '--text-color': '#f3e8ff',
                '--heading-color': '#d8b4fe',
                '--accent-color': '#9333ea',
                '--accent-hover': '#a855f7',
                '--border-color': '#3b0764',
                '--subtext-color': '#c084fc',
                '--input-bg': '#261238'
            }
        },
        teal: {
            light: {
                '--bg-color': '#f0fdf4',
                '--card-bg': '#ffffff',
                '--text-color': '#0f172a',
                '--heading-color': '#0d9488',
                '--accent-color': '#0d9488',
                '--accent-hover': '#0f766e',
                '--border-color': '#ccfbf1',
                '--subtext-color': '#115e59',
                '--input-bg': '#ffffff'
            },
            dark: {
                '--bg-color': '#042f2e',
                '--card-bg': '#0f766e',
                '--text-color': '#f0fdf4',
                '--heading-color': '#5eead4',
                '--accent-color': '#14b8a6',
                '--accent-hover': '#2dd4bf',
                '--border-color': '#115e59',
                '--subtext-color': '#99f6e4',
                '--input-bg': '#115e59'
            }
        },
        green: {
            light: {
                '--bg-color': '#f0fdf4',
                '--card-bg': '#ffffff',
                '--text-color': '#064e3b',
                '--heading-color': '#047857',
                '--accent-color': '#047857',
                '--accent-hover': '#059669',
                '--border-color': '#a7f3d0',
                '--subtext-color': '#047857',
                '--input-bg': '#ffffff'
            },
            dark: {
                '--bg-color': '#022c22',
                '--card-bg': '#064e3b',
                '--text-color': '#ecfdf5',
                '--heading-color': '#6ee7b7',
                '--accent-color': '#10b981',
                '--accent-hover': '#34d399',
                '--border-color': '#047857',
                '--subtext-color': '#a7f3d0',
                '--input-bg': '#047857'
            }
        },
        orange: {
            light: {
                '--bg-color': '#fff7ed',
                '--card-bg': '#ffffff',
                '--text-color': '#431407',
                '--heading-color': '#c2410c',
                '--accent-color': '#c2410c',
                '--accent-hover': '#ea580c',
                '--border-color': '#ffedd5',
                '--subtext-color': '#9a3412',
                '--input-bg': '#ffffff'
            },
            dark: {
                '--bg-color': '#270e04',
                '--card-bg': '#431407',
                '--text-color': '#fff7ed',
                '--heading-color': '#ff8453',
                '--accent-color': '#f97316',
                '--accent-hover': '#fb923c',
                '--border-color': '#7c2d12',
                '--subtext-color': '#fdba74',
                '--input-bg': '#7c2d12'
            }
        },
        pink: {
            light: {
                '--bg-color': '#fff1f2',
                '--card-bg': '#ffffff',
                '--text-color': '#4c0519',
                '--heading-color': '#be123c',
                '--accent-color': '#be123c',
                '--accent-hover': '#e11d48',
                '--border-color': '#fecdd3',
                '--subtext-color': '#9f1239',
                '--input-bg': '#ffffff'
            },
            dark: {
                '--bg-color': '#2a0410',
                '--card-bg': '#4c0519',
                '--text-color': '#fff1f2',
                '--heading-color': '#fda4af',
                '--accent-color': '#f43f5e',
                '--accent-hover': '#fb7185',
                '--border-color': '#881337',
                '--subtext-color': '#fecdd3',
                '--input-bg': '#881337'
            }
        },
        magenta: {
            light: {
                '--bg-color': '#fdf4ff',
                '--card-bg': '#ffffff',
                '--text-color': '#701a75',
                '--heading-color': '#a21caf',
                '--accent-color': '#a21caf',
                '--accent-hover': '#c026d3',
                '--border-color': '#f5d0fe',
                '--subtext-color': '#86198f',
                '--input-bg': '#ffffff'
            },
            dark: {
                '--bg-color': '#28062b',
                '--card-bg': '#4a044e',
                '--text-color': '#fdf4ff',
                '--heading-color': '#f0abfc',
                '--accent-color': '#d946ef',
                '--accent-hover': '#e879f9',
                '--border-color': '#701a75',
                '--subtext-color': '#f5d0fe',
                '--input-bg': '#701a75'
            }
        }
    };

    // DOM Theme Element Selection
    const modeCheckbox = document.getElementById('mode-toggle-checkbox');
    const themeToggleBtn = document.getElementById('theme-menu-toggle');
    const themeDropdownMenu = document.getElementById('theme-dropdown-menu');
    const swatches = document.querySelectorAll('.theme-swatch');
    const customColorInput = document.getElementById('custom-color-picker');

    // Apply Palette CSS Variables based on Theme Name & Light/Dark State
    function applyCurrentTheme() {
        const isDark = document.body.classList.contains('dark-mode');
        const modeKey = isDark ? 'dark' : 'light';
        const activeTheme = localStorage.getItem('dashboard_accent_theme') || 'purple';
        
        const themeConfig = THEMES[activeTheme] || THEMES.purple;
        const targetVars = themeConfig[modeKey];
        Object.keys(targetVars).forEach(key => {
            document.documentElement.style.setProperty(key, targetVars[key]);
        });

        const customColor = localStorage.getItem('dashboard_custom_color');
        if (customColor) {
            document.documentElement.style.setProperty('--heading-color', customColor);
            document.documentElement.style.setProperty('--accent-color', customColor);
            document.documentElement.style.setProperty('--accent-hover', customColor);
        }
    }

    // Toggle Dark Mode
    function setDarkMode(isDark) {
        if (isDark) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }

        if (modeCheckbox) {
            modeCheckbox.checked = isDark;
        }

        localStorage.setItem('dashboard_theme_mode', isDark ? 'dark' : 'light');
        applyCurrentTheme();
    }

    // Theme Menu Dropdown Controls
    if (themeToggleBtn && themeDropdownMenu) {
        themeToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            themeDropdownMenu.classList.toggle('show');
        });

        document.addEventListener('click', (e) => {
            if (!themeDropdownMenu.contains(e.target) && !themeToggleBtn.contains(e.target)) {
                themeDropdownMenu.classList.remove('show');
            }
        });
    }

    // Swatch Picker Controls
    swatches.forEach(swatch => {
        swatch.addEventListener('click', () => {
            const themeKey = swatch.getAttribute('data-theme');
            if (!themeKey) return;

            localStorage.setItem('dashboard_accent_theme', themeKey);
            localStorage.removeItem('dashboard_custom_color');

            swatches.forEach(s => s.classList.remove('active'));
            swatch.classList.add('active');

            applyCurrentTheme();

            if (themeDropdownMenu) {
                themeDropdownMenu.classList.remove('show');
            }
        });
    });

    // Custom Color Picker
    if (customColorInput) {
        customColorInput.addEventListener('input', (e) => {
            const chosenColor = e.target.value;

            document.documentElement.style.setProperty('--heading-color', chosenColor);
            document.documentElement.style.setProperty('--accent-color', chosenColor);
            document.documentElement.style.setProperty('--accent-hover', chosenColor);

            swatches.forEach(s => s.classList.remove('active'));
            if (customColorInput.parentElement) {
                customColorInput.parentElement.classList.add('active');
            }

            localStorage.setItem('dashboard_custom_color', chosenColor);
            localStorage.removeItem('dashboard_accent_theme');
        });
    }

    if (modeCheckbox) {
        modeCheckbox.addEventListener('change', (e) => {
            setDarkMode(e.target.checked);
        });
    }

    // Initialize saved theme mode state
    const savedMode = localStorage.getItem('dashboard_theme_mode');
    setDarkMode(savedMode === 'dark');

    // --------------------------------------------------
    // SCRATCHPAD & STICKY NOTES LOGIC
    // --------------------------------------------------
    const scratchForm = document.getElementById('scratchpad-form');
    const titleInput = document.getElementById('note-title');
    const bodyInput = document.getElementById('note-body');
    const priorityInput = document.getElementById('note-priority');
    const colorPickerChips = document.querySelectorAll('.color-chip');
    const selectedColorInput = document.getElementById('selected-note-color');
    const notesGrid = document.getElementById('notes-grid');

    let scratchNotes = JSON.parse(localStorage.getItem('scratchpad_notes')) || [];

    // Helper to prevent XSS
    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>"']/g, (m) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[m]));
    }

    // Render Note Cards
    function renderNotes() {
        if (!notesGrid) return;
        notesGrid.innerHTML = '';

        scratchNotes.forEach(note => {
            const card = document.createElement('div');
            card.className = 'sticky-note';
            card.style.backgroundColor = note.color;
            card.dataset.id = note.id;

            card.innerHTML = `
                <div class="sticky-note-header">
                    <h3 class="note-title-text">${escapeHtml(note.title)}</h3>
                    <div class="note-actions">
                        <button class="btn-icon btn-edit" title="Edit Note" aria-label="Edit Note">✏️</button>
                        <button class="btn-icon btn-delete" title="Delete Note" aria-label="Delete Note">✕</button>
                    </div>
                </div>
                <div class="sticky-note-body">${escapeHtml(note.body)}</div>
                <div class="sticky-note-footer">
                    <span class="priority-badge">${escapeHtml(note.priority)}</span>
                    <span class="note-time">${escapeHtml(note.timestamp)}</span>
                </div>
            `;

            card.querySelector('.btn-delete').addEventListener('click', () => deleteNote(note.id));
            card.querySelector('.btn-edit').addEventListener('click', (e) => toggleNoteEdit(card, note.id, e.currentTarget));

            notesGrid.appendChild(card);
        });
    }

    function saveAndRenderNotes() {
        localStorage.setItem('scratchpad_notes', JSON.stringify(scratchNotes));
        renderNotes();
    }

    function deleteNote(id) {
        scratchNotes = scratchNotes.filter(n => n.id !== id);
        saveAndRenderNotes();
    }

    function toggleNoteEdit(card, id, editBtn) {
        const titleEl = card.querySelector('.note-title-text');
        const bodyEl = card.querySelector('.sticky-note-body');
        const isEditing = titleEl.isContentEditable;

        if (!isEditing) {
            titleEl.contentEditable = 'true';
            bodyEl.contentEditable = 'true';
            titleEl.focus();
            editBtn.textContent = '💾';
            editBtn.title = 'Save Changes';
        } else {
            titleEl.contentEditable = 'false';
            bodyEl.contentEditable = 'false';
            editBtn.textContent = '✏️';
            editBtn.title = 'Edit Note';

            const targetNote = scratchNotes.find(n => n.id === id);
            if (targetNote) {
                targetNote.title = titleEl.innerText.trim() || 'Untitled Note';
                targetNote.body = bodyEl.innerText.trim() || '';
                localStorage.setItem('scratchpad_notes', JSON.stringify(scratchNotes));
            }
        }
    }

    function validateScratchpadForm() {
        let isValid = true;
        const titleError = document.getElementById('title-error');
        const bodyError = document.getElementById('body-error');

        if (titleError) titleError.textContent = '';
        if (bodyError) bodyError.textContent = '';

        if (!titleInput.value.trim()) {
            if (titleError) titleError.textContent = 'Please enter a note title.';
            isValid = false;
        }

        if (!bodyInput.value.trim()) {
            if (bodyError) bodyError.textContent = 'Please enter some content for your note.';
            isValid = false;
        }

        return isValid;
    }

    if (colorPickerChips.length > 0) {
        colorPickerChips.forEach(chip => {
            chip.addEventListener('click', (e) => {
                colorPickerChips.forEach(c => c.classList.remove('active'));
                e.currentTarget.classList.add('active');
                if (selectedColorInput) {
                    selectedColorInput.value = e.currentTarget.dataset.color;
                }
            });
        });
    }

    if (scratchForm) {
        scratchForm.addEventListener('submit', (e) => {
            e.preventDefault();

            if (!validateScratchpadForm()) return;

            const newNote = {
                id: Date.now().toString(),
                title: titleInput.value.trim(),
                body: bodyInput.value.trim(),
                priority: priorityInput ? priorityInput.value : 'Medium',
                color: selectedColorInput ? selectedColorInput.value : '#FFF59D',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            scratchNotes.unshift(newNote);
            saveAndRenderNotes();

            scratchForm.reset();
            if (colorPickerChips.length > 0) {
                colorPickerChips.forEach(c => c.classList.remove('active'));
                colorPickerChips[0].classList.add('active');
            }
            if (selectedColorInput) {
                selectedColorInput.value = '#FFF59D';
            }
        });
    }

    renderNotes();

    // --------------------------------------------------
    // ASSIGNMENTS & SHEETS INTEGRATION
    // --------------------------------------------------
    let rawAssignments = [];
    let selectedWeek = 'ALL';

    const syncBtn = document.getElementById('sync-api-btn');
    const assignmentList = document.getElementById('sheet-assignment-list');
    const courseFilter = document.getElementById('course-filter');
    const statusFilter = document.getElementById('status-filter');

    function getProp(obj, key) {
        if (!obj) return '';
        const foundKey = Object.keys(obj).find(k => k.toLowerCase() === key.toLowerCase());
        return foundKey ? obj[foundKey] : '';
    }

    function isItemComplete(item) {
        const progressVal = String(getProp(item, 'progress')).trim().toLowerCase();
        const completeVal = String(getProp(item, 'complete')).trim().toLowerCase();
        const statusVal = String(getProp(item, 'status')).trim().toLowerCase();

        return progressVal === 'complete' || 
               completeVal === 'true' || 
               statusVal === 'complete' || 
               statusVal === 'completed';
    }

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

    fetchAssignmentsFromSheets();
});
