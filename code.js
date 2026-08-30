document.addEventListener('DOMContentLoaded', () => {

  // 1. Content Change: Toggle Status
  const statusBtn = document.getElementById('toggle-status-btn');
  const statusText = document.getElementById('tracker-status');

  if (statusBtn && statusText) {
    statusBtn.addEventListener('click', () => {
      if (statusText.textContent.includes('Working')) {
        statusText.textContent = 'Current Status: HW7 Completed! 🎉';
        statusBtn.textContent = 'Mark as In Progress';
      } else {
        statusText.textContent = 'Current Status: Working on DOM Manipulation & Events';
        statusBtn.textContent = 'Mark HW7 Completed';
      }
    });
  }

  // 2. Style Change: Live Accent Preview
  const accentInput = document.getElementById('accent-color-input');
  const previewBox = document.getElementById('accent-preview-box');

  if (accentInput && previewBox) {
    accentInput.addEventListener('input', (e) => {
      previewBox.style.backgroundColor = e.target.value;
    });
  }

  // 3. Dynamic List Creation: Add Note
  const taskInput = document.getElementById('new-task-input');
  const addTaskBtn = document.getElementById('add-task-btn');
  const taskList = document.getElementById('task-list');

  if (addTaskBtn && taskInput && taskList) {
    addTaskBtn.addEventListener('click', () => {
      const taskValue = taskInput.value.trim();
      if (taskValue === '') return;

      const li = document.createElement('li');
      li.textContent = taskValue;

      // Optional delete button inside the dynamic item
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.className = 'btn-danger';
      deleteBtn.addEventListener('click', () => li.remove());

      li.appendChild(deleteBtn);
      taskList.appendChild(li);

      taskInput.value = ''; // Reset input field
    });
  }

});