let tasks = JSON.parse(localStorage.getItem('kanbanTasks')) || [
    { id: '1', title: 'تصميم الواجهة', desc: 'تحديد الألوان والأنماط الرئيسية', status: 'done' },
    { id: '2', title: 'برمجة الـ Drag & Drop', desc: 'إضافة أحداث السحب والإسقاط بـ JS', status: 'in-progress' },
    { id: '3', title: 'ربط الـ LocalStorage', desc: 'حفظ المهام لقراءتها تلقائياً', status: 'todo' }
];

let targetStatusForNewTask = 'todo';

const modalOverlay = document.getElementById('modalOverlay');
const taskTitleInput = document.getElementById('taskTitleInput');
const taskDescInput = document.getElementById('taskDescInput');
const containers = document.querySelectorAll('.tasks-container');

function renderBoard() {
    containers.forEach(container => container.innerHTML = '');

    const counts = { todo: 0, 'in-progress': 0, done: 0 };

    tasks.forEach(task => {
        const card = createTaskCard(task);
        const container = document.getElementById(task.status);
        if (container) {
            container.appendChild(card);
            counts[task.status]++;
        }
    });

    document.getElementById('count-todo').textContent = counts.todo;
    document.getElementById('count-in-progress').textContent = counts['in-progress'];
    document.getElementById('count-done').textContent = counts.done;

    saveToLocalStorage();
}

function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.draggable = true;
    card.dataset.id = task.id;

    card.innerHTML = `
        <button class="delete-btn" onclick="deleteTask('${task.id}')">✕</button>
        <h4>${escapeHTML(task.title)}</h4>
        ${task.desc ? `<p>${escapeHTML(task.desc)}</p>` : ''}
    `;

    card.addEventListener('dragstart', () => {
        card.classList.add('dragging');
    });

    card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
    });

    return card;
}

containers.forEach(container => {
    container.addEventListener('dragover', (e) => {
        e.preventDefault();
        container.classList.add('drag-over');
        
        const draggingCard = document.querySelector('.dragging');
        if (draggingCard) {
            container.appendChild(draggingCard);
        }
    });

    container.addEventListener('dragleave', () => {
        container.classList.remove('drag-over');
    });

    container.addEventListener('drop', (e) => {
        e.preventDefault();
        container.classList.remove('drag-over');

        const draggingCard = document.querySelector('.dragging');
        if (draggingCard) {
            const taskId = draggingCard.dataset.id;
            const newStatus = container.id;

            const task = tasks.find(t => t.id === taskId);
            if (task) {
                task.status = newStatus;
                renderBoard();
            }
        }
    });
});

function openModal(status) {
    targetStatusForNewTask = status;
    taskTitleInput.value = '';
    taskDescInput.value = '';
    modalOverlay.classList.add('active');
    taskTitleInput.focus();
}

function closeModal() {
    modalOverlay.classList.remove('active');
}

function addNewTask() {
    const title = taskTitleInput.value.trim();
    const desc = taskDescInput.value.trim();

    if (!title) return;

    const newTask = {
        id: Date.now().toString(),
        title: title,
        desc: desc,
        status: targetStatusForNewTask
    };

    tasks.push(newTask);
    closeModal();
    renderBoard();
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    renderBoard();
}

function saveToLocalStorage() {
    localStorage.setItem('kanbanTasks', JSON.stringify(tasks));
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

renderBoard();