document.addEventListener('DOMContentLoaded', () => {

    const SHEETS_API_URL = 'https://script.google.com/macros/s/AKfycbw25hwFfwblp7pRj0uEhot_CXxtWwBTg6IfAq1JiGHUsrIUWxddt2I2G1idOuhNamA4/exec';

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

    const modeCheckbox = document.getElementById('mode-toggle-checkbox');
    const themeToggleBtn = document.getElementById('theme-menu-toggle');
    const themeDropdownMenu = document.getElementById('theme-dropdown-menu');
    const swatches = document.querySelectorAll('.theme-swatch');

    function applyCurrentTheme() {
        const isDark = document.body.classList.contains('dark-mode');
        const modeKey = isDark ? 'dark' : 'light';
        const activeTheme = localStorage.getItem('dashboard_accent_theme') || 'purple';
        
        const themeConfig = THEMES[activeTheme] || THEMES.purple;
        const targetVars = themeConfig[modeKey];
        Object.keys(targetVars).forEach(key => {
            document.documentElement.style.setProperty(key, targetVars[key]);
        });
    }

    if (modeCheckbox) {
        const savedMode = localStorage.getItem('dashboard_theme_mode') || 'light';
        if (savedMode === 'dark') {
            document.body.classList.add('dark-mode');
            modeCheckbox.checked = true;
        }
        applyCurrentTheme();

        modeCheckbox.addEventListener('change', () => {
            document.body.classList.toggle('dark-mode', modeCheckbox.checked);
            localStorage.setItem('dashboard_theme_mode', modeCheckbox.checked ? 'dark' : 'light');
            applyCurrentTheme();
        });
    }

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

    swatches.forEach(swatch => {
        swatch.addEventListener('click', () => {
            const themeKey = swatch.getAttribute('data-theme');
            if (!themeKey) return;

            localStorage.setItem('dashboard_accent_theme', themeKey);
            swatches.forEach(s => s.classList.remove('active'));
            swatch.classList.add('active');

            applyCurrentTheme();

            if (themeDropdownMenu) {
                themeDropdownMenu.classList.remove('show');
            }
        });
    });

    // --------------------------------------------------
    // BONUS REQUIREMENT: WEATHER API FETCH
    // --------------------------------------------------
    async function fetchWeather() {
        const weatherText = document.getElementById('weather-text');
        if (!weatherText) return;

        // Coordinates for New Castle, PA
        const url = 'https://api.open-meteo.com/v1/forecast?latitude=41.00&longitude=-80.34&current_weather=true&temperature_unit=fahrenheit';

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            const temp = Math.round(data.current_weather.temperature);
            weatherText.innerHTML = `🌤️ New Castle, PA: <strong>${temp}°F</strong>`;
        } catch (err) {
            console.error('Weather fetch error:', err);
            weatherText.innerHTML = `🌤️ Weather unavailable`;
        }
    }
    fetchWeather();

    // --------------------------------------------------
    // HOMEWORK 8 FORM VALIDATION & SCRATCHPAD LOGIC
    // --------------------------------------------------
    const scratchForm = document.getElementById('scratchpad-form');
    const titleInput = document.getElementById('note-title');
    const bodyInput = document.getElementById('note-body');
    const emailInput = document.getElementById('note-email');
    const prioritySelect = document.getElementById('note-priority');
    const colorInput = document.getElementById('selected-note-color');
    const colorChips = document.querySelectorAll('.color-chip');
    const notesGrid = document.getElementById('notes-grid');

    const bodyError = document.getElementById('body-error');
    const emailError = document.getElementById('email-error');

    let scratchNotes = JSON.parse(localStorage.getItem('scratchpad_notes')) || [];

    // AUTO-CLEARING ERROR LISTENERS (Satisfies Format Validation Rule)
    if (bodyInput && bodyError) {
        bodyInput.addEventListener('input', () => {
            if (bodyInput.value.trim()) bodyError.textContent = '';
        });
    }

    if (emailInput && emailError) {
        emailInput.addEventListener('input', () => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailRegex.test(emailInput.value.trim())) emailError.textContent = '';
        });
    }

    // Color Chip Selection
    colorChips.forEach(chip => {
        chip.addEventListener('click', () => {
            colorChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            if (colorInput) colorInput.value = chip.dataset.color;
        });
    });

    function validateScratchpadForm() {
        let isValid = true;

        if (bodyError) bodyError.textContent = '';
        if (emailError) emailError.textContent = '';

        // Requirement: Empty field check
        if (!bodyInput.value.trim()) {
            if (bodyError) bodyError.textContent = 'Note content cannot be empty!';
            isValid = false;
        }

        // Requirement: Format validation on email
        const emailVal = emailInput ? emailInput.value.trim() : '';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailVal) {
            if (emailError) emailError.textContent = 'Email address is required!';
            isValid = false;
        } else if (!emailRegex.test(emailVal)) {
            if (emailError) emailError.textContent = 'Please enter a valid email address (e.g. name@example.com).';
            isValid = false;
        }

        return isValid;
    }

    if (scratchForm) {
        scratchForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Requirement: Intercept submit event

            if (!validateScratchpadForm()) return;

            const newNote = {
                id: Date.now(),
                title: titleInput ? titleInput.value.trim() : '',
                body: bodyInput ? bodyInput.value.trim() : '',
                email: emailInput ? emailInput.value.trim() : '',
                priority: prioritySelect ? prioritySelect.value : 'Medium',
                color: colorInput ? colorInput.value : '#FFF59D',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            scratchNotes.unshift(newNote);
            localStorage.setItem('scratchpad_notes', JSON.stringify(scratchNotes));

            scratchForm.reset();
            if (colorInput) colorInput.value = '#FFF59D';
            colorChips.forEach(c => c.classList.remove('active'));
            if (colorChips[0]) colorChips[0].classList.add('active');

            renderNotes();
        });
    }

    function renderNotes() {
        if (!notesGrid) return;
        notesGrid.innerHTML = '';

        scratchNotes.forEach(note => {
            const card = document.createElement('div');
            card.className = 'sticky-note';
            card.style.backgroundColor = note.color;

            card.innerHTML = `
                <div class="sticky-note-header">
                    <h3>${escapeHtml(note.title || 'Untitled Note')}</h3>
                    <button class="btn-icon btn-delete" title="Delete Note">✕</button>
                </div>
                <div class="sticky-note-body">${escapeHtml(note.body)}</div>
                <div class="sticky-note-footer">
                    <span class="priority-badge">Priority: ${escapeHtml(note.priority)}</span>
                    <span>${escapeHtml(note.timestamp)}</span>
                </div>
            `;

            card.querySelector('.btn-delete').addEventListener('click', () => {
                scratchNotes = scratchNotes.filter(n => n.id !== note.id);
                localStorage.setItem('scratchpad_notes', JSON.stringify(scratchNotes));
                renderNotes();
            });

            notesGrid.appendChild(card);
        });
    }

    function escapeHtml(str) {
        return str.replace(/[&<>"']/g, match => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[match]));
    }

    renderNotes();
});
